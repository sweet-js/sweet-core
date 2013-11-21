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
(function (root$683, factory$684) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$684(exports, require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'expander'
        ], factory$684);
    }
}(this, function (exports$685, expander$686) {
    'use strict';
    var Token$687, TokenName$688, Syntax$689, PropertyKind$690, Messages$691, Regex$692, source$693, strict$694, index$695, lineNumber$696, lineStart$697, length$698, buffer$699, state$700, tokenStream$701, extra$702;
    Token$687 = {
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
    TokenName$688 = {};
    TokenName$688[Token$687.BooleanLiteral] = 'Boolean';
    TokenName$688[Token$687.EOF] = '<end>';
    TokenName$688[Token$687.Identifier] = 'Identifier';
    TokenName$688[Token$687.Keyword] = 'Keyword';
    TokenName$688[Token$687.NullLiteral] = 'Null';
    TokenName$688[Token$687.NumericLiteral] = 'Numeric';
    TokenName$688[Token$687.Punctuator] = 'Punctuator';
    TokenName$688[Token$687.StringLiteral] = 'String';
    TokenName$688[Token$687.Delimiter] = 'Delimiter';
    Syntax$689 = {
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
    PropertyKind$690 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    // Error messages should be identical to V8.
    Messages$691 = {
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
    Regex$692 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$703(condition$818, message$819) {
        if (!condition$818) {
            throw new Error('ASSERT: ' + message$819);
        }
    }
    function isIn$704(el$820, list$821) {
        return list$821.indexOf(el$820) !== -1;
    }
    function sliceSource$705(from$822, to$823) {
        return source$693.slice(from$822, to$823);
    }
    if (typeof 'esprima'[0] === 'undefined') {
        sliceSource$705 = function sliceArraySource$824(from$825, to$826) {
            return source$693.slice(from$825, to$826).join('');
        };
    }
    function isDecimalDigit$706(ch$827) {
        return '0123456789'.indexOf(ch$827) >= 0;
    }
    function isHexDigit$707(ch$828) {
        return '0123456789abcdefABCDEF'.indexOf(ch$828) >= 0;
    }
    function isOctalDigit$708(ch$829) {
        return '01234567'.indexOf(ch$829) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$709(ch$830) {
        return ch$830 === ' ' || ch$830 === '\t' || ch$830 === '\x0B' || ch$830 === '\f' || ch$830 === '\xa0' || ch$830.charCodeAt(0) >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(ch$830) >= 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$710(ch$831) {
        return ch$831 === '\n' || ch$831 === '\r' || ch$831 === '\u2028' || ch$831 === '\u2029';
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$711(ch$832) {
        return ch$832 === '$' || ch$832 === '_' || ch$832 === '\\' || ch$832 >= 'a' && ch$832 <= 'z' || ch$832 >= 'A' && ch$832 <= 'Z' || ch$832.charCodeAt(0) >= 128 && Regex$692.NonAsciiIdentifierStart.test(ch$832);
    }
    function isIdentifierPart$712(ch$833) {
        return ch$833 === '$' || ch$833 === '_' || ch$833 === '\\' || ch$833 >= 'a' && ch$833 <= 'z' || ch$833 >= 'A' && ch$833 <= 'Z' || ch$833 >= '0' && ch$833 <= '9' || ch$833.charCodeAt(0) >= 128 && Regex$692.NonAsciiIdentifierPart.test(ch$833);
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$713(id$834) {
        // we are allowing future reserved words so macros can be written for them
        return false;
    }
    function isStrictModeReservedWord$714(id$835) {
        switch (id$835) {
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
    function isRestrictedWord$715(id$836) {
        return id$836 === 'eval' || id$836 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$716(id$837) {
        var keyword$838 = false;
        switch (id$837.length) {
        case 2:
            keyword$838 = id$837 === 'if' || id$837 === 'in' || id$837 === 'do';
            break;
        case 3:
            keyword$838 = id$837 === 'var' || id$837 === 'for' || id$837 === 'new' || id$837 === 'try';
            break;
        case 4:
            keyword$838 = id$837 === 'this' || id$837 === 'else' || id$837 === 'case' || id$837 === 'void' || id$837 === 'with';
            break;
        case 5:
            keyword$838 = id$837 === 'while' || id$837 === 'break' || id$837 === 'catch' || id$837 === 'throw';
            break;
        case 6:
            keyword$838 = id$837 === 'return' || id$837 === 'typeof' || id$837 === 'delete' || id$837 === 'switch';
            break;
        case 7:
            keyword$838 = id$837 === 'default' || id$837 === 'finally';
            break;
        case 8:
            keyword$838 = id$837 === 'function' || id$837 === 'continue' || id$837 === 'debugger';
            break;
        case 10:
            keyword$838 = id$837 === 'instanceof';
            break;
        }
        if (keyword$838) {
            return true;
        }
        switch (id$837) {
        // Future reserved words.
        // 'const' is specialized as Keyword in V8.
        case 'const':
            return true;
        // For compatiblity to SpiderMonkey and ES.next
        case 'yield':
        case 'let':
            return true;
        }
        if (strict$694 && isStrictModeReservedWord$714(id$837)) {
            return true;
        }
        return isFutureReservedWord$713(id$837);
    }
    // Return the next character and move forward.
    function nextChar$717() {
        return source$693[index$695++];
    }
    function getChar$718() {
        return source$693[index$695];
    }
    // 7.4 Comments
    function skipComment$719() {
        var ch$839, blockComment$840, lineComment$841;
        blockComment$840 = false;
        lineComment$841 = false;
        while (index$695 < length$698) {
            ch$839 = source$693[index$695];
            if (lineComment$841) {
                ch$839 = nextChar$717();
                if (isLineTerminator$710(ch$839)) {
                    lineComment$841 = false;
                    if (ch$839 === '\r' && source$693[index$695] === '\n') {
                        ++index$695;
                    }
                    ++lineNumber$696;
                    lineStart$697 = index$695;
                }
            } else if (blockComment$840) {
                if (isLineTerminator$710(ch$839)) {
                    if (ch$839 === '\r' && source$693[index$695 + 1] === '\n') {
                        ++index$695;
                    }
                    ++lineNumber$696;
                    ++index$695;
                    lineStart$697 = index$695;
                    if (index$695 >= length$698) {
                        throwError$731({}, Messages$691.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$839 = nextChar$717();
                    if (index$695 >= length$698) {
                        throwError$731({}, Messages$691.UnexpectedToken, 'ILLEGAL');
                    }
                    if (ch$839 === '*') {
                        ch$839 = source$693[index$695];
                        if (ch$839 === '/') {
                            ++index$695;
                            blockComment$840 = false;
                        }
                    }
                }
            } else if (ch$839 === '/') {
                ch$839 = source$693[index$695 + 1];
                if (ch$839 === '/') {
                    index$695 += 2;
                    lineComment$841 = true;
                } else if (ch$839 === '*') {
                    index$695 += 2;
                    blockComment$840 = true;
                    if (index$695 >= length$698) {
                        throwError$731({}, Messages$691.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$709(ch$839)) {
                ++index$695;
            } else if (isLineTerminator$710(ch$839)) {
                ++index$695;
                if (ch$839 === '\r' && source$693[index$695] === '\n') {
                    ++index$695;
                }
                ++lineNumber$696;
                lineStart$697 = index$695;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$720(prefix$842) {
        var i$843, len$844, ch$845, code$846 = 0;
        len$844 = prefix$842 === 'u' ? 4 : 2;
        for (i$843 = 0; i$843 < len$844; ++i$843) {
            if (index$695 < length$698 && isHexDigit$707(source$693[index$695])) {
                ch$845 = nextChar$717();
                code$846 = code$846 * 16 + '0123456789abcdef'.indexOf(ch$845.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$846);
    }
    function scanIdentifier$721() {
        var ch$847, start$848, id$849, restore$850;
        ch$847 = source$693[index$695];
        if (!isIdentifierStart$711(ch$847)) {
            return;
        }
        start$848 = index$695;
        if (ch$847 === '\\') {
            ++index$695;
            if (source$693[index$695] !== 'u') {
                return;
            }
            ++index$695;
            restore$850 = index$695;
            ch$847 = scanHexEscape$720('u');
            if (ch$847) {
                if (ch$847 === '\\' || !isIdentifierStart$711(ch$847)) {
                    return;
                }
                id$849 = ch$847;
            } else {
                index$695 = restore$850;
                id$849 = 'u';
            }
        } else {
            id$849 = nextChar$717();
        }
        while (index$695 < length$698) {
            ch$847 = source$693[index$695];
            if (!isIdentifierPart$712(ch$847)) {
                break;
            }
            if (ch$847 === '\\') {
                ++index$695;
                if (source$693[index$695] !== 'u') {
                    return;
                }
                ++index$695;
                restore$850 = index$695;
                ch$847 = scanHexEscape$720('u');
                if (ch$847) {
                    if (ch$847 === '\\' || !isIdentifierPart$712(ch$847)) {
                        return;
                    }
                    id$849 += ch$847;
                } else {
                    index$695 = restore$850;
                    id$849 += 'u';
                }
            } else {
                id$849 += nextChar$717();
            }
        }
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$849.length === 1) {
            return {
                type: Token$687.Identifier,
                value: id$849,
                lineNumber: lineNumber$696,
                lineStart: lineStart$697,
                range: [
                    start$848,
                    index$695
                ]
            };
        }
        if (isKeyword$716(id$849)) {
            return {
                type: Token$687.Keyword,
                value: id$849,
                lineNumber: lineNumber$696,
                lineStart: lineStart$697,
                range: [
                    start$848,
                    index$695
                ]
            };
        }
        // 7.8.1 Null Literals
        if (id$849 === 'null') {
            return {
                type: Token$687.NullLiteral,
                value: id$849,
                lineNumber: lineNumber$696,
                lineStart: lineStart$697,
                range: [
                    start$848,
                    index$695
                ]
            };
        }
        // 7.8.2 Boolean Literals
        if (id$849 === 'true' || id$849 === 'false') {
            return {
                type: Token$687.BooleanLiteral,
                value: id$849,
                lineNumber: lineNumber$696,
                lineStart: lineStart$697,
                range: [
                    start$848,
                    index$695
                ]
            };
        }
        return {
            type: Token$687.Identifier,
            value: id$849,
            lineNumber: lineNumber$696,
            lineStart: lineStart$697,
            range: [
                start$848,
                index$695
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$722() {
        var start$851 = index$695, ch1$852 = source$693[index$695], ch2$853, ch3$854, ch4$855;
        // Check for most common single-character punctuators.
        if (ch1$852 === ';' || ch1$852 === '{' || ch1$852 === '}') {
            ++index$695;
            return {
                type: Token$687.Punctuator,
                value: ch1$852,
                lineNumber: lineNumber$696,
                lineStart: lineStart$697,
                range: [
                    start$851,
                    index$695
                ]
            };
        }
        if (ch1$852 === ',' || ch1$852 === '(' || ch1$852 === ')') {
            ++index$695;
            return {
                type: Token$687.Punctuator,
                value: ch1$852,
                lineNumber: lineNumber$696,
                lineStart: lineStart$697,
                range: [
                    start$851,
                    index$695
                ]
            };
        }
        if (ch1$852 === '#' || ch1$852 === '@') {
            ++index$695;
            return {
                type: Token$687.Punctuator,
                value: ch1$852,
                lineNumber: lineNumber$696,
                lineStart: lineStart$697,
                range: [
                    start$851,
                    index$695
                ]
            };
        }
        // Dot (.) can also start a floating-point number, hence the need
        // to check the next character.
        ch2$853 = source$693[index$695 + 1];
        if (ch1$852 === '.' && !isDecimalDigit$706(ch2$853)) {
            if (source$693[index$695 + 1] === '.' && source$693[index$695 + 2] === '.') {
                nextChar$717();
                nextChar$717();
                nextChar$717();
                return {
                    type: Token$687.Punctuator,
                    value: '...',
                    lineNumber: lineNumber$696,
                    lineStart: lineStart$697,
                    range: [
                        start$851,
                        index$695
                    ]
                };
            } else {
                return {
                    type: Token$687.Punctuator,
                    value: nextChar$717(),
                    lineNumber: lineNumber$696,
                    lineStart: lineStart$697,
                    range: [
                        start$851,
                        index$695
                    ]
                };
            }
        }
        // Peek more characters.
        ch3$854 = source$693[index$695 + 2];
        ch4$855 = source$693[index$695 + 3];
        // 4-character punctuator: >>>=
        if (ch1$852 === '>' && ch2$853 === '>' && ch3$854 === '>') {
            if (ch4$855 === '=') {
                index$695 += 4;
                return {
                    type: Token$687.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$696,
                    lineStart: lineStart$697,
                    range: [
                        start$851,
                        index$695
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$852 === '=' && ch2$853 === '=' && ch3$854 === '=') {
            index$695 += 3;
            return {
                type: Token$687.Punctuator,
                value: '===',
                lineNumber: lineNumber$696,
                lineStart: lineStart$697,
                range: [
                    start$851,
                    index$695
                ]
            };
        }
        if (ch1$852 === '!' && ch2$853 === '=' && ch3$854 === '=') {
            index$695 += 3;
            return {
                type: Token$687.Punctuator,
                value: '!==',
                lineNumber: lineNumber$696,
                lineStart: lineStart$697,
                range: [
                    start$851,
                    index$695
                ]
            };
        }
        if (ch1$852 === '>' && ch2$853 === '>' && ch3$854 === '>') {
            index$695 += 3;
            return {
                type: Token$687.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$696,
                lineStart: lineStart$697,
                range: [
                    start$851,
                    index$695
                ]
            };
        }
        if (ch1$852 === '<' && ch2$853 === '<' && ch3$854 === '=') {
            index$695 += 3;
            return {
                type: Token$687.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$696,
                lineStart: lineStart$697,
                range: [
                    start$851,
                    index$695
                ]
            };
        }
        if (ch1$852 === '>' && ch2$853 === '>' && ch3$854 === '=') {
            index$695 += 3;
            return {
                type: Token$687.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$696,
                lineStart: lineStart$697,
                range: [
                    start$851,
                    index$695
                ]
            };
        }
        // 2-character punctuators: <= >= == != ++ -- << >> && ||
        // += -= *= %= &= |= ^= /=
        if (ch2$853 === '=') {
            if ('<>=!+-*%&|^/'.indexOf(ch1$852) >= 0) {
                index$695 += 2;
                return {
                    type: Token$687.Punctuator,
                    value: ch1$852 + ch2$853,
                    lineNumber: lineNumber$696,
                    lineStart: lineStart$697,
                    range: [
                        start$851,
                        index$695
                    ]
                };
            }
        }
        if (ch1$852 === ch2$853 && '+-<>&|'.indexOf(ch1$852) >= 0) {
            if ('+-<>&|'.indexOf(ch2$853) >= 0) {
                index$695 += 2;
                return {
                    type: Token$687.Punctuator,
                    value: ch1$852 + ch2$853,
                    lineNumber: lineNumber$696,
                    lineStart: lineStart$697,
                    range: [
                        start$851,
                        index$695
                    ]
                };
            }
        }
        // The remaining 1-character punctuators.
        if ('[]<>+-*%&|^!~?:=/'.indexOf(ch1$852) >= 0) {
            return {
                type: Token$687.Punctuator,
                value: nextChar$717(),
                lineNumber: lineNumber$696,
                lineStart: lineStart$697,
                range: [
                    start$851,
                    index$695
                ]
            };
        }
    }
    // 7.8.3 Numeric Literals
    function scanNumericLiteral$723() {
        var number$856, start$857, ch$858;
        ch$858 = source$693[index$695];
        assert$703(isDecimalDigit$706(ch$858) || ch$858 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$857 = index$695;
        number$856 = '';
        if (ch$858 !== '.') {
            number$856 = nextChar$717();
            ch$858 = source$693[index$695];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            if (number$856 === '0') {
                if (ch$858 === 'x' || ch$858 === 'X') {
                    number$856 += nextChar$717();
                    while (index$695 < length$698) {
                        ch$858 = source$693[index$695];
                        if (!isHexDigit$707(ch$858)) {
                            break;
                        }
                        number$856 += nextChar$717();
                    }
                    if (number$856.length <= 2) {
                        // only 0x
                        throwError$731({}, Messages$691.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$695 < length$698) {
                        ch$858 = source$693[index$695];
                        if (isIdentifierStart$711(ch$858)) {
                            throwError$731({}, Messages$691.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$687.NumericLiteral,
                        value: parseInt(number$856, 16),
                        lineNumber: lineNumber$696,
                        lineStart: lineStart$697,
                        range: [
                            start$857,
                            index$695
                        ]
                    };
                } else if (isOctalDigit$708(ch$858)) {
                    number$856 += nextChar$717();
                    while (index$695 < length$698) {
                        ch$858 = source$693[index$695];
                        if (!isOctalDigit$708(ch$858)) {
                            break;
                        }
                        number$856 += nextChar$717();
                    }
                    if (index$695 < length$698) {
                        ch$858 = source$693[index$695];
                        if (isIdentifierStart$711(ch$858) || isDecimalDigit$706(ch$858)) {
                            throwError$731({}, Messages$691.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$687.NumericLiteral,
                        value: parseInt(number$856, 8),
                        octal: true,
                        lineNumber: lineNumber$696,
                        lineStart: lineStart$697,
                        range: [
                            start$857,
                            index$695
                        ]
                    };
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (isDecimalDigit$706(ch$858)) {
                    throwError$731({}, Messages$691.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (index$695 < length$698) {
                ch$858 = source$693[index$695];
                if (!isDecimalDigit$706(ch$858)) {
                    break;
                }
                number$856 += nextChar$717();
            }
        }
        if (ch$858 === '.') {
            number$856 += nextChar$717();
            while (index$695 < length$698) {
                ch$858 = source$693[index$695];
                if (!isDecimalDigit$706(ch$858)) {
                    break;
                }
                number$856 += nextChar$717();
            }
        }
        if (ch$858 === 'e' || ch$858 === 'E') {
            number$856 += nextChar$717();
            ch$858 = source$693[index$695];
            if (ch$858 === '+' || ch$858 === '-') {
                number$856 += nextChar$717();
            }
            ch$858 = source$693[index$695];
            if (isDecimalDigit$706(ch$858)) {
                number$856 += nextChar$717();
                while (index$695 < length$698) {
                    ch$858 = source$693[index$695];
                    if (!isDecimalDigit$706(ch$858)) {
                        break;
                    }
                    number$856 += nextChar$717();
                }
            } else {
                ch$858 = 'character ' + ch$858;
                if (index$695 >= length$698) {
                    ch$858 = '<end>';
                }
                throwError$731({}, Messages$691.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (index$695 < length$698) {
            ch$858 = source$693[index$695];
            if (isIdentifierStart$711(ch$858)) {
                throwError$731({}, Messages$691.UnexpectedToken, 'ILLEGAL');
            }
        }
        return {
            type: Token$687.NumericLiteral,
            value: parseFloat(number$856),
            lineNumber: lineNumber$696,
            lineStart: lineStart$697,
            range: [
                start$857,
                index$695
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$724() {
        var str$859 = '', quote$860, start$861, ch$862, code$863, unescaped$864, restore$865, octal$866 = false;
        quote$860 = source$693[index$695];
        assert$703(quote$860 === '\'' || quote$860 === '"', 'String literal must starts with a quote');
        start$861 = index$695;
        ++index$695;
        while (index$695 < length$698) {
            ch$862 = nextChar$717();
            if (ch$862 === quote$860) {
                quote$860 = '';
                break;
            } else if (ch$862 === '\\') {
                ch$862 = nextChar$717();
                if (!isLineTerminator$710(ch$862)) {
                    switch (ch$862) {
                    case 'n':
                        str$859 += '\n';
                        break;
                    case 'r':
                        str$859 += '\r';
                        break;
                    case 't':
                        str$859 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        restore$865 = index$695;
                        unescaped$864 = scanHexEscape$720(ch$862);
                        if (unescaped$864) {
                            str$859 += unescaped$864;
                        } else {
                            index$695 = restore$865;
                            str$859 += ch$862;
                        }
                        break;
                    case 'b':
                        str$859 += '\b';
                        break;
                    case 'f':
                        str$859 += '\f';
                        break;
                    case 'v':
                        str$859 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$708(ch$862)) {
                            code$863 = '01234567'.indexOf(ch$862);
                            // \0 is not octal escape sequence
                            if (code$863 !== 0) {
                                octal$866 = true;
                            }
                            if (index$695 < length$698 && isOctalDigit$708(source$693[index$695])) {
                                octal$866 = true;
                                code$863 = code$863 * 8 + '01234567'.indexOf(nextChar$717());
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$862) >= 0 && index$695 < length$698 && isOctalDigit$708(source$693[index$695])) {
                                    code$863 = code$863 * 8 + '01234567'.indexOf(nextChar$717());
                                }
                            }
                            str$859 += String.fromCharCode(code$863);
                        } else {
                            str$859 += ch$862;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$696;
                    if (ch$862 === '\r' && source$693[index$695] === '\n') {
                        ++index$695;
                    }
                }
            } else if (isLineTerminator$710(ch$862)) {
                break;
            } else {
                str$859 += ch$862;
            }
        }
        if (quote$860 !== '') {
            throwError$731({}, Messages$691.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$687.StringLiteral,
            value: str$859,
            octal: octal$866,
            lineNumber: lineNumber$696,
            lineStart: lineStart$697,
            range: [
                start$861,
                index$695
            ]
        };
    }
    function scanRegExp$725() {
        var str$867 = '', ch$868, start$869, pattern$870, flags$871, value$872, classMarker$873 = false, restore$874;
        buffer$699 = null;
        skipComment$719();
        start$869 = index$695;
        ch$868 = source$693[index$695];
        assert$703(ch$868 === '/', 'Regular expression literal must start with a slash');
        str$867 = nextChar$717();
        while (index$695 < length$698) {
            ch$868 = nextChar$717();
            str$867 += ch$868;
            if (classMarker$873) {
                if (ch$868 === ']') {
                    classMarker$873 = false;
                }
            } else {
                if (ch$868 === '\\') {
                    ch$868 = nextChar$717();
                    // ECMA-262 7.8.5
                    if (isLineTerminator$710(ch$868)) {
                        throwError$731({}, Messages$691.UnterminatedRegExp);
                    }
                    str$867 += ch$868;
                } else if (ch$868 === '/') {
                    break;
                } else if (ch$868 === '[') {
                    classMarker$873 = true;
                } else if (isLineTerminator$710(ch$868)) {
                    throwError$731({}, Messages$691.UnterminatedRegExp);
                }
            }
        }
        if (str$867.length === 1) {
            throwError$731({}, Messages$691.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$870 = str$867.substr(1, str$867.length - 2);
        flags$871 = '';
        while (index$695 < length$698) {
            ch$868 = source$693[index$695];
            if (!isIdentifierPart$712(ch$868)) {
                break;
            }
            ++index$695;
            if (ch$868 === '\\' && index$695 < length$698) {
                ch$868 = source$693[index$695];
                if (ch$868 === 'u') {
                    ++index$695;
                    restore$874 = index$695;
                    ch$868 = scanHexEscape$720('u');
                    if (ch$868) {
                        flags$871 += ch$868;
                        str$867 += '\\u';
                        for (; restore$874 < index$695; ++restore$874) {
                            str$867 += source$693[restore$874];
                        }
                    } else {
                        index$695 = restore$874;
                        flags$871 += 'u';
                        str$867 += '\\u';
                    }
                } else {
                    str$867 += '\\';
                }
            } else {
                flags$871 += ch$868;
                str$867 += ch$868;
            }
        }
        try {
            value$872 = new RegExp(pattern$870, flags$871);
        } catch (e$875) {
            throwError$731({}, Messages$691.InvalidRegExp);
        }
        return {
            type: Token$687.RegexLiteral,
            literal: str$867,
            value: value$872,
            lineNumber: lineNumber$696,
            lineStart: lineStart$697,
            range: [
                start$869,
                index$695
            ]
        };
    }
    function isIdentifierName$726(token$876) {
        return token$876.type === Token$687.Identifier || token$876.type === Token$687.Keyword || token$876.type === Token$687.BooleanLiteral || token$876.type === Token$687.NullLiteral;
    }
    // only used by the reader
    function advance$727() {
        var ch$877, token$878;
        skipComment$719();
        if (index$695 >= length$698) {
            return {
                type: Token$687.EOF,
                lineNumber: lineNumber$696,
                lineStart: lineStart$697,
                range: [
                    index$695,
                    index$695
                ]
            };
        }
        ch$877 = source$693[index$695];
        token$878 = scanPunctuator$722();
        if (typeof token$878 !== 'undefined') {
            return token$878;
        }
        if (ch$877 === '\'' || ch$877 === '"') {
            return scanStringLiteral$724();
        }
        if (ch$877 === '.' || isDecimalDigit$706(ch$877)) {
            return scanNumericLiteral$723();
        }
        token$878 = scanIdentifier$721();
        if (typeof token$878 !== 'undefined') {
            return token$878;
        }
        throwError$731({}, Messages$691.UnexpectedToken, 'ILLEGAL');
    }
    function lex$728() {
        var token$879;
        if (buffer$699) {
            token$879 = buffer$699;
            buffer$699 = null;
            index$695++;
            return token$879;
        }
        buffer$699 = null;
        return tokenStream$701[index$695++];
    }
    function lookahead$729() {
        var pos$880, line$881, start$882;
        if (buffer$699 !== null) {
            return buffer$699;
        }
        buffer$699 = tokenStream$701[index$695];
        return buffer$699;
    }
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$730() {
        var pos$883, line$884, start$885, found$886;
        found$886 = tokenStream$701[index$695 - 1].token.lineNumber !== tokenStream$701[index$695].token.lineNumber;
        return found$886;
    }
    // Throw an exception
    function throwError$731(token$887, messageFormat$888) {
        var error$889, args$890 = Array.prototype.slice.call(arguments, 2), msg$891 = messageFormat$888.replace(/%(\d)/g, function (whole$892, index$893) {
                return args$890[index$893] || '';
            });
        if (typeof token$887.lineNumber === 'number') {
            error$889 = new Error('Line ' + token$887.lineNumber + ': ' + msg$891);
            error$889.lineNumber = token$887.lineNumber;
            if (token$887.range && token$887.range.length > 0) {
                error$889.index = token$887.range[0];
                error$889.column = token$887.range[0] - lineStart$697 + 1;
            }
        } else {
            error$889 = new Error('Line ' + lineNumber$696 + ': ' + msg$891);
            error$889.index = index$695;
            error$889.lineNumber = lineNumber$696;
            error$889.column = index$695 - lineStart$697 + 1;
        }
        throw error$889;
    }
    function throwErrorTolerant$732() {
        var error$894;
        try {
            throwError$731.apply(null, arguments);
        } catch (e$895) {
            if (extra$702.errors) {
                extra$702.errors.push(e$895);
            } else {
                throw e$895;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$733(token$896) {
        var s$897;
        if (token$896.type === Token$687.EOF) {
            throwError$731(token$896, Messages$691.UnexpectedEOS);
        }
        if (token$896.type === Token$687.NumericLiteral) {
            throwError$731(token$896, Messages$691.UnexpectedNumber);
        }
        if (token$896.type === Token$687.StringLiteral) {
            throwError$731(token$896, Messages$691.UnexpectedString);
        }
        if (token$896.type === Token$687.Identifier) {
            console.log(token$896);
            throwError$731(token$896, Messages$691.UnexpectedIdentifier);
        }
        if (token$896.type === Token$687.Keyword) {
            if (isFutureReservedWord$713(token$896.value)) {
                throwError$731(token$896, Messages$691.UnexpectedReserved);
            } else if (strict$694 && isStrictModeReservedWord$714(token$896.value)) {
                throwError$731(token$896, Messages$691.StrictReservedWord);
            }
            throwError$731(token$896, Messages$691.UnexpectedToken, token$896.value);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$731(token$896, Messages$691.UnexpectedToken, token$896.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$734(value$898) {
        var token$899 = lex$728().token;
        if (token$899.type !== Token$687.Punctuator || token$899.value !== value$898) {
            throwUnexpected$733(token$899);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$735(keyword$900) {
        var token$901 = lex$728().token;
        if (token$901.type !== Token$687.Keyword || token$901.value !== keyword$900) {
            throwUnexpected$733(token$901);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$736(value$902) {
        var token$903 = lookahead$729().token;
        return token$903.type === Token$687.Punctuator && token$903.value === value$902;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$737(keyword$904) {
        var token$905 = lookahead$729().token;
        return token$905.type === Token$687.Keyword && token$905.value === keyword$904;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$738() {
        var token$906 = lookahead$729().token, op$907 = token$906.value;
        if (token$906.type !== Token$687.Punctuator) {
            return false;
        }
        return op$907 === '=' || op$907 === '*=' || op$907 === '/=' || op$907 === '%=' || op$907 === '+=' || op$907 === '-=' || op$907 === '<<=' || op$907 === '>>=' || op$907 === '>>>=' || op$907 === '&=' || op$907 === '^=' || op$907 === '|=';
    }
    function consumeSemicolon$739() {
        var token$908, line$909;
        if (tokenStream$701[index$695].token.value === ';') {
            lex$728().token;
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
        line$909 = tokenStream$701[index$695 - 1].token.lineNumber;
        token$908 = tokenStream$701[index$695].token;
        if (line$909 !== token$908.lineNumber) {
            return;
        }
        if (token$908.type !== Token$687.EOF && !match$736('}')) {
            throwUnexpected$733(token$908);
        }
        return;
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$740(expr$910) {
        return expr$910.type === Syntax$689.Identifier || expr$910.type === Syntax$689.MemberExpression;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$741() {
        var elements$911 = [], undef$912;
        expect$734('[');
        while (!match$736(']')) {
            if (match$736(',')) {
                lex$728().token;
                elements$911.push(undef$912);
            } else {
                elements$911.push(parseAssignmentExpression$770());
                if (!match$736(']')) {
                    expect$734(',');
                }
            }
        }
        expect$734(']');
        return {
            type: Syntax$689.ArrayExpression,
            elements: elements$911
        };
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$742(param$913, first$914) {
        var previousStrict$915, body$916;
        previousStrict$915 = strict$694;
        body$916 = parseFunctionSourceElements$797();
        if (first$914 && strict$694 && isRestrictedWord$715(param$913[0].name)) {
            throwError$731(first$914, Messages$691.StrictParamName);
        }
        strict$694 = previousStrict$915;
        return {
            type: Syntax$689.FunctionExpression,
            id: null,
            params: param$913,
            body: body$916
        };
    }
    function parseObjectPropertyKey$743() {
        var token$917 = lex$728().token;
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$917.type === Token$687.StringLiteral || token$917.type === Token$687.NumericLiteral) {
            if (strict$694 && token$917.octal) {
                throwError$731(token$917, Messages$691.StrictOctalLiteral);
            }
            return createLiteral$807(token$917);
        }
        return {
            type: Syntax$689.Identifier,
            name: token$917.value
        };
    }
    function parseObjectProperty$744() {
        var token$918, key$919, id$920, param$921;
        token$918 = lookahead$729().token;
        if (token$918.type === Token$687.Identifier) {
            id$920 = parseObjectPropertyKey$743();
            // Property Assignment: Getter and Setter.
            if (token$918.value === 'get' && !match$736(':')) {
                key$919 = parseObjectPropertyKey$743();
                expect$734('(');
                expect$734(')');
                return {
                    type: Syntax$689.Property,
                    key: key$919,
                    value: parsePropertyFunction$742([]),
                    kind: 'get'
                };
            } else if (token$918.value === 'set' && !match$736(':')) {
                key$919 = parseObjectPropertyKey$743();
                expect$734('(');
                token$918 = lookahead$729().token;
                if (token$918.type !== Token$687.Identifier) {
                    throwUnexpected$733(lex$728().token);
                }
                param$921 = [parseVariableIdentifier$774()];
                expect$734(')');
                return {
                    type: Syntax$689.Property,
                    key: key$919,
                    value: parsePropertyFunction$742(param$921, token$918),
                    kind: 'set'
                };
            } else {
                expect$734(':');
                return {
                    type: Syntax$689.Property,
                    key: id$920,
                    value: parseAssignmentExpression$770(),
                    kind: 'init'
                };
            }
        } else if (token$918.type === Token$687.EOF || token$918.type === Token$687.Punctuator) {
            throwUnexpected$733(token$918);
        } else {
            key$919 = parseObjectPropertyKey$743();
            expect$734(':');
            return {
                type: Syntax$689.Property,
                key: key$919,
                value: parseAssignmentExpression$770(),
                kind: 'init'
            };
        }
    }
    function parseObjectInitialiser$745() {
        var token$922, properties$923 = [], property$924, name$925, kind$926, map$927 = {}, toString$928 = String;
        expect$734('{');
        while (!match$736('}')) {
            property$924 = parseObjectProperty$744();
            if (property$924.key.type === Syntax$689.Identifier) {
                name$925 = property$924.key.name;
            } else {
                name$925 = toString$928(property$924.key.value);
            }
            kind$926 = property$924.kind === 'init' ? PropertyKind$690.Data : property$924.kind === 'get' ? PropertyKind$690.Get : PropertyKind$690.Set;
            if (Object.prototype.hasOwnProperty.call(map$927, name$925)) {
                if (map$927[name$925] === PropertyKind$690.Data) {
                    if (strict$694 && kind$926 === PropertyKind$690.Data) {
                        throwErrorTolerant$732({}, Messages$691.StrictDuplicateProperty);
                    } else if (kind$926 !== PropertyKind$690.Data) {
                        throwError$731({}, Messages$691.AccessorDataProperty);
                    }
                } else {
                    if (kind$926 === PropertyKind$690.Data) {
                        throwError$731({}, Messages$691.AccessorDataProperty);
                    } else if (map$927[name$925] & kind$926) {
                        throwError$731({}, Messages$691.AccessorGetSet);
                    }
                }
                map$927[name$925] |= kind$926;
            } else {
                map$927[name$925] = kind$926;
            }
            properties$923.push(property$924);
            if (!match$736('}')) {
                expect$734(',');
            }
        }
        expect$734('}');
        return {
            type: Syntax$689.ObjectExpression,
            properties: properties$923
        };
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$746() {
        var expr$929, token$930 = lookahead$729().token, type$931 = token$930.type;
        if (type$931 === Token$687.Identifier) {
            var name$932 = expander$686.resolve(lex$728());
            return {
                type: Syntax$689.Identifier,
                name: name$932
            };
        }
        if (type$931 === Token$687.StringLiteral || type$931 === Token$687.NumericLiteral) {
            if (strict$694 && token$930.octal) {
                throwErrorTolerant$732(token$930, Messages$691.StrictOctalLiteral);
            }
            return createLiteral$807(lex$728().token);
        }
        if (type$931 === Token$687.Keyword) {
            if (matchKeyword$737('this')) {
                lex$728().token;
                return { type: Syntax$689.ThisExpression };
            }
            if (matchKeyword$737('function')) {
                return parseFunctionExpression$799();
            }
        }
        if (type$931 === Token$687.BooleanLiteral) {
            lex$728();
            token$930.value = token$930.value === 'true';
            return createLiteral$807(token$930);
        }
        if (type$931 === Token$687.NullLiteral) {
            lex$728();
            token$930.value = null;
            return createLiteral$807(token$930);
        }
        if (match$736('[')) {
            return parseArrayInitialiser$741();
        }
        if (match$736('{')) {
            return parseObjectInitialiser$745();
        }
        if (match$736('(')) {
            lex$728();
            state$700.lastParenthesized = expr$929 = parseExpression$771();
            expect$734(')');
            return expr$929;
        }
        if (token$930.value instanceof RegExp) {
            return createLiteral$807(lex$728().token);
        }
        return throwUnexpected$733(lex$728().token);
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$747() {
        var args$933 = [];
        expect$734('(');
        if (!match$736(')')) {
            while (index$695 < length$698) {
                args$933.push(parseAssignmentExpression$770());
                if (match$736(')')) {
                    break;
                }
                expect$734(',');
            }
        }
        expect$734(')');
        return args$933;
    }
    function parseNonComputedProperty$748() {
        var token$934 = lex$728().token;
        if (!isIdentifierName$726(token$934)) {
            throwUnexpected$733(token$934);
        }
        return {
            type: Syntax$689.Identifier,
            name: token$934.value
        };
    }
    function parseNonComputedMember$749(object$935) {
        return {
            type: Syntax$689.MemberExpression,
            computed: false,
            object: object$935,
            property: parseNonComputedProperty$748()
        };
    }
    function parseComputedMember$750(object$936) {
        var property$937, expr$938;
        expect$734('[');
        property$937 = parseExpression$771();
        expr$938 = {
            type: Syntax$689.MemberExpression,
            computed: true,
            object: object$936,
            property: property$937
        };
        expect$734(']');
        return expr$938;
    }
    function parseCallMember$751(object$939) {
        return {
            type: Syntax$689.CallExpression,
            callee: object$939,
            'arguments': parseArguments$747()
        };
    }
    function parseNewExpression$752() {
        var expr$940;
        expectKeyword$735('new');
        expr$940 = {
            type: Syntax$689.NewExpression,
            callee: parseLeftHandSideExpression$756(),
            'arguments': []
        };
        if (match$736('(')) {
            expr$940['arguments'] = parseArguments$747();
        }
        return expr$940;
    }
    // sort of broken, only accepts literals
    // pretty sure the use of toString will bite me
    function toArrayNode$753(arr$941) {
        var els$942 = arr$941.map(function (el$943) {
                return {
                    type: 'Literal',
                    value: el$943,
                    raw: el$943.toString()
                };
            });
        return {
            type: 'ArrayExpression',
            elements: els$942
        };
    }
    function toObjectNode$754(obj$944) {
        // todo: hacky, fixup
        var props$945 = Object.keys(obj$944).map(function (key$946) {
                var raw$947 = obj$944[key$946];
                var value$948;
                if (Array.isArray(raw$947)) {
                    value$948 = toArrayNode$753(raw$947);
                } else {
                    value$948 = {
                        type: 'Literal',
                        value: obj$944[key$946],
                        raw: obj$944[key$946].toString()
                    };
                }
                return {
                    type: 'Property',
                    key: {
                        type: 'Identifier',
                        name: key$946
                    },
                    value: value$948,
                    kind: 'init'
                };
            });
        return {
            type: 'ObjectExpression',
            properties: props$945
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
    function parseLeftHandSideExpressionAllowCall$755() {
        var useNew$949, expr$950;
        useNew$949 = matchKeyword$737('new');
        expr$950 = useNew$949 ? parseNewExpression$752() : parsePrimaryExpression$746();
        // handle "syntax" primitive
        // todo: error handling
        // if(expr.name === "syntax") {
        //     return parseSyntaxObject();
        // }
        while (index$695 < length$698) {
            if (match$736('.')) {
                lex$728();
                expr$950 = parseNonComputedMember$749(expr$950);
            } else if (match$736('[')) {
                expr$950 = parseComputedMember$750(expr$950);
            } else if (match$736('(')) {
                expr$950 = parseCallMember$751(expr$950);
            } else {
                break;
            }
        }
        return expr$950;
    }
    function parseLeftHandSideExpression$756() {
        var useNew$951, expr$952;
        useNew$951 = matchKeyword$737('new');
        expr$952 = useNew$951 ? parseNewExpression$752() : parsePrimaryExpression$746();
        while (index$695 < length$698) {
            if (match$736('.')) {
                lex$728();
                expr$952 = parseNonComputedMember$749(expr$952);
            } else if (match$736('[')) {
                expr$952 = parseComputedMember$750(expr$952);
            } else {
                break;
            }
        }
        return expr$952;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$757() {
        var expr$953 = parseLeftHandSideExpressionAllowCall$755();
        if ((match$736('++') || match$736('--')) && !peekLineTerminator$730()) {
            // 11.3.1, 11.3.2
            if (strict$694 && expr$953.type === Syntax$689.Identifier && isRestrictedWord$715(expr$953.name)) {
                throwError$731({}, Messages$691.StrictLHSPostfix);
            }
            if (!isLeftHandSide$740(expr$953)) {
                throwError$731({}, Messages$691.InvalidLHSInAssignment);
            }
            expr$953 = {
                type: Syntax$689.UpdateExpression,
                operator: lex$728().token.value,
                argument: expr$953,
                prefix: false
            };
        }
        return expr$953;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$758() {
        var token$954, expr$955;
        if (match$736('++') || match$736('--')) {
            token$954 = lex$728().token;
            expr$955 = parseUnaryExpression$758();
            // 11.4.4, 11.4.5
            if (strict$694 && expr$955.type === Syntax$689.Identifier && isRestrictedWord$715(expr$955.name)) {
                throwError$731({}, Messages$691.StrictLHSPrefix);
            }
            if (!isLeftHandSide$740(expr$955)) {
                throwError$731({}, Messages$691.InvalidLHSInAssignment);
            }
            expr$955 = {
                type: Syntax$689.UpdateExpression,
                operator: token$954.value,
                argument: expr$955,
                prefix: true
            };
            return expr$955;
        }
        if (match$736('+') || match$736('-') || match$736('~') || match$736('!')) {
            expr$955 = {
                type: Syntax$689.UnaryExpression,
                operator: lex$728().token.value,
                argument: parseUnaryExpression$758()
            };
            return expr$955;
        }
        if (matchKeyword$737('delete') || matchKeyword$737('void') || matchKeyword$737('typeof')) {
            expr$955 = {
                type: Syntax$689.UnaryExpression,
                operator: lex$728().token.value,
                argument: parseUnaryExpression$758()
            };
            if (strict$694 && expr$955.operator === 'delete' && expr$955.argument.type === Syntax$689.Identifier) {
                throwErrorTolerant$732({}, Messages$691.StrictDelete);
            }
            return expr$955;
        }
        return parsePostfixExpression$757();
    }
    // 11.5 Multiplicative Operators
    function parseMultiplicativeExpression$759() {
        var expr$956 = parseUnaryExpression$758();
        while (match$736('*') || match$736('/') || match$736('%')) {
            expr$956 = {
                type: Syntax$689.BinaryExpression,
                operator: lex$728().token.value,
                left: expr$956,
                right: parseUnaryExpression$758()
            };
        }
        return expr$956;
    }
    // 11.6 Additive Operators
    function parseAdditiveExpression$760() {
        var expr$957 = parseMultiplicativeExpression$759();
        while (match$736('+') || match$736('-')) {
            expr$957 = {
                type: Syntax$689.BinaryExpression,
                operator: lex$728().token.value,
                left: expr$957,
                right: parseMultiplicativeExpression$759()
            };
        }
        return expr$957;
    }
    // 11.7 Bitwise Shift Operators
    function parseShiftExpression$761() {
        var expr$958 = parseAdditiveExpression$760();
        while (match$736('<<') || match$736('>>') || match$736('>>>')) {
            expr$958 = {
                type: Syntax$689.BinaryExpression,
                operator: lex$728().token.value,
                left: expr$958,
                right: parseAdditiveExpression$760()
            };
        }
        return expr$958;
    }
    // 11.8 Relational Operators
    function parseRelationalExpression$762() {
        var expr$959, previousAllowIn$960;
        previousAllowIn$960 = state$700.allowIn;
        state$700.allowIn = true;
        expr$959 = parseShiftExpression$761();
        while (match$736('<') || match$736('>') || match$736('<=') || match$736('>=') || previousAllowIn$960 && matchKeyword$737('in') || matchKeyword$737('instanceof')) {
            expr$959 = {
                type: Syntax$689.BinaryExpression,
                operator: lex$728().token.value,
                left: expr$959,
                right: parseRelationalExpression$762()
            };
        }
        state$700.allowIn = previousAllowIn$960;
        return expr$959;
    }
    // 11.9 Equality Operators
    function parseEqualityExpression$763() {
        var expr$961 = parseRelationalExpression$762();
        while (match$736('==') || match$736('!=') || match$736('===') || match$736('!==')) {
            expr$961 = {
                type: Syntax$689.BinaryExpression,
                operator: lex$728().token.value,
                left: expr$961,
                right: parseRelationalExpression$762()
            };
        }
        return expr$961;
    }
    // 11.10 Binary Bitwise Operators
    function parseBitwiseANDExpression$764() {
        var expr$962 = parseEqualityExpression$763();
        while (match$736('&')) {
            lex$728();
            expr$962 = {
                type: Syntax$689.BinaryExpression,
                operator: '&',
                left: expr$962,
                right: parseEqualityExpression$763()
            };
        }
        return expr$962;
    }
    function parseBitwiseXORExpression$765() {
        var expr$963 = parseBitwiseANDExpression$764();
        while (match$736('^')) {
            lex$728();
            expr$963 = {
                type: Syntax$689.BinaryExpression,
                operator: '^',
                left: expr$963,
                right: parseBitwiseANDExpression$764()
            };
        }
        return expr$963;
    }
    function parseBitwiseORExpression$766() {
        var expr$964 = parseBitwiseXORExpression$765();
        while (match$736('|')) {
            lex$728();
            expr$964 = {
                type: Syntax$689.BinaryExpression,
                operator: '|',
                left: expr$964,
                right: parseBitwiseXORExpression$765()
            };
        }
        return expr$964;
    }
    // 11.11 Binary Logical Operators
    function parseLogicalANDExpression$767() {
        var expr$965 = parseBitwiseORExpression$766();
        while (match$736('&&')) {
            lex$728();
            expr$965 = {
                type: Syntax$689.LogicalExpression,
                operator: '&&',
                left: expr$965,
                right: parseBitwiseORExpression$766()
            };
        }
        return expr$965;
    }
    function parseLogicalORExpression$768() {
        var expr$966 = parseLogicalANDExpression$767();
        while (match$736('||')) {
            lex$728();
            expr$966 = {
                type: Syntax$689.LogicalExpression,
                operator: '||',
                left: expr$966,
                right: parseLogicalANDExpression$767()
            };
        }
        return expr$966;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$769() {
        var expr$967, previousAllowIn$968, consequent$969;
        expr$967 = parseLogicalORExpression$768();
        if (match$736('?')) {
            lex$728();
            previousAllowIn$968 = state$700.allowIn;
            state$700.allowIn = true;
            consequent$969 = parseAssignmentExpression$770();
            state$700.allowIn = previousAllowIn$968;
            expect$734(':');
            expr$967 = {
                type: Syntax$689.ConditionalExpression,
                test: expr$967,
                consequent: consequent$969,
                alternate: parseAssignmentExpression$770()
            };
        }
        return expr$967;
    }
    // 11.13 Assignment Operators
    function parseAssignmentExpression$770() {
        var expr$970;
        expr$970 = parseConditionalExpression$769();
        if (matchAssign$738()) {
            // LeftHandSideExpression
            if (!isLeftHandSide$740(expr$970)) {
                throwError$731({}, Messages$691.InvalidLHSInAssignment);
            }
            // 11.13.1
            if (strict$694 && expr$970.type === Syntax$689.Identifier && isRestrictedWord$715(expr$970.name)) {
                throwError$731({}, Messages$691.StrictLHSAssignment);
            }
            expr$970 = {
                type: Syntax$689.AssignmentExpression,
                operator: lex$728().token.value,
                left: expr$970,
                right: parseAssignmentExpression$770()
            };
        }
        return expr$970;
    }
    // 11.14 Comma Operator
    function parseExpression$771() {
        var expr$971 = parseAssignmentExpression$770();
        if (match$736(',')) {
            expr$971 = {
                type: Syntax$689.SequenceExpression,
                expressions: [expr$971]
            };
            while (index$695 < length$698) {
                if (!match$736(',')) {
                    break;
                }
                lex$728();
                expr$971.expressions.push(parseAssignmentExpression$770());
            }
        }
        return expr$971;
    }
    // 12.1 Block
    function parseStatementList$772() {
        var list$972 = [], statement$973;
        while (index$695 < length$698) {
            if (match$736('}')) {
                break;
            }
            statement$973 = parseSourceElement$800();
            if (typeof statement$973 === 'undefined') {
                break;
            }
            list$972.push(statement$973);
        }
        return list$972;
    }
    function parseBlock$773() {
        var block$974;
        expect$734('{');
        block$974 = parseStatementList$772();
        expect$734('}');
        return {
            type: Syntax$689.BlockStatement,
            body: block$974
        };
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$774() {
        var stx$975 = lex$728(), token$976 = stx$975.token;
        if (token$976.type !== Token$687.Identifier) {
            throwUnexpected$733(token$976);
        }
        var name$977 = expander$686.resolve(stx$975);
        return {
            type: Syntax$689.Identifier,
            name: name$977
        };
    }
    function parseVariableDeclaration$775(kind$978) {
        var id$979 = parseVariableIdentifier$774(), init$980 = null;
        // 12.2.1
        if (strict$694 && isRestrictedWord$715(id$979.name)) {
            throwErrorTolerant$732({}, Messages$691.StrictVarName);
        }
        if (kind$978 === 'const') {
            expect$734('=');
            init$980 = parseAssignmentExpression$770();
        } else if (match$736('=')) {
            lex$728();
            init$980 = parseAssignmentExpression$770();
        }
        return {
            type: Syntax$689.VariableDeclarator,
            id: id$979,
            init: init$980
        };
    }
    function parseVariableDeclarationList$776(kind$981) {
        var list$982 = [];
        while (index$695 < length$698) {
            list$982.push(parseVariableDeclaration$775(kind$981));
            if (!match$736(',')) {
                break;
            }
            lex$728();
        }
        return list$982;
    }
    function parseVariableStatement$777() {
        var declarations$983;
        expectKeyword$735('var');
        declarations$983 = parseVariableDeclarationList$776();
        consumeSemicolon$739();
        return {
            type: Syntax$689.VariableDeclaration,
            declarations: declarations$983,
            kind: 'var'
        };
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$778(kind$984) {
        var declarations$985;
        expectKeyword$735(kind$984);
        declarations$985 = parseVariableDeclarationList$776(kind$984);
        consumeSemicolon$739();
        return {
            type: Syntax$689.VariableDeclaration,
            declarations: declarations$985,
            kind: kind$984
        };
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$779() {
        expect$734(';');
        return { type: Syntax$689.EmptyStatement };
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$780() {
        var expr$986 = parseExpression$771();
        consumeSemicolon$739();
        return {
            type: Syntax$689.ExpressionStatement,
            expression: expr$986
        };
    }
    // 12.5 If statement
    function parseIfStatement$781() {
        var test$987, consequent$988, alternate$989;
        expectKeyword$735('if');
        expect$734('(');
        test$987 = parseExpression$771();
        expect$734(')');
        consequent$988 = parseStatement$796();
        if (matchKeyword$737('else')) {
            lex$728();
            alternate$989 = parseStatement$796();
        } else {
            alternate$989 = null;
        }
        return {
            type: Syntax$689.IfStatement,
            test: test$987,
            consequent: consequent$988,
            alternate: alternate$989
        };
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$782() {
        var body$990, test$991, oldInIteration$992;
        expectKeyword$735('do');
        oldInIteration$992 = state$700.inIteration;
        state$700.inIteration = true;
        body$990 = parseStatement$796();
        state$700.inIteration = oldInIteration$992;
        expectKeyword$735('while');
        expect$734('(');
        test$991 = parseExpression$771();
        expect$734(')');
        if (match$736(';')) {
            lex$728();
        }
        return {
            type: Syntax$689.DoWhileStatement,
            body: body$990,
            test: test$991
        };
    }
    function parseWhileStatement$783() {
        var test$993, body$994, oldInIteration$995;
        expectKeyword$735('while');
        expect$734('(');
        test$993 = parseExpression$771();
        expect$734(')');
        oldInIteration$995 = state$700.inIteration;
        state$700.inIteration = true;
        body$994 = parseStatement$796();
        state$700.inIteration = oldInIteration$995;
        return {
            type: Syntax$689.WhileStatement,
            test: test$993,
            body: body$994
        };
    }
    function parseForVariableDeclaration$784() {
        var token$996 = lex$728().token;
        return {
            type: Syntax$689.VariableDeclaration,
            declarations: parseVariableDeclarationList$776(),
            kind: token$996.value
        };
    }
    function parseForStatement$785() {
        var init$997, test$998, update$999, left$1000, right$1001, body$1002, oldInIteration$1003;
        init$997 = test$998 = update$999 = null;
        expectKeyword$735('for');
        expect$734('(');
        if (match$736(';')) {
            lex$728();
        } else {
            if (matchKeyword$737('var') || matchKeyword$737('let')) {
                state$700.allowIn = false;
                init$997 = parseForVariableDeclaration$784();
                state$700.allowIn = true;
                if (init$997.declarations.length === 1 && matchKeyword$737('in')) {
                    lex$728();
                    left$1000 = init$997;
                    right$1001 = parseExpression$771();
                    init$997 = null;
                }
            } else {
                state$700.allowIn = false;
                init$997 = parseExpression$771();
                state$700.allowIn = true;
                if (matchKeyword$737('in')) {
                    // LeftHandSideExpression
                    if (!isLeftHandSide$740(init$997)) {
                        throwError$731({}, Messages$691.InvalidLHSInForIn);
                    }
                    lex$728();
                    left$1000 = init$997;
                    right$1001 = parseExpression$771();
                    init$997 = null;
                }
            }
            if (typeof left$1000 === 'undefined') {
                expect$734(';');
            }
        }
        if (typeof left$1000 === 'undefined') {
            if (!match$736(';')) {
                test$998 = parseExpression$771();
            }
            expect$734(';');
            if (!match$736(')')) {
                update$999 = parseExpression$771();
            }
        }
        expect$734(')');
        oldInIteration$1003 = state$700.inIteration;
        state$700.inIteration = true;
        body$1002 = parseStatement$796();
        state$700.inIteration = oldInIteration$1003;
        if (typeof left$1000 === 'undefined') {
            return {
                type: Syntax$689.ForStatement,
                init: init$997,
                test: test$998,
                update: update$999,
                body: body$1002
            };
        }
        return {
            type: Syntax$689.ForInStatement,
            left: left$1000,
            right: right$1001,
            body: body$1002,
            each: false
        };
    }
    // 12.7 The continue statement
    function parseContinueStatement$786() {
        var token$1004, label$1005 = null;
        expectKeyword$735('continue');
        // Optimize the most common form: 'continue;'.
        if (tokenStream$701[index$695].token.value === ';') {
            lex$728();
            if (!state$700.inIteration) {
                throwError$731({}, Messages$691.IllegalContinue);
            }
            return {
                type: Syntax$689.ContinueStatement,
                label: null
            };
        }
        if (peekLineTerminator$730()) {
            if (!state$700.inIteration) {
                throwError$731({}, Messages$691.IllegalContinue);
            }
            return {
                type: Syntax$689.ContinueStatement,
                label: null
            };
        }
        token$1004 = lookahead$729().token;
        if (token$1004.type === Token$687.Identifier) {
            label$1005 = parseVariableIdentifier$774();
            if (!Object.prototype.hasOwnProperty.call(state$700.labelSet, label$1005.name)) {
                throwError$731({}, Messages$691.UnknownLabel, label$1005.name);
            }
        }
        consumeSemicolon$739();
        if (label$1005 === null && !state$700.inIteration) {
            throwError$731({}, Messages$691.IllegalContinue);
        }
        return {
            type: Syntax$689.ContinueStatement,
            label: label$1005
        };
    }
    // 12.8 The break statement
    function parseBreakStatement$787() {
        var token$1006, label$1007 = null;
        expectKeyword$735('break');
        if (peekLineTerminator$730()) {
            if (!(state$700.inIteration || state$700.inSwitch)) {
                throwError$731({}, Messages$691.IllegalBreak);
            }
            return {
                type: Syntax$689.BreakStatement,
                label: null
            };
        }
        token$1006 = lookahead$729().token;
        if (token$1006.type === Token$687.Identifier) {
            label$1007 = parseVariableIdentifier$774();
            if (!Object.prototype.hasOwnProperty.call(state$700.labelSet, label$1007.name)) {
                throwError$731({}, Messages$691.UnknownLabel, label$1007.name);
            }
        }
        consumeSemicolon$739();
        if (label$1007 === null && !(state$700.inIteration || state$700.inSwitch)) {
            throwError$731({}, Messages$691.IllegalBreak);
        }
        return {
            type: Syntax$689.BreakStatement,
            label: label$1007
        };
    }
    // 12.9 The return statement
    function parseReturnStatement$788() {
        var token$1008, argument$1009 = null;
        expectKeyword$735('return');
        if (!state$700.inFunctionBody) {
            throwErrorTolerant$732({}, Messages$691.IllegalReturn);
        }
        if (peekLineTerminator$730()) {
            return {
                type: Syntax$689.ReturnStatement,
                argument: null
            };
        }
        if (!match$736(';')) {
            token$1008 = lookahead$729().token;
            if (!match$736('}') && token$1008.type !== Token$687.EOF) {
                argument$1009 = parseExpression$771();
            }
        }
        consumeSemicolon$739();
        return {
            type: Syntax$689.ReturnStatement,
            argument: argument$1009
        };
    }
    // 12.10 The with statement
    function parseWithStatement$789() {
        var object$1010, body$1011;
        if (strict$694) {
            throwErrorTolerant$732({}, Messages$691.StrictModeWith);
        }
        expectKeyword$735('with');
        expect$734('(');
        object$1010 = parseExpression$771();
        expect$734(')');
        body$1011 = parseStatement$796();
        return {
            type: Syntax$689.WithStatement,
            object: object$1010,
            body: body$1011
        };
    }
    // 12.10 The swith statement
    function parseSwitchCase$790() {
        var test$1012, consequent$1013 = [], statement$1014;
        if (matchKeyword$737('default')) {
            lex$728();
            test$1012 = null;
        } else {
            expectKeyword$735('case');
            test$1012 = parseExpression$771();
        }
        expect$734(':');
        while (index$695 < length$698) {
            if (match$736('}') || matchKeyword$737('default') || matchKeyword$737('case')) {
                break;
            }
            statement$1014 = parseStatement$796();
            if (typeof statement$1014 === 'undefined') {
                break;
            }
            consequent$1013.push(statement$1014);
        }
        return {
            type: Syntax$689.SwitchCase,
            test: test$1012,
            consequent: consequent$1013
        };
    }
    function parseSwitchStatement$791() {
        var discriminant$1015, cases$1016, oldInSwitch$1017;
        expectKeyword$735('switch');
        expect$734('(');
        discriminant$1015 = parseExpression$771();
        expect$734(')');
        expect$734('{');
        if (match$736('}')) {
            lex$728();
            return {
                type: Syntax$689.SwitchStatement,
                discriminant: discriminant$1015
            };
        }
        cases$1016 = [];
        oldInSwitch$1017 = state$700.inSwitch;
        state$700.inSwitch = true;
        while (index$695 < length$698) {
            if (match$736('}')) {
                break;
            }
            cases$1016.push(parseSwitchCase$790());
        }
        state$700.inSwitch = oldInSwitch$1017;
        expect$734('}');
        return {
            type: Syntax$689.SwitchStatement,
            discriminant: discriminant$1015,
            cases: cases$1016
        };
    }
    // 12.13 The throw statement
    function parseThrowStatement$792() {
        var argument$1018;
        expectKeyword$735('throw');
        if (peekLineTerminator$730()) {
            throwError$731({}, Messages$691.NewlineAfterThrow);
        }
        argument$1018 = parseExpression$771();
        consumeSemicolon$739();
        return {
            type: Syntax$689.ThrowStatement,
            argument: argument$1018
        };
    }
    // 12.14 The try statement
    function parseCatchClause$793() {
        var param$1019;
        expectKeyword$735('catch');
        expect$734('(');
        if (!match$736(')')) {
            param$1019 = parseExpression$771();
            // 12.14.1
            if (strict$694 && param$1019.type === Syntax$689.Identifier && isRestrictedWord$715(param$1019.name)) {
                throwErrorTolerant$732({}, Messages$691.StrictCatchVariable);
            }
        }
        expect$734(')');
        return {
            type: Syntax$689.CatchClause,
            param: param$1019,
            guard: null,
            body: parseBlock$773()
        };
    }
    function parseTryStatement$794() {
        var block$1020, handlers$1021 = [], finalizer$1022 = null;
        expectKeyword$735('try');
        block$1020 = parseBlock$773();
        if (matchKeyword$737('catch')) {
            handlers$1021.push(parseCatchClause$793());
        }
        if (matchKeyword$737('finally')) {
            lex$728();
            finalizer$1022 = parseBlock$773();
        }
        if (handlers$1021.length === 0 && !finalizer$1022) {
            throwError$731({}, Messages$691.NoCatchOrFinally);
        }
        return {
            type: Syntax$689.TryStatement,
            block: block$1020,
            handlers: handlers$1021,
            finalizer: finalizer$1022
        };
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$795() {
        expectKeyword$735('debugger');
        consumeSemicolon$739();
        return { type: Syntax$689.DebuggerStatement };
    }
    // 12 Statements
    function parseStatement$796() {
        var token$1023 = lookahead$729().token, expr$1024, labeledBody$1025;
        if (token$1023.type === Token$687.EOF) {
            throwUnexpected$733(token$1023);
        }
        if (token$1023.type === Token$687.Punctuator) {
            switch (token$1023.value) {
            case ';':
                return parseEmptyStatement$779();
            case '{':
                return parseBlock$773();
            case '(':
                return parseExpressionStatement$780();
            default:
                break;
            }
        }
        if (token$1023.type === Token$687.Keyword) {
            switch (token$1023.value) {
            case 'break':
                return parseBreakStatement$787();
            case 'continue':
                return parseContinueStatement$786();
            case 'debugger':
                return parseDebuggerStatement$795();
            case 'do':
                return parseDoWhileStatement$782();
            case 'for':
                return parseForStatement$785();
            case 'function':
                return parseFunctionDeclaration$798();
            case 'if':
                return parseIfStatement$781();
            case 'return':
                return parseReturnStatement$788();
            case 'switch':
                return parseSwitchStatement$791();
            case 'throw':
                return parseThrowStatement$792();
            case 'try':
                return parseTryStatement$794();
            case 'var':
                return parseVariableStatement$777();
            case 'while':
                return parseWhileStatement$783();
            case 'with':
                return parseWithStatement$789();
            default:
                break;
            }
        }
        expr$1024 = parseExpression$771();
        // 12.12 Labelled Statements
        if (expr$1024.type === Syntax$689.Identifier && match$736(':')) {
            lex$728();
            if (Object.prototype.hasOwnProperty.call(state$700.labelSet, expr$1024.name)) {
                throwError$731({}, Messages$691.Redeclaration, 'Label', expr$1024.name);
            }
            state$700.labelSet[expr$1024.name] = true;
            labeledBody$1025 = parseStatement$796();
            delete state$700.labelSet[expr$1024.name];
            return {
                type: Syntax$689.LabeledStatement,
                label: expr$1024,
                body: labeledBody$1025
            };
        }
        consumeSemicolon$739();
        return {
            type: Syntax$689.ExpressionStatement,
            expression: expr$1024
        };
    }
    // 13 Function Definition
    function parseFunctionSourceElements$797() {
        var sourceElement$1026, sourceElements$1027 = [], token$1028, directive$1029, firstRestricted$1030, oldLabelSet$1031, oldInIteration$1032, oldInSwitch$1033, oldInFunctionBody$1034;
        expect$734('{');
        while (index$695 < length$698) {
            token$1028 = lookahead$729().token;
            if (token$1028.type !== Token$687.StringLiteral) {
                break;
            }
            sourceElement$1026 = parseSourceElement$800();
            sourceElements$1027.push(sourceElement$1026);
            if (sourceElement$1026.expression.type !== Syntax$689.Literal) {
                // this is not directive
                break;
            }
            directive$1029 = sliceSource$705(token$1028.range[0] + 1, token$1028.range[1] - 1);
            if (directive$1029 === 'use strict') {
                strict$694 = true;
                if (firstRestricted$1030) {
                    throwError$731(firstRestricted$1030, Messages$691.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1030 && token$1028.octal) {
                    firstRestricted$1030 = token$1028;
                }
            }
        }
        oldLabelSet$1031 = state$700.labelSet;
        oldInIteration$1032 = state$700.inIteration;
        oldInSwitch$1033 = state$700.inSwitch;
        oldInFunctionBody$1034 = state$700.inFunctionBody;
        state$700.labelSet = {};
        state$700.inIteration = false;
        state$700.inSwitch = false;
        state$700.inFunctionBody = true;
        while (index$695 < length$698) {
            if (match$736('}')) {
                break;
            }
            sourceElement$1026 = parseSourceElement$800();
            if (typeof sourceElement$1026 === 'undefined') {
                break;
            }
            sourceElements$1027.push(sourceElement$1026);
        }
        expect$734('}');
        state$700.labelSet = oldLabelSet$1031;
        state$700.inIteration = oldInIteration$1032;
        state$700.inSwitch = oldInSwitch$1033;
        state$700.inFunctionBody = oldInFunctionBody$1034;
        return {
            type: Syntax$689.BlockStatement,
            body: sourceElements$1027
        };
    }
    function parseFunctionDeclaration$798() {
        var id$1035, param$1036, params$1037 = [], body$1038, token$1039, firstRestricted$1040, message$1041, previousStrict$1042, paramSet$1043;
        expectKeyword$735('function');
        token$1039 = lookahead$729().token;
        id$1035 = parseVariableIdentifier$774();
        if (strict$694) {
            if (isRestrictedWord$715(token$1039.value)) {
                throwError$731(token$1039, Messages$691.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$715(token$1039.value)) {
                firstRestricted$1040 = token$1039;
                message$1041 = Messages$691.StrictFunctionName;
            } else if (isStrictModeReservedWord$714(token$1039.value)) {
                firstRestricted$1040 = token$1039;
                message$1041 = Messages$691.StrictReservedWord;
            }
        }
        expect$734('(');
        if (!match$736(')')) {
            paramSet$1043 = {};
            while (index$695 < length$698) {
                token$1039 = lookahead$729().token;
                param$1036 = parseVariableIdentifier$774();
                if (strict$694) {
                    if (isRestrictedWord$715(token$1039.value)) {
                        throwError$731(token$1039, Messages$691.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$1043, token$1039.value)) {
                        throwError$731(token$1039, Messages$691.StrictParamDupe);
                    }
                } else if (!firstRestricted$1040) {
                    if (isRestrictedWord$715(token$1039.value)) {
                        firstRestricted$1040 = token$1039;
                        message$1041 = Messages$691.StrictParamName;
                    } else if (isStrictModeReservedWord$714(token$1039.value)) {
                        firstRestricted$1040 = token$1039;
                        message$1041 = Messages$691.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$1043, token$1039.value)) {
                        firstRestricted$1040 = token$1039;
                        message$1041 = Messages$691.StrictParamDupe;
                    }
                }
                params$1037.push(param$1036);
                paramSet$1043[param$1036.name] = true;
                if (match$736(')')) {
                    break;
                }
                expect$734(',');
            }
        }
        expect$734(')');
        previousStrict$1042 = strict$694;
        body$1038 = parseFunctionSourceElements$797();
        if (strict$694 && firstRestricted$1040) {
            throwError$731(firstRestricted$1040, message$1041);
        }
        strict$694 = previousStrict$1042;
        return {
            type: Syntax$689.FunctionDeclaration,
            id: id$1035,
            params: params$1037,
            body: body$1038
        };
    }
    function parseFunctionExpression$799() {
        var token$1044, id$1045 = null, firstRestricted$1046, message$1047, param$1048, params$1049 = [], body$1050, previousStrict$1051, paramSet$1052;
        expectKeyword$735('function');
        if (!match$736('(')) {
            token$1044 = lookahead$729().token;
            id$1045 = parseVariableIdentifier$774();
            if (strict$694) {
                if (isRestrictedWord$715(token$1044.value)) {
                    throwError$731(token$1044, Messages$691.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$715(token$1044.value)) {
                    firstRestricted$1046 = token$1044;
                    message$1047 = Messages$691.StrictFunctionName;
                } else if (isStrictModeReservedWord$714(token$1044.value)) {
                    firstRestricted$1046 = token$1044;
                    message$1047 = Messages$691.StrictReservedWord;
                }
            }
        }
        expect$734('(');
        if (!match$736(')')) {
            paramSet$1052 = {};
            while (index$695 < length$698) {
                token$1044 = lookahead$729().token;
                param$1048 = parseVariableIdentifier$774();
                if (strict$694) {
                    if (isRestrictedWord$715(token$1044.value)) {
                        throwError$731(token$1044, Messages$691.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$1052, token$1044.value)) {
                        throwError$731(token$1044, Messages$691.StrictParamDupe);
                    }
                } else if (!firstRestricted$1046) {
                    if (isRestrictedWord$715(token$1044.value)) {
                        firstRestricted$1046 = token$1044;
                        message$1047 = Messages$691.StrictParamName;
                    } else if (isStrictModeReservedWord$714(token$1044.value)) {
                        firstRestricted$1046 = token$1044;
                        message$1047 = Messages$691.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$1052, token$1044.value)) {
                        firstRestricted$1046 = token$1044;
                        message$1047 = Messages$691.StrictParamDupe;
                    }
                }
                params$1049.push(param$1048);
                paramSet$1052[param$1048.name] = true;
                if (match$736(')')) {
                    break;
                }
                expect$734(',');
            }
        }
        expect$734(')');
        previousStrict$1051 = strict$694;
        body$1050 = parseFunctionSourceElements$797();
        if (strict$694 && firstRestricted$1046) {
            throwError$731(firstRestricted$1046, message$1047);
        }
        strict$694 = previousStrict$1051;
        return {
            type: Syntax$689.FunctionExpression,
            id: id$1045,
            params: params$1049,
            body: body$1050
        };
    }
    // 14 Program
    function parseSourceElement$800() {
        var token$1053 = lookahead$729().token;
        if (token$1053.type === Token$687.Keyword) {
            switch (token$1053.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$778(token$1053.value);
            case 'function':
                return parseFunctionDeclaration$798();
            default:
                return parseStatement$796();
            }
        }
        if (token$1053.type !== Token$687.EOF) {
            return parseStatement$796();
        }
    }
    function parseSourceElements$801() {
        var sourceElement$1054, sourceElements$1055 = [], token$1056, directive$1057, firstRestricted$1058;
        while (index$695 < length$698) {
            token$1056 = lookahead$729();
            if (token$1056.type !== Token$687.StringLiteral) {
                break;
            }
            sourceElement$1054 = parseSourceElement$800();
            sourceElements$1055.push(sourceElement$1054);
            if (sourceElement$1054.expression.type !== Syntax$689.Literal) {
                // this is not directive
                break;
            }
            directive$1057 = sliceSource$705(token$1056.range[0] + 1, token$1056.range[1] - 1);
            if (directive$1057 === 'use strict') {
                strict$694 = true;
                if (firstRestricted$1058) {
                    throwError$731(firstRestricted$1058, Messages$691.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1058 && token$1056.octal) {
                    firstRestricted$1058 = token$1056;
                }
            }
        }
        while (index$695 < length$698) {
            sourceElement$1054 = parseSourceElement$800();
            if (typeof sourceElement$1054 === 'undefined') {
                break;
            }
            sourceElements$1055.push(sourceElement$1054);
        }
        return sourceElements$1055;
    }
    function parseProgram$802() {
        var program$1059;
        strict$694 = false;
        program$1059 = {
            type: Syntax$689.Program,
            body: parseSourceElements$801()
        };
        return program$1059;
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$803(start$1060, end$1061, type$1062, value$1063) {
        assert$703(typeof start$1060 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$702.comments.length > 0) {
            if (extra$702.comments[extra$702.comments.length - 1].range[1] > start$1060) {
                return;
            }
        }
        extra$702.comments.push({
            range: [
                start$1060,
                end$1061
            ],
            type: type$1062,
            value: value$1063
        });
    }
    function scanComment$804() {
        var comment$1064, ch$1065, start$1066, blockComment$1067, lineComment$1068;
        comment$1064 = '';
        blockComment$1067 = false;
        lineComment$1068 = false;
        while (index$695 < length$698) {
            ch$1065 = source$693[index$695];
            if (lineComment$1068) {
                ch$1065 = nextChar$717();
                if (index$695 >= length$698) {
                    lineComment$1068 = false;
                    comment$1064 += ch$1065;
                    addComment$803(start$1066, index$695, 'Line', comment$1064);
                } else if (isLineTerminator$710(ch$1065)) {
                    lineComment$1068 = false;
                    addComment$803(start$1066, index$695, 'Line', comment$1064);
                    if (ch$1065 === '\r' && source$693[index$695] === '\n') {
                        ++index$695;
                    }
                    ++lineNumber$696;
                    lineStart$697 = index$695;
                    comment$1064 = '';
                } else {
                    comment$1064 += ch$1065;
                }
            } else if (blockComment$1067) {
                if (isLineTerminator$710(ch$1065)) {
                    if (ch$1065 === '\r' && source$693[index$695 + 1] === '\n') {
                        ++index$695;
                        comment$1064 += '\r\n';
                    } else {
                        comment$1064 += ch$1065;
                    }
                    ++lineNumber$696;
                    ++index$695;
                    lineStart$697 = index$695;
                    if (index$695 >= length$698) {
                        throwError$731({}, Messages$691.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1065 = nextChar$717();
                    if (index$695 >= length$698) {
                        throwError$731({}, Messages$691.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1064 += ch$1065;
                    if (ch$1065 === '*') {
                        ch$1065 = source$693[index$695];
                        if (ch$1065 === '/') {
                            comment$1064 = comment$1064.substr(0, comment$1064.length - 1);
                            blockComment$1067 = false;
                            ++index$695;
                            addComment$803(start$1066, index$695, 'Block', comment$1064);
                            comment$1064 = '';
                        }
                    }
                }
            } else if (ch$1065 === '/') {
                ch$1065 = source$693[index$695 + 1];
                if (ch$1065 === '/') {
                    start$1066 = index$695;
                    index$695 += 2;
                    lineComment$1068 = true;
                } else if (ch$1065 === '*') {
                    start$1066 = index$695;
                    index$695 += 2;
                    blockComment$1067 = true;
                    if (index$695 >= length$698) {
                        throwError$731({}, Messages$691.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$709(ch$1065)) {
                ++index$695;
            } else if (isLineTerminator$710(ch$1065)) {
                ++index$695;
                if (ch$1065 === '\r' && source$693[index$695] === '\n') {
                    ++index$695;
                }
                ++lineNumber$696;
                lineStart$697 = index$695;
            } else {
                break;
            }
        }
    }
    function collectToken$805() {
        var token$1069 = extra$702.advance(), range$1070, value$1071;
        if (token$1069.type !== Token$687.EOF) {
            range$1070 = [
                token$1069.range[0],
                token$1069.range[1]
            ];
            value$1071 = sliceSource$705(token$1069.range[0], token$1069.range[1]);
            extra$702.tokens.push({
                type: TokenName$688[token$1069.type],
                value: value$1071,
                lineNumber: lineNumber$696,
                lineStart: lineStart$697,
                range: range$1070
            });
        }
        return token$1069;
    }
    function collectRegex$806() {
        var pos$1072, regex$1073, token$1074;
        skipComment$719();
        pos$1072 = index$695;
        regex$1073 = extra$702.scanRegExp();
        // Pop the previous token, which is likely '/' or '/='
        if (extra$702.tokens.length > 0) {
            token$1074 = extra$702.tokens[extra$702.tokens.length - 1];
            if (token$1074.range[0] === pos$1072 && token$1074.type === 'Punctuator') {
                if (token$1074.value === '/' || token$1074.value === '/=') {
                    extra$702.tokens.pop();
                }
            }
        }
        extra$702.tokens.push({
            type: 'RegularExpression',
            value: regex$1073.literal,
            range: [
                pos$1072,
                index$695
            ],
            lineStart: token$1074.lineStart,
            lineNumber: token$1074.lineNumber
        });
        return regex$1073;
    }
    function createLiteral$807(token$1075) {
        if (Array.isArray(token$1075)) {
            return {
                type: Syntax$689.Literal,
                value: token$1075
            };
        }
        return {
            type: Syntax$689.Literal,
            value: token$1075.value,
            lineStart: token$1075.lineStart,
            lineNumber: token$1075.lineNumber
        };
    }
    function createRawLiteral$808(token$1076) {
        return {
            type: Syntax$689.Literal,
            value: token$1076.value,
            raw: sliceSource$705(token$1076.range[0], token$1076.range[1]),
            lineStart: token$1076.lineStart,
            lineNumber: token$1076.lineNumber
        };
    }
    function wrapTrackingFunction$809(range$1077, loc$1078) {
        return function (parseFunction$1079) {
            function isBinary$1080(node$1082) {
                return node$1082.type === Syntax$689.LogicalExpression || node$1082.type === Syntax$689.BinaryExpression;
            }
            function visit$1081(node$1083) {
                if (isBinary$1080(node$1083.left)) {
                    visit$1081(node$1083.left);
                }
                if (isBinary$1080(node$1083.right)) {
                    visit$1081(node$1083.right);
                }
                if (range$1077 && typeof node$1083.range === 'undefined') {
                    node$1083.range = [
                        node$1083.left.range[0],
                        node$1083.right.range[1]
                    ];
                }
                if (loc$1078 && typeof node$1083.loc === 'undefined') {
                    node$1083.loc = {
                        start: node$1083.left.loc.start,
                        end: node$1083.right.loc.end
                    };
                }
            }
            return function () {
                var node$1084, rangeInfo$1085, locInfo$1086;
                // skipComment();
                var curr$1087 = tokenStream$701[index$695].token;
                rangeInfo$1085 = [
                    curr$1087.range[0],
                    0
                ];
                locInfo$1086 = {
                    start: {
                        line: curr$1087.sm_lineNumber,
                        column: curr$1087.sm_range[0] - curr$1087.sm_lineStart
                    }
                };
                node$1084 = parseFunction$1079.apply(null, arguments);
                if (typeof node$1084 !== 'undefined') {
                    var last$1088 = tokenStream$701[index$695].token;
                    if (range$1077) {
                        rangeInfo$1085[1] = last$1088.range[1];
                        node$1084.range = rangeInfo$1085;
                    }
                    if (loc$1078) {
                        locInfo$1086.end = {
                            line: last$1088.sm_lineNumber,
                            column: last$1088.sm_range[0] - last$1088.sm_lineStart
                        };
                        node$1084.loc = locInfo$1086;
                    }
                    if (isBinary$1080(node$1084)) {
                        visit$1081(node$1084);
                    }
                    if (node$1084.type === Syntax$689.MemberExpression) {
                        if (typeof node$1084.object.range !== 'undefined') {
                            node$1084.range[0] = node$1084.object.range[0];
                        }
                        if (typeof node$1084.object.loc !== 'undefined') {
                            node$1084.loc.start = node$1084.object.loc.start;
                        }
                    }
                    if (node$1084.type === Syntax$689.CallExpression) {
                        if (typeof node$1084.callee.range !== 'undefined') {
                            node$1084.range[0] = node$1084.callee.range[0];
                        }
                        if (typeof node$1084.callee.loc !== 'undefined') {
                            node$1084.loc.start = node$1084.callee.loc.start;
                        }
                    }
                    if (node$1084.type !== Syntax$689.Program) {
                        if (curr$1087.leadingComments) {
                            node$1084.leadingComments = curr$1087.leadingComments;
                        }
                        if (curr$1087.trailingComments) {
                            node$1084.trailingComments = curr$1087.trailingComments;
                        }
                    }
                    return node$1084;
                }
            };
        };
    }
    function patch$810() {
        var wrapTracking$1089;
        if (extra$702.comments) {
            extra$702.skipComment = skipComment$719;
            skipComment$719 = scanComment$804;
        }
        if (extra$702.raw) {
            extra$702.createLiteral = createLiteral$807;
            createLiteral$807 = createRawLiteral$808;
        }
        if (extra$702.range || extra$702.loc) {
            wrapTracking$1089 = wrapTrackingFunction$809(extra$702.range, extra$702.loc);
            extra$702.parseAdditiveExpression = parseAdditiveExpression$760;
            extra$702.parseAssignmentExpression = parseAssignmentExpression$770;
            extra$702.parseBitwiseANDExpression = parseBitwiseANDExpression$764;
            extra$702.parseBitwiseORExpression = parseBitwiseORExpression$766;
            extra$702.parseBitwiseXORExpression = parseBitwiseXORExpression$765;
            extra$702.parseBlock = parseBlock$773;
            extra$702.parseFunctionSourceElements = parseFunctionSourceElements$797;
            extra$702.parseCallMember = parseCallMember$751;
            extra$702.parseCatchClause = parseCatchClause$793;
            extra$702.parseComputedMember = parseComputedMember$750;
            extra$702.parseConditionalExpression = parseConditionalExpression$769;
            extra$702.parseConstLetDeclaration = parseConstLetDeclaration$778;
            extra$702.parseEqualityExpression = parseEqualityExpression$763;
            extra$702.parseExpression = parseExpression$771;
            extra$702.parseForVariableDeclaration = parseForVariableDeclaration$784;
            extra$702.parseFunctionDeclaration = parseFunctionDeclaration$798;
            extra$702.parseFunctionExpression = parseFunctionExpression$799;
            extra$702.parseLogicalANDExpression = parseLogicalANDExpression$767;
            extra$702.parseLogicalORExpression = parseLogicalORExpression$768;
            extra$702.parseMultiplicativeExpression = parseMultiplicativeExpression$759;
            extra$702.parseNewExpression = parseNewExpression$752;
            extra$702.parseNonComputedMember = parseNonComputedMember$749;
            extra$702.parseNonComputedProperty = parseNonComputedProperty$748;
            extra$702.parseObjectProperty = parseObjectProperty$744;
            extra$702.parseObjectPropertyKey = parseObjectPropertyKey$743;
            extra$702.parsePostfixExpression = parsePostfixExpression$757;
            extra$702.parsePrimaryExpression = parsePrimaryExpression$746;
            extra$702.parseProgram = parseProgram$802;
            extra$702.parsePropertyFunction = parsePropertyFunction$742;
            extra$702.parseRelationalExpression = parseRelationalExpression$762;
            extra$702.parseStatement = parseStatement$796;
            extra$702.parseShiftExpression = parseShiftExpression$761;
            extra$702.parseSwitchCase = parseSwitchCase$790;
            extra$702.parseUnaryExpression = parseUnaryExpression$758;
            extra$702.parseVariableDeclaration = parseVariableDeclaration$775;
            extra$702.parseVariableIdentifier = parseVariableIdentifier$774;
            parseAdditiveExpression$760 = wrapTracking$1089(extra$702.parseAdditiveExpression);
            parseAssignmentExpression$770 = wrapTracking$1089(extra$702.parseAssignmentExpression);
            parseBitwiseANDExpression$764 = wrapTracking$1089(extra$702.parseBitwiseANDExpression);
            parseBitwiseORExpression$766 = wrapTracking$1089(extra$702.parseBitwiseORExpression);
            parseBitwiseXORExpression$765 = wrapTracking$1089(extra$702.parseBitwiseXORExpression);
            parseBlock$773 = wrapTracking$1089(extra$702.parseBlock);
            parseFunctionSourceElements$797 = wrapTracking$1089(extra$702.parseFunctionSourceElements);
            parseCallMember$751 = wrapTracking$1089(extra$702.parseCallMember);
            parseCatchClause$793 = wrapTracking$1089(extra$702.parseCatchClause);
            parseComputedMember$750 = wrapTracking$1089(extra$702.parseComputedMember);
            parseConditionalExpression$769 = wrapTracking$1089(extra$702.parseConditionalExpression);
            parseConstLetDeclaration$778 = wrapTracking$1089(extra$702.parseConstLetDeclaration);
            parseEqualityExpression$763 = wrapTracking$1089(extra$702.parseEqualityExpression);
            parseExpression$771 = wrapTracking$1089(extra$702.parseExpression);
            parseForVariableDeclaration$784 = wrapTracking$1089(extra$702.parseForVariableDeclaration);
            parseFunctionDeclaration$798 = wrapTracking$1089(extra$702.parseFunctionDeclaration);
            parseFunctionExpression$799 = wrapTracking$1089(extra$702.parseFunctionExpression);
            parseLogicalANDExpression$767 = wrapTracking$1089(extra$702.parseLogicalANDExpression);
            parseLogicalORExpression$768 = wrapTracking$1089(extra$702.parseLogicalORExpression);
            parseMultiplicativeExpression$759 = wrapTracking$1089(extra$702.parseMultiplicativeExpression);
            parseNewExpression$752 = wrapTracking$1089(extra$702.parseNewExpression);
            parseNonComputedMember$749 = wrapTracking$1089(extra$702.parseNonComputedMember);
            parseNonComputedProperty$748 = wrapTracking$1089(extra$702.parseNonComputedProperty);
            parseObjectProperty$744 = wrapTracking$1089(extra$702.parseObjectProperty);
            parseObjectPropertyKey$743 = wrapTracking$1089(extra$702.parseObjectPropertyKey);
            parsePostfixExpression$757 = wrapTracking$1089(extra$702.parsePostfixExpression);
            parsePrimaryExpression$746 = wrapTracking$1089(extra$702.parsePrimaryExpression);
            parseProgram$802 = wrapTracking$1089(extra$702.parseProgram);
            parsePropertyFunction$742 = wrapTracking$1089(extra$702.parsePropertyFunction);
            parseRelationalExpression$762 = wrapTracking$1089(extra$702.parseRelationalExpression);
            parseStatement$796 = wrapTracking$1089(extra$702.parseStatement);
            parseShiftExpression$761 = wrapTracking$1089(extra$702.parseShiftExpression);
            parseSwitchCase$790 = wrapTracking$1089(extra$702.parseSwitchCase);
            parseUnaryExpression$758 = wrapTracking$1089(extra$702.parseUnaryExpression);
            parseVariableDeclaration$775 = wrapTracking$1089(extra$702.parseVariableDeclaration);
            parseVariableIdentifier$774 = wrapTracking$1089(extra$702.parseVariableIdentifier);
        }
        if (typeof extra$702.tokens !== 'undefined') {
            extra$702.advance = advance$727;
            extra$702.scanRegExp = scanRegExp$725;
            advance$727 = collectToken$805;
            scanRegExp$725 = collectRegex$806;
        }
    }
    function unpatch$811() {
        if (typeof extra$702.skipComment === 'function') {
            skipComment$719 = extra$702.skipComment;
        }
        if (extra$702.raw) {
            createLiteral$807 = extra$702.createLiteral;
        }
        if (extra$702.range || extra$702.loc) {
            parseAdditiveExpression$760 = extra$702.parseAdditiveExpression;
            parseAssignmentExpression$770 = extra$702.parseAssignmentExpression;
            parseBitwiseANDExpression$764 = extra$702.parseBitwiseANDExpression;
            parseBitwiseORExpression$766 = extra$702.parseBitwiseORExpression;
            parseBitwiseXORExpression$765 = extra$702.parseBitwiseXORExpression;
            parseBlock$773 = extra$702.parseBlock;
            parseFunctionSourceElements$797 = extra$702.parseFunctionSourceElements;
            parseCallMember$751 = extra$702.parseCallMember;
            parseCatchClause$793 = extra$702.parseCatchClause;
            parseComputedMember$750 = extra$702.parseComputedMember;
            parseConditionalExpression$769 = extra$702.parseConditionalExpression;
            parseConstLetDeclaration$778 = extra$702.parseConstLetDeclaration;
            parseEqualityExpression$763 = extra$702.parseEqualityExpression;
            parseExpression$771 = extra$702.parseExpression;
            parseForVariableDeclaration$784 = extra$702.parseForVariableDeclaration;
            parseFunctionDeclaration$798 = extra$702.parseFunctionDeclaration;
            parseFunctionExpression$799 = extra$702.parseFunctionExpression;
            parseLogicalANDExpression$767 = extra$702.parseLogicalANDExpression;
            parseLogicalORExpression$768 = extra$702.parseLogicalORExpression;
            parseMultiplicativeExpression$759 = extra$702.parseMultiplicativeExpression;
            parseNewExpression$752 = extra$702.parseNewExpression;
            parseNonComputedMember$749 = extra$702.parseNonComputedMember;
            parseNonComputedProperty$748 = extra$702.parseNonComputedProperty;
            parseObjectProperty$744 = extra$702.parseObjectProperty;
            parseObjectPropertyKey$743 = extra$702.parseObjectPropertyKey;
            parsePrimaryExpression$746 = extra$702.parsePrimaryExpression;
            parsePostfixExpression$757 = extra$702.parsePostfixExpression;
            parseProgram$802 = extra$702.parseProgram;
            parsePropertyFunction$742 = extra$702.parsePropertyFunction;
            parseRelationalExpression$762 = extra$702.parseRelationalExpression;
            parseStatement$796 = extra$702.parseStatement;
            parseShiftExpression$761 = extra$702.parseShiftExpression;
            parseSwitchCase$790 = extra$702.parseSwitchCase;
            parseUnaryExpression$758 = extra$702.parseUnaryExpression;
            parseVariableDeclaration$775 = extra$702.parseVariableDeclaration;
            parseVariableIdentifier$774 = extra$702.parseVariableIdentifier;
        }
        if (typeof extra$702.scanRegExp === 'function') {
            advance$727 = extra$702.advance;
            scanRegExp$725 = extra$702.scanRegExp;
        }
    }
    function stringToArray$812(str$1090) {
        var length$1091 = str$1090.length, result$1092 = [], i$1093;
        for (i$1093 = 0; i$1093 < length$1091; ++i$1093) {
            result$1092[i$1093] = str$1090.charAt(i$1093);
        }
        return result$1092;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$813(toks$1094, start$1095, inExprDelim$1096, parentIsBlock$1097) {
        var assignOps$1098 = [
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
        var binaryOps$1099 = [
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
        var unaryOps$1100 = [
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
        function back$1101(n$1102) {
            var idx$1103 = toks$1094.length - n$1102 > 0 ? toks$1094.length - n$1102 : 0;
            return toks$1094[idx$1103];
        }
        if (inExprDelim$1096 && toks$1094.length - (start$1095 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1101(start$1095 + 2).value === ':' && parentIsBlock$1097) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$704(back$1101(start$1095 + 2).value, unaryOps$1100.concat(binaryOps$1099).concat(assignOps$1098))) {
            // ... + {...}
            return false;
        } else if (back$1101(start$1095 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1104 = typeof back$1101(start$1095 + 1).startLineNumber !== 'undefined' ? back$1101(start$1095 + 1).startLineNumber : back$1101(start$1095 + 1).lineNumber;
            if (back$1101(start$1095 + 2).lineNumber !== currLineNumber$1104) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$704(back$1101(start$1095 + 2).value, [
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
    function readToken$814(toks$1105, inExprDelim$1106, parentIsBlock$1107) {
        var delimiters$1108 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1109 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1110 = toks$1105.length - 1;
        var comments$1111, commentsLen$1112 = extra$702.comments.length;
        function back$1113(n$1117) {
            var idx$1118 = toks$1105.length - n$1117 > 0 ? toks$1105.length - n$1117 : 0;
            return toks$1105[idx$1118];
        }
        function attachComments$1114(token$1119) {
            if (comments$1111) {
                token$1119.leadingComments = comments$1111;
            }
            return token$1119;
        }
        function _advance$1115() {
            return attachComments$1114(advance$727());
        }
        function _scanRegExp$1116() {
            return attachComments$1114(scanRegExp$725());
        }
        skipComment$719();
        if (extra$702.comments.length > commentsLen$1112) {
            comments$1111 = extra$702.comments.slice(commentsLen$1112);
        }
        if (isIn$704(getChar$718(), delimiters$1108)) {
            return attachComments$1114(readDelim$815(toks$1105, inExprDelim$1106, parentIsBlock$1107));
        }
        if (getChar$718() === '/') {
            var prev$1120 = back$1113(1);
            if (prev$1120) {
                if (prev$1120.value === '()') {
                    if (isIn$704(back$1113(2).value, parenIdents$1109)) {
                        // ... if (...) / ...
                        return _scanRegExp$1116();
                    }
                    // ... (...) / ...
                    return _advance$1115();
                }
                if (prev$1120.value === '{}') {
                    if (blockAllowed$813(toks$1105, 0, inExprDelim$1106, parentIsBlock$1107)) {
                        if (back$1113(2).value === '()') {
                            // named function
                            if (back$1113(4).value === 'function') {
                                if (!blockAllowed$813(toks$1105, 3, inExprDelim$1106, parentIsBlock$1107)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1115();
                                }
                                if (toks$1105.length - 5 <= 0 && inExprDelim$1106) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1115();
                                }
                            }
                            // unnamed function
                            if (back$1113(3).value === 'function') {
                                if (!blockAllowed$813(toks$1105, 2, inExprDelim$1106, parentIsBlock$1107)) {
                                    // new function (...) {...} / ...
                                    return _advance$1115();
                                }
                                if (toks$1105.length - 4 <= 0 && inExprDelim$1106) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1115();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1116();
                    } else {
                        // ... + {...} / ...
                        return _advance$1115();
                    }
                }
                if (prev$1120.type === Token$687.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1116();
                }
                if (isKeyword$716(prev$1120.value)) {
                    // typeof /...
                    return _scanRegExp$1116();
                }
                return _advance$1115();
            }
            return _scanRegExp$1116();
        }
        return _advance$1115();
    }
    function readDelim$815(toks$1121, inExprDelim$1122, parentIsBlock$1123) {
        var startDelim$1124 = advance$727(), matchDelim$1125 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1126 = [];
        var delimiters$1127 = [
                '(',
                '{',
                '['
            ];
        assert$703(delimiters$1127.indexOf(startDelim$1124.value) !== -1, 'Need to begin at the delimiter');
        var token$1128 = startDelim$1124;
        var startLineNumber$1129 = token$1128.lineNumber;
        var startLineStart$1130 = token$1128.lineStart;
        var startRange$1131 = token$1128.range;
        var delimToken$1132 = {};
        delimToken$1132.type = Token$687.Delimiter;
        delimToken$1132.value = startDelim$1124.value + matchDelim$1125[startDelim$1124.value];
        delimToken$1132.startLineNumber = startLineNumber$1129;
        delimToken$1132.startLineStart = startLineStart$1130;
        delimToken$1132.startRange = startRange$1131;
        var delimIsBlock$1133 = false;
        if (startDelim$1124.value === '{') {
            delimIsBlock$1133 = blockAllowed$813(toks$1121.concat(delimToken$1132), 0, inExprDelim$1122, parentIsBlock$1123);
        }
        while (index$695 <= length$698) {
            token$1128 = readToken$814(inner$1126, startDelim$1124.value === '(' || startDelim$1124.value === '[', delimIsBlock$1133);
            if (token$1128.type === Token$687.Punctuator && token$1128.value === matchDelim$1125[startDelim$1124.value]) {
                if (token$1128.leadingComments) {
                    delimToken$1132.trailingComments = token$1128.leadingComments;
                }
                break;
            } else if (token$1128.type === Token$687.EOF) {
                throwError$731({}, Messages$691.UnexpectedEOS);
            } else {
                inner$1126.push(token$1128);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$695 >= length$698 && matchDelim$1125[startDelim$1124.value] !== source$693[length$698 - 1]) {
            throwError$731({}, Messages$691.UnexpectedEOS);
        }
        var endLineNumber$1134 = token$1128.lineNumber;
        var endLineStart$1135 = token$1128.lineStart;
        var endRange$1136 = token$1128.range;
        delimToken$1132.inner = inner$1126;
        delimToken$1132.endLineNumber = endLineNumber$1134;
        delimToken$1132.endLineStart = endLineStart$1135;
        delimToken$1132.endRange = endRange$1136;
        return delimToken$1132;
    }
    ;
    // (Str) -> [...CSyntax]
    function read$816(code$1137) {
        var token$1138, tokenTree$1139 = [];
        extra$702 = {};
        extra$702.comments = [];
        patch$810();
        source$693 = code$1137;
        index$695 = 0;
        lineNumber$696 = source$693.length > 0 ? 1 : 0;
        lineStart$697 = 0;
        length$698 = source$693.length;
        buffer$699 = null;
        state$700 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$695 < length$698) {
            tokenTree$1139.push(readToken$814(tokenTree$1139, false, false));
        }
        var last$1140 = tokenTree$1139[tokenTree$1139.length - 1];
        if (last$1140 && last$1140.type !== Token$687.EOF) {
            tokenTree$1139.push({
                type: Token$687.EOF,
                value: '',
                lineNumber: last$1140.lineNumber,
                lineStart: last$1140.lineStart,
                range: [
                    index$695,
                    index$695
                ]
            });
        }
        return expander$686.tokensToSyntax(tokenTree$1139);
    }
    // (SyntaxObject, Str, {}) -> SyntaxObject
    function parse$817(code$1141) {
        var program$1142, toString$1143;
        tokenStream$701 = code$1141;
        index$695 = 0;
        length$698 = tokenStream$701.length;
        buffer$699 = null;
        state$700 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$702 = {
            range: true,
            loc: true
        };
        patch$810();
        try {
            program$1142 = parseProgram$802();
            program$1142.tokens = expander$686.syntaxToTokens(code$1141);
        } catch (e$1144) {
            throw e$1144;
        } finally {
            unpatch$811();
            extra$702 = {};
        }
        return program$1142;
    }
    exports$685.parse = parse$817;
    exports$685.read = read$816;
    exports$685.Token = Token$687;
    exports$685.assert = assert$703;
    // Deep copy.
    exports$685.Syntax = function () {
        var name$1145, types$1146 = {};
        if (typeof Object.create === 'function') {
            types$1146 = Object.create(null);
        }
        for (name$1145 in Syntax$689) {
            if (Syntax$689.hasOwnProperty(name$1145)) {
                types$1146[name$1145] = Syntax$689[name$1145];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1146);
        }
        return types$1146;
    }();
}));