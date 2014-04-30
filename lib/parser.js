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
(function (root, factory) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory);
    } else if (typeof exports !== 'undefined') {
        factory(exports, require('./expander'));
    } else {
        factory(root.esprima = {});
    }
}(this, function (exports$2, expander) {
    'use strict';
    var Token, TokenName, FnExprTokens, Syntax, PropertyKind, Messages, Regex, SyntaxTreeDelegate, ClassPropertyType, source, strict, index, lineNumber, lineStart, sm_lineNumber, sm_lineStart, sm_range, sm_index, length, delegate, tokenStream, streamIndex, lookahead, lookaheadIndex, state, extra;
    Token = {
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
    TokenName = {};
    TokenName[Token.BooleanLiteral] = 'Boolean';
    TokenName[Token.EOF] = '<end>';
    TokenName[Token.Identifier] = 'Identifier';
    TokenName[Token.Keyword] = 'Keyword';
    TokenName[Token.NullLiteral] = 'Null';
    TokenName[Token.NumericLiteral] = 'Numeric';
    TokenName[Token.Punctuator] = 'Punctuator';
    TokenName[Token.StringLiteral] = 'String';
    TokenName[Token.RegularExpression] = 'RegularExpression';
    TokenName[Token.Delimiter] = 'Delimiter';
    // A function following one of those tokens is an expression.
    FnExprTokens = [
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
    Syntax = {
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
    PropertyKind = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    ClassPropertyType = {
        'static': 'static',
        prototype: 'prototype'
    };
    // Error messages should be identical to V8.
    Messages = {
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
    Regex = {
        NonAsciiIdentifierStart: new RegExp('[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F0\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]'),
        NonAsciiIdentifierPart: new RegExp('[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0\u08A2-\u08AC\u08E4-\u08FE\u0900-\u0963\u0966-\u096F\u0971-\u0977\u0979-\u097F\u0981-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C01-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58\u0C59\u0C60-\u0C63\u0C66-\u0C6F\u0C82\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D02\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D60-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F0\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191C\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1D00-\u1DE6\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA697\uA69F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A\uAA7B\uAA80-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE26\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert(condition, message) {
        if (!condition) {
            throw new Error('ASSERT: ' + message);
        }
    }
    function isIn(el, list) {
        return list.indexOf(el) !== -1;
    }
    function isDecimalDigit(ch) {
        return ch >= 48 && ch <= 57;
    }    // 0..9
    function isHexDigit(ch) {
        return '0123456789abcdefABCDEF'.indexOf(ch) >= 0;
    }
    function isOctalDigit(ch) {
        return '01234567'.indexOf(ch) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace(ch) {
        return ch === 32 || ch === 9 || ch === 11 || ch === 12 || ch === 160 || ch >= 5760 && '\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\uFEFF'.indexOf(String.fromCharCode(ch)) > 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator(ch) {
        return ch === 10 || ch === 13 || ch === 8232 || ch === 8233;
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart(ch) {
        return ch === 36 || ch === 95 || ch >= 65 && ch <= 90 || ch >= 97 && ch <= 122 || ch === 92 || ch >= 128 && Regex.NonAsciiIdentifierStart.test(String.fromCharCode(ch));
    }
    function isIdentifierPart(ch) {
        return ch === 36 || ch === 95 || ch >= 65 && ch <= 90 || ch >= 97 && ch <= 122 || ch >= 48 && ch <= 57 || ch === 92 || ch >= 128 && Regex.NonAsciiIdentifierPart.test(String.fromCharCode(ch));
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord(id) {
        switch (id) {
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
    function isStrictModeReservedWord(id) {
        switch (id) {
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
    function isRestrictedWord(id) {
        return id === 'eval' || id === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword(id) {
        if (strict && isStrictModeReservedWord(id)) {
            return true;
        }
        // 'const' is specialized as Keyword in V8.
        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
        // Some others are from future reserved words.
        switch (id.length) {
        case 2:
            return id === 'if' || id === 'in' || id === 'do';
        case 3:
            return id === 'var' || id === 'for' || id === 'new' || id === 'try' || id === 'let';
        case 4:
            return id === 'this' || id === 'else' || id === 'case' || id === 'void' || id === 'with' || id === 'enum';
        case 5:
            return id === 'while' || id === 'break' || id === 'catch' || id === 'throw' || id === 'const' || id === 'yield' || id === 'class' || id === 'super';
        case 6:
            return id === 'return' || id === 'typeof' || id === 'delete' || id === 'switch' || id === 'export' || id === 'import';
        case 7:
            return id === 'default' || id === 'finally' || id === 'extends';
        case 8:
            return id === 'function' || id === 'continue' || id === 'debugger';
        case 10:
            return id === 'instanceof';
        default:
            return false;
        }
    }
    // 7.4 Comments
    function skipComment() {
        var ch, blockComment, lineComment;
        blockComment = false;
        lineComment = false;
        while (index < length) {
            ch = source.charCodeAt(index);
            if (lineComment) {
                ++index;
                if (isLineTerminator(ch)) {
                    lineComment = false;
                    if (ch === 13 && source.charCodeAt(index) === 10) {
                        ++index;
                    }
                    ++lineNumber;
                    lineStart = index;
                }
            } else if (blockComment) {
                if (isLineTerminator(ch)) {
                    if (ch === 13 && source.charCodeAt(index + 1) === 10) {
                        ++index;
                    }
                    ++lineNumber;
                    ++index;
                    lineStart = index;
                    if (index >= length) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch = source.charCodeAt(index++);
                    if (index >= length) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                    // Block comment ends with '*/' (char #42, char #47).
                    if (ch === 42) {
                        ch = source.charCodeAt(index);
                        if (ch === 47) {
                            ++index;
                            blockComment = false;
                        }
                    }
                }
            } else if (ch === 47) {
                ch = source.charCodeAt(index + 1);
                // Line comment starts with '//' (char #47, char #47).
                if (ch === 47) {
                    index += 2;
                    lineComment = true;
                } else if (ch === 42) {
                    // Block comment starts with '/*' (char #47, char #42).
                    index += 2;
                    blockComment = true;
                    if (index >= length) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace(ch)) {
                ++index;
            } else if (isLineTerminator(ch)) {
                ++index;
                if (ch === 13 && source.charCodeAt(index) === 10) {
                    ++index;
                }
                ++lineNumber;
                lineStart = index;
            } else {
                break;
            }
        }
    }
    function scanHexEscape(prefix) {
        var i, len, ch, code = 0;
        len = prefix === 'u' ? 4 : 2;
        for (i = 0; i < len; ++i) {
            if (index < length && isHexDigit(source[index])) {
                ch = source[index++];
                code = code * 16 + '0123456789abcdef'.indexOf(ch.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code);
    }
    function scanUnicodeCodePointEscape() {
        var ch, code, cu1, cu2;
        ch = source[index];
        code = 0;
        // At least, one hex digit is required.
        if (ch === '}') {
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }
        while (index < length) {
            ch = source[index++];
            if (!isHexDigit(ch)) {
                break;
            }
            code = code * 16 + '0123456789abcdef'.indexOf(ch.toLowerCase());
        }
        if (code > 1114111 || ch !== '}') {
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }
        // UTF-16 Encoding
        if (code <= 65535) {
            return String.fromCharCode(code);
        }
        cu1 = (code - 65536 >> 10) + 55296;
        cu2 = (code - 65536 & 1023) + 56320;
        return String.fromCharCode(cu1, cu2);
    }
    function getEscapedIdentifier() {
        var ch, id;
        ch = source.charCodeAt(index++);
        id = String.fromCharCode(ch);
        // '\u' (char #92, char #117) denotes an escaped character.
        if (ch === 92) {
            if (source.charCodeAt(index) !== 117) {
                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
            }
            ++index;
            ch = scanHexEscape('u');
            if (!ch || ch === '\\' || !isIdentifierStart(ch.charCodeAt(0))) {
                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
            }
            id = ch;
        }
        while (index < length) {
            ch = source.charCodeAt(index);
            if (!isIdentifierPart(ch)) {
                break;
            }
            ++index;
            id += String.fromCharCode(ch);
            // '\u' (char #92, char #117) denotes an escaped character.
            if (ch === 92) {
                id = id.substr(0, id.length - 1);
                if (source.charCodeAt(index) !== 117) {
                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                }
                ++index;
                ch = scanHexEscape('u');
                if (!ch || ch === '\\' || !isIdentifierPart(ch.charCodeAt(0))) {
                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                }
                id += ch;
            }
        }
        return id;
    }
    function getIdentifier() {
        var start, ch;
        start = index++;
        while (index < length) {
            ch = source.charCodeAt(index);
            if (ch === 92) {
                // Blackslash (char #92) marks Unicode escape sequence.
                index = start;
                return getEscapedIdentifier();
            }
            if (isIdentifierPart(ch)) {
                ++index;
            } else {
                break;
            }
        }
        return source.slice(start, index);
    }
    function scanIdentifier() {
        var start, id, type;
        start = index;
        // Backslash (char #92) starts an escaped character.
        id = source.charCodeAt(index) === 92 ? getEscapedIdentifier() : getIdentifier();
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id.length === 1) {
            type = Token.Identifier;
        } else if (isKeyword(id)) {
            type = Token.Keyword;
        } else if (id === 'null') {
            type = Token.NullLiteral;
        } else if (id === 'true' || id === 'false') {
            type = Token.BooleanLiteral;
        } else {
            type = Token.Identifier;
        }
        return {
            type: type,
            value: id,
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [
                start,
                index
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator() {
        var start = index, code = source.charCodeAt(index), code2, ch1 = source[index], ch2, ch3, ch4;
        switch (code) {
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
            ++index;
            if (extra.tokenize) {
                if (code === 40) {
                    extra.openParenToken = extra.tokens.length;
                } else if (code === 123) {
                    extra.openCurlyToken = extra.tokens.length;
                }
            }
            return {
                type: Token.Punctuator,
                value: String.fromCharCode(code),
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [
                    start,
                    index
                ]
            };
        default:
            code2 = source.charCodeAt(index + 1);
            // '=' (char #61) marks an assignment or comparison operator.
            if (code2 === 61) {
                switch (code) {
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
                    index += 2;
                    return {
                        type: Token.Punctuator,
                        value: String.fromCharCode(code) + String.fromCharCode(code2),
                        lineNumber: lineNumber,
                        lineStart: lineStart,
                        range: [
                            start,
                            index
                        ]
                    };
                case 33:
                // !
                case 61:
                    // =
                    index += 2;
                    // !== and ===
                    if (source.charCodeAt(index) === 61) {
                        ++index;
                    }
                    return {
                        type: Token.Punctuator,
                        value: source.slice(start, index),
                        lineNumber: lineNumber,
                        lineStart: lineStart,
                        range: [
                            start,
                            index
                        ]
                    };
                default:
                    break;
                }
            }
            break;
        }
        // Peek more characters.
        ch2 = source[index + 1];
        ch3 = source[index + 2];
        ch4 = source[index + 3];
        // 4-character punctuator: >>>=
        if (ch1 === '>' && ch2 === '>' && ch3 === '>') {
            if (ch4 === '=') {
                index += 4;
                return {
                    type: Token.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber,
                    lineStart: lineStart,
                    range: [
                        start,
                        index
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1 === '>' && ch2 === '>' && ch3 === '>') {
            index += 3;
            return {
                type: Token.Punctuator,
                value: '>>>',
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [
                    start,
                    index
                ]
            };
        }
        if (ch1 === '<' && ch2 === '<' && ch3 === '=') {
            index += 3;
            return {
                type: Token.Punctuator,
                value: '<<=',
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [
                    start,
                    index
                ]
            };
        }
        if (ch1 === '>' && ch2 === '>' && ch3 === '=') {
            index += 3;
            return {
                type: Token.Punctuator,
                value: '>>=',
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [
                    start,
                    index
                ]
            };
        }
        if (ch1 === '.' && ch2 === '.' && ch3 === '.') {
            index += 3;
            return {
                type: Token.Punctuator,
                value: '...',
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [
                    start,
                    index
                ]
            };
        }
        // Other 2-character punctuators: ++ -- << >> && ||
        if (ch1 === ch2 && '+-<>&|'.indexOf(ch1) >= 0) {
            index += 2;
            return {
                type: Token.Punctuator,
                value: ch1 + ch2,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [
                    start,
                    index
                ]
            };
        }
        if (ch1 === '=' && ch2 === '>') {
            index += 2;
            return {
                type: Token.Punctuator,
                value: '=>',
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [
                    start,
                    index
                ]
            };
        }
        if ('<>=!+-*%&|^/'.indexOf(ch1) >= 0) {
            ++index;
            return {
                type: Token.Punctuator,
                value: ch1,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [
                    start,
                    index
                ]
            };
        }
        if (ch1 === '.') {
            ++index;
            return {
                type: Token.Punctuator,
                value: ch1,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [
                    start,
                    index
                ]
            };
        }
        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
    }
    // 7.8.3 Numeric Literals
    function scanHexLiteral(start) {
        var number = '';
        while (index < length) {
            if (!isHexDigit(source[index])) {
                break;
            }
            number += source[index++];
        }
        if (number.length === 0) {
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart(source.charCodeAt(index))) {
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token.NumericLiteral,
            value: parseInt('0x' + number, 16),
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [
                start,
                index
            ]
        };
    }
    function scanOctalLiteral(prefix, start) {
        var number, octal;
        if (isOctalDigit(prefix)) {
            octal = true;
            number = '0' + source[index++];
        } else {
            octal = false;
            ++index;
            number = '';
        }
        while (index < length) {
            if (!isOctalDigit(source[index])) {
                break;
            }
            number += source[index++];
        }
        if (!octal && number.length === 0) {
            // only 0o or 0O
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }
        if (isIdentifierStart(source.charCodeAt(index)) || isDecimalDigit(source.charCodeAt(index))) {
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token.NumericLiteral,
            value: parseInt(number, 8),
            octal: octal,
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [
                start,
                index
            ]
        };
    }
    function scanNumericLiteral() {
        var number, start, ch, octal;
        ch = source[index];
        assert(isDecimalDigit(ch.charCodeAt(0)) || ch === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start = index;
        number = '';
        if (ch !== '.') {
            number = source[index++];
            ch = source[index];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if (number === '0') {
                if (ch === 'x' || ch === 'X') {
                    ++index;
                    return scanHexLiteral(start);
                }
                if (ch === 'b' || ch === 'B') {
                    ++index;
                    number = '';
                    while (index < length) {
                        ch = source[index];
                        if (ch !== '0' && ch !== '1') {
                            break;
                        }
                        number += source[index++];
                    }
                    if (number.length === 0) {
                        // only 0b or 0B
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index < length) {
                        ch = source.charCodeAt(index);
                        if (isIdentifierStart(ch) || isDecimalDigit(ch)) {
                            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token.NumericLiteral,
                        value: parseInt(number, 2),
                        lineNumber: lineNumber,
                        lineStart: lineStart,
                        range: [
                            start,
                            index
                        ]
                    };
                }
                if (ch === 'o' || ch === 'O' || isOctalDigit(ch)) {
                    return scanOctalLiteral(ch, start);
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (ch && isDecimalDigit(ch.charCodeAt(0))) {
                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (isDecimalDigit(source.charCodeAt(index))) {
                number += source[index++];
            }
            ch = source[index];
        }
        if (ch === '.') {
            number += source[index++];
            while (isDecimalDigit(source.charCodeAt(index))) {
                number += source[index++];
            }
            ch = source[index];
        }
        if (ch === 'e' || ch === 'E') {
            number += source[index++];
            ch = source[index];
            if (ch === '+' || ch === '-') {
                number += source[index++];
            }
            if (isDecimalDigit(source.charCodeAt(index))) {
                while (isDecimalDigit(source.charCodeAt(index))) {
                    number += source[index++];
                }
            } else {
                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (isIdentifierStart(source.charCodeAt(index))) {
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token.NumericLiteral,
            value: parseFloat(number),
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [
                start,
                index
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral() {
        var str = '', quote, start, ch, code, unescaped, restore, octal = false;
        quote = source[index];
        assert(quote === '\'' || quote === '"', 'String literal must starts with a quote');
        start = index;
        ++index;
        while (index < length) {
            ch = source[index++];
            if (ch === quote) {
                quote = '';
                break;
            } else if (ch === '\\') {
                ch = source[index++];
                if (!ch || !isLineTerminator(ch.charCodeAt(0))) {
                    switch (ch) {
                    case 'n':
                        str += '\n';
                        break;
                    case 'r':
                        str += '\r';
                        break;
                    case 't':
                        str += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source[index] === '{') {
                            ++index;
                            str += scanUnicodeCodePointEscape();
                        } else {
                            restore = index;
                            unescaped = scanHexEscape(ch);
                            if (unescaped) {
                                str += unescaped;
                            } else {
                                index = restore;
                                str += ch;
                            }
                        }
                        break;
                    case 'b':
                        str += '\b';
                        break;
                    case 'f':
                        str += '\f';
                        break;
                    case 'v':
                        str += '\x0B';
                        break;
                    default:
                        if (isOctalDigit(ch)) {
                            code = '01234567'.indexOf(ch);
                            // \0 is not octal escape sequence
                            if (code !== 0) {
                                octal = true;
                            }
                            if (index < length && isOctalDigit(source[index])) {
                                octal = true;
                                code = code * 8 + '01234567'.indexOf(source[index++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch) >= 0 && index < length && isOctalDigit(source[index])) {
                                    code = code * 8 + '01234567'.indexOf(source[index++]);
                                }
                            }
                            str += String.fromCharCode(code);
                        } else {
                            str += ch;
                        }
                        break;
                    }
                } else {
                    ++lineNumber;
                    if (ch === '\r' && source[index] === '\n') {
                        ++index;
                    }
                }
            } else if (isLineTerminator(ch.charCodeAt(0))) {
                break;
            } else {
                str += ch;
            }
        }
        if (quote !== '') {
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token.StringLiteral,
            value: str,
            octal: octal,
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [
                start,
                index
            ]
        };
    }
    function scanTemplate() {
        var cooked = '', ch, start, terminated, tail, restore, unescaped, code, octal;
        terminated = false;
        tail = false;
        start = index;
        ++index;
        while (index < length) {
            ch = source[index++];
            if (ch === '`') {
                tail = true;
                terminated = true;
                break;
            } else if (ch === '$') {
                if (source[index] === '{') {
                    ++index;
                    terminated = true;
                    break;
                }
                cooked += ch;
            } else if (ch === '\\') {
                ch = source[index++];
                if (!isLineTerminator(ch.charCodeAt(0))) {
                    switch (ch) {
                    case 'n':
                        cooked += '\n';
                        break;
                    case 'r':
                        cooked += '\r';
                        break;
                    case 't':
                        cooked += '\t';
                        break;
                    case 'u':
                    case 'x':
                        if (source[index] === '{') {
                            ++index;
                            cooked += scanUnicodeCodePointEscape();
                        } else {
                            restore = index;
                            unescaped = scanHexEscape(ch);
                            if (unescaped) {
                                cooked += unescaped;
                            } else {
                                index = restore;
                                cooked += ch;
                            }
                        }
                        break;
                    case 'b':
                        cooked += '\b';
                        break;
                    case 'f':
                        cooked += '\f';
                        break;
                    case 'v':
                        cooked += '\x0B';
                        break;
                    default:
                        if (isOctalDigit(ch)) {
                            code = '01234567'.indexOf(ch);
                            // \0 is not octal escape sequence
                            if (code !== 0) {
                                octal = true;
                            }
                            if (index < length && isOctalDigit(source[index])) {
                                octal = true;
                                code = code * 8 + '01234567'.indexOf(source[index++]);
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch) >= 0 && index < length && isOctalDigit(source[index])) {
                                    code = code * 8 + '01234567'.indexOf(source[index++]);
                                }
                            }
                            cooked += String.fromCharCode(code);
                        } else {
                            cooked += ch;
                        }
                        break;
                    }
                } else {
                    ++lineNumber;
                    if (ch === '\r' && source[index] === '\n') {
                        ++index;
                    }
                }
            } else if (isLineTerminator(ch.charCodeAt(0))) {
                ++lineNumber;
                if (ch === '\r' && source[index] === '\n') {
                    ++index;
                }
                cooked += '\n';
            } else {
                cooked += ch;
            }
        }
        if (!terminated) {
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token.Template,
            value: {
                cooked: cooked,
                raw: source.slice(start + 1, index - (tail ? 1 : 2))
            },
            tail: tail,
            octal: octal,
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [
                start,
                index
            ]
        };
    }
    function scanTemplateElement(option) {
        var startsWith, template;
        lookahead = null;
        skipComment();
        startsWith = option.head ? '`' : '}';
        if (source[index] !== startsWith) {
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }
        template = scanTemplate();
        peek();
        return template;
    }
    function scanRegExp() {
        var str, ch, start, pattern, flags, value, classMarker = false, restore, terminated = false;
        lookahead = null;
        skipComment();
        start = index;
        ch = source[index];
        assert(ch === '/', 'Regular expression literal must start with a slash');
        str = source[index++];
        while (index < length) {
            ch = source[index++];
            str += ch;
            if (classMarker) {
                if (ch === ']') {
                    classMarker = false;
                }
            } else {
                if (ch === '\\') {
                    ch = source[index++];
                    // ECMA-262 7.8.5
                    if (isLineTerminator(ch.charCodeAt(0))) {
                        throwError({}, Messages.UnterminatedRegExp);
                    }
                    str += ch;
                } else if (ch === '/') {
                    terminated = true;
                    break;
                } else if (ch === '[') {
                    classMarker = true;
                } else if (isLineTerminator(ch.charCodeAt(0))) {
                    throwError({}, Messages.UnterminatedRegExp);
                }
            }
        }
        if (!terminated) {
            throwError({}, Messages.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern = str.substr(1, str.length - 2);
        flags = '';
        while (index < length) {
            ch = source[index];
            if (!isIdentifierPart(ch.charCodeAt(0))) {
                break;
            }
            ++index;
            if (ch === '\\' && index < length) {
                ch = source[index];
                if (ch === 'u') {
                    ++index;
                    restore = index;
                    ch = scanHexEscape('u');
                    if (ch) {
                        flags += ch;
                        for (str += '\\u'; restore < index; ++restore) {
                            str += source[restore];
                        }
                    } else {
                        index = restore;
                        flags += 'u';
                        str += '\\u';
                    }
                } else {
                    str += '\\';
                }
            } else {
                flags += ch;
                str += ch;
            }
        }
        try {
            value = new RegExp(pattern, flags);
        } catch (e) {
            throwError({}, Messages.InvalidRegExp);
        }
        // peek();
        if (extra.tokenize) {
            return {
                type: Token.RegularExpression,
                value: value,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [
                    start,
                    index
                ]
            };
        }
        return {
            type: Token.RegularExpression,
            literal: str,
            value: value,
            range: [
                start,
                index
            ]
        };
    }
    function isIdentifierName(token) {
        return token.type === Token.Identifier || token.type === Token.Keyword || token.type === Token.BooleanLiteral || token.type === Token.NullLiteral;
    }
    function advanceSlash() {
        var prevToken, checkToken;
        // Using the following algorithm:
        // https://github.com/mozilla/sweet.js/wiki/design
        prevToken = extra.tokens[extra.tokens.length - 1];
        if (!prevToken) {
            // Nothing before that: it cannot be a division.
            return scanRegExp();
        }
        if (prevToken.type === 'Punctuator') {
            if (prevToken.value === ')') {
                checkToken = extra.tokens[extra.openParenToken - 1];
                if (checkToken && checkToken.type === 'Keyword' && (checkToken.value === 'if' || checkToken.value === 'while' || checkToken.value === 'for' || checkToken.value === 'with')) {
                    return scanRegExp();
                }
                return scanPunctuator();
            }
            if (prevToken.value === '}') {
                // Dividing a function by anything makes little sense,
                // but we have to check for that.
                if (extra.tokens[extra.openCurlyToken - 3] && extra.tokens[extra.openCurlyToken - 3].type === 'Keyword') {
                    // Anonymous function.
                    checkToken = extra.tokens[extra.openCurlyToken - 4];
                    if (!checkToken) {
                        return scanPunctuator();
                    }
                } else if (extra.tokens[extra.openCurlyToken - 4] && extra.tokens[extra.openCurlyToken - 4].type === 'Keyword') {
                    // Named function.
                    checkToken = extra.tokens[extra.openCurlyToken - 5];
                    if (!checkToken) {
                        return scanRegExp();
                    }
                } else {
                    return scanPunctuator();
                }
                // checkToken determines whether the function is
                // a declaration or an expression.
                if (FnExprTokens.indexOf(checkToken.value) >= 0) {
                    // It is an expression.
                    return scanPunctuator();
                }
                // It is a declaration.
                return scanRegExp();
            }
            return scanRegExp();
        }
        if (prevToken.type === 'Keyword') {
            return scanRegExp();
        }
        return scanPunctuator();
    }
    function advance() {
        var ch;
        skipComment();
        if (index >= length) {
            return {
                type: Token.EOF,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [
                    index,
                    index
                ]
            };
        }
        ch = source.charCodeAt(index);
        // Very common: ( and ) and ;
        if (ch === 40 || ch === 41 || ch === 58) {
            return scanPunctuator();
        }
        // String literal starts with single quote (#39) or double quote (#34).
        if (ch === 39 || ch === 34) {
            return scanStringLiteral();
        }
        if (ch === 96) {
            return scanTemplate();
        }
        if (isIdentifierStart(ch)) {
            return scanIdentifier();
        }
        // # and @ are allowed for sweet.js
        if (ch === 35 || ch === 64) {
            ++index;
            return {
                type: Token.Punctuator,
                value: String.fromCharCode(ch),
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [
                    index - 1,
                    index
                ]
            };
        }
        // Dot (.) char #46 can also start a floating-point number, hence the need
        // to check the next character.
        if (ch === 46) {
            if (isDecimalDigit(source.charCodeAt(index + 1))) {
                return scanNumericLiteral();
            }
            return scanPunctuator();
        }
        if (isDecimalDigit(ch)) {
            return scanNumericLiteral();
        }
        // Slash (/) char #47 can also start a regex.
        if (extra.tokenize && ch === 47) {
            return advanceSlash();
        }
        return scanPunctuator();
    }
    function lex() {
        var token;
        token = lookahead;
        streamIndex = lookaheadIndex;
        lineNumber = token.lineNumber;
        lineStart = token.lineStart;
        sm_lineNumber = lookahead.sm_lineNumber;
        sm_lineStart = lookahead.sm_lineStart;
        sm_range = lookahead.sm_range;
        sm_index = lookahead.sm_range[0];
        lookahead = tokenStream[++streamIndex].token;
        lookaheadIndex = streamIndex;
        index = lookahead.range[0];
        return token;
    }
    function peek() {
        lookaheadIndex = streamIndex + 1;
        if (lookaheadIndex >= length) {
            lookahead = {
                type: Token.EOF,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [
                    index,
                    index
                ]
            };
            return;
        }
        lookahead = tokenStream[lookaheadIndex].token;
        index = lookahead.range[0];
    }
    function lookahead2() {
        var adv, pos, line, start, result;
        if (streamIndex + 1 >= length || streamIndex + 2 >= length) {
            return {
                type: Token.EOF,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [
                    index,
                    index
                ]
            };
        }
        // Scan for the next immediate token.
        if (lookahead === null) {
            lookaheadIndex = streamIndex + 1;
            lookahead = tokenStream[lookaheadIndex].token;
            index = lookahead.range[0];
        }
        result = tokenStream[lookaheadIndex + 1].token;
        return result;
    }
    SyntaxTreeDelegate = {
        name: 'SyntaxTree',
        postProcess: function (node) {
            return node;
        },
        createArrayExpression: function (elements) {
            return {
                type: Syntax.ArrayExpression,
                elements: elements
            };
        },
        createAssignmentExpression: function (operator, left, right) {
            return {
                type: Syntax.AssignmentExpression,
                operator: operator,
                left: left,
                right: right
            };
        },
        createBinaryExpression: function (operator, left, right) {
            var type = operator === '||' || operator === '&&' ? Syntax.LogicalExpression : Syntax.BinaryExpression;
            return {
                type: type,
                operator: operator,
                left: left,
                right: right
            };
        },
        createBlockStatement: function (body) {
            return {
                type: Syntax.BlockStatement,
                body: body
            };
        },
        createBreakStatement: function (label) {
            return {
                type: Syntax.BreakStatement,
                label: label
            };
        },
        createCallExpression: function (callee, args) {
            return {
                type: Syntax.CallExpression,
                callee: callee,
                'arguments': args
            };
        },
        createCatchClause: function (param, body) {
            return {
                type: Syntax.CatchClause,
                param: param,
                body: body
            };
        },
        createConditionalExpression: function (test, consequent, alternate) {
            return {
                type: Syntax.ConditionalExpression,
                test: test,
                consequent: consequent,
                alternate: alternate
            };
        },
        createContinueStatement: function (label) {
            return {
                type: Syntax.ContinueStatement,
                label: label
            };
        },
        createDebuggerStatement: function () {
            return { type: Syntax.DebuggerStatement };
        },
        createDoWhileStatement: function (body, test) {
            return {
                type: Syntax.DoWhileStatement,
                body: body,
                test: test
            };
        },
        createEmptyStatement: function () {
            return { type: Syntax.EmptyStatement };
        },
        createExpressionStatement: function (expression) {
            return {
                type: Syntax.ExpressionStatement,
                expression: expression
            };
        },
        createForStatement: function (init, test, update, body) {
            return {
                type: Syntax.ForStatement,
                init: init,
                test: test,
                update: update,
                body: body
            };
        },
        createForInStatement: function (left, right, body) {
            return {
                type: Syntax.ForInStatement,
                left: left,
                right: right,
                body: body,
                each: false
            };
        },
        createForOfStatement: function (left, right, body) {
            return {
                type: Syntax.ForOfStatement,
                left: left,
                right: right,
                body: body
            };
        },
        createFunctionDeclaration: function (id, params, defaults, body, rest, generator, expression) {
            return {
                type: Syntax.FunctionDeclaration,
                id: id,
                params: params,
                defaults: defaults,
                body: body,
                rest: rest,
                generator: generator,
                expression: expression
            };
        },
        createFunctionExpression: function (id, params, defaults, body, rest, generator, expression) {
            return {
                type: Syntax.FunctionExpression,
                id: id,
                params: params,
                defaults: defaults,
                body: body,
                rest: rest,
                generator: generator,
                expression: expression
            };
        },
        createIdentifier: function (name) {
            return {
                type: Syntax.Identifier,
                name: name
            };
        },
        createIfStatement: function (test, consequent, alternate) {
            return {
                type: Syntax.IfStatement,
                test: test,
                consequent: consequent,
                alternate: alternate
            };
        },
        createLabeledStatement: function (label, body) {
            return {
                type: Syntax.LabeledStatement,
                label: label,
                body: body
            };
        },
        createLiteral: function (token) {
            return {
                type: Syntax.Literal,
                value: token.value,
                raw: String(token.value)
            };
        },
        createMemberExpression: function (accessor, object, property) {
            return {
                type: Syntax.MemberExpression,
                computed: accessor === '[',
                object: object,
                property: property
            };
        },
        createNewExpression: function (callee, args) {
            return {
                type: Syntax.NewExpression,
                callee: callee,
                'arguments': args
            };
        },
        createObjectExpression: function (properties) {
            return {
                type: Syntax.ObjectExpression,
                properties: properties
            };
        },
        createPostfixExpression: function (operator, argument) {
            return {
                type: Syntax.UpdateExpression,
                operator: operator,
                argument: argument,
                prefix: false
            };
        },
        createProgram: function (body) {
            return {
                type: Syntax.Program,
                body: body
            };
        },
        createProperty: function (kind, key, value, method, shorthand) {
            return {
                type: Syntax.Property,
                key: key,
                value: value,
                kind: kind,
                method: method,
                shorthand: shorthand
            };
        },
        createReturnStatement: function (argument) {
            return {
                type: Syntax.ReturnStatement,
                argument: argument
            };
        },
        createSequenceExpression: function (expressions) {
            return {
                type: Syntax.SequenceExpression,
                expressions: expressions
            };
        },
        createSwitchCase: function (test, consequent) {
            return {
                type: Syntax.SwitchCase,
                test: test,
                consequent: consequent
            };
        },
        createSwitchStatement: function (discriminant, cases) {
            return {
                type: Syntax.SwitchStatement,
                discriminant: discriminant,
                cases: cases
            };
        },
        createThisExpression: function () {
            return { type: Syntax.ThisExpression };
        },
        createThrowStatement: function (argument) {
            return {
                type: Syntax.ThrowStatement,
                argument: argument
            };
        },
        createTryStatement: function (block, guardedHandlers, handlers, finalizer) {
            return {
                type: Syntax.TryStatement,
                block: block,
                guardedHandlers: guardedHandlers,
                handlers: handlers,
                finalizer: finalizer
            };
        },
        createUnaryExpression: function (operator, argument) {
            if (operator === '++' || operator === '--') {
                return {
                    type: Syntax.UpdateExpression,
                    operator: operator,
                    argument: argument,
                    prefix: true
                };
            }
            return {
                type: Syntax.UnaryExpression,
                operator: operator,
                argument: argument
            };
        },
        createVariableDeclaration: function (declarations, kind) {
            return {
                type: Syntax.VariableDeclaration,
                declarations: declarations,
                kind: kind
            };
        },
        createVariableDeclarator: function (id, init) {
            return {
                type: Syntax.VariableDeclarator,
                id: id,
                init: init
            };
        },
        createWhileStatement: function (test, body) {
            return {
                type: Syntax.WhileStatement,
                test: test,
                body: body
            };
        },
        createWithStatement: function (object, body) {
            return {
                type: Syntax.WithStatement,
                object: object,
                body: body
            };
        },
        createTemplateElement: function (value, tail) {
            return {
                type: Syntax.TemplateElement,
                value: value,
                tail: tail
            };
        },
        createTemplateLiteral: function (quasis, expressions) {
            return {
                type: Syntax.TemplateLiteral,
                quasis: quasis,
                expressions: expressions
            };
        },
        createSpreadElement: function (argument) {
            return {
                type: Syntax.SpreadElement,
                argument: argument
            };
        },
        createTaggedTemplateExpression: function (tag, quasi) {
            return {
                type: Syntax.TaggedTemplateExpression,
                tag: tag,
                quasi: quasi
            };
        },
        createArrowFunctionExpression: function (params, defaults, body, rest, expression) {
            return {
                type: Syntax.ArrowFunctionExpression,
                id: null,
                params: params,
                defaults: defaults,
                body: body,
                rest: rest,
                generator: false,
                expression: expression
            };
        },
        createMethodDefinition: function (propertyType, kind, key, value) {
            return {
                type: Syntax.MethodDefinition,
                key: key,
                value: value,
                kind: kind,
                'static': propertyType === ClassPropertyType.static
            };
        },
        createClassBody: function (body) {
            return {
                type: Syntax.ClassBody,
                body: body
            };
        },
        createClassExpression: function (id, superClass, body) {
            return {
                type: Syntax.ClassExpression,
                id: id,
                superClass: superClass,
                body: body
            };
        },
        createClassDeclaration: function (id, superClass, body) {
            return {
                type: Syntax.ClassDeclaration,
                id: id,
                superClass: superClass,
                body: body
            };
        },
        createExportSpecifier: function (id, name) {
            return {
                type: Syntax.ExportSpecifier,
                id: id,
                name: name
            };
        },
        createExportBatchSpecifier: function () {
            return { type: Syntax.ExportBatchSpecifier };
        },
        createExportDeclaration: function (declaration, specifiers, source$2) {
            return {
                type: Syntax.ExportDeclaration,
                declaration: declaration,
                specifiers: specifiers,
                source: source$2
            };
        },
        createImportSpecifier: function (id, name) {
            return {
                type: Syntax.ImportSpecifier,
                id: id,
                name: name
            };
        },
        createImportDeclaration: function (specifiers, kind, source$2) {
            return {
                type: Syntax.ImportDeclaration,
                specifiers: specifiers,
                kind: kind,
                source: source$2
            };
        },
        createYieldExpression: function (argument, delegate$2) {
            return {
                type: Syntax.YieldExpression,
                argument: argument,
                delegate: delegate$2
            };
        },
        createModuleDeclaration: function (id, source$2, body) {
            return {
                type: Syntax.ModuleDeclaration,
                id: id,
                source: source$2,
                body: body
            };
        }
    };
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator() {
        return lookahead.lineNumber !== lineNumber;
    }
    // Throw an exception
    function throwError(token, messageFormat) {
        var error, args = Array.prototype.slice.call(arguments, 2), msg = messageFormat.replace(/%(\d)/g, function (whole, index$2) {
                assert(index$2 < args.length, 'Message reference must be in range');
                return args[index$2];
            });
        var startIndex = streamIndex > 3 ? streamIndex - 3 : 0;
        var toks = '', tailingMsg = '';
        if (tokenStream) {
            toks = tokenStream.slice(startIndex, streamIndex + 3).map(function (stx) {
                return stx.token.value;
            }).join(' ');
            tailingMsg = '\n[... ' + toks + ' ...]';
        }
        if (typeof token.lineNumber === 'number') {
            error = new Error('Line ' + token.lineNumber + ': ' + msg + tailingMsg);
            error.index = token.range[0];
            error.lineNumber = token.lineNumber;
            error.column = token.range[0] - lineStart + 1;
        } else {
            error = new Error('Line ' + lineNumber + ': ' + msg + tailingMsg);
            error.index = index;
            error.lineNumber = lineNumber;
            error.column = index - lineStart + 1;
        }
        error.description = msg;
        throw error;
    }
    function throwErrorTolerant() {
        try {
            throwError.apply(null, arguments);
        } catch (e) {
            if (extra.errors) {
                extra.errors.push(e);
            } else {
                throw e;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected(token) {
        if (token.type === Token.EOF) {
            throwError(token, Messages.UnexpectedEOS);
        }
        if (token.type === Token.NumericLiteral) {
            throwError(token, Messages.UnexpectedNumber);
        }
        if (token.type === Token.StringLiteral) {
            throwError(token, Messages.UnexpectedString);
        }
        if (token.type === Token.Identifier) {
            throwError(token, Messages.UnexpectedIdentifier);
        }
        if (token.type === Token.Keyword) {
            if (isFutureReservedWord(token.value)) {
            }    // sweet.js allows future reserved words
                 // throwError(token, Messages.UnexpectedReserved);
            else if (strict && isStrictModeReservedWord(token.value)) {
                throwErrorTolerant(token, Messages.StrictReservedWord);
                return;
            }
            throwError(token, Messages.UnexpectedToken, token.value);
        }
        if (token.type === Token.Template) {
            throwError(token, Messages.UnexpectedTemplate, token.value.raw);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError(token, Messages.UnexpectedToken, token.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect(value) {
        var token = lex();
        if (token.type !== Token.Punctuator || token.value !== value) {
            throwUnexpected(token);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword(keyword) {
        var token = lex();
        if (token.type !== Token.Keyword || token.value !== keyword) {
            throwUnexpected(token);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match(value) {
        return lookahead.type === Token.Punctuator && lookahead.value === value;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword(keyword) {
        return lookahead.type === Token.Keyword && lookahead.value === keyword;
    }
    // Return true if the next token matches the specified contextual keyword
    function matchContextualKeyword(keyword) {
        return lookahead.type === Token.Identifier && lookahead.value === keyword;
    }
    // Return true if the next token is an assignment operator
    function matchAssign() {
        var op;
        if (lookahead.type !== Token.Punctuator) {
            return false;
        }
        op = lookahead.value;
        return op === '=' || op === '*=' || op === '/=' || op === '%=' || op === '+=' || op === '-=' || op === '<<=' || op === '>>=' || op === '>>>=' || op === '&=' || op === '^=' || op === '|=';
    }
    function consumeSemicolon() {
        var line, ch;
        ch = lookahead.value ? String(lookahead.value).charCodeAt(0) : -1;
        // Catch the very common case first: immediately a semicolon (char #59).
        if (ch === 59) {
            lex();
            return;
        }
        if (lookahead.lineNumber !== lineNumber) {
            return;
        }
        if (match(';')) {
            lex();
            return;
        }
        if (lookahead.type !== Token.EOF && !match('}')) {
            throwUnexpected(lookahead);
        }
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide(expr) {
        return expr.type === Syntax.Identifier || expr.type === Syntax.MemberExpression;
    }
    function isAssignableLeftHandSide(expr) {
        return isLeftHandSide(expr) || expr.type === Syntax.ObjectPattern || expr.type === Syntax.ArrayPattern;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser() {
        var elements = [], blocks = [], filter = null, tmp, possiblecomprehension = true, body;
        expect('[');
        while (!match(']')) {
            if (lookahead.value === 'for' && lookahead.type === Token.Keyword) {
                if (!possiblecomprehension) {
                    throwError({}, Messages.ComprehensionError);
                }
                matchKeyword('for');
                tmp = parseForStatement({ ignoreBody: true });
                tmp.of = tmp.type === Syntax.ForOfStatement;
                tmp.type = Syntax.ComprehensionBlock;
                if (tmp.left.kind) {
                    // can't be let or const
                    throwError({}, Messages.ComprehensionError);
                }
                blocks.push(tmp);
            } else if (lookahead.value === 'if' && lookahead.type === Token.Keyword) {
                if (!possiblecomprehension) {
                    throwError({}, Messages.ComprehensionError);
                }
                expectKeyword('if');
                expect('(');
                filter = parseExpression();
                expect(')');
            } else if (lookahead.value === ',' && lookahead.type === Token.Punctuator) {
                possiblecomprehension = false;
                // no longer allowed.
                lex();
                elements.push(null);
            } else {
                tmp = parseSpreadOrAssignmentExpression();
                elements.push(tmp);
                if (tmp && tmp.type === Syntax.SpreadElement) {
                    if (!match(']')) {
                        throwError({}, Messages.ElementAfterSpreadElement);
                    }
                } else if (!(match(']') || matchKeyword('for') || matchKeyword('if'))) {
                    expect(',');
                    // this lexes.
                    possiblecomprehension = false;
                }
            }
        }
        expect(']');
        if (filter && !blocks.length) {
            throwError({}, Messages.ComprehensionRequiresBlock);
        }
        if (blocks.length) {
            if (elements.length !== 1) {
                throwError({}, Messages.ComprehensionError);
            }
            return {
                type: Syntax.ComprehensionExpression,
                filter: filter,
                blocks: blocks,
                body: elements[0]
            };
        }
        return delegate.createArrayExpression(elements);
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction(options) {
        var previousStrict, previousYieldAllowed, params, defaults, body;
        previousStrict = strict;
        previousYieldAllowed = state.yieldAllowed;
        state.yieldAllowed = options.generator;
        params = options.params || [];
        defaults = options.defaults || [];
        body = parseConciseBody();
        if (options.name && strict && isRestrictedWord(params[0].name)) {
            throwErrorTolerant(options.name, Messages.StrictParamName);
        }
        if (state.yieldAllowed && !state.yieldFound) {
            throwErrorTolerant({}, Messages.NoYieldInGenerator);
        }
        strict = previousStrict;
        state.yieldAllowed = previousYieldAllowed;
        return delegate.createFunctionExpression(null, params, defaults, body, options.rest || null, options.generator, body.type !== Syntax.BlockStatement);
    }
    function parsePropertyMethodFunction(options) {
        var previousStrict, tmp, method;
        previousStrict = strict;
        strict = true;
        tmp = parseParams();
        if (tmp.stricted) {
            throwErrorTolerant(tmp.stricted, tmp.message);
        }
        method = parsePropertyFunction({
            params: tmp.params,
            defaults: tmp.defaults,
            rest: tmp.rest,
            generator: options.generator
        });
        strict = previousStrict;
        return method;
    }
    function parseObjectPropertyKey() {
        var token = lex();
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token.type === Token.StringLiteral || token.type === Token.NumericLiteral) {
            if (strict && token.octal) {
                throwErrorTolerant(token, Messages.StrictOctalLiteral);
            }
            return delegate.createLiteral(token);
        }
        // SWEET.JS: object keys are not resolved
        return delegate.createIdentifier(token.value);
    }
    function parseObjectProperty() {
        var token, key, id, value, param;
        token = lookahead;
        if (token.type === Token.Identifier) {
            id = parseObjectPropertyKey();
            // Property Assignment: Getter and Setter.
            if (token.value === 'get' && !(match(':') || match('('))) {
                key = parseObjectPropertyKey();
                expect('(');
                expect(')');
                return delegate.createProperty('get', key, parsePropertyFunction({ generator: false }), false, false);
            }
            if (token.value === 'set' && !(match(':') || match('('))) {
                key = parseObjectPropertyKey();
                expect('(');
                token = lookahead;
                param = [parseVariableIdentifier()];
                expect(')');
                return delegate.createProperty('set', key, parsePropertyFunction({
                    params: param,
                    generator: false,
                    name: token
                }), false, false);
            }
            if (match(':')) {
                lex();
                return delegate.createProperty('init', id, parseAssignmentExpression(), false, false);
            }
            if (match('(')) {
                return delegate.createProperty('init', id, parsePropertyMethodFunction({ generator: false }), true, false);
            }
            return delegate.createProperty('init', id, id, false, true);
        }
        if (token.type === Token.EOF || token.type === Token.Punctuator) {
            if (!match('*')) {
                throwUnexpected(token);
            }
            lex();
            id = parseObjectPropertyKey();
            if (!match('(')) {
                throwUnexpected(lex());
            }
            return delegate.createProperty('init', id, parsePropertyMethodFunction({ generator: true }), true, false);
        }
        key = parseObjectPropertyKey();
        if (match(':')) {
            lex();
            return delegate.createProperty('init', key, parseAssignmentExpression(), false, false);
        }
        if (match('(')) {
            return delegate.createProperty('init', key, parsePropertyMethodFunction({ generator: false }), true, false);
        }
        throwUnexpected(lex());
    }
    function parseObjectInitialiser() {
        var properties = [], property, name, key, kind, map = {}, toString = String;
        expect('{');
        while (!match('}')) {
            property = parseObjectProperty();
            if (property.key.type === Syntax.Identifier) {
                name = property.key.name;
            } else {
                name = toString(property.key.value);
            }
            kind = property.kind === 'init' ? PropertyKind.Data : property.kind === 'get' ? PropertyKind.Get : PropertyKind.Set;
            key = '$' + name;
            if (Object.prototype.hasOwnProperty.call(map, key)) {
                if (map[key] === PropertyKind.Data) {
                    if (strict && kind === PropertyKind.Data) {
                        throwErrorTolerant({}, Messages.StrictDuplicateProperty);
                    } else if (kind !== PropertyKind.Data) {
                        throwErrorTolerant({}, Messages.AccessorDataProperty);
                    }
                } else {
                    if (kind === PropertyKind.Data) {
                        throwErrorTolerant({}, Messages.AccessorDataProperty);
                    } else if (map[key] & kind) {
                        throwErrorTolerant({}, Messages.AccessorGetSet);
                    }
                }
                map[key] |= kind;
            } else {
                map[key] = kind;
            }
            properties.push(property);
            if (!match('}')) {
                expect(',');
            }
        }
        expect('}');
        return delegate.createObjectExpression(properties);
    }
    function parseTemplateElement(option) {
        var token = lex();
        if (strict && token.octal) {
            throwError(token, Messages.StrictOctalLiteral);
        }
        return delegate.createTemplateElement({
            raw: token.value.raw,
            cooked: token.value.cooked
        }, token.tail);
    }
    function parseTemplateLiteral() {
        var quasi, quasis, expressions;
        quasi = parseTemplateElement({ head: true });
        quasis = [quasi];
        expressions = [];
        while (!quasi.tail) {
            expressions.push(parseExpression());
            quasi = parseTemplateElement({ head: false });
            quasis.push(quasi);
        }
        return delegate.createTemplateLiteral(quasis, expressions);
    }
    // 11.1.6 The Grouping Operator
    function parseGroupExpression() {
        var expr;
        expect('(');
        ++state.parenthesizedCount;
        expr = parseExpression();
        expect(')');
        return expr;
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression() {
        var type, token, resolvedIdent;
        token = lookahead;
        type = lookahead.type;
        if (type === Token.Identifier) {
            resolvedIdent = expander.resolve(tokenStream[lookaheadIndex]);
            lex();
            return delegate.createIdentifier(resolvedIdent);
        }
        if (type === Token.StringLiteral || type === Token.NumericLiteral) {
            if (strict && lookahead.octal) {
                throwErrorTolerant(lookahead, Messages.StrictOctalLiteral);
            }
            return delegate.createLiteral(lex());
        }
        if (type === Token.Keyword) {
            if (matchKeyword('this')) {
                lex();
                return delegate.createThisExpression();
            }
            if (matchKeyword('function')) {
                return parseFunctionExpression();
            }
            if (matchKeyword('class')) {
                return parseClassExpression();
            }
            if (matchKeyword('super')) {
                lex();
                return delegate.createIdentifier('super');
            }
        }
        if (type === Token.BooleanLiteral) {
            token = lex();
            token.value = token.value === 'true';
            return delegate.createLiteral(token);
        }
        if (type === Token.NullLiteral) {
            token = lex();
            token.value = null;
            return delegate.createLiteral(token);
        }
        if (match('[')) {
            return parseArrayInitialiser();
        }
        if (match('{')) {
            return parseObjectInitialiser();
        }
        if (match('(')) {
            return parseGroupExpression();
        }
        if (lookahead.type === Token.RegularExpression) {
            return delegate.createLiteral(lex());
        }
        if (type === Token.Template) {
            return parseTemplateLiteral();
        }
        return throwUnexpected(lex());
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments() {
        var args = [], arg;
        expect('(');
        if (!match(')')) {
            while (streamIndex < length) {
                arg = parseSpreadOrAssignmentExpression();
                args.push(arg);
                if (match(')')) {
                    break;
                } else if (arg.type === Syntax.SpreadElement) {
                    throwError({}, Messages.ElementAfterSpreadElement);
                }
                expect(',');
            }
        }
        expect(')');
        return args;
    }
    function parseSpreadOrAssignmentExpression() {
        if (match('...')) {
            lex();
            return delegate.createSpreadElement(parseAssignmentExpression());
        }
        return parseAssignmentExpression();
    }
    function parseNonComputedProperty() {
        var token = lex();
        if (!isIdentifierName(token)) {
            throwUnexpected(token);
        }
        return delegate.createIdentifier(token.value);
    }
    function parseNonComputedMember() {
        expect('.');
        return parseNonComputedProperty();
    }
    function parseComputedMember() {
        var expr;
        expect('[');
        expr = parseExpression();
        expect(']');
        return expr;
    }
    function parseNewExpression() {
        var callee, args;
        expectKeyword('new');
        callee = parseLeftHandSideExpression();
        args = match('(') ? parseArguments() : [];
        return delegate.createNewExpression(callee, args);
    }
    function parseLeftHandSideExpressionAllowCall() {
        var expr, args, property;
        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();
        while (match('.') || match('[') || match('(') || lookahead.type === Token.Template) {
            if (match('(')) {
                args = parseArguments();
                expr = delegate.createCallExpression(expr, args);
            } else if (match('[')) {
                expr = delegate.createMemberExpression('[', expr, parseComputedMember());
            } else if (match('.')) {
                expr = delegate.createMemberExpression('.', expr, parseNonComputedMember());
            } else {
                expr = delegate.createTaggedTemplateExpression(expr, parseTemplateLiteral());
            }
        }
        return expr;
    }
    function parseLeftHandSideExpression() {
        var expr, property;
        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();
        while (match('.') || match('[') || lookahead.type === Token.Template) {
            if (match('[')) {
                expr = delegate.createMemberExpression('[', expr, parseComputedMember());
            } else if (match('.')) {
                expr = delegate.createMemberExpression('.', expr, parseNonComputedMember());
            } else {
                expr = delegate.createTaggedTemplateExpression(expr, parseTemplateLiteral());
            }
        }
        return expr;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression() {
        var expr = parseLeftHandSideExpressionAllowCall(), token = lookahead;
        if (lookahead.type !== Token.Punctuator) {
            return expr;
        }
        if ((match('++') || match('--')) && !peekLineTerminator()) {
            // 11.3.1, 11.3.2
            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
                throwErrorTolerant({}, Messages.StrictLHSPostfix);
            }
            if (!isLeftHandSide(expr)) {
                throwError({}, Messages.InvalidLHSInAssignment);
            }
            token = lex();
            expr = delegate.createPostfixExpression(token.value, expr);
        }
        return expr;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression() {
        var token, expr;
        if (lookahead.type !== Token.Punctuator && lookahead.type !== Token.Keyword) {
            return parsePostfixExpression();
        }
        if (match('++') || match('--')) {
            token = lex();
            expr = parseUnaryExpression();
            // 11.4.4, 11.4.5
            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
                throwErrorTolerant({}, Messages.StrictLHSPrefix);
            }
            if (!isLeftHandSide(expr)) {
                throwError({}, Messages.InvalidLHSInAssignment);
            }
            return delegate.createUnaryExpression(token.value, expr);
        }
        if (match('+') || match('-') || match('~') || match('!')) {
            token = lex();
            expr = parseUnaryExpression();
            return delegate.createUnaryExpression(token.value, expr);
        }
        if (matchKeyword('delete') || matchKeyword('void') || matchKeyword('typeof')) {
            token = lex();
            expr = parseUnaryExpression();
            expr = delegate.createUnaryExpression(token.value, expr);
            if (expr.operator === 'delete' && expr.argument.type === Syntax.Identifier) {
                throwErrorTolerant({}, Messages.StrictDelete);
            }
            return expr;
        }
        return parsePostfixExpression();
    }
    function binaryPrecedence(token, allowIn) {
        var prec = 0;
        if (token.type !== Token.Punctuator && token.type !== Token.Keyword) {
            return 0;
        }
        switch (token.value) {
        case '||':
            prec = 1;
            break;
        case '&&':
            prec = 2;
            break;
        case '|':
            prec = 3;
            break;
        case '^':
            prec = 4;
            break;
        case '&':
            prec = 5;
            break;
        case '==':
        case '!=':
        case '===':
        case '!==':
            prec = 6;
            break;
        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec = 7;
            break;
        case 'in':
            prec = allowIn ? 7 : 0;
            break;
        case '<<':
        case '>>':
        case '>>>':
            prec = 8;
            break;
        case '+':
        case '-':
            prec = 9;
            break;
        case '*':
        case '/':
        case '%':
            prec = 11;
            break;
        default:
            break;
        }
        return prec;
    }
    // 11.5 Multiplicative Operators
    // 11.6 Additive Operators
    // 11.7 Bitwise Shift Operators
    // 11.8 Relational Operators
    // 11.9 Equality Operators
    // 11.10 Binary Bitwise Operators
    // 11.11 Binary Logical Operators
    function parseBinaryExpression() {
        var expr, token, prec, previousAllowIn, stack, right, operator, left, i;
        previousAllowIn = state.allowIn;
        state.allowIn = true;
        expr = parseUnaryExpression();
        token = lookahead;
        prec = binaryPrecedence(token, previousAllowIn);
        if (prec === 0) {
            return expr;
        }
        token.prec = prec;
        lex();
        stack = [
            expr,
            token,
            parseUnaryExpression()
        ];
        while ((prec = binaryPrecedence(lookahead, previousAllowIn)) > 0) {
            // Reduce: make a binary expression from the three topmost entries.
            while (stack.length > 2 && prec <= stack[stack.length - 2].prec) {
                right = stack.pop();
                operator = stack.pop().value;
                left = stack.pop();
                stack.push(delegate.createBinaryExpression(operator, left, right));
            }
            // Shift.
            token = lex();
            token.prec = prec;
            stack.push(token);
            stack.push(parseUnaryExpression());
        }
        state.allowIn = previousAllowIn;
        // Final reduce to clean-up the stack.
        i = stack.length - 1;
        expr = stack[i];
        while (i > 1) {
            expr = delegate.createBinaryExpression(stack[i - 1].value, stack[i - 2], expr);
            i -= 2;
        }
        return expr;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression() {
        var expr, previousAllowIn, consequent, alternate;
        expr = parseBinaryExpression();
        if (match('?')) {
            lex();
            previousAllowIn = state.allowIn;
            state.allowIn = true;
            consequent = parseAssignmentExpression();
            state.allowIn = previousAllowIn;
            expect(':');
            alternate = parseAssignmentExpression();
            expr = delegate.createConditionalExpression(expr, consequent, alternate);
        }
        return expr;
    }
    // 11.13 Assignment Operators
    function reinterpretAsAssignmentBindingPattern(expr) {
        var i, len, property, element;
        if (expr.type === Syntax.ObjectExpression) {
            expr.type = Syntax.ObjectPattern;
            for (i = 0, len = expr.properties.length; i < len; i += 1) {
                property = expr.properties[i];
                if (property.kind !== 'init') {
                    throwError({}, Messages.InvalidLHSInAssignment);
                }
                reinterpretAsAssignmentBindingPattern(property.value);
            }
        } else if (expr.type === Syntax.ArrayExpression) {
            expr.type = Syntax.ArrayPattern;
            for (i = 0, len = expr.elements.length; i < len; i += 1) {
                element = expr.elements[i];
                if (element) {
                    reinterpretAsAssignmentBindingPattern(element);
                }
            }
        } else if (expr.type === Syntax.Identifier) {
            if (isRestrictedWord(expr.name)) {
                throwError({}, Messages.InvalidLHSInAssignment);
            }
        } else if (expr.type === Syntax.SpreadElement) {
            reinterpretAsAssignmentBindingPattern(expr.argument);
            if (expr.argument.type === Syntax.ObjectPattern) {
                throwError({}, Messages.ObjectPatternAsSpread);
            }
        } else {
            if (expr.type !== Syntax.MemberExpression && expr.type !== Syntax.CallExpression && expr.type !== Syntax.NewExpression) {
                throwError({}, Messages.InvalidLHSInAssignment);
            }
        }
    }
    function reinterpretAsDestructuredParameter(options, expr) {
        var i, len, property, element;
        if (expr.type === Syntax.ObjectExpression) {
            expr.type = Syntax.ObjectPattern;
            for (i = 0, len = expr.properties.length; i < len; i += 1) {
                property = expr.properties[i];
                if (property.kind !== 'init') {
                    throwError({}, Messages.InvalidLHSInFormalsList);
                }
                reinterpretAsDestructuredParameter(options, property.value);
            }
        } else if (expr.type === Syntax.ArrayExpression) {
            expr.type = Syntax.ArrayPattern;
            for (i = 0, len = expr.elements.length; i < len; i += 1) {
                element = expr.elements[i];
                if (element) {
                    reinterpretAsDestructuredParameter(options, element);
                }
            }
        } else if (expr.type === Syntax.Identifier) {
            validateParam(options, expr, expr.name);
        } else {
            if (expr.type !== Syntax.MemberExpression) {
                throwError({}, Messages.InvalidLHSInFormalsList);
            }
        }
    }
    function reinterpretAsCoverFormalsList(expressions) {
        var i, len, param, params, defaults, defaultCount, options, rest;
        params = [];
        defaults = [];
        defaultCount = 0;
        rest = null;
        options = { paramSet: {} };
        for (i = 0, len = expressions.length; i < len; i += 1) {
            param = expressions[i];
            if (param.type === Syntax.Identifier) {
                params.push(param);
                defaults.push(null);
                validateParam(options, param, param.name);
            } else if (param.type === Syntax.ObjectExpression || param.type === Syntax.ArrayExpression) {
                reinterpretAsDestructuredParameter(options, param);
                params.push(param);
                defaults.push(null);
            } else if (param.type === Syntax.SpreadElement) {
                assert(i === len - 1, 'It is guaranteed that SpreadElement is last element by parseExpression');
                reinterpretAsDestructuredParameter(options, param.argument);
                rest = param.argument;
            } else if (param.type === Syntax.AssignmentExpression) {
                params.push(param.left);
                defaults.push(param.right);
                ++defaultCount;
                validateParam(options, param.left, param.left.name);
            } else {
                return null;
            }
        }
        if (options.message === Messages.StrictParamDupe) {
            throwError(strict ? options.stricted : options.firstRestricted, options.message);
        }
        if (defaultCount === 0) {
            defaults = [];
        }
        return {
            params: params,
            defaults: defaults,
            rest: rest,
            stricted: options.stricted,
            firstRestricted: options.firstRestricted,
            message: options.message
        };
    }
    function parseArrowFunctionExpression(options) {
        var previousStrict, previousYieldAllowed, body;
        expect('=>');
        previousStrict = strict;
        previousYieldAllowed = state.yieldAllowed;
        state.yieldAllowed = false;
        body = parseConciseBody();
        if (strict && options.firstRestricted) {
            throwError(options.firstRestricted, options.message);
        }
        if (strict && options.stricted) {
            throwErrorTolerant(options.stricted, options.message);
        }
        strict = previousStrict;
        state.yieldAllowed = previousYieldAllowed;
        return delegate.createArrowFunctionExpression(options.params, options.defaults, body, options.rest, body.type !== Syntax.BlockStatement);
    }
    function parseAssignmentExpression() {
        var expr, token, params, oldParenthesizedCount;
        if (matchKeyword('yield')) {
            return parseYieldExpression();
        }
        oldParenthesizedCount = state.parenthesizedCount;
        if (match('(')) {
            token = lookahead2();
            if (token.type === Token.Punctuator && token.value === ')' || token.value === '...') {
                params = parseParams();
                if (!match('=>')) {
                    throwUnexpected(lex());
                }
                return parseArrowFunctionExpression(params);
            }
        }
        token = lookahead;
        expr = parseConditionalExpression();
        if (match('=>') && (state.parenthesizedCount === oldParenthesizedCount || state.parenthesizedCount === oldParenthesizedCount + 1)) {
            if (expr.type === Syntax.Identifier) {
                params = reinterpretAsCoverFormalsList([expr]);
            } else if (expr.type === Syntax.SequenceExpression) {
                params = reinterpretAsCoverFormalsList(expr.expressions);
            }
            if (params) {
                return parseArrowFunctionExpression(params);
            }
        }
        if (matchAssign()) {
            // 11.13.1
            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
                throwErrorTolerant(token, Messages.StrictLHSAssignment);
            }
            // ES.next draf 11.13 Runtime Semantics step 1
            if (match('=') && (expr.type === Syntax.ObjectExpression || expr.type === Syntax.ArrayExpression)) {
                reinterpretAsAssignmentBindingPattern(expr);
            } else if (!isLeftHandSide(expr)) {
                throwError({}, Messages.InvalidLHSInAssignment);
            }
            expr = delegate.createAssignmentExpression(lex().value, expr, parseAssignmentExpression());
        }
        return expr;
    }
    // 11.14 Comma Operator
    function parseExpression() {
        var expr, expressions, sequence, coverFormalsList, spreadFound, oldParenthesizedCount;
        oldParenthesizedCount = state.parenthesizedCount;
        expr = parseAssignmentExpression();
        expressions = [expr];
        if (match(',')) {
            while (streamIndex < length) {
                if (!match(',')) {
                    break;
                }
                lex();
                expr = parseSpreadOrAssignmentExpression();
                expressions.push(expr);
                if (expr.type === Syntax.SpreadElement) {
                    spreadFound = true;
                    if (!match(')')) {
                        throwError({}, Messages.ElementAfterSpreadElement);
                    }
                    break;
                }
            }
            sequence = delegate.createSequenceExpression(expressions);
        }
        if (match('=>')) {
            // Do not allow nested parentheses on the LHS of the =>.
            if (state.parenthesizedCount === oldParenthesizedCount || state.parenthesizedCount === oldParenthesizedCount + 1) {
                expr = expr.type === Syntax.SequenceExpression ? expr.expressions : expressions;
                coverFormalsList = reinterpretAsCoverFormalsList(expr);
                if (coverFormalsList) {
                    return parseArrowFunctionExpression(coverFormalsList);
                }
            }
            throwUnexpected(lex());
        }
        if (spreadFound && lookahead2().value !== '=>') {
            throwError({}, Messages.IllegalSpread);
        }
        return sequence || expr;
    }
    // 12.1 Block
    function parseStatementList() {
        var list = [], statement;
        while (streamIndex < length) {
            if (match('}')) {
                break;
            }
            statement = parseSourceElement();
            if (typeof statement === 'undefined') {
                break;
            }
            list.push(statement);
        }
        return list;
    }
    function parseBlock() {
        var block;
        expect('{');
        block = parseStatementList();
        expect('}');
        return delegate.createBlockStatement(block);
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier() {
        var token = lookahead, resolvedIdent;
        if (token.type !== Token.Identifier) {
            throwUnexpected(token);
        }
        resolvedIdent = expander.resolve(tokenStream[lookaheadIndex]);
        lex();
        return delegate.createIdentifier(resolvedIdent);
    }
    function parseVariableDeclaration(kind) {
        var id, init = null;
        if (match('{')) {
            id = parseObjectInitialiser();
            reinterpretAsAssignmentBindingPattern(id);
        } else if (match('[')) {
            id = parseArrayInitialiser();
            reinterpretAsAssignmentBindingPattern(id);
        } else {
            id = state.allowKeyword ? parseNonComputedProperty() : parseVariableIdentifier();
            // 12.2.1
            if (strict && isRestrictedWord(id.name)) {
                throwErrorTolerant({}, Messages.StrictVarName);
            }
        }
        if (kind === 'const') {
            if (!match('=')) {
                throwError({}, Messages.NoUnintializedConst);
            }
            expect('=');
            init = parseAssignmentExpression();
        } else if (match('=')) {
            lex();
            init = parseAssignmentExpression();
        }
        return delegate.createVariableDeclarator(id, init);
    }
    function parseVariableDeclarationList(kind) {
        var list = [];
        do {
            list.push(parseVariableDeclaration(kind));
            if (!match(',')) {
                break;
            }
            lex();
        } while (streamIndex < length);
        return list;
    }
    function parseVariableStatement() {
        var declarations;
        expectKeyword('var');
        declarations = parseVariableDeclarationList();
        consumeSemicolon();
        return delegate.createVariableDeclaration(declarations, 'var');
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration(kind) {
        var declarations;
        expectKeyword(kind);
        declarations = parseVariableDeclarationList(kind);
        consumeSemicolon();
        return delegate.createVariableDeclaration(declarations, kind);
    }
    // http://wiki.ecmascript.org/doku.php?id=harmony:modules
    function parseModuleDeclaration() {
        var id, src, body;
        lex();
        // 'module'
        if (peekLineTerminator()) {
            throwError({}, Messages.NewlineAfterModule);
        }
        switch (lookahead.type) {
        case Token.StringLiteral:
            id = parsePrimaryExpression();
            body = parseModuleBlock();
            src = null;
            break;
        case Token.Identifier:
            id = parseVariableIdentifier();
            body = null;
            if (!matchContextualKeyword('from')) {
                throwUnexpected(lex());
            }
            lex();
            src = parsePrimaryExpression();
            if (src.type !== Syntax.Literal) {
                throwError({}, Messages.InvalidModuleSpecifier);
            }
            break;
        }
        consumeSemicolon();
        return delegate.createModuleDeclaration(id, src, body);
    }
    function parseExportBatchSpecifier() {
        expect('*');
        return delegate.createExportBatchSpecifier();
    }
    function parseExportSpecifier() {
        var id, name = null;
        id = parseVariableIdentifier();
        if (matchContextualKeyword('as')) {
            lex();
            name = parseNonComputedProperty();
        }
        return delegate.createExportSpecifier(id, name);
    }
    function parseExportDeclaration() {
        var previousAllowKeyword, decl, def, src, specifiers;
        expectKeyword('export');
        if (lookahead.type === Token.Keyword) {
            switch (lookahead.value) {
            case 'let':
            case 'const':
            case 'var':
            case 'class':
            case 'function':
                return delegate.createExportDeclaration(parseSourceElement(), null, null);
            }
        }
        if (isIdentifierName(lookahead)) {
            previousAllowKeyword = state.allowKeyword;
            state.allowKeyword = true;
            decl = parseVariableDeclarationList('let');
            state.allowKeyword = previousAllowKeyword;
            return delegate.createExportDeclaration(decl, null, null);
        }
        specifiers = [];
        src = null;
        if (match('*')) {
            specifiers.push(parseExportBatchSpecifier());
        } else {
            expect('{');
            do {
                specifiers.push(parseExportSpecifier());
            } while (match(',') && lex());
            expect('}');
        }
        if (matchContextualKeyword('from')) {
            lex();
            src = parsePrimaryExpression();
            if (src.type !== Syntax.Literal) {
                throwError({}, Messages.InvalidModuleSpecifier);
            }
        }
        consumeSemicolon();
        return delegate.createExportDeclaration(null, specifiers, src);
    }
    function parseImportDeclaration() {
        var specifiers, kind, src;
        expectKeyword('import');
        specifiers = [];
        if (isIdentifierName(lookahead)) {
            kind = 'default';
            specifiers.push(parseImportSpecifier());
            if (!matchContextualKeyword('from')) {
                throwError({}, Messages.NoFromAfterImport);
            }
            lex();
        } else if (match('{')) {
            kind = 'named';
            lex();
            do {
                specifiers.push(parseImportSpecifier());
            } while (match(',') && lex());
            expect('}');
            if (!matchContextualKeyword('from')) {
                throwError({}, Messages.NoFromAfterImport);
            }
            lex();
        }
        src = parsePrimaryExpression();
        if (src.type !== Syntax.Literal) {
            throwError({}, Messages.InvalidModuleSpecifier);
        }
        consumeSemicolon();
        return delegate.createImportDeclaration(specifiers, kind, src);
    }
    function parseImportSpecifier() {
        var id, name = null;
        id = parseNonComputedProperty();
        if (matchContextualKeyword('as')) {
            lex();
            name = parseVariableIdentifier();
        }
        return delegate.createImportSpecifier(id, name);
    }
    // 12.3 Empty Statement
    function parseEmptyStatement() {
        expect(';');
        return delegate.createEmptyStatement();
    }
    // 12.4 Expression Statement
    function parseExpressionStatement() {
        var expr = parseExpression();
        consumeSemicolon();
        return delegate.createExpressionStatement(expr);
    }
    // 12.5 If statement
    function parseIfStatement() {
        var test, consequent, alternate;
        expectKeyword('if');
        expect('(');
        test = parseExpression();
        expect(')');
        consequent = parseStatement();
        if (matchKeyword('else')) {
            lex();
            alternate = parseStatement();
        } else {
            alternate = null;
        }
        return delegate.createIfStatement(test, consequent, alternate);
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement() {
        var body, test, oldInIteration;
        expectKeyword('do');
        oldInIteration = state.inIteration;
        state.inIteration = true;
        body = parseStatement();
        state.inIteration = oldInIteration;
        expectKeyword('while');
        expect('(');
        test = parseExpression();
        expect(')');
        if (match(';')) {
            lex();
        }
        return delegate.createDoWhileStatement(body, test);
    }
    function parseWhileStatement() {
        var test, body, oldInIteration;
        expectKeyword('while');
        expect('(');
        test = parseExpression();
        expect(')');
        oldInIteration = state.inIteration;
        state.inIteration = true;
        body = parseStatement();
        state.inIteration = oldInIteration;
        return delegate.createWhileStatement(test, body);
    }
    function parseForVariableDeclaration() {
        var token = lex(), declarations = parseVariableDeclarationList();
        return delegate.createVariableDeclaration(declarations, token.value);
    }
    function parseForStatement(opts) {
        var init, test, update, left, right, body, operator, oldInIteration;
        init = test = update = null;
        expectKeyword('for');
        // http://wiki.ecmascript.org/doku.php?id=proposals:iterators_and_generators&s=each
        if (matchContextualKeyword('each')) {
            throwError({}, Messages.EachNotAllowed);
        }
        expect('(');
        if (match(';')) {
            lex();
        } else {
            if (matchKeyword('var') || matchKeyword('let') || matchKeyword('const')) {
                state.allowIn = false;
                init = parseForVariableDeclaration();
                state.allowIn = true;
                if (init.declarations.length === 1) {
                    if (matchKeyword('in') || matchContextualKeyword('of')) {
                        operator = lookahead;
                        if (!((operator.value === 'in' || init.kind !== 'var') && init.declarations[0].init)) {
                            lex();
                            left = init;
                            right = parseExpression();
                            init = null;
                        }
                    }
                }
            } else {
                state.allowIn = false;
                init = parseExpression();
                state.allowIn = true;
                if (matchContextualKeyword('of')) {
                    operator = lex();
                    left = init;
                    right = parseExpression();
                    init = null;
                } else if (matchKeyword('in')) {
                    // LeftHandSideExpression
                    if (!isAssignableLeftHandSide(init)) {
                        throwError({}, Messages.InvalidLHSInForIn);
                    }
                    operator = lex();
                    left = init;
                    right = parseExpression();
                    init = null;
                }
            }
            if (typeof left === 'undefined') {
                expect(';');
            }
        }
        if (typeof left === 'undefined') {
            if (!match(';')) {
                test = parseExpression();
            }
            expect(';');
            if (!match(')')) {
                update = parseExpression();
            }
        }
        expect(')');
        oldInIteration = state.inIteration;
        state.inIteration = true;
        if (!(opts !== undefined && opts.ignoreBody)) {
            body = parseStatement();
        }
        state.inIteration = oldInIteration;
        if (typeof left === 'undefined') {
            return delegate.createForStatement(init, test, update, body);
        }
        if (operator.value === 'in') {
            return delegate.createForInStatement(left, right, body);
        }
        return delegate.createForOfStatement(left, right, body);
    }
    // 12.7 The continue statement
    function parseContinueStatement() {
        var label = null, key;
        expectKeyword('continue');
        // Optimize the most common form: 'continue;'.
        if (lookahead.value.charCodeAt(0) === 59) {
            lex();
            if (!state.inIteration) {
                throwError({}, Messages.IllegalContinue);
            }
            return delegate.createContinueStatement(null);
        }
        if (peekLineTerminator()) {
            if (!state.inIteration) {
                throwError({}, Messages.IllegalContinue);
            }
            return delegate.createContinueStatement(null);
        }
        if (lookahead.type === Token.Identifier) {
            label = parseVariableIdentifier();
            key = '$' + label.name;
            if (!Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
                throwError({}, Messages.UnknownLabel, label.name);
            }
        }
        consumeSemicolon();
        if (label === null && !state.inIteration) {
            throwError({}, Messages.IllegalContinue);
        }
        return delegate.createContinueStatement(label);
    }
    // 12.8 The break statement
    function parseBreakStatement() {
        var label = null, key;
        expectKeyword('break');
        // Catch the very common case first: immediately a semicolon (char #59).
        if (lookahead.value.charCodeAt(0) === 59) {
            lex();
            if (!(state.inIteration || state.inSwitch)) {
                throwError({}, Messages.IllegalBreak);
            }
            return delegate.createBreakStatement(null);
        }
        if (peekLineTerminator()) {
            if (!(state.inIteration || state.inSwitch)) {
                throwError({}, Messages.IllegalBreak);
            }
            return delegate.createBreakStatement(null);
        }
        if (lookahead.type === Token.Identifier) {
            label = parseVariableIdentifier();
            key = '$' + label.name;
            if (!Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
                throwError({}, Messages.UnknownLabel, label.name);
            }
        }
        consumeSemicolon();
        if (label === null && !(state.inIteration || state.inSwitch)) {
            throwError({}, Messages.IllegalBreak);
        }
        return delegate.createBreakStatement(label);
    }
    // 12.9 The return statement
    function parseReturnStatement() {
        var argument = null;
        expectKeyword('return');
        if (!state.inFunctionBody) {
            throwErrorTolerant({}, Messages.IllegalReturn);
        }
        // 'return' followed by a space and an identifier is very common.
        if (isIdentifierStart(String(lookahead.value).charCodeAt(0))) {
            argument = parseExpression();
            consumeSemicolon();
            return delegate.createReturnStatement(argument);
        }
        if (peekLineTerminator()) {
            return delegate.createReturnStatement(null);
        }
        if (!match(';')) {
            if (!match('}') && lookahead.type !== Token.EOF) {
                argument = parseExpression();
            }
        }
        consumeSemicolon();
        return delegate.createReturnStatement(argument);
    }
    // 12.10 The with statement
    function parseWithStatement() {
        var object, body;
        if (strict) {
            throwErrorTolerant({}, Messages.StrictModeWith);
        }
        expectKeyword('with');
        expect('(');
        object = parseExpression();
        expect(')');
        body = parseStatement();
        return delegate.createWithStatement(object, body);
    }
    // 12.10 The swith statement
    function parseSwitchCase() {
        var test, consequent = [], sourceElement;
        if (matchKeyword('default')) {
            lex();
            test = null;
        } else {
            expectKeyword('case');
            test = parseExpression();
        }
        expect(':');
        while (streamIndex < length) {
            if (match('}') || matchKeyword('default') || matchKeyword('case')) {
                break;
            }
            sourceElement = parseSourceElement();
            if (typeof sourceElement === 'undefined') {
                break;
            }
            consequent.push(sourceElement);
        }
        return delegate.createSwitchCase(test, consequent);
    }
    function parseSwitchStatement() {
        var discriminant, cases, clause, oldInSwitch, defaultFound;
        expectKeyword('switch');
        expect('(');
        discriminant = parseExpression();
        expect(')');
        expect('{');
        cases = [];
        if (match('}')) {
            lex();
            return delegate.createSwitchStatement(discriminant, cases);
        }
        oldInSwitch = state.inSwitch;
        state.inSwitch = true;
        defaultFound = false;
        while (streamIndex < length) {
            if (match('}')) {
                break;
            }
            clause = parseSwitchCase();
            if (clause.test === null) {
                if (defaultFound) {
                    throwError({}, Messages.MultipleDefaultsInSwitch);
                }
                defaultFound = true;
            }
            cases.push(clause);
        }
        state.inSwitch = oldInSwitch;
        expect('}');
        return delegate.createSwitchStatement(discriminant, cases);
    }
    // 12.13 The throw statement
    function parseThrowStatement() {
        var argument;
        expectKeyword('throw');
        if (peekLineTerminator()) {
            throwError({}, Messages.NewlineAfterThrow);
        }
        argument = parseExpression();
        consumeSemicolon();
        return delegate.createThrowStatement(argument);
    }
    // 12.14 The try statement
    function parseCatchClause() {
        var param, body;
        expectKeyword('catch');
        expect('(');
        if (match(')')) {
            throwUnexpected(lookahead);
        }
        param = parseExpression();
        // 12.14.1
        if (strict && param.type === Syntax.Identifier && isRestrictedWord(param.name)) {
            throwErrorTolerant({}, Messages.StrictCatchVariable);
        }
        expect(')');
        body = parseBlock();
        return delegate.createCatchClause(param, body);
    }
    function parseTryStatement() {
        var block, handlers = [], finalizer = null;
        expectKeyword('try');
        block = parseBlock();
        if (matchKeyword('catch')) {
            handlers.push(parseCatchClause());
        }
        if (matchKeyword('finally')) {
            lex();
            finalizer = parseBlock();
        }
        if (handlers.length === 0 && !finalizer) {
            throwError({}, Messages.NoCatchOrFinally);
        }
        return delegate.createTryStatement(block, [], handlers, finalizer);
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement() {
        expectKeyword('debugger');
        consumeSemicolon();
        return delegate.createDebuggerStatement();
    }
    // 12 Statements
    function parseStatement() {
        var type = lookahead.type, expr, labeledBody, key;
        if (type === Token.EOF) {
            throwUnexpected(lookahead);
        }
        if (type === Token.Punctuator) {
            switch (lookahead.value) {
            case ';':
                return parseEmptyStatement();
            case '{':
                return parseBlock();
            case '(':
                return parseExpressionStatement();
            default:
                break;
            }
        }
        if (type === Token.Keyword) {
            switch (lookahead.value) {
            case 'break':
                return parseBreakStatement();
            case 'continue':
                return parseContinueStatement();
            case 'debugger':
                return parseDebuggerStatement();
            case 'do':
                return parseDoWhileStatement();
            case 'for':
                return parseForStatement();
            case 'function':
                return parseFunctionDeclaration();
            case 'class':
                return parseClassDeclaration();
            case 'if':
                return parseIfStatement();
            case 'return':
                return parseReturnStatement();
            case 'switch':
                return parseSwitchStatement();
            case 'throw':
                return parseThrowStatement();
            case 'try':
                return parseTryStatement();
            case 'var':
                return parseVariableStatement();
            case 'while':
                return parseWhileStatement();
            case 'with':
                return parseWithStatement();
            default:
                break;
            }
        }
        expr = parseExpression();
        // 12.12 Labelled Statements
        if (expr.type === Syntax.Identifier && match(':')) {
            lex();
            key = '$' + expr.name;
            if (Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
                throwError({}, Messages.Redeclaration, 'Label', expr.name);
            }
            state.labelSet[key] = true;
            labeledBody = parseStatement();
            delete state.labelSet[key];
            return delegate.createLabeledStatement(expr, labeledBody);
        }
        consumeSemicolon();
        return delegate.createExpressionStatement(expr);
    }
    // 13 Function Definition
    function parseConciseBody() {
        if (match('{')) {
            return parseFunctionSourceElements();
        }
        return parseAssignmentExpression();
    }
    function parseFunctionSourceElements() {
        var sourceElement, sourceElements = [], token, directive, firstRestricted, oldLabelSet, oldInIteration, oldInSwitch, oldInFunctionBody, oldParenthesizedCount;
        expect('{');
        while (streamIndex < length) {
            if (lookahead.type !== Token.StringLiteral) {
                break;
            }
            token = lookahead;
            sourceElement = parseSourceElement();
            sourceElements.push(sourceElement);
            if (sourceElement.expression.type !== Syntax.Literal) {
                // this is not directive
                break;
            }
            directive = token.value;
            if (directive === 'use strict') {
                strict = true;
                if (firstRestricted) {
                    throwErrorTolerant(firstRestricted, Messages.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted && token.octal) {
                    firstRestricted = token;
                }
            }
        }
        oldLabelSet = state.labelSet;
        oldInIteration = state.inIteration;
        oldInSwitch = state.inSwitch;
        oldInFunctionBody = state.inFunctionBody;
        oldParenthesizedCount = state.parenthesizedCount;
        state.labelSet = {};
        state.inIteration = false;
        state.inSwitch = false;
        state.inFunctionBody = true;
        state.parenthesizedCount = 0;
        while (streamIndex < length) {
            if (match('}')) {
                break;
            }
            sourceElement = parseSourceElement();
            if (typeof sourceElement === 'undefined') {
                break;
            }
            sourceElements.push(sourceElement);
        }
        expect('}');
        state.labelSet = oldLabelSet;
        state.inIteration = oldInIteration;
        state.inSwitch = oldInSwitch;
        state.inFunctionBody = oldInFunctionBody;
        state.parenthesizedCount = oldParenthesizedCount;
        return delegate.createBlockStatement(sourceElements);
    }
    function validateParam(options, param, name) {
        var key = '$' + name;
        if (strict) {
            if (isRestrictedWord(name)) {
                options.stricted = param;
                options.message = Messages.StrictParamName;
            }
            if (Object.prototype.hasOwnProperty.call(options.paramSet, key)) {
                options.stricted = param;
                options.message = Messages.StrictParamDupe;
            }
        } else if (!options.firstRestricted) {
            if (isRestrictedWord(name)) {
                options.firstRestricted = param;
                options.message = Messages.StrictParamName;
            } else if (isStrictModeReservedWord(name)) {
                options.firstRestricted = param;
                options.message = Messages.StrictReservedWord;
            } else if (Object.prototype.hasOwnProperty.call(options.paramSet, key)) {
                options.firstRestricted = param;
                options.message = Messages.StrictParamDupe;
            }
        }
        options.paramSet[key] = true;
    }
    function parseParam(options) {
        var token, rest, param, def;
        token = lookahead;
        if (token.value === '...') {
            token = lex();
            rest = true;
        }
        if (match('[')) {
            param = parseArrayInitialiser();
            reinterpretAsDestructuredParameter(options, param);
        } else if (match('{')) {
            if (rest) {
                throwError({}, Messages.ObjectPatternAsRestParameter);
            }
            param = parseObjectInitialiser();
            reinterpretAsDestructuredParameter(options, param);
        } else {
            param = parseVariableIdentifier();
            validateParam(options, token, token.value);
            if (match('=')) {
                if (rest) {
                    throwErrorTolerant(lookahead, Messages.DefaultRestParameter);
                }
                lex();
                def = parseAssignmentExpression();
                ++options.defaultCount;
            }
        }
        if (rest) {
            if (!match(')')) {
                throwError({}, Messages.ParameterAfterRestParameter);
            }
            options.rest = param;
            return false;
        }
        options.params.push(param);
        options.defaults.push(def);
        return !match(')');
    }
    function parseParams(firstRestricted) {
        var options;
        options = {
            params: [],
            defaultCount: 0,
            defaults: [],
            rest: null,
            firstRestricted: firstRestricted
        };
        expect('(');
        if (!match(')')) {
            options.paramSet = {};
            while (streamIndex < length) {
                if (!parseParam(options)) {
                    break;
                }
                expect(',');
            }
        }
        expect(')');
        if (options.defaultCount === 0) {
            options.defaults = [];
        }
        return options;
    }
    function parseFunctionDeclaration() {
        var id, body, token, tmp, firstRestricted, message, previousStrict, previousYieldAllowed, generator, expression;
        expectKeyword('function');
        generator = false;
        if (match('*')) {
            lex();
            generator = true;
        }
        token = lookahead;
        id = parseVariableIdentifier();
        if (strict) {
            if (isRestrictedWord(token.value)) {
                throwErrorTolerant(token, Messages.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord(token.value)) {
                firstRestricted = token;
                message = Messages.StrictFunctionName;
            } else if (isStrictModeReservedWord(token.value)) {
                firstRestricted = token;
                message = Messages.StrictReservedWord;
            }
        }
        tmp = parseParams(firstRestricted);
        firstRestricted = tmp.firstRestricted;
        if (tmp.message) {
            message = tmp.message;
        }
        previousStrict = strict;
        previousYieldAllowed = state.yieldAllowed;
        state.yieldAllowed = generator;
        // here we redo some work in order to set 'expression'
        expression = !match('{');
        body = parseConciseBody();
        if (strict && firstRestricted) {
            throwError(firstRestricted, message);
        }
        if (strict && tmp.stricted) {
            throwErrorTolerant(tmp.stricted, message);
        }
        if (state.yieldAllowed && !state.yieldFound) {
            throwErrorTolerant({}, Messages.NoYieldInGenerator);
        }
        strict = previousStrict;
        state.yieldAllowed = previousYieldAllowed;
        return delegate.createFunctionDeclaration(id, tmp.params, tmp.defaults, body, tmp.rest, generator, expression);
    }
    function parseFunctionExpression() {
        var token, id = null, firstRestricted, message, tmp, body, previousStrict, previousYieldAllowed, generator, expression;
        expectKeyword('function');
        generator = false;
        if (match('*')) {
            lex();
            generator = true;
        }
        if (!match('(')) {
            token = lookahead;
            id = parseVariableIdentifier();
            if (strict) {
                if (isRestrictedWord(token.value)) {
                    throwErrorTolerant(token, Messages.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictFunctionName;
                } else if (isStrictModeReservedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictReservedWord;
                }
            }
        }
        tmp = parseParams(firstRestricted);
        firstRestricted = tmp.firstRestricted;
        if (tmp.message) {
            message = tmp.message;
        }
        previousStrict = strict;
        previousYieldAllowed = state.yieldAllowed;
        state.yieldAllowed = generator;
        // here we redo some work in order to set 'expression'
        expression = !match('{');
        body = parseConciseBody();
        if (strict && firstRestricted) {
            throwError(firstRestricted, message);
        }
        if (strict && tmp.stricted) {
            throwErrorTolerant(tmp.stricted, message);
        }
        if (state.yieldAllowed && !state.yieldFound) {
            throwErrorTolerant({}, Messages.NoYieldInGenerator);
        }
        strict = previousStrict;
        state.yieldAllowed = previousYieldAllowed;
        return delegate.createFunctionExpression(id, tmp.params, tmp.defaults, body, tmp.rest, generator, expression);
    }
    function parseYieldExpression() {
        var delegateFlag, expr, previousYieldAllowed;
        expectKeyword('yield');
        if (!state.yieldAllowed) {
            throwErrorTolerant({}, Messages.IllegalYield);
        }
        delegateFlag = false;
        if (match('*')) {
            lex();
            delegateFlag = true;
        }
        // It is a Syntax Error if any AssignmentExpression Contains YieldExpression.
        previousYieldAllowed = state.yieldAllowed;
        state.yieldAllowed = false;
        expr = parseAssignmentExpression();
        state.yieldAllowed = previousYieldAllowed;
        state.yieldFound = true;
        return delegate.createYieldExpression(expr, delegateFlag);
    }
    // 14 Classes
    function parseMethodDefinition(existingPropNames) {
        var token, key, param, propType, isValidDuplicateProp = false;
        if (lookahead.value === 'static') {
            propType = ClassPropertyType.static;
            lex();
        } else {
            propType = ClassPropertyType.prototype;
        }
        if (match('*')) {
            lex();
            return delegate.createMethodDefinition(propType, '', parseObjectPropertyKey(), parsePropertyMethodFunction({ generator: true }));
        }
        token = lookahead;
        key = parseObjectPropertyKey();
        if (token.value === 'get' && !match('(')) {
            key = parseObjectPropertyKey();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a setter
            if (existingPropNames[propType].hasOwnProperty(key.name)) {
                isValidDuplicateProp = existingPropNames[propType][key.name].get === undefined && existingPropNames[propType][key.name].data === undefined && existingPropNames[propType][key.name].set !== undefined;
                if (!isValidDuplicateProp) {
                    throwError(key, Messages.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames[propType][key.name] = {};
            }
            existingPropNames[propType][key.name].get = true;
            expect('(');
            expect(')');
            return delegate.createMethodDefinition(propType, 'get', key, parsePropertyFunction({ generator: false }));
        }
        if (token.value === 'set' && !match('(')) {
            key = parseObjectPropertyKey();
            // It is a syntax error if any other properties have a name
            // duplicating this one unless they are a getter
            if (existingPropNames[propType].hasOwnProperty(key.name)) {
                isValidDuplicateProp = existingPropNames[propType][key.name].set === undefined && existingPropNames[propType][key.name].data === undefined && existingPropNames[propType][key.name].get !== undefined;
                if (!isValidDuplicateProp) {
                    throwError(key, Messages.IllegalDuplicateClassProperty);
                }
            } else {
                existingPropNames[propType][key.name] = {};
            }
            existingPropNames[propType][key.name].set = true;
            expect('(');
            token = lookahead;
            param = [parseVariableIdentifier()];
            expect(')');
            return delegate.createMethodDefinition(propType, 'set', key, parsePropertyFunction({
                params: param,
                generator: false,
                name: token
            }));
        }
        // It is a syntax error if any other properties have the same name as a
        // non-getter, non-setter method
        if (existingPropNames[propType].hasOwnProperty(key.name)) {
            throwError(key, Messages.IllegalDuplicateClassProperty);
        } else {
            existingPropNames[propType][key.name] = {};
        }
        existingPropNames[propType][key.name].data = true;
        return delegate.createMethodDefinition(propType, '', key, parsePropertyMethodFunction({ generator: false }));
    }
    function parseClassElement(existingProps) {
        if (match(';')) {
            lex();
            return;
        }
        return parseMethodDefinition(existingProps);
    }
    function parseClassBody() {
        var classElement, classElements = [], existingProps = {};
        existingProps[ClassPropertyType.static] = {};
        existingProps[ClassPropertyType.prototype] = {};
        expect('{');
        while (streamIndex < length) {
            if (match('}')) {
                break;
            }
            classElement = parseClassElement(existingProps);
            if (typeof classElement !== 'undefined') {
                classElements.push(classElement);
            }
        }
        expect('}');
        return delegate.createClassBody(classElements);
    }
    function parseClassExpression() {
        var id, previousYieldAllowed, superClass = null;
        expectKeyword('class');
        if (!matchKeyword('extends') && !match('{')) {
            id = parseVariableIdentifier();
        }
        if (matchKeyword('extends')) {
            expectKeyword('extends');
            previousYieldAllowed = state.yieldAllowed;
            state.yieldAllowed = false;
            superClass = parseAssignmentExpression();
            state.yieldAllowed = previousYieldAllowed;
        }
        return delegate.createClassExpression(id, superClass, parseClassBody());
    }
    function parseClassDeclaration() {
        var id, previousYieldAllowed, superClass = null;
        expectKeyword('class');
        id = parseVariableIdentifier();
        if (matchKeyword('extends')) {
            expectKeyword('extends');
            previousYieldAllowed = state.yieldAllowed;
            state.yieldAllowed = false;
            superClass = parseAssignmentExpression();
            state.yieldAllowed = previousYieldAllowed;
        }
        return delegate.createClassDeclaration(id, superClass, parseClassBody());
    }
    // 15 Program
    function matchModuleDeclaration() {
        var id;
        if (matchContextualKeyword('module')) {
            id = lookahead2();
            return id.type === Token.StringLiteral || id.type === Token.Identifier;
        }
        return false;
    }
    function parseSourceElement() {
        if (lookahead.type === Token.Keyword) {
            switch (lookahead.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration(lookahead.value);
            case 'function':
                return parseFunctionDeclaration();
            case 'export':
                return parseExportDeclaration();
            case 'import':
                return parseImportDeclaration();
            default:
                return parseStatement();
            }
        }
        if (matchModuleDeclaration()) {
            throwError({}, Messages.NestedModule);
        }
        if (lookahead.type !== Token.EOF) {
            return parseStatement();
        }
    }
    function parseProgramElement() {
        if (lookahead.type === Token.Keyword) {
            switch (lookahead.value) {
            case 'export':
                return parseExportDeclaration();
            case 'import':
                return parseImportDeclaration();
            }
        }
        if (matchModuleDeclaration()) {
            return parseModuleDeclaration();
        }
        return parseSourceElement();
    }
    function parseProgramElements() {
        var sourceElement, sourceElements = [], token, directive, firstRestricted;
        while (streamIndex < length) {
            token = lookahead;
            if (token.type !== Token.StringLiteral) {
                break;
            }
            sourceElement = parseProgramElement();
            sourceElements.push(sourceElement);
            if (sourceElement.expression.type !== Syntax.Literal) {
                // this is not directive
                break;
            }
            directive = token.value;
            if (directive === 'use strict') {
                strict = true;
                if (firstRestricted) {
                    throwErrorTolerant(firstRestricted, Messages.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted && token.octal) {
                    firstRestricted = token;
                }
            }
        }
        while (streamIndex < length) {
            sourceElement = parseProgramElement();
            if (typeof sourceElement === 'undefined') {
                break;
            }
            sourceElements.push(sourceElement);
        }
        return sourceElements;
    }
    function parseModuleElement() {
        return parseSourceElement();
    }
    function parseModuleElements() {
        var list = [], statement;
        while (streamIndex < length) {
            if (match('}')) {
                break;
            }
            statement = parseModuleElement();
            if (typeof statement === 'undefined') {
                break;
            }
            list.push(statement);
        }
        return list;
    }
    function parseModuleBlock() {
        var block;
        expect('{');
        block = parseModuleElements();
        expect('}');
        return delegate.createBlockStatement(block);
    }
    function parseProgram() {
        var body;
        strict = false;
        peek();
        body = parseProgramElements();
        return delegate.createProgram(body);
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment(type, value, start, end, loc) {
        assert(typeof start === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra.comments.length > 0) {
            if (extra.comments[extra.comments.length - 1].range[1] > start) {
                return;
            }
        }
        extra.comments.push({
            type: type,
            value: value,
            range: [
                start,
                end
            ],
            loc: loc
        });
    }
    function scanComment() {
        var comment, ch, loc, start, blockComment, lineComment;
        comment = '';
        blockComment = false;
        lineComment = false;
        while (index < length) {
            ch = source[index];
            if (lineComment) {
                ch = source[index++];
                if (isLineTerminator(ch.charCodeAt(0))) {
                    loc.end = {
                        line: lineNumber,
                        column: index - lineStart - 1
                    };
                    lineComment = false;
                    addComment('Line', comment, start, index - 1, loc);
                    if (ch === '\r' && source[index] === '\n') {
                        ++index;
                    }
                    ++lineNumber;
                    lineStart = index;
                    comment = '';
                } else if (index >= length) {
                    lineComment = false;
                    comment += ch;
                    loc.end = {
                        line: lineNumber,
                        column: length - lineStart
                    };
                    addComment('Line', comment, start, length, loc);
                } else {
                    comment += ch;
                }
            } else if (blockComment) {
                if (isLineTerminator(ch.charCodeAt(0))) {
                    if (ch === '\r' && source[index + 1] === '\n') {
                        ++index;
                        comment += '\r\n';
                    } else {
                        comment += ch;
                    }
                    ++lineNumber;
                    ++index;
                    lineStart = index;
                    if (index >= length) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch = source[index++];
                    if (index >= length) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                    comment += ch;
                    if (ch === '*') {
                        ch = source[index];
                        if (ch === '/') {
                            comment = comment.substr(0, comment.length - 1);
                            blockComment = false;
                            ++index;
                            loc.end = {
                                line: lineNumber,
                                column: index - lineStart
                            };
                            addComment('Block', comment, start, index, loc);
                            comment = '';
                        }
                    }
                }
            } else if (ch === '/') {
                ch = source[index + 1];
                if (ch === '/') {
                    loc = {
                        start: {
                            line: lineNumber,
                            column: index - lineStart
                        }
                    };
                    start = index;
                    index += 2;
                    lineComment = true;
                    if (index >= length) {
                        loc.end = {
                            line: lineNumber,
                            column: index - lineStart
                        };
                        lineComment = false;
                        addComment('Line', comment, start, index, loc);
                    }
                } else if (ch === '*') {
                    start = index;
                    index += 2;
                    blockComment = true;
                    loc = {
                        start: {
                            line: lineNumber,
                            column: index - lineStart - 2
                        }
                    };
                    if (index >= length) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace(ch.charCodeAt(0))) {
                ++index;
            } else if (isLineTerminator(ch.charCodeAt(0))) {
                ++index;
                if (ch === '\r' && source[index] === '\n') {
                    ++index;
                }
                ++lineNumber;
                lineStart = index;
            } else {
                break;
            }
        }
    }
    function filterCommentLocation() {
        var i, entry, comment, comments = [];
        for (i = 0; i < extra.comments.length; ++i) {
            entry = extra.comments[i];
            comment = {
                type: entry.type,
                value: entry.value
            };
            if (extra.range) {
                comment.range = entry.range;
            }
            if (extra.loc) {
                comment.loc = entry.loc;
            }
            comments.push(comment);
        }
        extra.comments = comments;
    }
    function collectToken() {
        var start, loc, token, range, value;
        skipComment();
        start = index;
        loc = {
            start: {
                line: lineNumber,
                column: index - lineStart
            }
        };
        token = extra.advance();
        loc.end = {
            line: lineNumber,
            column: index - lineStart
        };
        if (token.type !== Token.EOF) {
            range = [
                token.range[0],
                token.range[1]
            ];
            value = source.slice(token.range[0], token.range[1]);
            extra.tokens.push({
                type: TokenName[token.type],
                value: value,
                range: range,
                loc: loc
            });
        }
        return token;
    }
    function collectRegex() {
        var pos, loc, regex, token;
        skipComment();
        pos = index;
        loc = {
            start: {
                line: lineNumber,
                column: index - lineStart
            }
        };
        regex = extra.scanRegExp();
        loc.end = {
            line: lineNumber,
            column: index - lineStart
        };
        if (!extra.tokenize) {
            // Pop the previous token, which is likely '/' or '/='
            if (extra.tokens.length > 0) {
                token = extra.tokens[extra.tokens.length - 1];
                if (token.range[0] === pos && token.type === 'Punctuator') {
                    if (token.value === '/' || token.value === '/=') {
                        extra.tokens.pop();
                    }
                }
            }
            extra.tokens.push({
                type: 'RegularExpression',
                value: regex.literal,
                range: [
                    pos,
                    index
                ],
                loc: loc
            });
        }
        return regex;
    }
    function filterTokenLocation() {
        var i, entry, token, tokens = [];
        for (i = 0; i < extra.tokens.length; ++i) {
            entry = extra.tokens[i];
            token = {
                type: entry.type,
                value: entry.value
            };
            if (extra.range) {
                token.range = entry.range;
            }
            if (extra.loc) {
                token.loc = entry.loc;
            }
            tokens.push(token);
        }
        extra.tokens = tokens;
    }
    function LocationMarker() {
        var sm_index$2 = lookahead ? lookahead.sm_range[0] : 0;
        var sm_lineStart$2 = lookahead ? lookahead.sm_lineStart : 0;
        var sm_lineNumber$2 = lookahead ? lookahead.sm_lineNumber : 1;
        this.range = [
            sm_index$2,
            sm_index$2
        ];
        this.loc = {
            start: {
                line: sm_lineNumber$2,
                column: sm_index$2 - sm_lineStart$2
            },
            end: {
                line: sm_lineNumber$2,
                column: sm_index$2 - sm_lineStart$2
            }
        };
    }
    LocationMarker.prototype = {
        constructor: LocationMarker,
        end: function () {
            this.range[1] = sm_index;
            this.loc.end.line = sm_lineNumber;
            this.loc.end.column = sm_index - sm_lineStart;
        },
        applyGroup: function (node) {
            if (extra.range) {
                node.groupRange = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra.loc) {
                node.groupLoc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node = delegate.postProcess(node);
            }
        },
        apply: function (node) {
            var nodeType = typeof node;
            assert(nodeType === 'object', 'Applying location marker to an unexpected node type: ' + nodeType);
            if (extra.range) {
                node.range = [
                    this.range[0],
                    this.range[1]
                ];
            }
            if (extra.loc) {
                node.loc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
                node = delegate.postProcess(node);
            }
        }
    };
    function createLocationMarker() {
        return new LocationMarker();
    }
    function trackGroupExpression() {
        var marker, expr;
        marker = createLocationMarker();
        expect('(');
        ++state.parenthesizedCount;
        expr = parseExpression();
        expect(')');
        marker.end();
        marker.applyGroup(expr);
        return expr;
    }
    function trackLeftHandSideExpression() {
        var marker, expr;
        // skipComment();
        marker = createLocationMarker();
        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();
        while (match('.') || match('[') || lookahead.type === Token.Template) {
            if (match('[')) {
                expr = delegate.createMemberExpression('[', expr, parseComputedMember());
                marker.end();
                marker.apply(expr);
            } else if (match('.')) {
                expr = delegate.createMemberExpression('.', expr, parseNonComputedMember());
                marker.end();
                marker.apply(expr);
            } else {
                expr = delegate.createTaggedTemplateExpression(expr, parseTemplateLiteral());
                marker.end();
                marker.apply(expr);
            }
        }
        return expr;
    }
    function trackLeftHandSideExpressionAllowCall() {
        var marker, expr, args;
        // skipComment();
        marker = createLocationMarker();
        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();
        while (match('.') || match('[') || match('(') || lookahead.type === Token.Template) {
            if (match('(')) {
                args = parseArguments();
                expr = delegate.createCallExpression(expr, args);
                marker.end();
                marker.apply(expr);
            } else if (match('[')) {
                expr = delegate.createMemberExpression('[', expr, parseComputedMember());
                marker.end();
                marker.apply(expr);
            } else if (match('.')) {
                expr = delegate.createMemberExpression('.', expr, parseNonComputedMember());
                marker.end();
                marker.apply(expr);
            } else {
                expr = delegate.createTaggedTemplateExpression(expr, parseTemplateLiteral());
                marker.end();
                marker.apply(expr);
            }
        }
        return expr;
    }
    function filterGroup(node) {
        var n, i, entry;
        n = Object.prototype.toString.apply(node) === '[object Array]' ? [] : {};
        for (i in node) {
            if (node.hasOwnProperty(i) && i !== 'groupRange' && i !== 'groupLoc') {
                entry = node[i];
                if (entry === null || typeof entry !== 'object' || entry instanceof RegExp) {
                    n[i] = entry;
                } else {
                    n[i] = filterGroup(entry);
                }
            }
        }
        return n;
    }
    function wrapTrackingFunction(range, loc) {
        return function (parseFunction) {
            function isBinary(node) {
                return node.type === Syntax.LogicalExpression || node.type === Syntax.BinaryExpression;
            }
            function visit(node) {
                var start, end;
                if (isBinary(node.left)) {
                    visit(node.left);
                }
                if (isBinary(node.right)) {
                    visit(node.right);
                }
                if (range) {
                    if (node.left.groupRange || node.right.groupRange) {
                        start = node.left.groupRange ? node.left.groupRange[0] : node.left.range[0];
                        end = node.right.groupRange ? node.right.groupRange[1] : node.right.range[1];
                        node.range = [
                            start,
                            end
                        ];
                    } else if (typeof node.range === 'undefined') {
                        start = node.left.range[0];
                        end = node.right.range[1];
                        node.range = [
                            start,
                            end
                        ];
                    }
                }
                if (loc) {
                    if (node.left.groupLoc || node.right.groupLoc) {
                        start = node.left.groupLoc ? node.left.groupLoc.start : node.left.loc.start;
                        end = node.right.groupLoc ? node.right.groupLoc.end : node.right.loc.end;
                        node.loc = {
                            start: start,
                            end: end
                        };
                        node = delegate.postProcess(node);
                    } else if (typeof node.loc === 'undefined') {
                        node.loc = {
                            start: node.left.loc.start,
                            end: node.right.loc.end
                        };
                        node = delegate.postProcess(node);
                    }
                }
            }
            return function () {
                var marker, node, curr = lookahead;
                marker = createLocationMarker();
                node = parseFunction.apply(null, arguments);
                marker.end();
                if (node.type !== Syntax.Program) {
                    if (curr.leadingComments) {
                        node.leadingComments = curr.leadingComments;
                    }
                    if (curr.trailingComments) {
                        node.trailingComments = curr.trailingComments;
                    }
                }
                if (range && typeof node.range === 'undefined') {
                    marker.apply(node);
                }
                if (loc && typeof node.loc === 'undefined') {
                    marker.apply(node);
                }
                if (isBinary(node)) {
                    visit(node);
                }
                return node;
            };
        };
    }
    function patch() {
        var wrapTracking;
        if (extra.comments) {
            extra.skipComment = skipComment;
            skipComment = scanComment;
        }
        if (extra.range || extra.loc) {
            extra.parseGroupExpression = parseGroupExpression;
            extra.parseLeftHandSideExpression = parseLeftHandSideExpression;
            extra.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall;
            parseGroupExpression = trackGroupExpression;
            parseLeftHandSideExpression = trackLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall = trackLeftHandSideExpressionAllowCall;
            wrapTracking = wrapTrackingFunction(extra.range, extra.loc);
            extra.parseArrayInitialiser = parseArrayInitialiser;
            extra.parseAssignmentExpression = parseAssignmentExpression;
            extra.parseBinaryExpression = parseBinaryExpression;
            extra.parseBlock = parseBlock;
            extra.parseFunctionSourceElements = parseFunctionSourceElements;
            extra.parseCatchClause = parseCatchClause;
            extra.parseComputedMember = parseComputedMember;
            extra.parseConditionalExpression = parseConditionalExpression;
            extra.parseConstLetDeclaration = parseConstLetDeclaration;
            extra.parseExportBatchSpecifier = parseExportBatchSpecifier;
            extra.parseExportDeclaration = parseExportDeclaration;
            extra.parseExportSpecifier = parseExportSpecifier;
            extra.parseExpression = parseExpression;
            extra.parseForVariableDeclaration = parseForVariableDeclaration;
            extra.parseFunctionDeclaration = parseFunctionDeclaration;
            extra.parseFunctionExpression = parseFunctionExpression;
            extra.parseParams = parseParams;
            extra.parseImportDeclaration = parseImportDeclaration;
            extra.parseImportSpecifier = parseImportSpecifier;
            extra.parseModuleDeclaration = parseModuleDeclaration;
            extra.parseModuleBlock = parseModuleBlock;
            extra.parseNewExpression = parseNewExpression;
            extra.parseNonComputedProperty = parseNonComputedProperty;
            extra.parseObjectInitialiser = parseObjectInitialiser;
            extra.parseObjectProperty = parseObjectProperty;
            extra.parseObjectPropertyKey = parseObjectPropertyKey;
            extra.parsePostfixExpression = parsePostfixExpression;
            extra.parsePrimaryExpression = parsePrimaryExpression;
            extra.parseProgram = parseProgram;
            extra.parsePropertyFunction = parsePropertyFunction;
            extra.parseSpreadOrAssignmentExpression = parseSpreadOrAssignmentExpression;
            extra.parseTemplateElement = parseTemplateElement;
            extra.parseTemplateLiteral = parseTemplateLiteral;
            extra.parseStatement = parseStatement;
            extra.parseSwitchCase = parseSwitchCase;
            extra.parseUnaryExpression = parseUnaryExpression;
            extra.parseVariableDeclaration = parseVariableDeclaration;
            extra.parseVariableIdentifier = parseVariableIdentifier;
            extra.parseMethodDefinition = parseMethodDefinition;
            extra.parseClassDeclaration = parseClassDeclaration;
            extra.parseClassExpression = parseClassExpression;
            extra.parseClassBody = parseClassBody;
            parseArrayInitialiser = wrapTracking(extra.parseArrayInitialiser);
            parseAssignmentExpression = wrapTracking(extra.parseAssignmentExpression);
            parseBinaryExpression = wrapTracking(extra.parseBinaryExpression);
            parseBlock = wrapTracking(extra.parseBlock);
            parseFunctionSourceElements = wrapTracking(extra.parseFunctionSourceElements);
            parseCatchClause = wrapTracking(extra.parseCatchClause);
            parseComputedMember = wrapTracking(extra.parseComputedMember);
            parseConditionalExpression = wrapTracking(extra.parseConditionalExpression);
            parseConstLetDeclaration = wrapTracking(extra.parseConstLetDeclaration);
            parseExportBatchSpecifier = wrapTracking(parseExportBatchSpecifier);
            parseExportDeclaration = wrapTracking(parseExportDeclaration);
            parseExportSpecifier = wrapTracking(parseExportSpecifier);
            parseExpression = wrapTracking(extra.parseExpression);
            parseForVariableDeclaration = wrapTracking(extra.parseForVariableDeclaration);
            parseFunctionDeclaration = wrapTracking(extra.parseFunctionDeclaration);
            parseFunctionExpression = wrapTracking(extra.parseFunctionExpression);
            parseParams = wrapTracking(extra.parseParams);
            parseImportDeclaration = wrapTracking(extra.parseImportDeclaration);
            parseImportSpecifier = wrapTracking(extra.parseImportSpecifier);
            parseModuleDeclaration = wrapTracking(extra.parseModuleDeclaration);
            parseModuleBlock = wrapTracking(extra.parseModuleBlock);
            parseLeftHandSideExpression = wrapTracking(parseLeftHandSideExpression);
            parseNewExpression = wrapTracking(extra.parseNewExpression);
            parseNonComputedProperty = wrapTracking(extra.parseNonComputedProperty);
            parseObjectInitialiser = wrapTracking(extra.parseObjectInitialiser);
            parseObjectProperty = wrapTracking(extra.parseObjectProperty);
            parseObjectPropertyKey = wrapTracking(extra.parseObjectPropertyKey);
            parsePostfixExpression = wrapTracking(extra.parsePostfixExpression);
            parsePrimaryExpression = wrapTracking(extra.parsePrimaryExpression);
            parseProgram = wrapTracking(extra.parseProgram);
            parsePropertyFunction = wrapTracking(extra.parsePropertyFunction);
            parseTemplateElement = wrapTracking(extra.parseTemplateElement);
            parseTemplateLiteral = wrapTracking(extra.parseTemplateLiteral);
            parseSpreadOrAssignmentExpression = wrapTracking(extra.parseSpreadOrAssignmentExpression);
            parseStatement = wrapTracking(extra.parseStatement);
            parseSwitchCase = wrapTracking(extra.parseSwitchCase);
            parseUnaryExpression = wrapTracking(extra.parseUnaryExpression);
            parseVariableDeclaration = wrapTracking(extra.parseVariableDeclaration);
            parseVariableIdentifier = wrapTracking(extra.parseVariableIdentifier);
            parseMethodDefinition = wrapTracking(extra.parseMethodDefinition);
            parseClassDeclaration = wrapTracking(extra.parseClassDeclaration);
            parseClassExpression = wrapTracking(extra.parseClassExpression);
            parseClassBody = wrapTracking(extra.parseClassBody);
        }
        if (typeof extra.tokens !== 'undefined') {
            extra.advance = advance;
            extra.scanRegExp = scanRegExp;
            advance = collectToken;
            scanRegExp = collectRegex;
        }
    }
    function unpatch() {
        if (typeof extra.skipComment === 'function') {
            skipComment = extra.skipComment;
        }
        if (extra.range || extra.loc) {
            parseArrayInitialiser = extra.parseArrayInitialiser;
            parseAssignmentExpression = extra.parseAssignmentExpression;
            parseBinaryExpression = extra.parseBinaryExpression;
            parseBlock = extra.parseBlock;
            parseFunctionSourceElements = extra.parseFunctionSourceElements;
            parseCatchClause = extra.parseCatchClause;
            parseComputedMember = extra.parseComputedMember;
            parseConditionalExpression = extra.parseConditionalExpression;
            parseConstLetDeclaration = extra.parseConstLetDeclaration;
            parseExportBatchSpecifier = extra.parseExportBatchSpecifier;
            parseExportDeclaration = extra.parseExportDeclaration;
            parseExportSpecifier = extra.parseExportSpecifier;
            parseExpression = extra.parseExpression;
            parseForVariableDeclaration = extra.parseForVariableDeclaration;
            parseFunctionDeclaration = extra.parseFunctionDeclaration;
            parseFunctionExpression = extra.parseFunctionExpression;
            parseImportDeclaration = extra.parseImportDeclaration;
            parseImportSpecifier = extra.parseImportSpecifier;
            parseGroupExpression = extra.parseGroupExpression;
            parseLeftHandSideExpression = extra.parseLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall = extra.parseLeftHandSideExpressionAllowCall;
            parseModuleDeclaration = extra.parseModuleDeclaration;
            parseModuleBlock = extra.parseModuleBlock;
            parseNewExpression = extra.parseNewExpression;
            parseNonComputedProperty = extra.parseNonComputedProperty;
            parseObjectInitialiser = extra.parseObjectInitialiser;
            parseObjectProperty = extra.parseObjectProperty;
            parseObjectPropertyKey = extra.parseObjectPropertyKey;
            parsePostfixExpression = extra.parsePostfixExpression;
            parsePrimaryExpression = extra.parsePrimaryExpression;
            parseProgram = extra.parseProgram;
            parsePropertyFunction = extra.parsePropertyFunction;
            parseTemplateElement = extra.parseTemplateElement;
            parseTemplateLiteral = extra.parseTemplateLiteral;
            parseSpreadOrAssignmentExpression = extra.parseSpreadOrAssignmentExpression;
            parseStatement = extra.parseStatement;
            parseSwitchCase = extra.parseSwitchCase;
            parseUnaryExpression = extra.parseUnaryExpression;
            parseVariableDeclaration = extra.parseVariableDeclaration;
            parseVariableIdentifier = extra.parseVariableIdentifier;
            parseMethodDefinition = extra.parseMethodDefinition;
            parseClassDeclaration = extra.parseClassDeclaration;
            parseClassExpression = extra.parseClassExpression;
            parseClassBody = extra.parseClassBody;
        }
        if (typeof extra.scanRegExp === 'function') {
            advance = extra.advance;
            scanRegExp = extra.scanRegExp;
        }
    }
    // This is used to modify the delegate.
    function extend(object, properties) {
        var entry, result = {};
        for (entry in object) {
            if (object.hasOwnProperty(entry)) {
                result[entry] = object[entry];
            }
        }
        for (entry in properties) {
            if (properties.hasOwnProperty(entry)) {
                result[entry] = properties[entry];
            }
        }
        return result;
    }
    function tokenize(code, options) {
        var toString, token, tokens;
        toString = String;
        if (typeof code !== 'string' && !(code instanceof String)) {
            code = toString(code);
        }
        delegate = SyntaxTreeDelegate;
        source = code;
        index = 0;
        lineNumber = source.length > 0 ? 1 : 0;
        lineStart = 0;
        length = source.length;
        lookahead = null;
        state = {
            allowKeyword: true,
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra = {};
        // Options matching.
        options = options || {};
        // Of course we collect tokens here.
        options.tokens = true;
        extra.tokens = [];
        extra.tokenize = true;
        // The following two fields are necessary to compute the Regex tokens.
        extra.openParenToken = -1;
        extra.openCurlyToken = -1;
        extra.range = typeof options.range === 'boolean' && options.range;
        extra.loc = typeof options.loc === 'boolean' && options.loc;
        if (typeof options.comment === 'boolean' && options.comment) {
            extra.comments = [];
        }
        if (typeof options.tolerant === 'boolean' && options.tolerant) {
            extra.errors = [];
        }
        if (length > 0) {
            if (typeof source[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code instanceof String) {
                    source = code.valueOf();
                }
            }
        }
        patch();
        try {
            peek();
            if (lookahead.type === Token.EOF) {
                return extra.tokens;
            }
            token = lex();
            while (lookahead.type !== Token.EOF) {
                try {
                    token = lex();
                } catch (lexError) {
                    token = lookahead;
                    if (extra.errors) {
                        extra.errors.push(lexError);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError;
                    }
                }
            }
            filterTokenLocation();
            tokens = extra.tokens;
            if (typeof extra.comments !== 'undefined') {
                filterCommentLocation();
                tokens.comments = extra.comments;
            }
            if (typeof extra.errors !== 'undefined') {
                tokens.errors = extra.errors;
            }
        } catch (e) {
            throw e;
        } finally {
            unpatch();
            extra = {};
        }
        return tokens;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed(toks, start, inExprDelim, parentIsBlock) {
        var assignOps = [
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
        var binaryOps = [
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
        var unaryOps = [
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
        function back(n) {
            var idx = toks.length - n > 0 ? toks.length - n : 0;
            return toks[idx];
        }
        if (inExprDelim && toks.length - (start + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back(start + 2).value === ':' && parentIsBlock) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn(back(start + 2).value, unaryOps.concat(binaryOps).concat(assignOps))) {
            // ... + {...}
            return false;
        } else if (back(start + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber = typeof back(start + 1).startLineNumber !== 'undefined' ? back(start + 1).startLineNumber : back(start + 1).lineNumber;
            if (back(start + 2).lineNumber !== currLineNumber) {
                return true;
            } else {
                return false;
            }
        } else if (isIn(back(start + 2).value, [
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
    function readToken(toks, inExprDelim, parentIsBlock) {
        var delimiters = [
                '(',
                '{',
                '['
            ];
        var parenIdents = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last = toks.length - 1;
        var comments, commentsLen = extra.comments.length;
        function back(n) {
            var idx = toks.length - n > 0 ? toks.length - n : 0;
            return toks[idx];
        }
        function attachComments(token) {
            if (comments) {
                token.leadingComments = comments;
            }
            return token;
        }
        function _advance() {
            return attachComments(advance());
        }
        function _scanRegExp() {
            return attachComments(scanRegExp());
        }
        skipComment();
        if (extra.comments.length > commentsLen) {
            comments = extra.comments.slice(commentsLen);
        }
        if (isIn(source[index], delimiters)) {
            return attachComments(readDelim(toks, inExprDelim, parentIsBlock));
        }
        if (source[index] === '/') {
            var prev = back(1);
            if (prev) {
                if (prev.value === '()') {
                    if (isIn(back(2).value, parenIdents)) {
                        // ... if (...) / ...
                        return _scanRegExp();
                    }
                    // ... (...) / ...
                    return _advance();
                }
                if (prev.value === '{}') {
                    if (blockAllowed(toks, 0, inExprDelim, parentIsBlock)) {
                        if (back(2).value === '()') {
                            // named function
                            if (back(4).value === 'function') {
                                if (!blockAllowed(toks, 3, inExprDelim, parentIsBlock)) {
                                    // new function foo (...) {...} / ...
                                    return _advance();
                                }
                                if (toks.length - 5 <= 0 && inExprDelim) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance();
                                }
                            }
                            // unnamed function
                            if (back(3).value === 'function') {
                                if (!blockAllowed(toks, 2, inExprDelim, parentIsBlock)) {
                                    // new function (...) {...} / ...
                                    return _advance();
                                }
                                if (toks.length - 4 <= 0 && inExprDelim) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp();
                    } else {
                        // ... + {...} / ...
                        return _advance();
                    }
                }
                if (prev.type === Token.Punctuator) {
                    // ... + /...
                    return _scanRegExp();
                }
                if (isKeyword(prev.value) && prev.value !== 'this' && prev.value !== 'let') {
                    // typeof /...
                    return _scanRegExp();
                }
                return _advance();
            }
            return _scanRegExp();
        }
        return _advance();
    }
    function readDelim(toks, inExprDelim, parentIsBlock) {
        var startDelim = advance(), matchDelim = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner = [];
        var delimiters = [
                '(',
                '{',
                '['
            ];
        assert(delimiters.indexOf(startDelim.value) !== -1, 'Need to begin at the delimiter');
        var token = startDelim;
        var startLineNumber = token.lineNumber;
        var startLineStart = token.lineStart;
        var startRange = token.range;
        var delimToken = {};
        delimToken.type = Token.Delimiter;
        delimToken.value = startDelim.value + matchDelim[startDelim.value];
        delimToken.startLineNumber = startLineNumber;
        delimToken.startLineStart = startLineStart;
        delimToken.startRange = startRange;
        var delimIsBlock = false;
        if (startDelim.value === '{') {
            delimIsBlock = blockAllowed(toks.concat(delimToken), 0, inExprDelim, parentIsBlock);
        }
        while (index <= length) {
            token = readToken(inner, startDelim.value === '(' || startDelim.value === '[', delimIsBlock);
            if (token.type === Token.Punctuator && token.value === matchDelim[startDelim.value]) {
                if (token.leadingComments) {
                    delimToken.trailingComments = token.leadingComments;
                }
                break;
            } else if (token.type === Token.EOF) {
                throwError({}, Messages.UnexpectedEOS);
            } else {
                inner.push(token);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index >= length && matchDelim[startDelim.value] !== source[length - 1]) {
            throwError({}, Messages.UnexpectedEOS);
        }
        var endLineNumber = token.lineNumber;
        var endLineStart = token.lineStart;
        var endRange = token.range;
        delimToken.inner = inner;
        delimToken.endLineNumber = endLineNumber;
        delimToken.endLineStart = endLineStart;
        delimToken.endRange = endRange;
        return delimToken;
    }
    // (Str) -> [...CSyntax]
    function read(code) {
        var token, tokenTree = [];
        extra = {};
        extra.comments = [];
        patch();
        source = code;
        index = 0;
        lineNumber = source.length > 0 ? 1 : 0;
        lineStart = 0;
        length = source.length;
        state = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index < length) {
            tokenTree.push(readToken(tokenTree, false, false));
        }
        var last = tokenTree[tokenTree.length - 1];
        if (last && last.type !== Token.EOF) {
            tokenTree.push({
                type: Token.EOF,
                value: '',
                lineNumber: last.lineNumber,
                lineStart: last.lineStart,
                range: [
                    index,
                    index
                ]
            });
        }
        return expander.tokensToSyntax(tokenTree);
    }
    function parse(code, options) {
        var program, toString;
        extra = {};
        // given an array of tokens instead of a string
        if (Array.isArray(code)) {
            tokenStream = code;
            length = tokenStream.length;
            lineNumber = tokenStream.length > 0 ? 1 : 0;
            source = undefined;
        } else {
            toString = String;
            if (typeof code !== 'string' && !(code instanceof String)) {
                code = toString(code);
            }
            source = code;
            length = source.length;
            lineNumber = source.length > 0 ? 1 : 0;
        }
        delegate = SyntaxTreeDelegate;
        streamIndex = -1;
        index = 0;
        lineStart = 0;
        sm_lineStart = 0;
        sm_lineNumber = lineNumber;
        sm_index = 0;
        sm_range = [
            0,
            0
        ];
        lookahead = null;
        state = {
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
        if (typeof options !== 'undefined') {
            extra.range = typeof options.range === 'boolean' && options.range;
            extra.loc = typeof options.loc === 'boolean' && options.loc;
            if (extra.loc && options.source !== null && options.source !== undefined) {
                delegate = extend(delegate, {
                    'postProcess': function (node) {
                        node.loc.source = toString(options.source);
                        return node;
                    }
                });
            }
            if (typeof options.tokens === 'boolean' && options.tokens) {
                extra.tokens = [];
            }
            if (typeof options.comment === 'boolean' && options.comment) {
                extra.comments = [];
            }
            if (typeof options.tolerant === 'boolean' && options.tolerant) {
                extra.errors = [];
            }
        }
        if (length > 0) {
            if (source && typeof source[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code instanceof String) {
                    source = code.valueOf();
                }
            }
        }
        extra = {
            loc: true,
            errors: []
        };
        patch();
        try {
            program = parseProgram();
            if (typeof extra.comments !== 'undefined') {
                filterCommentLocation();
                program.comments = extra.comments;
            }
            if (typeof extra.tokens !== 'undefined') {
                filterTokenLocation();
                program.tokens = extra.tokens;
            }
            if (typeof extra.errors !== 'undefined') {
                program.errors = extra.errors;
            }
            if (extra.range || extra.loc) {
                program.body = filterGroup(program.body);
            }
        } catch (e) {
            throw e;
        } finally {
            unpatch();
            extra = {};
        }
        return program;
    }
    exports$2.tokenize = tokenize;
    exports$2.read = read;
    exports$2.Token = Token;
    exports$2.parse = parse;
    // Deep copy.
    exports$2.Syntax = function () {
        var name, types = {};
        if (typeof Object.create === 'function') {
            types = Object.create(null);
        }
        for (name in Syntax) {
            if (Syntax.hasOwnProperty(name)) {
                types[name] = Syntax[name];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types);
        }
        return types;
    }();
}));
//# sourceMappingURL=parser.js.map