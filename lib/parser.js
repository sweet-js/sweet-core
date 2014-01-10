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
(function (root$853, factory$854) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$854);
    } else if (typeof exports !== 'undefined') {
        factory$854(exports, require('./expander'));
    } else {
        factory$854(root$853.esprima = {});
    }
}(this, function (exports$855, expander$856) {
    'use strict';
    var Token$857, TokenName$858, FnExprTokens$859, Syntax$860, PropertyKind$861, Messages$862, Regex$863, SyntaxTreeDelegate$864, ClassPropertyType$865, source$866, strict$867, index$868, lineNumber$869, lineStart$870, sm_lineNumber$871, sm_lineStart$872, sm_range$873, sm_index$874, length$875, delegate$876, tokenStream$877, streamIndex$878, lookahead$879, lookaheadIndex$880, state$881, extra$882;
    Token$857 = {
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
    TokenName$858 = {};
    TokenName$858[Token$857.BooleanLiteral] = 'Boolean';
    TokenName$858[Token$857.EOF] = '<end>';
    TokenName$858[Token$857.Identifier] = 'Identifier';
    TokenName$858[Token$857.Keyword] = 'Keyword';
    TokenName$858[Token$857.NullLiteral] = 'Null';
    TokenName$858[Token$857.NumericLiteral] = 'Numeric';
    TokenName$858[Token$857.Punctuator] = 'Punctuator';
    TokenName$858[Token$857.StringLiteral] = 'String';
    TokenName$858[Token$857.RegularExpression] = 'RegularExpression';
    TokenName$858[Token$857.Delimiter] = 'Delimiter';
    // A function following one of those tokens is an expression.
    FnExprTokens$859 = [
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
    Syntax$860 = {
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
    PropertyKind$861 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    ClassPropertyType$865 = {
        'static': 'static',
        prototype: 'prototype'
    };
    // Error messages should be identical to V8.
    Messages$862 = {
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
    Regex$863 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$883(condition$1032, message$1033) {
        if (!condition$1032) {
            throw new Error('ASSERT: ' + message$1033);
        }
    }
    function isIn$884(el$1034, list$1035) {
        return list$1035.indexOf(el$1034) !== -1;
    }
    function isDecimalDigit$885(ch$1036) {
        return ch$1036 >= 48 && ch$1036 <= 57;
    }    // 0..9
    function isHexDigit$886(ch$1037) {
        return '0123456789abcdefABCDEF'.indexOf(ch$1037) >= 0;
    }
    function isOctalDigit$887(ch$1038) {
        return '01234567'.indexOf(ch$1038) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$888(ch$1039) {
        return ch$1039 === 32 || ch$1039 === 9 || ch$1039 === 11 || ch$1039 === 12 || ch$1039 === 160 || ch$1039 >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(String.fromCharCode(ch$1039)) > 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$889(ch$1040) {
        return ch$1040 === 10 || ch$1040 === 13 || ch$1040 === 8232 || ch$1040 === 8233;
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$890(ch$1041) {
        return ch$1041 === 36 || ch$1041 === 95 || ch$1041 >= 65 && ch$1041 <= 90 || ch$1041 >= 97 && ch$1041 <= 122 || ch$1041 === 92 || ch$1041 >= 128 && Regex$863.NonAsciiIdentifierStart.test(String.fromCharCode(ch$1041));
    }
    function isIdentifierPart$891(ch$1042) {
        return ch$1042 === 36 || ch$1042 === 95 || ch$1042 >= 65 && ch$1042 <= 90 || ch$1042 >= 97 && ch$1042 <= 122 || ch$1042 >= 48 && ch$1042 <= 57 || ch$1042 === 92 || ch$1042 >= 128 && Regex$863.NonAsciiIdentifierPart.test(String.fromCharCode(ch$1042));
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$892(id$1043) {
        switch (id$1043) {
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
    function isStrictModeReservedWord$893(id$1044) {
        switch (id$1044) {
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
    function isRestrictedWord$894(id$1045) {
        return id$1045 === 'eval' || id$1045 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$895(id$1046) {
        if (strict$867 && isStrictModeReservedWord$893(id$1046)) {
            return true;
        }
        // 'const' is specialized as Keyword in V8.
        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
        // Some others are from future reserved words.
        switch (id$1046.length) {
        case 2:
            return id$1046 === 'if' || id$1046 === 'in' || id$1046 === 'do';
        case 3:
            return id$1046 === 'var' || id$1046 === 'for' || id$1046 === 'new' || id$1046 === 'try' || id$1046 === 'let';
        case 4:
            return id$1046 === 'this' || id$1046 === 'else' || id$1046 === 'case' || id$1046 === 'void' || id$1046 === 'with' || id$1046 === 'enum';
        case 5:
            return id$1046 === 'while' || id$1046 === 'break' || id$1046 === 'catch' || id$1046 === 'throw' || id$1046 === 'const' || id$1046 === 'yield' || id$1046 === 'class' || id$1046 === 'super';
        case 6:
            return id$1046 === 'return' || id$1046 === 'typeof' || id$1046 === 'delete' || id$1046 === 'switch' || id$1046 === 'export' || id$1046 === 'import';
        case 7:
            return id$1046 === 'default' || id$1046 === 'finally' || id$1046 === 'extends';
        case 8:
            return id$1046 === 'function' || id$1046 === 'continue' || id$1046 === 'debugger';
        case 10:
            return id$1046 === 'instanceof';
        default:
            return false;
        }
    }
    // 7.4 Comments
    function skipComment$896() {
        var ch$1047, blockComment$1048, lineComment$1049;
        blockComment$1048 = false;
        lineComment$1049 = false;
        while (index$868 < length$875) {
            ch$1047 = source$866.charCodeAt(index$868);
            if (lineComment$1049) {
                ++index$868;
                if (isLineTerminator$889(ch$1047)) {
                    lineComment$1049 = false;
                    if (ch$1047 === 13 && source$866.charCodeAt(index$868) === 10) {
                        ++index$868;
                    }
                    ++lineNumber$869;
                    lineStart$870 = index$868;
                }
            } else if (blockComment$1048) {
                if (isLineTerminator$889(ch$1047)) {
                    if (ch$1047 === 13 && source$866.charCodeAt(index$868 + 1) === 10) {
                        ++index$868;
                    }
                    ++lineNumber$869;
                    ++index$868;
                    lineStart$870 = index$868;
                    if (index$868 >= length$875) {
                        throwError$917({}, Messages$862.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1047 = source$866.charCodeAt(index$868++);
                    if (index$868 >= length$875) {
                        throwError$917({}, Messages$862.UnexpectedToken, 'ILLEGAL');
                    }
                    // Block comment ends with '*/' (char #42, char #47).
                    if (ch$1047 === 42) {
                        ch$1047 = source$866.charCodeAt(index$868);
                        if (ch$1047 === 47) {
                            ++index$868;
                            blockComment$1048 = false;
                        }
                    }
                }
            } else if (ch$1047 === 47) {
                ch$1047 = source$866.charCodeAt(index$868 + 1);
                // Line comment starts with '//' (char #47, char #47).
                if (ch$1047 === 47) {
                    index$868 += 2;
                    lineComment$1049 = true;
                } else if (ch$1047 === 42) {
                    // Block comment starts with '/*' (char #47, char #42).
                    index$868 += 2;
                    blockComment$1048 = true;
                    if (index$868 >= length$875) {
                        throwError$917({}, Messages$862.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$888(ch$1047)) {
                ++index$868;
            } else if (isLineTerminator$889(ch$1047)) {
                ++index$868;
                if (ch$1047 === 13 && source$866.charCodeAt(index$868) === 10) {
                    ++index$868;
                }
                ++lineNumber$869;
                lineStart$870 = index$868;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$897(prefix$1050) {
        var i$1051, len$1052, ch$1053, code$1054 = 0;
        len$1052 = prefix$1050 === 'u' ? 4 : 2;
        for (i$1051 = 0; i$1051 < len$1052; ++i$1051) {
            if (index$868 < length$875 && isHexDigit$886(source$866[index$868])) {
                ch$1053 = source$866[index$868++];
                code$1054 = code$1054 * 16 + '0123456789abcdef'.indexOf(ch$1053.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$1054);
    }
    function scanUnicodeCodePointEscape$898() {
        var ch$1055, code$1056, cu1$1057, cu2$1058;
        ch$1055 = source$866[index$868];
        code$1056 = 0;
        // At least, one hex digit is required.
        if (ch$1055 === '}') {
            throwError$917({}, Messages$862.UnexpectedToken, 'ILLEGAL');
        }
        while (index$868 < length$875) {
            ch$1055 = source$866[index$868++];
            if (!isHexDigit$886(ch$1055)) {
                break;
            }
            code$1056 = code$1056 * 16 + '0123456789abcdef'.indexOf(ch$1055.toLowerCase());
        }
        if (code$1056 > 1114111 || ch$1055 !== '}') {
            throwError$917({}, Messages$862.UnexpectedToken, 'ILLEGAL');
        }
        // UTF-16 Encoding
        if (code$1056 <= 65535) {
            return String.fromCharCode(code$1056);
        }
        cu1$1057 = (code$1056 - 65536 >> 10) + 55296;
        cu2$1058 = (code$1056 - 65536 & 1023) + 56320;
        return String.fromCharCode(cu1$1057, cu2$1058);
    }
    function getEscapedIdentifier$899() {
        var ch$1059, id$1060;
        ch$1059 = source$866.charCodeAt(index$868++);
        id$1060 = String.fromCharCode(ch$1059);
        // '\u' (char #92, char #117) denotes an escaped character.
        if (ch$1059 === 92) {
            if (source$866.charCodeAt(index$868) !== 117) {
                throwError$917({}, Messages$862.UnexpectedToken, 'ILLEGAL');
            }
            ++index$868;
            ch$1059 = scanHexEscape$897('u');
            if (!ch$1059 || ch$1059 === '\\' || !isIdentifierStart$890(ch$1059.charCodeAt(0))) {
                throwError$917({}, Messages$862.UnexpectedToken, 'ILLEGAL');
            }
            id$1060 = ch$1059;
        }
        while (index$868 < length$875) {
            ch$1059 = source$866.charCodeAt(index$868);
            if (!isIdentifierPart$891(ch$1059)) {
                break;
            }
            ++index$868;
            id$1060 += String.fromCharCode(ch$1059);
            // '\u' (char #92, char #117) denotes an escaped character.
            if (ch$1059 === 92) {
                id$1060 = id$1060.substr(0, id$1060.length - 1);
                if (source$866.charCodeAt(index$868) !== 117) {
                    throwError$917({}, Messages$862.UnexpectedToken, 'ILLEGAL');
                }
                ++index$868;
                ch$1059 = scanHexEscape$897('u');
                if (!ch$1059 || ch$1059 === '\\' || !isIdentifierPart$891(ch$1059.charCodeAt(0))) {
                    throwError$917({}, Messages$862.UnexpectedToken, 'ILLEGAL');
                }
                id$1060 += ch$1059;
            }
        }
        return id$1060;
    }
    function getIdentifier$900() {
        var start$1061, ch$1062;
        start$1061 = index$868++;
        while (index$868 < length$875) {
            ch$1062 = source$866.charCodeAt(index$868);
            if (ch$1062 === 92) {
                // Blackslash (char #92) marks Unicode escape sequence.
                index$868 = start$1061;
                return getEscapedIdentifier$899();
            }
            if (isIdentifierPart$891(ch$1062)) {
                ++index$868;
            } else {
                break;
            }
        }
        return source$866.slice(start$1061, index$868);
    }
    function scanIdentifier$901() {
        var start$1063, id$1064, type$1065;
        start$1063 = index$868;
        // Backslash (char #92) starts an escaped character.
        id$1064 = source$866.charCodeAt(index$868) === 92 ? getEscapedIdentifier$899() : getIdentifier$900();
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$1064.length === 1) {
            type$1065 = Token$857.Identifier;
        } else if (isKeyword$895(id$1064)) {
            type$1065 = Token$857.Keyword;
        } else if (id$1064 === 'null') {
            type$1065 = Token$857.NullLiteral;
        } else if (id$1064 === 'true' || id$1064 === 'false') {
            type$1065 = Token$857.BooleanLiteral;
        } else {
            type$1065 = Token$857.Identifier;
        }
        return {
            type: type$1065,
            value: id$1064,
            lineNumber: lineNumber$869,
            lineStart: lineStart$870,
            range: [
                start$1063,
                index$868
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$902() {
        var start$1066 = index$868, code$1067 = source$866.charCodeAt(index$868), code2$1068, ch1$1069 = source$866[index$868], ch2$1070, ch3$1071, ch4$1072;
        switch (code$1067) {
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
            ++index$868;
            if (extra$882.tokenize) {
                if (code$1067 === 40) {
                    extra$882.openParenToken = extra$882.tokens.length;
                } else if (code$1067 === 123) {
                    extra$882.openCurlyToken = extra$882.tokens.length;
                }
            }
            return {
                type: Token$857.Punctuator,
                value: String.fromCharCode(code$1067),
                lineNumber: lineNumber$869,
                lineStart: lineStart$870,
                range: [
                    start$1066,
                    index$868
                ]
            };
        default:
            code2$1068 = source$866.charCodeAt(index$868 + 1);
            // '=' (char #61) marks an assignment or comparison operator.
            if (code2$1068 === 61) {
                switch (code$1067) {
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
                    index$868 += 2;
                    return {
                        type: Token$857.Punctuator,
                        value: String.fromCharCode(code$1067) + String.fromCharCode(code2$1068),
                        lineNumber: lineNumber$869,
                        lineStart: lineStart$870,
                        range: [
                            start$1066,
                            index$868
                        ]
                    };
                case 33:
                // !
                case 61:
                    // =
                    index$868 += 2;
                    // !== and ===
                    if (source$866.charCodeAt(index$868) === 61) {
                        ++index$868;
                    }
                    return {
                        type: Token$857.Punctuator,
                        value: source$866.slice(start$1066, index$868),
                        lineNumber: lineNumber$869,
                        lineStart: lineStart$870,
                        range: [
                            start$1066,
                            index$868
                        ]
                    };
                default:
                    break;
                }
            }
            break;
        }
        // Peek more characters.
        ch2$1070 = source$866[index$868 + 1];
        ch3$1071 = source$866[index$868 + 2];
        ch4$1072 = source$866[index$868 + 3];
        // 4-character punctuator: >>>=
        if (ch1$1069 === '>' && ch2$1070 === '>' && ch3$1071 === '>') {
            if (ch4$1072 === '=') {
                index$868 += 4;
                return {
                    type: Token$857.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$869,
                    lineStart: lineStart$870,
                    range: [
                        start$1066,
                        index$868
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$1069 === '>' && ch2$1070 === '>' && ch3$1071 === '>') {
            index$868 += 3;
            return {
                type: Token$857.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$869,
                lineStart: lineStart$870,
                range: [
                    start$1066,
                    index$868
                ]
            };
        }
        if (ch1$1069 === '<' && ch2$1070 === '<' && ch3$1071 === '=') {
            index$868 += 3;
            return {
                type: Token$857.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$869,
                lineStart: lineStart$870,
                range: [
                    start$1066,
                    index$868
                ]
            };
        }
        if (ch1$1069 === '>' && ch2$1070 === '>' && ch3$1071 === '=') {
            index$868 += 3;
            return {
                type: Token$857.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$869,
                lineStart: lineStart$870,
                range: [
                    start$1066,
                    index$868
                ]
            };
        }
        if (ch1$1069 === '.' && ch2$1070 === '.' && ch3$1071 === '.') {
            index$868 += 3;
            return {
                type: Token$857.Punctuator,
                value: '...',
                lineNumber: lineNumber$869,
                lineStart: lineStart$870,
                range: [
                    start$1066,
                    index$868
                ]
            };
        }
        // Other 2-character punctuators: ++ -- << >> && ||
        if (ch1$1069 === ch2$1070 && '+-<>&|'.indexOf(ch1$1069) >= 0) {
            index$868 += 2;
            return {
                type: Token$857.Punctuator,
                value: ch1$1069 + ch2$1070,
                lineNumber: lineNumber$869,
                lineStart: lineStart$870,
                range: [
                    start$1066,
                    index$868
                ]
            };
        }
        if (ch1$1069 === '=' && ch2$1070 === '>') {
            index$868 += 2;
            return {
                type: Token$857.Punctuator,
                value: '=>',
                lineNumber: lineNumber$869,
                lineStart: lineStart$870,
                range: [
                    start$1066,
                    index$868
                ]
            };
        }
        if ('<>=!+-*%&|^/'.indexOf(ch1$1069) >= 0) {
            ++index$868;
            return {
                type: Token$857.Punctuator,
                value: ch1$1069,
                lineNumber: lineNumber$869,
                lineStart: lineStart$870,
                range: [
                    start$1066,
                    index$868
                ]
            };
        }
        if (ch1$1069 === '.') {
            ++index$868;
            return {
                type: Token$857.Punctuator,
                value: ch1$1069,
                lineNumber: lineNumber$869,
                lineStart: lineStart$870,
                range: [
                    start$1066,
                    index$868
                ]
            };
        }
        throwError$917({}, Messages$862.UnexpectedToken, 'ILLEGAL');
    }
    // 7.8.3 Numeric Literals
    function scanHexLiteral$903(start$1073) {
        var number$1074 = '';
        while (index$868 < length$875) {
            if (!isHexDigit$886(source$866[index$868])) {
                break;
            }
            number$1074 += source$866[index$868++];
        }
        if (number$1074.length === 0) {
            throwError$917({}, Messages$862.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$890(source$866.charCodeAt(index$868))) {
            throwError$917({}, Messages$862.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$857.NumericLiteral,
            value: parseInt('0x' + number$1074, 16),
            lineNumber: lineNumber$869,
            lineStart: lineStart$870,
            range: [
                start$1073,
                index$868
            ]
        };
    }
    function scanOctalLiteral$904(prefix$1075, start$1076) {
        var number$1077, octal$1078;
        if (isOctalDigit$887(prefix$1075)) {
            octal$1078 = true;
            number$1077 = '0' + source$866[index$868++];
        } else {
            octal$1078 = false;
            ++index$868;
            number$1077 = '';
        }
        while (index$868 < length$875) {
            if (!isOctalDigit$887(source$866[index$868])) {
                break;
            }
            number$1077 += source$866[index$868++];
        }
        if (!octal$1078 && number$1077.length === 0) {
            // only 0o or 0O
            throwError$917({}, Messages$862.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart$890(source$866.charCodeAt(index$868)) || isDecimalDigit$885(source$866.charCodeAt(index$868))) {
            throwError$917({}, Messages$862.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$857.NumericLiteral,
            value: parseInt(number$1077, 8),
            octal: octal$1078,
            lineNumber: lineNumber$869,
            lineStart: lineStart$870,
            range: [
                start$1076,
                index$868
            ]
        };
    }
    function scanNumericLiteral$905() {
        var number$1079, start$1080, ch$1081, octal$1082;
        ch$1081 = source$866[index$868];
        assert$883(isDecimalDigit$885(ch$1081.charCodeAt(0)) || ch$1081 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$1080 = index$868;
        number$1079 = '';
        if (ch$1081 !== '.') {
            number$1079 = source$866[index$868++];
            ch$1081 = source$866[index$868];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if (number$1079 === '0') {
                if (ch$1081 === 'x' || ch$1081 === 'X') {
                    ++index$868;
                    return scanHexLiteral$903(start$1080);
                }
                if (ch$1081 === 'b' || ch$1081 === 'B') {
                    ++index$868;
                    number$1079 = '';
                    while (index$868 < length$875) {
                        ch$1081 = source$866[index$868];
                        if (ch$1081 !== '0' && ch$1081 !== '1') {
                            break;
                        }
                        number$1079 += source$866[index$868++];
                    }
                    if (number$1079.length === 0) {
                        // only 0b or 0B
                        throwError$917({}, Messages$862.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$868 < length$875) {
                        ch$1081 = source$866.charCodeAt(index$868);
                        if (isIdentifierStart$890(ch$1081) || isDecimalDigit$885(ch$1081)) {
                            throwError$917({}, Messages$862.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$857.NumericLiteral,
                        value: parseInt(number$1079, 2),
                        lineNumber: lineNumber$869,
                        lineStart: lineStart$870,
                        range: [
                            start$1080,
                            index$868
                        ]
                    };
                }
                if (ch$1081 === 'o' || ch$1081 === 'O' || isOctalDigit$887(ch$1081)) {
                    return scanOctalLiteral$904(ch$1081, start$1080);
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (ch$1081 && isDecimalDigit$885(ch$1081.charCodeAt(0))) {
                    throwError$917({}, Messages$862.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (isDecimalDigit$885(source$866.charCodeAt(index$868))) {
                number$1079 += source$866[index$868++];
            }
            ch$1081 = source$866[index$868];
        }
        if (ch$1081 === '.') {
            number$1079 += source$866[index$868++];
            while (isDecimalDigit$885(source$866.charCodeAt(index$868))) {
                number$1079 += source$866[index$868++];
            }
            ch$1081 = source$866[index$868];
        }
        if (ch$1081 === 'e' || ch$1081 === 'E') {
            number$1079 += source$866[index$868++];
            ch$1081 = source$866[index$868];
            if (ch$1081 === '+' || ch$1081 === '-') {
                number$1079 += source$866[index$868++];
            }
            if (isDecimalDigit$885(source$866.charCodeAt(index$868))) {
                while (isDecimalDigit$885(source$866.charCodeAt(index$868))) {
                    number$1079 += source$866[index$868++];
                }
            } else {
                throwError$917({}, Messages$862.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (isIdentifierStart$890(source$866.charCodeAt(index$868))) {
            throwError$917({}, Messages$862.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$857.NumericLiteral,
            value: parseFloat(number$1079),
            lineNumber: lineNumber$869,
            lineStart: lineStart$870,
            range: [
                start$1080,
                index$868
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$906() {
        var str$1083 = '', quote$1084, start$1085, ch$1086, code$1087, unescaped$1088, restore$1089, octal$1090 = false;
        quote$1084 = source$866[index$868];
        assert$883(quote$1084 === '\'' || quote$1084 === '"', 'String literal must starts with a quote');
        start$1085 = index$868;
        ++index$868;
        while (index$868 < length$875) {
            ch$1086 = source$866[index$868++];
            if (ch$1086 === quote$1084) {
                quote$1084 = '';
                break;
            } else if (ch$1086 === '\\') {
                ch$1086 = source$866[index$868++];
                if (!ch$1086 || !isLineTerminator$889(ch$1086.charCodeAt(0))) {
                    switch (ch$1086) {
                    case 'n':
                        str$1083 += '\n';
                        break;
                    case 'r':
                        str$1083 += '\r';
                        break;
                    case 't':
                        str$1083 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$866[index$868] === '{') {
                            ++index$868;
                            str$1083 += scanUnicodeCodePointEscape$898();
                        } else {
                            restore$1089 = index$868;
                            unescaped$1088 = scanHexEscape$897(ch$1086);
                            if (unescaped$1088) {
                                str$1083 += unescaped$1088;
                            } else {
                                index$868 = restore$1089;
                                str$1083 += ch$1086;
                            }
                        }
                        break;
                    case 'b':
                        str$1083 += '\b';
                        break;
                    case 'f':
                        str$1083 += '\f';
                        break;
                    case 'v':
                        str$1083 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$887(ch$1086)) {
                            code$1087 = '01234567'.indexOf(ch$1086);
                            // \0 is not octal escape sequence
                            if (code$1087 !== 0) {
                                octal$1090 = true;
                            }
                            if (index$868 < length$875 && isOctalDigit$887(source$866[index$868])) {
                                octal$1090 = true;
                                code$1087 = code$1087 * 8 + '01234567'.indexOf(source$866[index$868++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1086) >= 0 && index$868 < length$875 && isOctalDigit$887(source$866[index$868])) {
                                    code$1087 = code$1087 * 8 + '01234567'.indexOf(source$866[index$868++]);
                                }
                            }
                            str$1083 += String.fromCharCode(code$1087);
                        } else {
                            str$1083 += ch$1086;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$869;
                    if (ch$1086 === '\r' && source$866[index$868] === '\n') {
                        ++index$868;
                    }
                }
            } else if (isLineTerminator$889(ch$1086.charCodeAt(0))) {
                break;
            } else {
                str$1083 += ch$1086;
            }
        }
        if (quote$1084 !== '') {
            throwError$917({}, Messages$862.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$857.StringLiteral,
            value: str$1083,
            octal: octal$1090,
            lineNumber: lineNumber$869,
            lineStart: lineStart$870,
            range: [
                start$1085,
                index$868
            ]
        };
    }
    function scanTemplate$907() {
        var cooked$1091 = '', ch$1092, start$1093, terminated$1094, tail$1095, restore$1096, unescaped$1097, code$1098, octal$1099;
        terminated$1094 = false;
        tail$1095 = false;
        start$1093 = index$868;
        ++index$868;
        while (index$868 < length$875) {
            ch$1092 = source$866[index$868++];
            if (ch$1092 === '`') {
                tail$1095 = true;
                terminated$1094 = true;
                break;
            } else if (ch$1092 === '$') {
                if (source$866[index$868] === '{') {
                    ++index$868;
                    terminated$1094 = true;
                    break;
                }
                cooked$1091 += ch$1092;
            } else if (ch$1092 === '\\') {
                ch$1092 = source$866[index$868++];
                if (!isLineTerminator$889(ch$1092.charCodeAt(0))) {
                    switch (ch$1092) {
                    case 'n':
                        cooked$1091 += '\n';
                        break;
                    case 'r':
                        cooked$1091 += '\r';
                        break;
                    case 't':
                        cooked$1091 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source$866[index$868] === '{') {
                            ++index$868;
                            cooked$1091 += scanUnicodeCodePointEscape$898();
                        } else {
                            restore$1096 = index$868;
                            unescaped$1097 = scanHexEscape$897(ch$1092);
                            if (unescaped$1097) {
                                cooked$1091 += unescaped$1097;
                            } else {
                                index$868 = restore$1096;
                                cooked$1091 += ch$1092;
                            }
                        }
                        break;
                    case 'b':
                        cooked$1091 += '\b';
                        break;
                    case 'f':
                        cooked$1091 += '\f';
                        break;
                    case 'v':
                        cooked$1091 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$887(ch$1092)) {
                            code$1098 = '01234567'.indexOf(ch$1092);
                            // \0 is not octal escape sequence
                            if (code$1098 !== 0) {
                                octal$1099 = true;
                            }
                            if (index$868 < length$875 && isOctalDigit$887(source$866[index$868])) {
                                octal$1099 = true;
                                code$1098 = code$1098 * 8 + '01234567'.indexOf(source$866[index$868++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1092) >= 0 && index$868 < length$875 && isOctalDigit$887(source$866[index$868])) {
                                    code$1098 = code$1098 * 8 + '01234567'.indexOf(source$866[index$868++]);
                                }
                            }
                            cooked$1091 += String.fromCharCode(code$1098);
                        } else {
                            cooked$1091 += ch$1092;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$869;
                    if (ch$1092 === '\r' && source$866[index$868] === '\n') {
                        ++index$868;
                    }
                }
            } else if (isLineTerminator$889(ch$1092.charCodeAt(0))) {
                ++lineNumber$869;
                if (ch$1092 === '\r' && source$866[index$868] === '\n') {
                    ++index$868;
                }
                cooked$1091 += '\n';
            } else {
                cooked$1091 += ch$1092;
            }
        }
        if (!terminated$1094) {
            throwError$917({}, Messages$862.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$857.Template,
            value: {
                cooked: cooked$1091,
                raw: source$866.slice(start$1093 + 1, index$868 - (tail$1095 ? 1 : 2))
            },
            tail: tail$1095,
            octal: octal$1099,
            lineNumber: lineNumber$869,
            lineStart: lineStart$870,
            range: [
                start$1093,
                index$868
            ]
        };
    }
    function scanTemplateElement$908(option$1100) {
        var startsWith$1101, template$1102;
        lookahead$879 = null;
        skipComment$896();
        startsWith$1101 = option$1100.head ? '`' : '}';
        if (source$866[index$868] !== startsWith$1101) {
            throwError$917({}, Messages$862.UnexpectedToken, 'ILLEGAL');
        }
        template$1102 = scanTemplate$907();
        peek$914();
        return template$1102;
    }
    function scanRegExp$909() {
        var str$1103, ch$1104, start$1105, pattern$1106, flags$1107, value$1108, classMarker$1109 = false, restore$1110, terminated$1111 = false;
        lookahead$879 = null;
        skipComment$896();
        start$1105 = index$868;
        ch$1104 = source$866[index$868];
        assert$883(ch$1104 === '/', 'Regular expression literal must start with a slash');
        str$1103 = source$866[index$868++];
        while (index$868 < length$875) {
            ch$1104 = source$866[index$868++];
            str$1103 += ch$1104;
            if (classMarker$1109) {
                if (ch$1104 === ']') {
                    classMarker$1109 = false;
                }
            } else {
                if (ch$1104 === '\\') {
                    ch$1104 = source$866[index$868++];
                    // ECMA-262 7.8.5
                    if (isLineTerminator$889(ch$1104.charCodeAt(0))) {
                        throwError$917({}, Messages$862.UnterminatedRegExp);
                    }
                    str$1103 += ch$1104;
                } else if (ch$1104 === '/') {
                    terminated$1111 = true;
                    break;
                } else if (ch$1104 === '[') {
                    classMarker$1109 = true;
                } else if (isLineTerminator$889(ch$1104.charCodeAt(0))) {
                    throwError$917({}, Messages$862.UnterminatedRegExp);
                }
            }
        }
        if (!terminated$1111) {
            throwError$917({}, Messages$862.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$1106 = str$1103.substr(1, str$1103.length - 2);
        flags$1107 = '';
        while (index$868 < length$875) {
            ch$1104 = source$866[index$868];
            if (!isIdentifierPart$891(ch$1104.charCodeAt(0))) {
                break;
            }
            ++index$868;
            if (ch$1104 === '\\' && index$868 < length$875) {
                ch$1104 = source$866[index$868];
                if (ch$1104 === 'u') {
                    ++index$868;
                    restore$1110 = index$868;
                    ch$1104 = scanHexEscape$897('u');
                    if (ch$1104) {
                        flags$1107 += ch$1104;
                        for (str$1103 += '\\u'; restore$1110 < index$868; ++restore$1110) {
                            str$1103 += source$866[restore$1110];
                        }
                    } else {
                        index$868 = restore$1110;
                        flags$1107 += 'u';
                        str$1103 += '\\u';
                    }
                } else {
                    str$1103 += '\\';
                }
            } else {
                flags$1107 += ch$1104;
                str$1103 += ch$1104;
            }
        }
        try {
            value$1108 = new RegExp(pattern$1106, flags$1107);
        } catch (e$1112) {
            throwError$917({}, Messages$862.InvalidRegExp);
        }
        // peek();
        if (extra$882.tokenize) {
            return {
                type: Token$857.RegularExpression,
                value: value$1108,
                lineNumber: lineNumber$869,
                lineStart: lineStart$870,
                range: [
                    start$1105,
                    index$868
                ]
            };
        }
        return {
            type: Token$857.RegularExpression,
            literal: str$1103,
            value: value$1108,
            range: [
                start$1105,
                index$868
            ]
        };
    }
    function isIdentifierName$910(token$1113) {
        return token$1113.type === Token$857.Identifier || token$1113.type === Token$857.Keyword || token$1113.type === Token$857.BooleanLiteral || token$1113.type === Token$857.NullLiteral;
    }
    function advanceSlash$911() {
        var prevToken$1114, checkToken$1115;
        // Using the following algorithm:
        // https://github.com/mozilla/sweet.js/wiki/design
        prevToken$1114 = extra$882.tokens[extra$882.tokens.length - 1];
        if (!prevToken$1114) {
            // Nothing before that: it cannot be a division.
            return scanRegExp$909();
        }
        if (prevToken$1114.type === 'Punctuator') {
            if (prevToken$1114.value === ')') {
                checkToken$1115 = extra$882.tokens[extra$882.openParenToken - 1];
                if (checkToken$1115 && checkToken$1115.type === 'Keyword' && (checkToken$1115.value === 'if' || checkToken$1115.value === 'while' || checkToken$1115.value === 'for' || checkToken$1115.value === 'with')) {
                    return scanRegExp$909();
                }
                return scanPunctuator$902();
            }
            if (prevToken$1114.value === '}') {
                // Dividing a function by anything makes little sense,
                // but we have to check for that.
                if (extra$882.tokens[extra$882.openCurlyToken - 3] && extra$882.tokens[extra$882.openCurlyToken - 3].type === 'Keyword') {
                    // Anonymous function.
                    checkToken$1115 = extra$882.tokens[extra$882.openCurlyToken - 4];
                    if (!checkToken$1115) {
                        return scanPunctuator$902();
                    }
                } else if (extra$882.tokens[extra$882.openCurlyToken - 4] && extra$882.tokens[extra$882.openCurlyToken - 4].type === 'Keyword') {
                    // Named function.
                    checkToken$1115 = extra$882.tokens[extra$882.openCurlyToken - 5];
                    if (!checkToken$1115) {
                        return scanRegExp$909();
                    }
                } else {
                    return scanPunctuator$902();
                }
                // checkToken determines whether the function is
                // a declaration or an expression.
                if (FnExprTokens$859.indexOf(checkToken$1115.value) >= 0) {
                    // It is an expression.
                    return scanPunctuator$902();
                }
                // It is a declaration.
                return scanRegExp$909();
            }
            return scanRegExp$909();
        }
        if (prevToken$1114.type === 'Keyword') {
            return scanRegExp$909();
        }
        return scanPunctuator$902();
    }
    function advance$912() {
        var ch$1116;
        skipComment$896();
        if (index$868 >= length$875) {
            return {
                type: Token$857.EOF,
                lineNumber: lineNumber$869,
                lineStart: lineStart$870,
                range: [
                    index$868,
                    index$868
                ]
            };
        }
        ch$1116 = source$866.charCodeAt(index$868);
        // Very common: ( and ) and ;
        if (ch$1116 === 40 || ch$1116 === 41 || ch$1116 === 58) {
            return scanPunctuator$902();
        }
        // String literal starts with single quote (#39) or double quote (#34).
        if (ch$1116 === 39 || ch$1116 === 34) {
            return scanStringLiteral$906();
        }
        if (ch$1116 === 96) {
            return scanTemplate$907();
        }
        if (isIdentifierStart$890(ch$1116)) {
            return scanIdentifier$901();
        }
        // # and @ are allowed for sweet.js
        if (ch$1116 === 35 || ch$1116 === 64) {
            ++index$868;
            return {
                type: Token$857.Punctuator,
                value: String.fromCharCode(ch$1116),
                lineNumber: lineNumber$869,
                lineStart: lineStart$870,
                range: [
                    index$868 - 1,
                    index$868
                ]
            };
        }
        // Dot (.) char #46 can also start a floating-point number, hence the need
        // to check the next character.
        if (ch$1116 === 46) {
            if (isDecimalDigit$885(source$866.charCodeAt(index$868 + 1))) {
                return scanNumericLiteral$905();
            }
            return scanPunctuator$902();
        }
        if (isDecimalDigit$885(ch$1116)) {
            return scanNumericLiteral$905();
        }
        // Slash (/) char #47 can also start a regex.
        if (extra$882.tokenize && ch$1116 === 47) {
            return advanceSlash$911();
        }
        return scanPunctuator$902();
    }
    function lex$913() {
        var token$1117;
        token$1117 = lookahead$879;
        streamIndex$878 = lookaheadIndex$880;
        lineNumber$869 = token$1117.lineNumber;
        lineStart$870 = token$1117.lineStart;
        sm_lineNumber$871 = lookahead$879.sm_lineNumber;
        sm_lineStart$872 = lookahead$879.sm_lineStart;
        sm_range$873 = lookahead$879.sm_range;
        sm_index$874 = lookahead$879.sm_range[0];
        lookahead$879 = tokenStream$877[++streamIndex$878].token;
        lookaheadIndex$880 = streamIndex$878;
        index$868 = lookahead$879.range[0];
        return token$1117;
    }
    function peek$914() {
        lookaheadIndex$880 = streamIndex$878 + 1;
        if (lookaheadIndex$880 >= length$875) {
            lookahead$879 = {
                type: Token$857.EOF,
                lineNumber: lineNumber$869,
                lineStart: lineStart$870,
                range: [
                    index$868,
                    index$868
                ]
            };
            return;
        }
        lookahead$879 = tokenStream$877[lookaheadIndex$880].token;
        index$868 = lookahead$879.range[0];
    }
    function lookahead2$915() {
        var adv$1118, pos$1119, line$1120, start$1121, result$1122;
        if (streamIndex$878 + 1 >= length$875 || streamIndex$878 + 2 >= length$875) {
            return {
                type: Token$857.EOF,
                lineNumber: lineNumber$869,
                lineStart: lineStart$870,
                range: [
                    index$868,
                    index$868
                ]
            };
        }
        // Scan for the next immediate token.
        if (lookahead$879 === null) {
            lookaheadIndex$880 = streamIndex$878 + 1;
            lookahead$879 = tokenStream$877[lookaheadIndex$880].token;
            index$868 = lookahead$879.range[0];
        }
        result$1122 = tokenStream$877[lookaheadIndex$880 + 1].token;
        return result$1122;
    }
    SyntaxTreeDelegate$864 = {
        name: 'SyntaxTree',
        postProcess: function (node$1123) {
            return node$1123;
        },
        createArrayExpression: function (elements$1124) {
            return {
                type: Syntax$860.ArrayExpression,
                elements: elements$1124
            };
        },
        createAssignmentExpression: function (operator$1125, left$1126, right$1127) {
            return {
                type: Syntax$860.AssignmentExpression,
                operator: operator$1125,
                left: left$1126,
                right: right$1127
            };
        },
        createBinaryExpression: function (operator$1128, left$1129, right$1130) {
            var type$1131 = operator$1128 === '||' || operator$1128 === '&&' ? Syntax$860.LogicalExpression : Syntax$860.BinaryExpression;
            return {
                type: type$1131,
                operator: operator$1128,
                left: left$1129,
                right: right$1130
            };
        },
        createBlockStatement: function (body$1132) {
            return {
                type: Syntax$860.BlockStatement,
                body: body$1132
            };
        },
        createBreakStatement: function (label$1133) {
            return {
                type: Syntax$860.BreakStatement,
                label: label$1133
            };
        },
        createCallExpression: function (callee$1134, args$1135) {
            return {
                type: Syntax$860.CallExpression,
                callee: callee$1134,
                'arguments': args$1135
            };
        },
        createCatchClause: function (param$1136, body$1137) {
            return {
                type: Syntax$860.CatchClause,
                param: param$1136,
                body: body$1137
            };
        },
        createConditionalExpression: function (test$1138, consequent$1139, alternate$1140) {
            return {
                type: Syntax$860.ConditionalExpression,
                test: test$1138,
                consequent: consequent$1139,
                alternate: alternate$1140
            };
        },
        createContinueStatement: function (label$1141) {
            return {
                type: Syntax$860.ContinueStatement,
                label: label$1141
            };
        },
        createDebuggerStatement: function () {
            return { type: Syntax$860.DebuggerStatement };
        },
        createDoWhileStatement: function (body$1142, test$1143) {
            return {
                type: Syntax$860.DoWhileStatement,
                body: body$1142,
                test: test$1143
            };
        },
        createEmptyStatement: function () {
            return { type: Syntax$860.EmptyStatement };
        },
        createExpressionStatement: function (expression$1144) {
            return {
                type: Syntax$860.ExpressionStatement,
                expression: expression$1144
            };
        },
        createForStatement: function (init$1145, test$1146, update$1147, body$1148) {
            return {
                type: Syntax$860.ForStatement,
                init: init$1145,
                test: test$1146,
                update: update$1147,
                body: body$1148
            };
        },
        createForInStatement: function (left$1149, right$1150, body$1151) {
            return {
                type: Syntax$860.ForInStatement,
                left: left$1149,
                right: right$1150,
                body: body$1151,
                each: false
            };
        },
        createForOfStatement: function (left$1152, right$1153, body$1154) {
            return {
                type: Syntax$860.ForOfStatement,
                left: left$1152,
                right: right$1153,
                body: body$1154
            };
        },
        createFunctionDeclaration: function (id$1155, params$1156, defaults$1157, body$1158, rest$1159, generator$1160, expression$1161) {
            return {
                type: Syntax$860.FunctionDeclaration,
                id: id$1155,
                params: params$1156,
                defaults: defaults$1157,
                body: body$1158,
                rest: rest$1159,
                generator: generator$1160,
                expression: expression$1161
            };
        },
        createFunctionExpression: function (id$1162, params$1163, defaults$1164, body$1165, rest$1166, generator$1167, expression$1168) {
            return {
                type: Syntax$860.FunctionExpression,
                id: id$1162,
                params: params$1163,
                defaults: defaults$1164,
                body: body$1165,
                rest: rest$1166,
                generator: generator$1167,
                expression: expression$1168
            };
        },
        createIdentifier: function (name$1169) {
            return {
                type: Syntax$860.Identifier,
                name: name$1169
            };
        },
        createIfStatement: function (test$1170, consequent$1171, alternate$1172) {
            return {
                type: Syntax$860.IfStatement,
                test: test$1170,
                consequent: consequent$1171,
                alternate: alternate$1172
            };
        },
        createLabeledStatement: function (label$1173, body$1174) {
            return {
                type: Syntax$860.LabeledStatement,
                label: label$1173,
                body: body$1174
            };
        },
        createLiteral: function (token$1175) {
            return {
                type: Syntax$860.Literal,
                value: token$1175.value,
                raw: String(token$1175.value)
            };
        },
        createMemberExpression: function (accessor$1176, object$1177, property$1178) {
            return {
                type: Syntax$860.MemberExpression,
                computed: accessor$1176 === '[',
                object: object$1177,
                property: property$1178
            };
        },
        createNewExpression: function (callee$1179, args$1180) {
            return {
                type: Syntax$860.NewExpression,
                callee: callee$1179,
                'arguments': args$1180
            };
        },
        createObjectExpression: function (properties$1181) {
            return {
                type: Syntax$860.ObjectExpression,
                properties: properties$1181
            };
        },
        createPostfixExpression: function (operator$1182, argument$1183) {
            return {
                type: Syntax$860.UpdateExpression,
                operator: operator$1182,
                argument: argument$1183,
                prefix: false
            };
        },
        createProgram: function (body$1184) {
            return {
                type: Syntax$860.Program,
                body: body$1184
            };
        },
        createProperty: function (kind$1185, key$1186, value$1187, method$1188, shorthand$1189) {
            return {
                type: Syntax$860.Property,
                key: key$1186,
                value: value$1187,
                kind: kind$1185,
                method: method$1188,
                shorthand: shorthand$1189
            };
        },
        createReturnStatement: function (argument$1190) {
            return {
                type: Syntax$860.ReturnStatement,
                argument: argument$1190
            };
        },
        createSequenceExpression: function (expressions$1191) {
            return {
                type: Syntax$860.SequenceExpression,
                expressions: expressions$1191
            };
        },
        createSwitchCase: function (test$1192, consequent$1193) {
            return {
                type: Syntax$860.SwitchCase,
                test: test$1192,
                consequent: consequent$1193
            };
        },
        createSwitchStatement: function (discriminant$1194, cases$1195) {
            return {
                type: Syntax$860.SwitchStatement,
                discriminant: discriminant$1194,
                cases: cases$1195
            };
        },
        createThisExpression: function () {
            return { type: Syntax$860.ThisExpression };
        },
        createThrowStatement: function (argument$1196) {
            return {
                type: Syntax$860.ThrowStatement,
                argument: argument$1196
            };
        },
        createTryStatement: function (block$1197, guardedHandlers$1198, handlers$1199, finalizer$1200) {
            return {
                type: Syntax$860.TryStatement,
                block: block$1197,
                guardedHandlers: guardedHandlers$1198,
                handlers: handlers$1199,
                finalizer: finalizer$1200
            };
        },
        createUnaryExpression: function (operator$1201, argument$1202) {
            if (operator$1201 === '++' || operator$1201 === '--') {
                return {
                    type: Syntax$860.UpdateExpression,
                    operator: operator$1201,
                    argument: argument$1202,
                    prefix: true
                };
            }
            return {
                type: Syntax$860.UnaryExpression,
                operator: operator$1201,
                argument: argument$1202
            };
        },
        createVariableDeclaration: function (declarations$1203, kind$1204) {
            return {
                type: Syntax$860.VariableDeclaration,
                declarations: declarations$1203,
                kind: kind$1204
            };
        },
        createVariableDeclarator: function (id$1205, init$1206) {
            return {
                type: Syntax$860.VariableDeclarator,
                id: id$1205,
                init: init$1206
            };
        },
        createWhileStatement: function (test$1207, body$1208) {
            return {
                type: Syntax$860.WhileStatement,
                test: test$1207,
                body: body$1208
            };
        },
        createWithStatement: function (object$1209, body$1210) {
            return {
                type: Syntax$860.WithStatement,
                object: object$1209,
                body: body$1210
            };
        },
        createTemplateElement: function (value$1211, tail$1212) {
            return {
                type: Syntax$860.TemplateElement,
                value: value$1211,
                tail: tail$1212
            };
        },
        createTemplateLiteral: function (quasis$1213, expressions$1214) {
            return {
                type: Syntax$860.TemplateLiteral,
                quasis: quasis$1213,
                expressions: expressions$1214
            };
        },
        createSpreadElement: function (argument$1215) {
            return {
                type: Syntax$860.SpreadElement,
                argument: argument$1215
            };
        },
        createTaggedTemplateExpression: function (tag$1216, quasi$1217) {
            return {
                type: Syntax$860.TaggedTemplateExpression,
                tag: tag$1216,
                quasi: quasi$1217
            };
        },
        createArrowFunctionExpression: function (params$1218, defaults$1219, body$1220, rest$1221, expression$1222) {
            return {
                type: Syntax$860.ArrowFunctionExpression,
                id: null,
                params: params$1218,
                defaults: defaults$1219,
                body: body$1220,
                rest: rest$1221,
                generator: false,
                expression: expression$1222
            };
        },
        createMethodDefinition: function (propertyType$1223, kind$1224, key$1225, value$1226) {
            return {
                type: Syntax$860.MethodDefinition,
                key: key$1225,
                value: value$1226,
                kind: kind$1224,
                'static': propertyType$1223 === ClassPropertyType$865.static
            };
        },
        createClassBody: function (body$1227) {
            return {
                type: Syntax$860.ClassBody,
                body: body$1227
            };
        },
        createClassExpression: function (id$1228, superClass$1229, body$1230) {
            return {
                type: Syntax$860.ClassExpression,
                id: id$1228,
                superClass: superClass$1229,
                body: body$1230
            };
        },
        createClassDeclaration: function (id$1231, superClass$1232, body$1233) {
            return {
                type: Syntax$860.ClassDeclaration,
                id: id$1231,
                superClass: superClass$1232,
                body: body$1233
            };
        },
        createExportSpecifier: function (id$1234, name$1235) {
            return {
                type: Syntax$860.ExportSpecifier,
                id: id$1234,
                name: name$1235
            };
        },
        createExportBatchSpecifier: function () {
            return { type: Syntax$860.ExportBatchSpecifier };
        },
        createExportDeclaration: function (declaration$1236, specifiers$1237, source$1238) {
            return {
                type: Syntax$860.ExportDeclaration,
                declaration: declaration$1236,
                specifiers: specifiers$1237,
                source: source$1238
            };
        },
        createImportSpecifier: function (id$1239, name$1240) {
            return {
                type: Syntax$860.ImportSpecifier,
                id: id$1239,
                name: name$1240
            };
        },
        createImportDeclaration: function (specifiers$1241, kind$1242, source$1243) {
            return {
                type: Syntax$860.ImportDeclaration,
                specifiers: specifiers$1241,
                kind: kind$1242,
                source: source$1243
            };
        },
        createYieldExpression: function (argument$1244, delegate$1245) {
            return {
                type: Syntax$860.YieldExpression,
                argument: argument$1244,
                delegate: delegate$1245
            };
        },
        createModuleDeclaration: function (id$1246, source$1247, body$1248) {
            return {
                type: Syntax$860.ModuleDeclaration,
                id: id$1246,
                source: source$1247,
                body: body$1248
            };
        }
    };
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$916() {
        return lookahead$879.lineNumber !== lineNumber$869;
    }
    // Throw an exception
    function throwError$917(token$1249, messageFormat$1250) {
        var error$1251, args$1252 = Array.prototype.slice.call(arguments, 2), msg$1253 = messageFormat$1250.replace(/%(\d)/g, function (whole$1257, index$1258) {
                assert$883(index$1258 < args$1252.length, 'Message reference must be in range');
                return args$1252[index$1258];
            });
        var startIndex$1254 = streamIndex$878 > 3 ? streamIndex$878 - 3 : 0;
        var toks$1255 = '', tailingMsg$1256 = '';
        if (tokenStream$877) {
            toks$1255 = tokenStream$877.slice(startIndex$1254, streamIndex$878 + 3).map(function (stx$1259) {
                return stx$1259.token.value;
            }).join(' ');
            tailingMsg$1256 = '\n[... ' + toks$1255 + ' ...]';
        }
        if (typeof token$1249.lineNumber === 'number') {
            error$1251 = new Error('Line ' + token$1249.lineNumber + ': ' + msg$1253 + tailingMsg$1256);
            error$1251.index = token$1249.range[0];
            error$1251.lineNumber = token$1249.lineNumber;
            error$1251.column = token$1249.range[0] - lineStart$870 + 1;
        } else {
            error$1251 = new Error('Line ' + lineNumber$869 + ': ' + msg$1253 + tailingMsg$1256);
            error$1251.index = index$868;
            error$1251.lineNumber = lineNumber$869;
            error$1251.column = index$868 - lineStart$870 + 1;
        }
        error$1251.description = msg$1253;
        throw error$1251;
    }
    function throwErrorTolerant$918() {
        try {
            throwError$917.apply(null, arguments);
        } catch (e$1260) {
            if (extra$882.errors) {
                extra$882.errors.push(e$1260);
            } else {
                throw e$1260;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$919(token$1261) {
        if (token$1261.type === Token$857.EOF) {
            throwError$917(token$1261, Messages$862.UnexpectedEOS);
        }
        if (token$1261.type === Token$857.NumericLiteral) {
            throwError$917(token$1261, Messages$862.UnexpectedNumber);
        }
        if (token$1261.type === Token$857.StringLiteral) {
            throwError$917(token$1261, Messages$862.UnexpectedString);
        }
        if (token$1261.type === Token$857.Identifier) {
            throwError$917(token$1261, Messages$862.UnexpectedIdentifier);
        }
        if (token$1261.type === Token$857.Keyword) {
            if (isFutureReservedWord$892(token$1261.value)) {
            }    // sweet.js allows future reserved words
                 // throwError(token, Messages.UnexpectedReserved);
            else if (strict$867 && isStrictModeReservedWord$893(token$1261.value)) {
                throwErrorTolerant$918(token$1261, Messages$862.StrictReservedWord);
                return;
            }
            throwError$917(token$1261, Messages$862.UnexpectedToken, token$1261.value);
        }
        if (token$1261.type === Token$857.Template) {
            throwError$917(token$1261, Messages$862.UnexpectedTemplate, token$1261.value.raw);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$917(token$1261, Messages$862.UnexpectedToken, token$1261.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$920(value$1262) {
        var token$1263 = lex$913();
        if (token$1263.type !== Token$857.Punctuator || token$1263.value !== value$1262) {
            throwUnexpected$919(token$1263);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$921(keyword$1264) {
        var token$1265 = lex$913();
        if (token$1265.type !== Token$857.Keyword || token$1265.value !== keyword$1264) {
            throwUnexpected$919(token$1265);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$922(value$1266) {
        return lookahead$879.type === Token$857.Punctuator && lookahead$879.value === value$1266;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$923(keyword$1267) {
        return lookahead$879.type === Token$857.Keyword && lookahead$879.value === keyword$1267;
    }
    // Return true if the next token matches the specified contextual keyword
    function matchContextualKeyword$924(keyword$1268) {
        return lookahead$879.type === Token$857.Identifier && lookahead$879.value === keyword$1268;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$925() {
        var op$1269;
        if (lookahead$879.type !== Token$857.Punctuator) {
            return false;
        }
        op$1269 = lookahead$879.value;
        return op$1269 === '=' || op$1269 === '*=' || op$1269 === '/=' || op$1269 === '%=' || op$1269 === '+=' || op$1269 === '-=' || op$1269 === '<<=' || op$1269 === '>>=' || op$1269 === '>>>=' || op$1269 === '&=' || op$1269 === '^=' || op$1269 === '|=';
    }
    function consumeSemicolon$926() {
        var line$1270, ch$1271;
        ch$1271 = lookahead$879.value ? String(lookahead$879.value).charCodeAt(0) : -1;
        // Catch the very common case first: immediately a semicolon (char #59).
        if (ch$1271 === 59) {
            lex$913();
            return;
        }
        if (lookahead$879.lineNumber !== lineNumber$869) {
            return;
        }
        if (match$922(';')) {
            lex$913();
            return;
        }
        if (lookahead$879.type !== Token$857.EOF && !match$922('}')) {
            throwUnexpected$919(lookahead$879);
        }
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$927(expr$1272) {
        return expr$1272.type === Syntax$860.Identifier || expr$1272.type === Syntax$860.MemberExpression;
    }
    function isAssignableLeftHandSide$928(expr$1273) {
        return isLeftHandSide$927(expr$1273) || expr$1273.type === Syntax$860.ObjectPattern || expr$1273.type === Syntax$860.ArrayPattern;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$929() {
        var elements$1274 = [], blocks$1275 = [], filter$1276 = null, tmp$1277, possiblecomprehension$1278 = true, body$1279;
        expect$920('[');
        while (!match$922(']')) {
            if (lookahead$879.value === 'for' && lookahead$879.type === Token$857.Keyword) {
                if (!possiblecomprehension$1278) {
                    throwError$917({}, Messages$862.ComprehensionError);
                }
                matchKeyword$923('for');
                tmp$1277 = parseForStatement$977({ ignoreBody: true });
                tmp$1277.of = tmp$1277.type === Syntax$860.ForOfStatement;
                tmp$1277.type = Syntax$860.ComprehensionBlock;
                if (tmp$1277.left.kind) {
                    // can't be let or const
                    throwError$917({}, Messages$862.ComprehensionError);
                }
                blocks$1275.push(tmp$1277);
            } else if (lookahead$879.value === 'if' && lookahead$879.type === Token$857.Keyword) {
                if (!possiblecomprehension$1278) {
                    throwError$917({}, Messages$862.ComprehensionError);
                }
                expectKeyword$921('if');
                expect$920('(');
                filter$1276 = parseExpression$957();
                expect$920(')');
            } else if (lookahead$879.value === ',' && lookahead$879.type === Token$857.Punctuator) {
                possiblecomprehension$1278 = false;
                // no longer allowed.
                lex$913();
                elements$1274.push(null);
            } else {
                tmp$1277 = parseSpreadOrAssignmentExpression$940();
                elements$1274.push(tmp$1277);
                if (tmp$1277 && tmp$1277.type === Syntax$860.SpreadElement) {
                    if (!match$922(']')) {
                        throwError$917({}, Messages$862.ElementAfterSpreadElement);
                    }
                } else if (!(match$922(']') || matchKeyword$923('for') || matchKeyword$923('if'))) {
                    expect$920(',');
                    // this lexes.
                    possiblecomprehension$1278 = false;
                }
            }
        }
        expect$920(']');
        if (filter$1276 && !blocks$1275.length) {
            throwError$917({}, Messages$862.ComprehensionRequiresBlock);
        }
        if (blocks$1275.length) {
            if (elements$1274.length !== 1) {
                throwError$917({}, Messages$862.ComprehensionError);
            }
            return {
                type: Syntax$860.ComprehensionExpression,
                filter: filter$1276,
                blocks: blocks$1275,
                body: elements$1274[0]
            };
        }
        return delegate$876.createArrayExpression(elements$1274);
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$930(options$1280) {
        var previousStrict$1281, previousYieldAllowed$1282, params$1283, defaults$1284, body$1285;
        previousStrict$1281 = strict$867;
        previousYieldAllowed$1282 = state$881.yieldAllowed;
        state$881.yieldAllowed = options$1280.generator;
        params$1283 = options$1280.params || [];
        defaults$1284 = options$1280.defaults || [];
        body$1285 = parseConciseBody$989();
        if (options$1280.name && strict$867 && isRestrictedWord$894(params$1283[0].name)) {
            throwErrorTolerant$918(options$1280.name, Messages$862.StrictParamName);
        }
        if (state$881.yieldAllowed && !state$881.yieldFound) {
            throwErrorTolerant$918({}, Messages$862.NoYieldInGenerator);
        }
        strict$867 = previousStrict$1281;
        state$881.yieldAllowed = previousYieldAllowed$1282;
        return delegate$876.createFunctionExpression(null, params$1283, defaults$1284, body$1285, options$1280.rest || null, options$1280.generator, body$1285.type !== Syntax$860.BlockStatement);
    }
    function parsePropertyMethodFunction$931(options$1286) {
        var previousStrict$1287, tmp$1288, method$1289;
        previousStrict$1287 = strict$867;
        strict$867 = true;
        tmp$1288 = parseParams$993();
        if (tmp$1288.stricted) {
            throwErrorTolerant$918(tmp$1288.stricted, tmp$1288.message);
        }
        method$1289 = parsePropertyFunction$930({
            params: tmp$1288.params,
            defaults: tmp$1288.defaults,
            rest: tmp$1288.rest,
            generator: options$1286.generator
        });
        strict$867 = previousStrict$1287;
        return method$1289;
    }
    function parseObjectPropertyKey$932() {
        var token$1290 = lex$913();
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$1290.type === Token$857.StringLiteral || token$1290.type === Token$857.NumericLiteral) {
            if (strict$867 && token$1290.octal) {
                throwErrorTolerant$918(token$1290, Messages$862.StrictOctalLiteral);
            }
            return delegate$876.createLiteral(token$1290);
        }
        // SWEET.JS: object keys are not resolved
        return delegate$876.createIdentifier(token$1290.value);
    }
    function parseObjectProperty$933() {
        var token$1291, key$1292, id$1293, value$1294, param$1295;
        token$1291 = lookahead$879;
        if (token$1291.type === Token$857.Identifier) {
            id$1293 = parseObjectPropertyKey$932();
            // Property Assignment: Getter and Setter.
            if (token$1291.value === 'get' && !(match$922(':') || match$922('('))) {
                key$1292 = parseObjectPropertyKey$932();
                expect$920('(');
                expect$920(')');
                return delegate$876.createProperty('get', key$1292, parsePropertyFunction$930({ generator: false }), false, false);
            }
            if (token$1291.value === 'set' && !(match$922(':') || match$922('('))) {
                key$1292 = parseObjectPropertyKey$932();
                expect$920('(');
                token$1291 = lookahead$879;
                param$1295 = [parseVariableIdentifier$960()];
                expect$920(')');
                return delegate$876.createProperty('set', key$1292, parsePropertyFunction$930({
                    params: param$1295,
                    generator: false,
                    name: token$1291
                }), false, false);
            }
            if (match$922(':')) {
                lex$913();
                return delegate$876.createProperty('init', id$1293, parseAssignmentExpression$956(), false, false);
            }
            if (match$922('(')) {
                return delegate$876.createProperty('init', id$1293, parsePropertyMethodFunction$931({ generator: false }), true, false);
            }
            return delegate$876.createProperty('init', id$1293, id$1293, false, true);
        }
        if (token$1291.type === Token$857.EOF || token$1291.type === Token$857.Punctuator) {
            if (!match$922('*')) {
                throwUnexpected$919(token$1291);
            }
            lex$913();
            id$1293 = parseObjectPropertyKey$932();
            if (!match$922('(')) {
                throwUnexpected$919(lex$913());
            }
            return delegate$876.createProperty('init', id$1293, parsePropertyMethodFunction$931({ generator: true }), true, false);
        }
        key$1292 = parseObjectPropertyKey$932();
        if (match$922(':')) {
            lex$913();
            return delegate$876.createProperty('init', key$1292, parseAssignmentExpression$956(), false, false);
        }
        if (match$922('(')) {
            return delegate$876.createProperty('init', key$1292, parsePropertyMethodFunction$931({ generator: false }), true, false);
        }
        throwUnexpected$919(lex$913());
    }
    function parseObjectInitialiser$934() {
        var properties$1296 = [], property$1297, name$1298, key$1299, kind$1300, map$1301 = {}, toString$1302 = String;
        expect$920('{');
        while (!match$922('}')) {
            property$1297 = parseObjectProperty$933();
            if (property$1297.key.type === Syntax$860.Identifier) {
                name$1298 = property$1297.key.name;
            } else {
                name$1298 = toString$1302(property$1297.key.value);
            }
            kind$1300 = property$1297.kind === 'init' ? PropertyKind$861.Data : property$1297.kind === 'get' ? PropertyKind$861.Get : PropertyKind$861.Set;
            key$1299 = '$' + name$1298;
            if (Object.prototype.hasOwnProperty.call(map$1301, key$1299)) {
                if (map$1301[key$1299] === PropertyKind$861.Data) {
                    if (strict$867 && kind$1300 === PropertyKind$861.Data) {
                        throwErrorTolerant$918({}, Messages$862.StrictDuplicateProperty);
                    } else if (kind$1300 !== PropertyKind$861.Data) {
                        throwErrorTolerant$918({}, Messages$862.AccessorDataProperty);
                    }
                } else {
                    if (kind$1300 === PropertyKind$861.Data) {
                        throwErrorTolerant$918({}, Messages$862.AccessorDataProperty);
                    } else if (map$1301[key$1299] & kind$1300) {
                        throwErrorTolerant$918({}, Messages$862.AccessorGetSet);
                    }
                }
                map$1301[key$1299] |= kind$1300;
            } else {
                map$1301[key$1299] = kind$1300;
            }
            properties$1296.push(property$1297);
            if (!match$922('}')) {
                expect$920(',');
            }
        }
        expect$920('}');
        return delegate$876.createObjectExpression(properties$1296);
    }
    function parseTemplateElement$935(option$1303) {
        var token$1304 = scanTemplateElement$908(option$1303);
        if (strict$867 && token$1304.octal) {
            throwError$917(token$1304, Messages$862.StrictOctalLiteral);
        }
        return delegate$876.createTemplateElement({
            raw: token$1304.value.raw,
            cooked: token$1304.value.cooked
        }, token$1304.tail);
    }
    function parseTemplateLiteral$936() {
        var quasi$1305, quasis$1306, expressions$1307;
        quasi$1305 = parseTemplateElement$935({ head: true });
        quasis$1306 = [quasi$1305];
        expressions$1307 = [];
        while (!quasi$1305.tail) {
            expressions$1307.push(parseExpression$957());
            quasi$1305 = parseTemplateElement$935({ head: false });
            quasis$1306.push(quasi$1305);
        }
        return delegate$876.createTemplateLiteral(quasis$1306, expressions$1307);
    }
    // 11.1.6 The Grouping Operator
    function parseGroupExpression$937() {
        var expr$1308;
        expect$920('(');
        ++state$881.parenthesizedCount;
        expr$1308 = parseExpression$957();
        expect$920(')');
        return expr$1308;
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$938() {
        var type$1309, token$1310, resolvedIdent$1311;
        token$1310 = lookahead$879;
        type$1309 = lookahead$879.type;
        if (type$1309 === Token$857.Identifier) {
            resolvedIdent$1311 = expander$856.resolve(tokenStream$877[lookaheadIndex$880]);
            lex$913();
            return delegate$876.createIdentifier(resolvedIdent$1311);
        }
        if (type$1309 === Token$857.StringLiteral || type$1309 === Token$857.NumericLiteral) {
            if (strict$867 && lookahead$879.octal) {
                throwErrorTolerant$918(lookahead$879, Messages$862.StrictOctalLiteral);
            }
            return delegate$876.createLiteral(lex$913());
        }
        if (type$1309 === Token$857.Keyword) {
            if (matchKeyword$923('this')) {
                lex$913();
                return delegate$876.createThisExpression();
            }
            if (matchKeyword$923('function')) {
                return parseFunctionExpression$995();
            }
            if (matchKeyword$923('class')) {
                return parseClassExpression$1000();
            }
            if (matchKeyword$923('super')) {
                lex$913();
                return delegate$876.createIdentifier('super');
            }
        }
        if (type$1309 === Token$857.BooleanLiteral) {
            token$1310 = lex$913();
            token$1310.value = token$1310.value === 'true';
            return delegate$876.createLiteral(token$1310);
        }
        if (type$1309 === Token$857.NullLiteral) {
            token$1310 = lex$913();
            token$1310.value = null;
            return delegate$876.createLiteral(token$1310);
        }
        if (match$922('[')) {
            return parseArrayInitialiser$929();
        }
        if (match$922('{')) {
            return parseObjectInitialiser$934();
        }
        if (match$922('(')) {
            return parseGroupExpression$937();
        }
        if (lookahead$879.type === Token$857.RegularExpression) {
            return delegate$876.createLiteral(lex$913());
        }
        if (type$1309 === Token$857.Template) {
            return parseTemplateLiteral$936();
        }
        return throwUnexpected$919(lex$913());
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$939() {
        var args$1312 = [], arg$1313;
        expect$920('(');
        if (!match$922(')')) {
            while (streamIndex$878 < length$875) {
                arg$1313 = parseSpreadOrAssignmentExpression$940();
                args$1312.push(arg$1313);
                if (match$922(')')) {
                    break;
                } else if (arg$1313.type === Syntax$860.SpreadElement) {
                    throwError$917({}, Messages$862.ElementAfterSpreadElement);
                }
                expect$920(',');
            }
        }
        expect$920(')');
        return args$1312;
    }
    function parseSpreadOrAssignmentExpression$940() {
        if (match$922('...')) {
            lex$913();
            return delegate$876.createSpreadElement(parseAssignmentExpression$956());
        }
        return parseAssignmentExpression$956();
    }
    function parseNonComputedProperty$941() {
        var token$1314 = lex$913();
        if (!isIdentifierName$910(token$1314)) {
            throwUnexpected$919(token$1314);
        }
        return delegate$876.createIdentifier(token$1314.value);
    }
    function parseNonComputedMember$942() {
        expect$920('.');
        return parseNonComputedProperty$941();
    }
    function parseComputedMember$943() {
        var expr$1315;
        expect$920('[');
        expr$1315 = parseExpression$957();
        expect$920(']');
        return expr$1315;
    }
    function parseNewExpression$944() {
        var callee$1316, args$1317;
        expectKeyword$921('new');
        callee$1316 = parseLeftHandSideExpression$946();
        args$1317 = match$922('(') ? parseArguments$939() : [];
        return delegate$876.createNewExpression(callee$1316, args$1317);
    }
    function parseLeftHandSideExpressionAllowCall$945() {
        var expr$1318, args$1319, property$1320;
        expr$1318 = matchKeyword$923('new') ? parseNewExpression$944() : parsePrimaryExpression$938();
        while (match$922('.') || match$922('[') || match$922('(') || lookahead$879.type === Token$857.Template) {
            if (match$922('(')) {
                args$1319 = parseArguments$939();
                expr$1318 = delegate$876.createCallExpression(expr$1318, args$1319);
            } else if (match$922('[')) {
                expr$1318 = delegate$876.createMemberExpression('[', expr$1318, parseComputedMember$943());
            } else if (match$922('.')) {
                expr$1318 = delegate$876.createMemberExpression('.', expr$1318, parseNonComputedMember$942());
            } else {
                expr$1318 = delegate$876.createTaggedTemplateExpression(expr$1318, parseTemplateLiteral$936());
            }
        }
        return expr$1318;
    }
    function parseLeftHandSideExpression$946() {
        var expr$1321, property$1322;
        expr$1321 = matchKeyword$923('new') ? parseNewExpression$944() : parsePrimaryExpression$938();
        while (match$922('.') || match$922('[') || lookahead$879.type === Token$857.Template) {
            if (match$922('[')) {
                expr$1321 = delegate$876.createMemberExpression('[', expr$1321, parseComputedMember$943());
            } else if (match$922('.')) {
                expr$1321 = delegate$876.createMemberExpression('.', expr$1321, parseNonComputedMember$942());
            } else {
                expr$1321 = delegate$876.createTaggedTemplateExpression(expr$1321, parseTemplateLiteral$936());
            }
        }
        return expr$1321;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$947() {
        var expr$1323 = parseLeftHandSideExpressionAllowCall$945(), token$1324 = lookahead$879;
        if (lookahead$879.type !== Token$857.Punctuator) {
            return expr$1323;
        }
        if ((match$922('++') || match$922('--')) && !peekLineTerminator$916()) {
            // 11.3.1, 11.3.2
            if (strict$867 && expr$1323.type === Syntax$860.Identifier && isRestrictedWord$894(expr$1323.name)) {
                throwErrorTolerant$918({}, Messages$862.StrictLHSPostfix);
            }
            if (!isLeftHandSide$927(expr$1323)) {
                throwError$917({}, Messages$862.InvalidLHSInAssignment);
            }
            token$1324 = lex$913();
            expr$1323 = delegate$876.createPostfixExpression(token$1324.value, expr$1323);
        }
        return expr$1323;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$948() {
        var token$1325, expr$1326;
        if (lookahead$879.type !== Token$857.Punctuator && lookahead$879.type !== Token$857.Keyword) {
            return parsePostfixExpression$947();
        }
        if (match$922('++') || match$922('--')) {
            token$1325 = lex$913();
            expr$1326 = parseUnaryExpression$948();
            // 11.4.4, 11.4.5
            if (strict$867 && expr$1326.type === Syntax$860.Identifier && isRestrictedWord$894(expr$1326.name)) {
                throwErrorTolerant$918({}, Messages$862.StrictLHSPrefix);
            }
            if (!isLeftHandSide$927(expr$1326)) {
                throwError$917({}, Messages$862.InvalidLHSInAssignment);
            }
            return delegate$876.createUnaryExpression(token$1325.value, expr$1326);
        }
        if (match$922('+') || match$922('-') || match$922('~') || match$922('!')) {
            token$1325 = lex$913();
            expr$1326 = parseUnaryExpression$948();
            return delegate$876.createUnaryExpression(token$1325.value, expr$1326);
        }
        if (matchKeyword$923('delete') || matchKeyword$923('void') || matchKeyword$923('typeof')) {
            token$1325 = lex$913();
            expr$1326 = parseUnaryExpression$948();
            expr$1326 = delegate$876.createUnaryExpression(token$1325.value, expr$1326);
            if (strict$867 && expr$1326.operator === 'delete' && expr$1326.argument.type === Syntax$860.Identifier) {
                throwErrorTolerant$918({}, Messages$862.StrictDelete);
            }
            return expr$1326;
        }
        return parsePostfixExpression$947();
    }
    function binaryPrecedence$949(token$1327, allowIn$1328) {
        var prec$1329 = 0;
        if (token$1327.type !== Token$857.Punctuator && token$1327.type !== Token$857.Keyword) {
            return 0;
        }
        switch (token$1327.value) {
        case '||':
            prec$1329 = 1;
            break;
        case '&&':
            prec$1329 = 2;
            break;
        case '|':
            prec$1329 = 3;
            break;
        case '^':
            prec$1329 = 4;
            break;
        case '&':
            prec$1329 = 5;
            break;
        case '==':
        case '!=':
        case '===':
        case '!==':
            prec$1329 = 6;
            break;
        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec$1329 = 7;
            break;
        case 'in':
            prec$1329 = allowIn$1328 ? 7 : 0;
            break;
        case '<<':
        case '>>':
        case '>>>':
            prec$1329 = 8;
            break;
        case '+':
        case '-':
            prec$1329 = 9;
            break;
        case '*':
        case '/':
        case '%':
            prec$1329 = 11;
            break;
        default:
            break;
        }
        return prec$1329;
    }
    // 11.5 Multiplicative Operators
    // 11.6 Additive Operators
    // 11.7 Bitwise Shift Operators
    // 11.8 Relational Operators
    // 11.9 Equality Operators
    // 11.10 Binary Bitwise Operators
    // 11.11 Binary Logical Operators
    function parseBinaryExpression$950() {
        var expr$1330, token$1331, prec$1332, previousAllowIn$1333, stack$1334, right$1335, operator$1336, left$1337, i$1338;
        previousAllowIn$1333 = state$881.allowIn;
        state$881.allowIn = true;
        expr$1330 = parseUnaryExpression$948();
        token$1331 = lookahead$879;
        prec$1332 = binaryPrecedence$949(token$1331, previousAllowIn$1333);
        if (prec$1332 === 0) {
            return expr$1330;
        }
        token$1331.prec = prec$1332;
        lex$913();
        stack$1334 = [
            expr$1330,
            token$1331,
            parseUnaryExpression$948()
        ];
        while ((prec$1332 = binaryPrecedence$949(lookahead$879, previousAllowIn$1333)) > 0) {
            // Reduce: make a binary expression from the three topmost entries.
            while (stack$1334.length > 2 && prec$1332 <= stack$1334[stack$1334.length - 2].prec) {
                right$1335 = stack$1334.pop();
                operator$1336 = stack$1334.pop().value;
                left$1337 = stack$1334.pop();
                stack$1334.push(delegate$876.createBinaryExpression(operator$1336, left$1337, right$1335));
            }
            // Shift.
            token$1331 = lex$913();
            token$1331.prec = prec$1332;
            stack$1334.push(token$1331);
            stack$1334.push(parseUnaryExpression$948());
        }
        state$881.allowIn = previousAllowIn$1333;
        // Final reduce to clean-up the stack.
        i$1338 = stack$1334.length - 1;
        expr$1330 = stack$1334[i$1338];
        while (i$1338 > 1) {
            expr$1330 = delegate$876.createBinaryExpression(stack$1334[i$1338 - 1].value, stack$1334[i$1338 - 2], expr$1330);
            i$1338 -= 2;
        }
        return expr$1330;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$951() {
        var expr$1339, previousAllowIn$1340, consequent$1341, alternate$1342;
        expr$1339 = parseBinaryExpression$950();
        if (match$922('?')) {
            lex$913();
            previousAllowIn$1340 = state$881.allowIn;
            state$881.allowIn = true;
            consequent$1341 = parseAssignmentExpression$956();
            state$881.allowIn = previousAllowIn$1340;
            expect$920(':');
            alternate$1342 = parseAssignmentExpression$956();
            expr$1339 = delegate$876.createConditionalExpression(expr$1339, consequent$1341, alternate$1342);
        }
        return expr$1339;
    }
    // 11.13 Assignment Operators
    function reinterpretAsAssignmentBindingPattern$952(expr$1343) {
        var i$1344, len$1345, property$1346, element$1347;
        if (expr$1343.type === Syntax$860.ObjectExpression) {
            expr$1343.type = Syntax$860.ObjectPattern;
            for (i$1344 = 0, len$1345 = expr$1343.properties.length; i$1344 < len$1345; i$1344 += 1) {
                property$1346 = expr$1343.properties[i$1344];
                if (property$1346.kind !== 'init') {
                    throwError$917({}, Messages$862.InvalidLHSInAssignment);
                }
                reinterpretAsAssignmentBindingPattern$952(property$1346.value);
            }
        } else if (expr$1343.type === Syntax$860.ArrayExpression) {
            expr$1343.type = Syntax$860.ArrayPattern;
            for (i$1344 = 0, len$1345 = expr$1343.elements.length; i$1344 < len$1345; i$1344 += 1) {
                element$1347 = expr$1343.elements[i$1344];
                if (element$1347) {
                    reinterpretAsAssignmentBindingPattern$952(element$1347);
                }
            }
        } else if (expr$1343.type === Syntax$860.Identifier) {
            if (isRestrictedWord$894(expr$1343.name)) {
                throwError$917({}, Messages$862.InvalidLHSInAssignment);
            }
        } else if (expr$1343.type === Syntax$860.SpreadElement) {
            reinterpretAsAssignmentBindingPattern$952(expr$1343.argument);
            if (expr$1343.argument.type === Syntax$860.ObjectPattern) {
                throwError$917({}, Messages$862.ObjectPatternAsSpread);
            }
        } else {
            if (expr$1343.type !== Syntax$860.MemberExpression && expr$1343.type !== Syntax$860.CallExpression && expr$1343.type !== Syntax$860.NewExpression) {
                throwError$917({}, Messages$862.InvalidLHSInAssignment);
            }
        }
    }
    function reinterpretAsDestructuredParameter$953(options$1348, expr$1349) {
        var i$1350, len$1351, property$1352, element$1353;
        if (expr$1349.type === Syntax$860.ObjectExpression) {
            expr$1349.type = Syntax$860.ObjectPattern;
            for (i$1350 = 0, len$1351 = expr$1349.properties.length; i$1350 < len$1351; i$1350 += 1) {
                property$1352 = expr$1349.properties[i$1350];
                if (property$1352.kind !== 'init') {
                    throwError$917({}, Messages$862.InvalidLHSInFormalsList);
                }
                reinterpretAsDestructuredParameter$953(options$1348, property$1352.value);
            }
        } else if (expr$1349.type === Syntax$860.ArrayExpression) {
            expr$1349.type = Syntax$860.ArrayPattern;
            for (i$1350 = 0, len$1351 = expr$1349.elements.length; i$1350 < len$1351; i$1350 += 1) {
                element$1353 = expr$1349.elements[i$1350];
                if (element$1353) {
                    reinterpretAsDestructuredParameter$953(options$1348, element$1353);
                }
            }
        } else if (expr$1349.type === Syntax$860.Identifier) {
            validateParam$991(options$1348, expr$1349, expr$1349.name);
        } else {
            if (expr$1349.type !== Syntax$860.MemberExpression) {
                throwError$917({}, Messages$862.InvalidLHSInFormalsList);
            }
        }
    }
    function reinterpretAsCoverFormalsList$954(expressions$1354) {
        var i$1355, len$1356, param$1357, params$1358, defaults$1359, defaultCount$1360, options$1361, rest$1362;
        params$1358 = [];
        defaults$1359 = [];
        defaultCount$1360 = 0;
        rest$1362 = null;
        options$1361 = { paramSet: {} };
        for (i$1355 = 0, len$1356 = expressions$1354.length; i$1355 < len$1356; i$1355 += 1) {
            param$1357 = expressions$1354[i$1355];
            if (param$1357.type === Syntax$860.Identifier) {
                params$1358.push(param$1357);
                defaults$1359.push(null);
                validateParam$991(options$1361, param$1357, param$1357.name);
            } else if (param$1357.type === Syntax$860.ObjectExpression || param$1357.type === Syntax$860.ArrayExpression) {
                reinterpretAsDestructuredParameter$953(options$1361, param$1357);
                params$1358.push(param$1357);
                defaults$1359.push(null);
            } else if (param$1357.type === Syntax$860.SpreadElement) {
                assert$883(i$1355 === len$1356 - 1, 'It is guaranteed that SpreadElement is last element by parseExpression');
                reinterpretAsDestructuredParameter$953(options$1361, param$1357.argument);
                rest$1362 = param$1357.argument;
            } else if (param$1357.type === Syntax$860.AssignmentExpression) {
                params$1358.push(param$1357.left);
                defaults$1359.push(param$1357.right);
                ++defaultCount$1360;
                validateParam$991(options$1361, param$1357.left, param$1357.left.name);
            } else {
                return null;
            }
        }
        if (options$1361.message === Messages$862.StrictParamDupe) {
            throwError$917(strict$867 ? options$1361.stricted : options$1361.firstRestricted, options$1361.message);
        }
        if (defaultCount$1360 === 0) {
            defaults$1359 = [];
        }
        return {
            params: params$1358,
            defaults: defaults$1359,
            rest: rest$1362,
            stricted: options$1361.stricted,
            firstRestricted: options$1361.firstRestricted,
            message: options$1361.message
        };
    }
    function parseArrowFunctionExpression$955(options$1363) {
        var previousStrict$1364, previousYieldAllowed$1365, body$1366;
        expect$920('=>');
        previousStrict$1364 = strict$867;
        previousYieldAllowed$1365 = state$881.yieldAllowed;
        state$881.yieldAllowed = false;
        body$1366 = parseConciseBody$989();
        if (strict$867 && options$1363.firstRestricted) {
            throwError$917(options$1363.firstRestricted, options$1363.message);
        }
        if (strict$867 && options$1363.stricted) {
            throwErrorTolerant$918(options$1363.stricted, options$1363.message);
        }
        strict$867 = previousStrict$1364;
        state$881.yieldAllowed = previousYieldAllowed$1365;
        return delegate$876.createArrowFunctionExpression(options$1363.params, options$1363.defaults, body$1366, options$1363.rest, body$1366.type !== Syntax$860.BlockStatement);
    }
    function parseAssignmentExpression$956() {
        var expr$1367, token$1368, params$1369, oldParenthesizedCount$1370;
        if (matchKeyword$923('yield')) {
            return parseYieldExpression$996();
        }
        oldParenthesizedCount$1370 = state$881.parenthesizedCount;
        if (match$922('(')) {
            token$1368 = lookahead2$915();
            if (token$1368.type === Token$857.Punctuator && token$1368.value === ')' || token$1368.value === '...') {
                params$1369 = parseParams$993();
                if (!match$922('=>')) {
                    throwUnexpected$919(lex$913());
                }
                return parseArrowFunctionExpression$955(params$1369);
            }
        }
        token$1368 = lookahead$879;
        expr$1367 = parseConditionalExpression$951();
        if (match$922('=>') && (state$881.parenthesizedCount === oldParenthesizedCount$1370 || state$881.parenthesizedCount === oldParenthesizedCount$1370 + 1)) {
            if (expr$1367.type === Syntax$860.Identifier) {
                params$1369 = reinterpretAsCoverFormalsList$954([expr$1367]);
            } else if (expr$1367.type === Syntax$860.SequenceExpression) {
                params$1369 = reinterpretAsCoverFormalsList$954(expr$1367.expressions);
            }
            if (params$1369) {
                return parseArrowFunctionExpression$955(params$1369);
            }
        }
        if (matchAssign$925()) {
            // 11.13.1
            if (strict$867 && expr$1367.type === Syntax$860.Identifier && isRestrictedWord$894(expr$1367.name)) {
                throwErrorTolerant$918(token$1368, Messages$862.StrictLHSAssignment);
            }
            // ES.next draf 11.13 Runtime Semantics step 1
            if (match$922('=') && (expr$1367.type === Syntax$860.ObjectExpression || expr$1367.type === Syntax$860.ArrayExpression)) {
                reinterpretAsAssignmentBindingPattern$952(expr$1367);
            } else if (!isLeftHandSide$927(expr$1367)) {
                throwError$917({}, Messages$862.InvalidLHSInAssignment);
            }
            expr$1367 = delegate$876.createAssignmentExpression(lex$913().value, expr$1367, parseAssignmentExpression$956());
        }
        return expr$1367;
    }
    // 11.14 Comma Operator
    function parseExpression$957() {
        var expr$1371, expressions$1372, sequence$1373, coverFormalsList$1374, spreadFound$1375, oldParenthesizedCount$1376;
        oldParenthesizedCount$1376 = state$881.parenthesizedCount;
        expr$1371 = parseAssignmentExpression$956();
        expressions$1372 = [expr$1371];
        if (match$922(',')) {
            while (streamIndex$878 < length$875) {
                if (!match$922(',')) {
                    break;
                }
                lex$913();
                expr$1371 = parseSpreadOrAssignmentExpression$940();
                expressions$1372.push(expr$1371);
                if (expr$1371.type === Syntax$860.SpreadElement) {
                    spreadFound$1375 = true;
                    if (!match$922(')')) {
                        throwError$917({}, Messages$862.ElementAfterSpreadElement);
                    }
                    break;
                }
            }
            sequence$1373 = delegate$876.createSequenceExpression(expressions$1372);
        }
        if (match$922('=>')) {
            // Do not allow nested parentheses on the LHS of the =>.
            if (state$881.parenthesizedCount === oldParenthesizedCount$1376 || state$881.parenthesizedCount === oldParenthesizedCount$1376 + 1) {
                expr$1371 = expr$1371.type === Syntax$860.SequenceExpression ? expr$1371.expressions : expressions$1372;
                coverFormalsList$1374 = reinterpretAsCoverFormalsList$954(expr$1371);
                if (coverFormalsList$1374) {
                    return parseArrowFunctionExpression$955(coverFormalsList$1374);
                }
            }
            throwUnexpected$919(lex$913());
        }
        if (spreadFound$1375 && lookahead2$915().value !== '=>') {
            throwError$917({}, Messages$862.IllegalSpread);
        }
        return sequence$1373 || expr$1371;
    }
    // 12.1 Block
    function parseStatementList$958() {
        var list$1377 = [], statement$1378;
        while (streamIndex$878 < length$875) {
            if (match$922('}')) {
                break;
            }
            statement$1378 = parseSourceElement$1003();
            if (typeof statement$1378 === 'undefined') {
                break;
            }
            list$1377.push(statement$1378);
        }
        return list$1377;
    }
    function parseBlock$959() {
        var block$1379;
        expect$920('{');
        block$1379 = parseStatementList$958();
        expect$920('}');
        return delegate$876.createBlockStatement(block$1379);
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$960() {
        var token$1380 = lookahead$879, resolvedIdent$1381;
        if (token$1380.type !== Token$857.Identifier) {
            throwUnexpected$919(token$1380);
        }
        resolvedIdent$1381 = expander$856.resolve(tokenStream$877[lookaheadIndex$880]);
        lex$913();
        return delegate$876.createIdentifier(resolvedIdent$1381);
    }
    function parseVariableDeclaration$961(kind$1382) {
        var id$1383, init$1384 = null;
        if (match$922('{')) {
            id$1383 = parseObjectInitialiser$934();
            reinterpretAsAssignmentBindingPattern$952(id$1383);
        } else if (match$922('[')) {
            id$1383 = parseArrayInitialiser$929();
            reinterpretAsAssignmentBindingPattern$952(id$1383);
        } else {
            id$1383 = state$881.allowKeyword ? parseNonComputedProperty$941() : parseVariableIdentifier$960();
            // 12.2.1
            if (strict$867 && isRestrictedWord$894(id$1383.name)) {
                throwErrorTolerant$918({}, Messages$862.StrictVarName);
            }
        }
        if (kind$1382 === 'const') {
            if (!match$922('=')) {
                throwError$917({}, Messages$862.NoUnintializedConst);
            }
            expect$920('=');
            init$1384 = parseAssignmentExpression$956();
        } else if (match$922('=')) {
            lex$913();
            init$1384 = parseAssignmentExpression$956();
        }
        return delegate$876.createVariableDeclarator(id$1383, init$1384);
    }
    function parseVariableDeclarationList$962(kind$1385) {
        var list$1386 = [];
        do {
            list$1386.push(parseVariableDeclaration$961(kind$1385));
            if (!match$922(',')) {
                break;
            }
            lex$913();
        } while (streamIndex$878 < length$875);
        return list$1386;
    }
    function parseVariableStatement$963() {
        var declarations$1387;
        expectKeyword$921('var');
        declarations$1387 = parseVariableDeclarationList$962();
        consumeSemicolon$926();
        return delegate$876.createVariableDeclaration(declarations$1387, 'var');
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$964(kind$1388) {
        var declarations$1389;
        expectKeyword$921(kind$1388);
        declarations$1389 = parseVariableDeclarationList$962(kind$1388);
        consumeSemicolon$926();
        return delegate$876.createVariableDeclaration(declarations$1389, kind$1388);
    }
    // http://wiki.ecmascript.org/doku.php?id=harmony:modules
    function parseModuleDeclaration$965() {
        var id$1390, src$1391, body$1392;
        lex$913();
        // 'module'
        if (peekLineTerminator$916()) {
            throwError$917({}, Messages$862.NewlineAfterModule);
        }
        switch (lookahead$879.type) {
        case Token$857.StringLiteral:
            id$1390 = parsePrimaryExpression$938();
            body$1392 = parseModuleBlock$1008();
            src$1391 = null;
            break;
        case Token$857.Identifier:
            id$1390 = parseVariableIdentifier$960();
            body$1392 = null;
            if (!matchContextualKeyword$924('from')) {
                throwUnexpected$919(lex$913());
            }
            lex$913();
            src$1391 = parsePrimaryExpression$938();
            if (src$1391.type !== Syntax$860.Literal) {
                throwError$917({}, Messages$862.InvalidModuleSpecifier);
            }
            break;
        }
        consumeSemicolon$926();
        return delegate$876.createModuleDeclaration(id$1390, src$1391, body$1392);
    }
    function parseExportBatchSpecifier$966() {
        expect$920('*');
        return delegate$876.createExportBatchSpecifier();
    }
    function parseExportSpecifier$967() {
        var id$1393, name$1394 = null;
        id$1393 = parseVariableIdentifier$960();
        if (matchContextualKeyword$924('as')) {
            lex$913();
            name$1394 = parseNonComputedProperty$941();
        }
        return delegate$876.createExportSpecifier(id$1393, name$1394);
    }
    function parseExportDeclaration$968() {
        var previousAllowKeyword$1395, decl$1396, def$1397, src$1398, specifiers$1399;
        expectKeyword$921('export');
        if (lookahead$879.type === Token$857.Keyword) {
            switch (lookahead$879.value) {
            case 'let':
            case 'const':
            case 'var':
            case 'class':
            case 'function':
                return delegate$876.createExportDeclaration(parseSourceElement$1003(), null, null);
            }
        }
        if (isIdentifierName$910(lookahead$879)) {
            previousAllowKeyword$1395 = state$881.allowKeyword;
            state$881.allowKeyword = true;
            decl$1396 = parseVariableDeclarationList$962('let');
            state$881.allowKeyword = previousAllowKeyword$1395;
            return delegate$876.createExportDeclaration(decl$1396, null, null);
        }
        specifiers$1399 = [];
        src$1398 = null;
        if (match$922('*')) {
            specifiers$1399.push(parseExportBatchSpecifier$966());
        } else {
            expect$920('{');
            do {
                specifiers$1399.push(parseExportSpecifier$967());
            } while (match$922(',') && lex$913());
            expect$920('}');
        }
        if (matchContextualKeyword$924('from')) {
            lex$913();
            src$1398 = parsePrimaryExpression$938();
            if (src$1398.type !== Syntax$860.Literal) {
                throwError$917({}, Messages$862.InvalidModuleSpecifier);
            }
        }
        consumeSemicolon$926();
        return delegate$876.createExportDeclaration(null, specifiers$1399, src$1398);
    }
    function parseImportDeclaration$969() {
        var specifiers$1400, kind$1401, src$1402;
        expectKeyword$921('import');
        specifiers$1400 = [];
        if (isIdentifierName$910(lookahead$879)) {
            kind$1401 = 'default';
            specifiers$1400.push(parseImportSpecifier$970());
            if (!matchContextualKeyword$924('from')) {
                throwError$917({}, Messages$862.NoFromAfterImport);
            }
            lex$913();
        } else if (match$922('{')) {
            kind$1401 = 'named';
            lex$913();
            do {
                specifiers$1400.push(parseImportSpecifier$970());
            } while (match$922(',') && lex$913());
            expect$920('}');
            if (!matchContextualKeyword$924('from')) {
                throwError$917({}, Messages$862.NoFromAfterImport);
            }
            lex$913();
        }
        src$1402 = parsePrimaryExpression$938();
        if (src$1402.type !== Syntax$860.Literal) {
            throwError$917({}, Messages$862.InvalidModuleSpecifier);
        }
        consumeSemicolon$926();
        return delegate$876.createImportDeclaration(specifiers$1400, kind$1401, src$1402);
    }
    function parseImportSpecifier$970() {
        var id$1403, name$1404 = null;
        id$1403 = parseNonComputedProperty$941();
        if (matchContextualKeyword$924('as')) {
            lex$913();
            name$1404 = parseVariableIdentifier$960();
        }
        return delegate$876.createImportSpecifier(id$1403, name$1404);
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$971() {
        expect$920(';');
        return delegate$876.createEmptyStatement();
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$972() {
        var expr$1405 = parseExpression$957();
        consumeSemicolon$926();
        return delegate$876.createExpressionStatement(expr$1405);
    }
    // 12.5 If statement
    function parseIfStatement$973() {
        var test$1406, consequent$1407, alternate$1408;
        expectKeyword$921('if');
        expect$920('(');
        test$1406 = parseExpression$957();
        expect$920(')');
        consequent$1407 = parseStatement$988();
        if (matchKeyword$923('else')) {
            lex$913();
            alternate$1408 = parseStatement$988();
        } else {
            alternate$1408 = null;
        }
        return delegate$876.createIfStatement(test$1406, consequent$1407, alternate$1408);
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$974() {
        var body$1409, test$1410, oldInIteration$1411;
        expectKeyword$921('do');
        oldInIteration$1411 = state$881.inIteration;
        state$881.inIteration = true;
        body$1409 = parseStatement$988();
        state$881.inIteration = oldInIteration$1411;
        expectKeyword$921('while');
        expect$920('(');
        test$1410 = parseExpression$957();
        expect$920(')');
        if (match$922(';')) {
            lex$913();
        }
        return delegate$876.createDoWhileStatement(body$1409, test$1410);
    }
    function parseWhileStatement$975() {
        var test$1412, body$1413, oldInIteration$1414;
        expectKeyword$921('while');
        expect$920('(');
        test$1412 = parseExpression$957();
        expect$920(')');
        oldInIteration$1414 = state$881.inIteration;
        state$881.inIteration = true;
        body$1413 = parseStatement$988();
        state$881.inIteration = oldInIteration$1414;
        return delegate$876.createWhileStatement(test$1412, body$1413);
    }
    function parseForVariableDeclaration$976() {
        var token$1415 = lex$913(), declarations$1416 = parseVariableDeclarationList$962();
        return delegate$876.createVariableDeclaration(declarations$1416, token$1415.value);
    }
    function parseForStatement$977(opts$1417) {
        var init$1418, test$1419, update$1420, left$1421, right$1422, body$1423, operator$1424, oldInIteration$1425;
        init$1418 = test$1419 = update$1420 = null;
        expectKeyword$921('for');
        // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
        if (matchContextualKeyword$924('each')) {
            throwError$917({}, Messages$862.EachNotAllowed);
        }
        expect$920('(');
        if (match$922(';')) {
            lex$913();
        } else {
            if (matchKeyword$923('var') || matchKeyword$923('let') || matchKeyword$923('const')) {
                state$881.allowIn = false;
                init$1418 = parseForVariableDeclaration$976();
                state$881.allowIn = true;
                if (init$1418.declarations.length === 1) {
                    if (matchKeyword$923('in') || matchContextualKeyword$924('of')) {
                        operator$1424 = lookahead$879;
                        if (!((operator$1424.value === 'in' || init$1418.kind !== 'var') && init$1418.declarations[0].init)) {
                            lex$913();
                            left$1421 = init$1418;
                            right$1422 = parseExpression$957();
                            init$1418 = null;
                        }
                    }
                }
            } else {
                state$881.allowIn = false;
                init$1418 = parseExpression$957();
                state$881.allowIn = true;
                if (matchContextualKeyword$924('of')) {
                    operator$1424 = lex$913();
                    left$1421 = init$1418;
                    right$1422 = parseExpression$957();
                    init$1418 = null;
                } else if (matchKeyword$923('in')) {
                    // LeftHandSideExpression
                    if (!isAssignableLeftHandSide$928(init$1418)) {
                        throwError$917({}, Messages$862.InvalidLHSInForIn);
                    }
                    operator$1424 = lex$913();
                    left$1421 = init$1418;
                    right$1422 = parseExpression$957();
                    init$1418 = null;
                }
            }
            if (typeof left$1421 === 'undefined') {
                expect$920(';');
            }
        }
        if (typeof left$1421 === 'undefined') {
            if (!match$922(';')) {
                test$1419 = parseExpression$957();
            }
            expect$920(';');
            if (!match$922(')')) {
                update$1420 = parseExpression$957();
            }
        }
        expect$920(')');
        oldInIteration$1425 = state$881.inIteration;
        state$881.inIteration = true;
        if (!(opts$1417 !== undefined && opts$1417.ignoreBody)) {
            body$1423 = parseStatement$988();
        }
        state$881.inIteration = oldInIteration$1425;
        if (typeof left$1421 === 'undefined') {
            return delegate$876.createForStatement(init$1418, test$1419, update$1420, body$1423);
        }
        if (operator$1424.value === 'in') {
            return delegate$876.createForInStatement(left$1421, right$1422, body$1423);
        }
        return delegate$876.createForOfStatement(left$1421, right$1422, body$1423);
    }
    // 12.7 The continue statement
    function parseContinueStatement$978() {
        var label$1426 = null, key$1427;
        expectKeyword$921('continue');
        // Optimize the most common form: 'continue;'.
        if (lookahead$879.value.charCodeAt(0) === 59) {
            lex$913();
            if (!state$881.inIteration) {
                throwError$917({}, Messages$862.IllegalContinue);
            }
            return delegate$876.createContinueStatement(null);
        }
        if (peekLineTerminator$916()) {
            if (!state$881.inIteration) {
                throwError$917({}, Messages$862.IllegalContinue);
            }
            return delegate$876.createContinueStatement(null);
        }
        if (lookahead$879.type === Token$857.Identifier) {
            label$1426 = parseVariableIdentifier$960();
            key$1427 = '$' + label$1426.name;
            if (!Object.prototype.hasOwnProperty.call(state$881.labelSet, key$1427)) {
                throwError$917({}, Messages$862.UnknownLabel, label$1426.name);
            }
        }
        consumeSemicolon$926();
        if (label$1426 === null && !state$881.inIteration) {
            throwError$917({}, Messages$862.IllegalContinue);
        }
        return delegate$876.createContinueStatement(label$1426);
    }
    // 12.8 The break statement
    function parseBreakStatement$979() {
        var label$1428 = null, key$1429;
        expectKeyword$921('break');
        // Catch the very common case first: immediately a semicolon (char #59).
        if (lookahead$879.value.charCodeAt(0) === 59) {
            lex$913();
            if (!(state$881.inIteration || state$881.inSwitch)) {
                throwError$917({}, Messages$862.IllegalBreak);
            }
            return delegate$876.createBreakStatement(null);
        }
        if (peekLineTerminator$916()) {
            if (!(state$881.inIteration || state$881.inSwitch)) {
                throwError$917({}, Messages$862.IllegalBreak);
            }
            return delegate$876.createBreakStatement(null);
        }
        if (lookahead$879.type === Token$857.Identifier) {
            label$1428 = parseVariableIdentifier$960();
            key$1429 = '$' + label$1428.name;
            if (!Object.prototype.hasOwnProperty.call(state$881.labelSet, key$1429)) {
                throwError$917({}, Messages$862.UnknownLabel, label$1428.name);
            }
        }
        consumeSemicolon$926();
        if (label$1428 === null && !(state$881.inIteration || state$881.inSwitch)) {
            throwError$917({}, Messages$862.IllegalBreak);
        }
        return delegate$876.createBreakStatement(label$1428);
    }
    // 12.9 The return statement
    function parseReturnStatement$980() {
        var argument$1430 = null;
        expectKeyword$921('return');
        if (!state$881.inFunctionBody) {
            throwErrorTolerant$918({}, Messages$862.IllegalReturn);
        }
        // 'return' followed by a space and an identifier is very common.
        if (isIdentifierStart$890(String(lookahead$879.value).charCodeAt(0))) {
            argument$1430 = parseExpression$957();
            consumeSemicolon$926();
            return delegate$876.createReturnStatement(argument$1430);
        }
        if (peekLineTerminator$916()) {
            return delegate$876.createReturnStatement(null);
        }
        if (!match$922(';')) {
            if (!match$922('}') && lookahead$879.type !== Token$857.EOF) {
                argument$1430 = parseExpression$957();
            }
        }
        consumeSemicolon$926();
        return delegate$876.createReturnStatement(argument$1430);
    }
    // 12.10 The with statement
    function parseWithStatement$981() {
        var object$1431, body$1432;
        if (strict$867) {
            throwErrorTolerant$918({}, Messages$862.StrictModeWith);
        }
        expectKeyword$921('with');
        expect$920('(');
        object$1431 = parseExpression$957();
        expect$920(')');
        body$1432 = parseStatement$988();
        return delegate$876.createWithStatement(object$1431, body$1432);
    }
    // 12.10 The swith statement
    function parseSwitchCase$982() {
        var test$1433, consequent$1434 = [], sourceElement$1435;
        if (matchKeyword$923('default')) {
            lex$913();
            test$1433 = null;
        } else {
            expectKeyword$921('case');
            test$1433 = parseExpression$957();
        }
        expect$920(':');
        while (streamIndex$878 < length$875) {
            if (match$922('}') || matchKeyword$923('default') || matchKeyword$923('case')) {
                break;
            }
            sourceElement$1435 = parseSourceElement$1003();
            if (typeof sourceElement$1435 === 'undefined') {
                break;
            }
            consequent$1434.push(sourceElement$1435);
        }
        return delegate$876.createSwitchCase(test$1433, consequent$1434);
    }
    function parseSwitchStatement$983() {
        var discriminant$1436, cases$1437, clause$1438, oldInSwitch$1439, defaultFound$1440;
        expectKeyword$921('switch');
        expect$920('(');
        discriminant$1436 = parseExpression$957();
        expect$920(')');
        expect$920('{');
        cases$1437 = [];
        if (match$922('}')) {
            lex$913();
            return delegate$876.createSwitchStatement(discriminant$1436, cases$1437);
        }
        oldInSwitch$1439 = state$881.inSwitch;
        state$881.inSwitch = true;
        defaultFound$1440 = false;
        while (streamIndex$878 < length$875) {
            if (match$922('}')) {
                break;
            }
            clause$1438 = parseSwitchCase$982();
            if (clause$1438.test === null) {
                if (defaultFound$1440) {
                    throwError$917({}, Messages$862.MultipleDefaultsInSwitch);
                }
                defaultFound$1440 = true;
            }
            cases$1437.push(clause$1438);
        }
        state$881.inSwitch = oldInSwitch$1439;
        expect$920('}');
        return delegate$876.createSwitchStatement(discriminant$1436, cases$1437);
    }
    // 12.13 The throw statement
    function parseThrowStatement$984() {
        var argument$1441;
        expectKeyword$921('throw');
        if (peekLineTerminator$916()) {
            throwError$917({}, Messages$862.NewlineAfterThrow);
        }
        argument$1441 = parseExpression$957();
        consumeSemicolon$926();
        return delegate$876.createThrowStatement(argument$1441);
    }
    // 12.14 The try statement
    function parseCatchClause$985() {
        var param$1442, body$1443;
        expectKeyword$921('catch');
        expect$920('(');
        if (match$922(')')) {
            throwUnexpected$919(lookahead$879);
        }
        param$1442 = parseExpression$957();
        // 12.14.1
        if (strict$867 && param$1442.type === Syntax$860.Identifier && isRestrictedWord$894(param$1442.name)) {
            throwErrorTolerant$918({}, Messages$862.StrictCatchVariable);
        }
        expect$920(')');
        body$1443 = parseBlock$959();
        return delegate$876.createCatchClause(param$1442, body$1443);
    }
    function parseTryStatement$986() {
        var block$1444, handlers$1445 = [], finalizer$1446 = null;
        expectKeyword$921('try');
        block$1444 = parseBlock$959();
        if (matchKeyword$923('catch')) {
            handlers$1445.push(parseCatchClause$985());
        }
        if (matchKeyword$923('finally')) {
            lex$913();
            finalizer$1446 = parseBlock$959();
        }
        if (handlers$1445.length === 0 && !finalizer$1446) {
            throwError$917({}, Messages$862.NoCatchOrFinally);
        }
        return delegate$876.createTryStatement(block$1444, [], handlers$1445, finalizer$1446);
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$987() {
        expectKeyword$921('debugger');
        consumeSemicolon$926();
        return delegate$876.createDebuggerStatement();
    }
    // 12 Statements
    function parseStatement$988() {
        var type$1447 = lookahead$879.type, expr$1448, labeledBody$1449, key$1450;
        if (type$1447 === Token$857.EOF) {
            throwUnexpected$919(lookahead$879);
        }
        if (type$1447 === Token$857.Punctuator) {
            switch (lookahead$879.value) {
            case ';':
                return parseEmptyStatement$971();
            case '{':
                return parseBlock$959();
            case '(':
                return parseExpressionStatement$972();
            default:
                break;
            }
        }
        if (type$1447 === Token$857.Keyword) {
            switch (lookahead$879.value) {
            case 'break':
                return parseBreakStatement$979();
            case 'continue':
                return parseContinueStatement$978();
            case 'debugger':
                return parseDebuggerStatement$987();
            case 'do':
                return parseDoWhileStatement$974();
            case 'for':
                return parseForStatement$977();
            case 'function':
                return parseFunctionDeclaration$994();
            case 'class':
                return parseClassDeclaration$1001();
            case 'if':
                return parseIfStatement$973();
            case 'return':
                return parseReturnStatement$980();
            case 'switch':
                return parseSwitchStatement$983();
            case 'throw':
                return parseThrowStatement$984();
            case 'try':
                return parseTryStatement$986();
            case 'var':
                return parseVariableStatement$963();
            case 'while':
                return parseWhileStatement$975();
            case 'with':
                return parseWithStatement$981();
            default:
                break;
            }
        }
        expr$1448 = parseExpression$957();
        // 12.12 Labelled Statements
        if (expr$1448.type === Syntax$860.Identifier && match$922(':')) {
            lex$913();
            key$1450 = '$' + expr$1448.name;
            if (Object.prototype.hasOwnProperty.call(state$881.labelSet, key$1450)) {
                throwError$917({}, Messages$862.Redeclaration, 'Label', expr$1448.name);
            }
            state$881.labelSet[key$1450] = true;
            labeledBody$1449 = parseStatement$988();
            delete state$881.labelSet[key$1450];
            return delegate$876.createLabeledStatement(expr$1448, labeledBody$1449);
        }
        consumeSemicolon$926();
        return delegate$876.createExpressionStatement(expr$1448);
    }
    // 13 Function Definition
    function parseConciseBody$989() {
        if (match$922('{')) {
            return parseFunctionSourceElements$990();
        }
        return parseAssignmentExpression$956();
    }
    function parseFunctionSourceElements$990() {
        var sourceElement$1451, sourceElements$1452 = [], token$1453, directive$1454, firstRestricted$1455, oldLabelSet$1456, oldInIteration$1457, oldInSwitch$1458, oldInFunctionBody$1459, oldParenthesizedCount$1460;
        expect$920('{');
        while (streamIndex$878 < length$875) {
            if (lookahead$879.type !== Token$857.StringLiteral) {
                break;
            }
            token$1453 = lookahead$879;
            sourceElement$1451 = parseSourceElement$1003();
            sourceElements$1452.push(sourceElement$1451);
            if (sourceElement$1451.expression.type !== Syntax$860.Literal) {
                // this is not directive
                break;
            }
            directive$1454 = token$1453.value;
            if (directive$1454 === 'use strict') {
                strict$867 = true;
                if (firstRestricted$1455) {
                    throwErrorTolerant$918(firstRestricted$1455, Messages$862.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1455 && token$1453.octal) {
                    firstRestricted$1455 = token$1453;
                }
            }
        }
        oldLabelSet$1456 = state$881.labelSet;
        oldInIteration$1457 = state$881.inIteration;
        oldInSwitch$1458 = state$881.inSwitch;
        oldInFunctionBody$1459 = state$881.inFunctionBody;
        oldParenthesizedCount$1460 = state$881.parenthesizedCount;
        state$881.labelSet = {};
        state$881.inIteration = false;
        state$881.inSwitch = false;
        state$881.inFunctionBody = true;
        state$881.parenthesizedCount = 0;
        while (streamIndex$878 < length$875) {
            if (match$922('}')) {
                break;
            }
            sourceElement$1451 = parseSourceElement$1003();
            if (typeof sourceElement$1451 === 'undefined') {
                break;
            }
            sourceElements$1452.push(sourceElement$1451);
        }
        expect$920('}');
        state$881.labelSet = oldLabelSet$1456;
        state$881.inIteration = oldInIteration$1457;
        state$881.inSwitch = oldInSwitch$1458;
        state$881.inFunctionBody = oldInFunctionBody$1459;
        state$881.parenthesizedCount = oldParenthesizedCount$1460;
        return delegate$876.createBlockStatement(sourceElements$1452);
    }
    function validateParam$991(options$1461, param$1462, name$1463) {
        var key$1464 = '$' + name$1463;
        if (strict$867) {
            if (isRestrictedWord$894(name$1463)) {
                options$1461.stricted = param$1462;
                options$1461.message = Messages$862.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options$1461.paramSet, key$1464)) {
                options$1461.stricted = param$1462;
                options$1461.message = Messages$862.StrictParamDupe;
            }
        } else if (!options$1461.firstRestricted) {
            if (isRestrictedWord$894(name$1463)) {
                options$1461.firstRestricted = param$1462;
                options$1461.message = Messages$862.StrictParamName;
            } else if (isStrictModeReservedWord$893(name$1463)) {
                options$1461.firstRestricted = param$1462;
                options$1461.message = Messages$862.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options$1461.paramSet, key$1464)) {
                options$1461.firstRestricted = param$1462;
                options$1461.message = Messages$862.StrictParamDupe;
            }
        }
        options$1461.paramSet[key$1464] = true;
    }
    function parseParam$992(options$1465) {
        var token$1466, rest$1467, param$1468, def$1469;
        token$1466 = lookahead$879;
        if (token$1466.value === '...') {
            token$1466 = lex$913();
            rest$1467 = true;
        }
        if (match$922('[')) {
            param$1468 = parseArrayInitialiser$929();
            reinterpretAsDestructuredParameter$953(options$1465, param$1468);
        } else if (match$922('{')) {
            if (rest$1467) {
                throwError$917({}, Messages$862.ObjectPatternAsRestParameter);
            }
            param$1468 = parseObjectInitialiser$934();
            reinterpretAsDestructuredParameter$953(options$1465, param$1468);
        } else {
            param$1468 = parseVariableIdentifier$960();
            validateParam$991(options$1465, token$1466, token$1466.value);
            if (match$922('=')) {
                if (rest$1467) {
                    throwErrorTolerant$918(lookahead$879, Messages$862.DefaultRestParameter);
                }
                lex$913();
                def$1469 = parseAssignmentExpression$956();
                ++options$1465.defaultCount;
            }
        }
        if (rest$1467) {
            if (!match$922(')')) {
                throwError$917({}, Messages$862.ParameterAfterRestParameter);
            }
            options$1465.rest = param$1468;
            return false;
        }
        options$1465.params.push(param$1468);
        options$1465.defaults.push(def$1469);
        return !match$922(')');
    }
    function parseParams$993(firstRestricted$1470) {
        var options$1471;
        options$1471 = {
            params: [],
            defaultCount: 0,
            defaults: [],
            rest: null,
            firstRestricted: firstRestricted$1470
        };
        expect$920('(');
        if (!match$922(')')) {
            options$1471.paramSet = {};
            while (streamIndex$878 < length$875) {
                if (!parseParam$992(options$1471)) {
                    break;
                }
                expect$920(',');
            }
        }
        expect$920(')');
        if (options$1471.defaultCount === 0) {
            options$1471.defaults = [];
        }
        return options$1471;
    }
    function parseFunctionDeclaration$994() {
        var id$1472, body$1473, token$1474, tmp$1475, firstRestricted$1476, message$1477, previousStrict$1478, previousYieldAllowed$1479, generator$1480, expression$1481;
        expectKeyword$921('function');
        generator$1480 = false;
        if (match$922('*')) {
            lex$913();
            generator$1480 = true;
        }
        token$1474 = lookahead$879;
        id$1472 = parseVariableIdentifier$960();
        if (strict$867) {
            if (isRestrictedWord$894(token$1474.value)) {
                throwErrorTolerant$918(token$1474, Messages$862.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$894(token$1474.value)) {
                firstRestricted$1476 = token$1474;
                message$1477 = Messages$862.StrictFunctionName;
            } else if (isStrictModeReservedWord$893(token$1474.value)) {
                firstRestricted$1476 = token$1474;
                message$1477 = Messages$862.StrictReservedWord;
            }
        }
        tmp$1475 = parseParams$993(firstRestricted$1476);
        firstRestricted$1476 = tmp$1475.firstRestricted;
        if (tmp$1475.message) {
            message$1477 = tmp$1475.message;
        }
        previousStrict$1478 = strict$867;
        previousYieldAllowed$1479 = state$881.yieldAllowed;
        state$881.yieldAllowed = generator$1480;
        // here we redo some work in order to set 'expression'
        expression$1481 = !match$922('{');
        body$1473 = parseConciseBody$989();
        if (strict$867 && firstRestricted$1476) {
            throwError$917(firstRestricted$1476, message$1477);
        }
        if (strict$867 && tmp$1475.stricted) {
            throwErrorTolerant$918(tmp$1475.stricted, message$1477);
        }
        if (state$881.yieldAllowed && !state$881.yieldFound) {
            throwErrorTolerant$918({}, Messages$862.NoYieldInGenerator);
        }
        strict$867 = previousStrict$1478;
        state$881.yieldAllowed = previousYieldAllowed$1479;
        return delegate$876.createFunctionDeclaration(id$1472, tmp$1475.params, tmp$1475.defaults, body$1473, tmp$1475.rest, generator$1480, expression$1481);
    }
    function parseFunctionExpression$995() {
        var token$1482, id$1483 = null, firstRestricted$1484, message$1485, tmp$1486, body$1487, previousStrict$1488, previousYieldAllowed$1489, generator$1490, expression$1491;
        expectKeyword$921('function');
        generator$1490 = false;
        if (match$922('*')) {
            lex$913();
            generator$1490 = true;
        }
        if (!match$922('(')) {
            token$1482 = lookahead$879;
            id$1483 = parseVariableIdentifier$960();
            if (strict$867) {
                if (isRestrictedWord$894(token$1482.value)) {
                    throwErrorTolerant$918(token$1482, Messages$862.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$894(token$1482.value)) {
                    firstRestricted$1484 = token$1482;
                    message$1485 = Messages$862.StrictFunctionName;
                } else if (isStrictModeReservedWord$893(token$1482.value)) {
                    firstRestricted$1484 = token$1482;
                    message$1485 = Messages$862.StrictReservedWord;
                }
            }
        }
        tmp$1486 = parseParams$993(firstRestricted$1484);
        firstRestricted$1484 = tmp$1486.firstRestricted;
        if (tmp$1486.message) {
            message$1485 = tmp$1486.message;
        }
        previousStrict$1488 = strict$867;
        previousYieldAllowed$1489 = state$881.yieldAllowed;
        state$881.yieldAllowed = generator$1490;
        // here we redo some work in order to set 'expression'
        expression$1491 = !match$922('{');
        body$1487 = parseConciseBody$989();
        if (strict$867 && firstRestricted$1484) {
            throwError$917(firstRestricted$1484, message$1485);
        }
        if (strict$867 && tmp$1486.stricted) {
            throwErrorTolerant$918(tmp$1486.stricted, message$1485);
        }
        if (state$881.yieldAllowed && !state$881.yieldFound) {
            throwErrorTolerant$918({}, Messages$862.NoYieldInGenerator);
        }
        strict$867 = previousStrict$1488;
        state$881.yieldAllowed = previousYieldAllowed$1489;
        return delegate$876.createFunctionExpression(id$1483, tmp$1486.params, tmp$1486.defaults, body$1487, tmp$1486.rest, generator$1490, expression$1491);
    }
    function parseYieldExpression$996() {
        var delegateFlag$1492, expr$1493, previousYieldAllowed$1494;
        expectKeyword$921('yield');
        if (!state$881.yieldAllowed) {
            throwErrorTolerant$918({}, Messages$862.IllegalYield);
        }
        delegateFlag$1492 = false;
        if (match$922('*')) {
            lex$913();
            delegateFlag$1492 = true;
        }
        // It is a Syntax Error if any AssignmentExpression Contains YieldExpression.
        previousYieldAllowed$1494 = state$881.yieldAllowed;
        state$881.yieldAllowed = false;
        expr$1493 = parseAssignmentExpression$956();
        state$881.yieldAllowed = previousYieldAllowed$1494;
        state$881.yieldFound = true;
        return delegate$876.createYieldExpression(expr$1493, delegateFlag$1492);
    }
    // 14 Classes
    function parseMethodDefinition$997(existingPropNames$1495) {
        var token$1496, key$1497, param$1498, propType$1499, isValidDuplicateProp$1500 = false;
        if (lookahead$879.value === 'static') {
            propType$1499 = ClassPropertyType$865.static;
            lex$913();
        } else {
            propType$1499 = ClassPropertyType$865.prototype;
        }
        if (match$922('*')) {
            lex$913();
            return delegate$876.createMethodDefinition(propType$1499, '', parseObjectPropertyKey$932(), parsePropertyMethodFunction$931({ generator: true }));
        }
        token$1496 = lookahead$879;
        key$1497 = parseObjectPropertyKey$932();
        if (token$1496.value === 'get' && !match$922('(')) {
            key$1497 = parseObjectPropertyKey$932();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a setter
            if (existingPropNames$1495[propType$1499].hasOwnProperty(key$1497.name)) {
                isValidDuplicateProp$1500 = existingPropNames$1495[propType$1499][key$1497.name].get === undefined && existingPropNames$1495[propType$1499][key$1497.name].data === undefined && existingPropNames$1495[propType$1499][key$1497.name].set !== undefined;
                if (!isValidDuplicateProp$1500) {
                    throwError$917(key$1497, Messages$862.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1495[propType$1499][key$1497.name] = {};
            }
            existingPropNames$1495[propType$1499][key$1497.name].get = true;
            expect$920('(');
            expect$920(')');
            return delegate$876.createMethodDefinition(propType$1499, 'get', key$1497, parsePropertyFunction$930({ generator: false }));
        }
        if (token$1496.value === 'set' && !match$922('(')) {
            key$1497 = parseObjectPropertyKey$932();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a getter
            if (existingPropNames$1495[propType$1499].hasOwnProperty(key$1497.name)) {
                isValidDuplicateProp$1500 = existingPropNames$1495[propType$1499][key$1497.name].set === undefined && existingPropNames$1495[propType$1499][key$1497.name].data === undefined && existingPropNames$1495[propType$1499][key$1497.name].get !== undefined;
                if (!isValidDuplicateProp$1500) {
                    throwError$917(key$1497, Messages$862.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames$1495[propType$1499][key$1497.name] = {};
            }
            existingPropNames$1495[propType$1499][key$1497.name].set = true;
            expect$920('(');
            token$1496 = lookahead$879;
            param$1498 = [parseVariableIdentifier$960()];
            expect$920(')');
            return delegate$876.createMethodDefinition(propType$1499, 'set', key$1497, parsePropertyFunction$930({
                params: param$1498,
                generator: false,
                name: token$1496
            }));
        }
        // It is a syntax error if any other properties have the same name as a
        // non-getter, non-setter method
        if (existingPropNames$1495[propType$1499].hasOwnProperty(key$1497.name)) {
            throwError$917(key$1497, Messages$862.IllegalDuplicateClassProperty);
        } else {
            existingPropNames$1495[propType$1499][key$1497.name] = {};
        }
        existingPropNames$1495[propType$1499][key$1497.name].data = true;
        return delegate$876.createMethodDefinition(propType$1499, '', key$1497, parsePropertyMethodFunction$931({ generator: false }));
    }
    function parseClassElement$998(existingProps$1501) {
        if (match$922(';')) {
            lex$913();
            return;
        }
        return parseMethodDefinition$997(existingProps$1501);
    }
    function parseClassBody$999() {
        var classElement$1502, classElements$1503 = [], existingProps$1504 = {};
        existingProps$1504[ClassPropertyType$865.static] = {};
        existingProps$1504[ClassPropertyType$865.prototype] = {};
        expect$920('{');
        while (streamIndex$878 < length$875) {
            if (match$922('}')) {
                break;
            }
            classElement$1502 = parseClassElement$998(existingProps$1504);
            if (typeof classElement$1502 !== 'undefined') {
                classElements$1503.push(classElement$1502);
            }
        }
        expect$920('}');
        return delegate$876.createClassBody(classElements$1503);
    }
    function parseClassExpression$1000() {
        var id$1505, previousYieldAllowed$1506, superClass$1507 = null;
        expectKeyword$921('class');
        if (!matchKeyword$923('extends') && !match$922('{')) {
            id$1505 = parseVariableIdentifier$960();
        }
        if (matchKeyword$923('extends')) {
            expectKeyword$921('extends');
            previousYieldAllowed$1506 = state$881.yieldAllowed;
            state$881.yieldAllowed = false;
            superClass$1507 = parseAssignmentExpression$956();
            state$881.yieldAllowed = previousYieldAllowed$1506;
        }
        return delegate$876.createClassExpression(id$1505, superClass$1507, parseClassBody$999());
    }
    function parseClassDeclaration$1001() {
        var id$1508, previousYieldAllowed$1509, superClass$1510 = null;
        expectKeyword$921('class');
        id$1508 = parseVariableIdentifier$960();
        if (matchKeyword$923('extends')) {
            expectKeyword$921('extends');
            previousYieldAllowed$1509 = state$881.yieldAllowed;
            state$881.yieldAllowed = false;
            superClass$1510 = parseAssignmentExpression$956();
            state$881.yieldAllowed = previousYieldAllowed$1509;
        }
        return delegate$876.createClassDeclaration(id$1508, superClass$1510, parseClassBody$999());
    }
    // 15 Program
    function matchModuleDeclaration$1002() {
        var id$1511;
        if (matchContextualKeyword$924('module')) {
            id$1511 = lookahead2$915();
            return id$1511.type === Token$857.StringLiteral || id$1511.type === Token$857.Identifier;
        }
        return false;
    }
    function parseSourceElement$1003() {
        if (lookahead$879.type === Token$857.Keyword) {
            switch (lookahead$879.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$964(lookahead$879.value);
            case 'function':
                return parseFunctionDeclaration$994();
            case 'export':
                return parseExportDeclaration$968();
            case 'import':
                return parseImportDeclaration$969();
            default:
                return parseStatement$988();
            }
        }
        if (matchModuleDeclaration$1002()) {
            throwError$917({}, Messages$862.NestedModule);
        }
        if (lookahead$879.type !== Token$857.EOF) {
            return parseStatement$988();
        }
    }
    function parseProgramElement$1004() {
        if (lookahead$879.type === Token$857.Keyword) {
            switch (lookahead$879.value) {
            case 'export':
                return parseExportDeclaration$968();
            case 'import':
                return parseImportDeclaration$969();
            }
        }
        if (matchModuleDeclaration$1002()) {
            return parseModuleDeclaration$965();
        }
        return parseSourceElement$1003();
    }
    function parseProgramElements$1005() {
        var sourceElement$1512, sourceElements$1513 = [], token$1514, directive$1515, firstRestricted$1516;
        while (streamIndex$878 < length$875) {
            token$1514 = lookahead$879;
            if (token$1514.type !== Token$857.StringLiteral) {
                break;
            }
            sourceElement$1512 = parseProgramElement$1004();
            sourceElements$1513.push(sourceElement$1512);
            if (sourceElement$1512.expression.type !== Syntax$860.Literal) {
                // this is not directive
                break;
            }
            directive$1515 = token$1514.value;
            if (directive$1515 === 'use strict') {
                strict$867 = true;
                if (firstRestricted$1516) {
                    throwErrorTolerant$918(firstRestricted$1516, Messages$862.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1516 && token$1514.octal) {
                    firstRestricted$1516 = token$1514;
                }
            }
        }
        while (streamIndex$878 < length$875) {
            sourceElement$1512 = parseProgramElement$1004();
            if (typeof sourceElement$1512 === 'undefined') {
                break;
            }
            sourceElements$1513.push(sourceElement$1512);
        }
        return sourceElements$1513;
    }
    function parseModuleElement$1006() {
        return parseSourceElement$1003();
    }
    function parseModuleElements$1007() {
        var list$1517 = [], statement$1518;
        while (streamIndex$878 < length$875) {
            if (match$922('}')) {
                break;
            }
            statement$1518 = parseModuleElement$1006();
            if (typeof statement$1518 === 'undefined') {
                break;
            }
            list$1517.push(statement$1518);
        }
        return list$1517;
    }
    function parseModuleBlock$1008() {
        var block$1519;
        expect$920('{');
        block$1519 = parseModuleElements$1007();
        expect$920('}');
        return delegate$876.createBlockStatement(block$1519);
    }
    function parseProgram$1009() {
        var body$1520;
        strict$867 = false;
        peek$914();
        body$1520 = parseProgramElements$1005();
        return delegate$876.createProgram(body$1520);
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$1010(type$1521, value$1522, start$1523, end$1524, loc$1525) {
        assert$883(typeof start$1523 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$882.comments.length > 0) {
            if (extra$882.comments[extra$882.comments.length - 1].range[1] > start$1523) {
                return;
            }
        }
        extra$882.comments.push({
            type: type$1521,
            value: value$1522,
            range: [
                start$1523,
                end$1524
            ],
            loc: loc$1525
        });
    }
    function scanComment$1011() {
        var comment$1526, ch$1527, loc$1528, start$1529, blockComment$1530, lineComment$1531;
        comment$1526 = '';
        blockComment$1530 = false;
        lineComment$1531 = false;
        while (index$868 < length$875) {
            ch$1527 = source$866[index$868];
            if (lineComment$1531) {
                ch$1527 = source$866[index$868++];
                if (isLineTerminator$889(ch$1527.charCodeAt(0))) {
                    loc$1528.end = {
                        line: lineNumber$869,
                        column: index$868 - lineStart$870 - 1
                    };
                    lineComment$1531 = false;
                    addComment$1010('Line', comment$1526, start$1529, index$868 - 1, loc$1528);
                    if (ch$1527 === '\r' && source$866[index$868] === '\n') {
                        ++index$868;
                    }
                    ++lineNumber$869;
                    lineStart$870 = index$868;
                    comment$1526 = '';
                } else if (index$868 >= length$875) {
                    lineComment$1531 = false;
                    comment$1526 += ch$1527;
                    loc$1528.end = {
                        line: lineNumber$869,
                        column: length$875 - lineStart$870
                    };
                    addComment$1010('Line', comment$1526, start$1529, length$875, loc$1528);
                } else {
                    comment$1526 += ch$1527;
                }
            } else if (blockComment$1530) {
                if (isLineTerminator$889(ch$1527.charCodeAt(0))) {
                    if (ch$1527 === '\r' && source$866[index$868 + 1] === '\n') {
                        ++index$868;
                        comment$1526 += '\r\n';
                    } else {
                        comment$1526 += ch$1527;
                    }
                    ++lineNumber$869;
                    ++index$868;
                    lineStart$870 = index$868;
                    if (index$868 >= length$875) {
                        throwError$917({}, Messages$862.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1527 = source$866[index$868++];
                    if (index$868 >= length$875) {
                        throwError$917({}, Messages$862.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1526 += ch$1527;
                    if (ch$1527 === '*') {
                        ch$1527 = source$866[index$868];
                        if (ch$1527 === '/') {
                            comment$1526 = comment$1526.substr(0, comment$1526.length - 1);
                            blockComment$1530 = false;
                            ++index$868;
                            loc$1528.end = {
                                line: lineNumber$869,
                                column: index$868 - lineStart$870
                            };
                            addComment$1010('Block', comment$1526, start$1529, index$868, loc$1528);
                            comment$1526 = '';
                        }
                    }
                }
            } else if (ch$1527 === '/') {
                ch$1527 = source$866[index$868 + 1];
                if (ch$1527 === '/') {
                    loc$1528 = {
                        start: {
                            line: lineNumber$869,
                            column: index$868 - lineStart$870
                        }
                    };
                    start$1529 = index$868;
                    index$868 += 2;
                    lineComment$1531 = true;
                    if (index$868 >= length$875) {
                        loc$1528.end = {
                            line: lineNumber$869,
                            column: index$868 - lineStart$870
                        };
                        lineComment$1531 = false;
                        addComment$1010('Line', comment$1526, start$1529, index$868, loc$1528);
                    }
                } else if (ch$1527 === '*') {
                    start$1529 = index$868;
                    index$868 += 2;
                    blockComment$1530 = true;
                    loc$1528 = {
                        start: {
                            line: lineNumber$869,
                            column: index$868 - lineStart$870 - 2
                        }
                    };
                    if (index$868 >= length$875) {
                        throwError$917({}, Messages$862.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$888(ch$1527.charCodeAt(0))) {
                ++index$868;
            } else if (isLineTerminator$889(ch$1527.charCodeAt(0))) {
                ++index$868;
                if (ch$1527 === '\r' && source$866[index$868] === '\n') {
                    ++index$868;
                }
                ++lineNumber$869;
                lineStart$870 = index$868;
            } else {
                break;
            }
        }
    }
    function filterCommentLocation$1012() {
        var i$1532, entry$1533, comment$1534, comments$1535 = [];
        for (i$1532 = 0; i$1532 < extra$882.comments.length; ++i$1532) {
            entry$1533 = extra$882.comments[i$1532];
            comment$1534 = {
                type: entry$1533.type,
                value: entry$1533.value
            };
            if (extra$882.range) {
                comment$1534.range = entry$1533.range;
            }
            if (extra$882.loc) {
                comment$1534.loc = entry$1533.loc;
            }
            comments$1535.push(comment$1534);
        }
        extra$882.comments = comments$1535;
    }
    function collectToken$1013() {
        var start$1536, loc$1537, token$1538, range$1539, value$1540;
        skipComment$896();
        start$1536 = index$868;
        loc$1537 = {
            start: {
                line: lineNumber$869,
                column: index$868 - lineStart$870
            }
        };
        token$1538 = extra$882.advance();
        loc$1537.end = {
            line: lineNumber$869,
            column: index$868 - lineStart$870
        };
        if (token$1538.type !== Token$857.EOF) {
            range$1539 = [
                token$1538.range[0],
                token$1538.range[1]
            ];
            value$1540 = source$866.slice(token$1538.range[0], token$1538.range[1]);
            extra$882.tokens.push({
                type: TokenName$858[token$1538.type],
                value: value$1540,
                range: range$1539,
                loc: loc$1537
            });
        }
        return token$1538;
    }
    function collectRegex$1014() {
        var pos$1541, loc$1542, regex$1543, token$1544;
        skipComment$896();
        pos$1541 = index$868;
        loc$1542 = {
            start: {
                line: lineNumber$869,
                column: index$868 - lineStart$870
            }
        };
        regex$1543 = extra$882.scanRegExp();
        loc$1542.end = {
            line: lineNumber$869,
            column: index$868 - lineStart$870
        };
        if (!extra$882.tokenize) {
            // Pop the previous token, which is likely '/' or '/='
            if (extra$882.tokens.length > 0) {
                token$1544 = extra$882.tokens[extra$882.tokens.length - 1];
                if (token$1544.range[0] === pos$1541 && token$1544.type === 'Punctuator') {
                    if (token$1544.value === '/' || token$1544.value === '/=') {
                        extra$882.tokens.pop();
                    }
                }
            }
            extra$882.tokens.push({
                type: 'RegularExpression',
                value: regex$1543.literal,
                range: [
                    pos$1541,
                    index$868
                ],
                loc: loc$1542
            });
        }
        return regex$1543;
    }
    function filterTokenLocation$1015() {
        var i$1545, entry$1546, token$1547, tokens$1548 = [];
        for (i$1545 = 0; i$1545 < extra$882.tokens.length; ++i$1545) {
            entry$1546 = extra$882.tokens[i$1545];
            token$1547 = {
                type: entry$1546.type,
                value: entry$1546.value
            };
            if (extra$882.range) {
                token$1547.range = entry$1546.range;
            }
            if (extra$882.loc) {
                token$1547.loc = entry$1546.loc;
            }
            tokens$1548.push(token$1547);
        }
        extra$882.tokens = tokens$1548;
    }
    function LocationMarker$1016() {
        var sm_index$1549 = lookahead$879 ? lookahead$879.sm_range[0] : 0;
        var sm_lineStart$1550 = lookahead$879 ? lookahead$879.sm_lineStart : 0;
        var sm_lineNumber$1551 = lookahead$879 ? lookahead$879.sm_lineNumber : 1;
        this.range = [
            sm_index$1549,
            sm_index$1549
        ];
        this.loc = {
            start: {
                line: sm_lineNumber$1551,
                column: sm_index$1549 - sm_lineStart$1550
            },
            end: {
                line: sm_lineNumber$1551,
                column: sm_index$1549 - sm_lineStart$1550
            }
        };
    }
    LocationMarker$1016.prototype = {
        constructor: LocationMarker$1016,
        end: function () {
            this.range[1] = sm_index$874;
            this.loc.end.line = sm_lineNumber$871;
            this.loc.end.column = sm_index$874 - sm_lineStart$872;
        },
        applyGroup: function (node$1552) {
            if (extra$882.range) {
                node$1552.groupRange = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$882.loc) {
                node$1552.groupLoc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1552 = delegate$876.postProcess(node$1552);
            }
        },
        apply: function (node$1553) {
            var nodeType$1554 = typeof node$1553;
            assert$883(nodeType$1554 === 'object', 'Applying location marker to an unexpected node type: ' + nodeType$1554);
            if (extra$882.range) {
                node$1553.range = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra$882.loc) {
                node$1553.loc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node$1553 = delegate$876.postProcess(node$1553);
            }
        }
    };
    function createLocationMarker$1017() {
        return new LocationMarker$1016();
    }
    function trackGroupExpression$1018() {
        var marker$1555, expr$1556;
        marker$1555 = createLocationMarker$1017();
        expect$920('(');
        ++state$881.parenthesizedCount;
        expr$1556 = parseExpression$957();
        expect$920(')');
        marker$1555.end();
        marker$1555.applyGroup(expr$1556);
        return expr$1556;
    }
    function trackLeftHandSideExpression$1019() {
        var marker$1557, expr$1558;
        // skipComment();
        marker$1557 = createLocationMarker$1017();
        expr$1558 = matchKeyword$923('new') ? parseNewExpression$944() : parsePrimaryExpression$938();
        while (match$922('.') || match$922('[') || lookahead$879.type === Token$857.Template) {
            if (match$922('[')) {
                expr$1558 = delegate$876.createMemberExpression('[', expr$1558, parseComputedMember$943());
                marker$1557.end();
                marker$1557.apply(expr$1558);
            } else if (match$922('.')) {
                expr$1558 = delegate$876.createMemberExpression('.', expr$1558, parseNonComputedMember$942());
                marker$1557.end();
                marker$1557.apply(expr$1558);
            } else {
                expr$1558 = delegate$876.createTaggedTemplateExpression(expr$1558, parseTemplateLiteral$936());
                marker$1557.end();
                marker$1557.apply(expr$1558);
            }
        }
        return expr$1558;
    }
    function trackLeftHandSideExpressionAllowCall$1020() {
        var marker$1559, expr$1560, args$1561;
        // skipComment();
        marker$1559 = createLocationMarker$1017();
        expr$1560 = matchKeyword$923('new') ? parseNewExpression$944() : parsePrimaryExpression$938();
        while (match$922('.') || match$922('[') || match$922('(') || lookahead$879.type === Token$857.Template) {
            if (match$922('(')) {
                args$1561 = parseArguments$939();
                expr$1560 = delegate$876.createCallExpression(expr$1560, args$1561);
                marker$1559.end();
                marker$1559.apply(expr$1560);
            } else if (match$922('[')) {
                expr$1560 = delegate$876.createMemberExpression('[', expr$1560, parseComputedMember$943());
                marker$1559.end();
                marker$1559.apply(expr$1560);
            } else if (match$922('.')) {
                expr$1560 = delegate$876.createMemberExpression('.', expr$1560, parseNonComputedMember$942());
                marker$1559.end();
                marker$1559.apply(expr$1560);
            } else {
                expr$1560 = delegate$876.createTaggedTemplateExpression(expr$1560, parseTemplateLiteral$936());
                marker$1559.end();
                marker$1559.apply(expr$1560);
            }
        }
        return expr$1560;
    }
    function filterGroup$1021(node$1562) {
        var n$1563, i$1564, entry$1565;
        n$1563 = Object.prototype.toString.apply(node$1562) === '[object Array]' ? [] : {};
        for (i$1564 in node$1562) {
            if (node$1562.hasOwnProperty(i$1564) && i$1564 !== 'groupRange' && i$1564 !== 'groupLoc') {
                entry$1565 = node$1562[i$1564];
                if (entry$1565 === null || typeof entry$1565 !== 'object' || entry$1565 instanceof RegExp) {
                    n$1563[i$1564] = entry$1565;
                } else {
                    n$1563[i$1564] = filterGroup$1021(entry$1565);
                }
            }
        }
        return n$1563;
    }
    function wrapTrackingFunction$1022(range$1566, loc$1567) {
        return function (parseFunction$1568) {
            function isBinary$1569(node$1571) {
                return node$1571.type === Syntax$860.LogicalExpression || node$1571.type === Syntax$860.BinaryExpression;
            }
            function visit$1570(node$1572) {
                var start$1573, end$1574;
                if (isBinary$1569(node$1572.left)) {
                    visit$1570(node$1572.left);
                }
                if (isBinary$1569(node$1572.right)) {
                    visit$1570(node$1572.right);
                }
                if (range$1566) {
                    if (node$1572.left.groupRange || node$1572.right.groupRange) {
                        start$1573 = node$1572.left.groupRange ? node$1572.left.groupRange[0] : node$1572.left.range[0];
                        end$1574 = node$1572.right.groupRange ? node$1572.right.groupRange[1] : node$1572.right.range[1];
                        node$1572.range = [
                            start$1573,
                            end$1574
                        ];
                    } else if (typeof node$1572.range === 'undefined') {
                        start$1573 = node$1572.left.range[0];
                        end$1574 = node$1572.right.range[1];
                        node$1572.range = [
                            start$1573,
                            end$1574
                        ];
                    }
                }
                if (loc$1567) {
                    if (node$1572.left.groupLoc || node$1572.right.groupLoc) {
                        start$1573 = node$1572.left.groupLoc ? node$1572.left.groupLoc.start : node$1572.left.loc.start;
                        end$1574 = node$1572.right.groupLoc ? node$1572.right.groupLoc.end : node$1572.right.loc.end;
                        node$1572.loc = {
                            start: start$1573,
                            end: end$1574
                        };
                        node$1572 = delegate$876.postProcess(node$1572);
                    } else if (typeof node$1572.loc === 'undefined') {
                        node$1572.loc = {
                            start: node$1572.left.loc.start,
                            end: node$1572.right.loc.end
                        };
                        node$1572 = delegate$876.postProcess(node$1572);
                    }
                }
            }
            return function () {
                var marker$1575, node$1576, curr$1577 = lookahead$879;
                marker$1575 = createLocationMarker$1017();
                node$1576 = parseFunction$1568.apply(null, arguments);
                marker$1575.end();
                if (node$1576.type !== Syntax$860.Program) {
                    if (curr$1577.leadingComments) {
                        node$1576.leadingComments = curr$1577.leadingComments;
                    }
                    if (curr$1577.trailingComments) {
                        node$1576.trailingComments = curr$1577.trailingComments;
                    }
                }
                if (range$1566 && typeof node$1576.range === 'undefined') {
                    marker$1575.apply(node$1576);
                }
                if (loc$1567 && typeof node$1576.loc === 'undefined') {
                    marker$1575.apply(node$1576);
                }
                if (isBinary$1569(node$1576)) {
                    visit$1570(node$1576);
                }
                return node$1576;
            };
        };
    }
    function patch$1023() {
        var wrapTracking$1578;
        if (extra$882.comments) {
            extra$882.skipComment = skipComment$896;
            skipComment$896 = scanComment$1011;
        }
        if (extra$882.range || extra$882.loc) {
            extra$882.parseGroupExpression = parseGroupExpression$937;
            extra$882.parseLeftHandSideExpression = parseLeftHandSideExpression$946;
            extra$882.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall$945;
            parseGroupExpression$937 = trackGroupExpression$1018;
            parseLeftHandSideExpression$946 = trackLeftHandSideExpression$1019;
            parseLeftHandSideExpressionAllowCall$945 = trackLeftHandSideExpressionAllowCall$1020;
            wrapTracking$1578 = wrapTrackingFunction$1022(extra$882.range, extra$882.loc);
            extra$882.parseArrayInitialiser = parseArrayInitialiser$929;
            extra$882.parseAssignmentExpression = parseAssignmentExpression$956;
            extra$882.parseBinaryExpression = parseBinaryExpression$950;
            extra$882.parseBlock = parseBlock$959;
            extra$882.parseFunctionSourceElements = parseFunctionSourceElements$990;
            extra$882.parseCatchClause = parseCatchClause$985;
            extra$882.parseComputedMember = parseComputedMember$943;
            extra$882.parseConditionalExpression = parseConditionalExpression$951;
            extra$882.parseConstLetDeclaration = parseConstLetDeclaration$964;
            extra$882.parseExportBatchSpecifier = parseExportBatchSpecifier$966;
            extra$882.parseExportDeclaration = parseExportDeclaration$968;
            extra$882.parseExportSpecifier = parseExportSpecifier$967;
            extra$882.parseExpression = parseExpression$957;
            extra$882.parseForVariableDeclaration = parseForVariableDeclaration$976;
            extra$882.parseFunctionDeclaration = parseFunctionDeclaration$994;
            extra$882.parseFunctionExpression = parseFunctionExpression$995;
            extra$882.parseParams = parseParams$993;
            extra$882.parseImportDeclaration = parseImportDeclaration$969;
            extra$882.parseImportSpecifier = parseImportSpecifier$970;
            extra$882.parseModuleDeclaration = parseModuleDeclaration$965;
            extra$882.parseModuleBlock = parseModuleBlock$1008;
            extra$882.parseNewExpression = parseNewExpression$944;
            extra$882.parseNonComputedProperty = parseNonComputedProperty$941;
            extra$882.parseObjectInitialiser = parseObjectInitialiser$934;
            extra$882.parseObjectProperty = parseObjectProperty$933;
            extra$882.parseObjectPropertyKey = parseObjectPropertyKey$932;
            extra$882.parsePostfixExpression = parsePostfixExpression$947;
            extra$882.parsePrimaryExpression = parsePrimaryExpression$938;
            extra$882.parseProgram = parseProgram$1009;
            extra$882.parsePropertyFunction = parsePropertyFunction$930;
            extra$882.parseSpreadOrAssignmentExpression = parseSpreadOrAssignmentExpression$940;
            extra$882.parseTemplateElement = parseTemplateElement$935;
            extra$882.parseTemplateLiteral = parseTemplateLiteral$936;
            extra$882.parseStatement = parseStatement$988;
            extra$882.parseSwitchCase = parseSwitchCase$982;
            extra$882.parseUnaryExpression = parseUnaryExpression$948;
            extra$882.parseVariableDeclaration = parseVariableDeclaration$961;
            extra$882.parseVariableIdentifier = parseVariableIdentifier$960;
            extra$882.parseMethodDefinition = parseMethodDefinition$997;
            extra$882.parseClassDeclaration = parseClassDeclaration$1001;
            extra$882.parseClassExpression = parseClassExpression$1000;
            extra$882.parseClassBody = parseClassBody$999;
            parseArrayInitialiser$929 = wrapTracking$1578(extra$882.parseArrayInitialiser);
            parseAssignmentExpression$956 = wrapTracking$1578(extra$882.parseAssignmentExpression);
            parseBinaryExpression$950 = wrapTracking$1578(extra$882.parseBinaryExpression);
            parseBlock$959 = wrapTracking$1578(extra$882.parseBlock);
            parseFunctionSourceElements$990 = wrapTracking$1578(extra$882.parseFunctionSourceElements);
            parseCatchClause$985 = wrapTracking$1578(extra$882.parseCatchClause);
            parseComputedMember$943 = wrapTracking$1578(extra$882.parseComputedMember);
            parseConditionalExpression$951 = wrapTracking$1578(extra$882.parseConditionalExpression);
            parseConstLetDeclaration$964 = wrapTracking$1578(extra$882.parseConstLetDeclaration);
            parseExportBatchSpecifier$966 = wrapTracking$1578(parseExportBatchSpecifier$966);
            parseExportDeclaration$968 = wrapTracking$1578(parseExportDeclaration$968);
            parseExportSpecifier$967 = wrapTracking$1578(parseExportSpecifier$967);
            parseExpression$957 = wrapTracking$1578(extra$882.parseExpression);
            parseForVariableDeclaration$976 = wrapTracking$1578(extra$882.parseForVariableDeclaration);
            parseFunctionDeclaration$994 = wrapTracking$1578(extra$882.parseFunctionDeclaration);
            parseFunctionExpression$995 = wrapTracking$1578(extra$882.parseFunctionExpression);
            parseParams$993 = wrapTracking$1578(extra$882.parseParams);
            parseImportDeclaration$969 = wrapTracking$1578(extra$882.parseImportDeclaration);
            parseImportSpecifier$970 = wrapTracking$1578(extra$882.parseImportSpecifier);
            parseModuleDeclaration$965 = wrapTracking$1578(extra$882.parseModuleDeclaration);
            parseModuleBlock$1008 = wrapTracking$1578(extra$882.parseModuleBlock);
            parseLeftHandSideExpression$946 = wrapTracking$1578(parseLeftHandSideExpression$946);
            parseNewExpression$944 = wrapTracking$1578(extra$882.parseNewExpression);
            parseNonComputedProperty$941 = wrapTracking$1578(extra$882.parseNonComputedProperty);
            parseObjectInitialiser$934 = wrapTracking$1578(extra$882.parseObjectInitialiser);
            parseObjectProperty$933 = wrapTracking$1578(extra$882.parseObjectProperty);
            parseObjectPropertyKey$932 = wrapTracking$1578(extra$882.parseObjectPropertyKey);
            parsePostfixExpression$947 = wrapTracking$1578(extra$882.parsePostfixExpression);
            parsePrimaryExpression$938 = wrapTracking$1578(extra$882.parsePrimaryExpression);
            parseProgram$1009 = wrapTracking$1578(extra$882.parseProgram);
            parsePropertyFunction$930 = wrapTracking$1578(extra$882.parsePropertyFunction);
            parseTemplateElement$935 = wrapTracking$1578(extra$882.parseTemplateElement);
            parseTemplateLiteral$936 = wrapTracking$1578(extra$882.parseTemplateLiteral);
            parseSpreadOrAssignmentExpression$940 = wrapTracking$1578(extra$882.parseSpreadOrAssignmentExpression);
            parseStatement$988 = wrapTracking$1578(extra$882.parseStatement);
            parseSwitchCase$982 = wrapTracking$1578(extra$882.parseSwitchCase);
            parseUnaryExpression$948 = wrapTracking$1578(extra$882.parseUnaryExpression);
            parseVariableDeclaration$961 = wrapTracking$1578(extra$882.parseVariableDeclaration);
            parseVariableIdentifier$960 = wrapTracking$1578(extra$882.parseVariableIdentifier);
            parseMethodDefinition$997 = wrapTracking$1578(extra$882.parseMethodDefinition);
            parseClassDeclaration$1001 = wrapTracking$1578(extra$882.parseClassDeclaration);
            parseClassExpression$1000 = wrapTracking$1578(extra$882.parseClassExpression);
            parseClassBody$999 = wrapTracking$1578(extra$882.parseClassBody);
        }
        if (typeof extra$882.tokens !== 'undefined') {
            extra$882.advance = advance$912;
            extra$882.scanRegExp = scanRegExp$909;
            advance$912 = collectToken$1013;
            scanRegExp$909 = collectRegex$1014;
        }
    }
    function unpatch$1024() {
        if (typeof extra$882.skipComment === 'function') {
            skipComment$896 = extra$882.skipComment;
        }
        if (extra$882.range || extra$882.loc) {
            parseArrayInitialiser$929 = extra$882.parseArrayInitialiser;
            parseAssignmentExpression$956 = extra$882.parseAssignmentExpression;
            parseBinaryExpression$950 = extra$882.parseBinaryExpression;
            parseBlock$959 = extra$882.parseBlock;
            parseFunctionSourceElements$990 = extra$882.parseFunctionSourceElements;
            parseCatchClause$985 = extra$882.parseCatchClause;
            parseComputedMember$943 = extra$882.parseComputedMember;
            parseConditionalExpression$951 = extra$882.parseConditionalExpression;
            parseConstLetDeclaration$964 = extra$882.parseConstLetDeclaration;
            parseExportBatchSpecifier$966 = extra$882.parseExportBatchSpecifier;
            parseExportDeclaration$968 = extra$882.parseExportDeclaration;
            parseExportSpecifier$967 = extra$882.parseExportSpecifier;
            parseExpression$957 = extra$882.parseExpression;
            parseForVariableDeclaration$976 = extra$882.parseForVariableDeclaration;
            parseFunctionDeclaration$994 = extra$882.parseFunctionDeclaration;
            parseFunctionExpression$995 = extra$882.parseFunctionExpression;
            parseImportDeclaration$969 = extra$882.parseImportDeclaration;
            parseImportSpecifier$970 = extra$882.parseImportSpecifier;
            parseGroupExpression$937 = extra$882.parseGroupExpression;
            parseLeftHandSideExpression$946 = extra$882.parseLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall$945 = extra$882.parseLeftHandSideExpressionAllowCall;
            parseModuleDeclaration$965 = extra$882.parseModuleDeclaration;
            parseModuleBlock$1008 = extra$882.parseModuleBlock;
            parseNewExpression$944 = extra$882.parseNewExpression;
            parseNonComputedProperty$941 = extra$882.parseNonComputedProperty;
            parseObjectInitialiser$934 = extra$882.parseObjectInitialiser;
            parseObjectProperty$933 = extra$882.parseObjectProperty;
            parseObjectPropertyKey$932 = extra$882.parseObjectPropertyKey;
            parsePostfixExpression$947 = extra$882.parsePostfixExpression;
            parsePrimaryExpression$938 = extra$882.parsePrimaryExpression;
            parseProgram$1009 = extra$882.parseProgram;
            parsePropertyFunction$930 = extra$882.parsePropertyFunction;
            parseTemplateElement$935 = extra$882.parseTemplateElement;
            parseTemplateLiteral$936 = extra$882.parseTemplateLiteral;
            parseSpreadOrAssignmentExpression$940 = extra$882.parseSpreadOrAssignmentExpression;
            parseStatement$988 = extra$882.parseStatement;
            parseSwitchCase$982 = extra$882.parseSwitchCase;
            parseUnaryExpression$948 = extra$882.parseUnaryExpression;
            parseVariableDeclaration$961 = extra$882.parseVariableDeclaration;
            parseVariableIdentifier$960 = extra$882.parseVariableIdentifier;
            parseMethodDefinition$997 = extra$882.parseMethodDefinition;
            parseClassDeclaration$1001 = extra$882.parseClassDeclaration;
            parseClassExpression$1000 = extra$882.parseClassExpression;
            parseClassBody$999 = extra$882.parseClassBody;
        }
        if (typeof extra$882.scanRegExp === 'function') {
            advance$912 = extra$882.advance;
            scanRegExp$909 = extra$882.scanRegExp;
        }
    }
    // This is used to modify the delegate.
    function extend$1025(object$1579, properties$1580) {
        var entry$1581, result$1582 = {};
        for (entry$1581 in object$1579) {
            if (object$1579.hasOwnProperty(entry$1581)) {
                result$1582[entry$1581] = object$1579[entry$1581];
            }
        }
        for (entry$1581 in properties$1580) {
            if (properties$1580.hasOwnProperty(entry$1581)) {
                result$1582[entry$1581] = properties$1580[entry$1581];
            }
        }
        return result$1582;
    }
    function tokenize$1026(code$1583, options$1584) {
        var toString$1585, token$1586, tokens$1587;
        toString$1585 = String;
        if (typeof code$1583 !== 'string' && !(code$1583 instanceof String)) {
            code$1583 = toString$1585(code$1583);
        }
        delegate$876 = SyntaxTreeDelegate$864;
        source$866 = code$1583;
        index$868 = 0;
        lineNumber$869 = source$866.length > 0 ? 1 : 0;
        lineStart$870 = 0;
        length$875 = source$866.length;
        lookahead$879 = null;
        state$881 = {
            allowKeyword: true,
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$882 = {};
        // Options matching.
        options$1584 = options$1584 || {};
        // Of course we collect tokens here.
        options$1584.tokens = true;
        extra$882.tokens = [];
        extra$882.tokenize = true;
        // The following two fields are necessary to compute the Regex tokens.
        extra$882.openParenToken = -1;
        extra$882.openCurlyToken = -1;
        extra$882.range = typeof options$1584.range === 'boolean' && options$1584.range;
        extra$882.loc = typeof options$1584.loc === 'boolean' && options$1584.loc;
        if (typeof options$1584.comment === 'boolean' && options$1584.comment) {
            extra$882.comments = [];
        }
        if (typeof options$1584.tolerant === 'boolean' && options$1584.tolerant) {
            extra$882.errors = [];
        }
        if (length$875 > 0) {
            if (typeof source$866[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1583 instanceof String) {
                    source$866 = code$1583.valueOf();
                }
            }
        }
        patch$1023();
        try {
            peek$914();
            if (lookahead$879.type === Token$857.EOF) {
                return extra$882.tokens;
            }
            token$1586 = lex$913();
            while (lookahead$879.type !== Token$857.EOF) {
                try {
                    token$1586 = lex$913();
                } catch (lexError$1588) {
                    token$1586 = lookahead$879;
                    if (extra$882.errors) {
                        extra$882.errors.push(lexError$1588);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError$1588;
                    }
                }
            }
            filterTokenLocation$1015();
            tokens$1587 = extra$882.tokens;
            if (typeof extra$882.comments !== 'undefined') {
                filterCommentLocation$1012();
                tokens$1587.comments = extra$882.comments;
            }
            if (typeof extra$882.errors !== 'undefined') {
                tokens$1587.errors = extra$882.errors;
            }
        } catch (e$1589) {
            throw e$1589;
        } finally {
            unpatch$1024();
            extra$882 = {};
        }
        return tokens$1587;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$1027(toks$1590, start$1591, inExprDelim$1592, parentIsBlock$1593) {
        var assignOps$1594 = [
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
        var binaryOps$1595 = [
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
        var unaryOps$1596 = [
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
        function back$1597(n$1598) {
            var idx$1599 = toks$1590.length - n$1598 > 0 ? toks$1590.length - n$1598 : 0;
            return toks$1590[idx$1599];
        }
        if (inExprDelim$1592 && toks$1590.length - (start$1591 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1597(start$1591 + 2).value === ':' && parentIsBlock$1593) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$884(back$1597(start$1591 + 2).value, unaryOps$1596.concat(binaryOps$1595).concat(assignOps$1594))) {
            // ... + {...}
            return false;
        } else if (back$1597(start$1591 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1600 = typeof back$1597(start$1591 + 1).startLineNumber !== 'undefined' ? back$1597(start$1591 + 1).startLineNumber : back$1597(start$1591 + 1).lineNumber;
            if (back$1597(start$1591 + 2).lineNumber !== currLineNumber$1600) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$884(back$1597(start$1591 + 2).value, [
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
    function readToken$1028(toks$1601, inExprDelim$1602, parentIsBlock$1603) {
        var delimiters$1604 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1605 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1606 = toks$1601.length - 1;
        var comments$1607, commentsLen$1608 = extra$882.comments.length;
        function back$1609(n$1613) {
            var idx$1614 = toks$1601.length - n$1613 > 0 ? toks$1601.length - n$1613 : 0;
            return toks$1601[idx$1614];
        }
        function attachComments$1610(token$1615) {
            if (comments$1607) {
                token$1615.leadingComments = comments$1607;
            }
            return token$1615;
        }
        function _advance$1611() {
            return attachComments$1610(advance$912());
        }
        function _scanRegExp$1612() {
            return attachComments$1610(scanRegExp$909());
        }
        skipComment$896();
        if (extra$882.comments.length > commentsLen$1608) {
            comments$1607 = extra$882.comments.slice(commentsLen$1608);
        }
        if (isIn$884(source$866[index$868], delimiters$1604)) {
            return attachComments$1610(readDelim$1029(toks$1601, inExprDelim$1602, parentIsBlock$1603));
        }
        if (source$866[index$868] === '/') {
            var prev$1616 = back$1609(1);
            if (prev$1616) {
                if (prev$1616.value === '()') {
                    if (isIn$884(back$1609(2).value, parenIdents$1605)) {
                        // ... if (...) / ...
                        return _scanRegExp$1612();
                    }
                    // ... (...) / ...
                    return _advance$1611();
                }
                if (prev$1616.value === '{}') {
                    if (blockAllowed$1027(toks$1601, 0, inExprDelim$1602, parentIsBlock$1603)) {
                        if (back$1609(2).value === '()') {
                            // named function
                            if (back$1609(4).value === 'function') {
                                if (!blockAllowed$1027(toks$1601, 3, inExprDelim$1602, parentIsBlock$1603)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1611();
                                }
                                if (toks$1601.length - 5 <= 0 && inExprDelim$1602) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1611();
                                }
                            }
                            // unnamed function
                            if (back$1609(3).value === 'function') {
                                if (!blockAllowed$1027(toks$1601, 2, inExprDelim$1602, parentIsBlock$1603)) {
                                    // new function (...) {...} / ...
                                    return _advance$1611();
                                }
                                if (toks$1601.length - 4 <= 0 && inExprDelim$1602) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1611();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1612();
                    } else {
                        // ... + {...} / ...
                        return _advance$1611();
                    }
                }
                if (prev$1616.type === Token$857.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1612();
                }
                if (isKeyword$895(prev$1616.value)) {
                    // typeof /...
                    return _scanRegExp$1612();
                }
                return _advance$1611();
            }
            return _scanRegExp$1612();
        }
        return _advance$1611();
    }
    function readDelim$1029(toks$1617, inExprDelim$1618, parentIsBlock$1619) {
        var startDelim$1620 = advance$912(), matchDelim$1621 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1622 = [];
        var delimiters$1623 = [
                '(',
                '{',
                '['
            ];
        assert$883(delimiters$1623.indexOf(startDelim$1620.value) !== -1, 'Need to begin at the delimiter');
        var token$1624 = startDelim$1620;
        var startLineNumber$1625 = token$1624.lineNumber;
        var startLineStart$1626 = token$1624.lineStart;
        var startRange$1627 = token$1624.range;
        var delimToken$1628 = {};
        delimToken$1628.type = Token$857.Delimiter;
        delimToken$1628.value = startDelim$1620.value + matchDelim$1621[startDelim$1620.value];
        delimToken$1628.startLineNumber = startLineNumber$1625;
        delimToken$1628.startLineStart = startLineStart$1626;
        delimToken$1628.startRange = startRange$1627;
        var delimIsBlock$1629 = false;
        if (startDelim$1620.value === '{') {
            delimIsBlock$1629 = blockAllowed$1027(toks$1617.concat(delimToken$1628), 0, inExprDelim$1618, parentIsBlock$1619);
        }
        while (index$868 <= length$875) {
            token$1624 = readToken$1028(inner$1622, startDelim$1620.value === '(' || startDelim$1620.value === '[', delimIsBlock$1629);
            if (token$1624.type === Token$857.Punctuator && token$1624.value === matchDelim$1621[startDelim$1620.value]) {
                if (token$1624.leadingComments) {
                    delimToken$1628.trailingComments = token$1624.leadingComments;
                }
                break;
            } else if (token$1624.type === Token$857.EOF) {
                throwError$917({}, Messages$862.UnexpectedEOS);
            } else {
                inner$1622.push(token$1624);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$868 >= length$875 && matchDelim$1621[startDelim$1620.value] !== source$866[length$875 - 1]) {
            throwError$917({}, Messages$862.UnexpectedEOS);
        }
        var endLineNumber$1630 = token$1624.lineNumber;
        var endLineStart$1631 = token$1624.lineStart;
        var endRange$1632 = token$1624.range;
        delimToken$1628.inner = inner$1622;
        delimToken$1628.endLineNumber = endLineNumber$1630;
        delimToken$1628.endLineStart = endLineStart$1631;
        delimToken$1628.endRange = endRange$1632;
        return delimToken$1628;
    }
    // (Str) -> [...CSyntax]
    function read$1030(code$1633) {
        var token$1634, tokenTree$1635 = [];
        extra$882 = {};
        extra$882.comments = [];
        patch$1023();
        source$866 = code$1633;
        index$868 = 0;
        lineNumber$869 = source$866.length > 0 ? 1 : 0;
        lineStart$870 = 0;
        length$875 = source$866.length;
        state$881 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$868 < length$875) {
            tokenTree$1635.push(readToken$1028(tokenTree$1635, false, false));
        }
        var last$1636 = tokenTree$1635[tokenTree$1635.length - 1];
        if (last$1636 && last$1636.type !== Token$857.EOF) {
            tokenTree$1635.push({
                type: Token$857.EOF,
                value: '',
                lineNumber: last$1636.lineNumber,
                lineStart: last$1636.lineStart,
                range: [
                    index$868,
                    index$868
                ]
            });
        }
        return expander$856.tokensToSyntax(tokenTree$1635);
    }
    function parse$1031(code$1637, options$1638) {
        var program$1639, toString$1640;
        extra$882 = {};
        // given an array of tokens instead of a string
        if (Array.isArray(code$1637)) {
            tokenStream$877 = code$1637;
            length$875 = tokenStream$877.length;
            lineNumber$869 = tokenStream$877.length > 0 ? 1 : 0;
            source$866 = undefined;
        } else {
            toString$1640 = String;
            if (typeof code$1637 !== 'string' && !(code$1637 instanceof String)) {
                code$1637 = toString$1640(code$1637);
            }
            source$866 = code$1637;
            length$875 = source$866.length;
            lineNumber$869 = source$866.length > 0 ? 1 : 0;
        }
        delegate$876 = SyntaxTreeDelegate$864;
        streamIndex$878 = -1;
        index$868 = 0;
        lineStart$870 = 0;
        sm_lineStart$872 = 0;
        sm_lineNumber$871 = lineNumber$869;
        sm_index$874 = 0;
        sm_range$873 = [
            0,
            0
        ];
        lookahead$879 = null;
        state$881 = {
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
        if (typeof options$1638 !== 'undefined') {
            extra$882.range = typeof options$1638.range === 'boolean' && options$1638.range;
            extra$882.loc = typeof options$1638.loc === 'boolean' && options$1638.loc;
            if (extra$882.loc && options$1638.source !== null && options$1638.source !== undefined) {
                delegate$876 = extend$1025(delegate$876, {
                    'postProcess': function (node$1641) {
                        node$1641.loc.source = toString$1640(options$1638.source);
                        return node$1641;
                    }
                });
            }
            if (typeof options$1638.tokens === 'boolean' && options$1638.tokens) {
                extra$882.tokens = [];
            }
            if (typeof options$1638.comment === 'boolean' && options$1638.comment) {
                extra$882.comments = [];
            }
            if (typeof options$1638.tolerant === 'boolean' && options$1638.tolerant) {
                extra$882.errors = [];
            }
        }
        if (length$875 > 0) {
            if (source$866 && typeof source$866[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code$1637 instanceof String) {
                    source$866 = code$1637.valueOf();
                }
            }
        }
        extra$882 = { loc: true };
        patch$1023();
        try {
            program$1639 = parseProgram$1009();
            if (typeof extra$882.comments !== 'undefined') {
                filterCommentLocation$1012();
                program$1639.comments = extra$882.comments;
            }
            if (typeof extra$882.tokens !== 'undefined') {
                filterTokenLocation$1015();
                program$1639.tokens = extra$882.tokens;
            }
            if (typeof extra$882.errors !== 'undefined') {
                program$1639.errors = extra$882.errors;
            }
            if (extra$882.range || extra$882.loc) {
                program$1639.body = filterGroup$1021(program$1639.body);
            }
        } catch (e$1642) {
            throw e$1642;
        } finally {
            unpatch$1024();
            extra$882 = {};
        }
        return program$1639;
    }
    exports$855.tokenize = tokenize$1026;
    exports$855.read = read$1030;
    exports$855.Token = Token$857;
    exports$855.parse = parse$1031;
    // Deep copy.
    exports$855.Syntax = function () {
        var name$1643, types$1644 = {};
        if (typeof Object.create === 'function') {
            types$1644 = Object.create(null);
        }
        for (name$1643 in Syntax$860) {
            if (Syntax$860.hasOwnProperty(name$1643)) {
                types$1644[name$1643] = Syntax$860[name$1643];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1644);
        }
        return types$1644;
    }();
}));
//# sourceMappingURL=parser.js.map