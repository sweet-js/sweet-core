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
(function (root$2052, factory$2053) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$2053(exports, require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'expander'
        ], factory$2053);
    }
}(this, function (exports$2054, expander$2055) {
    'use strict';
    var Token$2056, TokenName$2057, Syntax$2058, PropertyKind$2059, Messages$2060, Regex$2061, source$2062, strict$2063, index$2064, lineNumber$2065, lineStart$2066, length$2067, buffer$2068, state$2069, tokenStream$2070, extra$2071;
    Token$2056 = {
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
    TokenName$2057 = {};
    TokenName$2057[Token$2056.BooleanLiteral] = 'Boolean';
    TokenName$2057[Token$2056.EOF] = '<end>';
    TokenName$2057[Token$2056.Identifier] = 'Identifier';
    TokenName$2057[Token$2056.Keyword] = 'Keyword';
    TokenName$2057[Token$2056.NullLiteral] = 'Null';
    TokenName$2057[Token$2056.NumericLiteral] = 'Numeric';
    TokenName$2057[Token$2056.Punctuator] = 'Punctuator';
    TokenName$2057[Token$2056.StringLiteral] = 'String';
    TokenName$2057[Token$2056.Delimiter] = 'Delimiter';
    Syntax$2058 = {
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
    PropertyKind$2059 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    // Error messages should be identical to V8.
    Messages$2060 = {
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
    Regex$2061 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$2072(condition$2187, message$2188) {
        if (!condition$2187) {
            throw new Error('ASSERT: ' + message$2188);
        }
    }
    function isIn$2073(el$2189, list$2190) {
        return list$2190.indexOf(el$2189) !== -1;
    }
    function sliceSource$2074(from$2191, to$2192) {
        return source$2062.slice(from$2191, to$2192);
    }
    if (typeof 'esprima'[0] === 'undefined') {
        sliceSource$2074 = function sliceArraySource$2193(from$2194, to$2195) {
            return source$2062.slice(from$2194, to$2195).join('');
        };
    }
    function isDecimalDigit$2075(ch$2196) {
        return '0123456789'.indexOf(ch$2196) >= 0;
    }
    function isHexDigit$2076(ch$2197) {
        return '0123456789abcdefABCDEF'.indexOf(ch$2197) >= 0;
    }
    function isOctalDigit$2077(ch$2198) {
        return '01234567'.indexOf(ch$2198) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$2078(ch$2199) {
        return ch$2199 === ' ' || ch$2199 === '\t' || ch$2199 === '\x0B' || ch$2199 === '\f' || ch$2199 === '\xa0' || ch$2199.charCodeAt(0) >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(ch$2199) >= 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$2079(ch$2200) {
        return ch$2200 === '\n' || ch$2200 === '\r' || ch$2200 === '\u2028' || ch$2200 === '\u2029';
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$2080(ch$2201) {
        return ch$2201 === '$' || ch$2201 === '_' || ch$2201 === '\\' || ch$2201 >= 'a' && ch$2201 <= 'z' || ch$2201 >= 'A' && ch$2201 <= 'Z' || ch$2201.charCodeAt(0) >= 128 && Regex$2061.NonAsciiIdentifierStart.test(ch$2201);
    }
    function isIdentifierPart$2081(ch$2202) {
        return ch$2202 === '$' || ch$2202 === '_' || ch$2202 === '\\' || ch$2202 >= 'a' && ch$2202 <= 'z' || ch$2202 >= 'A' && ch$2202 <= 'Z' || ch$2202 >= '0' && ch$2202 <= '9' || ch$2202.charCodeAt(0) >= 128 && Regex$2061.NonAsciiIdentifierPart.test(ch$2202);
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$2082(id$2203) {
        // we are allowing future reserved words so macros can be written for them
        return false;
    }
    function isStrictModeReservedWord$2083(id$2204) {
        switch (id$2204) {
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
    function isRestrictedWord$2084(id$2205) {
        return id$2205 === 'eval' || id$2205 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$2085(id$2206) {
        var keyword$2207 = false;
        switch (id$2206.length) {
        case 2:
            keyword$2207 = id$2206 === 'if' || id$2206 === 'in' || id$2206 === 'do';
            break;
        case 3:
            keyword$2207 = id$2206 === 'var' || id$2206 === 'for' || id$2206 === 'new' || id$2206 === 'try';
            break;
        case 4:
            keyword$2207 = id$2206 === 'this' || id$2206 === 'else' || id$2206 === 'case' || id$2206 === 'void' || id$2206 === 'with';
            break;
        case 5:
            keyword$2207 = id$2206 === 'while' || id$2206 === 'break' || id$2206 === 'catch' || id$2206 === 'throw';
            break;
        case 6:
            keyword$2207 = id$2206 === 'return' || id$2206 === 'typeof' || id$2206 === 'delete' || id$2206 === 'switch';
            break;
        case 7:
            keyword$2207 = id$2206 === 'default' || id$2206 === 'finally';
            break;
        case 8:
            keyword$2207 = id$2206 === 'function' || id$2206 === 'continue' || id$2206 === 'debugger';
            break;
        case 10:
            keyword$2207 = id$2206 === 'instanceof';
            break;
        }
        if (keyword$2207) {
            return true;
        }
        switch (id$2206) {
        // Future reserved words.
        // 'const' is specialized as Keyword in V8.
        case 'const':
            return true;
        // For compatiblity to SpiderMonkey and ES.next
        case 'yield':
        case 'let':
            return true;
        }
        if (strict$2063 && isStrictModeReservedWord$2083(id$2206)) {
            return true;
        }
        return isFutureReservedWord$2082(id$2206);
    }
    // Return the next character and move forward.
    function nextChar$2086() {
        return source$2062[index$2064++];
    }
    function getChar$2087() {
        return source$2062[index$2064];
    }
    // 7.4 Comments
    function skipComment$2088() {
        var ch$2208, blockComment$2209, lineComment$2210;
        blockComment$2209 = false;
        lineComment$2210 = false;
        while (index$2064 < length$2067) {
            ch$2208 = source$2062[index$2064];
            if (lineComment$2210) {
                ch$2208 = nextChar$2086();
                if (isLineTerminator$2079(ch$2208)) {
                    lineComment$2210 = false;
                    if (ch$2208 === '\r' && source$2062[index$2064] === '\n') {
                        ++index$2064;
                    }
                    ++lineNumber$2065;
                    lineStart$2066 = index$2064;
                }
            } else if (blockComment$2209) {
                if (isLineTerminator$2079(ch$2208)) {
                    if (ch$2208 === '\r' && source$2062[index$2064 + 1] === '\n') {
                        ++index$2064;
                    }
                    ++lineNumber$2065;
                    ++index$2064;
                    lineStart$2066 = index$2064;
                    if (index$2064 >= length$2067) {
                        throwError$2100({}, Messages$2060.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$2208 = nextChar$2086();
                    if (index$2064 >= length$2067) {
                        throwError$2100({}, Messages$2060.UnexpectedToken, 'ILLEGAL');
                    }
                    if (ch$2208 === '*') {
                        ch$2208 = source$2062[index$2064];
                        if (ch$2208 === '/') {
                            ++index$2064;
                            blockComment$2209 = false;
                        }
                    }
                }
            } else if (ch$2208 === '/') {
                ch$2208 = source$2062[index$2064 + 1];
                if (ch$2208 === '/') {
                    index$2064 += 2;
                    lineComment$2210 = true;
                } else if (ch$2208 === '*') {
                    index$2064 += 2;
                    blockComment$2209 = true;
                    if (index$2064 >= length$2067) {
                        throwError$2100({}, Messages$2060.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$2078(ch$2208)) {
                ++index$2064;
            } else if (isLineTerminator$2079(ch$2208)) {
                ++index$2064;
                if (ch$2208 === '\r' && source$2062[index$2064] === '\n') {
                    ++index$2064;
                }
                ++lineNumber$2065;
                lineStart$2066 = index$2064;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$2089(prefix$2211) {
        var i$2212, len$2213, ch$2214, code$2215 = 0;
        len$2213 = prefix$2211 === 'u' ? 4 : 2;
        for (i$2212 = 0; i$2212 < len$2213; ++i$2212) {
            if (index$2064 < length$2067 && isHexDigit$2076(source$2062[index$2064])) {
                ch$2214 = nextChar$2086();
                code$2215 = code$2215 * 16 + '0123456789abcdef'.indexOf(ch$2214.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$2215);
    }
    function scanIdentifier$2090() {
        var ch$2216, start$2217, id$2218, restore$2219;
        ch$2216 = source$2062[index$2064];
        if (!isIdentifierStart$2080(ch$2216)) {
            return;
        }
        start$2217 = index$2064;
        if (ch$2216 === '\\') {
            ++index$2064;
            if (source$2062[index$2064] !== 'u') {
                return;
            }
            ++index$2064;
            restore$2219 = index$2064;
            ch$2216 = scanHexEscape$2089('u');
            if (ch$2216) {
                if (ch$2216 === '\\' || !isIdentifierStart$2080(ch$2216)) {
                    return;
                }
                id$2218 = ch$2216;
            } else {
                index$2064 = restore$2219;
                id$2218 = 'u';
            }
        } else {
            id$2218 = nextChar$2086();
        }
        while (index$2064 < length$2067) {
            ch$2216 = source$2062[index$2064];
            if (!isIdentifierPart$2081(ch$2216)) {
                break;
            }
            if (ch$2216 === '\\') {
                ++index$2064;
                if (source$2062[index$2064] !== 'u') {
                    return;
                }
                ++index$2064;
                restore$2219 = index$2064;
                ch$2216 = scanHexEscape$2089('u');
                if (ch$2216) {
                    if (ch$2216 === '\\' || !isIdentifierPart$2081(ch$2216)) {
                        return;
                    }
                    id$2218 += ch$2216;
                } else {
                    index$2064 = restore$2219;
                    id$2218 += 'u';
                }
            } else {
                id$2218 += nextChar$2086();
            }
        }
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$2218.length === 1) {
            return {
                type: Token$2056.Identifier,
                value: id$2218,
                lineNumber: lineNumber$2065,
                lineStart: lineStart$2066,
                range: [
                    start$2217,
                    index$2064
                ]
            };
        }
        if (isKeyword$2085(id$2218)) {
            return {
                type: Token$2056.Keyword,
                value: id$2218,
                lineNumber: lineNumber$2065,
                lineStart: lineStart$2066,
                range: [
                    start$2217,
                    index$2064
                ]
            };
        }
        // 7.8.1 Null Literals
        if (id$2218 === 'null') {
            return {
                type: Token$2056.NullLiteral,
                value: id$2218,
                lineNumber: lineNumber$2065,
                lineStart: lineStart$2066,
                range: [
                    start$2217,
                    index$2064
                ]
            };
        }
        // 7.8.2 Boolean Literals
        if (id$2218 === 'true' || id$2218 === 'false') {
            return {
                type: Token$2056.BooleanLiteral,
                value: id$2218,
                lineNumber: lineNumber$2065,
                lineStart: lineStart$2066,
                range: [
                    start$2217,
                    index$2064
                ]
            };
        }
        return {
            type: Token$2056.Identifier,
            value: id$2218,
            lineNumber: lineNumber$2065,
            lineStart: lineStart$2066,
            range: [
                start$2217,
                index$2064
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$2091() {
        var start$2220 = index$2064, ch1$2221 = source$2062[index$2064], ch2$2222, ch3$2223, ch4$2224;
        // Check for most common single-character punctuators.
        if (ch1$2221 === ';' || ch1$2221 === '{' || ch1$2221 === '}') {
            ++index$2064;
            return {
                type: Token$2056.Punctuator,
                value: ch1$2221,
                lineNumber: lineNumber$2065,
                lineStart: lineStart$2066,
                range: [
                    start$2220,
                    index$2064
                ]
            };
        }
        if (ch1$2221 === ',' || ch1$2221 === '(' || ch1$2221 === ')') {
            ++index$2064;
            return {
                type: Token$2056.Punctuator,
                value: ch1$2221,
                lineNumber: lineNumber$2065,
                lineStart: lineStart$2066,
                range: [
                    start$2220,
                    index$2064
                ]
            };
        }
        if (ch1$2221 === '#' || ch1$2221 === '@') {
            ++index$2064;
            return {
                type: Token$2056.Punctuator,
                value: ch1$2221,
                lineNumber: lineNumber$2065,
                lineStart: lineStart$2066,
                range: [
                    start$2220,
                    index$2064
                ]
            };
        }
        // Dot (.) can also start a floating-point number, hence the need
        // to check the next character.
        ch2$2222 = source$2062[index$2064 + 1];
        if (ch1$2221 === '.' && !isDecimalDigit$2075(ch2$2222)) {
            if (source$2062[index$2064 + 1] === '.' && source$2062[index$2064 + 2] === '.') {
                nextChar$2086();
                nextChar$2086();
                nextChar$2086();
                return {
                    type: Token$2056.Punctuator,
                    value: '...',
                    lineNumber: lineNumber$2065,
                    lineStart: lineStart$2066,
                    range: [
                        start$2220,
                        index$2064
                    ]
                };
            } else {
                return {
                    type: Token$2056.Punctuator,
                    value: nextChar$2086(),
                    lineNumber: lineNumber$2065,
                    lineStart: lineStart$2066,
                    range: [
                        start$2220,
                        index$2064
                    ]
                };
            }
        }
        // Peek more characters.
        ch3$2223 = source$2062[index$2064 + 2];
        ch4$2224 = source$2062[index$2064 + 3];
        // 4-character punctuator: >>>=
        if (ch1$2221 === '>' && ch2$2222 === '>' && ch3$2223 === '>') {
            if (ch4$2224 === '=') {
                index$2064 += 4;
                return {
                    type: Token$2056.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$2065,
                    lineStart: lineStart$2066,
                    range: [
                        start$2220,
                        index$2064
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$2221 === '=' && ch2$2222 === '=' && ch3$2223 === '=') {
            index$2064 += 3;
            return {
                type: Token$2056.Punctuator,
                value: '===',
                lineNumber: lineNumber$2065,
                lineStart: lineStart$2066,
                range: [
                    start$2220,
                    index$2064
                ]
            };
        }
        if (ch1$2221 === '!' && ch2$2222 === '=' && ch3$2223 === '=') {
            index$2064 += 3;
            return {
                type: Token$2056.Punctuator,
                value: '!==',
                lineNumber: lineNumber$2065,
                lineStart: lineStart$2066,
                range: [
                    start$2220,
                    index$2064
                ]
            };
        }
        if (ch1$2221 === '>' && ch2$2222 === '>' && ch3$2223 === '>') {
            index$2064 += 3;
            return {
                type: Token$2056.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$2065,
                lineStart: lineStart$2066,
                range: [
                    start$2220,
                    index$2064
                ]
            };
        }
        if (ch1$2221 === '<' && ch2$2222 === '<' && ch3$2223 === '=') {
            index$2064 += 3;
            return {
                type: Token$2056.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$2065,
                lineStart: lineStart$2066,
                range: [
                    start$2220,
                    index$2064
                ]
            };
        }
        if (ch1$2221 === '>' && ch2$2222 === '>' && ch3$2223 === '=') {
            index$2064 += 3;
            return {
                type: Token$2056.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$2065,
                lineStart: lineStart$2066,
                range: [
                    start$2220,
                    index$2064
                ]
            };
        }
        // 2-character punctuators: <= >= == != ++ -- << >> && ||
        // += -= *= %= &= |= ^= /=
        if (ch2$2222 === '=') {
            if ('<>=!+-*%&|^/'.indexOf(ch1$2221) >= 0) {
                index$2064 += 2;
                return {
                    type: Token$2056.Punctuator,
                    value: ch1$2221 + ch2$2222,
                    lineNumber: lineNumber$2065,
                    lineStart: lineStart$2066,
                    range: [
                        start$2220,
                        index$2064
                    ]
                };
            }
        }
        if (ch1$2221 === ch2$2222 && '+-<>&|'.indexOf(ch1$2221) >= 0) {
            if ('+-<>&|'.indexOf(ch2$2222) >= 0) {
                index$2064 += 2;
                return {
                    type: Token$2056.Punctuator,
                    value: ch1$2221 + ch2$2222,
                    lineNumber: lineNumber$2065,
                    lineStart: lineStart$2066,
                    range: [
                        start$2220,
                        index$2064
                    ]
                };
            }
        }
        // The remaining 1-character punctuators.
        if ('[]<>+-*%&|^!~?:=/'.indexOf(ch1$2221) >= 0) {
            return {
                type: Token$2056.Punctuator,
                value: nextChar$2086(),
                lineNumber: lineNumber$2065,
                lineStart: lineStart$2066,
                range: [
                    start$2220,
                    index$2064
                ]
            };
        }
    }
    // 7.8.3 Numeric Literals
    function scanNumericLiteral$2092() {
        var number$2225, start$2226, ch$2227;
        ch$2227 = source$2062[index$2064];
        assert$2072(isDecimalDigit$2075(ch$2227) || ch$2227 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$2226 = index$2064;
        number$2225 = '';
        if (ch$2227 !== '.') {
            number$2225 = nextChar$2086();
            ch$2227 = source$2062[index$2064];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            if (number$2225 === '0') {
                if (ch$2227 === 'x' || ch$2227 === 'X') {
                    number$2225 += nextChar$2086();
                    while (index$2064 < length$2067) {
                        ch$2227 = source$2062[index$2064];
                        if (!isHexDigit$2076(ch$2227)) {
                            break;
                        }
                        number$2225 += nextChar$2086();
                    }
                    if (number$2225.length <= 2) {
                        // only 0x
                        throwError$2100({}, Messages$2060.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$2064 < length$2067) {
                        ch$2227 = source$2062[index$2064];
                        if (isIdentifierStart$2080(ch$2227)) {
                            throwError$2100({}, Messages$2060.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$2056.NumericLiteral,
                        value: parseInt(number$2225, 16),
                        lineNumber: lineNumber$2065,
                        lineStart: lineStart$2066,
                        range: [
                            start$2226,
                            index$2064
                        ]
                    };
                } else if (isOctalDigit$2077(ch$2227)) {
                    number$2225 += nextChar$2086();
                    while (index$2064 < length$2067) {
                        ch$2227 = source$2062[index$2064];
                        if (!isOctalDigit$2077(ch$2227)) {
                            break;
                        }
                        number$2225 += nextChar$2086();
                    }
                    if (index$2064 < length$2067) {
                        ch$2227 = source$2062[index$2064];
                        if (isIdentifierStart$2080(ch$2227) || isDecimalDigit$2075(ch$2227)) {
                            throwError$2100({}, Messages$2060.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$2056.NumericLiteral,
                        value: parseInt(number$2225, 8),
                        octal: true,
                        lineNumber: lineNumber$2065,
                        lineStart: lineStart$2066,
                        range: [
                            start$2226,
                            index$2064
                        ]
                    };
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (isDecimalDigit$2075(ch$2227)) {
                    throwError$2100({}, Messages$2060.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (index$2064 < length$2067) {
                ch$2227 = source$2062[index$2064];
                if (!isDecimalDigit$2075(ch$2227)) {
                    break;
                }
                number$2225 += nextChar$2086();
            }
        }
        if (ch$2227 === '.') {
            number$2225 += nextChar$2086();
            while (index$2064 < length$2067) {
                ch$2227 = source$2062[index$2064];
                if (!isDecimalDigit$2075(ch$2227)) {
                    break;
                }
                number$2225 += nextChar$2086();
            }
        }
        if (ch$2227 === 'e' || ch$2227 === 'E') {
            number$2225 += nextChar$2086();
            ch$2227 = source$2062[index$2064];
            if (ch$2227 === '+' || ch$2227 === '-') {
                number$2225 += nextChar$2086();
            }
            ch$2227 = source$2062[index$2064];
            if (isDecimalDigit$2075(ch$2227)) {
                number$2225 += nextChar$2086();
                while (index$2064 < length$2067) {
                    ch$2227 = source$2062[index$2064];
                    if (!isDecimalDigit$2075(ch$2227)) {
                        break;
                    }
                    number$2225 += nextChar$2086();
                }
            } else {
                ch$2227 = 'character ' + ch$2227;
                if (index$2064 >= length$2067) {
                    ch$2227 = '<end>';
                }
                throwError$2100({}, Messages$2060.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (index$2064 < length$2067) {
            ch$2227 = source$2062[index$2064];
            if (isIdentifierStart$2080(ch$2227)) {
                throwError$2100({}, Messages$2060.UnexpectedToken, 'ILLEGAL');
            }
        }
        return {
            type: Token$2056.NumericLiteral,
            value: parseFloat(number$2225),
            lineNumber: lineNumber$2065,
            lineStart: lineStart$2066,
            range: [
                start$2226,
                index$2064
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$2093() {
        var str$2228 = '', quote$2229, start$2230, ch$2231, code$2232, unescaped$2233, restore$2234, octal$2235 = false;
        quote$2229 = source$2062[index$2064];
        assert$2072(quote$2229 === '\'' || quote$2229 === '"', 'String literal must starts with a quote');
        start$2230 = index$2064;
        ++index$2064;
        while (index$2064 < length$2067) {
            ch$2231 = nextChar$2086();
            if (ch$2231 === quote$2229) {
                quote$2229 = '';
                break;
            } else if (ch$2231 === '\\') {
                ch$2231 = nextChar$2086();
                if (!isLineTerminator$2079(ch$2231)) {
                    switch (ch$2231) {
                    case 'n':
                        str$2228 += '\n';
                        break;
                    case 'r':
                        str$2228 += '\r';
                        break;
                    case 't':
                        str$2228 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        restore$2234 = index$2064;
                        unescaped$2233 = scanHexEscape$2089(ch$2231);
                        if (unescaped$2233) {
                            str$2228 += unescaped$2233;
                        } else {
                            index$2064 = restore$2234;
                            str$2228 += ch$2231;
                        }
                        break;
                    case 'b':
                        str$2228 += '\b';
                        break;
                    case 'f':
                        str$2228 += '\f';
                        break;
                    case 'v':
                        str$2228 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$2077(ch$2231)) {
                            code$2232 = '01234567'.indexOf(ch$2231);
                            // \0 is not octal escape sequence
                            if (code$2232 !== 0) {
                                octal$2235 = true;
                            }
                            if (index$2064 < length$2067 && isOctalDigit$2077(source$2062[index$2064])) {
                                octal$2235 = true;
                                code$2232 = code$2232 * 8 + '01234567'.indexOf(nextChar$2086());
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$2231) >= 0 && index$2064 < length$2067 && isOctalDigit$2077(source$2062[index$2064])) {
                                    code$2232 = code$2232 * 8 + '01234567'.indexOf(nextChar$2086());
                                }
                            }
                            str$2228 += String.fromCharCode(code$2232);
                        } else {
                            str$2228 += ch$2231;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$2065;
                    if (ch$2231 === '\r' && source$2062[index$2064] === '\n') {
                        ++index$2064;
                    }
                }
            } else if (isLineTerminator$2079(ch$2231)) {
                break;
            } else {
                str$2228 += ch$2231;
            }
        }
        if (quote$2229 !== '') {
            throwError$2100({}, Messages$2060.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$2056.StringLiteral,
            value: str$2228,
            octal: octal$2235,
            lineNumber: lineNumber$2065,
            lineStart: lineStart$2066,
            range: [
                start$2230,
                index$2064
            ]
        };
    }
    function scanRegExp$2094() {
        var str$2236 = '', ch$2237, start$2238, pattern$2239, flags$2240, value$2241, classMarker$2242 = false, restore$2243;
        buffer$2068 = null;
        skipComment$2088();
        start$2238 = index$2064;
        ch$2237 = source$2062[index$2064];
        assert$2072(ch$2237 === '/', 'Regular expression literal must start with a slash');
        str$2236 = nextChar$2086();
        while (index$2064 < length$2067) {
            ch$2237 = nextChar$2086();
            str$2236 += ch$2237;
            if (classMarker$2242) {
                if (ch$2237 === ']') {
                    classMarker$2242 = false;
                }
            } else {
                if (ch$2237 === '\\') {
                    ch$2237 = nextChar$2086();
                    // ECMA-262 7.8.5
                    if (isLineTerminator$2079(ch$2237)) {
                        throwError$2100({}, Messages$2060.UnterminatedRegExp);
                    }
                    str$2236 += ch$2237;
                } else if (ch$2237 === '/') {
                    break;
                } else if (ch$2237 === '[') {
                    classMarker$2242 = true;
                } else if (isLineTerminator$2079(ch$2237)) {
                    throwError$2100({}, Messages$2060.UnterminatedRegExp);
                }
            }
        }
        if (str$2236.length === 1) {
            throwError$2100({}, Messages$2060.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$2239 = str$2236.substr(1, str$2236.length - 2);
        flags$2240 = '';
        while (index$2064 < length$2067) {
            ch$2237 = source$2062[index$2064];
            if (!isIdentifierPart$2081(ch$2237)) {
                break;
            }
            ++index$2064;
            if (ch$2237 === '\\' && index$2064 < length$2067) {
                ch$2237 = source$2062[index$2064];
                if (ch$2237 === 'u') {
                    ++index$2064;
                    restore$2243 = index$2064;
                    ch$2237 = scanHexEscape$2089('u');
                    if (ch$2237) {
                        flags$2240 += ch$2237;
                        str$2236 += '\\u';
                        for (; restore$2243 < index$2064; ++restore$2243) {
                            str$2236 += source$2062[restore$2243];
                        }
                    } else {
                        index$2064 = restore$2243;
                        flags$2240 += 'u';
                        str$2236 += '\\u';
                    }
                } else {
                    str$2236 += '\\';
                }
            } else {
                flags$2240 += ch$2237;
                str$2236 += ch$2237;
            }
        }
        try {
            value$2241 = new RegExp(pattern$2239, flags$2240);
        } catch (e$2244) {
            throwError$2100({}, Messages$2060.InvalidRegExp);
        }
        return {
            type: Token$2056.RegexLiteral,
            literal: str$2236,
            value: value$2241,
            lineNumber: lineNumber$2065,
            lineStart: lineStart$2066,
            range: [
                start$2238,
                index$2064
            ]
        };
    }
    function isIdentifierName$2095(token$2245) {
        return token$2245.type === Token$2056.Identifier || token$2245.type === Token$2056.Keyword || token$2245.type === Token$2056.BooleanLiteral || token$2245.type === Token$2056.NullLiteral;
    }
    // only used by the reader
    function advance$2096() {
        var ch$2246, token$2247;
        skipComment$2088();
        if (index$2064 >= length$2067) {
            return {
                type: Token$2056.EOF,
                lineNumber: lineNumber$2065,
                lineStart: lineStart$2066,
                range: [
                    index$2064,
                    index$2064
                ]
            };
        }
        ch$2246 = source$2062[index$2064];
        token$2247 = scanPunctuator$2091();
        if (typeof token$2247 !== 'undefined') {
            return token$2247;
        }
        if (ch$2246 === '\'' || ch$2246 === '"') {
            return scanStringLiteral$2093();
        }
        if (ch$2246 === '.' || isDecimalDigit$2075(ch$2246)) {
            return scanNumericLiteral$2092();
        }
        token$2247 = scanIdentifier$2090();
        if (typeof token$2247 !== 'undefined') {
            return token$2247;
        }
        throwError$2100({}, Messages$2060.UnexpectedToken, 'ILLEGAL');
    }
    function lex$2097() {
        var token$2248;
        if (buffer$2068) {
            token$2248 = buffer$2068;
            buffer$2068 = null;
            index$2064++;
            return token$2248;
        }
        buffer$2068 = null;
        return tokenStream$2070[index$2064++];
    }
    function lookahead$2098() {
        var pos$2249, line$2250, start$2251;
        if (buffer$2068 !== null) {
            return buffer$2068;
        }
        buffer$2068 = tokenStream$2070[index$2064];
        return buffer$2068;
    }
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$2099() {
        var pos$2252, line$2253, start$2254, found$2255;
        found$2255 = tokenStream$2070[index$2064 - 1].token.lineNumber !== tokenStream$2070[index$2064].token.lineNumber;
        return found$2255;
    }
    // Throw an exception
    function throwError$2100(token$2256, messageFormat$2257) {
        var error$2258, args$2259 = Array.prototype.slice.call(arguments, 2), msg$2260 = messageFormat$2257.replace(/%(\d)/g, function (whole$2261, index$2262) {
                return args$2259[index$2262] || '';
            });
        if (typeof token$2256.lineNumber === 'number') {
            error$2258 = new Error('Line ' + token$2256.lineNumber + ': ' + msg$2260);
            error$2258.lineNumber = token$2256.lineNumber;
            if (token$2256.range && token$2256.range.length > 0) {
                error$2258.index = token$2256.range[0];
                error$2258.column = token$2256.range[0] - lineStart$2066 + 1;
            }
        } else {
            error$2258 = new Error('Line ' + lineNumber$2065 + ': ' + msg$2260);
            error$2258.index = index$2064;
            error$2258.lineNumber = lineNumber$2065;
            error$2258.column = index$2064 - lineStart$2066 + 1;
        }
        throw error$2258;
    }
    function throwErrorTolerant$2101() {
        var error$2263;
        try {
            throwError$2100.apply(null, arguments);
        } catch (e$2264) {
            if (extra$2071.errors) {
                extra$2071.errors.push(e$2264);
            } else {
                throw e$2264;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$2102(token$2265) {
        var s$2266;
        if (token$2265.type === Token$2056.EOF) {
            throwError$2100(token$2265, Messages$2060.UnexpectedEOS);
        }
        if (token$2265.type === Token$2056.NumericLiteral) {
            throwError$2100(token$2265, Messages$2060.UnexpectedNumber);
        }
        if (token$2265.type === Token$2056.StringLiteral) {
            throwError$2100(token$2265, Messages$2060.UnexpectedString);
        }
        if (token$2265.type === Token$2056.Identifier) {
            console.log(token$2265);
            throwError$2100(token$2265, Messages$2060.UnexpectedIdentifier);
        }
        if (token$2265.type === Token$2056.Keyword) {
            if (isFutureReservedWord$2082(token$2265.value)) {
                throwError$2100(token$2265, Messages$2060.UnexpectedReserved);
            } else if (strict$2063 && isStrictModeReservedWord$2083(token$2265.value)) {
                throwError$2100(token$2265, Messages$2060.StrictReservedWord);
            }
            throwError$2100(token$2265, Messages$2060.UnexpectedToken, token$2265.value);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$2100(token$2265, Messages$2060.UnexpectedToken, token$2265.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$2103(value$2267) {
        var token$2268 = lex$2097().token;
        if (token$2268.type !== Token$2056.Punctuator || token$2268.value !== value$2267) {
            throwUnexpected$2102(token$2268);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$2104(keyword$2269) {
        var token$2270 = lex$2097().token;
        if (token$2270.type !== Token$2056.Keyword || token$2270.value !== keyword$2269) {
            throwUnexpected$2102(token$2270);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$2105(value$2271) {
        var token$2272 = lookahead$2098().token;
        return token$2272.type === Token$2056.Punctuator && token$2272.value === value$2271;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$2106(keyword$2273) {
        var token$2274 = lookahead$2098().token;
        return token$2274.type === Token$2056.Keyword && token$2274.value === keyword$2273;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$2107() {
        var token$2275 = lookahead$2098().token, op$2276 = token$2275.value;
        if (token$2275.type !== Token$2056.Punctuator) {
            return false;
        }
        return op$2276 === '=' || op$2276 === '*=' || op$2276 === '/=' || op$2276 === '%=' || op$2276 === '+=' || op$2276 === '-=' || op$2276 === '<<=' || op$2276 === '>>=' || op$2276 === '>>>=' || op$2276 === '&=' || op$2276 === '^=' || op$2276 === '|=';
    }
    function consumeSemicolon$2108() {
        var token$2277, line$2278;
        if (tokenStream$2070[index$2064].token.value === ';') {
            lex$2097().token;
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
        line$2278 = tokenStream$2070[index$2064 - 1].token.lineNumber;
        token$2277 = tokenStream$2070[index$2064].token;
        if (line$2278 !== token$2277.lineNumber) {
            return;
        }
        if (token$2277.type !== Token$2056.EOF && !match$2105('}')) {
            throwUnexpected$2102(token$2277);
        }
        return;
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$2109(expr$2279) {
        return expr$2279.type === Syntax$2058.Identifier || expr$2279.type === Syntax$2058.MemberExpression;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$2110() {
        var elements$2280 = [], undef$2281;
        expect$2103('[');
        while (!match$2105(']')) {
            if (match$2105(',')) {
                lex$2097().token;
                elements$2280.push(undef$2281);
            } else {
                elements$2280.push(parseAssignmentExpression$2139());
                if (!match$2105(']')) {
                    expect$2103(',');
                }
            }
        }
        expect$2103(']');
        return {
            type: Syntax$2058.ArrayExpression,
            elements: elements$2280
        };
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$2111(param$2282, first$2283) {
        var previousStrict$2284, body$2285;
        previousStrict$2284 = strict$2063;
        body$2285 = parseFunctionSourceElements$2166();
        if (first$2283 && strict$2063 && isRestrictedWord$2084(param$2282[0].name)) {
            throwError$2100(first$2283, Messages$2060.StrictParamName);
        }
        strict$2063 = previousStrict$2284;
        return {
            type: Syntax$2058.FunctionExpression,
            id: null,
            params: param$2282,
            body: body$2285
        };
    }
    function parseObjectPropertyKey$2112() {
        var token$2286 = lex$2097().token;
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$2286.type === Token$2056.StringLiteral || token$2286.type === Token$2056.NumericLiteral) {
            if (strict$2063 && token$2286.octal) {
                throwError$2100(token$2286, Messages$2060.StrictOctalLiteral);
            }
            return createLiteral$2176(token$2286);
        }
        return {
            type: Syntax$2058.Identifier,
            name: token$2286.value
        };
    }
    function parseObjectProperty$2113() {
        var token$2287, key$2288, id$2289, param$2290;
        token$2287 = lookahead$2098().token;
        if (token$2287.type === Token$2056.Identifier) {
            id$2289 = parseObjectPropertyKey$2112();
            // Property Assignment: Getter and Setter.
            if (token$2287.value === 'get' && !match$2105(':')) {
                key$2288 = parseObjectPropertyKey$2112();
                expect$2103('(');
                expect$2103(')');
                return {
                    type: Syntax$2058.Property,
                    key: key$2288,
                    value: parsePropertyFunction$2111([]),
                    kind: 'get'
                };
            } else if (token$2287.value === 'set' && !match$2105(':')) {
                key$2288 = parseObjectPropertyKey$2112();
                expect$2103('(');
                token$2287 = lookahead$2098().token;
                if (token$2287.type !== Token$2056.Identifier) {
                    throwUnexpected$2102(lex$2097().token);
                }
                param$2290 = [parseVariableIdentifier$2143()];
                expect$2103(')');
                return {
                    type: Syntax$2058.Property,
                    key: key$2288,
                    value: parsePropertyFunction$2111(param$2290, token$2287),
                    kind: 'set'
                };
            } else {
                expect$2103(':');
                return {
                    type: Syntax$2058.Property,
                    key: id$2289,
                    value: parseAssignmentExpression$2139(),
                    kind: 'init'
                };
            }
        } else if (token$2287.type === Token$2056.EOF || token$2287.type === Token$2056.Punctuator) {
            throwUnexpected$2102(token$2287);
        } else {
            key$2288 = parseObjectPropertyKey$2112();
            expect$2103(':');
            return {
                type: Syntax$2058.Property,
                key: key$2288,
                value: parseAssignmentExpression$2139(),
                kind: 'init'
            };
        }
    }
    function parseObjectInitialiser$2114() {
        var token$2291, properties$2292 = [], property$2293, name$2294, kind$2295, map$2296 = {}, toString$2297 = String;
        expect$2103('{');
        while (!match$2105('}')) {
            property$2293 = parseObjectProperty$2113();
            if (property$2293.key.type === Syntax$2058.Identifier) {
                name$2294 = property$2293.key.name;
            } else {
                name$2294 = toString$2297(property$2293.key.value);
            }
            kind$2295 = property$2293.kind === 'init' ? PropertyKind$2059.Data : property$2293.kind === 'get' ? PropertyKind$2059.Get : PropertyKind$2059.Set;
            if (Object.prototype.hasOwnProperty.call(map$2296, name$2294)) {
                if (map$2296[name$2294] === PropertyKind$2059.Data) {
                    if (strict$2063 && kind$2295 === PropertyKind$2059.Data) {
                        throwErrorTolerant$2101({}, Messages$2060.StrictDuplicateProperty);
                    } else if (kind$2295 !== PropertyKind$2059.Data) {
                        throwError$2100({}, Messages$2060.AccessorDataProperty);
                    }
                } else {
                    if (kind$2295 === PropertyKind$2059.Data) {
                        throwError$2100({}, Messages$2060.AccessorDataProperty);
                    } else if (map$2296[name$2294] & kind$2295) {
                        throwError$2100({}, Messages$2060.AccessorGetSet);
                    }
                }
                map$2296[name$2294] |= kind$2295;
            } else {
                map$2296[name$2294] = kind$2295;
            }
            properties$2292.push(property$2293);
            if (!match$2105('}')) {
                expect$2103(',');
            }
        }
        expect$2103('}');
        return {
            type: Syntax$2058.ObjectExpression,
            properties: properties$2292
        };
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$2115() {
        var expr$2298, token$2299 = lookahead$2098().token, type$2300 = token$2299.type;
        if (type$2300 === Token$2056.Identifier) {
            var name$2301 = expander$2055.resolve(lex$2097());
            return {
                type: Syntax$2058.Identifier,
                name: name$2301
            };
        }
        if (type$2300 === Token$2056.StringLiteral || type$2300 === Token$2056.NumericLiteral) {
            if (strict$2063 && token$2299.octal) {
                throwErrorTolerant$2101(token$2299, Messages$2060.StrictOctalLiteral);
            }
            return createLiteral$2176(lex$2097().token);
        }
        if (type$2300 === Token$2056.Keyword) {
            if (matchKeyword$2106('this')) {
                lex$2097().token;
                return { type: Syntax$2058.ThisExpression };
            }
            if (matchKeyword$2106('function')) {
                return parseFunctionExpression$2168();
            }
        }
        if (type$2300 === Token$2056.BooleanLiteral) {
            lex$2097();
            token$2299.value = token$2299.value === 'true';
            return createLiteral$2176(token$2299);
        }
        if (type$2300 === Token$2056.NullLiteral) {
            lex$2097();
            token$2299.value = null;
            return createLiteral$2176(token$2299);
        }
        if (match$2105('[')) {
            return parseArrayInitialiser$2110();
        }
        if (match$2105('{')) {
            return parseObjectInitialiser$2114();
        }
        if (match$2105('(')) {
            lex$2097();
            state$2069.lastParenthesized = expr$2298 = parseExpression$2140();
            expect$2103(')');
            return expr$2298;
        }
        if (token$2299.value instanceof RegExp) {
            return createLiteral$2176(lex$2097().token);
        }
        return throwUnexpected$2102(lex$2097().token);
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$2116() {
        var args$2302 = [];
        expect$2103('(');
        if (!match$2105(')')) {
            while (index$2064 < length$2067) {
                args$2302.push(parseAssignmentExpression$2139());
                if (match$2105(')')) {
                    break;
                }
                expect$2103(',');
            }
        }
        expect$2103(')');
        return args$2302;
    }
    function parseNonComputedProperty$2117() {
        var token$2303 = lex$2097().token;
        if (!isIdentifierName$2095(token$2303)) {
            throwUnexpected$2102(token$2303);
        }
        return {
            type: Syntax$2058.Identifier,
            name: token$2303.value
        };
    }
    function parseNonComputedMember$2118(object$2304) {
        return {
            type: Syntax$2058.MemberExpression,
            computed: false,
            object: object$2304,
            property: parseNonComputedProperty$2117()
        };
    }
    function parseComputedMember$2119(object$2305) {
        var property$2306, expr$2307;
        expect$2103('[');
        property$2306 = parseExpression$2140();
        expr$2307 = {
            type: Syntax$2058.MemberExpression,
            computed: true,
            object: object$2305,
            property: property$2306
        };
        expect$2103(']');
        return expr$2307;
    }
    function parseCallMember$2120(object$2308) {
        return {
            type: Syntax$2058.CallExpression,
            callee: object$2308,
            'arguments': parseArguments$2116()
        };
    }
    function parseNewExpression$2121() {
        var expr$2309;
        expectKeyword$2104('new');
        expr$2309 = {
            type: Syntax$2058.NewExpression,
            callee: parseLeftHandSideExpression$2125(),
            'arguments': []
        };
        if (match$2105('(')) {
            expr$2309['arguments'] = parseArguments$2116();
        }
        return expr$2309;
    }
    // sort of broken, only accepts literals
    // pretty sure the use of toString will bite me
    function toArrayNode$2122(arr$2310) {
        var els$2311 = arr$2310.map(function (el$2312) {
                return {
                    type: 'Literal',
                    value: el$2312,
                    raw: el$2312.toString()
                };
            });
        return {
            type: 'ArrayExpression',
            elements: els$2311
        };
    }
    function toObjectNode$2123(obj$2313) {
        // todo: hacky, fixup
        var props$2314 = Object.keys(obj$2313).map(function (key$2315) {
                var raw$2316 = obj$2313[key$2315];
                var value$2317;
                if (Array.isArray(raw$2316)) {
                    value$2317 = toArrayNode$2122(raw$2316);
                } else {
                    value$2317 = {
                        type: 'Literal',
                        value: obj$2313[key$2315],
                        raw: obj$2313[key$2315].toString()
                    };
                }
                return {
                    type: 'Property',
                    key: {
                        type: 'Identifier',
                        name: key$2315
                    },
                    value: value$2317,
                    kind: 'init'
                };
            });
        return {
            type: 'ObjectExpression',
            properties: props$2314
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
    function parseLeftHandSideExpressionAllowCall$2124() {
        var useNew$2318, expr$2319;
        useNew$2318 = matchKeyword$2106('new');
        expr$2319 = useNew$2318 ? parseNewExpression$2121() : parsePrimaryExpression$2115();
        // handle "syntax" primitive
        // todo: error handling
        // if(expr.name === "syntax") {
        //     return parseSyntaxObject();
        // }
        while (index$2064 < length$2067) {
            if (match$2105('.')) {
                lex$2097();
                expr$2319 = parseNonComputedMember$2118(expr$2319);
            } else if (match$2105('[')) {
                expr$2319 = parseComputedMember$2119(expr$2319);
            } else if (match$2105('(')) {
                expr$2319 = parseCallMember$2120(expr$2319);
            } else {
                break;
            }
        }
        return expr$2319;
    }
    function parseLeftHandSideExpression$2125() {
        var useNew$2320, expr$2321;
        useNew$2320 = matchKeyword$2106('new');
        expr$2321 = useNew$2320 ? parseNewExpression$2121() : parsePrimaryExpression$2115();
        while (index$2064 < length$2067) {
            if (match$2105('.')) {
                lex$2097();
                expr$2321 = parseNonComputedMember$2118(expr$2321);
            } else if (match$2105('[')) {
                expr$2321 = parseComputedMember$2119(expr$2321);
            } else {
                break;
            }
        }
        return expr$2321;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$2126() {
        var expr$2322 = parseLeftHandSideExpressionAllowCall$2124();
        if ((match$2105('++') || match$2105('--')) && !peekLineTerminator$2099()) {
            // 11.3.1, 11.3.2
            if (strict$2063 && expr$2322.type === Syntax$2058.Identifier && isRestrictedWord$2084(expr$2322.name)) {
                throwError$2100({}, Messages$2060.StrictLHSPostfix);
            }
            if (!isLeftHandSide$2109(expr$2322)) {
                throwError$2100({}, Messages$2060.InvalidLHSInAssignment);
            }
            expr$2322 = {
                type: Syntax$2058.UpdateExpression,
                operator: lex$2097().token.value,
                argument: expr$2322,
                prefix: false
            };
        }
        return expr$2322;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$2127() {
        var token$2323, expr$2324;
        if (match$2105('++') || match$2105('--')) {
            token$2323 = lex$2097().token;
            expr$2324 = parseUnaryExpression$2127();
            // 11.4.4, 11.4.5
            if (strict$2063 && expr$2324.type === Syntax$2058.Identifier && isRestrictedWord$2084(expr$2324.name)) {
                throwError$2100({}, Messages$2060.StrictLHSPrefix);
            }
            if (!isLeftHandSide$2109(expr$2324)) {
                throwError$2100({}, Messages$2060.InvalidLHSInAssignment);
            }
            expr$2324 = {
                type: Syntax$2058.UpdateExpression,
                operator: token$2323.value,
                argument: expr$2324,
                prefix: true
            };
            return expr$2324;
        }
        if (match$2105('+') || match$2105('-') || match$2105('~') || match$2105('!')) {
            expr$2324 = {
                type: Syntax$2058.UnaryExpression,
                operator: lex$2097().token.value,
                argument: parseUnaryExpression$2127()
            };
            return expr$2324;
        }
        if (matchKeyword$2106('delete') || matchKeyword$2106('void') || matchKeyword$2106('typeof')) {
            expr$2324 = {
                type: Syntax$2058.UnaryExpression,
                operator: lex$2097().token.value,
                argument: parseUnaryExpression$2127()
            };
            if (strict$2063 && expr$2324.operator === 'delete' && expr$2324.argument.type === Syntax$2058.Identifier) {
                throwErrorTolerant$2101({}, Messages$2060.StrictDelete);
            }
            return expr$2324;
        }
        return parsePostfixExpression$2126();
    }
    // 11.5 Multiplicative Operators
    function parseMultiplicativeExpression$2128() {
        var expr$2325 = parseUnaryExpression$2127();
        while (match$2105('*') || match$2105('/') || match$2105('%')) {
            expr$2325 = {
                type: Syntax$2058.BinaryExpression,
                operator: lex$2097().token.value,
                left: expr$2325,
                right: parseUnaryExpression$2127()
            };
        }
        return expr$2325;
    }
    // 11.6 Additive Operators
    function parseAdditiveExpression$2129() {
        var expr$2326 = parseMultiplicativeExpression$2128();
        while (match$2105('+') || match$2105('-')) {
            expr$2326 = {
                type: Syntax$2058.BinaryExpression,
                operator: lex$2097().token.value,
                left: expr$2326,
                right: parseMultiplicativeExpression$2128()
            };
        }
        return expr$2326;
    }
    // 11.7 Bitwise Shift Operators
    function parseShiftExpression$2130() {
        var expr$2327 = parseAdditiveExpression$2129();
        while (match$2105('<<') || match$2105('>>') || match$2105('>>>')) {
            expr$2327 = {
                type: Syntax$2058.BinaryExpression,
                operator: lex$2097().token.value,
                left: expr$2327,
                right: parseAdditiveExpression$2129()
            };
        }
        return expr$2327;
    }
    // 11.8 Relational Operators
    function parseRelationalExpression$2131() {
        var expr$2328, previousAllowIn$2329;
        previousAllowIn$2329 = state$2069.allowIn;
        state$2069.allowIn = true;
        expr$2328 = parseShiftExpression$2130();
        while (match$2105('<') || match$2105('>') || match$2105('<=') || match$2105('>=') || previousAllowIn$2329 && matchKeyword$2106('in') || matchKeyword$2106('instanceof')) {
            expr$2328 = {
                type: Syntax$2058.BinaryExpression,
                operator: lex$2097().token.value,
                left: expr$2328,
                right: parseRelationalExpression$2131()
            };
        }
        state$2069.allowIn = previousAllowIn$2329;
        return expr$2328;
    }
    // 11.9 Equality Operators
    function parseEqualityExpression$2132() {
        var expr$2330 = parseRelationalExpression$2131();
        while (match$2105('==') || match$2105('!=') || match$2105('===') || match$2105('!==')) {
            expr$2330 = {
                type: Syntax$2058.BinaryExpression,
                operator: lex$2097().token.value,
                left: expr$2330,
                right: parseRelationalExpression$2131()
            };
        }
        return expr$2330;
    }
    // 11.10 Binary Bitwise Operators
    function parseBitwiseANDExpression$2133() {
        var expr$2331 = parseEqualityExpression$2132();
        while (match$2105('&')) {
            lex$2097();
            expr$2331 = {
                type: Syntax$2058.BinaryExpression,
                operator: '&',
                left: expr$2331,
                right: parseEqualityExpression$2132()
            };
        }
        return expr$2331;
    }
    function parseBitwiseXORExpression$2134() {
        var expr$2332 = parseBitwiseANDExpression$2133();
        while (match$2105('^')) {
            lex$2097();
            expr$2332 = {
                type: Syntax$2058.BinaryExpression,
                operator: '^',
                left: expr$2332,
                right: parseBitwiseANDExpression$2133()
            };
        }
        return expr$2332;
    }
    function parseBitwiseORExpression$2135() {
        var expr$2333 = parseBitwiseXORExpression$2134();
        while (match$2105('|')) {
            lex$2097();
            expr$2333 = {
                type: Syntax$2058.BinaryExpression,
                operator: '|',
                left: expr$2333,
                right: parseBitwiseXORExpression$2134()
            };
        }
        return expr$2333;
    }
    // 11.11 Binary Logical Operators
    function parseLogicalANDExpression$2136() {
        var expr$2334 = parseBitwiseORExpression$2135();
        while (match$2105('&&')) {
            lex$2097();
            expr$2334 = {
                type: Syntax$2058.LogicalExpression,
                operator: '&&',
                left: expr$2334,
                right: parseBitwiseORExpression$2135()
            };
        }
        return expr$2334;
    }
    function parseLogicalORExpression$2137() {
        var expr$2335 = parseLogicalANDExpression$2136();
        while (match$2105('||')) {
            lex$2097();
            expr$2335 = {
                type: Syntax$2058.LogicalExpression,
                operator: '||',
                left: expr$2335,
                right: parseLogicalANDExpression$2136()
            };
        }
        return expr$2335;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$2138() {
        var expr$2336, previousAllowIn$2337, consequent$2338;
        expr$2336 = parseLogicalORExpression$2137();
        if (match$2105('?')) {
            lex$2097();
            previousAllowIn$2337 = state$2069.allowIn;
            state$2069.allowIn = true;
            consequent$2338 = parseAssignmentExpression$2139();
            state$2069.allowIn = previousAllowIn$2337;
            expect$2103(':');
            expr$2336 = {
                type: Syntax$2058.ConditionalExpression,
                test: expr$2336,
                consequent: consequent$2338,
                alternate: parseAssignmentExpression$2139()
            };
        }
        return expr$2336;
    }
    // 11.13 Assignment Operators
    function parseAssignmentExpression$2139() {
        var expr$2339;
        expr$2339 = parseConditionalExpression$2138();
        if (matchAssign$2107()) {
            // LeftHandSideExpression
            if (!isLeftHandSide$2109(expr$2339)) {
                throwError$2100({}, Messages$2060.InvalidLHSInAssignment);
            }
            // 11.13.1
            if (strict$2063 && expr$2339.type === Syntax$2058.Identifier && isRestrictedWord$2084(expr$2339.name)) {
                throwError$2100({}, Messages$2060.StrictLHSAssignment);
            }
            expr$2339 = {
                type: Syntax$2058.AssignmentExpression,
                operator: lex$2097().token.value,
                left: expr$2339,
                right: parseAssignmentExpression$2139()
            };
        }
        return expr$2339;
    }
    // 11.14 Comma Operator
    function parseExpression$2140() {
        var expr$2340 = parseAssignmentExpression$2139();
        if (match$2105(',')) {
            expr$2340 = {
                type: Syntax$2058.SequenceExpression,
                expressions: [expr$2340]
            };
            while (index$2064 < length$2067) {
                if (!match$2105(',')) {
                    break;
                }
                lex$2097();
                expr$2340.expressions.push(parseAssignmentExpression$2139());
            }
        }
        return expr$2340;
    }
    // 12.1 Block
    function parseStatementList$2141() {
        var list$2341 = [], statement$2342;
        while (index$2064 < length$2067) {
            if (match$2105('}')) {
                break;
            }
            statement$2342 = parseSourceElement$2169();
            if (typeof statement$2342 === 'undefined') {
                break;
            }
            list$2341.push(statement$2342);
        }
        return list$2341;
    }
    function parseBlock$2142() {
        var block$2343;
        expect$2103('{');
        block$2343 = parseStatementList$2141();
        expect$2103('}');
        return {
            type: Syntax$2058.BlockStatement,
            body: block$2343
        };
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$2143() {
        var stx$2344 = lex$2097(), token$2345 = stx$2344.token;
        if (token$2345.type !== Token$2056.Identifier) {
            throwUnexpected$2102(token$2345);
        }
        var name$2346 = expander$2055.resolve(stx$2344);
        return {
            type: Syntax$2058.Identifier,
            name: name$2346
        };
    }
    function parseVariableDeclaration$2144(kind$2347) {
        var id$2348 = parseVariableIdentifier$2143(), init$2349 = null;
        // 12.2.1
        if (strict$2063 && isRestrictedWord$2084(id$2348.name)) {
            throwErrorTolerant$2101({}, Messages$2060.StrictVarName);
        }
        if (kind$2347 === 'const') {
            expect$2103('=');
            init$2349 = parseAssignmentExpression$2139();
        } else if (match$2105('=')) {
            lex$2097();
            init$2349 = parseAssignmentExpression$2139();
        }
        return {
            type: Syntax$2058.VariableDeclarator,
            id: id$2348,
            init: init$2349
        };
    }
    function parseVariableDeclarationList$2145(kind$2350) {
        var list$2351 = [];
        while (index$2064 < length$2067) {
            list$2351.push(parseVariableDeclaration$2144(kind$2350));
            if (!match$2105(',')) {
                break;
            }
            lex$2097();
        }
        return list$2351;
    }
    function parseVariableStatement$2146() {
        var declarations$2352;
        expectKeyword$2104('var');
        declarations$2352 = parseVariableDeclarationList$2145();
        consumeSemicolon$2108();
        return {
            type: Syntax$2058.VariableDeclaration,
            declarations: declarations$2352,
            kind: 'var'
        };
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$2147(kind$2353) {
        var declarations$2354;
        expectKeyword$2104(kind$2353);
        declarations$2354 = parseVariableDeclarationList$2145(kind$2353);
        consumeSemicolon$2108();
        return {
            type: Syntax$2058.VariableDeclaration,
            declarations: declarations$2354,
            kind: kind$2353
        };
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$2148() {
        expect$2103(';');
        return { type: Syntax$2058.EmptyStatement };
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$2149() {
        var expr$2355 = parseExpression$2140();
        consumeSemicolon$2108();
        return {
            type: Syntax$2058.ExpressionStatement,
            expression: expr$2355
        };
    }
    // 12.5 If statement
    function parseIfStatement$2150() {
        var test$2356, consequent$2357, alternate$2358;
        expectKeyword$2104('if');
        expect$2103('(');
        test$2356 = parseExpression$2140();
        expect$2103(')');
        consequent$2357 = parseStatement$2165();
        if (matchKeyword$2106('else')) {
            lex$2097();
            alternate$2358 = parseStatement$2165();
        } else {
            alternate$2358 = null;
        }
        return {
            type: Syntax$2058.IfStatement,
            test: test$2356,
            consequent: consequent$2357,
            alternate: alternate$2358
        };
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$2151() {
        var body$2359, test$2360, oldInIteration$2361;
        expectKeyword$2104('do');
        oldInIteration$2361 = state$2069.inIteration;
        state$2069.inIteration = true;
        body$2359 = parseStatement$2165();
        state$2069.inIteration = oldInIteration$2361;
        expectKeyword$2104('while');
        expect$2103('(');
        test$2360 = parseExpression$2140();
        expect$2103(')');
        if (match$2105(';')) {
            lex$2097();
        }
        return {
            type: Syntax$2058.DoWhileStatement,
            body: body$2359,
            test: test$2360
        };
    }
    function parseWhileStatement$2152() {
        var test$2362, body$2363, oldInIteration$2364;
        expectKeyword$2104('while');
        expect$2103('(');
        test$2362 = parseExpression$2140();
        expect$2103(')');
        oldInIteration$2364 = state$2069.inIteration;
        state$2069.inIteration = true;
        body$2363 = parseStatement$2165();
        state$2069.inIteration = oldInIteration$2364;
        return {
            type: Syntax$2058.WhileStatement,
            test: test$2362,
            body: body$2363
        };
    }
    function parseForVariableDeclaration$2153() {
        var token$2365 = lex$2097().token;
        return {
            type: Syntax$2058.VariableDeclaration,
            declarations: parseVariableDeclarationList$2145(),
            kind: token$2365.value
        };
    }
    function parseForStatement$2154() {
        var init$2366, test$2367, update$2368, left$2369, right$2370, body$2371, oldInIteration$2372;
        init$2366 = test$2367 = update$2368 = null;
        expectKeyword$2104('for');
        expect$2103('(');
        if (match$2105(';')) {
            lex$2097();
        } else {
            if (matchKeyword$2106('var') || matchKeyword$2106('let')) {
                state$2069.allowIn = false;
                init$2366 = parseForVariableDeclaration$2153();
                state$2069.allowIn = true;
                if (init$2366.declarations.length === 1 && matchKeyword$2106('in')) {
                    lex$2097();
                    left$2369 = init$2366;
                    right$2370 = parseExpression$2140();
                    init$2366 = null;
                }
            } else {
                state$2069.allowIn = false;
                init$2366 = parseExpression$2140();
                state$2069.allowIn = true;
                if (matchKeyword$2106('in')) {
                    // LeftHandSideExpression
                    if (!isLeftHandSide$2109(init$2366)) {
                        throwError$2100({}, Messages$2060.InvalidLHSInForIn);
                    }
                    lex$2097();
                    left$2369 = init$2366;
                    right$2370 = parseExpression$2140();
                    init$2366 = null;
                }
            }
            if (typeof left$2369 === 'undefined') {
                expect$2103(';');
            }
        }
        if (typeof left$2369 === 'undefined') {
            if (!match$2105(';')) {
                test$2367 = parseExpression$2140();
            }
            expect$2103(';');
            if (!match$2105(')')) {
                update$2368 = parseExpression$2140();
            }
        }
        expect$2103(')');
        oldInIteration$2372 = state$2069.inIteration;
        state$2069.inIteration = true;
        body$2371 = parseStatement$2165();
        state$2069.inIteration = oldInIteration$2372;
        if (typeof left$2369 === 'undefined') {
            return {
                type: Syntax$2058.ForStatement,
                init: init$2366,
                test: test$2367,
                update: update$2368,
                body: body$2371
            };
        }
        return {
            type: Syntax$2058.ForInStatement,
            left: left$2369,
            right: right$2370,
            body: body$2371,
            each: false
        };
    }
    // 12.7 The continue statement
    function parseContinueStatement$2155() {
        var token$2373, label$2374 = null;
        expectKeyword$2104('continue');
        // Optimize the most common form: 'continue;'.
        if (tokenStream$2070[index$2064].token.value === ';') {
            lex$2097();
            if (!state$2069.inIteration) {
                throwError$2100({}, Messages$2060.IllegalContinue);
            }
            return {
                type: Syntax$2058.ContinueStatement,
                label: null
            };
        }
        if (peekLineTerminator$2099()) {
            if (!state$2069.inIteration) {
                throwError$2100({}, Messages$2060.IllegalContinue);
            }
            return {
                type: Syntax$2058.ContinueStatement,
                label: null
            };
        }
        token$2373 = lookahead$2098().token;
        if (token$2373.type === Token$2056.Identifier) {
            label$2374 = parseVariableIdentifier$2143();
            if (!Object.prototype.hasOwnProperty.call(state$2069.labelSet, label$2374.name)) {
                throwError$2100({}, Messages$2060.UnknownLabel, label$2374.name);
            }
        }
        consumeSemicolon$2108();
        if (label$2374 === null && !state$2069.inIteration) {
            throwError$2100({}, Messages$2060.IllegalContinue);
        }
        return {
            type: Syntax$2058.ContinueStatement,
            label: label$2374
        };
    }
    // 12.8 The break statement
    function parseBreakStatement$2156() {
        var token$2375, label$2376 = null;
        expectKeyword$2104('break');
        if (peekLineTerminator$2099()) {
            if (!(state$2069.inIteration || state$2069.inSwitch)) {
                throwError$2100({}, Messages$2060.IllegalBreak);
            }
            return {
                type: Syntax$2058.BreakStatement,
                label: null
            };
        }
        token$2375 = lookahead$2098().token;
        if (token$2375.type === Token$2056.Identifier) {
            label$2376 = parseVariableIdentifier$2143();
            if (!Object.prototype.hasOwnProperty.call(state$2069.labelSet, label$2376.name)) {
                throwError$2100({}, Messages$2060.UnknownLabel, label$2376.name);
            }
        }
        consumeSemicolon$2108();
        if (label$2376 === null && !(state$2069.inIteration || state$2069.inSwitch)) {
            throwError$2100({}, Messages$2060.IllegalBreak);
        }
        return {
            type: Syntax$2058.BreakStatement,
            label: label$2376
        };
    }
    // 12.9 The return statement
    function parseReturnStatement$2157() {
        var token$2377, argument$2378 = null;
        expectKeyword$2104('return');
        if (!state$2069.inFunctionBody) {
            throwErrorTolerant$2101({}, Messages$2060.IllegalReturn);
        }
        if (peekLineTerminator$2099()) {
            return {
                type: Syntax$2058.ReturnStatement,
                argument: null
            };
        }
        if (!match$2105(';')) {
            token$2377 = lookahead$2098().token;
            if (!match$2105('}') && token$2377.type !== Token$2056.EOF) {
                argument$2378 = parseExpression$2140();
            }
        }
        consumeSemicolon$2108();
        return {
            type: Syntax$2058.ReturnStatement,
            argument: argument$2378
        };
    }
    // 12.10 The with statement
    function parseWithStatement$2158() {
        var object$2379, body$2380;
        if (strict$2063) {
            throwErrorTolerant$2101({}, Messages$2060.StrictModeWith);
        }
        expectKeyword$2104('with');
        expect$2103('(');
        object$2379 = parseExpression$2140();
        expect$2103(')');
        body$2380 = parseStatement$2165();
        return {
            type: Syntax$2058.WithStatement,
            object: object$2379,
            body: body$2380
        };
    }
    // 12.10 The swith statement
    function parseSwitchCase$2159() {
        var test$2381, consequent$2382 = [], statement$2383;
        if (matchKeyword$2106('default')) {
            lex$2097();
            test$2381 = null;
        } else {
            expectKeyword$2104('case');
            test$2381 = parseExpression$2140();
        }
        expect$2103(':');
        while (index$2064 < length$2067) {
            if (match$2105('}') || matchKeyword$2106('default') || matchKeyword$2106('case')) {
                break;
            }
            statement$2383 = parseStatement$2165();
            if (typeof statement$2383 === 'undefined') {
                break;
            }
            consequent$2382.push(statement$2383);
        }
        return {
            type: Syntax$2058.SwitchCase,
            test: test$2381,
            consequent: consequent$2382
        };
    }
    function parseSwitchStatement$2160() {
        var discriminant$2384, cases$2385, oldInSwitch$2386;
        expectKeyword$2104('switch');
        expect$2103('(');
        discriminant$2384 = parseExpression$2140();
        expect$2103(')');
        expect$2103('{');
        if (match$2105('}')) {
            lex$2097();
            return {
                type: Syntax$2058.SwitchStatement,
                discriminant: discriminant$2384
            };
        }
        cases$2385 = [];
        oldInSwitch$2386 = state$2069.inSwitch;
        state$2069.inSwitch = true;
        while (index$2064 < length$2067) {
            if (match$2105('}')) {
                break;
            }
            cases$2385.push(parseSwitchCase$2159());
        }
        state$2069.inSwitch = oldInSwitch$2386;
        expect$2103('}');
        return {
            type: Syntax$2058.SwitchStatement,
            discriminant: discriminant$2384,
            cases: cases$2385
        };
    }
    // 12.13 The throw statement
    function parseThrowStatement$2161() {
        var argument$2387;
        expectKeyword$2104('throw');
        if (peekLineTerminator$2099()) {
            throwError$2100({}, Messages$2060.NewlineAfterThrow);
        }
        argument$2387 = parseExpression$2140();
        consumeSemicolon$2108();
        return {
            type: Syntax$2058.ThrowStatement,
            argument: argument$2387
        };
    }
    // 12.14 The try statement
    function parseCatchClause$2162() {
        var param$2388;
        expectKeyword$2104('catch');
        expect$2103('(');
        if (!match$2105(')')) {
            param$2388 = parseExpression$2140();
            // 12.14.1
            if (strict$2063 && param$2388.type === Syntax$2058.Identifier && isRestrictedWord$2084(param$2388.name)) {
                throwErrorTolerant$2101({}, Messages$2060.StrictCatchVariable);
            }
        }
        expect$2103(')');
        return {
            type: Syntax$2058.CatchClause,
            param: param$2388,
            guard: null,
            body: parseBlock$2142()
        };
    }
    function parseTryStatement$2163() {
        var block$2389, handlers$2390 = [], finalizer$2391 = null;
        expectKeyword$2104('try');
        block$2389 = parseBlock$2142();
        if (matchKeyword$2106('catch')) {
            handlers$2390.push(parseCatchClause$2162());
        }
        if (matchKeyword$2106('finally')) {
            lex$2097();
            finalizer$2391 = parseBlock$2142();
        }
        if (handlers$2390.length === 0 && !finalizer$2391) {
            throwError$2100({}, Messages$2060.NoCatchOrFinally);
        }
        return {
            type: Syntax$2058.TryStatement,
            block: block$2389,
            handlers: handlers$2390,
            finalizer: finalizer$2391
        };
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$2164() {
        expectKeyword$2104('debugger');
        consumeSemicolon$2108();
        return { type: Syntax$2058.DebuggerStatement };
    }
    // 12 Statements
    function parseStatement$2165() {
        var token$2392 = lookahead$2098().token, expr$2393, labeledBody$2394;
        if (token$2392.type === Token$2056.EOF) {
            throwUnexpected$2102(token$2392);
        }
        if (token$2392.type === Token$2056.Punctuator) {
            switch (token$2392.value) {
            case ';':
                return parseEmptyStatement$2148();
            case '{':
                return parseBlock$2142();
            case '(':
                return parseExpressionStatement$2149();
            default:
                break;
            }
        }
        if (token$2392.type === Token$2056.Keyword) {
            switch (token$2392.value) {
            case 'break':
                return parseBreakStatement$2156();
            case 'continue':
                return parseContinueStatement$2155();
            case 'debugger':
                return parseDebuggerStatement$2164();
            case 'do':
                return parseDoWhileStatement$2151();
            case 'for':
                return parseForStatement$2154();
            case 'function':
                return parseFunctionDeclaration$2167();
            case 'if':
                return parseIfStatement$2150();
            case 'return':
                return parseReturnStatement$2157();
            case 'switch':
                return parseSwitchStatement$2160();
            case 'throw':
                return parseThrowStatement$2161();
            case 'try':
                return parseTryStatement$2163();
            case 'var':
                return parseVariableStatement$2146();
            case 'while':
                return parseWhileStatement$2152();
            case 'with':
                return parseWithStatement$2158();
            default:
                break;
            }
        }
        expr$2393 = parseExpression$2140();
        // 12.12 Labelled Statements
        if (expr$2393.type === Syntax$2058.Identifier && match$2105(':')) {
            lex$2097();
            if (Object.prototype.hasOwnProperty.call(state$2069.labelSet, expr$2393.name)) {
                throwError$2100({}, Messages$2060.Redeclaration, 'Label', expr$2393.name);
            }
            state$2069.labelSet[expr$2393.name] = true;
            labeledBody$2394 = parseStatement$2165();
            delete state$2069.labelSet[expr$2393.name];
            return {
                type: Syntax$2058.LabeledStatement,
                label: expr$2393,
                body: labeledBody$2394
            };
        }
        consumeSemicolon$2108();
        return {
            type: Syntax$2058.ExpressionStatement,
            expression: expr$2393
        };
    }
    // 13 Function Definition
    function parseFunctionSourceElements$2166() {
        var sourceElement$2395, sourceElements$2396 = [], token$2397, directive$2398, firstRestricted$2399, oldLabelSet$2400, oldInIteration$2401, oldInSwitch$2402, oldInFunctionBody$2403;
        expect$2103('{');
        while (index$2064 < length$2067) {
            token$2397 = lookahead$2098().token;
            if (token$2397.type !== Token$2056.StringLiteral) {
                break;
            }
            sourceElement$2395 = parseSourceElement$2169();
            sourceElements$2396.push(sourceElement$2395);
            if (sourceElement$2395.expression.type !== Syntax$2058.Literal) {
                // this is not directive
                break;
            }
            directive$2398 = sliceSource$2074(token$2397.range[0] + 1, token$2397.range[1] - 1);
            if (directive$2398 === 'use strict') {
                strict$2063 = true;
                if (firstRestricted$2399) {
                    throwError$2100(firstRestricted$2399, Messages$2060.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$2399 && token$2397.octal) {
                    firstRestricted$2399 = token$2397;
                }
            }
        }
        oldLabelSet$2400 = state$2069.labelSet;
        oldInIteration$2401 = state$2069.inIteration;
        oldInSwitch$2402 = state$2069.inSwitch;
        oldInFunctionBody$2403 = state$2069.inFunctionBody;
        state$2069.labelSet = {};
        state$2069.inIteration = false;
        state$2069.inSwitch = false;
        state$2069.inFunctionBody = true;
        while (index$2064 < length$2067) {
            if (match$2105('}')) {
                break;
            }
            sourceElement$2395 = parseSourceElement$2169();
            if (typeof sourceElement$2395 === 'undefined') {
                break;
            }
            sourceElements$2396.push(sourceElement$2395);
        }
        expect$2103('}');
        state$2069.labelSet = oldLabelSet$2400;
        state$2069.inIteration = oldInIteration$2401;
        state$2069.inSwitch = oldInSwitch$2402;
        state$2069.inFunctionBody = oldInFunctionBody$2403;
        return {
            type: Syntax$2058.BlockStatement,
            body: sourceElements$2396
        };
    }
    function parseFunctionDeclaration$2167() {
        var id$2404, param$2405, params$2406 = [], body$2407, token$2408, firstRestricted$2409, message$2410, previousStrict$2411, paramSet$2412;
        expectKeyword$2104('function');
        token$2408 = lookahead$2098().token;
        id$2404 = parseVariableIdentifier$2143();
        if (strict$2063) {
            if (isRestrictedWord$2084(token$2408.value)) {
                throwError$2100(token$2408, Messages$2060.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$2084(token$2408.value)) {
                firstRestricted$2409 = token$2408;
                message$2410 = Messages$2060.StrictFunctionName;
            } else if (isStrictModeReservedWord$2083(token$2408.value)) {
                firstRestricted$2409 = token$2408;
                message$2410 = Messages$2060.StrictReservedWord;
            }
        }
        expect$2103('(');
        if (!match$2105(')')) {
            paramSet$2412 = {};
            while (index$2064 < length$2067) {
                token$2408 = lookahead$2098().token;
                param$2405 = parseVariableIdentifier$2143();
                if (strict$2063) {
                    if (isRestrictedWord$2084(token$2408.value)) {
                        throwError$2100(token$2408, Messages$2060.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$2412, token$2408.value)) {
                        throwError$2100(token$2408, Messages$2060.StrictParamDupe);
                    }
                } else if (!firstRestricted$2409) {
                    if (isRestrictedWord$2084(token$2408.value)) {
                        firstRestricted$2409 = token$2408;
                        message$2410 = Messages$2060.StrictParamName;
                    } else if (isStrictModeReservedWord$2083(token$2408.value)) {
                        firstRestricted$2409 = token$2408;
                        message$2410 = Messages$2060.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$2412, token$2408.value)) {
                        firstRestricted$2409 = token$2408;
                        message$2410 = Messages$2060.StrictParamDupe;
                    }
                }
                params$2406.push(param$2405);
                paramSet$2412[param$2405.name] = true;
                if (match$2105(')')) {
                    break;
                }
                expect$2103(',');
            }
        }
        expect$2103(')');
        previousStrict$2411 = strict$2063;
        body$2407 = parseFunctionSourceElements$2166();
        if (strict$2063 && firstRestricted$2409) {
            throwError$2100(firstRestricted$2409, message$2410);
        }
        strict$2063 = previousStrict$2411;
        return {
            type: Syntax$2058.FunctionDeclaration,
            id: id$2404,
            params: params$2406,
            body: body$2407
        };
    }
    function parseFunctionExpression$2168() {
        var token$2413, id$2414 = null, firstRestricted$2415, message$2416, param$2417, params$2418 = [], body$2419, previousStrict$2420, paramSet$2421;
        expectKeyword$2104('function');
        if (!match$2105('(')) {
            token$2413 = lookahead$2098().token;
            id$2414 = parseVariableIdentifier$2143();
            if (strict$2063) {
                if (isRestrictedWord$2084(token$2413.value)) {
                    throwError$2100(token$2413, Messages$2060.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$2084(token$2413.value)) {
                    firstRestricted$2415 = token$2413;
                    message$2416 = Messages$2060.StrictFunctionName;
                } else if (isStrictModeReservedWord$2083(token$2413.value)) {
                    firstRestricted$2415 = token$2413;
                    message$2416 = Messages$2060.StrictReservedWord;
                }
            }
        }
        expect$2103('(');
        if (!match$2105(')')) {
            paramSet$2421 = {};
            while (index$2064 < length$2067) {
                token$2413 = lookahead$2098().token;
                param$2417 = parseVariableIdentifier$2143();
                if (strict$2063) {
                    if (isRestrictedWord$2084(token$2413.value)) {
                        throwError$2100(token$2413, Messages$2060.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$2421, token$2413.value)) {
                        throwError$2100(token$2413, Messages$2060.StrictParamDupe);
                    }
                } else if (!firstRestricted$2415) {
                    if (isRestrictedWord$2084(token$2413.value)) {
                        firstRestricted$2415 = token$2413;
                        message$2416 = Messages$2060.StrictParamName;
                    } else if (isStrictModeReservedWord$2083(token$2413.value)) {
                        firstRestricted$2415 = token$2413;
                        message$2416 = Messages$2060.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$2421, token$2413.value)) {
                        firstRestricted$2415 = token$2413;
                        message$2416 = Messages$2060.StrictParamDupe;
                    }
                }
                params$2418.push(param$2417);
                paramSet$2421[param$2417.name] = true;
                if (match$2105(')')) {
                    break;
                }
                expect$2103(',');
            }
        }
        expect$2103(')');
        previousStrict$2420 = strict$2063;
        body$2419 = parseFunctionSourceElements$2166();
        if (strict$2063 && firstRestricted$2415) {
            throwError$2100(firstRestricted$2415, message$2416);
        }
        strict$2063 = previousStrict$2420;
        return {
            type: Syntax$2058.FunctionExpression,
            id: id$2414,
            params: params$2418,
            body: body$2419
        };
    }
    // 14 Program
    function parseSourceElement$2169() {
        var token$2422 = lookahead$2098().token;
        if (token$2422.type === Token$2056.Keyword) {
            switch (token$2422.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$2147(token$2422.value);
            case 'function':
                return parseFunctionDeclaration$2167();
            default:
                return parseStatement$2165();
            }
        }
        if (token$2422.type !== Token$2056.EOF) {
            return parseStatement$2165();
        }
    }
    function parseSourceElements$2170() {
        var sourceElement$2423, sourceElements$2424 = [], token$2425, directive$2426, firstRestricted$2427;
        while (index$2064 < length$2067) {
            token$2425 = lookahead$2098();
            if (token$2425.type !== Token$2056.StringLiteral) {
                break;
            }
            sourceElement$2423 = parseSourceElement$2169();
            sourceElements$2424.push(sourceElement$2423);
            if (sourceElement$2423.expression.type !== Syntax$2058.Literal) {
                // this is not directive
                break;
            }
            directive$2426 = sliceSource$2074(token$2425.range[0] + 1, token$2425.range[1] - 1);
            if (directive$2426 === 'use strict') {
                strict$2063 = true;
                if (firstRestricted$2427) {
                    throwError$2100(firstRestricted$2427, Messages$2060.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$2427 && token$2425.octal) {
                    firstRestricted$2427 = token$2425;
                }
            }
        }
        while (index$2064 < length$2067) {
            sourceElement$2423 = parseSourceElement$2169();
            if (typeof sourceElement$2423 === 'undefined') {
                break;
            }
            sourceElements$2424.push(sourceElement$2423);
        }
        return sourceElements$2424;
    }
    function parseProgram$2171() {
        var program$2428;
        strict$2063 = false;
        program$2428 = {
            type: Syntax$2058.Program,
            body: parseSourceElements$2170()
        };
        return program$2428;
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$2172(start$2429, end$2430, type$2431, value$2432) {
        assert$2072(typeof start$2429 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$2071.comments.length > 0) {
            if (extra$2071.comments[extra$2071.comments.length - 1].range[1] > start$2429) {
                return;
            }
        }
        extra$2071.comments.push({
            range: [
                start$2429,
                end$2430
            ],
            type: type$2431,
            value: value$2432
        });
    }
    function scanComment$2173() {
        var comment$2433, ch$2434, start$2435, blockComment$2436, lineComment$2437;
        comment$2433 = '';
        blockComment$2436 = false;
        lineComment$2437 = false;
        while (index$2064 < length$2067) {
            ch$2434 = source$2062[index$2064];
            if (lineComment$2437) {
                ch$2434 = nextChar$2086();
                if (index$2064 >= length$2067) {
                    lineComment$2437 = false;
                    comment$2433 += ch$2434;
                    addComment$2172(start$2435, index$2064, 'Line', comment$2433);
                } else if (isLineTerminator$2079(ch$2434)) {
                    lineComment$2437 = false;
                    addComment$2172(start$2435, index$2064, 'Line', comment$2433);
                    if (ch$2434 === '\r' && source$2062[index$2064] === '\n') {
                        ++index$2064;
                    }
                    ++lineNumber$2065;
                    lineStart$2066 = index$2064;
                    comment$2433 = '';
                } else {
                    comment$2433 += ch$2434;
                }
            } else if (blockComment$2436) {
                if (isLineTerminator$2079(ch$2434)) {
                    if (ch$2434 === '\r' && source$2062[index$2064 + 1] === '\n') {
                        ++index$2064;
                        comment$2433 += '\r\n';
                    } else {
                        comment$2433 += ch$2434;
                    }
                    ++lineNumber$2065;
                    ++index$2064;
                    lineStart$2066 = index$2064;
                    if (index$2064 >= length$2067) {
                        throwError$2100({}, Messages$2060.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$2434 = nextChar$2086();
                    if (index$2064 >= length$2067) {
                        throwError$2100({}, Messages$2060.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$2433 += ch$2434;
                    if (ch$2434 === '*') {
                        ch$2434 = source$2062[index$2064];
                        if (ch$2434 === '/') {
                            comment$2433 = comment$2433.substr(0, comment$2433.length - 1);
                            blockComment$2436 = false;
                            ++index$2064;
                            addComment$2172(start$2435, index$2064, 'Block', comment$2433);
                            comment$2433 = '';
                        }
                    }
                }
            } else if (ch$2434 === '/') {
                ch$2434 = source$2062[index$2064 + 1];
                if (ch$2434 === '/') {
                    start$2435 = index$2064;
                    index$2064 += 2;
                    lineComment$2437 = true;
                } else if (ch$2434 === '*') {
                    start$2435 = index$2064;
                    index$2064 += 2;
                    blockComment$2436 = true;
                    if (index$2064 >= length$2067) {
                        throwError$2100({}, Messages$2060.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$2078(ch$2434)) {
                ++index$2064;
            } else if (isLineTerminator$2079(ch$2434)) {
                ++index$2064;
                if (ch$2434 === '\r' && source$2062[index$2064] === '\n') {
                    ++index$2064;
                }
                ++lineNumber$2065;
                lineStart$2066 = index$2064;
            } else {
                break;
            }
        }
    }
    function collectToken$2174() {
        var token$2438 = extra$2071.advance(), range$2439, value$2440;
        if (token$2438.type !== Token$2056.EOF) {
            range$2439 = [
                token$2438.range[0],
                token$2438.range[1]
            ];
            value$2440 = sliceSource$2074(token$2438.range[0], token$2438.range[1]);
            extra$2071.tokens.push({
                type: TokenName$2057[token$2438.type],
                value: value$2440,
                lineNumber: lineNumber$2065,
                lineStart: lineStart$2066,
                range: range$2439
            });
        }
        return token$2438;
    }
    function collectRegex$2175() {
        var pos$2441, regex$2442, token$2443;
        skipComment$2088();
        pos$2441 = index$2064;
        regex$2442 = extra$2071.scanRegExp();
        // Pop the previous token, which is likely '/' or '/='
        if (extra$2071.tokens.length > 0) {
            token$2443 = extra$2071.tokens[extra$2071.tokens.length - 1];
            if (token$2443.range[0] === pos$2441 && token$2443.type === 'Punctuator') {
                if (token$2443.value === '/' || token$2443.value === '/=') {
                    extra$2071.tokens.pop();
                }
            }
        }
        extra$2071.tokens.push({
            type: 'RegularExpression',
            value: regex$2442.literal,
            range: [
                pos$2441,
                index$2064
            ],
            lineStart: token$2443.lineStart,
            lineNumber: token$2443.lineNumber
        });
        return regex$2442;
    }
    function createLiteral$2176(token$2444) {
        if (Array.isArray(token$2444)) {
            return {
                type: Syntax$2058.Literal,
                value: token$2444
            };
        }
        return {
            type: Syntax$2058.Literal,
            value: token$2444.value,
            lineStart: token$2444.lineStart,
            lineNumber: token$2444.lineNumber
        };
    }
    function createRawLiteral$2177(token$2445) {
        return {
            type: Syntax$2058.Literal,
            value: token$2445.value,
            raw: sliceSource$2074(token$2445.range[0], token$2445.range[1]),
            lineStart: token$2445.lineStart,
            lineNumber: token$2445.lineNumber
        };
    }
    function wrapTrackingFunction$2178(range$2446, loc$2447) {
        return function (parseFunction$2448) {
            function isBinary$2449(node$2451) {
                return node$2451.type === Syntax$2058.LogicalExpression || node$2451.type === Syntax$2058.BinaryExpression;
            }
            function visit$2450(node$2452) {
                if (isBinary$2449(node$2452.left)) {
                    visit$2450(node$2452.left);
                }
                if (isBinary$2449(node$2452.right)) {
                    visit$2450(node$2452.right);
                }
                if (range$2446 && typeof node$2452.range === 'undefined') {
                    node$2452.range = [
                        node$2452.left.range[0],
                        node$2452.right.range[1]
                    ];
                }
                if (loc$2447 && typeof node$2452.loc === 'undefined') {
                    node$2452.loc = {
                        start: node$2452.left.loc.start,
                        end: node$2452.right.loc.end
                    };
                }
            }
            return function () {
                var node$2453, rangeInfo$2454, locInfo$2455;
                // skipComment();
                var curr$2456 = tokenStream$2070[index$2064].token;
                rangeInfo$2454 = [
                    curr$2456.range[0],
                    0
                ];
                locInfo$2455 = {
                    start: {
                        line: curr$2456.sm_lineNumber,
                        column: curr$2456.sm_range[0] - curr$2456.sm_lineStart
                    }
                };
                node$2453 = parseFunction$2448.apply(null, arguments);
                if (typeof node$2453 !== 'undefined') {
                    var last$2457 = tokenStream$2070[index$2064].token;
                    if (range$2446) {
                        rangeInfo$2454[1] = last$2457.range[1];
                        node$2453.range = rangeInfo$2454;
                    }
                    if (loc$2447) {
                        locInfo$2455.end = {
                            line: last$2457.sm_lineNumber,
                            column: last$2457.sm_range[0] - last$2457.sm_lineStart
                        };
                        node$2453.loc = locInfo$2455;
                    }
                    if (isBinary$2449(node$2453)) {
                        visit$2450(node$2453);
                    }
                    if (node$2453.type === Syntax$2058.MemberExpression) {
                        if (typeof node$2453.object.range !== 'undefined') {
                            node$2453.range[0] = node$2453.object.range[0];
                        }
                        if (typeof node$2453.object.loc !== 'undefined') {
                            node$2453.loc.start = node$2453.object.loc.start;
                        }
                    }
                    if (node$2453.type === Syntax$2058.CallExpression) {
                        if (typeof node$2453.callee.range !== 'undefined') {
                            node$2453.range[0] = node$2453.callee.range[0];
                        }
                        if (typeof node$2453.callee.loc !== 'undefined') {
                            node$2453.loc.start = node$2453.callee.loc.start;
                        }
                    }
                    if (node$2453.type !== Syntax$2058.Program) {
                        if (curr$2456.leadingComments) {
                            node$2453.leadingComments = curr$2456.leadingComments;
                        }
                        if (curr$2456.trailingComments) {
                            node$2453.trailingComments = curr$2456.trailingComments;
                        }
                    }
                    return node$2453;
                }
            };
        };
    }
    function patch$2179() {
        var wrapTracking$2458;
        if (extra$2071.comments) {
            extra$2071.skipComment = skipComment$2088;
            skipComment$2088 = scanComment$2173;
        }
        if (extra$2071.raw) {
            extra$2071.createLiteral = createLiteral$2176;
            createLiteral$2176 = createRawLiteral$2177;
        }
        if (extra$2071.range || extra$2071.loc) {
            wrapTracking$2458 = wrapTrackingFunction$2178(extra$2071.range, extra$2071.loc);
            extra$2071.parseAdditiveExpression = parseAdditiveExpression$2129;
            extra$2071.parseAssignmentExpression = parseAssignmentExpression$2139;
            extra$2071.parseBitwiseANDExpression = parseBitwiseANDExpression$2133;
            extra$2071.parseBitwiseORExpression = parseBitwiseORExpression$2135;
            extra$2071.parseBitwiseXORExpression = parseBitwiseXORExpression$2134;
            extra$2071.parseBlock = parseBlock$2142;
            extra$2071.parseFunctionSourceElements = parseFunctionSourceElements$2166;
            extra$2071.parseCallMember = parseCallMember$2120;
            extra$2071.parseCatchClause = parseCatchClause$2162;
            extra$2071.parseComputedMember = parseComputedMember$2119;
            extra$2071.parseConditionalExpression = parseConditionalExpression$2138;
            extra$2071.parseConstLetDeclaration = parseConstLetDeclaration$2147;
            extra$2071.parseEqualityExpression = parseEqualityExpression$2132;
            extra$2071.parseExpression = parseExpression$2140;
            extra$2071.parseForVariableDeclaration = parseForVariableDeclaration$2153;
            extra$2071.parseFunctionDeclaration = parseFunctionDeclaration$2167;
            extra$2071.parseFunctionExpression = parseFunctionExpression$2168;
            extra$2071.parseLogicalANDExpression = parseLogicalANDExpression$2136;
            extra$2071.parseLogicalORExpression = parseLogicalORExpression$2137;
            extra$2071.parseMultiplicativeExpression = parseMultiplicativeExpression$2128;
            extra$2071.parseNewExpression = parseNewExpression$2121;
            extra$2071.parseNonComputedMember = parseNonComputedMember$2118;
            extra$2071.parseNonComputedProperty = parseNonComputedProperty$2117;
            extra$2071.parseObjectProperty = parseObjectProperty$2113;
            extra$2071.parseObjectPropertyKey = parseObjectPropertyKey$2112;
            extra$2071.parsePostfixExpression = parsePostfixExpression$2126;
            extra$2071.parsePrimaryExpression = parsePrimaryExpression$2115;
            extra$2071.parseProgram = parseProgram$2171;
            extra$2071.parsePropertyFunction = parsePropertyFunction$2111;
            extra$2071.parseRelationalExpression = parseRelationalExpression$2131;
            extra$2071.parseStatement = parseStatement$2165;
            extra$2071.parseShiftExpression = parseShiftExpression$2130;
            extra$2071.parseSwitchCase = parseSwitchCase$2159;
            extra$2071.parseUnaryExpression = parseUnaryExpression$2127;
            extra$2071.parseVariableDeclaration = parseVariableDeclaration$2144;
            extra$2071.parseVariableIdentifier = parseVariableIdentifier$2143;
            parseAdditiveExpression$2129 = wrapTracking$2458(extra$2071.parseAdditiveExpression);
            parseAssignmentExpression$2139 = wrapTracking$2458(extra$2071.parseAssignmentExpression);
            parseBitwiseANDExpression$2133 = wrapTracking$2458(extra$2071.parseBitwiseANDExpression);
            parseBitwiseORExpression$2135 = wrapTracking$2458(extra$2071.parseBitwiseORExpression);
            parseBitwiseXORExpression$2134 = wrapTracking$2458(extra$2071.parseBitwiseXORExpression);
            parseBlock$2142 = wrapTracking$2458(extra$2071.parseBlock);
            parseFunctionSourceElements$2166 = wrapTracking$2458(extra$2071.parseFunctionSourceElements);
            parseCallMember$2120 = wrapTracking$2458(extra$2071.parseCallMember);
            parseCatchClause$2162 = wrapTracking$2458(extra$2071.parseCatchClause);
            parseComputedMember$2119 = wrapTracking$2458(extra$2071.parseComputedMember);
            parseConditionalExpression$2138 = wrapTracking$2458(extra$2071.parseConditionalExpression);
            parseConstLetDeclaration$2147 = wrapTracking$2458(extra$2071.parseConstLetDeclaration);
            parseEqualityExpression$2132 = wrapTracking$2458(extra$2071.parseEqualityExpression);
            parseExpression$2140 = wrapTracking$2458(extra$2071.parseExpression);
            parseForVariableDeclaration$2153 = wrapTracking$2458(extra$2071.parseForVariableDeclaration);
            parseFunctionDeclaration$2167 = wrapTracking$2458(extra$2071.parseFunctionDeclaration);
            parseFunctionExpression$2168 = wrapTracking$2458(extra$2071.parseFunctionExpression);
            parseLogicalANDExpression$2136 = wrapTracking$2458(extra$2071.parseLogicalANDExpression);
            parseLogicalORExpression$2137 = wrapTracking$2458(extra$2071.parseLogicalORExpression);
            parseMultiplicativeExpression$2128 = wrapTracking$2458(extra$2071.parseMultiplicativeExpression);
            parseNewExpression$2121 = wrapTracking$2458(extra$2071.parseNewExpression);
            parseNonComputedMember$2118 = wrapTracking$2458(extra$2071.parseNonComputedMember);
            parseNonComputedProperty$2117 = wrapTracking$2458(extra$2071.parseNonComputedProperty);
            parseObjectProperty$2113 = wrapTracking$2458(extra$2071.parseObjectProperty);
            parseObjectPropertyKey$2112 = wrapTracking$2458(extra$2071.parseObjectPropertyKey);
            parsePostfixExpression$2126 = wrapTracking$2458(extra$2071.parsePostfixExpression);
            parsePrimaryExpression$2115 = wrapTracking$2458(extra$2071.parsePrimaryExpression);
            parseProgram$2171 = wrapTracking$2458(extra$2071.parseProgram);
            parsePropertyFunction$2111 = wrapTracking$2458(extra$2071.parsePropertyFunction);
            parseRelationalExpression$2131 = wrapTracking$2458(extra$2071.parseRelationalExpression);
            parseStatement$2165 = wrapTracking$2458(extra$2071.parseStatement);
            parseShiftExpression$2130 = wrapTracking$2458(extra$2071.parseShiftExpression);
            parseSwitchCase$2159 = wrapTracking$2458(extra$2071.parseSwitchCase);
            parseUnaryExpression$2127 = wrapTracking$2458(extra$2071.parseUnaryExpression);
            parseVariableDeclaration$2144 = wrapTracking$2458(extra$2071.parseVariableDeclaration);
            parseVariableIdentifier$2143 = wrapTracking$2458(extra$2071.parseVariableIdentifier);
        }
        if (typeof extra$2071.tokens !== 'undefined') {
            extra$2071.advance = advance$2096;
            extra$2071.scanRegExp = scanRegExp$2094;
            advance$2096 = collectToken$2174;
            scanRegExp$2094 = collectRegex$2175;
        }
    }
    function unpatch$2180() {
        if (typeof extra$2071.skipComment === 'function') {
            skipComment$2088 = extra$2071.skipComment;
        }
        if (extra$2071.raw) {
            createLiteral$2176 = extra$2071.createLiteral;
        }
        if (extra$2071.range || extra$2071.loc) {
            parseAdditiveExpression$2129 = extra$2071.parseAdditiveExpression;
            parseAssignmentExpression$2139 = extra$2071.parseAssignmentExpression;
            parseBitwiseANDExpression$2133 = extra$2071.parseBitwiseANDExpression;
            parseBitwiseORExpression$2135 = extra$2071.parseBitwiseORExpression;
            parseBitwiseXORExpression$2134 = extra$2071.parseBitwiseXORExpression;
            parseBlock$2142 = extra$2071.parseBlock;
            parseFunctionSourceElements$2166 = extra$2071.parseFunctionSourceElements;
            parseCallMember$2120 = extra$2071.parseCallMember;
            parseCatchClause$2162 = extra$2071.parseCatchClause;
            parseComputedMember$2119 = extra$2071.parseComputedMember;
            parseConditionalExpression$2138 = extra$2071.parseConditionalExpression;
            parseConstLetDeclaration$2147 = extra$2071.parseConstLetDeclaration;
            parseEqualityExpression$2132 = extra$2071.parseEqualityExpression;
            parseExpression$2140 = extra$2071.parseExpression;
            parseForVariableDeclaration$2153 = extra$2071.parseForVariableDeclaration;
            parseFunctionDeclaration$2167 = extra$2071.parseFunctionDeclaration;
            parseFunctionExpression$2168 = extra$2071.parseFunctionExpression;
            parseLogicalANDExpression$2136 = extra$2071.parseLogicalANDExpression;
            parseLogicalORExpression$2137 = extra$2071.parseLogicalORExpression;
            parseMultiplicativeExpression$2128 = extra$2071.parseMultiplicativeExpression;
            parseNewExpression$2121 = extra$2071.parseNewExpression;
            parseNonComputedMember$2118 = extra$2071.parseNonComputedMember;
            parseNonComputedProperty$2117 = extra$2071.parseNonComputedProperty;
            parseObjectProperty$2113 = extra$2071.parseObjectProperty;
            parseObjectPropertyKey$2112 = extra$2071.parseObjectPropertyKey;
            parsePrimaryExpression$2115 = extra$2071.parsePrimaryExpression;
            parsePostfixExpression$2126 = extra$2071.parsePostfixExpression;
            parseProgram$2171 = extra$2071.parseProgram;
            parsePropertyFunction$2111 = extra$2071.parsePropertyFunction;
            parseRelationalExpression$2131 = extra$2071.parseRelationalExpression;
            parseStatement$2165 = extra$2071.parseStatement;
            parseShiftExpression$2130 = extra$2071.parseShiftExpression;
            parseSwitchCase$2159 = extra$2071.parseSwitchCase;
            parseUnaryExpression$2127 = extra$2071.parseUnaryExpression;
            parseVariableDeclaration$2144 = extra$2071.parseVariableDeclaration;
            parseVariableIdentifier$2143 = extra$2071.parseVariableIdentifier;
        }
        if (typeof extra$2071.scanRegExp === 'function') {
            advance$2096 = extra$2071.advance;
            scanRegExp$2094 = extra$2071.scanRegExp;
        }
    }
    function stringToArray$2181(str$2459) {
        var length$2460 = str$2459.length, result$2461 = [], i$2462;
        for (i$2462 = 0; i$2462 < length$2460; ++i$2462) {
            result$2461[i$2462] = str$2459.charAt(i$2462);
        }
        return result$2461;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$2182(toks$2463, start$2464, inExprDelim$2465, parentIsBlock$2466) {
        var assignOps$2467 = [
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
        var binaryOps$2468 = [
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
        var unaryOps$2469 = [
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
        function back$2470(n$2471) {
            var idx$2472 = toks$2463.length - n$2471 > 0 ? toks$2463.length - n$2471 : 0;
            return toks$2463[idx$2472];
        }
        if (inExprDelim$2465 && toks$2463.length - (start$2464 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$2470(start$2464 + 2).value === ':' && parentIsBlock$2466) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$2073(back$2470(start$2464 + 2).value, unaryOps$2469.concat(binaryOps$2468).concat(assignOps$2467))) {
            // ... + {...}
            return false;
        } else if (back$2470(start$2464 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$2473 = typeof back$2470(start$2464 + 1).startLineNumber !== 'undefined' ? back$2470(start$2464 + 1).startLineNumber : back$2470(start$2464 + 1).lineNumber;
            if (back$2470(start$2464 + 2).lineNumber !== currLineNumber$2473) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$2073(back$2470(start$2464 + 2).value, [
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
    function readToken$2183(toks$2474, inExprDelim$2475, parentIsBlock$2476) {
        var delimiters$2477 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$2478 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$2479 = toks$2474.length - 1;
        var comments$2480, commentsLen$2481 = extra$2071.comments.length;
        function back$2482(n$2486) {
            var idx$2487 = toks$2474.length - n$2486 > 0 ? toks$2474.length - n$2486 : 0;
            return toks$2474[idx$2487];
        }
        function attachComments$2483(token$2488) {
            if (comments$2480) {
                token$2488.leadingComments = comments$2480;
            }
            return token$2488;
        }
        function _advance$2484() {
            return attachComments$2483(advance$2096());
        }
        function _scanRegExp$2485() {
            return attachComments$2483(scanRegExp$2094());
        }
        skipComment$2088();
        if (extra$2071.comments.length > commentsLen$2481) {
            comments$2480 = extra$2071.comments.slice(commentsLen$2481);
        }
        if (isIn$2073(getChar$2087(), delimiters$2477)) {
            return attachComments$2483(readDelim$2184(toks$2474, inExprDelim$2475, parentIsBlock$2476));
        }
        if (getChar$2087() === '/') {
            var prev$2489 = back$2482(1);
            if (prev$2489) {
                if (prev$2489.value === '()') {
                    if (isIn$2073(back$2482(2).value, parenIdents$2478)) {
                        // ... if (...) / ...
                        return _scanRegExp$2485();
                    }
                    // ... (...) / ...
                    return _advance$2484();
                }
                if (prev$2489.value === '{}') {
                    if (blockAllowed$2182(toks$2474, 0, inExprDelim$2475, parentIsBlock$2476)) {
                        if (back$2482(2).value === '()') {
                            // named function
                            if (back$2482(4).value === 'function') {
                                if (!blockAllowed$2182(toks$2474, 3, inExprDelim$2475, parentIsBlock$2476)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$2484();
                                }
                                if (toks$2474.length - 5 <= 0 && inExprDelim$2475) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$2484();
                                }
                            }
                            // unnamed function
                            if (back$2482(3).value === 'function') {
                                if (!blockAllowed$2182(toks$2474, 2, inExprDelim$2475, parentIsBlock$2476)) {
                                    // new function (...) {...} / ...
                                    return _advance$2484();
                                }
                                if (toks$2474.length - 4 <= 0 && inExprDelim$2475) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$2484();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$2485();
                    } else {
                        // ... + {...} / ...
                        return _advance$2484();
                    }
                }
                if (prev$2489.type === Token$2056.Punctuator) {
                    // ... + /...
                    return _scanRegExp$2485();
                }
                if (isKeyword$2085(prev$2489.value)) {
                    // typeof /...
                    return _scanRegExp$2485();
                }
                return _advance$2484();
            }
            return _scanRegExp$2485();
        }
        return _advance$2484();
    }
    function readDelim$2184(toks$2490, inExprDelim$2491, parentIsBlock$2492) {
        var startDelim$2493 = advance$2096(), matchDelim$2494 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$2495 = [];
        var delimiters$2496 = [
                '(',
                '{',
                '['
            ];
        assert$2072(delimiters$2496.indexOf(startDelim$2493.value) !== -1, 'Need to begin at the delimiter');
        var token$2497 = startDelim$2493;
        var startLineNumber$2498 = token$2497.lineNumber;
        var startLineStart$2499 = token$2497.lineStart;
        var startRange$2500 = token$2497.range;
        var delimToken$2501 = {};
        delimToken$2501.type = Token$2056.Delimiter;
        delimToken$2501.value = startDelim$2493.value + matchDelim$2494[startDelim$2493.value];
        delimToken$2501.startLineNumber = startLineNumber$2498;
        delimToken$2501.startLineStart = startLineStart$2499;
        delimToken$2501.startRange = startRange$2500;
        var delimIsBlock$2502 = false;
        if (startDelim$2493.value === '{') {
            delimIsBlock$2502 = blockAllowed$2182(toks$2490.concat(delimToken$2501), 0, inExprDelim$2491, parentIsBlock$2492);
        }
        while (index$2064 <= length$2067) {
            token$2497 = readToken$2183(inner$2495, startDelim$2493.value === '(' || startDelim$2493.value === '[', delimIsBlock$2502);
            if (token$2497.type === Token$2056.Punctuator && token$2497.value === matchDelim$2494[startDelim$2493.value]) {
                if (token$2497.leadingComments) {
                    delimToken$2501.trailingComments = token$2497.leadingComments;
                }
                break;
            } else if (token$2497.type === Token$2056.EOF) {
                throwError$2100({}, Messages$2060.UnexpectedEOS);
            } else {
                inner$2495.push(token$2497);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$2064 >= length$2067 && matchDelim$2494[startDelim$2493.value] !== source$2062[length$2067 - 1]) {
            throwError$2100({}, Messages$2060.UnexpectedEOS);
        }
        var endLineNumber$2503 = token$2497.lineNumber;
        var endLineStart$2504 = token$2497.lineStart;
        var endRange$2505 = token$2497.range;
        delimToken$2501.inner = inner$2495;
        delimToken$2501.endLineNumber = endLineNumber$2503;
        delimToken$2501.endLineStart = endLineStart$2504;
        delimToken$2501.endRange = endRange$2505;
        return delimToken$2501;
    }
    ;
    // (Str) -> [...CSyntax]
    function read$2185(code$2506) {
        var token$2507, tokenTree$2508 = [];
        extra$2071 = {};
        extra$2071.comments = [];
        patch$2179();
        source$2062 = code$2506;
        index$2064 = 0;
        lineNumber$2065 = source$2062.length > 0 ? 1 : 0;
        lineStart$2066 = 0;
        length$2067 = source$2062.length;
        buffer$2068 = null;
        state$2069 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$2064 < length$2067) {
            tokenTree$2508.push(readToken$2183(tokenTree$2508, false, false));
        }
        var last$2509 = tokenTree$2508[tokenTree$2508.length - 1];
        if (last$2509 && last$2509.type !== Token$2056.EOF) {
            tokenTree$2508.push({
                type: Token$2056.EOF,
                value: '',
                lineNumber: last$2509.lineNumber,
                lineStart: last$2509.lineStart,
                range: [
                    index$2064,
                    index$2064
                ]
            });
        }
        return expander$2055.tokensToSyntax(tokenTree$2508);
    }
    // (SyntaxObject, Str, {}) -> SyntaxObject
    function parse$2186(code$2510) {
        var program$2511, toString$2512;
        tokenStream$2070 = code$2510;
        index$2064 = 0;
        length$2067 = tokenStream$2070.length;
        buffer$2068 = null;
        state$2069 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$2071 = {
            range: true,
            loc: true
        };
        patch$2179();
        try {
            program$2511 = parseProgram$2171();
            program$2511.tokens = expander$2055.syntaxToTokens(code$2510);
        } catch (e$2513) {
            throw e$2513;
        } finally {
            unpatch$2180();
            extra$2071 = {};
        }
        return program$2511;
    }
    exports$2054.parse = parse$2186;
    exports$2054.read = read$2185;
    exports$2054.Token = Token$2056;
    exports$2054.assert = assert$2072;
    // Deep copy.
    exports$2054.Syntax = function () {
        var name$2514, types$2515 = {};
        if (typeof Object.create === 'function') {
            types$2515 = Object.create(null);
        }
        for (name$2514 in Syntax$2058) {
            if (Syntax$2058.hasOwnProperty(name$2514)) {
                types$2515[name$2514] = Syntax$2058[name$2514];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$2515);
        }
        return types$2515;
    }();
}));