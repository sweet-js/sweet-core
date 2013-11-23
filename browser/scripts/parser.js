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
(function (root$672, factory$673) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$673(exports, require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'expander'
        ], factory$673);
    }
}(this, function (exports$674, expander$675) {
    'use strict';
    var Token$676, TokenName$677, Syntax$678, PropertyKind$679, Messages$680, Regex$681, source$682, strict$683, index$684, lineNumber$685, lineStart$686, length$687, buffer$688, state$689, tokenStream$690, extra$691;
    Token$676 = {
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
    TokenName$677 = {};
    TokenName$677[Token$676.BooleanLiteral] = 'Boolean';
    TokenName$677[Token$676.EOF] = '<end>';
    TokenName$677[Token$676.Identifier] = 'Identifier';
    TokenName$677[Token$676.Keyword] = 'Keyword';
    TokenName$677[Token$676.NullLiteral] = 'Null';
    TokenName$677[Token$676.NumericLiteral] = 'Numeric';
    TokenName$677[Token$676.Punctuator] = 'Punctuator';
    TokenName$677[Token$676.StringLiteral] = 'String';
    TokenName$677[Token$676.Delimiter] = 'Delimiter';
    Syntax$678 = {
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
    PropertyKind$679 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    // Error messages should be identical to V8.
    Messages$680 = {
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
    Regex$681 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$692(condition$807, message$808) {
        if (!condition$807) {
            throw new Error('ASSERT: ' + message$808);
        }
    }
    function isIn$693(el$809, list$810) {
        return list$810.indexOf(el$809) !== -1;
    }
    function sliceSource$694(from$811, to$812) {
        return source$682.slice(from$811, to$812);
    }
    if (typeof 'esprima'[0] === 'undefined') {
        sliceSource$694 = function sliceArraySource$813(from$814, to$815) {
            return source$682.slice(from$814, to$815).join('');
        };
    }
    function isDecimalDigit$695(ch$816) {
        return '0123456789'.indexOf(ch$816) >= 0;
    }
    function isHexDigit$696(ch$817) {
        return '0123456789abcdefABCDEF'.indexOf(ch$817) >= 0;
    }
    function isOctalDigit$697(ch$818) {
        return '01234567'.indexOf(ch$818) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$698(ch$819) {
        return ch$819 === ' ' || ch$819 === '\t' || ch$819 === '\x0B' || ch$819 === '\f' || ch$819 === '\xa0' || ch$819.charCodeAt(0) >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(ch$819) >= 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$699(ch$820) {
        return ch$820 === '\n' || ch$820 === '\r' || ch$820 === '\u2028' || ch$820 === '\u2029';
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$700(ch$821) {
        return ch$821 === '$' || ch$821 === '_' || ch$821 === '\\' || ch$821 >= 'a' && ch$821 <= 'z' || ch$821 >= 'A' && ch$821 <= 'Z' || ch$821.charCodeAt(0) >= 128 && Regex$681.NonAsciiIdentifierStart.test(ch$821);
    }
    function isIdentifierPart$701(ch$822) {
        return ch$822 === '$' || ch$822 === '_' || ch$822 === '\\' || ch$822 >= 'a' && ch$822 <= 'z' || ch$822 >= 'A' && ch$822 <= 'Z' || ch$822 >= '0' && ch$822 <= '9' || ch$822.charCodeAt(0) >= 128 && Regex$681.NonAsciiIdentifierPart.test(ch$822);
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$702(id$823) {
        // we are allowing future reserved words so macros can be written for them
        return false;
    }
    function isStrictModeReservedWord$703(id$824) {
        switch (id$824) {
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
    function isRestrictedWord$704(id$825) {
        return id$825 === 'eval' || id$825 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$705(id$826) {
        var keyword$827 = false;
        switch (id$826.length) {
        case 2:
            keyword$827 = id$826 === 'if' || id$826 === 'in' || id$826 === 'do';
            break;
        case 3:
            keyword$827 = id$826 === 'var' || id$826 === 'for' || id$826 === 'new' || id$826 === 'try';
            break;
        case 4:
            keyword$827 = id$826 === 'this' || id$826 === 'else' || id$826 === 'case' || id$826 === 'void' || id$826 === 'with';
            break;
        case 5:
            keyword$827 = id$826 === 'while' || id$826 === 'break' || id$826 === 'catch' || id$826 === 'throw';
            break;
        case 6:
            keyword$827 = id$826 === 'return' || id$826 === 'typeof' || id$826 === 'delete' || id$826 === 'switch';
            break;
        case 7:
            keyword$827 = id$826 === 'default' || id$826 === 'finally';
            break;
        case 8:
            keyword$827 = id$826 === 'function' || id$826 === 'continue' || id$826 === 'debugger';
            break;
        case 10:
            keyword$827 = id$826 === 'instanceof';
            break;
        }
        if (keyword$827) {
            return true;
        }
        switch (id$826) {
        // Future reserved words.
        // 'const' is specialized as Keyword in V8.
        case 'const':
            return true;
        // For compatiblity to SpiderMonkey and ES.next
        case 'yield':
        case 'let':
            return true;
        }
        if (strict$683 && isStrictModeReservedWord$703(id$826)) {
            return true;
        }
        return isFutureReservedWord$702(id$826);
    }
    // Return the next character and move forward.
    function nextChar$706() {
        return source$682[index$684++];
    }
    function getChar$707() {
        return source$682[index$684];
    }
    // 7.4 Comments
    function skipComment$708() {
        var ch$828, blockComment$829, lineComment$830;
        blockComment$829 = false;
        lineComment$830 = false;
        while (index$684 < length$687) {
            ch$828 = source$682[index$684];
            if (lineComment$830) {
                ch$828 = nextChar$706();
                if (isLineTerminator$699(ch$828)) {
                    lineComment$830 = false;
                    if (ch$828 === '\r' && source$682[index$684] === '\n') {
                        ++index$684;
                    }
                    ++lineNumber$685;
                    lineStart$686 = index$684;
                }
            } else if (blockComment$829) {
                if (isLineTerminator$699(ch$828)) {
                    if (ch$828 === '\r' && source$682[index$684 + 1] === '\n') {
                        ++index$684;
                    }
                    ++lineNumber$685;
                    ++index$684;
                    lineStart$686 = index$684;
                    if (index$684 >= length$687) {
                        throwError$720({}, Messages$680.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$828 = nextChar$706();
                    if (index$684 >= length$687) {
                        throwError$720({}, Messages$680.UnexpectedToken, 'ILLEGAL');
                    }
                    if (ch$828 === '*') {
                        ch$828 = source$682[index$684];
                        if (ch$828 === '/') {
                            ++index$684;
                            blockComment$829 = false;
                        }
                    }
                }
            } else if (ch$828 === '/') {
                ch$828 = source$682[index$684 + 1];
                if (ch$828 === '/') {
                    index$684 += 2;
                    lineComment$830 = true;
                } else if (ch$828 === '*') {
                    index$684 += 2;
                    blockComment$829 = true;
                    if (index$684 >= length$687) {
                        throwError$720({}, Messages$680.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$698(ch$828)) {
                ++index$684;
            } else if (isLineTerminator$699(ch$828)) {
                ++index$684;
                if (ch$828 === '\r' && source$682[index$684] === '\n') {
                    ++index$684;
                }
                ++lineNumber$685;
                lineStart$686 = index$684;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$709(prefix$831) {
        var i$832, len$833, ch$834, code$835 = 0;
        len$833 = prefix$831 === 'u' ? 4 : 2;
        for (i$832 = 0; i$832 < len$833; ++i$832) {
            if (index$684 < length$687 && isHexDigit$696(source$682[index$684])) {
                ch$834 = nextChar$706();
                code$835 = code$835 * 16 + '0123456789abcdef'.indexOf(ch$834.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$835);
    }
    function scanIdentifier$710() {
        var ch$836, start$837, id$838, restore$839;
        ch$836 = source$682[index$684];
        if (!isIdentifierStart$700(ch$836)) {
            return;
        }
        start$837 = index$684;
        if (ch$836 === '\\') {
            ++index$684;
            if (source$682[index$684] !== 'u') {
                return;
            }
            ++index$684;
            restore$839 = index$684;
            ch$836 = scanHexEscape$709('u');
            if (ch$836) {
                if (ch$836 === '\\' || !isIdentifierStart$700(ch$836)) {
                    return;
                }
                id$838 = ch$836;
            } else {
                index$684 = restore$839;
                id$838 = 'u';
            }
        } else {
            id$838 = nextChar$706();
        }
        while (index$684 < length$687) {
            ch$836 = source$682[index$684];
            if (!isIdentifierPart$701(ch$836)) {
                break;
            }
            if (ch$836 === '\\') {
                ++index$684;
                if (source$682[index$684] !== 'u') {
                    return;
                }
                ++index$684;
                restore$839 = index$684;
                ch$836 = scanHexEscape$709('u');
                if (ch$836) {
                    if (ch$836 === '\\' || !isIdentifierPart$701(ch$836)) {
                        return;
                    }
                    id$838 += ch$836;
                } else {
                    index$684 = restore$839;
                    id$838 += 'u';
                }
            } else {
                id$838 += nextChar$706();
            }
        }
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$838.length === 1) {
            return {
                type: Token$676.Identifier,
                value: id$838,
                lineNumber: lineNumber$685,
                lineStart: lineStart$686,
                range: [
                    start$837,
                    index$684
                ]
            };
        }
        if (isKeyword$705(id$838)) {
            return {
                type: Token$676.Keyword,
                value: id$838,
                lineNumber: lineNumber$685,
                lineStart: lineStart$686,
                range: [
                    start$837,
                    index$684
                ]
            };
        }
        // 7.8.1 Null Literals
        if (id$838 === 'null') {
            return {
                type: Token$676.NullLiteral,
                value: id$838,
                lineNumber: lineNumber$685,
                lineStart: lineStart$686,
                range: [
                    start$837,
                    index$684
                ]
            };
        }
        // 7.8.2 Boolean Literals
        if (id$838 === 'true' || id$838 === 'false') {
            return {
                type: Token$676.BooleanLiteral,
                value: id$838,
                lineNumber: lineNumber$685,
                lineStart: lineStart$686,
                range: [
                    start$837,
                    index$684
                ]
            };
        }
        return {
            type: Token$676.Identifier,
            value: id$838,
            lineNumber: lineNumber$685,
            lineStart: lineStart$686,
            range: [
                start$837,
                index$684
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$711() {
        var start$840 = index$684, ch1$841 = source$682[index$684], ch2$842, ch3$843, ch4$844;
        // Check for most common single-character punctuators.
        if (ch1$841 === ';' || ch1$841 === '{' || ch1$841 === '}') {
            ++index$684;
            return {
                type: Token$676.Punctuator,
                value: ch1$841,
                lineNumber: lineNumber$685,
                lineStart: lineStart$686,
                range: [
                    start$840,
                    index$684
                ]
            };
        }
        if (ch1$841 === ',' || ch1$841 === '(' || ch1$841 === ')') {
            ++index$684;
            return {
                type: Token$676.Punctuator,
                value: ch1$841,
                lineNumber: lineNumber$685,
                lineStart: lineStart$686,
                range: [
                    start$840,
                    index$684
                ]
            };
        }
        if (ch1$841 === '#' || ch1$841 === '@') {
            ++index$684;
            return {
                type: Token$676.Punctuator,
                value: ch1$841,
                lineNumber: lineNumber$685,
                lineStart: lineStart$686,
                range: [
                    start$840,
                    index$684
                ]
            };
        }
        // Dot (.) can also start a floating-point number, hence the need
        // to check the next character.
        ch2$842 = source$682[index$684 + 1];
        if (ch1$841 === '.' && !isDecimalDigit$695(ch2$842)) {
            if (source$682[index$684 + 1] === '.' && source$682[index$684 + 2] === '.') {
                nextChar$706();
                nextChar$706();
                nextChar$706();
                return {
                    type: Token$676.Punctuator,
                    value: '...',
                    lineNumber: lineNumber$685,
                    lineStart: lineStart$686,
                    range: [
                        start$840,
                        index$684
                    ]
                };
            } else {
                return {
                    type: Token$676.Punctuator,
                    value: nextChar$706(),
                    lineNumber: lineNumber$685,
                    lineStart: lineStart$686,
                    range: [
                        start$840,
                        index$684
                    ]
                };
            }
        }
        // Peek more characters.
        ch3$843 = source$682[index$684 + 2];
        ch4$844 = source$682[index$684 + 3];
        // 4-character punctuator: >>>=
        if (ch1$841 === '>' && ch2$842 === '>' && ch3$843 === '>') {
            if (ch4$844 === '=') {
                index$684 += 4;
                return {
                    type: Token$676.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$685,
                    lineStart: lineStart$686,
                    range: [
                        start$840,
                        index$684
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$841 === '=' && ch2$842 === '=' && ch3$843 === '=') {
            index$684 += 3;
            return {
                type: Token$676.Punctuator,
                value: '===',
                lineNumber: lineNumber$685,
                lineStart: lineStart$686,
                range: [
                    start$840,
                    index$684
                ]
            };
        }
        if (ch1$841 === '!' && ch2$842 === '=' && ch3$843 === '=') {
            index$684 += 3;
            return {
                type: Token$676.Punctuator,
                value: '!==',
                lineNumber: lineNumber$685,
                lineStart: lineStart$686,
                range: [
                    start$840,
                    index$684
                ]
            };
        }
        if (ch1$841 === '>' && ch2$842 === '>' && ch3$843 === '>') {
            index$684 += 3;
            return {
                type: Token$676.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$685,
                lineStart: lineStart$686,
                range: [
                    start$840,
                    index$684
                ]
            };
        }
        if (ch1$841 === '<' && ch2$842 === '<' && ch3$843 === '=') {
            index$684 += 3;
            return {
                type: Token$676.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$685,
                lineStart: lineStart$686,
                range: [
                    start$840,
                    index$684
                ]
            };
        }
        if (ch1$841 === '>' && ch2$842 === '>' && ch3$843 === '=') {
            index$684 += 3;
            return {
                type: Token$676.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$685,
                lineStart: lineStart$686,
                range: [
                    start$840,
                    index$684
                ]
            };
        }
        // 2-character punctuators: <= >= == != ++ -- << >> && ||
        // += -= *= %= &= |= ^= /=
        if (ch2$842 === '=') {
            if ('<>=!+-*%&|^/'.indexOf(ch1$841) >= 0) {
                index$684 += 2;
                return {
                    type: Token$676.Punctuator,
                    value: ch1$841 + ch2$842,
                    lineNumber: lineNumber$685,
                    lineStart: lineStart$686,
                    range: [
                        start$840,
                        index$684
                    ]
                };
            }
        }
        if (ch1$841 === ch2$842 && '+-<>&|'.indexOf(ch1$841) >= 0) {
            if ('+-<>&|'.indexOf(ch2$842) >= 0) {
                index$684 += 2;
                return {
                    type: Token$676.Punctuator,
                    value: ch1$841 + ch2$842,
                    lineNumber: lineNumber$685,
                    lineStart: lineStart$686,
                    range: [
                        start$840,
                        index$684
                    ]
                };
            }
        }
        // The remaining 1-character punctuators.
        if ('[]<>+-*%&|^!~?:=/'.indexOf(ch1$841) >= 0) {
            return {
                type: Token$676.Punctuator,
                value: nextChar$706(),
                lineNumber: lineNumber$685,
                lineStart: lineStart$686,
                range: [
                    start$840,
                    index$684
                ]
            };
        }
    }
    // 7.8.3 Numeric Literals
    function scanNumericLiteral$712() {
        var number$845, start$846, ch$847;
        ch$847 = source$682[index$684];
        assert$692(isDecimalDigit$695(ch$847) || ch$847 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$846 = index$684;
        number$845 = '';
        if (ch$847 !== '.') {
            number$845 = nextChar$706();
            ch$847 = source$682[index$684];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            if (number$845 === '0') {
                if (ch$847 === 'x' || ch$847 === 'X') {
                    number$845 += nextChar$706();
                    while (index$684 < length$687) {
                        ch$847 = source$682[index$684];
                        if (!isHexDigit$696(ch$847)) {
                            break;
                        }
                        number$845 += nextChar$706();
                    }
                    if (number$845.length <= 2) {
                        // only 0x
                        throwError$720({}, Messages$680.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$684 < length$687) {
                        ch$847 = source$682[index$684];
                        if (isIdentifierStart$700(ch$847)) {
                            throwError$720({}, Messages$680.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$676.NumericLiteral,
                        value: parseInt(number$845, 16),
                        lineNumber: lineNumber$685,
                        lineStart: lineStart$686,
                        range: [
                            start$846,
                            index$684
                        ]
                    };
                } else if (isOctalDigit$697(ch$847)) {
                    number$845 += nextChar$706();
                    while (index$684 < length$687) {
                        ch$847 = source$682[index$684];
                        if (!isOctalDigit$697(ch$847)) {
                            break;
                        }
                        number$845 += nextChar$706();
                    }
                    if (index$684 < length$687) {
                        ch$847 = source$682[index$684];
                        if (isIdentifierStart$700(ch$847) || isDecimalDigit$695(ch$847)) {
                            throwError$720({}, Messages$680.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$676.NumericLiteral,
                        value: parseInt(number$845, 8),
                        octal: true,
                        lineNumber: lineNumber$685,
                        lineStart: lineStart$686,
                        range: [
                            start$846,
                            index$684
                        ]
                    };
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (isDecimalDigit$695(ch$847)) {
                    throwError$720({}, Messages$680.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (index$684 < length$687) {
                ch$847 = source$682[index$684];
                if (!isDecimalDigit$695(ch$847)) {
                    break;
                }
                number$845 += nextChar$706();
            }
        }
        if (ch$847 === '.') {
            number$845 += nextChar$706();
            while (index$684 < length$687) {
                ch$847 = source$682[index$684];
                if (!isDecimalDigit$695(ch$847)) {
                    break;
                }
                number$845 += nextChar$706();
            }
        }
        if (ch$847 === 'e' || ch$847 === 'E') {
            number$845 += nextChar$706();
            ch$847 = source$682[index$684];
            if (ch$847 === '+' || ch$847 === '-') {
                number$845 += nextChar$706();
            }
            ch$847 = source$682[index$684];
            if (isDecimalDigit$695(ch$847)) {
                number$845 += nextChar$706();
                while (index$684 < length$687) {
                    ch$847 = source$682[index$684];
                    if (!isDecimalDigit$695(ch$847)) {
                        break;
                    }
                    number$845 += nextChar$706();
                }
            } else {
                ch$847 = 'character ' + ch$847;
                if (index$684 >= length$687) {
                    ch$847 = '<end>';
                }
                throwError$720({}, Messages$680.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (index$684 < length$687) {
            ch$847 = source$682[index$684];
            if (isIdentifierStart$700(ch$847)) {
                throwError$720({}, Messages$680.UnexpectedToken, 'ILLEGAL');
            }
        }
        return {
            type: Token$676.NumericLiteral,
            value: parseFloat(number$845),
            lineNumber: lineNumber$685,
            lineStart: lineStart$686,
            range: [
                start$846,
                index$684
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$713() {
        var str$848 = '', quote$849, start$850, ch$851, code$852, unescaped$853, restore$854, octal$855 = false;
        quote$849 = source$682[index$684];
        assert$692(quote$849 === '\'' || quote$849 === '"', 'String literal must starts with a quote');
        start$850 = index$684;
        ++index$684;
        while (index$684 < length$687) {
            ch$851 = nextChar$706();
            if (ch$851 === quote$849) {
                quote$849 = '';
                break;
            } else if (ch$851 === '\\') {
                ch$851 = nextChar$706();
                if (!isLineTerminator$699(ch$851)) {
                    switch (ch$851) {
                    case 'n':
                        str$848 += '\n';
                        break;
                    case 'r':
                        str$848 += '\r';
                        break;
                    case 't':
                        str$848 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        restore$854 = index$684;
                        unescaped$853 = scanHexEscape$709(ch$851);
                        if (unescaped$853) {
                            str$848 += unescaped$853;
                        } else {
                            index$684 = restore$854;
                            str$848 += ch$851;
                        }
                        break;
                    case 'b':
                        str$848 += '\b';
                        break;
                    case 'f':
                        str$848 += '\f';
                        break;
                    case 'v':
                        str$848 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$697(ch$851)) {
                            code$852 = '01234567'.indexOf(ch$851);
                            // \0 is not octal escape sequence
                            if (code$852 !== 0) {
                                octal$855 = true;
                            }
                            if (index$684 < length$687 && isOctalDigit$697(source$682[index$684])) {
                                octal$855 = true;
                                code$852 = code$852 * 8 + '01234567'.indexOf(nextChar$706());
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$851) >= 0 && index$684 < length$687 && isOctalDigit$697(source$682[index$684])) {
                                    code$852 = code$852 * 8 + '01234567'.indexOf(nextChar$706());
                                }
                            }
                            str$848 += String.fromCharCode(code$852);
                        } else {
                            str$848 += ch$851;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$685;
                    if (ch$851 === '\r' && source$682[index$684] === '\n') {
                        ++index$684;
                    }
                }
            } else if (isLineTerminator$699(ch$851)) {
                break;
            } else {
                str$848 += ch$851;
            }
        }
        if (quote$849 !== '') {
            throwError$720({}, Messages$680.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$676.StringLiteral,
            value: str$848,
            octal: octal$855,
            lineNumber: lineNumber$685,
            lineStart: lineStart$686,
            range: [
                start$850,
                index$684
            ]
        };
    }
    function scanRegExp$714() {
        var str$856 = '', ch$857, start$858, pattern$859, flags$860, value$861, classMarker$862 = false, restore$863;
        buffer$688 = null;
        skipComment$708();
        start$858 = index$684;
        ch$857 = source$682[index$684];
        assert$692(ch$857 === '/', 'Regular expression literal must start with a slash');
        str$856 = nextChar$706();
        while (index$684 < length$687) {
            ch$857 = nextChar$706();
            str$856 += ch$857;
            if (classMarker$862) {
                if (ch$857 === ']') {
                    classMarker$862 = false;
                }
            } else {
                if (ch$857 === '\\') {
                    ch$857 = nextChar$706();
                    // ECMA-262 7.8.5
                    if (isLineTerminator$699(ch$857)) {
                        throwError$720({}, Messages$680.UnterminatedRegExp);
                    }
                    str$856 += ch$857;
                } else if (ch$857 === '/') {
                    break;
                } else if (ch$857 === '[') {
                    classMarker$862 = true;
                } else if (isLineTerminator$699(ch$857)) {
                    throwError$720({}, Messages$680.UnterminatedRegExp);
                }
            }
        }
        if (str$856.length === 1) {
            throwError$720({}, Messages$680.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$859 = str$856.substr(1, str$856.length - 2);
        flags$860 = '';
        while (index$684 < length$687) {
            ch$857 = source$682[index$684];
            if (!isIdentifierPart$701(ch$857)) {
                break;
            }
            ++index$684;
            if (ch$857 === '\\' && index$684 < length$687) {
                ch$857 = source$682[index$684];
                if (ch$857 === 'u') {
                    ++index$684;
                    restore$863 = index$684;
                    ch$857 = scanHexEscape$709('u');
                    if (ch$857) {
                        flags$860 += ch$857;
                        str$856 += '\\u';
                        for (; restore$863 < index$684; ++restore$863) {
                            str$856 += source$682[restore$863];
                        }
                    } else {
                        index$684 = restore$863;
                        flags$860 += 'u';
                        str$856 += '\\u';
                    }
                } else {
                    str$856 += '\\';
                }
            } else {
                flags$860 += ch$857;
                str$856 += ch$857;
            }
        }
        try {
            value$861 = new RegExp(pattern$859, flags$860);
        } catch (e$864) {
            throwError$720({}, Messages$680.InvalidRegExp);
        }
        return {
            type: Token$676.RegexLiteral,
            literal: str$856,
            value: value$861,
            lineNumber: lineNumber$685,
            lineStart: lineStart$686,
            range: [
                start$858,
                index$684
            ]
        };
    }
    function isIdentifierName$715(token$865) {
        return token$865.type === Token$676.Identifier || token$865.type === Token$676.Keyword || token$865.type === Token$676.BooleanLiteral || token$865.type === Token$676.NullLiteral;
    }
    // only used by the reader
    function advance$716() {
        var ch$866, token$867;
        skipComment$708();
        if (index$684 >= length$687) {
            return {
                type: Token$676.EOF,
                lineNumber: lineNumber$685,
                lineStart: lineStart$686,
                range: [
                    index$684,
                    index$684
                ]
            };
        }
        ch$866 = source$682[index$684];
        token$867 = scanPunctuator$711();
        if (typeof token$867 !== 'undefined') {
            return token$867;
        }
        if (ch$866 === '\'' || ch$866 === '"') {
            return scanStringLiteral$713();
        }
        if (ch$866 === '.' || isDecimalDigit$695(ch$866)) {
            return scanNumericLiteral$712();
        }
        token$867 = scanIdentifier$710();
        if (typeof token$867 !== 'undefined') {
            return token$867;
        }
        throwError$720({}, Messages$680.UnexpectedToken, 'ILLEGAL');
    }
    function lex$717() {
        var token$868;
        if (buffer$688) {
            token$868 = buffer$688;
            buffer$688 = null;
            index$684++;
            return token$868;
        }
        buffer$688 = null;
        return tokenStream$690[index$684++];
    }
    function lookahead$718() {
        var pos$869, line$870, start$871;
        if (buffer$688 !== null) {
            return buffer$688;
        }
        buffer$688 = tokenStream$690[index$684];
        return buffer$688;
    }
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$719() {
        var pos$872, line$873, start$874, found$875;
        found$875 = tokenStream$690[index$684 - 1].token.lineNumber !== tokenStream$690[index$684].token.lineNumber;
        return found$875;
    }
    // Throw an exception
    function throwError$720(token$876, messageFormat$877) {
        var error$878, args$879 = Array.prototype.slice.call(arguments, 2), msg$880 = messageFormat$877.replace(/%(\d)/g, function (whole$881, index$882) {
                return args$879[index$882] || '';
            });
        if (typeof token$876.lineNumber === 'number') {
            error$878 = new Error('Line ' + token$876.lineNumber + ': ' + msg$880);
            error$878.lineNumber = token$876.lineNumber;
            if (token$876.range && token$876.range.length > 0) {
                error$878.index = token$876.range[0];
                error$878.column = token$876.range[0] - lineStart$686 + 1;
            }
        } else {
            error$878 = new Error('Line ' + lineNumber$685 + ': ' + msg$880);
            error$878.index = index$684;
            error$878.lineNumber = lineNumber$685;
            error$878.column = index$684 - lineStart$686 + 1;
        }
        throw error$878;
    }
    function throwErrorTolerant$721() {
        var error$883;
        try {
            throwError$720.apply(null, arguments);
        } catch (e$884) {
            if (extra$691.errors) {
                extra$691.errors.push(e$884);
            } else {
                throw e$884;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$722(token$885) {
        var s$886;
        if (token$885.type === Token$676.EOF) {
            throwError$720(token$885, Messages$680.UnexpectedEOS);
        }
        if (token$885.type === Token$676.NumericLiteral) {
            throwError$720(token$885, Messages$680.UnexpectedNumber);
        }
        if (token$885.type === Token$676.StringLiteral) {
            throwError$720(token$885, Messages$680.UnexpectedString);
        }
        if (token$885.type === Token$676.Identifier) {
            console.log(token$885);
            throwError$720(token$885, Messages$680.UnexpectedIdentifier);
        }
        if (token$885.type === Token$676.Keyword) {
            if (isFutureReservedWord$702(token$885.value)) {
                throwError$720(token$885, Messages$680.UnexpectedReserved);
            } else if (strict$683 && isStrictModeReservedWord$703(token$885.value)) {
                throwError$720(token$885, Messages$680.StrictReservedWord);
            }
            throwError$720(token$885, Messages$680.UnexpectedToken, token$885.value);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$720(token$885, Messages$680.UnexpectedToken, token$885.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$723(value$887) {
        var token$888 = lex$717().token;
        if (token$888.type !== Token$676.Punctuator || token$888.value !== value$887) {
            throwUnexpected$722(token$888);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$724(keyword$889) {
        var token$890 = lex$717().token;
        if (token$890.type !== Token$676.Keyword || token$890.value !== keyword$889) {
            throwUnexpected$722(token$890);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$725(value$891) {
        var token$892 = lookahead$718().token;
        return token$892.type === Token$676.Punctuator && token$892.value === value$891;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$726(keyword$893) {
        var token$894 = lookahead$718().token;
        return token$894.type === Token$676.Keyword && token$894.value === keyword$893;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$727() {
        var token$895 = lookahead$718().token, op$896 = token$895.value;
        if (token$895.type !== Token$676.Punctuator) {
            return false;
        }
        return op$896 === '=' || op$896 === '*=' || op$896 === '/=' || op$896 === '%=' || op$896 === '+=' || op$896 === '-=' || op$896 === '<<=' || op$896 === '>>=' || op$896 === '>>>=' || op$896 === '&=' || op$896 === '^=' || op$896 === '|=';
    }
    function consumeSemicolon$728() {
        var token$897, line$898;
        if (tokenStream$690[index$684].token.value === ';') {
            lex$717().token;
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
        line$898 = tokenStream$690[index$684 - 1].token.lineNumber;
        token$897 = tokenStream$690[index$684].token;
        if (line$898 !== token$897.lineNumber) {
            return;
        }
        if (token$897.type !== Token$676.EOF && !match$725('}')) {
            throwUnexpected$722(token$897);
        }
        return;
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$729(expr$899) {
        return expr$899.type === Syntax$678.Identifier || expr$899.type === Syntax$678.MemberExpression;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$730() {
        var elements$900 = [], undef$901;
        expect$723('[');
        while (!match$725(']')) {
            if (match$725(',')) {
                lex$717().token;
                elements$900.push(undef$901);
            } else {
                elements$900.push(parseAssignmentExpression$759());
                if (!match$725(']')) {
                    expect$723(',');
                }
            }
        }
        expect$723(']');
        return {
            type: Syntax$678.ArrayExpression,
            elements: elements$900
        };
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$731(param$902, first$903) {
        var previousStrict$904, body$905;
        previousStrict$904 = strict$683;
        body$905 = parseFunctionSourceElements$786();
        if (first$903 && strict$683 && isRestrictedWord$704(param$902[0].name)) {
            throwError$720(first$903, Messages$680.StrictParamName);
        }
        strict$683 = previousStrict$904;
        return {
            type: Syntax$678.FunctionExpression,
            id: null,
            params: param$902,
            body: body$905
        };
    }
    function parseObjectPropertyKey$732() {
        var token$906 = lex$717().token;
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$906.type === Token$676.StringLiteral || token$906.type === Token$676.NumericLiteral) {
            if (strict$683 && token$906.octal) {
                throwError$720(token$906, Messages$680.StrictOctalLiteral);
            }
            return createLiteral$796(token$906);
        }
        return {
            type: Syntax$678.Identifier,
            name: token$906.value
        };
    }
    function parseObjectProperty$733() {
        var token$907, key$908, id$909, param$910;
        token$907 = lookahead$718().token;
        if (token$907.type === Token$676.Identifier) {
            id$909 = parseObjectPropertyKey$732();
            // Property Assignment: Getter and Setter.
            if (token$907.value === 'get' && !match$725(':')) {
                key$908 = parseObjectPropertyKey$732();
                expect$723('(');
                expect$723(')');
                return {
                    type: Syntax$678.Property,
                    key: key$908,
                    value: parsePropertyFunction$731([]),
                    kind: 'get'
                };
            } else if (token$907.value === 'set' && !match$725(':')) {
                key$908 = parseObjectPropertyKey$732();
                expect$723('(');
                token$907 = lookahead$718().token;
                if (token$907.type !== Token$676.Identifier) {
                    throwUnexpected$722(lex$717().token);
                }
                param$910 = [parseVariableIdentifier$763()];
                expect$723(')');
                return {
                    type: Syntax$678.Property,
                    key: key$908,
                    value: parsePropertyFunction$731(param$910, token$907),
                    kind: 'set'
                };
            } else {
                expect$723(':');
                return {
                    type: Syntax$678.Property,
                    key: id$909,
                    value: parseAssignmentExpression$759(),
                    kind: 'init'
                };
            }
        } else if (token$907.type === Token$676.EOF || token$907.type === Token$676.Punctuator) {
            throwUnexpected$722(token$907);
        } else {
            key$908 = parseObjectPropertyKey$732();
            expect$723(':');
            return {
                type: Syntax$678.Property,
                key: key$908,
                value: parseAssignmentExpression$759(),
                kind: 'init'
            };
        }
    }
    function parseObjectInitialiser$734() {
        var token$911, properties$912 = [], property$913, name$914, kind$915, map$916 = {}, toString$917 = String;
        expect$723('{');
        while (!match$725('}')) {
            property$913 = parseObjectProperty$733();
            if (property$913.key.type === Syntax$678.Identifier) {
                name$914 = property$913.key.name;
            } else {
                name$914 = toString$917(property$913.key.value);
            }
            kind$915 = property$913.kind === 'init' ? PropertyKind$679.Data : property$913.kind === 'get' ? PropertyKind$679.Get : PropertyKind$679.Set;
            if (Object.prototype.hasOwnProperty.call(map$916, name$914)) {
                if (map$916[name$914] === PropertyKind$679.Data) {
                    if (strict$683 && kind$915 === PropertyKind$679.Data) {
                        throwErrorTolerant$721({}, Messages$680.StrictDuplicateProperty);
                    } else if (kind$915 !== PropertyKind$679.Data) {
                        throwError$720({}, Messages$680.AccessorDataProperty);
                    }
                } else {
                    if (kind$915 === PropertyKind$679.Data) {
                        throwError$720({}, Messages$680.AccessorDataProperty);
                    } else if (map$916[name$914] & kind$915) {
                        throwError$720({}, Messages$680.AccessorGetSet);
                    }
                }
                map$916[name$914] |= kind$915;
            } else {
                map$916[name$914] = kind$915;
            }
            properties$912.push(property$913);
            if (!match$725('}')) {
                expect$723(',');
            }
        }
        expect$723('}');
        return {
            type: Syntax$678.ObjectExpression,
            properties: properties$912
        };
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$735() {
        var expr$918, token$919 = lookahead$718().token, type$920 = token$919.type;
        if (type$920 === Token$676.Identifier) {
            var name$921 = expander$675.resolve(lex$717());
            return {
                type: Syntax$678.Identifier,
                name: name$921
            };
        }
        if (type$920 === Token$676.StringLiteral || type$920 === Token$676.NumericLiteral) {
            if (strict$683 && token$919.octal) {
                throwErrorTolerant$721(token$919, Messages$680.StrictOctalLiteral);
            }
            return createLiteral$796(lex$717().token);
        }
        if (type$920 === Token$676.Keyword) {
            if (matchKeyword$726('this')) {
                lex$717().token;
                return { type: Syntax$678.ThisExpression };
            }
            if (matchKeyword$726('function')) {
                return parseFunctionExpression$788();
            }
        }
        if (type$920 === Token$676.BooleanLiteral) {
            lex$717();
            token$919.value = token$919.value === 'true';
            return createLiteral$796(token$919);
        }
        if (type$920 === Token$676.NullLiteral) {
            lex$717();
            token$919.value = null;
            return createLiteral$796(token$919);
        }
        if (match$725('[')) {
            return parseArrayInitialiser$730();
        }
        if (match$725('{')) {
            return parseObjectInitialiser$734();
        }
        if (match$725('(')) {
            lex$717();
            state$689.lastParenthesized = expr$918 = parseExpression$760();
            expect$723(')');
            return expr$918;
        }
        if (token$919.value instanceof RegExp) {
            return createLiteral$796(lex$717().token);
        }
        return throwUnexpected$722(lex$717().token);
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$736() {
        var args$922 = [];
        expect$723('(');
        if (!match$725(')')) {
            while (index$684 < length$687) {
                args$922.push(parseAssignmentExpression$759());
                if (match$725(')')) {
                    break;
                }
                expect$723(',');
            }
        }
        expect$723(')');
        return args$922;
    }
    function parseNonComputedProperty$737() {
        var token$923 = lex$717().token;
        if (!isIdentifierName$715(token$923)) {
            throwUnexpected$722(token$923);
        }
        return {
            type: Syntax$678.Identifier,
            name: token$923.value
        };
    }
    function parseNonComputedMember$738(object$924) {
        return {
            type: Syntax$678.MemberExpression,
            computed: false,
            object: object$924,
            property: parseNonComputedProperty$737()
        };
    }
    function parseComputedMember$739(object$925) {
        var property$926, expr$927;
        expect$723('[');
        property$926 = parseExpression$760();
        expr$927 = {
            type: Syntax$678.MemberExpression,
            computed: true,
            object: object$925,
            property: property$926
        };
        expect$723(']');
        return expr$927;
    }
    function parseCallMember$740(object$928) {
        return {
            type: Syntax$678.CallExpression,
            callee: object$928,
            'arguments': parseArguments$736()
        };
    }
    function parseNewExpression$741() {
        var expr$929;
        expectKeyword$724('new');
        expr$929 = {
            type: Syntax$678.NewExpression,
            callee: parseLeftHandSideExpression$745(),
            'arguments': []
        };
        if (match$725('(')) {
            expr$929['arguments'] = parseArguments$736();
        }
        return expr$929;
    }
    // sort of broken, only accepts literals
    // pretty sure the use of toString will bite me
    function toArrayNode$742(arr$930) {
        var els$931 = arr$930.map(function (el$932) {
                return {
                    type: 'Literal',
                    value: el$932,
                    raw: el$932.toString()
                };
            });
        return {
            type: 'ArrayExpression',
            elements: els$931
        };
    }
    function toObjectNode$743(obj$933) {
        // todo: hacky, fixup
        var props$934 = Object.keys(obj$933).map(function (key$935) {
                var raw$936 = obj$933[key$935];
                var value$937;
                if (Array.isArray(raw$936)) {
                    value$937 = toArrayNode$742(raw$936);
                } else {
                    value$937 = {
                        type: 'Literal',
                        value: obj$933[key$935],
                        raw: obj$933[key$935].toString()
                    };
                }
                return {
                    type: 'Property',
                    key: {
                        type: 'Identifier',
                        name: key$935
                    },
                    value: value$937,
                    kind: 'init'
                };
            });
        return {
            type: 'ObjectExpression',
            properties: props$934
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
    function parseLeftHandSideExpressionAllowCall$744() {
        var useNew$938, expr$939;
        useNew$938 = matchKeyword$726('new');
        expr$939 = useNew$938 ? parseNewExpression$741() : parsePrimaryExpression$735();
        // handle "syntax" primitive
        // todo: error handling
        // if(expr.name === "syntax") {
        //     return parseSyntaxObject();
        // }
        while (index$684 < length$687) {
            if (match$725('.')) {
                lex$717();
                expr$939 = parseNonComputedMember$738(expr$939);
            } else if (match$725('[')) {
                expr$939 = parseComputedMember$739(expr$939);
            } else if (match$725('(')) {
                expr$939 = parseCallMember$740(expr$939);
            } else {
                break;
            }
        }
        return expr$939;
    }
    function parseLeftHandSideExpression$745() {
        var useNew$940, expr$941;
        useNew$940 = matchKeyword$726('new');
        expr$941 = useNew$940 ? parseNewExpression$741() : parsePrimaryExpression$735();
        while (index$684 < length$687) {
            if (match$725('.')) {
                lex$717();
                expr$941 = parseNonComputedMember$738(expr$941);
            } else if (match$725('[')) {
                expr$941 = parseComputedMember$739(expr$941);
            } else {
                break;
            }
        }
        return expr$941;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$746() {
        var expr$942 = parseLeftHandSideExpressionAllowCall$744();
        if ((match$725('++') || match$725('--')) && !peekLineTerminator$719()) {
            // 11.3.1, 11.3.2
            if (strict$683 && expr$942.type === Syntax$678.Identifier && isRestrictedWord$704(expr$942.name)) {
                throwError$720({}, Messages$680.StrictLHSPostfix);
            }
            if (!isLeftHandSide$729(expr$942)) {
                throwError$720({}, Messages$680.InvalidLHSInAssignment);
            }
            expr$942 = {
                type: Syntax$678.UpdateExpression,
                operator: lex$717().token.value,
                argument: expr$942,
                prefix: false
            };
        }
        return expr$942;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$747() {
        var token$943, expr$944;
        if (match$725('++') || match$725('--')) {
            token$943 = lex$717().token;
            expr$944 = parseUnaryExpression$747();
            // 11.4.4, 11.4.5
            if (strict$683 && expr$944.type === Syntax$678.Identifier && isRestrictedWord$704(expr$944.name)) {
                throwError$720({}, Messages$680.StrictLHSPrefix);
            }
            if (!isLeftHandSide$729(expr$944)) {
                throwError$720({}, Messages$680.InvalidLHSInAssignment);
            }
            expr$944 = {
                type: Syntax$678.UpdateExpression,
                operator: token$943.value,
                argument: expr$944,
                prefix: true
            };
            return expr$944;
        }
        if (match$725('+') || match$725('-') || match$725('~') || match$725('!')) {
            expr$944 = {
                type: Syntax$678.UnaryExpression,
                operator: lex$717().token.value,
                argument: parseUnaryExpression$747()
            };
            return expr$944;
        }
        if (matchKeyword$726('delete') || matchKeyword$726('void') || matchKeyword$726('typeof')) {
            expr$944 = {
                type: Syntax$678.UnaryExpression,
                operator: lex$717().token.value,
                argument: parseUnaryExpression$747()
            };
            if (strict$683 && expr$944.operator === 'delete' && expr$944.argument.type === Syntax$678.Identifier) {
                throwErrorTolerant$721({}, Messages$680.StrictDelete);
            }
            return expr$944;
        }
        return parsePostfixExpression$746();
    }
    // 11.5 Multiplicative Operators
    function parseMultiplicativeExpression$748() {
        var expr$945 = parseUnaryExpression$747();
        while (match$725('*') || match$725('/') || match$725('%')) {
            expr$945 = {
                type: Syntax$678.BinaryExpression,
                operator: lex$717().token.value,
                left: expr$945,
                right: parseUnaryExpression$747()
            };
        }
        return expr$945;
    }
    // 11.6 Additive Operators
    function parseAdditiveExpression$749() {
        var expr$946 = parseMultiplicativeExpression$748();
        while (match$725('+') || match$725('-')) {
            expr$946 = {
                type: Syntax$678.BinaryExpression,
                operator: lex$717().token.value,
                left: expr$946,
                right: parseMultiplicativeExpression$748()
            };
        }
        return expr$946;
    }
    // 11.7 Bitwise Shift Operators
    function parseShiftExpression$750() {
        var expr$947 = parseAdditiveExpression$749();
        while (match$725('<<') || match$725('>>') || match$725('>>>')) {
            expr$947 = {
                type: Syntax$678.BinaryExpression,
                operator: lex$717().token.value,
                left: expr$947,
                right: parseAdditiveExpression$749()
            };
        }
        return expr$947;
    }
    // 11.8 Relational Operators
    function parseRelationalExpression$751() {
        var expr$948, previousAllowIn$949;
        previousAllowIn$949 = state$689.allowIn;
        state$689.allowIn = true;
        expr$948 = parseShiftExpression$750();
        while (match$725('<') || match$725('>') || match$725('<=') || match$725('>=') || previousAllowIn$949 && matchKeyword$726('in') || matchKeyword$726('instanceof')) {
            expr$948 = {
                type: Syntax$678.BinaryExpression,
                operator: lex$717().token.value,
                left: expr$948,
                right: parseRelationalExpression$751()
            };
        }
        state$689.allowIn = previousAllowIn$949;
        return expr$948;
    }
    // 11.9 Equality Operators
    function parseEqualityExpression$752() {
        var expr$950 = parseRelationalExpression$751();
        while (match$725('==') || match$725('!=') || match$725('===') || match$725('!==')) {
            expr$950 = {
                type: Syntax$678.BinaryExpression,
                operator: lex$717().token.value,
                left: expr$950,
                right: parseRelationalExpression$751()
            };
        }
        return expr$950;
    }
    // 11.10 Binary Bitwise Operators
    function parseBitwiseANDExpression$753() {
        var expr$951 = parseEqualityExpression$752();
        while (match$725('&')) {
            lex$717();
            expr$951 = {
                type: Syntax$678.BinaryExpression,
                operator: '&',
                left: expr$951,
                right: parseEqualityExpression$752()
            };
        }
        return expr$951;
    }
    function parseBitwiseXORExpression$754() {
        var expr$952 = parseBitwiseANDExpression$753();
        while (match$725('^')) {
            lex$717();
            expr$952 = {
                type: Syntax$678.BinaryExpression,
                operator: '^',
                left: expr$952,
                right: parseBitwiseANDExpression$753()
            };
        }
        return expr$952;
    }
    function parseBitwiseORExpression$755() {
        var expr$953 = parseBitwiseXORExpression$754();
        while (match$725('|')) {
            lex$717();
            expr$953 = {
                type: Syntax$678.BinaryExpression,
                operator: '|',
                left: expr$953,
                right: parseBitwiseXORExpression$754()
            };
        }
        return expr$953;
    }
    // 11.11 Binary Logical Operators
    function parseLogicalANDExpression$756() {
        var expr$954 = parseBitwiseORExpression$755();
        while (match$725('&&')) {
            lex$717();
            expr$954 = {
                type: Syntax$678.LogicalExpression,
                operator: '&&',
                left: expr$954,
                right: parseBitwiseORExpression$755()
            };
        }
        return expr$954;
    }
    function parseLogicalORExpression$757() {
        var expr$955 = parseLogicalANDExpression$756();
        while (match$725('||')) {
            lex$717();
            expr$955 = {
                type: Syntax$678.LogicalExpression,
                operator: '||',
                left: expr$955,
                right: parseLogicalANDExpression$756()
            };
        }
        return expr$955;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$758() {
        var expr$956, previousAllowIn$957, consequent$958;
        expr$956 = parseLogicalORExpression$757();
        if (match$725('?')) {
            lex$717();
            previousAllowIn$957 = state$689.allowIn;
            state$689.allowIn = true;
            consequent$958 = parseAssignmentExpression$759();
            state$689.allowIn = previousAllowIn$957;
            expect$723(':');
            expr$956 = {
                type: Syntax$678.ConditionalExpression,
                test: expr$956,
                consequent: consequent$958,
                alternate: parseAssignmentExpression$759()
            };
        }
        return expr$956;
    }
    // 11.13 Assignment Operators
    function parseAssignmentExpression$759() {
        var expr$959;
        expr$959 = parseConditionalExpression$758();
        if (matchAssign$727()) {
            // LeftHandSideExpression
            if (!isLeftHandSide$729(expr$959)) {
                throwError$720({}, Messages$680.InvalidLHSInAssignment);
            }
            // 11.13.1
            if (strict$683 && expr$959.type === Syntax$678.Identifier && isRestrictedWord$704(expr$959.name)) {
                throwError$720({}, Messages$680.StrictLHSAssignment);
            }
            expr$959 = {
                type: Syntax$678.AssignmentExpression,
                operator: lex$717().token.value,
                left: expr$959,
                right: parseAssignmentExpression$759()
            };
        }
        return expr$959;
    }
    // 11.14 Comma Operator
    function parseExpression$760() {
        var expr$960 = parseAssignmentExpression$759();
        if (match$725(',')) {
            expr$960 = {
                type: Syntax$678.SequenceExpression,
                expressions: [expr$960]
            };
            while (index$684 < length$687) {
                if (!match$725(',')) {
                    break;
                }
                lex$717();
                expr$960.expressions.push(parseAssignmentExpression$759());
            }
        }
        return expr$960;
    }
    // 12.1 Block
    function parseStatementList$761() {
        var list$961 = [], statement$962;
        while (index$684 < length$687) {
            if (match$725('}')) {
                break;
            }
            statement$962 = parseSourceElement$789();
            if (typeof statement$962 === 'undefined') {
                break;
            }
            list$961.push(statement$962);
        }
        return list$961;
    }
    function parseBlock$762() {
        var block$963;
        expect$723('{');
        block$963 = parseStatementList$761();
        expect$723('}');
        return {
            type: Syntax$678.BlockStatement,
            body: block$963
        };
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$763() {
        var stx$964 = lex$717(), token$965 = stx$964.token;
        if (token$965.type !== Token$676.Identifier) {
            throwUnexpected$722(token$965);
        }
        var name$966 = expander$675.resolve(stx$964);
        return {
            type: Syntax$678.Identifier,
            name: name$966
        };
    }
    function parseVariableDeclaration$764(kind$967) {
        var id$968 = parseVariableIdentifier$763(), init$969 = null;
        // 12.2.1
        if (strict$683 && isRestrictedWord$704(id$968.name)) {
            throwErrorTolerant$721({}, Messages$680.StrictVarName);
        }
        if (kind$967 === 'const') {
            expect$723('=');
            init$969 = parseAssignmentExpression$759();
        } else if (match$725('=')) {
            lex$717();
            init$969 = parseAssignmentExpression$759();
        }
        return {
            type: Syntax$678.VariableDeclarator,
            id: id$968,
            init: init$969
        };
    }
    function parseVariableDeclarationList$765(kind$970) {
        var list$971 = [];
        while (index$684 < length$687) {
            list$971.push(parseVariableDeclaration$764(kind$970));
            if (!match$725(',')) {
                break;
            }
            lex$717();
        }
        return list$971;
    }
    function parseVariableStatement$766() {
        var declarations$972;
        expectKeyword$724('var');
        declarations$972 = parseVariableDeclarationList$765();
        consumeSemicolon$728();
        return {
            type: Syntax$678.VariableDeclaration,
            declarations: declarations$972,
            kind: 'var'
        };
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$767(kind$973) {
        var declarations$974;
        expectKeyword$724(kind$973);
        declarations$974 = parseVariableDeclarationList$765(kind$973);
        consumeSemicolon$728();
        return {
            type: Syntax$678.VariableDeclaration,
            declarations: declarations$974,
            kind: kind$973
        };
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$768() {
        expect$723(';');
        return { type: Syntax$678.EmptyStatement };
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$769() {
        var expr$975 = parseExpression$760();
        consumeSemicolon$728();
        return {
            type: Syntax$678.ExpressionStatement,
            expression: expr$975
        };
    }
    // 12.5 If statement
    function parseIfStatement$770() {
        var test$976, consequent$977, alternate$978;
        expectKeyword$724('if');
        expect$723('(');
        test$976 = parseExpression$760();
        expect$723(')');
        consequent$977 = parseStatement$785();
        if (matchKeyword$726('else')) {
            lex$717();
            alternate$978 = parseStatement$785();
        } else {
            alternate$978 = null;
        }
        return {
            type: Syntax$678.IfStatement,
            test: test$976,
            consequent: consequent$977,
            alternate: alternate$978
        };
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$771() {
        var body$979, test$980, oldInIteration$981;
        expectKeyword$724('do');
        oldInIteration$981 = state$689.inIteration;
        state$689.inIteration = true;
        body$979 = parseStatement$785();
        state$689.inIteration = oldInIteration$981;
        expectKeyword$724('while');
        expect$723('(');
        test$980 = parseExpression$760();
        expect$723(')');
        if (match$725(';')) {
            lex$717();
        }
        return {
            type: Syntax$678.DoWhileStatement,
            body: body$979,
            test: test$980
        };
    }
    function parseWhileStatement$772() {
        var test$982, body$983, oldInIteration$984;
        expectKeyword$724('while');
        expect$723('(');
        test$982 = parseExpression$760();
        expect$723(')');
        oldInIteration$984 = state$689.inIteration;
        state$689.inIteration = true;
        body$983 = parseStatement$785();
        state$689.inIteration = oldInIteration$984;
        return {
            type: Syntax$678.WhileStatement,
            test: test$982,
            body: body$983
        };
    }
    function parseForVariableDeclaration$773() {
        var token$985 = lex$717().token;
        return {
            type: Syntax$678.VariableDeclaration,
            declarations: parseVariableDeclarationList$765(),
            kind: token$985.value
        };
    }
    function parseForStatement$774() {
        var init$986, test$987, update$988, left$989, right$990, body$991, oldInIteration$992;
        init$986 = test$987 = update$988 = null;
        expectKeyword$724('for');
        expect$723('(');
        if (match$725(';')) {
            lex$717();
        } else {
            if (matchKeyword$726('var') || matchKeyword$726('let')) {
                state$689.allowIn = false;
                init$986 = parseForVariableDeclaration$773();
                state$689.allowIn = true;
                if (init$986.declarations.length === 1 && matchKeyword$726('in')) {
                    lex$717();
                    left$989 = init$986;
                    right$990 = parseExpression$760();
                    init$986 = null;
                }
            } else {
                state$689.allowIn = false;
                init$986 = parseExpression$760();
                state$689.allowIn = true;
                if (matchKeyword$726('in')) {
                    // LeftHandSideExpression
                    if (!isLeftHandSide$729(init$986)) {
                        throwError$720({}, Messages$680.InvalidLHSInForIn);
                    }
                    lex$717();
                    left$989 = init$986;
                    right$990 = parseExpression$760();
                    init$986 = null;
                }
            }
            if (typeof left$989 === 'undefined') {
                expect$723(';');
            }
        }
        if (typeof left$989 === 'undefined') {
            if (!match$725(';')) {
                test$987 = parseExpression$760();
            }
            expect$723(';');
            if (!match$725(')')) {
                update$988 = parseExpression$760();
            }
        }
        expect$723(')');
        oldInIteration$992 = state$689.inIteration;
        state$689.inIteration = true;
        body$991 = parseStatement$785();
        state$689.inIteration = oldInIteration$992;
        if (typeof left$989 === 'undefined') {
            return {
                type: Syntax$678.ForStatement,
                init: init$986,
                test: test$987,
                update: update$988,
                body: body$991
            };
        }
        return {
            type: Syntax$678.ForInStatement,
            left: left$989,
            right: right$990,
            body: body$991,
            each: false
        };
    }
    // 12.7 The continue statement
    function parseContinueStatement$775() {
        var token$993, label$994 = null;
        expectKeyword$724('continue');
        // Optimize the most common form: 'continue;'.
        if (tokenStream$690[index$684].token.value === ';') {
            lex$717();
            if (!state$689.inIteration) {
                throwError$720({}, Messages$680.IllegalContinue);
            }
            return {
                type: Syntax$678.ContinueStatement,
                label: null
            };
        }
        if (peekLineTerminator$719()) {
            if (!state$689.inIteration) {
                throwError$720({}, Messages$680.IllegalContinue);
            }
            return {
                type: Syntax$678.ContinueStatement,
                label: null
            };
        }
        token$993 = lookahead$718().token;
        if (token$993.type === Token$676.Identifier) {
            label$994 = parseVariableIdentifier$763();
            if (!Object.prototype.hasOwnProperty.call(state$689.labelSet, label$994.name)) {
                throwError$720({}, Messages$680.UnknownLabel, label$994.name);
            }
        }
        consumeSemicolon$728();
        if (label$994 === null && !state$689.inIteration) {
            throwError$720({}, Messages$680.IllegalContinue);
        }
        return {
            type: Syntax$678.ContinueStatement,
            label: label$994
        };
    }
    // 12.8 The break statement
    function parseBreakStatement$776() {
        var token$995, label$996 = null;
        expectKeyword$724('break');
        if (peekLineTerminator$719()) {
            if (!(state$689.inIteration || state$689.inSwitch)) {
                throwError$720({}, Messages$680.IllegalBreak);
            }
            return {
                type: Syntax$678.BreakStatement,
                label: null
            };
        }
        token$995 = lookahead$718().token;
        if (token$995.type === Token$676.Identifier) {
            label$996 = parseVariableIdentifier$763();
            if (!Object.prototype.hasOwnProperty.call(state$689.labelSet, label$996.name)) {
                throwError$720({}, Messages$680.UnknownLabel, label$996.name);
            }
        }
        consumeSemicolon$728();
        if (label$996 === null && !(state$689.inIteration || state$689.inSwitch)) {
            throwError$720({}, Messages$680.IllegalBreak);
        }
        return {
            type: Syntax$678.BreakStatement,
            label: label$996
        };
    }
    // 12.9 The return statement
    function parseReturnStatement$777() {
        var token$997, argument$998 = null;
        expectKeyword$724('return');
        if (!state$689.inFunctionBody) {
            throwErrorTolerant$721({}, Messages$680.IllegalReturn);
        }
        if (peekLineTerminator$719()) {
            return {
                type: Syntax$678.ReturnStatement,
                argument: null
            };
        }
        if (!match$725(';')) {
            token$997 = lookahead$718().token;
            if (!match$725('}') && token$997.type !== Token$676.EOF) {
                argument$998 = parseExpression$760();
            }
        }
        consumeSemicolon$728();
        return {
            type: Syntax$678.ReturnStatement,
            argument: argument$998
        };
    }
    // 12.10 The with statement
    function parseWithStatement$778() {
        var object$999, body$1000;
        if (strict$683) {
            throwErrorTolerant$721({}, Messages$680.StrictModeWith);
        }
        expectKeyword$724('with');
        expect$723('(');
        object$999 = parseExpression$760();
        expect$723(')');
        body$1000 = parseStatement$785();
        return {
            type: Syntax$678.WithStatement,
            object: object$999,
            body: body$1000
        };
    }
    // 12.10 The swith statement
    function parseSwitchCase$779() {
        var test$1001, consequent$1002 = [], statement$1003;
        if (matchKeyword$726('default')) {
            lex$717();
            test$1001 = null;
        } else {
            expectKeyword$724('case');
            test$1001 = parseExpression$760();
        }
        expect$723(':');
        while (index$684 < length$687) {
            if (match$725('}') || matchKeyword$726('default') || matchKeyword$726('case')) {
                break;
            }
            statement$1003 = parseStatement$785();
            if (typeof statement$1003 === 'undefined') {
                break;
            }
            consequent$1002.push(statement$1003);
        }
        return {
            type: Syntax$678.SwitchCase,
            test: test$1001,
            consequent: consequent$1002
        };
    }
    function parseSwitchStatement$780() {
        var discriminant$1004, cases$1005, oldInSwitch$1006;
        expectKeyword$724('switch');
        expect$723('(');
        discriminant$1004 = parseExpression$760();
        expect$723(')');
        expect$723('{');
        if (match$725('}')) {
            lex$717();
            return {
                type: Syntax$678.SwitchStatement,
                discriminant: discriminant$1004
            };
        }
        cases$1005 = [];
        oldInSwitch$1006 = state$689.inSwitch;
        state$689.inSwitch = true;
        while (index$684 < length$687) {
            if (match$725('}')) {
                break;
            }
            cases$1005.push(parseSwitchCase$779());
        }
        state$689.inSwitch = oldInSwitch$1006;
        expect$723('}');
        return {
            type: Syntax$678.SwitchStatement,
            discriminant: discriminant$1004,
            cases: cases$1005
        };
    }
    // 12.13 The throw statement
    function parseThrowStatement$781() {
        var argument$1007;
        expectKeyword$724('throw');
        if (peekLineTerminator$719()) {
            throwError$720({}, Messages$680.NewlineAfterThrow);
        }
        argument$1007 = parseExpression$760();
        consumeSemicolon$728();
        return {
            type: Syntax$678.ThrowStatement,
            argument: argument$1007
        };
    }
    // 12.14 The try statement
    function parseCatchClause$782() {
        var param$1008;
        expectKeyword$724('catch');
        expect$723('(');
        if (!match$725(')')) {
            param$1008 = parseExpression$760();
            // 12.14.1
            if (strict$683 && param$1008.type === Syntax$678.Identifier && isRestrictedWord$704(param$1008.name)) {
                throwErrorTolerant$721({}, Messages$680.StrictCatchVariable);
            }
        }
        expect$723(')');
        return {
            type: Syntax$678.CatchClause,
            param: param$1008,
            guard: null,
            body: parseBlock$762()
        };
    }
    function parseTryStatement$783() {
        var block$1009, handlers$1010 = [], finalizer$1011 = null;
        expectKeyword$724('try');
        block$1009 = parseBlock$762();
        if (matchKeyword$726('catch')) {
            handlers$1010.push(parseCatchClause$782());
        }
        if (matchKeyword$726('finally')) {
            lex$717();
            finalizer$1011 = parseBlock$762();
        }
        if (handlers$1010.length === 0 && !finalizer$1011) {
            throwError$720({}, Messages$680.NoCatchOrFinally);
        }
        return {
            type: Syntax$678.TryStatement,
            block: block$1009,
            handlers: handlers$1010,
            finalizer: finalizer$1011
        };
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$784() {
        expectKeyword$724('debugger');
        consumeSemicolon$728();
        return { type: Syntax$678.DebuggerStatement };
    }
    // 12 Statements
    function parseStatement$785() {
        var token$1012 = lookahead$718().token, expr$1013, labeledBody$1014;
        if (token$1012.type === Token$676.EOF) {
            throwUnexpected$722(token$1012);
        }
        if (token$1012.type === Token$676.Punctuator) {
            switch (token$1012.value) {
            case ';':
                return parseEmptyStatement$768();
            case '{':
                return parseBlock$762();
            case '(':
                return parseExpressionStatement$769();
            default:
                break;
            }
        }
        if (token$1012.type === Token$676.Keyword) {
            switch (token$1012.value) {
            case 'break':
                return parseBreakStatement$776();
            case 'continue':
                return parseContinueStatement$775();
            case 'debugger':
                return parseDebuggerStatement$784();
            case 'do':
                return parseDoWhileStatement$771();
            case 'for':
                return parseForStatement$774();
            case 'function':
                return parseFunctionDeclaration$787();
            case 'if':
                return parseIfStatement$770();
            case 'return':
                return parseReturnStatement$777();
            case 'switch':
                return parseSwitchStatement$780();
            case 'throw':
                return parseThrowStatement$781();
            case 'try':
                return parseTryStatement$783();
            case 'var':
                return parseVariableStatement$766();
            case 'while':
                return parseWhileStatement$772();
            case 'with':
                return parseWithStatement$778();
            default:
                break;
            }
        }
        expr$1013 = parseExpression$760();
        // 12.12 Labelled Statements
        if (expr$1013.type === Syntax$678.Identifier && match$725(':')) {
            lex$717();
            if (Object.prototype.hasOwnProperty.call(state$689.labelSet, expr$1013.name)) {
                throwError$720({}, Messages$680.Redeclaration, 'Label', expr$1013.name);
            }
            state$689.labelSet[expr$1013.name] = true;
            labeledBody$1014 = parseStatement$785();
            delete state$689.labelSet[expr$1013.name];
            return {
                type: Syntax$678.LabeledStatement,
                label: expr$1013,
                body: labeledBody$1014
            };
        }
        consumeSemicolon$728();
        return {
            type: Syntax$678.ExpressionStatement,
            expression: expr$1013
        };
    }
    // 13 Function Definition
    function parseFunctionSourceElements$786() {
        var sourceElement$1015, sourceElements$1016 = [], token$1017, directive$1018, firstRestricted$1019, oldLabelSet$1020, oldInIteration$1021, oldInSwitch$1022, oldInFunctionBody$1023;
        expect$723('{');
        while (index$684 < length$687) {
            token$1017 = lookahead$718().token;
            if (token$1017.type !== Token$676.StringLiteral) {
                break;
            }
            sourceElement$1015 = parseSourceElement$789();
            sourceElements$1016.push(sourceElement$1015);
            if (sourceElement$1015.expression.type !== Syntax$678.Literal) {
                // this is not directive
                break;
            }
            directive$1018 = sliceSource$694(token$1017.range[0] + 1, token$1017.range[1] - 1);
            if (directive$1018 === 'use strict') {
                strict$683 = true;
                if (firstRestricted$1019) {
                    throwError$720(firstRestricted$1019, Messages$680.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1019 && token$1017.octal) {
                    firstRestricted$1019 = token$1017;
                }
            }
        }
        oldLabelSet$1020 = state$689.labelSet;
        oldInIteration$1021 = state$689.inIteration;
        oldInSwitch$1022 = state$689.inSwitch;
        oldInFunctionBody$1023 = state$689.inFunctionBody;
        state$689.labelSet = {};
        state$689.inIteration = false;
        state$689.inSwitch = false;
        state$689.inFunctionBody = true;
        while (index$684 < length$687) {
            if (match$725('}')) {
                break;
            }
            sourceElement$1015 = parseSourceElement$789();
            if (typeof sourceElement$1015 === 'undefined') {
                break;
            }
            sourceElements$1016.push(sourceElement$1015);
        }
        expect$723('}');
        state$689.labelSet = oldLabelSet$1020;
        state$689.inIteration = oldInIteration$1021;
        state$689.inSwitch = oldInSwitch$1022;
        state$689.inFunctionBody = oldInFunctionBody$1023;
        return {
            type: Syntax$678.BlockStatement,
            body: sourceElements$1016
        };
    }
    function parseFunctionDeclaration$787() {
        var id$1024, param$1025, params$1026 = [], body$1027, token$1028, firstRestricted$1029, message$1030, previousStrict$1031, paramSet$1032;
        expectKeyword$724('function');
        token$1028 = lookahead$718().token;
        id$1024 = parseVariableIdentifier$763();
        if (strict$683) {
            if (isRestrictedWord$704(token$1028.value)) {
                throwError$720(token$1028, Messages$680.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$704(token$1028.value)) {
                firstRestricted$1029 = token$1028;
                message$1030 = Messages$680.StrictFunctionName;
            } else if (isStrictModeReservedWord$703(token$1028.value)) {
                firstRestricted$1029 = token$1028;
                message$1030 = Messages$680.StrictReservedWord;
            }
        }
        expect$723('(');
        if (!match$725(')')) {
            paramSet$1032 = {};
            while (index$684 < length$687) {
                token$1028 = lookahead$718().token;
                param$1025 = parseVariableIdentifier$763();
                if (strict$683) {
                    if (isRestrictedWord$704(token$1028.value)) {
                        throwError$720(token$1028, Messages$680.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$1032, token$1028.value)) {
                        throwError$720(token$1028, Messages$680.StrictParamDupe);
                    }
                } else if (!firstRestricted$1029) {
                    if (isRestrictedWord$704(token$1028.value)) {
                        firstRestricted$1029 = token$1028;
                        message$1030 = Messages$680.StrictParamName;
                    } else if (isStrictModeReservedWord$703(token$1028.value)) {
                        firstRestricted$1029 = token$1028;
                        message$1030 = Messages$680.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$1032, token$1028.value)) {
                        firstRestricted$1029 = token$1028;
                        message$1030 = Messages$680.StrictParamDupe;
                    }
                }
                params$1026.push(param$1025);
                paramSet$1032[param$1025.name] = true;
                if (match$725(')')) {
                    break;
                }
                expect$723(',');
            }
        }
        expect$723(')');
        previousStrict$1031 = strict$683;
        body$1027 = parseFunctionSourceElements$786();
        if (strict$683 && firstRestricted$1029) {
            throwError$720(firstRestricted$1029, message$1030);
        }
        strict$683 = previousStrict$1031;
        return {
            type: Syntax$678.FunctionDeclaration,
            id: id$1024,
            params: params$1026,
            body: body$1027
        };
    }
    function parseFunctionExpression$788() {
        var token$1033, id$1034 = null, firstRestricted$1035, message$1036, param$1037, params$1038 = [], body$1039, previousStrict$1040, paramSet$1041;
        expectKeyword$724('function');
        if (!match$725('(')) {
            token$1033 = lookahead$718().token;
            id$1034 = parseVariableIdentifier$763();
            if (strict$683) {
                if (isRestrictedWord$704(token$1033.value)) {
                    throwError$720(token$1033, Messages$680.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$704(token$1033.value)) {
                    firstRestricted$1035 = token$1033;
                    message$1036 = Messages$680.StrictFunctionName;
                } else if (isStrictModeReservedWord$703(token$1033.value)) {
                    firstRestricted$1035 = token$1033;
                    message$1036 = Messages$680.StrictReservedWord;
                }
            }
        }
        expect$723('(');
        if (!match$725(')')) {
            paramSet$1041 = {};
            while (index$684 < length$687) {
                token$1033 = lookahead$718().token;
                param$1037 = parseVariableIdentifier$763();
                if (strict$683) {
                    if (isRestrictedWord$704(token$1033.value)) {
                        throwError$720(token$1033, Messages$680.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$1041, token$1033.value)) {
                        throwError$720(token$1033, Messages$680.StrictParamDupe);
                    }
                } else if (!firstRestricted$1035) {
                    if (isRestrictedWord$704(token$1033.value)) {
                        firstRestricted$1035 = token$1033;
                        message$1036 = Messages$680.StrictParamName;
                    } else if (isStrictModeReservedWord$703(token$1033.value)) {
                        firstRestricted$1035 = token$1033;
                        message$1036 = Messages$680.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$1041, token$1033.value)) {
                        firstRestricted$1035 = token$1033;
                        message$1036 = Messages$680.StrictParamDupe;
                    }
                }
                params$1038.push(param$1037);
                paramSet$1041[param$1037.name] = true;
                if (match$725(')')) {
                    break;
                }
                expect$723(',');
            }
        }
        expect$723(')');
        previousStrict$1040 = strict$683;
        body$1039 = parseFunctionSourceElements$786();
        if (strict$683 && firstRestricted$1035) {
            throwError$720(firstRestricted$1035, message$1036);
        }
        strict$683 = previousStrict$1040;
        return {
            type: Syntax$678.FunctionExpression,
            id: id$1034,
            params: params$1038,
            body: body$1039
        };
    }
    // 14 Program
    function parseSourceElement$789() {
        var token$1042 = lookahead$718().token;
        if (token$1042.type === Token$676.Keyword) {
            switch (token$1042.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$767(token$1042.value);
            case 'function':
                return parseFunctionDeclaration$787();
            default:
                return parseStatement$785();
            }
        }
        if (token$1042.type !== Token$676.EOF) {
            return parseStatement$785();
        }
    }
    function parseSourceElements$790() {
        var sourceElement$1043, sourceElements$1044 = [], token$1045, directive$1046, firstRestricted$1047;
        while (index$684 < length$687) {
            token$1045 = lookahead$718();
            if (token$1045.type !== Token$676.StringLiteral) {
                break;
            }
            sourceElement$1043 = parseSourceElement$789();
            sourceElements$1044.push(sourceElement$1043);
            if (sourceElement$1043.expression.type !== Syntax$678.Literal) {
                // this is not directive
                break;
            }
            directive$1046 = sliceSource$694(token$1045.range[0] + 1, token$1045.range[1] - 1);
            if (directive$1046 === 'use strict') {
                strict$683 = true;
                if (firstRestricted$1047) {
                    throwError$720(firstRestricted$1047, Messages$680.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1047 && token$1045.octal) {
                    firstRestricted$1047 = token$1045;
                }
            }
        }
        while (index$684 < length$687) {
            sourceElement$1043 = parseSourceElement$789();
            if (typeof sourceElement$1043 === 'undefined') {
                break;
            }
            sourceElements$1044.push(sourceElement$1043);
        }
        return sourceElements$1044;
    }
    function parseProgram$791() {
        var program$1048;
        strict$683 = false;
        program$1048 = {
            type: Syntax$678.Program,
            body: parseSourceElements$790()
        };
        return program$1048;
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$792(start$1049, end$1050, type$1051, value$1052) {
        assert$692(typeof start$1049 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$691.comments.length > 0) {
            if (extra$691.comments[extra$691.comments.length - 1].range[1] > start$1049) {
                return;
            }
        }
        extra$691.comments.push({
            range: [
                start$1049,
                end$1050
            ],
            type: type$1051,
            value: value$1052
        });
    }
    function scanComment$793() {
        var comment$1053, ch$1054, start$1055, blockComment$1056, lineComment$1057;
        comment$1053 = '';
        blockComment$1056 = false;
        lineComment$1057 = false;
        while (index$684 < length$687) {
            ch$1054 = source$682[index$684];
            if (lineComment$1057) {
                ch$1054 = nextChar$706();
                if (index$684 >= length$687) {
                    lineComment$1057 = false;
                    comment$1053 += ch$1054;
                    addComment$792(start$1055, index$684, 'Line', comment$1053);
                } else if (isLineTerminator$699(ch$1054)) {
                    lineComment$1057 = false;
                    addComment$792(start$1055, index$684, 'Line', comment$1053);
                    if (ch$1054 === '\r' && source$682[index$684] === '\n') {
                        ++index$684;
                    }
                    ++lineNumber$685;
                    lineStart$686 = index$684;
                    comment$1053 = '';
                } else {
                    comment$1053 += ch$1054;
                }
            } else if (blockComment$1056) {
                if (isLineTerminator$699(ch$1054)) {
                    if (ch$1054 === '\r' && source$682[index$684 + 1] === '\n') {
                        ++index$684;
                        comment$1053 += '\r\n';
                    } else {
                        comment$1053 += ch$1054;
                    }
                    ++lineNumber$685;
                    ++index$684;
                    lineStart$686 = index$684;
                    if (index$684 >= length$687) {
                        throwError$720({}, Messages$680.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1054 = nextChar$706();
                    if (index$684 >= length$687) {
                        throwError$720({}, Messages$680.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1053 += ch$1054;
                    if (ch$1054 === '*') {
                        ch$1054 = source$682[index$684];
                        if (ch$1054 === '/') {
                            comment$1053 = comment$1053.substr(0, comment$1053.length - 1);
                            blockComment$1056 = false;
                            ++index$684;
                            addComment$792(start$1055, index$684, 'Block', comment$1053);
                            comment$1053 = '';
                        }
                    }
                }
            } else if (ch$1054 === '/') {
                ch$1054 = source$682[index$684 + 1];
                if (ch$1054 === '/') {
                    start$1055 = index$684;
                    index$684 += 2;
                    lineComment$1057 = true;
                } else if (ch$1054 === '*') {
                    start$1055 = index$684;
                    index$684 += 2;
                    blockComment$1056 = true;
                    if (index$684 >= length$687) {
                        throwError$720({}, Messages$680.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$698(ch$1054)) {
                ++index$684;
            } else if (isLineTerminator$699(ch$1054)) {
                ++index$684;
                if (ch$1054 === '\r' && source$682[index$684] === '\n') {
                    ++index$684;
                }
                ++lineNumber$685;
                lineStart$686 = index$684;
            } else {
                break;
            }
        }
    }
    function collectToken$794() {
        var token$1058 = extra$691.advance(), range$1059, value$1060;
        if (token$1058.type !== Token$676.EOF) {
            range$1059 = [
                token$1058.range[0],
                token$1058.range[1]
            ];
            value$1060 = sliceSource$694(token$1058.range[0], token$1058.range[1]);
            extra$691.tokens.push({
                type: TokenName$677[token$1058.type],
                value: value$1060,
                lineNumber: lineNumber$685,
                lineStart: lineStart$686,
                range: range$1059
            });
        }
        return token$1058;
    }
    function collectRegex$795() {
        var pos$1061, regex$1062, token$1063;
        skipComment$708();
        pos$1061 = index$684;
        regex$1062 = extra$691.scanRegExp();
        // Pop the previous token, which is likely '/' or '/='
        if (extra$691.tokens.length > 0) {
            token$1063 = extra$691.tokens[extra$691.tokens.length - 1];
            if (token$1063.range[0] === pos$1061 && token$1063.type === 'Punctuator') {
                if (token$1063.value === '/' || token$1063.value === '/=') {
                    extra$691.tokens.pop();
                }
            }
        }
        extra$691.tokens.push({
            type: 'RegularExpression',
            value: regex$1062.literal,
            range: [
                pos$1061,
                index$684
            ],
            lineStart: token$1063.lineStart,
            lineNumber: token$1063.lineNumber
        });
        return regex$1062;
    }
    function createLiteral$796(token$1064) {
        if (Array.isArray(token$1064)) {
            return {
                type: Syntax$678.Literal,
                value: token$1064
            };
        }
        return {
            type: Syntax$678.Literal,
            value: token$1064.value,
            lineStart: token$1064.lineStart,
            lineNumber: token$1064.lineNumber
        };
    }
    function createRawLiteral$797(token$1065) {
        return {
            type: Syntax$678.Literal,
            value: token$1065.value,
            raw: sliceSource$694(token$1065.range[0], token$1065.range[1]),
            lineStart: token$1065.lineStart,
            lineNumber: token$1065.lineNumber
        };
    }
    function wrapTrackingFunction$798(range$1066, loc$1067) {
        return function (parseFunction$1068) {
            function isBinary$1069(node$1071) {
                return node$1071.type === Syntax$678.LogicalExpression || node$1071.type === Syntax$678.BinaryExpression;
            }
            function visit$1070(node$1072) {
                if (isBinary$1069(node$1072.left)) {
                    visit$1070(node$1072.left);
                }
                if (isBinary$1069(node$1072.right)) {
                    visit$1070(node$1072.right);
                }
                if (range$1066 && typeof node$1072.range === 'undefined') {
                    node$1072.range = [
                        node$1072.left.range[0],
                        node$1072.right.range[1]
                    ];
                }
                if (loc$1067 && typeof node$1072.loc === 'undefined') {
                    node$1072.loc = {
                        start: node$1072.left.loc.start,
                        end: node$1072.right.loc.end
                    };
                }
            }
            return function () {
                var node$1073, rangeInfo$1074, locInfo$1075;
                // skipComment();
                var curr$1076 = tokenStream$690[index$684].token;
                rangeInfo$1074 = [
                    curr$1076.range[0],
                    0
                ];
                locInfo$1075 = {
                    start: {
                        line: curr$1076.sm_lineNumber,
                        column: curr$1076.sm_range[0] - curr$1076.sm_lineStart
                    }
                };
                node$1073 = parseFunction$1068.apply(null, arguments);
                if (typeof node$1073 !== 'undefined') {
                    var last$1077 = tokenStream$690[index$684].token;
                    if (range$1066) {
                        rangeInfo$1074[1] = last$1077.range[1];
                        node$1073.range = rangeInfo$1074;
                    }
                    if (loc$1067) {
                        locInfo$1075.end = {
                            line: last$1077.sm_lineNumber,
                            column: last$1077.sm_range[0] - last$1077.sm_lineStart
                        };
                        node$1073.loc = locInfo$1075;
                    }
                    if (isBinary$1069(node$1073)) {
                        visit$1070(node$1073);
                    }
                    if (node$1073.type === Syntax$678.MemberExpression) {
                        if (typeof node$1073.object.range !== 'undefined') {
                            node$1073.range[0] = node$1073.object.range[0];
                        }
                        if (typeof node$1073.object.loc !== 'undefined') {
                            node$1073.loc.start = node$1073.object.loc.start;
                        }
                    }
                    if (node$1073.type === Syntax$678.CallExpression) {
                        if (typeof node$1073.callee.range !== 'undefined') {
                            node$1073.range[0] = node$1073.callee.range[0];
                        }
                        if (typeof node$1073.callee.loc !== 'undefined') {
                            node$1073.loc.start = node$1073.callee.loc.start;
                        }
                    }
                    if (node$1073.type !== Syntax$678.Program) {
                        if (curr$1076.leadingComments) {
                            node$1073.leadingComments = curr$1076.leadingComments;
                        }
                        if (curr$1076.trailingComments) {
                            node$1073.trailingComments = curr$1076.trailingComments;
                        }
                    }
                    return node$1073;
                }
            };
        };
    }
    function patch$799() {
        var wrapTracking$1078;
        if (extra$691.comments) {
            extra$691.skipComment = skipComment$708;
            skipComment$708 = scanComment$793;
        }
        if (extra$691.raw) {
            extra$691.createLiteral = createLiteral$796;
            createLiteral$796 = createRawLiteral$797;
        }
        if (extra$691.range || extra$691.loc) {
            wrapTracking$1078 = wrapTrackingFunction$798(extra$691.range, extra$691.loc);
            extra$691.parseAdditiveExpression = parseAdditiveExpression$749;
            extra$691.parseAssignmentExpression = parseAssignmentExpression$759;
            extra$691.parseBitwiseANDExpression = parseBitwiseANDExpression$753;
            extra$691.parseBitwiseORExpression = parseBitwiseORExpression$755;
            extra$691.parseBitwiseXORExpression = parseBitwiseXORExpression$754;
            extra$691.parseBlock = parseBlock$762;
            extra$691.parseFunctionSourceElements = parseFunctionSourceElements$786;
            extra$691.parseCallMember = parseCallMember$740;
            extra$691.parseCatchClause = parseCatchClause$782;
            extra$691.parseComputedMember = parseComputedMember$739;
            extra$691.parseConditionalExpression = parseConditionalExpression$758;
            extra$691.parseConstLetDeclaration = parseConstLetDeclaration$767;
            extra$691.parseEqualityExpression = parseEqualityExpression$752;
            extra$691.parseExpression = parseExpression$760;
            extra$691.parseForVariableDeclaration = parseForVariableDeclaration$773;
            extra$691.parseFunctionDeclaration = parseFunctionDeclaration$787;
            extra$691.parseFunctionExpression = parseFunctionExpression$788;
            extra$691.parseLogicalANDExpression = parseLogicalANDExpression$756;
            extra$691.parseLogicalORExpression = parseLogicalORExpression$757;
            extra$691.parseMultiplicativeExpression = parseMultiplicativeExpression$748;
            extra$691.parseNewExpression = parseNewExpression$741;
            extra$691.parseNonComputedMember = parseNonComputedMember$738;
            extra$691.parseNonComputedProperty = parseNonComputedProperty$737;
            extra$691.parseObjectProperty = parseObjectProperty$733;
            extra$691.parseObjectPropertyKey = parseObjectPropertyKey$732;
            extra$691.parsePostfixExpression = parsePostfixExpression$746;
            extra$691.parsePrimaryExpression = parsePrimaryExpression$735;
            extra$691.parseProgram = parseProgram$791;
            extra$691.parsePropertyFunction = parsePropertyFunction$731;
            extra$691.parseRelationalExpression = parseRelationalExpression$751;
            extra$691.parseStatement = parseStatement$785;
            extra$691.parseShiftExpression = parseShiftExpression$750;
            extra$691.parseSwitchCase = parseSwitchCase$779;
            extra$691.parseUnaryExpression = parseUnaryExpression$747;
            extra$691.parseVariableDeclaration = parseVariableDeclaration$764;
            extra$691.parseVariableIdentifier = parseVariableIdentifier$763;
            parseAdditiveExpression$749 = wrapTracking$1078(extra$691.parseAdditiveExpression);
            parseAssignmentExpression$759 = wrapTracking$1078(extra$691.parseAssignmentExpression);
            parseBitwiseANDExpression$753 = wrapTracking$1078(extra$691.parseBitwiseANDExpression);
            parseBitwiseORExpression$755 = wrapTracking$1078(extra$691.parseBitwiseORExpression);
            parseBitwiseXORExpression$754 = wrapTracking$1078(extra$691.parseBitwiseXORExpression);
            parseBlock$762 = wrapTracking$1078(extra$691.parseBlock);
            parseFunctionSourceElements$786 = wrapTracking$1078(extra$691.parseFunctionSourceElements);
            parseCallMember$740 = wrapTracking$1078(extra$691.parseCallMember);
            parseCatchClause$782 = wrapTracking$1078(extra$691.parseCatchClause);
            parseComputedMember$739 = wrapTracking$1078(extra$691.parseComputedMember);
            parseConditionalExpression$758 = wrapTracking$1078(extra$691.parseConditionalExpression);
            parseConstLetDeclaration$767 = wrapTracking$1078(extra$691.parseConstLetDeclaration);
            parseEqualityExpression$752 = wrapTracking$1078(extra$691.parseEqualityExpression);
            parseExpression$760 = wrapTracking$1078(extra$691.parseExpression);
            parseForVariableDeclaration$773 = wrapTracking$1078(extra$691.parseForVariableDeclaration);
            parseFunctionDeclaration$787 = wrapTracking$1078(extra$691.parseFunctionDeclaration);
            parseFunctionExpression$788 = wrapTracking$1078(extra$691.parseFunctionExpression);
            parseLogicalANDExpression$756 = wrapTracking$1078(extra$691.parseLogicalANDExpression);
            parseLogicalORExpression$757 = wrapTracking$1078(extra$691.parseLogicalORExpression);
            parseMultiplicativeExpression$748 = wrapTracking$1078(extra$691.parseMultiplicativeExpression);
            parseNewExpression$741 = wrapTracking$1078(extra$691.parseNewExpression);
            parseNonComputedMember$738 = wrapTracking$1078(extra$691.parseNonComputedMember);
            parseNonComputedProperty$737 = wrapTracking$1078(extra$691.parseNonComputedProperty);
            parseObjectProperty$733 = wrapTracking$1078(extra$691.parseObjectProperty);
            parseObjectPropertyKey$732 = wrapTracking$1078(extra$691.parseObjectPropertyKey);
            parsePostfixExpression$746 = wrapTracking$1078(extra$691.parsePostfixExpression);
            parsePrimaryExpression$735 = wrapTracking$1078(extra$691.parsePrimaryExpression);
            parseProgram$791 = wrapTracking$1078(extra$691.parseProgram);
            parsePropertyFunction$731 = wrapTracking$1078(extra$691.parsePropertyFunction);
            parseRelationalExpression$751 = wrapTracking$1078(extra$691.parseRelationalExpression);
            parseStatement$785 = wrapTracking$1078(extra$691.parseStatement);
            parseShiftExpression$750 = wrapTracking$1078(extra$691.parseShiftExpression);
            parseSwitchCase$779 = wrapTracking$1078(extra$691.parseSwitchCase);
            parseUnaryExpression$747 = wrapTracking$1078(extra$691.parseUnaryExpression);
            parseVariableDeclaration$764 = wrapTracking$1078(extra$691.parseVariableDeclaration);
            parseVariableIdentifier$763 = wrapTracking$1078(extra$691.parseVariableIdentifier);
        }
        if (typeof extra$691.tokens !== 'undefined') {
            extra$691.advance = advance$716;
            extra$691.scanRegExp = scanRegExp$714;
            advance$716 = collectToken$794;
            scanRegExp$714 = collectRegex$795;
        }
    }
    function unpatch$800() {
        if (typeof extra$691.skipComment === 'function') {
            skipComment$708 = extra$691.skipComment;
        }
        if (extra$691.raw) {
            createLiteral$796 = extra$691.createLiteral;
        }
        if (extra$691.range || extra$691.loc) {
            parseAdditiveExpression$749 = extra$691.parseAdditiveExpression;
            parseAssignmentExpression$759 = extra$691.parseAssignmentExpression;
            parseBitwiseANDExpression$753 = extra$691.parseBitwiseANDExpression;
            parseBitwiseORExpression$755 = extra$691.parseBitwiseORExpression;
            parseBitwiseXORExpression$754 = extra$691.parseBitwiseXORExpression;
            parseBlock$762 = extra$691.parseBlock;
            parseFunctionSourceElements$786 = extra$691.parseFunctionSourceElements;
            parseCallMember$740 = extra$691.parseCallMember;
            parseCatchClause$782 = extra$691.parseCatchClause;
            parseComputedMember$739 = extra$691.parseComputedMember;
            parseConditionalExpression$758 = extra$691.parseConditionalExpression;
            parseConstLetDeclaration$767 = extra$691.parseConstLetDeclaration;
            parseEqualityExpression$752 = extra$691.parseEqualityExpression;
            parseExpression$760 = extra$691.parseExpression;
            parseForVariableDeclaration$773 = extra$691.parseForVariableDeclaration;
            parseFunctionDeclaration$787 = extra$691.parseFunctionDeclaration;
            parseFunctionExpression$788 = extra$691.parseFunctionExpression;
            parseLogicalANDExpression$756 = extra$691.parseLogicalANDExpression;
            parseLogicalORExpression$757 = extra$691.parseLogicalORExpression;
            parseMultiplicativeExpression$748 = extra$691.parseMultiplicativeExpression;
            parseNewExpression$741 = extra$691.parseNewExpression;
            parseNonComputedMember$738 = extra$691.parseNonComputedMember;
            parseNonComputedProperty$737 = extra$691.parseNonComputedProperty;
            parseObjectProperty$733 = extra$691.parseObjectProperty;
            parseObjectPropertyKey$732 = extra$691.parseObjectPropertyKey;
            parsePrimaryExpression$735 = extra$691.parsePrimaryExpression;
            parsePostfixExpression$746 = extra$691.parsePostfixExpression;
            parseProgram$791 = extra$691.parseProgram;
            parsePropertyFunction$731 = extra$691.parsePropertyFunction;
            parseRelationalExpression$751 = extra$691.parseRelationalExpression;
            parseStatement$785 = extra$691.parseStatement;
            parseShiftExpression$750 = extra$691.parseShiftExpression;
            parseSwitchCase$779 = extra$691.parseSwitchCase;
            parseUnaryExpression$747 = extra$691.parseUnaryExpression;
            parseVariableDeclaration$764 = extra$691.parseVariableDeclaration;
            parseVariableIdentifier$763 = extra$691.parseVariableIdentifier;
        }
        if (typeof extra$691.scanRegExp === 'function') {
            advance$716 = extra$691.advance;
            scanRegExp$714 = extra$691.scanRegExp;
        }
    }
    function stringToArray$801(str$1079) {
        var length$1080 = str$1079.length, result$1081 = [], i$1082;
        for (i$1082 = 0; i$1082 < length$1080; ++i$1082) {
            result$1081[i$1082] = str$1079.charAt(i$1082);
        }
        return result$1081;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$802(toks$1083, start$1084, inExprDelim$1085, parentIsBlock$1086) {
        var assignOps$1087 = [
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
        var binaryOps$1088 = [
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
        var unaryOps$1089 = [
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
        function back$1090(n$1091) {
            var idx$1092 = toks$1083.length - n$1091 > 0 ? toks$1083.length - n$1091 : 0;
            return toks$1083[idx$1092];
        }
        if (inExprDelim$1085 && toks$1083.length - (start$1084 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1090(start$1084 + 2).value === ':' && parentIsBlock$1086) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$693(back$1090(start$1084 + 2).value, unaryOps$1089.concat(binaryOps$1088).concat(assignOps$1087))) {
            // ... + {...}
            return false;
        } else if (back$1090(start$1084 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1093 = typeof back$1090(start$1084 + 1).startLineNumber !== 'undefined' ? back$1090(start$1084 + 1).startLineNumber : back$1090(start$1084 + 1).lineNumber;
            if (back$1090(start$1084 + 2).lineNumber !== currLineNumber$1093) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$693(back$1090(start$1084 + 2).value, [
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
    function readToken$803(toks$1094, inExprDelim$1095, parentIsBlock$1096) {
        var delimiters$1097 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1098 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1099 = toks$1094.length - 1;
        var comments$1100, commentsLen$1101 = extra$691.comments.length;
        function back$1102(n$1106) {
            var idx$1107 = toks$1094.length - n$1106 > 0 ? toks$1094.length - n$1106 : 0;
            return toks$1094[idx$1107];
        }
        function attachComments$1103(token$1108) {
            if (comments$1100) {
                token$1108.leadingComments = comments$1100;
            }
            return token$1108;
        }
        function _advance$1104() {
            return attachComments$1103(advance$716());
        }
        function _scanRegExp$1105() {
            return attachComments$1103(scanRegExp$714());
        }
        skipComment$708();
        if (extra$691.comments.length > commentsLen$1101) {
            comments$1100 = extra$691.comments.slice(commentsLen$1101);
        }
        if (isIn$693(getChar$707(), delimiters$1097)) {
            return attachComments$1103(readDelim$804(toks$1094, inExprDelim$1095, parentIsBlock$1096));
        }
        if (getChar$707() === '/') {
            var prev$1109 = back$1102(1);
            if (prev$1109) {
                if (prev$1109.value === '()') {
                    if (isIn$693(back$1102(2).value, parenIdents$1098)) {
                        // ... if (...) / ...
                        return _scanRegExp$1105();
                    }
                    // ... (...) / ...
                    return _advance$1104();
                }
                if (prev$1109.value === '{}') {
                    if (blockAllowed$802(toks$1094, 0, inExprDelim$1095, parentIsBlock$1096)) {
                        if (back$1102(2).value === '()') {
                            // named function
                            if (back$1102(4).value === 'function') {
                                if (!blockAllowed$802(toks$1094, 3, inExprDelim$1095, parentIsBlock$1096)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1104();
                                }
                                if (toks$1094.length - 5 <= 0 && inExprDelim$1095) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1104();
                                }
                            }
                            // unnamed function
                            if (back$1102(3).value === 'function') {
                                if (!blockAllowed$802(toks$1094, 2, inExprDelim$1095, parentIsBlock$1096)) {
                                    // new function (...) {...} / ...
                                    return _advance$1104();
                                }
                                if (toks$1094.length - 4 <= 0 && inExprDelim$1095) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1104();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1105();
                    } else {
                        // ... + {...} / ...
                        return _advance$1104();
                    }
                }
                if (prev$1109.type === Token$676.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1105();
                }
                if (isKeyword$705(prev$1109.value)) {
                    // typeof /...
                    return _scanRegExp$1105();
                }
                return _advance$1104();
            }
            return _scanRegExp$1105();
        }
        return _advance$1104();
    }
    function readDelim$804(toks$1110, inExprDelim$1111, parentIsBlock$1112) {
        var startDelim$1113 = advance$716(), matchDelim$1114 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1115 = [];
        var delimiters$1116 = [
                '(',
                '{',
                '['
            ];
        assert$692(delimiters$1116.indexOf(startDelim$1113.value) !== -1, 'Need to begin at the delimiter');
        var token$1117 = startDelim$1113;
        var startLineNumber$1118 = token$1117.lineNumber;
        var startLineStart$1119 = token$1117.lineStart;
        var startRange$1120 = token$1117.range;
        var delimToken$1121 = {};
        delimToken$1121.type = Token$676.Delimiter;
        delimToken$1121.value = startDelim$1113.value + matchDelim$1114[startDelim$1113.value];
        delimToken$1121.startLineNumber = startLineNumber$1118;
        delimToken$1121.startLineStart = startLineStart$1119;
        delimToken$1121.startRange = startRange$1120;
        var delimIsBlock$1122 = false;
        if (startDelim$1113.value === '{') {
            delimIsBlock$1122 = blockAllowed$802(toks$1110.concat(delimToken$1121), 0, inExprDelim$1111, parentIsBlock$1112);
        }
        while (index$684 <= length$687) {
            token$1117 = readToken$803(inner$1115, startDelim$1113.value === '(' || startDelim$1113.value === '[', delimIsBlock$1122);
            if (token$1117.type === Token$676.Punctuator && token$1117.value === matchDelim$1114[startDelim$1113.value]) {
                if (token$1117.leadingComments) {
                    delimToken$1121.trailingComments = token$1117.leadingComments;
                }
                break;
            } else if (token$1117.type === Token$676.EOF) {
                throwError$720({}, Messages$680.UnexpectedEOS);
            } else {
                inner$1115.push(token$1117);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$684 >= length$687 && matchDelim$1114[startDelim$1113.value] !== source$682[length$687 - 1]) {
            throwError$720({}, Messages$680.UnexpectedEOS);
        }
        var endLineNumber$1123 = token$1117.lineNumber;
        var endLineStart$1124 = token$1117.lineStart;
        var endRange$1125 = token$1117.range;
        delimToken$1121.inner = inner$1115;
        delimToken$1121.endLineNumber = endLineNumber$1123;
        delimToken$1121.endLineStart = endLineStart$1124;
        delimToken$1121.endRange = endRange$1125;
        return delimToken$1121;
    }
    ;
    // (Str) -> [...CSyntax]
    function read$805(code$1126) {
        var token$1127, tokenTree$1128 = [];
        extra$691 = {};
        extra$691.comments = [];
        patch$799();
        source$682 = code$1126;
        index$684 = 0;
        lineNumber$685 = source$682.length > 0 ? 1 : 0;
        lineStart$686 = 0;
        length$687 = source$682.length;
        buffer$688 = null;
        state$689 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$684 < length$687) {
            tokenTree$1128.push(readToken$803(tokenTree$1128, false, false));
        }
        var last$1129 = tokenTree$1128[tokenTree$1128.length - 1];
        if (last$1129 && last$1129.type !== Token$676.EOF) {
            tokenTree$1128.push({
                type: Token$676.EOF,
                value: '',
                lineNumber: last$1129.lineNumber,
                lineStart: last$1129.lineStart,
                range: [
                    index$684,
                    index$684
                ]
            });
        }
        return expander$675.tokensToSyntax(tokenTree$1128);
    }
    // (SyntaxObject, Str, {}) -> SyntaxObject
    function parse$806(code$1130) {
        var program$1131, toString$1132;
        tokenStream$690 = code$1130;
        index$684 = 0;
        length$687 = tokenStream$690.length;
        buffer$688 = null;
        state$689 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$691 = {
            range: true,
            loc: true
        };
        patch$799();
        try {
            program$1131 = parseProgram$791();
            program$1131.tokens = expander$675.syntaxToTokens(code$1130);
        } catch (e$1133) {
            throw e$1133;
        } finally {
            unpatch$800();
            extra$691 = {};
        }
        return program$1131;
    }
    exports$674.parse = parse$806;
    exports$674.read = read$805;
    exports$674.Token = Token$676;
    exports$674.assert = assert$692;
    // Deep copy.
    exports$674.Syntax = function () {
        var name$1134, types$1135 = {};
        if (typeof Object.create === 'function') {
            types$1135 = Object.create(null);
        }
        for (name$1134 in Syntax$678) {
            if (Syntax$678.hasOwnProperty(name$1134)) {
                types$1135[name$1134] = Syntax$678[name$1134];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1135);
        }
        return types$1135;
    }();
}));