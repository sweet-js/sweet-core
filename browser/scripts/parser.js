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
(function (root$700, factory$701) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$701(exports, require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'expander'
        ], factory$701);
    }
}(this, function (exports$702, expander$703) {
    'use strict';
    var Token$704, TokenName$705, Syntax$706, PropertyKind$707, Messages$708, Regex$709, source$710, strict$711, index$712, lineNumber$713, lineStart$714, length$715, buffer$716, state$717, tokenStream$718, extra$719;
    Token$704 = {
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
    TokenName$705 = {};
    TokenName$705[Token$704.BooleanLiteral] = 'Boolean';
    TokenName$705[Token$704.EOF] = '<end>';
    TokenName$705[Token$704.Identifier] = 'Identifier';
    TokenName$705[Token$704.Keyword] = 'Keyword';
    TokenName$705[Token$704.NullLiteral] = 'Null';
    TokenName$705[Token$704.NumericLiteral] = 'Numeric';
    TokenName$705[Token$704.Punctuator] = 'Punctuator';
    TokenName$705[Token$704.StringLiteral] = 'String';
    TokenName$705[Token$704.Delimiter] = 'Delimiter';
    Syntax$706 = {
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
    PropertyKind$707 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    // Error messages should be identical to V8.
    Messages$708 = {
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
    Regex$709 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$720(condition$835, message$836) {
        if (!condition$835) {
            throw new Error('ASSERT: ' + message$836);
        }
    }
    function isIn$721(el$837, list$838) {
        return list$838.indexOf(el$837) !== -1;
    }
    function sliceSource$722(from$839, to$840) {
        return source$710.slice(from$839, to$840);
    }
    if (typeof 'esprima'[0] === 'undefined') {
        sliceSource$722 = function sliceArraySource$841(from$842, to$843) {
            return source$710.slice(from$842, to$843).join('');
        };
    }
    function isDecimalDigit$723(ch$844) {
        return '0123456789'.indexOf(ch$844) >= 0;
    }
    function isHexDigit$724(ch$845) {
        return '0123456789abcdefABCDEF'.indexOf(ch$845) >= 0;
    }
    function isOctalDigit$725(ch$846) {
        return '01234567'.indexOf(ch$846) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$726(ch$847) {
        return ch$847 === ' ' || ch$847 === '\t' || ch$847 === '\x0B' || ch$847 === '\f' || ch$847 === '\xa0' || ch$847.charCodeAt(0) >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(ch$847) >= 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$727(ch$848) {
        return ch$848 === '\n' || ch$848 === '\r' || ch$848 === '\u2028' || ch$848 === '\u2029';
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$728(ch$849) {
        return ch$849 === '$' || ch$849 === '_' || ch$849 === '\\' || ch$849 >= 'a' && ch$849 <= 'z' || ch$849 >= 'A' && ch$849 <= 'Z' || ch$849.charCodeAt(0) >= 128 && Regex$709.NonAsciiIdentifierStart.test(ch$849);
    }
    function isIdentifierPart$729(ch$850) {
        return ch$850 === '$' || ch$850 === '_' || ch$850 === '\\' || ch$850 >= 'a' && ch$850 <= 'z' || ch$850 >= 'A' && ch$850 <= 'Z' || ch$850 >= '0' && ch$850 <= '9' || ch$850.charCodeAt(0) >= 128 && Regex$709.NonAsciiIdentifierPart.test(ch$850);
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$730(id$851) {
        // we are allowing future reserved words so macros can be written for them
        return false;
    }
    function isStrictModeReservedWord$731(id$852) {
        switch (id$852) {
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
    function isRestrictedWord$732(id$853) {
        return id$853 === 'eval' || id$853 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$733(id$854) {
        var keyword$855 = false;
        switch (id$854.length) {
        case 2:
            keyword$855 = id$854 === 'if' || id$854 === 'in' || id$854 === 'do';
            break;
        case 3:
            keyword$855 = id$854 === 'var' || id$854 === 'for' || id$854 === 'new' || id$854 === 'try';
            break;
        case 4:
            keyword$855 = id$854 === 'this' || id$854 === 'else' || id$854 === 'case' || id$854 === 'void' || id$854 === 'with';
            break;
        case 5:
            keyword$855 = id$854 === 'while' || id$854 === 'break' || id$854 === 'catch' || id$854 === 'throw';
            break;
        case 6:
            keyword$855 = id$854 === 'return' || id$854 === 'typeof' || id$854 === 'delete' || id$854 === 'switch';
            break;
        case 7:
            keyword$855 = id$854 === 'default' || id$854 === 'finally';
            break;
        case 8:
            keyword$855 = id$854 === 'function' || id$854 === 'continue' || id$854 === 'debugger';
            break;
        case 10:
            keyword$855 = id$854 === 'instanceof';
            break;
        }
        if (keyword$855) {
            return true;
        }
        switch (id$854) {
        // Future reserved words.
        // 'const' is specialized as Keyword in V8.
        case 'const':
            return true;
        // For compatiblity to SpiderMonkey and ES.next
        case 'yield':
        case 'let':
            return true;
        }
        if (strict$711 && isStrictModeReservedWord$731(id$854)) {
            return true;
        }
        return isFutureReservedWord$730(id$854);
    }
    // Return the next character and move forward.
    function nextChar$734() {
        return source$710[index$712++];
    }
    function getChar$735() {
        return source$710[index$712];
    }
    // 7.4 Comments
    function skipComment$736() {
        var ch$856, blockComment$857, lineComment$858;
        blockComment$857 = false;
        lineComment$858 = false;
        while (index$712 < length$715) {
            ch$856 = source$710[index$712];
            if (lineComment$858) {
                ch$856 = nextChar$734();
                if (isLineTerminator$727(ch$856)) {
                    lineComment$858 = false;
                    if (ch$856 === '\r' && source$710[index$712] === '\n') {
                        ++index$712;
                    }
                    ++lineNumber$713;
                    lineStart$714 = index$712;
                }
            } else if (blockComment$857) {
                if (isLineTerminator$727(ch$856)) {
                    if (ch$856 === '\r' && source$710[index$712 + 1] === '\n') {
                        ++index$712;
                    }
                    ++lineNumber$713;
                    ++index$712;
                    lineStart$714 = index$712;
                    if (index$712 >= length$715) {
                        throwError$748({}, Messages$708.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$856 = nextChar$734();
                    if (index$712 >= length$715) {
                        throwError$748({}, Messages$708.UnexpectedToken, 'ILLEGAL');
                    }
                    if (ch$856 === '*') {
                        ch$856 = source$710[index$712];
                        if (ch$856 === '/') {
                            ++index$712;
                            blockComment$857 = false;
                        }
                    }
                }
            } else if (ch$856 === '/') {
                ch$856 = source$710[index$712 + 1];
                if (ch$856 === '/') {
                    index$712 += 2;
                    lineComment$858 = true;
                } else if (ch$856 === '*') {
                    index$712 += 2;
                    blockComment$857 = true;
                    if (index$712 >= length$715) {
                        throwError$748({}, Messages$708.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$726(ch$856)) {
                ++index$712;
            } else if (isLineTerminator$727(ch$856)) {
                ++index$712;
                if (ch$856 === '\r' && source$710[index$712] === '\n') {
                    ++index$712;
                }
                ++lineNumber$713;
                lineStart$714 = index$712;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$737(prefix$859) {
        var i$860, len$861, ch$862, code$863 = 0;
        len$861 = prefix$859 === 'u' ? 4 : 2;
        for (i$860 = 0; i$860 < len$861; ++i$860) {
            if (index$712 < length$715 && isHexDigit$724(source$710[index$712])) {
                ch$862 = nextChar$734();
                code$863 = code$863 * 16 + '0123456789abcdef'.indexOf(ch$862.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$863);
    }
    function scanIdentifier$738() {
        var ch$864, start$865, id$866, restore$867;
        ch$864 = source$710[index$712];
        if (!isIdentifierStart$728(ch$864)) {
            return;
        }
        start$865 = index$712;
        if (ch$864 === '\\') {
            ++index$712;
            if (source$710[index$712] !== 'u') {
                return;
            }
            ++index$712;
            restore$867 = index$712;
            ch$864 = scanHexEscape$737('u');
            if (ch$864) {
                if (ch$864 === '\\' || !isIdentifierStart$728(ch$864)) {
                    return;
                }
                id$866 = ch$864;
            } else {
                index$712 = restore$867;
                id$866 = 'u';
            }
        } else {
            id$866 = nextChar$734();
        }
        while (index$712 < length$715) {
            ch$864 = source$710[index$712];
            if (!isIdentifierPart$729(ch$864)) {
                break;
            }
            if (ch$864 === '\\') {
                ++index$712;
                if (source$710[index$712] !== 'u') {
                    return;
                }
                ++index$712;
                restore$867 = index$712;
                ch$864 = scanHexEscape$737('u');
                if (ch$864) {
                    if (ch$864 === '\\' || !isIdentifierPart$729(ch$864)) {
                        return;
                    }
                    id$866 += ch$864;
                } else {
                    index$712 = restore$867;
                    id$866 += 'u';
                }
            } else {
                id$866 += nextChar$734();
            }
        }
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$866.length === 1) {
            return {
                type: Token$704.Identifier,
                value: id$866,
                lineNumber: lineNumber$713,
                lineStart: lineStart$714,
                range: [
                    start$865,
                    index$712
                ]
            };
        }
        if (isKeyword$733(id$866)) {
            return {
                type: Token$704.Keyword,
                value: id$866,
                lineNumber: lineNumber$713,
                lineStart: lineStart$714,
                range: [
                    start$865,
                    index$712
                ]
            };
        }
        // 7.8.1 Null Literals
        if (id$866 === 'null') {
            return {
                type: Token$704.NullLiteral,
                value: id$866,
                lineNumber: lineNumber$713,
                lineStart: lineStart$714,
                range: [
                    start$865,
                    index$712
                ]
            };
        }
        // 7.8.2 Boolean Literals
        if (id$866 === 'true' || id$866 === 'false') {
            return {
                type: Token$704.BooleanLiteral,
                value: id$866,
                lineNumber: lineNumber$713,
                lineStart: lineStart$714,
                range: [
                    start$865,
                    index$712
                ]
            };
        }
        return {
            type: Token$704.Identifier,
            value: id$866,
            lineNumber: lineNumber$713,
            lineStart: lineStart$714,
            range: [
                start$865,
                index$712
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$739() {
        var start$868 = index$712, ch1$869 = source$710[index$712], ch2$870, ch3$871, ch4$872;
        // Check for most common single-character punctuators.
        if (ch1$869 === ';' || ch1$869 === '{' || ch1$869 === '}') {
            ++index$712;
            return {
                type: Token$704.Punctuator,
                value: ch1$869,
                lineNumber: lineNumber$713,
                lineStart: lineStart$714,
                range: [
                    start$868,
                    index$712
                ]
            };
        }
        if (ch1$869 === ',' || ch1$869 === '(' || ch1$869 === ')') {
            ++index$712;
            return {
                type: Token$704.Punctuator,
                value: ch1$869,
                lineNumber: lineNumber$713,
                lineStart: lineStart$714,
                range: [
                    start$868,
                    index$712
                ]
            };
        }
        if (ch1$869 === '#' || ch1$869 === '@') {
            ++index$712;
            return {
                type: Token$704.Punctuator,
                value: ch1$869,
                lineNumber: lineNumber$713,
                lineStart: lineStart$714,
                range: [
                    start$868,
                    index$712
                ]
            };
        }
        // Dot (.) can also start a floating-point number, hence the need
        // to check the next character.
        ch2$870 = source$710[index$712 + 1];
        if (ch1$869 === '.' && !isDecimalDigit$723(ch2$870)) {
            if (source$710[index$712 + 1] === '.' && source$710[index$712 + 2] === '.') {
                nextChar$734();
                nextChar$734();
                nextChar$734();
                return {
                    type: Token$704.Punctuator,
                    value: '...',
                    lineNumber: lineNumber$713,
                    lineStart: lineStart$714,
                    range: [
                        start$868,
                        index$712
                    ]
                };
            } else {
                return {
                    type: Token$704.Punctuator,
                    value: nextChar$734(),
                    lineNumber: lineNumber$713,
                    lineStart: lineStart$714,
                    range: [
                        start$868,
                        index$712
                    ]
                };
            }
        }
        // Peek more characters.
        ch3$871 = source$710[index$712 + 2];
        ch4$872 = source$710[index$712 + 3];
        // 4-character punctuator: >>>=
        if (ch1$869 === '>' && ch2$870 === '>' && ch3$871 === '>') {
            if (ch4$872 === '=') {
                index$712 += 4;
                return {
                    type: Token$704.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$713,
                    lineStart: lineStart$714,
                    range: [
                        start$868,
                        index$712
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$869 === '=' && ch2$870 === '=' && ch3$871 === '=') {
            index$712 += 3;
            return {
                type: Token$704.Punctuator,
                value: '===',
                lineNumber: lineNumber$713,
                lineStart: lineStart$714,
                range: [
                    start$868,
                    index$712
                ]
            };
        }
        if (ch1$869 === '!' && ch2$870 === '=' && ch3$871 === '=') {
            index$712 += 3;
            return {
                type: Token$704.Punctuator,
                value: '!==',
                lineNumber: lineNumber$713,
                lineStart: lineStart$714,
                range: [
                    start$868,
                    index$712
                ]
            };
        }
        if (ch1$869 === '>' && ch2$870 === '>' && ch3$871 === '>') {
            index$712 += 3;
            return {
                type: Token$704.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$713,
                lineStart: lineStart$714,
                range: [
                    start$868,
                    index$712
                ]
            };
        }
        if (ch1$869 === '<' && ch2$870 === '<' && ch3$871 === '=') {
            index$712 += 3;
            return {
                type: Token$704.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$713,
                lineStart: lineStart$714,
                range: [
                    start$868,
                    index$712
                ]
            };
        }
        if (ch1$869 === '>' && ch2$870 === '>' && ch3$871 === '=') {
            index$712 += 3;
            return {
                type: Token$704.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$713,
                lineStart: lineStart$714,
                range: [
                    start$868,
                    index$712
                ]
            };
        }
        // 2-character punctuators: <= >= == != ++ -- << >> && ||
        // += -= *= %= &= |= ^= /=
        if (ch2$870 === '=') {
            if ('<>=!+-*%&|^/'.indexOf(ch1$869) >= 0) {
                index$712 += 2;
                return {
                    type: Token$704.Punctuator,
                    value: ch1$869 + ch2$870,
                    lineNumber: lineNumber$713,
                    lineStart: lineStart$714,
                    range: [
                        start$868,
                        index$712
                    ]
                };
            }
        }
        if (ch1$869 === ch2$870 && '+-<>&|'.indexOf(ch1$869) >= 0) {
            if ('+-<>&|'.indexOf(ch2$870) >= 0) {
                index$712 += 2;
                return {
                    type: Token$704.Punctuator,
                    value: ch1$869 + ch2$870,
                    lineNumber: lineNumber$713,
                    lineStart: lineStart$714,
                    range: [
                        start$868,
                        index$712
                    ]
                };
            }
        }
        // The remaining 1-character punctuators.
        if ('[]<>+-*%&|^!~?:=/'.indexOf(ch1$869) >= 0) {
            return {
                type: Token$704.Punctuator,
                value: nextChar$734(),
                lineNumber: lineNumber$713,
                lineStart: lineStart$714,
                range: [
                    start$868,
                    index$712
                ]
            };
        }
    }
    // 7.8.3 Numeric Literals
    function scanNumericLiteral$740() {
        var number$873, start$874, ch$875;
        ch$875 = source$710[index$712];
        assert$720(isDecimalDigit$723(ch$875) || ch$875 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$874 = index$712;
        number$873 = '';
        if (ch$875 !== '.') {
            number$873 = nextChar$734();
            ch$875 = source$710[index$712];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            if (number$873 === '0') {
                if (ch$875 === 'x' || ch$875 === 'X') {
                    number$873 += nextChar$734();
                    while (index$712 < length$715) {
                        ch$875 = source$710[index$712];
                        if (!isHexDigit$724(ch$875)) {
                            break;
                        }
                        number$873 += nextChar$734();
                    }
                    if (number$873.length <= 2) {
                        // only 0x
                        throwError$748({}, Messages$708.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$712 < length$715) {
                        ch$875 = source$710[index$712];
                        if (isIdentifierStart$728(ch$875)) {
                            throwError$748({}, Messages$708.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$704.NumericLiteral,
                        value: parseInt(number$873, 16),
                        lineNumber: lineNumber$713,
                        lineStart: lineStart$714,
                        range: [
                            start$874,
                            index$712
                        ]
                    };
                } else if (isOctalDigit$725(ch$875)) {
                    number$873 += nextChar$734();
                    while (index$712 < length$715) {
                        ch$875 = source$710[index$712];
                        if (!isOctalDigit$725(ch$875)) {
                            break;
                        }
                        number$873 += nextChar$734();
                    }
                    if (index$712 < length$715) {
                        ch$875 = source$710[index$712];
                        if (isIdentifierStart$728(ch$875) || isDecimalDigit$723(ch$875)) {
                            throwError$748({}, Messages$708.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$704.NumericLiteral,
                        value: parseInt(number$873, 8),
                        octal: true,
                        lineNumber: lineNumber$713,
                        lineStart: lineStart$714,
                        range: [
                            start$874,
                            index$712
                        ]
                    };
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (isDecimalDigit$723(ch$875)) {
                    throwError$748({}, Messages$708.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (index$712 < length$715) {
                ch$875 = source$710[index$712];
                if (!isDecimalDigit$723(ch$875)) {
                    break;
                }
                number$873 += nextChar$734();
            }
        }
        if (ch$875 === '.') {
            number$873 += nextChar$734();
            while (index$712 < length$715) {
                ch$875 = source$710[index$712];
                if (!isDecimalDigit$723(ch$875)) {
                    break;
                }
                number$873 += nextChar$734();
            }
        }
        if (ch$875 === 'e' || ch$875 === 'E') {
            number$873 += nextChar$734();
            ch$875 = source$710[index$712];
            if (ch$875 === '+' || ch$875 === '-') {
                number$873 += nextChar$734();
            }
            ch$875 = source$710[index$712];
            if (isDecimalDigit$723(ch$875)) {
                number$873 += nextChar$734();
                while (index$712 < length$715) {
                    ch$875 = source$710[index$712];
                    if (!isDecimalDigit$723(ch$875)) {
                        break;
                    }
                    number$873 += nextChar$734();
                }
            } else {
                ch$875 = 'character ' + ch$875;
                if (index$712 >= length$715) {
                    ch$875 = '<end>';
                }
                throwError$748({}, Messages$708.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (index$712 < length$715) {
            ch$875 = source$710[index$712];
            if (isIdentifierStart$728(ch$875)) {
                throwError$748({}, Messages$708.UnexpectedToken, 'ILLEGAL');
            }
        }
        return {
            type: Token$704.NumericLiteral,
            value: parseFloat(number$873),
            lineNumber: lineNumber$713,
            lineStart: lineStart$714,
            range: [
                start$874,
                index$712
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$741() {
        var str$876 = '', quote$877, start$878, ch$879, code$880, unescaped$881, restore$882, octal$883 = false;
        quote$877 = source$710[index$712];
        assert$720(quote$877 === '\'' || quote$877 === '"', 'String literal must starts with a quote');
        start$878 = index$712;
        ++index$712;
        while (index$712 < length$715) {
            ch$879 = nextChar$734();
            if (ch$879 === quote$877) {
                quote$877 = '';
                break;
            } else if (ch$879 === '\\') {
                ch$879 = nextChar$734();
                if (!isLineTerminator$727(ch$879)) {
                    switch (ch$879) {
                    case 'n':
                        str$876 += '\n';
                        break;
                    case 'r':
                        str$876 += '\r';
                        break;
                    case 't':
                        str$876 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        restore$882 = index$712;
                        unescaped$881 = scanHexEscape$737(ch$879);
                        if (unescaped$881) {
                            str$876 += unescaped$881;
                        } else {
                            index$712 = restore$882;
                            str$876 += ch$879;
                        }
                        break;
                    case 'b':
                        str$876 += '\b';
                        break;
                    case 'f':
                        str$876 += '\f';
                        break;
                    case 'v':
                        str$876 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$725(ch$879)) {
                            code$880 = '01234567'.indexOf(ch$879);
                            // \0 is not octal escape sequence
                            if (code$880 !== 0) {
                                octal$883 = true;
                            }
                            if (index$712 < length$715 && isOctalDigit$725(source$710[index$712])) {
                                octal$883 = true;
                                code$880 = code$880 * 8 + '01234567'.indexOf(nextChar$734());
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$879) >= 0 && index$712 < length$715 && isOctalDigit$725(source$710[index$712])) {
                                    code$880 = code$880 * 8 + '01234567'.indexOf(nextChar$734());
                                }
                            }
                            str$876 += String.fromCharCode(code$880);
                        } else {
                            str$876 += ch$879;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$713;
                    if (ch$879 === '\r' && source$710[index$712] === '\n') {
                        ++index$712;
                    }
                }
            } else if (isLineTerminator$727(ch$879)) {
                break;
            } else {
                str$876 += ch$879;
            }
        }
        if (quote$877 !== '') {
            throwError$748({}, Messages$708.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$704.StringLiteral,
            value: str$876,
            octal: octal$883,
            lineNumber: lineNumber$713,
            lineStart: lineStart$714,
            range: [
                start$878,
                index$712
            ]
        };
    }
    function scanRegExp$742() {
        var str$884 = '', ch$885, start$886, pattern$887, flags$888, value$889, classMarker$890 = false, restore$891;
        buffer$716 = null;
        skipComment$736();
        start$886 = index$712;
        ch$885 = source$710[index$712];
        assert$720(ch$885 === '/', 'Regular expression literal must start with a slash');
        str$884 = nextChar$734();
        while (index$712 < length$715) {
            ch$885 = nextChar$734();
            str$884 += ch$885;
            if (classMarker$890) {
                if (ch$885 === ']') {
                    classMarker$890 = false;
                }
            } else {
                if (ch$885 === '\\') {
                    ch$885 = nextChar$734();
                    // ECMA-262 7.8.5
                    if (isLineTerminator$727(ch$885)) {
                        throwError$748({}, Messages$708.UnterminatedRegExp);
                    }
                    str$884 += ch$885;
                } else if (ch$885 === '/') {
                    break;
                } else if (ch$885 === '[') {
                    classMarker$890 = true;
                } else if (isLineTerminator$727(ch$885)) {
                    throwError$748({}, Messages$708.UnterminatedRegExp);
                }
            }
        }
        if (str$884.length === 1) {
            throwError$748({}, Messages$708.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$887 = str$884.substr(1, str$884.length - 2);
        flags$888 = '';
        while (index$712 < length$715) {
            ch$885 = source$710[index$712];
            if (!isIdentifierPart$729(ch$885)) {
                break;
            }
            ++index$712;
            if (ch$885 === '\\' && index$712 < length$715) {
                ch$885 = source$710[index$712];
                if (ch$885 === 'u') {
                    ++index$712;
                    restore$891 = index$712;
                    ch$885 = scanHexEscape$737('u');
                    if (ch$885) {
                        flags$888 += ch$885;
                        str$884 += '\\u';
                        for (; restore$891 < index$712; ++restore$891) {
                            str$884 += source$710[restore$891];
                        }
                    } else {
                        index$712 = restore$891;
                        flags$888 += 'u';
                        str$884 += '\\u';
                    }
                } else {
                    str$884 += '\\';
                }
            } else {
                flags$888 += ch$885;
                str$884 += ch$885;
            }
        }
        try {
            value$889 = new RegExp(pattern$887, flags$888);
        } catch (e$892) {
            throwError$748({}, Messages$708.InvalidRegExp);
        }
        return {
            type: Token$704.RegexLiteral,
            literal: str$884,
            value: value$889,
            lineNumber: lineNumber$713,
            lineStart: lineStart$714,
            range: [
                start$886,
                index$712
            ]
        };
    }
    function isIdentifierName$743(token$893) {
        return token$893.type === Token$704.Identifier || token$893.type === Token$704.Keyword || token$893.type === Token$704.BooleanLiteral || token$893.type === Token$704.NullLiteral;
    }
    // only used by the reader
    function advance$744() {
        var ch$894, token$895;
        skipComment$736();
        if (index$712 >= length$715) {
            return {
                type: Token$704.EOF,
                lineNumber: lineNumber$713,
                lineStart: lineStart$714,
                range: [
                    index$712,
                    index$712
                ]
            };
        }
        ch$894 = source$710[index$712];
        token$895 = scanPunctuator$739();
        if (typeof token$895 !== 'undefined') {
            return token$895;
        }
        if (ch$894 === '\'' || ch$894 === '"') {
            return scanStringLiteral$741();
        }
        if (ch$894 === '.' || isDecimalDigit$723(ch$894)) {
            return scanNumericLiteral$740();
        }
        token$895 = scanIdentifier$738();
        if (typeof token$895 !== 'undefined') {
            return token$895;
        }
        throwError$748({}, Messages$708.UnexpectedToken, 'ILLEGAL');
    }
    function lex$745() {
        var token$896;
        if (buffer$716) {
            token$896 = buffer$716;
            buffer$716 = null;
            index$712++;
            return token$896;
        }
        buffer$716 = null;
        return tokenStream$718[index$712++];
    }
    function lookahead$746() {
        var pos$897, line$898, start$899;
        if (buffer$716 !== null) {
            return buffer$716;
        }
        buffer$716 = tokenStream$718[index$712];
        return buffer$716;
    }
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$747() {
        var pos$900, line$901, start$902, found$903;
        found$903 = tokenStream$718[index$712 - 1].token.lineNumber !== tokenStream$718[index$712].token.lineNumber;
        return found$903;
    }
    // Throw an exception
    function throwError$748(token$904, messageFormat$905) {
        var error$906, args$907 = Array.prototype.slice.call(arguments, 2), msg$908 = messageFormat$905.replace(/%(\d)/g, function (whole$909, index$910) {
                return args$907[index$910] || '';
            });
        if (typeof token$904.lineNumber === 'number') {
            error$906 = new Error('Line ' + token$904.lineNumber + ': ' + msg$908);
            error$906.lineNumber = token$904.lineNumber;
            if (token$904.range && token$904.range.length > 0) {
                error$906.index = token$904.range[0];
                error$906.column = token$904.range[0] - lineStart$714 + 1;
            }
        } else {
            error$906 = new Error('Line ' + lineNumber$713 + ': ' + msg$908);
            error$906.index = index$712;
            error$906.lineNumber = lineNumber$713;
            error$906.column = index$712 - lineStart$714 + 1;
        }
        throw error$906;
    }
    function throwErrorTolerant$749() {
        var error$911;
        try {
            throwError$748.apply(null, arguments);
        } catch (e$912) {
            if (extra$719.errors) {
                extra$719.errors.push(e$912);
            } else {
                throw e$912;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$750(token$913) {
        var s$914;
        if (token$913.type === Token$704.EOF) {
            throwError$748(token$913, Messages$708.UnexpectedEOS);
        }
        if (token$913.type === Token$704.NumericLiteral) {
            throwError$748(token$913, Messages$708.UnexpectedNumber);
        }
        if (token$913.type === Token$704.StringLiteral) {
            throwError$748(token$913, Messages$708.UnexpectedString);
        }
        if (token$913.type === Token$704.Identifier) {
            console.log(token$913);
            throwError$748(token$913, Messages$708.UnexpectedIdentifier);
        }
        if (token$913.type === Token$704.Keyword) {
            if (isFutureReservedWord$730(token$913.value)) {
                throwError$748(token$913, Messages$708.UnexpectedReserved);
            } else if (strict$711 && isStrictModeReservedWord$731(token$913.value)) {
                throwError$748(token$913, Messages$708.StrictReservedWord);
            }
            throwError$748(token$913, Messages$708.UnexpectedToken, token$913.value);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$748(token$913, Messages$708.UnexpectedToken, token$913.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$751(value$915) {
        var token$916 = lex$745().token;
        if (token$916.type !== Token$704.Punctuator || token$916.value !== value$915) {
            throwUnexpected$750(token$916);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$752(keyword$917) {
        var token$918 = lex$745().token;
        if (token$918.type !== Token$704.Keyword || token$918.value !== keyword$917) {
            throwUnexpected$750(token$918);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$753(value$919) {
        var token$920 = lookahead$746().token;
        return token$920.type === Token$704.Punctuator && token$920.value === value$919;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$754(keyword$921) {
        var token$922 = lookahead$746().token;
        return token$922.type === Token$704.Keyword && token$922.value === keyword$921;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$755() {
        var token$923 = lookahead$746().token, op$924 = token$923.value;
        if (token$923.type !== Token$704.Punctuator) {
            return false;
        }
        return op$924 === '=' || op$924 === '*=' || op$924 === '/=' || op$924 === '%=' || op$924 === '+=' || op$924 === '-=' || op$924 === '<<=' || op$924 === '>>=' || op$924 === '>>>=' || op$924 === '&=' || op$924 === '^=' || op$924 === '|=';
    }
    function consumeSemicolon$756() {
        var token$925, line$926;
        if (tokenStream$718[index$712].token.value === ';') {
            lex$745().token;
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
        line$926 = tokenStream$718[index$712 - 1].token.lineNumber;
        token$925 = tokenStream$718[index$712].token;
        if (line$926 !== token$925.lineNumber) {
            return;
        }
        if (token$925.type !== Token$704.EOF && !match$753('}')) {
            throwUnexpected$750(token$925);
        }
        return;
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$757(expr$927) {
        return expr$927.type === Syntax$706.Identifier || expr$927.type === Syntax$706.MemberExpression;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$758() {
        var elements$928 = [], undef$929;
        expect$751('[');
        while (!match$753(']')) {
            if (match$753(',')) {
                lex$745().token;
                elements$928.push(undef$929);
            } else {
                elements$928.push(parseAssignmentExpression$787());
                if (!match$753(']')) {
                    expect$751(',');
                }
            }
        }
        expect$751(']');
        return {
            type: Syntax$706.ArrayExpression,
            elements: elements$928
        };
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$759(param$930, first$931) {
        var previousStrict$932, body$933;
        previousStrict$932 = strict$711;
        body$933 = parseFunctionSourceElements$814();
        if (first$931 && strict$711 && isRestrictedWord$732(param$930[0].name)) {
            throwError$748(first$931, Messages$708.StrictParamName);
        }
        strict$711 = previousStrict$932;
        return {
            type: Syntax$706.FunctionExpression,
            id: null,
            params: param$930,
            body: body$933
        };
    }
    function parseObjectPropertyKey$760() {
        var token$934 = lex$745().token;
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$934.type === Token$704.StringLiteral || token$934.type === Token$704.NumericLiteral) {
            if (strict$711 && token$934.octal) {
                throwError$748(token$934, Messages$708.StrictOctalLiteral);
            }
            return createLiteral$824(token$934);
        }
        return {
            type: Syntax$706.Identifier,
            name: token$934.value
        };
    }
    function parseObjectProperty$761() {
        var token$935, key$936, id$937, param$938;
        token$935 = lookahead$746().token;
        if (token$935.type === Token$704.Identifier) {
            id$937 = parseObjectPropertyKey$760();
            // Property Assignment: Getter and Setter.
            if (token$935.value === 'get' && !match$753(':')) {
                key$936 = parseObjectPropertyKey$760();
                expect$751('(');
                expect$751(')');
                return {
                    type: Syntax$706.Property,
                    key: key$936,
                    value: parsePropertyFunction$759([]),
                    kind: 'get'
                };
            } else if (token$935.value === 'set' && !match$753(':')) {
                key$936 = parseObjectPropertyKey$760();
                expect$751('(');
                token$935 = lookahead$746().token;
                if (token$935.type !== Token$704.Identifier) {
                    throwUnexpected$750(lex$745().token);
                }
                param$938 = [parseVariableIdentifier$791()];
                expect$751(')');
                return {
                    type: Syntax$706.Property,
                    key: key$936,
                    value: parsePropertyFunction$759(param$938, token$935),
                    kind: 'set'
                };
            } else {
                expect$751(':');
                return {
                    type: Syntax$706.Property,
                    key: id$937,
                    value: parseAssignmentExpression$787(),
                    kind: 'init'
                };
            }
        } else if (token$935.type === Token$704.EOF || token$935.type === Token$704.Punctuator) {
            throwUnexpected$750(token$935);
        } else {
            key$936 = parseObjectPropertyKey$760();
            expect$751(':');
            return {
                type: Syntax$706.Property,
                key: key$936,
                value: parseAssignmentExpression$787(),
                kind: 'init'
            };
        }
    }
    function parseObjectInitialiser$762() {
        var token$939, properties$940 = [], property$941, name$942, kind$943, map$944 = {}, toString$945 = String;
        expect$751('{');
        while (!match$753('}')) {
            property$941 = parseObjectProperty$761();
            if (property$941.key.type === Syntax$706.Identifier) {
                name$942 = property$941.key.name;
            } else {
                name$942 = toString$945(property$941.key.value);
            }
            kind$943 = property$941.kind === 'init' ? PropertyKind$707.Data : property$941.kind === 'get' ? PropertyKind$707.Get : PropertyKind$707.Set;
            if (Object.prototype.hasOwnProperty.call(map$944, name$942)) {
                if (map$944[name$942] === PropertyKind$707.Data) {
                    if (strict$711 && kind$943 === PropertyKind$707.Data) {
                        throwErrorTolerant$749({}, Messages$708.StrictDuplicateProperty);
                    } else if (kind$943 !== PropertyKind$707.Data) {
                        throwError$748({}, Messages$708.AccessorDataProperty);
                    }
                } else {
                    if (kind$943 === PropertyKind$707.Data) {
                        throwError$748({}, Messages$708.AccessorDataProperty);
                    } else if (map$944[name$942] & kind$943) {
                        throwError$748({}, Messages$708.AccessorGetSet);
                    }
                }
                map$944[name$942] |= kind$943;
            } else {
                map$944[name$942] = kind$943;
            }
            properties$940.push(property$941);
            if (!match$753('}')) {
                expect$751(',');
            }
        }
        expect$751('}');
        return {
            type: Syntax$706.ObjectExpression,
            properties: properties$940
        };
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$763() {
        var expr$946, token$947 = lookahead$746().token, type$948 = token$947.type;
        if (type$948 === Token$704.Identifier) {
            var name$949 = expander$703.resolve(lex$745());
            return {
                type: Syntax$706.Identifier,
                name: name$949
            };
        }
        if (type$948 === Token$704.StringLiteral || type$948 === Token$704.NumericLiteral) {
            if (strict$711 && token$947.octal) {
                throwErrorTolerant$749(token$947, Messages$708.StrictOctalLiteral);
            }
            return createLiteral$824(lex$745().token);
        }
        if (type$948 === Token$704.Keyword) {
            if (matchKeyword$754('this')) {
                lex$745().token;
                return { type: Syntax$706.ThisExpression };
            }
            if (matchKeyword$754('function')) {
                return parseFunctionExpression$816();
            }
        }
        if (type$948 === Token$704.BooleanLiteral) {
            lex$745();
            token$947.value = token$947.value === 'true';
            return createLiteral$824(token$947);
        }
        if (type$948 === Token$704.NullLiteral) {
            lex$745();
            token$947.value = null;
            return createLiteral$824(token$947);
        }
        if (match$753('[')) {
            return parseArrayInitialiser$758();
        }
        if (match$753('{')) {
            return parseObjectInitialiser$762();
        }
        if (match$753('(')) {
            lex$745();
            state$717.lastParenthesized = expr$946 = parseExpression$788();
            expect$751(')');
            return expr$946;
        }
        if (token$947.value instanceof RegExp) {
            return createLiteral$824(lex$745().token);
        }
        return throwUnexpected$750(lex$745().token);
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$764() {
        var args$950 = [];
        expect$751('(');
        if (!match$753(')')) {
            while (index$712 < length$715) {
                args$950.push(parseAssignmentExpression$787());
                if (match$753(')')) {
                    break;
                }
                expect$751(',');
            }
        }
        expect$751(')');
        return args$950;
    }
    function parseNonComputedProperty$765() {
        var token$951 = lex$745().token;
        if (!isIdentifierName$743(token$951)) {
            throwUnexpected$750(token$951);
        }
        return {
            type: Syntax$706.Identifier,
            name: token$951.value
        };
    }
    function parseNonComputedMember$766(object$952) {
        return {
            type: Syntax$706.MemberExpression,
            computed: false,
            object: object$952,
            property: parseNonComputedProperty$765()
        };
    }
    function parseComputedMember$767(object$953) {
        var property$954, expr$955;
        expect$751('[');
        property$954 = parseExpression$788();
        expr$955 = {
            type: Syntax$706.MemberExpression,
            computed: true,
            object: object$953,
            property: property$954
        };
        expect$751(']');
        return expr$955;
    }
    function parseCallMember$768(object$956) {
        return {
            type: Syntax$706.CallExpression,
            callee: object$956,
            'arguments': parseArguments$764()
        };
    }
    function parseNewExpression$769() {
        var expr$957;
        expectKeyword$752('new');
        expr$957 = {
            type: Syntax$706.NewExpression,
            callee: parseLeftHandSideExpression$773(),
            'arguments': []
        };
        if (match$753('(')) {
            expr$957['arguments'] = parseArguments$764();
        }
        return expr$957;
    }
    // sort of broken, only accepts literals
    // pretty sure the use of toString will bite me
    function toArrayNode$770(arr$958) {
        var els$959 = arr$958.map(function (el$960) {
                return {
                    type: 'Literal',
                    value: el$960,
                    raw: el$960.toString()
                };
            });
        return {
            type: 'ArrayExpression',
            elements: els$959
        };
    }
    function toObjectNode$771(obj$961) {
        // todo: hacky, fixup
        var props$962 = Object.keys(obj$961).map(function (key$963) {
                var raw$964 = obj$961[key$963];
                var value$965;
                if (Array.isArray(raw$964)) {
                    value$965 = toArrayNode$770(raw$964);
                } else {
                    value$965 = {
                        type: 'Literal',
                        value: obj$961[key$963],
                        raw: obj$961[key$963].toString()
                    };
                }
                return {
                    type: 'Property',
                    key: {
                        type: 'Identifier',
                        name: key$963
                    },
                    value: value$965,
                    kind: 'init'
                };
            });
        return {
            type: 'ObjectExpression',
            properties: props$962
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
    function parseLeftHandSideExpressionAllowCall$772() {
        var useNew$966, expr$967;
        useNew$966 = matchKeyword$754('new');
        expr$967 = useNew$966 ? parseNewExpression$769() : parsePrimaryExpression$763();
        // handle "syntax" primitive
        // todo: error handling
        // if(expr.name === "syntax") {
        //     return parseSyntaxObject();
        // }
        while (index$712 < length$715) {
            if (match$753('.')) {
                lex$745();
                expr$967 = parseNonComputedMember$766(expr$967);
            } else if (match$753('[')) {
                expr$967 = parseComputedMember$767(expr$967);
            } else if (match$753('(')) {
                expr$967 = parseCallMember$768(expr$967);
            } else {
                break;
            }
        }
        return expr$967;
    }
    function parseLeftHandSideExpression$773() {
        var useNew$968, expr$969;
        useNew$968 = matchKeyword$754('new');
        expr$969 = useNew$968 ? parseNewExpression$769() : parsePrimaryExpression$763();
        while (index$712 < length$715) {
            if (match$753('.')) {
                lex$745();
                expr$969 = parseNonComputedMember$766(expr$969);
            } else if (match$753('[')) {
                expr$969 = parseComputedMember$767(expr$969);
            } else {
                break;
            }
        }
        return expr$969;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$774() {
        var expr$970 = parseLeftHandSideExpressionAllowCall$772();
        if ((match$753('++') || match$753('--')) && !peekLineTerminator$747()) {
            // 11.3.1, 11.3.2
            if (strict$711 && expr$970.type === Syntax$706.Identifier && isRestrictedWord$732(expr$970.name)) {
                throwError$748({}, Messages$708.StrictLHSPostfix);
            }
            if (!isLeftHandSide$757(expr$970)) {
                throwError$748({}, Messages$708.InvalidLHSInAssignment);
            }
            expr$970 = {
                type: Syntax$706.UpdateExpression,
                operator: lex$745().token.value,
                argument: expr$970,
                prefix: false
            };
        }
        return expr$970;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$775() {
        var token$971, expr$972;
        if (match$753('++') || match$753('--')) {
            token$971 = lex$745().token;
            expr$972 = parseUnaryExpression$775();
            // 11.4.4, 11.4.5
            if (strict$711 && expr$972.type === Syntax$706.Identifier && isRestrictedWord$732(expr$972.name)) {
                throwError$748({}, Messages$708.StrictLHSPrefix);
            }
            if (!isLeftHandSide$757(expr$972)) {
                throwError$748({}, Messages$708.InvalidLHSInAssignment);
            }
            expr$972 = {
                type: Syntax$706.UpdateExpression,
                operator: token$971.value,
                argument: expr$972,
                prefix: true
            };
            return expr$972;
        }
        if (match$753('+') || match$753('-') || match$753('~') || match$753('!')) {
            expr$972 = {
                type: Syntax$706.UnaryExpression,
                operator: lex$745().token.value,
                argument: parseUnaryExpression$775()
            };
            return expr$972;
        }
        if (matchKeyword$754('delete') || matchKeyword$754('void') || matchKeyword$754('typeof')) {
            expr$972 = {
                type: Syntax$706.UnaryExpression,
                operator: lex$745().token.value,
                argument: parseUnaryExpression$775()
            };
            if (strict$711 && expr$972.operator === 'delete' && expr$972.argument.type === Syntax$706.Identifier) {
                throwErrorTolerant$749({}, Messages$708.StrictDelete);
            }
            return expr$972;
        }
        return parsePostfixExpression$774();
    }
    // 11.5 Multiplicative Operators
    function parseMultiplicativeExpression$776() {
        var expr$973 = parseUnaryExpression$775();
        while (match$753('*') || match$753('/') || match$753('%')) {
            expr$973 = {
                type: Syntax$706.BinaryExpression,
                operator: lex$745().token.value,
                left: expr$973,
                right: parseUnaryExpression$775()
            };
        }
        return expr$973;
    }
    // 11.6 Additive Operators
    function parseAdditiveExpression$777() {
        var expr$974 = parseMultiplicativeExpression$776();
        while (match$753('+') || match$753('-')) {
            expr$974 = {
                type: Syntax$706.BinaryExpression,
                operator: lex$745().token.value,
                left: expr$974,
                right: parseMultiplicativeExpression$776()
            };
        }
        return expr$974;
    }
    // 11.7 Bitwise Shift Operators
    function parseShiftExpression$778() {
        var expr$975 = parseAdditiveExpression$777();
        while (match$753('<<') || match$753('>>') || match$753('>>>')) {
            expr$975 = {
                type: Syntax$706.BinaryExpression,
                operator: lex$745().token.value,
                left: expr$975,
                right: parseAdditiveExpression$777()
            };
        }
        return expr$975;
    }
    // 11.8 Relational Operators
    function parseRelationalExpression$779() {
        var expr$976, previousAllowIn$977;
        previousAllowIn$977 = state$717.allowIn;
        state$717.allowIn = true;
        expr$976 = parseShiftExpression$778();
        while (match$753('<') || match$753('>') || match$753('<=') || match$753('>=') || previousAllowIn$977 && matchKeyword$754('in') || matchKeyword$754('instanceof')) {
            expr$976 = {
                type: Syntax$706.BinaryExpression,
                operator: lex$745().token.value,
                left: expr$976,
                right: parseRelationalExpression$779()
            };
        }
        state$717.allowIn = previousAllowIn$977;
        return expr$976;
    }
    // 11.9 Equality Operators
    function parseEqualityExpression$780() {
        var expr$978 = parseRelationalExpression$779();
        while (match$753('==') || match$753('!=') || match$753('===') || match$753('!==')) {
            expr$978 = {
                type: Syntax$706.BinaryExpression,
                operator: lex$745().token.value,
                left: expr$978,
                right: parseRelationalExpression$779()
            };
        }
        return expr$978;
    }
    // 11.10 Binary Bitwise Operators
    function parseBitwiseANDExpression$781() {
        var expr$979 = parseEqualityExpression$780();
        while (match$753('&')) {
            lex$745();
            expr$979 = {
                type: Syntax$706.BinaryExpression,
                operator: '&',
                left: expr$979,
                right: parseEqualityExpression$780()
            };
        }
        return expr$979;
    }
    function parseBitwiseXORExpression$782() {
        var expr$980 = parseBitwiseANDExpression$781();
        while (match$753('^')) {
            lex$745();
            expr$980 = {
                type: Syntax$706.BinaryExpression,
                operator: '^',
                left: expr$980,
                right: parseBitwiseANDExpression$781()
            };
        }
        return expr$980;
    }
    function parseBitwiseORExpression$783() {
        var expr$981 = parseBitwiseXORExpression$782();
        while (match$753('|')) {
            lex$745();
            expr$981 = {
                type: Syntax$706.BinaryExpression,
                operator: '|',
                left: expr$981,
                right: parseBitwiseXORExpression$782()
            };
        }
        return expr$981;
    }
    // 11.11 Binary Logical Operators
    function parseLogicalANDExpression$784() {
        var expr$982 = parseBitwiseORExpression$783();
        while (match$753('&&')) {
            lex$745();
            expr$982 = {
                type: Syntax$706.LogicalExpression,
                operator: '&&',
                left: expr$982,
                right: parseBitwiseORExpression$783()
            };
        }
        return expr$982;
    }
    function parseLogicalORExpression$785() {
        var expr$983 = parseLogicalANDExpression$784();
        while (match$753('||')) {
            lex$745();
            expr$983 = {
                type: Syntax$706.LogicalExpression,
                operator: '||',
                left: expr$983,
                right: parseLogicalANDExpression$784()
            };
        }
        return expr$983;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$786() {
        var expr$984, previousAllowIn$985, consequent$986;
        expr$984 = parseLogicalORExpression$785();
        if (match$753('?')) {
            lex$745();
            previousAllowIn$985 = state$717.allowIn;
            state$717.allowIn = true;
            consequent$986 = parseAssignmentExpression$787();
            state$717.allowIn = previousAllowIn$985;
            expect$751(':');
            expr$984 = {
                type: Syntax$706.ConditionalExpression,
                test: expr$984,
                consequent: consequent$986,
                alternate: parseAssignmentExpression$787()
            };
        }
        return expr$984;
    }
    // 11.13 Assignment Operators
    function parseAssignmentExpression$787() {
        var expr$987;
        expr$987 = parseConditionalExpression$786();
        if (matchAssign$755()) {
            // LeftHandSideExpression
            if (!isLeftHandSide$757(expr$987)) {
                throwError$748({}, Messages$708.InvalidLHSInAssignment);
            }
            // 11.13.1
            if (strict$711 && expr$987.type === Syntax$706.Identifier && isRestrictedWord$732(expr$987.name)) {
                throwError$748({}, Messages$708.StrictLHSAssignment);
            }
            expr$987 = {
                type: Syntax$706.AssignmentExpression,
                operator: lex$745().token.value,
                left: expr$987,
                right: parseAssignmentExpression$787()
            };
        }
        return expr$987;
    }
    // 11.14 Comma Operator
    function parseExpression$788() {
        var expr$988 = parseAssignmentExpression$787();
        if (match$753(',')) {
            expr$988 = {
                type: Syntax$706.SequenceExpression,
                expressions: [expr$988]
            };
            while (index$712 < length$715) {
                if (!match$753(',')) {
                    break;
                }
                lex$745();
                expr$988.expressions.push(parseAssignmentExpression$787());
            }
        }
        return expr$988;
    }
    // 12.1 Block
    function parseStatementList$789() {
        var list$989 = [], statement$990;
        while (index$712 < length$715) {
            if (match$753('}')) {
                break;
            }
            statement$990 = parseSourceElement$817();
            if (typeof statement$990 === 'undefined') {
                break;
            }
            list$989.push(statement$990);
        }
        return list$989;
    }
    function parseBlock$790() {
        var block$991;
        expect$751('{');
        block$991 = parseStatementList$789();
        expect$751('}');
        return {
            type: Syntax$706.BlockStatement,
            body: block$991
        };
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$791() {
        var stx$992 = lex$745(), token$993 = stx$992.token;
        if (token$993.type !== Token$704.Identifier) {
            throwUnexpected$750(token$993);
        }
        var name$994 = expander$703.resolve(stx$992);
        return {
            type: Syntax$706.Identifier,
            name: name$994
        };
    }
    function parseVariableDeclaration$792(kind$995) {
        var id$996 = parseVariableIdentifier$791(), init$997 = null;
        // 12.2.1
        if (strict$711 && isRestrictedWord$732(id$996.name)) {
            throwErrorTolerant$749({}, Messages$708.StrictVarName);
        }
        if (kind$995 === 'const') {
            expect$751('=');
            init$997 = parseAssignmentExpression$787();
        } else if (match$753('=')) {
            lex$745();
            init$997 = parseAssignmentExpression$787();
        }
        return {
            type: Syntax$706.VariableDeclarator,
            id: id$996,
            init: init$997
        };
    }
    function parseVariableDeclarationList$793(kind$998) {
        var list$999 = [];
        while (index$712 < length$715) {
            list$999.push(parseVariableDeclaration$792(kind$998));
            if (!match$753(',')) {
                break;
            }
            lex$745();
        }
        return list$999;
    }
    function parseVariableStatement$794() {
        var declarations$1000;
        expectKeyword$752('var');
        declarations$1000 = parseVariableDeclarationList$793();
        consumeSemicolon$756();
        return {
            type: Syntax$706.VariableDeclaration,
            declarations: declarations$1000,
            kind: 'var'
        };
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$795(kind$1001) {
        var declarations$1002;
        expectKeyword$752(kind$1001);
        declarations$1002 = parseVariableDeclarationList$793(kind$1001);
        consumeSemicolon$756();
        return {
            type: Syntax$706.VariableDeclaration,
            declarations: declarations$1002,
            kind: kind$1001
        };
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$796() {
        expect$751(';');
        return { type: Syntax$706.EmptyStatement };
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$797() {
        var expr$1003 = parseExpression$788();
        consumeSemicolon$756();
        return {
            type: Syntax$706.ExpressionStatement,
            expression: expr$1003
        };
    }
    // 12.5 If statement
    function parseIfStatement$798() {
        var test$1004, consequent$1005, alternate$1006;
        expectKeyword$752('if');
        expect$751('(');
        test$1004 = parseExpression$788();
        expect$751(')');
        consequent$1005 = parseStatement$813();
        if (matchKeyword$754('else')) {
            lex$745();
            alternate$1006 = parseStatement$813();
        } else {
            alternate$1006 = null;
        }
        return {
            type: Syntax$706.IfStatement,
            test: test$1004,
            consequent: consequent$1005,
            alternate: alternate$1006
        };
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$799() {
        var body$1007, test$1008, oldInIteration$1009;
        expectKeyword$752('do');
        oldInIteration$1009 = state$717.inIteration;
        state$717.inIteration = true;
        body$1007 = parseStatement$813();
        state$717.inIteration = oldInIteration$1009;
        expectKeyword$752('while');
        expect$751('(');
        test$1008 = parseExpression$788();
        expect$751(')');
        if (match$753(';')) {
            lex$745();
        }
        return {
            type: Syntax$706.DoWhileStatement,
            body: body$1007,
            test: test$1008
        };
    }
    function parseWhileStatement$800() {
        var test$1010, body$1011, oldInIteration$1012;
        expectKeyword$752('while');
        expect$751('(');
        test$1010 = parseExpression$788();
        expect$751(')');
        oldInIteration$1012 = state$717.inIteration;
        state$717.inIteration = true;
        body$1011 = parseStatement$813();
        state$717.inIteration = oldInIteration$1012;
        return {
            type: Syntax$706.WhileStatement,
            test: test$1010,
            body: body$1011
        };
    }
    function parseForVariableDeclaration$801() {
        var token$1013 = lex$745().token;
        return {
            type: Syntax$706.VariableDeclaration,
            declarations: parseVariableDeclarationList$793(),
            kind: token$1013.value
        };
    }
    function parseForStatement$802() {
        var init$1014, test$1015, update$1016, left$1017, right$1018, body$1019, oldInIteration$1020;
        init$1014 = test$1015 = update$1016 = null;
        expectKeyword$752('for');
        expect$751('(');
        if (match$753(';')) {
            lex$745();
        } else {
            if (matchKeyword$754('var') || matchKeyword$754('let')) {
                state$717.allowIn = false;
                init$1014 = parseForVariableDeclaration$801();
                state$717.allowIn = true;
                if (init$1014.declarations.length === 1 && matchKeyword$754('in')) {
                    lex$745();
                    left$1017 = init$1014;
                    right$1018 = parseExpression$788();
                    init$1014 = null;
                }
            } else {
                state$717.allowIn = false;
                init$1014 = parseExpression$788();
                state$717.allowIn = true;
                if (matchKeyword$754('in')) {
                    // LeftHandSideExpression
                    if (!isLeftHandSide$757(init$1014)) {
                        throwError$748({}, Messages$708.InvalidLHSInForIn);
                    }
                    lex$745();
                    left$1017 = init$1014;
                    right$1018 = parseExpression$788();
                    init$1014 = null;
                }
            }
            if (typeof left$1017 === 'undefined') {
                expect$751(';');
            }
        }
        if (typeof left$1017 === 'undefined') {
            if (!match$753(';')) {
                test$1015 = parseExpression$788();
            }
            expect$751(';');
            if (!match$753(')')) {
                update$1016 = parseExpression$788();
            }
        }
        expect$751(')');
        oldInIteration$1020 = state$717.inIteration;
        state$717.inIteration = true;
        body$1019 = parseStatement$813();
        state$717.inIteration = oldInIteration$1020;
        if (typeof left$1017 === 'undefined') {
            return {
                type: Syntax$706.ForStatement,
                init: init$1014,
                test: test$1015,
                update: update$1016,
                body: body$1019
            };
        }
        return {
            type: Syntax$706.ForInStatement,
            left: left$1017,
            right: right$1018,
            body: body$1019,
            each: false
        };
    }
    // 12.7 The continue statement
    function parseContinueStatement$803() {
        var token$1021, label$1022 = null;
        expectKeyword$752('continue');
        // Optimize the most common form: 'continue;'.
        if (tokenStream$718[index$712].token.value === ';') {
            lex$745();
            if (!state$717.inIteration) {
                throwError$748({}, Messages$708.IllegalContinue);
            }
            return {
                type: Syntax$706.ContinueStatement,
                label: null
            };
        }
        if (peekLineTerminator$747()) {
            if (!state$717.inIteration) {
                throwError$748({}, Messages$708.IllegalContinue);
            }
            return {
                type: Syntax$706.ContinueStatement,
                label: null
            };
        }
        token$1021 = lookahead$746().token;
        if (token$1021.type === Token$704.Identifier) {
            label$1022 = parseVariableIdentifier$791();
            if (!Object.prototype.hasOwnProperty.call(state$717.labelSet, label$1022.name)) {
                throwError$748({}, Messages$708.UnknownLabel, label$1022.name);
            }
        }
        consumeSemicolon$756();
        if (label$1022 === null && !state$717.inIteration) {
            throwError$748({}, Messages$708.IllegalContinue);
        }
        return {
            type: Syntax$706.ContinueStatement,
            label: label$1022
        };
    }
    // 12.8 The break statement
    function parseBreakStatement$804() {
        var token$1023, label$1024 = null;
        expectKeyword$752('break');
        if (peekLineTerminator$747()) {
            if (!(state$717.inIteration || state$717.inSwitch)) {
                throwError$748({}, Messages$708.IllegalBreak);
            }
            return {
                type: Syntax$706.BreakStatement,
                label: null
            };
        }
        token$1023 = lookahead$746().token;
        if (token$1023.type === Token$704.Identifier) {
            label$1024 = parseVariableIdentifier$791();
            if (!Object.prototype.hasOwnProperty.call(state$717.labelSet, label$1024.name)) {
                throwError$748({}, Messages$708.UnknownLabel, label$1024.name);
            }
        }
        consumeSemicolon$756();
        if (label$1024 === null && !(state$717.inIteration || state$717.inSwitch)) {
            throwError$748({}, Messages$708.IllegalBreak);
        }
        return {
            type: Syntax$706.BreakStatement,
            label: label$1024
        };
    }
    // 12.9 The return statement
    function parseReturnStatement$805() {
        var token$1025, argument$1026 = null;
        expectKeyword$752('return');
        if (!state$717.inFunctionBody) {
            throwErrorTolerant$749({}, Messages$708.IllegalReturn);
        }
        if (peekLineTerminator$747()) {
            return {
                type: Syntax$706.ReturnStatement,
                argument: null
            };
        }
        if (!match$753(';')) {
            token$1025 = lookahead$746().token;
            if (!match$753('}') && token$1025.type !== Token$704.EOF) {
                argument$1026 = parseExpression$788();
            }
        }
        consumeSemicolon$756();
        return {
            type: Syntax$706.ReturnStatement,
            argument: argument$1026
        };
    }
    // 12.10 The with statement
    function parseWithStatement$806() {
        var object$1027, body$1028;
        if (strict$711) {
            throwErrorTolerant$749({}, Messages$708.StrictModeWith);
        }
        expectKeyword$752('with');
        expect$751('(');
        object$1027 = parseExpression$788();
        expect$751(')');
        body$1028 = parseStatement$813();
        return {
            type: Syntax$706.WithStatement,
            object: object$1027,
            body: body$1028
        };
    }
    // 12.10 The swith statement
    function parseSwitchCase$807() {
        var test$1029, consequent$1030 = [], statement$1031;
        if (matchKeyword$754('default')) {
            lex$745();
            test$1029 = null;
        } else {
            expectKeyword$752('case');
            test$1029 = parseExpression$788();
        }
        expect$751(':');
        while (index$712 < length$715) {
            if (match$753('}') || matchKeyword$754('default') || matchKeyword$754('case')) {
                break;
            }
            statement$1031 = parseStatement$813();
            if (typeof statement$1031 === 'undefined') {
                break;
            }
            consequent$1030.push(statement$1031);
        }
        return {
            type: Syntax$706.SwitchCase,
            test: test$1029,
            consequent: consequent$1030
        };
    }
    function parseSwitchStatement$808() {
        var discriminant$1032, cases$1033, oldInSwitch$1034;
        expectKeyword$752('switch');
        expect$751('(');
        discriminant$1032 = parseExpression$788();
        expect$751(')');
        expect$751('{');
        if (match$753('}')) {
            lex$745();
            return {
                type: Syntax$706.SwitchStatement,
                discriminant: discriminant$1032
            };
        }
        cases$1033 = [];
        oldInSwitch$1034 = state$717.inSwitch;
        state$717.inSwitch = true;
        while (index$712 < length$715) {
            if (match$753('}')) {
                break;
            }
            cases$1033.push(parseSwitchCase$807());
        }
        state$717.inSwitch = oldInSwitch$1034;
        expect$751('}');
        return {
            type: Syntax$706.SwitchStatement,
            discriminant: discriminant$1032,
            cases: cases$1033
        };
    }
    // 12.13 The throw statement
    function parseThrowStatement$809() {
        var argument$1035;
        expectKeyword$752('throw');
        if (peekLineTerminator$747()) {
            throwError$748({}, Messages$708.NewlineAfterThrow);
        }
        argument$1035 = parseExpression$788();
        consumeSemicolon$756();
        return {
            type: Syntax$706.ThrowStatement,
            argument: argument$1035
        };
    }
    // 12.14 The try statement
    function parseCatchClause$810() {
        var param$1036;
        expectKeyword$752('catch');
        expect$751('(');
        if (!match$753(')')) {
            param$1036 = parseExpression$788();
            // 12.14.1
            if (strict$711 && param$1036.type === Syntax$706.Identifier && isRestrictedWord$732(param$1036.name)) {
                throwErrorTolerant$749({}, Messages$708.StrictCatchVariable);
            }
        }
        expect$751(')');
        return {
            type: Syntax$706.CatchClause,
            param: param$1036,
            guard: null,
            body: parseBlock$790()
        };
    }
    function parseTryStatement$811() {
        var block$1037, handlers$1038 = [], finalizer$1039 = null;
        expectKeyword$752('try');
        block$1037 = parseBlock$790();
        if (matchKeyword$754('catch')) {
            handlers$1038.push(parseCatchClause$810());
        }
        if (matchKeyword$754('finally')) {
            lex$745();
            finalizer$1039 = parseBlock$790();
        }
        if (handlers$1038.length === 0 && !finalizer$1039) {
            throwError$748({}, Messages$708.NoCatchOrFinally);
        }
        return {
            type: Syntax$706.TryStatement,
            block: block$1037,
            handlers: handlers$1038,
            finalizer: finalizer$1039
        };
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$812() {
        expectKeyword$752('debugger');
        consumeSemicolon$756();
        return { type: Syntax$706.DebuggerStatement };
    }
    // 12 Statements
    function parseStatement$813() {
        var token$1040 = lookahead$746().token, expr$1041, labeledBody$1042;
        if (token$1040.type === Token$704.EOF) {
            throwUnexpected$750(token$1040);
        }
        if (token$1040.type === Token$704.Punctuator) {
            switch (token$1040.value) {
            case ';':
                return parseEmptyStatement$796();
            case '{':
                return parseBlock$790();
            case '(':
                return parseExpressionStatement$797();
            default:
                break;
            }
        }
        if (token$1040.type === Token$704.Keyword) {
            switch (token$1040.value) {
            case 'break':
                return parseBreakStatement$804();
            case 'continue':
                return parseContinueStatement$803();
            case 'debugger':
                return parseDebuggerStatement$812();
            case 'do':
                return parseDoWhileStatement$799();
            case 'for':
                return parseForStatement$802();
            case 'function':
                return parseFunctionDeclaration$815();
            case 'if':
                return parseIfStatement$798();
            case 'return':
                return parseReturnStatement$805();
            case 'switch':
                return parseSwitchStatement$808();
            case 'throw':
                return parseThrowStatement$809();
            case 'try':
                return parseTryStatement$811();
            case 'var':
                return parseVariableStatement$794();
            case 'while':
                return parseWhileStatement$800();
            case 'with':
                return parseWithStatement$806();
            default:
                break;
            }
        }
        expr$1041 = parseExpression$788();
        // 12.12 Labelled Statements
        if (expr$1041.type === Syntax$706.Identifier && match$753(':')) {
            lex$745();
            if (Object.prototype.hasOwnProperty.call(state$717.labelSet, expr$1041.name)) {
                throwError$748({}, Messages$708.Redeclaration, 'Label', expr$1041.name);
            }
            state$717.labelSet[expr$1041.name] = true;
            labeledBody$1042 = parseStatement$813();
            delete state$717.labelSet[expr$1041.name];
            return {
                type: Syntax$706.LabeledStatement,
                label: expr$1041,
                body: labeledBody$1042
            };
        }
        consumeSemicolon$756();
        return {
            type: Syntax$706.ExpressionStatement,
            expression: expr$1041
        };
    }
    // 13 Function Definition
    function parseFunctionSourceElements$814() {
        var sourceElement$1043, sourceElements$1044 = [], token$1045, directive$1046, firstRestricted$1047, oldLabelSet$1048, oldInIteration$1049, oldInSwitch$1050, oldInFunctionBody$1051;
        expect$751('{');
        while (index$712 < length$715) {
            token$1045 = lookahead$746().token;
            if (token$1045.type !== Token$704.StringLiteral) {
                break;
            }
            sourceElement$1043 = parseSourceElement$817();
            sourceElements$1044.push(sourceElement$1043);
            if (sourceElement$1043.expression.type !== Syntax$706.Literal) {
                // this is not directive
                break;
            }
            directive$1046 = sliceSource$722(token$1045.range[0] + 1, token$1045.range[1] - 1);
            if (directive$1046 === 'use strict') {
                strict$711 = true;
                if (firstRestricted$1047) {
                    throwError$748(firstRestricted$1047, Messages$708.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1047 && token$1045.octal) {
                    firstRestricted$1047 = token$1045;
                }
            }
        }
        oldLabelSet$1048 = state$717.labelSet;
        oldInIteration$1049 = state$717.inIteration;
        oldInSwitch$1050 = state$717.inSwitch;
        oldInFunctionBody$1051 = state$717.inFunctionBody;
        state$717.labelSet = {};
        state$717.inIteration = false;
        state$717.inSwitch = false;
        state$717.inFunctionBody = true;
        while (index$712 < length$715) {
            if (match$753('}')) {
                break;
            }
            sourceElement$1043 = parseSourceElement$817();
            if (typeof sourceElement$1043 === 'undefined') {
                break;
            }
            sourceElements$1044.push(sourceElement$1043);
        }
        expect$751('}');
        state$717.labelSet = oldLabelSet$1048;
        state$717.inIteration = oldInIteration$1049;
        state$717.inSwitch = oldInSwitch$1050;
        state$717.inFunctionBody = oldInFunctionBody$1051;
        return {
            type: Syntax$706.BlockStatement,
            body: sourceElements$1044
        };
    }
    function parseFunctionDeclaration$815() {
        var id$1052, param$1053, params$1054 = [], body$1055, token$1056, firstRestricted$1057, message$1058, previousStrict$1059, paramSet$1060;
        expectKeyword$752('function');
        token$1056 = lookahead$746().token;
        id$1052 = parseVariableIdentifier$791();
        if (strict$711) {
            if (isRestrictedWord$732(token$1056.value)) {
                throwError$748(token$1056, Messages$708.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$732(token$1056.value)) {
                firstRestricted$1057 = token$1056;
                message$1058 = Messages$708.StrictFunctionName;
            } else if (isStrictModeReservedWord$731(token$1056.value)) {
                firstRestricted$1057 = token$1056;
                message$1058 = Messages$708.StrictReservedWord;
            }
        }
        expect$751('(');
        if (!match$753(')')) {
            paramSet$1060 = {};
            while (index$712 < length$715) {
                token$1056 = lookahead$746().token;
                param$1053 = parseVariableIdentifier$791();
                if (strict$711) {
                    if (isRestrictedWord$732(token$1056.value)) {
                        throwError$748(token$1056, Messages$708.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$1060, token$1056.value)) {
                        throwError$748(token$1056, Messages$708.StrictParamDupe);
                    }
                } else if (!firstRestricted$1057) {
                    if (isRestrictedWord$732(token$1056.value)) {
                        firstRestricted$1057 = token$1056;
                        message$1058 = Messages$708.StrictParamName;
                    } else if (isStrictModeReservedWord$731(token$1056.value)) {
                        firstRestricted$1057 = token$1056;
                        message$1058 = Messages$708.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$1060, token$1056.value)) {
                        firstRestricted$1057 = token$1056;
                        message$1058 = Messages$708.StrictParamDupe;
                    }
                }
                params$1054.push(param$1053);
                paramSet$1060[param$1053.name] = true;
                if (match$753(')')) {
                    break;
                }
                expect$751(',');
            }
        }
        expect$751(')');
        previousStrict$1059 = strict$711;
        body$1055 = parseFunctionSourceElements$814();
        if (strict$711 && firstRestricted$1057) {
            throwError$748(firstRestricted$1057, message$1058);
        }
        strict$711 = previousStrict$1059;
        return {
            type: Syntax$706.FunctionDeclaration,
            id: id$1052,
            params: params$1054,
            body: body$1055
        };
    }
    function parseFunctionExpression$816() {
        var token$1061, id$1062 = null, firstRestricted$1063, message$1064, param$1065, params$1066 = [], body$1067, previousStrict$1068, paramSet$1069;
        expectKeyword$752('function');
        if (!match$753('(')) {
            token$1061 = lookahead$746().token;
            id$1062 = parseVariableIdentifier$791();
            if (strict$711) {
                if (isRestrictedWord$732(token$1061.value)) {
                    throwError$748(token$1061, Messages$708.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$732(token$1061.value)) {
                    firstRestricted$1063 = token$1061;
                    message$1064 = Messages$708.StrictFunctionName;
                } else if (isStrictModeReservedWord$731(token$1061.value)) {
                    firstRestricted$1063 = token$1061;
                    message$1064 = Messages$708.StrictReservedWord;
                }
            }
        }
        expect$751('(');
        if (!match$753(')')) {
            paramSet$1069 = {};
            while (index$712 < length$715) {
                token$1061 = lookahead$746().token;
                param$1065 = parseVariableIdentifier$791();
                if (strict$711) {
                    if (isRestrictedWord$732(token$1061.value)) {
                        throwError$748(token$1061, Messages$708.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$1069, token$1061.value)) {
                        throwError$748(token$1061, Messages$708.StrictParamDupe);
                    }
                } else if (!firstRestricted$1063) {
                    if (isRestrictedWord$732(token$1061.value)) {
                        firstRestricted$1063 = token$1061;
                        message$1064 = Messages$708.StrictParamName;
                    } else if (isStrictModeReservedWord$731(token$1061.value)) {
                        firstRestricted$1063 = token$1061;
                        message$1064 = Messages$708.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$1069, token$1061.value)) {
                        firstRestricted$1063 = token$1061;
                        message$1064 = Messages$708.StrictParamDupe;
                    }
                }
                params$1066.push(param$1065);
                paramSet$1069[param$1065.name] = true;
                if (match$753(')')) {
                    break;
                }
                expect$751(',');
            }
        }
        expect$751(')');
        previousStrict$1068 = strict$711;
        body$1067 = parseFunctionSourceElements$814();
        if (strict$711 && firstRestricted$1063) {
            throwError$748(firstRestricted$1063, message$1064);
        }
        strict$711 = previousStrict$1068;
        return {
            type: Syntax$706.FunctionExpression,
            id: id$1062,
            params: params$1066,
            body: body$1067
        };
    }
    // 14 Program
    function parseSourceElement$817() {
        var token$1070 = lookahead$746().token;
        if (token$1070.type === Token$704.Keyword) {
            switch (token$1070.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$795(token$1070.value);
            case 'function':
                return parseFunctionDeclaration$815();
            default:
                return parseStatement$813();
            }
        }
        if (token$1070.type !== Token$704.EOF) {
            return parseStatement$813();
        }
    }
    function parseSourceElements$818() {
        var sourceElement$1071, sourceElements$1072 = [], token$1073, directive$1074, firstRestricted$1075;
        while (index$712 < length$715) {
            token$1073 = lookahead$746();
            if (token$1073.type !== Token$704.StringLiteral) {
                break;
            }
            sourceElement$1071 = parseSourceElement$817();
            sourceElements$1072.push(sourceElement$1071);
            if (sourceElement$1071.expression.type !== Syntax$706.Literal) {
                // this is not directive
                break;
            }
            directive$1074 = sliceSource$722(token$1073.range[0] + 1, token$1073.range[1] - 1);
            if (directive$1074 === 'use strict') {
                strict$711 = true;
                if (firstRestricted$1075) {
                    throwError$748(firstRestricted$1075, Messages$708.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1075 && token$1073.octal) {
                    firstRestricted$1075 = token$1073;
                }
            }
        }
        while (index$712 < length$715) {
            sourceElement$1071 = parseSourceElement$817();
            if (typeof sourceElement$1071 === 'undefined') {
                break;
            }
            sourceElements$1072.push(sourceElement$1071);
        }
        return sourceElements$1072;
    }
    function parseProgram$819() {
        var program$1076;
        strict$711 = false;
        program$1076 = {
            type: Syntax$706.Program,
            body: parseSourceElements$818()
        };
        return program$1076;
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$820(start$1077, end$1078, type$1079, value$1080) {
        assert$720(typeof start$1077 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$719.comments.length > 0) {
            if (extra$719.comments[extra$719.comments.length - 1].range[1] > start$1077) {
                return;
            }
        }
        extra$719.comments.push({
            range: [
                start$1077,
                end$1078
            ],
            type: type$1079,
            value: value$1080
        });
    }
    function scanComment$821() {
        var comment$1081, ch$1082, start$1083, blockComment$1084, lineComment$1085;
        comment$1081 = '';
        blockComment$1084 = false;
        lineComment$1085 = false;
        while (index$712 < length$715) {
            ch$1082 = source$710[index$712];
            if (lineComment$1085) {
                ch$1082 = nextChar$734();
                if (index$712 >= length$715) {
                    lineComment$1085 = false;
                    comment$1081 += ch$1082;
                    addComment$820(start$1083, index$712, 'Line', comment$1081);
                } else if (isLineTerminator$727(ch$1082)) {
                    lineComment$1085 = false;
                    addComment$820(start$1083, index$712, 'Line', comment$1081);
                    if (ch$1082 === '\r' && source$710[index$712] === '\n') {
                        ++index$712;
                    }
                    ++lineNumber$713;
                    lineStart$714 = index$712;
                    comment$1081 = '';
                } else {
                    comment$1081 += ch$1082;
                }
            } else if (blockComment$1084) {
                if (isLineTerminator$727(ch$1082)) {
                    if (ch$1082 === '\r' && source$710[index$712 + 1] === '\n') {
                        ++index$712;
                        comment$1081 += '\r\n';
                    } else {
                        comment$1081 += ch$1082;
                    }
                    ++lineNumber$713;
                    ++index$712;
                    lineStart$714 = index$712;
                    if (index$712 >= length$715) {
                        throwError$748({}, Messages$708.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1082 = nextChar$734();
                    if (index$712 >= length$715) {
                        throwError$748({}, Messages$708.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1081 += ch$1082;
                    if (ch$1082 === '*') {
                        ch$1082 = source$710[index$712];
                        if (ch$1082 === '/') {
                            comment$1081 = comment$1081.substr(0, comment$1081.length - 1);
                            blockComment$1084 = false;
                            ++index$712;
                            addComment$820(start$1083, index$712, 'Block', comment$1081);
                            comment$1081 = '';
                        }
                    }
                }
            } else if (ch$1082 === '/') {
                ch$1082 = source$710[index$712 + 1];
                if (ch$1082 === '/') {
                    start$1083 = index$712;
                    index$712 += 2;
                    lineComment$1085 = true;
                } else if (ch$1082 === '*') {
                    start$1083 = index$712;
                    index$712 += 2;
                    blockComment$1084 = true;
                    if (index$712 >= length$715) {
                        throwError$748({}, Messages$708.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$726(ch$1082)) {
                ++index$712;
            } else if (isLineTerminator$727(ch$1082)) {
                ++index$712;
                if (ch$1082 === '\r' && source$710[index$712] === '\n') {
                    ++index$712;
                }
                ++lineNumber$713;
                lineStart$714 = index$712;
            } else {
                break;
            }
        }
    }
    function collectToken$822() {
        var token$1086 = extra$719.advance(), range$1087, value$1088;
        if (token$1086.type !== Token$704.EOF) {
            range$1087 = [
                token$1086.range[0],
                token$1086.range[1]
            ];
            value$1088 = sliceSource$722(token$1086.range[0], token$1086.range[1]);
            extra$719.tokens.push({
                type: TokenName$705[token$1086.type],
                value: value$1088,
                lineNumber: lineNumber$713,
                lineStart: lineStart$714,
                range: range$1087
            });
        }
        return token$1086;
    }
    function collectRegex$823() {
        var pos$1089, regex$1090, token$1091;
        skipComment$736();
        pos$1089 = index$712;
        regex$1090 = extra$719.scanRegExp();
        // Pop the previous token, which is likely '/' or '/='
        if (extra$719.tokens.length > 0) {
            token$1091 = extra$719.tokens[extra$719.tokens.length - 1];
            if (token$1091.range[0] === pos$1089 && token$1091.type === 'Punctuator') {
                if (token$1091.value === '/' || token$1091.value === '/=') {
                    extra$719.tokens.pop();
                }
            }
        }
        extra$719.tokens.push({
            type: 'RegularExpression',
            value: regex$1090.literal,
            range: [
                pos$1089,
                index$712
            ],
            lineStart: token$1091.lineStart,
            lineNumber: token$1091.lineNumber
        });
        return regex$1090;
    }
    function createLiteral$824(token$1092) {
        if (Array.isArray(token$1092)) {
            return {
                type: Syntax$706.Literal,
                value: token$1092
            };
        }
        return {
            type: Syntax$706.Literal,
            value: token$1092.value,
            lineStart: token$1092.lineStart,
            lineNumber: token$1092.lineNumber
        };
    }
    function createRawLiteral$825(token$1093) {
        return {
            type: Syntax$706.Literal,
            value: token$1093.value,
            raw: sliceSource$722(token$1093.range[0], token$1093.range[1]),
            lineStart: token$1093.lineStart,
            lineNumber: token$1093.lineNumber
        };
    }
    function wrapTrackingFunction$826(range$1094, loc$1095) {
        return function (parseFunction$1096) {
            function isBinary$1097(node$1099) {
                return node$1099.type === Syntax$706.LogicalExpression || node$1099.type === Syntax$706.BinaryExpression;
            }
            function visit$1098(node$1100) {
                if (isBinary$1097(node$1100.left)) {
                    visit$1098(node$1100.left);
                }
                if (isBinary$1097(node$1100.right)) {
                    visit$1098(node$1100.right);
                }
                if (range$1094 && typeof node$1100.range === 'undefined') {
                    node$1100.range = [
                        node$1100.left.range[0],
                        node$1100.right.range[1]
                    ];
                }
                if (loc$1095 && typeof node$1100.loc === 'undefined') {
                    node$1100.loc = {
                        start: node$1100.left.loc.start,
                        end: node$1100.right.loc.end
                    };
                }
            }
            return function () {
                var node$1101, rangeInfo$1102, locInfo$1103;
                // skipComment();
                var curr$1104 = tokenStream$718[index$712].token;
                rangeInfo$1102 = [
                    curr$1104.range[0],
                    0
                ];
                locInfo$1103 = {
                    start: {
                        line: curr$1104.sm_lineNumber,
                        column: curr$1104.sm_range[0] - curr$1104.sm_lineStart
                    }
                };
                node$1101 = parseFunction$1096.apply(null, arguments);
                if (typeof node$1101 !== 'undefined') {
                    var last$1105 = tokenStream$718[index$712].token;
                    if (range$1094) {
                        rangeInfo$1102[1] = last$1105.range[1];
                        node$1101.range = rangeInfo$1102;
                    }
                    if (loc$1095) {
                        locInfo$1103.end = {
                            line: last$1105.sm_lineNumber,
                            column: last$1105.sm_range[0] - last$1105.sm_lineStart
                        };
                        node$1101.loc = locInfo$1103;
                    }
                    if (isBinary$1097(node$1101)) {
                        visit$1098(node$1101);
                    }
                    if (node$1101.type === Syntax$706.MemberExpression) {
                        if (typeof node$1101.object.range !== 'undefined') {
                            node$1101.range[0] = node$1101.object.range[0];
                        }
                        if (typeof node$1101.object.loc !== 'undefined') {
                            node$1101.loc.start = node$1101.object.loc.start;
                        }
                    }
                    if (node$1101.type === Syntax$706.CallExpression) {
                        if (typeof node$1101.callee.range !== 'undefined') {
                            node$1101.range[0] = node$1101.callee.range[0];
                        }
                        if (typeof node$1101.callee.loc !== 'undefined') {
                            node$1101.loc.start = node$1101.callee.loc.start;
                        }
                    }
                    if (node$1101.type !== Syntax$706.Program) {
                        if (curr$1104.leadingComments) {
                            node$1101.leadingComments = curr$1104.leadingComments;
                        }
                        if (curr$1104.trailingComments) {
                            node$1101.trailingComments = curr$1104.trailingComments;
                        }
                    }
                    return node$1101;
                }
            };
        };
    }
    function patch$827() {
        var wrapTracking$1106;
        if (extra$719.comments) {
            extra$719.skipComment = skipComment$736;
            skipComment$736 = scanComment$821;
        }
        if (extra$719.raw) {
            extra$719.createLiteral = createLiteral$824;
            createLiteral$824 = createRawLiteral$825;
        }
        if (extra$719.range || extra$719.loc) {
            wrapTracking$1106 = wrapTrackingFunction$826(extra$719.range, extra$719.loc);
            extra$719.parseAdditiveExpression = parseAdditiveExpression$777;
            extra$719.parseAssignmentExpression = parseAssignmentExpression$787;
            extra$719.parseBitwiseANDExpression = parseBitwiseANDExpression$781;
            extra$719.parseBitwiseORExpression = parseBitwiseORExpression$783;
            extra$719.parseBitwiseXORExpression = parseBitwiseXORExpression$782;
            extra$719.parseBlock = parseBlock$790;
            extra$719.parseFunctionSourceElements = parseFunctionSourceElements$814;
            extra$719.parseCallMember = parseCallMember$768;
            extra$719.parseCatchClause = parseCatchClause$810;
            extra$719.parseComputedMember = parseComputedMember$767;
            extra$719.parseConditionalExpression = parseConditionalExpression$786;
            extra$719.parseConstLetDeclaration = parseConstLetDeclaration$795;
            extra$719.parseEqualityExpression = parseEqualityExpression$780;
            extra$719.parseExpression = parseExpression$788;
            extra$719.parseForVariableDeclaration = parseForVariableDeclaration$801;
            extra$719.parseFunctionDeclaration = parseFunctionDeclaration$815;
            extra$719.parseFunctionExpression = parseFunctionExpression$816;
            extra$719.parseLogicalANDExpression = parseLogicalANDExpression$784;
            extra$719.parseLogicalORExpression = parseLogicalORExpression$785;
            extra$719.parseMultiplicativeExpression = parseMultiplicativeExpression$776;
            extra$719.parseNewExpression = parseNewExpression$769;
            extra$719.parseNonComputedMember = parseNonComputedMember$766;
            extra$719.parseNonComputedProperty = parseNonComputedProperty$765;
            extra$719.parseObjectProperty = parseObjectProperty$761;
            extra$719.parseObjectPropertyKey = parseObjectPropertyKey$760;
            extra$719.parsePostfixExpression = parsePostfixExpression$774;
            extra$719.parsePrimaryExpression = parsePrimaryExpression$763;
            extra$719.parseProgram = parseProgram$819;
            extra$719.parsePropertyFunction = parsePropertyFunction$759;
            extra$719.parseRelationalExpression = parseRelationalExpression$779;
            extra$719.parseStatement = parseStatement$813;
            extra$719.parseShiftExpression = parseShiftExpression$778;
            extra$719.parseSwitchCase = parseSwitchCase$807;
            extra$719.parseUnaryExpression = parseUnaryExpression$775;
            extra$719.parseVariableDeclaration = parseVariableDeclaration$792;
            extra$719.parseVariableIdentifier = parseVariableIdentifier$791;
            parseAdditiveExpression$777 = wrapTracking$1106(extra$719.parseAdditiveExpression);
            parseAssignmentExpression$787 = wrapTracking$1106(extra$719.parseAssignmentExpression);
            parseBitwiseANDExpression$781 = wrapTracking$1106(extra$719.parseBitwiseANDExpression);
            parseBitwiseORExpression$783 = wrapTracking$1106(extra$719.parseBitwiseORExpression);
            parseBitwiseXORExpression$782 = wrapTracking$1106(extra$719.parseBitwiseXORExpression);
            parseBlock$790 = wrapTracking$1106(extra$719.parseBlock);
            parseFunctionSourceElements$814 = wrapTracking$1106(extra$719.parseFunctionSourceElements);
            parseCallMember$768 = wrapTracking$1106(extra$719.parseCallMember);
            parseCatchClause$810 = wrapTracking$1106(extra$719.parseCatchClause);
            parseComputedMember$767 = wrapTracking$1106(extra$719.parseComputedMember);
            parseConditionalExpression$786 = wrapTracking$1106(extra$719.parseConditionalExpression);
            parseConstLetDeclaration$795 = wrapTracking$1106(extra$719.parseConstLetDeclaration);
            parseEqualityExpression$780 = wrapTracking$1106(extra$719.parseEqualityExpression);
            parseExpression$788 = wrapTracking$1106(extra$719.parseExpression);
            parseForVariableDeclaration$801 = wrapTracking$1106(extra$719.parseForVariableDeclaration);
            parseFunctionDeclaration$815 = wrapTracking$1106(extra$719.parseFunctionDeclaration);
            parseFunctionExpression$816 = wrapTracking$1106(extra$719.parseFunctionExpression);
            parseLogicalANDExpression$784 = wrapTracking$1106(extra$719.parseLogicalANDExpression);
            parseLogicalORExpression$785 = wrapTracking$1106(extra$719.parseLogicalORExpression);
            parseMultiplicativeExpression$776 = wrapTracking$1106(extra$719.parseMultiplicativeExpression);
            parseNewExpression$769 = wrapTracking$1106(extra$719.parseNewExpression);
            parseNonComputedMember$766 = wrapTracking$1106(extra$719.parseNonComputedMember);
            parseNonComputedProperty$765 = wrapTracking$1106(extra$719.parseNonComputedProperty);
            parseObjectProperty$761 = wrapTracking$1106(extra$719.parseObjectProperty);
            parseObjectPropertyKey$760 = wrapTracking$1106(extra$719.parseObjectPropertyKey);
            parsePostfixExpression$774 = wrapTracking$1106(extra$719.parsePostfixExpression);
            parsePrimaryExpression$763 = wrapTracking$1106(extra$719.parsePrimaryExpression);
            parseProgram$819 = wrapTracking$1106(extra$719.parseProgram);
            parsePropertyFunction$759 = wrapTracking$1106(extra$719.parsePropertyFunction);
            parseRelationalExpression$779 = wrapTracking$1106(extra$719.parseRelationalExpression);
            parseStatement$813 = wrapTracking$1106(extra$719.parseStatement);
            parseShiftExpression$778 = wrapTracking$1106(extra$719.parseShiftExpression);
            parseSwitchCase$807 = wrapTracking$1106(extra$719.parseSwitchCase);
            parseUnaryExpression$775 = wrapTracking$1106(extra$719.parseUnaryExpression);
            parseVariableDeclaration$792 = wrapTracking$1106(extra$719.parseVariableDeclaration);
            parseVariableIdentifier$791 = wrapTracking$1106(extra$719.parseVariableIdentifier);
        }
        if (typeof extra$719.tokens !== 'undefined') {
            extra$719.advance = advance$744;
            extra$719.scanRegExp = scanRegExp$742;
            advance$744 = collectToken$822;
            scanRegExp$742 = collectRegex$823;
        }
    }
    function unpatch$828() {
        if (typeof extra$719.skipComment === 'function') {
            skipComment$736 = extra$719.skipComment;
        }
        if (extra$719.raw) {
            createLiteral$824 = extra$719.createLiteral;
        }
        if (extra$719.range || extra$719.loc) {
            parseAdditiveExpression$777 = extra$719.parseAdditiveExpression;
            parseAssignmentExpression$787 = extra$719.parseAssignmentExpression;
            parseBitwiseANDExpression$781 = extra$719.parseBitwiseANDExpression;
            parseBitwiseORExpression$783 = extra$719.parseBitwiseORExpression;
            parseBitwiseXORExpression$782 = extra$719.parseBitwiseXORExpression;
            parseBlock$790 = extra$719.parseBlock;
            parseFunctionSourceElements$814 = extra$719.parseFunctionSourceElements;
            parseCallMember$768 = extra$719.parseCallMember;
            parseCatchClause$810 = extra$719.parseCatchClause;
            parseComputedMember$767 = extra$719.parseComputedMember;
            parseConditionalExpression$786 = extra$719.parseConditionalExpression;
            parseConstLetDeclaration$795 = extra$719.parseConstLetDeclaration;
            parseEqualityExpression$780 = extra$719.parseEqualityExpression;
            parseExpression$788 = extra$719.parseExpression;
            parseForVariableDeclaration$801 = extra$719.parseForVariableDeclaration;
            parseFunctionDeclaration$815 = extra$719.parseFunctionDeclaration;
            parseFunctionExpression$816 = extra$719.parseFunctionExpression;
            parseLogicalANDExpression$784 = extra$719.parseLogicalANDExpression;
            parseLogicalORExpression$785 = extra$719.parseLogicalORExpression;
            parseMultiplicativeExpression$776 = extra$719.parseMultiplicativeExpression;
            parseNewExpression$769 = extra$719.parseNewExpression;
            parseNonComputedMember$766 = extra$719.parseNonComputedMember;
            parseNonComputedProperty$765 = extra$719.parseNonComputedProperty;
            parseObjectProperty$761 = extra$719.parseObjectProperty;
            parseObjectPropertyKey$760 = extra$719.parseObjectPropertyKey;
            parsePrimaryExpression$763 = extra$719.parsePrimaryExpression;
            parsePostfixExpression$774 = extra$719.parsePostfixExpression;
            parseProgram$819 = extra$719.parseProgram;
            parsePropertyFunction$759 = extra$719.parsePropertyFunction;
            parseRelationalExpression$779 = extra$719.parseRelationalExpression;
            parseStatement$813 = extra$719.parseStatement;
            parseShiftExpression$778 = extra$719.parseShiftExpression;
            parseSwitchCase$807 = extra$719.parseSwitchCase;
            parseUnaryExpression$775 = extra$719.parseUnaryExpression;
            parseVariableDeclaration$792 = extra$719.parseVariableDeclaration;
            parseVariableIdentifier$791 = extra$719.parseVariableIdentifier;
        }
        if (typeof extra$719.scanRegExp === 'function') {
            advance$744 = extra$719.advance;
            scanRegExp$742 = extra$719.scanRegExp;
        }
    }
    function stringToArray$829(str$1107) {
        var length$1108 = str$1107.length, result$1109 = [], i$1110;
        for (i$1110 = 0; i$1110 < length$1108; ++i$1110) {
            result$1109[i$1110] = str$1107.charAt(i$1110);
        }
        return result$1109;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$830(toks$1111, start$1112, inExprDelim$1113, parentIsBlock$1114) {
        var assignOps$1115 = [
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
        var binaryOps$1116 = [
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
        var unaryOps$1117 = [
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
        function back$1118(n$1119) {
            var idx$1120 = toks$1111.length - n$1119 > 0 ? toks$1111.length - n$1119 : 0;
            return toks$1111[idx$1120];
        }
        if (inExprDelim$1113 && toks$1111.length - (start$1112 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1118(start$1112 + 2).value === ':' && parentIsBlock$1114) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$721(back$1118(start$1112 + 2).value, unaryOps$1117.concat(binaryOps$1116).concat(assignOps$1115))) {
            // ... + {...}
            return false;
        } else if (back$1118(start$1112 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1121 = typeof back$1118(start$1112 + 1).startLineNumber !== 'undefined' ? back$1118(start$1112 + 1).startLineNumber : back$1118(start$1112 + 1).lineNumber;
            if (back$1118(start$1112 + 2).lineNumber !== currLineNumber$1121) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$721(back$1118(start$1112 + 2).value, [
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
    function readToken$831(toks$1122, inExprDelim$1123, parentIsBlock$1124) {
        var delimiters$1125 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1126 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1127 = toks$1122.length - 1;
        var comments$1128, commentsLen$1129 = extra$719.comments.length;
        function back$1130(n$1134) {
            var idx$1135 = toks$1122.length - n$1134 > 0 ? toks$1122.length - n$1134 : 0;
            return toks$1122[idx$1135];
        }
        function attachComments$1131(token$1136) {
            if (comments$1128) {
                token$1136.leadingComments = comments$1128;
            }
            return token$1136;
        }
        function _advance$1132() {
            return attachComments$1131(advance$744());
        }
        function _scanRegExp$1133() {
            return attachComments$1131(scanRegExp$742());
        }
        skipComment$736();
        if (extra$719.comments.length > commentsLen$1129) {
            comments$1128 = extra$719.comments.slice(commentsLen$1129);
        }
        if (isIn$721(getChar$735(), delimiters$1125)) {
            return attachComments$1131(readDelim$832(toks$1122, inExprDelim$1123, parentIsBlock$1124));
        }
        if (getChar$735() === '/') {
            var prev$1137 = back$1130(1);
            if (prev$1137) {
                if (prev$1137.value === '()') {
                    if (isIn$721(back$1130(2).value, parenIdents$1126)) {
                        // ... if (...) / ...
                        return _scanRegExp$1133();
                    }
                    // ... (...) / ...
                    return _advance$1132();
                }
                if (prev$1137.value === '{}') {
                    if (blockAllowed$830(toks$1122, 0, inExprDelim$1123, parentIsBlock$1124)) {
                        if (back$1130(2).value === '()') {
                            // named function
                            if (back$1130(4).value === 'function') {
                                if (!blockAllowed$830(toks$1122, 3, inExprDelim$1123, parentIsBlock$1124)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1132();
                                }
                                if (toks$1122.length - 5 <= 0 && inExprDelim$1123) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1132();
                                }
                            }
                            // unnamed function
                            if (back$1130(3).value === 'function') {
                                if (!blockAllowed$830(toks$1122, 2, inExprDelim$1123, parentIsBlock$1124)) {
                                    // new function (...) {...} / ...
                                    return _advance$1132();
                                }
                                if (toks$1122.length - 4 <= 0 && inExprDelim$1123) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1132();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1133();
                    } else {
                        // ... + {...} / ...
                        return _advance$1132();
                    }
                }
                if (prev$1137.type === Token$704.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1133();
                }
                if (isKeyword$733(prev$1137.value)) {
                    // typeof /...
                    return _scanRegExp$1133();
                }
                return _advance$1132();
            }
            return _scanRegExp$1133();
        }
        return _advance$1132();
    }
    function readDelim$832(toks$1138, inExprDelim$1139, parentIsBlock$1140) {
        var startDelim$1141 = advance$744(), matchDelim$1142 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1143 = [];
        var delimiters$1144 = [
                '(',
                '{',
                '['
            ];
        assert$720(delimiters$1144.indexOf(startDelim$1141.value) !== -1, 'Need to begin at the delimiter');
        var token$1145 = startDelim$1141;
        var startLineNumber$1146 = token$1145.lineNumber;
        var startLineStart$1147 = token$1145.lineStart;
        var startRange$1148 = token$1145.range;
        var delimToken$1149 = {};
        delimToken$1149.type = Token$704.Delimiter;
        delimToken$1149.value = startDelim$1141.value + matchDelim$1142[startDelim$1141.value];
        delimToken$1149.startLineNumber = startLineNumber$1146;
        delimToken$1149.startLineStart = startLineStart$1147;
        delimToken$1149.startRange = startRange$1148;
        var delimIsBlock$1150 = false;
        if (startDelim$1141.value === '{') {
            delimIsBlock$1150 = blockAllowed$830(toks$1138.concat(delimToken$1149), 0, inExprDelim$1139, parentIsBlock$1140);
        }
        while (index$712 <= length$715) {
            token$1145 = readToken$831(inner$1143, startDelim$1141.value === '(' || startDelim$1141.value === '[', delimIsBlock$1150);
            if (token$1145.type === Token$704.Punctuator && token$1145.value === matchDelim$1142[startDelim$1141.value]) {
                if (token$1145.leadingComments) {
                    delimToken$1149.trailingComments = token$1145.leadingComments;
                }
                break;
            } else if (token$1145.type === Token$704.EOF) {
                throwError$748({}, Messages$708.UnexpectedEOS);
            } else {
                inner$1143.push(token$1145);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$712 >= length$715 && matchDelim$1142[startDelim$1141.value] !== source$710[length$715 - 1]) {
            throwError$748({}, Messages$708.UnexpectedEOS);
        }
        var endLineNumber$1151 = token$1145.lineNumber;
        var endLineStart$1152 = token$1145.lineStart;
        var endRange$1153 = token$1145.range;
        delimToken$1149.inner = inner$1143;
        delimToken$1149.endLineNumber = endLineNumber$1151;
        delimToken$1149.endLineStart = endLineStart$1152;
        delimToken$1149.endRange = endRange$1153;
        return delimToken$1149;
    }
    ;
    // (Str) -> [...CSyntax]
    function read$833(code$1154) {
        var token$1155, tokenTree$1156 = [];
        extra$719 = {};
        extra$719.comments = [];
        patch$827();
        source$710 = code$1154;
        index$712 = 0;
        lineNumber$713 = source$710.length > 0 ? 1 : 0;
        lineStart$714 = 0;
        length$715 = source$710.length;
        buffer$716 = null;
        state$717 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$712 < length$715) {
            tokenTree$1156.push(readToken$831(tokenTree$1156, false, false));
        }
        var last$1157 = tokenTree$1156[tokenTree$1156.length - 1];
        if (last$1157 && last$1157.type !== Token$704.EOF) {
            tokenTree$1156.push({
                type: Token$704.EOF,
                value: '',
                lineNumber: last$1157.lineNumber,
                lineStart: last$1157.lineStart,
                range: [
                    index$712,
                    index$712
                ]
            });
        }
        return expander$703.tokensToSyntax(tokenTree$1156);
    }
    // (SyntaxObject, Str, {}) -> SyntaxObject
    function parse$834(code$1158) {
        var program$1159, toString$1160;
        tokenStream$718 = code$1158;
        index$712 = 0;
        length$715 = tokenStream$718.length;
        buffer$716 = null;
        state$717 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$719 = {
            range: true,
            loc: true
        };
        patch$827();
        try {
            program$1159 = parseProgram$819();
            program$1159.tokens = expander$703.syntaxToTokens(code$1158);
        } catch (e$1161) {
            throw e$1161;
        } finally {
            unpatch$828();
            extra$719 = {};
        }
        return program$1159;
    }
    exports$702.parse = parse$834;
    exports$702.read = read$833;
    exports$702.Token = Token$704;
    exports$702.assert = assert$720;
    // Deep copy.
    exports$702.Syntax = function () {
        var name$1162, types$1163 = {};
        if (typeof Object.create === 'function') {
            types$1163 = Object.create(null);
        }
        for (name$1162 in Syntax$706) {
            if (Syntax$706.hasOwnProperty(name$1162)) {
                types$1163[name$1162] = Syntax$706[name$1162];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1163);
        }
        return types$1163;
    }();
}));