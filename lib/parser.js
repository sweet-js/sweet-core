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
(function (root$1284, factory$1285) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1285(exports, require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'expander'
        ], factory$1285);
    }
}(this, function (exports$1286, expander$1287) {
    'use strict';
    var Token$1288, TokenName$1289, Syntax$1290, PropertyKind$1291, Messages$1292, Regex$1293, source$1294, strict$1295, index$1296, lineNumber$1297, lineStart$1298, length$1299, buffer$1300, state$1301, tokenStream$1302, extra$1303;
    Token$1288 = {
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
    TokenName$1289 = {};
    TokenName$1289[Token$1288.BooleanLiteral] = 'Boolean';
    TokenName$1289[Token$1288.EOF] = '<end>';
    TokenName$1289[Token$1288.Identifier] = 'Identifier';
    TokenName$1289[Token$1288.Keyword] = 'Keyword';
    TokenName$1289[Token$1288.NullLiteral] = 'Null';
    TokenName$1289[Token$1288.NumericLiteral] = 'Numeric';
    TokenName$1289[Token$1288.Punctuator] = 'Punctuator';
    TokenName$1289[Token$1288.StringLiteral] = 'String';
    TokenName$1289[Token$1288.Delimiter] = 'Delimiter';
    Syntax$1290 = {
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
    PropertyKind$1291 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    // Error messages should be identical to V8.
    Messages$1292 = {
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
    Regex$1293 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$1306(condition$1651, message$1652) {
        if (!condition$1651) {
            throw new Error('ASSERT: ' + message$1652);
        }
    }
    function isIn$1309(el$1653, list$1654) {
        return list$1654.indexOf(el$1653) !== -1;
    }
    function sliceSource$1312(from$1655, to$1656) {
        return source$1294.slice(from$1655, to$1656);
    }
    if (typeof 'esprima'[0] === 'undefined') {
        sliceSource$1312 = function sliceArraySource$1659(from$1660, to$1661) {
            return source$1294.slice(from$1660, to$1661).join('');
        };
    }
    function isDecimalDigit$1315(ch$1662) {
        return '0123456789'.indexOf(ch$1662) >= 0;
    }
    function isHexDigit$1318(ch$1663) {
        return '0123456789abcdefABCDEF'.indexOf(ch$1663) >= 0;
    }
    function isOctalDigit$1321(ch$1664) {
        return '01234567'.indexOf(ch$1664) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$1324(ch$1665) {
        return ch$1665 === ' ' || ch$1665 === '\t' || ch$1665 === '\x0B' || ch$1665 === '\f' || ch$1665 === '\xa0' || ch$1665.charCodeAt(0) >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(ch$1665) >= 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$1327(ch$1666) {
        return ch$1666 === '\n' || ch$1666 === '\r' || ch$1666 === '\u2028' || ch$1666 === '\u2029';
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$1330(ch$1667) {
        return ch$1667 === '$' || ch$1667 === '_' || ch$1667 === '\\' || ch$1667 >= 'a' && ch$1667 <= 'z' || ch$1667 >= 'A' && ch$1667 <= 'Z' || ch$1667.charCodeAt(0) >= 128 && Regex$1293.NonAsciiIdentifierStart.test(ch$1667);
    }
    function isIdentifierPart$1333(ch$1668) {
        return ch$1668 === '$' || ch$1668 === '_' || ch$1668 === '\\' || ch$1668 >= 'a' && ch$1668 <= 'z' || ch$1668 >= 'A' && ch$1668 <= 'Z' || ch$1668 >= '0' && ch$1668 <= '9' || ch$1668.charCodeAt(0) >= 128 && Regex$1293.NonAsciiIdentifierPart.test(ch$1668);
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$1336(id$1669) {
        // we are allowing future reserved words so macros can be written for them
        return false;
    }
    function isStrictModeReservedWord$1339(id$1670) {
        switch (id$1670) {
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
    function isRestrictedWord$1342(id$1671) {
        return id$1671 === 'eval' || id$1671 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$1345(id$1672) {
        var keyword$1673 = false;
        switch (id$1672.length) {
        case 2:
            keyword$1673 = id$1672 === 'if' || id$1672 === 'in' || id$1672 === 'do';
            break;
        case 3:
            keyword$1673 = id$1672 === 'var' || id$1672 === 'for' || id$1672 === 'new' || id$1672 === 'try';
            break;
        case 4:
            keyword$1673 = id$1672 === 'this' || id$1672 === 'else' || id$1672 === 'case' || id$1672 === 'void' || id$1672 === 'with';
            break;
        case 5:
            keyword$1673 = id$1672 === 'while' || id$1672 === 'break' || id$1672 === 'catch' || id$1672 === 'throw';
            break;
        case 6:
            keyword$1673 = id$1672 === 'return' || id$1672 === 'typeof' || id$1672 === 'delete' || id$1672 === 'switch';
            break;
        case 7:
            keyword$1673 = id$1672 === 'default' || id$1672 === 'finally';
            break;
        case 8:
            keyword$1673 = id$1672 === 'function' || id$1672 === 'continue' || id$1672 === 'debugger';
            break;
        case 10:
            keyword$1673 = id$1672 === 'instanceof';
            break;
        }
        if (keyword$1673) {
            return true;
        }
        switch (id$1672) {
        // Future reserved words.
        // 'const' is specialized as Keyword in V8.
        case 'const':
            return true;
        // For compatiblity to SpiderMonkey and ES.next
        case 'yield':
        case 'let':
            return true;
        }
        if (strict$1295 && isStrictModeReservedWord$1339(id$1672)) {
            return true;
        }
        return isFutureReservedWord$1336(id$1672);
    }
    // Return the next character and move forward.
    function nextChar$1348() {
        return source$1294[index$1296++];
    }
    function getChar$1351() {
        return source$1294[index$1296];
    }
    // 7.4 Comments
    function skipComment$1354() {
        var ch$1674, blockComment$1675, lineComment$1676;
        blockComment$1675 = false;
        lineComment$1676 = false;
        while (index$1296 < length$1299) {
            ch$1674 = source$1294[index$1296];
            if (lineComment$1676) {
                ch$1674 = nextChar$1348();
                if (isLineTerminator$1327(ch$1674)) {
                    lineComment$1676 = false;
                    if (ch$1674 === '\r' && source$1294[index$1296] === '\n') {
                        ++index$1296;
                    }
                    ++lineNumber$1297;
                    lineStart$1298 = index$1296;
                }
            } else if (blockComment$1675) {
                if (isLineTerminator$1327(ch$1674)) {
                    if (ch$1674 === '\r' && source$1294[index$1296 + 1] === '\n') {
                        ++index$1296;
                    }
                    ++lineNumber$1297;
                    ++index$1296;
                    lineStart$1298 = index$1296;
                    if (index$1296 >= length$1299) {
                        throwError$1390({}, Messages$1292.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1674 = nextChar$1348();
                    if (index$1296 >= length$1299) {
                        throwError$1390({}, Messages$1292.UnexpectedToken, 'ILLEGAL');
                    }
                    if (ch$1674 === '*') {
                        ch$1674 = source$1294[index$1296];
                        if (ch$1674 === '/') {
                            ++index$1296;
                            blockComment$1675 = false;
                        }
                    }
                }
            } else if (ch$1674 === '/') {
                ch$1674 = source$1294[index$1296 + 1];
                if (ch$1674 === '/') {
                    index$1296 += 2;
                    lineComment$1676 = true;
                } else if (ch$1674 === '*') {
                    index$1296 += 2;
                    blockComment$1675 = true;
                    if (index$1296 >= length$1299) {
                        throwError$1390({}, Messages$1292.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$1324(ch$1674)) {
                ++index$1296;
            } else if (isLineTerminator$1327(ch$1674)) {
                ++index$1296;
                if (ch$1674 === '\r' && source$1294[index$1296] === '\n') {
                    ++index$1296;
                }
                ++lineNumber$1297;
                lineStart$1298 = index$1296;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$1357(prefix$1677) {
        var i$1678, len$1679, ch$1680, code$1681 = 0;
        len$1679 = prefix$1677 === 'u' ? 4 : 2;
        for (i$1678 = 0; i$1678 < len$1679; ++i$1678) {
            if (index$1296 < length$1299 && isHexDigit$1318(source$1294[index$1296])) {
                ch$1680 = nextChar$1348();
                code$1681 = code$1681 * 16 + '0123456789abcdef'.indexOf(ch$1680.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$1681);
    }
    function scanIdentifier$1360() {
        var ch$1682, start$1683, id$1684, restore$1685;
        ch$1682 = source$1294[index$1296];
        if (!isIdentifierStart$1330(ch$1682)) {
            return;
        }
        start$1683 = index$1296;
        if (ch$1682 === '\\') {
            ++index$1296;
            if (source$1294[index$1296] !== 'u') {
                return;
            }
            ++index$1296;
            restore$1685 = index$1296;
            ch$1682 = scanHexEscape$1357('u');
            if (ch$1682) {
                if (ch$1682 === '\\' || !isIdentifierStart$1330(ch$1682)) {
                    return;
                }
                id$1684 = ch$1682;
            } else {
                index$1296 = restore$1685;
                id$1684 = 'u';
            }
        } else {
            id$1684 = nextChar$1348();
        }
        while (index$1296 < length$1299) {
            ch$1682 = source$1294[index$1296];
            if (!isIdentifierPart$1333(ch$1682)) {
                break;
            }
            if (ch$1682 === '\\') {
                ++index$1296;
                if (source$1294[index$1296] !== 'u') {
                    return;
                }
                ++index$1296;
                restore$1685 = index$1296;
                ch$1682 = scanHexEscape$1357('u');
                if (ch$1682) {
                    if (ch$1682 === '\\' || !isIdentifierPart$1333(ch$1682)) {
                        return;
                    }
                    id$1684 += ch$1682;
                } else {
                    index$1296 = restore$1685;
                    id$1684 += 'u';
                }
            } else {
                id$1684 += nextChar$1348();
            }
        }
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$1684.length === 1) {
            return {
                type: Token$1288.Identifier,
                value: id$1684,
                lineNumber: lineNumber$1297,
                lineStart: lineStart$1298,
                range: [
                    start$1683,
                    index$1296
                ]
            };
        }
        if (isKeyword$1345(id$1684)) {
            return {
                type: Token$1288.Keyword,
                value: id$1684,
                lineNumber: lineNumber$1297,
                lineStart: lineStart$1298,
                range: [
                    start$1683,
                    index$1296
                ]
            };
        }
        // 7.8.1 Null Literals
        if (id$1684 === 'null') {
            return {
                type: Token$1288.NullLiteral,
                value: id$1684,
                lineNumber: lineNumber$1297,
                lineStart: lineStart$1298,
                range: [
                    start$1683,
                    index$1296
                ]
            };
        }
        // 7.8.2 Boolean Literals
        if (id$1684 === 'true' || id$1684 === 'false') {
            return {
                type: Token$1288.BooleanLiteral,
                value: id$1684,
                lineNumber: lineNumber$1297,
                lineStart: lineStart$1298,
                range: [
                    start$1683,
                    index$1296
                ]
            };
        }
        return {
            type: Token$1288.Identifier,
            value: id$1684,
            lineNumber: lineNumber$1297,
            lineStart: lineStart$1298,
            range: [
                start$1683,
                index$1296
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$1363() {
        var start$1686 = index$1296, ch1$1687 = source$1294[index$1296], ch2$1688, ch3$1689, ch4$1690;
        // Check for most common single-character punctuators.
        if (ch1$1687 === ';' || ch1$1687 === '{' || ch1$1687 === '}') {
            ++index$1296;
            return {
                type: Token$1288.Punctuator,
                value: ch1$1687,
                lineNumber: lineNumber$1297,
                lineStart: lineStart$1298,
                range: [
                    start$1686,
                    index$1296
                ]
            };
        }
        if (ch1$1687 === ',' || ch1$1687 === '(' || ch1$1687 === ')') {
            ++index$1296;
            return {
                type: Token$1288.Punctuator,
                value: ch1$1687,
                lineNumber: lineNumber$1297,
                lineStart: lineStart$1298,
                range: [
                    start$1686,
                    index$1296
                ]
            };
        }
        if (ch1$1687 === '#' || ch1$1687 === '@') {
            ++index$1296;
            return {
                type: Token$1288.Punctuator,
                value: ch1$1687,
                lineNumber: lineNumber$1297,
                lineStart: lineStart$1298,
                range: [
                    start$1686,
                    index$1296
                ]
            };
        }
        // Dot (.) can also start a floating-point number, hence the need
        // to check the next character.
        ch2$1688 = source$1294[index$1296 + 1];
        if (ch1$1687 === '.' && !isDecimalDigit$1315(ch2$1688)) {
            if (source$1294[index$1296 + 1] === '.' && source$1294[index$1296 + 2] === '.') {
                nextChar$1348();
                nextChar$1348();
                nextChar$1348();
                return {
                    type: Token$1288.Punctuator,
                    value: '...',
                    lineNumber: lineNumber$1297,
                    lineStart: lineStart$1298,
                    range: [
                        start$1686,
                        index$1296
                    ]
                };
            } else {
                return {
                    type: Token$1288.Punctuator,
                    value: nextChar$1348(),
                    lineNumber: lineNumber$1297,
                    lineStart: lineStart$1298,
                    range: [
                        start$1686,
                        index$1296
                    ]
                };
            }
        }
        // Peek more characters.
        ch3$1689 = source$1294[index$1296 + 2];
        ch4$1690 = source$1294[index$1296 + 3];
        // 4-character punctuator: >>>=
        if (ch1$1687 === '>' && ch2$1688 === '>' && ch3$1689 === '>') {
            if (ch4$1690 === '=') {
                index$1296 += 4;
                return {
                    type: Token$1288.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$1297,
                    lineStart: lineStart$1298,
                    range: [
                        start$1686,
                        index$1296
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$1687 === '=' && ch2$1688 === '=' && ch3$1689 === '=') {
            index$1296 += 3;
            return {
                type: Token$1288.Punctuator,
                value: '===',
                lineNumber: lineNumber$1297,
                lineStart: lineStart$1298,
                range: [
                    start$1686,
                    index$1296
                ]
            };
        }
        if (ch1$1687 === '!' && ch2$1688 === '=' && ch3$1689 === '=') {
            index$1296 += 3;
            return {
                type: Token$1288.Punctuator,
                value: '!==',
                lineNumber: lineNumber$1297,
                lineStart: lineStart$1298,
                range: [
                    start$1686,
                    index$1296
                ]
            };
        }
        if (ch1$1687 === '>' && ch2$1688 === '>' && ch3$1689 === '>') {
            index$1296 += 3;
            return {
                type: Token$1288.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$1297,
                lineStart: lineStart$1298,
                range: [
                    start$1686,
                    index$1296
                ]
            };
        }
        if (ch1$1687 === '<' && ch2$1688 === '<' && ch3$1689 === '=') {
            index$1296 += 3;
            return {
                type: Token$1288.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$1297,
                lineStart: lineStart$1298,
                range: [
                    start$1686,
                    index$1296
                ]
            };
        }
        if (ch1$1687 === '>' && ch2$1688 === '>' && ch3$1689 === '=') {
            index$1296 += 3;
            return {
                type: Token$1288.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$1297,
                lineStart: lineStart$1298,
                range: [
                    start$1686,
                    index$1296
                ]
            };
        }
        // 2-character punctuators: <= >= == != ++ -- << >> && ||
        // += -= *= %= &= |= ^= /=
        if (ch2$1688 === '=') {
            if ('<>=!+-*%&|^/'.indexOf(ch1$1687) >= 0) {
                index$1296 += 2;
                return {
                    type: Token$1288.Punctuator,
                    value: ch1$1687 + ch2$1688,
                    lineNumber: lineNumber$1297,
                    lineStart: lineStart$1298,
                    range: [
                        start$1686,
                        index$1296
                    ]
                };
            }
        }
        if (ch1$1687 === ch2$1688 && '+-<>&|'.indexOf(ch1$1687) >= 0) {
            if ('+-<>&|'.indexOf(ch2$1688) >= 0) {
                index$1296 += 2;
                return {
                    type: Token$1288.Punctuator,
                    value: ch1$1687 + ch2$1688,
                    lineNumber: lineNumber$1297,
                    lineStart: lineStart$1298,
                    range: [
                        start$1686,
                        index$1296
                    ]
                };
            }
        }
        // The remaining 1-character punctuators.
        if ('[]<>+-*%&|^!~?:=/'.indexOf(ch1$1687) >= 0) {
            return {
                type: Token$1288.Punctuator,
                value: nextChar$1348(),
                lineNumber: lineNumber$1297,
                lineStart: lineStart$1298,
                range: [
                    start$1686,
                    index$1296
                ]
            };
        }
    }
    // 7.8.3 Numeric Literals
    function scanNumericLiteral$1366() {
        var number$1691, start$1692, ch$1693;
        ch$1693 = source$1294[index$1296];
        assert$1306(isDecimalDigit$1315(ch$1693) || ch$1693 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$1692 = index$1296;
        number$1691 = '';
        if (ch$1693 !== '.') {
            number$1691 = nextChar$1348();
            ch$1693 = source$1294[index$1296];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            if (number$1691 === '0') {
                if (ch$1693 === 'x' || ch$1693 === 'X') {
                    number$1691 += nextChar$1348();
                    while (index$1296 < length$1299) {
                        ch$1693 = source$1294[index$1296];
                        if (!isHexDigit$1318(ch$1693)) {
                            break;
                        }
                        number$1691 += nextChar$1348();
                    }
                    if (number$1691.length <= 2) {
                        // only 0x
                        throwError$1390({}, Messages$1292.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$1296 < length$1299) {
                        ch$1693 = source$1294[index$1296];
                        if (isIdentifierStart$1330(ch$1693)) {
                            throwError$1390({}, Messages$1292.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$1288.NumericLiteral,
                        value: parseInt(number$1691, 16),
                        lineNumber: lineNumber$1297,
                        lineStart: lineStart$1298,
                        range: [
                            start$1692,
                            index$1296
                        ]
                    };
                } else if (isOctalDigit$1321(ch$1693)) {
                    number$1691 += nextChar$1348();
                    while (index$1296 < length$1299) {
                        ch$1693 = source$1294[index$1296];
                        if (!isOctalDigit$1321(ch$1693)) {
                            break;
                        }
                        number$1691 += nextChar$1348();
                    }
                    if (index$1296 < length$1299) {
                        ch$1693 = source$1294[index$1296];
                        if (isIdentifierStart$1330(ch$1693) || isDecimalDigit$1315(ch$1693)) {
                            throwError$1390({}, Messages$1292.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$1288.NumericLiteral,
                        value: parseInt(number$1691, 8),
                        octal: true,
                        lineNumber: lineNumber$1297,
                        lineStart: lineStart$1298,
                        range: [
                            start$1692,
                            index$1296
                        ]
                    };
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (isDecimalDigit$1315(ch$1693)) {
                    throwError$1390({}, Messages$1292.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (index$1296 < length$1299) {
                ch$1693 = source$1294[index$1296];
                if (!isDecimalDigit$1315(ch$1693)) {
                    break;
                }
                number$1691 += nextChar$1348();
            }
        }
        if (ch$1693 === '.') {
            number$1691 += nextChar$1348();
            while (index$1296 < length$1299) {
                ch$1693 = source$1294[index$1296];
                if (!isDecimalDigit$1315(ch$1693)) {
                    break;
                }
                number$1691 += nextChar$1348();
            }
        }
        if (ch$1693 === 'e' || ch$1693 === 'E') {
            number$1691 += nextChar$1348();
            ch$1693 = source$1294[index$1296];
            if (ch$1693 === '+' || ch$1693 === '-') {
                number$1691 += nextChar$1348();
            }
            ch$1693 = source$1294[index$1296];
            if (isDecimalDigit$1315(ch$1693)) {
                number$1691 += nextChar$1348();
                while (index$1296 < length$1299) {
                    ch$1693 = source$1294[index$1296];
                    if (!isDecimalDigit$1315(ch$1693)) {
                        break;
                    }
                    number$1691 += nextChar$1348();
                }
            } else {
                ch$1693 = 'character ' + ch$1693;
                if (index$1296 >= length$1299) {
                    ch$1693 = '<end>';
                }
                throwError$1390({}, Messages$1292.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (index$1296 < length$1299) {
            ch$1693 = source$1294[index$1296];
            if (isIdentifierStart$1330(ch$1693)) {
                throwError$1390({}, Messages$1292.UnexpectedToken, 'ILLEGAL');
            }
        }
        return {
            type: Token$1288.NumericLiteral,
            value: parseFloat(number$1691),
            lineNumber: lineNumber$1297,
            lineStart: lineStart$1298,
            range: [
                start$1692,
                index$1296
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$1369() {
        var str$1694 = '', quote$1695, start$1696, ch$1697, code$1698, unescaped$1699, restore$1700, octal$1701 = false;
        quote$1695 = source$1294[index$1296];
        assert$1306(quote$1695 === '\'' || quote$1695 === '"', 'String literal must starts with a quote');
        start$1696 = index$1296;
        ++index$1296;
        while (index$1296 < length$1299) {
            ch$1697 = nextChar$1348();
            if (ch$1697 === quote$1695) {
                quote$1695 = '';
                break;
            } else if (ch$1697 === '\\') {
                ch$1697 = nextChar$1348();
                if (!isLineTerminator$1327(ch$1697)) {
                    switch (ch$1697) {
                    case 'n':
                        str$1694 += '\n';
                        break;
                    case 'r':
                        str$1694 += '\r';
                        break;
                    case 't':
                        str$1694 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        restore$1700 = index$1296;
                        unescaped$1699 = scanHexEscape$1357(ch$1697);
                        if (unescaped$1699) {
                            str$1694 += unescaped$1699;
                        } else {
                            index$1296 = restore$1700;
                            str$1694 += ch$1697;
                        }
                        break;
                    case 'b':
                        str$1694 += '\b';
                        break;
                    case 'f':
                        str$1694 += '\f';
                        break;
                    case 'v':
                        str$1694 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$1321(ch$1697)) {
                            code$1698 = '01234567'.indexOf(ch$1697);
                            // \0 is not octal escape sequence
                            if (code$1698 !== 0) {
                                octal$1701 = true;
                            }
                            if (index$1296 < length$1299 && isOctalDigit$1321(source$1294[index$1296])) {
                                octal$1701 = true;
                                code$1698 = code$1698 * 8 + '01234567'.indexOf(nextChar$1348());
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1697) >= 0 && index$1296 < length$1299 && isOctalDigit$1321(source$1294[index$1296])) {
                                    code$1698 = code$1698 * 8 + '01234567'.indexOf(nextChar$1348());
                                }
                            }
                            str$1694 += String.fromCharCode(code$1698);
                        } else {
                            str$1694 += ch$1697;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$1297;
                    if (ch$1697 === '\r' && source$1294[index$1296] === '\n') {
                        ++index$1296;
                    }
                }
            } else if (isLineTerminator$1327(ch$1697)) {
                break;
            } else {
                str$1694 += ch$1697;
            }
        }
        if (quote$1695 !== '') {
            throwError$1390({}, Messages$1292.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$1288.StringLiteral,
            value: str$1694,
            octal: octal$1701,
            lineNumber: lineNumber$1297,
            lineStart: lineStart$1298,
            range: [
                start$1696,
                index$1296
            ]
        };
    }
    function scanRegExp$1372() {
        var str$1702 = '', ch$1703, start$1704, pattern$1705, flags$1706, value$1707, classMarker$1708 = false, restore$1709;
        buffer$1300 = null;
        skipComment$1354();
        start$1704 = index$1296;
        ch$1703 = source$1294[index$1296];
        assert$1306(ch$1703 === '/', 'Regular expression literal must start with a slash');
        str$1702 = nextChar$1348();
        while (index$1296 < length$1299) {
            ch$1703 = nextChar$1348();
            str$1702 += ch$1703;
            if (classMarker$1708) {
                if (ch$1703 === ']') {
                    classMarker$1708 = false;
                }
            } else {
                if (ch$1703 === '\\') {
                    ch$1703 = nextChar$1348();
                    // ECMA-262 7.8.5
                    if (isLineTerminator$1327(ch$1703)) {
                        throwError$1390({}, Messages$1292.UnterminatedRegExp);
                    }
                    str$1702 += ch$1703;
                } else if (ch$1703 === '/') {
                    break;
                } else if (ch$1703 === '[') {
                    classMarker$1708 = true;
                } else if (isLineTerminator$1327(ch$1703)) {
                    throwError$1390({}, Messages$1292.UnterminatedRegExp);
                }
            }
        }
        if (str$1702.length === 1) {
            throwError$1390({}, Messages$1292.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$1705 = str$1702.substr(1, str$1702.length - 2);
        flags$1706 = '';
        while (index$1296 < length$1299) {
            ch$1703 = source$1294[index$1296];
            if (!isIdentifierPart$1333(ch$1703)) {
                break;
            }
            ++index$1296;
            if (ch$1703 === '\\' && index$1296 < length$1299) {
                ch$1703 = source$1294[index$1296];
                if (ch$1703 === 'u') {
                    ++index$1296;
                    restore$1709 = index$1296;
                    ch$1703 = scanHexEscape$1357('u');
                    if (ch$1703) {
                        flags$1706 += ch$1703;
                        str$1702 += '\\u';
                        for (; restore$1709 < index$1296; ++restore$1709) {
                            str$1702 += source$1294[restore$1709];
                        }
                    } else {
                        index$1296 = restore$1709;
                        flags$1706 += 'u';
                        str$1702 += '\\u';
                    }
                } else {
                    str$1702 += '\\';
                }
            } else {
                flags$1706 += ch$1703;
                str$1702 += ch$1703;
            }
        }
        try {
            value$1707 = new RegExp(pattern$1705, flags$1706);
        } catch (e$1710) {
            throwError$1390({}, Messages$1292.InvalidRegExp);
        }
        return {
            type: Token$1288.RegexLiteral,
            literal: str$1702,
            value: value$1707,
            lineNumber: lineNumber$1297,
            lineStart: lineStart$1298,
            range: [
                start$1704,
                index$1296
            ]
        };
    }
    function isIdentifierName$1375(token$1711) {
        return token$1711.type === Token$1288.Identifier || token$1711.type === Token$1288.Keyword || token$1711.type === Token$1288.BooleanLiteral || token$1711.type === Token$1288.NullLiteral;
    }
    // only used by the reader
    function advance$1378() {
        var ch$1712, token$1713;
        skipComment$1354();
        if (index$1296 >= length$1299) {
            return {
                type: Token$1288.EOF,
                lineNumber: lineNumber$1297,
                lineStart: lineStart$1298,
                range: [
                    index$1296,
                    index$1296
                ]
            };
        }
        ch$1712 = source$1294[index$1296];
        token$1713 = scanPunctuator$1363();
        if (typeof token$1713 !== 'undefined') {
            return token$1713;
        }
        if (ch$1712 === '\'' || ch$1712 === '"') {
            return scanStringLiteral$1369();
        }
        if (ch$1712 === '.' || isDecimalDigit$1315(ch$1712)) {
            return scanNumericLiteral$1366();
        }
        token$1713 = scanIdentifier$1360();
        if (typeof token$1713 !== 'undefined') {
            return token$1713;
        }
        throwError$1390({}, Messages$1292.UnexpectedToken, 'ILLEGAL');
    }
    function lex$1381() {
        var token$1714;
        if (buffer$1300) {
            token$1714 = buffer$1300;
            buffer$1300 = null;
            index$1296++;
            return token$1714;
        }
        buffer$1300 = null;
        return tokenStream$1302[index$1296++];
    }
    function lookahead$1384() {
        var pos$1715, line$1716, start$1717;
        if (buffer$1300 !== null) {
            return buffer$1300;
        }
        buffer$1300 = tokenStream$1302[index$1296];
        return buffer$1300;
    }
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$1387() {
        var pos$1718, line$1719, start$1720, found$1721;
        found$1721 = tokenStream$1302[index$1296 - 1].token.lineNumber !== tokenStream$1302[index$1296].token.lineNumber;
        return found$1721;
    }
    // Throw an exception
    function throwError$1390(token$1722, messageFormat$1723) {
        var error$1726, args$1727 = Array.prototype.slice.call(arguments, 2), msg$1728 = messageFormat$1723.replace(/%(\d)/g, function (whole$1729, index$1730) {
                return args$1727[index$1730] || '';
            });
        if (typeof token$1722.lineNumber === 'number') {
            error$1726 = new Error('Line ' + token$1722.lineNumber + ': ' + msg$1728);
            error$1726.lineNumber = token$1722.lineNumber;
            if (token$1722.range && token$1722.range.length > 0) {
                error$1726.index = token$1722.range[0];
                error$1726.column = token$1722.range[0] - lineStart$1298 + 1;
            }
        } else {
            error$1726 = new Error('Line ' + lineNumber$1297 + ': ' + msg$1728);
            error$1726.index = index$1296;
            error$1726.lineNumber = lineNumber$1297;
            error$1726.column = index$1296 - lineStart$1298 + 1;
        }
        throw error$1726;
    }
    function throwErrorTolerant$1393() {
        var error$1731;
        try {
            throwError$1390.apply(null, arguments);
        } catch (e$1732) {
            if (extra$1303.errors) {
                extra$1303.errors.push(e$1732);
            } else {
                throw e$1732;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$1396(token$1733) {
        var s$1734;
        if (token$1733.type === Token$1288.EOF) {
            throwError$1390(token$1733, Messages$1292.UnexpectedEOS);
        }
        if (token$1733.type === Token$1288.NumericLiteral) {
            throwError$1390(token$1733, Messages$1292.UnexpectedNumber);
        }
        if (token$1733.type === Token$1288.StringLiteral) {
            throwError$1390(token$1733, Messages$1292.UnexpectedString);
        }
        if (token$1733.type === Token$1288.Identifier) {
            console.log(token$1733);
            throwError$1390(token$1733, Messages$1292.UnexpectedIdentifier);
        }
        if (token$1733.type === Token$1288.Keyword) {
            if (isFutureReservedWord$1336(token$1733.value)) {
                throwError$1390(token$1733, Messages$1292.UnexpectedReserved);
            } else if (strict$1295 && isStrictModeReservedWord$1339(token$1733.value)) {
                throwError$1390(token$1733, Messages$1292.StrictReservedWord);
            }
            throwError$1390(token$1733, Messages$1292.UnexpectedToken, token$1733.value);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$1390(token$1733, Messages$1292.UnexpectedToken, token$1733.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$1399(value$1735) {
        var token$1736 = lex$1381().token;
        if (token$1736.type !== Token$1288.Punctuator || token$1736.value !== value$1735) {
            throwUnexpected$1396(token$1736);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$1402(keyword$1737) {
        var token$1738 = lex$1381().token;
        if (token$1738.type !== Token$1288.Keyword || token$1738.value !== keyword$1737) {
            throwUnexpected$1396(token$1738);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$1405(value$1739) {
        var token$1740 = lookahead$1384().token;
        return token$1740.type === Token$1288.Punctuator && token$1740.value === value$1739;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$1408(keyword$1741) {
        var token$1742 = lookahead$1384().token;
        return token$1742.type === Token$1288.Keyword && token$1742.value === keyword$1741;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$1411() {
        var token$1743 = lookahead$1384().token, op$1744 = token$1743.value;
        if (token$1743.type !== Token$1288.Punctuator) {
            return false;
        }
        return op$1744 === '=' || op$1744 === '*=' || op$1744 === '/=' || op$1744 === '%=' || op$1744 === '+=' || op$1744 === '-=' || op$1744 === '<<=' || op$1744 === '>>=' || op$1744 === '>>>=' || op$1744 === '&=' || op$1744 === '^=' || op$1744 === '|=';
    }
    function consumeSemicolon$1414() {
        var token$1745, line$1746;
        if (tokenStream$1302[index$1296].token.value === ';') {
            lex$1381().token;
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
        line$1746 = tokenStream$1302[index$1296 - 1].token.lineNumber;
        token$1745 = tokenStream$1302[index$1296].token;
        if (line$1746 !== token$1745.lineNumber) {
            return;
        }
        if (token$1745.type !== Token$1288.EOF && !match$1405('}')) {
            throwUnexpected$1396(token$1745);
        }
        return;
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$1417(expr$1747) {
        return expr$1747.type === Syntax$1290.Identifier || expr$1747.type === Syntax$1290.MemberExpression;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$1420() {
        var elements$1748 = [], undef$1749;
        expect$1399('[');
        while (!match$1405(']')) {
            if (match$1405(',')) {
                lex$1381().token;
                elements$1748.push(undef$1749);
            } else {
                elements$1748.push(parseAssignmentExpression$1507());
                if (!match$1405(']')) {
                    expect$1399(',');
                }
            }
        }
        expect$1399(']');
        return {
            type: Syntax$1290.ArrayExpression,
            elements: elements$1748
        };
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$1423(param$1750, first$1751) {
        var previousStrict$1752, body$1753;
        previousStrict$1752 = strict$1295;
        body$1753 = parseFunctionSourceElements$1588();
        if (first$1751 && strict$1295 && isRestrictedWord$1342(param$1750[0].name)) {
            throwError$1390(first$1751, Messages$1292.StrictParamName);
        }
        strict$1295 = previousStrict$1752;
        return {
            type: Syntax$1290.FunctionExpression,
            id: null,
            params: param$1750,
            body: body$1753
        };
    }
    function parseObjectPropertyKey$1426() {
        var token$1754 = lex$1381().token;
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$1754.type === Token$1288.StringLiteral || token$1754.type === Token$1288.NumericLiteral) {
            if (strict$1295 && token$1754.octal) {
                throwError$1390(token$1754, Messages$1292.StrictOctalLiteral);
            }
            return createLiteral$1618(token$1754);
        }
        return {
            type: Syntax$1290.Identifier,
            name: token$1754.value
        };
    }
    function parseObjectProperty$1429() {
        var token$1755, key$1756, id$1757, param$1758;
        token$1755 = lookahead$1384().token;
        if (token$1755.type === Token$1288.Identifier) {
            id$1757 = parseObjectPropertyKey$1426();
            // Property Assignment: Getter and Setter.
            if (token$1755.value === 'get' && !match$1405(':')) {
                key$1756 = parseObjectPropertyKey$1426();
                expect$1399('(');
                expect$1399(')');
                return {
                    type: Syntax$1290.Property,
                    key: key$1756,
                    value: parsePropertyFunction$1423([]),
                    kind: 'get'
                };
            } else if (token$1755.value === 'set' && !match$1405(':')) {
                key$1756 = parseObjectPropertyKey$1426();
                expect$1399('(');
                token$1755 = lookahead$1384().token;
                if (token$1755.type !== Token$1288.Identifier) {
                    throwUnexpected$1396(lex$1381().token);
                }
                param$1758 = [parseVariableIdentifier$1519()];
                expect$1399(')');
                return {
                    type: Syntax$1290.Property,
                    key: key$1756,
                    value: parsePropertyFunction$1423(param$1758, token$1755),
                    kind: 'set'
                };
            } else {
                expect$1399(':');
                return {
                    type: Syntax$1290.Property,
                    key: id$1757,
                    value: parseAssignmentExpression$1507(),
                    kind: 'init'
                };
            }
        } else if (token$1755.type === Token$1288.EOF || token$1755.type === Token$1288.Punctuator) {
            throwUnexpected$1396(token$1755);
        } else {
            key$1756 = parseObjectPropertyKey$1426();
            expect$1399(':');
            return {
                type: Syntax$1290.Property,
                key: key$1756,
                value: parseAssignmentExpression$1507(),
                kind: 'init'
            };
        }
    }
    function parseObjectInitialiser$1432() {
        var token$1759, properties$1760 = [], property$1761, name$1762, kind$1763, map$1764 = {}, toString$1765 = String;
        expect$1399('{');
        while (!match$1405('}')) {
            property$1761 = parseObjectProperty$1429();
            if (property$1761.key.type === Syntax$1290.Identifier) {
                name$1762 = property$1761.key.name;
            } else {
                name$1762 = toString$1765(property$1761.key.value);
            }
            kind$1763 = property$1761.kind === 'init' ? PropertyKind$1291.Data : property$1761.kind === 'get' ? PropertyKind$1291.Get : PropertyKind$1291.Set;
            if (Object.prototype.hasOwnProperty.call(map$1764, name$1762)) {
                if (map$1764[name$1762] === PropertyKind$1291.Data) {
                    if (strict$1295 && kind$1763 === PropertyKind$1291.Data) {
                        throwErrorTolerant$1393({}, Messages$1292.StrictDuplicateProperty);
                    } else if (kind$1763 !== PropertyKind$1291.Data) {
                        throwError$1390({}, Messages$1292.AccessorDataProperty);
                    }
                } else {
                    if (kind$1763 === PropertyKind$1291.Data) {
                        throwError$1390({}, Messages$1292.AccessorDataProperty);
                    } else if (map$1764[name$1762] & kind$1763) {
                        throwError$1390({}, Messages$1292.AccessorGetSet);
                    }
                }
                map$1764[name$1762] |= kind$1763;
            } else {
                map$1764[name$1762] = kind$1763;
            }
            properties$1760.push(property$1761);
            if (!match$1405('}')) {
                expect$1399(',');
            }
        }
        expect$1399('}');
        return {
            type: Syntax$1290.ObjectExpression,
            properties: properties$1760
        };
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$1435() {
        var expr$1766, token$1767 = lookahead$1384().token, type$1768 = token$1767.type;
        if (type$1768 === Token$1288.Identifier) {
            var name$1769 = expander$1287.resolve(lex$1381());
            return {
                type: Syntax$1290.Identifier,
                name: name$1769
            };
        }
        if (type$1768 === Token$1288.StringLiteral || type$1768 === Token$1288.NumericLiteral) {
            if (strict$1295 && token$1767.octal) {
                throwErrorTolerant$1393(token$1767, Messages$1292.StrictOctalLiteral);
            }
            return createLiteral$1618(lex$1381().token);
        }
        if (type$1768 === Token$1288.Keyword) {
            if (matchKeyword$1408('this')) {
                lex$1381().token;
                return { type: Syntax$1290.ThisExpression };
            }
            if (matchKeyword$1408('function')) {
                return parseFunctionExpression$1594();
            }
        }
        if (type$1768 === Token$1288.BooleanLiteral) {
            lex$1381();
            token$1767.value = token$1767.value === 'true';
            return createLiteral$1618(token$1767);
        }
        if (type$1768 === Token$1288.NullLiteral) {
            lex$1381();
            token$1767.value = null;
            return createLiteral$1618(token$1767);
        }
        if (match$1405('[')) {
            return parseArrayInitialiser$1420();
        }
        if (match$1405('{')) {
            return parseObjectInitialiser$1432();
        }
        if (match$1405('(')) {
            lex$1381();
            state$1301.lastParenthesized = expr$1766 = parseExpression$1510();
            expect$1399(')');
            return expr$1766;
        }
        if (token$1767.value instanceof RegExp) {
            return createLiteral$1618(lex$1381().token);
        }
        return throwUnexpected$1396(lex$1381().token);
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$1438() {
        var args$1770 = [];
        expect$1399('(');
        if (!match$1405(')')) {
            while (index$1296 < length$1299) {
                args$1770.push(parseAssignmentExpression$1507());
                if (match$1405(')')) {
                    break;
                }
                expect$1399(',');
            }
        }
        expect$1399(')');
        return args$1770;
    }
    function parseNonComputedProperty$1441() {
        var token$1771 = lex$1381().token;
        if (!isIdentifierName$1375(token$1771)) {
            throwUnexpected$1396(token$1771);
        }
        return {
            type: Syntax$1290.Identifier,
            name: token$1771.value
        };
    }
    function parseNonComputedMember$1444(object$1772) {
        return {
            type: Syntax$1290.MemberExpression,
            computed: false,
            object: object$1772,
            property: parseNonComputedProperty$1441()
        };
    }
    function parseComputedMember$1447(object$1773) {
        var property$1774, expr$1775;
        expect$1399('[');
        property$1774 = parseExpression$1510();
        expr$1775 = {
            type: Syntax$1290.MemberExpression,
            computed: true,
            object: object$1773,
            property: property$1774
        };
        expect$1399(']');
        return expr$1775;
    }
    function parseCallMember$1450(object$1776) {
        return {
            type: Syntax$1290.CallExpression,
            callee: object$1776,
            'arguments': parseArguments$1438()
        };
    }
    function parseNewExpression$1453() {
        var expr$1777;
        expectKeyword$1402('new');
        expr$1777 = {
            type: Syntax$1290.NewExpression,
            callee: parseLeftHandSideExpression$1465(),
            'arguments': []
        };
        if (match$1405('(')) {
            expr$1777['arguments'] = parseArguments$1438();
        }
        return expr$1777;
    }
    // sort of broken, only accepts literals
    // pretty sure the use of toString will bite me
    function toArrayNode$1456(arr$1778) {
        var els$1781 = arr$1778.map(function (el$1782) {
                return {
                    type: 'Literal',
                    value: el$1782,
                    raw: el$1782.toString()
                };
            });
        return {
            type: 'ArrayExpression',
            elements: els$1781
        };
    }
    function toObjectNode$1459(obj$1783) {
        // todo: hacky, fixup
        var props$1786 = Object.keys(obj$1783).map(function (key$1787) {
                var raw$1788 = obj$1783[key$1787];
                var value$1789;
                if (Array.isArray(raw$1788)) {
                    value$1789 = toArrayNode$1456(raw$1788);
                } else {
                    value$1789 = {
                        type: 'Literal',
                        value: obj$1783[key$1787],
                        raw: obj$1783[key$1787].toString()
                    };
                }
                return {
                    type: 'Property',
                    key: {
                        type: 'Identifier',
                        name: key$1787
                    },
                    value: value$1789,
                    kind: 'init'
                };
            });
        return {
            type: 'ObjectExpression',
            properties: props$1786
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
    function parseLeftHandSideExpressionAllowCall$1462() {
        var useNew$1790, expr$1791;
        useNew$1790 = matchKeyword$1408('new');
        expr$1791 = useNew$1790 ? parseNewExpression$1453() : parsePrimaryExpression$1435();
        // handle "syntax" primitive
        // todo: error handling
        // if(expr.name === "syntax") {
        //     return parseSyntaxObject();
        // }
        while (index$1296 < length$1299) {
            if (match$1405('.')) {
                lex$1381();
                expr$1791 = parseNonComputedMember$1444(expr$1791);
            } else if (match$1405('[')) {
                expr$1791 = parseComputedMember$1447(expr$1791);
            } else if (match$1405('(')) {
                expr$1791 = parseCallMember$1450(expr$1791);
            } else {
                break;
            }
        }
        return expr$1791;
    }
    function parseLeftHandSideExpression$1465() {
        var useNew$1792, expr$1793;
        useNew$1792 = matchKeyword$1408('new');
        expr$1793 = useNew$1792 ? parseNewExpression$1453() : parsePrimaryExpression$1435();
        while (index$1296 < length$1299) {
            if (match$1405('.')) {
                lex$1381();
                expr$1793 = parseNonComputedMember$1444(expr$1793);
            } else if (match$1405('[')) {
                expr$1793 = parseComputedMember$1447(expr$1793);
            } else {
                break;
            }
        }
        return expr$1793;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$1468() {
        var expr$1794 = parseLeftHandSideExpressionAllowCall$1462();
        if ((match$1405('++') || match$1405('--')) && !peekLineTerminator$1387()) {
            // 11.3.1, 11.3.2
            if (strict$1295 && expr$1794.type === Syntax$1290.Identifier && isRestrictedWord$1342(expr$1794.name)) {
                throwError$1390({}, Messages$1292.StrictLHSPostfix);
            }
            if (!isLeftHandSide$1417(expr$1794)) {
                throwError$1390({}, Messages$1292.InvalidLHSInAssignment);
            }
            expr$1794 = {
                type: Syntax$1290.UpdateExpression,
                operator: lex$1381().token.value,
                argument: expr$1794,
                prefix: false
            };
        }
        return expr$1794;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$1471() {
        var token$1795, expr$1796;
        if (match$1405('++') || match$1405('--')) {
            token$1795 = lex$1381().token;
            expr$1796 = parseUnaryExpression$1471();
            // 11.4.4, 11.4.5
            if (strict$1295 && expr$1796.type === Syntax$1290.Identifier && isRestrictedWord$1342(expr$1796.name)) {
                throwError$1390({}, Messages$1292.StrictLHSPrefix);
            }
            if (!isLeftHandSide$1417(expr$1796)) {
                throwError$1390({}, Messages$1292.InvalidLHSInAssignment);
            }
            expr$1796 = {
                type: Syntax$1290.UpdateExpression,
                operator: token$1795.value,
                argument: expr$1796,
                prefix: true
            };
            return expr$1796;
        }
        if (match$1405('+') || match$1405('-') || match$1405('~') || match$1405('!')) {
            expr$1796 = {
                type: Syntax$1290.UnaryExpression,
                operator: lex$1381().token.value,
                argument: parseUnaryExpression$1471()
            };
            return expr$1796;
        }
        if (matchKeyword$1408('delete') || matchKeyword$1408('void') || matchKeyword$1408('typeof')) {
            expr$1796 = {
                type: Syntax$1290.UnaryExpression,
                operator: lex$1381().token.value,
                argument: parseUnaryExpression$1471()
            };
            if (strict$1295 && expr$1796.operator === 'delete' && expr$1796.argument.type === Syntax$1290.Identifier) {
                throwErrorTolerant$1393({}, Messages$1292.StrictDelete);
            }
            return expr$1796;
        }
        return parsePostfixExpression$1468();
    }
    // 11.5 Multiplicative Operators
    function parseMultiplicativeExpression$1474() {
        var expr$1797 = parseUnaryExpression$1471();
        while (match$1405('*') || match$1405('/') || match$1405('%')) {
            expr$1797 = {
                type: Syntax$1290.BinaryExpression,
                operator: lex$1381().token.value,
                left: expr$1797,
                right: parseUnaryExpression$1471()
            };
        }
        return expr$1797;
    }
    // 11.6 Additive Operators
    function parseAdditiveExpression$1477() {
        var expr$1798 = parseMultiplicativeExpression$1474();
        while (match$1405('+') || match$1405('-')) {
            expr$1798 = {
                type: Syntax$1290.BinaryExpression,
                operator: lex$1381().token.value,
                left: expr$1798,
                right: parseMultiplicativeExpression$1474()
            };
        }
        return expr$1798;
    }
    // 11.7 Bitwise Shift Operators
    function parseShiftExpression$1480() {
        var expr$1799 = parseAdditiveExpression$1477();
        while (match$1405('<<') || match$1405('>>') || match$1405('>>>')) {
            expr$1799 = {
                type: Syntax$1290.BinaryExpression,
                operator: lex$1381().token.value,
                left: expr$1799,
                right: parseAdditiveExpression$1477()
            };
        }
        return expr$1799;
    }
    // 11.8 Relational Operators
    function parseRelationalExpression$1483() {
        var expr$1800, previousAllowIn$1801;
        previousAllowIn$1801 = state$1301.allowIn;
        state$1301.allowIn = true;
        expr$1800 = parseShiftExpression$1480();
        while (match$1405('<') || match$1405('>') || match$1405('<=') || match$1405('>=') || previousAllowIn$1801 && matchKeyword$1408('in') || matchKeyword$1408('instanceof')) {
            expr$1800 = {
                type: Syntax$1290.BinaryExpression,
                operator: lex$1381().token.value,
                left: expr$1800,
                right: parseRelationalExpression$1483()
            };
        }
        state$1301.allowIn = previousAllowIn$1801;
        return expr$1800;
    }
    // 11.9 Equality Operators
    function parseEqualityExpression$1486() {
        var expr$1802 = parseRelationalExpression$1483();
        while (match$1405('==') || match$1405('!=') || match$1405('===') || match$1405('!==')) {
            expr$1802 = {
                type: Syntax$1290.BinaryExpression,
                operator: lex$1381().token.value,
                left: expr$1802,
                right: parseRelationalExpression$1483()
            };
        }
        return expr$1802;
    }
    // 11.10 Binary Bitwise Operators
    function parseBitwiseANDExpression$1489() {
        var expr$1803 = parseEqualityExpression$1486();
        while (match$1405('&')) {
            lex$1381();
            expr$1803 = {
                type: Syntax$1290.BinaryExpression,
                operator: '&',
                left: expr$1803,
                right: parseEqualityExpression$1486()
            };
        }
        return expr$1803;
    }
    function parseBitwiseXORExpression$1492() {
        var expr$1804 = parseBitwiseANDExpression$1489();
        while (match$1405('^')) {
            lex$1381();
            expr$1804 = {
                type: Syntax$1290.BinaryExpression,
                operator: '^',
                left: expr$1804,
                right: parseBitwiseANDExpression$1489()
            };
        }
        return expr$1804;
    }
    function parseBitwiseORExpression$1495() {
        var expr$1805 = parseBitwiseXORExpression$1492();
        while (match$1405('|')) {
            lex$1381();
            expr$1805 = {
                type: Syntax$1290.BinaryExpression,
                operator: '|',
                left: expr$1805,
                right: parseBitwiseXORExpression$1492()
            };
        }
        return expr$1805;
    }
    // 11.11 Binary Logical Operators
    function parseLogicalANDExpression$1498() {
        var expr$1806 = parseBitwiseORExpression$1495();
        while (match$1405('&&')) {
            lex$1381();
            expr$1806 = {
                type: Syntax$1290.LogicalExpression,
                operator: '&&',
                left: expr$1806,
                right: parseBitwiseORExpression$1495()
            };
        }
        return expr$1806;
    }
    function parseLogicalORExpression$1501() {
        var expr$1807 = parseLogicalANDExpression$1498();
        while (match$1405('||')) {
            lex$1381();
            expr$1807 = {
                type: Syntax$1290.LogicalExpression,
                operator: '||',
                left: expr$1807,
                right: parseLogicalANDExpression$1498()
            };
        }
        return expr$1807;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$1504() {
        var expr$1808, previousAllowIn$1809, consequent$1810;
        expr$1808 = parseLogicalORExpression$1501();
        if (match$1405('?')) {
            lex$1381();
            previousAllowIn$1809 = state$1301.allowIn;
            state$1301.allowIn = true;
            consequent$1810 = parseAssignmentExpression$1507();
            state$1301.allowIn = previousAllowIn$1809;
            expect$1399(':');
            expr$1808 = {
                type: Syntax$1290.ConditionalExpression,
                test: expr$1808,
                consequent: consequent$1810,
                alternate: parseAssignmentExpression$1507()
            };
        }
        return expr$1808;
    }
    // 11.13 Assignment Operators
    function parseAssignmentExpression$1507() {
        var expr$1811;
        expr$1811 = parseConditionalExpression$1504();
        if (matchAssign$1411()) {
            // LeftHandSideExpression
            if (!isLeftHandSide$1417(expr$1811)) {
                throwError$1390({}, Messages$1292.InvalidLHSInAssignment);
            }
            // 11.13.1
            if (strict$1295 && expr$1811.type === Syntax$1290.Identifier && isRestrictedWord$1342(expr$1811.name)) {
                throwError$1390({}, Messages$1292.StrictLHSAssignment);
            }
            expr$1811 = {
                type: Syntax$1290.AssignmentExpression,
                operator: lex$1381().token.value,
                left: expr$1811,
                right: parseAssignmentExpression$1507()
            };
        }
        return expr$1811;
    }
    // 11.14 Comma Operator
    function parseExpression$1510() {
        var expr$1812 = parseAssignmentExpression$1507();
        if (match$1405(',')) {
            expr$1812 = {
                type: Syntax$1290.SequenceExpression,
                expressions: [expr$1812]
            };
            while (index$1296 < length$1299) {
                if (!match$1405(',')) {
                    break;
                }
                lex$1381();
                expr$1812.expressions.push(parseAssignmentExpression$1507());
            }
        }
        return expr$1812;
    }
    // 12.1 Block
    function parseStatementList$1513() {
        var list$1813 = [], statement$1814;
        while (index$1296 < length$1299) {
            if (match$1405('}')) {
                break;
            }
            statement$1814 = parseSourceElement$1597();
            if (typeof statement$1814 === 'undefined') {
                break;
            }
            list$1813.push(statement$1814);
        }
        return list$1813;
    }
    function parseBlock$1516() {
        var block$1815;
        expect$1399('{');
        block$1815 = parseStatementList$1513();
        expect$1399('}');
        return {
            type: Syntax$1290.BlockStatement,
            body: block$1815
        };
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$1519() {
        var stx$1816 = lex$1381(), token$1817 = stx$1816.token;
        if (token$1817.type !== Token$1288.Identifier) {
            throwUnexpected$1396(token$1817);
        }
        var name$1818 = expander$1287.resolve(stx$1816);
        return {
            type: Syntax$1290.Identifier,
            name: name$1818
        };
    }
    function parseVariableDeclaration$1522(kind$1819) {
        var id$1820 = parseVariableIdentifier$1519(), init$1821 = null;
        // 12.2.1
        if (strict$1295 && isRestrictedWord$1342(id$1820.name)) {
            throwErrorTolerant$1393({}, Messages$1292.StrictVarName);
        }
        if (kind$1819 === 'const') {
            expect$1399('=');
            init$1821 = parseAssignmentExpression$1507();
        } else if (match$1405('=')) {
            lex$1381();
            init$1821 = parseAssignmentExpression$1507();
        }
        return {
            type: Syntax$1290.VariableDeclarator,
            id: id$1820,
            init: init$1821
        };
    }
    function parseVariableDeclarationList$1525(kind$1822) {
        var list$1823 = [];
        while (index$1296 < length$1299) {
            list$1823.push(parseVariableDeclaration$1522(kind$1822));
            if (!match$1405(',')) {
                break;
            }
            lex$1381();
        }
        return list$1823;
    }
    function parseVariableStatement$1528() {
        var declarations$1824;
        expectKeyword$1402('var');
        declarations$1824 = parseVariableDeclarationList$1525();
        consumeSemicolon$1414();
        return {
            type: Syntax$1290.VariableDeclaration,
            declarations: declarations$1824,
            kind: 'var'
        };
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$1531(kind$1825) {
        var declarations$1826;
        expectKeyword$1402(kind$1825);
        declarations$1826 = parseVariableDeclarationList$1525(kind$1825);
        consumeSemicolon$1414();
        return {
            type: Syntax$1290.VariableDeclaration,
            declarations: declarations$1826,
            kind: kind$1825
        };
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$1534() {
        expect$1399(';');
        return { type: Syntax$1290.EmptyStatement };
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$1537() {
        var expr$1827 = parseExpression$1510();
        consumeSemicolon$1414();
        return {
            type: Syntax$1290.ExpressionStatement,
            expression: expr$1827
        };
    }
    // 12.5 If statement
    function parseIfStatement$1540() {
        var test$1828, consequent$1829, alternate$1830;
        expectKeyword$1402('if');
        expect$1399('(');
        test$1828 = parseExpression$1510();
        expect$1399(')');
        consequent$1829 = parseStatement$1585();
        if (matchKeyword$1408('else')) {
            lex$1381();
            alternate$1830 = parseStatement$1585();
        } else {
            alternate$1830 = null;
        }
        return {
            type: Syntax$1290.IfStatement,
            test: test$1828,
            consequent: consequent$1829,
            alternate: alternate$1830
        };
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$1543() {
        var body$1831, test$1832, oldInIteration$1833;
        expectKeyword$1402('do');
        oldInIteration$1833 = state$1301.inIteration;
        state$1301.inIteration = true;
        body$1831 = parseStatement$1585();
        state$1301.inIteration = oldInIteration$1833;
        expectKeyword$1402('while');
        expect$1399('(');
        test$1832 = parseExpression$1510();
        expect$1399(')');
        if (match$1405(';')) {
            lex$1381();
        }
        return {
            type: Syntax$1290.DoWhileStatement,
            body: body$1831,
            test: test$1832
        };
    }
    function parseWhileStatement$1546() {
        var test$1834, body$1835, oldInIteration$1836;
        expectKeyword$1402('while');
        expect$1399('(');
        test$1834 = parseExpression$1510();
        expect$1399(')');
        oldInIteration$1836 = state$1301.inIteration;
        state$1301.inIteration = true;
        body$1835 = parseStatement$1585();
        state$1301.inIteration = oldInIteration$1836;
        return {
            type: Syntax$1290.WhileStatement,
            test: test$1834,
            body: body$1835
        };
    }
    function parseForVariableDeclaration$1549() {
        var token$1837 = lex$1381().token;
        return {
            type: Syntax$1290.VariableDeclaration,
            declarations: parseVariableDeclarationList$1525(),
            kind: token$1837.value
        };
    }
    function parseForStatement$1552() {
        var init$1838, test$1839, update$1840, left$1841, right$1842, body$1843, oldInIteration$1844;
        init$1838 = test$1839 = update$1840 = null;
        expectKeyword$1402('for');
        expect$1399('(');
        if (match$1405(';')) {
            lex$1381();
        } else {
            if (matchKeyword$1408('var') || matchKeyword$1408('let')) {
                state$1301.allowIn = false;
                init$1838 = parseForVariableDeclaration$1549();
                state$1301.allowIn = true;
                if (init$1838.declarations.length === 1 && matchKeyword$1408('in')) {
                    lex$1381();
                    left$1841 = init$1838;
                    right$1842 = parseExpression$1510();
                    init$1838 = null;
                }
            } else {
                state$1301.allowIn = false;
                init$1838 = parseExpression$1510();
                state$1301.allowIn = true;
                if (matchKeyword$1408('in')) {
                    // LeftHandSideExpression
                    if (!isLeftHandSide$1417(init$1838)) {
                        throwError$1390({}, Messages$1292.InvalidLHSInForIn);
                    }
                    lex$1381();
                    left$1841 = init$1838;
                    right$1842 = parseExpression$1510();
                    init$1838 = null;
                }
            }
            if (typeof left$1841 === 'undefined') {
                expect$1399(';');
            }
        }
        if (typeof left$1841 === 'undefined') {
            if (!match$1405(';')) {
                test$1839 = parseExpression$1510();
            }
            expect$1399(';');
            if (!match$1405(')')) {
                update$1840 = parseExpression$1510();
            }
        }
        expect$1399(')');
        oldInIteration$1844 = state$1301.inIteration;
        state$1301.inIteration = true;
        body$1843 = parseStatement$1585();
        state$1301.inIteration = oldInIteration$1844;
        if (typeof left$1841 === 'undefined') {
            return {
                type: Syntax$1290.ForStatement,
                init: init$1838,
                test: test$1839,
                update: update$1840,
                body: body$1843
            };
        }
        return {
            type: Syntax$1290.ForInStatement,
            left: left$1841,
            right: right$1842,
            body: body$1843,
            each: false
        };
    }
    // 12.7 The continue statement
    function parseContinueStatement$1555() {
        var token$1845, label$1846 = null;
        expectKeyword$1402('continue');
        // Optimize the most common form: 'continue;'.
        if (tokenStream$1302[index$1296].token.value === ';') {
            lex$1381();
            if (!state$1301.inIteration) {
                throwError$1390({}, Messages$1292.IllegalContinue);
            }
            return {
                type: Syntax$1290.ContinueStatement,
                label: null
            };
        }
        if (peekLineTerminator$1387()) {
            if (!state$1301.inIteration) {
                throwError$1390({}, Messages$1292.IllegalContinue);
            }
            return {
                type: Syntax$1290.ContinueStatement,
                label: null
            };
        }
        token$1845 = lookahead$1384().token;
        if (token$1845.type === Token$1288.Identifier) {
            label$1846 = parseVariableIdentifier$1519();
            if (!Object.prototype.hasOwnProperty.call(state$1301.labelSet, label$1846.name)) {
                throwError$1390({}, Messages$1292.UnknownLabel, label$1846.name);
            }
        }
        consumeSemicolon$1414();
        if (label$1846 === null && !state$1301.inIteration) {
            throwError$1390({}, Messages$1292.IllegalContinue);
        }
        return {
            type: Syntax$1290.ContinueStatement,
            label: label$1846
        };
    }
    // 12.8 The break statement
    function parseBreakStatement$1558() {
        var token$1847, label$1848 = null;
        expectKeyword$1402('break');
        if (peekLineTerminator$1387()) {
            if (!(state$1301.inIteration || state$1301.inSwitch)) {
                throwError$1390({}, Messages$1292.IllegalBreak);
            }
            return {
                type: Syntax$1290.BreakStatement,
                label: null
            };
        }
        token$1847 = lookahead$1384().token;
        if (token$1847.type === Token$1288.Identifier) {
            label$1848 = parseVariableIdentifier$1519();
            if (!Object.prototype.hasOwnProperty.call(state$1301.labelSet, label$1848.name)) {
                throwError$1390({}, Messages$1292.UnknownLabel, label$1848.name);
            }
        }
        consumeSemicolon$1414();
        if (label$1848 === null && !(state$1301.inIteration || state$1301.inSwitch)) {
            throwError$1390({}, Messages$1292.IllegalBreak);
        }
        return {
            type: Syntax$1290.BreakStatement,
            label: label$1848
        };
    }
    // 12.9 The return statement
    function parseReturnStatement$1561() {
        var token$1849, argument$1850 = null;
        expectKeyword$1402('return');
        if (!state$1301.inFunctionBody) {
            throwErrorTolerant$1393({}, Messages$1292.IllegalReturn);
        }
        if (peekLineTerminator$1387()) {
            return {
                type: Syntax$1290.ReturnStatement,
                argument: null
            };
        }
        if (!match$1405(';')) {
            token$1849 = lookahead$1384().token;
            if (!match$1405('}') && token$1849.type !== Token$1288.EOF) {
                argument$1850 = parseExpression$1510();
            }
        }
        consumeSemicolon$1414();
        return {
            type: Syntax$1290.ReturnStatement,
            argument: argument$1850
        };
    }
    // 12.10 The with statement
    function parseWithStatement$1564() {
        var object$1851, body$1852;
        if (strict$1295) {
            throwErrorTolerant$1393({}, Messages$1292.StrictModeWith);
        }
        expectKeyword$1402('with');
        expect$1399('(');
        object$1851 = parseExpression$1510();
        expect$1399(')');
        body$1852 = parseStatement$1585();
        return {
            type: Syntax$1290.WithStatement,
            object: object$1851,
            body: body$1852
        };
    }
    // 12.10 The swith statement
    function parseSwitchCase$1567() {
        var test$1853, consequent$1854 = [], statement$1855;
        if (matchKeyword$1408('default')) {
            lex$1381();
            test$1853 = null;
        } else {
            expectKeyword$1402('case');
            test$1853 = parseExpression$1510();
        }
        expect$1399(':');
        while (index$1296 < length$1299) {
            if (match$1405('}') || matchKeyword$1408('default') || matchKeyword$1408('case')) {
                break;
            }
            statement$1855 = parseStatement$1585();
            if (typeof statement$1855 === 'undefined') {
                break;
            }
            consequent$1854.push(statement$1855);
        }
        return {
            type: Syntax$1290.SwitchCase,
            test: test$1853,
            consequent: consequent$1854
        };
    }
    function parseSwitchStatement$1570() {
        var discriminant$1856, cases$1857, oldInSwitch$1858;
        expectKeyword$1402('switch');
        expect$1399('(');
        discriminant$1856 = parseExpression$1510();
        expect$1399(')');
        expect$1399('{');
        if (match$1405('}')) {
            lex$1381();
            return {
                type: Syntax$1290.SwitchStatement,
                discriminant: discriminant$1856
            };
        }
        cases$1857 = [];
        oldInSwitch$1858 = state$1301.inSwitch;
        state$1301.inSwitch = true;
        while (index$1296 < length$1299) {
            if (match$1405('}')) {
                break;
            }
            cases$1857.push(parseSwitchCase$1567());
        }
        state$1301.inSwitch = oldInSwitch$1858;
        expect$1399('}');
        return {
            type: Syntax$1290.SwitchStatement,
            discriminant: discriminant$1856,
            cases: cases$1857
        };
    }
    // 12.13 The throw statement
    function parseThrowStatement$1573() {
        var argument$1859;
        expectKeyword$1402('throw');
        if (peekLineTerminator$1387()) {
            throwError$1390({}, Messages$1292.NewlineAfterThrow);
        }
        argument$1859 = parseExpression$1510();
        consumeSemicolon$1414();
        return {
            type: Syntax$1290.ThrowStatement,
            argument: argument$1859
        };
    }
    // 12.14 The try statement
    function parseCatchClause$1576() {
        var param$1860;
        expectKeyword$1402('catch');
        expect$1399('(');
        if (!match$1405(')')) {
            param$1860 = parseExpression$1510();
            // 12.14.1
            if (strict$1295 && param$1860.type === Syntax$1290.Identifier && isRestrictedWord$1342(param$1860.name)) {
                throwErrorTolerant$1393({}, Messages$1292.StrictCatchVariable);
            }
        }
        expect$1399(')');
        return {
            type: Syntax$1290.CatchClause,
            param: param$1860,
            guard: null,
            body: parseBlock$1516()
        };
    }
    function parseTryStatement$1579() {
        var block$1861, handlers$1862 = [], finalizer$1863 = null;
        expectKeyword$1402('try');
        block$1861 = parseBlock$1516();
        if (matchKeyword$1408('catch')) {
            handlers$1862.push(parseCatchClause$1576());
        }
        if (matchKeyword$1408('finally')) {
            lex$1381();
            finalizer$1863 = parseBlock$1516();
        }
        if (handlers$1862.length === 0 && !finalizer$1863) {
            throwError$1390({}, Messages$1292.NoCatchOrFinally);
        }
        return {
            type: Syntax$1290.TryStatement,
            block: block$1861,
            handlers: handlers$1862,
            finalizer: finalizer$1863
        };
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$1582() {
        expectKeyword$1402('debugger');
        consumeSemicolon$1414();
        return { type: Syntax$1290.DebuggerStatement };
    }
    // 12 Statements
    function parseStatement$1585() {
        var token$1864 = lookahead$1384().token, expr$1865, labeledBody$1866;
        if (token$1864.type === Token$1288.EOF) {
            throwUnexpected$1396(token$1864);
        }
        if (token$1864.type === Token$1288.Punctuator) {
            switch (token$1864.value) {
            case ';':
                return parseEmptyStatement$1534();
            case '{':
                return parseBlock$1516();
            case '(':
                return parseExpressionStatement$1537();
            default:
                break;
            }
        }
        if (token$1864.type === Token$1288.Keyword) {
            switch (token$1864.value) {
            case 'break':
                return parseBreakStatement$1558();
            case 'continue':
                return parseContinueStatement$1555();
            case 'debugger':
                return parseDebuggerStatement$1582();
            case 'do':
                return parseDoWhileStatement$1543();
            case 'for':
                return parseForStatement$1552();
            case 'function':
                return parseFunctionDeclaration$1591();
            case 'if':
                return parseIfStatement$1540();
            case 'return':
                return parseReturnStatement$1561();
            case 'switch':
                return parseSwitchStatement$1570();
            case 'throw':
                return parseThrowStatement$1573();
            case 'try':
                return parseTryStatement$1579();
            case 'var':
                return parseVariableStatement$1528();
            case 'while':
                return parseWhileStatement$1546();
            case 'with':
                return parseWithStatement$1564();
            default:
                break;
            }
        }
        expr$1865 = parseExpression$1510();
        // 12.12 Labelled Statements
        if (expr$1865.type === Syntax$1290.Identifier && match$1405(':')) {
            lex$1381();
            if (Object.prototype.hasOwnProperty.call(state$1301.labelSet, expr$1865.name)) {
                throwError$1390({}, Messages$1292.Redeclaration, 'Label', expr$1865.name);
            }
            state$1301.labelSet[expr$1865.name] = true;
            labeledBody$1866 = parseStatement$1585();
            delete state$1301.labelSet[expr$1865.name];
            return {
                type: Syntax$1290.LabeledStatement,
                label: expr$1865,
                body: labeledBody$1866
            };
        }
        consumeSemicolon$1414();
        return {
            type: Syntax$1290.ExpressionStatement,
            expression: expr$1865
        };
    }
    // 13 Function Definition
    function parseFunctionSourceElements$1588() {
        var sourceElement$1867, sourceElements$1868 = [], token$1869, directive$1870, firstRestricted$1871, oldLabelSet$1872, oldInIteration$1873, oldInSwitch$1874, oldInFunctionBody$1875;
        expect$1399('{');
        while (index$1296 < length$1299) {
            token$1869 = lookahead$1384().token;
            if (token$1869.type !== Token$1288.StringLiteral) {
                break;
            }
            sourceElement$1867 = parseSourceElement$1597();
            sourceElements$1868.push(sourceElement$1867);
            if (sourceElement$1867.expression.type !== Syntax$1290.Literal) {
                // this is not directive
                break;
            }
            directive$1870 = sliceSource$1312(token$1869.range[0] + 1, token$1869.range[1] - 1);
            if (directive$1870 === 'use strict') {
                strict$1295 = true;
                if (firstRestricted$1871) {
                    throwError$1390(firstRestricted$1871, Messages$1292.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1871 && token$1869.octal) {
                    firstRestricted$1871 = token$1869;
                }
            }
        }
        oldLabelSet$1872 = state$1301.labelSet;
        oldInIteration$1873 = state$1301.inIteration;
        oldInSwitch$1874 = state$1301.inSwitch;
        oldInFunctionBody$1875 = state$1301.inFunctionBody;
        state$1301.labelSet = {};
        state$1301.inIteration = false;
        state$1301.inSwitch = false;
        state$1301.inFunctionBody = true;
        while (index$1296 < length$1299) {
            if (match$1405('}')) {
                break;
            }
            sourceElement$1867 = parseSourceElement$1597();
            if (typeof sourceElement$1867 === 'undefined') {
                break;
            }
            sourceElements$1868.push(sourceElement$1867);
        }
        expect$1399('}');
        state$1301.labelSet = oldLabelSet$1872;
        state$1301.inIteration = oldInIteration$1873;
        state$1301.inSwitch = oldInSwitch$1874;
        state$1301.inFunctionBody = oldInFunctionBody$1875;
        return {
            type: Syntax$1290.BlockStatement,
            body: sourceElements$1868
        };
    }
    function parseFunctionDeclaration$1591() {
        var id$1876, param$1877, params$1878 = [], body$1879, token$1880, firstRestricted$1881, message$1882, previousStrict$1883, paramSet$1884;
        expectKeyword$1402('function');
        token$1880 = lookahead$1384().token;
        id$1876 = parseVariableIdentifier$1519();
        if (strict$1295) {
            if (isRestrictedWord$1342(token$1880.value)) {
                throwError$1390(token$1880, Messages$1292.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$1342(token$1880.value)) {
                firstRestricted$1881 = token$1880;
                message$1882 = Messages$1292.StrictFunctionName;
            } else if (isStrictModeReservedWord$1339(token$1880.value)) {
                firstRestricted$1881 = token$1880;
                message$1882 = Messages$1292.StrictReservedWord;
            }
        }
        expect$1399('(');
        if (!match$1405(')')) {
            paramSet$1884 = {};
            while (index$1296 < length$1299) {
                token$1880 = lookahead$1384().token;
                param$1877 = parseVariableIdentifier$1519();
                if (strict$1295) {
                    if (isRestrictedWord$1342(token$1880.value)) {
                        throwError$1390(token$1880, Messages$1292.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$1884, token$1880.value)) {
                        throwError$1390(token$1880, Messages$1292.StrictParamDupe);
                    }
                } else if (!firstRestricted$1881) {
                    if (isRestrictedWord$1342(token$1880.value)) {
                        firstRestricted$1881 = token$1880;
                        message$1882 = Messages$1292.StrictParamName;
                    } else if (isStrictModeReservedWord$1339(token$1880.value)) {
                        firstRestricted$1881 = token$1880;
                        message$1882 = Messages$1292.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$1884, token$1880.value)) {
                        firstRestricted$1881 = token$1880;
                        message$1882 = Messages$1292.StrictParamDupe;
                    }
                }
                params$1878.push(param$1877);
                paramSet$1884[param$1877.name] = true;
                if (match$1405(')')) {
                    break;
                }
                expect$1399(',');
            }
        }
        expect$1399(')');
        previousStrict$1883 = strict$1295;
        body$1879 = parseFunctionSourceElements$1588();
        if (strict$1295 && firstRestricted$1881) {
            throwError$1390(firstRestricted$1881, message$1882);
        }
        strict$1295 = previousStrict$1883;
        return {
            type: Syntax$1290.FunctionDeclaration,
            id: id$1876,
            params: params$1878,
            body: body$1879
        };
    }
    function parseFunctionExpression$1594() {
        var token$1885, id$1886 = null, firstRestricted$1887, message$1888, param$1889, params$1890 = [], body$1891, previousStrict$1892, paramSet$1893;
        expectKeyword$1402('function');
        if (!match$1405('(')) {
            token$1885 = lookahead$1384().token;
            id$1886 = parseVariableIdentifier$1519();
            if (strict$1295) {
                if (isRestrictedWord$1342(token$1885.value)) {
                    throwError$1390(token$1885, Messages$1292.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$1342(token$1885.value)) {
                    firstRestricted$1887 = token$1885;
                    message$1888 = Messages$1292.StrictFunctionName;
                } else if (isStrictModeReservedWord$1339(token$1885.value)) {
                    firstRestricted$1887 = token$1885;
                    message$1888 = Messages$1292.StrictReservedWord;
                }
            }
        }
        expect$1399('(');
        if (!match$1405(')')) {
            paramSet$1893 = {};
            while (index$1296 < length$1299) {
                token$1885 = lookahead$1384().token;
                param$1889 = parseVariableIdentifier$1519();
                if (strict$1295) {
                    if (isRestrictedWord$1342(token$1885.value)) {
                        throwError$1390(token$1885, Messages$1292.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$1893, token$1885.value)) {
                        throwError$1390(token$1885, Messages$1292.StrictParamDupe);
                    }
                } else if (!firstRestricted$1887) {
                    if (isRestrictedWord$1342(token$1885.value)) {
                        firstRestricted$1887 = token$1885;
                        message$1888 = Messages$1292.StrictParamName;
                    } else if (isStrictModeReservedWord$1339(token$1885.value)) {
                        firstRestricted$1887 = token$1885;
                        message$1888 = Messages$1292.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$1893, token$1885.value)) {
                        firstRestricted$1887 = token$1885;
                        message$1888 = Messages$1292.StrictParamDupe;
                    }
                }
                params$1890.push(param$1889);
                paramSet$1893[param$1889.name] = true;
                if (match$1405(')')) {
                    break;
                }
                expect$1399(',');
            }
        }
        expect$1399(')');
        previousStrict$1892 = strict$1295;
        body$1891 = parseFunctionSourceElements$1588();
        if (strict$1295 && firstRestricted$1887) {
            throwError$1390(firstRestricted$1887, message$1888);
        }
        strict$1295 = previousStrict$1892;
        return {
            type: Syntax$1290.FunctionExpression,
            id: id$1886,
            params: params$1890,
            body: body$1891
        };
    }
    // 14 Program
    function parseSourceElement$1597() {
        var token$1894 = lookahead$1384().token;
        if (token$1894.type === Token$1288.Keyword) {
            switch (token$1894.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$1531(token$1894.value);
            case 'function':
                return parseFunctionDeclaration$1591();
            default:
                return parseStatement$1585();
            }
        }
        if (token$1894.type !== Token$1288.EOF) {
            return parseStatement$1585();
        }
    }
    function parseSourceElements$1600() {
        var sourceElement$1895, sourceElements$1896 = [], token$1897, directive$1898, firstRestricted$1899;
        while (index$1296 < length$1299) {
            token$1897 = lookahead$1384();
            if (token$1897.type !== Token$1288.StringLiteral) {
                break;
            }
            sourceElement$1895 = parseSourceElement$1597();
            sourceElements$1896.push(sourceElement$1895);
            if (sourceElement$1895.expression.type !== Syntax$1290.Literal) {
                // this is not directive
                break;
            }
            directive$1898 = sliceSource$1312(token$1897.range[0] + 1, token$1897.range[1] - 1);
            if (directive$1898 === 'use strict') {
                strict$1295 = true;
                if (firstRestricted$1899) {
                    throwError$1390(firstRestricted$1899, Messages$1292.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1899 && token$1897.octal) {
                    firstRestricted$1899 = token$1897;
                }
            }
        }
        while (index$1296 < length$1299) {
            sourceElement$1895 = parseSourceElement$1597();
            if (typeof sourceElement$1895 === 'undefined') {
                break;
            }
            sourceElements$1896.push(sourceElement$1895);
        }
        return sourceElements$1896;
    }
    function parseProgram$1603() {
        var program$1900;
        strict$1295 = false;
        program$1900 = {
            type: Syntax$1290.Program,
            body: parseSourceElements$1600()
        };
        return program$1900;
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$1606(start$1901, end$1902, type$1903, value$1904) {
        assert$1306(typeof start$1901 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$1303.comments.length > 0) {
            if (extra$1303.comments[extra$1303.comments.length - 1].range[1] > start$1901) {
                return;
            }
        }
        extra$1303.comments.push({
            range: [
                start$1901,
                end$1902
            ],
            type: type$1903,
            value: value$1904
        });
    }
    function scanComment$1609() {
        var comment$1905, ch$1906, start$1907, blockComment$1908, lineComment$1909;
        comment$1905 = '';
        blockComment$1908 = false;
        lineComment$1909 = false;
        while (index$1296 < length$1299) {
            ch$1906 = source$1294[index$1296];
            if (lineComment$1909) {
                ch$1906 = nextChar$1348();
                if (index$1296 >= length$1299) {
                    lineComment$1909 = false;
                    comment$1905 += ch$1906;
                    addComment$1606(start$1907, index$1296, 'Line', comment$1905);
                } else if (isLineTerminator$1327(ch$1906)) {
                    lineComment$1909 = false;
                    addComment$1606(start$1907, index$1296, 'Line', comment$1905);
                    if (ch$1906 === '\r' && source$1294[index$1296] === '\n') {
                        ++index$1296;
                    }
                    ++lineNumber$1297;
                    lineStart$1298 = index$1296;
                    comment$1905 = '';
                } else {
                    comment$1905 += ch$1906;
                }
            } else if (blockComment$1908) {
                if (isLineTerminator$1327(ch$1906)) {
                    if (ch$1906 === '\r' && source$1294[index$1296 + 1] === '\n') {
                        ++index$1296;
                        comment$1905 += '\r\n';
                    } else {
                        comment$1905 += ch$1906;
                    }
                    ++lineNumber$1297;
                    ++index$1296;
                    lineStart$1298 = index$1296;
                    if (index$1296 >= length$1299) {
                        throwError$1390({}, Messages$1292.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1906 = nextChar$1348();
                    if (index$1296 >= length$1299) {
                        throwError$1390({}, Messages$1292.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1905 += ch$1906;
                    if (ch$1906 === '*') {
                        ch$1906 = source$1294[index$1296];
                        if (ch$1906 === '/') {
                            comment$1905 = comment$1905.substr(0, comment$1905.length - 1);
                            blockComment$1908 = false;
                            ++index$1296;
                            addComment$1606(start$1907, index$1296, 'Block', comment$1905);
                            comment$1905 = '';
                        }
                    }
                }
            } else if (ch$1906 === '/') {
                ch$1906 = source$1294[index$1296 + 1];
                if (ch$1906 === '/') {
                    start$1907 = index$1296;
                    index$1296 += 2;
                    lineComment$1909 = true;
                } else if (ch$1906 === '*') {
                    start$1907 = index$1296;
                    index$1296 += 2;
                    blockComment$1908 = true;
                    if (index$1296 >= length$1299) {
                        throwError$1390({}, Messages$1292.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$1324(ch$1906)) {
                ++index$1296;
            } else if (isLineTerminator$1327(ch$1906)) {
                ++index$1296;
                if (ch$1906 === '\r' && source$1294[index$1296] === '\n') {
                    ++index$1296;
                }
                ++lineNumber$1297;
                lineStart$1298 = index$1296;
            } else {
                break;
            }
        }
    }
    function collectToken$1612() {
        var token$1910 = extra$1303.advance(), range$1911, value$1912;
        if (token$1910.type !== Token$1288.EOF) {
            range$1911 = [
                token$1910.range[0],
                token$1910.range[1]
            ];
            value$1912 = sliceSource$1312(token$1910.range[0], token$1910.range[1]);
            extra$1303.tokens.push({
                type: TokenName$1289[token$1910.type],
                value: value$1912,
                lineNumber: lineNumber$1297,
                lineStart: lineStart$1298,
                range: range$1911
            });
        }
        return token$1910;
    }
    function collectRegex$1615() {
        var pos$1913, regex$1914, token$1915;
        skipComment$1354();
        pos$1913 = index$1296;
        regex$1914 = extra$1303.scanRegExp();
        // Pop the previous token, which is likely '/' or '/='
        if (extra$1303.tokens.length > 0) {
            token$1915 = extra$1303.tokens[extra$1303.tokens.length - 1];
            if (token$1915.range[0] === pos$1913 && token$1915.type === 'Punctuator') {
                if (token$1915.value === '/' || token$1915.value === '/=') {
                    extra$1303.tokens.pop();
                }
            }
        }
        extra$1303.tokens.push({
            type: 'RegularExpression',
            value: regex$1914.literal,
            range: [
                pos$1913,
                index$1296
            ],
            lineStart: token$1915.lineStart,
            lineNumber: token$1915.lineNumber
        });
        return regex$1914;
    }
    function createLiteral$1618(token$1916) {
        if (Array.isArray(token$1916)) {
            return {
                type: Syntax$1290.Literal,
                value: token$1916
            };
        }
        return {
            type: Syntax$1290.Literal,
            value: token$1916.value,
            lineStart: token$1916.lineStart,
            lineNumber: token$1916.lineNumber
        };
    }
    function createRawLiteral$1621(token$1917) {
        return {
            type: Syntax$1290.Literal,
            value: token$1917.value,
            raw: sliceSource$1312(token$1917.range[0], token$1917.range[1]),
            lineStart: token$1917.lineStart,
            lineNumber: token$1917.lineNumber
        };
    }
    function wrapTrackingFunction$1624(range$1918, loc$1919) {
        return function (parseFunction$1922) {
            function isBinary$1925(node$1931) {
                return node$1931.type === Syntax$1290.LogicalExpression || node$1931.type === Syntax$1290.BinaryExpression;
            }
            function visit$1928(node$1932) {
                if (isBinary$1925(node$1932.left)) {
                    visit$1928(node$1932.left);
                }
                if (isBinary$1925(node$1932.right)) {
                    visit$1928(node$1932.right);
                }
                if (range$1918 && typeof node$1932.range === 'undefined') {
                    node$1932.range = [
                        node$1932.left.range[0],
                        node$1932.right.range[1]
                    ];
                }
                if (loc$1919 && typeof node$1932.loc === 'undefined') {
                    node$1932.loc = {
                        start: node$1932.left.loc.start,
                        end: node$1932.right.loc.end
                    };
                }
            }
            return function () {
                var node$1933, rangeInfo$1934, locInfo$1935;
                // skipComment();
                var curr$1936 = tokenStream$1302[index$1296].token;
                rangeInfo$1934 = [
                    curr$1936.range[0],
                    0
                ];
                locInfo$1935 = {
                    start: {
                        line: curr$1936.sm_lineNumber,
                        column: curr$1936.range[0] - curr$1936.sm_lineStart
                    }
                };
                node$1933 = parseFunction$1922.apply(null, arguments);
                if (typeof node$1933 !== 'undefined') {
                    var last$1937 = tokenStream$1302[index$1296].token;
                    if (range$1918) {
                        rangeInfo$1934[1] = last$1937.range[1];
                        node$1933.range = rangeInfo$1934;
                    }
                    if (loc$1919) {
                        locInfo$1935.end = {
                            line: last$1937.sm_lineNumber,
                            column: last$1937.range[0] - curr$1936.sm_lineStart
                        };
                        node$1933.loc = locInfo$1935;
                    }
                    if (isBinary$1925(node$1933)) {
                        visit$1928(node$1933);
                    }
                    if (node$1933.type === Syntax$1290.MemberExpression) {
                        if (typeof node$1933.object.range !== 'undefined') {
                            node$1933.range[0] = node$1933.object.range[0];
                        }
                        if (typeof node$1933.object.loc !== 'undefined') {
                            node$1933.loc.start = node$1933.object.loc.start;
                        }
                    }
                    if (node$1933.type === Syntax$1290.CallExpression) {
                        if (typeof node$1933.callee.range !== 'undefined') {
                            node$1933.range[0] = node$1933.callee.range[0];
                        }
                        if (typeof node$1933.callee.loc !== 'undefined') {
                            node$1933.loc.start = node$1933.callee.loc.start;
                        }
                    }
                    if (node$1933.type !== Syntax$1290.Program) {
                        if (curr$1936.leadingComments) {
                            node$1933.leadingComments = curr$1936.leadingComments;
                        }
                        if (curr$1936.trailingComments) {
                            node$1933.trailingComments = curr$1936.trailingComments;
                        }
                    }
                    return node$1933;
                }
            };
        };
    }
    function patch$1627() {
        var wrapTracking$1938;
        if (extra$1303.comments) {
            extra$1303.skipComment = skipComment$1354;
            skipComment$1354 = scanComment$1609;
        }
        if (extra$1303.raw) {
            extra$1303.createLiteral = createLiteral$1618;
            createLiteral$1618 = createRawLiteral$1621;
        }
        if (extra$1303.range || extra$1303.loc) {
            wrapTracking$1938 = wrapTrackingFunction$1624(extra$1303.range, extra$1303.loc);
            extra$1303.parseAdditiveExpression = parseAdditiveExpression$1477;
            extra$1303.parseAssignmentExpression = parseAssignmentExpression$1507;
            extra$1303.parseBitwiseANDExpression = parseBitwiseANDExpression$1489;
            extra$1303.parseBitwiseORExpression = parseBitwiseORExpression$1495;
            extra$1303.parseBitwiseXORExpression = parseBitwiseXORExpression$1492;
            extra$1303.parseBlock = parseBlock$1516;
            extra$1303.parseFunctionSourceElements = parseFunctionSourceElements$1588;
            extra$1303.parseCallMember = parseCallMember$1450;
            extra$1303.parseCatchClause = parseCatchClause$1576;
            extra$1303.parseComputedMember = parseComputedMember$1447;
            extra$1303.parseConditionalExpression = parseConditionalExpression$1504;
            extra$1303.parseConstLetDeclaration = parseConstLetDeclaration$1531;
            extra$1303.parseEqualityExpression = parseEqualityExpression$1486;
            extra$1303.parseExpression = parseExpression$1510;
            extra$1303.parseForVariableDeclaration = parseForVariableDeclaration$1549;
            extra$1303.parseFunctionDeclaration = parseFunctionDeclaration$1591;
            extra$1303.parseFunctionExpression = parseFunctionExpression$1594;
            extra$1303.parseLogicalANDExpression = parseLogicalANDExpression$1498;
            extra$1303.parseLogicalORExpression = parseLogicalORExpression$1501;
            extra$1303.parseMultiplicativeExpression = parseMultiplicativeExpression$1474;
            extra$1303.parseNewExpression = parseNewExpression$1453;
            extra$1303.parseNonComputedMember = parseNonComputedMember$1444;
            extra$1303.parseNonComputedProperty = parseNonComputedProperty$1441;
            extra$1303.parseObjectProperty = parseObjectProperty$1429;
            extra$1303.parseObjectPropertyKey = parseObjectPropertyKey$1426;
            extra$1303.parsePostfixExpression = parsePostfixExpression$1468;
            extra$1303.parsePrimaryExpression = parsePrimaryExpression$1435;
            extra$1303.parseProgram = parseProgram$1603;
            extra$1303.parsePropertyFunction = parsePropertyFunction$1423;
            extra$1303.parseRelationalExpression = parseRelationalExpression$1483;
            extra$1303.parseStatement = parseStatement$1585;
            extra$1303.parseShiftExpression = parseShiftExpression$1480;
            extra$1303.parseSwitchCase = parseSwitchCase$1567;
            extra$1303.parseUnaryExpression = parseUnaryExpression$1471;
            extra$1303.parseVariableDeclaration = parseVariableDeclaration$1522;
            extra$1303.parseVariableIdentifier = parseVariableIdentifier$1519;
            parseAdditiveExpression$1477 = wrapTracking$1938(extra$1303.parseAdditiveExpression);
            parseAssignmentExpression$1507 = wrapTracking$1938(extra$1303.parseAssignmentExpression);
            parseBitwiseANDExpression$1489 = wrapTracking$1938(extra$1303.parseBitwiseANDExpression);
            parseBitwiseORExpression$1495 = wrapTracking$1938(extra$1303.parseBitwiseORExpression);
            parseBitwiseXORExpression$1492 = wrapTracking$1938(extra$1303.parseBitwiseXORExpression);
            parseBlock$1516 = wrapTracking$1938(extra$1303.parseBlock);
            parseFunctionSourceElements$1588 = wrapTracking$1938(extra$1303.parseFunctionSourceElements);
            parseCallMember$1450 = wrapTracking$1938(extra$1303.parseCallMember);
            parseCatchClause$1576 = wrapTracking$1938(extra$1303.parseCatchClause);
            parseComputedMember$1447 = wrapTracking$1938(extra$1303.parseComputedMember);
            parseConditionalExpression$1504 = wrapTracking$1938(extra$1303.parseConditionalExpression);
            parseConstLetDeclaration$1531 = wrapTracking$1938(extra$1303.parseConstLetDeclaration);
            parseEqualityExpression$1486 = wrapTracking$1938(extra$1303.parseEqualityExpression);
            parseExpression$1510 = wrapTracking$1938(extra$1303.parseExpression);
            parseForVariableDeclaration$1549 = wrapTracking$1938(extra$1303.parseForVariableDeclaration);
            parseFunctionDeclaration$1591 = wrapTracking$1938(extra$1303.parseFunctionDeclaration);
            parseFunctionExpression$1594 = wrapTracking$1938(extra$1303.parseFunctionExpression);
            parseLogicalANDExpression$1498 = wrapTracking$1938(extra$1303.parseLogicalANDExpression);
            parseLogicalORExpression$1501 = wrapTracking$1938(extra$1303.parseLogicalORExpression);
            parseMultiplicativeExpression$1474 = wrapTracking$1938(extra$1303.parseMultiplicativeExpression);
            parseNewExpression$1453 = wrapTracking$1938(extra$1303.parseNewExpression);
            parseNonComputedMember$1444 = wrapTracking$1938(extra$1303.parseNonComputedMember);
            parseNonComputedProperty$1441 = wrapTracking$1938(extra$1303.parseNonComputedProperty);
            parseObjectProperty$1429 = wrapTracking$1938(extra$1303.parseObjectProperty);
            parseObjectPropertyKey$1426 = wrapTracking$1938(extra$1303.parseObjectPropertyKey);
            parsePostfixExpression$1468 = wrapTracking$1938(extra$1303.parsePostfixExpression);
            parsePrimaryExpression$1435 = wrapTracking$1938(extra$1303.parsePrimaryExpression);
            parseProgram$1603 = wrapTracking$1938(extra$1303.parseProgram);
            parsePropertyFunction$1423 = wrapTracking$1938(extra$1303.parsePropertyFunction);
            parseRelationalExpression$1483 = wrapTracking$1938(extra$1303.parseRelationalExpression);
            parseStatement$1585 = wrapTracking$1938(extra$1303.parseStatement);
            parseShiftExpression$1480 = wrapTracking$1938(extra$1303.parseShiftExpression);
            parseSwitchCase$1567 = wrapTracking$1938(extra$1303.parseSwitchCase);
            parseUnaryExpression$1471 = wrapTracking$1938(extra$1303.parseUnaryExpression);
            parseVariableDeclaration$1522 = wrapTracking$1938(extra$1303.parseVariableDeclaration);
            parseVariableIdentifier$1519 = wrapTracking$1938(extra$1303.parseVariableIdentifier);
        }
        if (typeof extra$1303.tokens !== 'undefined') {
            extra$1303.advance = advance$1378;
            extra$1303.scanRegExp = scanRegExp$1372;
            advance$1378 = collectToken$1612;
            scanRegExp$1372 = collectRegex$1615;
        }
    }
    function unpatch$1630() {
        if (typeof extra$1303.skipComment === 'function') {
            skipComment$1354 = extra$1303.skipComment;
        }
        if (extra$1303.raw) {
            createLiteral$1618 = extra$1303.createLiteral;
        }
        if (extra$1303.range || extra$1303.loc) {
            parseAdditiveExpression$1477 = extra$1303.parseAdditiveExpression;
            parseAssignmentExpression$1507 = extra$1303.parseAssignmentExpression;
            parseBitwiseANDExpression$1489 = extra$1303.parseBitwiseANDExpression;
            parseBitwiseORExpression$1495 = extra$1303.parseBitwiseORExpression;
            parseBitwiseXORExpression$1492 = extra$1303.parseBitwiseXORExpression;
            parseBlock$1516 = extra$1303.parseBlock;
            parseFunctionSourceElements$1588 = extra$1303.parseFunctionSourceElements;
            parseCallMember$1450 = extra$1303.parseCallMember;
            parseCatchClause$1576 = extra$1303.parseCatchClause;
            parseComputedMember$1447 = extra$1303.parseComputedMember;
            parseConditionalExpression$1504 = extra$1303.parseConditionalExpression;
            parseConstLetDeclaration$1531 = extra$1303.parseConstLetDeclaration;
            parseEqualityExpression$1486 = extra$1303.parseEqualityExpression;
            parseExpression$1510 = extra$1303.parseExpression;
            parseForVariableDeclaration$1549 = extra$1303.parseForVariableDeclaration;
            parseFunctionDeclaration$1591 = extra$1303.parseFunctionDeclaration;
            parseFunctionExpression$1594 = extra$1303.parseFunctionExpression;
            parseLogicalANDExpression$1498 = extra$1303.parseLogicalANDExpression;
            parseLogicalORExpression$1501 = extra$1303.parseLogicalORExpression;
            parseMultiplicativeExpression$1474 = extra$1303.parseMultiplicativeExpression;
            parseNewExpression$1453 = extra$1303.parseNewExpression;
            parseNonComputedMember$1444 = extra$1303.parseNonComputedMember;
            parseNonComputedProperty$1441 = extra$1303.parseNonComputedProperty;
            parseObjectProperty$1429 = extra$1303.parseObjectProperty;
            parseObjectPropertyKey$1426 = extra$1303.parseObjectPropertyKey;
            parsePrimaryExpression$1435 = extra$1303.parsePrimaryExpression;
            parsePostfixExpression$1468 = extra$1303.parsePostfixExpression;
            parseProgram$1603 = extra$1303.parseProgram;
            parsePropertyFunction$1423 = extra$1303.parsePropertyFunction;
            parseRelationalExpression$1483 = extra$1303.parseRelationalExpression;
            parseStatement$1585 = extra$1303.parseStatement;
            parseShiftExpression$1480 = extra$1303.parseShiftExpression;
            parseSwitchCase$1567 = extra$1303.parseSwitchCase;
            parseUnaryExpression$1471 = extra$1303.parseUnaryExpression;
            parseVariableDeclaration$1522 = extra$1303.parseVariableDeclaration;
            parseVariableIdentifier$1519 = extra$1303.parseVariableIdentifier;
        }
        if (typeof extra$1303.scanRegExp === 'function') {
            advance$1378 = extra$1303.advance;
            scanRegExp$1372 = extra$1303.scanRegExp;
        }
    }
    function stringToArray$1633(str$1939) {
        var length$1940 = str$1939.length, result$1941 = [], i$1942;
        for (i$1942 = 0; i$1942 < length$1940; ++i$1942) {
            result$1941[i$1942] = str$1939.charAt(i$1942);
        }
        return result$1941;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$1636(toks$1943, start$1944, inExprDelim$1945, parentIsBlock$1946) {
        var assignOps$1947 = [
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
        var binaryOps$1948 = [
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
        var unaryOps$1949 = [
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
        function back$1952(n$1953) {
            var idx$1954 = toks$1943.length - n$1953 > 0 ? toks$1943.length - n$1953 : 0;
            return toks$1943[idx$1954];
        }
        if (inExprDelim$1945 && toks$1943.length - (start$1944 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1952(start$1944 + 2).value === ':' && parentIsBlock$1946) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$1309(back$1952(start$1944 + 2).value, unaryOps$1949.concat(binaryOps$1948).concat(assignOps$1947))) {
            // ... + {...}
            return false;
        } else if (back$1952(start$1944 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1955 = typeof back$1952(start$1944 + 1).startLineNumber !== 'undefined' ? back$1952(start$1944 + 1).startLineNumber : back$1952(start$1944 + 1).lineNumber;
            if (back$1952(start$1944 + 2).lineNumber !== currLineNumber$1955) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$1309(back$1952(start$1944 + 2).value, [
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
    function readToken$1639(toks$1956, inExprDelim$1957, parentIsBlock$1958) {
        var delimiters$1959 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1960 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1961 = toks$1956.length - 1;
        var comments$1962, commentsLen$1963 = extra$1303.comments.length;
        function back$1966(n$1976) {
            var idx$1977 = toks$1956.length - n$1976 > 0 ? toks$1956.length - n$1976 : 0;
            return toks$1956[idx$1977];
        }
        function attachComments$1969(token$1978) {
            if (comments$1962) {
                token$1978.leadingComments = comments$1962;
            }
            return token$1978;
        }
        function _advance$1972() {
            return attachComments$1969(advance$1378());
        }
        function _scanRegExp$1975() {
            return attachComments$1969(scanRegExp$1372());
        }
        skipComment$1354();
        if (extra$1303.comments.length > commentsLen$1963) {
            comments$1962 = extra$1303.comments.slice(commentsLen$1963);
        }
        if (isIn$1309(getChar$1351(), delimiters$1959)) {
            return attachComments$1969(readDelim$1642(toks$1956, inExprDelim$1957, parentIsBlock$1958));
        }
        if (getChar$1351() === '/') {
            var prev$1979 = back$1966(1);
            if (prev$1979) {
                if (prev$1979.value === '()') {
                    if (isIn$1309(back$1966(2).value, parenIdents$1960)) {
                        // ... if (...) / ...
                        return _scanRegExp$1975();
                    }
                    // ... (...) / ...
                    return _advance$1972();
                }
                if (prev$1979.value === '{}') {
                    if (blockAllowed$1636(toks$1956, 0, inExprDelim$1957, parentIsBlock$1958)) {
                        if (back$1966(2).value === '()') {
                            // named function
                            if (back$1966(4).value === 'function') {
                                if (!blockAllowed$1636(toks$1956, 3, inExprDelim$1957, parentIsBlock$1958)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1972();
                                }
                                if (toks$1956.length - 5 <= 0 && inExprDelim$1957) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1972();
                                }
                            }
                            // unnamed function
                            if (back$1966(3).value === 'function') {
                                if (!blockAllowed$1636(toks$1956, 2, inExprDelim$1957, parentIsBlock$1958)) {
                                    // new function (...) {...} / ...
                                    return _advance$1972();
                                }
                                if (toks$1956.length - 4 <= 0 && inExprDelim$1957) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1972();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1975();
                    } else {
                        // ... + {...} / ...
                        return _advance$1972();
                    }
                }
                if (prev$1979.type === Token$1288.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1975();
                }
                if (isKeyword$1345(prev$1979.value)) {
                    // typeof /...
                    return _scanRegExp$1975();
                }
                return _advance$1972();
            }
            return _scanRegExp$1975();
        }
        return _advance$1972();
    }
    function readDelim$1642(toks$1980, inExprDelim$1981, parentIsBlock$1982) {
        var startDelim$1983 = advance$1378(), matchDelim$1984 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1985 = [];
        var delimiters$1986 = [
                '(',
                '{',
                '['
            ];
        assert$1306(delimiters$1986.indexOf(startDelim$1983.value) !== -1, 'Need to begin at the delimiter');
        var token$1987 = startDelim$1983;
        var startLineNumber$1988 = token$1987.lineNumber;
        var startLineStart$1989 = token$1987.lineStart;
        var startRange$1990 = token$1987.range;
        var delimToken$1991 = {};
        delimToken$1991.type = Token$1288.Delimiter;
        delimToken$1991.value = startDelim$1983.value + matchDelim$1984[startDelim$1983.value];
        delimToken$1991.startLineNumber = startLineNumber$1988;
        delimToken$1991.startLineStart = startLineStart$1989;
        delimToken$1991.startRange = startRange$1990;
        var delimIsBlock$1992 = false;
        if (startDelim$1983.value === '{') {
            delimIsBlock$1992 = blockAllowed$1636(toks$1980.concat(delimToken$1991), 0, inExprDelim$1981, parentIsBlock$1982);
        }
        while (index$1296 <= length$1299) {
            token$1987 = readToken$1639(inner$1985, startDelim$1983.value === '(' || startDelim$1983.value === '[', delimIsBlock$1992);
            if (token$1987.type === Token$1288.Punctuator && token$1987.value === matchDelim$1984[startDelim$1983.value]) {
                if (token$1987.leadingComments) {
                    delimToken$1991.trailingComments = token$1987.leadingComments;
                }
                break;
            } else if (token$1987.type === Token$1288.EOF) {
                throwError$1390({}, Messages$1292.UnexpectedEOS);
            } else {
                inner$1985.push(token$1987);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$1296 >= length$1299 && matchDelim$1984[startDelim$1983.value] !== source$1294[length$1299 - 1]) {
            throwError$1390({}, Messages$1292.UnexpectedEOS);
        }
        var endLineNumber$1993 = token$1987.lineNumber;
        var endLineStart$1994 = token$1987.lineStart;
        var endRange$1995 = token$1987.range;
        delimToken$1991.inner = inner$1985;
        delimToken$1991.endLineNumber = endLineNumber$1993;
        delimToken$1991.endLineStart = endLineStart$1994;
        delimToken$1991.endRange = endRange$1995;
        return delimToken$1991;
    }
    ;
    // (Str) -> [...CSyntax]
    function read$1645(code$1996) {
        var token$1997, tokenTree$1998 = [];
        extra$1303 = {};
        extra$1303.comments = [];
        patch$1627();
        source$1294 = code$1996;
        index$1296 = 0;
        lineNumber$1297 = source$1294.length > 0 ? 1 : 0;
        lineStart$1298 = 0;
        length$1299 = source$1294.length;
        buffer$1300 = null;
        state$1301 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$1296 < length$1299) {
            tokenTree$1998.push(readToken$1639(tokenTree$1998, false, false));
        }
        var last$1999 = tokenTree$1998[tokenTree$1998.length - 1];
        if (last$1999 && last$1999.type !== Token$1288.EOF) {
            tokenTree$1998.push({
                type: Token$1288.EOF,
                value: '',
                lineNumber: last$1999.lineNumber,
                lineStart: last$1999.lineStart,
                range: [
                    index$1296,
                    index$1296
                ]
            });
        }
        return expander$1287.tokensToSyntax(tokenTree$1998);
    }
    // (SyntaxObject, Str, {}) -> SyntaxObject
    function parse$1648(code$2000) {
        var program$2001, toString$2002;
        tokenStream$1302 = code$2000;
        index$1296 = 0;
        length$1299 = tokenStream$1302.length;
        buffer$1300 = null;
        state$1301 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$1303 = {
            range: true,
            loc: true
        };
        patch$1627();
        try {
            program$2001 = parseProgram$1603();
            program$2001.tokens = expander$1287.syntaxToTokens(code$2000);
        } catch (e$2003) {
            throw e$2003;
        } finally {
            unpatch$1630();
            extra$1303 = {};
        }
        return program$2001;
    }
    exports$1286.parse = parse$1648;
    exports$1286.read = read$1645;
    exports$1286.Token = Token$1288;
    exports$1286.assert = assert$1306;
    // Deep copy.
    exports$1286.Syntax = function () {
        var name$2006, types$2007 = {};
        if (typeof Object.create === 'function') {
            types$2007 = Object.create(null);
        }
        for (name$2006 in Syntax$1290) {
            if (Syntax$1290.hasOwnProperty(name$2006)) {
                types$2007[name$2006] = Syntax$1290[name$2006];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$2007);
        }
        return types$2007;
    }();
}));