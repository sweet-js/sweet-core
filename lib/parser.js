// export syntax
// export macro;
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
(function (root$186, factory$187) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$187(exports, require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'expander'
        ], factory$187);
    }
}(this, function (exports$188, expander$189) {
    'use strict';
    var Token$190, TokenName$191, Syntax$192, PropertyKind$193, Messages$194, Regex$195, source$196, strict$197, index$198, lineNumber$199, lineStart$200, length$201, buffer$202, state$203, tokenStream$204, extra$205;
    Token$190 = {
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
    TokenName$191 = {};
    TokenName$191[Token$190.BooleanLiteral] = 'Boolean';
    TokenName$191[Token$190.EOF] = '<end>';
    TokenName$191[Token$190.Identifier] = 'Identifier';
    TokenName$191[Token$190.Keyword] = 'Keyword';
    TokenName$191[Token$190.NullLiteral] = 'Null';
    TokenName$191[Token$190.NumericLiteral] = 'Numeric';
    TokenName$191[Token$190.Punctuator] = 'Punctuator';
    TokenName$191[Token$190.StringLiteral] = 'String';
    TokenName$191[Token$190.Delimiter] = 'Delimiter';
    Syntax$192 = {
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
    PropertyKind$193 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    // Error messages should be identical to V8.
    Messages$194 = {
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
    Regex$195 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$206(condition$321, message$322) {
        if (!condition$321) {
            throw new Error('ASSERT: ' + message$322);
        }
    }
    function isIn$207(el$323, list$324) {
        return list$324.indexOf(el$323) !== -1;
    }
    function sliceSource$208(from$325, to$326) {
        return source$196.slice(from$325, to$326);
    }
    if (typeof 'esprima'[0] === 'undefined') {
        sliceSource$208 = function sliceArraySource$327(from$328, to$329) {
            return source$196.slice(from$328, to$329).join('');
        };
    }
    function isDecimalDigit$209(ch$330) {
        return '0123456789'.indexOf(ch$330) >= 0;
    }
    function isHexDigit$210(ch$331) {
        return '0123456789abcdefABCDEF'.indexOf(ch$331) >= 0;
    }
    function isOctalDigit$211(ch$332) {
        return '01234567'.indexOf(ch$332) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$212(ch$333) {
        return ch$333 === ' ' || ch$333 === '\t' || ch$333 === '\x0B' || ch$333 === '\f' || ch$333 === '\xa0' || ch$333.charCodeAt(0) >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(ch$333) >= 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$213(ch$334) {
        return ch$334 === '\n' || ch$334 === '\r' || ch$334 === '\u2028' || ch$334 === '\u2029';
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$214(ch$335) {
        return ch$335 === '$' || ch$335 === '_' || ch$335 === '\\' || ch$335 >= 'a' && ch$335 <= 'z' || ch$335 >= 'A' && ch$335 <= 'Z' || ch$335.charCodeAt(0) >= 128 && Regex$195.NonAsciiIdentifierStart.test(ch$335);
    }
    function isIdentifierPart$215(ch$336) {
        return ch$336 === '$' || ch$336 === '_' || ch$336 === '\\' || ch$336 >= 'a' && ch$336 <= 'z' || ch$336 >= 'A' && ch$336 <= 'Z' || ch$336 >= '0' && ch$336 <= '9' || ch$336.charCodeAt(0) >= 128 && Regex$195.NonAsciiIdentifierPart.test(ch$336);
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$216(id$337) {
        // we are allowing future reserved words so macros can be written for them
        return false;
    }
    function isStrictModeReservedWord$217(id$338) {
        switch (id$338) {
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
    function isRestrictedWord$218(id$339) {
        return id$339 === 'eval' || id$339 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$219(id$340) {
        var keyword$341 = false;
        switch (id$340.length) {
        case 2:
            keyword$341 = id$340 === 'if' || id$340 === 'in' || id$340 === 'do';
            break;
        case 3:
            keyword$341 = id$340 === 'var' || id$340 === 'for' || id$340 === 'new' || id$340 === 'try';
            break;
        case 4:
            keyword$341 = id$340 === 'this' || id$340 === 'else' || id$340 === 'case' || id$340 === 'void' || id$340 === 'with';
            break;
        case 5:
            keyword$341 = id$340 === 'while' || id$340 === 'break' || id$340 === 'catch' || id$340 === 'throw';
            break;
        case 6:
            keyword$341 = id$340 === 'return' || id$340 === 'typeof' || id$340 === 'delete' || id$340 === 'switch';
            break;
        case 7:
            keyword$341 = id$340 === 'default' || id$340 === 'finally';
            break;
        case 8:
            keyword$341 = id$340 === 'function' || id$340 === 'continue' || id$340 === 'debugger';
            break;
        case 10:
            keyword$341 = id$340 === 'instanceof';
            break;
        }
        if (keyword$341) {
            return true;
        }
        switch (id$340) {
        // Future reserved words.
        // 'const' is specialized as Keyword in V8.
        case 'const':
            return true;
        // For compatiblity to SpiderMonkey and ES.next
        case 'yield':
        case 'let':
            return true;
        }
        if (strict$197 && isStrictModeReservedWord$217(id$340)) {
            return true;
        }
        return isFutureReservedWord$216(id$340);
    }
    // Return the next character and move forward.
    function nextChar$220() {
        return source$196[index$198++];
    }
    function getChar$221() {
        return source$196[index$198];
    }
    // 7.4 Comments
    function skipComment$222() {
        var ch$342, blockComment$343, lineComment$344;
        blockComment$343 = false;
        lineComment$344 = false;
        while (index$198 < length$201) {
            ch$342 = source$196[index$198];
            if (lineComment$344) {
                ch$342 = nextChar$220();
                if (isLineTerminator$213(ch$342)) {
                    lineComment$344 = false;
                    if (ch$342 === '\r' && source$196[index$198] === '\n') {
                        ++index$198;
                    }
                    ++lineNumber$199;
                    lineStart$200 = index$198;
                }
            } else if (blockComment$343) {
                if (isLineTerminator$213(ch$342)) {
                    if (ch$342 === '\r' && source$196[index$198 + 1] === '\n') {
                        ++index$198;
                    }
                    ++lineNumber$199;
                    ++index$198;
                    lineStart$200 = index$198;
                    if (index$198 >= length$201) {
                        throwError$234({}, Messages$194.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$342 = nextChar$220();
                    if (index$198 >= length$201) {
                        throwError$234({}, Messages$194.UnexpectedToken, 'ILLEGAL');
                    }
                    if (ch$342 === '*') {
                        ch$342 = source$196[index$198];
                        if (ch$342 === '/') {
                            ++index$198;
                            blockComment$343 = false;
                        }
                    }
                }
            } else if (ch$342 === '/') {
                ch$342 = source$196[index$198 + 1];
                if (ch$342 === '/') {
                    index$198 += 2;
                    lineComment$344 = true;
                } else if (ch$342 === '*') {
                    index$198 += 2;
                    blockComment$343 = true;
                    if (index$198 >= length$201) {
                        throwError$234({}, Messages$194.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$212(ch$342)) {
                ++index$198;
            } else if (isLineTerminator$213(ch$342)) {
                ++index$198;
                if (ch$342 === '\r' && source$196[index$198] === '\n') {
                    ++index$198;
                }
                ++lineNumber$199;
                lineStart$200 = index$198;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$223(prefix$345) {
        var i$346, len$347, ch$348, code$349 = 0;
        len$347 = prefix$345 === 'u' ? 4 : 2;
        for (i$346 = 0; i$346 < len$347; ++i$346) {
            if (index$198 < length$201 && isHexDigit$210(source$196[index$198])) {
                ch$348 = nextChar$220();
                code$349 = code$349 * 16 + '0123456789abcdef'.indexOf(ch$348.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$349);
    }
    function scanIdentifier$224() {
        var ch$350, start$351, id$352, restore$353;
        ch$350 = source$196[index$198];
        if (!isIdentifierStart$214(ch$350)) {
            return;
        }
        start$351 = index$198;
        if (ch$350 === '\\') {
            ++index$198;
            if (source$196[index$198] !== 'u') {
                return;
            }
            ++index$198;
            restore$353 = index$198;
            ch$350 = scanHexEscape$223('u');
            if (ch$350) {
                if (ch$350 === '\\' || !isIdentifierStart$214(ch$350)) {
                    return;
                }
                id$352 = ch$350;
            } else {
                index$198 = restore$353;
                id$352 = 'u';
            }
        } else {
            id$352 = nextChar$220();
        }
        while (index$198 < length$201) {
            ch$350 = source$196[index$198];
            if (!isIdentifierPart$215(ch$350)) {
                break;
            }
            if (ch$350 === '\\') {
                ++index$198;
                if (source$196[index$198] !== 'u') {
                    return;
                }
                ++index$198;
                restore$353 = index$198;
                ch$350 = scanHexEscape$223('u');
                if (ch$350) {
                    if (ch$350 === '\\' || !isIdentifierPart$215(ch$350)) {
                        return;
                    }
                    id$352 += ch$350;
                } else {
                    index$198 = restore$353;
                    id$352 += 'u';
                }
            } else {
                id$352 += nextChar$220();
            }
        }
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$352.length === 1) {
            return {
                type: Token$190.Identifier,
                value: id$352,
                lineNumber: lineNumber$199,
                lineStart: lineStart$200,
                range: [
                    start$351,
                    index$198
                ]
            };
        }
        if (isKeyword$219(id$352)) {
            return {
                type: Token$190.Keyword,
                value: id$352,
                lineNumber: lineNumber$199,
                lineStart: lineStart$200,
                range: [
                    start$351,
                    index$198
                ]
            };
        }
        // 7.8.1 Null Literals
        if (id$352 === 'null') {
            return {
                type: Token$190.NullLiteral,
                value: id$352,
                lineNumber: lineNumber$199,
                lineStart: lineStart$200,
                range: [
                    start$351,
                    index$198
                ]
            };
        }
        // 7.8.2 Boolean Literals
        if (id$352 === 'true' || id$352 === 'false') {
            return {
                type: Token$190.BooleanLiteral,
                value: id$352,
                lineNumber: lineNumber$199,
                lineStart: lineStart$200,
                range: [
                    start$351,
                    index$198
                ]
            };
        }
        return {
            type: Token$190.Identifier,
            value: id$352,
            lineNumber: lineNumber$199,
            lineStart: lineStart$200,
            range: [
                start$351,
                index$198
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$225() {
        var start$354 = index$198, ch1$355 = source$196[index$198], ch2$356, ch3$357, ch4$358;
        // Check for most common single-character punctuators.
        if (ch1$355 === ';' || ch1$355 === '{' || ch1$355 === '}') {
            ++index$198;
            return {
                type: Token$190.Punctuator,
                value: ch1$355,
                lineNumber: lineNumber$199,
                lineStart: lineStart$200,
                range: [
                    start$354,
                    index$198
                ]
            };
        }
        if (ch1$355 === ',' || ch1$355 === '(' || ch1$355 === ')') {
            ++index$198;
            return {
                type: Token$190.Punctuator,
                value: ch1$355,
                lineNumber: lineNumber$199,
                lineStart: lineStart$200,
                range: [
                    start$354,
                    index$198
                ]
            };
        }
        if (ch1$355 === '#') {
            ++index$198;
            return {
                type: Token$190.Punctuator,
                value: ch1$355,
                lineNumber: lineNumber$199,
                lineStart: lineStart$200,
                range: [
                    start$354,
                    index$198
                ]
            };
        }
        // Dot (.) can also start a floating-point number, hence the need
        // to check the next character.
        ch2$356 = source$196[index$198 + 1];
        if (ch1$355 === '.' && !isDecimalDigit$209(ch2$356)) {
            if (source$196[index$198 + 1] === '.' && source$196[index$198 + 2] === '.') {
                nextChar$220();
                nextChar$220();
                nextChar$220();
                return {
                    type: Token$190.Punctuator,
                    value: '...',
                    lineNumber: lineNumber$199,
                    lineStart: lineStart$200,
                    range: [
                        start$354,
                        index$198
                    ]
                };
            } else {
                return {
                    type: Token$190.Punctuator,
                    value: nextChar$220(),
                    lineNumber: lineNumber$199,
                    lineStart: lineStart$200,
                    range: [
                        start$354,
                        index$198
                    ]
                };
            }
        }
        // Peek more characters.
        ch3$357 = source$196[index$198 + 2];
        ch4$358 = source$196[index$198 + 3];
        // 4-character punctuator: >>>=
        if (ch1$355 === '>' && ch2$356 === '>' && ch3$357 === '>') {
            if (ch4$358 === '=') {
                index$198 += 4;
                return {
                    type: Token$190.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$199,
                    lineStart: lineStart$200,
                    range: [
                        start$354,
                        index$198
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$355 === '=' && ch2$356 === '=' && ch3$357 === '=') {
            index$198 += 3;
            return {
                type: Token$190.Punctuator,
                value: '===',
                lineNumber: lineNumber$199,
                lineStart: lineStart$200,
                range: [
                    start$354,
                    index$198
                ]
            };
        }
        if (ch1$355 === '!' && ch2$356 === '=' && ch3$357 === '=') {
            index$198 += 3;
            return {
                type: Token$190.Punctuator,
                value: '!==',
                lineNumber: lineNumber$199,
                lineStart: lineStart$200,
                range: [
                    start$354,
                    index$198
                ]
            };
        }
        if (ch1$355 === '>' && ch2$356 === '>' && ch3$357 === '>') {
            index$198 += 3;
            return {
                type: Token$190.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$199,
                lineStart: lineStart$200,
                range: [
                    start$354,
                    index$198
                ]
            };
        }
        if (ch1$355 === '<' && ch2$356 === '<' && ch3$357 === '=') {
            index$198 += 3;
            return {
                type: Token$190.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$199,
                lineStart: lineStart$200,
                range: [
                    start$354,
                    index$198
                ]
            };
        }
        if (ch1$355 === '>' && ch2$356 === '>' && ch3$357 === '=') {
            index$198 += 3;
            return {
                type: Token$190.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$199,
                lineStart: lineStart$200,
                range: [
                    start$354,
                    index$198
                ]
            };
        }
        // 2-character punctuators: <= >= == != ++ -- << >> && ||
        // += -= *= %= &= |= ^= /=
        if (ch2$356 === '=') {
            if ('<>=!+-*%&|^/'.indexOf(ch1$355) >= 0) {
                index$198 += 2;
                return {
                    type: Token$190.Punctuator,
                    value: ch1$355 + ch2$356,
                    lineNumber: lineNumber$199,
                    lineStart: lineStart$200,
                    range: [
                        start$354,
                        index$198
                    ]
                };
            }
        }
        if (ch1$355 === ch2$356 && '+-<>&|'.indexOf(ch1$355) >= 0) {
            if ('+-<>&|'.indexOf(ch2$356) >= 0) {
                index$198 += 2;
                return {
                    type: Token$190.Punctuator,
                    value: ch1$355 + ch2$356,
                    lineNumber: lineNumber$199,
                    lineStart: lineStart$200,
                    range: [
                        start$354,
                        index$198
                    ]
                };
            }
        }
        // The remaining 1-character punctuators.
        if ('[]<>+-*%&|^!~?:=/'.indexOf(ch1$355) >= 0) {
            return {
                type: Token$190.Punctuator,
                value: nextChar$220(),
                lineNumber: lineNumber$199,
                lineStart: lineStart$200,
                range: [
                    start$354,
                    index$198
                ]
            };
        }
    }
    // 7.8.3 Numeric Literals
    function scanNumericLiteral$226() {
        var number$359, start$360, ch$361;
        ch$361 = source$196[index$198];
        assert$206(isDecimalDigit$209(ch$361) || ch$361 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$360 = index$198;
        number$359 = '';
        if (ch$361 !== '.') {
            number$359 = nextChar$220();
            ch$361 = source$196[index$198];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            if (number$359 === '0') {
                if (ch$361 === 'x' || ch$361 === 'X') {
                    number$359 += nextChar$220();
                    while (index$198 < length$201) {
                        ch$361 = source$196[index$198];
                        if (!isHexDigit$210(ch$361)) {
                            break;
                        }
                        number$359 += nextChar$220();
                    }
                    if (number$359.length <= 2) {
                        // only 0x
                        throwError$234({}, Messages$194.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$198 < length$201) {
                        ch$361 = source$196[index$198];
                        if (isIdentifierStart$214(ch$361)) {
                            throwError$234({}, Messages$194.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$190.NumericLiteral,
                        value: parseInt(number$359, 16),
                        lineNumber: lineNumber$199,
                        lineStart: lineStart$200,
                        range: [
                            start$360,
                            index$198
                        ]
                    };
                } else if (isOctalDigit$211(ch$361)) {
                    number$359 += nextChar$220();
                    while (index$198 < length$201) {
                        ch$361 = source$196[index$198];
                        if (!isOctalDigit$211(ch$361)) {
                            break;
                        }
                        number$359 += nextChar$220();
                    }
                    if (index$198 < length$201) {
                        ch$361 = source$196[index$198];
                        if (isIdentifierStart$214(ch$361) || isDecimalDigit$209(ch$361)) {
                            throwError$234({}, Messages$194.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$190.NumericLiteral,
                        value: parseInt(number$359, 8),
                        octal: true,
                        lineNumber: lineNumber$199,
                        lineStart: lineStart$200,
                        range: [
                            start$360,
                            index$198
                        ]
                    };
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (isDecimalDigit$209(ch$361)) {
                    throwError$234({}, Messages$194.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (index$198 < length$201) {
                ch$361 = source$196[index$198];
                if (!isDecimalDigit$209(ch$361)) {
                    break;
                }
                number$359 += nextChar$220();
            }
        }
        if (ch$361 === '.') {
            number$359 += nextChar$220();
            while (index$198 < length$201) {
                ch$361 = source$196[index$198];
                if (!isDecimalDigit$209(ch$361)) {
                    break;
                }
                number$359 += nextChar$220();
            }
        }
        if (ch$361 === 'e' || ch$361 === 'E') {
            number$359 += nextChar$220();
            ch$361 = source$196[index$198];
            if (ch$361 === '+' || ch$361 === '-') {
                number$359 += nextChar$220();
            }
            ch$361 = source$196[index$198];
            if (isDecimalDigit$209(ch$361)) {
                number$359 += nextChar$220();
                while (index$198 < length$201) {
                    ch$361 = source$196[index$198];
                    if (!isDecimalDigit$209(ch$361)) {
                        break;
                    }
                    number$359 += nextChar$220();
                }
            } else {
                ch$361 = 'character ' + ch$361;
                if (index$198 >= length$201) {
                    ch$361 = '<end>';
                }
                throwError$234({}, Messages$194.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (index$198 < length$201) {
            ch$361 = source$196[index$198];
            if (isIdentifierStart$214(ch$361)) {
                throwError$234({}, Messages$194.UnexpectedToken, 'ILLEGAL');
            }
        }
        return {
            type: Token$190.NumericLiteral,
            value: parseFloat(number$359),
            lineNumber: lineNumber$199,
            lineStart: lineStart$200,
            range: [
                start$360,
                index$198
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$227() {
        var str$362 = '', quote$363, start$364, ch$365, code$366, unescaped$367, restore$368, octal$369 = false;
        quote$363 = source$196[index$198];
        assert$206(quote$363 === '\'' || quote$363 === '"', 'String literal must starts with a quote');
        start$364 = index$198;
        ++index$198;
        while (index$198 < length$201) {
            ch$365 = nextChar$220();
            if (ch$365 === quote$363) {
                quote$363 = '';
                break;
            } else if (ch$365 === '\\') {
                ch$365 = nextChar$220();
                if (!isLineTerminator$213(ch$365)) {
                    switch (ch$365) {
                    case 'n':
                        str$362 += '\n';
                        break;
                    case 'r':
                        str$362 += '\r';
                        break;
                    case 't':
                        str$362 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        restore$368 = index$198;
                        unescaped$367 = scanHexEscape$223(ch$365);
                        if (unescaped$367) {
                            str$362 += unescaped$367;
                        } else {
                            index$198 = restore$368;
                            str$362 += ch$365;
                        }
                        break;
                    case 'b':
                        str$362 += '\b';
                        break;
                    case 'f':
                        str$362 += '\f';
                        break;
                    case 'v':
                        str$362 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$211(ch$365)) {
                            code$366 = '01234567'.indexOf(ch$365);
                            // \0 is not octal escape sequence
                            if (code$366 !== 0) {
                                octal$369 = true;
                            }
                            if (index$198 < length$201 && isOctalDigit$211(source$196[index$198])) {
                                octal$369 = true;
                                code$366 = code$366 * 8 + '01234567'.indexOf(nextChar$220());
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$365) >= 0 && index$198 < length$201 && isOctalDigit$211(source$196[index$198])) {
                                    code$366 = code$366 * 8 + '01234567'.indexOf(nextChar$220());
                                }
                            }
                            str$362 += String.fromCharCode(code$366);
                        } else {
                            str$362 += ch$365;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$199;
                    if (ch$365 === '\r' && source$196[index$198] === '\n') {
                        ++index$198;
                    }
                }
            } else if (isLineTerminator$213(ch$365)) {
                break;
            } else {
                str$362 += ch$365;
            }
        }
        if (quote$363 !== '') {
            throwError$234({}, Messages$194.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$190.StringLiteral,
            value: str$362,
            octal: octal$369,
            lineNumber: lineNumber$199,
            lineStart: lineStart$200,
            range: [
                start$364,
                index$198
            ]
        };
    }
    function scanRegExp$228() {
        var str$370 = '', ch$371, start$372, pattern$373, flags$374, value$375, classMarker$376 = false, restore$377;
        buffer$202 = null;
        skipComment$222();
        start$372 = index$198;
        ch$371 = source$196[index$198];
        assert$206(ch$371 === '/', 'Regular expression literal must start with a slash');
        str$370 = nextChar$220();
        while (index$198 < length$201) {
            ch$371 = nextChar$220();
            str$370 += ch$371;
            if (classMarker$376) {
                if (ch$371 === ']') {
                    classMarker$376 = false;
                }
            } else {
                if (ch$371 === '\\') {
                    ch$371 = nextChar$220();
                    // ECMA-262 7.8.5
                    if (isLineTerminator$213(ch$371)) {
                        throwError$234({}, Messages$194.UnterminatedRegExp);
                    }
                    str$370 += ch$371;
                } else if (ch$371 === '/') {
                    break;
                } else if (ch$371 === '[') {
                    classMarker$376 = true;
                } else if (isLineTerminator$213(ch$371)) {
                    throwError$234({}, Messages$194.UnterminatedRegExp);
                }
            }
        }
        if (str$370.length === 1) {
            throwError$234({}, Messages$194.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$373 = str$370.substr(1, str$370.length - 2);
        flags$374 = '';
        while (index$198 < length$201) {
            ch$371 = source$196[index$198];
            if (!isIdentifierPart$215(ch$371)) {
                break;
            }
            ++index$198;
            if (ch$371 === '\\' && index$198 < length$201) {
                ch$371 = source$196[index$198];
                if (ch$371 === 'u') {
                    ++index$198;
                    restore$377 = index$198;
                    ch$371 = scanHexEscape$223('u');
                    if (ch$371) {
                        flags$374 += ch$371;
                        str$370 += '\\u';
                        for (; restore$377 < index$198; ++restore$377) {
                            str$370 += source$196[restore$377];
                        }
                    } else {
                        index$198 = restore$377;
                        flags$374 += 'u';
                        str$370 += '\\u';
                    }
                } else {
                    str$370 += '\\';
                }
            } else {
                flags$374 += ch$371;
                str$370 += ch$371;
            }
        }
        try {
            value$375 = new RegExp(pattern$373, flags$374);
        } catch (e$378) {
            throwError$234({}, Messages$194.InvalidRegExp);
        }
        return {
            type: Token$190.RegexLiteral,
            literal: str$370,
            value: value$375,
            lineNumber: lineNumber$199,
            lineStart: lineStart$200,
            range: [
                start$372,
                index$198
            ]
        };
    }
    function isIdentifierName$229(token$379) {
        return token$379.type === Token$190.Identifier || token$379.type === Token$190.Keyword || token$379.type === Token$190.BooleanLiteral || token$379.type === Token$190.NullLiteral;
    }
    // only used by the reader
    function advance$230() {
        var ch$380, token$381;
        skipComment$222();
        if (index$198 >= length$201) {
            return {
                type: Token$190.EOF,
                lineNumber: lineNumber$199,
                lineStart: lineStart$200,
                range: [
                    index$198,
                    index$198
                ]
            };
        }
        ch$380 = source$196[index$198];
        token$381 = scanPunctuator$225();
        if (typeof token$381 !== 'undefined') {
            return token$381;
        }
        if (ch$380 === '\'' || ch$380 === '"') {
            return scanStringLiteral$227();
        }
        if (ch$380 === '.' || isDecimalDigit$209(ch$380)) {
            return scanNumericLiteral$226();
        }
        token$381 = scanIdentifier$224();
        if (typeof token$381 !== 'undefined') {
            return token$381;
        }
        throwError$234({}, Messages$194.UnexpectedToken, 'ILLEGAL');
    }
    function lex$231() {
        var token$382;
        if (buffer$202) {
            token$382 = buffer$202;
            buffer$202 = null;
            index$198++;
            return token$382;
        }
        buffer$202 = null;
        return tokenStream$204[index$198++];
    }
    function lookahead$232() {
        var pos$383, line$384, start$385;
        if (buffer$202 !== null) {
            return buffer$202;
        }
        buffer$202 = tokenStream$204[index$198];
        return buffer$202;
    }
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$233() {
        var pos$386, line$387, start$388, found$389;
        found$389 = tokenStream$204[index$198 - 1].token.lineNumber !== tokenStream$204[index$198].token.lineNumber;
        return found$389;
    }
    // Throw an exception
    function throwError$234(token$390, messageFormat$391) {
        var error$392, args$393 = Array.prototype.slice.call(arguments, 2), msg$394 = messageFormat$391.replace(/%(\d)/g, function (whole$395, index$396) {
                return args$393[index$396] || '';
            });
        if (typeof token$390.lineNumber === 'number') {
            error$392 = new Error('Line ' + token$390.lineNumber + ': ' + msg$394);
            error$392.lineNumber = token$390.lineNumber;
            if (token$390.range && token$390.range.length > 0) {
                error$392.index = token$390.range[0];
                error$392.column = token$390.range[0] - lineStart$200 + 1;
            }
        } else {
            error$392 = new Error('Line ' + lineNumber$199 + ': ' + msg$394);
            error$392.index = index$198;
            error$392.lineNumber = lineNumber$199;
            error$392.column = index$198 - lineStart$200 + 1;
        }
        throw error$392;
    }
    function throwErrorTolerant$235() {
        var error$397;
        try {
            throwError$234.apply(null, arguments);
        } catch (e$398) {
            if (extra$205.errors) {
                extra$205.errors.push(e$398);
            } else {
                throw e$398;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$236(token$399) {
        var s$400;
        if (token$399.type === Token$190.EOF) {
            throwError$234(token$399, Messages$194.UnexpectedEOS);
        }
        if (token$399.type === Token$190.NumericLiteral) {
            throwError$234(token$399, Messages$194.UnexpectedNumber);
        }
        if (token$399.type === Token$190.StringLiteral) {
            throwError$234(token$399, Messages$194.UnexpectedString);
        }
        if (token$399.type === Token$190.Identifier) {
            console.log(token$399);
            throwError$234(token$399, Messages$194.UnexpectedIdentifier);
        }
        if (token$399.type === Token$190.Keyword) {
            if (isFutureReservedWord$216(token$399.value)) {
                throwError$234(token$399, Messages$194.UnexpectedReserved);
            } else if (strict$197 && isStrictModeReservedWord$217(token$399.value)) {
                throwError$234(token$399, Messages$194.StrictReservedWord);
            }
            throwError$234(token$399, Messages$194.UnexpectedToken, token$399.value);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$234(token$399, Messages$194.UnexpectedToken, token$399.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$237(value$401) {
        var token$402 = lex$231().token;
        if (token$402.type !== Token$190.Punctuator || token$402.value !== value$401) {
            throwUnexpected$236(token$402);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$238(keyword$403) {
        var token$404 = lex$231().token;
        if (token$404.type !== Token$190.Keyword || token$404.value !== keyword$403) {
            throwUnexpected$236(token$404);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$239(value$405) {
        var token$406 = lookahead$232().token;
        return token$406.type === Token$190.Punctuator && token$406.value === value$405;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$240(keyword$407) {
        var token$408 = lookahead$232().token;
        return token$408.type === Token$190.Keyword && token$408.value === keyword$407;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$241() {
        var token$409 = lookahead$232().token, op$410 = token$409.value;
        if (token$409.type !== Token$190.Punctuator) {
            return false;
        }
        return op$410 === '=' || op$410 === '*=' || op$410 === '/=' || op$410 === '%=' || op$410 === '+=' || op$410 === '-=' || op$410 === '<<=' || op$410 === '>>=' || op$410 === '>>>=' || op$410 === '&=' || op$410 === '^=' || op$410 === '|=';
    }
    function consumeSemicolon$242() {
        var token$411, line$412;
        if (tokenStream$204[index$198].token.value === ';') {
            lex$231().token;
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
        line$412 = tokenStream$204[index$198 - 1].token.lineNumber;
        token$411 = tokenStream$204[index$198].token;
        if (line$412 !== token$411.lineNumber) {
            return;
        }
        if (token$411.type !== Token$190.EOF && !match$239('}')) {
            throwUnexpected$236(token$411);
        }
        return;
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$243(expr$413) {
        return expr$413.type === Syntax$192.Identifier || expr$413.type === Syntax$192.MemberExpression;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$244() {
        var elements$414 = [], undef$415;
        expect$237('[');
        while (!match$239(']')) {
            if (match$239(',')) {
                lex$231().token;
                elements$414.push(undef$415);
            } else {
                elements$414.push(parseAssignmentExpression$273());
                if (!match$239(']')) {
                    expect$237(',');
                }
            }
        }
        expect$237(']');
        return {
            type: Syntax$192.ArrayExpression,
            elements: elements$414
        };
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$245(param$416, first$417) {
        var previousStrict$418, body$419;
        previousStrict$418 = strict$197;
        body$419 = parseFunctionSourceElements$300();
        if (first$417 && strict$197 && isRestrictedWord$218(param$416[0].name)) {
            throwError$234(first$417, Messages$194.StrictParamName);
        }
        strict$197 = previousStrict$418;
        return {
            type: Syntax$192.FunctionExpression,
            id: null,
            params: param$416,
            body: body$419
        };
    }
    function parseObjectPropertyKey$246() {
        var token$420 = lex$231().token;
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$420.type === Token$190.StringLiteral || token$420.type === Token$190.NumericLiteral) {
            if (strict$197 && token$420.octal) {
                throwError$234(token$420, Messages$194.StrictOctalLiteral);
            }
            return createLiteral$310(token$420);
        }
        return {
            type: Syntax$192.Identifier,
            name: token$420.value
        };
    }
    function parseObjectProperty$247() {
        var token$421, key$422, id$423, param$424;
        token$421 = lookahead$232().token;
        if (token$421.type === Token$190.Identifier) {
            id$423 = parseObjectPropertyKey$246();
            // Property Assignment: Getter and Setter.
            if (token$421.value === 'get' && !match$239(':')) {
                key$422 = parseObjectPropertyKey$246();
                expect$237('(');
                expect$237(')');
                return {
                    type: Syntax$192.Property,
                    key: key$422,
                    value: parsePropertyFunction$245([]),
                    kind: 'get'
                };
            } else if (token$421.value === 'set' && !match$239(':')) {
                key$422 = parseObjectPropertyKey$246();
                expect$237('(');
                token$421 = lookahead$232().token;
                if (token$421.type !== Token$190.Identifier) {
                    throwUnexpected$236(lex$231().token);
                }
                param$424 = [parseVariableIdentifier$277()];
                expect$237(')');
                return {
                    type: Syntax$192.Property,
                    key: key$422,
                    value: parsePropertyFunction$245(param$424, token$421),
                    kind: 'set'
                };
            } else {
                expect$237(':');
                return {
                    type: Syntax$192.Property,
                    key: id$423,
                    value: parseAssignmentExpression$273(),
                    kind: 'init'
                };
            }
        } else if (token$421.type === Token$190.EOF || token$421.type === Token$190.Punctuator) {
            throwUnexpected$236(token$421);
        } else {
            key$422 = parseObjectPropertyKey$246();
            expect$237(':');
            return {
                type: Syntax$192.Property,
                key: key$422,
                value: parseAssignmentExpression$273(),
                kind: 'init'
            };
        }
    }
    function parseObjectInitialiser$248() {
        var token$425, properties$426 = [], property$427, name$428, kind$429, map$430 = {}, toString$431 = String;
        expect$237('{');
        while (!match$239('}')) {
            property$427 = parseObjectProperty$247();
            if (property$427.key.type === Syntax$192.Identifier) {
                name$428 = property$427.key.name;
            } else {
                name$428 = toString$431(property$427.key.value);
            }
            kind$429 = property$427.kind === 'init' ? PropertyKind$193.Data : property$427.kind === 'get' ? PropertyKind$193.Get : PropertyKind$193.Set;
            if (Object.prototype.hasOwnProperty.call(map$430, name$428)) {
                if (map$430[name$428] === PropertyKind$193.Data) {
                    if (strict$197 && kind$429 === PropertyKind$193.Data) {
                        throwErrorTolerant$235({}, Messages$194.StrictDuplicateProperty);
                    } else if (kind$429 !== PropertyKind$193.Data) {
                        throwError$234({}, Messages$194.AccessorDataProperty);
                    }
                } else {
                    if (kind$429 === PropertyKind$193.Data) {
                        throwError$234({}, Messages$194.AccessorDataProperty);
                    } else if (map$430[name$428] & kind$429) {
                        throwError$234({}, Messages$194.AccessorGetSet);
                    }
                }
                map$430[name$428] |= kind$429;
            } else {
                map$430[name$428] = kind$429;
            }
            properties$426.push(property$427);
            if (!match$239('}')) {
                expect$237(',');
            }
        }
        expect$237('}');
        return {
            type: Syntax$192.ObjectExpression,
            properties: properties$426
        };
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$249() {
        var expr$432, token$433 = lookahead$232().token, type$434 = token$433.type;
        if (type$434 === Token$190.Identifier) {
            var name$435 = expander$189.resolve(lex$231());
            return {
                type: Syntax$192.Identifier,
                name: name$435
            };
        }
        if (type$434 === Token$190.StringLiteral || type$434 === Token$190.NumericLiteral) {
            if (strict$197 && token$433.octal) {
                throwErrorTolerant$235(token$433, Messages$194.StrictOctalLiteral);
            }
            return createLiteral$310(lex$231().token);
        }
        if (type$434 === Token$190.Keyword) {
            if (matchKeyword$240('this')) {
                lex$231().token;
                return { type: Syntax$192.ThisExpression };
            }
            if (matchKeyword$240('function')) {
                return parseFunctionExpression$302();
            }
        }
        if (type$434 === Token$190.BooleanLiteral) {
            lex$231();
            token$433.value = token$433.value === 'true';
            return createLiteral$310(token$433);
        }
        if (type$434 === Token$190.NullLiteral) {
            lex$231();
            token$433.value = null;
            return createLiteral$310(token$433);
        }
        if (match$239('[')) {
            return parseArrayInitialiser$244();
        }
        if (match$239('{')) {
            return parseObjectInitialiser$248();
        }
        if (match$239('(')) {
            lex$231();
            state$203.lastParenthesized = expr$432 = parseExpression$274();
            expect$237(')');
            return expr$432;
        }
        if (token$433.value instanceof RegExp) {
            return createLiteral$310(lex$231().token);
        }
        return throwUnexpected$236(lex$231().token);
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$250() {
        var args$436 = [];
        expect$237('(');
        if (!match$239(')')) {
            while (index$198 < length$201) {
                args$436.push(parseAssignmentExpression$273());
                if (match$239(')')) {
                    break;
                }
                expect$237(',');
            }
        }
        expect$237(')');
        return args$436;
    }
    function parseNonComputedProperty$251() {
        var token$437 = lex$231().token;
        if (!isIdentifierName$229(token$437)) {
            throwUnexpected$236(token$437);
        }
        return {
            type: Syntax$192.Identifier,
            name: token$437.value
        };
    }
    function parseNonComputedMember$252(object$438) {
        return {
            type: Syntax$192.MemberExpression,
            computed: false,
            object: object$438,
            property: parseNonComputedProperty$251()
        };
    }
    function parseComputedMember$253(object$439) {
        var property$440, expr$441;
        expect$237('[');
        property$440 = parseExpression$274();
        expr$441 = {
            type: Syntax$192.MemberExpression,
            computed: true,
            object: object$439,
            property: property$440
        };
        expect$237(']');
        return expr$441;
    }
    function parseCallMember$254(object$442) {
        return {
            type: Syntax$192.CallExpression,
            callee: object$442,
            'arguments': parseArguments$250()
        };
    }
    function parseNewExpression$255() {
        var expr$443;
        expectKeyword$238('new');
        expr$443 = {
            type: Syntax$192.NewExpression,
            callee: parseLeftHandSideExpression$259(),
            'arguments': []
        };
        if (match$239('(')) {
            expr$443['arguments'] = parseArguments$250();
        }
        return expr$443;
    }
    // sort of broken, only accepts literals
    // pretty sure the use of toString will bite me
    function toArrayNode$256(arr$444) {
        var els$445 = arr$444.map(function (el$446) {
                return {
                    type: 'Literal',
                    value: el$446,
                    raw: el$446.toString()
                };
            });
        return {
            type: 'ArrayExpression',
            elements: els$445
        };
    }
    function toObjectNode$257(obj$447) {
        // todo: hacky, fixup
        var props$448 = Object.keys(obj$447).map(function (key$449) {
                var raw$450 = obj$447[key$449];
                var value$451;
                if (Array.isArray(raw$450)) {
                    value$451 = toArrayNode$256(raw$450);
                } else {
                    value$451 = {
                        type: 'Literal',
                        value: obj$447[key$449],
                        raw: obj$447[key$449].toString()
                    };
                }
                return {
                    type: 'Property',
                    key: {
                        type: 'Identifier',
                        name: key$449
                    },
                    value: value$451,
                    kind: 'init'
                };
            });
        return {
            type: 'ObjectExpression',
            properties: props$448
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
    function parseLeftHandSideExpressionAllowCall$258() {
        var useNew$452, expr$453;
        useNew$452 = matchKeyword$240('new');
        expr$453 = useNew$452 ? parseNewExpression$255() : parsePrimaryExpression$249();
        // handle "syntax" primitive
        // todo: error handling
        // if(expr.name === "syntax") {
        //     return parseSyntaxObject();
        // }
        while (index$198 < length$201) {
            if (match$239('.')) {
                lex$231();
                expr$453 = parseNonComputedMember$252(expr$453);
            } else if (match$239('[')) {
                expr$453 = parseComputedMember$253(expr$453);
            } else if (match$239('(')) {
                expr$453 = parseCallMember$254(expr$453);
            } else {
                break;
            }
        }
        return expr$453;
    }
    function parseLeftHandSideExpression$259() {
        var useNew$454, expr$455;
        useNew$454 = matchKeyword$240('new');
        expr$455 = useNew$454 ? parseNewExpression$255() : parsePrimaryExpression$249();
        while (index$198 < length$201) {
            if (match$239('.')) {
                lex$231();
                expr$455 = parseNonComputedMember$252(expr$455);
            } else if (match$239('[')) {
                expr$455 = parseComputedMember$253(expr$455);
            } else {
                break;
            }
        }
        return expr$455;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$260() {
        var expr$456 = parseLeftHandSideExpressionAllowCall$258();
        if ((match$239('++') || match$239('--')) && !peekLineTerminator$233()) {
            // 11.3.1, 11.3.2
            if (strict$197 && expr$456.type === Syntax$192.Identifier && isRestrictedWord$218(expr$456.name)) {
                throwError$234({}, Messages$194.StrictLHSPostfix);
            }
            if (!isLeftHandSide$243(expr$456)) {
                throwError$234({}, Messages$194.InvalidLHSInAssignment);
            }
            expr$456 = {
                type: Syntax$192.UpdateExpression,
                operator: lex$231().token.value,
                argument: expr$456,
                prefix: false
            };
        }
        return expr$456;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$261() {
        var token$457, expr$458;
        if (match$239('++') || match$239('--')) {
            token$457 = lex$231().token;
            expr$458 = parseUnaryExpression$261();
            // 11.4.4, 11.4.5
            if (strict$197 && expr$458.type === Syntax$192.Identifier && isRestrictedWord$218(expr$458.name)) {
                throwError$234({}, Messages$194.StrictLHSPrefix);
            }
            if (!isLeftHandSide$243(expr$458)) {
                throwError$234({}, Messages$194.InvalidLHSInAssignment);
            }
            expr$458 = {
                type: Syntax$192.UpdateExpression,
                operator: token$457.value,
                argument: expr$458,
                prefix: true
            };
            return expr$458;
        }
        if (match$239('+') || match$239('-') || match$239('~') || match$239('!')) {
            expr$458 = {
                type: Syntax$192.UnaryExpression,
                operator: lex$231().token.value,
                argument: parseUnaryExpression$261()
            };
            return expr$458;
        }
        if (matchKeyword$240('delete') || matchKeyword$240('void') || matchKeyword$240('typeof')) {
            expr$458 = {
                type: Syntax$192.UnaryExpression,
                operator: lex$231().token.value,
                argument: parseUnaryExpression$261()
            };
            if (strict$197 && expr$458.operator === 'delete' && expr$458.argument.type === Syntax$192.Identifier) {
                throwErrorTolerant$235({}, Messages$194.StrictDelete);
            }
            return expr$458;
        }
        return parsePostfixExpression$260();
    }
    // 11.5 Multiplicative Operators
    function parseMultiplicativeExpression$262() {
        var expr$459 = parseUnaryExpression$261();
        while (match$239('*') || match$239('/') || match$239('%')) {
            expr$459 = {
                type: Syntax$192.BinaryExpression,
                operator: lex$231().token.value,
                left: expr$459,
                right: parseUnaryExpression$261()
            };
        }
        return expr$459;
    }
    // 11.6 Additive Operators
    function parseAdditiveExpression$263() {
        var expr$460 = parseMultiplicativeExpression$262();
        while (match$239('+') || match$239('-')) {
            expr$460 = {
                type: Syntax$192.BinaryExpression,
                operator: lex$231().token.value,
                left: expr$460,
                right: parseMultiplicativeExpression$262()
            };
        }
        return expr$460;
    }
    // 11.7 Bitwise Shift Operators
    function parseShiftExpression$264() {
        var expr$461 = parseAdditiveExpression$263();
        while (match$239('<<') || match$239('>>') || match$239('>>>')) {
            expr$461 = {
                type: Syntax$192.BinaryExpression,
                operator: lex$231().token.value,
                left: expr$461,
                right: parseAdditiveExpression$263()
            };
        }
        return expr$461;
    }
    // 11.8 Relational Operators
    function parseRelationalExpression$265() {
        var expr$462, previousAllowIn$463;
        previousAllowIn$463 = state$203.allowIn;
        state$203.allowIn = true;
        expr$462 = parseShiftExpression$264();
        while (match$239('<') || match$239('>') || match$239('<=') || match$239('>=') || previousAllowIn$463 && matchKeyword$240('in') || matchKeyword$240('instanceof')) {
            expr$462 = {
                type: Syntax$192.BinaryExpression,
                operator: lex$231().token.value,
                left: expr$462,
                right: parseRelationalExpression$265()
            };
        }
        state$203.allowIn = previousAllowIn$463;
        return expr$462;
    }
    // 11.9 Equality Operators
    function parseEqualityExpression$266() {
        var expr$464 = parseRelationalExpression$265();
        while (match$239('==') || match$239('!=') || match$239('===') || match$239('!==')) {
            expr$464 = {
                type: Syntax$192.BinaryExpression,
                operator: lex$231().token.value,
                left: expr$464,
                right: parseRelationalExpression$265()
            };
        }
        return expr$464;
    }
    // 11.10 Binary Bitwise Operators
    function parseBitwiseANDExpression$267() {
        var expr$465 = parseEqualityExpression$266();
        while (match$239('&')) {
            lex$231();
            expr$465 = {
                type: Syntax$192.BinaryExpression,
                operator: '&',
                left: expr$465,
                right: parseEqualityExpression$266()
            };
        }
        return expr$465;
    }
    function parseBitwiseXORExpression$268() {
        var expr$466 = parseBitwiseANDExpression$267();
        while (match$239('^')) {
            lex$231();
            expr$466 = {
                type: Syntax$192.BinaryExpression,
                operator: '^',
                left: expr$466,
                right: parseBitwiseANDExpression$267()
            };
        }
        return expr$466;
    }
    function parseBitwiseORExpression$269() {
        var expr$467 = parseBitwiseXORExpression$268();
        while (match$239('|')) {
            lex$231();
            expr$467 = {
                type: Syntax$192.BinaryExpression,
                operator: '|',
                left: expr$467,
                right: parseBitwiseXORExpression$268()
            };
        }
        return expr$467;
    }
    // 11.11 Binary Logical Operators
    function parseLogicalANDExpression$270() {
        var expr$468 = parseBitwiseORExpression$269();
        while (match$239('&&')) {
            lex$231();
            expr$468 = {
                type: Syntax$192.LogicalExpression,
                operator: '&&',
                left: expr$468,
                right: parseBitwiseORExpression$269()
            };
        }
        return expr$468;
    }
    function parseLogicalORExpression$271() {
        var expr$469 = parseLogicalANDExpression$270();
        while (match$239('||')) {
            lex$231();
            expr$469 = {
                type: Syntax$192.LogicalExpression,
                operator: '||',
                left: expr$469,
                right: parseLogicalANDExpression$270()
            };
        }
        return expr$469;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$272() {
        var expr$470, previousAllowIn$471, consequent$472;
        expr$470 = parseLogicalORExpression$271();
        if (match$239('?')) {
            lex$231();
            previousAllowIn$471 = state$203.allowIn;
            state$203.allowIn = true;
            consequent$472 = parseAssignmentExpression$273();
            state$203.allowIn = previousAllowIn$471;
            expect$237(':');
            expr$470 = {
                type: Syntax$192.ConditionalExpression,
                test: expr$470,
                consequent: consequent$472,
                alternate: parseAssignmentExpression$273()
            };
        }
        return expr$470;
    }
    // 11.13 Assignment Operators
    function parseAssignmentExpression$273() {
        var expr$473;
        expr$473 = parseConditionalExpression$272();
        if (matchAssign$241()) {
            // LeftHandSideExpression
            if (!isLeftHandSide$243(expr$473)) {
                throwError$234({}, Messages$194.InvalidLHSInAssignment);
            }
            // 11.13.1
            if (strict$197 && expr$473.type === Syntax$192.Identifier && isRestrictedWord$218(expr$473.name)) {
                throwError$234({}, Messages$194.StrictLHSAssignment);
            }
            expr$473 = {
                type: Syntax$192.AssignmentExpression,
                operator: lex$231().token.value,
                left: expr$473,
                right: parseAssignmentExpression$273()
            };
        }
        return expr$473;
    }
    // 11.14 Comma Operator
    function parseExpression$274() {
        var expr$474 = parseAssignmentExpression$273();
        if (match$239(',')) {
            expr$474 = {
                type: Syntax$192.SequenceExpression,
                expressions: [expr$474]
            };
            while (index$198 < length$201) {
                if (!match$239(',')) {
                    break;
                }
                lex$231();
                expr$474.expressions.push(parseAssignmentExpression$273());
            }
        }
        return expr$474;
    }
    // 12.1 Block
    function parseStatementList$275() {
        var list$475 = [], statement$476;
        while (index$198 < length$201) {
            if (match$239('}')) {
                break;
            }
            statement$476 = parseSourceElement$303();
            if (typeof statement$476 === 'undefined') {
                break;
            }
            list$475.push(statement$476);
        }
        return list$475;
    }
    function parseBlock$276() {
        var block$477;
        expect$237('{');
        block$477 = parseStatementList$275();
        expect$237('}');
        return {
            type: Syntax$192.BlockStatement,
            body: block$477
        };
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$277() {
        var stx$478 = lex$231(), token$479 = stx$478.token;
        if (token$479.type !== Token$190.Identifier) {
            throwUnexpected$236(token$479);
        }
        var name$480 = expander$189.resolve(stx$478);
        return {
            type: Syntax$192.Identifier,
            name: name$480
        };
    }
    function parseVariableDeclaration$278(kind$481) {
        var id$482 = parseVariableIdentifier$277(), init$483 = null;
        // 12.2.1
        if (strict$197 && isRestrictedWord$218(id$482.name)) {
            throwErrorTolerant$235({}, Messages$194.StrictVarName);
        }
        if (kind$481 === 'const') {
            expect$237('=');
            init$483 = parseAssignmentExpression$273();
        } else if (match$239('=')) {
            lex$231();
            init$483 = parseAssignmentExpression$273();
        }
        return {
            type: Syntax$192.VariableDeclarator,
            id: id$482,
            init: init$483
        };
    }
    function parseVariableDeclarationList$279(kind$484) {
        var list$485 = [];
        while (index$198 < length$201) {
            list$485.push(parseVariableDeclaration$278(kind$484));
            if (!match$239(',')) {
                break;
            }
            lex$231();
        }
        return list$485;
    }
    function parseVariableStatement$280() {
        var declarations$486;
        expectKeyword$238('var');
        declarations$486 = parseVariableDeclarationList$279();
        consumeSemicolon$242();
        return {
            type: Syntax$192.VariableDeclaration,
            declarations: declarations$486,
            kind: 'var'
        };
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$281(kind$487) {
        var declarations$488;
        expectKeyword$238(kind$487);
        declarations$488 = parseVariableDeclarationList$279(kind$487);
        consumeSemicolon$242();
        return {
            type: Syntax$192.VariableDeclaration,
            declarations: declarations$488,
            kind: kind$487
        };
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$282() {
        expect$237(';');
        return { type: Syntax$192.EmptyStatement };
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$283() {
        var expr$489 = parseExpression$274();
        consumeSemicolon$242();
        return {
            type: Syntax$192.ExpressionStatement,
            expression: expr$489
        };
    }
    // 12.5 If statement
    function parseIfStatement$284() {
        var test$490, consequent$491, alternate$492;
        expectKeyword$238('if');
        expect$237('(');
        test$490 = parseExpression$274();
        expect$237(')');
        consequent$491 = parseStatement$299();
        if (matchKeyword$240('else')) {
            lex$231();
            alternate$492 = parseStatement$299();
        } else {
            alternate$492 = null;
        }
        return {
            type: Syntax$192.IfStatement,
            test: test$490,
            consequent: consequent$491,
            alternate: alternate$492
        };
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$285() {
        var body$493, test$494, oldInIteration$495;
        expectKeyword$238('do');
        oldInIteration$495 = state$203.inIteration;
        state$203.inIteration = true;
        body$493 = parseStatement$299();
        state$203.inIteration = oldInIteration$495;
        expectKeyword$238('while');
        expect$237('(');
        test$494 = parseExpression$274();
        expect$237(')');
        if (match$239(';')) {
            lex$231();
        }
        return {
            type: Syntax$192.DoWhileStatement,
            body: body$493,
            test: test$494
        };
    }
    function parseWhileStatement$286() {
        var test$496, body$497, oldInIteration$498;
        expectKeyword$238('while');
        expect$237('(');
        test$496 = parseExpression$274();
        expect$237(')');
        oldInIteration$498 = state$203.inIteration;
        state$203.inIteration = true;
        body$497 = parseStatement$299();
        state$203.inIteration = oldInIteration$498;
        return {
            type: Syntax$192.WhileStatement,
            test: test$496,
            body: body$497
        };
    }
    function parseForVariableDeclaration$287() {
        var token$499 = lex$231().token;
        return {
            type: Syntax$192.VariableDeclaration,
            declarations: parseVariableDeclarationList$279(),
            kind: token$499.value
        };
    }
    function parseForStatement$288() {
        var init$500, test$501, update$502, left$503, right$504, body$505, oldInIteration$506;
        init$500 = test$501 = update$502 = null;
        expectKeyword$238('for');
        expect$237('(');
        if (match$239(';')) {
            lex$231();
        } else {
            if (matchKeyword$240('var') || matchKeyword$240('let')) {
                state$203.allowIn = false;
                init$500 = parseForVariableDeclaration$287();
                state$203.allowIn = true;
                if (init$500.declarations.length === 1 && matchKeyword$240('in')) {
                    lex$231();
                    left$503 = init$500;
                    right$504 = parseExpression$274();
                    init$500 = null;
                }
            } else {
                state$203.allowIn = false;
                init$500 = parseExpression$274();
                state$203.allowIn = true;
                if (matchKeyword$240('in')) {
                    // LeftHandSideExpression
                    if (!isLeftHandSide$243(init$500)) {
                        throwError$234({}, Messages$194.InvalidLHSInForIn);
                    }
                    lex$231();
                    left$503 = init$500;
                    right$504 = parseExpression$274();
                    init$500 = null;
                }
            }
            if (typeof left$503 === 'undefined') {
                expect$237(';');
            }
        }
        if (typeof left$503 === 'undefined') {
            if (!match$239(';')) {
                test$501 = parseExpression$274();
            }
            expect$237(';');
            if (!match$239(')')) {
                update$502 = parseExpression$274();
            }
        }
        expect$237(')');
        oldInIteration$506 = state$203.inIteration;
        state$203.inIteration = true;
        body$505 = parseStatement$299();
        state$203.inIteration = oldInIteration$506;
        if (typeof left$503 === 'undefined') {
            return {
                type: Syntax$192.ForStatement,
                init: init$500,
                test: test$501,
                update: update$502,
                body: body$505
            };
        }
        return {
            type: Syntax$192.ForInStatement,
            left: left$503,
            right: right$504,
            body: body$505,
            each: false
        };
    }
    // 12.7 The continue statement
    function parseContinueStatement$289() {
        var token$507, label$508 = null;
        expectKeyword$238('continue');
        // Optimize the most common form: 'continue;'.
        if (tokenStream$204[index$198].token.value === ';') {
            lex$231();
            if (!state$203.inIteration) {
                throwError$234({}, Messages$194.IllegalContinue);
            }
            return {
                type: Syntax$192.ContinueStatement,
                label: null
            };
        }
        if (peekLineTerminator$233()) {
            if (!state$203.inIteration) {
                throwError$234({}, Messages$194.IllegalContinue);
            }
            return {
                type: Syntax$192.ContinueStatement,
                label: null
            };
        }
        token$507 = lookahead$232().token;
        if (token$507.type === Token$190.Identifier) {
            label$508 = parseVariableIdentifier$277();
            if (!Object.prototype.hasOwnProperty.call(state$203.labelSet, label$508.name)) {
                throwError$234({}, Messages$194.UnknownLabel, label$508.name);
            }
        }
        consumeSemicolon$242();
        if (label$508 === null && !state$203.inIteration) {
            throwError$234({}, Messages$194.IllegalContinue);
        }
        return {
            type: Syntax$192.ContinueStatement,
            label: label$508
        };
    }
    // 12.8 The break statement
    function parseBreakStatement$290() {
        var token$509, label$510 = null;
        expectKeyword$238('break');
        if (peekLineTerminator$233()) {
            if (!(state$203.inIteration || state$203.inSwitch)) {
                throwError$234({}, Messages$194.IllegalBreak);
            }
            return {
                type: Syntax$192.BreakStatement,
                label: null
            };
        }
        token$509 = lookahead$232().token;
        if (token$509.type === Token$190.Identifier) {
            label$510 = parseVariableIdentifier$277();
            if (!Object.prototype.hasOwnProperty.call(state$203.labelSet, label$510.name)) {
                throwError$234({}, Messages$194.UnknownLabel, label$510.name);
            }
        }
        consumeSemicolon$242();
        if (label$510 === null && !(state$203.inIteration || state$203.inSwitch)) {
            throwError$234({}, Messages$194.IllegalBreak);
        }
        return {
            type: Syntax$192.BreakStatement,
            label: label$510
        };
    }
    // 12.9 The return statement
    function parseReturnStatement$291() {
        var token$511, argument$512 = null;
        expectKeyword$238('return');
        if (!state$203.inFunctionBody) {
            throwErrorTolerant$235({}, Messages$194.IllegalReturn);
        }
        if (peekLineTerminator$233()) {
            return {
                type: Syntax$192.ReturnStatement,
                argument: null
            };
        }
        if (!match$239(';')) {
            token$511 = lookahead$232().token;
            if (!match$239('}') && token$511.type !== Token$190.EOF) {
                argument$512 = parseExpression$274();
            }
        }
        consumeSemicolon$242();
        return {
            type: Syntax$192.ReturnStatement,
            argument: argument$512
        };
    }
    // 12.10 The with statement
    function parseWithStatement$292() {
        var object$513, body$514;
        if (strict$197) {
            throwErrorTolerant$235({}, Messages$194.StrictModeWith);
        }
        expectKeyword$238('with');
        expect$237('(');
        object$513 = parseExpression$274();
        expect$237(')');
        body$514 = parseStatement$299();
        return {
            type: Syntax$192.WithStatement,
            object: object$513,
            body: body$514
        };
    }
    // 12.10 The swith statement
    function parseSwitchCase$293() {
        var test$515, consequent$516 = [], statement$517;
        if (matchKeyword$240('default')) {
            lex$231();
            test$515 = null;
        } else {
            expectKeyword$238('case');
            test$515 = parseExpression$274();
        }
        expect$237(':');
        while (index$198 < length$201) {
            if (match$239('}') || matchKeyword$240('default') || matchKeyword$240('case')) {
                break;
            }
            statement$517 = parseStatement$299();
            if (typeof statement$517 === 'undefined') {
                break;
            }
            consequent$516.push(statement$517);
        }
        return {
            type: Syntax$192.SwitchCase,
            test: test$515,
            consequent: consequent$516
        };
    }
    function parseSwitchStatement$294() {
        var discriminant$518, cases$519, oldInSwitch$520;
        expectKeyword$238('switch');
        expect$237('(');
        discriminant$518 = parseExpression$274();
        expect$237(')');
        expect$237('{');
        if (match$239('}')) {
            lex$231();
            return {
                type: Syntax$192.SwitchStatement,
                discriminant: discriminant$518
            };
        }
        cases$519 = [];
        oldInSwitch$520 = state$203.inSwitch;
        state$203.inSwitch = true;
        while (index$198 < length$201) {
            if (match$239('}')) {
                break;
            }
            cases$519.push(parseSwitchCase$293());
        }
        state$203.inSwitch = oldInSwitch$520;
        expect$237('}');
        return {
            type: Syntax$192.SwitchStatement,
            discriminant: discriminant$518,
            cases: cases$519
        };
    }
    // 12.13 The throw statement
    function parseThrowStatement$295() {
        var argument$521;
        expectKeyword$238('throw');
        if (peekLineTerminator$233()) {
            throwError$234({}, Messages$194.NewlineAfterThrow);
        }
        argument$521 = parseExpression$274();
        consumeSemicolon$242();
        return {
            type: Syntax$192.ThrowStatement,
            argument: argument$521
        };
    }
    // 12.14 The try statement
    function parseCatchClause$296() {
        var param$522;
        expectKeyword$238('catch');
        expect$237('(');
        if (!match$239(')')) {
            param$522 = parseExpression$274();
            // 12.14.1
            if (strict$197 && param$522.type === Syntax$192.Identifier && isRestrictedWord$218(param$522.name)) {
                throwErrorTolerant$235({}, Messages$194.StrictCatchVariable);
            }
        }
        expect$237(')');
        return {
            type: Syntax$192.CatchClause,
            param: param$522,
            guard: null,
            body: parseBlock$276()
        };
    }
    function parseTryStatement$297() {
        var block$523, handlers$524 = [], finalizer$525 = null;
        expectKeyword$238('try');
        block$523 = parseBlock$276();
        if (matchKeyword$240('catch')) {
            handlers$524.push(parseCatchClause$296());
        }
        if (matchKeyword$240('finally')) {
            lex$231();
            finalizer$525 = parseBlock$276();
        }
        if (handlers$524.length === 0 && !finalizer$525) {
            throwError$234({}, Messages$194.NoCatchOrFinally);
        }
        return {
            type: Syntax$192.TryStatement,
            block: block$523,
            handlers: handlers$524,
            finalizer: finalizer$525
        };
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$298() {
        expectKeyword$238('debugger');
        consumeSemicolon$242();
        return { type: Syntax$192.DebuggerStatement };
    }
    // 12 Statements
    function parseStatement$299() {
        var token$526 = lookahead$232().token, expr$527, labeledBody$528;
        if (token$526.type === Token$190.EOF) {
            throwUnexpected$236(token$526);
        }
        if (token$526.type === Token$190.Punctuator) {
            switch (token$526.value) {
            case ';':
                return parseEmptyStatement$282();
            case '{':
                return parseBlock$276();
            case '(':
                return parseExpressionStatement$283();
            default:
                break;
            }
        }
        if (token$526.type === Token$190.Keyword) {
            switch (token$526.value) {
            case 'break':
                return parseBreakStatement$290();
            case 'continue':
                return parseContinueStatement$289();
            case 'debugger':
                return parseDebuggerStatement$298();
            case 'do':
                return parseDoWhileStatement$285();
            case 'for':
                return parseForStatement$288();
            case 'function':
                return parseFunctionDeclaration$301();
            case 'if':
                return parseIfStatement$284();
            case 'return':
                return parseReturnStatement$291();
            case 'switch':
                return parseSwitchStatement$294();
            case 'throw':
                return parseThrowStatement$295();
            case 'try':
                return parseTryStatement$297();
            case 'var':
                return parseVariableStatement$280();
            case 'while':
                return parseWhileStatement$286();
            case 'with':
                return parseWithStatement$292();
            default:
                break;
            }
        }
        expr$527 = parseExpression$274();
        // 12.12 Labelled Statements
        if (expr$527.type === Syntax$192.Identifier && match$239(':')) {
            lex$231();
            if (Object.prototype.hasOwnProperty.call(state$203.labelSet, expr$527.name)) {
                throwError$234({}, Messages$194.Redeclaration, 'Label', expr$527.name);
            }
            state$203.labelSet[expr$527.name] = true;
            labeledBody$528 = parseStatement$299();
            delete state$203.labelSet[expr$527.name];
            return {
                type: Syntax$192.LabeledStatement,
                label: expr$527,
                body: labeledBody$528
            };
        }
        consumeSemicolon$242();
        return {
            type: Syntax$192.ExpressionStatement,
            expression: expr$527
        };
    }
    // 13 Function Definition
    function parseFunctionSourceElements$300() {
        var sourceElement$529, sourceElements$530 = [], token$531, directive$532, firstRestricted$533, oldLabelSet$534, oldInIteration$535, oldInSwitch$536, oldInFunctionBody$537;
        expect$237('{');
        while (index$198 < length$201) {
            token$531 = lookahead$232().token;
            if (token$531.type !== Token$190.StringLiteral) {
                break;
            }
            sourceElement$529 = parseSourceElement$303();
            sourceElements$530.push(sourceElement$529);
            if (sourceElement$529.expression.type !== Syntax$192.Literal) {
                // this is not directive
                break;
            }
            directive$532 = sliceSource$208(token$531.range[0] + 1, token$531.range[1] - 1);
            if (directive$532 === 'use strict') {
                strict$197 = true;
                if (firstRestricted$533) {
                    throwError$234(firstRestricted$533, Messages$194.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$533 && token$531.octal) {
                    firstRestricted$533 = token$531;
                }
            }
        }
        oldLabelSet$534 = state$203.labelSet;
        oldInIteration$535 = state$203.inIteration;
        oldInSwitch$536 = state$203.inSwitch;
        oldInFunctionBody$537 = state$203.inFunctionBody;
        state$203.labelSet = {};
        state$203.inIteration = false;
        state$203.inSwitch = false;
        state$203.inFunctionBody = true;
        while (index$198 < length$201) {
            if (match$239('}')) {
                break;
            }
            sourceElement$529 = parseSourceElement$303();
            if (typeof sourceElement$529 === 'undefined') {
                break;
            }
            sourceElements$530.push(sourceElement$529);
        }
        expect$237('}');
        state$203.labelSet = oldLabelSet$534;
        state$203.inIteration = oldInIteration$535;
        state$203.inSwitch = oldInSwitch$536;
        state$203.inFunctionBody = oldInFunctionBody$537;
        return {
            type: Syntax$192.BlockStatement,
            body: sourceElements$530
        };
    }
    function parseFunctionDeclaration$301() {
        var id$538, param$539, params$540 = [], body$541, token$542, firstRestricted$543, message$544, previousStrict$545, paramSet$546;
        expectKeyword$238('function');
        token$542 = lookahead$232().token;
        id$538 = parseVariableIdentifier$277();
        if (strict$197) {
            if (isRestrictedWord$218(token$542.value)) {
                throwError$234(token$542, Messages$194.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$218(token$542.value)) {
                firstRestricted$543 = token$542;
                message$544 = Messages$194.StrictFunctionName;
            } else if (isStrictModeReservedWord$217(token$542.value)) {
                firstRestricted$543 = token$542;
                message$544 = Messages$194.StrictReservedWord;
            }
        }
        expect$237('(');
        if (!match$239(')')) {
            paramSet$546 = {};
            while (index$198 < length$201) {
                token$542 = lookahead$232().token;
                param$539 = parseVariableIdentifier$277();
                if (strict$197) {
                    if (isRestrictedWord$218(token$542.value)) {
                        throwError$234(token$542, Messages$194.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$546, token$542.value)) {
                        throwError$234(token$542, Messages$194.StrictParamDupe);
                    }
                } else if (!firstRestricted$543) {
                    if (isRestrictedWord$218(token$542.value)) {
                        firstRestricted$543 = token$542;
                        message$544 = Messages$194.StrictParamName;
                    } else if (isStrictModeReservedWord$217(token$542.value)) {
                        firstRestricted$543 = token$542;
                        message$544 = Messages$194.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$546, token$542.value)) {
                        firstRestricted$543 = token$542;
                        message$544 = Messages$194.StrictParamDupe;
                    }
                }
                params$540.push(param$539);
                paramSet$546[param$539.name] = true;
                if (match$239(')')) {
                    break;
                }
                expect$237(',');
            }
        }
        expect$237(')');
        previousStrict$545 = strict$197;
        body$541 = parseFunctionSourceElements$300();
        if (strict$197 && firstRestricted$543) {
            throwError$234(firstRestricted$543, message$544);
        }
        strict$197 = previousStrict$545;
        return {
            type: Syntax$192.FunctionDeclaration,
            id: id$538,
            params: params$540,
            body: body$541
        };
    }
    function parseFunctionExpression$302() {
        var token$547, id$548 = null, firstRestricted$549, message$550, param$551, params$552 = [], body$553, previousStrict$554, paramSet$555;
        expectKeyword$238('function');
        if (!match$239('(')) {
            token$547 = lookahead$232().token;
            id$548 = parseVariableIdentifier$277();
            if (strict$197) {
                if (isRestrictedWord$218(token$547.value)) {
                    throwError$234(token$547, Messages$194.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$218(token$547.value)) {
                    firstRestricted$549 = token$547;
                    message$550 = Messages$194.StrictFunctionName;
                } else if (isStrictModeReservedWord$217(token$547.value)) {
                    firstRestricted$549 = token$547;
                    message$550 = Messages$194.StrictReservedWord;
                }
            }
        }
        expect$237('(');
        if (!match$239(')')) {
            paramSet$555 = {};
            while (index$198 < length$201) {
                token$547 = lookahead$232().token;
                param$551 = parseVariableIdentifier$277();
                if (strict$197) {
                    if (isRestrictedWord$218(token$547.value)) {
                        throwError$234(token$547, Messages$194.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$555, token$547.value)) {
                        throwError$234(token$547, Messages$194.StrictParamDupe);
                    }
                } else if (!firstRestricted$549) {
                    if (isRestrictedWord$218(token$547.value)) {
                        firstRestricted$549 = token$547;
                        message$550 = Messages$194.StrictParamName;
                    } else if (isStrictModeReservedWord$217(token$547.value)) {
                        firstRestricted$549 = token$547;
                        message$550 = Messages$194.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$555, token$547.value)) {
                        firstRestricted$549 = token$547;
                        message$550 = Messages$194.StrictParamDupe;
                    }
                }
                params$552.push(param$551);
                paramSet$555[param$551.name] = true;
                if (match$239(')')) {
                    break;
                }
                expect$237(',');
            }
        }
        expect$237(')');
        previousStrict$554 = strict$197;
        body$553 = parseFunctionSourceElements$300();
        if (strict$197 && firstRestricted$549) {
            throwError$234(firstRestricted$549, message$550);
        }
        strict$197 = previousStrict$554;
        return {
            type: Syntax$192.FunctionExpression,
            id: id$548,
            params: params$552,
            body: body$553
        };
    }
    // 14 Program
    function parseSourceElement$303() {
        var token$556 = lookahead$232().token;
        if (token$556.type === Token$190.Keyword) {
            switch (token$556.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$281(token$556.value);
            case 'function':
                return parseFunctionDeclaration$301();
            default:
                return parseStatement$299();
            }
        }
        if (token$556.type !== Token$190.EOF) {
            return parseStatement$299();
        }
    }
    function parseSourceElements$304() {
        var sourceElement$557, sourceElements$558 = [], token$559, directive$560, firstRestricted$561;
        while (index$198 < length$201) {
            token$559 = lookahead$232();
            if (token$559.type !== Token$190.StringLiteral) {
                break;
            }
            sourceElement$557 = parseSourceElement$303();
            sourceElements$558.push(sourceElement$557);
            if (sourceElement$557.expression.type !== Syntax$192.Literal) {
                // this is not directive
                break;
            }
            directive$560 = sliceSource$208(token$559.range[0] + 1, token$559.range[1] - 1);
            if (directive$560 === 'use strict') {
                strict$197 = true;
                if (firstRestricted$561) {
                    throwError$234(firstRestricted$561, Messages$194.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$561 && token$559.octal) {
                    firstRestricted$561 = token$559;
                }
            }
        }
        while (index$198 < length$201) {
            sourceElement$557 = parseSourceElement$303();
            if (typeof sourceElement$557 === 'undefined') {
                break;
            }
            sourceElements$558.push(sourceElement$557);
        }
        return sourceElements$558;
    }
    function parseProgram$305() {
        var program$562;
        strict$197 = false;
        program$562 = {
            type: Syntax$192.Program,
            body: parseSourceElements$304()
        };
        return program$562;
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$306(start$563, end$564, type$565, value$566) {
        assert$206(typeof start$563 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$205.comments.length > 0) {
            if (extra$205.comments[extra$205.comments.length - 1].range[1] > start$563) {
                return;
            }
        }
        extra$205.comments.push({
            range: [
                start$563,
                end$564
            ],
            type: type$565,
            value: value$566
        });
    }
    function scanComment$307() {
        var comment$567, ch$568, start$569, blockComment$570, lineComment$571;
        comment$567 = '';
        blockComment$570 = false;
        lineComment$571 = false;
        while (index$198 < length$201) {
            ch$568 = source$196[index$198];
            if (lineComment$571) {
                ch$568 = nextChar$220();
                if (index$198 >= length$201) {
                    lineComment$571 = false;
                    comment$567 += ch$568;
                    addComment$306(start$569, index$198, 'Line', comment$567);
                } else if (isLineTerminator$213(ch$568)) {
                    lineComment$571 = false;
                    addComment$306(start$569, index$198, 'Line', comment$567);
                    if (ch$568 === '\r' && source$196[index$198] === '\n') {
                        ++index$198;
                    }
                    ++lineNumber$199;
                    lineStart$200 = index$198;
                    comment$567 = '';
                } else {
                    comment$567 += ch$568;
                }
            } else if (blockComment$570) {
                if (isLineTerminator$213(ch$568)) {
                    if (ch$568 === '\r' && source$196[index$198 + 1] === '\n') {
                        ++index$198;
                        comment$567 += '\r\n';
                    } else {
                        comment$567 += ch$568;
                    }
                    ++lineNumber$199;
                    ++index$198;
                    lineStart$200 = index$198;
                    if (index$198 >= length$201) {
                        throwError$234({}, Messages$194.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$568 = nextChar$220();
                    if (index$198 >= length$201) {
                        throwError$234({}, Messages$194.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$567 += ch$568;
                    if (ch$568 === '*') {
                        ch$568 = source$196[index$198];
                        if (ch$568 === '/') {
                            comment$567 = comment$567.substr(0, comment$567.length - 1);
                            blockComment$570 = false;
                            ++index$198;
                            addComment$306(start$569, index$198, 'Block', comment$567);
                            comment$567 = '';
                        }
                    }
                }
            } else if (ch$568 === '/') {
                ch$568 = source$196[index$198 + 1];
                if (ch$568 === '/') {
                    start$569 = index$198;
                    index$198 += 2;
                    lineComment$571 = true;
                } else if (ch$568 === '*') {
                    start$569 = index$198;
                    index$198 += 2;
                    blockComment$570 = true;
                    if (index$198 >= length$201) {
                        throwError$234({}, Messages$194.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$212(ch$568)) {
                ++index$198;
            } else if (isLineTerminator$213(ch$568)) {
                ++index$198;
                if (ch$568 === '\r' && source$196[index$198] === '\n') {
                    ++index$198;
                }
                ++lineNumber$199;
                lineStart$200 = index$198;
            } else {
                break;
            }
        }
    }
    function collectToken$308() {
        var token$572 = extra$205.advance(), range$573, value$574;
        if (token$572.type !== Token$190.EOF) {
            range$573 = [
                token$572.range[0],
                token$572.range[1]
            ];
            value$574 = sliceSource$208(token$572.range[0], token$572.range[1]);
            extra$205.tokens.push({
                type: TokenName$191[token$572.type],
                value: value$574,
                lineNumber: lineNumber$199,
                lineStart: lineStart$200,
                range: range$573
            });
        }
        return token$572;
    }
    function collectRegex$309() {
        var pos$575, regex$576, token$577;
        skipComment$222();
        pos$575 = index$198;
        regex$576 = extra$205.scanRegExp();
        // Pop the previous token, which is likely '/' or '/='
        if (extra$205.tokens.length > 0) {
            token$577 = extra$205.tokens[extra$205.tokens.length - 1];
            if (token$577.range[0] === pos$575 && token$577.type === 'Punctuator') {
                if (token$577.value === '/' || token$577.value === '/=') {
                    extra$205.tokens.pop();
                }
            }
        }
        extra$205.tokens.push({
            type: 'RegularExpression',
            value: regex$576.literal,
            range: [
                pos$575,
                index$198
            ],
            lineStart: token$577.lineStart,
            lineNumber: token$577.lineNumber
        });
        return regex$576;
    }
    function createLiteral$310(token$578) {
        if (Array.isArray(token$578)) {
            return {
                type: Syntax$192.Literal,
                value: token$578
            };
        }
        return {
            type: Syntax$192.Literal,
            value: token$578.value,
            lineStart: token$578.lineStart,
            lineNumber: token$578.lineNumber
        };
    }
    function createRawLiteral$311(token$579) {
        return {
            type: Syntax$192.Literal,
            value: token$579.value,
            raw: sliceSource$208(token$579.range[0], token$579.range[1]),
            lineStart: token$579.lineStart,
            lineNumber: token$579.lineNumber
        };
    }
    function wrapTrackingFunction$312(range$580, loc$581) {
        return function (parseFunction$582) {
            function isBinary$583(node$585) {
                return node$585.type === Syntax$192.LogicalExpression || node$585.type === Syntax$192.BinaryExpression;
            }
            function visit$584(node$586) {
                if (isBinary$583(node$586.left)) {
                    visit$584(node$586.left);
                }
                if (isBinary$583(node$586.right)) {
                    visit$584(node$586.right);
                }
                if (range$580 && typeof node$586.range === 'undefined') {
                    node$586.range = [
                        node$586.left.range[0],
                        node$586.right.range[1]
                    ];
                }
                if (loc$581 && typeof node$586.loc === 'undefined') {
                    node$586.loc = {
                        start: node$586.left.loc.start,
                        end: node$586.right.loc.end
                    };
                }
            }
            return function () {
                var node$587, rangeInfo$588, locInfo$589;
                // skipComment();
                var curr$590 = tokenStream$204[index$198].token;
                rangeInfo$588 = [
                    curr$590.range[0],
                    0
                ];
                locInfo$589 = {
                    start: {
                        line: curr$590.sm_lineNumber,
                        column: curr$590.sm_lineStart
                    }
                };
                node$587 = parseFunction$582.apply(null, arguments);
                if (typeof node$587 !== 'undefined') {
                    var last$591 = tokenStream$204[index$198].token;
                    if (range$580) {
                        rangeInfo$588[1] = last$591.range[1];
                        node$587.range = rangeInfo$588;
                    }
                    if (loc$581) {
                        locInfo$589.end = {
                            line: last$591.sm_lineNumber,
                            column: last$591.sm_lineStart
                        };
                        node$587.loc = locInfo$589;
                    }
                    if (isBinary$583(node$587)) {
                        visit$584(node$587);
                    }
                    if (node$587.type === Syntax$192.MemberExpression) {
                        if (typeof node$587.object.range !== 'undefined') {
                            node$587.range[0] = node$587.object.range[0];
                        }
                        if (typeof node$587.object.loc !== 'undefined') {
                            node$587.loc.start = node$587.object.loc.start;
                        }
                    }
                    if (node$587.type === Syntax$192.CallExpression) {
                        if (typeof node$587.callee.range !== 'undefined') {
                            node$587.range[0] = node$587.callee.range[0];
                        }
                        if (typeof node$587.callee.loc !== 'undefined') {
                            node$587.loc.start = node$587.callee.loc.start;
                        }
                    }
                    return node$587;
                }
            };
        };
    }
    function patch$313() {
        var wrapTracking$592;
        if (extra$205.comments) {
            extra$205.skipComment = skipComment$222;
            skipComment$222 = scanComment$307;
        }
        if (extra$205.raw) {
            extra$205.createLiteral = createLiteral$310;
            createLiteral$310 = createRawLiteral$311;
        }
        if (extra$205.range || extra$205.loc) {
            wrapTracking$592 = wrapTrackingFunction$312(extra$205.range, extra$205.loc);
            extra$205.parseAdditiveExpression = parseAdditiveExpression$263;
            extra$205.parseAssignmentExpression = parseAssignmentExpression$273;
            extra$205.parseBitwiseANDExpression = parseBitwiseANDExpression$267;
            extra$205.parseBitwiseORExpression = parseBitwiseORExpression$269;
            extra$205.parseBitwiseXORExpression = parseBitwiseXORExpression$268;
            extra$205.parseBlock = parseBlock$276;
            extra$205.parseFunctionSourceElements = parseFunctionSourceElements$300;
            extra$205.parseCallMember = parseCallMember$254;
            extra$205.parseCatchClause = parseCatchClause$296;
            extra$205.parseComputedMember = parseComputedMember$253;
            extra$205.parseConditionalExpression = parseConditionalExpression$272;
            extra$205.parseConstLetDeclaration = parseConstLetDeclaration$281;
            extra$205.parseEqualityExpression = parseEqualityExpression$266;
            extra$205.parseExpression = parseExpression$274;
            extra$205.parseForVariableDeclaration = parseForVariableDeclaration$287;
            extra$205.parseFunctionDeclaration = parseFunctionDeclaration$301;
            extra$205.parseFunctionExpression = parseFunctionExpression$302;
            extra$205.parseLogicalANDExpression = parseLogicalANDExpression$270;
            extra$205.parseLogicalORExpression = parseLogicalORExpression$271;
            extra$205.parseMultiplicativeExpression = parseMultiplicativeExpression$262;
            extra$205.parseNewExpression = parseNewExpression$255;
            extra$205.parseNonComputedMember = parseNonComputedMember$252;
            extra$205.parseNonComputedProperty = parseNonComputedProperty$251;
            extra$205.parseObjectProperty = parseObjectProperty$247;
            extra$205.parseObjectPropertyKey = parseObjectPropertyKey$246;
            extra$205.parsePostfixExpression = parsePostfixExpression$260;
            extra$205.parsePrimaryExpression = parsePrimaryExpression$249;
            extra$205.parseProgram = parseProgram$305;
            extra$205.parsePropertyFunction = parsePropertyFunction$245;
            extra$205.parseRelationalExpression = parseRelationalExpression$265;
            extra$205.parseStatement = parseStatement$299;
            extra$205.parseShiftExpression = parseShiftExpression$264;
            extra$205.parseSwitchCase = parseSwitchCase$293;
            extra$205.parseUnaryExpression = parseUnaryExpression$261;
            extra$205.parseVariableDeclaration = parseVariableDeclaration$278;
            extra$205.parseVariableIdentifier = parseVariableIdentifier$277;
            parseAdditiveExpression$263 = wrapTracking$592(extra$205.parseAdditiveExpression);
            parseAssignmentExpression$273 = wrapTracking$592(extra$205.parseAssignmentExpression);
            parseBitwiseANDExpression$267 = wrapTracking$592(extra$205.parseBitwiseANDExpression);
            parseBitwiseORExpression$269 = wrapTracking$592(extra$205.parseBitwiseORExpression);
            parseBitwiseXORExpression$268 = wrapTracking$592(extra$205.parseBitwiseXORExpression);
            parseBlock$276 = wrapTracking$592(extra$205.parseBlock);
            parseFunctionSourceElements$300 = wrapTracking$592(extra$205.parseFunctionSourceElements);
            parseCallMember$254 = wrapTracking$592(extra$205.parseCallMember);
            parseCatchClause$296 = wrapTracking$592(extra$205.parseCatchClause);
            parseComputedMember$253 = wrapTracking$592(extra$205.parseComputedMember);
            parseConditionalExpression$272 = wrapTracking$592(extra$205.parseConditionalExpression);
            parseConstLetDeclaration$281 = wrapTracking$592(extra$205.parseConstLetDeclaration);
            parseEqualityExpression$266 = wrapTracking$592(extra$205.parseEqualityExpression);
            parseExpression$274 = wrapTracking$592(extra$205.parseExpression);
            parseForVariableDeclaration$287 = wrapTracking$592(extra$205.parseForVariableDeclaration);
            parseFunctionDeclaration$301 = wrapTracking$592(extra$205.parseFunctionDeclaration);
            parseFunctionExpression$302 = wrapTracking$592(extra$205.parseFunctionExpression);
            parseLogicalANDExpression$270 = wrapTracking$592(extra$205.parseLogicalANDExpression);
            parseLogicalORExpression$271 = wrapTracking$592(extra$205.parseLogicalORExpression);
            parseMultiplicativeExpression$262 = wrapTracking$592(extra$205.parseMultiplicativeExpression);
            parseNewExpression$255 = wrapTracking$592(extra$205.parseNewExpression);
            parseNonComputedMember$252 = wrapTracking$592(extra$205.parseNonComputedMember);
            parseNonComputedProperty$251 = wrapTracking$592(extra$205.parseNonComputedProperty);
            parseObjectProperty$247 = wrapTracking$592(extra$205.parseObjectProperty);
            parseObjectPropertyKey$246 = wrapTracking$592(extra$205.parseObjectPropertyKey);
            parsePostfixExpression$260 = wrapTracking$592(extra$205.parsePostfixExpression);
            parsePrimaryExpression$249 = wrapTracking$592(extra$205.parsePrimaryExpression);
            parseProgram$305 = wrapTracking$592(extra$205.parseProgram);
            parsePropertyFunction$245 = wrapTracking$592(extra$205.parsePropertyFunction);
            parseRelationalExpression$265 = wrapTracking$592(extra$205.parseRelationalExpression);
            parseStatement$299 = wrapTracking$592(extra$205.parseStatement);
            parseShiftExpression$264 = wrapTracking$592(extra$205.parseShiftExpression);
            parseSwitchCase$293 = wrapTracking$592(extra$205.parseSwitchCase);
            parseUnaryExpression$261 = wrapTracking$592(extra$205.parseUnaryExpression);
            parseVariableDeclaration$278 = wrapTracking$592(extra$205.parseVariableDeclaration);
            parseVariableIdentifier$277 = wrapTracking$592(extra$205.parseVariableIdentifier);
        }
        if (typeof extra$205.tokens !== 'undefined') {
            extra$205.advance = advance$230;
            extra$205.scanRegExp = scanRegExp$228;
            advance$230 = collectToken$308;
            scanRegExp$228 = collectRegex$309;
        }
    }
    function unpatch$314() {
        if (typeof extra$205.skipComment === 'function') {
            skipComment$222 = extra$205.skipComment;
        }
        if (extra$205.raw) {
            createLiteral$310 = extra$205.createLiteral;
        }
        if (extra$205.range || extra$205.loc) {
            parseAdditiveExpression$263 = extra$205.parseAdditiveExpression;
            parseAssignmentExpression$273 = extra$205.parseAssignmentExpression;
            parseBitwiseANDExpression$267 = extra$205.parseBitwiseANDExpression;
            parseBitwiseORExpression$269 = extra$205.parseBitwiseORExpression;
            parseBitwiseXORExpression$268 = extra$205.parseBitwiseXORExpression;
            parseBlock$276 = extra$205.parseBlock;
            parseFunctionSourceElements$300 = extra$205.parseFunctionSourceElements;
            parseCallMember$254 = extra$205.parseCallMember;
            parseCatchClause$296 = extra$205.parseCatchClause;
            parseComputedMember$253 = extra$205.parseComputedMember;
            parseConditionalExpression$272 = extra$205.parseConditionalExpression;
            parseConstLetDeclaration$281 = extra$205.parseConstLetDeclaration;
            parseEqualityExpression$266 = extra$205.parseEqualityExpression;
            parseExpression$274 = extra$205.parseExpression;
            parseForVariableDeclaration$287 = extra$205.parseForVariableDeclaration;
            parseFunctionDeclaration$301 = extra$205.parseFunctionDeclaration;
            parseFunctionExpression$302 = extra$205.parseFunctionExpression;
            parseLogicalANDExpression$270 = extra$205.parseLogicalANDExpression;
            parseLogicalORExpression$271 = extra$205.parseLogicalORExpression;
            parseMultiplicativeExpression$262 = extra$205.parseMultiplicativeExpression;
            parseNewExpression$255 = extra$205.parseNewExpression;
            parseNonComputedMember$252 = extra$205.parseNonComputedMember;
            parseNonComputedProperty$251 = extra$205.parseNonComputedProperty;
            parseObjectProperty$247 = extra$205.parseObjectProperty;
            parseObjectPropertyKey$246 = extra$205.parseObjectPropertyKey;
            parsePrimaryExpression$249 = extra$205.parsePrimaryExpression;
            parsePostfixExpression$260 = extra$205.parsePostfixExpression;
            parseProgram$305 = extra$205.parseProgram;
            parsePropertyFunction$245 = extra$205.parsePropertyFunction;
            parseRelationalExpression$265 = extra$205.parseRelationalExpression;
            parseStatement$299 = extra$205.parseStatement;
            parseShiftExpression$264 = extra$205.parseShiftExpression;
            parseSwitchCase$293 = extra$205.parseSwitchCase;
            parseUnaryExpression$261 = extra$205.parseUnaryExpression;
            parseVariableDeclaration$278 = extra$205.parseVariableDeclaration;
            parseVariableIdentifier$277 = extra$205.parseVariableIdentifier;
        }
        if (typeof extra$205.scanRegExp === 'function') {
            advance$230 = extra$205.advance;
            scanRegExp$228 = extra$205.scanRegExp;
        }
    }
    function stringToArray$315(str$593) {
        var length$594 = str$593.length, result$595 = [], i$596;
        for (i$596 = 0; i$596 < length$594; ++i$596) {
            result$595[i$596] = str$593.charAt(i$596);
        }
        return result$595;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$316(toks$597, start$598, inExprDelim$599, parentIsBlock$600) {
        var assignOps$601 = [
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
        var binaryOps$602 = [
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
        var unaryOps$603 = [
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
        function back$604(n$605) {
            var idx$606 = toks$597.length - n$605 > 0 ? toks$597.length - n$605 : 0;
            return toks$597[idx$606];
        }
        if (inExprDelim$599 && toks$597.length - (start$598 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$604(start$598 + 2).value === ':' && parentIsBlock$600) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$207(back$604(start$598 + 2).value, unaryOps$603.concat(binaryOps$602).concat(assignOps$601))) {
            // ... + {...}
            return false;
        } else if (back$604(start$598 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$607 = typeof back$604(start$598 + 1).startLineNumber !== 'undefined' ? back$604(start$598 + 1).startLineNumber : back$604(start$598 + 1).lineNumber;
            if (back$604(start$598 + 2).lineNumber !== currLineNumber$607) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$207(back$604(start$598 + 2).value, [
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
    function readToken$317(toks$608, inExprDelim$609, parentIsBlock$610) {
        var delimiters$611 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$612 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$613 = toks$608.length - 1;
        function back$614(n$615) {
            var idx$616 = toks$608.length - n$615 > 0 ? toks$608.length - n$615 : 0;
            return toks$608[idx$616];
        }
        skipComment$222();
        if (isIn$207(getChar$221(), delimiters$611)) {
            return readDelim$318(toks$608, inExprDelim$609, parentIsBlock$610);
        }
        if (getChar$221() === '/') {
            var prev$617 = back$614(1);
            if (prev$617) {
                if (prev$617.value === '()') {
                    if (isIn$207(back$614(2).value, parenIdents$612)) {
                        // ... if (...) / ...
                        return scanRegExp$228();
                    }
                    // ... (...) / ...
                    return advance$230();
                }
                if (prev$617.value === '{}') {
                    if (blockAllowed$316(toks$608, 0, inExprDelim$609, parentIsBlock$610)) {
                        if (back$614(2).value === '()') {
                            // named function
                            if (back$614(4).value === 'function') {
                                if (!blockAllowed$316(toks$608, 3, inExprDelim$609, parentIsBlock$610)) {
                                    // new function foo (...) {...} / ...
                                    return advance$230();
                                }
                                if (toks$608.length - 5 <= 0 && inExprDelim$609) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return advance$230();
                                }
                            }
                            // unnamed function
                            if (back$614(3).value === 'function') {
                                if (!blockAllowed$316(toks$608, 2, inExprDelim$609, parentIsBlock$610)) {
                                    // new function (...) {...} / ...
                                    return advance$230();
                                }
                                if (toks$608.length - 4 <= 0 && inExprDelim$609) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return advance$230();
                                }
                            }
                        }
                        // ...; {...} /...
                        return scanRegExp$228();
                    } else {
                        // ... + {...} / ...
                        return advance$230();
                    }
                }
                if (prev$617.type === Token$190.Punctuator) {
                    // ... + /...
                    return scanRegExp$228();
                }
                if (isKeyword$219(prev$617.value)) {
                    // typeof /...
                    return scanRegExp$228();
                }
                return advance$230();
            }
            return scanRegExp$228();
        }
        return advance$230();
    }
    function readDelim$318(toks$618, inExprDelim$619, parentIsBlock$620) {
        var startDelim$621 = advance$230(), matchDelim$622 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$623 = [];
        var delimiters$624 = [
                '(',
                '{',
                '['
            ];
        assert$206(delimiters$624.indexOf(startDelim$621.value) !== -1, 'Need to begin at the delimiter');
        var token$625 = startDelim$621;
        var startLineNumber$626 = token$625.lineNumber;
        var startLineStart$627 = token$625.lineStart;
        var startRange$628 = token$625.range;
        var delimToken$629 = {};
        delimToken$629.type = Token$190.Delimiter;
        delimToken$629.value = startDelim$621.value + matchDelim$622[startDelim$621.value];
        delimToken$629.startLineNumber = startLineNumber$626;
        delimToken$629.startLineStart = startLineStart$627;
        delimToken$629.startRange = startRange$628;
        var delimIsBlock$630 = false;
        if (startDelim$621.value === '{') {
            delimIsBlock$630 = blockAllowed$316(toks$618.concat(delimToken$629), 0, inExprDelim$619, parentIsBlock$620);
        }
        while (index$198 <= length$201) {
            token$625 = readToken$317(inner$623, startDelim$621.value === '(' || startDelim$621.value === '[', delimIsBlock$630);
            if (token$625.type === Token$190.Punctuator && token$625.value === matchDelim$622[startDelim$621.value]) {
                break;
            } else if (token$625.type === Token$190.EOF) {
                throwError$234({}, Messages$194.UnexpectedEOS);
            } else {
                inner$623.push(token$625);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$198 >= length$201 && matchDelim$622[startDelim$621.value] !== source$196[length$201 - 1]) {
            throwError$234({}, Messages$194.UnexpectedEOS);
        }
        var endLineNumber$631 = token$625.lineNumber;
        var endLineStart$632 = token$625.lineStart;
        var endRange$633 = token$625.range;
        delimToken$629.inner = inner$623;
        delimToken$629.endLineNumber = endLineNumber$631;
        delimToken$629.endLineStart = endLineStart$632;
        delimToken$629.endRange = endRange$633;
        return delimToken$629;
    }
    ;
    // (Str) -> [...CSyntax]
    function read$319(code$634) {
        var token$635, tokenTree$636 = [];
        extra$205 = {};
        extra$205.comments = [];
        patch$313();
        source$196 = code$634;
        index$198 = 0;
        lineNumber$199 = source$196.length > 0 ? 1 : 0;
        lineStart$200 = 0;
        length$201 = source$196.length;
        buffer$202 = null;
        state$203 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$198 < length$201) {
            tokenTree$636.push(readToken$317(tokenTree$636, false, false));
        }
        var last$637 = tokenTree$636[tokenTree$636.length - 1];
        if (last$637 && last$637.type !== Token$190.EOF) {
            tokenTree$636.push({
                type: Token$190.EOF,
                value: '',
                lineNumber: last$637.lineNumber,
                lineStart: last$637.lineStart,
                range: [
                    index$198,
                    index$198
                ]
            });
        }
        return [
            expander$189.tokensToSyntax(tokenTree$636),
            extra$205.comments
        ];
    }
    // (SyntaxObject, Str, {}) -> SyntaxObject
    function parse$320(code$638, comments$639) {
        var program$640, toString$641;
        tokenStream$204 = code$638;
        index$198 = 0;
        length$201 = tokenStream$204.length;
        buffer$202 = null;
        state$203 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$205 = {
            range: true,
            loc: true
        };
        patch$313();
        try {
            program$640 = parseProgram$305();
            program$640.comments = comments$639;
            program$640.tokens = expander$189.syntaxToTokens(code$638);
        } catch (e$642) {
            throw e$642;
        } finally {
            unpatch$314();
            extra$205 = {};
        }
        return program$640;
    }
    exports$188.parse = parse$320;
    exports$188.read = read$319;
    exports$188.Token = Token$190;
    exports$188.assert = assert$206;
    // Deep copy.
    exports$188.Syntax = function () {
        var name$643, types$644 = {};
        if (typeof Object.create === 'function') {
            types$644 = Object.create(null);
        }
        for (name$643 in Syntax$192) {
            if (Syntax$192.hasOwnProperty(name$643)) {
                types$644[name$643] = Syntax$192[name$643];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$644);
        }
        return types$644;
    }();
}));