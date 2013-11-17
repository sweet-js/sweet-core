/*
  Copyright (C) 2012 Tim Disney <tim@disnet.me>
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
/*global exports:true,
throwError: true, createLiteral: true, generateStatement: true,
parseAssignmentExpression: true, parseBlock: true, parseExpression: true,
parseFunctionDeclaration: true, parseFunctionExpression: true,
parseFunctionSourceElements: true, parseVariableIdentifier: true,
parseLeftHandSideExpression: true,
parseStatement: true, parseSourceElement: true */
/*
This is a modified version of the esprima parser. It decouples the lexer
from the parser; lex() and lookahead() don't call advance(), instead they
just grab the next token from the tokenStream array. 

Also, it adds a lisp-style read() function that fully matches all 
delimiters and produces a read tree. Note that the parser still expects
a flat array not a read tree.

The parser also expects the tokens to be syntax objects (created by
a macro expander) which are tokens that track their lexical context.
Where necessary, the parser uses the expander resolve() function
to decide on the correct name for identifiers.
*/
(function (root$111, factory$112) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$112(exports, require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'expander'
        ], factory$112);
    }
}(this, function (exports$113, expander$114) {
    'use strict';
    var Token$115, TokenName$116, Syntax$117, PropertyKind$118, Messages$119, Regex$120, source$121, strict$122, index$123, lineNumber$124, lineStart$125, length$126, buffer$127, state$128, tokenStream$129, extra$130;
    Token$115 = {
        BooleanLiteral: 1,
        EOF: 2,
        Identifier: 3,
        Keyword: 4,
        NullLiteral: 5,
        NumericLiteral: 6,
        Punctuator: 7,
        StringLiteral: 8,
        Delimiter: 9,
        Pattern: 10,
        RegexLiteral: 11
    };
    TokenName$116 = {};
    TokenName$116[Token$115.BooleanLiteral] = 'Boolean';
    TokenName$116[Token$115.EOF] = '<end>';
    TokenName$116[Token$115.Identifier] = 'Identifier';
    TokenName$116[Token$115.Keyword] = 'Keyword';
    TokenName$116[Token$115.NullLiteral] = 'Null';
    TokenName$116[Token$115.NumericLiteral] = 'Numeric';
    TokenName$116[Token$115.Punctuator] = 'Punctuator';
    TokenName$116[Token$115.StringLiteral] = 'String';
    TokenName$116[Token$115.Delimiter] = 'Delimiter';
    Syntax$117 = {
        AssignmentExpression: 'AssignmentExpression',
        ArrayExpression: 'ArrayExpression',
        BlockStatement: 'BlockStatement',
        BinaryExpression: 'BinaryExpression',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DoWhileStatement: 'DoWhileStatement',
        DebuggerStatement: 'DebuggerStatement',
        EmptyStatement: 'EmptyStatement',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        ForInStatement: 'ForInStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        Literal: 'Literal',
        LabeledStatement: 'LabeledStatement',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        Program: 'Program',
        Property: 'Property',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SwitchStatement: 'SwitchStatement',
        SwitchCase: 'SwitchCase',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement'
    };
    PropertyKind$118 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    // Error messages should be identical to V8.
    Messages$119 = {
        UnexpectedToken: 'Unexpected token %0',
        UnexpectedNumber: 'Unexpected number',
        UnexpectedString: 'Unexpected string',
        UnexpectedIdentifier: 'Unexpected identifier',
        UnexpectedReserved: 'Unexpected reserved word',
        UnexpectedEOS: 'Unexpected end of input',
        NewlineAfterThrow: 'Illegal newline after throw',
        InvalidRegExp: 'Invalid regular expression',
        UnterminatedRegExp: 'Invalid regular expression: missing /',
        InvalidLHSInAssignment: 'Invalid left-hand side in assignment',
        InvalidLHSInForIn: 'Invalid left-hand side in for-in',
        NoCatchOrFinally: 'Missing catch or finally after try',
        UnknownLabel: 'Undefined label \'%0\'',
        Redeclaration: '%0 \'%1\' has already been declared',
        IllegalContinue: 'Illegal continue statement',
        IllegalBreak: 'Illegal break statement',
        IllegalReturn: 'Illegal return statement',
        StrictModeWith: 'Strict mode code may not include a with statement',
        StrictCatchVariable: 'Catch variable may not be eval or arguments in strict mode',
        StrictVarName: 'Variable name may not be eval or arguments in strict mode',
        StrictParamName: 'Parameter name eval or arguments is not allowed in strict mode',
        StrictParamDupe: 'Strict mode function may not have duplicate parameter names',
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
        UnmatchedDelimiter: 'Unmatched Delimiter'
    };
    // See also tools/generate-unicode-regex.py.
    Regex$120 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$131(condition$246, message$247) {
        if (!condition$246) {
            throw new Error('ASSERT: ' + message$247);
        }
    }
    function isIn$132(el$248, list$249) {
        return list$249.indexOf(el$248) !== -1;
    }
    function sliceSource$133(from$250, to$251) {
        return source$121.slice(from$250, to$251);
    }
    if (typeof 'esprima'[0] === 'undefined') {
        sliceSource$133 = function sliceArraySource$252(from$253, to$254) {
            return source$121.slice(from$253, to$254).join('');
        };
    }
    function isDecimalDigit$134(ch$255) {
        return '0123456789'.indexOf(ch$255) >= 0;
    }
    function isHexDigit$135(ch$256) {
        return '0123456789abcdefABCDEF'.indexOf(ch$256) >= 0;
    }
    function isOctalDigit$136(ch$257) {
        return '01234567'.indexOf(ch$257) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$137(ch$258) {
        return ch$258 === ' ' || ch$258 === '\t' || ch$258 === '\x0B' || ch$258 === '\f' || ch$258 === '\xa0' || ch$258.charCodeAt(0) >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(ch$258) >= 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$138(ch$259) {
        return ch$259 === '\n' || ch$259 === '\r' || ch$259 === '\u2028' || ch$259 === '\u2029';
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$139(ch$260) {
        return ch$260 === '$' || ch$260 === '_' || ch$260 === '\\' || ch$260 >= 'a' && ch$260 <= 'z' || ch$260 >= 'A' && ch$260 <= 'Z' || ch$260.charCodeAt(0) >= 128 && Regex$120.NonAsciiIdentifierStart.test(ch$260);
    }
    function isIdentifierPart$140(ch$261) {
        return ch$261 === '$' || ch$261 === '_' || ch$261 === '\\' || ch$261 >= 'a' && ch$261 <= 'z' || ch$261 >= 'A' && ch$261 <= 'Z' || ch$261 >= '0' && ch$261 <= '9' || ch$261.charCodeAt(0) >= 128 && Regex$120.NonAsciiIdentifierPart.test(ch$261);
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$141(id$262) {
        // we are allowing future reserved words so macros can be written for them
        return false;
    }
    function isStrictModeReservedWord$142(id$263) {
        switch (id$263) {
        // Strict Mode reserved words.
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
        }
        return false;
    }
    function isRestrictedWord$143(id$264) {
        return id$264 === 'eval' || id$264 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$144(id$265) {
        var keyword$266 = false;
        switch (id$265.length) {
        case 2:
            keyword$266 = id$265 === 'if' || id$265 === 'in' || id$265 === 'do';
            break;
        case 3:
            keyword$266 = id$265 === 'var' || id$265 === 'for' || id$265 === 'new' || id$265 === 'try';
            break;
        case 4:
            keyword$266 = id$265 === 'this' || id$265 === 'else' || id$265 === 'case' || id$265 === 'void' || id$265 === 'with';
            break;
        case 5:
            keyword$266 = id$265 === 'while' || id$265 === 'break' || id$265 === 'catch' || id$265 === 'throw';
            break;
        case 6:
            keyword$266 = id$265 === 'return' || id$265 === 'typeof' || id$265 === 'delete' || id$265 === 'switch';
            break;
        case 7:
            keyword$266 = id$265 === 'default' || id$265 === 'finally';
            break;
        case 8:
            keyword$266 = id$265 === 'function' || id$265 === 'continue' || id$265 === 'debugger';
            break;
        case 10:
            keyword$266 = id$265 === 'instanceof';
            break;
        }
        if (keyword$266) {
            return true;
        }
        switch (id$265) {
        // Future reserved words.
        // 'const' is specialized as Keyword in V8.
        case 'const':
            return true;
        // For compatiblity to SpiderMonkey and ES.next
        case 'yield':
        case 'let':
            return true;
        }
        if (strict$122 && isStrictModeReservedWord$142(id$265)) {
            return true;
        }
        return isFutureReservedWord$141(id$265);
    }
    // Return the next character and move forward.
    function nextChar$145() {
        return source$121[index$123++];
    }
    function getChar$146() {
        return source$121[index$123];
    }
    // 7.4 Comments
    function skipComment$147() {
        var ch$267, blockComment$268, lineComment$269;
        blockComment$268 = false;
        lineComment$269 = false;
        while (index$123 < length$126) {
            ch$267 = source$121[index$123];
            if (lineComment$269) {
                ch$267 = nextChar$145();
                if (isLineTerminator$138(ch$267)) {
                    lineComment$269 = false;
                    if (ch$267 === '\r' && source$121[index$123] === '\n') {
                        ++index$123;
                    }
                    ++lineNumber$124;
                    lineStart$125 = index$123;
                }
            } else if (blockComment$268) {
                if (isLineTerminator$138(ch$267)) {
                    if (ch$267 === '\r' && source$121[index$123 + 1] === '\n') {
                        ++index$123;
                    }
                    ++lineNumber$124;
                    ++index$123;
                    lineStart$125 = index$123;
                    if (index$123 >= length$126) {
                        throwError$159({}, Messages$119.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$267 = nextChar$145();
                    if (index$123 >= length$126) {
                        throwError$159({}, Messages$119.UnexpectedToken, 'ILLEGAL');
                    }
                    if (ch$267 === '*') {
                        ch$267 = source$121[index$123];
                        if (ch$267 === '/') {
                            ++index$123;
                            blockComment$268 = false;
                        }
                    }
                }
            } else if (ch$267 === '/') {
                ch$267 = source$121[index$123 + 1];
                if (ch$267 === '/') {
                    index$123 += 2;
                    lineComment$269 = true;
                } else if (ch$267 === '*') {
                    index$123 += 2;
                    blockComment$268 = true;
                    if (index$123 >= length$126) {
                        throwError$159({}, Messages$119.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$137(ch$267)) {
                ++index$123;
            } else if (isLineTerminator$138(ch$267)) {
                ++index$123;
                if (ch$267 === '\r' && source$121[index$123] === '\n') {
                    ++index$123;
                }
                ++lineNumber$124;
                lineStart$125 = index$123;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$148(prefix$270) {
        var i$271, len$272, ch$273, code$274 = 0;
        len$272 = prefix$270 === 'u' ? 4 : 2;
        for (i$271 = 0; i$271 < len$272; ++i$271) {
            if (index$123 < length$126 && isHexDigit$135(source$121[index$123])) {
                ch$273 = nextChar$145();
                code$274 = code$274 * 16 + '0123456789abcdef'.indexOf(ch$273.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$274);
    }
    function scanIdentifier$149() {
        var ch$275, start$276, id$277, restore$278;
        ch$275 = source$121[index$123];
        if (!isIdentifierStart$139(ch$275)) {
            return;
        }
        start$276 = index$123;
        if (ch$275 === '\\') {
            ++index$123;
            if (source$121[index$123] !== 'u') {
                return;
            }
            ++index$123;
            restore$278 = index$123;
            ch$275 = scanHexEscape$148('u');
            if (ch$275) {
                if (ch$275 === '\\' || !isIdentifierStart$139(ch$275)) {
                    return;
                }
                id$277 = ch$275;
            } else {
                index$123 = restore$278;
                id$277 = 'u';
            }
        } else {
            id$277 = nextChar$145();
        }
        while (index$123 < length$126) {
            ch$275 = source$121[index$123];
            if (!isIdentifierPart$140(ch$275)) {
                break;
            }
            if (ch$275 === '\\') {
                ++index$123;
                if (source$121[index$123] !== 'u') {
                    return;
                }
                ++index$123;
                restore$278 = index$123;
                ch$275 = scanHexEscape$148('u');
                if (ch$275) {
                    if (ch$275 === '\\' || !isIdentifierPart$140(ch$275)) {
                        return;
                    }
                    id$277 += ch$275;
                } else {
                    index$123 = restore$278;
                    id$277 += 'u';
                }
            } else {
                id$277 += nextChar$145();
            }
        }
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$277.length === 1) {
            return {
                type: Token$115.Identifier,
                value: id$277,
                lineNumber: lineNumber$124,
                lineStart: lineStart$125,
                range: [
                    start$276,
                    index$123
                ]
            };
        }
        if (isKeyword$144(id$277)) {
            return {
                type: Token$115.Keyword,
                value: id$277,
                lineNumber: lineNumber$124,
                lineStart: lineStart$125,
                range: [
                    start$276,
                    index$123
                ]
            };
        }
        // 7.8.1 Null Literals
        if (id$277 === 'null') {
            return {
                type: Token$115.NullLiteral,
                value: id$277,
                lineNumber: lineNumber$124,
                lineStart: lineStart$125,
                range: [
                    start$276,
                    index$123
                ]
            };
        }
        // 7.8.2 Boolean Literals
        if (id$277 === 'true' || id$277 === 'false') {
            return {
                type: Token$115.BooleanLiteral,
                value: id$277,
                lineNumber: lineNumber$124,
                lineStart: lineStart$125,
                range: [
                    start$276,
                    index$123
                ]
            };
        }
        return {
            type: Token$115.Identifier,
            value: id$277,
            lineNumber: lineNumber$124,
            lineStart: lineStart$125,
            range: [
                start$276,
                index$123
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$150() {
        var start$279 = index$123, ch1$280 = source$121[index$123], ch2$281, ch3$282, ch4$283;
        // Check for most common single-character punctuators.
        if (ch1$280 === ';' || ch1$280 === '{' || ch1$280 === '}') {
            ++index$123;
            return {
                type: Token$115.Punctuator,
                value: ch1$280,
                lineNumber: lineNumber$124,
                lineStart: lineStart$125,
                range: [
                    start$279,
                    index$123
                ]
            };
        }
        if (ch1$280 === ',' || ch1$280 === '(' || ch1$280 === ')') {
            ++index$123;
            return {
                type: Token$115.Punctuator,
                value: ch1$280,
                lineNumber: lineNumber$124,
                lineStart: lineStart$125,
                range: [
                    start$279,
                    index$123
                ]
            };
        }
        if (ch1$280 === '#' || ch1$280 === '@') {
            ++index$123;
            return {
                type: Token$115.Punctuator,
                value: ch1$280,
                lineNumber: lineNumber$124,
                lineStart: lineStart$125,
                range: [
                    start$279,
                    index$123
                ]
            };
        }
        // Dot (.) can also start a floating-point number, hence the need
        // to check the next character.
        ch2$281 = source$121[index$123 + 1];
        if (ch1$280 === '.' && !isDecimalDigit$134(ch2$281)) {
            if (source$121[index$123 + 1] === '.' && source$121[index$123 + 2] === '.') {
                nextChar$145();
                nextChar$145();
                nextChar$145();
                return {
                    type: Token$115.Punctuator,
                    value: '...',
                    lineNumber: lineNumber$124,
                    lineStart: lineStart$125,
                    range: [
                        start$279,
                        index$123
                    ]
                };
            } else {
                return {
                    type: Token$115.Punctuator,
                    value: nextChar$145(),
                    lineNumber: lineNumber$124,
                    lineStart: lineStart$125,
                    range: [
                        start$279,
                        index$123
                    ]
                };
            }
        }
        // Peek more characters.
        ch3$282 = source$121[index$123 + 2];
        ch4$283 = source$121[index$123 + 3];
        // 4-character punctuator: >>>=
        if (ch1$280 === '>' && ch2$281 === '>' && ch3$282 === '>') {
            if (ch4$283 === '=') {
                index$123 += 4;
                return {
                    type: Token$115.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$124,
                    lineStart: lineStart$125,
                    range: [
                        start$279,
                        index$123
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$280 === '=' && ch2$281 === '=' && ch3$282 === '=') {
            index$123 += 3;
            return {
                type: Token$115.Punctuator,
                value: '===',
                lineNumber: lineNumber$124,
                lineStart: lineStart$125,
                range: [
                    start$279,
                    index$123
                ]
            };
        }
        if (ch1$280 === '!' && ch2$281 === '=' && ch3$282 === '=') {
            index$123 += 3;
            return {
                type: Token$115.Punctuator,
                value: '!==',
                lineNumber: lineNumber$124,
                lineStart: lineStart$125,
                range: [
                    start$279,
                    index$123
                ]
            };
        }
        if (ch1$280 === '>' && ch2$281 === '>' && ch3$282 === '>') {
            index$123 += 3;
            return {
                type: Token$115.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$124,
                lineStart: lineStart$125,
                range: [
                    start$279,
                    index$123
                ]
            };
        }
        if (ch1$280 === '<' && ch2$281 === '<' && ch3$282 === '=') {
            index$123 += 3;
            return {
                type: Token$115.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$124,
                lineStart: lineStart$125,
                range: [
                    start$279,
                    index$123
                ]
            };
        }
        if (ch1$280 === '>' && ch2$281 === '>' && ch3$282 === '=') {
            index$123 += 3;
            return {
                type: Token$115.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$124,
                lineStart: lineStart$125,
                range: [
                    start$279,
                    index$123
                ]
            };
        }
        // 2-character punctuators: <= >= == != ++ -- << >> && ||
        // += -= *= %= &= |= ^= /=
        if (ch2$281 === '=') {
            if ('<>=!+-*%&|^/'.indexOf(ch1$280) >= 0) {
                index$123 += 2;
                return {
                    type: Token$115.Punctuator,
                    value: ch1$280 + ch2$281,
                    lineNumber: lineNumber$124,
                    lineStart: lineStart$125,
                    range: [
                        start$279,
                        index$123
                    ]
                };
            }
        }
        if (ch1$280 === ch2$281 && '+-<>&|'.indexOf(ch1$280) >= 0) {
            if ('+-<>&|'.indexOf(ch2$281) >= 0) {
                index$123 += 2;
                return {
                    type: Token$115.Punctuator,
                    value: ch1$280 + ch2$281,
                    lineNumber: lineNumber$124,
                    lineStart: lineStart$125,
                    range: [
                        start$279,
                        index$123
                    ]
                };
            }
        }
        // The remaining 1-character punctuators.
        if ('[]<>+-*%&|^!~?:=/'.indexOf(ch1$280) >= 0) {
            return {
                type: Token$115.Punctuator,
                value: nextChar$145(),
                lineNumber: lineNumber$124,
                lineStart: lineStart$125,
                range: [
                    start$279,
                    index$123
                ]
            };
        }
    }
    // 7.8.3 Numeric Literals
    function scanNumericLiteral$151() {
        var number$284, start$285, ch$286;
        ch$286 = source$121[index$123];
        assert$131(isDecimalDigit$134(ch$286) || ch$286 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$285 = index$123;
        number$284 = '';
        if (ch$286 !== '.') {
            number$284 = nextChar$145();
            ch$286 = source$121[index$123];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            if (number$284 === '0') {
                if (ch$286 === 'x' || ch$286 === 'X') {
                    number$284 += nextChar$145();
                    while (index$123 < length$126) {
                        ch$286 = source$121[index$123];
                        if (!isHexDigit$135(ch$286)) {
                            break;
                        }
                        number$284 += nextChar$145();
                    }
                    if (number$284.length <= 2) {
                        // only 0x
                        throwError$159({}, Messages$119.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$123 < length$126) {
                        ch$286 = source$121[index$123];
                        if (isIdentifierStart$139(ch$286)) {
                            throwError$159({}, Messages$119.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$115.NumericLiteral,
                        value: parseInt(number$284, 16),
                        lineNumber: lineNumber$124,
                        lineStart: lineStart$125,
                        range: [
                            start$285,
                            index$123
                        ]
                    };
                } else if (isOctalDigit$136(ch$286)) {
                    number$284 += nextChar$145();
                    while (index$123 < length$126) {
                        ch$286 = source$121[index$123];
                        if (!isOctalDigit$136(ch$286)) {
                            break;
                        }
                        number$284 += nextChar$145();
                    }
                    if (index$123 < length$126) {
                        ch$286 = source$121[index$123];
                        if (isIdentifierStart$139(ch$286) || isDecimalDigit$134(ch$286)) {
                            throwError$159({}, Messages$119.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$115.NumericLiteral,
                        value: parseInt(number$284, 8),
                        octal: true,
                        lineNumber: lineNumber$124,
                        lineStart: lineStart$125,
                        range: [
                            start$285,
                            index$123
                        ]
                    };
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (isDecimalDigit$134(ch$286)) {
                    throwError$159({}, Messages$119.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (index$123 < length$126) {
                ch$286 = source$121[index$123];
                if (!isDecimalDigit$134(ch$286)) {
                    break;
                }
                number$284 += nextChar$145();
            }
        }
        if (ch$286 === '.') {
            number$284 += nextChar$145();
            while (index$123 < length$126) {
                ch$286 = source$121[index$123];
                if (!isDecimalDigit$134(ch$286)) {
                    break;
                }
                number$284 += nextChar$145();
            }
        }
        if (ch$286 === 'e' || ch$286 === 'E') {
            number$284 += nextChar$145();
            ch$286 = source$121[index$123];
            if (ch$286 === '+' || ch$286 === '-') {
                number$284 += nextChar$145();
            }
            ch$286 = source$121[index$123];
            if (isDecimalDigit$134(ch$286)) {
                number$284 += nextChar$145();
                while (index$123 < length$126) {
                    ch$286 = source$121[index$123];
                    if (!isDecimalDigit$134(ch$286)) {
                        break;
                    }
                    number$284 += nextChar$145();
                }
            } else {
                ch$286 = 'character ' + ch$286;
                if (index$123 >= length$126) {
                    ch$286 = '<end>';
                }
                throwError$159({}, Messages$119.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (index$123 < length$126) {
            ch$286 = source$121[index$123];
            if (isIdentifierStart$139(ch$286)) {
                throwError$159({}, Messages$119.UnexpectedToken, 'ILLEGAL');
            }
        }
        return {
            type: Token$115.NumericLiteral,
            value: parseFloat(number$284),
            lineNumber: lineNumber$124,
            lineStart: lineStart$125,
            range: [
                start$285,
                index$123
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$152() {
        var str$287 = '', quote$288, start$289, ch$290, code$291, unescaped$292, restore$293, octal$294 = false;
        quote$288 = source$121[index$123];
        assert$131(quote$288 === '\'' || quote$288 === '"', 'String literal must starts with a quote');
        start$289 = index$123;
        ++index$123;
        while (index$123 < length$126) {
            ch$290 = nextChar$145();
            if (ch$290 === quote$288) {
                quote$288 = '';
                break;
            } else if (ch$290 === '\\') {
                ch$290 = nextChar$145();
                if (!isLineTerminator$138(ch$290)) {
                    switch (ch$290) {
                    case 'n':
                        str$287 += '\n';
                        break;
                    case 'r':
                        str$287 += '\r';
                        break;
                    case 't':
                        str$287 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        restore$293 = index$123;
                        unescaped$292 = scanHexEscape$148(ch$290);
                        if (unescaped$292) {
                            str$287 += unescaped$292;
                        } else {
                            index$123 = restore$293;
                            str$287 += ch$290;
                        }
                        break;
                    case 'b':
                        str$287 += '\b';
                        break;
                    case 'f':
                        str$287 += '\f';
                        break;
                    case 'v':
                        str$287 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$136(ch$290)) {
                            code$291 = '01234567'.indexOf(ch$290);
                            // \0 is not octal escape sequence
                            if (code$291 !== 0) {
                                octal$294 = true;
                            }
                            if (index$123 < length$126 && isOctalDigit$136(source$121[index$123])) {
                                octal$294 = true;
                                code$291 = code$291 * 8 + '01234567'.indexOf(nextChar$145());
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$290) >= 0 && index$123 < length$126 && isOctalDigit$136(source$121[index$123])) {
                                    code$291 = code$291 * 8 + '01234567'.indexOf(nextChar$145());
                                }
                            }
                            str$287 += String.fromCharCode(code$291);
                        } else {
                            str$287 += ch$290;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$124;
                    if (ch$290 === '\r' && source$121[index$123] === '\n') {
                        ++index$123;
                    }
                }
            } else if (isLineTerminator$138(ch$290)) {
                break;
            } else {
                str$287 += ch$290;
            }
        }
        if (quote$288 !== '') {
            throwError$159({}, Messages$119.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$115.StringLiteral,
            value: str$287,
            octal: octal$294,
            lineNumber: lineNumber$124,
            lineStart: lineStart$125,
            range: [
                start$289,
                index$123
            ]
        };
    }
    function scanRegExp$153() {
        var str$295 = '', ch$296, start$297, pattern$298, flags$299, value$300, classMarker$301 = false, restore$302;
        buffer$127 = null;
        skipComment$147();
        start$297 = index$123;
        ch$296 = source$121[index$123];
        assert$131(ch$296 === '/', 'Regular expression literal must start with a slash');
        str$295 = nextChar$145();
        while (index$123 < length$126) {
            ch$296 = nextChar$145();
            str$295 += ch$296;
            if (classMarker$301) {
                if (ch$296 === ']') {
                    classMarker$301 = false;
                }
            } else {
                if (ch$296 === '\\') {
                    ch$296 = nextChar$145();
                    // ECMA-262 7.8.5
                    if (isLineTerminator$138(ch$296)) {
                        throwError$159({}, Messages$119.UnterminatedRegExp);
                    }
                    str$295 += ch$296;
                } else if (ch$296 === '/') {
                    break;
                } else if (ch$296 === '[') {
                    classMarker$301 = true;
                } else if (isLineTerminator$138(ch$296)) {
                    throwError$159({}, Messages$119.UnterminatedRegExp);
                }
            }
        }
        if (str$295.length === 1) {
            throwError$159({}, Messages$119.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$298 = str$295.substr(1, str$295.length - 2);
        flags$299 = '';
        while (index$123 < length$126) {
            ch$296 = source$121[index$123];
            if (!isIdentifierPart$140(ch$296)) {
                break;
            }
            ++index$123;
            if (ch$296 === '\\' && index$123 < length$126) {
                ch$296 = source$121[index$123];
                if (ch$296 === 'u') {
                    ++index$123;
                    restore$302 = index$123;
                    ch$296 = scanHexEscape$148('u');
                    if (ch$296) {
                        flags$299 += ch$296;
                        str$295 += '\\u';
                        for (; restore$302 < index$123; ++restore$302) {
                            str$295 += source$121[restore$302];
                        }
                    } else {
                        index$123 = restore$302;
                        flags$299 += 'u';
                        str$295 += '\\u';
                    }
                } else {
                    str$295 += '\\';
                }
            } else {
                flags$299 += ch$296;
                str$295 += ch$296;
            }
        }
        try {
            value$300 = new RegExp(pattern$298, flags$299);
        } catch (e$303) {
            throwError$159({}, Messages$119.InvalidRegExp);
        }
        return {
            type: Token$115.RegexLiteral,
            literal: str$295,
            value: value$300,
            lineNumber: lineNumber$124,
            lineStart: lineStart$125,
            range: [
                start$297,
                index$123
            ]
        };
    }
    function isIdentifierName$154(token$304) {
        return token$304.type === Token$115.Identifier || token$304.type === Token$115.Keyword || token$304.type === Token$115.BooleanLiteral || token$304.type === Token$115.NullLiteral;
    }
    // only used by the reader
    function advance$155() {
        var ch$305, token$306;
        skipComment$147();
        if (index$123 >= length$126) {
            return {
                type: Token$115.EOF,
                lineNumber: lineNumber$124,
                lineStart: lineStart$125,
                range: [
                    index$123,
                    index$123
                ]
            };
        }
        ch$305 = source$121[index$123];
        token$306 = scanPunctuator$150();
        if (typeof token$306 !== 'undefined') {
            return token$306;
        }
        if (ch$305 === '\'' || ch$305 === '"') {
            return scanStringLiteral$152();
        }
        if (ch$305 === '.' || isDecimalDigit$134(ch$305)) {
            return scanNumericLiteral$151();
        }
        token$306 = scanIdentifier$149();
        if (typeof token$306 !== 'undefined') {
            return token$306;
        }
        throwError$159({}, Messages$119.UnexpectedToken, 'ILLEGAL');
    }
    function lex$156() {
        var token$307;
        if (buffer$127) {
            token$307 = buffer$127;
            buffer$127 = null;
            index$123++;
            return token$307;
        }
        buffer$127 = null;
        return tokenStream$129[index$123++];
    }
    function lookahead$157() {
        var pos$308, line$309, start$310;
        if (buffer$127 !== null) {
            return buffer$127;
        }
        buffer$127 = tokenStream$129[index$123];
        return buffer$127;
    }
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$158() {
        var pos$311, line$312, start$313, found$314;
        found$314 = tokenStream$129[index$123 - 1].token.lineNumber !== tokenStream$129[index$123].token.lineNumber;
        return found$314;
    }
    // Throw an exception
    function throwError$159(token$315, messageFormat$316) {
        var error$317, args$318 = Array.prototype.slice.call(arguments, 2), msg$319 = messageFormat$316.replace(/%(\d)/g, function (whole$320, index$321) {
                return args$318[index$321] || '';
            });
        if (typeof token$315.lineNumber === 'number') {
            error$317 = new Error('Line ' + token$315.lineNumber + ': ' + msg$319);
            error$317.lineNumber = token$315.lineNumber;
            if (token$315.range && token$315.range.length > 0) {
                error$317.index = token$315.range[0];
                error$317.column = token$315.range[0] - lineStart$125 + 1;
            }
        } else {
            error$317 = new Error('Line ' + lineNumber$124 + ': ' + msg$319);
            error$317.index = index$123;
            error$317.lineNumber = lineNumber$124;
            error$317.column = index$123 - lineStart$125 + 1;
        }
        throw error$317;
    }
    function throwErrorTolerant$160() {
        var error$322;
        try {
            throwError$159.apply(null, arguments);
        } catch (e$323) {
            if (extra$130.errors) {
                extra$130.errors.push(e$323);
            } else {
                throw e$323;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$161(token$324) {
        var s$325;
        if (token$324.type === Token$115.EOF) {
            throwError$159(token$324, Messages$119.UnexpectedEOS);
        }
        if (token$324.type === Token$115.NumericLiteral) {
            throwError$159(token$324, Messages$119.UnexpectedNumber);
        }
        if (token$324.type === Token$115.StringLiteral) {
            throwError$159(token$324, Messages$119.UnexpectedString);
        }
        if (token$324.type === Token$115.Identifier) {
            console.log(token$324);
            throwError$159(token$324, Messages$119.UnexpectedIdentifier);
        }
        if (token$324.type === Token$115.Keyword) {
            if (isFutureReservedWord$141(token$324.value)) {
                throwError$159(token$324, Messages$119.UnexpectedReserved);
            } else if (strict$122 && isStrictModeReservedWord$142(token$324.value)) {
                throwError$159(token$324, Messages$119.StrictReservedWord);
            }
            throwError$159(token$324, Messages$119.UnexpectedToken, token$324.value);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$159(token$324, Messages$119.UnexpectedToken, token$324.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$162(value$326) {
        var token$327 = lex$156().token;
        if (token$327.type !== Token$115.Punctuator || token$327.value !== value$326) {
            throwUnexpected$161(token$327);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$163(keyword$328) {
        var token$329 = lex$156().token;
        if (token$329.type !== Token$115.Keyword || token$329.value !== keyword$328) {
            throwUnexpected$161(token$329);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$164(value$330) {
        var token$331 = lookahead$157().token;
        return token$331.type === Token$115.Punctuator && token$331.value === value$330;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$165(keyword$332) {
        var token$333 = lookahead$157().token;
        return token$333.type === Token$115.Keyword && token$333.value === keyword$332;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$166() {
        var token$334 = lookahead$157().token, op$335 = token$334.value;
        if (token$334.type !== Token$115.Punctuator) {
            return false;
        }
        return op$335 === '=' || op$335 === '*=' || op$335 === '/=' || op$335 === '%=' || op$335 === '+=' || op$335 === '-=' || op$335 === '<<=' || op$335 === '>>=' || op$335 === '>>>=' || op$335 === '&=' || op$335 === '^=' || op$335 === '|=';
    }
    function consumeSemicolon$167() {
        var token$336, line$337;
        if (tokenStream$129[index$123].token.value === ';') {
            lex$156().token;
            return;
        }
        // if (source[index] === ';') {
        //     lex().token;
        //     return;
        // }
        // skipComment();
        // if (lineNumber !== line) {
        //     return;
        // }
        // if (match(';')) {
        //     lex().token;
        //     return;
        // }
        // todo: cleanup
        line$337 = tokenStream$129[index$123 - 1].token.lineNumber;
        token$336 = tokenStream$129[index$123].token;
        if (line$337 !== token$336.lineNumber) {
            return;
        }
        if (token$336.type !== Token$115.EOF && !match$164('}')) {
            throwUnexpected$161(token$336);
        }
        return;
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$168(expr$338) {
        return expr$338.type === Syntax$117.Identifier || expr$338.type === Syntax$117.MemberExpression;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$169() {
        var elements$339 = [], undef$340;
        expect$162('[');
        while (!match$164(']')) {
            if (match$164(',')) {
                lex$156().token;
                elements$339.push(undef$340);
            } else {
                elements$339.push(parseAssignmentExpression$198());
                if (!match$164(']')) {
                    expect$162(',');
                }
            }
        }
        expect$162(']');
        return {
            type: Syntax$117.ArrayExpression,
            elements: elements$339
        };
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$170(param$341, first$342) {
        var previousStrict$343, body$344;
        previousStrict$343 = strict$122;
        body$344 = parseFunctionSourceElements$225();
        if (first$342 && strict$122 && isRestrictedWord$143(param$341[0].name)) {
            throwError$159(first$342, Messages$119.StrictParamName);
        }
        strict$122 = previousStrict$343;
        return {
            type: Syntax$117.FunctionExpression,
            id: null,
            params: param$341,
            body: body$344
        };
    }
    function parseObjectPropertyKey$171() {
        var token$345 = lex$156().token;
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$345.type === Token$115.StringLiteral || token$345.type === Token$115.NumericLiteral) {
            if (strict$122 && token$345.octal) {
                throwError$159(token$345, Messages$119.StrictOctalLiteral);
            }
            return createLiteral$235(token$345);
        }
        return {
            type: Syntax$117.Identifier,
            name: token$345.value
        };
    }
    function parseObjectProperty$172() {
        var token$346, key$347, id$348, param$349;
        token$346 = lookahead$157().token;
        if (token$346.type === Token$115.Identifier) {
            id$348 = parseObjectPropertyKey$171();
            // Property Assignment: Getter and Setter.
            if (token$346.value === 'get' && !match$164(':')) {
                key$347 = parseObjectPropertyKey$171();
                expect$162('(');
                expect$162(')');
                return {
                    type: Syntax$117.Property,
                    key: key$347,
                    value: parsePropertyFunction$170([]),
                    kind: 'get'
                };
            } else if (token$346.value === 'set' && !match$164(':')) {
                key$347 = parseObjectPropertyKey$171();
                expect$162('(');
                token$346 = lookahead$157().token;
                if (token$346.type !== Token$115.Identifier) {
                    throwUnexpected$161(lex$156().token);
                }
                param$349 = [parseVariableIdentifier$202()];
                expect$162(')');
                return {
                    type: Syntax$117.Property,
                    key: key$347,
                    value: parsePropertyFunction$170(param$349, token$346),
                    kind: 'set'
                };
            } else {
                expect$162(':');
                return {
                    type: Syntax$117.Property,
                    key: id$348,
                    value: parseAssignmentExpression$198(),
                    kind: 'init'
                };
            }
        } else if (token$346.type === Token$115.EOF || token$346.type === Token$115.Punctuator) {
            throwUnexpected$161(token$346);
        } else {
            key$347 = parseObjectPropertyKey$171();
            expect$162(':');
            return {
                type: Syntax$117.Property,
                key: key$347,
                value: parseAssignmentExpression$198(),
                kind: 'init'
            };
        }
    }
    function parseObjectInitialiser$173() {
        var token$350, properties$351 = [], property$352, name$353, kind$354, map$355 = {}, toString$356 = String;
        expect$162('{');
        while (!match$164('}')) {
            property$352 = parseObjectProperty$172();
            if (property$352.key.type === Syntax$117.Identifier) {
                name$353 = property$352.key.name;
            } else {
                name$353 = toString$356(property$352.key.value);
            }
            kind$354 = property$352.kind === 'init' ? PropertyKind$118.Data : property$352.kind === 'get' ? PropertyKind$118.Get : PropertyKind$118.Set;
            if (Object.prototype.hasOwnProperty.call(map$355, name$353)) {
                if (map$355[name$353] === PropertyKind$118.Data) {
                    if (strict$122 && kind$354 === PropertyKind$118.Data) {
                        throwErrorTolerant$160({}, Messages$119.StrictDuplicateProperty);
                    } else if (kind$354 !== PropertyKind$118.Data) {
                        throwError$159({}, Messages$119.AccessorDataProperty);
                    }
                } else {
                    if (kind$354 === PropertyKind$118.Data) {
                        throwError$159({}, Messages$119.AccessorDataProperty);
                    } else if (map$355[name$353] & kind$354) {
                        throwError$159({}, Messages$119.AccessorGetSet);
                    }
                }
                map$355[name$353] |= kind$354;
            } else {
                map$355[name$353] = kind$354;
            }
            properties$351.push(property$352);
            if (!match$164('}')) {
                expect$162(',');
            }
        }
        expect$162('}');
        return {
            type: Syntax$117.ObjectExpression,
            properties: properties$351
        };
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$174() {
        var expr$357, token$358 = lookahead$157().token, type$359 = token$358.type;
        if (type$359 === Token$115.Identifier) {
            var name$360 = expander$114.resolve(lex$156());
            return {
                type: Syntax$117.Identifier,
                name: name$360
            };
        }
        if (type$359 === Token$115.StringLiteral || type$359 === Token$115.NumericLiteral) {
            if (strict$122 && token$358.octal) {
                throwErrorTolerant$160(token$358, Messages$119.StrictOctalLiteral);
            }
            return createLiteral$235(lex$156().token);
        }
        if (type$359 === Token$115.Keyword) {
            if (matchKeyword$165('this')) {
                lex$156().token;
                return { type: Syntax$117.ThisExpression };
            }
            if (matchKeyword$165('function')) {
                return parseFunctionExpression$227();
            }
        }
        if (type$359 === Token$115.BooleanLiteral) {
            lex$156();
            token$358.value = token$358.value === 'true';
            return createLiteral$235(token$358);
        }
        if (type$359 === Token$115.NullLiteral) {
            lex$156();
            token$358.value = null;
            return createLiteral$235(token$358);
        }
        if (match$164('[')) {
            return parseArrayInitialiser$169();
        }
        if (match$164('{')) {
            return parseObjectInitialiser$173();
        }
        if (match$164('(')) {
            lex$156();
            state$128.lastParenthesized = expr$357 = parseExpression$199();
            expect$162(')');
            return expr$357;
        }
        if (token$358.value instanceof RegExp) {
            return createLiteral$235(lex$156().token);
        }
        return throwUnexpected$161(lex$156().token);
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$175() {
        var args$361 = [];
        expect$162('(');
        if (!match$164(')')) {
            while (index$123 < length$126) {
                args$361.push(parseAssignmentExpression$198());
                if (match$164(')')) {
                    break;
                }
                expect$162(',');
            }
        }
        expect$162(')');
        return args$361;
    }
    function parseNonComputedProperty$176() {
        var token$362 = lex$156().token;
        if (!isIdentifierName$154(token$362)) {
            throwUnexpected$161(token$362);
        }
        return {
            type: Syntax$117.Identifier,
            name: token$362.value
        };
    }
    function parseNonComputedMember$177(object$363) {
        return {
            type: Syntax$117.MemberExpression,
            computed: false,
            object: object$363,
            property: parseNonComputedProperty$176()
        };
    }
    function parseComputedMember$178(object$364) {
        var property$365, expr$366;
        expect$162('[');
        property$365 = parseExpression$199();
        expr$366 = {
            type: Syntax$117.MemberExpression,
            computed: true,
            object: object$364,
            property: property$365
        };
        expect$162(']');
        return expr$366;
    }
    function parseCallMember$179(object$367) {
        return {
            type: Syntax$117.CallExpression,
            callee: object$367,
            'arguments': parseArguments$175()
        };
    }
    function parseNewExpression$180() {
        var expr$368;
        expectKeyword$163('new');
        expr$368 = {
            type: Syntax$117.NewExpression,
            callee: parseLeftHandSideExpression$184(),
            'arguments': []
        };
        if (match$164('(')) {
            expr$368['arguments'] = parseArguments$175();
        }
        return expr$368;
    }
    // sort of broken, only accepts literals
    // pretty sure the use of toString will bite me
    function toArrayNode$181(arr$369) {
        var els$370 = arr$369.map(function (el$371) {
                return {
                    type: 'Literal',
                    value: el$371,
                    raw: el$371.toString()
                };
            });
        return {
            type: 'ArrayExpression',
            elements: els$370
        };
    }
    function toObjectNode$182(obj$372) {
        // todo: hacky, fixup
        var props$373 = Object.keys(obj$372).map(function (key$374) {
                var raw$375 = obj$372[key$374];
                var value$376;
                if (Array.isArray(raw$375)) {
                    value$376 = toArrayNode$181(raw$375);
                } else {
                    value$376 = {
                        type: 'Literal',
                        value: obj$372[key$374],
                        raw: obj$372[key$374].toString()
                    };
                }
                return {
                    type: 'Property',
                    key: {
                        type: 'Identifier',
                        name: key$374
                    },
                    value: value$376,
                    kind: 'init'
                };
            });
        return {
            type: 'ObjectExpression',
            properties: props$373
        };
    }
    // function parseSyntaxObject() {
    //     var tokens = lex().token;
    //     assert(tokens.value === "{}", "expecting delimiters to follow syntax");
    //     var objExprs = tokens.inner.map(function(tok) {
    //         return toObjectNode(tok);
    //     });
    //     return {
    //         type: "ArrayExpression",
    //         elements: objExprs
    //     };
    // }
    function parseLeftHandSideExpressionAllowCall$183() {
        var useNew$377, expr$378;
        useNew$377 = matchKeyword$165('new');
        expr$378 = useNew$377 ? parseNewExpression$180() : parsePrimaryExpression$174();
        // handle "syntax" primitive
        // todo: error handling
        // if(expr.name === "syntax") {
        //     return parseSyntaxObject();
        // }
        while (index$123 < length$126) {
            if (match$164('.')) {
                lex$156();
                expr$378 = parseNonComputedMember$177(expr$378);
            } else if (match$164('[')) {
                expr$378 = parseComputedMember$178(expr$378);
            } else if (match$164('(')) {
                expr$378 = parseCallMember$179(expr$378);
            } else {
                break;
            }
        }
        return expr$378;
    }
    function parseLeftHandSideExpression$184() {
        var useNew$379, expr$380;
        useNew$379 = matchKeyword$165('new');
        expr$380 = useNew$379 ? parseNewExpression$180() : parsePrimaryExpression$174();
        while (index$123 < length$126) {
            if (match$164('.')) {
                lex$156();
                expr$380 = parseNonComputedMember$177(expr$380);
            } else if (match$164('[')) {
                expr$380 = parseComputedMember$178(expr$380);
            } else {
                break;
            }
        }
        return expr$380;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$185() {
        var expr$381 = parseLeftHandSideExpressionAllowCall$183();
        if ((match$164('++') || match$164('--')) && !peekLineTerminator$158()) {
            // 11.3.1, 11.3.2
            if (strict$122 && expr$381.type === Syntax$117.Identifier && isRestrictedWord$143(expr$381.name)) {
                throwError$159({}, Messages$119.StrictLHSPostfix);
            }
            if (!isLeftHandSide$168(expr$381)) {
                throwError$159({}, Messages$119.InvalidLHSInAssignment);
            }
            expr$381 = {
                type: Syntax$117.UpdateExpression,
                operator: lex$156().token.value,
                argument: expr$381,
                prefix: false
            };
        }
        return expr$381;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$186() {
        var token$382, expr$383;
        if (match$164('++') || match$164('--')) {
            token$382 = lex$156().token;
            expr$383 = parseUnaryExpression$186();
            // 11.4.4, 11.4.5
            if (strict$122 && expr$383.type === Syntax$117.Identifier && isRestrictedWord$143(expr$383.name)) {
                throwError$159({}, Messages$119.StrictLHSPrefix);
            }
            if (!isLeftHandSide$168(expr$383)) {
                throwError$159({}, Messages$119.InvalidLHSInAssignment);
            }
            expr$383 = {
                type: Syntax$117.UpdateExpression,
                operator: token$382.value,
                argument: expr$383,
                prefix: true
            };
            return expr$383;
        }
        if (match$164('+') || match$164('-') || match$164('~') || match$164('!')) {
            expr$383 = {
                type: Syntax$117.UnaryExpression,
                operator: lex$156().token.value,
                argument: parseUnaryExpression$186()
            };
            return expr$383;
        }
        if (matchKeyword$165('delete') || matchKeyword$165('void') || matchKeyword$165('typeof')) {
            expr$383 = {
                type: Syntax$117.UnaryExpression,
                operator: lex$156().token.value,
                argument: parseUnaryExpression$186()
            };
            if (strict$122 && expr$383.operator === 'delete' && expr$383.argument.type === Syntax$117.Identifier) {
                throwErrorTolerant$160({}, Messages$119.StrictDelete);
            }
            return expr$383;
        }
        return parsePostfixExpression$185();
    }
    // 11.5 Multiplicative Operators
    function parseMultiplicativeExpression$187() {
        var expr$384 = parseUnaryExpression$186();
        while (match$164('*') || match$164('/') || match$164('%')) {
            expr$384 = {
                type: Syntax$117.BinaryExpression,
                operator: lex$156().token.value,
                left: expr$384,
                right: parseUnaryExpression$186()
            };
        }
        return expr$384;
    }
    // 11.6 Additive Operators
    function parseAdditiveExpression$188() {
        var expr$385 = parseMultiplicativeExpression$187();
        while (match$164('+') || match$164('-')) {
            expr$385 = {
                type: Syntax$117.BinaryExpression,
                operator: lex$156().token.value,
                left: expr$385,
                right: parseMultiplicativeExpression$187()
            };
        }
        return expr$385;
    }
    // 11.7 Bitwise Shift Operators
    function parseShiftExpression$189() {
        var expr$386 = parseAdditiveExpression$188();
        while (match$164('<<') || match$164('>>') || match$164('>>>')) {
            expr$386 = {
                type: Syntax$117.BinaryExpression,
                operator: lex$156().token.value,
                left: expr$386,
                right: parseAdditiveExpression$188()
            };
        }
        return expr$386;
    }
    // 11.8 Relational Operators
    function parseRelationalExpression$190() {
        var expr$387, previousAllowIn$388;
        previousAllowIn$388 = state$128.allowIn;
        state$128.allowIn = true;
        expr$387 = parseShiftExpression$189();
        while (match$164('<') || match$164('>') || match$164('<=') || match$164('>=') || previousAllowIn$388 && matchKeyword$165('in') || matchKeyword$165('instanceof')) {
            expr$387 = {
                type: Syntax$117.BinaryExpression,
                operator: lex$156().token.value,
                left: expr$387,
                right: parseRelationalExpression$190()
            };
        }
        state$128.allowIn = previousAllowIn$388;
        return expr$387;
    }
    // 11.9 Equality Operators
    function parseEqualityExpression$191() {
        var expr$389 = parseRelationalExpression$190();
        while (match$164('==') || match$164('!=') || match$164('===') || match$164('!==')) {
            expr$389 = {
                type: Syntax$117.BinaryExpression,
                operator: lex$156().token.value,
                left: expr$389,
                right: parseRelationalExpression$190()
            };
        }
        return expr$389;
    }
    // 11.10 Binary Bitwise Operators
    function parseBitwiseANDExpression$192() {
        var expr$390 = parseEqualityExpression$191();
        while (match$164('&')) {
            lex$156();
            expr$390 = {
                type: Syntax$117.BinaryExpression,
                operator: '&',
                left: expr$390,
                right: parseEqualityExpression$191()
            };
        }
        return expr$390;
    }
    function parseBitwiseXORExpression$193() {
        var expr$391 = parseBitwiseANDExpression$192();
        while (match$164('^')) {
            lex$156();
            expr$391 = {
                type: Syntax$117.BinaryExpression,
                operator: '^',
                left: expr$391,
                right: parseBitwiseANDExpression$192()
            };
        }
        return expr$391;
    }
    function parseBitwiseORExpression$194() {
        var expr$392 = parseBitwiseXORExpression$193();
        while (match$164('|')) {
            lex$156();
            expr$392 = {
                type: Syntax$117.BinaryExpression,
                operator: '|',
                left: expr$392,
                right: parseBitwiseXORExpression$193()
            };
        }
        return expr$392;
    }
    // 11.11 Binary Logical Operators
    function parseLogicalANDExpression$195() {
        var expr$393 = parseBitwiseORExpression$194();
        while (match$164('&&')) {
            lex$156();
            expr$393 = {
                type: Syntax$117.LogicalExpression,
                operator: '&&',
                left: expr$393,
                right: parseBitwiseORExpression$194()
            };
        }
        return expr$393;
    }
    function parseLogicalORExpression$196() {
        var expr$394 = parseLogicalANDExpression$195();
        while (match$164('||')) {
            lex$156();
            expr$394 = {
                type: Syntax$117.LogicalExpression,
                operator: '||',
                left: expr$394,
                right: parseLogicalANDExpression$195()
            };
        }
        return expr$394;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$197() {
        var expr$395, previousAllowIn$396, consequent$397;
        expr$395 = parseLogicalORExpression$196();
        if (match$164('?')) {
            lex$156();
            previousAllowIn$396 = state$128.allowIn;
            state$128.allowIn = true;
            consequent$397 = parseAssignmentExpression$198();
            state$128.allowIn = previousAllowIn$396;
            expect$162(':');
            expr$395 = {
                type: Syntax$117.ConditionalExpression,
                test: expr$395,
                consequent: consequent$397,
                alternate: parseAssignmentExpression$198()
            };
        }
        return expr$395;
    }
    // 11.13 Assignment Operators
    function parseAssignmentExpression$198() {
        var expr$398;
        expr$398 = parseConditionalExpression$197();
        if (matchAssign$166()) {
            // LeftHandSideExpression
            if (!isLeftHandSide$168(expr$398)) {
                throwError$159({}, Messages$119.InvalidLHSInAssignment);
            }
            // 11.13.1
            if (strict$122 && expr$398.type === Syntax$117.Identifier && isRestrictedWord$143(expr$398.name)) {
                throwError$159({}, Messages$119.StrictLHSAssignment);
            }
            expr$398 = {
                type: Syntax$117.AssignmentExpression,
                operator: lex$156().token.value,
                left: expr$398,
                right: parseAssignmentExpression$198()
            };
        }
        return expr$398;
    }
    // 11.14 Comma Operator
    function parseExpression$199() {
        var expr$399 = parseAssignmentExpression$198();
        if (match$164(',')) {
            expr$399 = {
                type: Syntax$117.SequenceExpression,
                expressions: [expr$399]
            };
            while (index$123 < length$126) {
                if (!match$164(',')) {
                    break;
                }
                lex$156();
                expr$399.expressions.push(parseAssignmentExpression$198());
            }
        }
        return expr$399;
    }
    // 12.1 Block
    function parseStatementList$200() {
        var list$400 = [], statement$401;
        while (index$123 < length$126) {
            if (match$164('}')) {
                break;
            }
            statement$401 = parseSourceElement$228();
            if (typeof statement$401 === 'undefined') {
                break;
            }
            list$400.push(statement$401);
        }
        return list$400;
    }
    function parseBlock$201() {
        var block$402;
        expect$162('{');
        block$402 = parseStatementList$200();
        expect$162('}');
        return {
            type: Syntax$117.BlockStatement,
            body: block$402
        };
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$202() {
        var stx$403 = lex$156(), token$404 = stx$403.token;
        if (token$404.type !== Token$115.Identifier) {
            throwUnexpected$161(token$404);
        }
        var name$405 = expander$114.resolve(stx$403);
        return {
            type: Syntax$117.Identifier,
            name: name$405
        };
    }
    function parseVariableDeclaration$203(kind$406) {
        var id$407 = parseVariableIdentifier$202(), init$408 = null;
        // 12.2.1
        if (strict$122 && isRestrictedWord$143(id$407.name)) {
            throwErrorTolerant$160({}, Messages$119.StrictVarName);
        }
        if (kind$406 === 'const') {
            expect$162('=');
            init$408 = parseAssignmentExpression$198();
        } else if (match$164('=')) {
            lex$156();
            init$408 = parseAssignmentExpression$198();
        }
        return {
            type: Syntax$117.VariableDeclarator,
            id: id$407,
            init: init$408
        };
    }
    function parseVariableDeclarationList$204(kind$409) {
        var list$410 = [];
        while (index$123 < length$126) {
            list$410.push(parseVariableDeclaration$203(kind$409));
            if (!match$164(',')) {
                break;
            }
            lex$156();
        }
        return list$410;
    }
    function parseVariableStatement$205() {
        var declarations$411;
        expectKeyword$163('var');
        declarations$411 = parseVariableDeclarationList$204();
        consumeSemicolon$167();
        return {
            type: Syntax$117.VariableDeclaration,
            declarations: declarations$411,
            kind: 'var'
        };
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$206(kind$412) {
        var declarations$413;
        expectKeyword$163(kind$412);
        declarations$413 = parseVariableDeclarationList$204(kind$412);
        consumeSemicolon$167();
        return {
            type: Syntax$117.VariableDeclaration,
            declarations: declarations$413,
            kind: kind$412
        };
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$207() {
        expect$162(';');
        return { type: Syntax$117.EmptyStatement };
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$208() {
        var expr$414 = parseExpression$199();
        consumeSemicolon$167();
        return {
            type: Syntax$117.ExpressionStatement,
            expression: expr$414
        };
    }
    // 12.5 If statement
    function parseIfStatement$209() {
        var test$415, consequent$416, alternate$417;
        expectKeyword$163('if');
        expect$162('(');
        test$415 = parseExpression$199();
        expect$162(')');
        consequent$416 = parseStatement$224();
        if (matchKeyword$165('else')) {
            lex$156();
            alternate$417 = parseStatement$224();
        } else {
            alternate$417 = null;
        }
        return {
            type: Syntax$117.IfStatement,
            test: test$415,
            consequent: consequent$416,
            alternate: alternate$417
        };
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$210() {
        var body$418, test$419, oldInIteration$420;
        expectKeyword$163('do');
        oldInIteration$420 = state$128.inIteration;
        state$128.inIteration = true;
        body$418 = parseStatement$224();
        state$128.inIteration = oldInIteration$420;
        expectKeyword$163('while');
        expect$162('(');
        test$419 = parseExpression$199();
        expect$162(')');
        if (match$164(';')) {
            lex$156();
        }
        return {
            type: Syntax$117.DoWhileStatement,
            body: body$418,
            test: test$419
        };
    }
    function parseWhileStatement$211() {
        var test$421, body$422, oldInIteration$423;
        expectKeyword$163('while');
        expect$162('(');
        test$421 = parseExpression$199();
        expect$162(')');
        oldInIteration$423 = state$128.inIteration;
        state$128.inIteration = true;
        body$422 = parseStatement$224();
        state$128.inIteration = oldInIteration$423;
        return {
            type: Syntax$117.WhileStatement,
            test: test$421,
            body: body$422
        };
    }
    function parseForVariableDeclaration$212() {
        var token$424 = lex$156().token;
        return {
            type: Syntax$117.VariableDeclaration,
            declarations: parseVariableDeclarationList$204(),
            kind: token$424.value
        };
    }
    function parseForStatement$213() {
        var init$425, test$426, update$427, left$428, right$429, body$430, oldInIteration$431;
        init$425 = test$426 = update$427 = null;
        expectKeyword$163('for');
        expect$162('(');
        if (match$164(';')) {
            lex$156();
        } else {
            if (matchKeyword$165('var') || matchKeyword$165('let')) {
                state$128.allowIn = false;
                init$425 = parseForVariableDeclaration$212();
                state$128.allowIn = true;
                if (init$425.declarations.length === 1 && matchKeyword$165('in')) {
                    lex$156();
                    left$428 = init$425;
                    right$429 = parseExpression$199();
                    init$425 = null;
                }
            } else {
                state$128.allowIn = false;
                init$425 = parseExpression$199();
                state$128.allowIn = true;
                if (matchKeyword$165('in')) {
                    // LeftHandSideExpression
                    if (!isLeftHandSide$168(init$425)) {
                        throwError$159({}, Messages$119.InvalidLHSInForIn);
                    }
                    lex$156();
                    left$428 = init$425;
                    right$429 = parseExpression$199();
                    init$425 = null;
                }
            }
            if (typeof left$428 === 'undefined') {
                expect$162(';');
            }
        }
        if (typeof left$428 === 'undefined') {
            if (!match$164(';')) {
                test$426 = parseExpression$199();
            }
            expect$162(';');
            if (!match$164(')')) {
                update$427 = parseExpression$199();
            }
        }
        expect$162(')');
        oldInIteration$431 = state$128.inIteration;
        state$128.inIteration = true;
        body$430 = parseStatement$224();
        state$128.inIteration = oldInIteration$431;
        if (typeof left$428 === 'undefined') {
            return {
                type: Syntax$117.ForStatement,
                init: init$425,
                test: test$426,
                update: update$427,
                body: body$430
            };
        }
        return {
            type: Syntax$117.ForInStatement,
            left: left$428,
            right: right$429,
            body: body$430,
            each: false
        };
    }
    // 12.7 The continue statement
    function parseContinueStatement$214() {
        var token$432, label$433 = null;
        expectKeyword$163('continue');
        // Optimize the most common form: 'continue;'.
        if (tokenStream$129[index$123].token.value === ';') {
            lex$156();
            if (!state$128.inIteration) {
                throwError$159({}, Messages$119.IllegalContinue);
            }
            return {
                type: Syntax$117.ContinueStatement,
                label: null
            };
        }
        if (peekLineTerminator$158()) {
            if (!state$128.inIteration) {
                throwError$159({}, Messages$119.IllegalContinue);
            }
            return {
                type: Syntax$117.ContinueStatement,
                label: null
            };
        }
        token$432 = lookahead$157().token;
        if (token$432.type === Token$115.Identifier) {
            label$433 = parseVariableIdentifier$202();
            if (!Object.prototype.hasOwnProperty.call(state$128.labelSet, label$433.name)) {
                throwError$159({}, Messages$119.UnknownLabel, label$433.name);
            }
        }
        consumeSemicolon$167();
        if (label$433 === null && !state$128.inIteration) {
            throwError$159({}, Messages$119.IllegalContinue);
        }
        return {
            type: Syntax$117.ContinueStatement,
            label: label$433
        };
    }
    // 12.8 The break statement
    function parseBreakStatement$215() {
        var token$434, label$435 = null;
        expectKeyword$163('break');
        if (peekLineTerminator$158()) {
            if (!(state$128.inIteration || state$128.inSwitch)) {
                throwError$159({}, Messages$119.IllegalBreak);
            }
            return {
                type: Syntax$117.BreakStatement,
                label: null
            };
        }
        token$434 = lookahead$157().token;
        if (token$434.type === Token$115.Identifier) {
            label$435 = parseVariableIdentifier$202();
            if (!Object.prototype.hasOwnProperty.call(state$128.labelSet, label$435.name)) {
                throwError$159({}, Messages$119.UnknownLabel, label$435.name);
            }
        }
        consumeSemicolon$167();
        if (label$435 === null && !(state$128.inIteration || state$128.inSwitch)) {
            throwError$159({}, Messages$119.IllegalBreak);
        }
        return {
            type: Syntax$117.BreakStatement,
            label: label$435
        };
    }
    // 12.9 The return statement
    function parseReturnStatement$216() {
        var token$436, argument$437 = null;
        expectKeyword$163('return');
        if (!state$128.inFunctionBody) {
            throwErrorTolerant$160({}, Messages$119.IllegalReturn);
        }
        if (peekLineTerminator$158()) {
            return {
                type: Syntax$117.ReturnStatement,
                argument: null
            };
        }
        if (!match$164(';')) {
            token$436 = lookahead$157().token;
            if (!match$164('}') && token$436.type !== Token$115.EOF) {
                argument$437 = parseExpression$199();
            }
        }
        consumeSemicolon$167();
        return {
            type: Syntax$117.ReturnStatement,
            argument: argument$437
        };
    }
    // 12.10 The with statement
    function parseWithStatement$217() {
        var object$438, body$439;
        if (strict$122) {
            throwErrorTolerant$160({}, Messages$119.StrictModeWith);
        }
        expectKeyword$163('with');
        expect$162('(');
        object$438 = parseExpression$199();
        expect$162(')');
        body$439 = parseStatement$224();
        return {
            type: Syntax$117.WithStatement,
            object: object$438,
            body: body$439
        };
    }
    // 12.10 The swith statement
    function parseSwitchCase$218() {
        var test$440, consequent$441 = [], statement$442;
        if (matchKeyword$165('default')) {
            lex$156();
            test$440 = null;
        } else {
            expectKeyword$163('case');
            test$440 = parseExpression$199();
        }
        expect$162(':');
        while (index$123 < length$126) {
            if (match$164('}') || matchKeyword$165('default') || matchKeyword$165('case')) {
                break;
            }
            statement$442 = parseStatement$224();
            if (typeof statement$442 === 'undefined') {
                break;
            }
            consequent$441.push(statement$442);
        }
        return {
            type: Syntax$117.SwitchCase,
            test: test$440,
            consequent: consequent$441
        };
    }
    function parseSwitchStatement$219() {
        var discriminant$443, cases$444, oldInSwitch$445;
        expectKeyword$163('switch');
        expect$162('(');
        discriminant$443 = parseExpression$199();
        expect$162(')');
        expect$162('{');
        if (match$164('}')) {
            lex$156();
            return {
                type: Syntax$117.SwitchStatement,
                discriminant: discriminant$443
            };
        }
        cases$444 = [];
        oldInSwitch$445 = state$128.inSwitch;
        state$128.inSwitch = true;
        while (index$123 < length$126) {
            if (match$164('}')) {
                break;
            }
            cases$444.push(parseSwitchCase$218());
        }
        state$128.inSwitch = oldInSwitch$445;
        expect$162('}');
        return {
            type: Syntax$117.SwitchStatement,
            discriminant: discriminant$443,
            cases: cases$444
        };
    }
    // 12.13 The throw statement
    function parseThrowStatement$220() {
        var argument$446;
        expectKeyword$163('throw');
        if (peekLineTerminator$158()) {
            throwError$159({}, Messages$119.NewlineAfterThrow);
        }
        argument$446 = parseExpression$199();
        consumeSemicolon$167();
        return {
            type: Syntax$117.ThrowStatement,
            argument: argument$446
        };
    }
    // 12.14 The try statement
    function parseCatchClause$221() {
        var param$447;
        expectKeyword$163('catch');
        expect$162('(');
        if (!match$164(')')) {
            param$447 = parseExpression$199();
            // 12.14.1
            if (strict$122 && param$447.type === Syntax$117.Identifier && isRestrictedWord$143(param$447.name)) {
                throwErrorTolerant$160({}, Messages$119.StrictCatchVariable);
            }
        }
        expect$162(')');
        return {
            type: Syntax$117.CatchClause,
            param: param$447,
            guard: null,
            body: parseBlock$201()
        };
    }
    function parseTryStatement$222() {
        var block$448, handlers$449 = [], finalizer$450 = null;
        expectKeyword$163('try');
        block$448 = parseBlock$201();
        if (matchKeyword$165('catch')) {
            handlers$449.push(parseCatchClause$221());
        }
        if (matchKeyword$165('finally')) {
            lex$156();
            finalizer$450 = parseBlock$201();
        }
        if (handlers$449.length === 0 && !finalizer$450) {
            throwError$159({}, Messages$119.NoCatchOrFinally);
        }
        return {
            type: Syntax$117.TryStatement,
            block: block$448,
            handlers: handlers$449,
            finalizer: finalizer$450
        };
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$223() {
        expectKeyword$163('debugger');
        consumeSemicolon$167();
        return { type: Syntax$117.DebuggerStatement };
    }
    // 12 Statements
    function parseStatement$224() {
        var token$451 = lookahead$157().token, expr$452, labeledBody$453;
        if (token$451.type === Token$115.EOF) {
            throwUnexpected$161(token$451);
        }
        if (token$451.type === Token$115.Punctuator) {
            switch (token$451.value) {
            case ';':
                return parseEmptyStatement$207();
            case '{':
                return parseBlock$201();
            case '(':
                return parseExpressionStatement$208();
            default:
                break;
            }
        }
        if (token$451.type === Token$115.Keyword) {
            switch (token$451.value) {
            case 'break':
                return parseBreakStatement$215();
            case 'continue':
                return parseContinueStatement$214();
            case 'debugger':
                return parseDebuggerStatement$223();
            case 'do':
                return parseDoWhileStatement$210();
            case 'for':
                return parseForStatement$213();
            case 'function':
                return parseFunctionDeclaration$226();
            case 'if':
                return parseIfStatement$209();
            case 'return':
                return parseReturnStatement$216();
            case 'switch':
                return parseSwitchStatement$219();
            case 'throw':
                return parseThrowStatement$220();
            case 'try':
                return parseTryStatement$222();
            case 'var':
                return parseVariableStatement$205();
            case 'while':
                return parseWhileStatement$211();
            case 'with':
                return parseWithStatement$217();
            default:
                break;
            }
        }
        expr$452 = parseExpression$199();
        // 12.12 Labelled Statements
        if (expr$452.type === Syntax$117.Identifier && match$164(':')) {
            lex$156();
            if (Object.prototype.hasOwnProperty.call(state$128.labelSet, expr$452.name)) {
                throwError$159({}, Messages$119.Redeclaration, 'Label', expr$452.name);
            }
            state$128.labelSet[expr$452.name] = true;
            labeledBody$453 = parseStatement$224();
            delete state$128.labelSet[expr$452.name];
            return {
                type: Syntax$117.LabeledStatement,
                label: expr$452,
                body: labeledBody$453
            };
        }
        consumeSemicolon$167();
        return {
            type: Syntax$117.ExpressionStatement,
            expression: expr$452
        };
    }
    // 13 Function Definition
    function parseFunctionSourceElements$225() {
        var sourceElement$454, sourceElements$455 = [], token$456, directive$457, firstRestricted$458, oldLabelSet$459, oldInIteration$460, oldInSwitch$461, oldInFunctionBody$462;
        expect$162('{');
        while (index$123 < length$126) {
            token$456 = lookahead$157().token;
            if (token$456.type !== Token$115.StringLiteral) {
                break;
            }
            sourceElement$454 = parseSourceElement$228();
            sourceElements$455.push(sourceElement$454);
            if (sourceElement$454.expression.type !== Syntax$117.Literal) {
                // this is not directive
                break;
            }
            directive$457 = sliceSource$133(token$456.range[0] + 1, token$456.range[1] - 1);
            if (directive$457 === 'use strict') {
                strict$122 = true;
                if (firstRestricted$458) {
                    throwError$159(firstRestricted$458, Messages$119.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$458 && token$456.octal) {
                    firstRestricted$458 = token$456;
                }
            }
        }
        oldLabelSet$459 = state$128.labelSet;
        oldInIteration$460 = state$128.inIteration;
        oldInSwitch$461 = state$128.inSwitch;
        oldInFunctionBody$462 = state$128.inFunctionBody;
        state$128.labelSet = {};
        state$128.inIteration = false;
        state$128.inSwitch = false;
        state$128.inFunctionBody = true;
        while (index$123 < length$126) {
            if (match$164('}')) {
                break;
            }
            sourceElement$454 = parseSourceElement$228();
            if (typeof sourceElement$454 === 'undefined') {
                break;
            }
            sourceElements$455.push(sourceElement$454);
        }
        expect$162('}');
        state$128.labelSet = oldLabelSet$459;
        state$128.inIteration = oldInIteration$460;
        state$128.inSwitch = oldInSwitch$461;
        state$128.inFunctionBody = oldInFunctionBody$462;
        return {
            type: Syntax$117.BlockStatement,
            body: sourceElements$455
        };
    }
    function parseFunctionDeclaration$226() {
        var id$463, param$464, params$465 = [], body$466, token$467, firstRestricted$468, message$469, previousStrict$470, paramSet$471;
        expectKeyword$163('function');
        token$467 = lookahead$157().token;
        id$463 = parseVariableIdentifier$202();
        if (strict$122) {
            if (isRestrictedWord$143(token$467.value)) {
                throwError$159(token$467, Messages$119.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$143(token$467.value)) {
                firstRestricted$468 = token$467;
                message$469 = Messages$119.StrictFunctionName;
            } else if (isStrictModeReservedWord$142(token$467.value)) {
                firstRestricted$468 = token$467;
                message$469 = Messages$119.StrictReservedWord;
            }
        }
        expect$162('(');
        if (!match$164(')')) {
            paramSet$471 = {};
            while (index$123 < length$126) {
                token$467 = lookahead$157().token;
                param$464 = parseVariableIdentifier$202();
                if (strict$122) {
                    if (isRestrictedWord$143(token$467.value)) {
                        throwError$159(token$467, Messages$119.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$471, token$467.value)) {
                        throwError$159(token$467, Messages$119.StrictParamDupe);
                    }
                } else if (!firstRestricted$468) {
                    if (isRestrictedWord$143(token$467.value)) {
                        firstRestricted$468 = token$467;
                        message$469 = Messages$119.StrictParamName;
                    } else if (isStrictModeReservedWord$142(token$467.value)) {
                        firstRestricted$468 = token$467;
                        message$469 = Messages$119.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$471, token$467.value)) {
                        firstRestricted$468 = token$467;
                        message$469 = Messages$119.StrictParamDupe;
                    }
                }
                params$465.push(param$464);
                paramSet$471[param$464.name] = true;
                if (match$164(')')) {
                    break;
                }
                expect$162(',');
            }
        }
        expect$162(')');
        previousStrict$470 = strict$122;
        body$466 = parseFunctionSourceElements$225();
        if (strict$122 && firstRestricted$468) {
            throwError$159(firstRestricted$468, message$469);
        }
        strict$122 = previousStrict$470;
        return {
            type: Syntax$117.FunctionDeclaration,
            id: id$463,
            params: params$465,
            body: body$466
        };
    }
    function parseFunctionExpression$227() {
        var token$472, id$473 = null, firstRestricted$474, message$475, param$476, params$477 = [], body$478, previousStrict$479, paramSet$480;
        expectKeyword$163('function');
        if (!match$164('(')) {
            token$472 = lookahead$157().token;
            id$473 = parseVariableIdentifier$202();
            if (strict$122) {
                if (isRestrictedWord$143(token$472.value)) {
                    throwError$159(token$472, Messages$119.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$143(token$472.value)) {
                    firstRestricted$474 = token$472;
                    message$475 = Messages$119.StrictFunctionName;
                } else if (isStrictModeReservedWord$142(token$472.value)) {
                    firstRestricted$474 = token$472;
                    message$475 = Messages$119.StrictReservedWord;
                }
            }
        }
        expect$162('(');
        if (!match$164(')')) {
            paramSet$480 = {};
            while (index$123 < length$126) {
                token$472 = lookahead$157().token;
                param$476 = parseVariableIdentifier$202();
                if (strict$122) {
                    if (isRestrictedWord$143(token$472.value)) {
                        throwError$159(token$472, Messages$119.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$480, token$472.value)) {
                        throwError$159(token$472, Messages$119.StrictParamDupe);
                    }
                } else if (!firstRestricted$474) {
                    if (isRestrictedWord$143(token$472.value)) {
                        firstRestricted$474 = token$472;
                        message$475 = Messages$119.StrictParamName;
                    } else if (isStrictModeReservedWord$142(token$472.value)) {
                        firstRestricted$474 = token$472;
                        message$475 = Messages$119.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$480, token$472.value)) {
                        firstRestricted$474 = token$472;
                        message$475 = Messages$119.StrictParamDupe;
                    }
                }
                params$477.push(param$476);
                paramSet$480[param$476.name] = true;
                if (match$164(')')) {
                    break;
                }
                expect$162(',');
            }
        }
        expect$162(')');
        previousStrict$479 = strict$122;
        body$478 = parseFunctionSourceElements$225();
        if (strict$122 && firstRestricted$474) {
            throwError$159(firstRestricted$474, message$475);
        }
        strict$122 = previousStrict$479;
        return {
            type: Syntax$117.FunctionExpression,
            id: id$473,
            params: params$477,
            body: body$478
        };
    }
    // 14 Program
    function parseSourceElement$228() {
        var token$481 = lookahead$157().token;
        if (token$481.type === Token$115.Keyword) {
            switch (token$481.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$206(token$481.value);
            case 'function':
                return parseFunctionDeclaration$226();
            default:
                return parseStatement$224();
            }
        }
        if (token$481.type !== Token$115.EOF) {
            return parseStatement$224();
        }
    }
    function parseSourceElements$229() {
        var sourceElement$482, sourceElements$483 = [], token$484, directive$485, firstRestricted$486;
        while (index$123 < length$126) {
            token$484 = lookahead$157();
            if (token$484.type !== Token$115.StringLiteral) {
                break;
            }
            sourceElement$482 = parseSourceElement$228();
            sourceElements$483.push(sourceElement$482);
            if (sourceElement$482.expression.type !== Syntax$117.Literal) {
                // this is not directive
                break;
            }
            directive$485 = sliceSource$133(token$484.range[0] + 1, token$484.range[1] - 1);
            if (directive$485 === 'use strict') {
                strict$122 = true;
                if (firstRestricted$486) {
                    throwError$159(firstRestricted$486, Messages$119.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$486 && token$484.octal) {
                    firstRestricted$486 = token$484;
                }
            }
        }
        while (index$123 < length$126) {
            sourceElement$482 = parseSourceElement$228();
            if (typeof sourceElement$482 === 'undefined') {
                break;
            }
            sourceElements$483.push(sourceElement$482);
        }
        return sourceElements$483;
    }
    function parseProgram$230() {
        var program$487;
        strict$122 = false;
        program$487 = {
            type: Syntax$117.Program,
            body: parseSourceElements$229()
        };
        return program$487;
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$231(start$488, end$489, type$490, value$491) {
        assert$131(typeof start$488 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$130.comments.length > 0) {
            if (extra$130.comments[extra$130.comments.length - 1].range[1] > start$488) {
                return;
            }
        }
        extra$130.comments.push({
            range: [
                start$488,
                end$489
            ],
            type: type$490,
            value: value$491
        });
    }
    function scanComment$232() {
        var comment$492, ch$493, start$494, blockComment$495, lineComment$496;
        comment$492 = '';
        blockComment$495 = false;
        lineComment$496 = false;
        while (index$123 < length$126) {
            ch$493 = source$121[index$123];
            if (lineComment$496) {
                ch$493 = nextChar$145();
                if (index$123 >= length$126) {
                    lineComment$496 = false;
                    comment$492 += ch$493;
                    addComment$231(start$494, index$123, 'Line', comment$492);
                } else if (isLineTerminator$138(ch$493)) {
                    lineComment$496 = false;
                    addComment$231(start$494, index$123, 'Line', comment$492);
                    if (ch$493 === '\r' && source$121[index$123] === '\n') {
                        ++index$123;
                    }
                    ++lineNumber$124;
                    lineStart$125 = index$123;
                    comment$492 = '';
                } else {
                    comment$492 += ch$493;
                }
            } else if (blockComment$495) {
                if (isLineTerminator$138(ch$493)) {
                    if (ch$493 === '\r' && source$121[index$123 + 1] === '\n') {
                        ++index$123;
                        comment$492 += '\r\n';
                    } else {
                        comment$492 += ch$493;
                    }
                    ++lineNumber$124;
                    ++index$123;
                    lineStart$125 = index$123;
                    if (index$123 >= length$126) {
                        throwError$159({}, Messages$119.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$493 = nextChar$145();
                    if (index$123 >= length$126) {
                        throwError$159({}, Messages$119.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$492 += ch$493;
                    if (ch$493 === '*') {
                        ch$493 = source$121[index$123];
                        if (ch$493 === '/') {
                            comment$492 = comment$492.substr(0, comment$492.length - 1);
                            blockComment$495 = false;
                            ++index$123;
                            addComment$231(start$494, index$123, 'Block', comment$492);
                            comment$492 = '';
                        }
                    }
                }
            } else if (ch$493 === '/') {
                ch$493 = source$121[index$123 + 1];
                if (ch$493 === '/') {
                    start$494 = index$123;
                    index$123 += 2;
                    lineComment$496 = true;
                } else if (ch$493 === '*') {
                    start$494 = index$123;
                    index$123 += 2;
                    blockComment$495 = true;
                    if (index$123 >= length$126) {
                        throwError$159({}, Messages$119.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$137(ch$493)) {
                ++index$123;
            } else if (isLineTerminator$138(ch$493)) {
                ++index$123;
                if (ch$493 === '\r' && source$121[index$123] === '\n') {
                    ++index$123;
                }
                ++lineNumber$124;
                lineStart$125 = index$123;
            } else {
                break;
            }
        }
    }
    function collectToken$233() {
        var token$497 = extra$130.advance(), range$498, value$499;
        if (token$497.type !== Token$115.EOF) {
            range$498 = [
                token$497.range[0],
                token$497.range[1]
            ];
            value$499 = sliceSource$133(token$497.range[0], token$497.range[1]);
            extra$130.tokens.push({
                type: TokenName$116[token$497.type],
                value: value$499,
                lineNumber: lineNumber$124,
                lineStart: lineStart$125,
                range: range$498
            });
        }
        return token$497;
    }
    function collectRegex$234() {
        var pos$500, regex$501, token$502;
        skipComment$147();
        pos$500 = index$123;
        regex$501 = extra$130.scanRegExp();
        // Pop the previous token, which is likely '/' or '/='
        if (extra$130.tokens.length > 0) {
            token$502 = extra$130.tokens[extra$130.tokens.length - 1];
            if (token$502.range[0] === pos$500 && token$502.type === 'Punctuator') {
                if (token$502.value === '/' || token$502.value === '/=') {
                    extra$130.tokens.pop();
                }
            }
        }
        extra$130.tokens.push({
            type: 'RegularExpression',
            value: regex$501.literal,
            range: [
                pos$500,
                index$123
            ],
            lineStart: token$502.lineStart,
            lineNumber: token$502.lineNumber
        });
        return regex$501;
    }
    function createLiteral$235(token$503) {
        if (Array.isArray(token$503)) {
            return {
                type: Syntax$117.Literal,
                value: token$503
            };
        }
        return {
            type: Syntax$117.Literal,
            value: token$503.value,
            lineStart: token$503.lineStart,
            lineNumber: token$503.lineNumber
        };
    }
    function createRawLiteral$236(token$504) {
        return {
            type: Syntax$117.Literal,
            value: token$504.value,
            raw: sliceSource$133(token$504.range[0], token$504.range[1]),
            lineStart: token$504.lineStart,
            lineNumber: token$504.lineNumber
        };
    }
    function wrapTrackingFunction$237(range$505, loc$506) {
        return function (parseFunction$507) {
            function isBinary$508(node$510) {
                return node$510.type === Syntax$117.LogicalExpression || node$510.type === Syntax$117.BinaryExpression;
            }
            function visit$509(node$511) {
                if (isBinary$508(node$511.left)) {
                    visit$509(node$511.left);
                }
                if (isBinary$508(node$511.right)) {
                    visit$509(node$511.right);
                }
                if (range$505 && typeof node$511.range === 'undefined') {
                    node$511.range = [
                        node$511.left.range[0],
                        node$511.right.range[1]
                    ];
                }
                if (loc$506 && typeof node$511.loc === 'undefined') {
                    node$511.loc = {
                        start: node$511.left.loc.start,
                        end: node$511.right.loc.end
                    };
                }
            }
            return function () {
                var node$512, rangeInfo$513, locInfo$514;
                // skipComment();
                var curr$515 = tokenStream$129[index$123].token;
                rangeInfo$513 = [
                    curr$515.range[0],
                    0
                ];
                locInfo$514 = {
                    start: {
                        line: curr$515.sm_lineNumber,
                        column: curr$515.sm_lineStart
                    }
                };
                node$512 = parseFunction$507.apply(null, arguments);
                if (typeof node$512 !== 'undefined') {
                    var last$516 = tokenStream$129[index$123].token;
                    if (range$505) {
                        rangeInfo$513[1] = last$516.range[1];
                        node$512.range = rangeInfo$513;
                    }
                    if (loc$506) {
                        locInfo$514.end = {
                            line: last$516.sm_lineNumber,
                            column: last$516.sm_lineStart
                        };
                        node$512.loc = locInfo$514;
                    }
                    if (isBinary$508(node$512)) {
                        visit$509(node$512);
                    }
                    if (node$512.type === Syntax$117.MemberExpression) {
                        if (typeof node$512.object.range !== 'undefined') {
                            node$512.range[0] = node$512.object.range[0];
                        }
                        if (typeof node$512.object.loc !== 'undefined') {
                            node$512.loc.start = node$512.object.loc.start;
                        }
                    }
                    if (node$512.type === Syntax$117.CallExpression) {
                        if (typeof node$512.callee.range !== 'undefined') {
                            node$512.range[0] = node$512.callee.range[0];
                        }
                        if (typeof node$512.callee.loc !== 'undefined') {
                            node$512.loc.start = node$512.callee.loc.start;
                        }
                    }
                    if (node$512.type !== Syntax$117.Program) {
                        if (curr$515.leadingComments) {
                            node$512.leadingComments = curr$515.leadingComments;
                        }
                        if (curr$515.trailingComments) {
                            node$512.trailingComments = curr$515.trailingComments;
                        }
                    }
                    return node$512;
                }
            };
        };
    }
    function patch$238() {
        var wrapTracking$517;
        if (extra$130.comments) {
            extra$130.skipComment = skipComment$147;
            skipComment$147 = scanComment$232;
        }
        if (extra$130.raw) {
            extra$130.createLiteral = createLiteral$235;
            createLiteral$235 = createRawLiteral$236;
        }
        if (extra$130.range || extra$130.loc) {
            wrapTracking$517 = wrapTrackingFunction$237(extra$130.range, extra$130.loc);
            extra$130.parseAdditiveExpression = parseAdditiveExpression$188;
            extra$130.parseAssignmentExpression = parseAssignmentExpression$198;
            extra$130.parseBitwiseANDExpression = parseBitwiseANDExpression$192;
            extra$130.parseBitwiseORExpression = parseBitwiseORExpression$194;
            extra$130.parseBitwiseXORExpression = parseBitwiseXORExpression$193;
            extra$130.parseBlock = parseBlock$201;
            extra$130.parseFunctionSourceElements = parseFunctionSourceElements$225;
            extra$130.parseCallMember = parseCallMember$179;
            extra$130.parseCatchClause = parseCatchClause$221;
            extra$130.parseComputedMember = parseComputedMember$178;
            extra$130.parseConditionalExpression = parseConditionalExpression$197;
            extra$130.parseConstLetDeclaration = parseConstLetDeclaration$206;
            extra$130.parseEqualityExpression = parseEqualityExpression$191;
            extra$130.parseExpression = parseExpression$199;
            extra$130.parseForVariableDeclaration = parseForVariableDeclaration$212;
            extra$130.parseFunctionDeclaration = parseFunctionDeclaration$226;
            extra$130.parseFunctionExpression = parseFunctionExpression$227;
            extra$130.parseLogicalANDExpression = parseLogicalANDExpression$195;
            extra$130.parseLogicalORExpression = parseLogicalORExpression$196;
            extra$130.parseMultiplicativeExpression = parseMultiplicativeExpression$187;
            extra$130.parseNewExpression = parseNewExpression$180;
            extra$130.parseNonComputedMember = parseNonComputedMember$177;
            extra$130.parseNonComputedProperty = parseNonComputedProperty$176;
            extra$130.parseObjectProperty = parseObjectProperty$172;
            extra$130.parseObjectPropertyKey = parseObjectPropertyKey$171;
            extra$130.parsePostfixExpression = parsePostfixExpression$185;
            extra$130.parsePrimaryExpression = parsePrimaryExpression$174;
            extra$130.parseProgram = parseProgram$230;
            extra$130.parsePropertyFunction = parsePropertyFunction$170;
            extra$130.parseRelationalExpression = parseRelationalExpression$190;
            extra$130.parseStatement = parseStatement$224;
            extra$130.parseShiftExpression = parseShiftExpression$189;
            extra$130.parseSwitchCase = parseSwitchCase$218;
            extra$130.parseUnaryExpression = parseUnaryExpression$186;
            extra$130.parseVariableDeclaration = parseVariableDeclaration$203;
            extra$130.parseVariableIdentifier = parseVariableIdentifier$202;
            parseAdditiveExpression$188 = wrapTracking$517(extra$130.parseAdditiveExpression);
            parseAssignmentExpression$198 = wrapTracking$517(extra$130.parseAssignmentExpression);
            parseBitwiseANDExpression$192 = wrapTracking$517(extra$130.parseBitwiseANDExpression);
            parseBitwiseORExpression$194 = wrapTracking$517(extra$130.parseBitwiseORExpression);
            parseBitwiseXORExpression$193 = wrapTracking$517(extra$130.parseBitwiseXORExpression);
            parseBlock$201 = wrapTracking$517(extra$130.parseBlock);
            parseFunctionSourceElements$225 = wrapTracking$517(extra$130.parseFunctionSourceElements);
            parseCallMember$179 = wrapTracking$517(extra$130.parseCallMember);
            parseCatchClause$221 = wrapTracking$517(extra$130.parseCatchClause);
            parseComputedMember$178 = wrapTracking$517(extra$130.parseComputedMember);
            parseConditionalExpression$197 = wrapTracking$517(extra$130.parseConditionalExpression);
            parseConstLetDeclaration$206 = wrapTracking$517(extra$130.parseConstLetDeclaration);
            parseEqualityExpression$191 = wrapTracking$517(extra$130.parseEqualityExpression);
            parseExpression$199 = wrapTracking$517(extra$130.parseExpression);
            parseForVariableDeclaration$212 = wrapTracking$517(extra$130.parseForVariableDeclaration);
            parseFunctionDeclaration$226 = wrapTracking$517(extra$130.parseFunctionDeclaration);
            parseFunctionExpression$227 = wrapTracking$517(extra$130.parseFunctionExpression);
            parseLogicalANDExpression$195 = wrapTracking$517(extra$130.parseLogicalANDExpression);
            parseLogicalORExpression$196 = wrapTracking$517(extra$130.parseLogicalORExpression);
            parseMultiplicativeExpression$187 = wrapTracking$517(extra$130.parseMultiplicativeExpression);
            parseNewExpression$180 = wrapTracking$517(extra$130.parseNewExpression);
            parseNonComputedMember$177 = wrapTracking$517(extra$130.parseNonComputedMember);
            parseNonComputedProperty$176 = wrapTracking$517(extra$130.parseNonComputedProperty);
            parseObjectProperty$172 = wrapTracking$517(extra$130.parseObjectProperty);
            parseObjectPropertyKey$171 = wrapTracking$517(extra$130.parseObjectPropertyKey);
            parsePostfixExpression$185 = wrapTracking$517(extra$130.parsePostfixExpression);
            parsePrimaryExpression$174 = wrapTracking$517(extra$130.parsePrimaryExpression);
            parseProgram$230 = wrapTracking$517(extra$130.parseProgram);
            parsePropertyFunction$170 = wrapTracking$517(extra$130.parsePropertyFunction);
            parseRelationalExpression$190 = wrapTracking$517(extra$130.parseRelationalExpression);
            parseStatement$224 = wrapTracking$517(extra$130.parseStatement);
            parseShiftExpression$189 = wrapTracking$517(extra$130.parseShiftExpression);
            parseSwitchCase$218 = wrapTracking$517(extra$130.parseSwitchCase);
            parseUnaryExpression$186 = wrapTracking$517(extra$130.parseUnaryExpression);
            parseVariableDeclaration$203 = wrapTracking$517(extra$130.parseVariableDeclaration);
            parseVariableIdentifier$202 = wrapTracking$517(extra$130.parseVariableIdentifier);
        }
        if (typeof extra$130.tokens !== 'undefined') {
            extra$130.advance = advance$155;
            extra$130.scanRegExp = scanRegExp$153;
            advance$155 = collectToken$233;
            scanRegExp$153 = collectRegex$234;
        }
    }
    function unpatch$239() {
        if (typeof extra$130.skipComment === 'function') {
            skipComment$147 = extra$130.skipComment;
        }
        if (extra$130.raw) {
            createLiteral$235 = extra$130.createLiteral;
        }
        if (extra$130.range || extra$130.loc) {
            parseAdditiveExpression$188 = extra$130.parseAdditiveExpression;
            parseAssignmentExpression$198 = extra$130.parseAssignmentExpression;
            parseBitwiseANDExpression$192 = extra$130.parseBitwiseANDExpression;
            parseBitwiseORExpression$194 = extra$130.parseBitwiseORExpression;
            parseBitwiseXORExpression$193 = extra$130.parseBitwiseXORExpression;
            parseBlock$201 = extra$130.parseBlock;
            parseFunctionSourceElements$225 = extra$130.parseFunctionSourceElements;
            parseCallMember$179 = extra$130.parseCallMember;
            parseCatchClause$221 = extra$130.parseCatchClause;
            parseComputedMember$178 = extra$130.parseComputedMember;
            parseConditionalExpression$197 = extra$130.parseConditionalExpression;
            parseConstLetDeclaration$206 = extra$130.parseConstLetDeclaration;
            parseEqualityExpression$191 = extra$130.parseEqualityExpression;
            parseExpression$199 = extra$130.parseExpression;
            parseForVariableDeclaration$212 = extra$130.parseForVariableDeclaration;
            parseFunctionDeclaration$226 = extra$130.parseFunctionDeclaration;
            parseFunctionExpression$227 = extra$130.parseFunctionExpression;
            parseLogicalANDExpression$195 = extra$130.parseLogicalANDExpression;
            parseLogicalORExpression$196 = extra$130.parseLogicalORExpression;
            parseMultiplicativeExpression$187 = extra$130.parseMultiplicativeExpression;
            parseNewExpression$180 = extra$130.parseNewExpression;
            parseNonComputedMember$177 = extra$130.parseNonComputedMember;
            parseNonComputedProperty$176 = extra$130.parseNonComputedProperty;
            parseObjectProperty$172 = extra$130.parseObjectProperty;
            parseObjectPropertyKey$171 = extra$130.parseObjectPropertyKey;
            parsePrimaryExpression$174 = extra$130.parsePrimaryExpression;
            parsePostfixExpression$185 = extra$130.parsePostfixExpression;
            parseProgram$230 = extra$130.parseProgram;
            parsePropertyFunction$170 = extra$130.parsePropertyFunction;
            parseRelationalExpression$190 = extra$130.parseRelationalExpression;
            parseStatement$224 = extra$130.parseStatement;
            parseShiftExpression$189 = extra$130.parseShiftExpression;
            parseSwitchCase$218 = extra$130.parseSwitchCase;
            parseUnaryExpression$186 = extra$130.parseUnaryExpression;
            parseVariableDeclaration$203 = extra$130.parseVariableDeclaration;
            parseVariableIdentifier$202 = extra$130.parseVariableIdentifier;
        }
        if (typeof extra$130.scanRegExp === 'function') {
            advance$155 = extra$130.advance;
            scanRegExp$153 = extra$130.scanRegExp;
        }
    }
    function stringToArray$240(str$518) {
        var length$519 = str$518.length, result$520 = [], i$521;
        for (i$521 = 0; i$521 < length$519; ++i$521) {
            result$520[i$521] = str$518.charAt(i$521);
        }
        return result$520;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$241(toks$522, start$523, inExprDelim$524, parentIsBlock$525) {
        var assignOps$526 = [
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
        var binaryOps$527 = [
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
        var unaryOps$528 = [
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
        function back$529(n$530) {
            var idx$531 = toks$522.length - n$530 > 0 ? toks$522.length - n$530 : 0;
            return toks$522[idx$531];
        }
        if (inExprDelim$524 && toks$522.length - (start$523 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$529(start$523 + 2).value === ':' && parentIsBlock$525) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$132(back$529(start$523 + 2).value, unaryOps$528.concat(binaryOps$527).concat(assignOps$526))) {
            // ... + {...}
            return false;
        } else if (back$529(start$523 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$532 = typeof back$529(start$523 + 1).startLineNumber !== 'undefined' ? back$529(start$523 + 1).startLineNumber : back$529(start$523 + 1).lineNumber;
            if (back$529(start$523 + 2).lineNumber !== currLineNumber$532) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$132(back$529(start$523 + 2).value, [
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
    function readToken$242(toks$533, inExprDelim$534, parentIsBlock$535) {
        var delimiters$536 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$537 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$538 = toks$533.length - 1;
        var comments$539, commentsLen$540 = extra$130.comments.length;
        function back$541(n$545) {
            var idx$546 = toks$533.length - n$545 > 0 ? toks$533.length - n$545 : 0;
            return toks$533[idx$546];
        }
        function attachComments$542(token$547) {
            if (comments$539) {
                token$547.leadingComments = comments$539;
            }
            return token$547;
        }
        function _advance$543() {
            return attachComments$542(advance$155());
        }
        function _scanRegExp$544() {
            return attachComments$542(scanRegExp$153());
        }
        skipComment$147();
        if (extra$130.comments.length > commentsLen$540) {
            comments$539 = extra$130.comments.slice(commentsLen$540);
        }
        if (isIn$132(getChar$146(), delimiters$536)) {
            return attachComments$542(readDelim$243(toks$533, inExprDelim$534, parentIsBlock$535));
        }
        if (getChar$146() === '/') {
            var prev$548 = back$541(1);
            if (prev$548) {
                if (prev$548.value === '()') {
                    if (isIn$132(back$541(2).value, parenIdents$537)) {
                        // ... if (...) / ...
                        return _scanRegExp$544();
                    }
                    // ... (...) / ...
                    return _advance$543();
                }
                if (prev$548.value === '{}') {
                    if (blockAllowed$241(toks$533, 0, inExprDelim$534, parentIsBlock$535)) {
                        if (back$541(2).value === '()') {
                            // named function
                            if (back$541(4).value === 'function') {
                                if (!blockAllowed$241(toks$533, 3, inExprDelim$534, parentIsBlock$535)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$543();
                                }
                                if (toks$533.length - 5 <= 0 && inExprDelim$534) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$543();
                                }
                            }
                            // unnamed function
                            if (back$541(3).value === 'function') {
                                if (!blockAllowed$241(toks$533, 2, inExprDelim$534, parentIsBlock$535)) {
                                    // new function (...) {...} / ...
                                    return _advance$543();
                                }
                                if (toks$533.length - 4 <= 0 && inExprDelim$534) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$543();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$544();
                    } else {
                        // ... + {...} / ...
                        return _advance$543();
                    }
                }
                if (prev$548.type === Token$115.Punctuator) {
                    // ... + /...
                    return _scanRegExp$544();
                }
                if (isKeyword$144(prev$548.value)) {
                    // typeof /...
                    return _scanRegExp$544();
                }
                return _advance$543();
            }
            return _scanRegExp$544();
        }
        return _advance$543();
    }
    function readDelim$243(toks$549, inExprDelim$550, parentIsBlock$551) {
        var startDelim$552 = advance$155(), matchDelim$553 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$554 = [];
        var delimiters$555 = [
                '(',
                '{',
                '['
            ];
        assert$131(delimiters$555.indexOf(startDelim$552.value) !== -1, 'Need to begin at the delimiter');
        var token$556 = startDelim$552;
        var startLineNumber$557 = token$556.lineNumber;
        var startLineStart$558 = token$556.lineStart;
        var startRange$559 = token$556.range;
        var delimToken$560 = {};
        delimToken$560.type = Token$115.Delimiter;
        delimToken$560.value = startDelim$552.value + matchDelim$553[startDelim$552.value];
        delimToken$560.startLineNumber = startLineNumber$557;
        delimToken$560.startLineStart = startLineStart$558;
        delimToken$560.startRange = startRange$559;
        var delimIsBlock$561 = false;
        if (startDelim$552.value === '{') {
            delimIsBlock$561 = blockAllowed$241(toks$549.concat(delimToken$560), 0, inExprDelim$550, parentIsBlock$551);
        }
        while (index$123 <= length$126) {
            token$556 = readToken$242(inner$554, startDelim$552.value === '(' || startDelim$552.value === '[', delimIsBlock$561);
            if (token$556.type === Token$115.Punctuator && token$556.value === matchDelim$553[startDelim$552.value]) {
                if (token$556.leadingComments) {
                    delimToken$560.trailingComments = token$556.leadingComments;
                }
                break;
            } else if (token$556.type === Token$115.EOF) {
                throwError$159({}, Messages$119.UnexpectedEOS);
            } else {
                inner$554.push(token$556);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$123 >= length$126 && matchDelim$553[startDelim$552.value] !== source$121[length$126 - 1]) {
            throwError$159({}, Messages$119.UnexpectedEOS);
        }
        var endLineNumber$562 = token$556.lineNumber;
        var endLineStart$563 = token$556.lineStart;
        var endRange$564 = token$556.range;
        delimToken$560.inner = inner$554;
        delimToken$560.endLineNumber = endLineNumber$562;
        delimToken$560.endLineStart = endLineStart$563;
        delimToken$560.endRange = endRange$564;
        return delimToken$560;
    }
    ;
    // (Str) -> [...CSyntax]
    function read$244(code$565) {
        var token$566, tokenTree$567 = [];
        extra$130 = {};
        extra$130.comments = [];
        patch$238();
        source$121 = code$565;
        index$123 = 0;
        lineNumber$124 = source$121.length > 0 ? 1 : 0;
        lineStart$125 = 0;
        length$126 = source$121.length;
        buffer$127 = null;
        state$128 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$123 < length$126) {
            tokenTree$567.push(readToken$242(tokenTree$567, false, false));
        }
        var last$568 = tokenTree$567[tokenTree$567.length - 1];
        if (last$568 && last$568.type !== Token$115.EOF) {
            tokenTree$567.push({
                type: Token$115.EOF,
                value: '',
                lineNumber: last$568.lineNumber,
                lineStart: last$568.lineStart,
                range: [
                    index$123,
                    index$123
                ]
            });
        }
        return expander$114.tokensToSyntax(tokenTree$567);
    }
    // (SyntaxObject, Str, {}) -> SyntaxObject
    function parse$245(code$569) {
        var program$570, toString$571;
        tokenStream$129 = code$569;
        index$123 = 0;
        length$126 = tokenStream$129.length;
        buffer$127 = null;
        state$128 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$130 = {
            range: true,
            loc: true
        };
        patch$238();
        try {
            program$570 = parseProgram$230();
            program$570.tokens = expander$114.syntaxToTokens(code$569);
        } catch (e$572) {
            throw e$572;
        } finally {
            unpatch$239();
            extra$130 = {};
        }
        return program$570;
    }
    exports$113.parse = parse$245;
    exports$113.read = read$244;
    exports$113.Token = Token$115;
    exports$113.assert = assert$131;
    // Deep copy.
    exports$113.Syntax = function () {
        var name$573, types$574 = {};
        if (typeof Object.create === 'function') {
            types$574 = Object.create(null);
        }
        for (name$573 in Syntax$117) {
            if (Syntax$117.hasOwnProperty(name$573)) {
                types$574[name$573] = Syntax$117[name$573];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$574);
        }
        return types$574;
    }();
}));