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
(function (root$97, factory$98) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$98(exports, require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'expander'
        ], factory$98);
    }
}(this, function (exports$99, expander$100) {
    'use strict';
    var Token$101, TokenName$102, Syntax$103, PropertyKind$104, Messages$105, Regex$106, source$107, strict$108, index$109, lineNumber$110, lineStart$111, length$112, buffer$113, state$114, tokenStream$115, extra$116;
    Token$101 = {
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
    TokenName$102 = {};
    TokenName$102[Token$101.BooleanLiteral] = 'Boolean';
    TokenName$102[Token$101.EOF] = '<end>';
    TokenName$102[Token$101.Identifier] = 'Identifier';
    TokenName$102[Token$101.Keyword] = 'Keyword';
    TokenName$102[Token$101.NullLiteral] = 'Null';
    TokenName$102[Token$101.NumericLiteral] = 'Numeric';
    TokenName$102[Token$101.Punctuator] = 'Punctuator';
    TokenName$102[Token$101.StringLiteral] = 'String';
    TokenName$102[Token$101.Delimiter] = 'Delimiter';
    Syntax$103 = {
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
    PropertyKind$104 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    // Error messages should be identical to V8.
    Messages$105 = {
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
    Regex$106 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$117(condition$232, message$233) {
        if (!condition$232) {
            throw new Error('ASSERT: ' + message$233);
        }
    }
    function isIn$118(el$234, list$235) {
        return list$235.indexOf(el$234) !== -1;
    }
    function sliceSource$119(from$236, to$237) {
        return source$107.slice(from$236, to$237);
    }
    if (typeof 'esprima'[0] === 'undefined') {
        sliceSource$119 = function sliceArraySource$238(from$239, to$240) {
            return source$107.slice(from$239, to$240).join('');
        };
    }
    function isDecimalDigit$120(ch$241) {
        return '0123456789'.indexOf(ch$241) >= 0;
    }
    function isHexDigit$121(ch$242) {
        return '0123456789abcdefABCDEF'.indexOf(ch$242) >= 0;
    }
    function isOctalDigit$122(ch$243) {
        return '01234567'.indexOf(ch$243) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$123(ch$244) {
        return ch$244 === ' ' || ch$244 === '\t' || ch$244 === '\x0B' || ch$244 === '\f' || ch$244 === '\xa0' || ch$244.charCodeAt(0) >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(ch$244) >= 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$124(ch$245) {
        return ch$245 === '\n' || ch$245 === '\r' || ch$245 === '\u2028' || ch$245 === '\u2029';
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$125(ch$246) {
        return ch$246 === '$' || ch$246 === '_' || ch$246 === '\\' || ch$246 >= 'a' && ch$246 <= 'z' || ch$246 >= 'A' && ch$246 <= 'Z' || ch$246.charCodeAt(0) >= 128 && Regex$106.NonAsciiIdentifierStart.test(ch$246);
    }
    function isIdentifierPart$126(ch$247) {
        return ch$247 === '$' || ch$247 === '_' || ch$247 === '\\' || ch$247 >= 'a' && ch$247 <= 'z' || ch$247 >= 'A' && ch$247 <= 'Z' || ch$247 >= '0' && ch$247 <= '9' || ch$247.charCodeAt(0) >= 128 && Regex$106.NonAsciiIdentifierPart.test(ch$247);
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$127(id$248) {
        // we are allowing future reserved words so macros can be written for them
        return false;
    }
    function isStrictModeReservedWord$128(id$249) {
        switch (id$249) {
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
    function isRestrictedWord$129(id$250) {
        return id$250 === 'eval' || id$250 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$130(id$251) {
        var keyword$252 = false;
        switch (id$251.length) {
        case 2:
            keyword$252 = id$251 === 'if' || id$251 === 'in' || id$251 === 'do';
            break;
        case 3:
            keyword$252 = id$251 === 'var' || id$251 === 'for' || id$251 === 'new' || id$251 === 'try';
            break;
        case 4:
            keyword$252 = id$251 === 'this' || id$251 === 'else' || id$251 === 'case' || id$251 === 'void' || id$251 === 'with';
            break;
        case 5:
            keyword$252 = id$251 === 'while' || id$251 === 'break' || id$251 === 'catch' || id$251 === 'throw';
            break;
        case 6:
            keyword$252 = id$251 === 'return' || id$251 === 'typeof' || id$251 === 'delete' || id$251 === 'switch';
            break;
        case 7:
            keyword$252 = id$251 === 'default' || id$251 === 'finally';
            break;
        case 8:
            keyword$252 = id$251 === 'function' || id$251 === 'continue' || id$251 === 'debugger';
            break;
        case 10:
            keyword$252 = id$251 === 'instanceof';
            break;
        }
        if (keyword$252) {
            return true;
        }
        switch (id$251) {
        // Future reserved words.
        // 'const' is specialized as Keyword in V8.
        case 'const':
            return true;
        // For compatiblity to SpiderMonkey and ES.next
        case 'yield':
        case 'let':
            return true;
        }
        if (strict$108 && isStrictModeReservedWord$128(id$251)) {
            return true;
        }
        return isFutureReservedWord$127(id$251);
    }
    // Return the next character and move forward.
    function nextChar$131() {
        return source$107[index$109++];
    }
    function getChar$132() {
        return source$107[index$109];
    }
    // 7.4 Comments
    function skipComment$133() {
        var ch$253, blockComment$254, lineComment$255;
        blockComment$254 = false;
        lineComment$255 = false;
        while (index$109 < length$112) {
            ch$253 = source$107[index$109];
            if (lineComment$255) {
                ch$253 = nextChar$131();
                if (isLineTerminator$124(ch$253)) {
                    lineComment$255 = false;
                    if (ch$253 === '\r' && source$107[index$109] === '\n') {
                        ++index$109;
                    }
                    ++lineNumber$110;
                    lineStart$111 = index$109;
                }
            } else if (blockComment$254) {
                if (isLineTerminator$124(ch$253)) {
                    if (ch$253 === '\r' && source$107[index$109 + 1] === '\n') {
                        ++index$109;
                    }
                    ++lineNumber$110;
                    ++index$109;
                    lineStart$111 = index$109;
                    if (index$109 >= length$112) {
                        throwError$145({}, Messages$105.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$253 = nextChar$131();
                    if (index$109 >= length$112) {
                        throwError$145({}, Messages$105.UnexpectedToken, 'ILLEGAL');
                    }
                    if (ch$253 === '*') {
                        ch$253 = source$107[index$109];
                        if (ch$253 === '/') {
                            ++index$109;
                            blockComment$254 = false;
                        }
                    }
                }
            } else if (ch$253 === '/') {
                ch$253 = source$107[index$109 + 1];
                if (ch$253 === '/') {
                    index$109 += 2;
                    lineComment$255 = true;
                } else if (ch$253 === '*') {
                    index$109 += 2;
                    blockComment$254 = true;
                    if (index$109 >= length$112) {
                        throwError$145({}, Messages$105.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$123(ch$253)) {
                ++index$109;
            } else if (isLineTerminator$124(ch$253)) {
                ++index$109;
                if (ch$253 === '\r' && source$107[index$109] === '\n') {
                    ++index$109;
                }
                ++lineNumber$110;
                lineStart$111 = index$109;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$134(prefix$256) {
        var i$257, len$258, ch$259, code$260 = 0;
        len$258 = prefix$256 === 'u' ? 4 : 2;
        for (i$257 = 0; i$257 < len$258; ++i$257) {
            if (index$109 < length$112 && isHexDigit$121(source$107[index$109])) {
                ch$259 = nextChar$131();
                code$260 = code$260 * 16 + '0123456789abcdef'.indexOf(ch$259.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$260);
    }
    function scanIdentifier$135() {
        var ch$261, start$262, id$263, restore$264;
        ch$261 = source$107[index$109];
        if (!isIdentifierStart$125(ch$261)) {
            return;
        }
        start$262 = index$109;
        if (ch$261 === '\\') {
            ++index$109;
            if (source$107[index$109] !== 'u') {
                return;
            }
            ++index$109;
            restore$264 = index$109;
            ch$261 = scanHexEscape$134('u');
            if (ch$261) {
                if (ch$261 === '\\' || !isIdentifierStart$125(ch$261)) {
                    return;
                }
                id$263 = ch$261;
            } else {
                index$109 = restore$264;
                id$263 = 'u';
            }
        } else {
            id$263 = nextChar$131();
        }
        while (index$109 < length$112) {
            ch$261 = source$107[index$109];
            if (!isIdentifierPart$126(ch$261)) {
                break;
            }
            if (ch$261 === '\\') {
                ++index$109;
                if (source$107[index$109] !== 'u') {
                    return;
                }
                ++index$109;
                restore$264 = index$109;
                ch$261 = scanHexEscape$134('u');
                if (ch$261) {
                    if (ch$261 === '\\' || !isIdentifierPart$126(ch$261)) {
                        return;
                    }
                    id$263 += ch$261;
                } else {
                    index$109 = restore$264;
                    id$263 += 'u';
                }
            } else {
                id$263 += nextChar$131();
            }
        }
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$263.length === 1) {
            return {
                type: Token$101.Identifier,
                value: id$263,
                lineNumber: lineNumber$110,
                lineStart: lineStart$111,
                range: [
                    start$262,
                    index$109
                ]
            };
        }
        if (isKeyword$130(id$263)) {
            return {
                type: Token$101.Keyword,
                value: id$263,
                lineNumber: lineNumber$110,
                lineStart: lineStart$111,
                range: [
                    start$262,
                    index$109
                ]
            };
        }
        // 7.8.1 Null Literals
        if (id$263 === 'null') {
            return {
                type: Token$101.NullLiteral,
                value: id$263,
                lineNumber: lineNumber$110,
                lineStart: lineStart$111,
                range: [
                    start$262,
                    index$109
                ]
            };
        }
        // 7.8.2 Boolean Literals
        if (id$263 === 'true' || id$263 === 'false') {
            return {
                type: Token$101.BooleanLiteral,
                value: id$263,
                lineNumber: lineNumber$110,
                lineStart: lineStart$111,
                range: [
                    start$262,
                    index$109
                ]
            };
        }
        return {
            type: Token$101.Identifier,
            value: id$263,
            lineNumber: lineNumber$110,
            lineStart: lineStart$111,
            range: [
                start$262,
                index$109
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$136() {
        var start$265 = index$109, ch1$266 = source$107[index$109], ch2$267, ch3$268, ch4$269;
        // Check for most common single-character punctuators.
        if (ch1$266 === ';' || ch1$266 === '{' || ch1$266 === '}') {
            ++index$109;
            return {
                type: Token$101.Punctuator,
                value: ch1$266,
                lineNumber: lineNumber$110,
                lineStart: lineStart$111,
                range: [
                    start$265,
                    index$109
                ]
            };
        }
        if (ch1$266 === ',' || ch1$266 === '(' || ch1$266 === ')') {
            ++index$109;
            return {
                type: Token$101.Punctuator,
                value: ch1$266,
                lineNumber: lineNumber$110,
                lineStart: lineStart$111,
                range: [
                    start$265,
                    index$109
                ]
            };
        }
        if (ch1$266 === '#' || ch1$266 === '@') {
            ++index$109;
            return {
                type: Token$101.Punctuator,
                value: ch1$266,
                lineNumber: lineNumber$110,
                lineStart: lineStart$111,
                range: [
                    start$265,
                    index$109
                ]
            };
        }
        // Dot (.) can also start a floating-point number, hence the need
        // to check the next character.
        ch2$267 = source$107[index$109 + 1];
        if (ch1$266 === '.' && !isDecimalDigit$120(ch2$267)) {
            if (source$107[index$109 + 1] === '.' && source$107[index$109 + 2] === '.') {
                nextChar$131();
                nextChar$131();
                nextChar$131();
                return {
                    type: Token$101.Punctuator,
                    value: '...',
                    lineNumber: lineNumber$110,
                    lineStart: lineStart$111,
                    range: [
                        start$265,
                        index$109
                    ]
                };
            } else {
                return {
                    type: Token$101.Punctuator,
                    value: nextChar$131(),
                    lineNumber: lineNumber$110,
                    lineStart: lineStart$111,
                    range: [
                        start$265,
                        index$109
                    ]
                };
            }
        }
        // Peek more characters.
        ch3$268 = source$107[index$109 + 2];
        ch4$269 = source$107[index$109 + 3];
        // 4-character punctuator: >>>=
        if (ch1$266 === '>' && ch2$267 === '>' && ch3$268 === '>') {
            if (ch4$269 === '=') {
                index$109 += 4;
                return {
                    type: Token$101.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$110,
                    lineStart: lineStart$111,
                    range: [
                        start$265,
                        index$109
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$266 === '=' && ch2$267 === '=' && ch3$268 === '=') {
            index$109 += 3;
            return {
                type: Token$101.Punctuator,
                value: '===',
                lineNumber: lineNumber$110,
                lineStart: lineStart$111,
                range: [
                    start$265,
                    index$109
                ]
            };
        }
        if (ch1$266 === '!' && ch2$267 === '=' && ch3$268 === '=') {
            index$109 += 3;
            return {
                type: Token$101.Punctuator,
                value: '!==',
                lineNumber: lineNumber$110,
                lineStart: lineStart$111,
                range: [
                    start$265,
                    index$109
                ]
            };
        }
        if (ch1$266 === '>' && ch2$267 === '>' && ch3$268 === '>') {
            index$109 += 3;
            return {
                type: Token$101.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$110,
                lineStart: lineStart$111,
                range: [
                    start$265,
                    index$109
                ]
            };
        }
        if (ch1$266 === '<' && ch2$267 === '<' && ch3$268 === '=') {
            index$109 += 3;
            return {
                type: Token$101.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$110,
                lineStart: lineStart$111,
                range: [
                    start$265,
                    index$109
                ]
            };
        }
        if (ch1$266 === '>' && ch2$267 === '>' && ch3$268 === '=') {
            index$109 += 3;
            return {
                type: Token$101.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$110,
                lineStart: lineStart$111,
                range: [
                    start$265,
                    index$109
                ]
            };
        }
        // 2-character punctuators: <= >= == != ++ -- << >> && ||
        // += -= *= %= &= |= ^= /=
        if (ch2$267 === '=') {
            if ('<>=!+-*%&|^/'.indexOf(ch1$266) >= 0) {
                index$109 += 2;
                return {
                    type: Token$101.Punctuator,
                    value: ch1$266 + ch2$267,
                    lineNumber: lineNumber$110,
                    lineStart: lineStart$111,
                    range: [
                        start$265,
                        index$109
                    ]
                };
            }
        }
        if (ch1$266 === ch2$267 && '+-<>&|'.indexOf(ch1$266) >= 0) {
            if ('+-<>&|'.indexOf(ch2$267) >= 0) {
                index$109 += 2;
                return {
                    type: Token$101.Punctuator,
                    value: ch1$266 + ch2$267,
                    lineNumber: lineNumber$110,
                    lineStart: lineStart$111,
                    range: [
                        start$265,
                        index$109
                    ]
                };
            }
        }
        // The remaining 1-character punctuators.
        if ('[]<>+-*%&|^!~?:=/'.indexOf(ch1$266) >= 0) {
            return {
                type: Token$101.Punctuator,
                value: nextChar$131(),
                lineNumber: lineNumber$110,
                lineStart: lineStart$111,
                range: [
                    start$265,
                    index$109
                ]
            };
        }
    }
    // 7.8.3 Numeric Literals
    function scanNumericLiteral$137() {
        var number$270, start$271, ch$272;
        ch$272 = source$107[index$109];
        assert$117(isDecimalDigit$120(ch$272) || ch$272 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$271 = index$109;
        number$270 = '';
        if (ch$272 !== '.') {
            number$270 = nextChar$131();
            ch$272 = source$107[index$109];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            if (number$270 === '0') {
                if (ch$272 === 'x' || ch$272 === 'X') {
                    number$270 += nextChar$131();
                    while (index$109 < length$112) {
                        ch$272 = source$107[index$109];
                        if (!isHexDigit$121(ch$272)) {
                            break;
                        }
                        number$270 += nextChar$131();
                    }
                    if (number$270.length <= 2) {
                        // only 0x
                        throwError$145({}, Messages$105.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$109 < length$112) {
                        ch$272 = source$107[index$109];
                        if (isIdentifierStart$125(ch$272)) {
                            throwError$145({}, Messages$105.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$101.NumericLiteral,
                        value: parseInt(number$270, 16),
                        lineNumber: lineNumber$110,
                        lineStart: lineStart$111,
                        range: [
                            start$271,
                            index$109
                        ]
                    };
                } else if (isOctalDigit$122(ch$272)) {
                    number$270 += nextChar$131();
                    while (index$109 < length$112) {
                        ch$272 = source$107[index$109];
                        if (!isOctalDigit$122(ch$272)) {
                            break;
                        }
                        number$270 += nextChar$131();
                    }
                    if (index$109 < length$112) {
                        ch$272 = source$107[index$109];
                        if (isIdentifierStart$125(ch$272) || isDecimalDigit$120(ch$272)) {
                            throwError$145({}, Messages$105.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$101.NumericLiteral,
                        value: parseInt(number$270, 8),
                        octal: true,
                        lineNumber: lineNumber$110,
                        lineStart: lineStart$111,
                        range: [
                            start$271,
                            index$109
                        ]
                    };
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (isDecimalDigit$120(ch$272)) {
                    throwError$145({}, Messages$105.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (index$109 < length$112) {
                ch$272 = source$107[index$109];
                if (!isDecimalDigit$120(ch$272)) {
                    break;
                }
                number$270 += nextChar$131();
            }
        }
        if (ch$272 === '.') {
            number$270 += nextChar$131();
            while (index$109 < length$112) {
                ch$272 = source$107[index$109];
                if (!isDecimalDigit$120(ch$272)) {
                    break;
                }
                number$270 += nextChar$131();
            }
        }
        if (ch$272 === 'e' || ch$272 === 'E') {
            number$270 += nextChar$131();
            ch$272 = source$107[index$109];
            if (ch$272 === '+' || ch$272 === '-') {
                number$270 += nextChar$131();
            }
            ch$272 = source$107[index$109];
            if (isDecimalDigit$120(ch$272)) {
                number$270 += nextChar$131();
                while (index$109 < length$112) {
                    ch$272 = source$107[index$109];
                    if (!isDecimalDigit$120(ch$272)) {
                        break;
                    }
                    number$270 += nextChar$131();
                }
            } else {
                ch$272 = 'character ' + ch$272;
                if (index$109 >= length$112) {
                    ch$272 = '<end>';
                }
                throwError$145({}, Messages$105.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (index$109 < length$112) {
            ch$272 = source$107[index$109];
            if (isIdentifierStart$125(ch$272)) {
                throwError$145({}, Messages$105.UnexpectedToken, 'ILLEGAL');
            }
        }
        return {
            type: Token$101.NumericLiteral,
            value: parseFloat(number$270),
            lineNumber: lineNumber$110,
            lineStart: lineStart$111,
            range: [
                start$271,
                index$109
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$138() {
        var str$273 = '', quote$274, start$275, ch$276, code$277, unescaped$278, restore$279, octal$280 = false;
        quote$274 = source$107[index$109];
        assert$117(quote$274 === '\'' || quote$274 === '"', 'String literal must starts with a quote');
        start$275 = index$109;
        ++index$109;
        while (index$109 < length$112) {
            ch$276 = nextChar$131();
            if (ch$276 === quote$274) {
                quote$274 = '';
                break;
            } else if (ch$276 === '\\') {
                ch$276 = nextChar$131();
                if (!isLineTerminator$124(ch$276)) {
                    switch (ch$276) {
                    case 'n':
                        str$273 += '\n';
                        break;
                    case 'r':
                        str$273 += '\r';
                        break;
                    case 't':
                        str$273 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        restore$279 = index$109;
                        unescaped$278 = scanHexEscape$134(ch$276);
                        if (unescaped$278) {
                            str$273 += unescaped$278;
                        } else {
                            index$109 = restore$279;
                            str$273 += ch$276;
                        }
                        break;
                    case 'b':
                        str$273 += '\b';
                        break;
                    case 'f':
                        str$273 += '\f';
                        break;
                    case 'v':
                        str$273 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$122(ch$276)) {
                            code$277 = '01234567'.indexOf(ch$276);
                            // \0 is not octal escape sequence
                            if (code$277 !== 0) {
                                octal$280 = true;
                            }
                            if (index$109 < length$112 && isOctalDigit$122(source$107[index$109])) {
                                octal$280 = true;
                                code$277 = code$277 * 8 + '01234567'.indexOf(nextChar$131());
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$276) >= 0 && index$109 < length$112 && isOctalDigit$122(source$107[index$109])) {
                                    code$277 = code$277 * 8 + '01234567'.indexOf(nextChar$131());
                                }
                            }
                            str$273 += String.fromCharCode(code$277);
                        } else {
                            str$273 += ch$276;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$110;
                    if (ch$276 === '\r' && source$107[index$109] === '\n') {
                        ++index$109;
                    }
                }
            } else if (isLineTerminator$124(ch$276)) {
                break;
            } else {
                str$273 += ch$276;
            }
        }
        if (quote$274 !== '') {
            throwError$145({}, Messages$105.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$101.StringLiteral,
            value: str$273,
            octal: octal$280,
            lineNumber: lineNumber$110,
            lineStart: lineStart$111,
            range: [
                start$275,
                index$109
            ]
        };
    }
    function scanRegExp$139() {
        var str$281 = '', ch$282, start$283, pattern$284, flags$285, value$286, classMarker$287 = false, restore$288;
        buffer$113 = null;
        skipComment$133();
        start$283 = index$109;
        ch$282 = source$107[index$109];
        assert$117(ch$282 === '/', 'Regular expression literal must start with a slash');
        str$281 = nextChar$131();
        while (index$109 < length$112) {
            ch$282 = nextChar$131();
            str$281 += ch$282;
            if (classMarker$287) {
                if (ch$282 === ']') {
                    classMarker$287 = false;
                }
            } else {
                if (ch$282 === '\\') {
                    ch$282 = nextChar$131();
                    // ECMA-262 7.8.5
                    if (isLineTerminator$124(ch$282)) {
                        throwError$145({}, Messages$105.UnterminatedRegExp);
                    }
                    str$281 += ch$282;
                } else if (ch$282 === '/') {
                    break;
                } else if (ch$282 === '[') {
                    classMarker$287 = true;
                } else if (isLineTerminator$124(ch$282)) {
                    throwError$145({}, Messages$105.UnterminatedRegExp);
                }
            }
        }
        if (str$281.length === 1) {
            throwError$145({}, Messages$105.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$284 = str$281.substr(1, str$281.length - 2);
        flags$285 = '';
        while (index$109 < length$112) {
            ch$282 = source$107[index$109];
            if (!isIdentifierPart$126(ch$282)) {
                break;
            }
            ++index$109;
            if (ch$282 === '\\' && index$109 < length$112) {
                ch$282 = source$107[index$109];
                if (ch$282 === 'u') {
                    ++index$109;
                    restore$288 = index$109;
                    ch$282 = scanHexEscape$134('u');
                    if (ch$282) {
                        flags$285 += ch$282;
                        str$281 += '\\u';
                        for (; restore$288 < index$109; ++restore$288) {
                            str$281 += source$107[restore$288];
                        }
                    } else {
                        index$109 = restore$288;
                        flags$285 += 'u';
                        str$281 += '\\u';
                    }
                } else {
                    str$281 += '\\';
                }
            } else {
                flags$285 += ch$282;
                str$281 += ch$282;
            }
        }
        try {
            value$286 = new RegExp(pattern$284, flags$285);
        } catch (e$289) {
            throwError$145({}, Messages$105.InvalidRegExp);
        }
        return {
            type: Token$101.RegexLiteral,
            literal: str$281,
            value: value$286,
            lineNumber: lineNumber$110,
            lineStart: lineStart$111,
            range: [
                start$283,
                index$109
            ]
        };
    }
    function isIdentifierName$140(token$290) {
        return token$290.type === Token$101.Identifier || token$290.type === Token$101.Keyword || token$290.type === Token$101.BooleanLiteral || token$290.type === Token$101.NullLiteral;
    }
    // only used by the reader
    function advance$141() {
        var ch$291, token$292;
        skipComment$133();
        if (index$109 >= length$112) {
            return {
                type: Token$101.EOF,
                lineNumber: lineNumber$110,
                lineStart: lineStart$111,
                range: [
                    index$109,
                    index$109
                ]
            };
        }
        ch$291 = source$107[index$109];
        token$292 = scanPunctuator$136();
        if (typeof token$292 !== 'undefined') {
            return token$292;
        }
        if (ch$291 === '\'' || ch$291 === '"') {
            return scanStringLiteral$138();
        }
        if (ch$291 === '.' || isDecimalDigit$120(ch$291)) {
            return scanNumericLiteral$137();
        }
        token$292 = scanIdentifier$135();
        if (typeof token$292 !== 'undefined') {
            return token$292;
        }
        throwError$145({}, Messages$105.UnexpectedToken, 'ILLEGAL');
    }
    function lex$142() {
        var token$293;
        if (buffer$113) {
            token$293 = buffer$113;
            buffer$113 = null;
            index$109++;
            return token$293;
        }
        buffer$113 = null;
        return tokenStream$115[index$109++];
    }
    function lookahead$143() {
        var pos$294, line$295, start$296;
        if (buffer$113 !== null) {
            return buffer$113;
        }
        buffer$113 = tokenStream$115[index$109];
        return buffer$113;
    }
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$144() {
        var pos$297, line$298, start$299, found$300;
        found$300 = tokenStream$115[index$109 - 1].token.lineNumber !== tokenStream$115[index$109].token.lineNumber;
        return found$300;
    }
    // Throw an exception
    function throwError$145(token$301, messageFormat$302) {
        var error$303, args$304 = Array.prototype.slice.call(arguments, 2), msg$305 = messageFormat$302.replace(/%(\d)/g, function (whole$306, index$307) {
                return args$304[index$307] || '';
            });
        if (typeof token$301.lineNumber === 'number') {
            error$303 = new Error('Line ' + token$301.lineNumber + ': ' + msg$305);
            error$303.lineNumber = token$301.lineNumber;
            if (token$301.range && token$301.range.length > 0) {
                error$303.index = token$301.range[0];
                error$303.column = token$301.range[0] - lineStart$111 + 1;
            }
        } else {
            error$303 = new Error('Line ' + lineNumber$110 + ': ' + msg$305);
            error$303.index = index$109;
            error$303.lineNumber = lineNumber$110;
            error$303.column = index$109 - lineStart$111 + 1;
        }
        throw error$303;
    }
    function throwErrorTolerant$146() {
        var error$308;
        try {
            throwError$145.apply(null, arguments);
        } catch (e$309) {
            if (extra$116.errors) {
                extra$116.errors.push(e$309);
            } else {
                throw e$309;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$147(token$310) {
        var s$311;
        if (token$310.type === Token$101.EOF) {
            throwError$145(token$310, Messages$105.UnexpectedEOS);
        }
        if (token$310.type === Token$101.NumericLiteral) {
            throwError$145(token$310, Messages$105.UnexpectedNumber);
        }
        if (token$310.type === Token$101.StringLiteral) {
            throwError$145(token$310, Messages$105.UnexpectedString);
        }
        if (token$310.type === Token$101.Identifier) {
            console.log(token$310);
            throwError$145(token$310, Messages$105.UnexpectedIdentifier);
        }
        if (token$310.type === Token$101.Keyword) {
            if (isFutureReservedWord$127(token$310.value)) {
                throwError$145(token$310, Messages$105.UnexpectedReserved);
            } else if (strict$108 && isStrictModeReservedWord$128(token$310.value)) {
                throwError$145(token$310, Messages$105.StrictReservedWord);
            }
            throwError$145(token$310, Messages$105.UnexpectedToken, token$310.value);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$145(token$310, Messages$105.UnexpectedToken, token$310.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$148(value$312) {
        var token$313 = lex$142().token;
        if (token$313.type !== Token$101.Punctuator || token$313.value !== value$312) {
            throwUnexpected$147(token$313);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$149(keyword$314) {
        var token$315 = lex$142().token;
        if (token$315.type !== Token$101.Keyword || token$315.value !== keyword$314) {
            throwUnexpected$147(token$315);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$150(value$316) {
        var token$317 = lookahead$143().token;
        return token$317.type === Token$101.Punctuator && token$317.value === value$316;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$151(keyword$318) {
        var token$319 = lookahead$143().token;
        return token$319.type === Token$101.Keyword && token$319.value === keyword$318;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$152() {
        var token$320 = lookahead$143().token, op$321 = token$320.value;
        if (token$320.type !== Token$101.Punctuator) {
            return false;
        }
        return op$321 === '=' || op$321 === '*=' || op$321 === '/=' || op$321 === '%=' || op$321 === '+=' || op$321 === '-=' || op$321 === '<<=' || op$321 === '>>=' || op$321 === '>>>=' || op$321 === '&=' || op$321 === '^=' || op$321 === '|=';
    }
    function consumeSemicolon$153() {
        var token$322, line$323;
        if (tokenStream$115[index$109].token.value === ';') {
            lex$142().token;
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
        line$323 = tokenStream$115[index$109 - 1].token.lineNumber;
        token$322 = tokenStream$115[index$109].token;
        if (line$323 !== token$322.lineNumber) {
            return;
        }
        if (token$322.type !== Token$101.EOF && !match$150('}')) {
            throwUnexpected$147(token$322);
        }
        return;
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$154(expr$324) {
        return expr$324.type === Syntax$103.Identifier || expr$324.type === Syntax$103.MemberExpression;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$155() {
        var elements$325 = [], undef$326;
        expect$148('[');
        while (!match$150(']')) {
            if (match$150(',')) {
                lex$142().token;
                elements$325.push(undef$326);
            } else {
                elements$325.push(parseAssignmentExpression$184());
                if (!match$150(']')) {
                    expect$148(',');
                }
            }
        }
        expect$148(']');
        return {
            type: Syntax$103.ArrayExpression,
            elements: elements$325
        };
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$156(param$327, first$328) {
        var previousStrict$329, body$330;
        previousStrict$329 = strict$108;
        body$330 = parseFunctionSourceElements$211();
        if (first$328 && strict$108 && isRestrictedWord$129(param$327[0].name)) {
            throwError$145(first$328, Messages$105.StrictParamName);
        }
        strict$108 = previousStrict$329;
        return {
            type: Syntax$103.FunctionExpression,
            id: null,
            params: param$327,
            body: body$330
        };
    }
    function parseObjectPropertyKey$157() {
        var token$331 = lex$142().token;
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$331.type === Token$101.StringLiteral || token$331.type === Token$101.NumericLiteral) {
            if (strict$108 && token$331.octal) {
                throwError$145(token$331, Messages$105.StrictOctalLiteral);
            }
            return createLiteral$221(token$331);
        }
        return {
            type: Syntax$103.Identifier,
            name: token$331.value
        };
    }
    function parseObjectProperty$158() {
        var token$332, key$333, id$334, param$335;
        token$332 = lookahead$143().token;
        if (token$332.type === Token$101.Identifier) {
            id$334 = parseObjectPropertyKey$157();
            // Property Assignment: Getter and Setter.
            if (token$332.value === 'get' && !match$150(':')) {
                key$333 = parseObjectPropertyKey$157();
                expect$148('(');
                expect$148(')');
                return {
                    type: Syntax$103.Property,
                    key: key$333,
                    value: parsePropertyFunction$156([]),
                    kind: 'get'
                };
            } else if (token$332.value === 'set' && !match$150(':')) {
                key$333 = parseObjectPropertyKey$157();
                expect$148('(');
                token$332 = lookahead$143().token;
                if (token$332.type !== Token$101.Identifier) {
                    throwUnexpected$147(lex$142().token);
                }
                param$335 = [parseVariableIdentifier$188()];
                expect$148(')');
                return {
                    type: Syntax$103.Property,
                    key: key$333,
                    value: parsePropertyFunction$156(param$335, token$332),
                    kind: 'set'
                };
            } else {
                expect$148(':');
                return {
                    type: Syntax$103.Property,
                    key: id$334,
                    value: parseAssignmentExpression$184(),
                    kind: 'init'
                };
            }
        } else if (token$332.type === Token$101.EOF || token$332.type === Token$101.Punctuator) {
            throwUnexpected$147(token$332);
        } else {
            key$333 = parseObjectPropertyKey$157();
            expect$148(':');
            return {
                type: Syntax$103.Property,
                key: key$333,
                value: parseAssignmentExpression$184(),
                kind: 'init'
            };
        }
    }
    function parseObjectInitialiser$159() {
        var token$336, properties$337 = [], property$338, name$339, kind$340, map$341 = {}, toString$342 = String;
        expect$148('{');
        while (!match$150('}')) {
            property$338 = parseObjectProperty$158();
            if (property$338.key.type === Syntax$103.Identifier) {
                name$339 = property$338.key.name;
            } else {
                name$339 = toString$342(property$338.key.value);
            }
            kind$340 = property$338.kind === 'init' ? PropertyKind$104.Data : property$338.kind === 'get' ? PropertyKind$104.Get : PropertyKind$104.Set;
            if (Object.prototype.hasOwnProperty.call(map$341, name$339)) {
                if (map$341[name$339] === PropertyKind$104.Data) {
                    if (strict$108 && kind$340 === PropertyKind$104.Data) {
                        throwErrorTolerant$146({}, Messages$105.StrictDuplicateProperty);
                    } else if (kind$340 !== PropertyKind$104.Data) {
                        throwError$145({}, Messages$105.AccessorDataProperty);
                    }
                } else {
                    if (kind$340 === PropertyKind$104.Data) {
                        throwError$145({}, Messages$105.AccessorDataProperty);
                    } else if (map$341[name$339] & kind$340) {
                        throwError$145({}, Messages$105.AccessorGetSet);
                    }
                }
                map$341[name$339] |= kind$340;
            } else {
                map$341[name$339] = kind$340;
            }
            properties$337.push(property$338);
            if (!match$150('}')) {
                expect$148(',');
            }
        }
        expect$148('}');
        return {
            type: Syntax$103.ObjectExpression,
            properties: properties$337
        };
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$160() {
        var expr$343, token$344 = lookahead$143().token, type$345 = token$344.type;
        if (type$345 === Token$101.Identifier) {
            var name$346 = expander$100.resolve(lex$142());
            return {
                type: Syntax$103.Identifier,
                name: name$346
            };
        }
        if (type$345 === Token$101.StringLiteral || type$345 === Token$101.NumericLiteral) {
            if (strict$108 && token$344.octal) {
                throwErrorTolerant$146(token$344, Messages$105.StrictOctalLiteral);
            }
            return createLiteral$221(lex$142().token);
        }
        if (type$345 === Token$101.Keyword) {
            if (matchKeyword$151('this')) {
                lex$142().token;
                return { type: Syntax$103.ThisExpression };
            }
            if (matchKeyword$151('function')) {
                return parseFunctionExpression$213();
            }
        }
        if (type$345 === Token$101.BooleanLiteral) {
            lex$142();
            token$344.value = token$344.value === 'true';
            return createLiteral$221(token$344);
        }
        if (type$345 === Token$101.NullLiteral) {
            lex$142();
            token$344.value = null;
            return createLiteral$221(token$344);
        }
        if (match$150('[')) {
            return parseArrayInitialiser$155();
        }
        if (match$150('{')) {
            return parseObjectInitialiser$159();
        }
        if (match$150('(')) {
            lex$142();
            state$114.lastParenthesized = expr$343 = parseExpression$185();
            expect$148(')');
            return expr$343;
        }
        if (token$344.value instanceof RegExp) {
            return createLiteral$221(lex$142().token);
        }
        return throwUnexpected$147(lex$142().token);
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$161() {
        var args$347 = [];
        expect$148('(');
        if (!match$150(')')) {
            while (index$109 < length$112) {
                args$347.push(parseAssignmentExpression$184());
                if (match$150(')')) {
                    break;
                }
                expect$148(',');
            }
        }
        expect$148(')');
        return args$347;
    }
    function parseNonComputedProperty$162() {
        var token$348 = lex$142().token;
        if (!isIdentifierName$140(token$348)) {
            throwUnexpected$147(token$348);
        }
        return {
            type: Syntax$103.Identifier,
            name: token$348.value
        };
    }
    function parseNonComputedMember$163(object$349) {
        return {
            type: Syntax$103.MemberExpression,
            computed: false,
            object: object$349,
            property: parseNonComputedProperty$162()
        };
    }
    function parseComputedMember$164(object$350) {
        var property$351, expr$352;
        expect$148('[');
        property$351 = parseExpression$185();
        expr$352 = {
            type: Syntax$103.MemberExpression,
            computed: true,
            object: object$350,
            property: property$351
        };
        expect$148(']');
        return expr$352;
    }
    function parseCallMember$165(object$353) {
        return {
            type: Syntax$103.CallExpression,
            callee: object$353,
            'arguments': parseArguments$161()
        };
    }
    function parseNewExpression$166() {
        var expr$354;
        expectKeyword$149('new');
        expr$354 = {
            type: Syntax$103.NewExpression,
            callee: parseLeftHandSideExpression$170(),
            'arguments': []
        };
        if (match$150('(')) {
            expr$354['arguments'] = parseArguments$161();
        }
        return expr$354;
    }
    // sort of broken, only accepts literals
    // pretty sure the use of toString will bite me
    function toArrayNode$167(arr$355) {
        var els$356 = arr$355.map(function (el$357) {
                return {
                    type: 'Literal',
                    value: el$357,
                    raw: el$357.toString()
                };
            });
        return {
            type: 'ArrayExpression',
            elements: els$356
        };
    }
    function toObjectNode$168(obj$358) {
        // todo: hacky, fixup
        var props$359 = Object.keys(obj$358).map(function (key$360) {
                var raw$361 = obj$358[key$360];
                var value$362;
                if (Array.isArray(raw$361)) {
                    value$362 = toArrayNode$167(raw$361);
                } else {
                    value$362 = {
                        type: 'Literal',
                        value: obj$358[key$360],
                        raw: obj$358[key$360].toString()
                    };
                }
                return {
                    type: 'Property',
                    key: {
                        type: 'Identifier',
                        name: key$360
                    },
                    value: value$362,
                    kind: 'init'
                };
            });
        return {
            type: 'ObjectExpression',
            properties: props$359
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
    function parseLeftHandSideExpressionAllowCall$169() {
        var useNew$363, expr$364;
        useNew$363 = matchKeyword$151('new');
        expr$364 = useNew$363 ? parseNewExpression$166() : parsePrimaryExpression$160();
        // handle "syntax" primitive
        // todo: error handling
        // if(expr.name === "syntax") {
        //     return parseSyntaxObject();
        // }
        while (index$109 < length$112) {
            if (match$150('.')) {
                lex$142();
                expr$364 = parseNonComputedMember$163(expr$364);
            } else if (match$150('[')) {
                expr$364 = parseComputedMember$164(expr$364);
            } else if (match$150('(')) {
                expr$364 = parseCallMember$165(expr$364);
            } else {
                break;
            }
        }
        return expr$364;
    }
    function parseLeftHandSideExpression$170() {
        var useNew$365, expr$366;
        useNew$365 = matchKeyword$151('new');
        expr$366 = useNew$365 ? parseNewExpression$166() : parsePrimaryExpression$160();
        while (index$109 < length$112) {
            if (match$150('.')) {
                lex$142();
                expr$366 = parseNonComputedMember$163(expr$366);
            } else if (match$150('[')) {
                expr$366 = parseComputedMember$164(expr$366);
            } else {
                break;
            }
        }
        return expr$366;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$171() {
        var expr$367 = parseLeftHandSideExpressionAllowCall$169();
        if ((match$150('++') || match$150('--')) && !peekLineTerminator$144()) {
            // 11.3.1, 11.3.2
            if (strict$108 && expr$367.type === Syntax$103.Identifier && isRestrictedWord$129(expr$367.name)) {
                throwError$145({}, Messages$105.StrictLHSPostfix);
            }
            if (!isLeftHandSide$154(expr$367)) {
                throwError$145({}, Messages$105.InvalidLHSInAssignment);
            }
            expr$367 = {
                type: Syntax$103.UpdateExpression,
                operator: lex$142().token.value,
                argument: expr$367,
                prefix: false
            };
        }
        return expr$367;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$172() {
        var token$368, expr$369;
        if (match$150('++') || match$150('--')) {
            token$368 = lex$142().token;
            expr$369 = parseUnaryExpression$172();
            // 11.4.4, 11.4.5
            if (strict$108 && expr$369.type === Syntax$103.Identifier && isRestrictedWord$129(expr$369.name)) {
                throwError$145({}, Messages$105.StrictLHSPrefix);
            }
            if (!isLeftHandSide$154(expr$369)) {
                throwError$145({}, Messages$105.InvalidLHSInAssignment);
            }
            expr$369 = {
                type: Syntax$103.UpdateExpression,
                operator: token$368.value,
                argument: expr$369,
                prefix: true
            };
            return expr$369;
        }
        if (match$150('+') || match$150('-') || match$150('~') || match$150('!')) {
            expr$369 = {
                type: Syntax$103.UnaryExpression,
                operator: lex$142().token.value,
                argument: parseUnaryExpression$172()
            };
            return expr$369;
        }
        if (matchKeyword$151('delete') || matchKeyword$151('void') || matchKeyword$151('typeof')) {
            expr$369 = {
                type: Syntax$103.UnaryExpression,
                operator: lex$142().token.value,
                argument: parseUnaryExpression$172()
            };
            if (strict$108 && expr$369.operator === 'delete' && expr$369.argument.type === Syntax$103.Identifier) {
                throwErrorTolerant$146({}, Messages$105.StrictDelete);
            }
            return expr$369;
        }
        return parsePostfixExpression$171();
    }
    // 11.5 Multiplicative Operators
    function parseMultiplicativeExpression$173() {
        var expr$370 = parseUnaryExpression$172();
        while (match$150('*') || match$150('/') || match$150('%')) {
            expr$370 = {
                type: Syntax$103.BinaryExpression,
                operator: lex$142().token.value,
                left: expr$370,
                right: parseUnaryExpression$172()
            };
        }
        return expr$370;
    }
    // 11.6 Additive Operators
    function parseAdditiveExpression$174() {
        var expr$371 = parseMultiplicativeExpression$173();
        while (match$150('+') || match$150('-')) {
            expr$371 = {
                type: Syntax$103.BinaryExpression,
                operator: lex$142().token.value,
                left: expr$371,
                right: parseMultiplicativeExpression$173()
            };
        }
        return expr$371;
    }
    // 11.7 Bitwise Shift Operators
    function parseShiftExpression$175() {
        var expr$372 = parseAdditiveExpression$174();
        while (match$150('<<') || match$150('>>') || match$150('>>>')) {
            expr$372 = {
                type: Syntax$103.BinaryExpression,
                operator: lex$142().token.value,
                left: expr$372,
                right: parseAdditiveExpression$174()
            };
        }
        return expr$372;
    }
    // 11.8 Relational Operators
    function parseRelationalExpression$176() {
        var expr$373, previousAllowIn$374;
        previousAllowIn$374 = state$114.allowIn;
        state$114.allowIn = true;
        expr$373 = parseShiftExpression$175();
        while (match$150('<') || match$150('>') || match$150('<=') || match$150('>=') || previousAllowIn$374 && matchKeyword$151('in') || matchKeyword$151('instanceof')) {
            expr$373 = {
                type: Syntax$103.BinaryExpression,
                operator: lex$142().token.value,
                left: expr$373,
                right: parseRelationalExpression$176()
            };
        }
        state$114.allowIn = previousAllowIn$374;
        return expr$373;
    }
    // 11.9 Equality Operators
    function parseEqualityExpression$177() {
        var expr$375 = parseRelationalExpression$176();
        while (match$150('==') || match$150('!=') || match$150('===') || match$150('!==')) {
            expr$375 = {
                type: Syntax$103.BinaryExpression,
                operator: lex$142().token.value,
                left: expr$375,
                right: parseRelationalExpression$176()
            };
        }
        return expr$375;
    }
    // 11.10 Binary Bitwise Operators
    function parseBitwiseANDExpression$178() {
        var expr$376 = parseEqualityExpression$177();
        while (match$150('&')) {
            lex$142();
            expr$376 = {
                type: Syntax$103.BinaryExpression,
                operator: '&',
                left: expr$376,
                right: parseEqualityExpression$177()
            };
        }
        return expr$376;
    }
    function parseBitwiseXORExpression$179() {
        var expr$377 = parseBitwiseANDExpression$178();
        while (match$150('^')) {
            lex$142();
            expr$377 = {
                type: Syntax$103.BinaryExpression,
                operator: '^',
                left: expr$377,
                right: parseBitwiseANDExpression$178()
            };
        }
        return expr$377;
    }
    function parseBitwiseORExpression$180() {
        var expr$378 = parseBitwiseXORExpression$179();
        while (match$150('|')) {
            lex$142();
            expr$378 = {
                type: Syntax$103.BinaryExpression,
                operator: '|',
                left: expr$378,
                right: parseBitwiseXORExpression$179()
            };
        }
        return expr$378;
    }
    // 11.11 Binary Logical Operators
    function parseLogicalANDExpression$181() {
        var expr$379 = parseBitwiseORExpression$180();
        while (match$150('&&')) {
            lex$142();
            expr$379 = {
                type: Syntax$103.LogicalExpression,
                operator: '&&',
                left: expr$379,
                right: parseBitwiseORExpression$180()
            };
        }
        return expr$379;
    }
    function parseLogicalORExpression$182() {
        var expr$380 = parseLogicalANDExpression$181();
        while (match$150('||')) {
            lex$142();
            expr$380 = {
                type: Syntax$103.LogicalExpression,
                operator: '||',
                left: expr$380,
                right: parseLogicalANDExpression$181()
            };
        }
        return expr$380;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$183() {
        var expr$381, previousAllowIn$382, consequent$383;
        expr$381 = parseLogicalORExpression$182();
        if (match$150('?')) {
            lex$142();
            previousAllowIn$382 = state$114.allowIn;
            state$114.allowIn = true;
            consequent$383 = parseAssignmentExpression$184();
            state$114.allowIn = previousAllowIn$382;
            expect$148(':');
            expr$381 = {
                type: Syntax$103.ConditionalExpression,
                test: expr$381,
                consequent: consequent$383,
                alternate: parseAssignmentExpression$184()
            };
        }
        return expr$381;
    }
    // 11.13 Assignment Operators
    function parseAssignmentExpression$184() {
        var expr$384;
        expr$384 = parseConditionalExpression$183();
        if (matchAssign$152()) {
            // LeftHandSideExpression
            if (!isLeftHandSide$154(expr$384)) {
                throwError$145({}, Messages$105.InvalidLHSInAssignment);
            }
            // 11.13.1
            if (strict$108 && expr$384.type === Syntax$103.Identifier && isRestrictedWord$129(expr$384.name)) {
                throwError$145({}, Messages$105.StrictLHSAssignment);
            }
            expr$384 = {
                type: Syntax$103.AssignmentExpression,
                operator: lex$142().token.value,
                left: expr$384,
                right: parseAssignmentExpression$184()
            };
        }
        return expr$384;
    }
    // 11.14 Comma Operator
    function parseExpression$185() {
        var expr$385 = parseAssignmentExpression$184();
        if (match$150(',')) {
            expr$385 = {
                type: Syntax$103.SequenceExpression,
                expressions: [expr$385]
            };
            while (index$109 < length$112) {
                if (!match$150(',')) {
                    break;
                }
                lex$142();
                expr$385.expressions.push(parseAssignmentExpression$184());
            }
        }
        return expr$385;
    }
    // 12.1 Block
    function parseStatementList$186() {
        var list$386 = [], statement$387;
        while (index$109 < length$112) {
            if (match$150('}')) {
                break;
            }
            statement$387 = parseSourceElement$214();
            if (typeof statement$387 === 'undefined') {
                break;
            }
            list$386.push(statement$387);
        }
        return list$386;
    }
    function parseBlock$187() {
        var block$388;
        expect$148('{');
        block$388 = parseStatementList$186();
        expect$148('}');
        return {
            type: Syntax$103.BlockStatement,
            body: block$388
        };
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$188() {
        var stx$389 = lex$142(), token$390 = stx$389.token;
        if (token$390.type !== Token$101.Identifier) {
            throwUnexpected$147(token$390);
        }
        var name$391 = expander$100.resolve(stx$389);
        return {
            type: Syntax$103.Identifier,
            name: name$391
        };
    }
    function parseVariableDeclaration$189(kind$392) {
        var id$393 = parseVariableIdentifier$188(), init$394 = null;
        // 12.2.1
        if (strict$108 && isRestrictedWord$129(id$393.name)) {
            throwErrorTolerant$146({}, Messages$105.StrictVarName);
        }
        if (kind$392 === 'const') {
            expect$148('=');
            init$394 = parseAssignmentExpression$184();
        } else if (match$150('=')) {
            lex$142();
            init$394 = parseAssignmentExpression$184();
        }
        return {
            type: Syntax$103.VariableDeclarator,
            id: id$393,
            init: init$394
        };
    }
    function parseVariableDeclarationList$190(kind$395) {
        var list$396 = [];
        while (index$109 < length$112) {
            list$396.push(parseVariableDeclaration$189(kind$395));
            if (!match$150(',')) {
                break;
            }
            lex$142();
        }
        return list$396;
    }
    function parseVariableStatement$191() {
        var declarations$397;
        expectKeyword$149('var');
        declarations$397 = parseVariableDeclarationList$190();
        consumeSemicolon$153();
        return {
            type: Syntax$103.VariableDeclaration,
            declarations: declarations$397,
            kind: 'var'
        };
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$192(kind$398) {
        var declarations$399;
        expectKeyword$149(kind$398);
        declarations$399 = parseVariableDeclarationList$190(kind$398);
        consumeSemicolon$153();
        return {
            type: Syntax$103.VariableDeclaration,
            declarations: declarations$399,
            kind: kind$398
        };
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$193() {
        expect$148(';');
        return { type: Syntax$103.EmptyStatement };
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$194() {
        var expr$400 = parseExpression$185();
        consumeSemicolon$153();
        return {
            type: Syntax$103.ExpressionStatement,
            expression: expr$400
        };
    }
    // 12.5 If statement
    function parseIfStatement$195() {
        var test$401, consequent$402, alternate$403;
        expectKeyword$149('if');
        expect$148('(');
        test$401 = parseExpression$185();
        expect$148(')');
        consequent$402 = parseStatement$210();
        if (matchKeyword$151('else')) {
            lex$142();
            alternate$403 = parseStatement$210();
        } else {
            alternate$403 = null;
        }
        return {
            type: Syntax$103.IfStatement,
            test: test$401,
            consequent: consequent$402,
            alternate: alternate$403
        };
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$196() {
        var body$404, test$405, oldInIteration$406;
        expectKeyword$149('do');
        oldInIteration$406 = state$114.inIteration;
        state$114.inIteration = true;
        body$404 = parseStatement$210();
        state$114.inIteration = oldInIteration$406;
        expectKeyword$149('while');
        expect$148('(');
        test$405 = parseExpression$185();
        expect$148(')');
        if (match$150(';')) {
            lex$142();
        }
        return {
            type: Syntax$103.DoWhileStatement,
            body: body$404,
            test: test$405
        };
    }
    function parseWhileStatement$197() {
        var test$407, body$408, oldInIteration$409;
        expectKeyword$149('while');
        expect$148('(');
        test$407 = parseExpression$185();
        expect$148(')');
        oldInIteration$409 = state$114.inIteration;
        state$114.inIteration = true;
        body$408 = parseStatement$210();
        state$114.inIteration = oldInIteration$409;
        return {
            type: Syntax$103.WhileStatement,
            test: test$407,
            body: body$408
        };
    }
    function parseForVariableDeclaration$198() {
        var token$410 = lex$142().token;
        return {
            type: Syntax$103.VariableDeclaration,
            declarations: parseVariableDeclarationList$190(),
            kind: token$410.value
        };
    }
    function parseForStatement$199() {
        var init$411, test$412, update$413, left$414, right$415, body$416, oldInIteration$417;
        init$411 = test$412 = update$413 = null;
        expectKeyword$149('for');
        expect$148('(');
        if (match$150(';')) {
            lex$142();
        } else {
            if (matchKeyword$151('var') || matchKeyword$151('let')) {
                state$114.allowIn = false;
                init$411 = parseForVariableDeclaration$198();
                state$114.allowIn = true;
                if (init$411.declarations.length === 1 && matchKeyword$151('in')) {
                    lex$142();
                    left$414 = init$411;
                    right$415 = parseExpression$185();
                    init$411 = null;
                }
            } else {
                state$114.allowIn = false;
                init$411 = parseExpression$185();
                state$114.allowIn = true;
                if (matchKeyword$151('in')) {
                    // LeftHandSideExpression
                    if (!isLeftHandSide$154(init$411)) {
                        throwError$145({}, Messages$105.InvalidLHSInForIn);
                    }
                    lex$142();
                    left$414 = init$411;
                    right$415 = parseExpression$185();
                    init$411 = null;
                }
            }
            if (typeof left$414 === 'undefined') {
                expect$148(';');
            }
        }
        if (typeof left$414 === 'undefined') {
            if (!match$150(';')) {
                test$412 = parseExpression$185();
            }
            expect$148(';');
            if (!match$150(')')) {
                update$413 = parseExpression$185();
            }
        }
        expect$148(')');
        oldInIteration$417 = state$114.inIteration;
        state$114.inIteration = true;
        body$416 = parseStatement$210();
        state$114.inIteration = oldInIteration$417;
        if (typeof left$414 === 'undefined') {
            return {
                type: Syntax$103.ForStatement,
                init: init$411,
                test: test$412,
                update: update$413,
                body: body$416
            };
        }
        return {
            type: Syntax$103.ForInStatement,
            left: left$414,
            right: right$415,
            body: body$416,
            each: false
        };
    }
    // 12.7 The continue statement
    function parseContinueStatement$200() {
        var token$418, label$419 = null;
        expectKeyword$149('continue');
        // Optimize the most common form: 'continue;'.
        if (tokenStream$115[index$109].token.value === ';') {
            lex$142();
            if (!state$114.inIteration) {
                throwError$145({}, Messages$105.IllegalContinue);
            }
            return {
                type: Syntax$103.ContinueStatement,
                label: null
            };
        }
        if (peekLineTerminator$144()) {
            if (!state$114.inIteration) {
                throwError$145({}, Messages$105.IllegalContinue);
            }
            return {
                type: Syntax$103.ContinueStatement,
                label: null
            };
        }
        token$418 = lookahead$143().token;
        if (token$418.type === Token$101.Identifier) {
            label$419 = parseVariableIdentifier$188();
            if (!Object.prototype.hasOwnProperty.call(state$114.labelSet, label$419.name)) {
                throwError$145({}, Messages$105.UnknownLabel, label$419.name);
            }
        }
        consumeSemicolon$153();
        if (label$419 === null && !state$114.inIteration) {
            throwError$145({}, Messages$105.IllegalContinue);
        }
        return {
            type: Syntax$103.ContinueStatement,
            label: label$419
        };
    }
    // 12.8 The break statement
    function parseBreakStatement$201() {
        var token$420, label$421 = null;
        expectKeyword$149('break');
        if (peekLineTerminator$144()) {
            if (!(state$114.inIteration || state$114.inSwitch)) {
                throwError$145({}, Messages$105.IllegalBreak);
            }
            return {
                type: Syntax$103.BreakStatement,
                label: null
            };
        }
        token$420 = lookahead$143().token;
        if (token$420.type === Token$101.Identifier) {
            label$421 = parseVariableIdentifier$188();
            if (!Object.prototype.hasOwnProperty.call(state$114.labelSet, label$421.name)) {
                throwError$145({}, Messages$105.UnknownLabel, label$421.name);
            }
        }
        consumeSemicolon$153();
        if (label$421 === null && !(state$114.inIteration || state$114.inSwitch)) {
            throwError$145({}, Messages$105.IllegalBreak);
        }
        return {
            type: Syntax$103.BreakStatement,
            label: label$421
        };
    }
    // 12.9 The return statement
    function parseReturnStatement$202() {
        var token$422, argument$423 = null;
        expectKeyword$149('return');
        if (!state$114.inFunctionBody) {
            throwErrorTolerant$146({}, Messages$105.IllegalReturn);
        }
        if (peekLineTerminator$144()) {
            return {
                type: Syntax$103.ReturnStatement,
                argument: null
            };
        }
        if (!match$150(';')) {
            token$422 = lookahead$143().token;
            if (!match$150('}') && token$422.type !== Token$101.EOF) {
                argument$423 = parseExpression$185();
            }
        }
        consumeSemicolon$153();
        return {
            type: Syntax$103.ReturnStatement,
            argument: argument$423
        };
    }
    // 12.10 The with statement
    function parseWithStatement$203() {
        var object$424, body$425;
        if (strict$108) {
            throwErrorTolerant$146({}, Messages$105.StrictModeWith);
        }
        expectKeyword$149('with');
        expect$148('(');
        object$424 = parseExpression$185();
        expect$148(')');
        body$425 = parseStatement$210();
        return {
            type: Syntax$103.WithStatement,
            object: object$424,
            body: body$425
        };
    }
    // 12.10 The swith statement
    function parseSwitchCase$204() {
        var test$426, consequent$427 = [], statement$428;
        if (matchKeyword$151('default')) {
            lex$142();
            test$426 = null;
        } else {
            expectKeyword$149('case');
            test$426 = parseExpression$185();
        }
        expect$148(':');
        while (index$109 < length$112) {
            if (match$150('}') || matchKeyword$151('default') || matchKeyword$151('case')) {
                break;
            }
            statement$428 = parseStatement$210();
            if (typeof statement$428 === 'undefined') {
                break;
            }
            consequent$427.push(statement$428);
        }
        return {
            type: Syntax$103.SwitchCase,
            test: test$426,
            consequent: consequent$427
        };
    }
    function parseSwitchStatement$205() {
        var discriminant$429, cases$430, oldInSwitch$431;
        expectKeyword$149('switch');
        expect$148('(');
        discriminant$429 = parseExpression$185();
        expect$148(')');
        expect$148('{');
        if (match$150('}')) {
            lex$142();
            return {
                type: Syntax$103.SwitchStatement,
                discriminant: discriminant$429
            };
        }
        cases$430 = [];
        oldInSwitch$431 = state$114.inSwitch;
        state$114.inSwitch = true;
        while (index$109 < length$112) {
            if (match$150('}')) {
                break;
            }
            cases$430.push(parseSwitchCase$204());
        }
        state$114.inSwitch = oldInSwitch$431;
        expect$148('}');
        return {
            type: Syntax$103.SwitchStatement,
            discriminant: discriminant$429,
            cases: cases$430
        };
    }
    // 12.13 The throw statement
    function parseThrowStatement$206() {
        var argument$432;
        expectKeyword$149('throw');
        if (peekLineTerminator$144()) {
            throwError$145({}, Messages$105.NewlineAfterThrow);
        }
        argument$432 = parseExpression$185();
        consumeSemicolon$153();
        return {
            type: Syntax$103.ThrowStatement,
            argument: argument$432
        };
    }
    // 12.14 The try statement
    function parseCatchClause$207() {
        var param$433;
        expectKeyword$149('catch');
        expect$148('(');
        if (!match$150(')')) {
            param$433 = parseExpression$185();
            // 12.14.1
            if (strict$108 && param$433.type === Syntax$103.Identifier && isRestrictedWord$129(param$433.name)) {
                throwErrorTolerant$146({}, Messages$105.StrictCatchVariable);
            }
        }
        expect$148(')');
        return {
            type: Syntax$103.CatchClause,
            param: param$433,
            guard: null,
            body: parseBlock$187()
        };
    }
    function parseTryStatement$208() {
        var block$434, handlers$435 = [], finalizer$436 = null;
        expectKeyword$149('try');
        block$434 = parseBlock$187();
        if (matchKeyword$151('catch')) {
            handlers$435.push(parseCatchClause$207());
        }
        if (matchKeyword$151('finally')) {
            lex$142();
            finalizer$436 = parseBlock$187();
        }
        if (handlers$435.length === 0 && !finalizer$436) {
            throwError$145({}, Messages$105.NoCatchOrFinally);
        }
        return {
            type: Syntax$103.TryStatement,
            block: block$434,
            handlers: handlers$435,
            finalizer: finalizer$436
        };
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$209() {
        expectKeyword$149('debugger');
        consumeSemicolon$153();
        return { type: Syntax$103.DebuggerStatement };
    }
    // 12 Statements
    function parseStatement$210() {
        var token$437 = lookahead$143().token, expr$438, labeledBody$439;
        if (token$437.type === Token$101.EOF) {
            throwUnexpected$147(token$437);
        }
        if (token$437.type === Token$101.Punctuator) {
            switch (token$437.value) {
            case ';':
                return parseEmptyStatement$193();
            case '{':
                return parseBlock$187();
            case '(':
                return parseExpressionStatement$194();
            default:
                break;
            }
        }
        if (token$437.type === Token$101.Keyword) {
            switch (token$437.value) {
            case 'break':
                return parseBreakStatement$201();
            case 'continue':
                return parseContinueStatement$200();
            case 'debugger':
                return parseDebuggerStatement$209();
            case 'do':
                return parseDoWhileStatement$196();
            case 'for':
                return parseForStatement$199();
            case 'function':
                return parseFunctionDeclaration$212();
            case 'if':
                return parseIfStatement$195();
            case 'return':
                return parseReturnStatement$202();
            case 'switch':
                return parseSwitchStatement$205();
            case 'throw':
                return parseThrowStatement$206();
            case 'try':
                return parseTryStatement$208();
            case 'var':
                return parseVariableStatement$191();
            case 'while':
                return parseWhileStatement$197();
            case 'with':
                return parseWithStatement$203();
            default:
                break;
            }
        }
        expr$438 = parseExpression$185();
        // 12.12 Labelled Statements
        if (expr$438.type === Syntax$103.Identifier && match$150(':')) {
            lex$142();
            if (Object.prototype.hasOwnProperty.call(state$114.labelSet, expr$438.name)) {
                throwError$145({}, Messages$105.Redeclaration, 'Label', expr$438.name);
            }
            state$114.labelSet[expr$438.name] = true;
            labeledBody$439 = parseStatement$210();
            delete state$114.labelSet[expr$438.name];
            return {
                type: Syntax$103.LabeledStatement,
                label: expr$438,
                body: labeledBody$439
            };
        }
        consumeSemicolon$153();
        return {
            type: Syntax$103.ExpressionStatement,
            expression: expr$438
        };
    }
    // 13 Function Definition
    function parseFunctionSourceElements$211() {
        var sourceElement$440, sourceElements$441 = [], token$442, directive$443, firstRestricted$444, oldLabelSet$445, oldInIteration$446, oldInSwitch$447, oldInFunctionBody$448;
        expect$148('{');
        while (index$109 < length$112) {
            token$442 = lookahead$143().token;
            if (token$442.type !== Token$101.StringLiteral) {
                break;
            }
            sourceElement$440 = parseSourceElement$214();
            sourceElements$441.push(sourceElement$440);
            if (sourceElement$440.expression.type !== Syntax$103.Literal) {
                // this is not directive
                break;
            }
            directive$443 = sliceSource$119(token$442.range[0] + 1, token$442.range[1] - 1);
            if (directive$443 === 'use strict') {
                strict$108 = true;
                if (firstRestricted$444) {
                    throwError$145(firstRestricted$444, Messages$105.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$444 && token$442.octal) {
                    firstRestricted$444 = token$442;
                }
            }
        }
        oldLabelSet$445 = state$114.labelSet;
        oldInIteration$446 = state$114.inIteration;
        oldInSwitch$447 = state$114.inSwitch;
        oldInFunctionBody$448 = state$114.inFunctionBody;
        state$114.labelSet = {};
        state$114.inIteration = false;
        state$114.inSwitch = false;
        state$114.inFunctionBody = true;
        while (index$109 < length$112) {
            if (match$150('}')) {
                break;
            }
            sourceElement$440 = parseSourceElement$214();
            if (typeof sourceElement$440 === 'undefined') {
                break;
            }
            sourceElements$441.push(sourceElement$440);
        }
        expect$148('}');
        state$114.labelSet = oldLabelSet$445;
        state$114.inIteration = oldInIteration$446;
        state$114.inSwitch = oldInSwitch$447;
        state$114.inFunctionBody = oldInFunctionBody$448;
        return {
            type: Syntax$103.BlockStatement,
            body: sourceElements$441
        };
    }
    function parseFunctionDeclaration$212() {
        var id$449, param$450, params$451 = [], body$452, token$453, firstRestricted$454, message$455, previousStrict$456, paramSet$457;
        expectKeyword$149('function');
        token$453 = lookahead$143().token;
        id$449 = parseVariableIdentifier$188();
        if (strict$108) {
            if (isRestrictedWord$129(token$453.value)) {
                throwError$145(token$453, Messages$105.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$129(token$453.value)) {
                firstRestricted$454 = token$453;
                message$455 = Messages$105.StrictFunctionName;
            } else if (isStrictModeReservedWord$128(token$453.value)) {
                firstRestricted$454 = token$453;
                message$455 = Messages$105.StrictReservedWord;
            }
        }
        expect$148('(');
        if (!match$150(')')) {
            paramSet$457 = {};
            while (index$109 < length$112) {
                token$453 = lookahead$143().token;
                param$450 = parseVariableIdentifier$188();
                if (strict$108) {
                    if (isRestrictedWord$129(token$453.value)) {
                        throwError$145(token$453, Messages$105.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$457, token$453.value)) {
                        throwError$145(token$453, Messages$105.StrictParamDupe);
                    }
                } else if (!firstRestricted$454) {
                    if (isRestrictedWord$129(token$453.value)) {
                        firstRestricted$454 = token$453;
                        message$455 = Messages$105.StrictParamName;
                    } else if (isStrictModeReservedWord$128(token$453.value)) {
                        firstRestricted$454 = token$453;
                        message$455 = Messages$105.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$457, token$453.value)) {
                        firstRestricted$454 = token$453;
                        message$455 = Messages$105.StrictParamDupe;
                    }
                }
                params$451.push(param$450);
                paramSet$457[param$450.name] = true;
                if (match$150(')')) {
                    break;
                }
                expect$148(',');
            }
        }
        expect$148(')');
        previousStrict$456 = strict$108;
        body$452 = parseFunctionSourceElements$211();
        if (strict$108 && firstRestricted$454) {
            throwError$145(firstRestricted$454, message$455);
        }
        strict$108 = previousStrict$456;
        return {
            type: Syntax$103.FunctionDeclaration,
            id: id$449,
            params: params$451,
            body: body$452
        };
    }
    function parseFunctionExpression$213() {
        var token$458, id$459 = null, firstRestricted$460, message$461, param$462, params$463 = [], body$464, previousStrict$465, paramSet$466;
        expectKeyword$149('function');
        if (!match$150('(')) {
            token$458 = lookahead$143().token;
            id$459 = parseVariableIdentifier$188();
            if (strict$108) {
                if (isRestrictedWord$129(token$458.value)) {
                    throwError$145(token$458, Messages$105.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$129(token$458.value)) {
                    firstRestricted$460 = token$458;
                    message$461 = Messages$105.StrictFunctionName;
                } else if (isStrictModeReservedWord$128(token$458.value)) {
                    firstRestricted$460 = token$458;
                    message$461 = Messages$105.StrictReservedWord;
                }
            }
        }
        expect$148('(');
        if (!match$150(')')) {
            paramSet$466 = {};
            while (index$109 < length$112) {
                token$458 = lookahead$143().token;
                param$462 = parseVariableIdentifier$188();
                if (strict$108) {
                    if (isRestrictedWord$129(token$458.value)) {
                        throwError$145(token$458, Messages$105.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$466, token$458.value)) {
                        throwError$145(token$458, Messages$105.StrictParamDupe);
                    }
                } else if (!firstRestricted$460) {
                    if (isRestrictedWord$129(token$458.value)) {
                        firstRestricted$460 = token$458;
                        message$461 = Messages$105.StrictParamName;
                    } else if (isStrictModeReservedWord$128(token$458.value)) {
                        firstRestricted$460 = token$458;
                        message$461 = Messages$105.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$466, token$458.value)) {
                        firstRestricted$460 = token$458;
                        message$461 = Messages$105.StrictParamDupe;
                    }
                }
                params$463.push(param$462);
                paramSet$466[param$462.name] = true;
                if (match$150(')')) {
                    break;
                }
                expect$148(',');
            }
        }
        expect$148(')');
        previousStrict$465 = strict$108;
        body$464 = parseFunctionSourceElements$211();
        if (strict$108 && firstRestricted$460) {
            throwError$145(firstRestricted$460, message$461);
        }
        strict$108 = previousStrict$465;
        return {
            type: Syntax$103.FunctionExpression,
            id: id$459,
            params: params$463,
            body: body$464
        };
    }
    // 14 Program
    function parseSourceElement$214() {
        var token$467 = lookahead$143().token;
        if (token$467.type === Token$101.Keyword) {
            switch (token$467.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$192(token$467.value);
            case 'function':
                return parseFunctionDeclaration$212();
            default:
                return parseStatement$210();
            }
        }
        if (token$467.type !== Token$101.EOF) {
            return parseStatement$210();
        }
    }
    function parseSourceElements$215() {
        var sourceElement$468, sourceElements$469 = [], token$470, directive$471, firstRestricted$472;
        while (index$109 < length$112) {
            token$470 = lookahead$143();
            if (token$470.type !== Token$101.StringLiteral) {
                break;
            }
            sourceElement$468 = parseSourceElement$214();
            sourceElements$469.push(sourceElement$468);
            if (sourceElement$468.expression.type !== Syntax$103.Literal) {
                // this is not directive
                break;
            }
            directive$471 = sliceSource$119(token$470.range[0] + 1, token$470.range[1] - 1);
            if (directive$471 === 'use strict') {
                strict$108 = true;
                if (firstRestricted$472) {
                    throwError$145(firstRestricted$472, Messages$105.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$472 && token$470.octal) {
                    firstRestricted$472 = token$470;
                }
            }
        }
        while (index$109 < length$112) {
            sourceElement$468 = parseSourceElement$214();
            if (typeof sourceElement$468 === 'undefined') {
                break;
            }
            sourceElements$469.push(sourceElement$468);
        }
        return sourceElements$469;
    }
    function parseProgram$216() {
        var program$473;
        strict$108 = false;
        program$473 = {
            type: Syntax$103.Program,
            body: parseSourceElements$215()
        };
        return program$473;
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$217(start$474, end$475, type$476, value$477) {
        assert$117(typeof start$474 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$116.comments.length > 0) {
            if (extra$116.comments[extra$116.comments.length - 1].range[1] > start$474) {
                return;
            }
        }
        extra$116.comments.push({
            range: [
                start$474,
                end$475
            ],
            type: type$476,
            value: value$477
        });
    }
    function scanComment$218() {
        var comment$478, ch$479, start$480, blockComment$481, lineComment$482;
        comment$478 = '';
        blockComment$481 = false;
        lineComment$482 = false;
        while (index$109 < length$112) {
            ch$479 = source$107[index$109];
            if (lineComment$482) {
                ch$479 = nextChar$131();
                if (index$109 >= length$112) {
                    lineComment$482 = false;
                    comment$478 += ch$479;
                    addComment$217(start$480, index$109, 'Line', comment$478);
                } else if (isLineTerminator$124(ch$479)) {
                    lineComment$482 = false;
                    addComment$217(start$480, index$109, 'Line', comment$478);
                    if (ch$479 === '\r' && source$107[index$109] === '\n') {
                        ++index$109;
                    }
                    ++lineNumber$110;
                    lineStart$111 = index$109;
                    comment$478 = '';
                } else {
                    comment$478 += ch$479;
                }
            } else if (blockComment$481) {
                if (isLineTerminator$124(ch$479)) {
                    if (ch$479 === '\r' && source$107[index$109 + 1] === '\n') {
                        ++index$109;
                        comment$478 += '\r\n';
                    } else {
                        comment$478 += ch$479;
                    }
                    ++lineNumber$110;
                    ++index$109;
                    lineStart$111 = index$109;
                    if (index$109 >= length$112) {
                        throwError$145({}, Messages$105.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$479 = nextChar$131();
                    if (index$109 >= length$112) {
                        throwError$145({}, Messages$105.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$478 += ch$479;
                    if (ch$479 === '*') {
                        ch$479 = source$107[index$109];
                        if (ch$479 === '/') {
                            comment$478 = comment$478.substr(0, comment$478.length - 1);
                            blockComment$481 = false;
                            ++index$109;
                            addComment$217(start$480, index$109, 'Block', comment$478);
                            comment$478 = '';
                        }
                    }
                }
            } else if (ch$479 === '/') {
                ch$479 = source$107[index$109 + 1];
                if (ch$479 === '/') {
                    start$480 = index$109;
                    index$109 += 2;
                    lineComment$482 = true;
                } else if (ch$479 === '*') {
                    start$480 = index$109;
                    index$109 += 2;
                    blockComment$481 = true;
                    if (index$109 >= length$112) {
                        throwError$145({}, Messages$105.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$123(ch$479)) {
                ++index$109;
            } else if (isLineTerminator$124(ch$479)) {
                ++index$109;
                if (ch$479 === '\r' && source$107[index$109] === '\n') {
                    ++index$109;
                }
                ++lineNumber$110;
                lineStart$111 = index$109;
            } else {
                break;
            }
        }
    }
    function collectToken$219() {
        var token$483 = extra$116.advance(), range$484, value$485;
        if (token$483.type !== Token$101.EOF) {
            range$484 = [
                token$483.range[0],
                token$483.range[1]
            ];
            value$485 = sliceSource$119(token$483.range[0], token$483.range[1]);
            extra$116.tokens.push({
                type: TokenName$102[token$483.type],
                value: value$485,
                lineNumber: lineNumber$110,
                lineStart: lineStart$111,
                range: range$484
            });
        }
        return token$483;
    }
    function collectRegex$220() {
        var pos$486, regex$487, token$488;
        skipComment$133();
        pos$486 = index$109;
        regex$487 = extra$116.scanRegExp();
        // Pop the previous token, which is likely '/' or '/='
        if (extra$116.tokens.length > 0) {
            token$488 = extra$116.tokens[extra$116.tokens.length - 1];
            if (token$488.range[0] === pos$486 && token$488.type === 'Punctuator') {
                if (token$488.value === '/' || token$488.value === '/=') {
                    extra$116.tokens.pop();
                }
            }
        }
        extra$116.tokens.push({
            type: 'RegularExpression',
            value: regex$487.literal,
            range: [
                pos$486,
                index$109
            ],
            lineStart: token$488.lineStart,
            lineNumber: token$488.lineNumber
        });
        return regex$487;
    }
    function createLiteral$221(token$489) {
        if (Array.isArray(token$489)) {
            return {
                type: Syntax$103.Literal,
                value: token$489
            };
        }
        return {
            type: Syntax$103.Literal,
            value: token$489.value,
            lineStart: token$489.lineStart,
            lineNumber: token$489.lineNumber
        };
    }
    function createRawLiteral$222(token$490) {
        return {
            type: Syntax$103.Literal,
            value: token$490.value,
            raw: sliceSource$119(token$490.range[0], token$490.range[1]),
            lineStart: token$490.lineStart,
            lineNumber: token$490.lineNumber
        };
    }
    function wrapTrackingFunction$223(range$491, loc$492) {
        return function (parseFunction$493) {
            function isBinary$494(node$496) {
                return node$496.type === Syntax$103.LogicalExpression || node$496.type === Syntax$103.BinaryExpression;
            }
            function visit$495(node$497) {
                if (isBinary$494(node$497.left)) {
                    visit$495(node$497.left);
                }
                if (isBinary$494(node$497.right)) {
                    visit$495(node$497.right);
                }
                if (range$491 && typeof node$497.range === 'undefined') {
                    node$497.range = [
                        node$497.left.range[0],
                        node$497.right.range[1]
                    ];
                }
                if (loc$492 && typeof node$497.loc === 'undefined') {
                    node$497.loc = {
                        start: node$497.left.loc.start,
                        end: node$497.right.loc.end
                    };
                }
            }
            return function () {
                var node$498, rangeInfo$499, locInfo$500;
                // skipComment();
                var curr$501 = tokenStream$115[index$109].token;
                rangeInfo$499 = [
                    curr$501.range[0],
                    0
                ];
                locInfo$500 = {
                    start: {
                        line: curr$501.sm_lineNumber,
                        column: curr$501.sm_lineStart
                    }
                };
                node$498 = parseFunction$493.apply(null, arguments);
                if (typeof node$498 !== 'undefined') {
                    var last$502 = tokenStream$115[index$109].token;
                    if (range$491) {
                        rangeInfo$499[1] = last$502.range[1];
                        node$498.range = rangeInfo$499;
                    }
                    if (loc$492) {
                        locInfo$500.end = {
                            line: last$502.sm_lineNumber,
                            column: last$502.sm_lineStart
                        };
                        node$498.loc = locInfo$500;
                    }
                    if (isBinary$494(node$498)) {
                        visit$495(node$498);
                    }
                    if (node$498.type === Syntax$103.MemberExpression) {
                        if (typeof node$498.object.range !== 'undefined') {
                            node$498.range[0] = node$498.object.range[0];
                        }
                        if (typeof node$498.object.loc !== 'undefined') {
                            node$498.loc.start = node$498.object.loc.start;
                        }
                    }
                    if (node$498.type === Syntax$103.CallExpression) {
                        if (typeof node$498.callee.range !== 'undefined') {
                            node$498.range[0] = node$498.callee.range[0];
                        }
                        if (typeof node$498.callee.loc !== 'undefined') {
                            node$498.loc.start = node$498.callee.loc.start;
                        }
                    }
                    return node$498;
                }
            };
        };
    }
    function patch$224() {
        var wrapTracking$503;
        if (extra$116.comments) {
            extra$116.skipComment = skipComment$133;
            skipComment$133 = scanComment$218;
        }
        if (extra$116.raw) {
            extra$116.createLiteral = createLiteral$221;
            createLiteral$221 = createRawLiteral$222;
        }
        if (extra$116.range || extra$116.loc) {
            wrapTracking$503 = wrapTrackingFunction$223(extra$116.range, extra$116.loc);
            extra$116.parseAdditiveExpression = parseAdditiveExpression$174;
            extra$116.parseAssignmentExpression = parseAssignmentExpression$184;
            extra$116.parseBitwiseANDExpression = parseBitwiseANDExpression$178;
            extra$116.parseBitwiseORExpression = parseBitwiseORExpression$180;
            extra$116.parseBitwiseXORExpression = parseBitwiseXORExpression$179;
            extra$116.parseBlock = parseBlock$187;
            extra$116.parseFunctionSourceElements = parseFunctionSourceElements$211;
            extra$116.parseCallMember = parseCallMember$165;
            extra$116.parseCatchClause = parseCatchClause$207;
            extra$116.parseComputedMember = parseComputedMember$164;
            extra$116.parseConditionalExpression = parseConditionalExpression$183;
            extra$116.parseConstLetDeclaration = parseConstLetDeclaration$192;
            extra$116.parseEqualityExpression = parseEqualityExpression$177;
            extra$116.parseExpression = parseExpression$185;
            extra$116.parseForVariableDeclaration = parseForVariableDeclaration$198;
            extra$116.parseFunctionDeclaration = parseFunctionDeclaration$212;
            extra$116.parseFunctionExpression = parseFunctionExpression$213;
            extra$116.parseLogicalANDExpression = parseLogicalANDExpression$181;
            extra$116.parseLogicalORExpression = parseLogicalORExpression$182;
            extra$116.parseMultiplicativeExpression = parseMultiplicativeExpression$173;
            extra$116.parseNewExpression = parseNewExpression$166;
            extra$116.parseNonComputedMember = parseNonComputedMember$163;
            extra$116.parseNonComputedProperty = parseNonComputedProperty$162;
            extra$116.parseObjectProperty = parseObjectProperty$158;
            extra$116.parseObjectPropertyKey = parseObjectPropertyKey$157;
            extra$116.parsePostfixExpression = parsePostfixExpression$171;
            extra$116.parsePrimaryExpression = parsePrimaryExpression$160;
            extra$116.parseProgram = parseProgram$216;
            extra$116.parsePropertyFunction = parsePropertyFunction$156;
            extra$116.parseRelationalExpression = parseRelationalExpression$176;
            extra$116.parseStatement = parseStatement$210;
            extra$116.parseShiftExpression = parseShiftExpression$175;
            extra$116.parseSwitchCase = parseSwitchCase$204;
            extra$116.parseUnaryExpression = parseUnaryExpression$172;
            extra$116.parseVariableDeclaration = parseVariableDeclaration$189;
            extra$116.parseVariableIdentifier = parseVariableIdentifier$188;
            parseAdditiveExpression$174 = wrapTracking$503(extra$116.parseAdditiveExpression);
            parseAssignmentExpression$184 = wrapTracking$503(extra$116.parseAssignmentExpression);
            parseBitwiseANDExpression$178 = wrapTracking$503(extra$116.parseBitwiseANDExpression);
            parseBitwiseORExpression$180 = wrapTracking$503(extra$116.parseBitwiseORExpression);
            parseBitwiseXORExpression$179 = wrapTracking$503(extra$116.parseBitwiseXORExpression);
            parseBlock$187 = wrapTracking$503(extra$116.parseBlock);
            parseFunctionSourceElements$211 = wrapTracking$503(extra$116.parseFunctionSourceElements);
            parseCallMember$165 = wrapTracking$503(extra$116.parseCallMember);
            parseCatchClause$207 = wrapTracking$503(extra$116.parseCatchClause);
            parseComputedMember$164 = wrapTracking$503(extra$116.parseComputedMember);
            parseConditionalExpression$183 = wrapTracking$503(extra$116.parseConditionalExpression);
            parseConstLetDeclaration$192 = wrapTracking$503(extra$116.parseConstLetDeclaration);
            parseEqualityExpression$177 = wrapTracking$503(extra$116.parseEqualityExpression);
            parseExpression$185 = wrapTracking$503(extra$116.parseExpression);
            parseForVariableDeclaration$198 = wrapTracking$503(extra$116.parseForVariableDeclaration);
            parseFunctionDeclaration$212 = wrapTracking$503(extra$116.parseFunctionDeclaration);
            parseFunctionExpression$213 = wrapTracking$503(extra$116.parseFunctionExpression);
            parseLogicalANDExpression$181 = wrapTracking$503(extra$116.parseLogicalANDExpression);
            parseLogicalORExpression$182 = wrapTracking$503(extra$116.parseLogicalORExpression);
            parseMultiplicativeExpression$173 = wrapTracking$503(extra$116.parseMultiplicativeExpression);
            parseNewExpression$166 = wrapTracking$503(extra$116.parseNewExpression);
            parseNonComputedMember$163 = wrapTracking$503(extra$116.parseNonComputedMember);
            parseNonComputedProperty$162 = wrapTracking$503(extra$116.parseNonComputedProperty);
            parseObjectProperty$158 = wrapTracking$503(extra$116.parseObjectProperty);
            parseObjectPropertyKey$157 = wrapTracking$503(extra$116.parseObjectPropertyKey);
            parsePostfixExpression$171 = wrapTracking$503(extra$116.parsePostfixExpression);
            parsePrimaryExpression$160 = wrapTracking$503(extra$116.parsePrimaryExpression);
            parseProgram$216 = wrapTracking$503(extra$116.parseProgram);
            parsePropertyFunction$156 = wrapTracking$503(extra$116.parsePropertyFunction);
            parseRelationalExpression$176 = wrapTracking$503(extra$116.parseRelationalExpression);
            parseStatement$210 = wrapTracking$503(extra$116.parseStatement);
            parseShiftExpression$175 = wrapTracking$503(extra$116.parseShiftExpression);
            parseSwitchCase$204 = wrapTracking$503(extra$116.parseSwitchCase);
            parseUnaryExpression$172 = wrapTracking$503(extra$116.parseUnaryExpression);
            parseVariableDeclaration$189 = wrapTracking$503(extra$116.parseVariableDeclaration);
            parseVariableIdentifier$188 = wrapTracking$503(extra$116.parseVariableIdentifier);
        }
        if (typeof extra$116.tokens !== 'undefined') {
            extra$116.advance = advance$141;
            extra$116.scanRegExp = scanRegExp$139;
            advance$141 = collectToken$219;
            scanRegExp$139 = collectRegex$220;
        }
    }
    function unpatch$225() {
        if (typeof extra$116.skipComment === 'function') {
            skipComment$133 = extra$116.skipComment;
        }
        if (extra$116.raw) {
            createLiteral$221 = extra$116.createLiteral;
        }
        if (extra$116.range || extra$116.loc) {
            parseAdditiveExpression$174 = extra$116.parseAdditiveExpression;
            parseAssignmentExpression$184 = extra$116.parseAssignmentExpression;
            parseBitwiseANDExpression$178 = extra$116.parseBitwiseANDExpression;
            parseBitwiseORExpression$180 = extra$116.parseBitwiseORExpression;
            parseBitwiseXORExpression$179 = extra$116.parseBitwiseXORExpression;
            parseBlock$187 = extra$116.parseBlock;
            parseFunctionSourceElements$211 = extra$116.parseFunctionSourceElements;
            parseCallMember$165 = extra$116.parseCallMember;
            parseCatchClause$207 = extra$116.parseCatchClause;
            parseComputedMember$164 = extra$116.parseComputedMember;
            parseConditionalExpression$183 = extra$116.parseConditionalExpression;
            parseConstLetDeclaration$192 = extra$116.parseConstLetDeclaration;
            parseEqualityExpression$177 = extra$116.parseEqualityExpression;
            parseExpression$185 = extra$116.parseExpression;
            parseForVariableDeclaration$198 = extra$116.parseForVariableDeclaration;
            parseFunctionDeclaration$212 = extra$116.parseFunctionDeclaration;
            parseFunctionExpression$213 = extra$116.parseFunctionExpression;
            parseLogicalANDExpression$181 = extra$116.parseLogicalANDExpression;
            parseLogicalORExpression$182 = extra$116.parseLogicalORExpression;
            parseMultiplicativeExpression$173 = extra$116.parseMultiplicativeExpression;
            parseNewExpression$166 = extra$116.parseNewExpression;
            parseNonComputedMember$163 = extra$116.parseNonComputedMember;
            parseNonComputedProperty$162 = extra$116.parseNonComputedProperty;
            parseObjectProperty$158 = extra$116.parseObjectProperty;
            parseObjectPropertyKey$157 = extra$116.parseObjectPropertyKey;
            parsePrimaryExpression$160 = extra$116.parsePrimaryExpression;
            parsePostfixExpression$171 = extra$116.parsePostfixExpression;
            parseProgram$216 = extra$116.parseProgram;
            parsePropertyFunction$156 = extra$116.parsePropertyFunction;
            parseRelationalExpression$176 = extra$116.parseRelationalExpression;
            parseStatement$210 = extra$116.parseStatement;
            parseShiftExpression$175 = extra$116.parseShiftExpression;
            parseSwitchCase$204 = extra$116.parseSwitchCase;
            parseUnaryExpression$172 = extra$116.parseUnaryExpression;
            parseVariableDeclaration$189 = extra$116.parseVariableDeclaration;
            parseVariableIdentifier$188 = extra$116.parseVariableIdentifier;
        }
        if (typeof extra$116.scanRegExp === 'function') {
            advance$141 = extra$116.advance;
            scanRegExp$139 = extra$116.scanRegExp;
        }
    }
    function stringToArray$226(str$504) {
        var length$505 = str$504.length, result$506 = [], i$507;
        for (i$507 = 0; i$507 < length$505; ++i$507) {
            result$506[i$507] = str$504.charAt(i$507);
        }
        return result$506;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$227(toks$508, start$509, inExprDelim$510, parentIsBlock$511) {
        var assignOps$512 = [
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
        var binaryOps$513 = [
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
        var unaryOps$514 = [
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
        function back$515(n$516) {
            var idx$517 = toks$508.length - n$516 > 0 ? toks$508.length - n$516 : 0;
            return toks$508[idx$517];
        }
        if (inExprDelim$510 && toks$508.length - (start$509 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$515(start$509 + 2).value === ':' && parentIsBlock$511) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$118(back$515(start$509 + 2).value, unaryOps$514.concat(binaryOps$513).concat(assignOps$512))) {
            // ... + {...}
            return false;
        } else if (back$515(start$509 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$518 = typeof back$515(start$509 + 1).startLineNumber !== 'undefined' ? back$515(start$509 + 1).startLineNumber : back$515(start$509 + 1).lineNumber;
            if (back$515(start$509 + 2).lineNumber !== currLineNumber$518) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$118(back$515(start$509 + 2).value, [
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
    function readToken$228(toks$519, inExprDelim$520, parentIsBlock$521) {
        var delimiters$522 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$523 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$524 = toks$519.length - 1;
        function back$525(n$526) {
            var idx$527 = toks$519.length - n$526 > 0 ? toks$519.length - n$526 : 0;
            return toks$519[idx$527];
        }
        skipComment$133();
        if (isIn$118(getChar$132(), delimiters$522)) {
            return readDelim$229(toks$519, inExprDelim$520, parentIsBlock$521);
        }
        if (getChar$132() === '/') {
            var prev$528 = back$525(1);
            if (prev$528) {
                if (prev$528.value === '()') {
                    if (isIn$118(back$525(2).value, parenIdents$523)) {
                        // ... if (...) / ...
                        return scanRegExp$139();
                    }
                    // ... (...) / ...
                    return advance$141();
                }
                if (prev$528.value === '{}') {
                    if (blockAllowed$227(toks$519, 0, inExprDelim$520, parentIsBlock$521)) {
                        if (back$525(2).value === '()') {
                            // named function
                            if (back$525(4).value === 'function') {
                                if (!blockAllowed$227(toks$519, 3, inExprDelim$520, parentIsBlock$521)) {
                                    // new function foo (...) {...} / ...
                                    return advance$141();
                                }
                                if (toks$519.length - 5 <= 0 && inExprDelim$520) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return advance$141();
                                }
                            }
                            // unnamed function
                            if (back$525(3).value === 'function') {
                                if (!blockAllowed$227(toks$519, 2, inExprDelim$520, parentIsBlock$521)) {
                                    // new function (...) {...} / ...
                                    return advance$141();
                                }
                                if (toks$519.length - 4 <= 0 && inExprDelim$520) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return advance$141();
                                }
                            }
                        }
                        // ...; {...} /...
                        return scanRegExp$139();
                    } else {
                        // ... + {...} / ...
                        return advance$141();
                    }
                }
                if (prev$528.type === Token$101.Punctuator) {
                    // ... + /...
                    return scanRegExp$139();
                }
                if (isKeyword$130(prev$528.value)) {
                    // typeof /...
                    return scanRegExp$139();
                }
                return advance$141();
            }
            return scanRegExp$139();
        }
        return advance$141();
    }
    function readDelim$229(toks$529, inExprDelim$530, parentIsBlock$531) {
        var startDelim$532 = advance$141(), matchDelim$533 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$534 = [];
        var delimiters$535 = [
                '(',
                '{',
                '['
            ];
        assert$117(delimiters$535.indexOf(startDelim$532.value) !== -1, 'Need to begin at the delimiter');
        var token$536 = startDelim$532;
        var startLineNumber$537 = token$536.lineNumber;
        var startLineStart$538 = token$536.lineStart;
        var startRange$539 = token$536.range;
        var delimToken$540 = {};
        delimToken$540.type = Token$101.Delimiter;
        delimToken$540.value = startDelim$532.value + matchDelim$533[startDelim$532.value];
        delimToken$540.startLineNumber = startLineNumber$537;
        delimToken$540.startLineStart = startLineStart$538;
        delimToken$540.startRange = startRange$539;
        var delimIsBlock$541 = false;
        if (startDelim$532.value === '{') {
            delimIsBlock$541 = blockAllowed$227(toks$529.concat(delimToken$540), 0, inExprDelim$530, parentIsBlock$531);
        }
        while (index$109 <= length$112) {
            token$536 = readToken$228(inner$534, startDelim$532.value === '(' || startDelim$532.value === '[', delimIsBlock$541);
            if (token$536.type === Token$101.Punctuator && token$536.value === matchDelim$533[startDelim$532.value]) {
                break;
            } else if (token$536.type === Token$101.EOF) {
                throwError$145({}, Messages$105.UnexpectedEOS);
            } else {
                inner$534.push(token$536);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$109 >= length$112 && matchDelim$533[startDelim$532.value] !== source$107[length$112 - 1]) {
            throwError$145({}, Messages$105.UnexpectedEOS);
        }
        var endLineNumber$542 = token$536.lineNumber;
        var endLineStart$543 = token$536.lineStart;
        var endRange$544 = token$536.range;
        delimToken$540.inner = inner$534;
        delimToken$540.endLineNumber = endLineNumber$542;
        delimToken$540.endLineStart = endLineStart$543;
        delimToken$540.endRange = endRange$544;
        return delimToken$540;
    }
    ;
    // (Str) -> [...CSyntax]
    function read$230(code$545) {
        var token$546, tokenTree$547 = [];
        extra$116 = {};
        extra$116.comments = [];
        patch$224();
        source$107 = code$545;
        index$109 = 0;
        lineNumber$110 = source$107.length > 0 ? 1 : 0;
        lineStart$111 = 0;
        length$112 = source$107.length;
        buffer$113 = null;
        state$114 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$109 < length$112) {
            tokenTree$547.push(readToken$228(tokenTree$547, false, false));
        }
        var last$548 = tokenTree$547[tokenTree$547.length - 1];
        if (last$548 && last$548.type !== Token$101.EOF) {
            tokenTree$547.push({
                type: Token$101.EOF,
                value: '',
                lineNumber: last$548.lineNumber,
                lineStart: last$548.lineStart,
                range: [
                    index$109,
                    index$109
                ]
            });
        }
        return [
            expander$100.tokensToSyntax(tokenTree$547),
            extra$116.comments
        ];
    }
    // (SyntaxObject, Str, {}) -> SyntaxObject
    function parse$231(code$549, comments$550) {
        var program$551, toString$552;
        tokenStream$115 = code$549;
        index$109 = 0;
        length$112 = tokenStream$115.length;
        buffer$113 = null;
        state$114 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$116 = {
            range: true,
            loc: true
        };
        patch$224();
        try {
            program$551 = parseProgram$216();
            program$551.comments = comments$550;
            program$551.tokens = expander$100.syntaxToTokens(code$549);
        } catch (e$553) {
            throw e$553;
        } finally {
            unpatch$225();
            extra$116 = {};
        }
        return program$551;
    }
    exports$99.parse = parse$231;
    exports$99.read = read$230;
    exports$99.Token = Token$101;
    exports$99.assert = assert$117;
    // Deep copy.
    exports$99.Syntax = function () {
        var name$554, types$555 = {};
        if (typeof Object.create === 'function') {
            types$555 = Object.create(null);
        }
        for (name$554 in Syntax$103) {
            if (Syntax$103.hasOwnProperty(name$554)) {
                types$555[name$554] = Syntax$103[name$554];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$555);
        }
        return types$555;
    }();
}));