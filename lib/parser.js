(function (root$0, factory$1) {
    if (typeof exports === 'object') {
        factory$1(exports, require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$1);
    } else {
        factory$1(root$0.parser = {}, root$0.expander);
    }
}(this, function (exports$2, expander$3) {
    'use strict';
    var Token$4, TokenName$5, Syntax$6, PropertyKind$7, Messages$8, Regex$9, source$10, strict$11, index$12, lineNumber$13, lineStart$14, length$15, buffer$16, state$17, tokenStream$18, extra$19;
    Token$4 = {
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
    TokenName$5 = {};
    TokenName$5[Token$4.BooleanLiteral] = 'Boolean';
    TokenName$5[Token$4.EOF] = '<end>';
    TokenName$5[Token$4.Identifier] = 'Identifier';
    TokenName$5[Token$4.Keyword] = 'Keyword';
    TokenName$5[Token$4.NullLiteral] = 'Null';
    TokenName$5[Token$4.NumericLiteral] = 'Numeric';
    TokenName$5[Token$4.Punctuator] = 'Punctuator';
    TokenName$5[Token$4.StringLiteral] = 'String';
    TokenName$5[Token$4.Delimiter] = 'Delimiter';
    Syntax$6 = {
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
    PropertyKind$7 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    Messages$8 = {
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
    Regex$9 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    function assert(condition$20, message$21) {
        if (!condition$20) {
            throw new Error('ASSERT: ' + message$21);
        }
    }
    function isIn(el$22, list$23) {
        return list$23.indexOf(el$22) !== -1;
    }
    function sliceSource(from$24, to$25) {
        return source$10.slice(from$24, to$25);
    }
    if (typeof 'esprima'[0] === 'undefined') {
        sliceSource = function sliceArraySource(from$26, to$27) {
            return source$10.slice(from$26, to$27).join('');
        };
    }
    function isDecimalDigit(ch$28) {
        return '0123456789'.indexOf(ch$28) >= 0;
    }
    function isHexDigit(ch$29) {
        return '0123456789abcdefABCDEF'.indexOf(ch$29) >= 0;
    }
    function isOctalDigit(ch$30) {
        return '01234567'.indexOf(ch$30) >= 0;
    }
    function isWhiteSpace(ch$31) {
        return ch$31 === ' ' || ch$31 === '\t' || ch$31 === '\v' || ch$31 === '\f' || ch$31 === '\xa0' || ch$31.charCodeAt(0) >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(ch$31) >= 0;
    }
    function isLineTerminator(ch$32) {
        return ch$32 === '\n' || ch$32 === '\r' || ch$32 === '\u2028' || ch$32 === '\u2029';
    }
    function isIdentifierStart(ch$33) {
        return ch$33 === '$' || ch$33 === '_' || ch$33 === '\\' || ch$33 >= 'a' && ch$33 <= 'z' || ch$33 >= 'A' && ch$33 <= 'Z' || ch$33.charCodeAt(0) >= 128 && Regex$9.NonAsciiIdentifierStart.test(ch$33);
    }
    function isIdentifierPart(ch$34) {
        return ch$34 === '$' || ch$34 === '_' || ch$34 === '\\' || ch$34 >= 'a' && ch$34 <= 'z' || ch$34 >= 'A' && ch$34 <= 'Z' || ch$34 >= '0' && ch$34 <= '9' || ch$34.charCodeAt(0) >= 128 && Regex$9.NonAsciiIdentifierPart.test(ch$34);
    }
    function isFutureReservedWord(id$35) {
        return false;
    }
    function isStrictModeReservedWord(id$36) {
        switch (id$36) {
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
    function isRestrictedWord(id$37) {
        return id$37 === 'eval' || id$37 === 'arguments';
    }
    function isKeyword(id$38) {
        var keyword$39 = false;
        switch (id$38.length) {
        case 2:
            keyword$39 = id$38 === 'if' || id$38 === 'in' || id$38 === 'do';
            break;
        case 3:
            keyword$39 = id$38 === 'var' || id$38 === 'for' || id$38 === 'new' || id$38 === 'try';
            break;
        case 4:
            keyword$39 = id$38 === 'this' || id$38 === 'else' || id$38 === 'case' || id$38 === 'void' || id$38 === 'with';
            break;
        case 5:
            keyword$39 = id$38 === 'while' || id$38 === 'break' || id$38 === 'catch' || id$38 === 'throw';
            break;
        case 6:
            keyword$39 = id$38 === 'return' || id$38 === 'typeof' || id$38 === 'delete' || id$38 === 'switch';
            break;
        case 7:
            keyword$39 = id$38 === 'default' || id$38 === 'finally';
            break;
        case 8:
            keyword$39 = id$38 === 'function' || id$38 === 'continue' || id$38 === 'debugger';
            break;
        case 10:
            keyword$39 = id$38 === 'instanceof';
            break;
        }
        if (keyword$39) {
            return true;
        }
        switch (id$38) {
        case 'const':
            return true;
        case 'yield':
        case 'let':
            return true;
        }
        if (strict$11 && isStrictModeReservedWord(id$38)) {
            return true;
        }
        return isFutureReservedWord(id$38);
    }
    function nextChar() {
        return source$10[index$12++];
    }
    function getChar() {
        return source$10[index$12];
    }
    function skipComment() {
        var ch$40, blockComment$41, lineComment$42;
        blockComment$41 = false;
        lineComment$42 = false;
        while (index$12 < length$15) {
            ch$40 = source$10[index$12];
            if (lineComment$42) {
                ch$40 = nextChar();
                if (isLineTerminator(ch$40)) {
                    lineComment$42 = false;
                    if (ch$40 === '\r' && source$10[index$12] === '\n') {
                        ++index$12;
                    }
                    ++lineNumber$13;
                    lineStart$14 = index$12;
                }
            } else if (blockComment$41) {
                if (isLineTerminator(ch$40)) {
                    if (ch$40 === '\r' && source$10[index$12 + 1] === '\n') {
                        ++index$12;
                    }
                    ++lineNumber$13;
                    ++index$12;
                    lineStart$14 = index$12;
                    if (index$12 >= length$15) {
                        throwError({}, Messages$8.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$40 = nextChar();
                    if (index$12 >= length$15) {
                        throwError({}, Messages$8.UnexpectedToken, 'ILLEGAL');
                    }
                    if (ch$40 === '*') {
                        ch$40 = source$10[index$12];
                        if (ch$40 === '/') {
                            ++index$12;
                            blockComment$41 = false;
                        }
                    }
                }
            } else if (ch$40 === '/') {
                ch$40 = source$10[index$12 + 1];
                if (ch$40 === '/') {
                    index$12 += 2;
                    lineComment$42 = true;
                } else if (ch$40 === '*') {
                    index$12 += 2;
                    blockComment$41 = true;
                    if (index$12 >= length$15) {
                        throwError({}, Messages$8.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace(ch$40)) {
                ++index$12;
            } else if (isLineTerminator(ch$40)) {
                ++index$12;
                if (ch$40 === '\r' && source$10[index$12] === '\n') {
                    ++index$12;
                }
                ++lineNumber$13;
                lineStart$14 = index$12;
            } else {
                break;
            }
        }
    }
    function scanHexEscape(prefix$43) {
        var i$44, len$45, ch$46, code$47 = 0;
        len$45 = prefix$43 === 'u' ? 4 : 2;
        for (i$44 = 0; i$44 < len$45; ++i$44) {
            if (index$12 < length$15 && isHexDigit(source$10[index$12])) {
                ch$46 = nextChar();
                code$47 = code$47 * 16 + '0123456789abcdef'.indexOf(ch$46.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$47);
    }
    function scanIdentifier() {
        var ch$48, start$49, id$50, restore$51;
        ch$48 = source$10[index$12];
        if (!isIdentifierStart(ch$48)) {
            return;
        }
        start$49 = index$12;
        if (ch$48 === '\\') {
            ++index$12;
            if (source$10[index$12] !== 'u') {
                return;
            }
            ++index$12;
            restore$51 = index$12;
            ch$48 = scanHexEscape('u');
            if (ch$48) {
                if (ch$48 === '\\' || !isIdentifierStart(ch$48)) {
                    return;
                }
                id$50 = ch$48;
            } else {
                index$12 = restore$51;
                id$50 = 'u';
            }
        } else {
            id$50 = nextChar();
        }
        while (index$12 < length$15) {
            ch$48 = source$10[index$12];
            if (!isIdentifierPart(ch$48)) {
                break;
            }
            if (ch$48 === '\\') {
                ++index$12;
                if (source$10[index$12] !== 'u') {
                    return;
                }
                ++index$12;
                restore$51 = index$12;
                ch$48 = scanHexEscape('u');
                if (ch$48) {
                    if (ch$48 === '\\' || !isIdentifierPart(ch$48)) {
                        return;
                    }
                    id$50 += ch$48;
                } else {
                    index$12 = restore$51;
                    id$50 += 'u';
                }
            } else {
                id$50 += nextChar();
            }
        }
        if (id$50.length === 1) {
            return {
                type: Token$4.Identifier,
                value: id$50,
                lineNumber: lineNumber$13,
                lineStart: lineStart$14,
                range: [
                    start$49,
                    index$12
                ]
            };
        }
        if (isKeyword(id$50)) {
            return {
                type: Token$4.Keyword,
                value: id$50,
                lineNumber: lineNumber$13,
                lineStart: lineStart$14,
                range: [
                    start$49,
                    index$12
                ]
            };
        }
        if (id$50 === 'null') {
            return {
                type: Token$4.NullLiteral,
                value: id$50,
                lineNumber: lineNumber$13,
                lineStart: lineStart$14,
                range: [
                    start$49,
                    index$12
                ]
            };
        }
        if (id$50 === 'true' || id$50 === 'false') {
            return {
                type: Token$4.BooleanLiteral,
                value: id$50,
                lineNumber: lineNumber$13,
                lineStart: lineStart$14,
                range: [
                    start$49,
                    index$12
                ]
            };
        }
        return {
            type: Token$4.Identifier,
            value: id$50,
            lineNumber: lineNumber$13,
            lineStart: lineStart$14,
            range: [
                start$49,
                index$12
            ]
        };
    }
    function scanPunctuator() {
        var start$52 = index$12, ch1$53 = source$10[index$12], ch2, ch3, ch4;
        if (ch1$53 === ';' || ch1$53 === '{' || ch1$53 === '}') {
            ++index$12;
            return {
                type: Token$4.Punctuator,
                value: ch1$53,
                lineNumber: lineNumber$13,
                lineStart: lineStart$14,
                range: [
                    start$52,
                    index$12
                ]
            };
        }
        if (ch1$53 === ',' || ch1$53 === '(' || ch1$53 === ')') {
            ++index$12;
            return {
                type: Token$4.Punctuator,
                value: ch1$53,
                lineNumber: lineNumber$13,
                lineStart: lineStart$14,
                range: [
                    start$52,
                    index$12
                ]
            };
        }
        if (ch1$53 === '#') {
            ++index$12;
            return {
                type: Token$4.Punctuator,
                value: ch1$53,
                lineNumber: lineNumber$13,
                lineStart: lineStart$14,
                range: [
                    start$52,
                    index$12
                ]
            };
        }
        ch2 = source$10[index$12 + 1];
        if (ch1$53 === '.' && !isDecimalDigit(ch2)) {
            if (source$10[index$12 + 1] === '.' && source$10[index$12 + 2] === '.') {
                nextChar();
                nextChar();
                nextChar();
                return {
                    type: Token$4.Punctuator,
                    value: '...',
                    lineNumber: lineNumber$13,
                    lineStart: lineStart$14,
                    range: [
                        start$52,
                        index$12
                    ]
                };
            } else {
                return {
                    type: Token$4.Punctuator,
                    value: nextChar(),
                    lineNumber: lineNumber$13,
                    lineStart: lineStart$14,
                    range: [
                        start$52,
                        index$12
                    ]
                };
            }
        }
        ch3 = source$10[index$12 + 2];
        ch4 = source$10[index$12 + 3];
        if (ch1$53 === '>' && ch2 === '>' && ch3 === '>') {
            if (ch4 === '=') {
                index$12 += 4;
                return {
                    type: Token$4.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$13,
                    lineStart: lineStart$14,
                    range: [
                        start$52,
                        index$12
                    ]
                };
            }
        }
        if (ch1$53 === '=' && ch2 === '=' && ch3 === '=') {
            index$12 += 3;
            return {
                type: Token$4.Punctuator,
                value: '===',
                lineNumber: lineNumber$13,
                lineStart: lineStart$14,
                range: [
                    start$52,
                    index$12
                ]
            };
        }
        if (ch1$53 === '!' && ch2 === '=' && ch3 === '=') {
            index$12 += 3;
            return {
                type: Token$4.Punctuator,
                value: '!==',
                lineNumber: lineNumber$13,
                lineStart: lineStart$14,
                range: [
                    start$52,
                    index$12
                ]
            };
        }
        if (ch1$53 === '>' && ch2 === '>' && ch3 === '>') {
            index$12 += 3;
            return {
                type: Token$4.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$13,
                lineStart: lineStart$14,
                range: [
                    start$52,
                    index$12
                ]
            };
        }
        if (ch1$53 === '<' && ch2 === '<' && ch3 === '=') {
            index$12 += 3;
            return {
                type: Token$4.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$13,
                lineStart: lineStart$14,
                range: [
                    start$52,
                    index$12
                ]
            };
        }
        if (ch1$53 === '>' && ch2 === '>' && ch3 === '=') {
            index$12 += 3;
            return {
                type: Token$4.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$13,
                lineStart: lineStart$14,
                range: [
                    start$52,
                    index$12
                ]
            };
        }
        if (ch2 === '=') {
            if ('<>=!+-*%&|^/'.indexOf(ch1$53) >= 0) {
                index$12 += 2;
                return {
                    type: Token$4.Punctuator,
                    value: ch1$53 + ch2,
                    lineNumber: lineNumber$13,
                    lineStart: lineStart$14,
                    range: [
                        start$52,
                        index$12
                    ]
                };
            }
        }
        if (ch1$53 === ch2 && '+-<>&|'.indexOf(ch1$53) >= 0) {
            if ('+-<>&|'.indexOf(ch2) >= 0) {
                index$12 += 2;
                return {
                    type: Token$4.Punctuator,
                    value: ch1$53 + ch2,
                    lineNumber: lineNumber$13,
                    lineStart: lineStart$14,
                    range: [
                        start$52,
                        index$12
                    ]
                };
            }
        }
        if ('[]<>+-*%&|^!~?:=/'.indexOf(ch1$53) >= 0) {
            return {
                type: Token$4.Punctuator,
                value: nextChar(),
                lineNumber: lineNumber$13,
                lineStart: lineStart$14,
                range: [
                    start$52,
                    index$12
                ]
            };
        }
    }
    function scanNumericLiteral() {
        var number$54, start$55, ch$56;
        ch$56 = source$10[index$12];
        assert(isDecimalDigit(ch$56) || ch$56 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$55 = index$12;
        number$54 = '';
        if (ch$56 !== '.') {
            number$54 = nextChar();
            ch$56 = source$10[index$12];
            if (number$54 === '0') {
                if (ch$56 === 'x' || ch$56 === 'X') {
                    number$54 += nextChar();
                    while (index$12 < length$15) {
                        ch$56 = source$10[index$12];
                        if (!isHexDigit(ch$56)) {
                            break;
                        }
                        number$54 += nextChar();
                    }
                    if (number$54.length <= 2) {
                        throwError({}, Messages$8.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$12 < length$15) {
                        ch$56 = source$10[index$12];
                        if (isIdentifierStart(ch$56)) {
                            throwError({}, Messages$8.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$4.NumericLiteral,
                        value: parseInt(number$54, 16),
                        lineNumber: lineNumber$13,
                        lineStart: lineStart$14,
                        range: [
                            start$55,
                            index$12
                        ]
                    };
                } else if (isOctalDigit(ch$56)) {
                    number$54 += nextChar();
                    while (index$12 < length$15) {
                        ch$56 = source$10[index$12];
                        if (!isOctalDigit(ch$56)) {
                            break;
                        }
                        number$54 += nextChar();
                    }
                    if (index$12 < length$15) {
                        ch$56 = source$10[index$12];
                        if (isIdentifierStart(ch$56) || isDecimalDigit(ch$56)) {
                            throwError({}, Messages$8.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$4.NumericLiteral,
                        value: parseInt(number$54, 8),
                        octal: true,
                        lineNumber: lineNumber$13,
                        lineStart: lineStart$14,
                        range: [
                            start$55,
                            index$12
                        ]
                    };
                }
                if (isDecimalDigit(ch$56)) {
                    throwError({}, Messages$8.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (index$12 < length$15) {
                ch$56 = source$10[index$12];
                if (!isDecimalDigit(ch$56)) {
                    break;
                }
                number$54 += nextChar();
            }
        }
        if (ch$56 === '.') {
            number$54 += nextChar();
            while (index$12 < length$15) {
                ch$56 = source$10[index$12];
                if (!isDecimalDigit(ch$56)) {
                    break;
                }
                number$54 += nextChar();
            }
        }
        if (ch$56 === 'e' || ch$56 === 'E') {
            number$54 += nextChar();
            ch$56 = source$10[index$12];
            if (ch$56 === '+' || ch$56 === '-') {
                number$54 += nextChar();
            }
            ch$56 = source$10[index$12];
            if (isDecimalDigit(ch$56)) {
                number$54 += nextChar();
                while (index$12 < length$15) {
                    ch$56 = source$10[index$12];
                    if (!isDecimalDigit(ch$56)) {
                        break;
                    }
                    number$54 += nextChar();
                }
            } else {
                ch$56 = 'character ' + ch$56;
                if (index$12 >= length$15) {
                    ch$56 = '<end>';
                }
                throwError({}, Messages$8.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (index$12 < length$15) {
            ch$56 = source$10[index$12];
            if (isIdentifierStart(ch$56)) {
                throwError({}, Messages$8.UnexpectedToken, 'ILLEGAL');
            }
        }
        return {
            type: Token$4.NumericLiteral,
            value: parseFloat(number$54),
            lineNumber: lineNumber$13,
            lineStart: lineStart$14,
            range: [
                start$55,
                index$12
            ]
        };
    }
    function scanStringLiteral() {
        var str$57 = '', quote$58, start$59, ch$60, code$61, unescaped$62, restore$63, octal$64 = false;
        quote$58 = source$10[index$12];
        assert(quote$58 === '\'' || quote$58 === '"', 'String literal must starts with a quote');
        start$59 = index$12;
        ++index$12;
        while (index$12 < length$15) {
            ch$60 = nextChar();
            if (ch$60 === quote$58) {
                quote$58 = '';
                break;
            } else if (ch$60 === '\\') {
                ch$60 = nextChar();
                if (!isLineTerminator(ch$60)) {
                    switch (ch$60) {
                    case 'n':
                        str$57 += '\n';
                        break;
                    case 'r':
                        str$57 += '\r';
                        break;
                    case 't':
                        str$57 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        restore$63 = index$12;
                        unescaped$62 = scanHexEscape(ch$60);
                        if (unescaped$62) {
                            str$57 += unescaped$62;
                        } else {
                            index$12 = restore$63;
                            str$57 += ch$60;
                        }
                        break;
                    case 'b':
                        str$57 += '\b';
                        break;
                    case 'f':
                        str$57 += '\f';
                        break;
                    case 'v':
                        str$57 += '\v';
                        break;
                    default:
                        if (isOctalDigit(ch$60)) {
                            code$61 = '01234567'.indexOf(ch$60);
                            if (code$61 !== 0) {
                                octal$64 = true;
                            }
                            if (index$12 < length$15 && isOctalDigit(source$10[index$12])) {
                                octal$64 = true;
                                code$61 = code$61 * 8 + '01234567'.indexOf(nextChar());
                                if ('0123'.indexOf(ch$60) >= 0 && index$12 < length$15 && isOctalDigit(source$10[index$12])) {
                                    code$61 = code$61 * 8 + '01234567'.indexOf(nextChar());
                                }
                            }
                            str$57 += String.fromCharCode(code$61);
                        } else {
                            str$57 += ch$60;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$13;
                    if (ch$60 === '\r' && source$10[index$12] === '\n') {
                        ++index$12;
                    }
                }
            } else if (isLineTerminator(ch$60)) {
                break;
            } else {
                str$57 += ch$60;
            }
        }
        if (quote$58 !== '') {
            throwError({}, Messages$8.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$4.StringLiteral,
            value: str$57,
            octal: octal$64,
            lineNumber: lineNumber$13,
            lineStart: lineStart$14,
            range: [
                start$59,
                index$12
            ]
        };
    }
    function scanRegExp() {
        var str$65 = '', ch$66, start$67, pattern$68, flags$69, value$70, classMarker$71 = false, restore$72;
        buffer$16 = null;
        skipComment();
        start$67 = index$12;
        ch$66 = source$10[index$12];
        assert(ch$66 === '/', 'Regular expression literal must start with a slash');
        str$65 = nextChar();
        while (index$12 < length$15) {
            ch$66 = nextChar();
            str$65 += ch$66;
            if (classMarker$71) {
                if (ch$66 === ']') {
                    classMarker$71 = false;
                }
            } else {
                if (ch$66 === '\\') {
                    ch$66 = nextChar();
                    if (isLineTerminator(ch$66)) {
                        throwError({}, Messages$8.UnterminatedRegExp);
                    }
                    str$65 += ch$66;
                } else if (ch$66 === '/') {
                    break;
                } else if (ch$66 === '[') {
                    classMarker$71 = true;
                } else if (isLineTerminator(ch$66)) {
                    throwError({}, Messages$8.UnterminatedRegExp);
                }
            }
        }
        if (str$65.length === 1) {
            throwError({}, Messages$8.UnterminatedRegExp);
        }
        pattern$68 = str$65.substr(1, str$65.length - 2);
        flags$69 = '';
        while (index$12 < length$15) {
            ch$66 = source$10[index$12];
            if (!isIdentifierPart(ch$66)) {
                break;
            }
            ++index$12;
            if (ch$66 === '\\' && index$12 < length$15) {
                ch$66 = source$10[index$12];
                if (ch$66 === 'u') {
                    ++index$12;
                    restore$72 = index$12;
                    ch$66 = scanHexEscape('u');
                    if (ch$66) {
                        flags$69 += ch$66;
                        str$65 += '\\u';
                        for (; restore$72 < index$12; ++restore$72) {
                            str$65 += source$10[restore$72];
                        }
                    } else {
                        index$12 = restore$72;
                        flags$69 += 'u';
                        str$65 += '\\u';
                    }
                } else {
                    str$65 += '\\';
                }
            } else {
                flags$69 += ch$66;
                str$65 += ch$66;
            }
        }
        try {
            value$70 = new RegExp(pattern$68, flags$69);
        } catch (e$73) {
            throwError({}, Messages$8.InvalidRegExp);
        }
        return {
            type: Token$4.RegexLiteral,
            literal: str$65,
            value: value$70,
            lineNumber: lineNumber$13,
            lineStart: lineStart$14,
            range: [
                start$67,
                index$12
            ]
        };
    }
    function isIdentifierName(token$74) {
        return token$74.type === Token$4.Identifier || token$74.type === Token$4.Keyword || token$74.type === Token$4.BooleanLiteral || token$74.type === Token$4.NullLiteral;
    }
    function advance() {
        var ch$75, token$76;
        skipComment();
        if (index$12 >= length$15) {
            return {
                type: Token$4.EOF,
                lineNumber: lineNumber$13,
                lineStart: lineStart$14,
                range: [
                    index$12,
                    index$12
                ]
            };
        }
        ch$75 = source$10[index$12];
        token$76 = scanPunctuator();
        if (typeof token$76 !== 'undefined') {
            return token$76;
        }
        if (ch$75 === '\'' || ch$75 === '"') {
            return scanStringLiteral();
        }
        if (ch$75 === '.' || isDecimalDigit(ch$75)) {
            return scanNumericLiteral();
        }
        token$76 = scanIdentifier();
        if (typeof token$76 !== 'undefined') {
            return token$76;
        }
        throwError({}, Messages$8.UnexpectedToken, 'ILLEGAL');
    }
    function lex() {
        var token$77;
        if (buffer$16) {
            token$77 = buffer$16;
            buffer$16 = null;
            index$12++;
            return token$77;
        }
        buffer$16 = null;
        return tokenStream$18[index$12++];
    }
    function lookahead() {
        var pos$78, line$79, start$80;
        if (buffer$16 !== null) {
            return buffer$16;
        }
        buffer$16 = tokenStream$18[index$12];
        return buffer$16;
    }
    function peekLineTerminator() {
        var pos$81, line$82, start$83, found$84;
        found$84 = tokenStream$18[index$12 - 1].token.lineNumber !== tokenStream$18[index$12].token.lineNumber;
        return found$84;
    }
    function throwError(token$85, messageFormat$86) {
        var error$87, args$88 = Array.prototype.slice.call(arguments, 2), msg$89 = messageFormat$86.replace(/%(\d)/g, function (whole$90, index$91) {
                return args$88[index$91] || '';
            });
        if (typeof token$85.lineNumber === 'number') {
            error$87 = new Error('Line ' + token$85.lineNumber + ': ' + msg$89);
            error$87.lineNumber = token$85.lineNumber;
            if (token$85.range && token$85.range.length > 0) {
                error$87.index = token$85.range[0];
                error$87.column = token$85.range[0] - lineStart$14 + 1;
            }
        } else {
            error$87 = new Error('Line ' + lineNumber$13 + ': ' + msg$89);
            error$87.index = index$12;
            error$87.lineNumber = lineNumber$13;
            error$87.column = index$12 - lineStart$14 + 1;
        }
        throw error$87;
    }
    function throwErrorTolerant() {
        var error$92;
        try {
            throwError.apply(null, arguments);
        } catch (e$93) {
            if (extra$19.errors) {
                extra$19.errors.push(e$93);
            } else {
                throw e$93;
            }
        }
    }
    function throwUnexpected(token$94) {
        var s$95;
        if (token$94.type === Token$4.EOF) {
            throwError(token$94, Messages$8.UnexpectedEOS);
        }
        if (token$94.type === Token$4.NumericLiteral) {
            throwError(token$94, Messages$8.UnexpectedNumber);
        }
        if (token$94.type === Token$4.StringLiteral) {
            throwError(token$94, Messages$8.UnexpectedString);
        }
        if (token$94.type === Token$4.Identifier) {
            console.log(token$94);
            throwError(token$94, Messages$8.UnexpectedIdentifier);
        }
        if (token$94.type === Token$4.Keyword) {
            if (isFutureReservedWord(token$94.value)) {
                throwError(token$94, Messages$8.UnexpectedReserved);
            } else if (strict$11 && isStrictModeReservedWord(token$94.value)) {
                throwError(token$94, Messages$8.StrictReservedWord);
            }
            throwError(token$94, Messages$8.UnexpectedToken, token$94.value);
        }
        throwError(token$94, Messages$8.UnexpectedToken, token$94.value);
    }
    function expect(value$96) {
        var token$97 = lex().token;
        if (token$97.type !== Token$4.Punctuator || token$97.value !== value$96) {
            throwUnexpected(token$97);
        }
    }
    function expectKeyword(keyword$98) {
        var token$99 = lex().token;
        if (token$99.type !== Token$4.Keyword || token$99.value !== keyword$98) {
            throwUnexpected(token$99);
        }
    }
    function match(value$100) {
        var token$101 = lookahead().token;
        return token$101.type === Token$4.Punctuator && token$101.value === value$100;
    }
    function matchKeyword(keyword$102) {
        var token$103 = lookahead().token;
        return token$103.type === Token$4.Keyword && token$103.value === keyword$102;
    }
    function matchAssign() {
        var token$104 = lookahead().token, op$105 = token$104.value;
        if (token$104.type !== Token$4.Punctuator) {
            return false;
        }
        return op$105 === '=' || op$105 === '*=' || op$105 === '/=' || op$105 === '%=' || op$105 === '+=' || op$105 === '-=' || op$105 === '<<=' || op$105 === '>>=' || op$105 === '>>>=' || op$105 === '&=' || op$105 === '^=' || op$105 === '|=';
    }
    function consumeSemicolon() {
        var token$106, line$107;
        if (tokenStream$18[index$12].token.value === ';') {
            lex().token;
            return;
        }
        line$107 = tokenStream$18[index$12 - 1].token.lineNumber;
        token$106 = tokenStream$18[index$12].token;
        if (line$107 !== token$106.lineNumber) {
            return;
        }
        if (token$106.type !== Token$4.EOF && !match('}')) {
            throwUnexpected(token$106);
        }
        return;
    }
    function isLeftHandSide(expr$108) {
        return expr$108.type === Syntax$6.Identifier || expr$108.type === Syntax$6.MemberExpression;
    }
    function parseArrayInitialiser() {
        var elements$109 = [], undef$110;
        expect('[');
        while (!match(']')) {
            if (match(',')) {
                lex().token;
                elements$109.push(undef$110);
            } else {
                elements$109.push(parseAssignmentExpression());
                if (!match(']')) {
                    expect(',');
                }
            }
        }
        expect(']');
        return {
            type: Syntax$6.ArrayExpression,
            elements: elements$109
        };
    }
    function parsePropertyFunction(param$111, first$112) {
        var previousStrict$113, body$114;
        previousStrict$113 = strict$11;
        body$114 = parseFunctionSourceElements();
        if (first$112 && strict$11 && isRestrictedWord(param$111[0].name)) {
            throwError(first$112, Messages$8.StrictParamName);
        }
        strict$11 = previousStrict$113;
        return {
            type: Syntax$6.FunctionExpression,
            id: null,
            params: param$111,
            body: body$114
        };
    }
    function parseObjectPropertyKey() {
        var token$115 = lex().token;
        if (token$115.type === Token$4.StringLiteral || token$115.type === Token$4.NumericLiteral) {
            if (strict$11 && token$115.octal) {
                throwError(token$115, Messages$8.StrictOctalLiteral);
            }
            return createLiteral(token$115);
        }
        return {
            type: Syntax$6.Identifier,
            name: token$115.value
        };
    }
    function parseObjectProperty() {
        var token$116, key$117, id$118, param$119;
        token$116 = lookahead().token;
        if (token$116.type === Token$4.Identifier) {
            id$118 = parseObjectPropertyKey();
            if (token$116.value === 'get' && !match(':')) {
                key$117 = parseObjectPropertyKey();
                expect('(');
                expect(')');
                return {
                    type: Syntax$6.Property,
                    key: key$117,
                    value: parsePropertyFunction([]),
                    kind: 'get'
                };
            } else if (token$116.value === 'set' && !match(':')) {
                key$117 = parseObjectPropertyKey();
                expect('(');
                token$116 = lookahead().token;
                if (token$116.type !== Token$4.Identifier) {
                    throwUnexpected(lex().token);
                }
                param$119 = [parseVariableIdentifier()];
                expect(')');
                return {
                    type: Syntax$6.Property,
                    key: key$117,
                    value: parsePropertyFunction(param$119, token$116),
                    kind: 'set'
                };
            } else {
                expect(':');
                return {
                    type: Syntax$6.Property,
                    key: id$118,
                    value: parseAssignmentExpression(),
                    kind: 'init'
                };
            }
        } else if (token$116.type === Token$4.EOF || token$116.type === Token$4.Punctuator) {
            throwUnexpected(token$116);
        } else {
            key$117 = parseObjectPropertyKey();
            expect(':');
            return {
                type: Syntax$6.Property,
                key: key$117,
                value: parseAssignmentExpression(),
                kind: 'init'
            };
        }
    }
    function parseObjectInitialiser() {
        var token$120, properties$121 = [], property$122, name$123, kind$124, map$125 = {}, toString$126 = String;
        expect('{');
        while (!match('}')) {
            property$122 = parseObjectProperty();
            if (property$122.key.type === Syntax$6.Identifier) {
                name$123 = property$122.key.name;
            } else {
                name$123 = toString$126(property$122.key.value);
            }
            kind$124 = property$122.kind === 'init' ? PropertyKind$7.Data : property$122.kind === 'get' ? PropertyKind$7.Get : PropertyKind$7.Set;
            if (Object.prototype.hasOwnProperty.call(map$125, name$123)) {
                if (map$125[name$123] === PropertyKind$7.Data) {
                    if (strict$11 && kind$124 === PropertyKind$7.Data) {
                        throwErrorTolerant({}, Messages$8.StrictDuplicateProperty);
                    } else if (kind$124 !== PropertyKind$7.Data) {
                        throwError({}, Messages$8.AccessorDataProperty);
                    }
                } else {
                    if (kind$124 === PropertyKind$7.Data) {
                        throwError({}, Messages$8.AccessorDataProperty);
                    } else if (map$125[name$123] & kind$124) {
                        throwError({}, Messages$8.AccessorGetSet);
                    }
                }
                map$125[name$123] |= kind$124;
            } else {
                map$125[name$123] = kind$124;
            }
            properties$121.push(property$122);
            if (!match('}')) {
                expect(',');
            }
        }
        expect('}');
        return {
            type: Syntax$6.ObjectExpression,
            properties: properties$121
        };
    }
    function parsePrimaryExpression() {
        var expr$127, token$128 = lookahead().token, type$129 = token$128.type;
        if (type$129 === Token$4.Identifier) {
            var name$130 = extra$19.noresolve ? lex().token.value : expander$3.resolve(lex());
            return {
                type: Syntax$6.Identifier,
                name: name$130
            };
        }
        if (type$129 === Token$4.StringLiteral || type$129 === Token$4.NumericLiteral) {
            if (strict$11 && token$128.octal) {
                throwErrorTolerant(token$128, Messages$8.StrictOctalLiteral);
            }
            return createLiteral(lex().token);
        }
        if (type$129 === Token$4.Keyword) {
            if (matchKeyword('this')) {
                lex().token;
                return {type: Syntax$6.ThisExpression};
            }
            if (matchKeyword('function')) {
                return parseFunctionExpression();
            }
        }
        if (type$129 === Token$4.BooleanLiteral) {
            lex();
            token$128.value = token$128.value === 'true';
            return createLiteral(token$128);
        }
        if (type$129 === Token$4.NullLiteral) {
            lex();
            token$128.value = null;
            return createLiteral(token$128);
        }
        if (match('[')) {
            return parseArrayInitialiser();
        }
        if (match('{')) {
            return parseObjectInitialiser();
        }
        if (match('(')) {
            lex();
            state$17.lastParenthesized = expr$127 = parseExpression();
            expect(')');
            return expr$127;
        }
        if (token$128.value instanceof RegExp) {
            return createLiteral(lex().token);
        }
        return throwUnexpected(lex().token);
    }
    function parseArguments() {
        var args$131 = [];
        expect('(');
        if (!match(')')) {
            while (index$12 < length$15) {
                args$131.push(parseAssignmentExpression());
                if (match(')')) {
                    break;
                }
                expect(',');
            }
        }
        expect(')');
        return args$131;
    }
    function parseNonComputedProperty() {
        var token$132 = lex().token;
        if (!isIdentifierName(token$132)) {
            throwUnexpected(token$132);
        }
        return {
            type: Syntax$6.Identifier,
            name: token$132.value
        };
    }
    function parseNonComputedMember(object$133) {
        return {
            type: Syntax$6.MemberExpression,
            computed: false,
            object: object$133,
            property: parseNonComputedProperty()
        };
    }
    function parseComputedMember(object$134) {
        var property$135, expr$136;
        expect('[');
        property$135 = parseExpression();
        expr$136 = {
            type: Syntax$6.MemberExpression,
            computed: true,
            object: object$134,
            property: property$135
        };
        expect(']');
        return expr$136;
    }
    function parseCallMember(object$137) {
        return {
            type: Syntax$6.CallExpression,
            callee: object$137,
            'arguments': parseArguments()
        };
    }
    function parseNewExpression() {
        var expr$138;
        expectKeyword('new');
        expr$138 = {
            type: Syntax$6.NewExpression,
            callee: parseLeftHandSideExpression(),
            'arguments': []
        };
        if (match('(')) {
            expr$138['arguments'] = parseArguments();
        }
        return expr$138;
    }
    function toArrayNode(arr$139) {
        var els$140 = arr$139.map(function (el$141) {
                return {
                    type: 'Literal',
                    value: el$141,
                    raw: el$141.toString()
                };
            });
        return {
            type: 'ArrayExpression',
            elements: els$140
        };
    }
    function toObjectNode(obj$142) {
        var props$143 = Object.keys(obj$142).map(function (key$144) {
                var raw$145 = obj$142[key$144];
                var value$146;
                if (Array.isArray(raw$145)) {
                    value$146 = toArrayNode(raw$145);
                } else {
                    value$146 = {
                        type: 'Literal',
                        value: obj$142[key$144],
                        raw: obj$142[key$144].toString()
                    };
                }
                return {
                    type: 'Property',
                    key: {
                        type: 'Identifier',
                        name: key$144
                    },
                    value: value$146,
                    kind: 'init'
                };
            });
        return {
            type: 'ObjectExpression',
            properties: props$143
        };
    }
    function parseLeftHandSideExpressionAllowCall() {
        var useNew$147, expr$148;
        useNew$147 = matchKeyword('new');
        expr$148 = useNew$147 ? parseNewExpression() : parsePrimaryExpression();
        while (index$12 < length$15) {
            if (match('.')) {
                lex();
                expr$148 = parseNonComputedMember(expr$148);
            } else if (match('[')) {
                expr$148 = parseComputedMember(expr$148);
            } else if (match('(')) {
                expr$148 = parseCallMember(expr$148);
            } else {
                break;
            }
        }
        return expr$148;
    }
    function parseLeftHandSideExpression() {
        var useNew$149, expr$150;
        useNew$149 = matchKeyword('new');
        expr$150 = useNew$149 ? parseNewExpression() : parsePrimaryExpression();
        while (index$12 < length$15) {
            if (match('.')) {
                lex();
                expr$150 = parseNonComputedMember(expr$150);
            } else if (match('[')) {
                expr$150 = parseComputedMember(expr$150);
            } else {
                break;
            }
        }
        return expr$150;
    }
    function parsePostfixExpression() {
        var expr$151 = parseLeftHandSideExpressionAllowCall();
        if ((match('++') || match('--')) && !peekLineTerminator()) {
            if (strict$11 && expr$151.type === Syntax$6.Identifier && isRestrictedWord(expr$151.name)) {
                throwError({}, Messages$8.StrictLHSPostfix);
            }
            if (!isLeftHandSide(expr$151)) {
                throwError({}, Messages$8.InvalidLHSInAssignment);
            }
            expr$151 = {
                type: Syntax$6.UpdateExpression,
                operator: lex().token.value,
                argument: expr$151,
                prefix: false
            };
        }
        return expr$151;
    }
    function parseUnaryExpression() {
        var token$152, expr$153;
        if (match('++') || match('--')) {
            token$152 = lex().token;
            expr$153 = parseUnaryExpression();
            if (strict$11 && expr$153.type === Syntax$6.Identifier && isRestrictedWord(expr$153.name)) {
                throwError({}, Messages$8.StrictLHSPrefix);
            }
            if (!isLeftHandSide(expr$153)) {
                throwError({}, Messages$8.InvalidLHSInAssignment);
            }
            expr$153 = {
                type: Syntax$6.UpdateExpression,
                operator: token$152.value,
                argument: expr$153,
                prefix: true
            };
            return expr$153;
        }
        if (match('+') || match('-') || match('~') || match('!')) {
            expr$153 = {
                type: Syntax$6.UnaryExpression,
                operator: lex().token.value,
                argument: parseUnaryExpression()
            };
            return expr$153;
        }
        if (matchKeyword('delete') || matchKeyword('void') || matchKeyword('typeof')) {
            expr$153 = {
                type: Syntax$6.UnaryExpression,
                operator: lex().token.value,
                argument: parseUnaryExpression()
            };
            if (strict$11 && expr$153.operator === 'delete' && expr$153.argument.type === Syntax$6.Identifier) {
                throwErrorTolerant({}, Messages$8.StrictDelete);
            }
            return expr$153;
        }
        return parsePostfixExpression();
    }
    function parseMultiplicativeExpression() {
        var expr$154 = parseUnaryExpression();
        while (match('*') || match('/') || match('%')) {
            expr$154 = {
                type: Syntax$6.BinaryExpression,
                operator: lex().token.value,
                left: expr$154,
                right: parseUnaryExpression()
            };
        }
        return expr$154;
    }
    function parseAdditiveExpression() {
        var expr$155 = parseMultiplicativeExpression();
        while (match('+') || match('-')) {
            expr$155 = {
                type: Syntax$6.BinaryExpression,
                operator: lex().token.value,
                left: expr$155,
                right: parseMultiplicativeExpression()
            };
        }
        return expr$155;
    }
    function parseShiftExpression() {
        var expr$156 = parseAdditiveExpression();
        while (match('<<') || match('>>') || match('>>>')) {
            expr$156 = {
                type: Syntax$6.BinaryExpression,
                operator: lex().token.value,
                left: expr$156,
                right: parseAdditiveExpression()
            };
        }
        return expr$156;
    }
    function parseRelationalExpression() {
        var expr$157, previousAllowIn$158;
        previousAllowIn$158 = state$17.allowIn;
        state$17.allowIn = true;
        expr$157 = parseShiftExpression();
        while (match('<') || match('>') || match('<=') || match('>=') || previousAllowIn$158 && matchKeyword('in') || matchKeyword('instanceof')) {
            expr$157 = {
                type: Syntax$6.BinaryExpression,
                operator: lex().token.value,
                left: expr$157,
                right: parseRelationalExpression()
            };
        }
        state$17.allowIn = previousAllowIn$158;
        return expr$157;
    }
    function parseEqualityExpression() {
        var expr$159 = parseRelationalExpression();
        while (match('==') || match('!=') || match('===') || match('!==')) {
            expr$159 = {
                type: Syntax$6.BinaryExpression,
                operator: lex().token.value,
                left: expr$159,
                right: parseRelationalExpression()
            };
        }
        return expr$159;
    }
    function parseBitwiseANDExpression() {
        var expr$160 = parseEqualityExpression();
        while (match('&')) {
            lex();
            expr$160 = {
                type: Syntax$6.BinaryExpression,
                operator: '&',
                left: expr$160,
                right: parseEqualityExpression()
            };
        }
        return expr$160;
    }
    function parseBitwiseXORExpression() {
        var expr$161 = parseBitwiseANDExpression();
        while (match('^')) {
            lex();
            expr$161 = {
                type: Syntax$6.BinaryExpression,
                operator: '^',
                left: expr$161,
                right: parseBitwiseANDExpression()
            };
        }
        return expr$161;
    }
    function parseBitwiseORExpression() {
        var expr$162 = parseBitwiseXORExpression();
        while (match('|')) {
            lex();
            expr$162 = {
                type: Syntax$6.BinaryExpression,
                operator: '|',
                left: expr$162,
                right: parseBitwiseXORExpression()
            };
        }
        return expr$162;
    }
    function parseLogicalANDExpression() {
        var expr$163 = parseBitwiseORExpression();
        while (match('&&')) {
            lex();
            expr$163 = {
                type: Syntax$6.LogicalExpression,
                operator: '&&',
                left: expr$163,
                right: parseBitwiseORExpression()
            };
        }
        return expr$163;
    }
    function parseLogicalORExpression() {
        var expr$164 = parseLogicalANDExpression();
        while (match('||')) {
            lex();
            expr$164 = {
                type: Syntax$6.LogicalExpression,
                operator: '||',
                left: expr$164,
                right: parseLogicalANDExpression()
            };
        }
        return expr$164;
    }
    function parseConditionalExpression() {
        var expr$165, previousAllowIn$166, consequent$167;
        expr$165 = parseLogicalORExpression();
        if (match('?')) {
            lex();
            previousAllowIn$166 = state$17.allowIn;
            state$17.allowIn = true;
            consequent$167 = parseAssignmentExpression();
            state$17.allowIn = previousAllowIn$166;
            expect(':');
            expr$165 = {
                type: Syntax$6.ConditionalExpression,
                test: expr$165,
                consequent: consequent$167,
                alternate: parseAssignmentExpression()
            };
        }
        return expr$165;
    }
    function parseAssignmentExpression() {
        var expr$168;
        expr$168 = parseConditionalExpression();
        if (matchAssign()) {
            if (!isLeftHandSide(expr$168)) {
                throwError({}, Messages$8.InvalidLHSInAssignment);
            }
            if (strict$11 && expr$168.type === Syntax$6.Identifier && isRestrictedWord(expr$168.name)) {
                throwError({}, Messages$8.StrictLHSAssignment);
            }
            expr$168 = {
                type: Syntax$6.AssignmentExpression,
                operator: lex().token.value,
                left: expr$168,
                right: parseAssignmentExpression()
            };
        }
        return expr$168;
    }
    function parseExpression() {
        var expr$169 = parseAssignmentExpression();
        if (match(',')) {
            expr$169 = {
                type: Syntax$6.SequenceExpression,
                expressions: [expr$169]
            };
            while (index$12 < length$15) {
                if (!match(',')) {
                    break;
                }
                lex();
                expr$169.expressions.push(parseAssignmentExpression());
            }
        }
        return expr$169;
    }
    function parseStatementList() {
        var list$170 = [], statement$171;
        while (index$12 < length$15) {
            if (match('}')) {
                break;
            }
            statement$171 = parseSourceElement();
            if (typeof statement$171 === 'undefined') {
                break;
            }
            list$170.push(statement$171);
        }
        return list$170;
    }
    function parseBlock() {
        var block$172;
        expect('{');
        block$172 = parseStatementList();
        expect('}');
        return {
            type: Syntax$6.BlockStatement,
            body: block$172
        };
    }
    function parseVariableIdentifier() {
        var stx$173 = lex(), token$174 = stx$173.token;
        if (token$174.type !== Token$4.Identifier) {
            throwUnexpected(token$174);
        }
        var name$175 = extra$19.noresolve ? stx$173 : expander$3.resolve(stx$173);
        return {
            type: Syntax$6.Identifier,
            name: name$175
        };
    }
    function parseVariableDeclaration(kind$176) {
        var id$177 = parseVariableIdentifier(), init$178 = null;
        if (strict$11 && isRestrictedWord(id$177.name)) {
            throwErrorTolerant({}, Messages$8.StrictVarName);
        }
        if (kind$176 === 'const') {
            expect('=');
            init$178 = parseAssignmentExpression();
        } else if (match('=')) {
            lex();
            init$178 = parseAssignmentExpression();
        }
        return {
            type: Syntax$6.VariableDeclarator,
            id: id$177,
            init: init$178
        };
    }
    function parseVariableDeclarationList(kind$179) {
        var list$180 = [];
        while (index$12 < length$15) {
            list$180.push(parseVariableDeclaration(kind$179));
            if (!match(',')) {
                break;
            }
            lex();
        }
        return list$180;
    }
    function parseVariableStatement() {
        var declarations$181;
        expectKeyword('var');
        declarations$181 = parseVariableDeclarationList();
        consumeSemicolon();
        return {
            type: Syntax$6.VariableDeclaration,
            declarations: declarations$181,
            kind: 'var'
        };
    }
    function parseConstLetDeclaration(kind$182) {
        var declarations$183;
        expectKeyword(kind$182);
        declarations$183 = parseVariableDeclarationList(kind$182);
        consumeSemicolon();
        return {
            type: Syntax$6.VariableDeclaration,
            declarations: declarations$183,
            kind: kind$182
        };
    }
    function parseEmptyStatement() {
        expect(';');
        return {type: Syntax$6.EmptyStatement};
    }
    function parseExpressionStatement() {
        var expr$184 = parseExpression();
        consumeSemicolon();
        return {
            type: Syntax$6.ExpressionStatement,
            expression: expr$184
        };
    }
    function parseIfStatement() {
        var test$185, consequent$186, alternate$187;
        expectKeyword('if');
        expect('(');
        test$185 = parseExpression();
        expect(')');
        consequent$186 = parseStatement();
        if (matchKeyword('else')) {
            lex();
            alternate$187 = parseStatement();
        } else {
            alternate$187 = null;
        }
        return {
            type: Syntax$6.IfStatement,
            test: test$185,
            consequent: consequent$186,
            alternate: alternate$187
        };
    }
    function parseDoWhileStatement() {
        var body$188, test$189, oldInIteration$190;
        expectKeyword('do');
        oldInIteration$190 = state$17.inIteration;
        state$17.inIteration = true;
        body$188 = parseStatement();
        state$17.inIteration = oldInIteration$190;
        expectKeyword('while');
        expect('(');
        test$189 = parseExpression();
        expect(')');
        if (match(';')) {
            lex();
        }
        return {
            type: Syntax$6.DoWhileStatement,
            body: body$188,
            test: test$189
        };
    }
    function parseWhileStatement() {
        var test$191, body$192, oldInIteration$193;
        expectKeyword('while');
        expect('(');
        test$191 = parseExpression();
        expect(')');
        oldInIteration$193 = state$17.inIteration;
        state$17.inIteration = true;
        body$192 = parseStatement();
        state$17.inIteration = oldInIteration$193;
        return {
            type: Syntax$6.WhileStatement,
            test: test$191,
            body: body$192
        };
    }
    function parseForVariableDeclaration() {
        var token$194 = lex().token;
        return {
            type: Syntax$6.VariableDeclaration,
            declarations: parseVariableDeclarationList(),
            kind: token$194.value
        };
    }
    function parseForStatement() {
        var init$195, test$196, update$197, left$198, right$199, body$200, oldInIteration$201;
        init$195 = test$196 = update$197 = null;
        expectKeyword('for');
        expect('(');
        if (match(';')) {
            lex();
        } else {
            if (matchKeyword('var') || matchKeyword('let')) {
                state$17.allowIn = false;
                init$195 = parseForVariableDeclaration();
                state$17.allowIn = true;
                if (init$195.declarations.length === 1 && matchKeyword('in')) {
                    lex();
                    left$198 = init$195;
                    right$199 = parseExpression();
                    init$195 = null;
                }
            } else {
                state$17.allowIn = false;
                init$195 = parseExpression();
                state$17.allowIn = true;
                if (matchKeyword('in')) {
                    if (!isLeftHandSide(init$195)) {
                        throwError({}, Messages$8.InvalidLHSInForIn);
                    }
                    lex();
                    left$198 = init$195;
                    right$199 = parseExpression();
                    init$195 = null;
                }
            }
            if (typeof left$198 === 'undefined') {
                expect(';');
            }
        }
        if (typeof left$198 === 'undefined') {
            if (!match(';')) {
                test$196 = parseExpression();
            }
            expect(';');
            if (!match(')')) {
                update$197 = parseExpression();
            }
        }
        expect(')');
        oldInIteration$201 = state$17.inIteration;
        state$17.inIteration = true;
        body$200 = parseStatement();
        state$17.inIteration = oldInIteration$201;
        if (typeof left$198 === 'undefined') {
            return {
                type: Syntax$6.ForStatement,
                init: init$195,
                test: test$196,
                update: update$197,
                body: body$200
            };
        }
        return {
            type: Syntax$6.ForInStatement,
            left: left$198,
            right: right$199,
            body: body$200,
            each: false
        };
    }
    function parseContinueStatement() {
        var token$202, label$203 = null;
        expectKeyword('continue');
        if (tokenStream$18[index$12].token.value === ';') {
            lex();
            if (!state$17.inIteration) {
                throwError({}, Messages$8.IllegalContinue);
            }
            return {
                type: Syntax$6.ContinueStatement,
                label: null
            };
        }
        if (peekLineTerminator()) {
            if (!state$17.inIteration) {
                throwError({}, Messages$8.IllegalContinue);
            }
            return {
                type: Syntax$6.ContinueStatement,
                label: null
            };
        }
        token$202 = lookahead().token;
        if (token$202.type === Token$4.Identifier) {
            label$203 = parseVariableIdentifier();
            if (!Object.prototype.hasOwnProperty.call(state$17.labelSet, label$203.name)) {
                throwError({}, Messages$8.UnknownLabel, label$203.name);
            }
        }
        consumeSemicolon();
        if (label$203 === null && !state$17.inIteration) {
            throwError({}, Messages$8.IllegalContinue);
        }
        return {
            type: Syntax$6.ContinueStatement,
            label: label$203
        };
    }
    function parseBreakStatement() {
        var token$204, label$205 = null;
        expectKeyword('break');
        if (peekLineTerminator()) {
            if (!(state$17.inIteration || state$17.inSwitch)) {
                throwError({}, Messages$8.IllegalBreak);
            }
            return {
                type: Syntax$6.BreakStatement,
                label: null
            };
        }
        token$204 = lookahead().token;
        if (token$204.type === Token$4.Identifier) {
            label$205 = parseVariableIdentifier();
            if (!Object.prototype.hasOwnProperty.call(state$17.labelSet, label$205.name)) {
                throwError({}, Messages$8.UnknownLabel, label$205.name);
            }
        }
        consumeSemicolon();
        if (label$205 === null && !(state$17.inIteration || state$17.inSwitch)) {
            throwError({}, Messages$8.IllegalBreak);
        }
        return {
            type: Syntax$6.BreakStatement,
            label: label$205
        };
    }
    function parseReturnStatement() {
        var token$206, argument$207 = null;
        expectKeyword('return');
        if (!state$17.inFunctionBody) {
            throwErrorTolerant({}, Messages$8.IllegalReturn);
        }
        if (peekLineTerminator()) {
            return {
                type: Syntax$6.ReturnStatement,
                argument: null
            };
        }
        if (!match(';')) {
            token$206 = lookahead().token;
            if (!match('}') && token$206.type !== Token$4.EOF) {
                argument$207 = parseExpression();
            }
        }
        consumeSemicolon();
        return {
            type: Syntax$6.ReturnStatement,
            argument: argument$207
        };
    }
    function parseWithStatement() {
        var object$208, body$209;
        if (strict$11) {
            throwErrorTolerant({}, Messages$8.StrictModeWith);
        }
        expectKeyword('with');
        expect('(');
        object$208 = parseExpression();
        expect(')');
        body$209 = parseStatement();
        return {
            type: Syntax$6.WithStatement,
            object: object$208,
            body: body$209
        };
    }
    function parseSwitchCase() {
        var test$210, consequent$211 = [], statement$212;
        if (matchKeyword('default')) {
            lex();
            test$210 = null;
        } else {
            expectKeyword('case');
            test$210 = parseExpression();
        }
        expect(':');
        while (index$12 < length$15) {
            if (match('}') || matchKeyword('default') || matchKeyword('case')) {
                break;
            }
            statement$212 = parseStatement();
            if (typeof statement$212 === 'undefined') {
                break;
            }
            consequent$211.push(statement$212);
        }
        return {
            type: Syntax$6.SwitchCase,
            test: test$210,
            consequent: consequent$211
        };
    }
    function parseSwitchStatement() {
        var discriminant$213, cases$214, oldInSwitch$215;
        expectKeyword('switch');
        expect('(');
        discriminant$213 = parseExpression();
        expect(')');
        expect('{');
        if (match('}')) {
            lex();
            return {
                type: Syntax$6.SwitchStatement,
                discriminant: discriminant$213
            };
        }
        cases$214 = [];
        oldInSwitch$215 = state$17.inSwitch;
        state$17.inSwitch = true;
        while (index$12 < length$15) {
            if (match('}')) {
                break;
            }
            cases$214.push(parseSwitchCase());
        }
        state$17.inSwitch = oldInSwitch$215;
        expect('}');
        return {
            type: Syntax$6.SwitchStatement,
            discriminant: discriminant$213,
            cases: cases$214
        };
    }
    function parseThrowStatement() {
        var argument$216;
        expectKeyword('throw');
        if (peekLineTerminator()) {
            throwError({}, Messages$8.NewlineAfterThrow);
        }
        argument$216 = parseExpression();
        consumeSemicolon();
        return {
            type: Syntax$6.ThrowStatement,
            argument: argument$216
        };
    }
    function parseCatchClause() {
        var param$217;
        expectKeyword('catch');
        expect('(');
        if (!match(')')) {
            param$217 = parseExpression();
            if (strict$11 && param$217.type === Syntax$6.Identifier && isRestrictedWord(param$217.name)) {
                throwErrorTolerant({}, Messages$8.StrictCatchVariable);
            }
        }
        expect(')');
        return {
            type: Syntax$6.CatchClause,
            param: param$217,
            guard: null,
            body: parseBlock()
        };
    }
    function parseTryStatement() {
        var block$218, handlers$219 = [], finalizer$220 = null;
        expectKeyword('try');
        block$218 = parseBlock();
        if (matchKeyword('catch')) {
            handlers$219.push(parseCatchClause());
        }
        if (matchKeyword('finally')) {
            lex();
            finalizer$220 = parseBlock();
        }
        if (handlers$219.length === 0 && !finalizer$220) {
            throwError({}, Messages$8.NoCatchOrFinally);
        }
        return {
            type: Syntax$6.TryStatement,
            block: block$218,
            handlers: handlers$219,
            finalizer: finalizer$220
        };
    }
    function parseDebuggerStatement() {
        expectKeyword('debugger');
        consumeSemicolon();
        return {type: Syntax$6.DebuggerStatement};
    }
    function parseStatement() {
        var token$221 = lookahead().token, expr$222, labeledBody$223;
        if (token$221.type === Token$4.EOF) {
            throwUnexpected(token$221);
        }
        if (token$221.type === Token$4.Punctuator) {
            switch (token$221.value) {
            case ';':
                return parseEmptyStatement();
            case '{':
                return parseBlock();
            case '(':
                return parseExpressionStatement();
            default:
                break;
            }
        }
        if (token$221.type === Token$4.Keyword) {
            switch (token$221.value) {
            case 'break':
                return parseBreakStatement();
            case 'continue':
                return parseContinueStatement();
            case 'debugger':
                return parseDebuggerStatement();
            case 'do':
                return parseDoWhileStatement();
            case 'for':
                return parseForStatement();
            case 'function':
                return parseFunctionDeclaration();
            case 'if':
                return parseIfStatement();
            case 'return':
                return parseReturnStatement();
            case 'switch':
                return parseSwitchStatement();
            case 'throw':
                return parseThrowStatement();
            case 'try':
                return parseTryStatement();
            case 'var':
                return parseVariableStatement();
            case 'while':
                return parseWhileStatement();
            case 'with':
                return parseWithStatement();
            default:
                break;
            }
        }
        expr$222 = parseExpression();
        if (expr$222.type === Syntax$6.Identifier && match(':')) {
            lex();
            if (Object.prototype.hasOwnProperty.call(state$17.labelSet, expr$222.name)) {
                throwError({}, Messages$8.Redeclaration, 'Label', expr$222.name);
            }
            state$17.labelSet[expr$222.name] = true;
            labeledBody$223 = parseStatement();
            delete state$17.labelSet[expr$222.name];
            return {
                type: Syntax$6.LabeledStatement,
                label: expr$222,
                body: labeledBody$223
            };
        }
        consumeSemicolon();
        return {
            type: Syntax$6.ExpressionStatement,
            expression: expr$222
        };
    }
    function parseFunctionSourceElements() {
        var sourceElement$224, sourceElements$225 = [], token$226, directive$227, firstRestricted$228, oldLabelSet$229, oldInIteration$230, oldInSwitch$231, oldInFunctionBody$232;
        expect('{');
        while (index$12 < length$15) {
            token$226 = lookahead().token;
            if (token$226.type !== Token$4.StringLiteral) {
                break;
            }
            sourceElement$224 = parseSourceElement();
            sourceElements$225.push(sourceElement$224);
            if (sourceElement$224.expression.type !== Syntax$6.Literal) {
                break;
            }
            directive$227 = sliceSource(token$226.range[0] + 1, token$226.range[1] - 1);
            if (directive$227 === 'use strict') {
                strict$11 = true;
                if (firstRestricted$228) {
                    throwError(firstRestricted$228, Messages$8.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$228 && token$226.octal) {
                    firstRestricted$228 = token$226;
                }
            }
        }
        oldLabelSet$229 = state$17.labelSet;
        oldInIteration$230 = state$17.inIteration;
        oldInSwitch$231 = state$17.inSwitch;
        oldInFunctionBody$232 = state$17.inFunctionBody;
        state$17.labelSet = {};
        state$17.inIteration = false;
        state$17.inSwitch = false;
        state$17.inFunctionBody = true;
        while (index$12 < length$15) {
            if (match('}')) {
                break;
            }
            sourceElement$224 = parseSourceElement();
            if (typeof sourceElement$224 === 'undefined') {
                break;
            }
            sourceElements$225.push(sourceElement$224);
        }
        expect('}');
        state$17.labelSet = oldLabelSet$229;
        state$17.inIteration = oldInIteration$230;
        state$17.inSwitch = oldInSwitch$231;
        state$17.inFunctionBody = oldInFunctionBody$232;
        return {
            type: Syntax$6.BlockStatement,
            body: sourceElements$225
        };
    }
    function parseFunctionDeclaration() {
        var id$233, param$234, params$235 = [], body$236, token$237, firstRestricted$238, message$239, previousStrict$240, paramSet$241;
        expectKeyword('function');
        token$237 = lookahead().token;
        id$233 = parseVariableIdentifier();
        if (strict$11) {
            if (isRestrictedWord(token$237.value)) {
                throwError(token$237, Messages$8.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord(token$237.value)) {
                firstRestricted$238 = token$237;
                message$239 = Messages$8.StrictFunctionName;
            } else if (isStrictModeReservedWord(token$237.value)) {
                firstRestricted$238 = token$237;
                message$239 = Messages$8.StrictReservedWord;
            }
        }
        expect('(');
        if (!match(')')) {
            paramSet$241 = {};
            while (index$12 < length$15) {
                token$237 = lookahead().token;
                param$234 = parseVariableIdentifier();
                if (strict$11) {
                    if (isRestrictedWord(token$237.value)) {
                        throwError(token$237, Messages$8.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$241, token$237.value)) {
                        throwError(token$237, Messages$8.StrictParamDupe);
                    }
                } else if (!firstRestricted$238) {
                    if (isRestrictedWord(token$237.value)) {
                        firstRestricted$238 = token$237;
                        message$239 = Messages$8.StrictParamName;
                    } else if (isStrictModeReservedWord(token$237.value)) {
                        firstRestricted$238 = token$237;
                        message$239 = Messages$8.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$241, token$237.value)) {
                        firstRestricted$238 = token$237;
                        message$239 = Messages$8.StrictParamDupe;
                    }
                }
                params$235.push(param$234);
                paramSet$241[param$234.name] = true;
                if (match(')')) {
                    break;
                }
                expect(',');
            }
        }
        expect(')');
        previousStrict$240 = strict$11;
        body$236 = parseFunctionSourceElements();
        if (strict$11 && firstRestricted$238) {
            throwError(firstRestricted$238, message$239);
        }
        strict$11 = previousStrict$240;
        return {
            type: Syntax$6.FunctionDeclaration,
            id: id$233,
            params: params$235,
            body: body$236
        };
    }
    function parseFunctionExpression() {
        var token$242, id$243 = null, firstRestricted$244, message$245, param$246, params$247 = [], body$248, previousStrict$249, paramSet$250;
        expectKeyword('function');
        if (!match('(')) {
            token$242 = lookahead().token;
            id$243 = parseVariableIdentifier();
            if (strict$11) {
                if (isRestrictedWord(token$242.value)) {
                    throwError(token$242, Messages$8.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord(token$242.value)) {
                    firstRestricted$244 = token$242;
                    message$245 = Messages$8.StrictFunctionName;
                } else if (isStrictModeReservedWord(token$242.value)) {
                    firstRestricted$244 = token$242;
                    message$245 = Messages$8.StrictReservedWord;
                }
            }
        }
        expect('(');
        if (!match(')')) {
            paramSet$250 = {};
            while (index$12 < length$15) {
                token$242 = lookahead().token;
                param$246 = parseVariableIdentifier();
                if (strict$11) {
                    if (isRestrictedWord(token$242.value)) {
                        throwError(token$242, Messages$8.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$250, token$242.value)) {
                        throwError(token$242, Messages$8.StrictParamDupe);
                    }
                } else if (!firstRestricted$244) {
                    if (isRestrictedWord(token$242.value)) {
                        firstRestricted$244 = token$242;
                        message$245 = Messages$8.StrictParamName;
                    } else if (isStrictModeReservedWord(token$242.value)) {
                        firstRestricted$244 = token$242;
                        message$245 = Messages$8.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$250, token$242.value)) {
                        firstRestricted$244 = token$242;
                        message$245 = Messages$8.StrictParamDupe;
                    }
                }
                params$247.push(param$246);
                paramSet$250[param$246.name] = true;
                if (match(')')) {
                    break;
                }
                expect(',');
            }
        }
        expect(')');
        previousStrict$249 = strict$11;
        body$248 = parseFunctionSourceElements();
        if (strict$11 && firstRestricted$244) {
            throwError(firstRestricted$244, message$245);
        }
        strict$11 = previousStrict$249;
        return {
            type: Syntax$6.FunctionExpression,
            id: id$243,
            params: params$247,
            body: body$248
        };
    }
    function parseSourceElement() {
        var token$251 = lookahead().token;
        if (token$251.type === Token$4.Keyword) {
            switch (token$251.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration(token$251.value);
            case 'function':
                return parseFunctionDeclaration();
            default:
                return parseStatement();
            }
        }
        if (token$251.type !== Token$4.EOF) {
            return parseStatement();
        }
    }
    function parseSourceElements() {
        var sourceElement$252, sourceElements$253 = [], token$254, directive$255, firstRestricted$256;
        while (index$12 < length$15) {
            token$254 = lookahead();
            if (token$254.type !== Token$4.StringLiteral) {
                break;
            }
            sourceElement$252 = parseSourceElement();
            sourceElements$253.push(sourceElement$252);
            if (sourceElement$252.expression.type !== Syntax$6.Literal) {
                break;
            }
            directive$255 = sliceSource(token$254.range[0] + 1, token$254.range[1] - 1);
            if (directive$255 === 'use strict') {
                strict$11 = true;
                if (firstRestricted$256) {
                    throwError(firstRestricted$256, Messages$8.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$256 && token$254.octal) {
                    firstRestricted$256 = token$254;
                }
            }
        }
        while (index$12 < length$15) {
            sourceElement$252 = parseSourceElement();
            if (typeof sourceElement$252 === 'undefined') {
                break;
            }
            sourceElements$253.push(sourceElement$252);
        }
        return sourceElements$253;
    }
    function parseProgram() {
        var program$257;
        strict$11 = false;
        program$257 = {
            type: Syntax$6.Program,
            body: parseSourceElements()
        };
        return program$257;
    }
    function addComment(start$258, end$259, type$260, value$261) {
        assert(typeof start$258 === 'number', 'Comment must have valid position');
        if (extra$19.comments.length > 0) {
            if (extra$19.comments[extra$19.comments.length - 1].range[1] > start$258) {
                return;
            }
        }
        extra$19.comments.push({
            range: [
                start$258,
                end$259
            ],
            type: type$260,
            value: value$261
        });
    }
    function scanComment() {
        var comment$262, ch$263, start$264, blockComment$265, lineComment$266;
        comment$262 = '';
        blockComment$265 = false;
        lineComment$266 = false;
        while (index$12 < length$15) {
            ch$263 = source$10[index$12];
            if (lineComment$266) {
                ch$263 = nextChar();
                if (index$12 >= length$15) {
                    lineComment$266 = false;
                    comment$262 += ch$263;
                    addComment(start$264, index$12, 'Line', comment$262);
                } else if (isLineTerminator(ch$263)) {
                    lineComment$266 = false;
                    addComment(start$264, index$12, 'Line', comment$262);
                    if (ch$263 === '\r' && source$10[index$12] === '\n') {
                        ++index$12;
                    }
                    ++lineNumber$13;
                    lineStart$14 = index$12;
                    comment$262 = '';
                } else {
                    comment$262 += ch$263;
                }
            } else if (blockComment$265) {
                if (isLineTerminator(ch$263)) {
                    if (ch$263 === '\r' && source$10[index$12 + 1] === '\n') {
                        ++index$12;
                        comment$262 += '\r\n';
                    } else {
                        comment$262 += ch$263;
                    }
                    ++lineNumber$13;
                    ++index$12;
                    lineStart$14 = index$12;
                    if (index$12 >= length$15) {
                        throwError({}, Messages$8.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$263 = nextChar();
                    if (index$12 >= length$15) {
                        throwError({}, Messages$8.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$262 += ch$263;
                    if (ch$263 === '*') {
                        ch$263 = source$10[index$12];
                        if (ch$263 === '/') {
                            comment$262 = comment$262.substr(0, comment$262.length - 1);
                            blockComment$265 = false;
                            ++index$12;
                            addComment(start$264, index$12, 'Block', comment$262);
                            comment$262 = '';
                        }
                    }
                }
            } else if (ch$263 === '/') {
                ch$263 = source$10[index$12 + 1];
                if (ch$263 === '/') {
                    start$264 = index$12;
                    index$12 += 2;
                    lineComment$266 = true;
                } else if (ch$263 === '*') {
                    start$264 = index$12;
                    index$12 += 2;
                    blockComment$265 = true;
                    if (index$12 >= length$15) {
                        throwError({}, Messages$8.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace(ch$263)) {
                ++index$12;
            } else if (isLineTerminator(ch$263)) {
                ++index$12;
                if (ch$263 === '\r' && source$10[index$12] === '\n') {
                    ++index$12;
                }
                ++lineNumber$13;
                lineStart$14 = index$12;
            } else {
                break;
            }
        }
    }
    function collectToken() {
        var token$267 = extra$19.advance(), range$268, value$269;
        if (token$267.type !== Token$4.EOF) {
            range$268 = [
                token$267.range[0],
                token$267.range[1]
            ];
            value$269 = sliceSource(token$267.range[0], token$267.range[1]);
            extra$19.tokens.push({
                type: TokenName$5[token$267.type],
                value: value$269,
                lineNumber: lineNumber$13,
                lineStart: lineStart$14,
                range: range$268
            });
        }
        return token$267;
    }
    function collectRegex() {
        var pos$270, regex$271, token$272;
        skipComment();
        pos$270 = index$12;
        regex$271 = extra$19.scanRegExp();
        if (extra$19.tokens.length > 0) {
            token$272 = extra$19.tokens[extra$19.tokens.length - 1];
            if (token$272.range[0] === pos$270 && token$272.type === 'Punctuator') {
                if (token$272.value === '/' || token$272.value === '/=') {
                    extra$19.tokens.pop();
                }
            }
        }
        extra$19.tokens.push({
            type: 'RegularExpression',
            value: regex$271.literal,
            range: [
                pos$270,
                index$12
            ],
            lineStart: token$272.lineStart,
            lineNumber: token$272.lineNumber
        });
        return regex$271;
    }
    function createLiteral(token$273) {
        if (Array.isArray(token$273)) {
            return {
                type: Syntax$6.Literal,
                value: token$273
            };
        }
        return {
            type: Syntax$6.Literal,
            value: token$273.value,
            lineStart: token$273.lineStart,
            lineNumber: token$273.lineNumber
        };
    }
    function createRawLiteral(token$274) {
        return {
            type: Syntax$6.Literal,
            value: token$274.value,
            raw: sliceSource(token$274.range[0], token$274.range[1]),
            lineStart: token$274.lineStart,
            lineNumber: token$274.lineNumber
        };
    }
    function wrapTrackingFunction(range$275, loc$276) {
        return function (parseFunction$277) {
            function isBinary(node$278) {
                return node$278.type === Syntax$6.LogicalExpression || node$278.type === Syntax$6.BinaryExpression;
            }
            function visit(node$279) {
                if (isBinary(node$279.left)) {
                    visit(node$279.left);
                }
                if (isBinary(node$279.right)) {
                    visit(node$279.right);
                }
                if (range$275 && typeof node$279.range === 'undefined') {
                    node$279.range = [
                        node$279.left.range[0],
                        node$279.right.range[1]
                    ];
                }
                if (loc$276 && typeof node$279.loc === 'undefined') {
                    node$279.loc = {
                        start: node$279.left.loc.start,
                        end: node$279.right.loc.end
                    };
                }
            }
            return function () {
                var node$280, rangeInfo$281, locInfo$282;
                var curr$283 = tokenStream$18[index$12].token;
                rangeInfo$281 = [
                    curr$283.range[0],
                    0
                ];
                locInfo$282 = {start: {
                        line: curr$283.lineNumber,
                        column: curr$283.lineStart
                    }};
                node$280 = parseFunction$277.apply(null, arguments);
                if (typeof node$280 !== 'undefined') {
                    var last$284 = tokenStream$18[index$12].token;
                    if (range$275) {
                        rangeInfo$281[1] = last$284.range[1];
                        node$280.range = rangeInfo$281;
                    }
                    if (loc$276) {
                        locInfo$282.end = {
                            line: last$284.lineNumber,
                            column: last$284.lineStart
                        };
                        node$280.loc = locInfo$282;
                    }
                    if (isBinary(node$280)) {
                        visit(node$280);
                    }
                    if (node$280.type === Syntax$6.MemberExpression) {
                        if (typeof node$280.object.range !== 'undefined') {
                            node$280.range[0] = node$280.object.range[0];
                        }
                        if (typeof node$280.object.loc !== 'undefined') {
                            node$280.loc.start = node$280.object.loc.start;
                        }
                    }
                    if (node$280.type === Syntax$6.CallExpression) {
                        if (typeof node$280.callee.range !== 'undefined') {
                            node$280.range[0] = node$280.callee.range[0];
                        }
                        if (typeof node$280.callee.loc !== 'undefined') {
                            node$280.loc.start = node$280.callee.loc.start;
                        }
                    }
                    return node$280;
                }
            };
        };
    }
    function patch() {
        var wrapTracking$285;
        if (extra$19.comments) {
            extra$19.skipComment = skipComment;
            skipComment = scanComment;
        }
        if (extra$19.raw) {
            extra$19.createLiteral = createLiteral;
            createLiteral = createRawLiteral;
        }
        if (extra$19.range || extra$19.loc) {
            wrapTracking$285 = wrapTrackingFunction(extra$19.range, extra$19.loc);
            extra$19.parseAdditiveExpression = parseAdditiveExpression;
            extra$19.parseAssignmentExpression = parseAssignmentExpression;
            extra$19.parseBitwiseANDExpression = parseBitwiseANDExpression;
            extra$19.parseBitwiseORExpression = parseBitwiseORExpression;
            extra$19.parseBitwiseXORExpression = parseBitwiseXORExpression;
            extra$19.parseBlock = parseBlock;
            extra$19.parseFunctionSourceElements = parseFunctionSourceElements;
            extra$19.parseCallMember = parseCallMember;
            extra$19.parseCatchClause = parseCatchClause;
            extra$19.parseComputedMember = parseComputedMember;
            extra$19.parseConditionalExpression = parseConditionalExpression;
            extra$19.parseConstLetDeclaration = parseConstLetDeclaration;
            extra$19.parseEqualityExpression = parseEqualityExpression;
            extra$19.parseExpression = parseExpression;
            extra$19.parseForVariableDeclaration = parseForVariableDeclaration;
            extra$19.parseFunctionDeclaration = parseFunctionDeclaration;
            extra$19.parseFunctionExpression = parseFunctionExpression;
            extra$19.parseLogicalANDExpression = parseLogicalANDExpression;
            extra$19.parseLogicalORExpression = parseLogicalORExpression;
            extra$19.parseMultiplicativeExpression = parseMultiplicativeExpression;
            extra$19.parseNewExpression = parseNewExpression;
            extra$19.parseNonComputedMember = parseNonComputedMember;
            extra$19.parseNonComputedProperty = parseNonComputedProperty;
            extra$19.parseObjectProperty = parseObjectProperty;
            extra$19.parseObjectPropertyKey = parseObjectPropertyKey;
            extra$19.parsePostfixExpression = parsePostfixExpression;
            extra$19.parsePrimaryExpression = parsePrimaryExpression;
            extra$19.parseProgram = parseProgram;
            extra$19.parsePropertyFunction = parsePropertyFunction;
            extra$19.parseRelationalExpression = parseRelationalExpression;
            extra$19.parseStatement = parseStatement;
            extra$19.parseShiftExpression = parseShiftExpression;
            extra$19.parseSwitchCase = parseSwitchCase;
            extra$19.parseUnaryExpression = parseUnaryExpression;
            extra$19.parseVariableDeclaration = parseVariableDeclaration;
            extra$19.parseVariableIdentifier = parseVariableIdentifier;
            parseAdditiveExpression = wrapTracking$285(extra$19.parseAdditiveExpression);
            parseAssignmentExpression = wrapTracking$285(extra$19.parseAssignmentExpression);
            parseBitwiseANDExpression = wrapTracking$285(extra$19.parseBitwiseANDExpression);
            parseBitwiseORExpression = wrapTracking$285(extra$19.parseBitwiseORExpression);
            parseBitwiseXORExpression = wrapTracking$285(extra$19.parseBitwiseXORExpression);
            parseBlock = wrapTracking$285(extra$19.parseBlock);
            parseFunctionSourceElements = wrapTracking$285(extra$19.parseFunctionSourceElements);
            parseCallMember = wrapTracking$285(extra$19.parseCallMember);
            parseCatchClause = wrapTracking$285(extra$19.parseCatchClause);
            parseComputedMember = wrapTracking$285(extra$19.parseComputedMember);
            parseConditionalExpression = wrapTracking$285(extra$19.parseConditionalExpression);
            parseConstLetDeclaration = wrapTracking$285(extra$19.parseConstLetDeclaration);
            parseEqualityExpression = wrapTracking$285(extra$19.parseEqualityExpression);
            parseExpression = wrapTracking$285(extra$19.parseExpression);
            parseForVariableDeclaration = wrapTracking$285(extra$19.parseForVariableDeclaration);
            parseFunctionDeclaration = wrapTracking$285(extra$19.parseFunctionDeclaration);
            parseFunctionExpression = wrapTracking$285(extra$19.parseFunctionExpression);
            parseLogicalANDExpression = wrapTracking$285(extra$19.parseLogicalANDExpression);
            parseLogicalORExpression = wrapTracking$285(extra$19.parseLogicalORExpression);
            parseMultiplicativeExpression = wrapTracking$285(extra$19.parseMultiplicativeExpression);
            parseNewExpression = wrapTracking$285(extra$19.parseNewExpression);
            parseNonComputedMember = wrapTracking$285(extra$19.parseNonComputedMember);
            parseNonComputedProperty = wrapTracking$285(extra$19.parseNonComputedProperty);
            parseObjectProperty = wrapTracking$285(extra$19.parseObjectProperty);
            parseObjectPropertyKey = wrapTracking$285(extra$19.parseObjectPropertyKey);
            parsePostfixExpression = wrapTracking$285(extra$19.parsePostfixExpression);
            parsePrimaryExpression = wrapTracking$285(extra$19.parsePrimaryExpression);
            parseProgram = wrapTracking$285(extra$19.parseProgram);
            parsePropertyFunction = wrapTracking$285(extra$19.parsePropertyFunction);
            parseRelationalExpression = wrapTracking$285(extra$19.parseRelationalExpression);
            parseStatement = wrapTracking$285(extra$19.parseStatement);
            parseShiftExpression = wrapTracking$285(extra$19.parseShiftExpression);
            parseSwitchCase = wrapTracking$285(extra$19.parseSwitchCase);
            parseUnaryExpression = wrapTracking$285(extra$19.parseUnaryExpression);
            parseVariableDeclaration = wrapTracking$285(extra$19.parseVariableDeclaration);
            parseVariableIdentifier = wrapTracking$285(extra$19.parseVariableIdentifier);
        }
        if (typeof extra$19.tokens !== 'undefined') {
            extra$19.advance = advance;
            extra$19.scanRegExp = scanRegExp;
            advance = collectToken;
            scanRegExp = collectRegex;
        }
    }
    function unpatch() {
        if (typeof extra$19.skipComment === 'function') {
            skipComment = extra$19.skipComment;
        }
        if (extra$19.raw) {
            createLiteral = extra$19.createLiteral;
        }
        if (extra$19.range || extra$19.loc) {
            parseAdditiveExpression = extra$19.parseAdditiveExpression;
            parseAssignmentExpression = extra$19.parseAssignmentExpression;
            parseBitwiseANDExpression = extra$19.parseBitwiseANDExpression;
            parseBitwiseORExpression = extra$19.parseBitwiseORExpression;
            parseBitwiseXORExpression = extra$19.parseBitwiseXORExpression;
            parseBlock = extra$19.parseBlock;
            parseFunctionSourceElements = extra$19.parseFunctionSourceElements;
            parseCallMember = extra$19.parseCallMember;
            parseCatchClause = extra$19.parseCatchClause;
            parseComputedMember = extra$19.parseComputedMember;
            parseConditionalExpression = extra$19.parseConditionalExpression;
            parseConstLetDeclaration = extra$19.parseConstLetDeclaration;
            parseEqualityExpression = extra$19.parseEqualityExpression;
            parseExpression = extra$19.parseExpression;
            parseForVariableDeclaration = extra$19.parseForVariableDeclaration;
            parseFunctionDeclaration = extra$19.parseFunctionDeclaration;
            parseFunctionExpression = extra$19.parseFunctionExpression;
            parseLogicalANDExpression = extra$19.parseLogicalANDExpression;
            parseLogicalORExpression = extra$19.parseLogicalORExpression;
            parseMultiplicativeExpression = extra$19.parseMultiplicativeExpression;
            parseNewExpression = extra$19.parseNewExpression;
            parseNonComputedMember = extra$19.parseNonComputedMember;
            parseNonComputedProperty = extra$19.parseNonComputedProperty;
            parseObjectProperty = extra$19.parseObjectProperty;
            parseObjectPropertyKey = extra$19.parseObjectPropertyKey;
            parsePrimaryExpression = extra$19.parsePrimaryExpression;
            parsePostfixExpression = extra$19.parsePostfixExpression;
            parseProgram = extra$19.parseProgram;
            parsePropertyFunction = extra$19.parsePropertyFunction;
            parseRelationalExpression = extra$19.parseRelationalExpression;
            parseStatement = extra$19.parseStatement;
            parseShiftExpression = extra$19.parseShiftExpression;
            parseSwitchCase = extra$19.parseSwitchCase;
            parseUnaryExpression = extra$19.parseUnaryExpression;
            parseVariableDeclaration = extra$19.parseVariableDeclaration;
            parseVariableIdentifier = extra$19.parseVariableIdentifier;
        }
        if (typeof extra$19.scanRegExp === 'function') {
            advance = extra$19.advance;
            scanRegExp = extra$19.scanRegExp;
        }
    }
    function stringToArray(str$286) {
        var length$287 = str$286.length, result$288 = [], i$289;
        for (i$289 = 0; i$289 < length$287; ++i$289) {
            result$288[i$289] = str$286.charAt(i$289);
        }
        return result$288;
    }
    function blockAllowed(toks$290, start$291, inExprDelim$292, parentIsBlock$293) {
        var assignOps$294 = [
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
        var binaryOps$295 = [
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
        var unaryOps$296 = [
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
        function back(n$297) {
            var idx$298 = toks$290.length - n$297 > 0 ? toks$290.length - n$297 : 0;
            return toks$290[idx$298];
        }
        if (inExprDelim$292 && toks$290.length - (start$291 + 2) <= 0) {
            return false;
        } else if (back(start$291 + 2).value === ':' && parentIsBlock$293) {
            return true;
        } else if (isIn(back(start$291 + 2).value, unaryOps$296.concat(binaryOps$295).concat(assignOps$294))) {
            return false;
        } else if (back(start$291 + 2).value === 'return') {
            var currLineNumber$299 = typeof back(start$291 + 1).startLineNumber !== 'undefined' ? back(start$291 + 1).startLineNumber : back(start$291 + 1).lineNumber;
            if (back(start$291 + 2).lineNumber !== currLineNumber$299) {
                return true;
            } else {
                return false;
            }
        } else if (isIn(back(start$291 + 2).value, [
                'void',
                'typeof',
                'in',
                'case',
                'delete'
            ])) {
            return false;
        } else {
            return true;
        }
    }
    function readToken(toks$300, inExprDelim$301, parentIsBlock$302) {
        var delimiters$303 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$304 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$305 = toks$300.length - 1;
        function back(n$306) {
            var idx$307 = toks$300.length - n$306 > 0 ? toks$300.length - n$306 : 0;
            return toks$300[idx$307];
        }
        skipComment();
        if (isIn(getChar(), delimiters$303)) {
            return readDelim(toks$300, inExprDelim$301, parentIsBlock$302);
        }
        if (getChar() === '/') {
            var prev$308 = back(1);
            if (prev$308) {
                if (prev$308.value === '()') {
                    if (isIn(back(2).value, parenIdents$304)) {
                        return scanRegExp();
                    }
                    return advance();
                }
                if (prev$308.value === '{}') {
                    if (blockAllowed(toks$300, 0, inExprDelim$301, parentIsBlock$302)) {
                        if (back(2).value === '()') {
                            if (back(4).value === 'function') {
                                if (!blockAllowed(toks$300, 3, inExprDelim$301, parentIsBlock$302)) {
                                    return advance();
                                }
                                if (toks$300.length - 5 <= 0 && inExprDelim$301) {
                                    return advance();
                                }
                            }
                            if (back(3).value === 'function') {
                                if (!blockAllowed(toks$300, 2, inExprDelim$301, parentIsBlock$302)) {
                                    return advance();
                                }
                                if (toks$300.length - 4 <= 0 && inExprDelim$301) {
                                    return advance();
                                }
                            }
                        }
                        return scanRegExp();
                    } else {
                        return advance();
                    }
                }
                if (prev$308.type === Token$4.Punctuator) {
                    return scanRegExp();
                }
                if (isKeyword(prev$308.value)) {
                    return scanRegExp();
                }
                return advance();
            }
            return scanRegExp();
        }
        return advance();
    }
    function readDelim(toks$309, inExprDelim$310, parentIsBlock$311) {
        var startDelim$312 = advance(), matchDelim$313 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$314 = [];
        var delimiters$315 = [
                '(',
                '{',
                '['
            ];
        assert(delimiters$315.indexOf(startDelim$312.value) !== -1, 'Need to begin at the delimiter');
        var token$316 = startDelim$312;
        var startLineNumber$317 = token$316.lineNumber;
        var startLineStart$318 = token$316.lineStart;
        var startRange$319 = token$316.range;
        var delimToken$320 = {};
        delimToken$320.type = Token$4.Delimiter;
        delimToken$320.value = startDelim$312.value + matchDelim$313[startDelim$312.value];
        delimToken$320.startLineNumber = startLineNumber$317;
        delimToken$320.startLineStart = startLineStart$318;
        delimToken$320.startRange = startRange$319;
        var delimIsBlock$321 = false;
        if (startDelim$312.value === '{') {
            delimIsBlock$321 = blockAllowed(toks$309.concat(delimToken$320), 0, inExprDelim$310, parentIsBlock$311);
        }
        while (index$12 <= length$15) {
            token$316 = readToken(inner$314, startDelim$312.value === '(' || startDelim$312.value === '[', delimIsBlock$321);
            if (token$316.type === Token$4.Punctuator && token$316.value === matchDelim$313[startDelim$312.value]) {
                break;
            } else if (token$316.type === Token$4.EOF) {
                throwError({}, Messages$8.UnexpectedEOS);
            } else {
                inner$314.push(token$316);
            }
        }
        if (index$12 >= length$15 && matchDelim$313[startDelim$312.value] !== source$10[length$15 - 1]) {
            throwError({}, Messages$8.UnexpectedEOS);
        }
        var endLineNumber$322 = token$316.lineNumber;
        var endLineStart$323 = token$316.lineStart;
        var endRange$324 = token$316.range;
        delimToken$320.inner = inner$314;
        delimToken$320.endLineNumber = endLineNumber$322;
        delimToken$320.endLineStart = endLineStart$323;
        delimToken$320.endRange = endRange$324;
        return delimToken$320;
    }
    ;
    function read(code$325) {
        var token$326, tokenTree$327 = [];
        source$10 = code$325;
        index$12 = 0;
        lineNumber$13 = source$10.length > 0 ? 1 : 0;
        lineStart$14 = 0;
        length$15 = source$10.length;
        buffer$16 = null;
        state$17 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$12 < length$15) {
            tokenTree$327.push(readToken(tokenTree$327, false, false));
        }
        var last$328 = tokenTree$327[tokenTree$327.length - 1];
        if (last$328 && last$328.type !== Token$4.EOF) {
            tokenTree$327.push({
                type: Token$4.EOF,
                value: '',
                lineNumber: last$328.lineNumber,
                lineStart: last$328.lineStart,
                range: [
                    index$12,
                    index$12
                ]
            });
        }
        return expander$3.tokensToSyntax(tokenTree$327);
    }
    function parse(code$329, nodeType$330, options$331) {
        var program$332, toString$333;
        tokenStream$18 = code$329;
        nodeType$330 = nodeType$330 || 'base';
        index$12 = 0;
        length$15 = tokenStream$18.length;
        buffer$16 = null;
        state$17 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$19 = {};
        if (typeof options$331 !== 'undefined') {
            if (options$331.range || options$331.loc) {
                assert(false, 'Note range and loc is not currently implemented');
            }
            extra$19.range = typeof options$331.range === 'boolean' && options$331.range;
            extra$19.loc = typeof options$331.loc === 'boolean' && options$331.loc;
            extra$19.raw = typeof options$331.raw === 'boolean' && options$331.raw;
            if (typeof options$331.tokens === 'boolean' && options$331.tokens) {
                extra$19.tokens = [];
            }
            if (typeof options$331.comment === 'boolean' && options$331.comment) {
                extra$19.comments = [];
            }
            if (typeof options$331.tolerant === 'boolean' && options$331.tolerant) {
                extra$19.errors = [];
            }
            if (typeof options$331.noresolve === 'boolean' && options$331.noresolve) {
                extra$19.noresolve = options$331.noresolve;
            } else {
                extra$19.noresolve = false;
            }
        }
        patch();
        try {
            var classToParse$334 = {
                    'base': parseProgram,
                    'Program': parseProgram,
                    'expr': parseAssignmentExpression,
                    'ident': parsePrimaryExpression,
                    'lit': parsePrimaryExpression,
                    'LogicalANDExpression': parseLogicalANDExpression,
                    'PrimaryExpression': parsePrimaryExpression,
                    'VariableDeclarationList': parseVariableDeclarationList,
                    'StatementList': parseStatementList,
                    'SourceElements': function () {
                        state$17.inFunctionBody = true;
                        return parseSourceElements();
                    },
                    'FunctionDeclaration': parseFunctionDeclaration,
                    'FunctionExpression': parseFunctionExpression,
                    'ExpressionStatement': parseExpressionStatement,
                    'IfStatement': parseIfStatement,
                    'BreakStatement': parseBreakStatement,
                    'ContinueStatement': parseContinueStatement,
                    'WithStatement': parseWithStatement,
                    'SwitchStatement': parseSwitchStatement,
                    'ReturnStatement': parseReturnStatement,
                    'ThrowStatement': parseThrowStatement,
                    'TryStatement': parseTryStatement,
                    'WhileStatement': parseWhileStatement,
                    'ForStatement': parseForStatement,
                    'VariableDeclaration': parseVariableDeclaration,
                    'ArrayExpression': parseArrayInitialiser,
                    'ObjectExpression': parseObjectInitialiser,
                    'SequenceExpression': parseExpression,
                    'AssignmentExpression': parseAssignmentExpression,
                    'ConditionalExpression': parseConditionalExpression,
                    'NewExpression': parseNewExpression,
                    'CallExpression': parseLeftHandSideExpressionAllowCall,
                    'Block': parseBlock
                };
            if (classToParse$334[nodeType$330]) {
                program$332 = classToParse$334[nodeType$330]();
            } else {
                assert(false, 'unmatched parse class' + nodeType$330);
            }
            if (typeof extra$19.comments !== 'undefined') {
                program$332.comments = extra$19.comments;
            }
            if (typeof extra$19.tokens !== 'undefined') {
                program$332.tokens = tokenStream$18.slice(0, index$12);
            }
            if (typeof extra$19.errors !== 'undefined') {
                program$332.errors = extra$19.errors;
            }
        } catch (e$335) {
            throw e$335;
        } finally {
            unpatch();
            extra$19 = {};
        }
        return program$332;
    }
    exports$2.parse = parse;
    exports$2.read = read;
    exports$2.Token = Token$4;
    exports$2.assert = assert;
    exports$2.Syntax = function () {
        var name$336, types$337 = {};
        if (typeof Object.create === 'function') {
            types$337 = Object.create(null);
        }
        for (name$336 in Syntax$6) {
            if (Syntax$6.hasOwnProperty(name$336)) {
                types$337[name$336] = Syntax$6[name$336];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$337);
        }
        return types$337;
    }();
}));