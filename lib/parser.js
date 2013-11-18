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
(function (root$1198, factory$1199) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$1199(exports, require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'expander'
        ], factory$1199);
    }
}(this, function (exports$1200, expander$1201) {
    'use strict';
    var Token$1202, TokenName$1203, Syntax$1204, PropertyKind$1205, Messages$1206, Regex$1207, source$1208, strict$1209, index$1210, lineNumber$1211, lineStart$1212, length$1213, buffer$1214, state$1215, tokenStream$1216, extra$1217;
    Token$1202 = {
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
    TokenName$1203 = {};
    TokenName$1203[Token$1202.BooleanLiteral] = 'Boolean';
    TokenName$1203[Token$1202.EOF] = '<end>';
    TokenName$1203[Token$1202.Identifier] = 'Identifier';
    TokenName$1203[Token$1202.Keyword] = 'Keyword';
    TokenName$1203[Token$1202.NullLiteral] = 'Null';
    TokenName$1203[Token$1202.NumericLiteral] = 'Numeric';
    TokenName$1203[Token$1202.Punctuator] = 'Punctuator';
    TokenName$1203[Token$1202.StringLiteral] = 'String';
    TokenName$1203[Token$1202.Delimiter] = 'Delimiter';
    Syntax$1204 = {
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
    PropertyKind$1205 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    // Error messages should be identical to V8.
    Messages$1206 = {
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
    Regex$1207 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$1219(condition$1449, message$1450) {
        if (!condition$1449) {
            throw new Error('ASSERT: ' + message$1450);
        }
    }
    function isIn$1221(el$1451, list$1452) {
        return list$1452.indexOf(el$1451) !== -1;
    }
    function sliceSource$1223(from$1453, to$1454) {
        return source$1208.slice(from$1453, to$1454);
    }
    if (typeof 'esprima'[0] === 'undefined') {
        sliceSource$1223 = function sliceArraySource$1456(from$1457, to$1458) {
            return source$1208.slice(from$1457, to$1458).join('');
        };
    }
    function isDecimalDigit$1225(ch$1459) {
        return '0123456789'.indexOf(ch$1459) >= 0;
    }
    function isHexDigit$1227(ch$1460) {
        return '0123456789abcdefABCDEF'.indexOf(ch$1460) >= 0;
    }
    function isOctalDigit$1229(ch$1461) {
        return '01234567'.indexOf(ch$1461) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$1231(ch$1462) {
        return ch$1462 === ' ' || ch$1462 === '\t' || ch$1462 === '\x0B' || ch$1462 === '\f' || ch$1462 === '\xa0' || ch$1462.charCodeAt(0) >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(ch$1462) >= 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$1233(ch$1463) {
        return ch$1463 === '\n' || ch$1463 === '\r' || ch$1463 === '\u2028' || ch$1463 === '\u2029';
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$1235(ch$1464) {
        return ch$1464 === '$' || ch$1464 === '_' || ch$1464 === '\\' || ch$1464 >= 'a' && ch$1464 <= 'z' || ch$1464 >= 'A' && ch$1464 <= 'Z' || ch$1464.charCodeAt(0) >= 128 && Regex$1207.NonAsciiIdentifierStart.test(ch$1464);
    }
    function isIdentifierPart$1237(ch$1465) {
        return ch$1465 === '$' || ch$1465 === '_' || ch$1465 === '\\' || ch$1465 >= 'a' && ch$1465 <= 'z' || ch$1465 >= 'A' && ch$1465 <= 'Z' || ch$1465 >= '0' && ch$1465 <= '9' || ch$1465.charCodeAt(0) >= 128 && Regex$1207.NonAsciiIdentifierPart.test(ch$1465);
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$1239(id$1466) {
        // we are allowing future reserved words so macros can be written for them
        return false;
    }
    function isStrictModeReservedWord$1241(id$1467) {
        switch (id$1467) {
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
    function isRestrictedWord$1243(id$1468) {
        return id$1468 === 'eval' || id$1468 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$1245(id$1469) {
        var keyword$1470 = false;
        switch (id$1469.length) {
        case 2:
            keyword$1470 = id$1469 === 'if' || id$1469 === 'in' || id$1469 === 'do';
            break;
        case 3:
            keyword$1470 = id$1469 === 'var' || id$1469 === 'for' || id$1469 === 'new' || id$1469 === 'try';
            break;
        case 4:
            keyword$1470 = id$1469 === 'this' || id$1469 === 'else' || id$1469 === 'case' || id$1469 === 'void' || id$1469 === 'with';
            break;
        case 5:
            keyword$1470 = id$1469 === 'while' || id$1469 === 'break' || id$1469 === 'catch' || id$1469 === 'throw';
            break;
        case 6:
            keyword$1470 = id$1469 === 'return' || id$1469 === 'typeof' || id$1469 === 'delete' || id$1469 === 'switch';
            break;
        case 7:
            keyword$1470 = id$1469 === 'default' || id$1469 === 'finally';
            break;
        case 8:
            keyword$1470 = id$1469 === 'function' || id$1469 === 'continue' || id$1469 === 'debugger';
            break;
        case 10:
            keyword$1470 = id$1469 === 'instanceof';
            break;
        }
        if (keyword$1470) {
            return true;
        }
        switch (id$1469) {
        // Future reserved words.
        // 'const' is specialized as Keyword in V8.
        case 'const':
            return true;
        // For compatiblity to SpiderMonkey and ES.next
        case 'yield':
        case 'let':
            return true;
        }
        if (strict$1209 && isStrictModeReservedWord$1241(id$1469)) {
            return true;
        }
        return isFutureReservedWord$1239(id$1469);
    }
    // Return the next character and move forward.
    function nextChar$1247() {
        return source$1208[index$1210++];
    }
    function getChar$1249() {
        return source$1208[index$1210];
    }
    // 7.4 Comments
    function skipComment$1251() {
        var ch$1471, blockComment$1472, lineComment$1473;
        blockComment$1472 = false;
        lineComment$1473 = false;
        while (index$1210 < length$1213) {
            ch$1471 = source$1208[index$1210];
            if (lineComment$1473) {
                ch$1471 = nextChar$1247();
                if (isLineTerminator$1233(ch$1471)) {
                    lineComment$1473 = false;
                    if (ch$1471 === '\r' && source$1208[index$1210] === '\n') {
                        ++index$1210;
                    }
                    ++lineNumber$1211;
                    lineStart$1212 = index$1210;
                }
            } else if (blockComment$1472) {
                if (isLineTerminator$1233(ch$1471)) {
                    if (ch$1471 === '\r' && source$1208[index$1210 + 1] === '\n') {
                        ++index$1210;
                    }
                    ++lineNumber$1211;
                    ++index$1210;
                    lineStart$1212 = index$1210;
                    if (index$1210 >= length$1213) {
                        throwError$1275({}, Messages$1206.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1471 = nextChar$1247();
                    if (index$1210 >= length$1213) {
                        throwError$1275({}, Messages$1206.UnexpectedToken, 'ILLEGAL');
                    }
                    if (ch$1471 === '*') {
                        ch$1471 = source$1208[index$1210];
                        if (ch$1471 === '/') {
                            ++index$1210;
                            blockComment$1472 = false;
                        }
                    }
                }
            } else if (ch$1471 === '/') {
                ch$1471 = source$1208[index$1210 + 1];
                if (ch$1471 === '/') {
                    index$1210 += 2;
                    lineComment$1473 = true;
                } else if (ch$1471 === '*') {
                    index$1210 += 2;
                    blockComment$1472 = true;
                    if (index$1210 >= length$1213) {
                        throwError$1275({}, Messages$1206.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$1231(ch$1471)) {
                ++index$1210;
            } else if (isLineTerminator$1233(ch$1471)) {
                ++index$1210;
                if (ch$1471 === '\r' && source$1208[index$1210] === '\n') {
                    ++index$1210;
                }
                ++lineNumber$1211;
                lineStart$1212 = index$1210;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$1253(prefix$1474) {
        var i$1475, len$1476, ch$1477, code$1478 = 0;
        len$1476 = prefix$1474 === 'u' ? 4 : 2;
        for (i$1475 = 0; i$1475 < len$1476; ++i$1475) {
            if (index$1210 < length$1213 && isHexDigit$1227(source$1208[index$1210])) {
                ch$1477 = nextChar$1247();
                code$1478 = code$1478 * 16 + '0123456789abcdef'.indexOf(ch$1477.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$1478);
    }
    function scanIdentifier$1255() {
        var ch$1479, start$1480, id$1481, restore$1482;
        ch$1479 = source$1208[index$1210];
        if (!isIdentifierStart$1235(ch$1479)) {
            return;
        }
        start$1480 = index$1210;
        if (ch$1479 === '\\') {
            ++index$1210;
            if (source$1208[index$1210] !== 'u') {
                return;
            }
            ++index$1210;
            restore$1482 = index$1210;
            ch$1479 = scanHexEscape$1253('u');
            if (ch$1479) {
                if (ch$1479 === '\\' || !isIdentifierStart$1235(ch$1479)) {
                    return;
                }
                id$1481 = ch$1479;
            } else {
                index$1210 = restore$1482;
                id$1481 = 'u';
            }
        } else {
            id$1481 = nextChar$1247();
        }
        while (index$1210 < length$1213) {
            ch$1479 = source$1208[index$1210];
            if (!isIdentifierPart$1237(ch$1479)) {
                break;
            }
            if (ch$1479 === '\\') {
                ++index$1210;
                if (source$1208[index$1210] !== 'u') {
                    return;
                }
                ++index$1210;
                restore$1482 = index$1210;
                ch$1479 = scanHexEscape$1253('u');
                if (ch$1479) {
                    if (ch$1479 === '\\' || !isIdentifierPart$1237(ch$1479)) {
                        return;
                    }
                    id$1481 += ch$1479;
                } else {
                    index$1210 = restore$1482;
                    id$1481 += 'u';
                }
            } else {
                id$1481 += nextChar$1247();
            }
        }
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$1481.length === 1) {
            return {
                type: Token$1202.Identifier,
                value: id$1481,
                lineNumber: lineNumber$1211,
                lineStart: lineStart$1212,
                range: [
                    start$1480,
                    index$1210
                ]
            };
        }
        if (isKeyword$1245(id$1481)) {
            return {
                type: Token$1202.Keyword,
                value: id$1481,
                lineNumber: lineNumber$1211,
                lineStart: lineStart$1212,
                range: [
                    start$1480,
                    index$1210
                ]
            };
        }
        // 7.8.1 Null Literals
        if (id$1481 === 'null') {
            return {
                type: Token$1202.NullLiteral,
                value: id$1481,
                lineNumber: lineNumber$1211,
                lineStart: lineStart$1212,
                range: [
                    start$1480,
                    index$1210
                ]
            };
        }
        // 7.8.2 Boolean Literals
        if (id$1481 === 'true' || id$1481 === 'false') {
            return {
                type: Token$1202.BooleanLiteral,
                value: id$1481,
                lineNumber: lineNumber$1211,
                lineStart: lineStart$1212,
                range: [
                    start$1480,
                    index$1210
                ]
            };
        }
        return {
            type: Token$1202.Identifier,
            value: id$1481,
            lineNumber: lineNumber$1211,
            lineStart: lineStart$1212,
            range: [
                start$1480,
                index$1210
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$1257() {
        var start$1483 = index$1210, ch1$1484 = source$1208[index$1210], ch2$1485, ch3$1486, ch4$1487;
        // Check for most common single-character punctuators.
        if (ch1$1484 === ';' || ch1$1484 === '{' || ch1$1484 === '}') {
            ++index$1210;
            return {
                type: Token$1202.Punctuator,
                value: ch1$1484,
                lineNumber: lineNumber$1211,
                lineStart: lineStart$1212,
                range: [
                    start$1483,
                    index$1210
                ]
            };
        }
        if (ch1$1484 === ',' || ch1$1484 === '(' || ch1$1484 === ')') {
            ++index$1210;
            return {
                type: Token$1202.Punctuator,
                value: ch1$1484,
                lineNumber: lineNumber$1211,
                lineStart: lineStart$1212,
                range: [
                    start$1483,
                    index$1210
                ]
            };
        }
        if (ch1$1484 === '#' || ch1$1484 === '@') {
            ++index$1210;
            return {
                type: Token$1202.Punctuator,
                value: ch1$1484,
                lineNumber: lineNumber$1211,
                lineStart: lineStart$1212,
                range: [
                    start$1483,
                    index$1210
                ]
            };
        }
        // Dot (.) can also start a floating-point number, hence the need
        // to check the next character.
        ch2$1485 = source$1208[index$1210 + 1];
        if (ch1$1484 === '.' && !isDecimalDigit$1225(ch2$1485)) {
            if (source$1208[index$1210 + 1] === '.' && source$1208[index$1210 + 2] === '.') {
                nextChar$1247();
                nextChar$1247();
                nextChar$1247();
                return {
                    type: Token$1202.Punctuator,
                    value: '...',
                    lineNumber: lineNumber$1211,
                    lineStart: lineStart$1212,
                    range: [
                        start$1483,
                        index$1210
                    ]
                };
            } else {
                return {
                    type: Token$1202.Punctuator,
                    value: nextChar$1247(),
                    lineNumber: lineNumber$1211,
                    lineStart: lineStart$1212,
                    range: [
                        start$1483,
                        index$1210
                    ]
                };
            }
        }
        // Peek more characters.
        ch3$1486 = source$1208[index$1210 + 2];
        ch4$1487 = source$1208[index$1210 + 3];
        // 4-character punctuator: >>>=
        if (ch1$1484 === '>' && ch2$1485 === '>' && ch3$1486 === '>') {
            if (ch4$1487 === '=') {
                index$1210 += 4;
                return {
                    type: Token$1202.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$1211,
                    lineStart: lineStart$1212,
                    range: [
                        start$1483,
                        index$1210
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$1484 === '=' && ch2$1485 === '=' && ch3$1486 === '=') {
            index$1210 += 3;
            return {
                type: Token$1202.Punctuator,
                value: '===',
                lineNumber: lineNumber$1211,
                lineStart: lineStart$1212,
                range: [
                    start$1483,
                    index$1210
                ]
            };
        }
        if (ch1$1484 === '!' && ch2$1485 === '=' && ch3$1486 === '=') {
            index$1210 += 3;
            return {
                type: Token$1202.Punctuator,
                value: '!==',
                lineNumber: lineNumber$1211,
                lineStart: lineStart$1212,
                range: [
                    start$1483,
                    index$1210
                ]
            };
        }
        if (ch1$1484 === '>' && ch2$1485 === '>' && ch3$1486 === '>') {
            index$1210 += 3;
            return {
                type: Token$1202.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$1211,
                lineStart: lineStart$1212,
                range: [
                    start$1483,
                    index$1210
                ]
            };
        }
        if (ch1$1484 === '<' && ch2$1485 === '<' && ch3$1486 === '=') {
            index$1210 += 3;
            return {
                type: Token$1202.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$1211,
                lineStart: lineStart$1212,
                range: [
                    start$1483,
                    index$1210
                ]
            };
        }
        if (ch1$1484 === '>' && ch2$1485 === '>' && ch3$1486 === '=') {
            index$1210 += 3;
            return {
                type: Token$1202.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$1211,
                lineStart: lineStart$1212,
                range: [
                    start$1483,
                    index$1210
                ]
            };
        }
        // 2-character punctuators: <= >= == != ++ -- << >> && ||
        // += -= *= %= &= |= ^= /=
        if (ch2$1485 === '=') {
            if ('<>=!+-*%&|^/'.indexOf(ch1$1484) >= 0) {
                index$1210 += 2;
                return {
                    type: Token$1202.Punctuator,
                    value: ch1$1484 + ch2$1485,
                    lineNumber: lineNumber$1211,
                    lineStart: lineStart$1212,
                    range: [
                        start$1483,
                        index$1210
                    ]
                };
            }
        }
        if (ch1$1484 === ch2$1485 && '+-<>&|'.indexOf(ch1$1484) >= 0) {
            if ('+-<>&|'.indexOf(ch2$1485) >= 0) {
                index$1210 += 2;
                return {
                    type: Token$1202.Punctuator,
                    value: ch1$1484 + ch2$1485,
                    lineNumber: lineNumber$1211,
                    lineStart: lineStart$1212,
                    range: [
                        start$1483,
                        index$1210
                    ]
                };
            }
        }
        // The remaining 1-character punctuators.
        if ('[]<>+-*%&|^!~?:=/'.indexOf(ch1$1484) >= 0) {
            return {
                type: Token$1202.Punctuator,
                value: nextChar$1247(),
                lineNumber: lineNumber$1211,
                lineStart: lineStart$1212,
                range: [
                    start$1483,
                    index$1210
                ]
            };
        }
    }
    // 7.8.3 Numeric Literals
    function scanNumericLiteral$1259() {
        var number$1488, start$1489, ch$1490;
        ch$1490 = source$1208[index$1210];
        assert$1219(isDecimalDigit$1225(ch$1490) || ch$1490 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$1489 = index$1210;
        number$1488 = '';
        if (ch$1490 !== '.') {
            number$1488 = nextChar$1247();
            ch$1490 = source$1208[index$1210];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            if (number$1488 === '0') {
                if (ch$1490 === 'x' || ch$1490 === 'X') {
                    number$1488 += nextChar$1247();
                    while (index$1210 < length$1213) {
                        ch$1490 = source$1208[index$1210];
                        if (!isHexDigit$1227(ch$1490)) {
                            break;
                        }
                        number$1488 += nextChar$1247();
                    }
                    if (number$1488.length <= 2) {
                        // only 0x
                        throwError$1275({}, Messages$1206.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$1210 < length$1213) {
                        ch$1490 = source$1208[index$1210];
                        if (isIdentifierStart$1235(ch$1490)) {
                            throwError$1275({}, Messages$1206.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$1202.NumericLiteral,
                        value: parseInt(number$1488, 16),
                        lineNumber: lineNumber$1211,
                        lineStart: lineStart$1212,
                        range: [
                            start$1489,
                            index$1210
                        ]
                    };
                } else if (isOctalDigit$1229(ch$1490)) {
                    number$1488 += nextChar$1247();
                    while (index$1210 < length$1213) {
                        ch$1490 = source$1208[index$1210];
                        if (!isOctalDigit$1229(ch$1490)) {
                            break;
                        }
                        number$1488 += nextChar$1247();
                    }
                    if (index$1210 < length$1213) {
                        ch$1490 = source$1208[index$1210];
                        if (isIdentifierStart$1235(ch$1490) || isDecimalDigit$1225(ch$1490)) {
                            throwError$1275({}, Messages$1206.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$1202.NumericLiteral,
                        value: parseInt(number$1488, 8),
                        octal: true,
                        lineNumber: lineNumber$1211,
                        lineStart: lineStart$1212,
                        range: [
                            start$1489,
                            index$1210
                        ]
                    };
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (isDecimalDigit$1225(ch$1490)) {
                    throwError$1275({}, Messages$1206.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (index$1210 < length$1213) {
                ch$1490 = source$1208[index$1210];
                if (!isDecimalDigit$1225(ch$1490)) {
                    break;
                }
                number$1488 += nextChar$1247();
            }
        }
        if (ch$1490 === '.') {
            number$1488 += nextChar$1247();
            while (index$1210 < length$1213) {
                ch$1490 = source$1208[index$1210];
                if (!isDecimalDigit$1225(ch$1490)) {
                    break;
                }
                number$1488 += nextChar$1247();
            }
        }
        if (ch$1490 === 'e' || ch$1490 === 'E') {
            number$1488 += nextChar$1247();
            ch$1490 = source$1208[index$1210];
            if (ch$1490 === '+' || ch$1490 === '-') {
                number$1488 += nextChar$1247();
            }
            ch$1490 = source$1208[index$1210];
            if (isDecimalDigit$1225(ch$1490)) {
                number$1488 += nextChar$1247();
                while (index$1210 < length$1213) {
                    ch$1490 = source$1208[index$1210];
                    if (!isDecimalDigit$1225(ch$1490)) {
                        break;
                    }
                    number$1488 += nextChar$1247();
                }
            } else {
                ch$1490 = 'character ' + ch$1490;
                if (index$1210 >= length$1213) {
                    ch$1490 = '<end>';
                }
                throwError$1275({}, Messages$1206.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (index$1210 < length$1213) {
            ch$1490 = source$1208[index$1210];
            if (isIdentifierStart$1235(ch$1490)) {
                throwError$1275({}, Messages$1206.UnexpectedToken, 'ILLEGAL');
            }
        }
        return {
            type: Token$1202.NumericLiteral,
            value: parseFloat(number$1488),
            lineNumber: lineNumber$1211,
            lineStart: lineStart$1212,
            range: [
                start$1489,
                index$1210
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$1261() {
        var str$1491 = '', quote$1492, start$1493, ch$1494, code$1495, unescaped$1496, restore$1497, octal$1498 = false;
        quote$1492 = source$1208[index$1210];
        assert$1219(quote$1492 === '\'' || quote$1492 === '"', 'String literal must starts with a quote');
        start$1493 = index$1210;
        ++index$1210;
        while (index$1210 < length$1213) {
            ch$1494 = nextChar$1247();
            if (ch$1494 === quote$1492) {
                quote$1492 = '';
                break;
            } else if (ch$1494 === '\\') {
                ch$1494 = nextChar$1247();
                if (!isLineTerminator$1233(ch$1494)) {
                    switch (ch$1494) {
                    case 'n':
                        str$1491 += '\n';
                        break;
                    case 'r':
                        str$1491 += '\r';
                        break;
                    case 't':
                        str$1491 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        restore$1497 = index$1210;
                        unescaped$1496 = scanHexEscape$1253(ch$1494);
                        if (unescaped$1496) {
                            str$1491 += unescaped$1496;
                        } else {
                            index$1210 = restore$1497;
                            str$1491 += ch$1494;
                        }
                        break;
                    case 'b':
                        str$1491 += '\b';
                        break;
                    case 'f':
                        str$1491 += '\f';
                        break;
                    case 'v':
                        str$1491 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$1229(ch$1494)) {
                            code$1495 = '01234567'.indexOf(ch$1494);
                            // \0 is not octal escape sequence
                            if (code$1495 !== 0) {
                                octal$1498 = true;
                            }
                            if (index$1210 < length$1213 && isOctalDigit$1229(source$1208[index$1210])) {
                                octal$1498 = true;
                                code$1495 = code$1495 * 8 + '01234567'.indexOf(nextChar$1247());
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$1494) >= 0 && index$1210 < length$1213 && isOctalDigit$1229(source$1208[index$1210])) {
                                    code$1495 = code$1495 * 8 + '01234567'.indexOf(nextChar$1247());
                                }
                            }
                            str$1491 += String.fromCharCode(code$1495);
                        } else {
                            str$1491 += ch$1494;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$1211;
                    if (ch$1494 === '\r' && source$1208[index$1210] === '\n') {
                        ++index$1210;
                    }
                }
            } else if (isLineTerminator$1233(ch$1494)) {
                break;
            } else {
                str$1491 += ch$1494;
            }
        }
        if (quote$1492 !== '') {
            throwError$1275({}, Messages$1206.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$1202.StringLiteral,
            value: str$1491,
            octal: octal$1498,
            lineNumber: lineNumber$1211,
            lineStart: lineStart$1212,
            range: [
                start$1493,
                index$1210
            ]
        };
    }
    function scanRegExp$1263() {
        var str$1499 = '', ch$1500, start$1501, pattern$1502, flags$1503, value$1504, classMarker$1505 = false, restore$1506;
        buffer$1214 = null;
        skipComment$1251();
        start$1501 = index$1210;
        ch$1500 = source$1208[index$1210];
        assert$1219(ch$1500 === '/', 'Regular expression literal must start with a slash');
        str$1499 = nextChar$1247();
        while (index$1210 < length$1213) {
            ch$1500 = nextChar$1247();
            str$1499 += ch$1500;
            if (classMarker$1505) {
                if (ch$1500 === ']') {
                    classMarker$1505 = false;
                }
            } else {
                if (ch$1500 === '\\') {
                    ch$1500 = nextChar$1247();
                    // ECMA-262 7.8.5
                    if (isLineTerminator$1233(ch$1500)) {
                        throwError$1275({}, Messages$1206.UnterminatedRegExp);
                    }
                    str$1499 += ch$1500;
                } else if (ch$1500 === '/') {
                    break;
                } else if (ch$1500 === '[') {
                    classMarker$1505 = true;
                } else if (isLineTerminator$1233(ch$1500)) {
                    throwError$1275({}, Messages$1206.UnterminatedRegExp);
                }
            }
        }
        if (str$1499.length === 1) {
            throwError$1275({}, Messages$1206.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$1502 = str$1499.substr(1, str$1499.length - 2);
        flags$1503 = '';
        while (index$1210 < length$1213) {
            ch$1500 = source$1208[index$1210];
            if (!isIdentifierPart$1237(ch$1500)) {
                break;
            }
            ++index$1210;
            if (ch$1500 === '\\' && index$1210 < length$1213) {
                ch$1500 = source$1208[index$1210];
                if (ch$1500 === 'u') {
                    ++index$1210;
                    restore$1506 = index$1210;
                    ch$1500 = scanHexEscape$1253('u');
                    if (ch$1500) {
                        flags$1503 += ch$1500;
                        str$1499 += '\\u';
                        for (; restore$1506 < index$1210; ++restore$1506) {
                            str$1499 += source$1208[restore$1506];
                        }
                    } else {
                        index$1210 = restore$1506;
                        flags$1503 += 'u';
                        str$1499 += '\\u';
                    }
                } else {
                    str$1499 += '\\';
                }
            } else {
                flags$1503 += ch$1500;
                str$1499 += ch$1500;
            }
        }
        try {
            value$1504 = new RegExp(pattern$1502, flags$1503);
        } catch (e$1507) {
            throwError$1275({}, Messages$1206.InvalidRegExp);
        }
        return {
            type: Token$1202.RegexLiteral,
            literal: str$1499,
            value: value$1504,
            lineNumber: lineNumber$1211,
            lineStart: lineStart$1212,
            range: [
                start$1501,
                index$1210
            ]
        };
    }
    function isIdentifierName$1265(token$1508) {
        return token$1508.type === Token$1202.Identifier || token$1508.type === Token$1202.Keyword || token$1508.type === Token$1202.BooleanLiteral || token$1508.type === Token$1202.NullLiteral;
    }
    // only used by the reader
    function advance$1267() {
        var ch$1509, token$1510;
        skipComment$1251();
        if (index$1210 >= length$1213) {
            return {
                type: Token$1202.EOF,
                lineNumber: lineNumber$1211,
                lineStart: lineStart$1212,
                range: [
                    index$1210,
                    index$1210
                ]
            };
        }
        ch$1509 = source$1208[index$1210];
        token$1510 = scanPunctuator$1257();
        if (typeof token$1510 !== 'undefined') {
            return token$1510;
        }
        if (ch$1509 === '\'' || ch$1509 === '"') {
            return scanStringLiteral$1261();
        }
        if (ch$1509 === '.' || isDecimalDigit$1225(ch$1509)) {
            return scanNumericLiteral$1259();
        }
        token$1510 = scanIdentifier$1255();
        if (typeof token$1510 !== 'undefined') {
            return token$1510;
        }
        throwError$1275({}, Messages$1206.UnexpectedToken, 'ILLEGAL');
    }
    function lex$1269() {
        var token$1511;
        if (buffer$1214) {
            token$1511 = buffer$1214;
            buffer$1214 = null;
            index$1210++;
            return token$1511;
        }
        buffer$1214 = null;
        return tokenStream$1216[index$1210++];
    }
    function lookahead$1271() {
        var pos$1512, line$1513, start$1514;
        if (buffer$1214 !== null) {
            return buffer$1214;
        }
        buffer$1214 = tokenStream$1216[index$1210];
        return buffer$1214;
    }
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$1273() {
        var pos$1515, line$1516, start$1517, found$1518;
        found$1518 = tokenStream$1216[index$1210 - 1].token.lineNumber !== tokenStream$1216[index$1210].token.lineNumber;
        return found$1518;
    }
    // Throw an exception
    function throwError$1275(token$1519, messageFormat$1520) {
        var error$1522, args$1523 = Array.prototype.slice.call(arguments, 2), msg$1524 = messageFormat$1520.replace(/%(\d)/g, function (whole$1525, index$1526) {
                return args$1523[index$1526] || '';
            });
        if (typeof token$1519.lineNumber === 'number') {
            error$1522 = new Error('Line ' + token$1519.lineNumber + ': ' + msg$1524);
            error$1522.lineNumber = token$1519.lineNumber;
            if (token$1519.range && token$1519.range.length > 0) {
                error$1522.index = token$1519.range[0];
                error$1522.column = token$1519.range[0] - lineStart$1212 + 1;
            }
        } else {
            error$1522 = new Error('Line ' + lineNumber$1211 + ': ' + msg$1524);
            error$1522.index = index$1210;
            error$1522.lineNumber = lineNumber$1211;
            error$1522.column = index$1210 - lineStart$1212 + 1;
        }
        throw error$1522;
    }
    function throwErrorTolerant$1277() {
        var error$1527;
        try {
            throwError$1275.apply(null, arguments);
        } catch (e$1528) {
            if (extra$1217.errors) {
                extra$1217.errors.push(e$1528);
            } else {
                throw e$1528;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$1279(token$1529) {
        var s$1530;
        if (token$1529.type === Token$1202.EOF) {
            throwError$1275(token$1529, Messages$1206.UnexpectedEOS);
        }
        if (token$1529.type === Token$1202.NumericLiteral) {
            throwError$1275(token$1529, Messages$1206.UnexpectedNumber);
        }
        if (token$1529.type === Token$1202.StringLiteral) {
            throwError$1275(token$1529, Messages$1206.UnexpectedString);
        }
        if (token$1529.type === Token$1202.Identifier) {
            console.log(token$1529);
            throwError$1275(token$1529, Messages$1206.UnexpectedIdentifier);
        }
        if (token$1529.type === Token$1202.Keyword) {
            if (isFutureReservedWord$1239(token$1529.value)) {
                throwError$1275(token$1529, Messages$1206.UnexpectedReserved);
            } else if (strict$1209 && isStrictModeReservedWord$1241(token$1529.value)) {
                throwError$1275(token$1529, Messages$1206.StrictReservedWord);
            }
            throwError$1275(token$1529, Messages$1206.UnexpectedToken, token$1529.value);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$1275(token$1529, Messages$1206.UnexpectedToken, token$1529.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$1281(value$1531) {
        var token$1532 = lex$1269().token;
        if (token$1532.type !== Token$1202.Punctuator || token$1532.value !== value$1531) {
            throwUnexpected$1279(token$1532);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$1283(keyword$1533) {
        var token$1534 = lex$1269().token;
        if (token$1534.type !== Token$1202.Keyword || token$1534.value !== keyword$1533) {
            throwUnexpected$1279(token$1534);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$1285(value$1535) {
        var token$1536 = lookahead$1271().token;
        return token$1536.type === Token$1202.Punctuator && token$1536.value === value$1535;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$1287(keyword$1537) {
        var token$1538 = lookahead$1271().token;
        return token$1538.type === Token$1202.Keyword && token$1538.value === keyword$1537;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$1289() {
        var token$1539 = lookahead$1271().token, op$1540 = token$1539.value;
        if (token$1539.type !== Token$1202.Punctuator) {
            return false;
        }
        return op$1540 === '=' || op$1540 === '*=' || op$1540 === '/=' || op$1540 === '%=' || op$1540 === '+=' || op$1540 === '-=' || op$1540 === '<<=' || op$1540 === '>>=' || op$1540 === '>>>=' || op$1540 === '&=' || op$1540 === '^=' || op$1540 === '|=';
    }
    function consumeSemicolon$1291() {
        var token$1541, line$1542;
        if (tokenStream$1216[index$1210].token.value === ';') {
            lex$1269().token;
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
        line$1542 = tokenStream$1216[index$1210 - 1].token.lineNumber;
        token$1541 = tokenStream$1216[index$1210].token;
        if (line$1542 !== token$1541.lineNumber) {
            return;
        }
        if (token$1541.type !== Token$1202.EOF && !match$1285('}')) {
            throwUnexpected$1279(token$1541);
        }
        return;
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$1293(expr$1543) {
        return expr$1543.type === Syntax$1204.Identifier || expr$1543.type === Syntax$1204.MemberExpression;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$1295() {
        var elements$1544 = [], undef$1545;
        expect$1281('[');
        while (!match$1285(']')) {
            if (match$1285(',')) {
                lex$1269().token;
                elements$1544.push(undef$1545);
            } else {
                elements$1544.push(parseAssignmentExpression$1353());
                if (!match$1285(']')) {
                    expect$1281(',');
                }
            }
        }
        expect$1281(']');
        return {
            type: Syntax$1204.ArrayExpression,
            elements: elements$1544
        };
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$1297(param$1546, first$1547) {
        var previousStrict$1548, body$1549;
        previousStrict$1548 = strict$1209;
        body$1549 = parseFunctionSourceElements$1407();
        if (first$1547 && strict$1209 && isRestrictedWord$1243(param$1546[0].name)) {
            throwError$1275(first$1547, Messages$1206.StrictParamName);
        }
        strict$1209 = previousStrict$1548;
        return {
            type: Syntax$1204.FunctionExpression,
            id: null,
            params: param$1546,
            body: body$1549
        };
    }
    function parseObjectPropertyKey$1299() {
        var token$1550 = lex$1269().token;
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$1550.type === Token$1202.StringLiteral || token$1550.type === Token$1202.NumericLiteral) {
            if (strict$1209 && token$1550.octal) {
                throwError$1275(token$1550, Messages$1206.StrictOctalLiteral);
            }
            return createLiteral$1427(token$1550);
        }
        return {
            type: Syntax$1204.Identifier,
            name: token$1550.value
        };
    }
    function parseObjectProperty$1301() {
        var token$1551, key$1552, id$1553, param$1554;
        token$1551 = lookahead$1271().token;
        if (token$1551.type === Token$1202.Identifier) {
            id$1553 = parseObjectPropertyKey$1299();
            // Property Assignment: Getter and Setter.
            if (token$1551.value === 'get' && !match$1285(':')) {
                key$1552 = parseObjectPropertyKey$1299();
                expect$1281('(');
                expect$1281(')');
                return {
                    type: Syntax$1204.Property,
                    key: key$1552,
                    value: parsePropertyFunction$1297([]),
                    kind: 'get'
                };
            } else if (token$1551.value === 'set' && !match$1285(':')) {
                key$1552 = parseObjectPropertyKey$1299();
                expect$1281('(');
                token$1551 = lookahead$1271().token;
                if (token$1551.type !== Token$1202.Identifier) {
                    throwUnexpected$1279(lex$1269().token);
                }
                param$1554 = [parseVariableIdentifier$1361()];
                expect$1281(')');
                return {
                    type: Syntax$1204.Property,
                    key: key$1552,
                    value: parsePropertyFunction$1297(param$1554, token$1551),
                    kind: 'set'
                };
            } else {
                expect$1281(':');
                return {
                    type: Syntax$1204.Property,
                    key: id$1553,
                    value: parseAssignmentExpression$1353(),
                    kind: 'init'
                };
            }
        } else if (token$1551.type === Token$1202.EOF || token$1551.type === Token$1202.Punctuator) {
            throwUnexpected$1279(token$1551);
        } else {
            key$1552 = parseObjectPropertyKey$1299();
            expect$1281(':');
            return {
                type: Syntax$1204.Property,
                key: key$1552,
                value: parseAssignmentExpression$1353(),
                kind: 'init'
            };
        }
    }
    function parseObjectInitialiser$1303() {
        var token$1555, properties$1556 = [], property$1557, name$1558, kind$1559, map$1560 = {}, toString$1561 = String;
        expect$1281('{');
        while (!match$1285('}')) {
            property$1557 = parseObjectProperty$1301();
            if (property$1557.key.type === Syntax$1204.Identifier) {
                name$1558 = property$1557.key.name;
            } else {
                name$1558 = toString$1561(property$1557.key.value);
            }
            kind$1559 = property$1557.kind === 'init' ? PropertyKind$1205.Data : property$1557.kind === 'get' ? PropertyKind$1205.Get : PropertyKind$1205.Set;
            if (Object.prototype.hasOwnProperty.call(map$1560, name$1558)) {
                if (map$1560[name$1558] === PropertyKind$1205.Data) {
                    if (strict$1209 && kind$1559 === PropertyKind$1205.Data) {
                        throwErrorTolerant$1277({}, Messages$1206.StrictDuplicateProperty);
                    } else if (kind$1559 !== PropertyKind$1205.Data) {
                        throwError$1275({}, Messages$1206.AccessorDataProperty);
                    }
                } else {
                    if (kind$1559 === PropertyKind$1205.Data) {
                        throwError$1275({}, Messages$1206.AccessorDataProperty);
                    } else if (map$1560[name$1558] & kind$1559) {
                        throwError$1275({}, Messages$1206.AccessorGetSet);
                    }
                }
                map$1560[name$1558] |= kind$1559;
            } else {
                map$1560[name$1558] = kind$1559;
            }
            properties$1556.push(property$1557);
            if (!match$1285('}')) {
                expect$1281(',');
            }
        }
        expect$1281('}');
        return {
            type: Syntax$1204.ObjectExpression,
            properties: properties$1556
        };
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$1305() {
        var expr$1562, token$1563 = lookahead$1271().token, type$1564 = token$1563.type;
        if (type$1564 === Token$1202.Identifier) {
            var name$1565 = expander$1201.resolve(lex$1269());
            return {
                type: Syntax$1204.Identifier,
                name: name$1565
            };
        }
        if (type$1564 === Token$1202.StringLiteral || type$1564 === Token$1202.NumericLiteral) {
            if (strict$1209 && token$1563.octal) {
                throwErrorTolerant$1277(token$1563, Messages$1206.StrictOctalLiteral);
            }
            return createLiteral$1427(lex$1269().token);
        }
        if (type$1564 === Token$1202.Keyword) {
            if (matchKeyword$1287('this')) {
                lex$1269().token;
                return { type: Syntax$1204.ThisExpression };
            }
            if (matchKeyword$1287('function')) {
                return parseFunctionExpression$1411();
            }
        }
        if (type$1564 === Token$1202.BooleanLiteral) {
            lex$1269();
            token$1563.value = token$1563.value === 'true';
            return createLiteral$1427(token$1563);
        }
        if (type$1564 === Token$1202.NullLiteral) {
            lex$1269();
            token$1563.value = null;
            return createLiteral$1427(token$1563);
        }
        if (match$1285('[')) {
            return parseArrayInitialiser$1295();
        }
        if (match$1285('{')) {
            return parseObjectInitialiser$1303();
        }
        if (match$1285('(')) {
            lex$1269();
            state$1215.lastParenthesized = expr$1562 = parseExpression$1355();
            expect$1281(')');
            return expr$1562;
        }
        if (token$1563.value instanceof RegExp) {
            return createLiteral$1427(lex$1269().token);
        }
        return throwUnexpected$1279(lex$1269().token);
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$1307() {
        var args$1566 = [];
        expect$1281('(');
        if (!match$1285(')')) {
            while (index$1210 < length$1213) {
                args$1566.push(parseAssignmentExpression$1353());
                if (match$1285(')')) {
                    break;
                }
                expect$1281(',');
            }
        }
        expect$1281(')');
        return args$1566;
    }
    function parseNonComputedProperty$1309() {
        var token$1567 = lex$1269().token;
        if (!isIdentifierName$1265(token$1567)) {
            throwUnexpected$1279(token$1567);
        }
        return {
            type: Syntax$1204.Identifier,
            name: token$1567.value
        };
    }
    function parseNonComputedMember$1311(object$1568) {
        return {
            type: Syntax$1204.MemberExpression,
            computed: false,
            object: object$1568,
            property: parseNonComputedProperty$1309()
        };
    }
    function parseComputedMember$1313(object$1569) {
        var property$1570, expr$1571;
        expect$1281('[');
        property$1570 = parseExpression$1355();
        expr$1571 = {
            type: Syntax$1204.MemberExpression,
            computed: true,
            object: object$1569,
            property: property$1570
        };
        expect$1281(']');
        return expr$1571;
    }
    function parseCallMember$1315(object$1572) {
        return {
            type: Syntax$1204.CallExpression,
            callee: object$1572,
            'arguments': parseArguments$1307()
        };
    }
    function parseNewExpression$1317() {
        var expr$1573;
        expectKeyword$1283('new');
        expr$1573 = {
            type: Syntax$1204.NewExpression,
            callee: parseLeftHandSideExpression$1325(),
            'arguments': []
        };
        if (match$1285('(')) {
            expr$1573['arguments'] = parseArguments$1307();
        }
        return expr$1573;
    }
    // sort of broken, only accepts literals
    // pretty sure the use of toString will bite me
    function toArrayNode$1319(arr$1574) {
        var els$1576 = arr$1574.map(function (el$1577) {
                return {
                    type: 'Literal',
                    value: el$1577,
                    raw: el$1577.toString()
                };
            });
        return {
            type: 'ArrayExpression',
            elements: els$1576
        };
    }
    function toObjectNode$1321(obj$1578) {
        // todo: hacky, fixup
        var props$1580 = Object.keys(obj$1578).map(function (key$1581) {
                var raw$1582 = obj$1578[key$1581];
                var value$1583;
                if (Array.isArray(raw$1582)) {
                    value$1583 = toArrayNode$1319(raw$1582);
                } else {
                    value$1583 = {
                        type: 'Literal',
                        value: obj$1578[key$1581],
                        raw: obj$1578[key$1581].toString()
                    };
                }
                return {
                    type: 'Property',
                    key: {
                        type: 'Identifier',
                        name: key$1581
                    },
                    value: value$1583,
                    kind: 'init'
                };
            });
        return {
            type: 'ObjectExpression',
            properties: props$1580
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
    function parseLeftHandSideExpressionAllowCall$1323() {
        var useNew$1584, expr$1585;
        useNew$1584 = matchKeyword$1287('new');
        expr$1585 = useNew$1584 ? parseNewExpression$1317() : parsePrimaryExpression$1305();
        // handle "syntax" primitive
        // todo: error handling
        // if(expr.name === "syntax") {
        //     return parseSyntaxObject();
        // }
        while (index$1210 < length$1213) {
            if (match$1285('.')) {
                lex$1269();
                expr$1585 = parseNonComputedMember$1311(expr$1585);
            } else if (match$1285('[')) {
                expr$1585 = parseComputedMember$1313(expr$1585);
            } else if (match$1285('(')) {
                expr$1585 = parseCallMember$1315(expr$1585);
            } else {
                break;
            }
        }
        return expr$1585;
    }
    function parseLeftHandSideExpression$1325() {
        var useNew$1586, expr$1587;
        useNew$1586 = matchKeyword$1287('new');
        expr$1587 = useNew$1586 ? parseNewExpression$1317() : parsePrimaryExpression$1305();
        while (index$1210 < length$1213) {
            if (match$1285('.')) {
                lex$1269();
                expr$1587 = parseNonComputedMember$1311(expr$1587);
            } else if (match$1285('[')) {
                expr$1587 = parseComputedMember$1313(expr$1587);
            } else {
                break;
            }
        }
        return expr$1587;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$1327() {
        var expr$1588 = parseLeftHandSideExpressionAllowCall$1323();
        if ((match$1285('++') || match$1285('--')) && !peekLineTerminator$1273()) {
            // 11.3.1, 11.3.2
            if (strict$1209 && expr$1588.type === Syntax$1204.Identifier && isRestrictedWord$1243(expr$1588.name)) {
                throwError$1275({}, Messages$1206.StrictLHSPostfix);
            }
            if (!isLeftHandSide$1293(expr$1588)) {
                throwError$1275({}, Messages$1206.InvalidLHSInAssignment);
            }
            expr$1588 = {
                type: Syntax$1204.UpdateExpression,
                operator: lex$1269().token.value,
                argument: expr$1588,
                prefix: false
            };
        }
        return expr$1588;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$1329() {
        var token$1589, expr$1590;
        if (match$1285('++') || match$1285('--')) {
            token$1589 = lex$1269().token;
            expr$1590 = parseUnaryExpression$1329();
            // 11.4.4, 11.4.5
            if (strict$1209 && expr$1590.type === Syntax$1204.Identifier && isRestrictedWord$1243(expr$1590.name)) {
                throwError$1275({}, Messages$1206.StrictLHSPrefix);
            }
            if (!isLeftHandSide$1293(expr$1590)) {
                throwError$1275({}, Messages$1206.InvalidLHSInAssignment);
            }
            expr$1590 = {
                type: Syntax$1204.UpdateExpression,
                operator: token$1589.value,
                argument: expr$1590,
                prefix: true
            };
            return expr$1590;
        }
        if (match$1285('+') || match$1285('-') || match$1285('~') || match$1285('!')) {
            expr$1590 = {
                type: Syntax$1204.UnaryExpression,
                operator: lex$1269().token.value,
                argument: parseUnaryExpression$1329()
            };
            return expr$1590;
        }
        if (matchKeyword$1287('delete') || matchKeyword$1287('void') || matchKeyword$1287('typeof')) {
            expr$1590 = {
                type: Syntax$1204.UnaryExpression,
                operator: lex$1269().token.value,
                argument: parseUnaryExpression$1329()
            };
            if (strict$1209 && expr$1590.operator === 'delete' && expr$1590.argument.type === Syntax$1204.Identifier) {
                throwErrorTolerant$1277({}, Messages$1206.StrictDelete);
            }
            return expr$1590;
        }
        return parsePostfixExpression$1327();
    }
    // 11.5 Multiplicative Operators
    function parseMultiplicativeExpression$1331() {
        var expr$1591 = parseUnaryExpression$1329();
        while (match$1285('*') || match$1285('/') || match$1285('%')) {
            expr$1591 = {
                type: Syntax$1204.BinaryExpression,
                operator: lex$1269().token.value,
                left: expr$1591,
                right: parseUnaryExpression$1329()
            };
        }
        return expr$1591;
    }
    // 11.6 Additive Operators
    function parseAdditiveExpression$1333() {
        var expr$1592 = parseMultiplicativeExpression$1331();
        while (match$1285('+') || match$1285('-')) {
            expr$1592 = {
                type: Syntax$1204.BinaryExpression,
                operator: lex$1269().token.value,
                left: expr$1592,
                right: parseMultiplicativeExpression$1331()
            };
        }
        return expr$1592;
    }
    // 11.7 Bitwise Shift Operators
    function parseShiftExpression$1335() {
        var expr$1593 = parseAdditiveExpression$1333();
        while (match$1285('<<') || match$1285('>>') || match$1285('>>>')) {
            expr$1593 = {
                type: Syntax$1204.BinaryExpression,
                operator: lex$1269().token.value,
                left: expr$1593,
                right: parseAdditiveExpression$1333()
            };
        }
        return expr$1593;
    }
    // 11.8 Relational Operators
    function parseRelationalExpression$1337() {
        var expr$1594, previousAllowIn$1595;
        previousAllowIn$1595 = state$1215.allowIn;
        state$1215.allowIn = true;
        expr$1594 = parseShiftExpression$1335();
        while (match$1285('<') || match$1285('>') || match$1285('<=') || match$1285('>=') || previousAllowIn$1595 && matchKeyword$1287('in') || matchKeyword$1287('instanceof')) {
            expr$1594 = {
                type: Syntax$1204.BinaryExpression,
                operator: lex$1269().token.value,
                left: expr$1594,
                right: parseRelationalExpression$1337()
            };
        }
        state$1215.allowIn = previousAllowIn$1595;
        return expr$1594;
    }
    // 11.9 Equality Operators
    function parseEqualityExpression$1339() {
        var expr$1596 = parseRelationalExpression$1337();
        while (match$1285('==') || match$1285('!=') || match$1285('===') || match$1285('!==')) {
            expr$1596 = {
                type: Syntax$1204.BinaryExpression,
                operator: lex$1269().token.value,
                left: expr$1596,
                right: parseRelationalExpression$1337()
            };
        }
        return expr$1596;
    }
    // 11.10 Binary Bitwise Operators
    function parseBitwiseANDExpression$1341() {
        var expr$1597 = parseEqualityExpression$1339();
        while (match$1285('&')) {
            lex$1269();
            expr$1597 = {
                type: Syntax$1204.BinaryExpression,
                operator: '&',
                left: expr$1597,
                right: parseEqualityExpression$1339()
            };
        }
        return expr$1597;
    }
    function parseBitwiseXORExpression$1343() {
        var expr$1598 = parseBitwiseANDExpression$1341();
        while (match$1285('^')) {
            lex$1269();
            expr$1598 = {
                type: Syntax$1204.BinaryExpression,
                operator: '^',
                left: expr$1598,
                right: parseBitwiseANDExpression$1341()
            };
        }
        return expr$1598;
    }
    function parseBitwiseORExpression$1345() {
        var expr$1599 = parseBitwiseXORExpression$1343();
        while (match$1285('|')) {
            lex$1269();
            expr$1599 = {
                type: Syntax$1204.BinaryExpression,
                operator: '|',
                left: expr$1599,
                right: parseBitwiseXORExpression$1343()
            };
        }
        return expr$1599;
    }
    // 11.11 Binary Logical Operators
    function parseLogicalANDExpression$1347() {
        var expr$1600 = parseBitwiseORExpression$1345();
        while (match$1285('&&')) {
            lex$1269();
            expr$1600 = {
                type: Syntax$1204.LogicalExpression,
                operator: '&&',
                left: expr$1600,
                right: parseBitwiseORExpression$1345()
            };
        }
        return expr$1600;
    }
    function parseLogicalORExpression$1349() {
        var expr$1601 = parseLogicalANDExpression$1347();
        while (match$1285('||')) {
            lex$1269();
            expr$1601 = {
                type: Syntax$1204.LogicalExpression,
                operator: '||',
                left: expr$1601,
                right: parseLogicalANDExpression$1347()
            };
        }
        return expr$1601;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$1351() {
        var expr$1602, previousAllowIn$1603, consequent$1604;
        expr$1602 = parseLogicalORExpression$1349();
        if (match$1285('?')) {
            lex$1269();
            previousAllowIn$1603 = state$1215.allowIn;
            state$1215.allowIn = true;
            consequent$1604 = parseAssignmentExpression$1353();
            state$1215.allowIn = previousAllowIn$1603;
            expect$1281(':');
            expr$1602 = {
                type: Syntax$1204.ConditionalExpression,
                test: expr$1602,
                consequent: consequent$1604,
                alternate: parseAssignmentExpression$1353()
            };
        }
        return expr$1602;
    }
    // 11.13 Assignment Operators
    function parseAssignmentExpression$1353() {
        var expr$1605;
        expr$1605 = parseConditionalExpression$1351();
        if (matchAssign$1289()) {
            // LeftHandSideExpression
            if (!isLeftHandSide$1293(expr$1605)) {
                throwError$1275({}, Messages$1206.InvalidLHSInAssignment);
            }
            // 11.13.1
            if (strict$1209 && expr$1605.type === Syntax$1204.Identifier && isRestrictedWord$1243(expr$1605.name)) {
                throwError$1275({}, Messages$1206.StrictLHSAssignment);
            }
            expr$1605 = {
                type: Syntax$1204.AssignmentExpression,
                operator: lex$1269().token.value,
                left: expr$1605,
                right: parseAssignmentExpression$1353()
            };
        }
        return expr$1605;
    }
    // 11.14 Comma Operator
    function parseExpression$1355() {
        var expr$1606 = parseAssignmentExpression$1353();
        if (match$1285(',')) {
            expr$1606 = {
                type: Syntax$1204.SequenceExpression,
                expressions: [expr$1606]
            };
            while (index$1210 < length$1213) {
                if (!match$1285(',')) {
                    break;
                }
                lex$1269();
                expr$1606.expressions.push(parseAssignmentExpression$1353());
            }
        }
        return expr$1606;
    }
    // 12.1 Block
    function parseStatementList$1357() {
        var list$1607 = [], statement$1608;
        while (index$1210 < length$1213) {
            if (match$1285('}')) {
                break;
            }
            statement$1608 = parseSourceElement$1413();
            if (typeof statement$1608 === 'undefined') {
                break;
            }
            list$1607.push(statement$1608);
        }
        return list$1607;
    }
    function parseBlock$1359() {
        var block$1609;
        expect$1281('{');
        block$1609 = parseStatementList$1357();
        expect$1281('}');
        return {
            type: Syntax$1204.BlockStatement,
            body: block$1609
        };
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$1361() {
        var stx$1610 = lex$1269(), token$1611 = stx$1610.token;
        if (token$1611.type !== Token$1202.Identifier) {
            throwUnexpected$1279(token$1611);
        }
        var name$1612 = expander$1201.resolve(stx$1610);
        return {
            type: Syntax$1204.Identifier,
            name: name$1612
        };
    }
    function parseVariableDeclaration$1363(kind$1613) {
        var id$1614 = parseVariableIdentifier$1361(), init$1615 = null;
        // 12.2.1
        if (strict$1209 && isRestrictedWord$1243(id$1614.name)) {
            throwErrorTolerant$1277({}, Messages$1206.StrictVarName);
        }
        if (kind$1613 === 'const') {
            expect$1281('=');
            init$1615 = parseAssignmentExpression$1353();
        } else if (match$1285('=')) {
            lex$1269();
            init$1615 = parseAssignmentExpression$1353();
        }
        return {
            type: Syntax$1204.VariableDeclarator,
            id: id$1614,
            init: init$1615
        };
    }
    function parseVariableDeclarationList$1365(kind$1616) {
        var list$1617 = [];
        while (index$1210 < length$1213) {
            list$1617.push(parseVariableDeclaration$1363(kind$1616));
            if (!match$1285(',')) {
                break;
            }
            lex$1269();
        }
        return list$1617;
    }
    function parseVariableStatement$1367() {
        var declarations$1618;
        expectKeyword$1283('var');
        declarations$1618 = parseVariableDeclarationList$1365();
        consumeSemicolon$1291();
        return {
            type: Syntax$1204.VariableDeclaration,
            declarations: declarations$1618,
            kind: 'var'
        };
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$1369(kind$1619) {
        var declarations$1620;
        expectKeyword$1283(kind$1619);
        declarations$1620 = parseVariableDeclarationList$1365(kind$1619);
        consumeSemicolon$1291();
        return {
            type: Syntax$1204.VariableDeclaration,
            declarations: declarations$1620,
            kind: kind$1619
        };
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$1371() {
        expect$1281(';');
        return { type: Syntax$1204.EmptyStatement };
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$1373() {
        var expr$1621 = parseExpression$1355();
        consumeSemicolon$1291();
        return {
            type: Syntax$1204.ExpressionStatement,
            expression: expr$1621
        };
    }
    // 12.5 If statement
    function parseIfStatement$1375() {
        var test$1622, consequent$1623, alternate$1624;
        expectKeyword$1283('if');
        expect$1281('(');
        test$1622 = parseExpression$1355();
        expect$1281(')');
        consequent$1623 = parseStatement$1405();
        if (matchKeyword$1287('else')) {
            lex$1269();
            alternate$1624 = parseStatement$1405();
        } else {
            alternate$1624 = null;
        }
        return {
            type: Syntax$1204.IfStatement,
            test: test$1622,
            consequent: consequent$1623,
            alternate: alternate$1624
        };
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$1377() {
        var body$1625, test$1626, oldInIteration$1627;
        expectKeyword$1283('do');
        oldInIteration$1627 = state$1215.inIteration;
        state$1215.inIteration = true;
        body$1625 = parseStatement$1405();
        state$1215.inIteration = oldInIteration$1627;
        expectKeyword$1283('while');
        expect$1281('(');
        test$1626 = parseExpression$1355();
        expect$1281(')');
        if (match$1285(';')) {
            lex$1269();
        }
        return {
            type: Syntax$1204.DoWhileStatement,
            body: body$1625,
            test: test$1626
        };
    }
    function parseWhileStatement$1379() {
        var test$1628, body$1629, oldInIteration$1630;
        expectKeyword$1283('while');
        expect$1281('(');
        test$1628 = parseExpression$1355();
        expect$1281(')');
        oldInIteration$1630 = state$1215.inIteration;
        state$1215.inIteration = true;
        body$1629 = parseStatement$1405();
        state$1215.inIteration = oldInIteration$1630;
        return {
            type: Syntax$1204.WhileStatement,
            test: test$1628,
            body: body$1629
        };
    }
    function parseForVariableDeclaration$1381() {
        var token$1631 = lex$1269().token;
        return {
            type: Syntax$1204.VariableDeclaration,
            declarations: parseVariableDeclarationList$1365(),
            kind: token$1631.value
        };
    }
    function parseForStatement$1383() {
        var init$1632, test$1633, update$1634, left$1635, right$1636, body$1637, oldInIteration$1638;
        init$1632 = test$1633 = update$1634 = null;
        expectKeyword$1283('for');
        expect$1281('(');
        if (match$1285(';')) {
            lex$1269();
        } else {
            if (matchKeyword$1287('var') || matchKeyword$1287('let')) {
                state$1215.allowIn = false;
                init$1632 = parseForVariableDeclaration$1381();
                state$1215.allowIn = true;
                if (init$1632.declarations.length === 1 && matchKeyword$1287('in')) {
                    lex$1269();
                    left$1635 = init$1632;
                    right$1636 = parseExpression$1355();
                    init$1632 = null;
                }
            } else {
                state$1215.allowIn = false;
                init$1632 = parseExpression$1355();
                state$1215.allowIn = true;
                if (matchKeyword$1287('in')) {
                    // LeftHandSideExpression
                    if (!isLeftHandSide$1293(init$1632)) {
                        throwError$1275({}, Messages$1206.InvalidLHSInForIn);
                    }
                    lex$1269();
                    left$1635 = init$1632;
                    right$1636 = parseExpression$1355();
                    init$1632 = null;
                }
            }
            if (typeof left$1635 === 'undefined') {
                expect$1281(';');
            }
        }
        if (typeof left$1635 === 'undefined') {
            if (!match$1285(';')) {
                test$1633 = parseExpression$1355();
            }
            expect$1281(';');
            if (!match$1285(')')) {
                update$1634 = parseExpression$1355();
            }
        }
        expect$1281(')');
        oldInIteration$1638 = state$1215.inIteration;
        state$1215.inIteration = true;
        body$1637 = parseStatement$1405();
        state$1215.inIteration = oldInIteration$1638;
        if (typeof left$1635 === 'undefined') {
            return {
                type: Syntax$1204.ForStatement,
                init: init$1632,
                test: test$1633,
                update: update$1634,
                body: body$1637
            };
        }
        return {
            type: Syntax$1204.ForInStatement,
            left: left$1635,
            right: right$1636,
            body: body$1637,
            each: false
        };
    }
    // 12.7 The continue statement
    function parseContinueStatement$1385() {
        var token$1639, label$1640 = null;
        expectKeyword$1283('continue');
        // Optimize the most common form: 'continue;'.
        if (tokenStream$1216[index$1210].token.value === ';') {
            lex$1269();
            if (!state$1215.inIteration) {
                throwError$1275({}, Messages$1206.IllegalContinue);
            }
            return {
                type: Syntax$1204.ContinueStatement,
                label: null
            };
        }
        if (peekLineTerminator$1273()) {
            if (!state$1215.inIteration) {
                throwError$1275({}, Messages$1206.IllegalContinue);
            }
            return {
                type: Syntax$1204.ContinueStatement,
                label: null
            };
        }
        token$1639 = lookahead$1271().token;
        if (token$1639.type === Token$1202.Identifier) {
            label$1640 = parseVariableIdentifier$1361();
            if (!Object.prototype.hasOwnProperty.call(state$1215.labelSet, label$1640.name)) {
                throwError$1275({}, Messages$1206.UnknownLabel, label$1640.name);
            }
        }
        consumeSemicolon$1291();
        if (label$1640 === null && !state$1215.inIteration) {
            throwError$1275({}, Messages$1206.IllegalContinue);
        }
        return {
            type: Syntax$1204.ContinueStatement,
            label: label$1640
        };
    }
    // 12.8 The break statement
    function parseBreakStatement$1387() {
        var token$1641, label$1642 = null;
        expectKeyword$1283('break');
        if (peekLineTerminator$1273()) {
            if (!(state$1215.inIteration || state$1215.inSwitch)) {
                throwError$1275({}, Messages$1206.IllegalBreak);
            }
            return {
                type: Syntax$1204.BreakStatement,
                label: null
            };
        }
        token$1641 = lookahead$1271().token;
        if (token$1641.type === Token$1202.Identifier) {
            label$1642 = parseVariableIdentifier$1361();
            if (!Object.prototype.hasOwnProperty.call(state$1215.labelSet, label$1642.name)) {
                throwError$1275({}, Messages$1206.UnknownLabel, label$1642.name);
            }
        }
        consumeSemicolon$1291();
        if (label$1642 === null && !(state$1215.inIteration || state$1215.inSwitch)) {
            throwError$1275({}, Messages$1206.IllegalBreak);
        }
        return {
            type: Syntax$1204.BreakStatement,
            label: label$1642
        };
    }
    // 12.9 The return statement
    function parseReturnStatement$1389() {
        var token$1643, argument$1644 = null;
        expectKeyword$1283('return');
        if (!state$1215.inFunctionBody) {
            throwErrorTolerant$1277({}, Messages$1206.IllegalReturn);
        }
        if (peekLineTerminator$1273()) {
            return {
                type: Syntax$1204.ReturnStatement,
                argument: null
            };
        }
        if (!match$1285(';')) {
            token$1643 = lookahead$1271().token;
            if (!match$1285('}') && token$1643.type !== Token$1202.EOF) {
                argument$1644 = parseExpression$1355();
            }
        }
        consumeSemicolon$1291();
        return {
            type: Syntax$1204.ReturnStatement,
            argument: argument$1644
        };
    }
    // 12.10 The with statement
    function parseWithStatement$1391() {
        var object$1645, body$1646;
        if (strict$1209) {
            throwErrorTolerant$1277({}, Messages$1206.StrictModeWith);
        }
        expectKeyword$1283('with');
        expect$1281('(');
        object$1645 = parseExpression$1355();
        expect$1281(')');
        body$1646 = parseStatement$1405();
        return {
            type: Syntax$1204.WithStatement,
            object: object$1645,
            body: body$1646
        };
    }
    // 12.10 The swith statement
    function parseSwitchCase$1393() {
        var test$1647, consequent$1648 = [], statement$1649;
        if (matchKeyword$1287('default')) {
            lex$1269();
            test$1647 = null;
        } else {
            expectKeyword$1283('case');
            test$1647 = parseExpression$1355();
        }
        expect$1281(':');
        while (index$1210 < length$1213) {
            if (match$1285('}') || matchKeyword$1287('default') || matchKeyword$1287('case')) {
                break;
            }
            statement$1649 = parseStatement$1405();
            if (typeof statement$1649 === 'undefined') {
                break;
            }
            consequent$1648.push(statement$1649);
        }
        return {
            type: Syntax$1204.SwitchCase,
            test: test$1647,
            consequent: consequent$1648
        };
    }
    function parseSwitchStatement$1395() {
        var discriminant$1650, cases$1651, oldInSwitch$1652;
        expectKeyword$1283('switch');
        expect$1281('(');
        discriminant$1650 = parseExpression$1355();
        expect$1281(')');
        expect$1281('{');
        if (match$1285('}')) {
            lex$1269();
            return {
                type: Syntax$1204.SwitchStatement,
                discriminant: discriminant$1650
            };
        }
        cases$1651 = [];
        oldInSwitch$1652 = state$1215.inSwitch;
        state$1215.inSwitch = true;
        while (index$1210 < length$1213) {
            if (match$1285('}')) {
                break;
            }
            cases$1651.push(parseSwitchCase$1393());
        }
        state$1215.inSwitch = oldInSwitch$1652;
        expect$1281('}');
        return {
            type: Syntax$1204.SwitchStatement,
            discriminant: discriminant$1650,
            cases: cases$1651
        };
    }
    // 12.13 The throw statement
    function parseThrowStatement$1397() {
        var argument$1653;
        expectKeyword$1283('throw');
        if (peekLineTerminator$1273()) {
            throwError$1275({}, Messages$1206.NewlineAfterThrow);
        }
        argument$1653 = parseExpression$1355();
        consumeSemicolon$1291();
        return {
            type: Syntax$1204.ThrowStatement,
            argument: argument$1653
        };
    }
    // 12.14 The try statement
    function parseCatchClause$1399() {
        var param$1654;
        expectKeyword$1283('catch');
        expect$1281('(');
        if (!match$1285(')')) {
            param$1654 = parseExpression$1355();
            // 12.14.1
            if (strict$1209 && param$1654.type === Syntax$1204.Identifier && isRestrictedWord$1243(param$1654.name)) {
                throwErrorTolerant$1277({}, Messages$1206.StrictCatchVariable);
            }
        }
        expect$1281(')');
        return {
            type: Syntax$1204.CatchClause,
            param: param$1654,
            guard: null,
            body: parseBlock$1359()
        };
    }
    function parseTryStatement$1401() {
        var block$1655, handlers$1656 = [], finalizer$1657 = null;
        expectKeyword$1283('try');
        block$1655 = parseBlock$1359();
        if (matchKeyword$1287('catch')) {
            handlers$1656.push(parseCatchClause$1399());
        }
        if (matchKeyword$1287('finally')) {
            lex$1269();
            finalizer$1657 = parseBlock$1359();
        }
        if (handlers$1656.length === 0 && !finalizer$1657) {
            throwError$1275({}, Messages$1206.NoCatchOrFinally);
        }
        return {
            type: Syntax$1204.TryStatement,
            block: block$1655,
            handlers: handlers$1656,
            finalizer: finalizer$1657
        };
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$1403() {
        expectKeyword$1283('debugger');
        consumeSemicolon$1291();
        return { type: Syntax$1204.DebuggerStatement };
    }
    // 12 Statements
    function parseStatement$1405() {
        var token$1658 = lookahead$1271().token, expr$1659, labeledBody$1660;
        if (token$1658.type === Token$1202.EOF) {
            throwUnexpected$1279(token$1658);
        }
        if (token$1658.type === Token$1202.Punctuator) {
            switch (token$1658.value) {
            case ';':
                return parseEmptyStatement$1371();
            case '{':
                return parseBlock$1359();
            case '(':
                return parseExpressionStatement$1373();
            default:
                break;
            }
        }
        if (token$1658.type === Token$1202.Keyword) {
            switch (token$1658.value) {
            case 'break':
                return parseBreakStatement$1387();
            case 'continue':
                return parseContinueStatement$1385();
            case 'debugger':
                return parseDebuggerStatement$1403();
            case 'do':
                return parseDoWhileStatement$1377();
            case 'for':
                return parseForStatement$1383();
            case 'function':
                return parseFunctionDeclaration$1409();
            case 'if':
                return parseIfStatement$1375();
            case 'return':
                return parseReturnStatement$1389();
            case 'switch':
                return parseSwitchStatement$1395();
            case 'throw':
                return parseThrowStatement$1397();
            case 'try':
                return parseTryStatement$1401();
            case 'var':
                return parseVariableStatement$1367();
            case 'while':
                return parseWhileStatement$1379();
            case 'with':
                return parseWithStatement$1391();
            default:
                break;
            }
        }
        expr$1659 = parseExpression$1355();
        // 12.12 Labelled Statements
        if (expr$1659.type === Syntax$1204.Identifier && match$1285(':')) {
            lex$1269();
            if (Object.prototype.hasOwnProperty.call(state$1215.labelSet, expr$1659.name)) {
                throwError$1275({}, Messages$1206.Redeclaration, 'Label', expr$1659.name);
            }
            state$1215.labelSet[expr$1659.name] = true;
            labeledBody$1660 = parseStatement$1405();
            delete state$1215.labelSet[expr$1659.name];
            return {
                type: Syntax$1204.LabeledStatement,
                label: expr$1659,
                body: labeledBody$1660
            };
        }
        consumeSemicolon$1291();
        return {
            type: Syntax$1204.ExpressionStatement,
            expression: expr$1659
        };
    }
    // 13 Function Definition
    function parseFunctionSourceElements$1407() {
        var sourceElement$1661, sourceElements$1662 = [], token$1663, directive$1664, firstRestricted$1665, oldLabelSet$1666, oldInIteration$1667, oldInSwitch$1668, oldInFunctionBody$1669;
        expect$1281('{');
        while (index$1210 < length$1213) {
            token$1663 = lookahead$1271().token;
            if (token$1663.type !== Token$1202.StringLiteral) {
                break;
            }
            sourceElement$1661 = parseSourceElement$1413();
            sourceElements$1662.push(sourceElement$1661);
            if (sourceElement$1661.expression.type !== Syntax$1204.Literal) {
                // this is not directive
                break;
            }
            directive$1664 = sliceSource$1223(token$1663.range[0] + 1, token$1663.range[1] - 1);
            if (directive$1664 === 'use strict') {
                strict$1209 = true;
                if (firstRestricted$1665) {
                    throwError$1275(firstRestricted$1665, Messages$1206.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1665 && token$1663.octal) {
                    firstRestricted$1665 = token$1663;
                }
            }
        }
        oldLabelSet$1666 = state$1215.labelSet;
        oldInIteration$1667 = state$1215.inIteration;
        oldInSwitch$1668 = state$1215.inSwitch;
        oldInFunctionBody$1669 = state$1215.inFunctionBody;
        state$1215.labelSet = {};
        state$1215.inIteration = false;
        state$1215.inSwitch = false;
        state$1215.inFunctionBody = true;
        while (index$1210 < length$1213) {
            if (match$1285('}')) {
                break;
            }
            sourceElement$1661 = parseSourceElement$1413();
            if (typeof sourceElement$1661 === 'undefined') {
                break;
            }
            sourceElements$1662.push(sourceElement$1661);
        }
        expect$1281('}');
        state$1215.labelSet = oldLabelSet$1666;
        state$1215.inIteration = oldInIteration$1667;
        state$1215.inSwitch = oldInSwitch$1668;
        state$1215.inFunctionBody = oldInFunctionBody$1669;
        return {
            type: Syntax$1204.BlockStatement,
            body: sourceElements$1662
        };
    }
    function parseFunctionDeclaration$1409() {
        var id$1670, param$1671, params$1672 = [], body$1673, token$1674, firstRestricted$1675, message$1676, previousStrict$1677, paramSet$1678;
        expectKeyword$1283('function');
        token$1674 = lookahead$1271().token;
        id$1670 = parseVariableIdentifier$1361();
        if (strict$1209) {
            if (isRestrictedWord$1243(token$1674.value)) {
                throwError$1275(token$1674, Messages$1206.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$1243(token$1674.value)) {
                firstRestricted$1675 = token$1674;
                message$1676 = Messages$1206.StrictFunctionName;
            } else if (isStrictModeReservedWord$1241(token$1674.value)) {
                firstRestricted$1675 = token$1674;
                message$1676 = Messages$1206.StrictReservedWord;
            }
        }
        expect$1281('(');
        if (!match$1285(')')) {
            paramSet$1678 = {};
            while (index$1210 < length$1213) {
                token$1674 = lookahead$1271().token;
                param$1671 = parseVariableIdentifier$1361();
                if (strict$1209) {
                    if (isRestrictedWord$1243(token$1674.value)) {
                        throwError$1275(token$1674, Messages$1206.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$1678, token$1674.value)) {
                        throwError$1275(token$1674, Messages$1206.StrictParamDupe);
                    }
                } else if (!firstRestricted$1675) {
                    if (isRestrictedWord$1243(token$1674.value)) {
                        firstRestricted$1675 = token$1674;
                        message$1676 = Messages$1206.StrictParamName;
                    } else if (isStrictModeReservedWord$1241(token$1674.value)) {
                        firstRestricted$1675 = token$1674;
                        message$1676 = Messages$1206.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$1678, token$1674.value)) {
                        firstRestricted$1675 = token$1674;
                        message$1676 = Messages$1206.StrictParamDupe;
                    }
                }
                params$1672.push(param$1671);
                paramSet$1678[param$1671.name] = true;
                if (match$1285(')')) {
                    break;
                }
                expect$1281(',');
            }
        }
        expect$1281(')');
        previousStrict$1677 = strict$1209;
        body$1673 = parseFunctionSourceElements$1407();
        if (strict$1209 && firstRestricted$1675) {
            throwError$1275(firstRestricted$1675, message$1676);
        }
        strict$1209 = previousStrict$1677;
        return {
            type: Syntax$1204.FunctionDeclaration,
            id: id$1670,
            params: params$1672,
            body: body$1673
        };
    }
    function parseFunctionExpression$1411() {
        var token$1679, id$1680 = null, firstRestricted$1681, message$1682, param$1683, params$1684 = [], body$1685, previousStrict$1686, paramSet$1687;
        expectKeyword$1283('function');
        if (!match$1285('(')) {
            token$1679 = lookahead$1271().token;
            id$1680 = parseVariableIdentifier$1361();
            if (strict$1209) {
                if (isRestrictedWord$1243(token$1679.value)) {
                    throwError$1275(token$1679, Messages$1206.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$1243(token$1679.value)) {
                    firstRestricted$1681 = token$1679;
                    message$1682 = Messages$1206.StrictFunctionName;
                } else if (isStrictModeReservedWord$1241(token$1679.value)) {
                    firstRestricted$1681 = token$1679;
                    message$1682 = Messages$1206.StrictReservedWord;
                }
            }
        }
        expect$1281('(');
        if (!match$1285(')')) {
            paramSet$1687 = {};
            while (index$1210 < length$1213) {
                token$1679 = lookahead$1271().token;
                param$1683 = parseVariableIdentifier$1361();
                if (strict$1209) {
                    if (isRestrictedWord$1243(token$1679.value)) {
                        throwError$1275(token$1679, Messages$1206.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$1687, token$1679.value)) {
                        throwError$1275(token$1679, Messages$1206.StrictParamDupe);
                    }
                } else if (!firstRestricted$1681) {
                    if (isRestrictedWord$1243(token$1679.value)) {
                        firstRestricted$1681 = token$1679;
                        message$1682 = Messages$1206.StrictParamName;
                    } else if (isStrictModeReservedWord$1241(token$1679.value)) {
                        firstRestricted$1681 = token$1679;
                        message$1682 = Messages$1206.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$1687, token$1679.value)) {
                        firstRestricted$1681 = token$1679;
                        message$1682 = Messages$1206.StrictParamDupe;
                    }
                }
                params$1684.push(param$1683);
                paramSet$1687[param$1683.name] = true;
                if (match$1285(')')) {
                    break;
                }
                expect$1281(',');
            }
        }
        expect$1281(')');
        previousStrict$1686 = strict$1209;
        body$1685 = parseFunctionSourceElements$1407();
        if (strict$1209 && firstRestricted$1681) {
            throwError$1275(firstRestricted$1681, message$1682);
        }
        strict$1209 = previousStrict$1686;
        return {
            type: Syntax$1204.FunctionExpression,
            id: id$1680,
            params: params$1684,
            body: body$1685
        };
    }
    // 14 Program
    function parseSourceElement$1413() {
        var token$1688 = lookahead$1271().token;
        if (token$1688.type === Token$1202.Keyword) {
            switch (token$1688.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$1369(token$1688.value);
            case 'function':
                return parseFunctionDeclaration$1409();
            default:
                return parseStatement$1405();
            }
        }
        if (token$1688.type !== Token$1202.EOF) {
            return parseStatement$1405();
        }
    }
    function parseSourceElements$1415() {
        var sourceElement$1689, sourceElements$1690 = [], token$1691, directive$1692, firstRestricted$1693;
        while (index$1210 < length$1213) {
            token$1691 = lookahead$1271();
            if (token$1691.type !== Token$1202.StringLiteral) {
                break;
            }
            sourceElement$1689 = parseSourceElement$1413();
            sourceElements$1690.push(sourceElement$1689);
            if (sourceElement$1689.expression.type !== Syntax$1204.Literal) {
                // this is not directive
                break;
            }
            directive$1692 = sliceSource$1223(token$1691.range[0] + 1, token$1691.range[1] - 1);
            if (directive$1692 === 'use strict') {
                strict$1209 = true;
                if (firstRestricted$1693) {
                    throwError$1275(firstRestricted$1693, Messages$1206.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1693 && token$1691.octal) {
                    firstRestricted$1693 = token$1691;
                }
            }
        }
        while (index$1210 < length$1213) {
            sourceElement$1689 = parseSourceElement$1413();
            if (typeof sourceElement$1689 === 'undefined') {
                break;
            }
            sourceElements$1690.push(sourceElement$1689);
        }
        return sourceElements$1690;
    }
    function parseProgram$1417() {
        var program$1694;
        strict$1209 = false;
        program$1694 = {
            type: Syntax$1204.Program,
            body: parseSourceElements$1415()
        };
        return program$1694;
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$1419(start$1695, end$1696, type$1697, value$1698) {
        assert$1219(typeof start$1695 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$1217.comments.length > 0) {
            if (extra$1217.comments[extra$1217.comments.length - 1].range[1] > start$1695) {
                return;
            }
        }
        extra$1217.comments.push({
            range: [
                start$1695,
                end$1696
            ],
            type: type$1697,
            value: value$1698
        });
    }
    function scanComment$1421() {
        var comment$1699, ch$1700, start$1701, blockComment$1702, lineComment$1703;
        comment$1699 = '';
        blockComment$1702 = false;
        lineComment$1703 = false;
        while (index$1210 < length$1213) {
            ch$1700 = source$1208[index$1210];
            if (lineComment$1703) {
                ch$1700 = nextChar$1247();
                if (index$1210 >= length$1213) {
                    lineComment$1703 = false;
                    comment$1699 += ch$1700;
                    addComment$1419(start$1701, index$1210, 'Line', comment$1699);
                } else if (isLineTerminator$1233(ch$1700)) {
                    lineComment$1703 = false;
                    addComment$1419(start$1701, index$1210, 'Line', comment$1699);
                    if (ch$1700 === '\r' && source$1208[index$1210] === '\n') {
                        ++index$1210;
                    }
                    ++lineNumber$1211;
                    lineStart$1212 = index$1210;
                    comment$1699 = '';
                } else {
                    comment$1699 += ch$1700;
                }
            } else if (blockComment$1702) {
                if (isLineTerminator$1233(ch$1700)) {
                    if (ch$1700 === '\r' && source$1208[index$1210 + 1] === '\n') {
                        ++index$1210;
                        comment$1699 += '\r\n';
                    } else {
                        comment$1699 += ch$1700;
                    }
                    ++lineNumber$1211;
                    ++index$1210;
                    lineStart$1212 = index$1210;
                    if (index$1210 >= length$1213) {
                        throwError$1275({}, Messages$1206.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1700 = nextChar$1247();
                    if (index$1210 >= length$1213) {
                        throwError$1275({}, Messages$1206.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1699 += ch$1700;
                    if (ch$1700 === '*') {
                        ch$1700 = source$1208[index$1210];
                        if (ch$1700 === '/') {
                            comment$1699 = comment$1699.substr(0, comment$1699.length - 1);
                            blockComment$1702 = false;
                            ++index$1210;
                            addComment$1419(start$1701, index$1210, 'Block', comment$1699);
                            comment$1699 = '';
                        }
                    }
                }
            } else if (ch$1700 === '/') {
                ch$1700 = source$1208[index$1210 + 1];
                if (ch$1700 === '/') {
                    start$1701 = index$1210;
                    index$1210 += 2;
                    lineComment$1703 = true;
                } else if (ch$1700 === '*') {
                    start$1701 = index$1210;
                    index$1210 += 2;
                    blockComment$1702 = true;
                    if (index$1210 >= length$1213) {
                        throwError$1275({}, Messages$1206.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$1231(ch$1700)) {
                ++index$1210;
            } else if (isLineTerminator$1233(ch$1700)) {
                ++index$1210;
                if (ch$1700 === '\r' && source$1208[index$1210] === '\n') {
                    ++index$1210;
                }
                ++lineNumber$1211;
                lineStart$1212 = index$1210;
            } else {
                break;
            }
        }
    }
    function collectToken$1423() {
        var token$1704 = extra$1217.advance(), range$1705, value$1706;
        if (token$1704.type !== Token$1202.EOF) {
            range$1705 = [
                token$1704.range[0],
                token$1704.range[1]
            ];
            value$1706 = sliceSource$1223(token$1704.range[0], token$1704.range[1]);
            extra$1217.tokens.push({
                type: TokenName$1203[token$1704.type],
                value: value$1706,
                lineNumber: lineNumber$1211,
                lineStart: lineStart$1212,
                range: range$1705
            });
        }
        return token$1704;
    }
    function collectRegex$1425() {
        var pos$1707, regex$1708, token$1709;
        skipComment$1251();
        pos$1707 = index$1210;
        regex$1708 = extra$1217.scanRegExp();
        // Pop the previous token, which is likely '/' or '/='
        if (extra$1217.tokens.length > 0) {
            token$1709 = extra$1217.tokens[extra$1217.tokens.length - 1];
            if (token$1709.range[0] === pos$1707 && token$1709.type === 'Punctuator') {
                if (token$1709.value === '/' || token$1709.value === '/=') {
                    extra$1217.tokens.pop();
                }
            }
        }
        extra$1217.tokens.push({
            type: 'RegularExpression',
            value: regex$1708.literal,
            range: [
                pos$1707,
                index$1210
            ],
            lineStart: token$1709.lineStart,
            lineNumber: token$1709.lineNumber
        });
        return regex$1708;
    }
    function createLiteral$1427(token$1710) {
        if (Array.isArray(token$1710)) {
            return {
                type: Syntax$1204.Literal,
                value: token$1710
            };
        }
        return {
            type: Syntax$1204.Literal,
            value: token$1710.value,
            lineStart: token$1710.lineStart,
            lineNumber: token$1710.lineNumber
        };
    }
    function createRawLiteral$1429(token$1711) {
        return {
            type: Syntax$1204.Literal,
            value: token$1711.value,
            raw: sliceSource$1223(token$1711.range[0], token$1711.range[1]),
            lineStart: token$1711.lineStart,
            lineNumber: token$1711.lineNumber
        };
    }
    function wrapTrackingFunction$1431(range$1712, loc$1713) {
        return function (parseFunction$1715) {
            function isBinary$1717(node$1721) {
                return node$1721.type === Syntax$1204.LogicalExpression || node$1721.type === Syntax$1204.BinaryExpression;
            }
            function visit$1719(node$1722) {
                if (isBinary$1717(node$1722.left)) {
                    visit$1719(node$1722.left);
                }
                if (isBinary$1717(node$1722.right)) {
                    visit$1719(node$1722.right);
                }
                if (range$1712 && typeof node$1722.range === 'undefined') {
                    node$1722.range = [
                        node$1722.left.range[0],
                        node$1722.right.range[1]
                    ];
                }
                if (loc$1713 && typeof node$1722.loc === 'undefined') {
                    node$1722.loc = {
                        start: node$1722.left.loc.start,
                        end: node$1722.right.loc.end
                    };
                }
            }
            return function () {
                var node$1723, rangeInfo$1724, locInfo$1725;
                // skipComment();
                var curr$1726 = tokenStream$1216[index$1210].token;
                rangeInfo$1724 = [
                    curr$1726.range[0],
                    0
                ];
                locInfo$1725 = {
                    start: {
                        line: curr$1726.sm_lineNumber,
                        column: curr$1726.range[0] - curr$1726.sm_lineStart
                    }
                };
                node$1723 = parseFunction$1715.apply(null, arguments);
                if (typeof node$1723 !== 'undefined') {
                    var last$1727 = tokenStream$1216[index$1210].token;
                    if (range$1712) {
                        rangeInfo$1724[1] = last$1727.range[1];
                        node$1723.range = rangeInfo$1724;
                    }
                    if (loc$1713) {
                        locInfo$1725.end = {
                            line: last$1727.sm_lineNumber,
                            column: last$1727.range[0] - curr$1726.sm_lineStart
                        };
                        node$1723.loc = locInfo$1725;
                    }
                    if (isBinary$1717(node$1723)) {
                        visit$1719(node$1723);
                    }
                    if (node$1723.type === Syntax$1204.MemberExpression) {
                        if (typeof node$1723.object.range !== 'undefined') {
                            node$1723.range[0] = node$1723.object.range[0];
                        }
                        if (typeof node$1723.object.loc !== 'undefined') {
                            node$1723.loc.start = node$1723.object.loc.start;
                        }
                    }
                    if (node$1723.type === Syntax$1204.CallExpression) {
                        if (typeof node$1723.callee.range !== 'undefined') {
                            node$1723.range[0] = node$1723.callee.range[0];
                        }
                        if (typeof node$1723.callee.loc !== 'undefined') {
                            node$1723.loc.start = node$1723.callee.loc.start;
                        }
                    }
                    if (node$1723.type !== Syntax$1204.Program) {
                        if (curr$1726.leadingComments) {
                            node$1723.leadingComments = curr$1726.leadingComments;
                        }
                        if (curr$1726.trailingComments) {
                            node$1723.trailingComments = curr$1726.trailingComments;
                        }
                    }
                    return node$1723;
                }
            };
        };
    }
    function patch$1433() {
        var wrapTracking$1728;
        if (extra$1217.comments) {
            extra$1217.skipComment = skipComment$1251;
            skipComment$1251 = scanComment$1421;
        }
        if (extra$1217.raw) {
            extra$1217.createLiteral = createLiteral$1427;
            createLiteral$1427 = createRawLiteral$1429;
        }
        if (extra$1217.range || extra$1217.loc) {
            wrapTracking$1728 = wrapTrackingFunction$1431(extra$1217.range, extra$1217.loc);
            extra$1217.parseAdditiveExpression = parseAdditiveExpression$1333;
            extra$1217.parseAssignmentExpression = parseAssignmentExpression$1353;
            extra$1217.parseBitwiseANDExpression = parseBitwiseANDExpression$1341;
            extra$1217.parseBitwiseORExpression = parseBitwiseORExpression$1345;
            extra$1217.parseBitwiseXORExpression = parseBitwiseXORExpression$1343;
            extra$1217.parseBlock = parseBlock$1359;
            extra$1217.parseFunctionSourceElements = parseFunctionSourceElements$1407;
            extra$1217.parseCallMember = parseCallMember$1315;
            extra$1217.parseCatchClause = parseCatchClause$1399;
            extra$1217.parseComputedMember = parseComputedMember$1313;
            extra$1217.parseConditionalExpression = parseConditionalExpression$1351;
            extra$1217.parseConstLetDeclaration = parseConstLetDeclaration$1369;
            extra$1217.parseEqualityExpression = parseEqualityExpression$1339;
            extra$1217.parseExpression = parseExpression$1355;
            extra$1217.parseForVariableDeclaration = parseForVariableDeclaration$1381;
            extra$1217.parseFunctionDeclaration = parseFunctionDeclaration$1409;
            extra$1217.parseFunctionExpression = parseFunctionExpression$1411;
            extra$1217.parseLogicalANDExpression = parseLogicalANDExpression$1347;
            extra$1217.parseLogicalORExpression = parseLogicalORExpression$1349;
            extra$1217.parseMultiplicativeExpression = parseMultiplicativeExpression$1331;
            extra$1217.parseNewExpression = parseNewExpression$1317;
            extra$1217.parseNonComputedMember = parseNonComputedMember$1311;
            extra$1217.parseNonComputedProperty = parseNonComputedProperty$1309;
            extra$1217.parseObjectProperty = parseObjectProperty$1301;
            extra$1217.parseObjectPropertyKey = parseObjectPropertyKey$1299;
            extra$1217.parsePostfixExpression = parsePostfixExpression$1327;
            extra$1217.parsePrimaryExpression = parsePrimaryExpression$1305;
            extra$1217.parseProgram = parseProgram$1417;
            extra$1217.parsePropertyFunction = parsePropertyFunction$1297;
            extra$1217.parseRelationalExpression = parseRelationalExpression$1337;
            extra$1217.parseStatement = parseStatement$1405;
            extra$1217.parseShiftExpression = parseShiftExpression$1335;
            extra$1217.parseSwitchCase = parseSwitchCase$1393;
            extra$1217.parseUnaryExpression = parseUnaryExpression$1329;
            extra$1217.parseVariableDeclaration = parseVariableDeclaration$1363;
            extra$1217.parseVariableIdentifier = parseVariableIdentifier$1361;
            parseAdditiveExpression$1333 = wrapTracking$1728(extra$1217.parseAdditiveExpression);
            parseAssignmentExpression$1353 = wrapTracking$1728(extra$1217.parseAssignmentExpression);
            parseBitwiseANDExpression$1341 = wrapTracking$1728(extra$1217.parseBitwiseANDExpression);
            parseBitwiseORExpression$1345 = wrapTracking$1728(extra$1217.parseBitwiseORExpression);
            parseBitwiseXORExpression$1343 = wrapTracking$1728(extra$1217.parseBitwiseXORExpression);
            parseBlock$1359 = wrapTracking$1728(extra$1217.parseBlock);
            parseFunctionSourceElements$1407 = wrapTracking$1728(extra$1217.parseFunctionSourceElements);
            parseCallMember$1315 = wrapTracking$1728(extra$1217.parseCallMember);
            parseCatchClause$1399 = wrapTracking$1728(extra$1217.parseCatchClause);
            parseComputedMember$1313 = wrapTracking$1728(extra$1217.parseComputedMember);
            parseConditionalExpression$1351 = wrapTracking$1728(extra$1217.parseConditionalExpression);
            parseConstLetDeclaration$1369 = wrapTracking$1728(extra$1217.parseConstLetDeclaration);
            parseEqualityExpression$1339 = wrapTracking$1728(extra$1217.parseEqualityExpression);
            parseExpression$1355 = wrapTracking$1728(extra$1217.parseExpression);
            parseForVariableDeclaration$1381 = wrapTracking$1728(extra$1217.parseForVariableDeclaration);
            parseFunctionDeclaration$1409 = wrapTracking$1728(extra$1217.parseFunctionDeclaration);
            parseFunctionExpression$1411 = wrapTracking$1728(extra$1217.parseFunctionExpression);
            parseLogicalANDExpression$1347 = wrapTracking$1728(extra$1217.parseLogicalANDExpression);
            parseLogicalORExpression$1349 = wrapTracking$1728(extra$1217.parseLogicalORExpression);
            parseMultiplicativeExpression$1331 = wrapTracking$1728(extra$1217.parseMultiplicativeExpression);
            parseNewExpression$1317 = wrapTracking$1728(extra$1217.parseNewExpression);
            parseNonComputedMember$1311 = wrapTracking$1728(extra$1217.parseNonComputedMember);
            parseNonComputedProperty$1309 = wrapTracking$1728(extra$1217.parseNonComputedProperty);
            parseObjectProperty$1301 = wrapTracking$1728(extra$1217.parseObjectProperty);
            parseObjectPropertyKey$1299 = wrapTracking$1728(extra$1217.parseObjectPropertyKey);
            parsePostfixExpression$1327 = wrapTracking$1728(extra$1217.parsePostfixExpression);
            parsePrimaryExpression$1305 = wrapTracking$1728(extra$1217.parsePrimaryExpression);
            parseProgram$1417 = wrapTracking$1728(extra$1217.parseProgram);
            parsePropertyFunction$1297 = wrapTracking$1728(extra$1217.parsePropertyFunction);
            parseRelationalExpression$1337 = wrapTracking$1728(extra$1217.parseRelationalExpression);
            parseStatement$1405 = wrapTracking$1728(extra$1217.parseStatement);
            parseShiftExpression$1335 = wrapTracking$1728(extra$1217.parseShiftExpression);
            parseSwitchCase$1393 = wrapTracking$1728(extra$1217.parseSwitchCase);
            parseUnaryExpression$1329 = wrapTracking$1728(extra$1217.parseUnaryExpression);
            parseVariableDeclaration$1363 = wrapTracking$1728(extra$1217.parseVariableDeclaration);
            parseVariableIdentifier$1361 = wrapTracking$1728(extra$1217.parseVariableIdentifier);
        }
        if (typeof extra$1217.tokens !== 'undefined') {
            extra$1217.advance = advance$1267;
            extra$1217.scanRegExp = scanRegExp$1263;
            advance$1267 = collectToken$1423;
            scanRegExp$1263 = collectRegex$1425;
        }
    }
    function unpatch$1435() {
        if (typeof extra$1217.skipComment === 'function') {
            skipComment$1251 = extra$1217.skipComment;
        }
        if (extra$1217.raw) {
            createLiteral$1427 = extra$1217.createLiteral;
        }
        if (extra$1217.range || extra$1217.loc) {
            parseAdditiveExpression$1333 = extra$1217.parseAdditiveExpression;
            parseAssignmentExpression$1353 = extra$1217.parseAssignmentExpression;
            parseBitwiseANDExpression$1341 = extra$1217.parseBitwiseANDExpression;
            parseBitwiseORExpression$1345 = extra$1217.parseBitwiseORExpression;
            parseBitwiseXORExpression$1343 = extra$1217.parseBitwiseXORExpression;
            parseBlock$1359 = extra$1217.parseBlock;
            parseFunctionSourceElements$1407 = extra$1217.parseFunctionSourceElements;
            parseCallMember$1315 = extra$1217.parseCallMember;
            parseCatchClause$1399 = extra$1217.parseCatchClause;
            parseComputedMember$1313 = extra$1217.parseComputedMember;
            parseConditionalExpression$1351 = extra$1217.parseConditionalExpression;
            parseConstLetDeclaration$1369 = extra$1217.parseConstLetDeclaration;
            parseEqualityExpression$1339 = extra$1217.parseEqualityExpression;
            parseExpression$1355 = extra$1217.parseExpression;
            parseForVariableDeclaration$1381 = extra$1217.parseForVariableDeclaration;
            parseFunctionDeclaration$1409 = extra$1217.parseFunctionDeclaration;
            parseFunctionExpression$1411 = extra$1217.parseFunctionExpression;
            parseLogicalANDExpression$1347 = extra$1217.parseLogicalANDExpression;
            parseLogicalORExpression$1349 = extra$1217.parseLogicalORExpression;
            parseMultiplicativeExpression$1331 = extra$1217.parseMultiplicativeExpression;
            parseNewExpression$1317 = extra$1217.parseNewExpression;
            parseNonComputedMember$1311 = extra$1217.parseNonComputedMember;
            parseNonComputedProperty$1309 = extra$1217.parseNonComputedProperty;
            parseObjectProperty$1301 = extra$1217.parseObjectProperty;
            parseObjectPropertyKey$1299 = extra$1217.parseObjectPropertyKey;
            parsePrimaryExpression$1305 = extra$1217.parsePrimaryExpression;
            parsePostfixExpression$1327 = extra$1217.parsePostfixExpression;
            parseProgram$1417 = extra$1217.parseProgram;
            parsePropertyFunction$1297 = extra$1217.parsePropertyFunction;
            parseRelationalExpression$1337 = extra$1217.parseRelationalExpression;
            parseStatement$1405 = extra$1217.parseStatement;
            parseShiftExpression$1335 = extra$1217.parseShiftExpression;
            parseSwitchCase$1393 = extra$1217.parseSwitchCase;
            parseUnaryExpression$1329 = extra$1217.parseUnaryExpression;
            parseVariableDeclaration$1363 = extra$1217.parseVariableDeclaration;
            parseVariableIdentifier$1361 = extra$1217.parseVariableIdentifier;
        }
        if (typeof extra$1217.scanRegExp === 'function') {
            advance$1267 = extra$1217.advance;
            scanRegExp$1263 = extra$1217.scanRegExp;
        }
    }
    function stringToArray$1437(str$1729) {
        var length$1730 = str$1729.length, result$1731 = [], i$1732;
        for (i$1732 = 0; i$1732 < length$1730; ++i$1732) {
            result$1731[i$1732] = str$1729.charAt(i$1732);
        }
        return result$1731;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$1439(toks$1733, start$1734, inExprDelim$1735, parentIsBlock$1736) {
        var assignOps$1737 = [
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
        var binaryOps$1738 = [
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
        var unaryOps$1739 = [
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
        function back$1741(n$1742) {
            var idx$1743 = toks$1733.length - n$1742 > 0 ? toks$1733.length - n$1742 : 0;
            return toks$1733[idx$1743];
        }
        if (inExprDelim$1735 && toks$1733.length - (start$1734 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1741(start$1734 + 2).value === ':' && parentIsBlock$1736) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$1221(back$1741(start$1734 + 2).value, unaryOps$1739.concat(binaryOps$1738).concat(assignOps$1737))) {
            // ... + {...}
            return false;
        } else if (back$1741(start$1734 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1744 = typeof back$1741(start$1734 + 1).startLineNumber !== 'undefined' ? back$1741(start$1734 + 1).startLineNumber : back$1741(start$1734 + 1).lineNumber;
            if (back$1741(start$1734 + 2).lineNumber !== currLineNumber$1744) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$1221(back$1741(start$1734 + 2).value, [
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
    function readToken$1441(toks$1745, inExprDelim$1746, parentIsBlock$1747) {
        var delimiters$1748 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1749 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1750 = toks$1745.length - 1;
        var comments$1751, commentsLen$1752 = extra$1217.comments.length;
        function back$1754(n$1761) {
            var idx$1762 = toks$1745.length - n$1761 > 0 ? toks$1745.length - n$1761 : 0;
            return toks$1745[idx$1762];
        }
        function attachComments$1756(token$1763) {
            if (comments$1751) {
                token$1763.leadingComments = comments$1751;
            }
            return token$1763;
        }
        function _advance$1758() {
            return attachComments$1756(advance$1267());
        }
        function _scanRegExp$1760() {
            return attachComments$1756(scanRegExp$1263());
        }
        skipComment$1251();
        if (extra$1217.comments.length > commentsLen$1752) {
            comments$1751 = extra$1217.comments.slice(commentsLen$1752);
        }
        if (isIn$1221(getChar$1249(), delimiters$1748)) {
            return attachComments$1756(readDelim$1443(toks$1745, inExprDelim$1746, parentIsBlock$1747));
        }
        if (getChar$1249() === '/') {
            var prev$1764 = back$1754(1);
            if (prev$1764) {
                if (prev$1764.value === '()') {
                    if (isIn$1221(back$1754(2).value, parenIdents$1749)) {
                        // ... if (...) / ...
                        return _scanRegExp$1760();
                    }
                    // ... (...) / ...
                    return _advance$1758();
                }
                if (prev$1764.value === '{}') {
                    if (blockAllowed$1439(toks$1745, 0, inExprDelim$1746, parentIsBlock$1747)) {
                        if (back$1754(2).value === '()') {
                            // named function
                            if (back$1754(4).value === 'function') {
                                if (!blockAllowed$1439(toks$1745, 3, inExprDelim$1746, parentIsBlock$1747)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1758();
                                }
                                if (toks$1745.length - 5 <= 0 && inExprDelim$1746) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1758();
                                }
                            }
                            // unnamed function
                            if (back$1754(3).value === 'function') {
                                if (!blockAllowed$1439(toks$1745, 2, inExprDelim$1746, parentIsBlock$1747)) {
                                    // new function (...) {...} / ...
                                    return _advance$1758();
                                }
                                if (toks$1745.length - 4 <= 0 && inExprDelim$1746) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1758();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1760();
                    } else {
                        // ... + {...} / ...
                        return _advance$1758();
                    }
                }
                if (prev$1764.type === Token$1202.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1760();
                }
                if (isKeyword$1245(prev$1764.value)) {
                    // typeof /...
                    return _scanRegExp$1760();
                }
                return _advance$1758();
            }
            return _scanRegExp$1760();
        }
        return _advance$1758();
    }
    function readDelim$1443(toks$1765, inExprDelim$1766, parentIsBlock$1767) {
        var startDelim$1768 = advance$1267(), matchDelim$1769 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1770 = [];
        var delimiters$1771 = [
                '(',
                '{',
                '['
            ];
        assert$1219(delimiters$1771.indexOf(startDelim$1768.value) !== -1, 'Need to begin at the delimiter');
        var token$1772 = startDelim$1768;
        var startLineNumber$1773 = token$1772.lineNumber;
        var startLineStart$1774 = token$1772.lineStart;
        var startRange$1775 = token$1772.range;
        var delimToken$1776 = {};
        delimToken$1776.type = Token$1202.Delimiter;
        delimToken$1776.value = startDelim$1768.value + matchDelim$1769[startDelim$1768.value];
        delimToken$1776.startLineNumber = startLineNumber$1773;
        delimToken$1776.startLineStart = startLineStart$1774;
        delimToken$1776.startRange = startRange$1775;
        var delimIsBlock$1777 = false;
        if (startDelim$1768.value === '{') {
            delimIsBlock$1777 = blockAllowed$1439(toks$1765.concat(delimToken$1776), 0, inExprDelim$1766, parentIsBlock$1767);
        }
        while (index$1210 <= length$1213) {
            token$1772 = readToken$1441(inner$1770, startDelim$1768.value === '(' || startDelim$1768.value === '[', delimIsBlock$1777);
            if (token$1772.type === Token$1202.Punctuator && token$1772.value === matchDelim$1769[startDelim$1768.value]) {
                if (token$1772.leadingComments) {
                    delimToken$1776.trailingComments = token$1772.leadingComments;
                }
                break;
            } else if (token$1772.type === Token$1202.EOF) {
                throwError$1275({}, Messages$1206.UnexpectedEOS);
            } else {
                inner$1770.push(token$1772);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$1210 >= length$1213 && matchDelim$1769[startDelim$1768.value] !== source$1208[length$1213 - 1]) {
            throwError$1275({}, Messages$1206.UnexpectedEOS);
        }
        var endLineNumber$1778 = token$1772.lineNumber;
        var endLineStart$1779 = token$1772.lineStart;
        var endRange$1780 = token$1772.range;
        delimToken$1776.inner = inner$1770;
        delimToken$1776.endLineNumber = endLineNumber$1778;
        delimToken$1776.endLineStart = endLineStart$1779;
        delimToken$1776.endRange = endRange$1780;
        return delimToken$1776;
    }
    ;
    // (Str) -> [...CSyntax]
    function read$1445(code$1781) {
        var token$1782, tokenTree$1783 = [];
        extra$1217 = {};
        extra$1217.comments = [];
        patch$1433();
        source$1208 = code$1781;
        index$1210 = 0;
        lineNumber$1211 = source$1208.length > 0 ? 1 : 0;
        lineStart$1212 = 0;
        length$1213 = source$1208.length;
        buffer$1214 = null;
        state$1215 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$1210 < length$1213) {
            tokenTree$1783.push(readToken$1441(tokenTree$1783, false, false));
        }
        var last$1784 = tokenTree$1783[tokenTree$1783.length - 1];
        if (last$1784 && last$1784.type !== Token$1202.EOF) {
            tokenTree$1783.push({
                type: Token$1202.EOF,
                value: '',
                lineNumber: last$1784.lineNumber,
                lineStart: last$1784.lineStart,
                range: [
                    index$1210,
                    index$1210
                ]
            });
        }
        return expander$1201.tokensToSyntax(tokenTree$1783);
    }
    // (SyntaxObject, Str, {}) -> SyntaxObject
    function parse$1447(code$1785) {
        var program$1786, toString$1787;
        tokenStream$1216 = code$1785;
        index$1210 = 0;
        length$1213 = tokenStream$1216.length;
        buffer$1214 = null;
        state$1215 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$1217 = {
            range: true,
            loc: true
        };
        patch$1433();
        try {
            program$1786 = parseProgram$1417();
            program$1786.tokens = expander$1201.syntaxToTokens(code$1785);
        } catch (e$1788) {
            throw e$1788;
        } finally {
            unpatch$1435();
            extra$1217 = {};
        }
        return program$1786;
    }
    exports$1200.parse = parse$1447;
    exports$1200.read = read$1445;
    exports$1200.Token = Token$1202;
    exports$1200.assert = assert$1219;
    // Deep copy.
    exports$1200.Syntax = function () {
        var name$1790, types$1791 = {};
        if (typeof Object.create === 'function') {
            types$1791 = Object.create(null);
        }
        for (name$1790 in Syntax$1204) {
            if (Syntax$1204.hasOwnProperty(name$1790)) {
                types$1791[name$1790] = Syntax$1204[name$1790];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1791);
        }
        return types$1791;
    }();
}));