(function (root$49, factory$50) {
    if (typeof exports === 'object') {
        factory$50(exports, require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$50);
    }
}(this, function (exports$51, expander$52) {
    'use strict';
    var Token$53, TokenName$54, Syntax$55, PropertyKind$56, Messages$57, Regex$58, source$59, strict$60, index$61, lineNumber$62, lineStart$63, length$64, buffer$65, state$66, tokenStream$67, extra$68;
    Token$53 = {
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
    TokenName$54 = {};
    TokenName$54[Token$53.BooleanLiteral] = 'Boolean';
    TokenName$54[Token$53.EOF] = '<end>';
    TokenName$54[Token$53.Identifier] = 'Identifier';
    TokenName$54[Token$53.Keyword] = 'Keyword';
    TokenName$54[Token$53.NullLiteral] = 'Null';
    TokenName$54[Token$53.NumericLiteral] = 'Numeric';
    TokenName$54[Token$53.Punctuator] = 'Punctuator';
    TokenName$54[Token$53.StringLiteral] = 'String';
    TokenName$54[Token$53.Delimiter] = 'Delimiter';
    Syntax$55 = {
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
    PropertyKind$56 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    Messages$57 = {
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
    Regex$58 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    function assert$69(condition$70, message$71) {
        if (!condition$70) {
            throw new Error('ASSERT: ' + message$71);
        }
    }
    function isIn$72(el$73, list$74) {
        return list$74.indexOf(el$73) !== -1;
    }
    function sliceSource$75(from$76, to$77) {
        return source$59.slice(from$76, to$77);
    }
    if (typeof 'esprima'[0] === 'undefined') {
        sliceSource$75 = function sliceArraySource$78(from$79, to$80) {
            return source$59.slice(from$79, to$80).join('');
        };
    }
    function isDecimalDigit$81(ch$82) {
        return '0123456789'.indexOf(ch$82) >= 0;
    }
    function isHexDigit$83(ch$84) {
        return '0123456789abcdefABCDEF'.indexOf(ch$84) >= 0;
    }
    function isOctalDigit$85(ch$86) {
        return '01234567'.indexOf(ch$86) >= 0;
    }
    function isWhiteSpace$87(ch$88) {
        return ch$88 === ' ' || ch$88 === '\t' || ch$88 === '\v' || ch$88 === '\f' || ch$88 === '\xa0' || ch$88.charCodeAt(0) >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(ch$88) >= 0;
    }
    function isLineTerminator$89(ch$90) {
        return ch$90 === '\n' || ch$90 === '\r' || ch$90 === '\u2028' || ch$90 === '\u2029';
    }
    function isIdentifierStart$91(ch$92) {
        return ch$92 === '$' || ch$92 === '_' || ch$92 === '\\' || ch$92 >= 'a' && ch$92 <= 'z' || ch$92 >= 'A' && ch$92 <= 'Z' || ch$92.charCodeAt(0) >= 128 && Regex$58.NonAsciiIdentifierStart.test(ch$92);
    }
    function isIdentifierPart$93(ch$94) {
        return ch$94 === '$' || ch$94 === '_' || ch$94 === '\\' || ch$94 >= 'a' && ch$94 <= 'z' || ch$94 >= 'A' && ch$94 <= 'Z' || ch$94 >= '0' && ch$94 <= '9' || ch$94.charCodeAt(0) >= 128 && Regex$58.NonAsciiIdentifierPart.test(ch$94);
    }
    function isFutureReservedWord$95(id$96) {
        return false;
    }
    function isStrictModeReservedWord$97(id$98) {
        switch (id$98) {
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
    function isRestrictedWord$99(id$100) {
        return id$100 === 'eval' || id$100 === 'arguments';
    }
    function isKeyword$101(id$102) {
        var keyword$103 = false;
        switch (id$102.length) {
        case 2:
            keyword$103 = id$102 === 'if' || id$102 === 'in' || id$102 === 'do';
            break;
        case 3:
            keyword$103 = id$102 === 'var' || id$102 === 'for' || id$102 === 'new' || id$102 === 'try';
            break;
        case 4:
            keyword$103 = id$102 === 'this' || id$102 === 'else' || id$102 === 'case' || id$102 === 'void' || id$102 === 'with';
            break;
        case 5:
            keyword$103 = id$102 === 'while' || id$102 === 'break' || id$102 === 'catch' || id$102 === 'throw';
            break;
        case 6:
            keyword$103 = id$102 === 'return' || id$102 === 'typeof' || id$102 === 'delete' || id$102 === 'switch';
            break;
        case 7:
            keyword$103 = id$102 === 'default' || id$102 === 'finally';
            break;
        case 8:
            keyword$103 = id$102 === 'function' || id$102 === 'continue' || id$102 === 'debugger';
            break;
        case 10:
            keyword$103 = id$102 === 'instanceof';
            break;
        }
        if (keyword$103) {
            return true;
        }
        switch (id$102) {
        case 'const':
            return true;
        case 'yield':
        case 'let':
            return true;
        }
        if (strict$60 && isStrictModeReservedWord$97(id$102)) {
            return true;
        }
        return isFutureReservedWord$95(id$102);
    }
    function nextChar$104() {
        return source$59[index$61++];
    }
    function getChar$105() {
        return source$59[index$61];
    }
    function skipComment$106() {
        var ch$107, blockComment$108, lineComment$109;
        blockComment$108 = false;
        lineComment$109 = false;
        while (index$61 < length$64) {
            ch$107 = source$59[index$61];
            if (lineComment$109) {
                ch$107 = nextChar$104();
                if (isLineTerminator$89(ch$107)) {
                    lineComment$109 = false;
                    if (ch$107 === '\r' && source$59[index$61] === '\n') {
                        ++index$61;
                    }
                    ++lineNumber$62;
                    lineStart$63 = index$61;
                }
            } else if (blockComment$108) {
                if (isLineTerminator$89(ch$107)) {
                    if (ch$107 === '\r' && source$59[index$61 + 1] === '\n') {
                        ++index$61;
                    }
                    ++lineNumber$62;
                    ++index$61;
                    lineStart$63 = index$61;
                    if (index$61 >= length$64) {
                        throwError$166({}, Messages$57.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$107 = nextChar$104();
                    if (index$61 >= length$64) {
                        throwError$166({}, Messages$57.UnexpectedToken, 'ILLEGAL');
                    }
                    if (ch$107 === '*') {
                        ch$107 = source$59[index$61];
                        if (ch$107 === '/') {
                            ++index$61;
                            blockComment$108 = false;
                        }
                    }
                }
            } else if (ch$107 === '/') {
                ch$107 = source$59[index$61 + 1];
                if (ch$107 === '/') {
                    index$61 += 2;
                    lineComment$109 = true;
                } else if (ch$107 === '*') {
                    index$61 += 2;
                    blockComment$108 = true;
                    if (index$61 >= length$64) {
                        throwError$166({}, Messages$57.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$87(ch$107)) {
                ++index$61;
            } else if (isLineTerminator$89(ch$107)) {
                ++index$61;
                if (ch$107 === '\r' && source$59[index$61] === '\n') {
                    ++index$61;
                }
                ++lineNumber$62;
                lineStart$63 = index$61;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$110(prefix$111) {
        var i$112, len$113, ch$114, code$115 = 0;
        len$113 = prefix$111 === 'u' ? 4 : 2;
        for (i$112 = 0; i$112 < len$113; ++i$112) {
            if (index$61 < length$64 && isHexDigit$83(source$59[index$61])) {
                ch$114 = nextChar$104();
                code$115 = code$115 * 16 + '0123456789abcdef'.indexOf(ch$114.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$115);
    }
    function scanIdentifier$116() {
        var ch$117, start$118, id$119, restore$120;
        ch$117 = source$59[index$61];
        if (!isIdentifierStart$91(ch$117)) {
            return;
        }
        start$118 = index$61;
        if (ch$117 === '\\') {
            ++index$61;
            if (source$59[index$61] !== 'u') {
                return;
            }
            ++index$61;
            restore$120 = index$61;
            ch$117 = scanHexEscape$110('u');
            if (ch$117) {
                if (ch$117 === '\\' || !isIdentifierStart$91(ch$117)) {
                    return;
                }
                id$119 = ch$117;
            } else {
                index$61 = restore$120;
                id$119 = 'u';
            }
        } else {
            id$119 = nextChar$104();
        }
        while (index$61 < length$64) {
            ch$117 = source$59[index$61];
            if (!isIdentifierPart$93(ch$117)) {
                break;
            }
            if (ch$117 === '\\') {
                ++index$61;
                if (source$59[index$61] !== 'u') {
                    return;
                }
                ++index$61;
                restore$120 = index$61;
                ch$117 = scanHexEscape$110('u');
                if (ch$117) {
                    if (ch$117 === '\\' || !isIdentifierPart$93(ch$117)) {
                        return;
                    }
                    id$119 += ch$117;
                } else {
                    index$61 = restore$120;
                    id$119 += 'u';
                }
            } else {
                id$119 += nextChar$104();
            }
        }
        if (id$119.length === 1) {
            return {
                type: Token$53.Identifier,
                value: id$119,
                lineNumber: lineNumber$62,
                lineStart: lineStart$63,
                range: [
                    start$118,
                    index$61
                ]
            };
        }
        if (isKeyword$101(id$119)) {
            return {
                type: Token$53.Keyword,
                value: id$119,
                lineNumber: lineNumber$62,
                lineStart: lineStart$63,
                range: [
                    start$118,
                    index$61
                ]
            };
        }
        if (id$119 === 'null') {
            return {
                type: Token$53.NullLiteral,
                value: id$119,
                lineNumber: lineNumber$62,
                lineStart: lineStart$63,
                range: [
                    start$118,
                    index$61
                ]
            };
        }
        if (id$119 === 'true' || id$119 === 'false') {
            return {
                type: Token$53.BooleanLiteral,
                value: id$119,
                lineNumber: lineNumber$62,
                lineStart: lineStart$63,
                range: [
                    start$118,
                    index$61
                ]
            };
        }
        return {
            type: Token$53.Identifier,
            value: id$119,
            lineNumber: lineNumber$62,
            lineStart: lineStart$63,
            range: [
                start$118,
                index$61
            ]
        };
    }
    function scanPunctuator$121() {
        var start$122 = index$61, ch1$123 = source$59[index$61], ch2$124, ch3$125, ch4$126;
        if (ch1$123 === ';' || ch1$123 === '{' || ch1$123 === '}') {
            ++index$61;
            return {
                type: Token$53.Punctuator,
                value: ch1$123,
                lineNumber: lineNumber$62,
                lineStart: lineStart$63,
                range: [
                    start$122,
                    index$61
                ]
            };
        }
        if (ch1$123 === ',' || ch1$123 === '(' || ch1$123 === ')') {
            ++index$61;
            return {
                type: Token$53.Punctuator,
                value: ch1$123,
                lineNumber: lineNumber$62,
                lineStart: lineStart$63,
                range: [
                    start$122,
                    index$61
                ]
            };
        }
        if (ch1$123 === '#') {
            ++index$61;
            return {
                type: Token$53.Punctuator,
                value: ch1$123,
                lineNumber: lineNumber$62,
                lineStart: lineStart$63,
                range: [
                    start$122,
                    index$61
                ]
            };
        }
        ch2$124 = source$59[index$61 + 1];
        if (ch1$123 === '.' && !isDecimalDigit$81(ch2$124)) {
            if (source$59[index$61 + 1] === '.' && source$59[index$61 + 2] === '.') {
                nextChar$104();
                nextChar$104();
                nextChar$104();
                return {
                    type: Token$53.Punctuator,
                    value: '...',
                    lineNumber: lineNumber$62,
                    lineStart: lineStart$63,
                    range: [
                        start$122,
                        index$61
                    ]
                };
            } else {
                return {
                    type: Token$53.Punctuator,
                    value: nextChar$104(),
                    lineNumber: lineNumber$62,
                    lineStart: lineStart$63,
                    range: [
                        start$122,
                        index$61
                    ]
                };
            }
        }
        ch3$125 = source$59[index$61 + 2];
        ch4$126 = source$59[index$61 + 3];
        if (ch1$123 === '>' && ch2$124 === '>' && ch3$125 === '>') {
            if (ch4$126 === '=') {
                index$61 += 4;
                return {
                    type: Token$53.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$62,
                    lineStart: lineStart$63,
                    range: [
                        start$122,
                        index$61
                    ]
                };
            }
        }
        if (ch1$123 === '=' && ch2$124 === '=' && ch3$125 === '=') {
            index$61 += 3;
            return {
                type: Token$53.Punctuator,
                value: '===',
                lineNumber: lineNumber$62,
                lineStart: lineStart$63,
                range: [
                    start$122,
                    index$61
                ]
            };
        }
        if (ch1$123 === '!' && ch2$124 === '=' && ch3$125 === '=') {
            index$61 += 3;
            return {
                type: Token$53.Punctuator,
                value: '!==',
                lineNumber: lineNumber$62,
                lineStart: lineStart$63,
                range: [
                    start$122,
                    index$61
                ]
            };
        }
        if (ch1$123 === '>' && ch2$124 === '>' && ch3$125 === '>') {
            index$61 += 3;
            return {
                type: Token$53.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$62,
                lineStart: lineStart$63,
                range: [
                    start$122,
                    index$61
                ]
            };
        }
        if (ch1$123 === '<' && ch2$124 === '<' && ch3$125 === '=') {
            index$61 += 3;
            return {
                type: Token$53.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$62,
                lineStart: lineStart$63,
                range: [
                    start$122,
                    index$61
                ]
            };
        }
        if (ch1$123 === '>' && ch2$124 === '>' && ch3$125 === '=') {
            index$61 += 3;
            return {
                type: Token$53.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$62,
                lineStart: lineStart$63,
                range: [
                    start$122,
                    index$61
                ]
            };
        }
        if (ch2$124 === '=') {
            if ('<>=!+-*%&|^/'.indexOf(ch1$123) >= 0) {
                index$61 += 2;
                return {
                    type: Token$53.Punctuator,
                    value: ch1$123 + ch2$124,
                    lineNumber: lineNumber$62,
                    lineStart: lineStart$63,
                    range: [
                        start$122,
                        index$61
                    ]
                };
            }
        }
        if (ch1$123 === ch2$124 && '+-<>&|'.indexOf(ch1$123) >= 0) {
            if ('+-<>&|'.indexOf(ch2$124) >= 0) {
                index$61 += 2;
                return {
                    type: Token$53.Punctuator,
                    value: ch1$123 + ch2$124,
                    lineNumber: lineNumber$62,
                    lineStart: lineStart$63,
                    range: [
                        start$122,
                        index$61
                    ]
                };
            }
        }
        if ('[]<>+-*%&|^!~?:=/'.indexOf(ch1$123) >= 0) {
            return {
                type: Token$53.Punctuator,
                value: nextChar$104(),
                lineNumber: lineNumber$62,
                lineStart: lineStart$63,
                range: [
                    start$122,
                    index$61
                ]
            };
        }
    }
    function scanNumericLiteral$127() {
        var number$128, start$129, ch$130;
        ch$130 = source$59[index$61];
        assert$69(isDecimalDigit$81(ch$130) || ch$130 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$129 = index$61;
        number$128 = '';
        if (ch$130 !== '.') {
            number$128 = nextChar$104();
            ch$130 = source$59[index$61];
            if (number$128 === '0') {
                if (ch$130 === 'x' || ch$130 === 'X') {
                    number$128 += nextChar$104();
                    while (index$61 < length$64) {
                        ch$130 = source$59[index$61];
                        if (!isHexDigit$83(ch$130)) {
                            break;
                        }
                        number$128 += nextChar$104();
                    }
                    if (number$128.length <= 2) {
                        throwError$166({}, Messages$57.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$61 < length$64) {
                        ch$130 = source$59[index$61];
                        if (isIdentifierStart$91(ch$130)) {
                            throwError$166({}, Messages$57.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$53.NumericLiteral,
                        value: parseInt(number$128, 16),
                        lineNumber: lineNumber$62,
                        lineStart: lineStart$63,
                        range: [
                            start$129,
                            index$61
                        ]
                    };
                } else if (isOctalDigit$85(ch$130)) {
                    number$128 += nextChar$104();
                    while (index$61 < length$64) {
                        ch$130 = source$59[index$61];
                        if (!isOctalDigit$85(ch$130)) {
                            break;
                        }
                        number$128 += nextChar$104();
                    }
                    if (index$61 < length$64) {
                        ch$130 = source$59[index$61];
                        if (isIdentifierStart$91(ch$130) || isDecimalDigit$81(ch$130)) {
                            throwError$166({}, Messages$57.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$53.NumericLiteral,
                        value: parseInt(number$128, 8),
                        octal: true,
                        lineNumber: lineNumber$62,
                        lineStart: lineStart$63,
                        range: [
                            start$129,
                            index$61
                        ]
                    };
                }
                if (isDecimalDigit$81(ch$130)) {
                    throwError$166({}, Messages$57.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (index$61 < length$64) {
                ch$130 = source$59[index$61];
                if (!isDecimalDigit$81(ch$130)) {
                    break;
                }
                number$128 += nextChar$104();
            }
        }
        if (ch$130 === '.') {
            number$128 += nextChar$104();
            while (index$61 < length$64) {
                ch$130 = source$59[index$61];
                if (!isDecimalDigit$81(ch$130)) {
                    break;
                }
                number$128 += nextChar$104();
            }
        }
        if (ch$130 === 'e' || ch$130 === 'E') {
            number$128 += nextChar$104();
            ch$130 = source$59[index$61];
            if (ch$130 === '+' || ch$130 === '-') {
                number$128 += nextChar$104();
            }
            ch$130 = source$59[index$61];
            if (isDecimalDigit$81(ch$130)) {
                number$128 += nextChar$104();
                while (index$61 < length$64) {
                    ch$130 = source$59[index$61];
                    if (!isDecimalDigit$81(ch$130)) {
                        break;
                    }
                    number$128 += nextChar$104();
                }
            } else {
                ch$130 = 'character ' + ch$130;
                if (index$61 >= length$64) {
                    ch$130 = '<end>';
                }
                throwError$166({}, Messages$57.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (index$61 < length$64) {
            ch$130 = source$59[index$61];
            if (isIdentifierStart$91(ch$130)) {
                throwError$166({}, Messages$57.UnexpectedToken, 'ILLEGAL');
            }
        }
        return {
            type: Token$53.NumericLiteral,
            value: parseFloat(number$128),
            lineNumber: lineNumber$62,
            lineStart: lineStart$63,
            range: [
                start$129,
                index$61
            ]
        };
    }
    function scanStringLiteral$131() {
        var str$132 = '', quote$133, start$134, ch$135, code$136, unescaped$137, restore$138, octal$139 = false;
        quote$133 = source$59[index$61];
        assert$69(quote$133 === '\'' || quote$133 === '"', 'String literal must starts with a quote');
        start$134 = index$61;
        ++index$61;
        while (index$61 < length$64) {
            ch$135 = nextChar$104();
            if (ch$135 === quote$133) {
                quote$133 = '';
                break;
            } else if (ch$135 === '\\') {
                ch$135 = nextChar$104();
                if (!isLineTerminator$89(ch$135)) {
                    switch (ch$135) {
                    case 'n':
                        str$132 += '\n';
                        break;
                    case 'r':
                        str$132 += '\r';
                        break;
                    case 't':
                        str$132 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        restore$138 = index$61;
                        unescaped$137 = scanHexEscape$110(ch$135);
                        if (unescaped$137) {
                            str$132 += unescaped$137;
                        } else {
                            index$61 = restore$138;
                            str$132 += ch$135;
                        }
                        break;
                    case 'b':
                        str$132 += '\b';
                        break;
                    case 'f':
                        str$132 += '\f';
                        break;
                    case 'v':
                        str$132 += '\v';
                        break;
                    default:
                        if (isOctalDigit$85(ch$135)) {
                            code$136 = '01234567'.indexOf(ch$135);
                            if (code$136 !== 0) {
                                octal$139 = true;
                            }
                            if (index$61 < length$64 && isOctalDigit$85(source$59[index$61])) {
                                octal$139 = true;
                                code$136 = code$136 * 8 + '01234567'.indexOf(nextChar$104());
                                if ('0123'.indexOf(ch$135) >= 0 && index$61 < length$64 && isOctalDigit$85(source$59[index$61])) {
                                    code$136 = code$136 * 8 + '01234567'.indexOf(nextChar$104());
                                }
                            }
                            str$132 += String.fromCharCode(code$136);
                        } else {
                            str$132 += ch$135;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$62;
                    if (ch$135 === '\r' && source$59[index$61] === '\n') {
                        ++index$61;
                    }
                }
            } else if (isLineTerminator$89(ch$135)) {
                break;
            } else {
                str$132 += ch$135;
            }
        }
        if (quote$133 !== '') {
            throwError$166({}, Messages$57.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$53.StringLiteral,
            value: str$132,
            octal: octal$139,
            lineNumber: lineNumber$62,
            lineStart: lineStart$63,
            range: [
                start$134,
                index$61
            ]
        };
    }
    function scanRegExp$140() {
        var str$141 = '', ch$142, start$143, pattern$144, flags$145, value$146, classMarker$147 = false, restore$148;
        buffer$65 = null;
        skipComment$106();
        start$143 = index$61;
        ch$142 = source$59[index$61];
        assert$69(ch$142 === '/', 'Regular expression literal must start with a slash');
        str$141 = nextChar$104();
        while (index$61 < length$64) {
            ch$142 = nextChar$104();
            str$141 += ch$142;
            if (classMarker$147) {
                if (ch$142 === ']') {
                    classMarker$147 = false;
                }
            } else {
                if (ch$142 === '\\') {
                    ch$142 = nextChar$104();
                    if (isLineTerminator$89(ch$142)) {
                        throwError$166({}, Messages$57.UnterminatedRegExp);
                    }
                    str$141 += ch$142;
                } else if (ch$142 === '/') {
                    break;
                } else if (ch$142 === '[') {
                    classMarker$147 = true;
                } else if (isLineTerminator$89(ch$142)) {
                    throwError$166({}, Messages$57.UnterminatedRegExp);
                }
            }
        }
        if (str$141.length === 1) {
            throwError$166({}, Messages$57.UnterminatedRegExp);
        }
        pattern$144 = str$141.substr(1, str$141.length - 2);
        flags$145 = '';
        while (index$61 < length$64) {
            ch$142 = source$59[index$61];
            if (!isIdentifierPart$93(ch$142)) {
                break;
            }
            ++index$61;
            if (ch$142 === '\\' && index$61 < length$64) {
                ch$142 = source$59[index$61];
                if (ch$142 === 'u') {
                    ++index$61;
                    restore$148 = index$61;
                    ch$142 = scanHexEscape$110('u');
                    if (ch$142) {
                        flags$145 += ch$142;
                        str$141 += '\\u';
                        for (; restore$148 < index$61; ++restore$148) {
                            str$141 += source$59[restore$148];
                        }
                    } else {
                        index$61 = restore$148;
                        flags$145 += 'u';
                        str$141 += '\\u';
                    }
                } else {
                    str$141 += '\\';
                }
            } else {
                flags$145 += ch$142;
                str$141 += ch$142;
            }
        }
        try {
            value$146 = new RegExp(pattern$144, flags$145);
        } catch (e$149) {
            throwError$166({}, Messages$57.InvalidRegExp);
        }
        return {
            type: Token$53.RegexLiteral,
            literal: str$141,
            value: value$146,
            lineNumber: lineNumber$62,
            lineStart: lineStart$63,
            range: [
                start$143,
                index$61
            ]
        };
    }
    function isIdentifierName$150(token$151) {
        return token$151.type === Token$53.Identifier || token$151.type === Token$53.Keyword || token$151.type === Token$53.BooleanLiteral || token$151.type === Token$53.NullLiteral;
    }
    function advance$152() {
        var ch$153, token$154;
        skipComment$106();
        if (index$61 >= length$64) {
            return {
                type: Token$53.EOF,
                lineNumber: lineNumber$62,
                lineStart: lineStart$63,
                range: [
                    index$61,
                    index$61
                ]
            };
        }
        ch$153 = source$59[index$61];
        token$154 = scanPunctuator$121();
        if (typeof token$154 !== 'undefined') {
            return token$154;
        }
        if (ch$153 === '\'' || ch$153 === '"') {
            return scanStringLiteral$131();
        }
        if (ch$153 === '.' || isDecimalDigit$81(ch$153)) {
            return scanNumericLiteral$127();
        }
        token$154 = scanIdentifier$116();
        if (typeof token$154 !== 'undefined') {
            return token$154;
        }
        throwError$166({}, Messages$57.UnexpectedToken, 'ILLEGAL');
    }
    function lex$155() {
        var token$156;
        if (buffer$65) {
            token$156 = buffer$65;
            buffer$65 = null;
            index$61++;
            return token$156;
        }
        buffer$65 = null;
        return tokenStream$67[index$61++];
    }
    function lookahead$157() {
        var pos$158, line$159, start$160;
        if (buffer$65 !== null) {
            return buffer$65;
        }
        buffer$65 = tokenStream$67[index$61];
        return buffer$65;
    }
    function peekLineTerminator$161() {
        var pos$162, line$163, start$164, found$165;
        found$165 = tokenStream$67[index$61 - 1].token.lineNumber !== tokenStream$67[index$61].token.lineNumber;
        return found$165;
    }
    function throwError$166(token$167, messageFormat$168) {
        var error$169, args$170 = Array.prototype.slice.call(arguments, 2), msg$171 = messageFormat$168.replace(/%(\d)/g, function (whole$172, index$173) {
                return args$170[index$173] || '';
            });
        if (typeof token$167.lineNumber === 'number') {
            error$169 = new Error('Line ' + token$167.lineNumber + ': ' + msg$171);
            error$169.lineNumber = token$167.lineNumber;
            if (token$167.range && token$167.range.length > 0) {
                error$169.index = token$167.range[0];
                error$169.column = token$167.range[0] - lineStart$63 + 1;
            }
        } else {
            error$169 = new Error('Line ' + lineNumber$62 + ': ' + msg$171);
            error$169.index = index$61;
            error$169.lineNumber = lineNumber$62;
            error$169.column = index$61 - lineStart$63 + 1;
        }
        throw error$169;
    }
    function throwErrorTolerant$174() {
        var error$175;
        try {
            throwError$166.apply(null, arguments);
        } catch (e$176) {
            if (extra$68.errors) {
                extra$68.errors.push(e$176);
            } else {
                throw e$176;
            }
        }
    }
    function throwUnexpected$177(token$178) {
        var s$179;
        if (token$178.type === Token$53.EOF) {
            throwError$166(token$178, Messages$57.UnexpectedEOS);
        }
        if (token$178.type === Token$53.NumericLiteral) {
            throwError$166(token$178, Messages$57.UnexpectedNumber);
        }
        if (token$178.type === Token$53.StringLiteral) {
            throwError$166(token$178, Messages$57.UnexpectedString);
        }
        if (token$178.type === Token$53.Identifier) {
            console.log(token$178);
            throwError$166(token$178, Messages$57.UnexpectedIdentifier);
        }
        if (token$178.type === Token$53.Keyword) {
            if (isFutureReservedWord$95(token$178.value)) {
                throwError$166(token$178, Messages$57.UnexpectedReserved);
            } else if (strict$60 && isStrictModeReservedWord$97(token$178.value)) {
                throwError$166(token$178, Messages$57.StrictReservedWord);
            }
            throwError$166(token$178, Messages$57.UnexpectedToken, token$178.value);
        }
        throwError$166(token$178, Messages$57.UnexpectedToken, token$178.value);
    }
    function expect$180(value$181) {
        var token$182 = lex$155().token;
        if (token$182.type !== Token$53.Punctuator || token$182.value !== value$181) {
            throwUnexpected$177(token$182);
        }
    }
    function expectKeyword$183(keyword$184) {
        var token$185 = lex$155().token;
        if (token$185.type !== Token$53.Keyword || token$185.value !== keyword$184) {
            throwUnexpected$177(token$185);
        }
    }
    function match$186(value$187) {
        var token$188 = lookahead$157().token;
        return token$188.type === Token$53.Punctuator && token$188.value === value$187;
    }
    function matchKeyword$189(keyword$190) {
        var token$191 = lookahead$157().token;
        return token$191.type === Token$53.Keyword && token$191.value === keyword$190;
    }
    function matchAssign$192() {
        var token$193 = lookahead$157().token, op$194 = token$193.value;
        if (token$193.type !== Token$53.Punctuator) {
            return false;
        }
        return op$194 === '=' || op$194 === '*=' || op$194 === '/=' || op$194 === '%=' || op$194 === '+=' || op$194 === '-=' || op$194 === '<<=' || op$194 === '>>=' || op$194 === '>>>=' || op$194 === '&=' || op$194 === '^=' || op$194 === '|=';
    }
    function consumeSemicolon$195() {
        var token$196, line$197;
        if (tokenStream$67[index$61].token.value === ';') {
            lex$155().token;
            return;
        }
        line$197 = tokenStream$67[index$61 - 1].token.lineNumber;
        token$196 = tokenStream$67[index$61].token;
        if (line$197 !== token$196.lineNumber) {
            return;
        }
        if (token$196.type !== Token$53.EOF && !match$186('}')) {
            throwUnexpected$177(token$196);
        }
        return;
    }
    function isLeftHandSide$198(expr$199) {
        return expr$199.type === Syntax$55.Identifier || expr$199.type === Syntax$55.MemberExpression;
    }
    function parseArrayInitialiser$200() {
        var elements$201 = [], undef$202;
        expect$180('[');
        while (!match$186(']')) {
            if (match$186(',')) {
                lex$155().token;
                elements$201.push(undef$202);
            } else {
                elements$201.push(parseAssignmentExpression$288());
                if (!match$186(']')) {
                    expect$180(',');
                }
            }
        }
        expect$180(']');
        return {
            type: Syntax$55.ArrayExpression,
            elements: elements$201
        };
    }
    function parsePropertyFunction$203(param$204, first$205) {
        var previousStrict$206, body$207;
        previousStrict$206 = strict$60;
        body$207 = parseFunctionSourceElements$371();
        if (first$205 && strict$60 && isRestrictedWord$99(param$204[0].name)) {
            throwError$166(first$205, Messages$57.StrictParamName);
        }
        strict$60 = previousStrict$206;
        return {
            type: Syntax$55.FunctionExpression,
            id: null,
            params: param$204,
            body: body$207
        };
    }
    function parseObjectPropertyKey$208() {
        var token$209 = lex$155().token;
        if (token$209.type === Token$53.StringLiteral || token$209.type === Token$53.NumericLiteral) {
            if (strict$60 && token$209.octal) {
                throwError$166(token$209, Messages$57.StrictOctalLiteral);
            }
            return createLiteral$430(token$209);
        }
        return {
            type: Syntax$55.Identifier,
            name: token$209.value
        };
    }
    function parseObjectProperty$210() {
        var token$211, key$212, id$213, param$214;
        token$211 = lookahead$157().token;
        if (token$211.type === Token$53.Identifier) {
            id$213 = parseObjectPropertyKey$208();
            if (token$211.value === 'get' && !match$186(':')) {
                key$212 = parseObjectPropertyKey$208();
                expect$180('(');
                expect$180(')');
                return {
                    type: Syntax$55.Property,
                    key: key$212,
                    value: parsePropertyFunction$203([]),
                    kind: 'get'
                };
            } else if (token$211.value === 'set' && !match$186(':')) {
                key$212 = parseObjectPropertyKey$208();
                expect$180('(');
                token$211 = lookahead$157().token;
                if (token$211.type !== Token$53.Identifier) {
                    throwUnexpected$177(lex$155().token);
                }
                param$214 = [parseVariableIdentifier$297()];
                expect$180(')');
                return {
                    type: Syntax$55.Property,
                    key: key$212,
                    value: parsePropertyFunction$203(param$214, token$211),
                    kind: 'set'
                };
            } else {
                expect$180(':');
                return {
                    type: Syntax$55.Property,
                    key: id$213,
                    value: parseAssignmentExpression$288(),
                    kind: 'init'
                };
            }
        } else if (token$211.type === Token$53.EOF || token$211.type === Token$53.Punctuator) {
            throwUnexpected$177(token$211);
        } else {
            key$212 = parseObjectPropertyKey$208();
            expect$180(':');
            return {
                type: Syntax$55.Property,
                key: key$212,
                value: parseAssignmentExpression$288(),
                kind: 'init'
            };
        }
    }
    function parseObjectInitialiser$215() {
        var token$216, properties$217 = [], property$218, name$219, kind$220, map$221 = {}, toString$222 = String;
        expect$180('{');
        while (!match$186('}')) {
            property$218 = parseObjectProperty$210();
            if (property$218.key.type === Syntax$55.Identifier) {
                name$219 = property$218.key.name;
            } else {
                name$219 = toString$222(property$218.key.value);
            }
            kind$220 = property$218.kind === 'init' ? PropertyKind$56.Data : property$218.kind === 'get' ? PropertyKind$56.Get : PropertyKind$56.Set;
            if (Object.prototype.hasOwnProperty.call(map$221, name$219)) {
                if (map$221[name$219] === PropertyKind$56.Data) {
                    if (strict$60 && kind$220 === PropertyKind$56.Data) {
                        throwErrorTolerant$174({}, Messages$57.StrictDuplicateProperty);
                    } else if (kind$220 !== PropertyKind$56.Data) {
                        throwError$166({}, Messages$57.AccessorDataProperty);
                    }
                } else {
                    if (kind$220 === PropertyKind$56.Data) {
                        throwError$166({}, Messages$57.AccessorDataProperty);
                    } else if (map$221[name$219] & kind$220) {
                        throwError$166({}, Messages$57.AccessorGetSet);
                    }
                }
                map$221[name$219] |= kind$220;
            } else {
                map$221[name$219] = kind$220;
            }
            properties$217.push(property$218);
            if (!match$186('}')) {
                expect$180(',');
            }
        }
        expect$180('}');
        return {
            type: Syntax$55.ObjectExpression,
            properties: properties$217
        };
    }
    function parsePrimaryExpression$223() {
        var expr$224, token$225 = lookahead$157().token, type$226 = token$225.type;
        if (type$226 === Token$53.Identifier) {
            var name$227 = extra$68.noresolve ? lex$155().token.value : expander$52.resolve(lex$155());
            return {
                type: Syntax$55.Identifier,
                name: name$227
            };
        }
        if (type$226 === Token$53.StringLiteral || type$226 === Token$53.NumericLiteral) {
            if (strict$60 && token$225.octal) {
                throwErrorTolerant$174(token$225, Messages$57.StrictOctalLiteral);
            }
            return createLiteral$430(lex$155().token);
        }
        if (type$226 === Token$53.Keyword) {
            if (matchKeyword$189('this')) {
                lex$155().token;
                return {type: Syntax$55.ThisExpression};
            }
            if (matchKeyword$189('function')) {
                return parseFunctionExpression$391();
            }
        }
        if (type$226 === Token$53.BooleanLiteral) {
            lex$155();
            token$225.value = token$225.value === 'true';
            return createLiteral$430(token$225);
        }
        if (type$226 === Token$53.NullLiteral) {
            lex$155();
            token$225.value = null;
            return createLiteral$430(token$225);
        }
        if (match$186('[')) {
            return parseArrayInitialiser$200();
        }
        if (match$186('{')) {
            return parseObjectInitialiser$215();
        }
        if (match$186('(')) {
            lex$155();
            state$66.lastParenthesized = expr$224 = parseExpression$290();
            expect$180(')');
            return expr$224;
        }
        if (token$225.value instanceof RegExp) {
            return createLiteral$430(lex$155().token);
        }
        return throwUnexpected$177(lex$155().token);
    }
    function parseArguments$228() {
        var args$229 = [];
        expect$180('(');
        if (!match$186(')')) {
            while (index$61 < length$64) {
                args$229.push(parseAssignmentExpression$288());
                if (match$186(')')) {
                    break;
                }
                expect$180(',');
            }
        }
        expect$180(')');
        return args$229;
    }
    function parseNonComputedProperty$230() {
        var token$231 = lex$155().token;
        if (!isIdentifierName$150(token$231)) {
            throwUnexpected$177(token$231);
        }
        return {
            type: Syntax$55.Identifier,
            name: token$231.value
        };
    }
    function parseNonComputedMember$232(object$233) {
        return {
            type: Syntax$55.MemberExpression,
            computed: false,
            object: object$233,
            property: parseNonComputedProperty$230()
        };
    }
    function parseComputedMember$234(object$235) {
        var property$236, expr$237;
        expect$180('[');
        property$236 = parseExpression$290();
        expr$237 = {
            type: Syntax$55.MemberExpression,
            computed: true,
            object: object$235,
            property: property$236
        };
        expect$180(']');
        return expr$237;
    }
    function parseCallMember$238(object$239) {
        return {
            type: Syntax$55.CallExpression,
            callee: object$239,
            'arguments': parseArguments$228()
        };
    }
    function parseNewExpression$240() {
        var expr$241;
        expectKeyword$183('new');
        expr$241 = {
            type: Syntax$55.NewExpression,
            callee: parseLeftHandSideExpression$255(),
            'arguments': []
        };
        if (match$186('(')) {
            expr$241['arguments'] = parseArguments$228();
        }
        return expr$241;
    }
    function toArrayNode$242(arr$243) {
        var els$244 = arr$243.map(function (el$245) {
                return {
                    type: 'Literal',
                    value: el$245,
                    raw: el$245.toString()
                };
            });
        return {
            type: 'ArrayExpression',
            elements: els$244
        };
    }
    function toObjectNode$246(obj$247) {
        var props$248 = Object.keys(obj$247).map(function (key$249) {
                var raw$250 = obj$247[key$249];
                var value$251;
                if (Array.isArray(raw$250)) {
                    value$251 = toArrayNode$242(raw$250);
                } else {
                    value$251 = {
                        type: 'Literal',
                        value: obj$247[key$249],
                        raw: obj$247[key$249].toString()
                    };
                }
                return {
                    type: 'Property',
                    key: {
                        type: 'Identifier',
                        name: key$249
                    },
                    value: value$251,
                    kind: 'init'
                };
            });
        return {
            type: 'ObjectExpression',
            properties: props$248
        };
    }
    function parseLeftHandSideExpressionAllowCall$252() {
        var useNew$253, expr$254;
        useNew$253 = matchKeyword$189('new');
        expr$254 = useNew$253 ? parseNewExpression$240() : parsePrimaryExpression$223();
        while (index$61 < length$64) {
            if (match$186('.')) {
                lex$155();
                expr$254 = parseNonComputedMember$232(expr$254);
            } else if (match$186('[')) {
                expr$254 = parseComputedMember$234(expr$254);
            } else if (match$186('(')) {
                expr$254 = parseCallMember$238(expr$254);
            } else {
                break;
            }
        }
        return expr$254;
    }
    function parseLeftHandSideExpression$255() {
        var useNew$256, expr$257;
        useNew$256 = matchKeyword$189('new');
        expr$257 = useNew$256 ? parseNewExpression$240() : parsePrimaryExpression$223();
        while (index$61 < length$64) {
            if (match$186('.')) {
                lex$155();
                expr$257 = parseNonComputedMember$232(expr$257);
            } else if (match$186('[')) {
                expr$257 = parseComputedMember$234(expr$257);
            } else {
                break;
            }
        }
        return expr$257;
    }
    function parsePostfixExpression$258() {
        var expr$259 = parseLeftHandSideExpressionAllowCall$252();
        if ((match$186('++') || match$186('--')) && !peekLineTerminator$161()) {
            if (strict$60 && expr$259.type === Syntax$55.Identifier && isRestrictedWord$99(expr$259.name)) {
                throwError$166({}, Messages$57.StrictLHSPostfix);
            }
            if (!isLeftHandSide$198(expr$259)) {
                throwError$166({}, Messages$57.InvalidLHSInAssignment);
            }
            expr$259 = {
                type: Syntax$55.UpdateExpression,
                operator: lex$155().token.value,
                argument: expr$259,
                prefix: false
            };
        }
        return expr$259;
    }
    function parseUnaryExpression$260() {
        var token$261, expr$262;
        if (match$186('++') || match$186('--')) {
            token$261 = lex$155().token;
            expr$262 = parseUnaryExpression$260();
            if (strict$60 && expr$262.type === Syntax$55.Identifier && isRestrictedWord$99(expr$262.name)) {
                throwError$166({}, Messages$57.StrictLHSPrefix);
            }
            if (!isLeftHandSide$198(expr$262)) {
                throwError$166({}, Messages$57.InvalidLHSInAssignment);
            }
            expr$262 = {
                type: Syntax$55.UpdateExpression,
                operator: token$261.value,
                argument: expr$262,
                prefix: true
            };
            return expr$262;
        }
        if (match$186('+') || match$186('-') || match$186('~') || match$186('!')) {
            expr$262 = {
                type: Syntax$55.UnaryExpression,
                operator: lex$155().token.value,
                argument: parseUnaryExpression$260()
            };
            return expr$262;
        }
        if (matchKeyword$189('delete') || matchKeyword$189('void') || matchKeyword$189('typeof')) {
            expr$262 = {
                type: Syntax$55.UnaryExpression,
                operator: lex$155().token.value,
                argument: parseUnaryExpression$260()
            };
            if (strict$60 && expr$262.operator === 'delete' && expr$262.argument.type === Syntax$55.Identifier) {
                throwErrorTolerant$174({}, Messages$57.StrictDelete);
            }
            return expr$262;
        }
        return parsePostfixExpression$258();
    }
    function parseMultiplicativeExpression$263() {
        var expr$264 = parseUnaryExpression$260();
        while (match$186('*') || match$186('/') || match$186('%')) {
            expr$264 = {
                type: Syntax$55.BinaryExpression,
                operator: lex$155().token.value,
                left: expr$264,
                right: parseUnaryExpression$260()
            };
        }
        return expr$264;
    }
    function parseAdditiveExpression$265() {
        var expr$266 = parseMultiplicativeExpression$263();
        while (match$186('+') || match$186('-')) {
            expr$266 = {
                type: Syntax$55.BinaryExpression,
                operator: lex$155().token.value,
                left: expr$266,
                right: parseMultiplicativeExpression$263()
            };
        }
        return expr$266;
    }
    function parseShiftExpression$267() {
        var expr$268 = parseAdditiveExpression$265();
        while (match$186('<<') || match$186('>>') || match$186('>>>')) {
            expr$268 = {
                type: Syntax$55.BinaryExpression,
                operator: lex$155().token.value,
                left: expr$268,
                right: parseAdditiveExpression$265()
            };
        }
        return expr$268;
    }
    function parseRelationalExpression$269() {
        var expr$270, previousAllowIn$271;
        previousAllowIn$271 = state$66.allowIn;
        state$66.allowIn = true;
        expr$270 = parseShiftExpression$267();
        while (match$186('<') || match$186('>') || match$186('<=') || match$186('>=') || previousAllowIn$271 && matchKeyword$189('in') || matchKeyword$189('instanceof')) {
            expr$270 = {
                type: Syntax$55.BinaryExpression,
                operator: lex$155().token.value,
                left: expr$270,
                right: parseRelationalExpression$269()
            };
        }
        state$66.allowIn = previousAllowIn$271;
        return expr$270;
    }
    function parseEqualityExpression$272() {
        var expr$273 = parseRelationalExpression$269();
        while (match$186('==') || match$186('!=') || match$186('===') || match$186('!==')) {
            expr$273 = {
                type: Syntax$55.BinaryExpression,
                operator: lex$155().token.value,
                left: expr$273,
                right: parseRelationalExpression$269()
            };
        }
        return expr$273;
    }
    function parseBitwiseANDExpression$274() {
        var expr$275 = parseEqualityExpression$272();
        while (match$186('&')) {
            lex$155();
            expr$275 = {
                type: Syntax$55.BinaryExpression,
                operator: '&',
                left: expr$275,
                right: parseEqualityExpression$272()
            };
        }
        return expr$275;
    }
    function parseBitwiseXORExpression$276() {
        var expr$277 = parseBitwiseANDExpression$274();
        while (match$186('^')) {
            lex$155();
            expr$277 = {
                type: Syntax$55.BinaryExpression,
                operator: '^',
                left: expr$277,
                right: parseBitwiseANDExpression$274()
            };
        }
        return expr$277;
    }
    function parseBitwiseORExpression$278() {
        var expr$279 = parseBitwiseXORExpression$276();
        while (match$186('|')) {
            lex$155();
            expr$279 = {
                type: Syntax$55.BinaryExpression,
                operator: '|',
                left: expr$279,
                right: parseBitwiseXORExpression$276()
            };
        }
        return expr$279;
    }
    function parseLogicalANDExpression$280() {
        var expr$281 = parseBitwiseORExpression$278();
        while (match$186('&&')) {
            lex$155();
            expr$281 = {
                type: Syntax$55.LogicalExpression,
                operator: '&&',
                left: expr$281,
                right: parseBitwiseORExpression$278()
            };
        }
        return expr$281;
    }
    function parseLogicalORExpression$282() {
        var expr$283 = parseLogicalANDExpression$280();
        while (match$186('||')) {
            lex$155();
            expr$283 = {
                type: Syntax$55.LogicalExpression,
                operator: '||',
                left: expr$283,
                right: parseLogicalANDExpression$280()
            };
        }
        return expr$283;
    }
    function parseConditionalExpression$284() {
        var expr$285, previousAllowIn$286, consequent$287;
        expr$285 = parseLogicalORExpression$282();
        if (match$186('?')) {
            lex$155();
            previousAllowIn$286 = state$66.allowIn;
            state$66.allowIn = true;
            consequent$287 = parseAssignmentExpression$288();
            state$66.allowIn = previousAllowIn$286;
            expect$180(':');
            expr$285 = {
                type: Syntax$55.ConditionalExpression,
                test: expr$285,
                consequent: consequent$287,
                alternate: parseAssignmentExpression$288()
            };
        }
        return expr$285;
    }
    function parseAssignmentExpression$288() {
        var expr$289;
        expr$289 = parseConditionalExpression$284();
        if (matchAssign$192()) {
            if (!isLeftHandSide$198(expr$289)) {
                throwError$166({}, Messages$57.InvalidLHSInAssignment);
            }
            if (strict$60 && expr$289.type === Syntax$55.Identifier && isRestrictedWord$99(expr$289.name)) {
                throwError$166({}, Messages$57.StrictLHSAssignment);
            }
            expr$289 = {
                type: Syntax$55.AssignmentExpression,
                operator: lex$155().token.value,
                left: expr$289,
                right: parseAssignmentExpression$288()
            };
        }
        return expr$289;
    }
    function parseExpression$290() {
        var expr$291 = parseAssignmentExpression$288();
        if (match$186(',')) {
            expr$291 = {
                type: Syntax$55.SequenceExpression,
                expressions: [expr$291]
            };
            while (index$61 < length$64) {
                if (!match$186(',')) {
                    break;
                }
                lex$155();
                expr$291.expressions.push(parseAssignmentExpression$288());
            }
        }
        return expr$291;
    }
    function parseStatementList$292() {
        var list$293 = [], statement$294;
        while (index$61 < length$64) {
            if (match$186('}')) {
                break;
            }
            statement$294 = parseSourceElement$401();
            if (typeof statement$294 === 'undefined') {
                break;
            }
            list$293.push(statement$294);
        }
        return list$293;
    }
    function parseBlock$295() {
        var block$296;
        expect$180('{');
        block$296 = parseStatementList$292();
        expect$180('}');
        return {
            type: Syntax$55.BlockStatement,
            body: block$296
        };
    }
    function parseVariableIdentifier$297() {
        var stx$298 = lex$155(), token$299 = stx$298.token;
        if (token$299.type !== Token$53.Identifier) {
            throwUnexpected$177(token$299);
        }
        var name$300 = extra$68.noresolve ? stx$298 : expander$52.resolve(stx$298);
        return {
            type: Syntax$55.Identifier,
            name: name$300
        };
    }
    function parseVariableDeclaration$301(kind$302) {
        var id$303 = parseVariableIdentifier$297(), init$304 = null;
        if (strict$60 && isRestrictedWord$99(id$303.name)) {
            throwErrorTolerant$174({}, Messages$57.StrictVarName);
        }
        if (kind$302 === 'const') {
            expect$180('=');
            init$304 = parseAssignmentExpression$288();
        } else if (match$186('=')) {
            lex$155();
            init$304 = parseAssignmentExpression$288();
        }
        return {
            type: Syntax$55.VariableDeclarator,
            id: id$303,
            init: init$304
        };
    }
    function parseVariableDeclarationList$305(kind$306) {
        var list$307 = [];
        while (index$61 < length$64) {
            list$307.push(parseVariableDeclaration$301(kind$306));
            if (!match$186(',')) {
                break;
            }
            lex$155();
        }
        return list$307;
    }
    function parseVariableStatement$308() {
        var declarations$309;
        expectKeyword$183('var');
        declarations$309 = parseVariableDeclarationList$305();
        consumeSemicolon$195();
        return {
            type: Syntax$55.VariableDeclaration,
            declarations: declarations$309,
            kind: 'var'
        };
    }
    function parseConstLetDeclaration$310(kind$311) {
        var declarations$312;
        expectKeyword$183(kind$311);
        declarations$312 = parseVariableDeclarationList$305(kind$311);
        consumeSemicolon$195();
        return {
            type: Syntax$55.VariableDeclaration,
            declarations: declarations$312,
            kind: kind$311
        };
    }
    function parseEmptyStatement$313() {
        expect$180(';');
        return {type: Syntax$55.EmptyStatement};
    }
    function parseExpressionStatement$314() {
        var expr$315 = parseExpression$290();
        consumeSemicolon$195();
        return {
            type: Syntax$55.ExpressionStatement,
            expression: expr$315
        };
    }
    function parseIfStatement$316() {
        var test$317, consequent$318, alternate$319;
        expectKeyword$183('if');
        expect$180('(');
        test$317 = parseExpression$290();
        expect$180(')');
        consequent$318 = parseStatement$367();
        if (matchKeyword$189('else')) {
            lex$155();
            alternate$319 = parseStatement$367();
        } else {
            alternate$319 = null;
        }
        return {
            type: Syntax$55.IfStatement,
            test: test$317,
            consequent: consequent$318,
            alternate: alternate$319
        };
    }
    function parseDoWhileStatement$320() {
        var body$321, test$322, oldInIteration$323;
        expectKeyword$183('do');
        oldInIteration$323 = state$66.inIteration;
        state$66.inIteration = true;
        body$321 = parseStatement$367();
        state$66.inIteration = oldInIteration$323;
        expectKeyword$183('while');
        expect$180('(');
        test$322 = parseExpression$290();
        expect$180(')');
        if (match$186(';')) {
            lex$155();
        }
        return {
            type: Syntax$55.DoWhileStatement,
            body: body$321,
            test: test$322
        };
    }
    function parseWhileStatement$324() {
        var test$325, body$326, oldInIteration$327;
        expectKeyword$183('while');
        expect$180('(');
        test$325 = parseExpression$290();
        expect$180(')');
        oldInIteration$327 = state$66.inIteration;
        state$66.inIteration = true;
        body$326 = parseStatement$367();
        state$66.inIteration = oldInIteration$327;
        return {
            type: Syntax$55.WhileStatement,
            test: test$325,
            body: body$326
        };
    }
    function parseForVariableDeclaration$328() {
        var token$329 = lex$155().token;
        return {
            type: Syntax$55.VariableDeclaration,
            declarations: parseVariableDeclarationList$305(),
            kind: token$329.value
        };
    }
    function parseForStatement$330() {
        var init$331, test$332, update$333, left$334, right$335, body$336, oldInIteration$337;
        init$331 = test$332 = update$333 = null;
        expectKeyword$183('for');
        expect$180('(');
        if (match$186(';')) {
            lex$155();
        } else {
            if (matchKeyword$189('var') || matchKeyword$189('let')) {
                state$66.allowIn = false;
                init$331 = parseForVariableDeclaration$328();
                state$66.allowIn = true;
                if (init$331.declarations.length === 1 && matchKeyword$189('in')) {
                    lex$155();
                    left$334 = init$331;
                    right$335 = parseExpression$290();
                    init$331 = null;
                }
            } else {
                state$66.allowIn = false;
                init$331 = parseExpression$290();
                state$66.allowIn = true;
                if (matchKeyword$189('in')) {
                    if (!isLeftHandSide$198(init$331)) {
                        throwError$166({}, Messages$57.InvalidLHSInForIn);
                    }
                    lex$155();
                    left$334 = init$331;
                    right$335 = parseExpression$290();
                    init$331 = null;
                }
            }
            if (typeof left$334 === 'undefined') {
                expect$180(';');
            }
        }
        if (typeof left$334 === 'undefined') {
            if (!match$186(';')) {
                test$332 = parseExpression$290();
            }
            expect$180(';');
            if (!match$186(')')) {
                update$333 = parseExpression$290();
            }
        }
        expect$180(')');
        oldInIteration$337 = state$66.inIteration;
        state$66.inIteration = true;
        body$336 = parseStatement$367();
        state$66.inIteration = oldInIteration$337;
        if (typeof left$334 === 'undefined') {
            return {
                type: Syntax$55.ForStatement,
                init: init$331,
                test: test$332,
                update: update$333,
                body: body$336
            };
        }
        return {
            type: Syntax$55.ForInStatement,
            left: left$334,
            right: right$335,
            body: body$336,
            each: false
        };
    }
    function parseContinueStatement$338() {
        var token$339, label$340 = null;
        expectKeyword$183('continue');
        if (tokenStream$67[index$61].token.value === ';') {
            lex$155();
            if (!state$66.inIteration) {
                throwError$166({}, Messages$57.IllegalContinue);
            }
            return {
                type: Syntax$55.ContinueStatement,
                label: null
            };
        }
        if (peekLineTerminator$161()) {
            if (!state$66.inIteration) {
                throwError$166({}, Messages$57.IllegalContinue);
            }
            return {
                type: Syntax$55.ContinueStatement,
                label: null
            };
        }
        token$339 = lookahead$157().token;
        if (token$339.type === Token$53.Identifier) {
            label$340 = parseVariableIdentifier$297();
            if (!Object.prototype.hasOwnProperty.call(state$66.labelSet, label$340.name)) {
                throwError$166({}, Messages$57.UnknownLabel, label$340.name);
            }
        }
        consumeSemicolon$195();
        if (label$340 === null && !state$66.inIteration) {
            throwError$166({}, Messages$57.IllegalContinue);
        }
        return {
            type: Syntax$55.ContinueStatement,
            label: label$340
        };
    }
    function parseBreakStatement$341() {
        var token$342, label$343 = null;
        expectKeyword$183('break');
        if (peekLineTerminator$161()) {
            if (!(state$66.inIteration || state$66.inSwitch)) {
                throwError$166({}, Messages$57.IllegalBreak);
            }
            return {
                type: Syntax$55.BreakStatement,
                label: null
            };
        }
        token$342 = lookahead$157().token;
        if (token$342.type === Token$53.Identifier) {
            label$343 = parseVariableIdentifier$297();
            if (!Object.prototype.hasOwnProperty.call(state$66.labelSet, label$343.name)) {
                throwError$166({}, Messages$57.UnknownLabel, label$343.name);
            }
        }
        consumeSemicolon$195();
        if (label$343 === null && !(state$66.inIteration || state$66.inSwitch)) {
            throwError$166({}, Messages$57.IllegalBreak);
        }
        return {
            type: Syntax$55.BreakStatement,
            label: label$343
        };
    }
    function parseReturnStatement$344() {
        var token$345, argument$346 = null;
        expectKeyword$183('return');
        if (!state$66.inFunctionBody) {
            throwErrorTolerant$174({}, Messages$57.IllegalReturn);
        }
        if (peekLineTerminator$161()) {
            return {
                type: Syntax$55.ReturnStatement,
                argument: null
            };
        }
        if (!match$186(';')) {
            token$345 = lookahead$157().token;
            if (!match$186('}') && token$345.type !== Token$53.EOF) {
                argument$346 = parseExpression$290();
            }
        }
        consumeSemicolon$195();
        return {
            type: Syntax$55.ReturnStatement,
            argument: argument$346
        };
    }
    function parseWithStatement$347() {
        var object$348, body$349;
        if (strict$60) {
            throwErrorTolerant$174({}, Messages$57.StrictModeWith);
        }
        expectKeyword$183('with');
        expect$180('(');
        object$348 = parseExpression$290();
        expect$180(')');
        body$349 = parseStatement$367();
        return {
            type: Syntax$55.WithStatement,
            object: object$348,
            body: body$349
        };
    }
    function parseSwitchCase$350() {
        var test$351, consequent$352 = [], statement$353;
        if (matchKeyword$189('default')) {
            lex$155();
            test$351 = null;
        } else {
            expectKeyword$183('case');
            test$351 = parseExpression$290();
        }
        expect$180(':');
        while (index$61 < length$64) {
            if (match$186('}') || matchKeyword$189('default') || matchKeyword$189('case')) {
                break;
            }
            statement$353 = parseStatement$367();
            if (typeof statement$353 === 'undefined') {
                break;
            }
            consequent$352.push(statement$353);
        }
        return {
            type: Syntax$55.SwitchCase,
            test: test$351,
            consequent: consequent$352
        };
    }
    function parseSwitchStatement$354() {
        var discriminant$355, cases$356, oldInSwitch$357;
        expectKeyword$183('switch');
        expect$180('(');
        discriminant$355 = parseExpression$290();
        expect$180(')');
        expect$180('{');
        if (match$186('}')) {
            lex$155();
            return {
                type: Syntax$55.SwitchStatement,
                discriminant: discriminant$355
            };
        }
        cases$356 = [];
        oldInSwitch$357 = state$66.inSwitch;
        state$66.inSwitch = true;
        while (index$61 < length$64) {
            if (match$186('}')) {
                break;
            }
            cases$356.push(parseSwitchCase$350());
        }
        state$66.inSwitch = oldInSwitch$357;
        expect$180('}');
        return {
            type: Syntax$55.SwitchStatement,
            discriminant: discriminant$355,
            cases: cases$356
        };
    }
    function parseThrowStatement$358() {
        var argument$359;
        expectKeyword$183('throw');
        if (peekLineTerminator$161()) {
            throwError$166({}, Messages$57.NewlineAfterThrow);
        }
        argument$359 = parseExpression$290();
        consumeSemicolon$195();
        return {
            type: Syntax$55.ThrowStatement,
            argument: argument$359
        };
    }
    function parseCatchClause$360() {
        var param$361;
        expectKeyword$183('catch');
        expect$180('(');
        if (!match$186(')')) {
            param$361 = parseExpression$290();
            if (strict$60 && param$361.type === Syntax$55.Identifier && isRestrictedWord$99(param$361.name)) {
                throwErrorTolerant$174({}, Messages$57.StrictCatchVariable);
            }
        }
        expect$180(')');
        return {
            type: Syntax$55.CatchClause,
            param: param$361,
            guard: null,
            body: parseBlock$295()
        };
    }
    function parseTryStatement$362() {
        var block$363, handlers$364 = [], finalizer$365 = null;
        expectKeyword$183('try');
        block$363 = parseBlock$295();
        if (matchKeyword$189('catch')) {
            handlers$364.push(parseCatchClause$360());
        }
        if (matchKeyword$189('finally')) {
            lex$155();
            finalizer$365 = parseBlock$295();
        }
        if (handlers$364.length === 0 && !finalizer$365) {
            throwError$166({}, Messages$57.NoCatchOrFinally);
        }
        return {
            type: Syntax$55.TryStatement,
            block: block$363,
            handlers: handlers$364,
            finalizer: finalizer$365
        };
    }
    function parseDebuggerStatement$366() {
        expectKeyword$183('debugger');
        consumeSemicolon$195();
        return {type: Syntax$55.DebuggerStatement};
    }
    function parseStatement$367() {
        var token$368 = lookahead$157().token, expr$369, labeledBody$370;
        if (token$368.type === Token$53.EOF) {
            throwUnexpected$177(token$368);
        }
        if (token$368.type === Token$53.Punctuator) {
            switch (token$368.value) {
            case ';':
                return parseEmptyStatement$313();
            case '{':
                return parseBlock$295();
            case '(':
                return parseExpressionStatement$314();
            default:
                break;
            }
        }
        if (token$368.type === Token$53.Keyword) {
            switch (token$368.value) {
            case 'break':
                return parseBreakStatement$341();
            case 'continue':
                return parseContinueStatement$338();
            case 'debugger':
                return parseDebuggerStatement$366();
            case 'do':
                return parseDoWhileStatement$320();
            case 'for':
                return parseForStatement$330();
            case 'function':
                return parseFunctionDeclaration$381();
            case 'if':
                return parseIfStatement$316();
            case 'return':
                return parseReturnStatement$344();
            case 'switch':
                return parseSwitchStatement$354();
            case 'throw':
                return parseThrowStatement$358();
            case 'try':
                return parseTryStatement$362();
            case 'var':
                return parseVariableStatement$308();
            case 'while':
                return parseWhileStatement$324();
            case 'with':
                return parseWithStatement$347();
            default:
                break;
            }
        }
        expr$369 = parseExpression$290();
        if (expr$369.type === Syntax$55.Identifier && match$186(':')) {
            lex$155();
            if (Object.prototype.hasOwnProperty.call(state$66.labelSet, expr$369.name)) {
                throwError$166({}, Messages$57.Redeclaration, 'Label', expr$369.name);
            }
            state$66.labelSet[expr$369.name] = true;
            labeledBody$370 = parseStatement$367();
            delete state$66.labelSet[expr$369.name];
            return {
                type: Syntax$55.LabeledStatement,
                label: expr$369,
                body: labeledBody$370
            };
        }
        consumeSemicolon$195();
        return {
            type: Syntax$55.ExpressionStatement,
            expression: expr$369
        };
    }
    function parseFunctionSourceElements$371() {
        var sourceElement$372, sourceElements$373 = [], token$374, directive$375, firstRestricted$376, oldLabelSet$377, oldInIteration$378, oldInSwitch$379, oldInFunctionBody$380;
        expect$180('{');
        while (index$61 < length$64) {
            token$374 = lookahead$157().token;
            if (token$374.type !== Token$53.StringLiteral) {
                break;
            }
            sourceElement$372 = parseSourceElement$401();
            sourceElements$373.push(sourceElement$372);
            if (sourceElement$372.expression.type !== Syntax$55.Literal) {
                break;
            }
            directive$375 = sliceSource$75(token$374.range[0] + 1, token$374.range[1] - 1);
            if (directive$375 === 'use strict') {
                strict$60 = true;
                if (firstRestricted$376) {
                    throwError$166(firstRestricted$376, Messages$57.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$376 && token$374.octal) {
                    firstRestricted$376 = token$374;
                }
            }
        }
        oldLabelSet$377 = state$66.labelSet;
        oldInIteration$378 = state$66.inIteration;
        oldInSwitch$379 = state$66.inSwitch;
        oldInFunctionBody$380 = state$66.inFunctionBody;
        state$66.labelSet = {};
        state$66.inIteration = false;
        state$66.inSwitch = false;
        state$66.inFunctionBody = true;
        while (index$61 < length$64) {
            if (match$186('}')) {
                break;
            }
            sourceElement$372 = parseSourceElement$401();
            if (typeof sourceElement$372 === 'undefined') {
                break;
            }
            sourceElements$373.push(sourceElement$372);
        }
        expect$180('}');
        state$66.labelSet = oldLabelSet$377;
        state$66.inIteration = oldInIteration$378;
        state$66.inSwitch = oldInSwitch$379;
        state$66.inFunctionBody = oldInFunctionBody$380;
        return {
            type: Syntax$55.BlockStatement,
            body: sourceElements$373
        };
    }
    function parseFunctionDeclaration$381() {
        var id$382, param$383, params$384 = [], body$385, token$386, firstRestricted$387, message$388, previousStrict$389, paramSet$390;
        expectKeyword$183('function');
        token$386 = lookahead$157().token;
        id$382 = parseVariableIdentifier$297();
        if (strict$60) {
            if (isRestrictedWord$99(token$386.value)) {
                throwError$166(token$386, Messages$57.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$99(token$386.value)) {
                firstRestricted$387 = token$386;
                message$388 = Messages$57.StrictFunctionName;
            } else if (isStrictModeReservedWord$97(token$386.value)) {
                firstRestricted$387 = token$386;
                message$388 = Messages$57.StrictReservedWord;
            }
        }
        expect$180('(');
        if (!match$186(')')) {
            paramSet$390 = {};
            while (index$61 < length$64) {
                token$386 = lookahead$157().token;
                param$383 = parseVariableIdentifier$297();
                if (strict$60) {
                    if (isRestrictedWord$99(token$386.value)) {
                        throwError$166(token$386, Messages$57.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$390, token$386.value)) {
                        throwError$166(token$386, Messages$57.StrictParamDupe);
                    }
                } else if (!firstRestricted$387) {
                    if (isRestrictedWord$99(token$386.value)) {
                        firstRestricted$387 = token$386;
                        message$388 = Messages$57.StrictParamName;
                    } else if (isStrictModeReservedWord$97(token$386.value)) {
                        firstRestricted$387 = token$386;
                        message$388 = Messages$57.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$390, token$386.value)) {
                        firstRestricted$387 = token$386;
                        message$388 = Messages$57.StrictParamDupe;
                    }
                }
                params$384.push(param$383);
                paramSet$390[param$383.name] = true;
                if (match$186(')')) {
                    break;
                }
                expect$180(',');
            }
        }
        expect$180(')');
        previousStrict$389 = strict$60;
        body$385 = parseFunctionSourceElements$371();
        if (strict$60 && firstRestricted$387) {
            throwError$166(firstRestricted$387, message$388);
        }
        strict$60 = previousStrict$389;
        return {
            type: Syntax$55.FunctionDeclaration,
            id: id$382,
            params: params$384,
            body: body$385
        };
    }
    function parseFunctionExpression$391() {
        var token$392, id$393 = null, firstRestricted$394, message$395, param$396, params$397 = [], body$398, previousStrict$399, paramSet$400;
        expectKeyword$183('function');
        if (!match$186('(')) {
            token$392 = lookahead$157().token;
            id$393 = parseVariableIdentifier$297();
            if (strict$60) {
                if (isRestrictedWord$99(token$392.value)) {
                    throwError$166(token$392, Messages$57.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$99(token$392.value)) {
                    firstRestricted$394 = token$392;
                    message$395 = Messages$57.StrictFunctionName;
                } else if (isStrictModeReservedWord$97(token$392.value)) {
                    firstRestricted$394 = token$392;
                    message$395 = Messages$57.StrictReservedWord;
                }
            }
        }
        expect$180('(');
        if (!match$186(')')) {
            paramSet$400 = {};
            while (index$61 < length$64) {
                token$392 = lookahead$157().token;
                param$396 = parseVariableIdentifier$297();
                if (strict$60) {
                    if (isRestrictedWord$99(token$392.value)) {
                        throwError$166(token$392, Messages$57.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$400, token$392.value)) {
                        throwError$166(token$392, Messages$57.StrictParamDupe);
                    }
                } else if (!firstRestricted$394) {
                    if (isRestrictedWord$99(token$392.value)) {
                        firstRestricted$394 = token$392;
                        message$395 = Messages$57.StrictParamName;
                    } else if (isStrictModeReservedWord$97(token$392.value)) {
                        firstRestricted$394 = token$392;
                        message$395 = Messages$57.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$400, token$392.value)) {
                        firstRestricted$394 = token$392;
                        message$395 = Messages$57.StrictParamDupe;
                    }
                }
                params$397.push(param$396);
                paramSet$400[param$396.name] = true;
                if (match$186(')')) {
                    break;
                }
                expect$180(',');
            }
        }
        expect$180(')');
        previousStrict$399 = strict$60;
        body$398 = parseFunctionSourceElements$371();
        if (strict$60 && firstRestricted$394) {
            throwError$166(firstRestricted$394, message$395);
        }
        strict$60 = previousStrict$399;
        return {
            type: Syntax$55.FunctionExpression,
            id: id$393,
            params: params$397,
            body: body$398
        };
    }
    function parseSourceElement$401() {
        var token$402 = lookahead$157().token;
        if (token$402.type === Token$53.Keyword) {
            switch (token$402.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$310(token$402.value);
            case 'function':
                return parseFunctionDeclaration$381();
            default:
                return parseStatement$367();
            }
        }
        if (token$402.type !== Token$53.EOF) {
            return parseStatement$367();
        }
    }
    function parseSourceElements$403() {
        var sourceElement$404, sourceElements$405 = [], token$406, directive$407, firstRestricted$408;
        while (index$61 < length$64) {
            token$406 = lookahead$157();
            if (token$406.type !== Token$53.StringLiteral) {
                break;
            }
            sourceElement$404 = parseSourceElement$401();
            sourceElements$405.push(sourceElement$404);
            if (sourceElement$404.expression.type !== Syntax$55.Literal) {
                break;
            }
            directive$407 = sliceSource$75(token$406.range[0] + 1, token$406.range[1] - 1);
            if (directive$407 === 'use strict') {
                strict$60 = true;
                if (firstRestricted$408) {
                    throwError$166(firstRestricted$408, Messages$57.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$408 && token$406.octal) {
                    firstRestricted$408 = token$406;
                }
            }
        }
        while (index$61 < length$64) {
            sourceElement$404 = parseSourceElement$401();
            if (typeof sourceElement$404 === 'undefined') {
                break;
            }
            sourceElements$405.push(sourceElement$404);
        }
        return sourceElements$405;
    }
    function parseProgram$409() {
        var program$410;
        strict$60 = false;
        program$410 = {
            type: Syntax$55.Program,
            body: parseSourceElements$403()
        };
        return program$410;
    }
    function addComment$411(start$412, end$413, type$414, value$415) {
        assert$69(typeof start$412 === 'number', 'Comment must have valid position');
        if (extra$68.comments.length > 0) {
            if (extra$68.comments[extra$68.comments.length - 1].range[1] > start$412) {
                return;
            }
        }
        extra$68.comments.push({
            range: [
                start$412,
                end$413
            ],
            type: type$414,
            value: value$415
        });
    }
    function scanComment$416() {
        var comment$417, ch$418, start$419, blockComment$420, lineComment$421;
        comment$417 = '';
        blockComment$420 = false;
        lineComment$421 = false;
        while (index$61 < length$64) {
            ch$418 = source$59[index$61];
            if (lineComment$421) {
                ch$418 = nextChar$104();
                if (index$61 >= length$64) {
                    lineComment$421 = false;
                    comment$417 += ch$418;
                    addComment$411(start$419, index$61, 'Line', comment$417);
                } else if (isLineTerminator$89(ch$418)) {
                    lineComment$421 = false;
                    addComment$411(start$419, index$61, 'Line', comment$417);
                    if (ch$418 === '\r' && source$59[index$61] === '\n') {
                        ++index$61;
                    }
                    ++lineNumber$62;
                    lineStart$63 = index$61;
                    comment$417 = '';
                } else {
                    comment$417 += ch$418;
                }
            } else if (blockComment$420) {
                if (isLineTerminator$89(ch$418)) {
                    if (ch$418 === '\r' && source$59[index$61 + 1] === '\n') {
                        ++index$61;
                        comment$417 += '\r\n';
                    } else {
                        comment$417 += ch$418;
                    }
                    ++lineNumber$62;
                    ++index$61;
                    lineStart$63 = index$61;
                    if (index$61 >= length$64) {
                        throwError$166({}, Messages$57.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$418 = nextChar$104();
                    if (index$61 >= length$64) {
                        throwError$166({}, Messages$57.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$417 += ch$418;
                    if (ch$418 === '*') {
                        ch$418 = source$59[index$61];
                        if (ch$418 === '/') {
                            comment$417 = comment$417.substr(0, comment$417.length - 1);
                            blockComment$420 = false;
                            ++index$61;
                            addComment$411(start$419, index$61, 'Block', comment$417);
                            comment$417 = '';
                        }
                    }
                }
            } else if (ch$418 === '/') {
                ch$418 = source$59[index$61 + 1];
                if (ch$418 === '/') {
                    start$419 = index$61;
                    index$61 += 2;
                    lineComment$421 = true;
                } else if (ch$418 === '*') {
                    start$419 = index$61;
                    index$61 += 2;
                    blockComment$420 = true;
                    if (index$61 >= length$64) {
                        throwError$166({}, Messages$57.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$87(ch$418)) {
                ++index$61;
            } else if (isLineTerminator$89(ch$418)) {
                ++index$61;
                if (ch$418 === '\r' && source$59[index$61] === '\n') {
                    ++index$61;
                }
                ++lineNumber$62;
                lineStart$63 = index$61;
            } else {
                break;
            }
        }
    }
    function collectToken$422() {
        var token$423 = extra$68.advance(), range$424, value$425;
        if (token$423.type !== Token$53.EOF) {
            range$424 = [
                token$423.range[0],
                token$423.range[1]
            ];
            value$425 = sliceSource$75(token$423.range[0], token$423.range[1]);
            extra$68.tokens.push({
                type: TokenName$54[token$423.type],
                value: value$425,
                lineNumber: lineNumber$62,
                lineStart: lineStart$63,
                range: range$424
            });
        }
        return token$423;
    }
    function collectRegex$426() {
        var pos$427, regex$428, token$429;
        skipComment$106();
        pos$427 = index$61;
        regex$428 = extra$68.scanRegExp();
        if (extra$68.tokens.length > 0) {
            token$429 = extra$68.tokens[extra$68.tokens.length - 1];
            if (token$429.range[0] === pos$427 && token$429.type === 'Punctuator') {
                if (token$429.value === '/' || token$429.value === '/=') {
                    extra$68.tokens.pop();
                }
            }
        }
        extra$68.tokens.push({
            type: 'RegularExpression',
            value: regex$428.literal,
            range: [
                pos$427,
                index$61
            ],
            lineStart: token$429.lineStart,
            lineNumber: token$429.lineNumber
        });
        return regex$428;
    }
    function createLiteral$430(token$431) {
        if (Array.isArray(token$431)) {
            return {
                type: Syntax$55.Literal,
                value: token$431
            };
        }
        return {
            type: Syntax$55.Literal,
            value: token$431.value,
            lineStart: token$431.lineStart,
            lineNumber: token$431.lineNumber
        };
    }
    function createRawLiteral$432(token$433) {
        return {
            type: Syntax$55.Literal,
            value: token$433.value,
            raw: sliceSource$75(token$433.range[0], token$433.range[1]),
            lineStart: token$433.lineStart,
            lineNumber: token$433.lineNumber
        };
    }
    function wrapTrackingFunction$434(range$435, loc$436) {
        return function (parseFunction$437) {
            function isBinary$438(node$439) {
                return node$439.type === Syntax$55.LogicalExpression || node$439.type === Syntax$55.BinaryExpression;
            }
            function visit$440(node$441) {
                if (isBinary$438(node$441.left)) {
                    visit$440(node$441.left);
                }
                if (isBinary$438(node$441.right)) {
                    visit$440(node$441.right);
                }
                if (range$435 && typeof node$441.range === 'undefined') {
                    node$441.range = [
                        node$441.left.range[0],
                        node$441.right.range[1]
                    ];
                }
                if (loc$436 && typeof node$441.loc === 'undefined') {
                    node$441.loc = {
                        start: node$441.left.loc.start,
                        end: node$441.right.loc.end
                    };
                }
            }
            return function () {
                var node$442, rangeInfo$443, locInfo$444;
                var curr$445 = tokenStream$67[index$61].token;
                rangeInfo$443 = [
                    curr$445.range[0],
                    0
                ];
                locInfo$444 = {start: {
                        line: curr$445.lineNumber,
                        column: curr$445.lineStart
                    }};
                node$442 = parseFunction$437.apply(null, arguments);
                if (typeof node$442 !== 'undefined') {
                    var last$446 = tokenStream$67[index$61].token;
                    if (range$435) {
                        rangeInfo$443[1] = last$446.range[1];
                        node$442.range = rangeInfo$443;
                    }
                    if (loc$436) {
                        locInfo$444.end = {
                            line: last$446.lineNumber,
                            column: last$446.lineStart
                        };
                        node$442.loc = locInfo$444;
                    }
                    if (isBinary$438(node$442)) {
                        visit$440(node$442);
                    }
                    if (node$442.type === Syntax$55.MemberExpression) {
                        if (typeof node$442.object.range !== 'undefined') {
                            node$442.range[0] = node$442.object.range[0];
                        }
                        if (typeof node$442.object.loc !== 'undefined') {
                            node$442.loc.start = node$442.object.loc.start;
                        }
                    }
                    if (node$442.type === Syntax$55.CallExpression) {
                        if (typeof node$442.callee.range !== 'undefined') {
                            node$442.range[0] = node$442.callee.range[0];
                        }
                        if (typeof node$442.callee.loc !== 'undefined') {
                            node$442.loc.start = node$442.callee.loc.start;
                        }
                    }
                    return node$442;
                }
            };
        };
    }
    function patch$447() {
        var wrapTracking$448;
        if (extra$68.comments) {
            extra$68.skipComment = skipComment$106;
            skipComment$106 = scanComment$416;
        }
        if (extra$68.raw) {
            extra$68.createLiteral = createLiteral$430;
            createLiteral$430 = createRawLiteral$432;
        }
        if (extra$68.range || extra$68.loc) {
            wrapTracking$448 = wrapTrackingFunction$434(extra$68.range, extra$68.loc);
            extra$68.parseAdditiveExpression = parseAdditiveExpression$265;
            extra$68.parseAssignmentExpression = parseAssignmentExpression$288;
            extra$68.parseBitwiseANDExpression = parseBitwiseANDExpression$274;
            extra$68.parseBitwiseORExpression = parseBitwiseORExpression$278;
            extra$68.parseBitwiseXORExpression = parseBitwiseXORExpression$276;
            extra$68.parseBlock = parseBlock$295;
            extra$68.parseFunctionSourceElements = parseFunctionSourceElements$371;
            extra$68.parseCallMember = parseCallMember$238;
            extra$68.parseCatchClause = parseCatchClause$360;
            extra$68.parseComputedMember = parseComputedMember$234;
            extra$68.parseConditionalExpression = parseConditionalExpression$284;
            extra$68.parseConstLetDeclaration = parseConstLetDeclaration$310;
            extra$68.parseEqualityExpression = parseEqualityExpression$272;
            extra$68.parseExpression = parseExpression$290;
            extra$68.parseForVariableDeclaration = parseForVariableDeclaration$328;
            extra$68.parseFunctionDeclaration = parseFunctionDeclaration$381;
            extra$68.parseFunctionExpression = parseFunctionExpression$391;
            extra$68.parseLogicalANDExpression = parseLogicalANDExpression$280;
            extra$68.parseLogicalORExpression = parseLogicalORExpression$282;
            extra$68.parseMultiplicativeExpression = parseMultiplicativeExpression$263;
            extra$68.parseNewExpression = parseNewExpression$240;
            extra$68.parseNonComputedMember = parseNonComputedMember$232;
            extra$68.parseNonComputedProperty = parseNonComputedProperty$230;
            extra$68.parseObjectProperty = parseObjectProperty$210;
            extra$68.parseObjectPropertyKey = parseObjectPropertyKey$208;
            extra$68.parsePostfixExpression = parsePostfixExpression$258;
            extra$68.parsePrimaryExpression = parsePrimaryExpression$223;
            extra$68.parseProgram = parseProgram$409;
            extra$68.parsePropertyFunction = parsePropertyFunction$203;
            extra$68.parseRelationalExpression = parseRelationalExpression$269;
            extra$68.parseStatement = parseStatement$367;
            extra$68.parseShiftExpression = parseShiftExpression$267;
            extra$68.parseSwitchCase = parseSwitchCase$350;
            extra$68.parseUnaryExpression = parseUnaryExpression$260;
            extra$68.parseVariableDeclaration = parseVariableDeclaration$301;
            extra$68.parseVariableIdentifier = parseVariableIdentifier$297;
            parseAdditiveExpression$265 = wrapTracking$448(extra$68.parseAdditiveExpression);
            parseAssignmentExpression$288 = wrapTracking$448(extra$68.parseAssignmentExpression);
            parseBitwiseANDExpression$274 = wrapTracking$448(extra$68.parseBitwiseANDExpression);
            parseBitwiseORExpression$278 = wrapTracking$448(extra$68.parseBitwiseORExpression);
            parseBitwiseXORExpression$276 = wrapTracking$448(extra$68.parseBitwiseXORExpression);
            parseBlock$295 = wrapTracking$448(extra$68.parseBlock);
            parseFunctionSourceElements$371 = wrapTracking$448(extra$68.parseFunctionSourceElements);
            parseCallMember$238 = wrapTracking$448(extra$68.parseCallMember);
            parseCatchClause$360 = wrapTracking$448(extra$68.parseCatchClause);
            parseComputedMember$234 = wrapTracking$448(extra$68.parseComputedMember);
            parseConditionalExpression$284 = wrapTracking$448(extra$68.parseConditionalExpression);
            parseConstLetDeclaration$310 = wrapTracking$448(extra$68.parseConstLetDeclaration);
            parseEqualityExpression$272 = wrapTracking$448(extra$68.parseEqualityExpression);
            parseExpression$290 = wrapTracking$448(extra$68.parseExpression);
            parseForVariableDeclaration$328 = wrapTracking$448(extra$68.parseForVariableDeclaration);
            parseFunctionDeclaration$381 = wrapTracking$448(extra$68.parseFunctionDeclaration);
            parseFunctionExpression$391 = wrapTracking$448(extra$68.parseFunctionExpression);
            parseLogicalANDExpression$280 = wrapTracking$448(extra$68.parseLogicalANDExpression);
            parseLogicalORExpression$282 = wrapTracking$448(extra$68.parseLogicalORExpression);
            parseMultiplicativeExpression$263 = wrapTracking$448(extra$68.parseMultiplicativeExpression);
            parseNewExpression$240 = wrapTracking$448(extra$68.parseNewExpression);
            parseNonComputedMember$232 = wrapTracking$448(extra$68.parseNonComputedMember);
            parseNonComputedProperty$230 = wrapTracking$448(extra$68.parseNonComputedProperty);
            parseObjectProperty$210 = wrapTracking$448(extra$68.parseObjectProperty);
            parseObjectPropertyKey$208 = wrapTracking$448(extra$68.parseObjectPropertyKey);
            parsePostfixExpression$258 = wrapTracking$448(extra$68.parsePostfixExpression);
            parsePrimaryExpression$223 = wrapTracking$448(extra$68.parsePrimaryExpression);
            parseProgram$409 = wrapTracking$448(extra$68.parseProgram);
            parsePropertyFunction$203 = wrapTracking$448(extra$68.parsePropertyFunction);
            parseRelationalExpression$269 = wrapTracking$448(extra$68.parseRelationalExpression);
            parseStatement$367 = wrapTracking$448(extra$68.parseStatement);
            parseShiftExpression$267 = wrapTracking$448(extra$68.parseShiftExpression);
            parseSwitchCase$350 = wrapTracking$448(extra$68.parseSwitchCase);
            parseUnaryExpression$260 = wrapTracking$448(extra$68.parseUnaryExpression);
            parseVariableDeclaration$301 = wrapTracking$448(extra$68.parseVariableDeclaration);
            parseVariableIdentifier$297 = wrapTracking$448(extra$68.parseVariableIdentifier);
        }
        if (typeof extra$68.tokens !== 'undefined') {
            extra$68.advance = advance$152;
            extra$68.scanRegExp = scanRegExp$140;
            advance$152 = collectToken$422;
            scanRegExp$140 = collectRegex$426;
        }
    }
    function unpatch$449() {
        if (typeof extra$68.skipComment === 'function') {
            skipComment$106 = extra$68.skipComment;
        }
        if (extra$68.raw) {
            createLiteral$430 = extra$68.createLiteral;
        }
        if (extra$68.range || extra$68.loc) {
            parseAdditiveExpression$265 = extra$68.parseAdditiveExpression;
            parseAssignmentExpression$288 = extra$68.parseAssignmentExpression;
            parseBitwiseANDExpression$274 = extra$68.parseBitwiseANDExpression;
            parseBitwiseORExpression$278 = extra$68.parseBitwiseORExpression;
            parseBitwiseXORExpression$276 = extra$68.parseBitwiseXORExpression;
            parseBlock$295 = extra$68.parseBlock;
            parseFunctionSourceElements$371 = extra$68.parseFunctionSourceElements;
            parseCallMember$238 = extra$68.parseCallMember;
            parseCatchClause$360 = extra$68.parseCatchClause;
            parseComputedMember$234 = extra$68.parseComputedMember;
            parseConditionalExpression$284 = extra$68.parseConditionalExpression;
            parseConstLetDeclaration$310 = extra$68.parseConstLetDeclaration;
            parseEqualityExpression$272 = extra$68.parseEqualityExpression;
            parseExpression$290 = extra$68.parseExpression;
            parseForVariableDeclaration$328 = extra$68.parseForVariableDeclaration;
            parseFunctionDeclaration$381 = extra$68.parseFunctionDeclaration;
            parseFunctionExpression$391 = extra$68.parseFunctionExpression;
            parseLogicalANDExpression$280 = extra$68.parseLogicalANDExpression;
            parseLogicalORExpression$282 = extra$68.parseLogicalORExpression;
            parseMultiplicativeExpression$263 = extra$68.parseMultiplicativeExpression;
            parseNewExpression$240 = extra$68.parseNewExpression;
            parseNonComputedMember$232 = extra$68.parseNonComputedMember;
            parseNonComputedProperty$230 = extra$68.parseNonComputedProperty;
            parseObjectProperty$210 = extra$68.parseObjectProperty;
            parseObjectPropertyKey$208 = extra$68.parseObjectPropertyKey;
            parsePrimaryExpression$223 = extra$68.parsePrimaryExpression;
            parsePostfixExpression$258 = extra$68.parsePostfixExpression;
            parseProgram$409 = extra$68.parseProgram;
            parsePropertyFunction$203 = extra$68.parsePropertyFunction;
            parseRelationalExpression$269 = extra$68.parseRelationalExpression;
            parseStatement$367 = extra$68.parseStatement;
            parseShiftExpression$267 = extra$68.parseShiftExpression;
            parseSwitchCase$350 = extra$68.parseSwitchCase;
            parseUnaryExpression$260 = extra$68.parseUnaryExpression;
            parseVariableDeclaration$301 = extra$68.parseVariableDeclaration;
            parseVariableIdentifier$297 = extra$68.parseVariableIdentifier;
        }
        if (typeof extra$68.scanRegExp === 'function') {
            advance$152 = extra$68.advance;
            scanRegExp$140 = extra$68.scanRegExp;
        }
    }
    function stringToArray$450(str$451) {
        var length$452 = str$451.length, result$453 = [], i$454;
        for (i$454 = 0; i$454 < length$452; ++i$454) {
            result$453[i$454] = str$451.charAt(i$454);
        }
        return result$453;
    }
    function blockAllowed$455(toks$456, start$457, inExprDelim$458, parentIsBlock$459) {
        var assignOps$460 = [
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
        var binaryOps$461 = [
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
        var unaryOps$462 = [
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
        function back$463(n$464) {
            var idx$465 = toks$456.length - n$464 > 0 ? toks$456.length - n$464 : 0;
            return toks$456[idx$465];
        }
        if (inExprDelim$458 && toks$456.length - (start$457 + 2) <= 0) {
            return false;
        } else if (back$463(start$457 + 2).value === ':' && parentIsBlock$459) {
            return true;
        } else if (isIn$72(back$463(start$457 + 2).value, unaryOps$462.concat(binaryOps$461).concat(assignOps$460))) {
            return false;
        } else if (back$463(start$457 + 2).value === 'return') {
            var currLineNumber$466 = typeof back$463(start$457 + 1).startLineNumber !== 'undefined' ? back$463(start$457 + 1).startLineNumber : back$463(start$457 + 1).lineNumber;
            if (back$463(start$457 + 2).lineNumber !== currLineNumber$466) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$72(back$463(start$457 + 2).value, [
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
    function readToken$467(toks$468, inExprDelim$469, parentIsBlock$470) {
        var delimiters$471 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$472 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$473 = toks$468.length - 1;
        function back$474(n$475) {
            var idx$476 = toks$468.length - n$475 > 0 ? toks$468.length - n$475 : 0;
            return toks$468[idx$476];
        }
        skipComment$106();
        if (isIn$72(getChar$105(), delimiters$471)) {
            return readDelim$478(toks$468, inExprDelim$469, parentIsBlock$470);
        }
        if (getChar$105() === '/') {
            var prev$477 = back$474(1);
            if (prev$477) {
                if (prev$477.value === '()') {
                    if (isIn$72(back$474(2).value, parenIdents$472)) {
                        return scanRegExp$140();
                    }
                    return advance$152();
                }
                if (prev$477.value === '{}') {
                    if (blockAllowed$455(toks$468, 0, inExprDelim$469, parentIsBlock$470)) {
                        if (back$474(2).value === '()') {
                            if (back$474(4).value === 'function') {
                                if (!blockAllowed$455(toks$468, 3, inExprDelim$469, parentIsBlock$470)) {
                                    return advance$152();
                                }
                                if (toks$468.length - 5 <= 0 && inExprDelim$469) {
                                    return advance$152();
                                }
                            }
                            if (back$474(3).value === 'function') {
                                if (!blockAllowed$455(toks$468, 2, inExprDelim$469, parentIsBlock$470)) {
                                    return advance$152();
                                }
                                if (toks$468.length - 4 <= 0 && inExprDelim$469) {
                                    return advance$152();
                                }
                            }
                        }
                        return scanRegExp$140();
                    } else {
                        return advance$152();
                    }
                }
                if (prev$477.type === Token$53.Punctuator) {
                    return scanRegExp$140();
                }
                if (isKeyword$101(prev$477.value)) {
                    return scanRegExp$140();
                }
                return advance$152();
            }
            return scanRegExp$140();
        }
        return advance$152();
    }
    function readDelim$478(toks$479, inExprDelim$480, parentIsBlock$481) {
        var startDelim$482 = advance$152(), matchDelim$483 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$484 = [];
        var delimiters$485 = [
                '(',
                '{',
                '['
            ];
        assert$69(delimiters$485.indexOf(startDelim$482.value) !== -1, 'Need to begin at the delimiter');
        var token$486 = startDelim$482;
        var startLineNumber$487 = token$486.lineNumber;
        var startLineStart$488 = token$486.lineStart;
        var startRange$489 = token$486.range;
        var delimToken$490 = {};
        delimToken$490.type = Token$53.Delimiter;
        delimToken$490.value = startDelim$482.value + matchDelim$483[startDelim$482.value];
        delimToken$490.startLineNumber = startLineNumber$487;
        delimToken$490.startLineStart = startLineStart$488;
        delimToken$490.startRange = startRange$489;
        var delimIsBlock$491 = false;
        if (startDelim$482.value === '{') {
            delimIsBlock$491 = blockAllowed$455(toks$479.concat(delimToken$490), 0, inExprDelim$480, parentIsBlock$481);
        }
        while (index$61 <= length$64) {
            token$486 = readToken$467(inner$484, startDelim$482.value === '(' || startDelim$482.value === '[', delimIsBlock$491);
            if (token$486.type === Token$53.Punctuator && token$486.value === matchDelim$483[startDelim$482.value]) {
                break;
            } else if (token$486.type === Token$53.EOF) {
                throwError$166({}, Messages$57.UnexpectedEOS);
            } else {
                inner$484.push(token$486);
            }
        }
        if (index$61 >= length$64 && matchDelim$483[startDelim$482.value] !== source$59[length$64 - 1]) {
            throwError$166({}, Messages$57.UnexpectedEOS);
        }
        var endLineNumber$492 = token$486.lineNumber;
        var endLineStart$493 = token$486.lineStart;
        var endRange$494 = token$486.range;
        delimToken$490.inner = inner$484;
        delimToken$490.endLineNumber = endLineNumber$492;
        delimToken$490.endLineStart = endLineStart$493;
        delimToken$490.endRange = endRange$494;
        return delimToken$490;
    }
    ;
    function read$495(code$496) {
        var token$497, tokenTree$498 = [];
        source$59 = code$496;
        index$61 = 0;
        lineNumber$62 = source$59.length > 0 ? 1 : 0;
        lineStart$63 = 0;
        length$64 = source$59.length;
        buffer$65 = null;
        state$66 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$61 < length$64) {
            tokenTree$498.push(readToken$467(tokenTree$498, false, false));
        }
        var last$499 = tokenTree$498[tokenTree$498.length - 1];
        if (last$499 && last$499.type !== Token$53.EOF) {
            tokenTree$498.push({
                type: Token$53.EOF,
                value: '',
                lineNumber: last$499.lineNumber,
                lineStart: last$499.lineStart,
                range: [
                    index$61,
                    index$61
                ]
            });
        }
        return expander$52.tokensToSyntax(tokenTree$498);
    }
    function parse$500(code$501, nodeType$502, options$503) {
        var program$504, toString$505;
        tokenStream$67 = code$501;
        nodeType$502 = nodeType$502 || 'base';
        index$61 = 0;
        length$64 = tokenStream$67.length;
        buffer$65 = null;
        state$66 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$68 = {};
        if (typeof options$503 !== 'undefined') {
            if (options$503.range || options$503.loc) {
                assert$69(false, 'Note range and loc is not currently implemented');
            }
            extra$68.range = typeof options$503.range === 'boolean' && options$503.range;
            extra$68.loc = typeof options$503.loc === 'boolean' && options$503.loc;
            extra$68.raw = typeof options$503.raw === 'boolean' && options$503.raw;
            if (typeof options$503.tokens === 'boolean' && options$503.tokens) {
                extra$68.tokens = [];
            }
            if (typeof options$503.comment === 'boolean' && options$503.comment) {
                extra$68.comments = [];
            }
            if (typeof options$503.tolerant === 'boolean' && options$503.tolerant) {
                extra$68.errors = [];
            }
            if (typeof options$503.noresolve === 'boolean' && options$503.noresolve) {
                extra$68.noresolve = options$503.noresolve;
            } else {
                extra$68.noresolve = false;
            }
        }
        patch$447();
        try {
            var classToParse$506 = {
                    'base': parseProgram$409,
                    'Program': parseProgram$409,
                    'expr': parseAssignmentExpression$288,
                    'ident': parsePrimaryExpression$223,
                    'lit': parsePrimaryExpression$223,
                    'LogicalANDExpression': parseLogicalANDExpression$280,
                    'PrimaryExpression': parsePrimaryExpression$223,
                    'VariableDeclarationList': parseVariableDeclarationList$305,
                    'StatementList': parseStatementList$292,
                    'SourceElements': function () {
                        state$66.inFunctionBody = true;
                        return parseSourceElements$403();
                    },
                    'FunctionDeclaration': parseFunctionDeclaration$381,
                    'FunctionExpression': parseFunctionExpression$391,
                    'ExpressionStatement': parseExpressionStatement$314,
                    'IfStatement': parseIfStatement$316,
                    'BreakStatement': parseBreakStatement$341,
                    'ContinueStatement': parseContinueStatement$338,
                    'WithStatement': parseWithStatement$347,
                    'SwitchStatement': parseSwitchStatement$354,
                    'ReturnStatement': parseReturnStatement$344,
                    'ThrowStatement': parseThrowStatement$358,
                    'TryStatement': parseTryStatement$362,
                    'WhileStatement': parseWhileStatement$324,
                    'ForStatement': parseForStatement$330,
                    'VariableDeclaration': parseVariableDeclaration$301,
                    'ArrayExpression': parseArrayInitialiser$200,
                    'ObjectExpression': parseObjectInitialiser$215,
                    'SequenceExpression': parseExpression$290,
                    'AssignmentExpression': parseAssignmentExpression$288,
                    'ConditionalExpression': parseConditionalExpression$284,
                    'NewExpression': parseNewExpression$240,
                    'CallExpression': parseLeftHandSideExpressionAllowCall$252,
                    'Block': parseBlock$295
                };
            if (classToParse$506[nodeType$502]) {
                program$504 = classToParse$506[nodeType$502]();
            } else {
                assert$69(false, 'unmatched parse class' + nodeType$502);
            }
            if (typeof extra$68.comments !== 'undefined') {
                program$504.comments = extra$68.comments;
            }
            if (typeof extra$68.tokens !== 'undefined') {
                program$504.tokens = tokenStream$67.slice(0, index$61);
            }
            if (typeof extra$68.errors !== 'undefined') {
                program$504.errors = extra$68.errors;
            }
        } catch (e$507) {
            throw e$507;
        } finally {
            unpatch$449();
            extra$68 = {};
        }
        return program$504;
    }
    exports$51.parse = parse$500;
    exports$51.read = read$495;
    exports$51.Token = Token$53;
    exports$51.assert = assert$69;
    exports$51.Syntax = function () {
        var name$508, types$509 = {};
        if (typeof Object.create === 'function') {
            types$509 = Object.create(null);
        }
        for (name$508 in Syntax$55) {
            if (Syntax$55.hasOwnProperty(name$508)) {
                types$509[name$508] = Syntax$55[name$508];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$509);
        }
        return types$509;
    }();
}));