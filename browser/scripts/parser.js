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
(function (root$673, factory$674) {
    if (typeof exports === 'object') {
        // CommonJS
        factory$674(exports, require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'expander'
        ], factory$674);
    }
}(this, function (exports$675, expander$676) {
    'use strict';
    var Token$677, TokenName$678, Syntax$679, PropertyKind$680, Messages$681, Regex$682, source$683, strict$684, index$685, lineNumber$686, lineStart$687, length$688, buffer$689, state$690, tokenStream$691, extra$692;
    Token$677 = {
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
    TokenName$678 = {};
    TokenName$678[Token$677.BooleanLiteral] = 'Boolean';
    TokenName$678[Token$677.EOF] = '<end>';
    TokenName$678[Token$677.Identifier] = 'Identifier';
    TokenName$678[Token$677.Keyword] = 'Keyword';
    TokenName$678[Token$677.NullLiteral] = 'Null';
    TokenName$678[Token$677.NumericLiteral] = 'Numeric';
    TokenName$678[Token$677.Punctuator] = 'Punctuator';
    TokenName$678[Token$677.StringLiteral] = 'String';
    TokenName$678[Token$677.Delimiter] = 'Delimiter';
    Syntax$679 = {
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
    PropertyKind$680 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    // Error messages should be identical to V8.
    Messages$681 = {
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
    Regex$682 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    function assert$693(condition$808, message$809) {
        if (!condition$808) {
            throw new Error('ASSERT: ' + message$809);
        }
    }
    function isIn$694(el$810, list$811) {
        return list$811.indexOf(el$810) !== -1;
    }
    function sliceSource$695(from$812, to$813) {
        return source$683.slice(from$812, to$813);
    }
    if (typeof 'esprima'[0] === 'undefined') {
        sliceSource$695 = function sliceArraySource$814(from$815, to$816) {
            return source$683.slice(from$815, to$816).join('');
        };
    }
    function isDecimalDigit$696(ch$817) {
        return '0123456789'.indexOf(ch$817) >= 0;
    }
    function isHexDigit$697(ch$818) {
        return '0123456789abcdefABCDEF'.indexOf(ch$818) >= 0;
    }
    function isOctalDigit$698(ch$819) {
        return '01234567'.indexOf(ch$819) >= 0;
    }
    // 7.2 White Space
    function isWhiteSpace$699(ch$820) {
        return ch$820 === ' ' || ch$820 === '\t' || ch$820 === '\x0B' || ch$820 === '\f' || ch$820 === '\xa0' || ch$820.charCodeAt(0) >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(ch$820) >= 0;
    }
    // 7.3 Line Terminators
    function isLineTerminator$700(ch$821) {
        return ch$821 === '\n' || ch$821 === '\r' || ch$821 === '\u2028' || ch$821 === '\u2029';
    }
    // 7.6 Identifier Names and Identifiers
    function isIdentifierStart$701(ch$822) {
        return ch$822 === '$' || ch$822 === '_' || ch$822 === '\\' || ch$822 >= 'a' && ch$822 <= 'z' || ch$822 >= 'A' && ch$822 <= 'Z' || ch$822.charCodeAt(0) >= 128 && Regex$682.NonAsciiIdentifierStart.test(ch$822);
    }
    function isIdentifierPart$702(ch$823) {
        return ch$823 === '$' || ch$823 === '_' || ch$823 === '\\' || ch$823 >= 'a' && ch$823 <= 'z' || ch$823 >= 'A' && ch$823 <= 'Z' || ch$823 >= '0' && ch$823 <= '9' || ch$823.charCodeAt(0) >= 128 && Regex$682.NonAsciiIdentifierPart.test(ch$823);
    }
    // 7.6.1.2 Future Reserved Words
    function isFutureReservedWord$703(id$824) {
        // we are allowing future reserved words so macros can be written for them
        return false;
    }
    function isStrictModeReservedWord$704(id$825) {
        switch (id$825) {
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
    function isRestrictedWord$705(id$826) {
        return id$826 === 'eval' || id$826 === 'arguments';
    }
    // 7.6.1.1 Keywords
    function isKeyword$706(id$827) {
        var keyword$828 = false;
        switch (id$827.length) {
        case 2:
            keyword$828 = id$827 === 'if' || id$827 === 'in' || id$827 === 'do';
            break;
        case 3:
            keyword$828 = id$827 === 'var' || id$827 === 'for' || id$827 === 'new' || id$827 === 'try';
            break;
        case 4:
            keyword$828 = id$827 === 'this' || id$827 === 'else' || id$827 === 'case' || id$827 === 'void' || id$827 === 'with';
            break;
        case 5:
            keyword$828 = id$827 === 'while' || id$827 === 'break' || id$827 === 'catch' || id$827 === 'throw';
            break;
        case 6:
            keyword$828 = id$827 === 'return' || id$827 === 'typeof' || id$827 === 'delete' || id$827 === 'switch';
            break;
        case 7:
            keyword$828 = id$827 === 'default' || id$827 === 'finally';
            break;
        case 8:
            keyword$828 = id$827 === 'function' || id$827 === 'continue' || id$827 === 'debugger';
            break;
        case 10:
            keyword$828 = id$827 === 'instanceof';
            break;
        }
        if (keyword$828) {
            return true;
        }
        switch (id$827) {
        // Future reserved words.
        // 'const' is specialized as Keyword in V8.
        case 'const':
            return true;
        // For compatiblity to SpiderMonkey and ES.next
        case 'yield':
        case 'let':
            return true;
        }
        if (strict$684 && isStrictModeReservedWord$704(id$827)) {
            return true;
        }
        return isFutureReservedWord$703(id$827);
    }
    // Return the next character and move forward.
    function nextChar$707() {
        return source$683[index$685++];
    }
    function getChar$708() {
        return source$683[index$685];
    }
    // 7.4 Comments
    function skipComment$709() {
        var ch$829, blockComment$830, lineComment$831;
        blockComment$830 = false;
        lineComment$831 = false;
        while (index$685 < length$688) {
            ch$829 = source$683[index$685];
            if (lineComment$831) {
                ch$829 = nextChar$707();
                if (isLineTerminator$700(ch$829)) {
                    lineComment$831 = false;
                    if (ch$829 === '\r' && source$683[index$685] === '\n') {
                        ++index$685;
                    }
                    ++lineNumber$686;
                    lineStart$687 = index$685;
                }
            } else if (blockComment$830) {
                if (isLineTerminator$700(ch$829)) {
                    if (ch$829 === '\r' && source$683[index$685 + 1] === '\n') {
                        ++index$685;
                    }
                    ++lineNumber$686;
                    ++index$685;
                    lineStart$687 = index$685;
                    if (index$685 >= length$688) {
                        throwError$721({}, Messages$681.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$829 = nextChar$707();
                    if (index$685 >= length$688) {
                        throwError$721({}, Messages$681.UnexpectedToken, 'ILLEGAL');
                    }
                    if (ch$829 === '*') {
                        ch$829 = source$683[index$685];
                        if (ch$829 === '/') {
                            ++index$685;
                            blockComment$830 = false;
                        }
                    }
                }
            } else if (ch$829 === '/') {
                ch$829 = source$683[index$685 + 1];
                if (ch$829 === '/') {
                    index$685 += 2;
                    lineComment$831 = true;
                } else if (ch$829 === '*') {
                    index$685 += 2;
                    blockComment$830 = true;
                    if (index$685 >= length$688) {
                        throwError$721({}, Messages$681.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$699(ch$829)) {
                ++index$685;
            } else if (isLineTerminator$700(ch$829)) {
                ++index$685;
                if (ch$829 === '\r' && source$683[index$685] === '\n') {
                    ++index$685;
                }
                ++lineNumber$686;
                lineStart$687 = index$685;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$710(prefix$832) {
        var i$833, len$834, ch$835, code$836 = 0;
        len$834 = prefix$832 === 'u' ? 4 : 2;
        for (i$833 = 0; i$833 < len$834; ++i$833) {
            if (index$685 < length$688 && isHexDigit$697(source$683[index$685])) {
                ch$835 = nextChar$707();
                code$836 = code$836 * 16 + '0123456789abcdef'.indexOf(ch$835.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$836);
    }
    function scanIdentifier$711() {
        var ch$837, start$838, id$839, restore$840;
        ch$837 = source$683[index$685];
        if (!isIdentifierStart$701(ch$837)) {
            return;
        }
        start$838 = index$685;
        if (ch$837 === '\\') {
            ++index$685;
            if (source$683[index$685] !== 'u') {
                return;
            }
            ++index$685;
            restore$840 = index$685;
            ch$837 = scanHexEscape$710('u');
            if (ch$837) {
                if (ch$837 === '\\' || !isIdentifierStart$701(ch$837)) {
                    return;
                }
                id$839 = ch$837;
            } else {
                index$685 = restore$840;
                id$839 = 'u';
            }
        } else {
            id$839 = nextChar$707();
        }
        while (index$685 < length$688) {
            ch$837 = source$683[index$685];
            if (!isIdentifierPart$702(ch$837)) {
                break;
            }
            if (ch$837 === '\\') {
                ++index$685;
                if (source$683[index$685] !== 'u') {
                    return;
                }
                ++index$685;
                restore$840 = index$685;
                ch$837 = scanHexEscape$710('u');
                if (ch$837) {
                    if (ch$837 === '\\' || !isIdentifierPart$702(ch$837)) {
                        return;
                    }
                    id$839 += ch$837;
                } else {
                    index$685 = restore$840;
                    id$839 += 'u';
                }
            } else {
                id$839 += nextChar$707();
            }
        }
        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id$839.length === 1) {
            return {
                type: Token$677.Identifier,
                value: id$839,
                lineNumber: lineNumber$686,
                lineStart: lineStart$687,
                range: [
                    start$838,
                    index$685
                ]
            };
        }
        if (isKeyword$706(id$839)) {
            return {
                type: Token$677.Keyword,
                value: id$839,
                lineNumber: lineNumber$686,
                lineStart: lineStart$687,
                range: [
                    start$838,
                    index$685
                ]
            };
        }
        // 7.8.1 Null Literals
        if (id$839 === 'null') {
            return {
                type: Token$677.NullLiteral,
                value: id$839,
                lineNumber: lineNumber$686,
                lineStart: lineStart$687,
                range: [
                    start$838,
                    index$685
                ]
            };
        }
        // 7.8.2 Boolean Literals
        if (id$839 === 'true' || id$839 === 'false') {
            return {
                type: Token$677.BooleanLiteral,
                value: id$839,
                lineNumber: lineNumber$686,
                lineStart: lineStart$687,
                range: [
                    start$838,
                    index$685
                ]
            };
        }
        return {
            type: Token$677.Identifier,
            value: id$839,
            lineNumber: lineNumber$686,
            lineStart: lineStart$687,
            range: [
                start$838,
                index$685
            ]
        };
    }
    // 7.7 Punctuators
    function scanPunctuator$712() {
        var start$841 = index$685, ch1$842 = source$683[index$685], ch2$843, ch3$844, ch4$845;
        // Check for most common single-character punctuators.
        if (ch1$842 === ';' || ch1$842 === '{' || ch1$842 === '}') {
            ++index$685;
            return {
                type: Token$677.Punctuator,
                value: ch1$842,
                lineNumber: lineNumber$686,
                lineStart: lineStart$687,
                range: [
                    start$841,
                    index$685
                ]
            };
        }
        if (ch1$842 === ',' || ch1$842 === '(' || ch1$842 === ')') {
            ++index$685;
            return {
                type: Token$677.Punctuator,
                value: ch1$842,
                lineNumber: lineNumber$686,
                lineStart: lineStart$687,
                range: [
                    start$841,
                    index$685
                ]
            };
        }
        if (ch1$842 === '#' || ch1$842 === '@') {
            ++index$685;
            return {
                type: Token$677.Punctuator,
                value: ch1$842,
                lineNumber: lineNumber$686,
                lineStart: lineStart$687,
                range: [
                    start$841,
                    index$685
                ]
            };
        }
        // Dot (.) can also start a floating-point number, hence the need
        // to check the next character.
        ch2$843 = source$683[index$685 + 1];
        if (ch1$842 === '.' && !isDecimalDigit$696(ch2$843)) {
            if (source$683[index$685 + 1] === '.' && source$683[index$685 + 2] === '.') {
                nextChar$707();
                nextChar$707();
                nextChar$707();
                return {
                    type: Token$677.Punctuator,
                    value: '...',
                    lineNumber: lineNumber$686,
                    lineStart: lineStart$687,
                    range: [
                        start$841,
                        index$685
                    ]
                };
            } else {
                return {
                    type: Token$677.Punctuator,
                    value: nextChar$707(),
                    lineNumber: lineNumber$686,
                    lineStart: lineStart$687,
                    range: [
                        start$841,
                        index$685
                    ]
                };
            }
        }
        // Peek more characters.
        ch3$844 = source$683[index$685 + 2];
        ch4$845 = source$683[index$685 + 3];
        // 4-character punctuator: >>>=
        if (ch1$842 === '>' && ch2$843 === '>' && ch3$844 === '>') {
            if (ch4$845 === '=') {
                index$685 += 4;
                return {
                    type: Token$677.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$686,
                    lineStart: lineStart$687,
                    range: [
                        start$841,
                        index$685
                    ]
                };
            }
        }
        // 3-character punctuators: === !== >>> <<= >>=
        if (ch1$842 === '=' && ch2$843 === '=' && ch3$844 === '=') {
            index$685 += 3;
            return {
                type: Token$677.Punctuator,
                value: '===',
                lineNumber: lineNumber$686,
                lineStart: lineStart$687,
                range: [
                    start$841,
                    index$685
                ]
            };
        }
        if (ch1$842 === '!' && ch2$843 === '=' && ch3$844 === '=') {
            index$685 += 3;
            return {
                type: Token$677.Punctuator,
                value: '!==',
                lineNumber: lineNumber$686,
                lineStart: lineStart$687,
                range: [
                    start$841,
                    index$685
                ]
            };
        }
        if (ch1$842 === '>' && ch2$843 === '>' && ch3$844 === '>') {
            index$685 += 3;
            return {
                type: Token$677.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$686,
                lineStart: lineStart$687,
                range: [
                    start$841,
                    index$685
                ]
            };
        }
        if (ch1$842 === '<' && ch2$843 === '<' && ch3$844 === '=') {
            index$685 += 3;
            return {
                type: Token$677.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$686,
                lineStart: lineStart$687,
                range: [
                    start$841,
                    index$685
                ]
            };
        }
        if (ch1$842 === '>' && ch2$843 === '>' && ch3$844 === '=') {
            index$685 += 3;
            return {
                type: Token$677.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$686,
                lineStart: lineStart$687,
                range: [
                    start$841,
                    index$685
                ]
            };
        }
        // 2-character punctuators: <= >= == != ++ -- << >> && ||
        // += -= *= %= &= |= ^= /=
        if (ch2$843 === '=') {
            if ('<>=!+-*%&|^/'.indexOf(ch1$842) >= 0) {
                index$685 += 2;
                return {
                    type: Token$677.Punctuator,
                    value: ch1$842 + ch2$843,
                    lineNumber: lineNumber$686,
                    lineStart: lineStart$687,
                    range: [
                        start$841,
                        index$685
                    ]
                };
            }
        }
        if (ch1$842 === ch2$843 && '+-<>&|'.indexOf(ch1$842) >= 0) {
            if ('+-<>&|'.indexOf(ch2$843) >= 0) {
                index$685 += 2;
                return {
                    type: Token$677.Punctuator,
                    value: ch1$842 + ch2$843,
                    lineNumber: lineNumber$686,
                    lineStart: lineStart$687,
                    range: [
                        start$841,
                        index$685
                    ]
                };
            }
        }
        // The remaining 1-character punctuators.
        if ('[]<>+-*%&|^!~?:=/'.indexOf(ch1$842) >= 0) {
            return {
                type: Token$677.Punctuator,
                value: nextChar$707(),
                lineNumber: lineNumber$686,
                lineStart: lineStart$687,
                range: [
                    start$841,
                    index$685
                ]
            };
        }
    }
    // 7.8.3 Numeric Literals
    function scanNumericLiteral$713() {
        var number$846, start$847, ch$848;
        ch$848 = source$683[index$685];
        assert$693(isDecimalDigit$696(ch$848) || ch$848 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$847 = index$685;
        number$846 = '';
        if (ch$848 !== '.') {
            number$846 = nextChar$707();
            ch$848 = source$683[index$685];
            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            if (number$846 === '0') {
                if (ch$848 === 'x' || ch$848 === 'X') {
                    number$846 += nextChar$707();
                    while (index$685 < length$688) {
                        ch$848 = source$683[index$685];
                        if (!isHexDigit$697(ch$848)) {
                            break;
                        }
                        number$846 += nextChar$707();
                    }
                    if (number$846.length <= 2) {
                        // only 0x
                        throwError$721({}, Messages$681.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$685 < length$688) {
                        ch$848 = source$683[index$685];
                        if (isIdentifierStart$701(ch$848)) {
                            throwError$721({}, Messages$681.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$677.NumericLiteral,
                        value: parseInt(number$846, 16),
                        lineNumber: lineNumber$686,
                        lineStart: lineStart$687,
                        range: [
                            start$847,
                            index$685
                        ]
                    };
                } else if (isOctalDigit$698(ch$848)) {
                    number$846 += nextChar$707();
                    while (index$685 < length$688) {
                        ch$848 = source$683[index$685];
                        if (!isOctalDigit$698(ch$848)) {
                            break;
                        }
                        number$846 += nextChar$707();
                    }
                    if (index$685 < length$688) {
                        ch$848 = source$683[index$685];
                        if (isIdentifierStart$701(ch$848) || isDecimalDigit$696(ch$848)) {
                            throwError$721({}, Messages$681.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$677.NumericLiteral,
                        value: parseInt(number$846, 8),
                        octal: true,
                        lineNumber: lineNumber$686,
                        lineStart: lineStart$687,
                        range: [
                            start$847,
                            index$685
                        ]
                    };
                }
                // decimal number starts with '0' such as '09' is illegal.
                if (isDecimalDigit$696(ch$848)) {
                    throwError$721({}, Messages$681.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (index$685 < length$688) {
                ch$848 = source$683[index$685];
                if (!isDecimalDigit$696(ch$848)) {
                    break;
                }
                number$846 += nextChar$707();
            }
        }
        if (ch$848 === '.') {
            number$846 += nextChar$707();
            while (index$685 < length$688) {
                ch$848 = source$683[index$685];
                if (!isDecimalDigit$696(ch$848)) {
                    break;
                }
                number$846 += nextChar$707();
            }
        }
        if (ch$848 === 'e' || ch$848 === 'E') {
            number$846 += nextChar$707();
            ch$848 = source$683[index$685];
            if (ch$848 === '+' || ch$848 === '-') {
                number$846 += nextChar$707();
            }
            ch$848 = source$683[index$685];
            if (isDecimalDigit$696(ch$848)) {
                number$846 += nextChar$707();
                while (index$685 < length$688) {
                    ch$848 = source$683[index$685];
                    if (!isDecimalDigit$696(ch$848)) {
                        break;
                    }
                    number$846 += nextChar$707();
                }
            } else {
                ch$848 = 'character ' + ch$848;
                if (index$685 >= length$688) {
                    ch$848 = '<end>';
                }
                throwError$721({}, Messages$681.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (index$685 < length$688) {
            ch$848 = source$683[index$685];
            if (isIdentifierStart$701(ch$848)) {
                throwError$721({}, Messages$681.UnexpectedToken, 'ILLEGAL');
            }
        }
        return {
            type: Token$677.NumericLiteral,
            value: parseFloat(number$846),
            lineNumber: lineNumber$686,
            lineStart: lineStart$687,
            range: [
                start$847,
                index$685
            ]
        };
    }
    // 7.8.4 String Literals
    function scanStringLiteral$714() {
        var str$849 = '', quote$850, start$851, ch$852, code$853, unescaped$854, restore$855, octal$856 = false;
        quote$850 = source$683[index$685];
        assert$693(quote$850 === '\'' || quote$850 === '"', 'String literal must starts with a quote');
        start$851 = index$685;
        ++index$685;
        while (index$685 < length$688) {
            ch$852 = nextChar$707();
            if (ch$852 === quote$850) {
                quote$850 = '';
                break;
            } else if (ch$852 === '\\') {
                ch$852 = nextChar$707();
                if (!isLineTerminator$700(ch$852)) {
                    switch (ch$852) {
                    case 'n':
                        str$849 += '\n';
                        break;
                    case 'r':
                        str$849 += '\r';
                        break;
                    case 't':
                        str$849 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        restore$855 = index$685;
                        unescaped$854 = scanHexEscape$710(ch$852);
                        if (unescaped$854) {
                            str$849 += unescaped$854;
                        } else {
                            index$685 = restore$855;
                            str$849 += ch$852;
                        }
                        break;
                    case 'b':
                        str$849 += '\b';
                        break;
                    case 'f':
                        str$849 += '\f';
                        break;
                    case 'v':
                        str$849 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$698(ch$852)) {
                            code$853 = '01234567'.indexOf(ch$852);
                            // \0 is not octal escape sequence
                            if (code$853 !== 0) {
                                octal$856 = true;
                            }
                            if (index$685 < length$688 && isOctalDigit$698(source$683[index$685])) {
                                octal$856 = true;
                                code$853 = code$853 * 8 + '01234567'.indexOf(nextChar$707());
                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch$852) >= 0 && index$685 < length$688 && isOctalDigit$698(source$683[index$685])) {
                                    code$853 = code$853 * 8 + '01234567'.indexOf(nextChar$707());
                                }
                            }
                            str$849 += String.fromCharCode(code$853);
                        } else {
                            str$849 += ch$852;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$686;
                    if (ch$852 === '\r' && source$683[index$685] === '\n') {
                        ++index$685;
                    }
                }
            } else if (isLineTerminator$700(ch$852)) {
                break;
            } else {
                str$849 += ch$852;
            }
        }
        if (quote$850 !== '') {
            throwError$721({}, Messages$681.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$677.StringLiteral,
            value: str$849,
            octal: octal$856,
            lineNumber: lineNumber$686,
            lineStart: lineStart$687,
            range: [
                start$851,
                index$685
            ]
        };
    }
    function scanRegExp$715() {
        var str$857 = '', ch$858, start$859, pattern$860, flags$861, value$862, classMarker$863 = false, restore$864;
        buffer$689 = null;
        skipComment$709();
        start$859 = index$685;
        ch$858 = source$683[index$685];
        assert$693(ch$858 === '/', 'Regular expression literal must start with a slash');
        str$857 = nextChar$707();
        while (index$685 < length$688) {
            ch$858 = nextChar$707();
            str$857 += ch$858;
            if (classMarker$863) {
                if (ch$858 === ']') {
                    classMarker$863 = false;
                }
            } else {
                if (ch$858 === '\\') {
                    ch$858 = nextChar$707();
                    // ECMA-262 7.8.5
                    if (isLineTerminator$700(ch$858)) {
                        throwError$721({}, Messages$681.UnterminatedRegExp);
                    }
                    str$857 += ch$858;
                } else if (ch$858 === '/') {
                    break;
                } else if (ch$858 === '[') {
                    classMarker$863 = true;
                } else if (isLineTerminator$700(ch$858)) {
                    throwError$721({}, Messages$681.UnterminatedRegExp);
                }
            }
        }
        if (str$857.length === 1) {
            throwError$721({}, Messages$681.UnterminatedRegExp);
        }
        // Exclude leading and trailing slash.
        pattern$860 = str$857.substr(1, str$857.length - 2);
        flags$861 = '';
        while (index$685 < length$688) {
            ch$858 = source$683[index$685];
            if (!isIdentifierPart$702(ch$858)) {
                break;
            }
            ++index$685;
            if (ch$858 === '\\' && index$685 < length$688) {
                ch$858 = source$683[index$685];
                if (ch$858 === 'u') {
                    ++index$685;
                    restore$864 = index$685;
                    ch$858 = scanHexEscape$710('u');
                    if (ch$858) {
                        flags$861 += ch$858;
                        str$857 += '\\u';
                        for (; restore$864 < index$685; ++restore$864) {
                            str$857 += source$683[restore$864];
                        }
                    } else {
                        index$685 = restore$864;
                        flags$861 += 'u';
                        str$857 += '\\u';
                    }
                } else {
                    str$857 += '\\';
                }
            } else {
                flags$861 += ch$858;
                str$857 += ch$858;
            }
        }
        try {
            value$862 = new RegExp(pattern$860, flags$861);
        } catch (e$865) {
            throwError$721({}, Messages$681.InvalidRegExp);
        }
        return {
            type: Token$677.RegexLiteral,
            literal: str$857,
            value: value$862,
            lineNumber: lineNumber$686,
            lineStart: lineStart$687,
            range: [
                start$859,
                index$685
            ]
        };
    }
    function isIdentifierName$716(token$866) {
        return token$866.type === Token$677.Identifier || token$866.type === Token$677.Keyword || token$866.type === Token$677.BooleanLiteral || token$866.type === Token$677.NullLiteral;
    }
    // only used by the reader
    function advance$717() {
        var ch$867, token$868;
        skipComment$709();
        if (index$685 >= length$688) {
            return {
                type: Token$677.EOF,
                lineNumber: lineNumber$686,
                lineStart: lineStart$687,
                range: [
                    index$685,
                    index$685
                ]
            };
        }
        ch$867 = source$683[index$685];
        token$868 = scanPunctuator$712();
        if (typeof token$868 !== 'undefined') {
            return token$868;
        }
        if (ch$867 === '\'' || ch$867 === '"') {
            return scanStringLiteral$714();
        }
        if (ch$867 === '.' || isDecimalDigit$696(ch$867)) {
            return scanNumericLiteral$713();
        }
        token$868 = scanIdentifier$711();
        if (typeof token$868 !== 'undefined') {
            return token$868;
        }
        throwError$721({}, Messages$681.UnexpectedToken, 'ILLEGAL');
    }
    function lex$718() {
        var token$869;
        if (buffer$689) {
            token$869 = buffer$689;
            buffer$689 = null;
            index$685++;
            return token$869;
        }
        buffer$689 = null;
        return tokenStream$691[index$685++];
    }
    function lookahead$719() {
        var pos$870, line$871, start$872;
        if (buffer$689 !== null) {
            return buffer$689;
        }
        buffer$689 = tokenStream$691[index$685];
        return buffer$689;
    }
    // Return true if there is a line terminator before the next token.
    function peekLineTerminator$720() {
        var pos$873, line$874, start$875, found$876;
        found$876 = tokenStream$691[index$685 - 1].token.lineNumber !== tokenStream$691[index$685].token.lineNumber;
        return found$876;
    }
    // Throw an exception
    function throwError$721(token$877, messageFormat$878) {
        var error$879, args$880 = Array.prototype.slice.call(arguments, 2), msg$881 = messageFormat$878.replace(/%(\d)/g, function (whole$882, index$883) {
                return args$880[index$883] || '';
            });
        if (typeof token$877.lineNumber === 'number') {
            error$879 = new Error('Line ' + token$877.lineNumber + ': ' + msg$881);
            error$879.lineNumber = token$877.lineNumber;
            if (token$877.range && token$877.range.length > 0) {
                error$879.index = token$877.range[0];
                error$879.column = token$877.range[0] - lineStart$687 + 1;
            }
        } else {
            error$879 = new Error('Line ' + lineNumber$686 + ': ' + msg$881);
            error$879.index = index$685;
            error$879.lineNumber = lineNumber$686;
            error$879.column = index$685 - lineStart$687 + 1;
        }
        throw error$879;
    }
    function throwErrorTolerant$722() {
        var error$884;
        try {
            throwError$721.apply(null, arguments);
        } catch (e$885) {
            if (extra$692.errors) {
                extra$692.errors.push(e$885);
            } else {
                throw e$885;
            }
        }
    }
    // Throw an exception because of the token.
    function throwUnexpected$723(token$886) {
        var s$887;
        if (token$886.type === Token$677.EOF) {
            throwError$721(token$886, Messages$681.UnexpectedEOS);
        }
        if (token$886.type === Token$677.NumericLiteral) {
            throwError$721(token$886, Messages$681.UnexpectedNumber);
        }
        if (token$886.type === Token$677.StringLiteral) {
            throwError$721(token$886, Messages$681.UnexpectedString);
        }
        if (token$886.type === Token$677.Identifier) {
            console.log(token$886);
            throwError$721(token$886, Messages$681.UnexpectedIdentifier);
        }
        if (token$886.type === Token$677.Keyword) {
            if (isFutureReservedWord$703(token$886.value)) {
                throwError$721(token$886, Messages$681.UnexpectedReserved);
            } else if (strict$684 && isStrictModeReservedWord$704(token$886.value)) {
                throwError$721(token$886, Messages$681.StrictReservedWord);
            }
            throwError$721(token$886, Messages$681.UnexpectedToken, token$886.value);
        }
        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError$721(token$886, Messages$681.UnexpectedToken, token$886.value);
    }
    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.
    function expect$724(value$888) {
        var token$889 = lex$718().token;
        if (token$889.type !== Token$677.Punctuator || token$889.value !== value$888) {
            throwUnexpected$723(token$889);
        }
    }
    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.
    function expectKeyword$725(keyword$890) {
        var token$891 = lex$718().token;
        if (token$891.type !== Token$677.Keyword || token$891.value !== keyword$890) {
            throwUnexpected$723(token$891);
        }
    }
    // Return true if the next token matches the specified punctuator.
    function match$726(value$892) {
        var token$893 = lookahead$719().token;
        return token$893.type === Token$677.Punctuator && token$893.value === value$892;
    }
    // Return true if the next token matches the specified keyword
    function matchKeyword$727(keyword$894) {
        var token$895 = lookahead$719().token;
        return token$895.type === Token$677.Keyword && token$895.value === keyword$894;
    }
    // Return true if the next token is an assignment operator
    function matchAssign$728() {
        var token$896 = lookahead$719().token, op$897 = token$896.value;
        if (token$896.type !== Token$677.Punctuator) {
            return false;
        }
        return op$897 === '=' || op$897 === '*=' || op$897 === '/=' || op$897 === '%=' || op$897 === '+=' || op$897 === '-=' || op$897 === '<<=' || op$897 === '>>=' || op$897 === '>>>=' || op$897 === '&=' || op$897 === '^=' || op$897 === '|=';
    }
    function consumeSemicolon$729() {
        var token$898, line$899;
        if (tokenStream$691[index$685].token.value === ';') {
            lex$718().token;
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
        line$899 = tokenStream$691[index$685 - 1].token.lineNumber;
        token$898 = tokenStream$691[index$685].token;
        if (line$899 !== token$898.lineNumber) {
            return;
        }
        if (token$898.type !== Token$677.EOF && !match$726('}')) {
            throwUnexpected$723(token$898);
        }
        return;
    }
    // Return true if provided expression is LeftHandSideExpression
    function isLeftHandSide$730(expr$900) {
        return expr$900.type === Syntax$679.Identifier || expr$900.type === Syntax$679.MemberExpression;
    }
    // 11.1.4 Array Initialiser
    function parseArrayInitialiser$731() {
        var elements$901 = [], undef$902;
        expect$724('[');
        while (!match$726(']')) {
            if (match$726(',')) {
                lex$718().token;
                elements$901.push(undef$902);
            } else {
                elements$901.push(parseAssignmentExpression$760());
                if (!match$726(']')) {
                    expect$724(',');
                }
            }
        }
        expect$724(']');
        return {
            type: Syntax$679.ArrayExpression,
            elements: elements$901
        };
    }
    // 11.1.5 Object Initialiser
    function parsePropertyFunction$732(param$903, first$904) {
        var previousStrict$905, body$906;
        previousStrict$905 = strict$684;
        body$906 = parseFunctionSourceElements$787();
        if (first$904 && strict$684 && isRestrictedWord$705(param$903[0].name)) {
            throwError$721(first$904, Messages$681.StrictParamName);
        }
        strict$684 = previousStrict$905;
        return {
            type: Syntax$679.FunctionExpression,
            id: null,
            params: param$903,
            body: body$906
        };
    }
    function parseObjectPropertyKey$733() {
        var token$907 = lex$718().token;
        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token$907.type === Token$677.StringLiteral || token$907.type === Token$677.NumericLiteral) {
            if (strict$684 && token$907.octal) {
                throwError$721(token$907, Messages$681.StrictOctalLiteral);
            }
            return createLiteral$797(token$907);
        }
        return {
            type: Syntax$679.Identifier,
            name: token$907.value
        };
    }
    function parseObjectProperty$734() {
        var token$908, key$909, id$910, param$911;
        token$908 = lookahead$719().token;
        if (token$908.type === Token$677.Identifier) {
            id$910 = parseObjectPropertyKey$733();
            // Property Assignment: Getter and Setter.
            if (token$908.value === 'get' && !match$726(':')) {
                key$909 = parseObjectPropertyKey$733();
                expect$724('(');
                expect$724(')');
                return {
                    type: Syntax$679.Property,
                    key: key$909,
                    value: parsePropertyFunction$732([]),
                    kind: 'get'
                };
            } else if (token$908.value === 'set' && !match$726(':')) {
                key$909 = parseObjectPropertyKey$733();
                expect$724('(');
                token$908 = lookahead$719().token;
                if (token$908.type !== Token$677.Identifier) {
                    throwUnexpected$723(lex$718().token);
                }
                param$911 = [parseVariableIdentifier$764()];
                expect$724(')');
                return {
                    type: Syntax$679.Property,
                    key: key$909,
                    value: parsePropertyFunction$732(param$911, token$908),
                    kind: 'set'
                };
            } else {
                expect$724(':');
                return {
                    type: Syntax$679.Property,
                    key: id$910,
                    value: parseAssignmentExpression$760(),
                    kind: 'init'
                };
            }
        } else if (token$908.type === Token$677.EOF || token$908.type === Token$677.Punctuator) {
            throwUnexpected$723(token$908);
        } else {
            key$909 = parseObjectPropertyKey$733();
            expect$724(':');
            return {
                type: Syntax$679.Property,
                key: key$909,
                value: parseAssignmentExpression$760(),
                kind: 'init'
            };
        }
    }
    function parseObjectInitialiser$735() {
        var token$912, properties$913 = [], property$914, name$915, kind$916, map$917 = {}, toString$918 = String;
        expect$724('{');
        while (!match$726('}')) {
            property$914 = parseObjectProperty$734();
            if (property$914.key.type === Syntax$679.Identifier) {
                name$915 = property$914.key.name;
            } else {
                name$915 = toString$918(property$914.key.value);
            }
            kind$916 = property$914.kind === 'init' ? PropertyKind$680.Data : property$914.kind === 'get' ? PropertyKind$680.Get : PropertyKind$680.Set;
            if (Object.prototype.hasOwnProperty.call(map$917, name$915)) {
                if (map$917[name$915] === PropertyKind$680.Data) {
                    if (strict$684 && kind$916 === PropertyKind$680.Data) {
                        throwErrorTolerant$722({}, Messages$681.StrictDuplicateProperty);
                    } else if (kind$916 !== PropertyKind$680.Data) {
                        throwError$721({}, Messages$681.AccessorDataProperty);
                    }
                } else {
                    if (kind$916 === PropertyKind$680.Data) {
                        throwError$721({}, Messages$681.AccessorDataProperty);
                    } else if (map$917[name$915] & kind$916) {
                        throwError$721({}, Messages$681.AccessorGetSet);
                    }
                }
                map$917[name$915] |= kind$916;
            } else {
                map$917[name$915] = kind$916;
            }
            properties$913.push(property$914);
            if (!match$726('}')) {
                expect$724(',');
            }
        }
        expect$724('}');
        return {
            type: Syntax$679.ObjectExpression,
            properties: properties$913
        };
    }
    // 11.1 Primary Expressions
    function parsePrimaryExpression$736() {
        var expr$919, token$920 = lookahead$719().token, type$921 = token$920.type;
        if (type$921 === Token$677.Identifier) {
            var name$922 = expander$676.resolve(lex$718());
            return {
                type: Syntax$679.Identifier,
                name: name$922
            };
        }
        if (type$921 === Token$677.StringLiteral || type$921 === Token$677.NumericLiteral) {
            if (strict$684 && token$920.octal) {
                throwErrorTolerant$722(token$920, Messages$681.StrictOctalLiteral);
            }
            return createLiteral$797(lex$718().token);
        }
        if (type$921 === Token$677.Keyword) {
            if (matchKeyword$727('this')) {
                lex$718().token;
                return { type: Syntax$679.ThisExpression };
            }
            if (matchKeyword$727('function')) {
                return parseFunctionExpression$789();
            }
        }
        if (type$921 === Token$677.BooleanLiteral) {
            lex$718();
            token$920.value = token$920.value === 'true';
            return createLiteral$797(token$920);
        }
        if (type$921 === Token$677.NullLiteral) {
            lex$718();
            token$920.value = null;
            return createLiteral$797(token$920);
        }
        if (match$726('[')) {
            return parseArrayInitialiser$731();
        }
        if (match$726('{')) {
            return parseObjectInitialiser$735();
        }
        if (match$726('(')) {
            lex$718();
            state$690.lastParenthesized = expr$919 = parseExpression$761();
            expect$724(')');
            return expr$919;
        }
        if (token$920.value instanceof RegExp) {
            return createLiteral$797(lex$718().token);
        }
        return throwUnexpected$723(lex$718().token);
    }
    // 11.2 Left-Hand-Side Expressions
    function parseArguments$737() {
        var args$923 = [];
        expect$724('(');
        if (!match$726(')')) {
            while (index$685 < length$688) {
                args$923.push(parseAssignmentExpression$760());
                if (match$726(')')) {
                    break;
                }
                expect$724(',');
            }
        }
        expect$724(')');
        return args$923;
    }
    function parseNonComputedProperty$738() {
        var token$924 = lex$718().token;
        if (!isIdentifierName$716(token$924)) {
            throwUnexpected$723(token$924);
        }
        return {
            type: Syntax$679.Identifier,
            name: token$924.value
        };
    }
    function parseNonComputedMember$739(object$925) {
        return {
            type: Syntax$679.MemberExpression,
            computed: false,
            object: object$925,
            property: parseNonComputedProperty$738()
        };
    }
    function parseComputedMember$740(object$926) {
        var property$927, expr$928;
        expect$724('[');
        property$927 = parseExpression$761();
        expr$928 = {
            type: Syntax$679.MemberExpression,
            computed: true,
            object: object$926,
            property: property$927
        };
        expect$724(']');
        return expr$928;
    }
    function parseCallMember$741(object$929) {
        return {
            type: Syntax$679.CallExpression,
            callee: object$929,
            'arguments': parseArguments$737()
        };
    }
    function parseNewExpression$742() {
        var expr$930;
        expectKeyword$725('new');
        expr$930 = {
            type: Syntax$679.NewExpression,
            callee: parseLeftHandSideExpression$746(),
            'arguments': []
        };
        if (match$726('(')) {
            expr$930['arguments'] = parseArguments$737();
        }
        return expr$930;
    }
    // sort of broken, only accepts literals
    // pretty sure the use of toString will bite me
    function toArrayNode$743(arr$931) {
        var els$932 = arr$931.map(function (el$933) {
                return {
                    type: 'Literal',
                    value: el$933,
                    raw: el$933.toString()
                };
            });
        return {
            type: 'ArrayExpression',
            elements: els$932
        };
    }
    function toObjectNode$744(obj$934) {
        // todo: hacky, fixup
        var props$935 = Object.keys(obj$934).map(function (key$936) {
                var raw$937 = obj$934[key$936];
                var value$938;
                if (Array.isArray(raw$937)) {
                    value$938 = toArrayNode$743(raw$937);
                } else {
                    value$938 = {
                        type: 'Literal',
                        value: obj$934[key$936],
                        raw: obj$934[key$936].toString()
                    };
                }
                return {
                    type: 'Property',
                    key: {
                        type: 'Identifier',
                        name: key$936
                    },
                    value: value$938,
                    kind: 'init'
                };
            });
        return {
            type: 'ObjectExpression',
            properties: props$935
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
    function parseLeftHandSideExpressionAllowCall$745() {
        var useNew$939, expr$940;
        useNew$939 = matchKeyword$727('new');
        expr$940 = useNew$939 ? parseNewExpression$742() : parsePrimaryExpression$736();
        // handle "syntax" primitive
        // todo: error handling
        // if(expr.name === "syntax") {
        //     return parseSyntaxObject();
        // }
        while (index$685 < length$688) {
            if (match$726('.')) {
                lex$718();
                expr$940 = parseNonComputedMember$739(expr$940);
            } else if (match$726('[')) {
                expr$940 = parseComputedMember$740(expr$940);
            } else if (match$726('(')) {
                expr$940 = parseCallMember$741(expr$940);
            } else {
                break;
            }
        }
        return expr$940;
    }
    function parseLeftHandSideExpression$746() {
        var useNew$941, expr$942;
        useNew$941 = matchKeyword$727('new');
        expr$942 = useNew$941 ? parseNewExpression$742() : parsePrimaryExpression$736();
        while (index$685 < length$688) {
            if (match$726('.')) {
                lex$718();
                expr$942 = parseNonComputedMember$739(expr$942);
            } else if (match$726('[')) {
                expr$942 = parseComputedMember$740(expr$942);
            } else {
                break;
            }
        }
        return expr$942;
    }
    // 11.3 Postfix Expressions
    function parsePostfixExpression$747() {
        var expr$943 = parseLeftHandSideExpressionAllowCall$745();
        if ((match$726('++') || match$726('--')) && !peekLineTerminator$720()) {
            // 11.3.1, 11.3.2
            if (strict$684 && expr$943.type === Syntax$679.Identifier && isRestrictedWord$705(expr$943.name)) {
                throwError$721({}, Messages$681.StrictLHSPostfix);
            }
            if (!isLeftHandSide$730(expr$943)) {
                throwError$721({}, Messages$681.InvalidLHSInAssignment);
            }
            expr$943 = {
                type: Syntax$679.UpdateExpression,
                operator: lex$718().token.value,
                argument: expr$943,
                prefix: false
            };
        }
        return expr$943;
    }
    // 11.4 Unary Operators
    function parseUnaryExpression$748() {
        var token$944, expr$945;
        if (match$726('++') || match$726('--')) {
            token$944 = lex$718().token;
            expr$945 = parseUnaryExpression$748();
            // 11.4.4, 11.4.5
            if (strict$684 && expr$945.type === Syntax$679.Identifier && isRestrictedWord$705(expr$945.name)) {
                throwError$721({}, Messages$681.StrictLHSPrefix);
            }
            if (!isLeftHandSide$730(expr$945)) {
                throwError$721({}, Messages$681.InvalidLHSInAssignment);
            }
            expr$945 = {
                type: Syntax$679.UpdateExpression,
                operator: token$944.value,
                argument: expr$945,
                prefix: true
            };
            return expr$945;
        }
        if (match$726('+') || match$726('-') || match$726('~') || match$726('!')) {
            expr$945 = {
                type: Syntax$679.UnaryExpression,
                operator: lex$718().token.value,
                argument: parseUnaryExpression$748()
            };
            return expr$945;
        }
        if (matchKeyword$727('delete') || matchKeyword$727('void') || matchKeyword$727('typeof')) {
            expr$945 = {
                type: Syntax$679.UnaryExpression,
                operator: lex$718().token.value,
                argument: parseUnaryExpression$748()
            };
            if (strict$684 && expr$945.operator === 'delete' && expr$945.argument.type === Syntax$679.Identifier) {
                throwErrorTolerant$722({}, Messages$681.StrictDelete);
            }
            return expr$945;
        }
        return parsePostfixExpression$747();
    }
    // 11.5 Multiplicative Operators
    function parseMultiplicativeExpression$749() {
        var expr$946 = parseUnaryExpression$748();
        while (match$726('*') || match$726('/') || match$726('%')) {
            expr$946 = {
                type: Syntax$679.BinaryExpression,
                operator: lex$718().token.value,
                left: expr$946,
                right: parseUnaryExpression$748()
            };
        }
        return expr$946;
    }
    // 11.6 Additive Operators
    function parseAdditiveExpression$750() {
        var expr$947 = parseMultiplicativeExpression$749();
        while (match$726('+') || match$726('-')) {
            expr$947 = {
                type: Syntax$679.BinaryExpression,
                operator: lex$718().token.value,
                left: expr$947,
                right: parseMultiplicativeExpression$749()
            };
        }
        return expr$947;
    }
    // 11.7 Bitwise Shift Operators
    function parseShiftExpression$751() {
        var expr$948 = parseAdditiveExpression$750();
        while (match$726('<<') || match$726('>>') || match$726('>>>')) {
            expr$948 = {
                type: Syntax$679.BinaryExpression,
                operator: lex$718().token.value,
                left: expr$948,
                right: parseAdditiveExpression$750()
            };
        }
        return expr$948;
    }
    // 11.8 Relational Operators
    function parseRelationalExpression$752() {
        var expr$949, previousAllowIn$950;
        previousAllowIn$950 = state$690.allowIn;
        state$690.allowIn = true;
        expr$949 = parseShiftExpression$751();
        while (match$726('<') || match$726('>') || match$726('<=') || match$726('>=') || previousAllowIn$950 && matchKeyword$727('in') || matchKeyword$727('instanceof')) {
            expr$949 = {
                type: Syntax$679.BinaryExpression,
                operator: lex$718().token.value,
                left: expr$949,
                right: parseRelationalExpression$752()
            };
        }
        state$690.allowIn = previousAllowIn$950;
        return expr$949;
    }
    // 11.9 Equality Operators
    function parseEqualityExpression$753() {
        var expr$951 = parseRelationalExpression$752();
        while (match$726('==') || match$726('!=') || match$726('===') || match$726('!==')) {
            expr$951 = {
                type: Syntax$679.BinaryExpression,
                operator: lex$718().token.value,
                left: expr$951,
                right: parseRelationalExpression$752()
            };
        }
        return expr$951;
    }
    // 11.10 Binary Bitwise Operators
    function parseBitwiseANDExpression$754() {
        var expr$952 = parseEqualityExpression$753();
        while (match$726('&')) {
            lex$718();
            expr$952 = {
                type: Syntax$679.BinaryExpression,
                operator: '&',
                left: expr$952,
                right: parseEqualityExpression$753()
            };
        }
        return expr$952;
    }
    function parseBitwiseXORExpression$755() {
        var expr$953 = parseBitwiseANDExpression$754();
        while (match$726('^')) {
            lex$718();
            expr$953 = {
                type: Syntax$679.BinaryExpression,
                operator: '^',
                left: expr$953,
                right: parseBitwiseANDExpression$754()
            };
        }
        return expr$953;
    }
    function parseBitwiseORExpression$756() {
        var expr$954 = parseBitwiseXORExpression$755();
        while (match$726('|')) {
            lex$718();
            expr$954 = {
                type: Syntax$679.BinaryExpression,
                operator: '|',
                left: expr$954,
                right: parseBitwiseXORExpression$755()
            };
        }
        return expr$954;
    }
    // 11.11 Binary Logical Operators
    function parseLogicalANDExpression$757() {
        var expr$955 = parseBitwiseORExpression$756();
        while (match$726('&&')) {
            lex$718();
            expr$955 = {
                type: Syntax$679.LogicalExpression,
                operator: '&&',
                left: expr$955,
                right: parseBitwiseORExpression$756()
            };
        }
        return expr$955;
    }
    function parseLogicalORExpression$758() {
        var expr$956 = parseLogicalANDExpression$757();
        while (match$726('||')) {
            lex$718();
            expr$956 = {
                type: Syntax$679.LogicalExpression,
                operator: '||',
                left: expr$956,
                right: parseLogicalANDExpression$757()
            };
        }
        return expr$956;
    }
    // 11.12 Conditional Operator
    function parseConditionalExpression$759() {
        var expr$957, previousAllowIn$958, consequent$959;
        expr$957 = parseLogicalORExpression$758();
        if (match$726('?')) {
            lex$718();
            previousAllowIn$958 = state$690.allowIn;
            state$690.allowIn = true;
            consequent$959 = parseAssignmentExpression$760();
            state$690.allowIn = previousAllowIn$958;
            expect$724(':');
            expr$957 = {
                type: Syntax$679.ConditionalExpression,
                test: expr$957,
                consequent: consequent$959,
                alternate: parseAssignmentExpression$760()
            };
        }
        return expr$957;
    }
    // 11.13 Assignment Operators
    function parseAssignmentExpression$760() {
        var expr$960;
        expr$960 = parseConditionalExpression$759();
        if (matchAssign$728()) {
            // LeftHandSideExpression
            if (!isLeftHandSide$730(expr$960)) {
                throwError$721({}, Messages$681.InvalidLHSInAssignment);
            }
            // 11.13.1
            if (strict$684 && expr$960.type === Syntax$679.Identifier && isRestrictedWord$705(expr$960.name)) {
                throwError$721({}, Messages$681.StrictLHSAssignment);
            }
            expr$960 = {
                type: Syntax$679.AssignmentExpression,
                operator: lex$718().token.value,
                left: expr$960,
                right: parseAssignmentExpression$760()
            };
        }
        return expr$960;
    }
    // 11.14 Comma Operator
    function parseExpression$761() {
        var expr$961 = parseAssignmentExpression$760();
        if (match$726(',')) {
            expr$961 = {
                type: Syntax$679.SequenceExpression,
                expressions: [expr$961]
            };
            while (index$685 < length$688) {
                if (!match$726(',')) {
                    break;
                }
                lex$718();
                expr$961.expressions.push(parseAssignmentExpression$760());
            }
        }
        return expr$961;
    }
    // 12.1 Block
    function parseStatementList$762() {
        var list$962 = [], statement$963;
        while (index$685 < length$688) {
            if (match$726('}')) {
                break;
            }
            statement$963 = parseSourceElement$790();
            if (typeof statement$963 === 'undefined') {
                break;
            }
            list$962.push(statement$963);
        }
        return list$962;
    }
    function parseBlock$763() {
        var block$964;
        expect$724('{');
        block$964 = parseStatementList$762();
        expect$724('}');
        return {
            type: Syntax$679.BlockStatement,
            body: block$964
        };
    }
    // 12.2 Variable Statement
    function parseVariableIdentifier$764() {
        var stx$965 = lex$718(), token$966 = stx$965.token;
        if (token$966.type !== Token$677.Identifier) {
            throwUnexpected$723(token$966);
        }
        var name$967 = expander$676.resolve(stx$965);
        return {
            type: Syntax$679.Identifier,
            name: name$967
        };
    }
    function parseVariableDeclaration$765(kind$968) {
        var id$969 = parseVariableIdentifier$764(), init$970 = null;
        // 12.2.1
        if (strict$684 && isRestrictedWord$705(id$969.name)) {
            throwErrorTolerant$722({}, Messages$681.StrictVarName);
        }
        if (kind$968 === 'const') {
            expect$724('=');
            init$970 = parseAssignmentExpression$760();
        } else if (match$726('=')) {
            lex$718();
            init$970 = parseAssignmentExpression$760();
        }
        return {
            type: Syntax$679.VariableDeclarator,
            id: id$969,
            init: init$970
        };
    }
    function parseVariableDeclarationList$766(kind$971) {
        var list$972 = [];
        while (index$685 < length$688) {
            list$972.push(parseVariableDeclaration$765(kind$971));
            if (!match$726(',')) {
                break;
            }
            lex$718();
        }
        return list$972;
    }
    function parseVariableStatement$767() {
        var declarations$973;
        expectKeyword$725('var');
        declarations$973 = parseVariableDeclarationList$766();
        consumeSemicolon$729();
        return {
            type: Syntax$679.VariableDeclaration,
            declarations: declarations$973,
            kind: 'var'
        };
    }
    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration$768(kind$974) {
        var declarations$975;
        expectKeyword$725(kind$974);
        declarations$975 = parseVariableDeclarationList$766(kind$974);
        consumeSemicolon$729();
        return {
            type: Syntax$679.VariableDeclaration,
            declarations: declarations$975,
            kind: kind$974
        };
    }
    // 12.3 Empty Statement
    function parseEmptyStatement$769() {
        expect$724(';');
        return { type: Syntax$679.EmptyStatement };
    }
    // 12.4 Expression Statement
    function parseExpressionStatement$770() {
        var expr$976 = parseExpression$761();
        consumeSemicolon$729();
        return {
            type: Syntax$679.ExpressionStatement,
            expression: expr$976
        };
    }
    // 12.5 If statement
    function parseIfStatement$771() {
        var test$977, consequent$978, alternate$979;
        expectKeyword$725('if');
        expect$724('(');
        test$977 = parseExpression$761();
        expect$724(')');
        consequent$978 = parseStatement$786();
        if (matchKeyword$727('else')) {
            lex$718();
            alternate$979 = parseStatement$786();
        } else {
            alternate$979 = null;
        }
        return {
            type: Syntax$679.IfStatement,
            test: test$977,
            consequent: consequent$978,
            alternate: alternate$979
        };
    }
    // 12.6 Iteration Statements
    function parseDoWhileStatement$772() {
        var body$980, test$981, oldInIteration$982;
        expectKeyword$725('do');
        oldInIteration$982 = state$690.inIteration;
        state$690.inIteration = true;
        body$980 = parseStatement$786();
        state$690.inIteration = oldInIteration$982;
        expectKeyword$725('while');
        expect$724('(');
        test$981 = parseExpression$761();
        expect$724(')');
        if (match$726(';')) {
            lex$718();
        }
        return {
            type: Syntax$679.DoWhileStatement,
            body: body$980,
            test: test$981
        };
    }
    function parseWhileStatement$773() {
        var test$983, body$984, oldInIteration$985;
        expectKeyword$725('while');
        expect$724('(');
        test$983 = parseExpression$761();
        expect$724(')');
        oldInIteration$985 = state$690.inIteration;
        state$690.inIteration = true;
        body$984 = parseStatement$786();
        state$690.inIteration = oldInIteration$985;
        return {
            type: Syntax$679.WhileStatement,
            test: test$983,
            body: body$984
        };
    }
    function parseForVariableDeclaration$774() {
        var token$986 = lex$718().token;
        return {
            type: Syntax$679.VariableDeclaration,
            declarations: parseVariableDeclarationList$766(),
            kind: token$986.value
        };
    }
    function parseForStatement$775() {
        var init$987, test$988, update$989, left$990, right$991, body$992, oldInIteration$993;
        init$987 = test$988 = update$989 = null;
        expectKeyword$725('for');
        expect$724('(');
        if (match$726(';')) {
            lex$718();
        } else {
            if (matchKeyword$727('var') || matchKeyword$727('let')) {
                state$690.allowIn = false;
                init$987 = parseForVariableDeclaration$774();
                state$690.allowIn = true;
                if (init$987.declarations.length === 1 && matchKeyword$727('in')) {
                    lex$718();
                    left$990 = init$987;
                    right$991 = parseExpression$761();
                    init$987 = null;
                }
            } else {
                state$690.allowIn = false;
                init$987 = parseExpression$761();
                state$690.allowIn = true;
                if (matchKeyword$727('in')) {
                    // LeftHandSideExpression
                    if (!isLeftHandSide$730(init$987)) {
                        throwError$721({}, Messages$681.InvalidLHSInForIn);
                    }
                    lex$718();
                    left$990 = init$987;
                    right$991 = parseExpression$761();
                    init$987 = null;
                }
            }
            if (typeof left$990 === 'undefined') {
                expect$724(';');
            }
        }
        if (typeof left$990 === 'undefined') {
            if (!match$726(';')) {
                test$988 = parseExpression$761();
            }
            expect$724(';');
            if (!match$726(')')) {
                update$989 = parseExpression$761();
            }
        }
        expect$724(')');
        oldInIteration$993 = state$690.inIteration;
        state$690.inIteration = true;
        body$992 = parseStatement$786();
        state$690.inIteration = oldInIteration$993;
        if (typeof left$990 === 'undefined') {
            return {
                type: Syntax$679.ForStatement,
                init: init$987,
                test: test$988,
                update: update$989,
                body: body$992
            };
        }
        return {
            type: Syntax$679.ForInStatement,
            left: left$990,
            right: right$991,
            body: body$992,
            each: false
        };
    }
    // 12.7 The continue statement
    function parseContinueStatement$776() {
        var token$994, label$995 = null;
        expectKeyword$725('continue');
        // Optimize the most common form: 'continue;'.
        if (tokenStream$691[index$685].token.value === ';') {
            lex$718();
            if (!state$690.inIteration) {
                throwError$721({}, Messages$681.IllegalContinue);
            }
            return {
                type: Syntax$679.ContinueStatement,
                label: null
            };
        }
        if (peekLineTerminator$720()) {
            if (!state$690.inIteration) {
                throwError$721({}, Messages$681.IllegalContinue);
            }
            return {
                type: Syntax$679.ContinueStatement,
                label: null
            };
        }
        token$994 = lookahead$719().token;
        if (token$994.type === Token$677.Identifier) {
            label$995 = parseVariableIdentifier$764();
            if (!Object.prototype.hasOwnProperty.call(state$690.labelSet, label$995.name)) {
                throwError$721({}, Messages$681.UnknownLabel, label$995.name);
            }
        }
        consumeSemicolon$729();
        if (label$995 === null && !state$690.inIteration) {
            throwError$721({}, Messages$681.IllegalContinue);
        }
        return {
            type: Syntax$679.ContinueStatement,
            label: label$995
        };
    }
    // 12.8 The break statement
    function parseBreakStatement$777() {
        var token$996, label$997 = null;
        expectKeyword$725('break');
        if (peekLineTerminator$720()) {
            if (!(state$690.inIteration || state$690.inSwitch)) {
                throwError$721({}, Messages$681.IllegalBreak);
            }
            return {
                type: Syntax$679.BreakStatement,
                label: null
            };
        }
        token$996 = lookahead$719().token;
        if (token$996.type === Token$677.Identifier) {
            label$997 = parseVariableIdentifier$764();
            if (!Object.prototype.hasOwnProperty.call(state$690.labelSet, label$997.name)) {
                throwError$721({}, Messages$681.UnknownLabel, label$997.name);
            }
        }
        consumeSemicolon$729();
        if (label$997 === null && !(state$690.inIteration || state$690.inSwitch)) {
            throwError$721({}, Messages$681.IllegalBreak);
        }
        return {
            type: Syntax$679.BreakStatement,
            label: label$997
        };
    }
    // 12.9 The return statement
    function parseReturnStatement$778() {
        var token$998, argument$999 = null;
        expectKeyword$725('return');
        if (!state$690.inFunctionBody) {
            throwErrorTolerant$722({}, Messages$681.IllegalReturn);
        }
        if (peekLineTerminator$720()) {
            return {
                type: Syntax$679.ReturnStatement,
                argument: null
            };
        }
        if (!match$726(';')) {
            token$998 = lookahead$719().token;
            if (!match$726('}') && token$998.type !== Token$677.EOF) {
                argument$999 = parseExpression$761();
            }
        }
        consumeSemicolon$729();
        return {
            type: Syntax$679.ReturnStatement,
            argument: argument$999
        };
    }
    // 12.10 The with statement
    function parseWithStatement$779() {
        var object$1000, body$1001;
        if (strict$684) {
            throwErrorTolerant$722({}, Messages$681.StrictModeWith);
        }
        expectKeyword$725('with');
        expect$724('(');
        object$1000 = parseExpression$761();
        expect$724(')');
        body$1001 = parseStatement$786();
        return {
            type: Syntax$679.WithStatement,
            object: object$1000,
            body: body$1001
        };
    }
    // 12.10 The swith statement
    function parseSwitchCase$780() {
        var test$1002, consequent$1003 = [], statement$1004;
        if (matchKeyword$727('default')) {
            lex$718();
            test$1002 = null;
        } else {
            expectKeyword$725('case');
            test$1002 = parseExpression$761();
        }
        expect$724(':');
        while (index$685 < length$688) {
            if (match$726('}') || matchKeyword$727('default') || matchKeyword$727('case')) {
                break;
            }
            statement$1004 = parseStatement$786();
            if (typeof statement$1004 === 'undefined') {
                break;
            }
            consequent$1003.push(statement$1004);
        }
        return {
            type: Syntax$679.SwitchCase,
            test: test$1002,
            consequent: consequent$1003
        };
    }
    function parseSwitchStatement$781() {
        var discriminant$1005, cases$1006, oldInSwitch$1007;
        expectKeyword$725('switch');
        expect$724('(');
        discriminant$1005 = parseExpression$761();
        expect$724(')');
        expect$724('{');
        if (match$726('}')) {
            lex$718();
            return {
                type: Syntax$679.SwitchStatement,
                discriminant: discriminant$1005
            };
        }
        cases$1006 = [];
        oldInSwitch$1007 = state$690.inSwitch;
        state$690.inSwitch = true;
        while (index$685 < length$688) {
            if (match$726('}')) {
                break;
            }
            cases$1006.push(parseSwitchCase$780());
        }
        state$690.inSwitch = oldInSwitch$1007;
        expect$724('}');
        return {
            type: Syntax$679.SwitchStatement,
            discriminant: discriminant$1005,
            cases: cases$1006
        };
    }
    // 12.13 The throw statement
    function parseThrowStatement$782() {
        var argument$1008;
        expectKeyword$725('throw');
        if (peekLineTerminator$720()) {
            throwError$721({}, Messages$681.NewlineAfterThrow);
        }
        argument$1008 = parseExpression$761();
        consumeSemicolon$729();
        return {
            type: Syntax$679.ThrowStatement,
            argument: argument$1008
        };
    }
    // 12.14 The try statement
    function parseCatchClause$783() {
        var param$1009;
        expectKeyword$725('catch');
        expect$724('(');
        if (!match$726(')')) {
            param$1009 = parseExpression$761();
            // 12.14.1
            if (strict$684 && param$1009.type === Syntax$679.Identifier && isRestrictedWord$705(param$1009.name)) {
                throwErrorTolerant$722({}, Messages$681.StrictCatchVariable);
            }
        }
        expect$724(')');
        return {
            type: Syntax$679.CatchClause,
            param: param$1009,
            guard: null,
            body: parseBlock$763()
        };
    }
    function parseTryStatement$784() {
        var block$1010, handlers$1011 = [], finalizer$1012 = null;
        expectKeyword$725('try');
        block$1010 = parseBlock$763();
        if (matchKeyword$727('catch')) {
            handlers$1011.push(parseCatchClause$783());
        }
        if (matchKeyword$727('finally')) {
            lex$718();
            finalizer$1012 = parseBlock$763();
        }
        if (handlers$1011.length === 0 && !finalizer$1012) {
            throwError$721({}, Messages$681.NoCatchOrFinally);
        }
        return {
            type: Syntax$679.TryStatement,
            block: block$1010,
            handlers: handlers$1011,
            finalizer: finalizer$1012
        };
    }
    // 12.15 The debugger statement
    function parseDebuggerStatement$785() {
        expectKeyword$725('debugger');
        consumeSemicolon$729();
        return { type: Syntax$679.DebuggerStatement };
    }
    // 12 Statements
    function parseStatement$786() {
        var token$1013 = lookahead$719().token, expr$1014, labeledBody$1015;
        if (token$1013.type === Token$677.EOF) {
            throwUnexpected$723(token$1013);
        }
        if (token$1013.type === Token$677.Punctuator) {
            switch (token$1013.value) {
            case ';':
                return parseEmptyStatement$769();
            case '{':
                return parseBlock$763();
            case '(':
                return parseExpressionStatement$770();
            default:
                break;
            }
        }
        if (token$1013.type === Token$677.Keyword) {
            switch (token$1013.value) {
            case 'break':
                return parseBreakStatement$777();
            case 'continue':
                return parseContinueStatement$776();
            case 'debugger':
                return parseDebuggerStatement$785();
            case 'do':
                return parseDoWhileStatement$772();
            case 'for':
                return parseForStatement$775();
            case 'function':
                return parseFunctionDeclaration$788();
            case 'if':
                return parseIfStatement$771();
            case 'return':
                return parseReturnStatement$778();
            case 'switch':
                return parseSwitchStatement$781();
            case 'throw':
                return parseThrowStatement$782();
            case 'try':
                return parseTryStatement$784();
            case 'var':
                return parseVariableStatement$767();
            case 'while':
                return parseWhileStatement$773();
            case 'with':
                return parseWithStatement$779();
            default:
                break;
            }
        }
        expr$1014 = parseExpression$761();
        // 12.12 Labelled Statements
        if (expr$1014.type === Syntax$679.Identifier && match$726(':')) {
            lex$718();
            if (Object.prototype.hasOwnProperty.call(state$690.labelSet, expr$1014.name)) {
                throwError$721({}, Messages$681.Redeclaration, 'Label', expr$1014.name);
            }
            state$690.labelSet[expr$1014.name] = true;
            labeledBody$1015 = parseStatement$786();
            delete state$690.labelSet[expr$1014.name];
            return {
                type: Syntax$679.LabeledStatement,
                label: expr$1014,
                body: labeledBody$1015
            };
        }
        consumeSemicolon$729();
        return {
            type: Syntax$679.ExpressionStatement,
            expression: expr$1014
        };
    }
    // 13 Function Definition
    function parseFunctionSourceElements$787() {
        var sourceElement$1016, sourceElements$1017 = [], token$1018, directive$1019, firstRestricted$1020, oldLabelSet$1021, oldInIteration$1022, oldInSwitch$1023, oldInFunctionBody$1024;
        expect$724('{');
        while (index$685 < length$688) {
            token$1018 = lookahead$719().token;
            if (token$1018.type !== Token$677.StringLiteral) {
                break;
            }
            sourceElement$1016 = parseSourceElement$790();
            sourceElements$1017.push(sourceElement$1016);
            if (sourceElement$1016.expression.type !== Syntax$679.Literal) {
                // this is not directive
                break;
            }
            directive$1019 = sliceSource$695(token$1018.range[0] + 1, token$1018.range[1] - 1);
            if (directive$1019 === 'use strict') {
                strict$684 = true;
                if (firstRestricted$1020) {
                    throwError$721(firstRestricted$1020, Messages$681.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1020 && token$1018.octal) {
                    firstRestricted$1020 = token$1018;
                }
            }
        }
        oldLabelSet$1021 = state$690.labelSet;
        oldInIteration$1022 = state$690.inIteration;
        oldInSwitch$1023 = state$690.inSwitch;
        oldInFunctionBody$1024 = state$690.inFunctionBody;
        state$690.labelSet = {};
        state$690.inIteration = false;
        state$690.inSwitch = false;
        state$690.inFunctionBody = true;
        while (index$685 < length$688) {
            if (match$726('}')) {
                break;
            }
            sourceElement$1016 = parseSourceElement$790();
            if (typeof sourceElement$1016 === 'undefined') {
                break;
            }
            sourceElements$1017.push(sourceElement$1016);
        }
        expect$724('}');
        state$690.labelSet = oldLabelSet$1021;
        state$690.inIteration = oldInIteration$1022;
        state$690.inSwitch = oldInSwitch$1023;
        state$690.inFunctionBody = oldInFunctionBody$1024;
        return {
            type: Syntax$679.BlockStatement,
            body: sourceElements$1017
        };
    }
    function parseFunctionDeclaration$788() {
        var id$1025, param$1026, params$1027 = [], body$1028, token$1029, firstRestricted$1030, message$1031, previousStrict$1032, paramSet$1033;
        expectKeyword$725('function');
        token$1029 = lookahead$719().token;
        id$1025 = parseVariableIdentifier$764();
        if (strict$684) {
            if (isRestrictedWord$705(token$1029.value)) {
                throwError$721(token$1029, Messages$681.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$705(token$1029.value)) {
                firstRestricted$1030 = token$1029;
                message$1031 = Messages$681.StrictFunctionName;
            } else if (isStrictModeReservedWord$704(token$1029.value)) {
                firstRestricted$1030 = token$1029;
                message$1031 = Messages$681.StrictReservedWord;
            }
        }
        expect$724('(');
        if (!match$726(')')) {
            paramSet$1033 = {};
            while (index$685 < length$688) {
                token$1029 = lookahead$719().token;
                param$1026 = parseVariableIdentifier$764();
                if (strict$684) {
                    if (isRestrictedWord$705(token$1029.value)) {
                        throwError$721(token$1029, Messages$681.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$1033, token$1029.value)) {
                        throwError$721(token$1029, Messages$681.StrictParamDupe);
                    }
                } else if (!firstRestricted$1030) {
                    if (isRestrictedWord$705(token$1029.value)) {
                        firstRestricted$1030 = token$1029;
                        message$1031 = Messages$681.StrictParamName;
                    } else if (isStrictModeReservedWord$704(token$1029.value)) {
                        firstRestricted$1030 = token$1029;
                        message$1031 = Messages$681.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$1033, token$1029.value)) {
                        firstRestricted$1030 = token$1029;
                        message$1031 = Messages$681.StrictParamDupe;
                    }
                }
                params$1027.push(param$1026);
                paramSet$1033[param$1026.name] = true;
                if (match$726(')')) {
                    break;
                }
                expect$724(',');
            }
        }
        expect$724(')');
        previousStrict$1032 = strict$684;
        body$1028 = parseFunctionSourceElements$787();
        if (strict$684 && firstRestricted$1030) {
            throwError$721(firstRestricted$1030, message$1031);
        }
        strict$684 = previousStrict$1032;
        return {
            type: Syntax$679.FunctionDeclaration,
            id: id$1025,
            params: params$1027,
            body: body$1028
        };
    }
    function parseFunctionExpression$789() {
        var token$1034, id$1035 = null, firstRestricted$1036, message$1037, param$1038, params$1039 = [], body$1040, previousStrict$1041, paramSet$1042;
        expectKeyword$725('function');
        if (!match$726('(')) {
            token$1034 = lookahead$719().token;
            id$1035 = parseVariableIdentifier$764();
            if (strict$684) {
                if (isRestrictedWord$705(token$1034.value)) {
                    throwError$721(token$1034, Messages$681.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$705(token$1034.value)) {
                    firstRestricted$1036 = token$1034;
                    message$1037 = Messages$681.StrictFunctionName;
                } else if (isStrictModeReservedWord$704(token$1034.value)) {
                    firstRestricted$1036 = token$1034;
                    message$1037 = Messages$681.StrictReservedWord;
                }
            }
        }
        expect$724('(');
        if (!match$726(')')) {
            paramSet$1042 = {};
            while (index$685 < length$688) {
                token$1034 = lookahead$719().token;
                param$1038 = parseVariableIdentifier$764();
                if (strict$684) {
                    if (isRestrictedWord$705(token$1034.value)) {
                        throwError$721(token$1034, Messages$681.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$1042, token$1034.value)) {
                        throwError$721(token$1034, Messages$681.StrictParamDupe);
                    }
                } else if (!firstRestricted$1036) {
                    if (isRestrictedWord$705(token$1034.value)) {
                        firstRestricted$1036 = token$1034;
                        message$1037 = Messages$681.StrictParamName;
                    } else if (isStrictModeReservedWord$704(token$1034.value)) {
                        firstRestricted$1036 = token$1034;
                        message$1037 = Messages$681.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$1042, token$1034.value)) {
                        firstRestricted$1036 = token$1034;
                        message$1037 = Messages$681.StrictParamDupe;
                    }
                }
                params$1039.push(param$1038);
                paramSet$1042[param$1038.name] = true;
                if (match$726(')')) {
                    break;
                }
                expect$724(',');
            }
        }
        expect$724(')');
        previousStrict$1041 = strict$684;
        body$1040 = parseFunctionSourceElements$787();
        if (strict$684 && firstRestricted$1036) {
            throwError$721(firstRestricted$1036, message$1037);
        }
        strict$684 = previousStrict$1041;
        return {
            type: Syntax$679.FunctionExpression,
            id: id$1035,
            params: params$1039,
            body: body$1040
        };
    }
    // 14 Program
    function parseSourceElement$790() {
        var token$1043 = lookahead$719().token;
        if (token$1043.type === Token$677.Keyword) {
            switch (token$1043.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$768(token$1043.value);
            case 'function':
                return parseFunctionDeclaration$788();
            default:
                return parseStatement$786();
            }
        }
        if (token$1043.type !== Token$677.EOF) {
            return parseStatement$786();
        }
    }
    function parseSourceElements$791() {
        var sourceElement$1044, sourceElements$1045 = [], token$1046, directive$1047, firstRestricted$1048;
        while (index$685 < length$688) {
            token$1046 = lookahead$719();
            if (token$1046.type !== Token$677.StringLiteral) {
                break;
            }
            sourceElement$1044 = parseSourceElement$790();
            sourceElements$1045.push(sourceElement$1044);
            if (sourceElement$1044.expression.type !== Syntax$679.Literal) {
                // this is not directive
                break;
            }
            directive$1047 = sliceSource$695(token$1046.range[0] + 1, token$1046.range[1] - 1);
            if (directive$1047 === 'use strict') {
                strict$684 = true;
                if (firstRestricted$1048) {
                    throwError$721(firstRestricted$1048, Messages$681.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$1048 && token$1046.octal) {
                    firstRestricted$1048 = token$1046;
                }
            }
        }
        while (index$685 < length$688) {
            sourceElement$1044 = parseSourceElement$790();
            if (typeof sourceElement$1044 === 'undefined') {
                break;
            }
            sourceElements$1045.push(sourceElement$1044);
        }
        return sourceElements$1045;
    }
    function parseProgram$792() {
        var program$1049;
        strict$684 = false;
        program$1049 = {
            type: Syntax$679.Program,
            body: parseSourceElements$791()
        };
        return program$1049;
    }
    // The following functions are needed only when the option to preserve
    // the comments is active.
    function addComment$793(start$1050, end$1051, type$1052, value$1053) {
        assert$693(typeof start$1050 === 'number', 'Comment must have valid position');
        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra$692.comments.length > 0) {
            if (extra$692.comments[extra$692.comments.length - 1].range[1] > start$1050) {
                return;
            }
        }
        extra$692.comments.push({
            range: [
                start$1050,
                end$1051
            ],
            type: type$1052,
            value: value$1053
        });
    }
    function scanComment$794() {
        var comment$1054, ch$1055, start$1056, blockComment$1057, lineComment$1058;
        comment$1054 = '';
        blockComment$1057 = false;
        lineComment$1058 = false;
        while (index$685 < length$688) {
            ch$1055 = source$683[index$685];
            if (lineComment$1058) {
                ch$1055 = nextChar$707();
                if (index$685 >= length$688) {
                    lineComment$1058 = false;
                    comment$1054 += ch$1055;
                    addComment$793(start$1056, index$685, 'Line', comment$1054);
                } else if (isLineTerminator$700(ch$1055)) {
                    lineComment$1058 = false;
                    addComment$793(start$1056, index$685, 'Line', comment$1054);
                    if (ch$1055 === '\r' && source$683[index$685] === '\n') {
                        ++index$685;
                    }
                    ++lineNumber$686;
                    lineStart$687 = index$685;
                    comment$1054 = '';
                } else {
                    comment$1054 += ch$1055;
                }
            } else if (blockComment$1057) {
                if (isLineTerminator$700(ch$1055)) {
                    if (ch$1055 === '\r' && source$683[index$685 + 1] === '\n') {
                        ++index$685;
                        comment$1054 += '\r\n';
                    } else {
                        comment$1054 += ch$1055;
                    }
                    ++lineNumber$686;
                    ++index$685;
                    lineStart$687 = index$685;
                    if (index$685 >= length$688) {
                        throwError$721({}, Messages$681.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$1055 = nextChar$707();
                    if (index$685 >= length$688) {
                        throwError$721({}, Messages$681.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$1054 += ch$1055;
                    if (ch$1055 === '*') {
                        ch$1055 = source$683[index$685];
                        if (ch$1055 === '/') {
                            comment$1054 = comment$1054.substr(0, comment$1054.length - 1);
                            blockComment$1057 = false;
                            ++index$685;
                            addComment$793(start$1056, index$685, 'Block', comment$1054);
                            comment$1054 = '';
                        }
                    }
                }
            } else if (ch$1055 === '/') {
                ch$1055 = source$683[index$685 + 1];
                if (ch$1055 === '/') {
                    start$1056 = index$685;
                    index$685 += 2;
                    lineComment$1058 = true;
                } else if (ch$1055 === '*') {
                    start$1056 = index$685;
                    index$685 += 2;
                    blockComment$1057 = true;
                    if (index$685 >= length$688) {
                        throwError$721({}, Messages$681.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$699(ch$1055)) {
                ++index$685;
            } else if (isLineTerminator$700(ch$1055)) {
                ++index$685;
                if (ch$1055 === '\r' && source$683[index$685] === '\n') {
                    ++index$685;
                }
                ++lineNumber$686;
                lineStart$687 = index$685;
            } else {
                break;
            }
        }
    }
    function collectToken$795() {
        var token$1059 = extra$692.advance(), range$1060, value$1061;
        if (token$1059.type !== Token$677.EOF) {
            range$1060 = [
                token$1059.range[0],
                token$1059.range[1]
            ];
            value$1061 = sliceSource$695(token$1059.range[0], token$1059.range[1]);
            extra$692.tokens.push({
                type: TokenName$678[token$1059.type],
                value: value$1061,
                lineNumber: lineNumber$686,
                lineStart: lineStart$687,
                range: range$1060
            });
        }
        return token$1059;
    }
    function collectRegex$796() {
        var pos$1062, regex$1063, token$1064;
        skipComment$709();
        pos$1062 = index$685;
        regex$1063 = extra$692.scanRegExp();
        // Pop the previous token, which is likely '/' or '/='
        if (extra$692.tokens.length > 0) {
            token$1064 = extra$692.tokens[extra$692.tokens.length - 1];
            if (token$1064.range[0] === pos$1062 && token$1064.type === 'Punctuator') {
                if (token$1064.value === '/' || token$1064.value === '/=') {
                    extra$692.tokens.pop();
                }
            }
        }
        extra$692.tokens.push({
            type: 'RegularExpression',
            value: regex$1063.literal,
            range: [
                pos$1062,
                index$685
            ],
            lineStart: token$1064.lineStart,
            lineNumber: token$1064.lineNumber
        });
        return regex$1063;
    }
    function createLiteral$797(token$1065) {
        if (Array.isArray(token$1065)) {
            return {
                type: Syntax$679.Literal,
                value: token$1065
            };
        }
        return {
            type: Syntax$679.Literal,
            value: token$1065.value,
            lineStart: token$1065.lineStart,
            lineNumber: token$1065.lineNumber
        };
    }
    function createRawLiteral$798(token$1066) {
        return {
            type: Syntax$679.Literal,
            value: token$1066.value,
            raw: sliceSource$695(token$1066.range[0], token$1066.range[1]),
            lineStart: token$1066.lineStart,
            lineNumber: token$1066.lineNumber
        };
    }
    function wrapTrackingFunction$799(range$1067, loc$1068) {
        return function (parseFunction$1069) {
            function isBinary$1070(node$1072) {
                return node$1072.type === Syntax$679.LogicalExpression || node$1072.type === Syntax$679.BinaryExpression;
            }
            function visit$1071(node$1073) {
                if (isBinary$1070(node$1073.left)) {
                    visit$1071(node$1073.left);
                }
                if (isBinary$1070(node$1073.right)) {
                    visit$1071(node$1073.right);
                }
                if (range$1067 && typeof node$1073.range === 'undefined') {
                    node$1073.range = [
                        node$1073.left.range[0],
                        node$1073.right.range[1]
                    ];
                }
                if (loc$1068 && typeof node$1073.loc === 'undefined') {
                    node$1073.loc = {
                        start: node$1073.left.loc.start,
                        end: node$1073.right.loc.end
                    };
                }
            }
            return function () {
                var node$1074, rangeInfo$1075, locInfo$1076;
                // skipComment();
                var curr$1077 = tokenStream$691[index$685].token;
                rangeInfo$1075 = [
                    curr$1077.range[0],
                    0
                ];
                locInfo$1076 = {
                    start: {
                        line: curr$1077.sm_lineNumber,
                        column: curr$1077.range[0] - curr$1077.sm_lineStart
                    }
                };
                node$1074 = parseFunction$1069.apply(null, arguments);
                if (typeof node$1074 !== 'undefined') {
                    var last$1078 = tokenStream$691[index$685].token;
                    if (range$1067) {
                        rangeInfo$1075[1] = last$1078.range[1];
                        node$1074.range = rangeInfo$1075;
                    }
                    if (loc$1068) {
                        locInfo$1076.end = {
                            line: last$1078.sm_lineNumber,
                            column: last$1078.range[0] - curr$1077.sm_lineStart
                        };
                        node$1074.loc = locInfo$1076;
                    }
                    if (isBinary$1070(node$1074)) {
                        visit$1071(node$1074);
                    }
                    if (node$1074.type === Syntax$679.MemberExpression) {
                        if (typeof node$1074.object.range !== 'undefined') {
                            node$1074.range[0] = node$1074.object.range[0];
                        }
                        if (typeof node$1074.object.loc !== 'undefined') {
                            node$1074.loc.start = node$1074.object.loc.start;
                        }
                    }
                    if (node$1074.type === Syntax$679.CallExpression) {
                        if (typeof node$1074.callee.range !== 'undefined') {
                            node$1074.range[0] = node$1074.callee.range[0];
                        }
                        if (typeof node$1074.callee.loc !== 'undefined') {
                            node$1074.loc.start = node$1074.callee.loc.start;
                        }
                    }
                    if (node$1074.type !== Syntax$679.Program) {
                        if (curr$1077.leadingComments) {
                            node$1074.leadingComments = curr$1077.leadingComments;
                        }
                        if (curr$1077.trailingComments) {
                            node$1074.trailingComments = curr$1077.trailingComments;
                        }
                    }
                    return node$1074;
                }
            };
        };
    }
    function patch$800() {
        var wrapTracking$1079;
        if (extra$692.comments) {
            extra$692.skipComment = skipComment$709;
            skipComment$709 = scanComment$794;
        }
        if (extra$692.raw) {
            extra$692.createLiteral = createLiteral$797;
            createLiteral$797 = createRawLiteral$798;
        }
        if (extra$692.range || extra$692.loc) {
            wrapTracking$1079 = wrapTrackingFunction$799(extra$692.range, extra$692.loc);
            extra$692.parseAdditiveExpression = parseAdditiveExpression$750;
            extra$692.parseAssignmentExpression = parseAssignmentExpression$760;
            extra$692.parseBitwiseANDExpression = parseBitwiseANDExpression$754;
            extra$692.parseBitwiseORExpression = parseBitwiseORExpression$756;
            extra$692.parseBitwiseXORExpression = parseBitwiseXORExpression$755;
            extra$692.parseBlock = parseBlock$763;
            extra$692.parseFunctionSourceElements = parseFunctionSourceElements$787;
            extra$692.parseCallMember = parseCallMember$741;
            extra$692.parseCatchClause = parseCatchClause$783;
            extra$692.parseComputedMember = parseComputedMember$740;
            extra$692.parseConditionalExpression = parseConditionalExpression$759;
            extra$692.parseConstLetDeclaration = parseConstLetDeclaration$768;
            extra$692.parseEqualityExpression = parseEqualityExpression$753;
            extra$692.parseExpression = parseExpression$761;
            extra$692.parseForVariableDeclaration = parseForVariableDeclaration$774;
            extra$692.parseFunctionDeclaration = parseFunctionDeclaration$788;
            extra$692.parseFunctionExpression = parseFunctionExpression$789;
            extra$692.parseLogicalANDExpression = parseLogicalANDExpression$757;
            extra$692.parseLogicalORExpression = parseLogicalORExpression$758;
            extra$692.parseMultiplicativeExpression = parseMultiplicativeExpression$749;
            extra$692.parseNewExpression = parseNewExpression$742;
            extra$692.parseNonComputedMember = parseNonComputedMember$739;
            extra$692.parseNonComputedProperty = parseNonComputedProperty$738;
            extra$692.parseObjectProperty = parseObjectProperty$734;
            extra$692.parseObjectPropertyKey = parseObjectPropertyKey$733;
            extra$692.parsePostfixExpression = parsePostfixExpression$747;
            extra$692.parsePrimaryExpression = parsePrimaryExpression$736;
            extra$692.parseProgram = parseProgram$792;
            extra$692.parsePropertyFunction = parsePropertyFunction$732;
            extra$692.parseRelationalExpression = parseRelationalExpression$752;
            extra$692.parseStatement = parseStatement$786;
            extra$692.parseShiftExpression = parseShiftExpression$751;
            extra$692.parseSwitchCase = parseSwitchCase$780;
            extra$692.parseUnaryExpression = parseUnaryExpression$748;
            extra$692.parseVariableDeclaration = parseVariableDeclaration$765;
            extra$692.parseVariableIdentifier = parseVariableIdentifier$764;
            parseAdditiveExpression$750 = wrapTracking$1079(extra$692.parseAdditiveExpression);
            parseAssignmentExpression$760 = wrapTracking$1079(extra$692.parseAssignmentExpression);
            parseBitwiseANDExpression$754 = wrapTracking$1079(extra$692.parseBitwiseANDExpression);
            parseBitwiseORExpression$756 = wrapTracking$1079(extra$692.parseBitwiseORExpression);
            parseBitwiseXORExpression$755 = wrapTracking$1079(extra$692.parseBitwiseXORExpression);
            parseBlock$763 = wrapTracking$1079(extra$692.parseBlock);
            parseFunctionSourceElements$787 = wrapTracking$1079(extra$692.parseFunctionSourceElements);
            parseCallMember$741 = wrapTracking$1079(extra$692.parseCallMember);
            parseCatchClause$783 = wrapTracking$1079(extra$692.parseCatchClause);
            parseComputedMember$740 = wrapTracking$1079(extra$692.parseComputedMember);
            parseConditionalExpression$759 = wrapTracking$1079(extra$692.parseConditionalExpression);
            parseConstLetDeclaration$768 = wrapTracking$1079(extra$692.parseConstLetDeclaration);
            parseEqualityExpression$753 = wrapTracking$1079(extra$692.parseEqualityExpression);
            parseExpression$761 = wrapTracking$1079(extra$692.parseExpression);
            parseForVariableDeclaration$774 = wrapTracking$1079(extra$692.parseForVariableDeclaration);
            parseFunctionDeclaration$788 = wrapTracking$1079(extra$692.parseFunctionDeclaration);
            parseFunctionExpression$789 = wrapTracking$1079(extra$692.parseFunctionExpression);
            parseLogicalANDExpression$757 = wrapTracking$1079(extra$692.parseLogicalANDExpression);
            parseLogicalORExpression$758 = wrapTracking$1079(extra$692.parseLogicalORExpression);
            parseMultiplicativeExpression$749 = wrapTracking$1079(extra$692.parseMultiplicativeExpression);
            parseNewExpression$742 = wrapTracking$1079(extra$692.parseNewExpression);
            parseNonComputedMember$739 = wrapTracking$1079(extra$692.parseNonComputedMember);
            parseNonComputedProperty$738 = wrapTracking$1079(extra$692.parseNonComputedProperty);
            parseObjectProperty$734 = wrapTracking$1079(extra$692.parseObjectProperty);
            parseObjectPropertyKey$733 = wrapTracking$1079(extra$692.parseObjectPropertyKey);
            parsePostfixExpression$747 = wrapTracking$1079(extra$692.parsePostfixExpression);
            parsePrimaryExpression$736 = wrapTracking$1079(extra$692.parsePrimaryExpression);
            parseProgram$792 = wrapTracking$1079(extra$692.parseProgram);
            parsePropertyFunction$732 = wrapTracking$1079(extra$692.parsePropertyFunction);
            parseRelationalExpression$752 = wrapTracking$1079(extra$692.parseRelationalExpression);
            parseStatement$786 = wrapTracking$1079(extra$692.parseStatement);
            parseShiftExpression$751 = wrapTracking$1079(extra$692.parseShiftExpression);
            parseSwitchCase$780 = wrapTracking$1079(extra$692.parseSwitchCase);
            parseUnaryExpression$748 = wrapTracking$1079(extra$692.parseUnaryExpression);
            parseVariableDeclaration$765 = wrapTracking$1079(extra$692.parseVariableDeclaration);
            parseVariableIdentifier$764 = wrapTracking$1079(extra$692.parseVariableIdentifier);
        }
        if (typeof extra$692.tokens !== 'undefined') {
            extra$692.advance = advance$717;
            extra$692.scanRegExp = scanRegExp$715;
            advance$717 = collectToken$795;
            scanRegExp$715 = collectRegex$796;
        }
    }
    function unpatch$801() {
        if (typeof extra$692.skipComment === 'function') {
            skipComment$709 = extra$692.skipComment;
        }
        if (extra$692.raw) {
            createLiteral$797 = extra$692.createLiteral;
        }
        if (extra$692.range || extra$692.loc) {
            parseAdditiveExpression$750 = extra$692.parseAdditiveExpression;
            parseAssignmentExpression$760 = extra$692.parseAssignmentExpression;
            parseBitwiseANDExpression$754 = extra$692.parseBitwiseANDExpression;
            parseBitwiseORExpression$756 = extra$692.parseBitwiseORExpression;
            parseBitwiseXORExpression$755 = extra$692.parseBitwiseXORExpression;
            parseBlock$763 = extra$692.parseBlock;
            parseFunctionSourceElements$787 = extra$692.parseFunctionSourceElements;
            parseCallMember$741 = extra$692.parseCallMember;
            parseCatchClause$783 = extra$692.parseCatchClause;
            parseComputedMember$740 = extra$692.parseComputedMember;
            parseConditionalExpression$759 = extra$692.parseConditionalExpression;
            parseConstLetDeclaration$768 = extra$692.parseConstLetDeclaration;
            parseEqualityExpression$753 = extra$692.parseEqualityExpression;
            parseExpression$761 = extra$692.parseExpression;
            parseForVariableDeclaration$774 = extra$692.parseForVariableDeclaration;
            parseFunctionDeclaration$788 = extra$692.parseFunctionDeclaration;
            parseFunctionExpression$789 = extra$692.parseFunctionExpression;
            parseLogicalANDExpression$757 = extra$692.parseLogicalANDExpression;
            parseLogicalORExpression$758 = extra$692.parseLogicalORExpression;
            parseMultiplicativeExpression$749 = extra$692.parseMultiplicativeExpression;
            parseNewExpression$742 = extra$692.parseNewExpression;
            parseNonComputedMember$739 = extra$692.parseNonComputedMember;
            parseNonComputedProperty$738 = extra$692.parseNonComputedProperty;
            parseObjectProperty$734 = extra$692.parseObjectProperty;
            parseObjectPropertyKey$733 = extra$692.parseObjectPropertyKey;
            parsePrimaryExpression$736 = extra$692.parsePrimaryExpression;
            parsePostfixExpression$747 = extra$692.parsePostfixExpression;
            parseProgram$792 = extra$692.parseProgram;
            parsePropertyFunction$732 = extra$692.parsePropertyFunction;
            parseRelationalExpression$752 = extra$692.parseRelationalExpression;
            parseStatement$786 = extra$692.parseStatement;
            parseShiftExpression$751 = extra$692.parseShiftExpression;
            parseSwitchCase$780 = extra$692.parseSwitchCase;
            parseUnaryExpression$748 = extra$692.parseUnaryExpression;
            parseVariableDeclaration$765 = extra$692.parseVariableDeclaration;
            parseVariableIdentifier$764 = extra$692.parseVariableIdentifier;
        }
        if (typeof extra$692.scanRegExp === 'function') {
            advance$717 = extra$692.advance;
            scanRegExp$715 = extra$692.scanRegExp;
        }
    }
    function stringToArray$802(str$1080) {
        var length$1081 = str$1080.length, result$1082 = [], i$1083;
        for (i$1083 = 0; i$1083 < length$1081; ++i$1083) {
            result$1082[i$1083] = str$1080.charAt(i$1083);
        }
        return result$1082;
    }
    // Determines if the {} delimiter is a block or an expression.
    function blockAllowed$803(toks$1084, start$1085, inExprDelim$1086, parentIsBlock$1087) {
        var assignOps$1088 = [
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
        var binaryOps$1089 = [
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
        var unaryOps$1090 = [
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
        function back$1091(n$1092) {
            var idx$1093 = toks$1084.length - n$1092 > 0 ? toks$1084.length - n$1092 : 0;
            return toks$1084[idx$1093];
        }
        if (inExprDelim$1086 && toks$1084.length - (start$1085 + 2) <= 0) {
            // ... ({...} ...)
            return false;
        } else if (back$1091(start$1085 + 2).value === ':' && parentIsBlock$1087) {
            // ...{a:{b:{...}}}
            return true;
        } else if (isIn$694(back$1091(start$1085 + 2).value, unaryOps$1090.concat(binaryOps$1089).concat(assignOps$1088))) {
            // ... + {...}
            return false;
        } else if (back$1091(start$1085 + 2).value === 'return') {
            // ASI makes `{}` a block in:
            //
            //    return
            //    { ... }
            //
            // otherwise an object literal, so it's an
            // expression and thus / is divide
            var currLineNumber$1094 = typeof back$1091(start$1085 + 1).startLineNumber !== 'undefined' ? back$1091(start$1085 + 1).startLineNumber : back$1091(start$1085 + 1).lineNumber;
            if (back$1091(start$1085 + 2).lineNumber !== currLineNumber$1094) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$694(back$1091(start$1085 + 2).value, [
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
    function readToken$804(toks$1095, inExprDelim$1096, parentIsBlock$1097) {
        var delimiters$1098 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$1099 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$1100 = toks$1095.length - 1;
        var comments$1101, commentsLen$1102 = extra$692.comments.length;
        function back$1103(n$1107) {
            var idx$1108 = toks$1095.length - n$1107 > 0 ? toks$1095.length - n$1107 : 0;
            return toks$1095[idx$1108];
        }
        function attachComments$1104(token$1109) {
            if (comments$1101) {
                token$1109.leadingComments = comments$1101;
            }
            return token$1109;
        }
        function _advance$1105() {
            return attachComments$1104(advance$717());
        }
        function _scanRegExp$1106() {
            return attachComments$1104(scanRegExp$715());
        }
        skipComment$709();
        if (extra$692.comments.length > commentsLen$1102) {
            comments$1101 = extra$692.comments.slice(commentsLen$1102);
        }
        if (isIn$694(getChar$708(), delimiters$1098)) {
            return attachComments$1104(readDelim$805(toks$1095, inExprDelim$1096, parentIsBlock$1097));
        }
        if (getChar$708() === '/') {
            var prev$1110 = back$1103(1);
            if (prev$1110) {
                if (prev$1110.value === '()') {
                    if (isIn$694(back$1103(2).value, parenIdents$1099)) {
                        // ... if (...) / ...
                        return _scanRegExp$1106();
                    }
                    // ... (...) / ...
                    return _advance$1105();
                }
                if (prev$1110.value === '{}') {
                    if (blockAllowed$803(toks$1095, 0, inExprDelim$1096, parentIsBlock$1097)) {
                        if (back$1103(2).value === '()') {
                            // named function
                            if (back$1103(4).value === 'function') {
                                if (!blockAllowed$803(toks$1095, 3, inExprDelim$1096, parentIsBlock$1097)) {
                                    // new function foo (...) {...} / ...
                                    return _advance$1105();
                                }
                                if (toks$1095.length - 5 <= 0 && inExprDelim$1096) {
                                    // (function foo (...) {...} /...)
                                    // [function foo (...) {...} /...]
                                    return _advance$1105();
                                }
                            }
                            // unnamed function
                            if (back$1103(3).value === 'function') {
                                if (!blockAllowed$803(toks$1095, 2, inExprDelim$1096, parentIsBlock$1097)) {
                                    // new function (...) {...} / ...
                                    return _advance$1105();
                                }
                                if (toks$1095.length - 4 <= 0 && inExprDelim$1096) {
                                    // (function (...) {...} /...)
                                    // [function (...) {...} /...]
                                    return _advance$1105();
                                }
                            }
                        }
                        // ...; {...} /...
                        return _scanRegExp$1106();
                    } else {
                        // ... + {...} / ...
                        return _advance$1105();
                    }
                }
                if (prev$1110.type === Token$677.Punctuator) {
                    // ... + /...
                    return _scanRegExp$1106();
                }
                if (isKeyword$706(prev$1110.value)) {
                    // typeof /...
                    return _scanRegExp$1106();
                }
                return _advance$1105();
            }
            return _scanRegExp$1106();
        }
        return _advance$1105();
    }
    function readDelim$805(toks$1111, inExprDelim$1112, parentIsBlock$1113) {
        var startDelim$1114 = advance$717(), matchDelim$1115 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$1116 = [];
        var delimiters$1117 = [
                '(',
                '{',
                '['
            ];
        assert$693(delimiters$1117.indexOf(startDelim$1114.value) !== -1, 'Need to begin at the delimiter');
        var token$1118 = startDelim$1114;
        var startLineNumber$1119 = token$1118.lineNumber;
        var startLineStart$1120 = token$1118.lineStart;
        var startRange$1121 = token$1118.range;
        var delimToken$1122 = {};
        delimToken$1122.type = Token$677.Delimiter;
        delimToken$1122.value = startDelim$1114.value + matchDelim$1115[startDelim$1114.value];
        delimToken$1122.startLineNumber = startLineNumber$1119;
        delimToken$1122.startLineStart = startLineStart$1120;
        delimToken$1122.startRange = startRange$1121;
        var delimIsBlock$1123 = false;
        if (startDelim$1114.value === '{') {
            delimIsBlock$1123 = blockAllowed$803(toks$1111.concat(delimToken$1122), 0, inExprDelim$1112, parentIsBlock$1113);
        }
        while (index$685 <= length$688) {
            token$1118 = readToken$804(inner$1116, startDelim$1114.value === '(' || startDelim$1114.value === '[', delimIsBlock$1123);
            if (token$1118.type === Token$677.Punctuator && token$1118.value === matchDelim$1115[startDelim$1114.value]) {
                if (token$1118.leadingComments) {
                    delimToken$1122.trailingComments = token$1118.leadingComments;
                }
                break;
            } else if (token$1118.type === Token$677.EOF) {
                throwError$721({}, Messages$681.UnexpectedEOS);
            } else {
                inner$1116.push(token$1118);
            }
        }
        // at the end of the stream but the very last char wasn't the closing delimiter
        if (index$685 >= length$688 && matchDelim$1115[startDelim$1114.value] !== source$683[length$688 - 1]) {
            throwError$721({}, Messages$681.UnexpectedEOS);
        }
        var endLineNumber$1124 = token$1118.lineNumber;
        var endLineStart$1125 = token$1118.lineStart;
        var endRange$1126 = token$1118.range;
        delimToken$1122.inner = inner$1116;
        delimToken$1122.endLineNumber = endLineNumber$1124;
        delimToken$1122.endLineStart = endLineStart$1125;
        delimToken$1122.endRange = endRange$1126;
        return delimToken$1122;
    }
    ;
    // (Str) -> [...CSyntax]
    function read$806(code$1127) {
        var token$1128, tokenTree$1129 = [];
        extra$692 = {};
        extra$692.comments = [];
        patch$800();
        source$683 = code$1127;
        index$685 = 0;
        lineNumber$686 = source$683.length > 0 ? 1 : 0;
        lineStart$687 = 0;
        length$688 = source$683.length;
        buffer$689 = null;
        state$690 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$685 < length$688) {
            tokenTree$1129.push(readToken$804(tokenTree$1129, false, false));
        }
        var last$1130 = tokenTree$1129[tokenTree$1129.length - 1];
        if (last$1130 && last$1130.type !== Token$677.EOF) {
            tokenTree$1129.push({
                type: Token$677.EOF,
                value: '',
                lineNumber: last$1130.lineNumber,
                lineStart: last$1130.lineStart,
                range: [
                    index$685,
                    index$685
                ]
            });
        }
        return expander$676.tokensToSyntax(tokenTree$1129);
    }
    // (SyntaxObject, Str, {}) -> SyntaxObject
    function parse$807(code$1131) {
        var program$1132, toString$1133;
        tokenStream$691 = code$1131;
        index$685 = 0;
        length$688 = tokenStream$691.length;
        buffer$689 = null;
        state$690 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$692 = {
            range: true,
            loc: true
        };
        patch$800();
        try {
            program$1132 = parseProgram$792();
            program$1132.tokens = expander$676.syntaxToTokens(code$1131);
        } catch (e$1134) {
            throw e$1134;
        } finally {
            unpatch$801();
            extra$692 = {};
        }
        return program$1132;
    }
    exports$675.parse = parse$807;
    exports$675.read = read$806;
    exports$675.Token = Token$677;
    exports$675.assert = assert$693;
    // Deep copy.
    exports$675.Syntax = function () {
        var name$1135, types$1136 = {};
        if (typeof Object.create === 'function') {
            types$1136 = Object.create(null);
        }
        for (name$1135 in Syntax$679) {
            if (Syntax$679.hasOwnProperty(name$1135)) {
                types$1136[name$1135] = Syntax$679[name$1135];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$1136);
        }
        return types$1136;
    }();
}));