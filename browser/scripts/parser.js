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
(function (root$93, factory$94) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$94(exports, require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'expander'
        ], factory$94);
    }
}(this, function (exports$95, expander$96) {
    'use strict';
    var Token$97, TokenName$98, Syntax$99, PropertyKind$100, Messages$101, Regex$102, source$103, strict$104, index$105, lineNumber$106, lineStart$107, length$108, buffer$109, state$110, tokenStream$111, extra$112;
    Token$97 = {
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
    TokenName$98 = {};
    TokenName$98[Token$97.BooleanLiteral] = 'Boolean';
    TokenName$98[Token$97.EOF] = '<end>';
    TokenName$98[Token$97.Identifier] = 'Identifier';
    TokenName$98[Token$97.Keyword] = 'Keyword';
    TokenName$98[Token$97.NullLiteral] = 'Null';
    TokenName$98[Token$97.NumericLiteral] = 'Numeric';
    TokenName$98[Token$97.Punctuator] = 'Punctuator';
    TokenName$98[Token$97.StringLiteral] = 'String';
    TokenName$98[Token$97.Delimiter] = 'Delimiter';
    Syntax$99 = {
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
    PropertyKind$100 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    // Error messages should be identical to V8.
    Messages$101 = {
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
    Regex$102 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$113(condition$228, message$229) {
        if (!condition$228) {
            throw new Error('ASSERT: ' + message$229);
        }
    }
    function isIn$114(el$230, list$231) {
        return list$231.indexOf(el$230) !== -1;
    }
    function sliceSource$115(from$232, to$233) {
        return source$103.slice(from$232, to$233);
    }
    if (typeof 'esprima'[0] === 'undefined') {
        sliceSource$115 = function sliceArraySource$234(from$235, to$236) {
            return source$103.slice(from$235, to$236).join('');
        };
    }
    function isDecimalDigit$116(ch$237) {
        return '0123456789'.indexOf(ch$237) >= 0;
    }
    function isHexDigit$117(ch$238) {
        return '0123456789abcdefABCDEF'.indexOf(ch$238) >= 0;
    }
    function isOctalDigit$118(ch$239) {
        return '01234567'.indexOf(ch$239) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$119(ch$240) {
        return ch$240 === ' ' || ch$240 === '\t' || ch$240 === '\x0B' || ch$240 === '\f' || ch$240 === '\xa0' || ch$240.charCodeAt(0) >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(ch$240) >= 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$120(ch$241) {
        return ch$241 === '\n' || ch$241 === '\r' || ch$241 === '\u2028' || ch$241 === '\u2029';
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$121(ch$242) {
        return ch$242 === '$' || ch$242 === '_' || ch$242 === '\\' || ch$242 >= 'a' && ch$242 <= 'z' || ch$242 >= 'A' && ch$242 <= 'Z' || ch$242.charCodeAt(0) >= 128 && Regex$102.NonAsciiIdentifierStart.test(ch$242);
    }
    function isIdentifierPart$122(ch$243) {
        return ch$243 === '$' || ch$243 === '_' || ch$243 === '\\' || ch$243 >= 'a' && ch$243 <= 'z' || ch$243 >= 'A' && ch$243 <= 'Z' || ch$243 >= '0' && ch$243 <= '9' || ch$243.charCodeAt(0) >= 128 && Regex$102.NonAsciiIdentifierPart.test(ch$243);
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$123(id$244) {
        // we are allowing future reserved words so macros can be written for them
        return false;
    }
    function isStrictModeReservedWord$124(id$245) {
        switch (id$245) {
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
    function isRestrictedWord$125(id$246) {
        return id$246 === 'eval' || id$246 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$126(id$247) {
        var keyword$248 = false;
        switch (id$247.length) {
        case 2:
            keyword$248 = id$247 === 'if' || id$247 === 'in' || id$247 === 'do';
            break;
        case 3:
            keyword$248 = id$247 === 'var' || id$247 === 'for' || id$247 === 'new' || id$247 === 'try';
            break;
        case 4:
            keyword$248 = id$247 === 'this' || id$247 === 'else' || id$247 === 'case' || id$247 === 'void' || id$247 === 'with';
            break;
        case 5:
            keyword$248 = id$247 === 'while' || id$247 === 'break' || id$247 === 'catch' || id$247 === 'throw';
            break;
        case 6:
            keyword$248 = id$247 === 'return' || id$247 === 'typeof' || id$247 === 'delete' || id$247 === 'switch';
            break;
        case 7:
            keyword$248 = id$247 === 'default' || id$247 === 'finally';
            break;
        case 8:
            keyword$248 = id$247 === 'function' || id$247 === 'continue' || id$247 === 'debugger';
            break;
        case 10:
            keyword$248 = id$247 === 'instanceof';
            break;
        }
        if (keyword$248) {
            return true;
        }
        switch (id$247) {
        // Future reserved words.
        // 'const' is specialized as Keyword in V8.
        case 'const':
            return true;
        // For compatiblity to SpiderMonkey and ES.next
        case 'yield':
        case 'let':
            return true;
        }
        if (strict$104 && isStrictModeReservedWord$124(id$247)) {
            return true;
        }
        return isFutureReservedWord$123(id$247);
    }
    // Return the next character and move forward.
    function nextChar$127() {
        return source$103[index$105++];
    }
    function getChar$128() {
        return source$103[index$105];
    }
    // 7.4 Comments
    function skipComment$129() {
        var ch$249, blockComment$250, lineComment$251;
        blockComment$250 = false;
        lineComment$251 = false;
        while (index$105 < length$108) {
            ch$249 = source$103[index$105];
            if (lineComment$251) {
                ch$249 = nextChar$127();
                if (isLineTerminator$120(ch$249)) {
                    lineComment$251 = false;
                    if (ch$249 === '\r' && source$103[index$105] === '\n') {
                        ++index$105;
                    }
                    ++lineNumber$106;
                    lineStart$107 = index$105;
                }
            } else if (blockComment$250) {
                if (isLineTerminator$120(ch$249)) {
                    if (ch$249 === '\r' && source$103[index$105 + 1] === '\n') {
                        ++index$105;
                    }
                    ++lineNumber$106;
                    ++index$105;
                    lineStart$107 = index$105;
                    if (index$105 >= length$108) {
                        throwError$141({}, Messages$101.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$249 = nextChar$127();
                    if (index$105 >= length$108) {
                        throwError$141({}, Messages$101.UnexpectedToken, 'ILLEGAL');
                    }
                    if (ch$249 === '*') {
                        ch$249 = source$103[index$105];
                        if (ch$249 === '/') {
                            ++index$105;
                            blockComment$250 = false;
                        }
                    }
                }
            } else if (ch$249 === '/') {
                ch$249 = source$103[index$105 + 1];
                if (ch$249 === '/') {
                    index$105 += 2;
                    lineComment$251 = true;
                } else if (ch$249 === '*') {
                    index$105 += 2;
                    blockComment$250 = true;
                    if (index$105 >= length$108) {
                        throwError$141({}, Messages$101.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$119(ch$249)) {
                ++index$105;
            } else if (isLineTerminator$120(ch$249)) {
                ++index$105;
                if (ch$249 === '\r' && source$103[index$105] === '\n') {
                    ++index$105;
                }
                ++lineNumber$106;
                lineStart$107 = index$105;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$130(prefix$252) {
        var i$253, len$254, ch$255, code$256 = 0;
        len$254 = prefix$252 === 'u' ? 4 : 2;
        for (i$253 = 0; i$253 < len$254; ++i$253) {
            if (index$105 < length$108 && isHexDigit$117(source$103[index$105])) {
                ch$255 = nextChar$127();
                code$256 = code$256 * 16 + '0123456789abcdef'.indexOf(ch$255.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$256);
    }
    function scanIdentifier$131() {
        var ch$257, start$258, id$259, restore$260;
        ch$257 = source$103[index$105];
        if (!isIdentifierStart$121(ch$257)) {
            return;
        }
        start$258 = index$105;
        if (ch$257 === '\\') {
            ++index$105;
            if (source$103[index$105] !== 'u') {
                return;
            }
            ++index$105;
            restore$260 = index$105;
            ch$257 = scanHexEscape$130('u');
            if (ch$257) {
                if (ch$257 === '\\' || !isIdentifierStart$121(ch$257)) {
                    return;
                }
                id$259 = ch$257;
            } else {
                index$105 = restore$260;
                id$259 = 'u';
            }
        } else {
            id$259 = nextChar$127();
        }
        while (index$105 < length$108) {
            ch$257 = source$103[index$105];
            if (!isIdentifierPart$122(ch$257)) {
                break;
            }
            if (ch$257 === '\\') {
                ++index$105;
                if (source$103[index$105] !== 'u') {
                    return;
                }
                ++index$105;
                restore$260 = index$105;
                ch$257 = scanHexEscape$130('u');
                if (ch$257) {
                    if (ch$257 === '\\' || !isIdentifierPart$122(ch$257)) {
                        return;
                    }
                    id$259 += ch$257;
                } else {
                    index$105 = restore$260;
                    id$259 += 'u';
                }
            } else {
                id$259 += nextChar$127();
            }
        }
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$259.length === 1) {
            return {
                type: Token$97.Identifier,
                value: id$259,
                lineNumber: lineNumber$106,
                lineStart: lineStart$107,
                range: [
                    start$258,
                    index$105
                ]
            };
        }
        if (isKeyword$126(id$259)) {
            return {
                type: Token$97.Keyword,
                value: id$259,
                lineNumber: lineNumber$106,
                lineStart: lineStart$107,
                range: [
                    start$258,
                    index$105
                ]
            };
        }
        // 7.8.1 Null Literals
        if (id$259 === 'null') {
            return {
                type: Token$97.NullLiteral,
                value: id$259,
                lineNumber: lineNumber$106,
                lineStart: lineStart$107,
                range: [
                    start$258,
                    index$105
                ]
            };
        }
        // 7.8.2 Boolean Literals
        if (id$259 === 'true' || id$259 === 'false') {
            return {
                type: Token$97.BooleanLiteral,
                value: id$259,
                lineNumber: lineNumber$106,
                lineStart: lineStart$107,
                range: [
                    start$258,
                    index$105
                ]
            };
        }
        return {
            type: Token$97.Identifier,
            value: id$259,
            lineNumber: lineNumber$106,
            lineStart: lineStart$107,
            range: [
                start$258,
                index$105
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$132() {
        var start$261 = index$105, ch1$262 = source$103[index$105], ch2$263, ch3$264, ch4$265;
        // Check for most common single-character punctuators.
        if (ch1$262 === ';' || ch1$262 === '{' || ch1$262 === '}') {
            ++index$105;
            return {
                type: Token$97.Punctuator,
                value: ch1$262,
                lineNumber: lineNumber$106,
                lineStart: lineStart$107,
                range: [
                    start$261,
                    index$105
                ]
            };
        }
        if (ch1$262 === ',' || ch1$262 === '(' || ch1$262 === ')') {
            ++index$105;
            return {
                type: Token$97.Punctuator,
                value: ch1$262,
                lineNumber: lineNumber$106,
                lineStart: lineStart$107,
                range: [
                    start$261,
                    index$105
                ]
            };
        }
        if (ch1$262 === '#') {
            ++index$105;
            return {
                type: Token$97.Identifier,
                value: ch1$262,
                lineNumber: lineNumber$106,
                lineStart: lineStart$107,
                range: [
                    start$261,
                    index$105
                ]
            };
        }
        // Dot (.) can also start a floating-point number, hence the need
        // to check the next character.
        ch2$263 = source$103[index$105 + 1];
        if (ch1$262 === '.' && !isDecimalDigit$116(ch2$263)) {
            if (source$103[index$105 + 1] === '.' && source$103[index$105 + 2] === '.') {
                nextChar$127();
                nextChar$127();
                nextChar$127();
                return {
                    type: Token$97.Punctuator,
                    value: '...',
                    lineNumber: lineNumber$106,
                    lineStart: lineStart$107,
                    range: [
                        start$261,
                        index$105
                    ]
                };
            } else {
                return {
                    type: Token$97.Punctuator,
                    value: nextChar$127(),
                    lineNumber: lineNumber$106,
                    lineStart: lineStart$107,
                    range: [
                        start$261,
                        index$105
                    ]
                };
            }
        }
        // Peek more characters.
        ch3$264 = source$103[index$105 + 2];
        ch4$265 = source$103[index$105 + 3];
        // 4-character punctuator: >>>=
        if (ch1$262 === '>' && ch2$263 === '>' && ch3$264 === '>') {
            if (ch4$265 === '=') {
                index$105 += 4;
                return {
                    type: Token$97.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$106,
                    lineStart: lineStart$107,
                    range: [
                        start$261,
                        index$105
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$262 === '=' && ch2$263 === '=' && ch3$264 === '=') {
            index$105 += 3;
            return {
                type: Token$97.Punctuator,
                value: '===',
                lineNumber: lineNumber$106,
                lineStart: lineStart$107,
                range: [
                    start$261,
                    index$105
                ]
            };
        }
        if (ch1$262 === '!' && ch2$263 === '=' && ch3$264 === '=') {
            index$105 += 3;
            return {
                type: Token$97.Punctuator,
                value: '!==',
                lineNumber: lineNumber$106,
                lineStart: lineStart$107,
                range: [
                    start$261,
                    index$105
                ]
            };
        }
        if (ch1$262 === '>' && ch2$263 === '>' && ch3$264 === '>') {
            index$105 += 3;
            return {
                type: Token$97.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$106,
                lineStart: lineStart$107,
                range: [
                    start$261,
                    index$105
                ]
            };
        }
        if (ch1$262 === '<' && ch2$263 === '<' && ch3$264 === '=') {
            index$105 += 3;
            return {
                type: Token$97.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$106,
                lineStart: lineStart$107,
                range: [
                    start$261,
                    index$105
                ]
            };
        }
        if (ch1$262 === '>' && ch2$263 === '>' && ch3$264 === '=') {
            index$105 += 3;
            return {
                type: Token$97.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$106,
                lineStart: lineStart$107,
                range: [
                    start$261,
                    index$105
                ]
            };
        }
        // 2-character punctuators: <= >= == != ++ -- << >> && ||
        // += -= *= %= &= |= ^= /=
        if (ch2$263 === '=') {
            if ('<>=!+-*%&|^/'.indexOf(ch1$262) >= 0) {
                index$105 += 2;
                return {
                    type: Token$97.Punctuator,
                    value: ch1$262 + ch2$263,
                    lineNumber: lineNumber$106,
                    lineStart: lineStart$107,
                    range: [
                        start$261,
                        index$105
                    ]
                };
            }
        }
        if (ch1$262 === ch2$263 && '+-<>&|'.indexOf(ch1$262) >= 0) {
            if ('+-<>&|'.indexOf(ch2$263) >= 0) {
                index$105 += 2;
                return {
                    type: Token$97.Punctuator,
                    value: ch1$262 + ch2$263,
                    lineNumber: lineNumber$106,
                    lineStart: lineStart$107,
                    range: [
                        start$261,
                        index$105
                    ]
                };
            }
        }
        // The remaining 1-character punctuators.
        if ('[]<>+-*%&|^!~?:=/'.indexOf(ch1$262) >= 0) {
            return {
                type: Token$97.Punctuator,
                value: nextChar$127(),
                lineNumber: lineNumber$106,
                lineStart: lineStart$107,
                range: [
                    start$261,
                    index$105
                ]
            };
        }
    }
    // 7.8.3 Numeric Literals
    function scanNumericLiteral$133() {
        var number$266, start$267, ch$268;
        ch$268 = source$103[index$105];
        assert$113(isDecimalDigit$116(ch$268) || ch$268 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$267 = index$105;
        number$266 = '';
        if (ch$268 !== '.') {
            number$266 = nextChar$127();
            ch$268 = source$103[index$105];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            if (number$266 === '0') {
                if (ch$268 === 'x' || ch$268 === 'X') {
                    number$266 += nextChar$127();
                    while (index$105 < length$108) {
                        ch$268 = source$103[index$105];
                        if (!isHexDigit$117(ch$268)) {
                            break;
                        }
                        number$266 += nextChar$127();
                    }
                    if (number$266.length <= 2) {
                        // only 0x
                        throwError$141({}, Messages$101.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$105 < length$108) {
                        ch$268 = source$103[index$105];
                        if (isIdentifierStart$121(ch$268)) {
                            throwError$141({}, Messages$101.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$97.NumericLiteral,
                        value: parseInt(number$266, 16),
                        lineNumber: lineNumber$106,
                        lineStart: lineStart$107,
                        range: [
                            start$267,
                            index$105
                        ]
                    };
                } else if (isOctalDigit$118(ch$268)) {
                    number$266 += nextChar$127();
                    while (index$105 < length$108) {
                        ch$268 = source$103[index$105];
                        if (!isOctalDigit$118(ch$268)) {
                            break;
                        }
                        number$266 += nextChar$127();
                    }
                    if (index$105 < length$108) {
                        ch$268 = source$103[index$105];
                        if (isIdentifierStart$121(ch$268) || isDecimalDigit$116(ch$268)) {
                            throwError$141({}, Messages$101.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$97.NumericLiteral,
                        value: parseInt(number$266, 8),
                        octal: true,
                        lineNumber: lineNumber$106,
                        lineStart: lineStart$107,
                        range: [
                            start$267,
                            index$105
                        ]
                    };
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (isDecimalDigit$116(ch$268)) {
                    throwError$141({}, Messages$101.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (index$105 < length$108) {
                ch$268 = source$103[index$105];
                if (!isDecimalDigit$116(ch$268)) {
                    break;
                }
                number$266 += nextChar$127();
            }
        }
        if (ch$268 === '.') {
            number$266 += nextChar$127();
            while (index$105 < length$108) {
                ch$268 = source$103[index$105];
                if (!isDecimalDigit$116(ch$268)) {
                    break;
                }
                number$266 += nextChar$127();
            }
        }
        if (ch$268 === 'e' || ch$268 === 'E') {
            number$266 += nextChar$127();
            ch$268 = source$103[index$105];
            if (ch$268 === '+' || ch$268 === '-') {
                number$266 += nextChar$127();
            }
            ch$268 = source$103[index$105];
            if (isDecimalDigit$116(ch$268)) {
                number$266 += nextChar$127();
                while (index$105 < length$108) {
                    ch$268 = source$103[index$105];
                    if (!isDecimalDigit$116(ch$268)) {
                        break;
                    }
                    number$266 += nextChar$127();
                }
            } else {
                ch$268 = 'character ' + ch$268;
                if (index$105 >= length$108) {
                    ch$268 = '<end>';
                }
                throwError$141({}, Messages$101.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (index$105 < length$108) {
            ch$268 = source$103[index$105];
            if (isIdentifierStart$121(ch$268)) {
                throwError$141({}, Messages$101.UnexpectedToken, 'ILLEGAL');
            }
        }
        return {
            type: Token$97.NumericLiteral,
            value: parseFloat(number$266),
            lineNumber: lineNumber$106,
            lineStart: lineStart$107,
            range: [
                start$267,
                index$105
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$134() {
        var str$269 = '', quote$270, start$271, ch$272, code$273, unescaped$274, restore$275, octal$276 = false;
        quote$270 = source$103[index$105];
        assert$113(quote$270 === '\'' || quote$270 === '"', 'String literal must starts with a quote');
        start$271 = index$105;
        ++index$105;
        while (index$105 < length$108) {
            ch$272 = nextChar$127();
            if (ch$272 === quote$270) {
                quote$270 = '';
                break;
            } else if (ch$272 === '\\') {
                ch$272 = nextChar$127();
                if (!isLineTerminator$120(ch$272)) {
                    switch (ch$272) {
                    case 'n':
                        str$269 += '\n';
                        break;
                    case 'r':
                        str$269 += '\r';
                        break;
                    case 't':
                        str$269 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        restore$275 = index$105;
                        unescaped$274 = scanHexEscape$130(ch$272);
                        if (unescaped$274) {
                            str$269 += unescaped$274;
                        } else {
                            index$105 = restore$275;
                            str$269 += ch$272;
                        }
                        break;
                    case 'b':
                        str$269 += '\b';
                        break;
                    case 'f':
                        str$269 += '\f';
                        break;
                    case 'v':
                        str$269 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$118(ch$272)) {
                            code$273 = '01234567'.indexOf(ch$272);
                            // \0 is not octal escape sequence
                            if (code$273 !== 0) {
                                octal$276 = true;
                            }
                            if (index$105 < length$108 && isOctalDigit$118(source$103[index$105])) {
                                octal$276 = true;
                                code$273 = code$273 * 8 + '01234567'.indexOf(nextChar$127());
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$272) >= 0 && index$105 < length$108 && isOctalDigit$118(source$103[index$105])) {
                                    code$273 = code$273 * 8 + '01234567'.indexOf(nextChar$127());
                                }
                            }
                            str$269 += String.fromCharCode(code$273);
                        } else {
                            str$269 += ch$272;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$106;
                    if (ch$272 === '\r' && source$103[index$105] === '\n') {
                        ++index$105;
                    }
                }
            } else if (isLineTerminator$120(ch$272)) {
                break;
            } else {
                str$269 += ch$272;
            }
        }
        if (quote$270 !== '') {
            throwError$141({}, Messages$101.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$97.StringLiteral,
            value: str$269,
            octal: octal$276,
            lineNumber: lineNumber$106,
            lineStart: lineStart$107,
            range: [
                start$271,
                index$105
            ]
        };
    }
    function scanRegExp$135() {
        var str$277 = '', ch$278, start$279, pattern$280, flags$281, value$282, classMarker$283 = false, restore$284;
        buffer$109 = null;
        skipComment$129();
        start$279 = index$105;
        ch$278 = source$103[index$105];
        assert$113(ch$278 === '/', 'Regular expression literal must start with a slash');
        str$277 = nextChar$127();
        while (index$105 < length$108) {
            ch$278 = nextChar$127();
            str$277 += ch$278;
            if (classMarker$283) {
                if (ch$278 === ']') {
                    classMarker$283 = false;
                }
            } else {
                if (ch$278 === '\\') {
                    ch$278 = nextChar$127();
                    // ECMA-262 7.8.5
                    if (isLineTerminator$120(ch$278)) {
                        throwError$141({}, Messages$101.UnterminatedRegExp);
                    }
                    str$277 += ch$278;
                } else if (ch$278 === '/') {
                    break;
                } else if (ch$278 === '[') {
                    classMarker$283 = true;
                } else if (isLineTerminator$120(ch$278)) {
                    throwError$141({}, Messages$101.UnterminatedRegExp);
                }
            }
        }
        if (str$277.length === 1) {
            throwError$141({}, Messages$101.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$280 = str$277.substr(1, str$277.length - 2);
        flags$281 = '';
        while (index$105 < length$108) {
            ch$278 = source$103[index$105];
            if (!isIdentifierPart$122(ch$278)) {
                break;
            }
            ++index$105;
            if (ch$278 === '\\' && index$105 < length$108) {
                ch$278 = source$103[index$105];
                if (ch$278 === 'u') {
                    ++index$105;
                    restore$284 = index$105;
                    ch$278 = scanHexEscape$130('u');
                    if (ch$278) {
                        flags$281 += ch$278;
                        str$277 += '\\u';
                        for (; restore$284 < index$105; ++restore$284) {
                            str$277 += source$103[restore$284];
                        }
                    } else {
                        index$105 = restore$284;
                        flags$281 += 'u';
                        str$277 += '\\u';
                    }
                } else {
                    str$277 += '\\';
                }
            } else {
                flags$281 += ch$278;
                str$277 += ch$278;
            }
        }
        try {
            value$282 = new RegExp(pattern$280, flags$281);
        } catch (e$285) {
            throwError$141({}, Messages$101.InvalidRegExp);
        }
        return {
            type: Token$97.RegexLiteral,
            literal: str$277,
            value: value$282,
            lineNumber: lineNumber$106,
            lineStart: lineStart$107,
            range: [
                start$279,
                index$105
            ]
        };
    }
    function isIdentifierName$136(token$286) {
        return token$286.type === Token$97.Identifier || token$286.type === Token$97.Keyword || token$286.type === Token$97.BooleanLiteral || token$286.type === Token$97.NullLiteral;
    }
    // only used by the reader
    function advance$137() {
        var ch$287, token$288;
        skipComment$129();
        if (index$105 >= length$108) {
            return {
                type: Token$97.EOF,
                lineNumber: lineNumber$106,
                lineStart: lineStart$107,
                range: [
                    index$105,
                    index$105
                ]
            };
        }
        ch$287 = source$103[index$105];
        token$288 = scanPunctuator$132();
        if (typeof token$288 !== 'undefined') {
            return token$288;
        }
        if (ch$287 === '\'' || ch$287 === '"') {
            return scanStringLiteral$134();
        }
        if (ch$287 === '.' || isDecimalDigit$116(ch$287)) {
            return scanNumericLiteral$133();
        }
        token$288 = scanIdentifier$131();
        if (typeof token$288 !== 'undefined') {
            return token$288;
        }
        throwError$141({}, Messages$101.UnexpectedToken, 'ILLEGAL');
    }
    function lex$138() {
        var token$289;
        if (buffer$109) {
            token$289 = buffer$109;
            buffer$109 = null;
            index$105++;
            return token$289;
        }
        buffer$109 = null;
        return tokenStream$111[index$105++];
    }
    function lookahead$139() {
        var pos$290, line$291, start$292;
        if (buffer$109 !== null) {
            return buffer$109;
        }
        buffer$109 = tokenStream$111[index$105];
        return buffer$109;
    }
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$140() {
        var pos$293, line$294, start$295, found$296;
        found$296 = tokenStream$111[index$105 - 1].token.lineNumber !== tokenStream$111[index$105].token.lineNumber;
        return found$296;
    }
    // Throw an exception
    function throwError$141(token$297, messageFormat$298) {
        var error$299, args$300 = Array.prototype.slice.call(arguments, 2), msg$301 = messageFormat$298.replace(/%(\d)/g, function (whole$302, index$303) {
                return args$300[index$303] || '';
            });
        if (typeof token$297.lineNumber === 'number') {
            error$299 = new Error('Line ' + token$297.lineNumber + ': ' + msg$301);
            error$299.lineNumber = token$297.lineNumber;
            if (token$297.range && token$297.range.length > 0) {
                error$299.index = token$297.range[0];
                error$299.column = token$297.range[0] - lineStart$107 + 1;
            }
        } else {
            error$299 = new Error('Line ' + lineNumber$106 + ': ' + msg$301);
            error$299.index = index$105;
            error$299.lineNumber = lineNumber$106;
            error$299.column = index$105 - lineStart$107 + 1;
        }
        throw error$299;
    }
    function throwErrorTolerant$142() {
        var error$304;
        try {
            throwError$141.apply(null, arguments);
        } catch (e$305) {
            if (extra$112.errors) {
                extra$112.errors.push(e$305);
            } else {
                throw e$305;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$143(token$306) {
        var s$307;
        if (token$306.type === Token$97.EOF) {
            throwError$141(token$306, Messages$101.UnexpectedEOS);
        }
        if (token$306.type === Token$97.NumericLiteral) {
            throwError$141(token$306, Messages$101.UnexpectedNumber);
        }
        if (token$306.type === Token$97.StringLiteral) {
            throwError$141(token$306, Messages$101.UnexpectedString);
        }
        if (token$306.type === Token$97.Identifier) {
            console.log(token$306);
            throwError$141(token$306, Messages$101.UnexpectedIdentifier);
        }
        if (token$306.type === Token$97.Keyword) {
            if (isFutureReservedWord$123(token$306.value)) {
                throwError$141(token$306, Messages$101.UnexpectedReserved);
            } else if (strict$104 && isStrictModeReservedWord$124(token$306.value)) {
                throwError$141(token$306, Messages$101.StrictReservedWord);
            }
            throwError$141(token$306, Messages$101.UnexpectedToken, token$306.value);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$141(token$306, Messages$101.UnexpectedToken, token$306.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$144(value$308) {
        var token$309 = lex$138().token;
        if (token$309.type !== Token$97.Punctuator || token$309.value !== value$308) {
            throwUnexpected$143(token$309);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$145(keyword$310) {
        var token$311 = lex$138().token;
        if (token$311.type !== Token$97.Keyword || token$311.value !== keyword$310) {
            throwUnexpected$143(token$311);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$146(value$312) {
        var token$313 = lookahead$139().token;
        return token$313.type === Token$97.Punctuator && token$313.value === value$312;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$147(keyword$314) {
        var token$315 = lookahead$139().token;
        return token$315.type === Token$97.Keyword && token$315.value === keyword$314;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$148() {
        var token$316 = lookahead$139().token, op$317 = token$316.value;
        if (token$316.type !== Token$97.Punctuator) {
            return false;
        }
        return op$317 === '=' || op$317 === '*=' || op$317 === '/=' || op$317 === '%=' || op$317 === '+=' || op$317 === '-=' || op$317 === '<<=' || op$317 === '>>=' || op$317 === '>>>=' || op$317 === '&=' || op$317 === '^=' || op$317 === '|=';
    }
    function consumeSemicolon$149() {
        var token$318, line$319;
        if (tokenStream$111[index$105].token.value === ';') {
            lex$138().token;
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
        line$319 = tokenStream$111[index$105 - 1].token.lineNumber;
        token$318 = tokenStream$111[index$105].token;
        if (line$319 !== token$318.lineNumber) {
            return;
        }
        if (token$318.type !== Token$97.EOF && !match$146('}')) {
            throwUnexpected$143(token$318);
        }
        return;
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$150(expr$320) {
        return expr$320.type === Syntax$99.Identifier || expr$320.type === Syntax$99.MemberExpression;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$151() {
        var elements$321 = [], undef$322;
        expect$144('[');
        while (!match$146(']')) {
            if (match$146(',')) {
                lex$138().token;
                elements$321.push(undef$322);
            } else {
                elements$321.push(parseAssignmentExpression$180());
                if (!match$146(']')) {
                    expect$144(',');
                }
            }
        }
        expect$144(']');
        return {
            type: Syntax$99.ArrayExpression,
            elements: elements$321
        };
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$152(param$323, first$324) {
        var previousStrict$325, body$326;
        previousStrict$325 = strict$104;
        body$326 = parseFunctionSourceElements$207();
        if (first$324 && strict$104 && isRestrictedWord$125(param$323[0].name)) {
            throwError$141(first$324, Messages$101.StrictParamName);
        }
        strict$104 = previousStrict$325;
        return {
            type: Syntax$99.FunctionExpression,
            id: null,
            params: param$323,
            body: body$326
        };
    }
    function parseObjectPropertyKey$153() {
        var token$327 = lex$138().token;
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$327.type === Token$97.StringLiteral || token$327.type === Token$97.NumericLiteral) {
            if (strict$104 && token$327.octal) {
                throwError$141(token$327, Messages$101.StrictOctalLiteral);
            }
            return createLiteral$217(token$327);
        }
        return {
            type: Syntax$99.Identifier,
            name: token$327.value
        };
    }
    function parseObjectProperty$154() {
        var token$328, key$329, id$330, param$331;
        token$328 = lookahead$139().token;
        if (token$328.type === Token$97.Identifier) {
            id$330 = parseObjectPropertyKey$153();
            // Property Assignment: Getter and Setter.
            if (token$328.value === 'get' && !match$146(':')) {
                key$329 = parseObjectPropertyKey$153();
                expect$144('(');
                expect$144(')');
                return {
                    type: Syntax$99.Property,
                    key: key$329,
                    value: parsePropertyFunction$152([]),
                    kind: 'get'
                };
            } else if (token$328.value === 'set' && !match$146(':')) {
                key$329 = parseObjectPropertyKey$153();
                expect$144('(');
                token$328 = lookahead$139().token;
                if (token$328.type !== Token$97.Identifier) {
                    throwUnexpected$143(lex$138().token);
                }
                param$331 = [parseVariableIdentifier$184()];
                expect$144(')');
                return {
                    type: Syntax$99.Property,
                    key: key$329,
                    value: parsePropertyFunction$152(param$331, token$328),
                    kind: 'set'
                };
            } else {
                expect$144(':');
                return {
                    type: Syntax$99.Property,
                    key: id$330,
                    value: parseAssignmentExpression$180(),
                    kind: 'init'
                };
            }
        } else if (token$328.type === Token$97.EOF || token$328.type === Token$97.Punctuator) {
            throwUnexpected$143(token$328);
        } else {
            key$329 = parseObjectPropertyKey$153();
            expect$144(':');
            return {
                type: Syntax$99.Property,
                key: key$329,
                value: parseAssignmentExpression$180(),
                kind: 'init'
            };
        }
    }
    function parseObjectInitialiser$155() {
        var token$332, properties$333 = [], property$334, name$335, kind$336, map$337 = {}, toString$338 = String;
        expect$144('{');
        while (!match$146('}')) {
            property$334 = parseObjectProperty$154();
            if (property$334.key.type === Syntax$99.Identifier) {
                name$335 = property$334.key.name;
            } else {
                name$335 = toString$338(property$334.key.value);
            }
            kind$336 = property$334.kind === 'init' ? PropertyKind$100.Data : property$334.kind === 'get' ? PropertyKind$100.Get : PropertyKind$100.Set;
            if (Object.prototype.hasOwnProperty.call(map$337, name$335)) {
                if (map$337[name$335] === PropertyKind$100.Data) {
                    if (strict$104 && kind$336 === PropertyKind$100.Data) {
                        throwErrorTolerant$142({}, Messages$101.StrictDuplicateProperty);
                    } else if (kind$336 !== PropertyKind$100.Data) {
                        throwError$141({}, Messages$101.AccessorDataProperty);
                    }
                } else {
                    if (kind$336 === PropertyKind$100.Data) {
                        throwError$141({}, Messages$101.AccessorDataProperty);
                    } else if (map$337[name$335] & kind$336) {
                        throwError$141({}, Messages$101.AccessorGetSet);
                    }
                }
                map$337[name$335] |= kind$336;
            } else {
                map$337[name$335] = kind$336;
            }
            properties$333.push(property$334);
            if (!match$146('}')) {
                expect$144(',');
            }
        }
        expect$144('}');
        return {
            type: Syntax$99.ObjectExpression,
            properties: properties$333
        };
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$156() {
        var expr$339, token$340 = lookahead$139().token, type$341 = token$340.type;
        if (type$341 === Token$97.Identifier) {
            var name$342 = expander$96.resolve(lex$138());
            return {
                type: Syntax$99.Identifier,
                name: name$342
            };
        }
        if (type$341 === Token$97.StringLiteral || type$341 === Token$97.NumericLiteral) {
            if (strict$104 && token$340.octal) {
                throwErrorTolerant$142(token$340, Messages$101.StrictOctalLiteral);
            }
            return createLiteral$217(lex$138().token);
        }
        if (type$341 === Token$97.Keyword) {
            if (matchKeyword$147('this')) {
                lex$138().token;
                return { type: Syntax$99.ThisExpression };
            }
            if (matchKeyword$147('function')) {
                return parseFunctionExpression$209();
            }
        }
        if (type$341 === Token$97.BooleanLiteral) {
            lex$138();
            token$340.value = token$340.value === 'true';
            return createLiteral$217(token$340);
        }
        if (type$341 === Token$97.NullLiteral) {
            lex$138();
            token$340.value = null;
            return createLiteral$217(token$340);
        }
        if (match$146('[')) {
            return parseArrayInitialiser$151();
        }
        if (match$146('{')) {
            return parseObjectInitialiser$155();
        }
        if (match$146('(')) {
            lex$138();
            state$110.lastParenthesized = expr$339 = parseExpression$181();
            expect$144(')');
            return expr$339;
        }
        if (token$340.value instanceof RegExp) {
            return createLiteral$217(lex$138().token);
        }
        return throwUnexpected$143(lex$138().token);
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$157() {
        var args$343 = [];
        expect$144('(');
        if (!match$146(')')) {
            while (index$105 < length$108) {
                args$343.push(parseAssignmentExpression$180());
                if (match$146(')')) {
                    break;
                }
                expect$144(',');
            }
        }
        expect$144(')');
        return args$343;
    }
    function parseNonComputedProperty$158() {
        var token$344 = lex$138().token;
        if (!isIdentifierName$136(token$344)) {
            throwUnexpected$143(token$344);
        }
        return {
            type: Syntax$99.Identifier,
            name: token$344.value
        };
    }
    function parseNonComputedMember$159(object$345) {
        return {
            type: Syntax$99.MemberExpression,
            computed: false,
            object: object$345,
            property: parseNonComputedProperty$158()
        };
    }
    function parseComputedMember$160(object$346) {
        var property$347, expr$348;
        expect$144('[');
        property$347 = parseExpression$181();
        expr$348 = {
            type: Syntax$99.MemberExpression,
            computed: true,
            object: object$346,
            property: property$347
        };
        expect$144(']');
        return expr$348;
    }
    function parseCallMember$161(object$349) {
        return {
            type: Syntax$99.CallExpression,
            callee: object$349,
            'arguments': parseArguments$157()
        };
    }
    function parseNewExpression$162() {
        var expr$350;
        expectKeyword$145('new');
        expr$350 = {
            type: Syntax$99.NewExpression,
            callee: parseLeftHandSideExpression$166(),
            'arguments': []
        };
        if (match$146('(')) {
            expr$350['arguments'] = parseArguments$157();
        }
        return expr$350;
    }
    // sort of broken, only accepts literals
    // pretty sure the use of toString will bite me
    function toArrayNode$163(arr$351) {
        var els$352 = arr$351.map(function (el$353) {
                return {
                    type: 'Literal',
                    value: el$353,
                    raw: el$353.toString()
                };
            });
        return {
            type: 'ArrayExpression',
            elements: els$352
        };
    }
    function toObjectNode$164(obj$354) {
        // todo: hacky, fixup
        var props$355 = Object.keys(obj$354).map(function (key$356) {
                var raw$357 = obj$354[key$356];
                var value$358;
                if (Array.isArray(raw$357)) {
                    value$358 = toArrayNode$163(raw$357);
                } else {
                    value$358 = {
                        type: 'Literal',
                        value: obj$354[key$356],
                        raw: obj$354[key$356].toString()
                    };
                }
                return {
                    type: 'Property',
                    key: {
                        type: 'Identifier',
                        name: key$356
                    },
                    value: value$358,
                    kind: 'init'
                };
            });
        return {
            type: 'ObjectExpression',
            properties: props$355
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
    function parseLeftHandSideExpressionAllowCall$165() {
        var useNew$359, expr$360;
        useNew$359 = matchKeyword$147('new');
        expr$360 = useNew$359 ? parseNewExpression$162() : parsePrimaryExpression$156();
        // handle "syntax" primitive
        // todo: error handling
        // if(expr.name === "syntax") {
        //     return parseSyntaxObject();
        // }
        while (index$105 < length$108) {
            if (match$146('.')) {
                lex$138();
                expr$360 = parseNonComputedMember$159(expr$360);
            } else if (match$146('[')) {
                expr$360 = parseComputedMember$160(expr$360);
            } else if (match$146('(')) {
                expr$360 = parseCallMember$161(expr$360);
            } else {
                break;
            }
        }
        return expr$360;
    }
    function parseLeftHandSideExpression$166() {
        var useNew$361, expr$362;
        useNew$361 = matchKeyword$147('new');
        expr$362 = useNew$361 ? parseNewExpression$162() : parsePrimaryExpression$156();
        while (index$105 < length$108) {
            if (match$146('.')) {
                lex$138();
                expr$362 = parseNonComputedMember$159(expr$362);
            } else if (match$146('[')) {
                expr$362 = parseComputedMember$160(expr$362);
            } else {
                break;
            }
        }
        return expr$362;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$167() {
        var expr$363 = parseLeftHandSideExpressionAllowCall$165();
        if ((match$146('++') || match$146('--')) && !peekLineTerminator$140()) {
            // 11.3.1, 11.3.2
            if (strict$104 && expr$363.type === Syntax$99.Identifier && isRestrictedWord$125(expr$363.name)) {
                throwError$141({}, Messages$101.StrictLHSPostfix);
            }
            if (!isLeftHandSide$150(expr$363)) {
                throwError$141({}, Messages$101.InvalidLHSInAssignment);
            }
            expr$363 = {
                type: Syntax$99.UpdateExpression,
                operator: lex$138().token.value,
                argument: expr$363,
                prefix: false
            };
        }
        return expr$363;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$168() {
        var token$364, expr$365;
        if (match$146('++') || match$146('--')) {
            token$364 = lex$138().token;
            expr$365 = parseUnaryExpression$168();
            // 11.4.4, 11.4.5
            if (strict$104 && expr$365.type === Syntax$99.Identifier && isRestrictedWord$125(expr$365.name)) {
                throwError$141({}, Messages$101.StrictLHSPrefix);
            }
            if (!isLeftHandSide$150(expr$365)) {
                throwError$141({}, Messages$101.InvalidLHSInAssignment);
            }
            expr$365 = {
                type: Syntax$99.UpdateExpression,
                operator: token$364.value,
                argument: expr$365,
                prefix: true
            };
            return expr$365;
        }
        if (match$146('+') || match$146('-') || match$146('~') || match$146('!')) {
            expr$365 = {
                type: Syntax$99.UnaryExpression,
                operator: lex$138().token.value,
                argument: parseUnaryExpression$168()
            };
            return expr$365;
        }
        if (matchKeyword$147('delete') || matchKeyword$147('void') || matchKeyword$147('typeof')) {
            expr$365 = {
                type: Syntax$99.UnaryExpression,
                operator: lex$138().token.value,
                argument: parseUnaryExpression$168()
            };
            if (strict$104 && expr$365.operator === 'delete' && expr$365.argument.type === Syntax$99.Identifier) {
                throwErrorTolerant$142({}, Messages$101.StrictDelete);
            }
            return expr$365;
        }
        return parsePostfixExpression$167();
    }
    // 11.5 Multiplicative Operators
    function parseMultiplicativeExpression$169() {
        var expr$366 = parseUnaryExpression$168();
        while (match$146('*') || match$146('/') || match$146('%')) {
            expr$366 = {
                type: Syntax$99.BinaryExpression,
                operator: lex$138().token.value,
                left: expr$366,
                right: parseUnaryExpression$168()
            };
        }
        return expr$366;
    }
    // 11.6 Additive Operators
    function parseAdditiveExpression$170() {
        var expr$367 = parseMultiplicativeExpression$169();
        while (match$146('+') || match$146('-')) {
            expr$367 = {
                type: Syntax$99.BinaryExpression,
                operator: lex$138().token.value,
                left: expr$367,
                right: parseMultiplicativeExpression$169()
            };
        }
        return expr$367;
    }
    // 11.7 Bitwise Shift Operators
    function parseShiftExpression$171() {
        var expr$368 = parseAdditiveExpression$170();
        while (match$146('<<') || match$146('>>') || match$146('>>>')) {
            expr$368 = {
                type: Syntax$99.BinaryExpression,
                operator: lex$138().token.value,
                left: expr$368,
                right: parseAdditiveExpression$170()
            };
        }
        return expr$368;
    }
    // 11.8 Relational Operators
    function parseRelationalExpression$172() {
        var expr$369, previousAllowIn$370;
        previousAllowIn$370 = state$110.allowIn;
        state$110.allowIn = true;
        expr$369 = parseShiftExpression$171();
        while (match$146('<') || match$146('>') || match$146('<=') || match$146('>=') || previousAllowIn$370 && matchKeyword$147('in') || matchKeyword$147('instanceof')) {
            expr$369 = {
                type: Syntax$99.BinaryExpression,
                operator: lex$138().token.value,
                left: expr$369,
                right: parseRelationalExpression$172()
            };
        }
        state$110.allowIn = previousAllowIn$370;
        return expr$369;
    }
    // 11.9 Equality Operators
    function parseEqualityExpression$173() {
        var expr$371 = parseRelationalExpression$172();
        while (match$146('==') || match$146('!=') || match$146('===') || match$146('!==')) {
            expr$371 = {
                type: Syntax$99.BinaryExpression,
                operator: lex$138().token.value,
                left: expr$371,
                right: parseRelationalExpression$172()
            };
        }
        return expr$371;
    }
    // 11.10 Binary Bitwise Operators
    function parseBitwiseANDExpression$174() {
        var expr$372 = parseEqualityExpression$173();
        while (match$146('&')) {
            lex$138();
            expr$372 = {
                type: Syntax$99.BinaryExpression,
                operator: '&',
                left: expr$372,
                right: parseEqualityExpression$173()
            };
        }
        return expr$372;
    }
    function parseBitwiseXORExpression$175() {
        var expr$373 = parseBitwiseANDExpression$174();
        while (match$146('^')) {
            lex$138();
            expr$373 = {
                type: Syntax$99.BinaryExpression,
                operator: '^',
                left: expr$373,
                right: parseBitwiseANDExpression$174()
            };
        }
        return expr$373;
    }
    function parseBitwiseORExpression$176() {
        var expr$374 = parseBitwiseXORExpression$175();
        while (match$146('|')) {
            lex$138();
            expr$374 = {
                type: Syntax$99.BinaryExpression,
                operator: '|',
                left: expr$374,
                right: parseBitwiseXORExpression$175()
            };
        }
        return expr$374;
    }
    // 11.11 Binary Logical Operators
    function parseLogicalANDExpression$177() {
        var expr$375 = parseBitwiseORExpression$176();
        while (match$146('&&')) {
            lex$138();
            expr$375 = {
                type: Syntax$99.LogicalExpression,
                operator: '&&',
                left: expr$375,
                right: parseBitwiseORExpression$176()
            };
        }
        return expr$375;
    }
    function parseLogicalORExpression$178() {
        var expr$376 = parseLogicalANDExpression$177();
        while (match$146('||')) {
            lex$138();
            expr$376 = {
                type: Syntax$99.LogicalExpression,
                operator: '||',
                left: expr$376,
                right: parseLogicalANDExpression$177()
            };
        }
        return expr$376;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$179() {
        var expr$377, previousAllowIn$378, consequent$379;
        expr$377 = parseLogicalORExpression$178();
        if (match$146('?')) {
            lex$138();
            previousAllowIn$378 = state$110.allowIn;
            state$110.allowIn = true;
            consequent$379 = parseAssignmentExpression$180();
            state$110.allowIn = previousAllowIn$378;
            expect$144(':');
            expr$377 = {
                type: Syntax$99.ConditionalExpression,
                test: expr$377,
                consequent: consequent$379,
                alternate: parseAssignmentExpression$180()
            };
        }
        return expr$377;
    }
    // 11.13 Assignment Operators
    function parseAssignmentExpression$180() {
        var expr$380;
        expr$380 = parseConditionalExpression$179();
        if (matchAssign$148()) {
            // LeftHandSideExpression
            if (!isLeftHandSide$150(expr$380)) {
                throwError$141({}, Messages$101.InvalidLHSInAssignment);
            }
            // 11.13.1
            if (strict$104 && expr$380.type === Syntax$99.Identifier && isRestrictedWord$125(expr$380.name)) {
                throwError$141({}, Messages$101.StrictLHSAssignment);
            }
            expr$380 = {
                type: Syntax$99.AssignmentExpression,
                operator: lex$138().token.value,
                left: expr$380,
                right: parseAssignmentExpression$180()
            };
        }
        return expr$380;
    }
    // 11.14 Comma Operator
    function parseExpression$181() {
        var expr$381 = parseAssignmentExpression$180();
        if (match$146(',')) {
            expr$381 = {
                type: Syntax$99.SequenceExpression,
                expressions: [expr$381]
            };
            while (index$105 < length$108) {
                if (!match$146(',')) {
                    break;
                }
                lex$138();
                expr$381.expressions.push(parseAssignmentExpression$180());
            }
        }
        return expr$381;
    }
    // 12.1 Block
    function parseStatementList$182() {
        var list$382 = [], statement$383;
        while (index$105 < length$108) {
            if (match$146('}')) {
                break;
            }
            statement$383 = parseSourceElement$210();
            if (typeof statement$383 === 'undefined') {
                break;
            }
            list$382.push(statement$383);
        }
        return list$382;
    }
    function parseBlock$183() {
        var block$384;
        expect$144('{');
        block$384 = parseStatementList$182();
        expect$144('}');
        return {
            type: Syntax$99.BlockStatement,
            body: block$384
        };
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$184() {
        var stx$385 = lex$138(), token$386 = stx$385.token;
        if (token$386.type !== Token$97.Identifier) {
            throwUnexpected$143(token$386);
        }
        var name$387 = expander$96.resolve(stx$385);
        return {
            type: Syntax$99.Identifier,
            name: name$387
        };
    }
    function parseVariableDeclaration$185(kind$388) {
        var id$389 = parseVariableIdentifier$184(), init$390 = null;
        // 12.2.1
        if (strict$104 && isRestrictedWord$125(id$389.name)) {
            throwErrorTolerant$142({}, Messages$101.StrictVarName);
        }
        if (kind$388 === 'const') {
            expect$144('=');
            init$390 = parseAssignmentExpression$180();
        } else if (match$146('=')) {
            lex$138();
            init$390 = parseAssignmentExpression$180();
        }
        return {
            type: Syntax$99.VariableDeclarator,
            id: id$389,
            init: init$390
        };
    }
    function parseVariableDeclarationList$186(kind$391) {
        var list$392 = [];
        while (index$105 < length$108) {
            list$392.push(parseVariableDeclaration$185(kind$391));
            if (!match$146(',')) {
                break;
            }
            lex$138();
        }
        return list$392;
    }
    function parseVariableStatement$187() {
        var declarations$393;
        expectKeyword$145('var');
        declarations$393 = parseVariableDeclarationList$186();
        consumeSemicolon$149();
        return {
            type: Syntax$99.VariableDeclaration,
            declarations: declarations$393,
            kind: 'var'
        };
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$188(kind$394) {
        var declarations$395;
        expectKeyword$145(kind$394);
        declarations$395 = parseVariableDeclarationList$186(kind$394);
        consumeSemicolon$149();
        return {
            type: Syntax$99.VariableDeclaration,
            declarations: declarations$395,
            kind: kind$394
        };
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$189() {
        expect$144(';');
        return { type: Syntax$99.EmptyStatement };
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$190() {
        var expr$396 = parseExpression$181();
        consumeSemicolon$149();
        return {
            type: Syntax$99.ExpressionStatement,
            expression: expr$396
        };
    }
    // 12.5 If statement
    function parseIfStatement$191() {
        var test$397, consequent$398, alternate$399;
        expectKeyword$145('if');
        expect$144('(');
        test$397 = parseExpression$181();
        expect$144(')');
        consequent$398 = parseStatement$206();
        if (matchKeyword$147('else')) {
            lex$138();
            alternate$399 = parseStatement$206();
        } else {
            alternate$399 = null;
        }
        return {
            type: Syntax$99.IfStatement,
            test: test$397,
            consequent: consequent$398,
            alternate: alternate$399
        };
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$192() {
        var body$400, test$401, oldInIteration$402;
        expectKeyword$145('do');
        oldInIteration$402 = state$110.inIteration;
        state$110.inIteration = true;
        body$400 = parseStatement$206();
        state$110.inIteration = oldInIteration$402;
        expectKeyword$145('while');
        expect$144('(');
        test$401 = parseExpression$181();
        expect$144(')');
        if (match$146(';')) {
            lex$138();
        }
        return {
            type: Syntax$99.DoWhileStatement,
            body: body$400,
            test: test$401
        };
    }
    function parseWhileStatement$193() {
        var test$403, body$404, oldInIteration$405;
        expectKeyword$145('while');
        expect$144('(');
        test$403 = parseExpression$181();
        expect$144(')');
        oldInIteration$405 = state$110.inIteration;
        state$110.inIteration = true;
        body$404 = parseStatement$206();
        state$110.inIteration = oldInIteration$405;
        return {
            type: Syntax$99.WhileStatement,
            test: test$403,
            body: body$404
        };
    }
    function parseForVariableDeclaration$194() {
        var token$406 = lex$138().token;
        return {
            type: Syntax$99.VariableDeclaration,
            declarations: parseVariableDeclarationList$186(),
            kind: token$406.value
        };
    }
    function parseForStatement$195() {
        var init$407, test$408, update$409, left$410, right$411, body$412, oldInIteration$413;
        init$407 = test$408 = update$409 = null;
        expectKeyword$145('for');
        expect$144('(');
        if (match$146(';')) {
            lex$138();
        } else {
            if (matchKeyword$147('var') || matchKeyword$147('let')) {
                state$110.allowIn = false;
                init$407 = parseForVariableDeclaration$194();
                state$110.allowIn = true;
                if (init$407.declarations.length === 1 && matchKeyword$147('in')) {
                    lex$138();
                    left$410 = init$407;
                    right$411 = parseExpression$181();
                    init$407 = null;
                }
            } else {
                state$110.allowIn = false;
                init$407 = parseExpression$181();
                state$110.allowIn = true;
                if (matchKeyword$147('in')) {
                    // LeftHandSideExpression
                    if (!isLeftHandSide$150(init$407)) {
                        throwError$141({}, Messages$101.InvalidLHSInForIn);
                    }
                    lex$138();
                    left$410 = init$407;
                    right$411 = parseExpression$181();
                    init$407 = null;
                }
            }
            if (typeof left$410 === 'undefined') {
                expect$144(';');
            }
        }
        if (typeof left$410 === 'undefined') {
            if (!match$146(';')) {
                test$408 = parseExpression$181();
            }
            expect$144(';');
            if (!match$146(')')) {
                update$409 = parseExpression$181();
            }
        }
        expect$144(')');
        oldInIteration$413 = state$110.inIteration;
        state$110.inIteration = true;
        body$412 = parseStatement$206();
        state$110.inIteration = oldInIteration$413;
        if (typeof left$410 === 'undefined') {
            return {
                type: Syntax$99.ForStatement,
                init: init$407,
                test: test$408,
                update: update$409,
                body: body$412
            };
        }
        return {
            type: Syntax$99.ForInStatement,
            left: left$410,
            right: right$411,
            body: body$412,
            each: false
        };
    }
    // 12.7 The continue statement
    function parseContinueStatement$196() {
        var token$414, label$415 = null;
        expectKeyword$145('continue');
        // Optimize the most common form: 'continue;'.
        if (tokenStream$111[index$105].token.value === ';') {
            lex$138();
            if (!state$110.inIteration) {
                throwError$141({}, Messages$101.IllegalContinue);
            }
            return {
                type: Syntax$99.ContinueStatement,
                label: null
            };
        }
        if (peekLineTerminator$140()) {
            if (!state$110.inIteration) {
                throwError$141({}, Messages$101.IllegalContinue);
            }
            return {
                type: Syntax$99.ContinueStatement,
                label: null
            };
        }
        token$414 = lookahead$139().token;
        if (token$414.type === Token$97.Identifier) {
            label$415 = parseVariableIdentifier$184();
            if (!Object.prototype.hasOwnProperty.call(state$110.labelSet, label$415.name)) {
                throwError$141({}, Messages$101.UnknownLabel, label$415.name);
            }
        }
        consumeSemicolon$149();
        if (label$415 === null && !state$110.inIteration) {
            throwError$141({}, Messages$101.IllegalContinue);
        }
        return {
            type: Syntax$99.ContinueStatement,
            label: label$415
        };
    }
    // 12.8 The break statement
    function parseBreakStatement$197() {
        var token$416, label$417 = null;
        expectKeyword$145('break');
        if (peekLineTerminator$140()) {
            if (!(state$110.inIteration || state$110.inSwitch)) {
                throwError$141({}, Messages$101.IllegalBreak);
            }
            return {
                type: Syntax$99.BreakStatement,
                label: null
            };
        }
        token$416 = lookahead$139().token;
        if (token$416.type === Token$97.Identifier) {
            label$417 = parseVariableIdentifier$184();
            if (!Object.prototype.hasOwnProperty.call(state$110.labelSet, label$417.name)) {
                throwError$141({}, Messages$101.UnknownLabel, label$417.name);
            }
        }
        consumeSemicolon$149();
        if (label$417 === null && !(state$110.inIteration || state$110.inSwitch)) {
            throwError$141({}, Messages$101.IllegalBreak);
        }
        return {
            type: Syntax$99.BreakStatement,
            label: label$417
        };
    }
    // 12.9 The return statement
    function parseReturnStatement$198() {
        var token$418, argument$419 = null;
        expectKeyword$145('return');
        if (!state$110.inFunctionBody) {
            throwErrorTolerant$142({}, Messages$101.IllegalReturn);
        }
        if (peekLineTerminator$140()) {
            return {
                type: Syntax$99.ReturnStatement,
                argument: null
            };
        }
        if (!match$146(';')) {
            token$418 = lookahead$139().token;
            if (!match$146('}') && token$418.type !== Token$97.EOF) {
                argument$419 = parseExpression$181();
            }
        }
        consumeSemicolon$149();
        return {
            type: Syntax$99.ReturnStatement,
            argument: argument$419
        };
    }
    // 12.10 The with statement
    function parseWithStatement$199() {
        var object$420, body$421;
        if (strict$104) {
            throwErrorTolerant$142({}, Messages$101.StrictModeWith);
        }
        expectKeyword$145('with');
        expect$144('(');
        object$420 = parseExpression$181();
        expect$144(')');
        body$421 = parseStatement$206();
        return {
            type: Syntax$99.WithStatement,
            object: object$420,
            body: body$421
        };
    }
    // 12.10 The swith statement
    function parseSwitchCase$200() {
        var test$422, consequent$423 = [], statement$424;
        if (matchKeyword$147('default')) {
            lex$138();
            test$422 = null;
        } else {
            expectKeyword$145('case');
            test$422 = parseExpression$181();
        }
        expect$144(':');
        while (index$105 < length$108) {
            if (match$146('}') || matchKeyword$147('default') || matchKeyword$147('case')) {
                break;
            }
            statement$424 = parseStatement$206();
            if (typeof statement$424 === 'undefined') {
                break;
            }
            consequent$423.push(statement$424);
        }
        return {
            type: Syntax$99.SwitchCase,
            test: test$422,
            consequent: consequent$423
        };
    }
    function parseSwitchStatement$201() {
        var discriminant$425, cases$426, oldInSwitch$427;
        expectKeyword$145('switch');
        expect$144('(');
        discriminant$425 = parseExpression$181();
        expect$144(')');
        expect$144('{');
        if (match$146('}')) {
            lex$138();
            return {
                type: Syntax$99.SwitchStatement,
                discriminant: discriminant$425
            };
        }
        cases$426 = [];
        oldInSwitch$427 = state$110.inSwitch;
        state$110.inSwitch = true;
        while (index$105 < length$108) {
            if (match$146('}')) {
                break;
            }
            cases$426.push(parseSwitchCase$200());
        }
        state$110.inSwitch = oldInSwitch$427;
        expect$144('}');
        return {
            type: Syntax$99.SwitchStatement,
            discriminant: discriminant$425,
            cases: cases$426
        };
    }
    // 12.13 The throw statement
    function parseThrowStatement$202() {
        var argument$428;
        expectKeyword$145('throw');
        if (peekLineTerminator$140()) {
            throwError$141({}, Messages$101.NewlineAfterThrow);
        }
        argument$428 = parseExpression$181();
        consumeSemicolon$149();
        return {
            type: Syntax$99.ThrowStatement,
            argument: argument$428
        };
    }
    // 12.14 The try statement
    function parseCatchClause$203() {
        var param$429;
        expectKeyword$145('catch');
        expect$144('(');
        if (!match$146(')')) {
            param$429 = parseExpression$181();
            // 12.14.1
            if (strict$104 && param$429.type === Syntax$99.Identifier && isRestrictedWord$125(param$429.name)) {
                throwErrorTolerant$142({}, Messages$101.StrictCatchVariable);
            }
        }
        expect$144(')');
        return {
            type: Syntax$99.CatchClause,
            param: param$429,
            guard: null,
            body: parseBlock$183()
        };
    }
    function parseTryStatement$204() {
        var block$430, handlers$431 = [], finalizer$432 = null;
        expectKeyword$145('try');
        block$430 = parseBlock$183();
        if (matchKeyword$147('catch')) {
            handlers$431.push(parseCatchClause$203());
        }
        if (matchKeyword$147('finally')) {
            lex$138();
            finalizer$432 = parseBlock$183();
        }
        if (handlers$431.length === 0 && !finalizer$432) {
            throwError$141({}, Messages$101.NoCatchOrFinally);
        }
        return {
            type: Syntax$99.TryStatement,
            block: block$430,
            handlers: handlers$431,
            finalizer: finalizer$432
        };
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$205() {
        expectKeyword$145('debugger');
        consumeSemicolon$149();
        return { type: Syntax$99.DebuggerStatement };
    }
    // 12 Statements
    function parseStatement$206() {
        var token$433 = lookahead$139().token, expr$434, labeledBody$435;
        if (token$433.type === Token$97.EOF) {
            throwUnexpected$143(token$433);
        }
        if (token$433.type === Token$97.Punctuator) {
            switch (token$433.value) {
            case ';':
                return parseEmptyStatement$189();
            case '{':
                return parseBlock$183();
            case '(':
                return parseExpressionStatement$190();
            default:
                break;
            }
        }
        if (token$433.type === Token$97.Keyword) {
            switch (token$433.value) {
            case 'break':
                return parseBreakStatement$197();
            case 'continue':
                return parseContinueStatement$196();
            case 'debugger':
                return parseDebuggerStatement$205();
            case 'do':
                return parseDoWhileStatement$192();
            case 'for':
                return parseForStatement$195();
            case 'function':
                return parseFunctionDeclaration$208();
            case 'if':
                return parseIfStatement$191();
            case 'return':
                return parseReturnStatement$198();
            case 'switch':
                return parseSwitchStatement$201();
            case 'throw':
                return parseThrowStatement$202();
            case 'try':
                return parseTryStatement$204();
            case 'var':
                return parseVariableStatement$187();
            case 'while':
                return parseWhileStatement$193();
            case 'with':
                return parseWithStatement$199();
            default:
                break;
            }
        }
        expr$434 = parseExpression$181();
        // 12.12 Labelled Statements
        if (expr$434.type === Syntax$99.Identifier && match$146(':')) {
            lex$138();
            if (Object.prototype.hasOwnProperty.call(state$110.labelSet, expr$434.name)) {
                throwError$141({}, Messages$101.Redeclaration, 'Label', expr$434.name);
            }
            state$110.labelSet[expr$434.name] = true;
            labeledBody$435 = parseStatement$206();
            delete state$110.labelSet[expr$434.name];
            return {
                type: Syntax$99.LabeledStatement,
                label: expr$434,
                body: labeledBody$435
            };
        }
        consumeSemicolon$149();
        return {
            type: Syntax$99.ExpressionStatement,
            expression: expr$434
        };
    }
    // 13 Function Definition
    function parseFunctionSourceElements$207() {
        var sourceElement$436, sourceElements$437 = [], token$438, directive$439, firstRestricted$440, oldLabelSet$441, oldInIteration$442, oldInSwitch$443, oldInFunctionBody$444;
        expect$144('{');
        while (index$105 < length$108) {
            token$438 = lookahead$139().token;
            if (token$438.type !== Token$97.StringLiteral) {
                break;
            }
            sourceElement$436 = parseSourceElement$210();
            sourceElements$437.push(sourceElement$436);
            if (sourceElement$436.expression.type !== Syntax$99.Literal) {
                // this is not directive
                break;
            }
            directive$439 = sliceSource$115(token$438.range[0] + 1, token$438.range[1] - 1);
            if (directive$439 === 'use strict') {
                strict$104 = true;
                if (firstRestricted$440) {
                    throwError$141(firstRestricted$440, Messages$101.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$440 && token$438.octal) {
                    firstRestricted$440 = token$438;
                }
            }
        }
        oldLabelSet$441 = state$110.labelSet;
        oldInIteration$442 = state$110.inIteration;
        oldInSwitch$443 = state$110.inSwitch;
        oldInFunctionBody$444 = state$110.inFunctionBody;
        state$110.labelSet = {};
        state$110.inIteration = false;
        state$110.inSwitch = false;
        state$110.inFunctionBody = true;
        while (index$105 < length$108) {
            if (match$146('}')) {
                break;
            }
            sourceElement$436 = parseSourceElement$210();
            if (typeof sourceElement$436 === 'undefined') {
                break;
            }
            sourceElements$437.push(sourceElement$436);
        }
        expect$144('}');
        state$110.labelSet = oldLabelSet$441;
        state$110.inIteration = oldInIteration$442;
        state$110.inSwitch = oldInSwitch$443;
        state$110.inFunctionBody = oldInFunctionBody$444;
        return {
            type: Syntax$99.BlockStatement,
            body: sourceElements$437
        };
    }
    function parseFunctionDeclaration$208() {
        var id$445, param$446, params$447 = [], body$448, token$449, firstRestricted$450, message$451, previousStrict$452, paramSet$453;
        expectKeyword$145('function');
        token$449 = lookahead$139().token;
        id$445 = parseVariableIdentifier$184();
        if (strict$104) {
            if (isRestrictedWord$125(token$449.value)) {
                throwError$141(token$449, Messages$101.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$125(token$449.value)) {
                firstRestricted$450 = token$449;
                message$451 = Messages$101.StrictFunctionName;
            } else if (isStrictModeReservedWord$124(token$449.value)) {
                firstRestricted$450 = token$449;
                message$451 = Messages$101.StrictReservedWord;
            }
        }
        expect$144('(');
        if (!match$146(')')) {
            paramSet$453 = {};
            while (index$105 < length$108) {
                token$449 = lookahead$139().token;
                param$446 = parseVariableIdentifier$184();
                if (strict$104) {
                    if (isRestrictedWord$125(token$449.value)) {
                        throwError$141(token$449, Messages$101.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$453, token$449.value)) {
                        throwError$141(token$449, Messages$101.StrictParamDupe);
                    }
                } else if (!firstRestricted$450) {
                    if (isRestrictedWord$125(token$449.value)) {
                        firstRestricted$450 = token$449;
                        message$451 = Messages$101.StrictParamName;
                    } else if (isStrictModeReservedWord$124(token$449.value)) {
                        firstRestricted$450 = token$449;
                        message$451 = Messages$101.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$453, token$449.value)) {
                        firstRestricted$450 = token$449;
                        message$451 = Messages$101.StrictParamDupe;
                    }
                }
                params$447.push(param$446);
                paramSet$453[param$446.name] = true;
                if (match$146(')')) {
                    break;
                }
                expect$144(',');
            }
        }
        expect$144(')');
        previousStrict$452 = strict$104;
        body$448 = parseFunctionSourceElements$207();
        if (strict$104 && firstRestricted$450) {
            throwError$141(firstRestricted$450, message$451);
        }
        strict$104 = previousStrict$452;
        return {
            type: Syntax$99.FunctionDeclaration,
            id: id$445,
            params: params$447,
            body: body$448
        };
    }
    function parseFunctionExpression$209() {
        var token$454, id$455 = null, firstRestricted$456, message$457, param$458, params$459 = [], body$460, previousStrict$461, paramSet$462;
        expectKeyword$145('function');
        if (!match$146('(')) {
            token$454 = lookahead$139().token;
            id$455 = parseVariableIdentifier$184();
            if (strict$104) {
                if (isRestrictedWord$125(token$454.value)) {
                    throwError$141(token$454, Messages$101.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$125(token$454.value)) {
                    firstRestricted$456 = token$454;
                    message$457 = Messages$101.StrictFunctionName;
                } else if (isStrictModeReservedWord$124(token$454.value)) {
                    firstRestricted$456 = token$454;
                    message$457 = Messages$101.StrictReservedWord;
                }
            }
        }
        expect$144('(');
        if (!match$146(')')) {
            paramSet$462 = {};
            while (index$105 < length$108) {
                token$454 = lookahead$139().token;
                param$458 = parseVariableIdentifier$184();
                if (strict$104) {
                    if (isRestrictedWord$125(token$454.value)) {
                        throwError$141(token$454, Messages$101.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$462, token$454.value)) {
                        throwError$141(token$454, Messages$101.StrictParamDupe);
                    }
                } else if (!firstRestricted$456) {
                    if (isRestrictedWord$125(token$454.value)) {
                        firstRestricted$456 = token$454;
                        message$457 = Messages$101.StrictParamName;
                    } else if (isStrictModeReservedWord$124(token$454.value)) {
                        firstRestricted$456 = token$454;
                        message$457 = Messages$101.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$462, token$454.value)) {
                        firstRestricted$456 = token$454;
                        message$457 = Messages$101.StrictParamDupe;
                    }
                }
                params$459.push(param$458);
                paramSet$462[param$458.name] = true;
                if (match$146(')')) {
                    break;
                }
                expect$144(',');
            }
        }
        expect$144(')');
        previousStrict$461 = strict$104;
        body$460 = parseFunctionSourceElements$207();
        if (strict$104 && firstRestricted$456) {
            throwError$141(firstRestricted$456, message$457);
        }
        strict$104 = previousStrict$461;
        return {
            type: Syntax$99.FunctionExpression,
            id: id$455,
            params: params$459,
            body: body$460
        };
    }
    // 14 Program
    function parseSourceElement$210() {
        var token$463 = lookahead$139().token;
        if (token$463.type === Token$97.Keyword) {
            switch (token$463.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$188(token$463.value);
            case 'function':
                return parseFunctionDeclaration$208();
            default:
                return parseStatement$206();
            }
        }
        if (token$463.type !== Token$97.EOF) {
            return parseStatement$206();
        }
    }
    function parseSourceElements$211() {
        var sourceElement$464, sourceElements$465 = [], token$466, directive$467, firstRestricted$468;
        while (index$105 < length$108) {
            token$466 = lookahead$139();
            if (token$466.type !== Token$97.StringLiteral) {
                break;
            }
            sourceElement$464 = parseSourceElement$210();
            sourceElements$465.push(sourceElement$464);
            if (sourceElement$464.expression.type !== Syntax$99.Literal) {
                // this is not directive
                break;
            }
            directive$467 = sliceSource$115(token$466.range[0] + 1, token$466.range[1] - 1);
            if (directive$467 === 'use strict') {
                strict$104 = true;
                if (firstRestricted$468) {
                    throwError$141(firstRestricted$468, Messages$101.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$468 && token$466.octal) {
                    firstRestricted$468 = token$466;
                }
            }
        }
        while (index$105 < length$108) {
            sourceElement$464 = parseSourceElement$210();
            if (typeof sourceElement$464 === 'undefined') {
                break;
            }
            sourceElements$465.push(sourceElement$464);
        }
        return sourceElements$465;
    }
    function parseProgram$212() {
        var program$469;
        strict$104 = false;
        program$469 = {
            type: Syntax$99.Program,
            body: parseSourceElements$211()
        };
        return program$469;
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$213(start$470, end$471, type$472, value$473) {
        assert$113(typeof start$470 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$112.comments.length > 0) {
            if (extra$112.comments[extra$112.comments.length - 1].range[1] > start$470) {
                return;
            }
        }
        extra$112.comments.push({
            range: [
                start$470,
                end$471
            ],
            type: type$472,
            value: value$473
        });
    }
    function scanComment$214() {
        var comment$474, ch$475, start$476, blockComment$477, lineComment$478;
        comment$474 = '';
        blockComment$477 = false;
        lineComment$478 = false;
        while (index$105 < length$108) {
            ch$475 = source$103[index$105];
            if (lineComment$478) {
                ch$475 = nextChar$127();
                if (index$105 >= length$108) {
                    lineComment$478 = false;
                    comment$474 += ch$475;
                    addComment$213(start$476, index$105, 'Line', comment$474);
                } else if (isLineTerminator$120(ch$475)) {
                    lineComment$478 = false;
                    addComment$213(start$476, index$105, 'Line', comment$474);
                    if (ch$475 === '\r' && source$103[index$105] === '\n') {
                        ++index$105;
                    }
                    ++lineNumber$106;
                    lineStart$107 = index$105;
                    comment$474 = '';
                } else {
                    comment$474 += ch$475;
                }
            } else if (blockComment$477) {
                if (isLineTerminator$120(ch$475)) {
                    if (ch$475 === '\r' && source$103[index$105 + 1] === '\n') {
                        ++index$105;
                        comment$474 += '\r\n';
                    } else {
                        comment$474 += ch$475;
                    }
                    ++lineNumber$106;
                    ++index$105;
                    lineStart$107 = index$105;
                    if (index$105 >= length$108) {
                        throwError$141({}, Messages$101.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$475 = nextChar$127();
                    if (index$105 >= length$108) {
                        throwError$141({}, Messages$101.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$474 += ch$475;
                    if (ch$475 === '*') {
                        ch$475 = source$103[index$105];
                        if (ch$475 === '/') {
                            comment$474 = comment$474.substr(0, comment$474.length - 1);
                            blockComment$477 = false;
                            ++index$105;
                            addComment$213(start$476, index$105, 'Block', comment$474);
                            comment$474 = '';
                        }
                    }
                }
            } else if (ch$475 === '/') {
                ch$475 = source$103[index$105 + 1];
                if (ch$475 === '/') {
                    start$476 = index$105;
                    index$105 += 2;
                    lineComment$478 = true;
                } else if (ch$475 === '*') {
                    start$476 = index$105;
                    index$105 += 2;
                    blockComment$477 = true;
                    if (index$105 >= length$108) {
                        throwError$141({}, Messages$101.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$119(ch$475)) {
                ++index$105;
            } else if (isLineTerminator$120(ch$475)) {
                ++index$105;
                if (ch$475 === '\r' && source$103[index$105] === '\n') {
                    ++index$105;
                }
                ++lineNumber$106;
                lineStart$107 = index$105;
            } else {
                break;
            }
        }
    }
    function collectToken$215() {
        var token$479 = extra$112.advance(), range$480, value$481;
        if (token$479.type !== Token$97.EOF) {
            range$480 = [
                token$479.range[0],
                token$479.range[1]
            ];
            value$481 = sliceSource$115(token$479.range[0], token$479.range[1]);
            extra$112.tokens.push({
                type: TokenName$98[token$479.type],
                value: value$481,
                lineNumber: lineNumber$106,
                lineStart: lineStart$107,
                range: range$480
            });
        }
        return token$479;
    }
    function collectRegex$216() {
        var pos$482, regex$483, token$484;
        skipComment$129();
        pos$482 = index$105;
        regex$483 = extra$112.scanRegExp();
        // Pop the previous token, which is likely '/' or '/='
        if (extra$112.tokens.length > 0) {
            token$484 = extra$112.tokens[extra$112.tokens.length - 1];
            if (token$484.range[0] === pos$482 && token$484.type === 'Punctuator') {
                if (token$484.value === '/' || token$484.value === '/=') {
                    extra$112.tokens.pop();
                }
            }
        }
        extra$112.tokens.push({
            type: 'RegularExpression',
            value: regex$483.literal,
            range: [
                pos$482,
                index$105
            ],
            lineStart: token$484.lineStart,
            lineNumber: token$484.lineNumber
        });
        return regex$483;
    }
    function createLiteral$217(token$485) {
        if (Array.isArray(token$485)) {
            return {
                type: Syntax$99.Literal,
                value: token$485
            };
        }
        return {
            type: Syntax$99.Literal,
            value: token$485.value,
            lineStart: token$485.lineStart,
            lineNumber: token$485.lineNumber
        };
    }
    function createRawLiteral$218(token$486) {
        return {
            type: Syntax$99.Literal,
            value: token$486.value,
            raw: sliceSource$115(token$486.range[0], token$486.range[1]),
            lineStart: token$486.lineStart,
            lineNumber: token$486.lineNumber
        };
    }
    function wrapTrackingFunction$219(range$487, loc$488) {
        return function (parseFunction$489) {
            function isBinary$490(node$492) {
                return node$492.type === Syntax$99.LogicalExpression || node$492.type === Syntax$99.BinaryExpression;
            }
            function visit$491(node$493) {
                if (isBinary$490(node$493.left)) {
                    visit$491(node$493.left);
                }
                if (isBinary$490(node$493.right)) {
                    visit$491(node$493.right);
                }
                if (range$487 && typeof node$493.range === 'undefined') {
                    node$493.range = [
                        node$493.left.range[0],
                        node$493.right.range[1]
                    ];
                }
                if (loc$488 && typeof node$493.loc === 'undefined') {
                    node$493.loc = {
                        start: node$493.left.loc.start,
                        end: node$493.right.loc.end
                    };
                }
            }
            return function () {
                var node$494, rangeInfo$495, locInfo$496;
                // skipComment();
                var curr$497 = tokenStream$111[index$105].token;
                rangeInfo$495 = [
                    curr$497.range[0],
                    0
                ];
                locInfo$496 = {
                    start: {
                        line: curr$497.sm_lineNumber,
                        column: curr$497.sm_lineStart
                    }
                };
                node$494 = parseFunction$489.apply(null, arguments);
                if (typeof node$494 !== 'undefined') {
                    var last$498 = tokenStream$111[index$105].token;
                    if (range$487) {
                        rangeInfo$495[1] = last$498.range[1];
                        node$494.range = rangeInfo$495;
                    }
                    if (loc$488) {
                        locInfo$496.end = {
                            line: last$498.sm_lineNumber,
                            column: last$498.sm_lineStart
                        };
                        node$494.loc = locInfo$496;
                    }
                    if (isBinary$490(node$494)) {
                        visit$491(node$494);
                    }
                    if (node$494.type === Syntax$99.MemberExpression) {
                        if (typeof node$494.object.range !== 'undefined') {
                            node$494.range[0] = node$494.object.range[0];
                        }
                        if (typeof node$494.object.loc !== 'undefined') {
                            node$494.loc.start = node$494.object.loc.start;
                        }
                    }
                    if (node$494.type === Syntax$99.CallExpression) {
                        if (typeof node$494.callee.range !== 'undefined') {
                            node$494.range[0] = node$494.callee.range[0];
                        }
                        if (typeof node$494.callee.loc !== 'undefined') {
                            node$494.loc.start = node$494.callee.loc.start;
                        }
                    }
                    return node$494;
                }
            };
        };
    }
    function patch$220() {
        var wrapTracking$499;
        if (extra$112.comments) {
            extra$112.skipComment = skipComment$129;
            skipComment$129 = scanComment$214;
        }
        if (extra$112.raw) {
            extra$112.createLiteral = createLiteral$217;
            createLiteral$217 = createRawLiteral$218;
        }
        if (extra$112.range || extra$112.loc) {
            wrapTracking$499 = wrapTrackingFunction$219(extra$112.range, extra$112.loc);
            extra$112.parseAdditiveExpression = parseAdditiveExpression$170;
            extra$112.parseAssignmentExpression = parseAssignmentExpression$180;
            extra$112.parseBitwiseANDExpression = parseBitwiseANDExpression$174;
            extra$112.parseBitwiseORExpression = parseBitwiseORExpression$176;
            extra$112.parseBitwiseXORExpression = parseBitwiseXORExpression$175;
            extra$112.parseBlock = parseBlock$183;
            extra$112.parseFunctionSourceElements = parseFunctionSourceElements$207;
            extra$112.parseCallMember = parseCallMember$161;
            extra$112.parseCatchClause = parseCatchClause$203;
            extra$112.parseComputedMember = parseComputedMember$160;
            extra$112.parseConditionalExpression = parseConditionalExpression$179;
            extra$112.parseConstLetDeclaration = parseConstLetDeclaration$188;
            extra$112.parseEqualityExpression = parseEqualityExpression$173;
            extra$112.parseExpression = parseExpression$181;
            extra$112.parseForVariableDeclaration = parseForVariableDeclaration$194;
            extra$112.parseFunctionDeclaration = parseFunctionDeclaration$208;
            extra$112.parseFunctionExpression = parseFunctionExpression$209;
            extra$112.parseLogicalANDExpression = parseLogicalANDExpression$177;
            extra$112.parseLogicalORExpression = parseLogicalORExpression$178;
            extra$112.parseMultiplicativeExpression = parseMultiplicativeExpression$169;
            extra$112.parseNewExpression = parseNewExpression$162;
            extra$112.parseNonComputedMember = parseNonComputedMember$159;
            extra$112.parseNonComputedProperty = parseNonComputedProperty$158;
            extra$112.parseObjectProperty = parseObjectProperty$154;
            extra$112.parseObjectPropertyKey = parseObjectPropertyKey$153;
            extra$112.parsePostfixExpression = parsePostfixExpression$167;
            extra$112.parsePrimaryExpression = parsePrimaryExpression$156;
            extra$112.parseProgram = parseProgram$212;
            extra$112.parsePropertyFunction = parsePropertyFunction$152;
            extra$112.parseRelationalExpression = parseRelationalExpression$172;
            extra$112.parseStatement = parseStatement$206;
            extra$112.parseShiftExpression = parseShiftExpression$171;
            extra$112.parseSwitchCase = parseSwitchCase$200;
            extra$112.parseUnaryExpression = parseUnaryExpression$168;
            extra$112.parseVariableDeclaration = parseVariableDeclaration$185;
            extra$112.parseVariableIdentifier = parseVariableIdentifier$184;
            parseAdditiveExpression$170 = wrapTracking$499(extra$112.parseAdditiveExpression);
            parseAssignmentExpression$180 = wrapTracking$499(extra$112.parseAssignmentExpression);
            parseBitwiseANDExpression$174 = wrapTracking$499(extra$112.parseBitwiseANDExpression);
            parseBitwiseORExpression$176 = wrapTracking$499(extra$112.parseBitwiseORExpression);
            parseBitwiseXORExpression$175 = wrapTracking$499(extra$112.parseBitwiseXORExpression);
            parseBlock$183 = wrapTracking$499(extra$112.parseBlock);
            parseFunctionSourceElements$207 = wrapTracking$499(extra$112.parseFunctionSourceElements);
            parseCallMember$161 = wrapTracking$499(extra$112.parseCallMember);
            parseCatchClause$203 = wrapTracking$499(extra$112.parseCatchClause);
            parseComputedMember$160 = wrapTracking$499(extra$112.parseComputedMember);
            parseConditionalExpression$179 = wrapTracking$499(extra$112.parseConditionalExpression);
            parseConstLetDeclaration$188 = wrapTracking$499(extra$112.parseConstLetDeclaration);
            parseEqualityExpression$173 = wrapTracking$499(extra$112.parseEqualityExpression);
            parseExpression$181 = wrapTracking$499(extra$112.parseExpression);
            parseForVariableDeclaration$194 = wrapTracking$499(extra$112.parseForVariableDeclaration);
            parseFunctionDeclaration$208 = wrapTracking$499(extra$112.parseFunctionDeclaration);
            parseFunctionExpression$209 = wrapTracking$499(extra$112.parseFunctionExpression);
            parseLogicalANDExpression$177 = wrapTracking$499(extra$112.parseLogicalANDExpression);
            parseLogicalORExpression$178 = wrapTracking$499(extra$112.parseLogicalORExpression);
            parseMultiplicativeExpression$169 = wrapTracking$499(extra$112.parseMultiplicativeExpression);
            parseNewExpression$162 = wrapTracking$499(extra$112.parseNewExpression);
            parseNonComputedMember$159 = wrapTracking$499(extra$112.parseNonComputedMember);
            parseNonComputedProperty$158 = wrapTracking$499(extra$112.parseNonComputedProperty);
            parseObjectProperty$154 = wrapTracking$499(extra$112.parseObjectProperty);
            parseObjectPropertyKey$153 = wrapTracking$499(extra$112.parseObjectPropertyKey);
            parsePostfixExpression$167 = wrapTracking$499(extra$112.parsePostfixExpression);
            parsePrimaryExpression$156 = wrapTracking$499(extra$112.parsePrimaryExpression);
            parseProgram$212 = wrapTracking$499(extra$112.parseProgram);
            parsePropertyFunction$152 = wrapTracking$499(extra$112.parsePropertyFunction);
            parseRelationalExpression$172 = wrapTracking$499(extra$112.parseRelationalExpression);
            parseStatement$206 = wrapTracking$499(extra$112.parseStatement);
            parseShiftExpression$171 = wrapTracking$499(extra$112.parseShiftExpression);
            parseSwitchCase$200 = wrapTracking$499(extra$112.parseSwitchCase);
            parseUnaryExpression$168 = wrapTracking$499(extra$112.parseUnaryExpression);
            parseVariableDeclaration$185 = wrapTracking$499(extra$112.parseVariableDeclaration);
            parseVariableIdentifier$184 = wrapTracking$499(extra$112.parseVariableIdentifier);
        }
        if (typeof extra$112.tokens !== 'undefined') {
            extra$112.advance = advance$137;
            extra$112.scanRegExp = scanRegExp$135;
            advance$137 = collectToken$215;
            scanRegExp$135 = collectRegex$216;
        }
    }
    function unpatch$221() {
        if (typeof extra$112.skipComment === 'function') {
            skipComment$129 = extra$112.skipComment;
        }
        if (extra$112.raw) {
            createLiteral$217 = extra$112.createLiteral;
        }
        if (extra$112.range || extra$112.loc) {
            parseAdditiveExpression$170 = extra$112.parseAdditiveExpression;
            parseAssignmentExpression$180 = extra$112.parseAssignmentExpression;
            parseBitwiseANDExpression$174 = extra$112.parseBitwiseANDExpression;
            parseBitwiseORExpression$176 = extra$112.parseBitwiseORExpression;
            parseBitwiseXORExpression$175 = extra$112.parseBitwiseXORExpression;
            parseBlock$183 = extra$112.parseBlock;
            parseFunctionSourceElements$207 = extra$112.parseFunctionSourceElements;
            parseCallMember$161 = extra$112.parseCallMember;
            parseCatchClause$203 = extra$112.parseCatchClause;
            parseComputedMember$160 = extra$112.parseComputedMember;
            parseConditionalExpression$179 = extra$112.parseConditionalExpression;
            parseConstLetDeclaration$188 = extra$112.parseConstLetDeclaration;
            parseEqualityExpression$173 = extra$112.parseEqualityExpression;
            parseExpression$181 = extra$112.parseExpression;
            parseForVariableDeclaration$194 = extra$112.parseForVariableDeclaration;
            parseFunctionDeclaration$208 = extra$112.parseFunctionDeclaration;
            parseFunctionExpression$209 = extra$112.parseFunctionExpression;
            parseLogicalANDExpression$177 = extra$112.parseLogicalANDExpression;
            parseLogicalORExpression$178 = extra$112.parseLogicalORExpression;
            parseMultiplicativeExpression$169 = extra$112.parseMultiplicativeExpression;
            parseNewExpression$162 = extra$112.parseNewExpression;
            parseNonComputedMember$159 = extra$112.parseNonComputedMember;
            parseNonComputedProperty$158 = extra$112.parseNonComputedProperty;
            parseObjectProperty$154 = extra$112.parseObjectProperty;
            parseObjectPropertyKey$153 = extra$112.parseObjectPropertyKey;
            parsePrimaryExpression$156 = extra$112.parsePrimaryExpression;
            parsePostfixExpression$167 = extra$112.parsePostfixExpression;
            parseProgram$212 = extra$112.parseProgram;
            parsePropertyFunction$152 = extra$112.parsePropertyFunction;
            parseRelationalExpression$172 = extra$112.parseRelationalExpression;
            parseStatement$206 = extra$112.parseStatement;
            parseShiftExpression$171 = extra$112.parseShiftExpression;
            parseSwitchCase$200 = extra$112.parseSwitchCase;
            parseUnaryExpression$168 = extra$112.parseUnaryExpression;
            parseVariableDeclaration$185 = extra$112.parseVariableDeclaration;
            parseVariableIdentifier$184 = extra$112.parseVariableIdentifier;
        }
        if (typeof extra$112.scanRegExp === 'function') {
            advance$137 = extra$112.advance;
            scanRegExp$135 = extra$112.scanRegExp;
        }
    }
    function stringToArray$222(str$500) {
        var length$501 = str$500.length, result$502 = [], i$503;
        for (i$503 = 0; i$503 < length$501; ++i$503) {
            result$502[i$503] = str$500.charAt(i$503);
        }
        return result$502;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$223(toks$504, start$505, inExprDelim$506, parentIsBlock$507) {
        var assignOps$508 = [
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
        var binaryOps$509 = [
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
        var unaryOps$510 = [
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
        function back$511(n$512) {
            var idx$513 = toks$504.length - n$512 > 0 ? toks$504.length - n$512 : 0;
            return toks$504[idx$513];
        }
        if (inExprDelim$506 && toks$504.length - (start$505 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$511(start$505 + 2).value === ':' && parentIsBlock$507) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$114(back$511(start$505 + 2).value, unaryOps$510.concat(binaryOps$509).concat(assignOps$508))) {
            // ... + {...}
            return false;
        } else if (back$511(start$505 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$514 = typeof back$511(start$505 + 1).startLineNumber !== 'undefined' ? back$511(start$505 + 1).startLineNumber : back$511(start$505 + 1).lineNumber;
            if (back$511(start$505 + 2).lineNumber !== currLineNumber$514) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$114(back$511(start$505 + 2).value, [
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
    function readToken$224(toks$515, inExprDelim$516, parentIsBlock$517) {
        var delimiters$518 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$519 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$520 = toks$515.length - 1;
        function back$521(n$522) {
            var idx$523 = toks$515.length - n$522 > 0 ? toks$515.length - n$522 : 0;
            return toks$515[idx$523];
        }
        skipComment$129();
        if (isIn$114(getChar$128(), delimiters$518)) {
            return readDelim$225(toks$515, inExprDelim$516, parentIsBlock$517);
        }
        if (getChar$128() === '/') {
            var prev$524 = back$521(1);
            if (prev$524) {
                if (prev$524.value === '()') {
                    if (isIn$114(back$521(2).value, parenIdents$519)) {
                        // ... if (...) / ...
                        return scanRegExp$135();
                    }
                    // ... (...) / ...
                    return advance$137();
                }
                if (prev$524.value === '{}') {
                    if (blockAllowed$223(toks$515, 0, inExprDelim$516, parentIsBlock$517)) {
                        if (back$521(2).value === '()') {
                            // named function
                            if (back$521(4).value === 'function') {
                                if (!blockAllowed$223(toks$515, 3, inExprDelim$516, parentIsBlock$517)) {
                                    // new function foo (...) {...} / ...
                                    return advance$137();
                                }
                                if (toks$515.length - 5 <= 0 && inExprDelim$516) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return advance$137();
                                }
                            }
                            // unnamed function
                            if (back$521(3).value === 'function') {
                                if (!blockAllowed$223(toks$515, 2, inExprDelim$516, parentIsBlock$517)) {
                                    // new function (...) {...} / ...
                                    return advance$137();
                                }
                                if (toks$515.length - 4 <= 0 && inExprDelim$516) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return advance$137();
                                }
                            }
                        }
                        // ...; {...} /...
                        return scanRegExp$135();
                    } else {
                        // ... + {...} / ...
                        return advance$137();
                    }
                }
                if (prev$524.type === Token$97.Punctuator) {
                    // ... + /...
                    return scanRegExp$135();
                }
                if (isKeyword$126(prev$524.value)) {
                    // typeof /...
                    return scanRegExp$135();
                }
                return advance$137();
            }
            return scanRegExp$135();
        }
        return advance$137();
    }
    function readDelim$225(toks$525, inExprDelim$526, parentIsBlock$527) {
        var startDelim$528 = advance$137(), matchDelim$529 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$530 = [];
        var delimiters$531 = [
                '(',
                '{',
                '['
            ];
        assert$113(delimiters$531.indexOf(startDelim$528.value) !== -1, 'Need to begin at the delimiter');
        var token$532 = startDelim$528;
        var startLineNumber$533 = token$532.lineNumber;
        var startLineStart$534 = token$532.lineStart;
        var startRange$535 = token$532.range;
        var delimToken$536 = {};
        delimToken$536.type = Token$97.Delimiter;
        delimToken$536.value = startDelim$528.value + matchDelim$529[startDelim$528.value];
        delimToken$536.startLineNumber = startLineNumber$533;
        delimToken$536.startLineStart = startLineStart$534;
        delimToken$536.startRange = startRange$535;
        var delimIsBlock$537 = false;
        if (startDelim$528.value === '{') {
            delimIsBlock$537 = blockAllowed$223(toks$525.concat(delimToken$536), 0, inExprDelim$526, parentIsBlock$527);
        }
        while (index$105 <= length$108) {
            token$532 = readToken$224(inner$530, startDelim$528.value === '(' || startDelim$528.value === '[', delimIsBlock$537);
            if (token$532.type === Token$97.Punctuator && token$532.value === matchDelim$529[startDelim$528.value]) {
                break;
            } else if (token$532.type === Token$97.EOF) {
                throwError$141({}, Messages$101.UnexpectedEOS);
            } else {
                inner$530.push(token$532);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$105 >= length$108 && matchDelim$529[startDelim$528.value] !== source$103[length$108 - 1]) {
            throwError$141({}, Messages$101.UnexpectedEOS);
        }
        var endLineNumber$538 = token$532.lineNumber;
        var endLineStart$539 = token$532.lineStart;
        var endRange$540 = token$532.range;
        delimToken$536.inner = inner$530;
        delimToken$536.endLineNumber = endLineNumber$538;
        delimToken$536.endLineStart = endLineStart$539;
        delimToken$536.endRange = endRange$540;
        return delimToken$536;
    }
    ;
    // (Str) -> [...CSyntax]
    function read$226(code$541) {
        var token$542, tokenTree$543 = [];
        extra$112 = {};
        extra$112.comments = [];
        patch$220();
        source$103 = code$541;
        index$105 = 0;
        lineNumber$106 = source$103.length > 0 ? 1 : 0;
        lineStart$107 = 0;
        length$108 = source$103.length;
        buffer$109 = null;
        state$110 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$105 < length$108) {
            tokenTree$543.push(readToken$224(tokenTree$543, false, false));
        }
        var last$544 = tokenTree$543[tokenTree$543.length - 1];
        if (last$544 && last$544.type !== Token$97.EOF) {
            tokenTree$543.push({
                type: Token$97.EOF,
                value: '',
                lineNumber: last$544.lineNumber,
                lineStart: last$544.lineStart,
                range: [
                    index$105,
                    index$105
                ]
            });
        }
        return [
            expander$96.tokensToSyntax(tokenTree$543),
            extra$112.comments
        ];
    }
    // (SyntaxObject, Str, {}) -> SyntaxObject
    function parse$227(code$545, comments$546) {
        var program$547, toString$548;
        tokenStream$111 = code$545;
        index$105 = 0;
        length$108 = tokenStream$111.length;
        buffer$109 = null;
        state$110 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$112 = {
            range: true,
            loc: true
        };
        patch$220();
        try {
            program$547 = parseProgram$212();
            program$547.comments = comments$546;
            program$547.tokens = expander$96.syntaxToTokens(code$545);
        } catch (e$549) {
            throw e$549;
        } finally {
            unpatch$221();
            extra$112 = {};
        }
        return program$547;
    }
    exports$95.parse = parse$227;
    exports$95.read = read$226;
    exports$95.Token = Token$97;
    exports$95.assert = assert$113;
    // Deep copy.
    exports$95.Syntax = function () {
        var name$550, types$551 = {};
        if (typeof Object.create === 'function') {
            types$551 = Object.create(null);
        }
        for (name$550 in Syntax$99) {
            if (Syntax$99.hasOwnProperty(name$550)) {
                types$551[name$550] = Syntax$99[name$550];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$551);
        }
        return types$551;
    }();
}));