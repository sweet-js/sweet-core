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
(function (root$676, factory$677) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$677(exports, require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'expander'
        ], factory$677);
    }
}(this, function (exports$678, expander$679) {
    'use strict';
    var Token$680, TokenName$681, Syntax$682, PropertyKind$683, Messages$684, Regex$685, source$686, strict$687, index$688, lineNumber$689, lineStart$690, length$691, buffer$692, state$693, tokenStream$694, extra$695;
    Token$680 = {
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
    TokenName$681 = {};
    TokenName$681[Token$680.BooleanLiteral] = 'Boolean';
    TokenName$681[Token$680.EOF] = '<end>';
    TokenName$681[Token$680.Identifier] = 'Identifier';
    TokenName$681[Token$680.Keyword] = 'Keyword';
    TokenName$681[Token$680.NullLiteral] = 'Null';
    TokenName$681[Token$680.NumericLiteral] = 'Numeric';
    TokenName$681[Token$680.Punctuator] = 'Punctuator';
    TokenName$681[Token$680.StringLiteral] = 'String';
    TokenName$681[Token$680.Delimiter] = 'Delimiter';
    Syntax$682 = {
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
    PropertyKind$683 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    // Error messages should be identical to V8.
    Messages$684 = {
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
    Regex$685 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$696(condition$811, message$812) {
        if (!condition$811) {
            throw new Error('ASSERT: ' + message$812);
        }
    }
    function isIn$697(el$813, list$814) {
        return list$814.indexOf(el$813) !== -1;
    }
    function sliceSource$698(from$815, to$816) {
        return source$686.slice(from$815, to$816);
    }
    if (typeof 'esprima'[0] === 'undefined') {
        sliceSource$698 = function sliceArraySource$817(from$818, to$819) {
            return source$686.slice(from$818, to$819).join('');
        };
    }
    function isDecimalDigit$699(ch$820) {
        return '0123456789'.indexOf(ch$820) >= 0;
    }
    function isHexDigit$700(ch$821) {
        return '0123456789abcdefABCDEF'.indexOf(ch$821) >= 0;
    }
    function isOctalDigit$701(ch$822) {
        return '01234567'.indexOf(ch$822) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$702(ch$823) {
        return ch$823 === ' ' || ch$823 === '\t' || ch$823 === '\x0B' || ch$823 === '\f' || ch$823 === '\xa0' || ch$823.charCodeAt(0) >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(ch$823) >= 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$703(ch$824) {
        return ch$824 === '\n' || ch$824 === '\r' || ch$824 === '\u2028' || ch$824 === '\u2029';
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$704(ch$825) {
        return ch$825 === '$' || ch$825 === '_' || ch$825 === '\\' || ch$825 >= 'a' && ch$825 <= 'z' || ch$825 >= 'A' && ch$825 <= 'Z' || ch$825.charCodeAt(0) >= 128 && Regex$685.NonAsciiIdentifierStart.test(ch$825);
    }
    function isIdentifierPart$705(ch$826) {
        return ch$826 === '$' || ch$826 === '_' || ch$826 === '\\' || ch$826 >= 'a' && ch$826 <= 'z' || ch$826 >= 'A' && ch$826 <= 'Z' || ch$826 >= '0' && ch$826 <= '9' || ch$826.charCodeAt(0) >= 128 && Regex$685.NonAsciiIdentifierPart.test(ch$826);
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$706(id$827) {
        // we are allowing future reserved words so macros can be written for them
        return false;
    }
    function isStrictModeReservedWord$707(id$828) {
        switch (id$828) {
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
    function isRestrictedWord$708(id$829) {
        return id$829 === 'eval' || id$829 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$709(id$830) {
        var keyword$831 = false;
        switch (id$830.length) {
        case 2:
            keyword$831 = id$830 === 'if' || id$830 === 'in' || id$830 === 'do';
            break;
        case 3:
            keyword$831 = id$830 === 'var' || id$830 === 'for' || id$830 === 'new' || id$830 === 'try';
            break;
        case 4:
            keyword$831 = id$830 === 'this' || id$830 === 'else' || id$830 === 'case' || id$830 === 'void' || id$830 === 'with';
            break;
        case 5:
            keyword$831 = id$830 === 'while' || id$830 === 'break' || id$830 === 'catch' || id$830 === 'throw';
            break;
        case 6:
            keyword$831 = id$830 === 'return' || id$830 === 'typeof' || id$830 === 'delete' || id$830 === 'switch';
            break;
        case 7:
            keyword$831 = id$830 === 'default' || id$830 === 'finally';
            break;
        case 8:
            keyword$831 = id$830 === 'function' || id$830 === 'continue' || id$830 === 'debugger';
            break;
        case 10:
            keyword$831 = id$830 === 'instanceof';
            break;
        }
        if (keyword$831) {
            return true;
        }
        switch (id$830) {
        // Future reserved words.
        // 'const' is specialized as Keyword in V8.
        case 'const':
            return true;
        // For compatiblity to SpiderMonkey and ES.next
        case 'yield':
        case 'let':
            return true;
        }
        if (strict$687 && isStrictModeReservedWord$707(id$830)) {
            return true;
        }
        return isFutureReservedWord$706(id$830);
    }
    // Return the next character and move forward.
    function nextChar$710() {
        return source$686[index$688++];
    }
    function getChar$711() {
        return source$686[index$688];
    }
    // 7.4 Comments
    function skipComment$712() {
        var ch$832, blockComment$833, lineComment$834;
        blockComment$833 = false;
        lineComment$834 = false;
        while (index$688 < length$691) {
            ch$832 = source$686[index$688];
            if (lineComment$834) {
                ch$832 = nextChar$710();
                if (isLineTerminator$703(ch$832)) {
                    lineComment$834 = false;
                    if (ch$832 === '\r' && source$686[index$688] === '\n') {
                        ++index$688;
                    }
                    ++lineNumber$689;
                    lineStart$690 = index$688;
                }
            } else if (blockComment$833) {
                if (isLineTerminator$703(ch$832)) {
                    if (ch$832 === '\r' && source$686[index$688 + 1] === '\n') {
                        ++index$688;
                    }
                    ++lineNumber$689;
                    ++index$688;
                    lineStart$690 = index$688;
                    if (index$688 >= length$691) {
                        throwError$724({}, Messages$684.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$832 = nextChar$710();
                    if (index$688 >= length$691) {
                        throwError$724({}, Messages$684.UnexpectedToken, 'ILLEGAL');
                    }
                    if (ch$832 === '*') {
                        ch$832 = source$686[index$688];
                        if (ch$832 === '/') {
                            ++index$688;
                            blockComment$833 = false;
                        }
                    }
                }
            } else if (ch$832 === '/') {
                ch$832 = source$686[index$688 + 1];
                if (ch$832 === '/') {
                    index$688 += 2;
                    lineComment$834 = true;
                } else if (ch$832 === '*') {
                    index$688 += 2;
                    blockComment$833 = true;
                    if (index$688 >= length$691) {
                        throwError$724({}, Messages$684.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$702(ch$832)) {
                ++index$688;
            } else if (isLineTerminator$703(ch$832)) {
                ++index$688;
                if (ch$832 === '\r' && source$686[index$688] === '\n') {
                    ++index$688;
                }
                ++lineNumber$689;
                lineStart$690 = index$688;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$713(prefix$835) {
        var i$836, len$837, ch$838, code$839 = 0;
        len$837 = prefix$835 === 'u' ? 4 : 2;
        for (i$836 = 0; i$836 < len$837; ++i$836) {
            if (index$688 < length$691 && isHexDigit$700(source$686[index$688])) {
                ch$838 = nextChar$710();
                code$839 = code$839 * 16 + '0123456789abcdef'.indexOf(ch$838.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$839);
    }
    function scanIdentifier$714() {
        var ch$840, start$841, id$842, restore$843;
        ch$840 = source$686[index$688];
        if (!isIdentifierStart$704(ch$840)) {
            return;
        }
        start$841 = index$688;
        if (ch$840 === '\\') {
            ++index$688;
            if (source$686[index$688] !== 'u') {
                return;
            }
            ++index$688;
            restore$843 = index$688;
            ch$840 = scanHexEscape$713('u');
            if (ch$840) {
                if (ch$840 === '\\' || !isIdentifierStart$704(ch$840)) {
                    return;
                }
                id$842 = ch$840;
            } else {
                index$688 = restore$843;
                id$842 = 'u';
            }
        } else {
            id$842 = nextChar$710();
        }
        while (index$688 < length$691) {
            ch$840 = source$686[index$688];
            if (!isIdentifierPart$705(ch$840)) {
                break;
            }
            if (ch$840 === '\\') {
                ++index$688;
                if (source$686[index$688] !== 'u') {
                    return;
                }
                ++index$688;
                restore$843 = index$688;
                ch$840 = scanHexEscape$713('u');
                if (ch$840) {
                    if (ch$840 === '\\' || !isIdentifierPart$705(ch$840)) {
                        return;
                    }
                    id$842 += ch$840;
                } else {
                    index$688 = restore$843;
                    id$842 += 'u';
                }
            } else {
                id$842 += nextChar$710();
            }
        }
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$842.length === 1) {
            return {
                type: Token$680.Identifier,
                value: id$842,
                lineNumber: lineNumber$689,
                lineStart: lineStart$690,
                range: [
                    start$841,
                    index$688
                ]
            };
        }
        if (isKeyword$709(id$842)) {
            return {
                type: Token$680.Keyword,
                value: id$842,
                lineNumber: lineNumber$689,
                lineStart: lineStart$690,
                range: [
                    start$841,
                    index$688
                ]
            };
        }
        // 7.8.1 Null Literals
        if (id$842 === 'null') {
            return {
                type: Token$680.NullLiteral,
                value: id$842,
                lineNumber: lineNumber$689,
                lineStart: lineStart$690,
                range: [
                    start$841,
                    index$688
                ]
            };
        }
        // 7.8.2 Boolean Literals
        if (id$842 === 'true' || id$842 === 'false') {
            return {
                type: Token$680.BooleanLiteral,
                value: id$842,
                lineNumber: lineNumber$689,
                lineStart: lineStart$690,
                range: [
                    start$841,
                    index$688
                ]
            };
        }
        return {
            type: Token$680.Identifier,
            value: id$842,
            lineNumber: lineNumber$689,
            lineStart: lineStart$690,
            range: [
                start$841,
                index$688
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$715() {
        var start$844 = index$688, ch1$845 = source$686[index$688], ch2$846, ch3$847, ch4$848;
        // Check for most common single-character punctuators.
        if (ch1$845 === ';' || ch1$845 === '{' || ch1$845 === '}') {
            ++index$688;
            return {
                type: Token$680.Punctuator,
                value: ch1$845,
                lineNumber: lineNumber$689,
                lineStart: lineStart$690,
                range: [
                    start$844,
                    index$688
                ]
            };
        }
        if (ch1$845 === ',' || ch1$845 === '(' || ch1$845 === ')') {
            ++index$688;
            return {
                type: Token$680.Punctuator,
                value: ch1$845,
                lineNumber: lineNumber$689,
                lineStart: lineStart$690,
                range: [
                    start$844,
                    index$688
                ]
            };
        }
        if (ch1$845 === '#' || ch1$845 === '@') {
            ++index$688;
            return {
                type: Token$680.Punctuator,
                value: ch1$845,
                lineNumber: lineNumber$689,
                lineStart: lineStart$690,
                range: [
                    start$844,
                    index$688
                ]
            };
        }
        // Dot (.) can also start a floating-point number, hence the need
        // to check the next character.
        ch2$846 = source$686[index$688 + 1];
        if (ch1$845 === '.' && !isDecimalDigit$699(ch2$846)) {
            if (source$686[index$688 + 1] === '.' && source$686[index$688 + 2] === '.') {
                nextChar$710();
                nextChar$710();
                nextChar$710();
                return {
                    type: Token$680.Punctuator,
                    value: '...',
                    lineNumber: lineNumber$689,
                    lineStart: lineStart$690,
                    range: [
                        start$844,
                        index$688
                    ]
                };
            } else {
                return {
                    type: Token$680.Punctuator,
                    value: nextChar$710(),
                    lineNumber: lineNumber$689,
                    lineStart: lineStart$690,
                    range: [
                        start$844,
                        index$688
                    ]
                };
            }
        }
        // Peek more characters.
        ch3$847 = source$686[index$688 + 2];
        ch4$848 = source$686[index$688 + 3];
        // 4-character punctuator: >>>=
        if (ch1$845 === '>' && ch2$846 === '>' && ch3$847 === '>') {
            if (ch4$848 === '=') {
                index$688 += 4;
                return {
                    type: Token$680.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$689,
                    lineStart: lineStart$690,
                    range: [
                        start$844,
                        index$688
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$845 === '=' && ch2$846 === '=' && ch3$847 === '=') {
            index$688 += 3;
            return {
                type: Token$680.Punctuator,
                value: '===',
                lineNumber: lineNumber$689,
                lineStart: lineStart$690,
                range: [
                    start$844,
                    index$688
                ]
            };
        }
        if (ch1$845 === '!' && ch2$846 === '=' && ch3$847 === '=') {
            index$688 += 3;
            return {
                type: Token$680.Punctuator,
                value: '!==',
                lineNumber: lineNumber$689,
                lineStart: lineStart$690,
                range: [
                    start$844,
                    index$688
                ]
            };
        }
        if (ch1$845 === '>' && ch2$846 === '>' && ch3$847 === '>') {
            index$688 += 3;
            return {
                type: Token$680.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$689,
                lineStart: lineStart$690,
                range: [
                    start$844,
                    index$688
                ]
            };
        }
        if (ch1$845 === '<' && ch2$846 === '<' && ch3$847 === '=') {
            index$688 += 3;
            return {
                type: Token$680.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$689,
                lineStart: lineStart$690,
                range: [
                    start$844,
                    index$688
                ]
            };
        }
        if (ch1$845 === '>' && ch2$846 === '>' && ch3$847 === '=') {
            index$688 += 3;
            return {
                type: Token$680.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$689,
                lineStart: lineStart$690,
                range: [
                    start$844,
                    index$688
                ]
            };
        }
        // 2-character punctuators: <= >= == != ++ -- << >> && ||
        // += -= *= %= &= |= ^= /=
        if (ch2$846 === '=') {
            if ('<>=!+-*%&|^/'.indexOf(ch1$845) >= 0) {
                index$688 += 2;
                return {
                    type: Token$680.Punctuator,
                    value: ch1$845 + ch2$846,
                    lineNumber: lineNumber$689,
                    lineStart: lineStart$690,
                    range: [
                        start$844,
                        index$688
                    ]
                };
            }
        }
        if (ch1$845 === ch2$846 && '+-<>&|'.indexOf(ch1$845) >= 0) {
            if ('+-<>&|'.indexOf(ch2$846) >= 0) {
                index$688 += 2;
                return {
                    type: Token$680.Punctuator,
                    value: ch1$845 + ch2$846,
                    lineNumber: lineNumber$689,
                    lineStart: lineStart$690,
                    range: [
                        start$844,
                        index$688
                    ]
                };
            }
        }
        // The remaining 1-character punctuators.
        if ('[]<>+-*%&|^!~?:=/'.indexOf(ch1$845) >= 0) {
            return {
                type: Token$680.Punctuator,
                value: nextChar$710(),
                lineNumber: lineNumber$689,
                lineStart: lineStart$690,
                range: [
                    start$844,
                    index$688
                ]
            };
        }
    }
    // 7.8.3 Numeric Literals
    function scanNumericLiteral$716() {
        var number$849, start$850, ch$851;
        ch$851 = source$686[index$688];
        assert$696(isDecimalDigit$699(ch$851) || ch$851 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$850 = index$688;
        number$849 = '';
        if (ch$851 !== '.') {
            number$849 = nextChar$710();
            ch$851 = source$686[index$688];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            if (number$849 === '0') {
                if (ch$851 === 'x' || ch$851 === 'X') {
                    number$849 += nextChar$710();
                    while (index$688 < length$691) {
                        ch$851 = source$686[index$688];
                        if (!isHexDigit$700(ch$851)) {
                            break;
                        }
                        number$849 += nextChar$710();
                    }
                    if (number$849.length <= 2) {
                        // only 0x
                        throwError$724({}, Messages$684.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$688 < length$691) {
                        ch$851 = source$686[index$688];
                        if (isIdentifierStart$704(ch$851)) {
                            throwError$724({}, Messages$684.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$680.NumericLiteral,
                        value: parseInt(number$849, 16),
                        lineNumber: lineNumber$689,
                        lineStart: lineStart$690,
                        range: [
                            start$850,
                            index$688
                        ]
                    };
                } else if (isOctalDigit$701(ch$851)) {
                    number$849 += nextChar$710();
                    while (index$688 < length$691) {
                        ch$851 = source$686[index$688];
                        if (!isOctalDigit$701(ch$851)) {
                            break;
                        }
                        number$849 += nextChar$710();
                    }
                    if (index$688 < length$691) {
                        ch$851 = source$686[index$688];
                        if (isIdentifierStart$704(ch$851) || isDecimalDigit$699(ch$851)) {
                            throwError$724({}, Messages$684.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$680.NumericLiteral,
                        value: parseInt(number$849, 8),
                        octal: true,
                        lineNumber: lineNumber$689,
                        lineStart: lineStart$690,
                        range: [
                            start$850,
                            index$688
                        ]
                    };
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (isDecimalDigit$699(ch$851)) {
                    throwError$724({}, Messages$684.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (index$688 < length$691) {
                ch$851 = source$686[index$688];
                if (!isDecimalDigit$699(ch$851)) {
                    break;
                }
                number$849 += nextChar$710();
            }
        }
        if (ch$851 === '.') {
            number$849 += nextChar$710();
            while (index$688 < length$691) {
                ch$851 = source$686[index$688];
                if (!isDecimalDigit$699(ch$851)) {
                    break;
                }
                number$849 += nextChar$710();
            }
        }
        if (ch$851 === 'e' || ch$851 === 'E') {
            number$849 += nextChar$710();
            ch$851 = source$686[index$688];
            if (ch$851 === '+' || ch$851 === '-') {
                number$849 += nextChar$710();
            }
            ch$851 = source$686[index$688];
            if (isDecimalDigit$699(ch$851)) {
                number$849 += nextChar$710();
                while (index$688 < length$691) {
                    ch$851 = source$686[index$688];
                    if (!isDecimalDigit$699(ch$851)) {
                        break;
                    }
                    number$849 += nextChar$710();
                }
            } else {
                ch$851 = 'character ' + ch$851;
                if (index$688 >= length$691) {
                    ch$851 = '<end>';
                }
                throwError$724({}, Messages$684.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (index$688 < length$691) {
            ch$851 = source$686[index$688];
            if (isIdentifierStart$704(ch$851)) {
                throwError$724({}, Messages$684.UnexpectedToken, 'ILLEGAL');
            }
        }
        return {
            type: Token$680.NumericLiteral,
            value: parseFloat(number$849),
            lineNumber: lineNumber$689,
            lineStart: lineStart$690,
            range: [
                start$850,
                index$688
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$717() {
        var str$852 = '', quote$853, start$854, ch$855, code$856, unescaped$857, restore$858, octal$859 = false;
        quote$853 = source$686[index$688];
        assert$696(quote$853 === '\'' || quote$853 === '"', 'String literal must starts with a quote');
        start$854 = index$688;
        ++index$688;
        while (index$688 < length$691) {
            ch$855 = nextChar$710();
            if (ch$855 === quote$853) {
                quote$853 = '';
                break;
            } else if (ch$855 === '\\') {
                ch$855 = nextChar$710();
                if (!isLineTerminator$703(ch$855)) {
                    switch (ch$855) {
                    case 'n':
                        str$852 += '\n';
                        break;
                    case 'r':
                        str$852 += '\r';
                        break;
                    case 't':
                        str$852 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        restore$858 = index$688;
                        unescaped$857 = scanHexEscape$713(ch$855);
                        if (unescaped$857) {
                            str$852 += unescaped$857;
                        } else {
                            index$688 = restore$858;
                            str$852 += ch$855;
                        }
                        break;
                    case 'b':
                        str$852 += '\b';
                        break;
                    case 'f':
                        str$852 += '\f';
                        break;
                    case 'v':
                        str$852 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$701(ch$855)) {
                            code$856 = '01234567'.indexOf(ch$855);
                            // \0 is not octal escape sequence
                            if (code$856 !== 0) {
                                octal$859 = true;
                            }
                            if (index$688 < length$691 && isOctalDigit$701(source$686[index$688])) {
                                octal$859 = true;
                                code$856 = code$856 * 8 + '01234567'.indexOf(nextChar$710());
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$855) >= 0 && index$688 < length$691 && isOctalDigit$701(source$686[index$688])) {
                                    code$856 = code$856 * 8 + '01234567'.indexOf(nextChar$710());
                                }
                            }
                            str$852 += String.fromCharCode(code$856);
                        } else {
                            str$852 += ch$855;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$689;
                    if (ch$855 === '\r' && source$686[index$688] === '\n') {
                        ++index$688;
                    }
                }
            } else if (isLineTerminator$703(ch$855)) {
                break;
            } else {
                str$852 += ch$855;
            }
        }
        if (quote$853 !== '') {
            throwError$724({}, Messages$684.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$680.StringLiteral,
            value: str$852,
            octal: octal$859,
            lineNumber: lineNumber$689,
            lineStart: lineStart$690,
            range: [
                start$854,
                index$688
            ]
        };
    }
    function scanRegExp$718() {
        var str$860 = '', ch$861, start$862, pattern$863, flags$864, value$865, classMarker$866 = false, restore$867;
        buffer$692 = null;
        skipComment$712();
        start$862 = index$688;
        ch$861 = source$686[index$688];
        assert$696(ch$861 === '/', 'Regular expression literal must start with a slash');
        str$860 = nextChar$710();
        while (index$688 < length$691) {
            ch$861 = nextChar$710();
            str$860 += ch$861;
            if (classMarker$866) {
                if (ch$861 === ']') {
                    classMarker$866 = false;
                }
            } else {
                if (ch$861 === '\\') {
                    ch$861 = nextChar$710();
                    // ECMA-262 7.8.5
                    if (isLineTerminator$703(ch$861)) {
                        throwError$724({}, Messages$684.UnterminatedRegExp);
                    }
                    str$860 += ch$861;
                } else if (ch$861 === '/') {
                    break;
                } else if (ch$861 === '[') {
                    classMarker$866 = true;
                } else if (isLineTerminator$703(ch$861)) {
                    throwError$724({}, Messages$684.UnterminatedRegExp);
                }
            }
        }
        if (str$860.length === 1) {
            throwError$724({}, Messages$684.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$863 = str$860.substr(1, str$860.length - 2);
        flags$864 = '';
        while (index$688 < length$691) {
            ch$861 = source$686[index$688];
            if (!isIdentifierPart$705(ch$861)) {
                break;
            }
            ++index$688;
            if (ch$861 === '\\' && index$688 < length$691) {
                ch$861 = source$686[index$688];
                if (ch$861 === 'u') {
                    ++index$688;
                    restore$867 = index$688;
                    ch$861 = scanHexEscape$713('u');
                    if (ch$861) {
                        flags$864 += ch$861;
                        str$860 += '\\u';
                        for (; restore$867 < index$688; ++restore$867) {
                            str$860 += source$686[restore$867];
                        }
                    } else {
                        index$688 = restore$867;
                        flags$864 += 'u';
                        str$860 += '\\u';
                    }
                } else {
                    str$860 += '\\';
                }
            } else {
                flags$864 += ch$861;
                str$860 += ch$861;
            }
        }
        try {
            value$865 = new RegExp(pattern$863, flags$864);
        } catch (e$868) {
            throwError$724({}, Messages$684.InvalidRegExp);
        }
        return {
            type: Token$680.RegexLiteral,
            literal: str$860,
            value: value$865,
            lineNumber: lineNumber$689,
            lineStart: lineStart$690,
            range: [
                start$862,
                index$688
            ]
        };
    }
    function isIdentifierName$719(token$869) {
        return token$869.type === Token$680.Identifier || token$869.type === Token$680.Keyword || token$869.type === Token$680.BooleanLiteral || token$869.type === Token$680.NullLiteral;
    }
    // only used by the reader
    function advance$720() {
        var ch$870, token$871;
        skipComment$712();
        if (index$688 >= length$691) {
            return {
                type: Token$680.EOF,
                lineNumber: lineNumber$689,
                lineStart: lineStart$690,
                range: [
                    index$688,
                    index$688
                ]
            };
        }
        ch$870 = source$686[index$688];
        token$871 = scanPunctuator$715();
        if (typeof token$871 !== 'undefined') {
            return token$871;
        }
        if (ch$870 === '\'' || ch$870 === '"') {
            return scanStringLiteral$717();
        }
        if (ch$870 === '.' || isDecimalDigit$699(ch$870)) {
            return scanNumericLiteral$716();
        }
        token$871 = scanIdentifier$714();
        if (typeof token$871 !== 'undefined') {
            return token$871;
        }
        throwError$724({}, Messages$684.UnexpectedToken, 'ILLEGAL');
    }
    function lex$721() {
        var token$872;
        if (buffer$692) {
            token$872 = buffer$692;
            buffer$692 = null;
            index$688++;
            return token$872;
        }
        buffer$692 = null;
        return tokenStream$694[index$688++];
    }
    function lookahead$722() {
        var pos$873, line$874, start$875;
        if (buffer$692 !== null) {
            return buffer$692;
        }
        buffer$692 = tokenStream$694[index$688];
        return buffer$692;
    }
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$723() {
        var pos$876, line$877, start$878, found$879;
        found$879 = tokenStream$694[index$688 - 1].token.lineNumber !== tokenStream$694[index$688].token.lineNumber;
        return found$879;
    }
    // Throw an exception
    function throwError$724(token$880, messageFormat$881) {
        var error$882, args$883 = Array.prototype.slice.call(arguments, 2), msg$884 = messageFormat$881.replace(/%(\d)/g, function (whole$885, index$886) {
                return args$883[index$886] || '';
            });
        if (typeof token$880.lineNumber === 'number') {
            error$882 = new Error('Line ' + token$880.lineNumber + ': ' + msg$884);
            error$882.lineNumber = token$880.lineNumber;
            if (token$880.range && token$880.range.length > 0) {
                error$882.index = token$880.range[0];
                error$882.column = token$880.range[0] - lineStart$690 + 1;
            }
        } else {
            error$882 = new Error('Line ' + lineNumber$689 + ': ' + msg$884);
            error$882.index = index$688;
            error$882.lineNumber = lineNumber$689;
            error$882.column = index$688 - lineStart$690 + 1;
        }
        throw error$882;
    }
    function throwErrorTolerant$725() {
        var error$887;
        try {
            throwError$724.apply(null, arguments);
        } catch (e$888) {
            if (extra$695.errors) {
                extra$695.errors.push(e$888);
            } else {
                throw e$888;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$726(token$889) {
        var s$890;
        if (token$889.type === Token$680.EOF) {
            throwError$724(token$889, Messages$684.UnexpectedEOS);
        }
        if (token$889.type === Token$680.NumericLiteral) {
            throwError$724(token$889, Messages$684.UnexpectedNumber);
        }
        if (token$889.type === Token$680.StringLiteral) {
            throwError$724(token$889, Messages$684.UnexpectedString);
        }
        if (token$889.type === Token$680.Identifier) {
            console.log(token$889);
            throwError$724(token$889, Messages$684.UnexpectedIdentifier);
        }
        if (token$889.type === Token$680.Keyword) {
            if (isFutureReservedWord$706(token$889.value)) {
                throwError$724(token$889, Messages$684.UnexpectedReserved);
            } else if (strict$687 && isStrictModeReservedWord$707(token$889.value)) {
                throwError$724(token$889, Messages$684.StrictReservedWord);
            }
            throwError$724(token$889, Messages$684.UnexpectedToken, token$889.value);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$724(token$889, Messages$684.UnexpectedToken, token$889.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$727(value$891) {
        var token$892 = lex$721().token;
        if (token$892.type !== Token$680.Punctuator || token$892.value !== value$891) {
            throwUnexpected$726(token$892);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$728(keyword$893) {
        var token$894 = lex$721().token;
        if (token$894.type !== Token$680.Keyword || token$894.value !== keyword$893) {
            throwUnexpected$726(token$894);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$729(value$895) {
        var token$896 = lookahead$722().token;
        return token$896.type === Token$680.Punctuator && token$896.value === value$895;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$730(keyword$897) {
        var token$898 = lookahead$722().token;
        return token$898.type === Token$680.Keyword && token$898.value === keyword$897;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$731() {
        var token$899 = lookahead$722().token, op$900 = token$899.value;
        if (token$899.type !== Token$680.Punctuator) {
            return false;
        }
        return op$900 === '=' || op$900 === '*=' || op$900 === '/=' || op$900 === '%=' || op$900 === '+=' || op$900 === '-=' || op$900 === '<<=' || op$900 === '>>=' || op$900 === '>>>=' || op$900 === '&=' || op$900 === '^=' || op$900 === '|=';
    }
    function consumeSemicolon$732() {
        var token$901, line$902;
        if (tokenStream$694[index$688].token.value === ';') {
            lex$721().token;
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
        line$902 = tokenStream$694[index$688 - 1].token.lineNumber;
        token$901 = tokenStream$694[index$688].token;
        if (line$902 !== token$901.lineNumber) {
            return;
        }
        if (token$901.type !== Token$680.EOF && !match$729('}')) {
            throwUnexpected$726(token$901);
        }
        return;
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$733(expr$903) {
        return expr$903.type === Syntax$682.Identifier || expr$903.type === Syntax$682.MemberExpression;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$734() {
        var elements$904 = [], undef$905;
        expect$727('[');
        while (!match$729(']')) {
            if (match$729(',')) {
                lex$721().token;
                elements$904.push(undef$905);
            } else {
                elements$904.push(parseAssignmentExpression$763());
                if (!match$729(']')) {
                    expect$727(',');
                }
            }
        }
        expect$727(']');
        return {
            type: Syntax$682.ArrayExpression,
            elements: elements$904
        };
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$735(param$906, first$907) {
        var previousStrict$908, body$909;
        previousStrict$908 = strict$687;
        body$909 = parseFunctionSourceElements$790();
        if (first$907 && strict$687 && isRestrictedWord$708(param$906[0].name)) {
            throwError$724(first$907, Messages$684.StrictParamName);
        }
        strict$687 = previousStrict$908;
        return {
            type: Syntax$682.FunctionExpression,
            id: null,
            params: param$906,
            body: body$909
        };
    }
    function parseObjectPropertyKey$736() {
        var token$910 = lex$721().token;
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$910.type === Token$680.StringLiteral || token$910.type === Token$680.NumericLiteral) {
            if (strict$687 && token$910.octal) {
                throwError$724(token$910, Messages$684.StrictOctalLiteral);
            }
            return createLiteral$800(token$910);
        }
        return {
            type: Syntax$682.Identifier,
            name: token$910.value
        };
    }
    function parseObjectProperty$737() {
        var token$911, key$912, id$913, param$914;
        token$911 = lookahead$722().token;
        if (token$911.type === Token$680.Identifier) {
            id$913 = parseObjectPropertyKey$736();
            // Property Assignment: Getter and Setter.
            if (token$911.value === 'get' && !match$729(':')) {
                key$912 = parseObjectPropertyKey$736();
                expect$727('(');
                expect$727(')');
                return {
                    type: Syntax$682.Property,
                    key: key$912,
                    value: parsePropertyFunction$735([]),
                    kind: 'get'
                };
            } else if (token$911.value === 'set' && !match$729(':')) {
                key$912 = parseObjectPropertyKey$736();
                expect$727('(');
                token$911 = lookahead$722().token;
                if (token$911.type !== Token$680.Identifier) {
                    throwUnexpected$726(lex$721().token);
                }
                param$914 = [parseVariableIdentifier$767()];
                expect$727(')');
                return {
                    type: Syntax$682.Property,
                    key: key$912,
                    value: parsePropertyFunction$735(param$914, token$911),
                    kind: 'set'
                };
            } else {
                expect$727(':');
                return {
                    type: Syntax$682.Property,
                    key: id$913,
                    value: parseAssignmentExpression$763(),
                    kind: 'init'
                };
            }
        } else if (token$911.type === Token$680.EOF || token$911.type === Token$680.Punctuator) {
            throwUnexpected$726(token$911);
        } else {
            key$912 = parseObjectPropertyKey$736();
            expect$727(':');
            return {
                type: Syntax$682.Property,
                key: key$912,
                value: parseAssignmentExpression$763(),
                kind: 'init'
            };
        }
    }
    function parseObjectInitialiser$738() {
        var token$915, properties$916 = [], property$917, name$918, kind$919, map$920 = {}, toString$921 = String;
        expect$727('{');
        while (!match$729('}')) {
            property$917 = parseObjectProperty$737();
            if (property$917.key.type === Syntax$682.Identifier) {
                name$918 = property$917.key.name;
            } else {
                name$918 = toString$921(property$917.key.value);
            }
            kind$919 = property$917.kind === 'init' ? PropertyKind$683.Data : property$917.kind === 'get' ? PropertyKind$683.Get : PropertyKind$683.Set;
            if (Object.prototype.hasOwnProperty.call(map$920, name$918)) {
                if (map$920[name$918] === PropertyKind$683.Data) {
                    if (strict$687 && kind$919 === PropertyKind$683.Data) {
                        throwErrorTolerant$725({}, Messages$684.StrictDuplicateProperty);
                    } else if (kind$919 !== PropertyKind$683.Data) {
                        throwError$724({}, Messages$684.AccessorDataProperty);
                    }
                } else {
                    if (kind$919 === PropertyKind$683.Data) {
                        throwError$724({}, Messages$684.AccessorDataProperty);
                    } else if (map$920[name$918] & kind$919) {
                        throwError$724({}, Messages$684.AccessorGetSet);
                    }
                }
                map$920[name$918] |= kind$919;
            } else {
                map$920[name$918] = kind$919;
            }
            properties$916.push(property$917);
            if (!match$729('}')) {
                expect$727(',');
            }
        }
        expect$727('}');
        return {
            type: Syntax$682.ObjectExpression,
            properties: properties$916
        };
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$739() {
        var expr$922, token$923 = lookahead$722().token, type$924 = token$923.type;
        if (type$924 === Token$680.Identifier) {
            var name$925 = expander$679.resolve(lex$721());
            return {
                type: Syntax$682.Identifier,
                name: name$925
            };
        }
        if (type$924 === Token$680.StringLiteral || type$924 === Token$680.NumericLiteral) {
            if (strict$687 && token$923.octal) {
                throwErrorTolerant$725(token$923, Messages$684.StrictOctalLiteral);
            }
            return createLiteral$800(lex$721().token);
        }
        if (type$924 === Token$680.Keyword) {
            if (matchKeyword$730('this')) {
                lex$721().token;
                return { type: Syntax$682.ThisExpression };
            }
            if (matchKeyword$730('function')) {
                return parseFunctionExpression$792();
            }
        }
        if (type$924 === Token$680.BooleanLiteral) {
            lex$721();
            token$923.value = token$923.value === 'true';
            return createLiteral$800(token$923);
        }
        if (type$924 === Token$680.NullLiteral) {
            lex$721();
            token$923.value = null;
            return createLiteral$800(token$923);
        }
        if (match$729('[')) {
            return parseArrayInitialiser$734();
        }
        if (match$729('{')) {
            return parseObjectInitialiser$738();
        }
        if (match$729('(')) {
            lex$721();
            state$693.lastParenthesized = expr$922 = parseExpression$764();
            expect$727(')');
            return expr$922;
        }
        if (token$923.value instanceof RegExp) {
            return createLiteral$800(lex$721().token);
        }
        return throwUnexpected$726(lex$721().token);
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$740() {
        var args$926 = [];
        expect$727('(');
        if (!match$729(')')) {
            while (index$688 < length$691) {
                args$926.push(parseAssignmentExpression$763());
                if (match$729(')')) {
                    break;
                }
                expect$727(',');
            }
        }
        expect$727(')');
        return args$926;
    }
    function parseNonComputedProperty$741() {
        var token$927 = lex$721().token;
        if (!isIdentifierName$719(token$927)) {
            throwUnexpected$726(token$927);
        }
        return {
            type: Syntax$682.Identifier,
            name: token$927.value
        };
    }
    function parseNonComputedMember$742(object$928) {
        return {
            type: Syntax$682.MemberExpression,
            computed: false,
            object: object$928,
            property: parseNonComputedProperty$741()
        };
    }
    function parseComputedMember$743(object$929) {
        var property$930, expr$931;
        expect$727('[');
        property$930 = parseExpression$764();
        expr$931 = {
            type: Syntax$682.MemberExpression,
            computed: true,
            object: object$929,
            property: property$930
        };
        expect$727(']');
        return expr$931;
    }
    function parseCallMember$744(object$932) {
        return {
            type: Syntax$682.CallExpression,
            callee: object$932,
            'arguments': parseArguments$740()
        };
    }
    function parseNewExpression$745() {
        var expr$933;
        expectKeyword$728('new');
        expr$933 = {
            type: Syntax$682.NewExpression,
            callee: parseLeftHandSideExpression$749(),
            'arguments': []
        };
        if (match$729('(')) {
            expr$933['arguments'] = parseArguments$740();
        }
        return expr$933;
    }
    // sort of broken, only accepts literals
    // pretty sure the use of toString will bite me
    function toArrayNode$746(arr$934) {
        var els$935 = arr$934.map(function (el$936) {
                return {
                    type: 'Literal',
                    value: el$936,
                    raw: el$936.toString()
                };
            });
        return {
            type: 'ArrayExpression',
            elements: els$935
        };
    }
    function toObjectNode$747(obj$937) {
        // todo: hacky, fixup
        var props$938 = Object.keys(obj$937).map(function (key$939) {
                var raw$940 = obj$937[key$939];
                var value$941;
                if (Array.isArray(raw$940)) {
                    value$941 = toArrayNode$746(raw$940);
                } else {
                    value$941 = {
                        type: 'Literal',
                        value: obj$937[key$939],
                        raw: obj$937[key$939].toString()
                    };
                }
                return {
                    type: 'Property',
                    key: {
                        type: 'Identifier',
                        name: key$939
                    },
                    value: value$941,
                    kind: 'init'
                };
            });
        return {
            type: 'ObjectExpression',
            properties: props$938
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
    function parseLeftHandSideExpressionAllowCall$748() {
        var useNew$942, expr$943;
        useNew$942 = matchKeyword$730('new');
        expr$943 = useNew$942 ? parseNewExpression$745() : parsePrimaryExpression$739();
        // handle "syntax" primitive
        // todo: error handling
        // if(expr.name === "syntax") {
        //     return parseSyntaxObject();
        // }
        while (index$688 < length$691) {
            if (match$729('.')) {
                lex$721();
                expr$943 = parseNonComputedMember$742(expr$943);
            } else if (match$729('[')) {
                expr$943 = parseComputedMember$743(expr$943);
            } else if (match$729('(')) {
                expr$943 = parseCallMember$744(expr$943);
            } else {
                break;
            }
        }
        return expr$943;
    }
    function parseLeftHandSideExpression$749() {
        var useNew$944, expr$945;
        useNew$944 = matchKeyword$730('new');
        expr$945 = useNew$944 ? parseNewExpression$745() : parsePrimaryExpression$739();
        while (index$688 < length$691) {
            if (match$729('.')) {
                lex$721();
                expr$945 = parseNonComputedMember$742(expr$945);
            } else if (match$729('[')) {
                expr$945 = parseComputedMember$743(expr$945);
            } else {
                break;
            }
        }
        return expr$945;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$750() {
        var expr$946 = parseLeftHandSideExpressionAllowCall$748();
        if ((match$729('++') || match$729('--')) && !peekLineTerminator$723()) {
            // 11.3.1, 11.3.2
            if (strict$687 && expr$946.type === Syntax$682.Identifier && isRestrictedWord$708(expr$946.name)) {
                throwError$724({}, Messages$684.StrictLHSPostfix);
            }
            if (!isLeftHandSide$733(expr$946)) {
                throwError$724({}, Messages$684.InvalidLHSInAssignment);
            }
            expr$946 = {
                type: Syntax$682.UpdateExpression,
                operator: lex$721().token.value,
                argument: expr$946,
                prefix: false
            };
        }
        return expr$946;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$751() {
        var token$947, expr$948;
        if (match$729('++') || match$729('--')) {
            token$947 = lex$721().token;
            expr$948 = parseUnaryExpression$751();
            // 11.4.4, 11.4.5
            if (strict$687 && expr$948.type === Syntax$682.Identifier && isRestrictedWord$708(expr$948.name)) {
                throwError$724({}, Messages$684.StrictLHSPrefix);
            }
            if (!isLeftHandSide$733(expr$948)) {
                throwError$724({}, Messages$684.InvalidLHSInAssignment);
            }
            expr$948 = {
                type: Syntax$682.UpdateExpression,
                operator: token$947.value,
                argument: expr$948,
                prefix: true
            };
            return expr$948;
        }
        if (match$729('+') || match$729('-') || match$729('~') || match$729('!')) {
            expr$948 = {
                type: Syntax$682.UnaryExpression,
                operator: lex$721().token.value,
                argument: parseUnaryExpression$751()
            };
            return expr$948;
        }
        if (matchKeyword$730('delete') || matchKeyword$730('void') || matchKeyword$730('typeof')) {
            expr$948 = {
                type: Syntax$682.UnaryExpression,
                operator: lex$721().token.value,
                argument: parseUnaryExpression$751()
            };
            if (strict$687 && expr$948.operator === 'delete' && expr$948.argument.type === Syntax$682.Identifier) {
                throwErrorTolerant$725({}, Messages$684.StrictDelete);
            }
            return expr$948;
        }
        return parsePostfixExpression$750();
    }
    // 11.5 Multiplicative Operators
    function parseMultiplicativeExpression$752() {
        var expr$949 = parseUnaryExpression$751();
        while (match$729('*') || match$729('/') || match$729('%')) {
            expr$949 = {
                type: Syntax$682.BinaryExpression,
                operator: lex$721().token.value,
                left: expr$949,
                right: parseUnaryExpression$751()
            };
        }
        return expr$949;
    }
    // 11.6 Additive Operators
    function parseAdditiveExpression$753() {
        var expr$950 = parseMultiplicativeExpression$752();
        while (match$729('+') || match$729('-')) {
            expr$950 = {
                type: Syntax$682.BinaryExpression,
                operator: lex$721().token.value,
                left: expr$950,
                right: parseMultiplicativeExpression$752()
            };
        }
        return expr$950;
    }
    // 11.7 Bitwise Shift Operators
    function parseShiftExpression$754() {
        var expr$951 = parseAdditiveExpression$753();
        while (match$729('<<') || match$729('>>') || match$729('>>>')) {
            expr$951 = {
                type: Syntax$682.BinaryExpression,
                operator: lex$721().token.value,
                left: expr$951,
                right: parseAdditiveExpression$753()
            };
        }
        return expr$951;
    }
    // 11.8 Relational Operators
    function parseRelationalExpression$755() {
        var expr$952, previousAllowIn$953;
        previousAllowIn$953 = state$693.allowIn;
        state$693.allowIn = true;
        expr$952 = parseShiftExpression$754();
        while (match$729('<') || match$729('>') || match$729('<=') || match$729('>=') || previousAllowIn$953 && matchKeyword$730('in') || matchKeyword$730('instanceof')) {
            expr$952 = {
                type: Syntax$682.BinaryExpression,
                operator: lex$721().token.value,
                left: expr$952,
                right: parseRelationalExpression$755()
            };
        }
        state$693.allowIn = previousAllowIn$953;
        return expr$952;
    }
    // 11.9 Equality Operators
    function parseEqualityExpression$756() {
        var expr$954 = parseRelationalExpression$755();
        while (match$729('==') || match$729('!=') || match$729('===') || match$729('!==')) {
            expr$954 = {
                type: Syntax$682.BinaryExpression,
                operator: lex$721().token.value,
                left: expr$954,
                right: parseRelationalExpression$755()
            };
        }
        return expr$954;
    }
    // 11.10 Binary Bitwise Operators
    function parseBitwiseANDExpression$757() {
        var expr$955 = parseEqualityExpression$756();
        while (match$729('&')) {
            lex$721();
            expr$955 = {
                type: Syntax$682.BinaryExpression,
                operator: '&',
                left: expr$955,
                right: parseEqualityExpression$756()
            };
        }
        return expr$955;
    }
    function parseBitwiseXORExpression$758() {
        var expr$956 = parseBitwiseANDExpression$757();
        while (match$729('^')) {
            lex$721();
            expr$956 = {
                type: Syntax$682.BinaryExpression,
                operator: '^',
                left: expr$956,
                right: parseBitwiseANDExpression$757()
            };
        }
        return expr$956;
    }
    function parseBitwiseORExpression$759() {
        var expr$957 = parseBitwiseXORExpression$758();
        while (match$729('|')) {
            lex$721();
            expr$957 = {
                type: Syntax$682.BinaryExpression,
                operator: '|',
                left: expr$957,
                right: parseBitwiseXORExpression$758()
            };
        }
        return expr$957;
    }
    // 11.11 Binary Logical Operators
    function parseLogicalANDExpression$760() {
        var expr$958 = parseBitwiseORExpression$759();
        while (match$729('&&')) {
            lex$721();
            expr$958 = {
                type: Syntax$682.LogicalExpression,
                operator: '&&',
                left: expr$958,
                right: parseBitwiseORExpression$759()
            };
        }
        return expr$958;
    }
    function parseLogicalORExpression$761() {
        var expr$959 = parseLogicalANDExpression$760();
        while (match$729('||')) {
            lex$721();
            expr$959 = {
                type: Syntax$682.LogicalExpression,
                operator: '||',
                left: expr$959,
                right: parseLogicalANDExpression$760()
            };
        }
        return expr$959;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$762() {
        var expr$960, previousAllowIn$961, consequent$962;
        expr$960 = parseLogicalORExpression$761();
        if (match$729('?')) {
            lex$721();
            previousAllowIn$961 = state$693.allowIn;
            state$693.allowIn = true;
            consequent$962 = parseAssignmentExpression$763();
            state$693.allowIn = previousAllowIn$961;
            expect$727(':');
            expr$960 = {
                type: Syntax$682.ConditionalExpression,
                test: expr$960,
                consequent: consequent$962,
                alternate: parseAssignmentExpression$763()
            };
        }
        return expr$960;
    }
    // 11.13 Assignment Operators
    function parseAssignmentExpression$763() {
        var expr$963;
        expr$963 = parseConditionalExpression$762();
        if (matchAssign$731()) {
            // LeftHandSideExpression
            if (!isLeftHandSide$733(expr$963)) {
                throwError$724({}, Messages$684.InvalidLHSInAssignment);
            }
            // 11.13.1
            if (strict$687 && expr$963.type === Syntax$682.Identifier && isRestrictedWord$708(expr$963.name)) {
                throwError$724({}, Messages$684.StrictLHSAssignment);
            }
            expr$963 = {
                type: Syntax$682.AssignmentExpression,
                operator: lex$721().token.value,
                left: expr$963,
                right: parseAssignmentExpression$763()
            };
        }
        return expr$963;
    }
    // 11.14 Comma Operator
    function parseExpression$764() {
        var expr$964 = parseAssignmentExpression$763();
        if (match$729(',')) {
            expr$964 = {
                type: Syntax$682.SequenceExpression,
                expressions: [expr$964]
            };
            while (index$688 < length$691) {
                if (!match$729(',')) {
                    break;
                }
                lex$721();
                expr$964.expressions.push(parseAssignmentExpression$763());
            }
        }
        return expr$964;
    }
    // 12.1 Block
    function parseStatementList$765() {
        var list$965 = [], statement$966;
        while (index$688 < length$691) {
            if (match$729('}')) {
                break;
            }
            statement$966 = parseSourceElement$793();
            if (typeof statement$966 === 'undefined') {
                break;
            }
            list$965.push(statement$966);
        }
        return list$965;
    }
    function parseBlock$766() {
        var block$967;
        expect$727('{');
        block$967 = parseStatementList$765();
        expect$727('}');
        return {
            type: Syntax$682.BlockStatement,
            body: block$967
        };
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$767() {
        var stx$968 = lex$721(), token$969 = stx$968.token;
        if (token$969.type !== Token$680.Identifier) {
            throwUnexpected$726(token$969);
        }
        var name$970 = expander$679.resolve(stx$968);
        return {
            type: Syntax$682.Identifier,
            name: name$970
        };
    }
    function parseVariableDeclaration$768(kind$971) {
        var id$972 = parseVariableIdentifier$767(), init$973 = null;
        // 12.2.1
        if (strict$687 && isRestrictedWord$708(id$972.name)) {
            throwErrorTolerant$725({}, Messages$684.StrictVarName);
        }
        if (kind$971 === 'const') {
            expect$727('=');
            init$973 = parseAssignmentExpression$763();
        } else if (match$729('=')) {
            lex$721();
            init$973 = parseAssignmentExpression$763();
        }
        return {
            type: Syntax$682.VariableDeclarator,
            id: id$972,
            init: init$973
        };
    }
    function parseVariableDeclarationList$769(kind$974) {
        var list$975 = [];
        while (index$688 < length$691) {
            list$975.push(parseVariableDeclaration$768(kind$974));
            if (!match$729(',')) {
                break;
            }
            lex$721();
        }
        return list$975;
    }
    function parseVariableStatement$770() {
        var declarations$976;
        expectKeyword$728('var');
        declarations$976 = parseVariableDeclarationList$769();
        consumeSemicolon$732();
        return {
            type: Syntax$682.VariableDeclaration,
            declarations: declarations$976,
            kind: 'var'
        };
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$771(kind$977) {
        var declarations$978;
        expectKeyword$728(kind$977);
        declarations$978 = parseVariableDeclarationList$769(kind$977);
        consumeSemicolon$732();
        return {
            type: Syntax$682.VariableDeclaration,
            declarations: declarations$978,
            kind: kind$977
        };
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$772() {
        expect$727(';');
        return { type: Syntax$682.EmptyStatement };
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$773() {
        var expr$979 = parseExpression$764();
        consumeSemicolon$732();
        return {
            type: Syntax$682.ExpressionStatement,
            expression: expr$979
        };
    }
    // 12.5 If statement
    function parseIfStatement$774() {
        var test$980, consequent$981, alternate$982;
        expectKeyword$728('if');
        expect$727('(');
        test$980 = parseExpression$764();
        expect$727(')');
        consequent$981 = parseStatement$789();
        if (matchKeyword$730('else')) {
            lex$721();
            alternate$982 = parseStatement$789();
        } else {
            alternate$982 = null;
        }
        return {
            type: Syntax$682.IfStatement,
            test: test$980,
            consequent: consequent$981,
            alternate: alternate$982
        };
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$775() {
        var body$983, test$984, oldInIteration$985;
        expectKeyword$728('do');
        oldInIteration$985 = state$693.inIteration;
        state$693.inIteration = true;
        body$983 = parseStatement$789();
        state$693.inIteration = oldInIteration$985;
        expectKeyword$728('while');
        expect$727('(');
        test$984 = parseExpression$764();
        expect$727(')');
        if (match$729(';')) {
            lex$721();
        }
        return {
            type: Syntax$682.DoWhileStatement,
            body: body$983,
            test: test$984
        };
    }
    function parseWhileStatement$776() {
        var test$986, body$987, oldInIteration$988;
        expectKeyword$728('while');
        expect$727('(');
        test$986 = parseExpression$764();
        expect$727(')');
        oldInIteration$988 = state$693.inIteration;
        state$693.inIteration = true;
        body$987 = parseStatement$789();
        state$693.inIteration = oldInIteration$988;
        return {
            type: Syntax$682.WhileStatement,
            test: test$986,
            body: body$987
        };
    }
    function parseForVariableDeclaration$777() {
        var token$989 = lex$721().token;
        return {
            type: Syntax$682.VariableDeclaration,
            declarations: parseVariableDeclarationList$769(),
            kind: token$989.value
        };
    }
    function parseForStatement$778() {
        var init$990, test$991, update$992, left$993, right$994, body$995, oldInIteration$996;
        init$990 = test$991 = update$992 = null;
        expectKeyword$728('for');
        expect$727('(');
        if (match$729(';')) {
            lex$721();
        } else {
            if (matchKeyword$730('var') || matchKeyword$730('let')) {
                state$693.allowIn = false;
                init$990 = parseForVariableDeclaration$777();
                state$693.allowIn = true;
                if (init$990.declarations.length === 1 && matchKeyword$730('in')) {
                    lex$721();
                    left$993 = init$990;
                    right$994 = parseExpression$764();
                    init$990 = null;
                }
            } else {
                state$693.allowIn = false;
                init$990 = parseExpression$764();
                state$693.allowIn = true;
                if (matchKeyword$730('in')) {
                    // LeftHandSideExpression
                    if (!isLeftHandSide$733(init$990)) {
                        throwError$724({}, Messages$684.InvalidLHSInForIn);
                    }
                    lex$721();
                    left$993 = init$990;
                    right$994 = parseExpression$764();
                    init$990 = null;
                }
            }
            if (typeof left$993 === 'undefined') {
                expect$727(';');
            }
        }
        if (typeof left$993 === 'undefined') {
            if (!match$729(';')) {
                test$991 = parseExpression$764();
            }
            expect$727(';');
            if (!match$729(')')) {
                update$992 = parseExpression$764();
            }
        }
        expect$727(')');
        oldInIteration$996 = state$693.inIteration;
        state$693.inIteration = true;
        body$995 = parseStatement$789();
        state$693.inIteration = oldInIteration$996;
        if (typeof left$993 === 'undefined') {
            return {
                type: Syntax$682.ForStatement,
                init: init$990,
                test: test$991,
                update: update$992,
                body: body$995
            };
        }
        return {
            type: Syntax$682.ForInStatement,
            left: left$993,
            right: right$994,
            body: body$995,
            each: false
        };
    }
    // 12.7 The continue statement
    function parseContinueStatement$779() {
        var token$997, label$998 = null;
        expectKeyword$728('continue');
        // Optimize the most common form: 'continue;'.
        if (tokenStream$694[index$688].token.value === ';') {
            lex$721();
            if (!state$693.inIteration) {
                throwError$724({}, Messages$684.IllegalContinue);
            }
            return {
                type: Syntax$682.ContinueStatement,
                label: null
            };
        }
        if (peekLineTerminator$723()) {
            if (!state$693.inIteration) {
                throwError$724({}, Messages$684.IllegalContinue);
            }
            return {
                type: Syntax$682.ContinueStatement,
                label: null
            };
        }
        token$997 = lookahead$722().token;
        if (token$997.type === Token$680.Identifier) {
            label$998 = parseVariableIdentifier$767();
            if (!Object.prototype.hasOwnProperty.call(state$693.labelSet, label$998.name)) {
                throwError$724({}, Messages$684.UnknownLabel, label$998.name);
            }
        }
        consumeSemicolon$732();
        if (label$998 === null && !state$693.inIteration) {
            throwError$724({}, Messages$684.IllegalContinue);
        }
        return {
            type: Syntax$682.ContinueStatement,
            label: label$998
        };
    }
    // 12.8 The break statement
    function parseBreakStatement$780() {
        var token$999, label$1000 = null;
        expectKeyword$728('break');
        if (peekLineTerminator$723()) {
            if (!(state$693.inIteration || state$693.inSwitch)) {
                throwError$724({}, Messages$684.IllegalBreak);
            }
            return {
                type: Syntax$682.BreakStatement,
                label: null
            };
        }
        token$999 = lookahead$722().token;
        if (token$999.type === Token$680.Identifier) {
            label$1000 = parseVariableIdentifier$767();
            if (!Object.prototype.hasOwnProperty.call(state$693.labelSet, label$1000.name)) {
                throwError$724({}, Messages$684.UnknownLabel, label$1000.name);
            }
        }
        consumeSemicolon$732();
        if (label$1000 === null && !(state$693.inIteration || state$693.inSwitch)) {
            throwError$724({}, Messages$684.IllegalBreak);
        }
        return {
            type: Syntax$682.BreakStatement,
            label: label$1000
        };
    }
    // 12.9 The return statement
    function parseReturnStatement$781() {
        var token$1001, argument$1002 = null;
        expectKeyword$728('return');
        if (!state$693.inFunctionBody) {
            throwErrorTolerant$725({}, Messages$684.IllegalReturn);
        }
        if (peekLineTerminator$723()) {
            return {
                type: Syntax$682.ReturnStatement,
                argument: null
            };
        }
        if (!match$729(';')) {
            token$1001 = lookahead$722().token;
            if (!match$729('}') && token$1001.type !== Token$680.EOF) {
                argument$1002 = parseExpression$764();
            }
        }
        consumeSemicolon$732();
        return {
            type: Syntax$682.ReturnStatement,
            argument: argument$1002
        };
    }
    // 12.10 The with statement
    function parseWithStatement$782() {
        var object$1003, body$1004;
        if (strict$687) {
            throwErrorTolerant$725({}, Messages$684.StrictModeWith);
        }
        expectKeyword$728('with');
        expect$727('(');
        object$1003 = parseExpression$764();
        expect$727(')');
        body$1004 = parseStatement$789();
        return {
            type: Syntax$682.WithStatement,
            object: object$1003,
            body: body$1004
        };
    }
    // 12.10 The swith statement
    function parseSwitchCase$783() {
        var test$1005, consequent$1006 = [], statement$1007;
        if (matchKeyword$730('default')) {
            lex$721();
            test$1005 = null;
        } else {
            expectKeyword$728('case');
            test$1005 = parseExpression$764();
        }
        expect$727(':');
        while (index$688 < length$691) {
            if (match$729('}') || matchKeyword$730('default') || matchKeyword$730('case')) {
                break;
            }
            statement$1007 = parseStatement$789();
            if (typeof statement$1007 === 'undefined') {
                break;
            }
            consequent$1006.push(statement$1007);
        }
        return {
            type: Syntax$682.SwitchCase,
            test: test$1005,
            consequent: consequent$1006
        };
    }
    function parseSwitchStatement$784() {
        var discriminant$1008, cases$1009, oldInSwitch$1010;
        expectKeyword$728('switch');
        expect$727('(');
        discriminant$1008 = parseExpression$764();
        expect$727(')');
        expect$727('{');
        if (match$729('}')) {
            lex$721();
            return {
                type: Syntax$682.SwitchStatement,
                discriminant: discriminant$1008
            };
        }
        cases$1009 = [];
        oldInSwitch$1010 = state$693.inSwitch;
        state$693.inSwitch = true;
        while (index$688 < length$691) {
            if (match$729('}')) {
                break;
            }
            cases$1009.push(parseSwitchCase$783());
        }
        state$693.inSwitch = oldInSwitch$1010;
        expect$727('}');
        return {
            type: Syntax$682.SwitchStatement,
            discriminant: discriminant$1008,
            cases: cases$1009
        };
    }
    // 12.13 The throw statement
    function parseThrowStatement$785() {
        var argument$1011;
        expectKeyword$728('throw');
        if (peekLineTerminator$723()) {
            throwError$724({}, Messages$684.NewlineAfterThrow);
        }
        argument$1011 = parseExpression$764();
        consumeSemicolon$732();
        return {
            type: Syntax$682.ThrowStatement,
            argument: argument$1011
        };
    }
    // 12.14 The try statement
    function parseCatchClause$786() {
        var param$1012;
        expectKeyword$728('catch');
        expect$727('(');
        if (!match$729(')')) {
            param$1012 = parseExpression$764();
            // 12.14.1
            if (strict$687 && param$1012.type === Syntax$682.Identifier && isRestrictedWord$708(param$1012.name)) {
                throwErrorTolerant$725({}, Messages$684.StrictCatchVariable);
            }
        }
        expect$727(')');
        return {
            type: Syntax$682.CatchClause,
            param: param$1012,
            guard: null,
            body: parseBlock$766()
        };
    }
    function parseTryStatement$787() {
        var block$1013, handlers$1014 = [], finalizer$1015 = null;
        expectKeyword$728('try');
        block$1013 = parseBlock$766();
        if (matchKeyword$730('catch')) {
            handlers$1014.push(parseCatchClause$786());
        }
        if (matchKeyword$730('finally')) {
            lex$721();
            finalizer$1015 = parseBlock$766();
        }
        if (handlers$1014.length === 0 && !finalizer$1015) {
            throwError$724({}, Messages$684.NoCatchOrFinally);
        }
        return {
            type: Syntax$682.TryStatement,
            block: block$1013,
            handlers: handlers$1014,
            finalizer: finalizer$1015
        };
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$788() {
        expectKeyword$728('debugger');
        consumeSemicolon$732();
        return { type: Syntax$682.DebuggerStatement };
    }
    // 12 Statements
    function parseStatement$789() {
        var token$1016 = lookahead$722().token, expr$1017, labeledBody$1018;
        if (token$1016.type === Token$680.EOF) {
            throwUnexpected$726(token$1016);
        }
        if (token$1016.type === Token$680.Punctuator) {
            switch (token$1016.value) {
            case ';':
                return parseEmptyStatement$772();
            case '{':
                return parseBlock$766();
            case '(':
                return parseExpressionStatement$773();
            default:
                break;
            }
        }
        if (token$1016.type === Token$680.Keyword) {
            switch (token$1016.value) {
            case 'break':
                return parseBreakStatement$780();
            case 'continue':
                return parseContinueStatement$779();
            case 'debugger':
                return parseDebuggerStatement$788();
            case 'do':
                return parseDoWhileStatement$775();
            case 'for':
                return parseForStatement$778();
            case 'function':
                return parseFunctionDeclaration$791();
            case 'if':
                return parseIfStatement$774();
            case 'return':
                return parseReturnStatement$781();
            case 'switch':
                return parseSwitchStatement$784();
            case 'throw':
                return parseThrowStatement$785();
            case 'try':
                return parseTryStatement$787();
            case 'var':
                return parseVariableStatement$770();
            case 'while':
                return parseWhileStatement$776();
            case 'with':
                return parseWithStatement$782();
            default:
                break;
            }
        }
        expr$1017 = parseExpression$764();
        // 12.12 Labelled Statements
        if (expr$1017.type === Syntax$682.Identifier && match$729(':')) {
            lex$721();
            if (Object.prototype.hasOwnProperty.call(state$693.labelSet, expr$1017.name)) {
                throwError$724({}, Messages$684.Redeclaration, 'Label', expr$1017.name);
            }
            state$693.labelSet[expr$1017.name] = true;
            labeledBody$1018 = parseStatement$789();
            delete state$693.labelSet[expr$1017.name];
            return {
                type: Syntax$682.LabeledStatement,
                label: expr$1017,
                body: labeledBody$1018
            };
        }
        consumeSemicolon$732();
        return {
            type: Syntax$682.ExpressionStatement,
            expression: expr$1017
        };
    }
    // 13 Function Definition
    function parseFunctionSourceElements$790() {
        var sourceElement$1019, sourceElements$1020 = [], token$1021, directive$1022, firstRestricted$1023, oldLabelSet$1024, oldInIteration$1025, oldInSwitch$1026, oldInFunctionBody$1027;
        expect$727('{');
        while (index$688 < length$691) {
            token$1021 = lookahead$722().token;
            if (token$1021.type !== Token$680.StringLiteral) {
                break;
            }
            sourceElement$1019 = parseSourceElement$793();
            sourceElements$1020.push(sourceElement$1019);
            if (sourceElement$1019.expression.type !== Syntax$682.Literal) {
                // this is not directive
                break;
            }
            directive$1022 = sliceSource$698(token$1021.range[0] + 1, token$1021.range[1] - 1);
            if (directive$1022 === 'use strict') {
                strict$687 = true;
                if (firstRestricted$1023) {
                    throwError$724(firstRestricted$1023, Messages$684.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1023 && token$1021.octal) {
                    firstRestricted$1023 = token$1021;
                }
            }
        }
        oldLabelSet$1024 = state$693.labelSet;
        oldInIteration$1025 = state$693.inIteration;
        oldInSwitch$1026 = state$693.inSwitch;
        oldInFunctionBody$1027 = state$693.inFunctionBody;
        state$693.labelSet = {};
        state$693.inIteration = false;
        state$693.inSwitch = false;
        state$693.inFunctionBody = true;
        while (index$688 < length$691) {
            if (match$729('}')) {
                break;
            }
            sourceElement$1019 = parseSourceElement$793();
            if (typeof sourceElement$1019 === 'undefined') {
                break;
            }
            sourceElements$1020.push(sourceElement$1019);
        }
        expect$727('}');
        state$693.labelSet = oldLabelSet$1024;
        state$693.inIteration = oldInIteration$1025;
        state$693.inSwitch = oldInSwitch$1026;
        state$693.inFunctionBody = oldInFunctionBody$1027;
        return {
            type: Syntax$682.BlockStatement,
            body: sourceElements$1020
        };
    }
    function parseFunctionDeclaration$791() {
        var id$1028, param$1029, params$1030 = [], body$1031, token$1032, firstRestricted$1033, message$1034, previousStrict$1035, paramSet$1036;
        expectKeyword$728('function');
        token$1032 = lookahead$722().token;
        id$1028 = parseVariableIdentifier$767();
        if (strict$687) {
            if (isRestrictedWord$708(token$1032.value)) {
                throwError$724(token$1032, Messages$684.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$708(token$1032.value)) {
                firstRestricted$1033 = token$1032;
                message$1034 = Messages$684.StrictFunctionName;
            } else if (isStrictModeReservedWord$707(token$1032.value)) {
                firstRestricted$1033 = token$1032;
                message$1034 = Messages$684.StrictReservedWord;
            }
        }
        expect$727('(');
        if (!match$729(')')) {
            paramSet$1036 = {};
            while (index$688 < length$691) {
                token$1032 = lookahead$722().token;
                param$1029 = parseVariableIdentifier$767();
                if (strict$687) {
                    if (isRestrictedWord$708(token$1032.value)) {
                        throwError$724(token$1032, Messages$684.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$1036, token$1032.value)) {
                        throwError$724(token$1032, Messages$684.StrictParamDupe);
                    }
                } else if (!firstRestricted$1033) {
                    if (isRestrictedWord$708(token$1032.value)) {
                        firstRestricted$1033 = token$1032;
                        message$1034 = Messages$684.StrictParamName;
                    } else if (isStrictModeReservedWord$707(token$1032.value)) {
                        firstRestricted$1033 = token$1032;
                        message$1034 = Messages$684.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$1036, token$1032.value)) {
                        firstRestricted$1033 = token$1032;
                        message$1034 = Messages$684.StrictParamDupe;
                    }
                }
                params$1030.push(param$1029);
                paramSet$1036[param$1029.name] = true;
                if (match$729(')')) {
                    break;
                }
                expect$727(',');
            }
        }
        expect$727(')');
        previousStrict$1035 = strict$687;
        body$1031 = parseFunctionSourceElements$790();
        if (strict$687 && firstRestricted$1033) {
            throwError$724(firstRestricted$1033, message$1034);
        }
        strict$687 = previousStrict$1035;
        return {
            type: Syntax$682.FunctionDeclaration,
            id: id$1028,
            params: params$1030,
            body: body$1031
        };
    }
    function parseFunctionExpression$792() {
        var token$1037, id$1038 = null, firstRestricted$1039, message$1040, param$1041, params$1042 = [], body$1043, previousStrict$1044, paramSet$1045;
        expectKeyword$728('function');
        if (!match$729('(')) {
            token$1037 = lookahead$722().token;
            id$1038 = parseVariableIdentifier$767();
            if (strict$687) {
                if (isRestrictedWord$708(token$1037.value)) {
                    throwError$724(token$1037, Messages$684.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$708(token$1037.value)) {
                    firstRestricted$1039 = token$1037;
                    message$1040 = Messages$684.StrictFunctionName;
                } else if (isStrictModeReservedWord$707(token$1037.value)) {
                    firstRestricted$1039 = token$1037;
                    message$1040 = Messages$684.StrictReservedWord;
                }
            }
        }
        expect$727('(');
        if (!match$729(')')) {
            paramSet$1045 = {};
            while (index$688 < length$691) {
                token$1037 = lookahead$722().token;
                param$1041 = parseVariableIdentifier$767();
                if (strict$687) {
                    if (isRestrictedWord$708(token$1037.value)) {
                        throwError$724(token$1037, Messages$684.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$1045, token$1037.value)) {
                        throwError$724(token$1037, Messages$684.StrictParamDupe);
                    }
                } else if (!firstRestricted$1039) {
                    if (isRestrictedWord$708(token$1037.value)) {
                        firstRestricted$1039 = token$1037;
                        message$1040 = Messages$684.StrictParamName;
                    } else if (isStrictModeReservedWord$707(token$1037.value)) {
                        firstRestricted$1039 = token$1037;
                        message$1040 = Messages$684.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$1045, token$1037.value)) {
                        firstRestricted$1039 = token$1037;
                        message$1040 = Messages$684.StrictParamDupe;
                    }
                }
                params$1042.push(param$1041);
                paramSet$1045[param$1041.name] = true;
                if (match$729(')')) {
                    break;
                }
                expect$727(',');
            }
        }
        expect$727(')');
        previousStrict$1044 = strict$687;
        body$1043 = parseFunctionSourceElements$790();
        if (strict$687 && firstRestricted$1039) {
            throwError$724(firstRestricted$1039, message$1040);
        }
        strict$687 = previousStrict$1044;
        return {
            type: Syntax$682.FunctionExpression,
            id: id$1038,
            params: params$1042,
            body: body$1043
        };
    }
    // 14 Program
    function parseSourceElement$793() {
        var token$1046 = lookahead$722().token;
        if (token$1046.type === Token$680.Keyword) {
            switch (token$1046.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$771(token$1046.value);
            case 'function':
                return parseFunctionDeclaration$791();
            default:
                return parseStatement$789();
            }
        }
        if (token$1046.type !== Token$680.EOF) {
            return parseStatement$789();
        }
    }
    function parseSourceElements$794() {
        var sourceElement$1047, sourceElements$1048 = [], token$1049, directive$1050, firstRestricted$1051;
        while (index$688 < length$691) {
            token$1049 = lookahead$722();
            if (token$1049.type !== Token$680.StringLiteral) {
                break;
            }
            sourceElement$1047 = parseSourceElement$793();
            sourceElements$1048.push(sourceElement$1047);
            if (sourceElement$1047.expression.type !== Syntax$682.Literal) {
                // this is not directive
                break;
            }
            directive$1050 = sliceSource$698(token$1049.range[0] + 1, token$1049.range[1] - 1);
            if (directive$1050 === 'use strict') {
                strict$687 = true;
                if (firstRestricted$1051) {
                    throwError$724(firstRestricted$1051, Messages$684.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1051 && token$1049.octal) {
                    firstRestricted$1051 = token$1049;
                }
            }
        }
        while (index$688 < length$691) {
            sourceElement$1047 = parseSourceElement$793();
            if (typeof sourceElement$1047 === 'undefined') {
                break;
            }
            sourceElements$1048.push(sourceElement$1047);
        }
        return sourceElements$1048;
    }
    function parseProgram$795() {
        var program$1052;
        strict$687 = false;
        program$1052 = {
            type: Syntax$682.Program,
            body: parseSourceElements$794()
        };
        return program$1052;
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$796(start$1053, end$1054, type$1055, value$1056) {
        assert$696(typeof start$1053 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$695.comments.length > 0) {
            if (extra$695.comments[extra$695.comments.length - 1].range[1] > start$1053) {
                return;
            }
        }
        extra$695.comments.push({
            range: [
                start$1053,
                end$1054
            ],
            type: type$1055,
            value: value$1056
        });
    }
    function scanComment$797() {
        var comment$1057, ch$1058, start$1059, blockComment$1060, lineComment$1061;
        comment$1057 = '';
        blockComment$1060 = false;
        lineComment$1061 = false;
        while (index$688 < length$691) {
            ch$1058 = source$686[index$688];
            if (lineComment$1061) {
                ch$1058 = nextChar$710();
                if (index$688 >= length$691) {
                    lineComment$1061 = false;
                    comment$1057 += ch$1058;
                    addComment$796(start$1059, index$688, 'Line', comment$1057);
                } else if (isLineTerminator$703(ch$1058)) {
                    lineComment$1061 = false;
                    addComment$796(start$1059, index$688, 'Line', comment$1057);
                    if (ch$1058 === '\r' && source$686[index$688] === '\n') {
                        ++index$688;
                    }
                    ++lineNumber$689;
                    lineStart$690 = index$688;
                    comment$1057 = '';
                } else {
                    comment$1057 += ch$1058;
                }
            } else if (blockComment$1060) {
                if (isLineTerminator$703(ch$1058)) {
                    if (ch$1058 === '\r' && source$686[index$688 + 1] === '\n') {
                        ++index$688;
                        comment$1057 += '\r\n';
                    } else {
                        comment$1057 += ch$1058;
                    }
                    ++lineNumber$689;
                    ++index$688;
                    lineStart$690 = index$688;
                    if (index$688 >= length$691) {
                        throwError$724({}, Messages$684.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1058 = nextChar$710();
                    if (index$688 >= length$691) {
                        throwError$724({}, Messages$684.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1057 += ch$1058;
                    if (ch$1058 === '*') {
                        ch$1058 = source$686[index$688];
                        if (ch$1058 === '/') {
                            comment$1057 = comment$1057.substr(0, comment$1057.length - 1);
                            blockComment$1060 = false;
                            ++index$688;
                            addComment$796(start$1059, index$688, 'Block', comment$1057);
                            comment$1057 = '';
                        }
                    }
                }
            } else if (ch$1058 === '/') {
                ch$1058 = source$686[index$688 + 1];
                if (ch$1058 === '/') {
                    start$1059 = index$688;
                    index$688 += 2;
                    lineComment$1061 = true;
                } else if (ch$1058 === '*') {
                    start$1059 = index$688;
                    index$688 += 2;
                    blockComment$1060 = true;
                    if (index$688 >= length$691) {
                        throwError$724({}, Messages$684.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$702(ch$1058)) {
                ++index$688;
            } else if (isLineTerminator$703(ch$1058)) {
                ++index$688;
                if (ch$1058 === '\r' && source$686[index$688] === '\n') {
                    ++index$688;
                }
                ++lineNumber$689;
                lineStart$690 = index$688;
            } else {
                break;
            }
        }
    }
    function collectToken$798() {
        var token$1062 = extra$695.advance(), range$1063, value$1064;
        if (token$1062.type !== Token$680.EOF) {
            range$1063 = [
                token$1062.range[0],
                token$1062.range[1]
            ];
            value$1064 = sliceSource$698(token$1062.range[0], token$1062.range[1]);
            extra$695.tokens.push({
                type: TokenName$681[token$1062.type],
                value: value$1064,
                lineNumber: lineNumber$689,
                lineStart: lineStart$690,
                range: range$1063
            });
        }
        return token$1062;
    }
    function collectRegex$799() {
        var pos$1065, regex$1066, token$1067;
        skipComment$712();
        pos$1065 = index$688;
        regex$1066 = extra$695.scanRegExp();
        // Pop the previous token, which is likely '/' or '/='
        if (extra$695.tokens.length > 0) {
            token$1067 = extra$695.tokens[extra$695.tokens.length - 1];
            if (token$1067.range[0] === pos$1065 && token$1067.type === 'Punctuator') {
                if (token$1067.value === '/' || token$1067.value === '/=') {
                    extra$695.tokens.pop();
                }
            }
        }
        extra$695.tokens.push({
            type: 'RegularExpression',
            value: regex$1066.literal,
            range: [
                pos$1065,
                index$688
            ],
            lineStart: token$1067.lineStart,
            lineNumber: token$1067.lineNumber
        });
        return regex$1066;
    }
    function createLiteral$800(token$1068) {
        if (Array.isArray(token$1068)) {
            return {
                type: Syntax$682.Literal,
                value: token$1068
            };
        }
        return {
            type: Syntax$682.Literal,
            value: token$1068.value,
            lineStart: token$1068.lineStart,
            lineNumber: token$1068.lineNumber
        };
    }
    function createRawLiteral$801(token$1069) {
        return {
            type: Syntax$682.Literal,
            value: token$1069.value,
            raw: sliceSource$698(token$1069.range[0], token$1069.range[1]),
            lineStart: token$1069.lineStart,
            lineNumber: token$1069.lineNumber
        };
    }
    function wrapTrackingFunction$802(range$1070, loc$1071) {
        return function (parseFunction$1072) {
            function isBinary$1073(node$1075) {
                return node$1075.type === Syntax$682.LogicalExpression || node$1075.type === Syntax$682.BinaryExpression;
            }
            function visit$1074(node$1076) {
                if (isBinary$1073(node$1076.left)) {
                    visit$1074(node$1076.left);
                }
                if (isBinary$1073(node$1076.right)) {
                    visit$1074(node$1076.right);
                }
                if (range$1070 && typeof node$1076.range === 'undefined') {
                    node$1076.range = [
                        node$1076.left.range[0],
                        node$1076.right.range[1]
                    ];
                }
                if (loc$1071 && typeof node$1076.loc === 'undefined') {
                    node$1076.loc = {
                        start: node$1076.left.loc.start,
                        end: node$1076.right.loc.end
                    };
                }
            }
            return function () {
                var node$1077, rangeInfo$1078, locInfo$1079;
                // skipComment();
                var curr$1080 = tokenStream$694[index$688].token;
                rangeInfo$1078 = [
                    curr$1080.range[0],
                    0
                ];
                locInfo$1079 = {
                    start: {
                        line: curr$1080.sm_lineNumber,
                        column: curr$1080.sm_range[0] - curr$1080.sm_lineStart
                    }
                };
                node$1077 = parseFunction$1072.apply(null, arguments);
                if (typeof node$1077 !== 'undefined') {
                    var last$1081 = tokenStream$694[index$688].token;
                    if (range$1070) {
                        rangeInfo$1078[1] = last$1081.range[1];
                        node$1077.range = rangeInfo$1078;
                    }
                    if (loc$1071) {
                        locInfo$1079.end = {
                            line: last$1081.sm_lineNumber,
                            column: last$1081.sm_range[0] - last$1081.sm_lineStart
                        };
                        node$1077.loc = locInfo$1079;
                    }
                    if (isBinary$1073(node$1077)) {
                        visit$1074(node$1077);
                    }
                    if (node$1077.type === Syntax$682.MemberExpression) {
                        if (typeof node$1077.object.range !== 'undefined') {
                            node$1077.range[0] = node$1077.object.range[0];
                        }
                        if (typeof node$1077.object.loc !== 'undefined') {
                            node$1077.loc.start = node$1077.object.loc.start;
                        }
                    }
                    if (node$1077.type === Syntax$682.CallExpression) {
                        if (typeof node$1077.callee.range !== 'undefined') {
                            node$1077.range[0] = node$1077.callee.range[0];
                        }
                        if (typeof node$1077.callee.loc !== 'undefined') {
                            node$1077.loc.start = node$1077.callee.loc.start;
                        }
                    }
                    if (node$1077.type !== Syntax$682.Program) {
                        if (curr$1080.leadingComments) {
                            node$1077.leadingComments = curr$1080.leadingComments;
                        }
                        if (curr$1080.trailingComments) {
                            node$1077.trailingComments = curr$1080.trailingComments;
                        }
                    }
                    return node$1077;
                }
            };
        };
    }
    function patch$803() {
        var wrapTracking$1082;
        if (extra$695.comments) {
            extra$695.skipComment = skipComment$712;
            skipComment$712 = scanComment$797;
        }
        if (extra$695.raw) {
            extra$695.createLiteral = createLiteral$800;
            createLiteral$800 = createRawLiteral$801;
        }
        if (extra$695.range || extra$695.loc) {
            wrapTracking$1082 = wrapTrackingFunction$802(extra$695.range, extra$695.loc);
            extra$695.parseAdditiveExpression = parseAdditiveExpression$753;
            extra$695.parseAssignmentExpression = parseAssignmentExpression$763;
            extra$695.parseBitwiseANDExpression = parseBitwiseANDExpression$757;
            extra$695.parseBitwiseORExpression = parseBitwiseORExpression$759;
            extra$695.parseBitwiseXORExpression = parseBitwiseXORExpression$758;
            extra$695.parseBlock = parseBlock$766;
            extra$695.parseFunctionSourceElements = parseFunctionSourceElements$790;
            extra$695.parseCallMember = parseCallMember$744;
            extra$695.parseCatchClause = parseCatchClause$786;
            extra$695.parseComputedMember = parseComputedMember$743;
            extra$695.parseConditionalExpression = parseConditionalExpression$762;
            extra$695.parseConstLetDeclaration = parseConstLetDeclaration$771;
            extra$695.parseEqualityExpression = parseEqualityExpression$756;
            extra$695.parseExpression = parseExpression$764;
            extra$695.parseForVariableDeclaration = parseForVariableDeclaration$777;
            extra$695.parseFunctionDeclaration = parseFunctionDeclaration$791;
            extra$695.parseFunctionExpression = parseFunctionExpression$792;
            extra$695.parseLogicalANDExpression = parseLogicalANDExpression$760;
            extra$695.parseLogicalORExpression = parseLogicalORExpression$761;
            extra$695.parseMultiplicativeExpression = parseMultiplicativeExpression$752;
            extra$695.parseNewExpression = parseNewExpression$745;
            extra$695.parseNonComputedMember = parseNonComputedMember$742;
            extra$695.parseNonComputedProperty = parseNonComputedProperty$741;
            extra$695.parseObjectProperty = parseObjectProperty$737;
            extra$695.parseObjectPropertyKey = parseObjectPropertyKey$736;
            extra$695.parsePostfixExpression = parsePostfixExpression$750;
            extra$695.parsePrimaryExpression = parsePrimaryExpression$739;
            extra$695.parseProgram = parseProgram$795;
            extra$695.parsePropertyFunction = parsePropertyFunction$735;
            extra$695.parseRelationalExpression = parseRelationalExpression$755;
            extra$695.parseStatement = parseStatement$789;
            extra$695.parseShiftExpression = parseShiftExpression$754;
            extra$695.parseSwitchCase = parseSwitchCase$783;
            extra$695.parseUnaryExpression = parseUnaryExpression$751;
            extra$695.parseVariableDeclaration = parseVariableDeclaration$768;
            extra$695.parseVariableIdentifier = parseVariableIdentifier$767;
            parseAdditiveExpression$753 = wrapTracking$1082(extra$695.parseAdditiveExpression);
            parseAssignmentExpression$763 = wrapTracking$1082(extra$695.parseAssignmentExpression);
            parseBitwiseANDExpression$757 = wrapTracking$1082(extra$695.parseBitwiseANDExpression);
            parseBitwiseORExpression$759 = wrapTracking$1082(extra$695.parseBitwiseORExpression);
            parseBitwiseXORExpression$758 = wrapTracking$1082(extra$695.parseBitwiseXORExpression);
            parseBlock$766 = wrapTracking$1082(extra$695.parseBlock);
            parseFunctionSourceElements$790 = wrapTracking$1082(extra$695.parseFunctionSourceElements);
            parseCallMember$744 = wrapTracking$1082(extra$695.parseCallMember);
            parseCatchClause$786 = wrapTracking$1082(extra$695.parseCatchClause);
            parseComputedMember$743 = wrapTracking$1082(extra$695.parseComputedMember);
            parseConditionalExpression$762 = wrapTracking$1082(extra$695.parseConditionalExpression);
            parseConstLetDeclaration$771 = wrapTracking$1082(extra$695.parseConstLetDeclaration);
            parseEqualityExpression$756 = wrapTracking$1082(extra$695.parseEqualityExpression);
            parseExpression$764 = wrapTracking$1082(extra$695.parseExpression);
            parseForVariableDeclaration$777 = wrapTracking$1082(extra$695.parseForVariableDeclaration);
            parseFunctionDeclaration$791 = wrapTracking$1082(extra$695.parseFunctionDeclaration);
            parseFunctionExpression$792 = wrapTracking$1082(extra$695.parseFunctionExpression);
            parseLogicalANDExpression$760 = wrapTracking$1082(extra$695.parseLogicalANDExpression);
            parseLogicalORExpression$761 = wrapTracking$1082(extra$695.parseLogicalORExpression);
            parseMultiplicativeExpression$752 = wrapTracking$1082(extra$695.parseMultiplicativeExpression);
            parseNewExpression$745 = wrapTracking$1082(extra$695.parseNewExpression);
            parseNonComputedMember$742 = wrapTracking$1082(extra$695.parseNonComputedMember);
            parseNonComputedProperty$741 = wrapTracking$1082(extra$695.parseNonComputedProperty);
            parseObjectProperty$737 = wrapTracking$1082(extra$695.parseObjectProperty);
            parseObjectPropertyKey$736 = wrapTracking$1082(extra$695.parseObjectPropertyKey);
            parsePostfixExpression$750 = wrapTracking$1082(extra$695.parsePostfixExpression);
            parsePrimaryExpression$739 = wrapTracking$1082(extra$695.parsePrimaryExpression);
            parseProgram$795 = wrapTracking$1082(extra$695.parseProgram);
            parsePropertyFunction$735 = wrapTracking$1082(extra$695.parsePropertyFunction);
            parseRelationalExpression$755 = wrapTracking$1082(extra$695.parseRelationalExpression);
            parseStatement$789 = wrapTracking$1082(extra$695.parseStatement);
            parseShiftExpression$754 = wrapTracking$1082(extra$695.parseShiftExpression);
            parseSwitchCase$783 = wrapTracking$1082(extra$695.parseSwitchCase);
            parseUnaryExpression$751 = wrapTracking$1082(extra$695.parseUnaryExpression);
            parseVariableDeclaration$768 = wrapTracking$1082(extra$695.parseVariableDeclaration);
            parseVariableIdentifier$767 = wrapTracking$1082(extra$695.parseVariableIdentifier);
        }
        if (typeof extra$695.tokens !== 'undefined') {
            extra$695.advance = advance$720;
            extra$695.scanRegExp = scanRegExp$718;
            advance$720 = collectToken$798;
            scanRegExp$718 = collectRegex$799;
        }
    }
    function unpatch$804() {
        if (typeof extra$695.skipComment === 'function') {
            skipComment$712 = extra$695.skipComment;
        }
        if (extra$695.raw) {
            createLiteral$800 = extra$695.createLiteral;
        }
        if (extra$695.range || extra$695.loc) {
            parseAdditiveExpression$753 = extra$695.parseAdditiveExpression;
            parseAssignmentExpression$763 = extra$695.parseAssignmentExpression;
            parseBitwiseANDExpression$757 = extra$695.parseBitwiseANDExpression;
            parseBitwiseORExpression$759 = extra$695.parseBitwiseORExpression;
            parseBitwiseXORExpression$758 = extra$695.parseBitwiseXORExpression;
            parseBlock$766 = extra$695.parseBlock;
            parseFunctionSourceElements$790 = extra$695.parseFunctionSourceElements;
            parseCallMember$744 = extra$695.parseCallMember;
            parseCatchClause$786 = extra$695.parseCatchClause;
            parseComputedMember$743 = extra$695.parseComputedMember;
            parseConditionalExpression$762 = extra$695.parseConditionalExpression;
            parseConstLetDeclaration$771 = extra$695.parseConstLetDeclaration;
            parseEqualityExpression$756 = extra$695.parseEqualityExpression;
            parseExpression$764 = extra$695.parseExpression;
            parseForVariableDeclaration$777 = extra$695.parseForVariableDeclaration;
            parseFunctionDeclaration$791 = extra$695.parseFunctionDeclaration;
            parseFunctionExpression$792 = extra$695.parseFunctionExpression;
            parseLogicalANDExpression$760 = extra$695.parseLogicalANDExpression;
            parseLogicalORExpression$761 = extra$695.parseLogicalORExpression;
            parseMultiplicativeExpression$752 = extra$695.parseMultiplicativeExpression;
            parseNewExpression$745 = extra$695.parseNewExpression;
            parseNonComputedMember$742 = extra$695.parseNonComputedMember;
            parseNonComputedProperty$741 = extra$695.parseNonComputedProperty;
            parseObjectProperty$737 = extra$695.parseObjectProperty;
            parseObjectPropertyKey$736 = extra$695.parseObjectPropertyKey;
            parsePrimaryExpression$739 = extra$695.parsePrimaryExpression;
            parsePostfixExpression$750 = extra$695.parsePostfixExpression;
            parseProgram$795 = extra$695.parseProgram;
            parsePropertyFunction$735 = extra$695.parsePropertyFunction;
            parseRelationalExpression$755 = extra$695.parseRelationalExpression;
            parseStatement$789 = extra$695.parseStatement;
            parseShiftExpression$754 = extra$695.parseShiftExpression;
            parseSwitchCase$783 = extra$695.parseSwitchCase;
            parseUnaryExpression$751 = extra$695.parseUnaryExpression;
            parseVariableDeclaration$768 = extra$695.parseVariableDeclaration;
            parseVariableIdentifier$767 = extra$695.parseVariableIdentifier;
        }
        if (typeof extra$695.scanRegExp === 'function') {
            advance$720 = extra$695.advance;
            scanRegExp$718 = extra$695.scanRegExp;
        }
    }
    function stringToArray$805(str$1083) {
        var length$1084 = str$1083.length, result$1085 = [], i$1086;
        for (i$1086 = 0; i$1086 < length$1084; ++i$1086) {
            result$1085[i$1086] = str$1083.charAt(i$1086);
        }
        return result$1085;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$806(toks$1087, start$1088, inExprDelim$1089, parentIsBlock$1090) {
        var assignOps$1091 = [
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
        var binaryOps$1092 = [
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
        var unaryOps$1093 = [
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
        function back$1094(n$1095) {
            var idx$1096 = toks$1087.length - n$1095 > 0 ? toks$1087.length - n$1095 : 0;
            return toks$1087[idx$1096];
        }
        if (inExprDelim$1089 && toks$1087.length - (start$1088 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1094(start$1088 + 2).value === ':' && parentIsBlock$1090) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$697(back$1094(start$1088 + 2).value, unaryOps$1093.concat(binaryOps$1092).concat(assignOps$1091))) {
            // ... + {...}
            return false;
        } else if (back$1094(start$1088 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1097 = typeof back$1094(start$1088 + 1).startLineNumber !== 'undefined' ? back$1094(start$1088 + 1).startLineNumber : back$1094(start$1088 + 1).lineNumber;
            if (back$1094(start$1088 + 2).lineNumber !== currLineNumber$1097) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$697(back$1094(start$1088 + 2).value, [
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
    function readToken$807(toks$1098, inExprDelim$1099, parentIsBlock$1100) {
        var delimiters$1101 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1102 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1103 = toks$1098.length - 1;
        var comments$1104, commentsLen$1105 = extra$695.comments.length;
        function back$1106(n$1110) {
            var idx$1111 = toks$1098.length - n$1110 > 0 ? toks$1098.length - n$1110 : 0;
            return toks$1098[idx$1111];
        }
        function attachComments$1107(token$1112) {
            if (comments$1104) {
                token$1112.leadingComments = comments$1104;
            }
            return token$1112;
        }
        function _advance$1108() {
            return attachComments$1107(advance$720());
        }
        function _scanRegExp$1109() {
            return attachComments$1107(scanRegExp$718());
        }
        skipComment$712();
        if (extra$695.comments.length > commentsLen$1105) {
            comments$1104 = extra$695.comments.slice(commentsLen$1105);
        }
        if (isIn$697(getChar$711(), delimiters$1101)) {
            return attachComments$1107(readDelim$808(toks$1098, inExprDelim$1099, parentIsBlock$1100));
        }
        if (getChar$711() === '/') {
            var prev$1113 = back$1106(1);
            if (prev$1113) {
                if (prev$1113.value === '()') {
                    if (isIn$697(back$1106(2).value, parenIdents$1102)) {
                        // ... if (...) / ...
                        return _scanRegExp$1109();
                    }
                    // ... (...) / ...
                    return _advance$1108();
                }
                if (prev$1113.value === '{}') {
                    if (blockAllowed$806(toks$1098, 0, inExprDelim$1099, parentIsBlock$1100)) {
                        if (back$1106(2).value === '()') {
                            // named function
                            if (back$1106(4).value === 'function') {
                                if (!blockAllowed$806(toks$1098, 3, inExprDelim$1099, parentIsBlock$1100)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1108();
                                }
                                if (toks$1098.length - 5 <= 0 && inExprDelim$1099) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1108();
                                }
                            }
                            // unnamed function
                            if (back$1106(3).value === 'function') {
                                if (!blockAllowed$806(toks$1098, 2, inExprDelim$1099, parentIsBlock$1100)) {
                                    // new function (...) {...} / ...
                                    return _advance$1108();
                                }
                                if (toks$1098.length - 4 <= 0 && inExprDelim$1099) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1108();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1109();
                    } else {
                        // ... + {...} / ...
                        return _advance$1108();
                    }
                }
                if (prev$1113.type === Token$680.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1109();
                }
                if (isKeyword$709(prev$1113.value)) {
                    // typeof /...
                    return _scanRegExp$1109();
                }
                return _advance$1108();
            }
            return _scanRegExp$1109();
        }
        return _advance$1108();
    }
    function readDelim$808(toks$1114, inExprDelim$1115, parentIsBlock$1116) {
        var startDelim$1117 = advance$720(), matchDelim$1118 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1119 = [];
        var delimiters$1120 = [
                '(',
                '{',
                '['
            ];
        assert$696(delimiters$1120.indexOf(startDelim$1117.value) !== -1, 'Need to begin at the delimiter');
        var token$1121 = startDelim$1117;
        var startLineNumber$1122 = token$1121.lineNumber;
        var startLineStart$1123 = token$1121.lineStart;
        var startRange$1124 = token$1121.range;
        var delimToken$1125 = {};
        delimToken$1125.type = Token$680.Delimiter;
        delimToken$1125.value = startDelim$1117.value + matchDelim$1118[startDelim$1117.value];
        delimToken$1125.startLineNumber = startLineNumber$1122;
        delimToken$1125.startLineStart = startLineStart$1123;
        delimToken$1125.startRange = startRange$1124;
        var delimIsBlock$1126 = false;
        if (startDelim$1117.value === '{') {
            delimIsBlock$1126 = blockAllowed$806(toks$1114.concat(delimToken$1125), 0, inExprDelim$1115, parentIsBlock$1116);
        }
        while (index$688 <= length$691) {
            token$1121 = readToken$807(inner$1119, startDelim$1117.value === '(' || startDelim$1117.value === '[', delimIsBlock$1126);
            if (token$1121.type === Token$680.Punctuator && token$1121.value === matchDelim$1118[startDelim$1117.value]) {
                if (token$1121.leadingComments) {
                    delimToken$1125.trailingComments = token$1121.leadingComments;
                }
                break;
            } else if (token$1121.type === Token$680.EOF) {
                throwError$724({}, Messages$684.UnexpectedEOS);
            } else {
                inner$1119.push(token$1121);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$688 >= length$691 && matchDelim$1118[startDelim$1117.value] !== source$686[length$691 - 1]) {
            throwError$724({}, Messages$684.UnexpectedEOS);
        }
        var endLineNumber$1127 = token$1121.lineNumber;
        var endLineStart$1128 = token$1121.lineStart;
        var endRange$1129 = token$1121.range;
        delimToken$1125.inner = inner$1119;
        delimToken$1125.endLineNumber = endLineNumber$1127;
        delimToken$1125.endLineStart = endLineStart$1128;
        delimToken$1125.endRange = endRange$1129;
        return delimToken$1125;
    }
    ;
    // (Str) -> [...CSyntax]
    function read$809(code$1130) {
        var token$1131, tokenTree$1132 = [];
        extra$695 = {};
        extra$695.comments = [];
        patch$803();
        source$686 = code$1130;
        index$688 = 0;
        lineNumber$689 = source$686.length > 0 ? 1 : 0;
        lineStart$690 = 0;
        length$691 = source$686.length;
        buffer$692 = null;
        state$693 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$688 < length$691) {
            tokenTree$1132.push(readToken$807(tokenTree$1132, false, false));
        }
        var last$1133 = tokenTree$1132[tokenTree$1132.length - 1];
        if (last$1133 && last$1133.type !== Token$680.EOF) {
            tokenTree$1132.push({
                type: Token$680.EOF,
                value: '',
                lineNumber: last$1133.lineNumber,
                lineStart: last$1133.lineStart,
                range: [
                    index$688,
                    index$688
                ]
            });
        }
        return expander$679.tokensToSyntax(tokenTree$1132);
    }
    // (SyntaxObject, Str, {}) -> SyntaxObject
    function parse$810(code$1134) {
        var program$1135, toString$1136;
        tokenStream$694 = code$1134;
        index$688 = 0;
        length$691 = tokenStream$694.length;
        buffer$692 = null;
        state$693 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$695 = {
            range: true,
            loc: true
        };
        patch$803();
        try {
            program$1135 = parseProgram$795();
            program$1135.tokens = expander$679.syntaxToTokens(code$1134);
        } catch (e$1137) {
            throw e$1137;
        } finally {
            unpatch$804();
            extra$695 = {};
        }
        return program$1135;
    }
    exports$678.parse = parse$810;
    exports$678.read = read$809;
    exports$678.Token = Token$680;
    exports$678.assert = assert$696;
    // Deep copy.
    exports$678.Syntax = function () {
        var name$1138, types$1139 = {};
        if (typeof Object.create === 'function') {
            types$1139 = Object.create(null);
        }
        for (name$1138 in Syntax$682) {
            if (Syntax$682.hasOwnProperty(name$1138)) {
                types$1139[name$1138] = Syntax$682[name$1138];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1139);
        }
        return types$1139;
    }();
}));