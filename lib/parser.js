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
                        throwError$163({}, Messages$57.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$107 = nextChar$104();
                    if (index$61 >= length$64) {
                        throwError$163({}, Messages$57.UnexpectedToken, 'ILLEGAL');
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
                        throwError$163({}, Messages$57.UnexpectedToken, 'ILLEGAL');
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
        var start$122 = index$61, ch1$123 = source$59[index$61], ch2, ch3, ch4;
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
        ch2 = source$59[index$61 + 1];
        if (ch1$123 === '.' && !isDecimalDigit$81(ch2)) {
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
        ch3 = source$59[index$61 + 2];
        ch4 = source$59[index$61 + 3];
        if (ch1$123 === '>' && ch2 === '>' && ch3 === '>') {
            if (ch4 === '=') {
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
        if (ch1$123 === '=' && ch2 === '=' && ch3 === '=') {
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
        if (ch1$123 === '!' && ch2 === '=' && ch3 === '=') {
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
        if (ch1$123 === '>' && ch2 === '>' && ch3 === '>') {
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
        if (ch1$123 === '<' && ch2 === '<' && ch3 === '=') {
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
        if (ch1$123 === '>' && ch2 === '>' && ch3 === '=') {
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
        if (ch2 === '=') {
            if ('<>=!+-*%&|^/'.indexOf(ch1$123) >= 0) {
                index$61 += 2;
                return {
                    type: Token$53.Punctuator,
                    value: ch1$123 + ch2,
                    lineNumber: lineNumber$62,
                    lineStart: lineStart$63,
                    range: [
                        start$122,
                        index$61
                    ]
                };
            }
        }
        if (ch1$123 === ch2 && '+-<>&|'.indexOf(ch1$123) >= 0) {
            if ('+-<>&|'.indexOf(ch2) >= 0) {
                index$61 += 2;
                return {
                    type: Token$53.Punctuator,
                    value: ch1$123 + ch2,
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
    function scanNumericLiteral$124() {
        var number$125, start$126, ch$127;
        ch$127 = source$59[index$61];
        assert$69(isDecimalDigit$81(ch$127) || ch$127 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$126 = index$61;
        number$125 = '';
        if (ch$127 !== '.') {
            number$125 = nextChar$104();
            ch$127 = source$59[index$61];
            if (number$125 === '0') {
                if (ch$127 === 'x' || ch$127 === 'X') {
                    number$125 += nextChar$104();
                    while (index$61 < length$64) {
                        ch$127 = source$59[index$61];
                        if (!isHexDigit$83(ch$127)) {
                            break;
                        }
                        number$125 += nextChar$104();
                    }
                    if (number$125.length <= 2) {
                        throwError$163({}, Messages$57.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$61 < length$64) {
                        ch$127 = source$59[index$61];
                        if (isIdentifierStart$91(ch$127)) {
                            throwError$163({}, Messages$57.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$53.NumericLiteral,
                        value: parseInt(number$125, 16),
                        lineNumber: lineNumber$62,
                        lineStart: lineStart$63,
                        range: [
                            start$126,
                            index$61
                        ]
                    };
                } else if (isOctalDigit$85(ch$127)) {
                    number$125 += nextChar$104();
                    while (index$61 < length$64) {
                        ch$127 = source$59[index$61];
                        if (!isOctalDigit$85(ch$127)) {
                            break;
                        }
                        number$125 += nextChar$104();
                    }
                    if (index$61 < length$64) {
                        ch$127 = source$59[index$61];
                        if (isIdentifierStart$91(ch$127) || isDecimalDigit$81(ch$127)) {
                            throwError$163({}, Messages$57.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$53.NumericLiteral,
                        value: parseInt(number$125, 8),
                        octal: true,
                        lineNumber: lineNumber$62,
                        lineStart: lineStart$63,
                        range: [
                            start$126,
                            index$61
                        ]
                    };
                }
                if (isDecimalDigit$81(ch$127)) {
                    throwError$163({}, Messages$57.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (index$61 < length$64) {
                ch$127 = source$59[index$61];
                if (!isDecimalDigit$81(ch$127)) {
                    break;
                }
                number$125 += nextChar$104();
            }
        }
        if (ch$127 === '.') {
            number$125 += nextChar$104();
            while (index$61 < length$64) {
                ch$127 = source$59[index$61];
                if (!isDecimalDigit$81(ch$127)) {
                    break;
                }
                number$125 += nextChar$104();
            }
        }
        if (ch$127 === 'e' || ch$127 === 'E') {
            number$125 += nextChar$104();
            ch$127 = source$59[index$61];
            if (ch$127 === '+' || ch$127 === '-') {
                number$125 += nextChar$104();
            }
            ch$127 = source$59[index$61];
            if (isDecimalDigit$81(ch$127)) {
                number$125 += nextChar$104();
                while (index$61 < length$64) {
                    ch$127 = source$59[index$61];
                    if (!isDecimalDigit$81(ch$127)) {
                        break;
                    }
                    number$125 += nextChar$104();
                }
            } else {
                ch$127 = 'character ' + ch$127;
                if (index$61 >= length$64) {
                    ch$127 = '<end>';
                }
                throwError$163({}, Messages$57.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (index$61 < length$64) {
            ch$127 = source$59[index$61];
            if (isIdentifierStart$91(ch$127)) {
                throwError$163({}, Messages$57.UnexpectedToken, 'ILLEGAL');
            }
        }
        return {
            type: Token$53.NumericLiteral,
            value: parseFloat(number$125),
            lineNumber: lineNumber$62,
            lineStart: lineStart$63,
            range: [
                start$126,
                index$61
            ]
        };
    }
    function scanStringLiteral$128() {
        var str$129 = '', quote$130, start$131, ch$132, code$133, unescaped$134, restore$135, octal$136 = false;
        quote$130 = source$59[index$61];
        assert$69(quote$130 === '\'' || quote$130 === '"', 'String literal must starts with a quote');
        start$131 = index$61;
        ++index$61;
        while (index$61 < length$64) {
            ch$132 = nextChar$104();
            if (ch$132 === quote$130) {
                quote$130 = '';
                break;
            } else if (ch$132 === '\\') {
                ch$132 = nextChar$104();
                if (!isLineTerminator$89(ch$132)) {
                    switch (ch$132) {
                    case 'n':
                        str$129 += '\n';
                        break;
                    case 'r':
                        str$129 += '\r';
                        break;
                    case 't':
                        str$129 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        restore$135 = index$61;
                        unescaped$134 = scanHexEscape$110(ch$132);
                        if (unescaped$134) {
                            str$129 += unescaped$134;
                        } else {
                            index$61 = restore$135;
                            str$129 += ch$132;
                        }
                        break;
                    case 'b':
                        str$129 += '\b';
                        break;
                    case 'f':
                        str$129 += '\f';
                        break;
                    case 'v':
                        str$129 += '\v';
                        break;
                    default:
                        if (isOctalDigit$85(ch$132)) {
                            code$133 = '01234567'.indexOf(ch$132);
                            if (code$133 !== 0) {
                                octal$136 = true;
                            }
                            if (index$61 < length$64 && isOctalDigit$85(source$59[index$61])) {
                                octal$136 = true;
                                code$133 = code$133 * 8 + '01234567'.indexOf(nextChar$104());
                                if ('0123'.indexOf(ch$132) >= 0 && index$61 < length$64 && isOctalDigit$85(source$59[index$61])) {
                                    code$133 = code$133 * 8 + '01234567'.indexOf(nextChar$104());
                                }
                            }
                            str$129 += String.fromCharCode(code$133);
                        } else {
                            str$129 += ch$132;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$62;
                    if (ch$132 === '\r' && source$59[index$61] === '\n') {
                        ++index$61;
                    }
                }
            } else if (isLineTerminator$89(ch$132)) {
                break;
            } else {
                str$129 += ch$132;
            }
        }
        if (quote$130 !== '') {
            throwError$163({}, Messages$57.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$53.StringLiteral,
            value: str$129,
            octal: octal$136,
            lineNumber: lineNumber$62,
            lineStart: lineStart$63,
            range: [
                start$131,
                index$61
            ]
        };
    }
    function scanRegExp$137() {
        var str$138 = '', ch$139, start$140, pattern$141, flags$142, value$143, classMarker$144 = false, restore$145;
        buffer$65 = null;
        skipComment$106();
        start$140 = index$61;
        ch$139 = source$59[index$61];
        assert$69(ch$139 === '/', 'Regular expression literal must start with a slash');
        str$138 = nextChar$104();
        while (index$61 < length$64) {
            ch$139 = nextChar$104();
            str$138 += ch$139;
            if (classMarker$144) {
                if (ch$139 === ']') {
                    classMarker$144 = false;
                }
            } else {
                if (ch$139 === '\\') {
                    ch$139 = nextChar$104();
                    if (isLineTerminator$89(ch$139)) {
                        throwError$163({}, Messages$57.UnterminatedRegExp);
                    }
                    str$138 += ch$139;
                } else if (ch$139 === '/') {
                    break;
                } else if (ch$139 === '[') {
                    classMarker$144 = true;
                } else if (isLineTerminator$89(ch$139)) {
                    throwError$163({}, Messages$57.UnterminatedRegExp);
                }
            }
        }
        if (str$138.length === 1) {
            throwError$163({}, Messages$57.UnterminatedRegExp);
        }
        pattern$141 = str$138.substr(1, str$138.length - 2);
        flags$142 = '';
        while (index$61 < length$64) {
            ch$139 = source$59[index$61];
            if (!isIdentifierPart$93(ch$139)) {
                break;
            }
            ++index$61;
            if (ch$139 === '\\' && index$61 < length$64) {
                ch$139 = source$59[index$61];
                if (ch$139 === 'u') {
                    ++index$61;
                    restore$145 = index$61;
                    ch$139 = scanHexEscape$110('u');
                    if (ch$139) {
                        flags$142 += ch$139;
                        str$138 += '\\u';
                        for (; restore$145 < index$61; ++restore$145) {
                            str$138 += source$59[restore$145];
                        }
                    } else {
                        index$61 = restore$145;
                        flags$142 += 'u';
                        str$138 += '\\u';
                    }
                } else {
                    str$138 += '\\';
                }
            } else {
                flags$142 += ch$139;
                str$138 += ch$139;
            }
        }
        try {
            value$143 = new RegExp(pattern$141, flags$142);
        } catch (e$146) {
            throwError$163({}, Messages$57.InvalidRegExp);
        }
        return {
            type: Token$53.RegexLiteral,
            literal: str$138,
            value: value$143,
            lineNumber: lineNumber$62,
            lineStart: lineStart$63,
            range: [
                start$140,
                index$61
            ]
        };
    }
    function isIdentifierName$147(token$148) {
        return token$148.type === Token$53.Identifier || token$148.type === Token$53.Keyword || token$148.type === Token$53.BooleanLiteral || token$148.type === Token$53.NullLiteral;
    }
    function advance$149() {
        var ch$150, token$151;
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
        ch$150 = source$59[index$61];
        token$151 = scanPunctuator$121();
        if (typeof token$151 !== 'undefined') {
            return token$151;
        }
        if (ch$150 === '\'' || ch$150 === '"') {
            return scanStringLiteral$128();
        }
        if (ch$150 === '.' || isDecimalDigit$81(ch$150)) {
            return scanNumericLiteral$124();
        }
        token$151 = scanIdentifier$116();
        if (typeof token$151 !== 'undefined') {
            return token$151;
        }
        throwError$163({}, Messages$57.UnexpectedToken, 'ILLEGAL');
    }
    function lex$152() {
        var token$153;
        if (buffer$65) {
            token$153 = buffer$65;
            buffer$65 = null;
            index$61++;
            return token$153;
        }
        buffer$65 = null;
        return tokenStream$67[index$61++];
    }
    function lookahead$154() {
        var pos$155, line$156, start$157;
        if (buffer$65 !== null) {
            return buffer$65;
        }
        buffer$65 = tokenStream$67[index$61];
        return buffer$65;
    }
    function peekLineTerminator$158() {
        var pos$159, line$160, start$161, found$162;
        found$162 = tokenStream$67[index$61 - 1].token.lineNumber !== tokenStream$67[index$61].token.lineNumber;
        return found$162;
    }
    function throwError$163(token$164, messageFormat$165) {
        var error$166, args$167 = Array.prototype.slice.call(arguments, 2), msg$168 = messageFormat$165.replace(/%(\d)/g, function (whole$169, index$170) {
                return args$167[index$170] || '';
            });
        if (typeof token$164.lineNumber === 'number') {
            error$166 = new Error('Line ' + token$164.lineNumber + ': ' + msg$168);
            error$166.lineNumber = token$164.lineNumber;
            if (token$164.range && token$164.range.length > 0) {
                error$166.index = token$164.range[0];
                error$166.column = token$164.range[0] - lineStart$63 + 1;
            }
        } else {
            error$166 = new Error('Line ' + lineNumber$62 + ': ' + msg$168);
            error$166.index = index$61;
            error$166.lineNumber = lineNumber$62;
            error$166.column = index$61 - lineStart$63 + 1;
        }
        throw error$166;
    }
    function throwErrorTolerant$171() {
        var error$172;
        try {
            throwError$163.apply(null, arguments);
        } catch (e$173) {
            if (extra$68.errors) {
                extra$68.errors.push(e$173);
            } else {
                throw e$173;
            }
        }
    }
    function throwUnexpected$174(token$175) {
        var s$176;
        if (token$175.type === Token$53.EOF) {
            throwError$163(token$175, Messages$57.UnexpectedEOS);
        }
        if (token$175.type === Token$53.NumericLiteral) {
            throwError$163(token$175, Messages$57.UnexpectedNumber);
        }
        if (token$175.type === Token$53.StringLiteral) {
            throwError$163(token$175, Messages$57.UnexpectedString);
        }
        if (token$175.type === Token$53.Identifier) {
            console.log(token$175);
            throwError$163(token$175, Messages$57.UnexpectedIdentifier);
        }
        if (token$175.type === Token$53.Keyword) {
            if (isFutureReservedWord$95(token$175.value)) {
                throwError$163(token$175, Messages$57.UnexpectedReserved);
            } else if (strict$60 && isStrictModeReservedWord$97(token$175.value)) {
                throwError$163(token$175, Messages$57.StrictReservedWord);
            }
            throwError$163(token$175, Messages$57.UnexpectedToken, token$175.value);
        }
        throwError$163(token$175, Messages$57.UnexpectedToken, token$175.value);
    }
    function expect$177(value$178) {
        var token$179 = lex$152().token;
        if (token$179.type !== Token$53.Punctuator || token$179.value !== value$178) {
            throwUnexpected$174(token$179);
        }
    }
    function expectKeyword$180(keyword$181) {
        var token$182 = lex$152().token;
        if (token$182.type !== Token$53.Keyword || token$182.value !== keyword$181) {
            throwUnexpected$174(token$182);
        }
    }
    function match$183(value$184) {
        var token$185 = lookahead$154().token;
        return token$185.type === Token$53.Punctuator && token$185.value === value$184;
    }
    function matchKeyword$186(keyword$187) {
        var token$188 = lookahead$154().token;
        return token$188.type === Token$53.Keyword && token$188.value === keyword$187;
    }
    function matchAssign$189() {
        var token$190 = lookahead$154().token, op$191 = token$190.value;
        if (token$190.type !== Token$53.Punctuator) {
            return false;
        }
        return op$191 === '=' || op$191 === '*=' || op$191 === '/=' || op$191 === '%=' || op$191 === '+=' || op$191 === '-=' || op$191 === '<<=' || op$191 === '>>=' || op$191 === '>>>=' || op$191 === '&=' || op$191 === '^=' || op$191 === '|=';
    }
    function consumeSemicolon$192() {
        var token$193, line$194;
        if (tokenStream$67[index$61].token.value === ';') {
            lex$152().token;
            return;
        }
        line$194 = tokenStream$67[index$61 - 1].token.lineNumber;
        token$193 = tokenStream$67[index$61].token;
        if (line$194 !== token$193.lineNumber) {
            return;
        }
        if (token$193.type !== Token$53.EOF && !match$183('}')) {
            throwUnexpected$174(token$193);
        }
        return;
    }
    function isLeftHandSide$195(expr$196) {
        return expr$196.type === Syntax$55.Identifier || expr$196.type === Syntax$55.MemberExpression;
    }
    function parseArrayInitialiser$197() {
        var elements$198 = [], undef$199;
        expect$177('[');
        while (!match$183(']')) {
            if (match$183(',')) {
                lex$152().token;
                elements$198.push(undef$199);
            } else {
                elements$198.push(parseAssignmentExpression$285());
                if (!match$183(']')) {
                    expect$177(',');
                }
            }
        }
        expect$177(']');
        return {
            type: Syntax$55.ArrayExpression,
            elements: elements$198
        };
    }
    function parsePropertyFunction$200(param$201, first$202) {
        var previousStrict$203, body$204;
        previousStrict$203 = strict$60;
        body$204 = parseFunctionSourceElements$368();
        if (first$202 && strict$60 && isRestrictedWord$99(param$201[0].name)) {
            throwError$163(first$202, Messages$57.StrictParamName);
        }
        strict$60 = previousStrict$203;
        return {
            type: Syntax$55.FunctionExpression,
            id: null,
            params: param$201,
            body: body$204
        };
    }
    function parseObjectPropertyKey$205() {
        var token$206 = lex$152().token;
        if (token$206.type === Token$53.StringLiteral || token$206.type === Token$53.NumericLiteral) {
            if (strict$60 && token$206.octal) {
                throwError$163(token$206, Messages$57.StrictOctalLiteral);
            }
            return createLiteral$427(token$206);
        }
        return {
            type: Syntax$55.Identifier,
            name: token$206.value
        };
    }
    function parseObjectProperty$207() {
        var token$208, key$209, id$210, param$211;
        token$208 = lookahead$154().token;
        if (token$208.type === Token$53.Identifier) {
            id$210 = parseObjectPropertyKey$205();
            if (token$208.value === 'get' && !match$183(':')) {
                key$209 = parseObjectPropertyKey$205();
                expect$177('(');
                expect$177(')');
                return {
                    type: Syntax$55.Property,
                    key: key$209,
                    value: parsePropertyFunction$200([]),
                    kind: 'get'
                };
            } else if (token$208.value === 'set' && !match$183(':')) {
                key$209 = parseObjectPropertyKey$205();
                expect$177('(');
                token$208 = lookahead$154().token;
                if (token$208.type !== Token$53.Identifier) {
                    throwUnexpected$174(lex$152().token);
                }
                param$211 = [parseVariableIdentifier$294()];
                expect$177(')');
                return {
                    type: Syntax$55.Property,
                    key: key$209,
                    value: parsePropertyFunction$200(param$211, token$208),
                    kind: 'set'
                };
            } else {
                expect$177(':');
                return {
                    type: Syntax$55.Property,
                    key: id$210,
                    value: parseAssignmentExpression$285(),
                    kind: 'init'
                };
            }
        } else if (token$208.type === Token$53.EOF || token$208.type === Token$53.Punctuator) {
            throwUnexpected$174(token$208);
        } else {
            key$209 = parseObjectPropertyKey$205();
            expect$177(':');
            return {
                type: Syntax$55.Property,
                key: key$209,
                value: parseAssignmentExpression$285(),
                kind: 'init'
            };
        }
    }
    function parseObjectInitialiser$212() {
        var token$213, properties$214 = [], property$215, name$216, kind$217, map$218 = {}, toString$219 = String;
        expect$177('{');
        while (!match$183('}')) {
            property$215 = parseObjectProperty$207();
            if (property$215.key.type === Syntax$55.Identifier) {
                name$216 = property$215.key.name;
            } else {
                name$216 = toString$219(property$215.key.value);
            }
            kind$217 = property$215.kind === 'init' ? PropertyKind$56.Data : property$215.kind === 'get' ? PropertyKind$56.Get : PropertyKind$56.Set;
            if (Object.prototype.hasOwnProperty.call(map$218, name$216)) {
                if (map$218[name$216] === PropertyKind$56.Data) {
                    if (strict$60 && kind$217 === PropertyKind$56.Data) {
                        throwErrorTolerant$171({}, Messages$57.StrictDuplicateProperty);
                    } else if (kind$217 !== PropertyKind$56.Data) {
                        throwError$163({}, Messages$57.AccessorDataProperty);
                    }
                } else {
                    if (kind$217 === PropertyKind$56.Data) {
                        throwError$163({}, Messages$57.AccessorDataProperty);
                    } else if (map$218[name$216] & kind$217) {
                        throwError$163({}, Messages$57.AccessorGetSet);
                    }
                }
                map$218[name$216] |= kind$217;
            } else {
                map$218[name$216] = kind$217;
            }
            properties$214.push(property$215);
            if (!match$183('}')) {
                expect$177(',');
            }
        }
        expect$177('}');
        return {
            type: Syntax$55.ObjectExpression,
            properties: properties$214
        };
    }
    function parsePrimaryExpression$220() {
        var expr$221, token$222 = lookahead$154().token, type$223 = token$222.type;
        if (type$223 === Token$53.Identifier) {
            var name$224 = extra$68.noresolve ? lex$152().token.value : expander$52.resolve(lex$152());
            return {
                type: Syntax$55.Identifier,
                name: name$224
            };
        }
        if (type$223 === Token$53.StringLiteral || type$223 === Token$53.NumericLiteral) {
            if (strict$60 && token$222.octal) {
                throwErrorTolerant$171(token$222, Messages$57.StrictOctalLiteral);
            }
            return createLiteral$427(lex$152().token);
        }
        if (type$223 === Token$53.Keyword) {
            if (matchKeyword$186('this')) {
                lex$152().token;
                return {type: Syntax$55.ThisExpression};
            }
            if (matchKeyword$186('function')) {
                return parseFunctionExpression$388();
            }
        }
        if (type$223 === Token$53.BooleanLiteral) {
            lex$152();
            token$222.value = token$222.value === 'true';
            return createLiteral$427(token$222);
        }
        if (type$223 === Token$53.NullLiteral) {
            lex$152();
            token$222.value = null;
            return createLiteral$427(token$222);
        }
        if (match$183('[')) {
            return parseArrayInitialiser$197();
        }
        if (match$183('{')) {
            return parseObjectInitialiser$212();
        }
        if (match$183('(')) {
            lex$152();
            state$66.lastParenthesized = expr$221 = parseExpression$287();
            expect$177(')');
            return expr$221;
        }
        if (token$222.value instanceof RegExp) {
            return createLiteral$427(lex$152().token);
        }
        return throwUnexpected$174(lex$152().token);
    }
    function parseArguments$225() {
        var args$226 = [];
        expect$177('(');
        if (!match$183(')')) {
            while (index$61 < length$64) {
                args$226.push(parseAssignmentExpression$285());
                if (match$183(')')) {
                    break;
                }
                expect$177(',');
            }
        }
        expect$177(')');
        return args$226;
    }
    function parseNonComputedProperty$227() {
        var token$228 = lex$152().token;
        if (!isIdentifierName$147(token$228)) {
            throwUnexpected$174(token$228);
        }
        return {
            type: Syntax$55.Identifier,
            name: token$228.value
        };
    }
    function parseNonComputedMember$229(object$230) {
        return {
            type: Syntax$55.MemberExpression,
            computed: false,
            object: object$230,
            property: parseNonComputedProperty$227()
        };
    }
    function parseComputedMember$231(object$232) {
        var property$233, expr$234;
        expect$177('[');
        property$233 = parseExpression$287();
        expr$234 = {
            type: Syntax$55.MemberExpression,
            computed: true,
            object: object$232,
            property: property$233
        };
        expect$177(']');
        return expr$234;
    }
    function parseCallMember$235(object$236) {
        return {
            type: Syntax$55.CallExpression,
            callee: object$236,
            'arguments': parseArguments$225()
        };
    }
    function parseNewExpression$237() {
        var expr$238;
        expectKeyword$180('new');
        expr$238 = {
            type: Syntax$55.NewExpression,
            callee: parseLeftHandSideExpression$252(),
            'arguments': []
        };
        if (match$183('(')) {
            expr$238['arguments'] = parseArguments$225();
        }
        return expr$238;
    }
    function toArrayNode$239(arr$240) {
        var els$241 = arr$240.map(function (el$242) {
                return {
                    type: 'Literal',
                    value: el$242,
                    raw: el$242.toString()
                };
            });
        return {
            type: 'ArrayExpression',
            elements: els$241
        };
    }
    function toObjectNode$243(obj$244) {
        var props$245 = Object.keys(obj$244).map(function (key$246) {
                var raw$247 = obj$244[key$246];
                var value$248;
                if (Array.isArray(raw$247)) {
                    value$248 = toArrayNode$239(raw$247);
                } else {
                    value$248 = {
                        type: 'Literal',
                        value: obj$244[key$246],
                        raw: obj$244[key$246].toString()
                    };
                }
                return {
                    type: 'Property',
                    key: {
                        type: 'Identifier',
                        name: key$246
                    },
                    value: value$248,
                    kind: 'init'
                };
            });
        return {
            type: 'ObjectExpression',
            properties: props$245
        };
    }
    function parseLeftHandSideExpressionAllowCall$249() {
        var useNew$250, expr$251;
        useNew$250 = matchKeyword$186('new');
        expr$251 = useNew$250 ? parseNewExpression$237() : parsePrimaryExpression$220();
        while (index$61 < length$64) {
            if (match$183('.')) {
                lex$152();
                expr$251 = parseNonComputedMember$229(expr$251);
            } else if (match$183('[')) {
                expr$251 = parseComputedMember$231(expr$251);
            } else if (match$183('(')) {
                expr$251 = parseCallMember$235(expr$251);
            } else {
                break;
            }
        }
        return expr$251;
    }
    function parseLeftHandSideExpression$252() {
        var useNew$253, expr$254;
        useNew$253 = matchKeyword$186('new');
        expr$254 = useNew$253 ? parseNewExpression$237() : parsePrimaryExpression$220();
        while (index$61 < length$64) {
            if (match$183('.')) {
                lex$152();
                expr$254 = parseNonComputedMember$229(expr$254);
            } else if (match$183('[')) {
                expr$254 = parseComputedMember$231(expr$254);
            } else {
                break;
            }
        }
        return expr$254;
    }
    function parsePostfixExpression$255() {
        var expr$256 = parseLeftHandSideExpressionAllowCall$249();
        if ((match$183('++') || match$183('--')) && !peekLineTerminator$158()) {
            if (strict$60 && expr$256.type === Syntax$55.Identifier && isRestrictedWord$99(expr$256.name)) {
                throwError$163({}, Messages$57.StrictLHSPostfix);
            }
            if (!isLeftHandSide$195(expr$256)) {
                throwError$163({}, Messages$57.InvalidLHSInAssignment);
            }
            expr$256 = {
                type: Syntax$55.UpdateExpression,
                operator: lex$152().token.value,
                argument: expr$256,
                prefix: false
            };
        }
        return expr$256;
    }
    function parseUnaryExpression$257() {
        var token$258, expr$259;
        if (match$183('++') || match$183('--')) {
            token$258 = lex$152().token;
            expr$259 = parseUnaryExpression$257();
            if (strict$60 && expr$259.type === Syntax$55.Identifier && isRestrictedWord$99(expr$259.name)) {
                throwError$163({}, Messages$57.StrictLHSPrefix);
            }
            if (!isLeftHandSide$195(expr$259)) {
                throwError$163({}, Messages$57.InvalidLHSInAssignment);
            }
            expr$259 = {
                type: Syntax$55.UpdateExpression,
                operator: token$258.value,
                argument: expr$259,
                prefix: true
            };
            return expr$259;
        }
        if (match$183('+') || match$183('-') || match$183('~') || match$183('!')) {
            expr$259 = {
                type: Syntax$55.UnaryExpression,
                operator: lex$152().token.value,
                argument: parseUnaryExpression$257()
            };
            return expr$259;
        }
        if (matchKeyword$186('delete') || matchKeyword$186('void') || matchKeyword$186('typeof')) {
            expr$259 = {
                type: Syntax$55.UnaryExpression,
                operator: lex$152().token.value,
                argument: parseUnaryExpression$257()
            };
            if (strict$60 && expr$259.operator === 'delete' && expr$259.argument.type === Syntax$55.Identifier) {
                throwErrorTolerant$171({}, Messages$57.StrictDelete);
            }
            return expr$259;
        }
        return parsePostfixExpression$255();
    }
    function parseMultiplicativeExpression$260() {
        var expr$261 = parseUnaryExpression$257();
        while (match$183('*') || match$183('/') || match$183('%')) {
            expr$261 = {
                type: Syntax$55.BinaryExpression,
                operator: lex$152().token.value,
                left: expr$261,
                right: parseUnaryExpression$257()
            };
        }
        return expr$261;
    }
    function parseAdditiveExpression$262() {
        var expr$263 = parseMultiplicativeExpression$260();
        while (match$183('+') || match$183('-')) {
            expr$263 = {
                type: Syntax$55.BinaryExpression,
                operator: lex$152().token.value,
                left: expr$263,
                right: parseMultiplicativeExpression$260()
            };
        }
        return expr$263;
    }
    function parseShiftExpression$264() {
        var expr$265 = parseAdditiveExpression$262();
        while (match$183('<<') || match$183('>>') || match$183('>>>')) {
            expr$265 = {
                type: Syntax$55.BinaryExpression,
                operator: lex$152().token.value,
                left: expr$265,
                right: parseAdditiveExpression$262()
            };
        }
        return expr$265;
    }
    function parseRelationalExpression$266() {
        var expr$267, previousAllowIn$268;
        previousAllowIn$268 = state$66.allowIn;
        state$66.allowIn = true;
        expr$267 = parseShiftExpression$264();
        while (match$183('<') || match$183('>') || match$183('<=') || match$183('>=') || previousAllowIn$268 && matchKeyword$186('in') || matchKeyword$186('instanceof')) {
            expr$267 = {
                type: Syntax$55.BinaryExpression,
                operator: lex$152().token.value,
                left: expr$267,
                right: parseRelationalExpression$266()
            };
        }
        state$66.allowIn = previousAllowIn$268;
        return expr$267;
    }
    function parseEqualityExpression$269() {
        var expr$270 = parseRelationalExpression$266();
        while (match$183('==') || match$183('!=') || match$183('===') || match$183('!==')) {
            expr$270 = {
                type: Syntax$55.BinaryExpression,
                operator: lex$152().token.value,
                left: expr$270,
                right: parseRelationalExpression$266()
            };
        }
        return expr$270;
    }
    function parseBitwiseANDExpression$271() {
        var expr$272 = parseEqualityExpression$269();
        while (match$183('&')) {
            lex$152();
            expr$272 = {
                type: Syntax$55.BinaryExpression,
                operator: '&',
                left: expr$272,
                right: parseEqualityExpression$269()
            };
        }
        return expr$272;
    }
    function parseBitwiseXORExpression$273() {
        var expr$274 = parseBitwiseANDExpression$271();
        while (match$183('^')) {
            lex$152();
            expr$274 = {
                type: Syntax$55.BinaryExpression,
                operator: '^',
                left: expr$274,
                right: parseBitwiseANDExpression$271()
            };
        }
        return expr$274;
    }
    function parseBitwiseORExpression$275() {
        var expr$276 = parseBitwiseXORExpression$273();
        while (match$183('|')) {
            lex$152();
            expr$276 = {
                type: Syntax$55.BinaryExpression,
                operator: '|',
                left: expr$276,
                right: parseBitwiseXORExpression$273()
            };
        }
        return expr$276;
    }
    function parseLogicalANDExpression$277() {
        var expr$278 = parseBitwiseORExpression$275();
        while (match$183('&&')) {
            lex$152();
            expr$278 = {
                type: Syntax$55.LogicalExpression,
                operator: '&&',
                left: expr$278,
                right: parseBitwiseORExpression$275()
            };
        }
        return expr$278;
    }
    function parseLogicalORExpression$279() {
        var expr$280 = parseLogicalANDExpression$277();
        while (match$183('||')) {
            lex$152();
            expr$280 = {
                type: Syntax$55.LogicalExpression,
                operator: '||',
                left: expr$280,
                right: parseLogicalANDExpression$277()
            };
        }
        return expr$280;
    }
    function parseConditionalExpression$281() {
        var expr$282, previousAllowIn$283, consequent$284;
        expr$282 = parseLogicalORExpression$279();
        if (match$183('?')) {
            lex$152();
            previousAllowIn$283 = state$66.allowIn;
            state$66.allowIn = true;
            consequent$284 = parseAssignmentExpression$285();
            state$66.allowIn = previousAllowIn$283;
            expect$177(':');
            expr$282 = {
                type: Syntax$55.ConditionalExpression,
                test: expr$282,
                consequent: consequent$284,
                alternate: parseAssignmentExpression$285()
            };
        }
        return expr$282;
    }
    function parseAssignmentExpression$285() {
        var expr$286;
        expr$286 = parseConditionalExpression$281();
        if (matchAssign$189()) {
            if (!isLeftHandSide$195(expr$286)) {
                throwError$163({}, Messages$57.InvalidLHSInAssignment);
            }
            if (strict$60 && expr$286.type === Syntax$55.Identifier && isRestrictedWord$99(expr$286.name)) {
                throwError$163({}, Messages$57.StrictLHSAssignment);
            }
            expr$286 = {
                type: Syntax$55.AssignmentExpression,
                operator: lex$152().token.value,
                left: expr$286,
                right: parseAssignmentExpression$285()
            };
        }
        return expr$286;
    }
    function parseExpression$287() {
        var expr$288 = parseAssignmentExpression$285();
        if (match$183(',')) {
            expr$288 = {
                type: Syntax$55.SequenceExpression,
                expressions: [expr$288]
            };
            while (index$61 < length$64) {
                if (!match$183(',')) {
                    break;
                }
                lex$152();
                expr$288.expressions.push(parseAssignmentExpression$285());
            }
        }
        return expr$288;
    }
    function parseStatementList$289() {
        var list$290 = [], statement$291;
        while (index$61 < length$64) {
            if (match$183('}')) {
                break;
            }
            statement$291 = parseSourceElement$398();
            if (typeof statement$291 === 'undefined') {
                break;
            }
            list$290.push(statement$291);
        }
        return list$290;
    }
    function parseBlock$292() {
        var block$293;
        expect$177('{');
        block$293 = parseStatementList$289();
        expect$177('}');
        return {
            type: Syntax$55.BlockStatement,
            body: block$293
        };
    }
    function parseVariableIdentifier$294() {
        var stx$295 = lex$152(), token$296 = stx$295.token;
        if (token$296.type !== Token$53.Identifier) {
            throwUnexpected$174(token$296);
        }
        var name$297 = extra$68.noresolve ? stx$295 : expander$52.resolve(stx$295);
        return {
            type: Syntax$55.Identifier,
            name: name$297
        };
    }
    function parseVariableDeclaration$298(kind$299) {
        var id$300 = parseVariableIdentifier$294(), init$301 = null;
        if (strict$60 && isRestrictedWord$99(id$300.name)) {
            throwErrorTolerant$171({}, Messages$57.StrictVarName);
        }
        if (kind$299 === 'const') {
            expect$177('=');
            init$301 = parseAssignmentExpression$285();
        } else if (match$183('=')) {
            lex$152();
            init$301 = parseAssignmentExpression$285();
        }
        return {
            type: Syntax$55.VariableDeclarator,
            id: id$300,
            init: init$301
        };
    }
    function parseVariableDeclarationList$302(kind$303) {
        var list$304 = [];
        while (index$61 < length$64) {
            list$304.push(parseVariableDeclaration$298(kind$303));
            if (!match$183(',')) {
                break;
            }
            lex$152();
        }
        return list$304;
    }
    function parseVariableStatement$305() {
        var declarations$306;
        expectKeyword$180('var');
        declarations$306 = parseVariableDeclarationList$302();
        consumeSemicolon$192();
        return {
            type: Syntax$55.VariableDeclaration,
            declarations: declarations$306,
            kind: 'var'
        };
    }
    function parseConstLetDeclaration$307(kind$308) {
        var declarations$309;
        expectKeyword$180(kind$308);
        declarations$309 = parseVariableDeclarationList$302(kind$308);
        consumeSemicolon$192();
        return {
            type: Syntax$55.VariableDeclaration,
            declarations: declarations$309,
            kind: kind$308
        };
    }
    function parseEmptyStatement$310() {
        expect$177(';');
        return {type: Syntax$55.EmptyStatement};
    }
    function parseExpressionStatement$311() {
        var expr$312 = parseExpression$287();
        consumeSemicolon$192();
        return {
            type: Syntax$55.ExpressionStatement,
            expression: expr$312
        };
    }
    function parseIfStatement$313() {
        var test$314, consequent$315, alternate$316;
        expectKeyword$180('if');
        expect$177('(');
        test$314 = parseExpression$287();
        expect$177(')');
        consequent$315 = parseStatement$364();
        if (matchKeyword$186('else')) {
            lex$152();
            alternate$316 = parseStatement$364();
        } else {
            alternate$316 = null;
        }
        return {
            type: Syntax$55.IfStatement,
            test: test$314,
            consequent: consequent$315,
            alternate: alternate$316
        };
    }
    function parseDoWhileStatement$317() {
        var body$318, test$319, oldInIteration$320;
        expectKeyword$180('do');
        oldInIteration$320 = state$66.inIteration;
        state$66.inIteration = true;
        body$318 = parseStatement$364();
        state$66.inIteration = oldInIteration$320;
        expectKeyword$180('while');
        expect$177('(');
        test$319 = parseExpression$287();
        expect$177(')');
        if (match$183(';')) {
            lex$152();
        }
        return {
            type: Syntax$55.DoWhileStatement,
            body: body$318,
            test: test$319
        };
    }
    function parseWhileStatement$321() {
        var test$322, body$323, oldInIteration$324;
        expectKeyword$180('while');
        expect$177('(');
        test$322 = parseExpression$287();
        expect$177(')');
        oldInIteration$324 = state$66.inIteration;
        state$66.inIteration = true;
        body$323 = parseStatement$364();
        state$66.inIteration = oldInIteration$324;
        return {
            type: Syntax$55.WhileStatement,
            test: test$322,
            body: body$323
        };
    }
    function parseForVariableDeclaration$325() {
        var token$326 = lex$152().token;
        return {
            type: Syntax$55.VariableDeclaration,
            declarations: parseVariableDeclarationList$302(),
            kind: token$326.value
        };
    }
    function parseForStatement$327() {
        var init$328, test$329, update$330, left$331, right$332, body$333, oldInIteration$334;
        init$328 = test$329 = update$330 = null;
        expectKeyword$180('for');
        expect$177('(');
        if (match$183(';')) {
            lex$152();
        } else {
            if (matchKeyword$186('var') || matchKeyword$186('let')) {
                state$66.allowIn = false;
                init$328 = parseForVariableDeclaration$325();
                state$66.allowIn = true;
                if (init$328.declarations.length === 1 && matchKeyword$186('in')) {
                    lex$152();
                    left$331 = init$328;
                    right$332 = parseExpression$287();
                    init$328 = null;
                }
            } else {
                state$66.allowIn = false;
                init$328 = parseExpression$287();
                state$66.allowIn = true;
                if (matchKeyword$186('in')) {
                    if (!isLeftHandSide$195(init$328)) {
                        throwError$163({}, Messages$57.InvalidLHSInForIn);
                    }
                    lex$152();
                    left$331 = init$328;
                    right$332 = parseExpression$287();
                    init$328 = null;
                }
            }
            if (typeof left$331 === 'undefined') {
                expect$177(';');
            }
        }
        if (typeof left$331 === 'undefined') {
            if (!match$183(';')) {
                test$329 = parseExpression$287();
            }
            expect$177(';');
            if (!match$183(')')) {
                update$330 = parseExpression$287();
            }
        }
        expect$177(')');
        oldInIteration$334 = state$66.inIteration;
        state$66.inIteration = true;
        body$333 = parseStatement$364();
        state$66.inIteration = oldInIteration$334;
        if (typeof left$331 === 'undefined') {
            return {
                type: Syntax$55.ForStatement,
                init: init$328,
                test: test$329,
                update: update$330,
                body: body$333
            };
        }
        return {
            type: Syntax$55.ForInStatement,
            left: left$331,
            right: right$332,
            body: body$333,
            each: false
        };
    }
    function parseContinueStatement$335() {
        var token$336, label$337 = null;
        expectKeyword$180('continue');
        if (tokenStream$67[index$61].token.value === ';') {
            lex$152();
            if (!state$66.inIteration) {
                throwError$163({}, Messages$57.IllegalContinue);
            }
            return {
                type: Syntax$55.ContinueStatement,
                label: null
            };
        }
        if (peekLineTerminator$158()) {
            if (!state$66.inIteration) {
                throwError$163({}, Messages$57.IllegalContinue);
            }
            return {
                type: Syntax$55.ContinueStatement,
                label: null
            };
        }
        token$336 = lookahead$154().token;
        if (token$336.type === Token$53.Identifier) {
            label$337 = parseVariableIdentifier$294();
            if (!Object.prototype.hasOwnProperty.call(state$66.labelSet, label$337.name)) {
                throwError$163({}, Messages$57.UnknownLabel, label$337.name);
            }
        }
        consumeSemicolon$192();
        if (label$337 === null && !state$66.inIteration) {
            throwError$163({}, Messages$57.IllegalContinue);
        }
        return {
            type: Syntax$55.ContinueStatement,
            label: label$337
        };
    }
    function parseBreakStatement$338() {
        var token$339, label$340 = null;
        expectKeyword$180('break');
        if (peekLineTerminator$158()) {
            if (!(state$66.inIteration || state$66.inSwitch)) {
                throwError$163({}, Messages$57.IllegalBreak);
            }
            return {
                type: Syntax$55.BreakStatement,
                label: null
            };
        }
        token$339 = lookahead$154().token;
        if (token$339.type === Token$53.Identifier) {
            label$340 = parseVariableIdentifier$294();
            if (!Object.prototype.hasOwnProperty.call(state$66.labelSet, label$340.name)) {
                throwError$163({}, Messages$57.UnknownLabel, label$340.name);
            }
        }
        consumeSemicolon$192();
        if (label$340 === null && !(state$66.inIteration || state$66.inSwitch)) {
            throwError$163({}, Messages$57.IllegalBreak);
        }
        return {
            type: Syntax$55.BreakStatement,
            label: label$340
        };
    }
    function parseReturnStatement$341() {
        var token$342, argument$343 = null;
        expectKeyword$180('return');
        if (!state$66.inFunctionBody) {
            throwErrorTolerant$171({}, Messages$57.IllegalReturn);
        }
        if (peekLineTerminator$158()) {
            return {
                type: Syntax$55.ReturnStatement,
                argument: null
            };
        }
        if (!match$183(';')) {
            token$342 = lookahead$154().token;
            if (!match$183('}') && token$342.type !== Token$53.EOF) {
                argument$343 = parseExpression$287();
            }
        }
        consumeSemicolon$192();
        return {
            type: Syntax$55.ReturnStatement,
            argument: argument$343
        };
    }
    function parseWithStatement$344() {
        var object$345, body$346;
        if (strict$60) {
            throwErrorTolerant$171({}, Messages$57.StrictModeWith);
        }
        expectKeyword$180('with');
        expect$177('(');
        object$345 = parseExpression$287();
        expect$177(')');
        body$346 = parseStatement$364();
        return {
            type: Syntax$55.WithStatement,
            object: object$345,
            body: body$346
        };
    }
    function parseSwitchCase$347() {
        var test$348, consequent$349 = [], statement$350;
        if (matchKeyword$186('default')) {
            lex$152();
            test$348 = null;
        } else {
            expectKeyword$180('case');
            test$348 = parseExpression$287();
        }
        expect$177(':');
        while (index$61 < length$64) {
            if (match$183('}') || matchKeyword$186('default') || matchKeyword$186('case')) {
                break;
            }
            statement$350 = parseStatement$364();
            if (typeof statement$350 === 'undefined') {
                break;
            }
            consequent$349.push(statement$350);
        }
        return {
            type: Syntax$55.SwitchCase,
            test: test$348,
            consequent: consequent$349
        };
    }
    function parseSwitchStatement$351() {
        var discriminant$352, cases$353, oldInSwitch$354;
        expectKeyword$180('switch');
        expect$177('(');
        discriminant$352 = parseExpression$287();
        expect$177(')');
        expect$177('{');
        if (match$183('}')) {
            lex$152();
            return {
                type: Syntax$55.SwitchStatement,
                discriminant: discriminant$352
            };
        }
        cases$353 = [];
        oldInSwitch$354 = state$66.inSwitch;
        state$66.inSwitch = true;
        while (index$61 < length$64) {
            if (match$183('}')) {
                break;
            }
            cases$353.push(parseSwitchCase$347());
        }
        state$66.inSwitch = oldInSwitch$354;
        expect$177('}');
        return {
            type: Syntax$55.SwitchStatement,
            discriminant: discriminant$352,
            cases: cases$353
        };
    }
    function parseThrowStatement$355() {
        var argument$356;
        expectKeyword$180('throw');
        if (peekLineTerminator$158()) {
            throwError$163({}, Messages$57.NewlineAfterThrow);
        }
        argument$356 = parseExpression$287();
        consumeSemicolon$192();
        return {
            type: Syntax$55.ThrowStatement,
            argument: argument$356
        };
    }
    function parseCatchClause$357() {
        var param$358;
        expectKeyword$180('catch');
        expect$177('(');
        if (!match$183(')')) {
            param$358 = parseExpression$287();
            if (strict$60 && param$358.type === Syntax$55.Identifier && isRestrictedWord$99(param$358.name)) {
                throwErrorTolerant$171({}, Messages$57.StrictCatchVariable);
            }
        }
        expect$177(')');
        return {
            type: Syntax$55.CatchClause,
            param: param$358,
            guard: null,
            body: parseBlock$292()
        };
    }
    function parseTryStatement$359() {
        var block$360, handlers$361 = [], finalizer$362 = null;
        expectKeyword$180('try');
        block$360 = parseBlock$292();
        if (matchKeyword$186('catch')) {
            handlers$361.push(parseCatchClause$357());
        }
        if (matchKeyword$186('finally')) {
            lex$152();
            finalizer$362 = parseBlock$292();
        }
        if (handlers$361.length === 0 && !finalizer$362) {
            throwError$163({}, Messages$57.NoCatchOrFinally);
        }
        return {
            type: Syntax$55.TryStatement,
            block: block$360,
            handlers: handlers$361,
            finalizer: finalizer$362
        };
    }
    function parseDebuggerStatement$363() {
        expectKeyword$180('debugger');
        consumeSemicolon$192();
        return {type: Syntax$55.DebuggerStatement};
    }
    function parseStatement$364() {
        var token$365 = lookahead$154().token, expr$366, labeledBody$367;
        if (token$365.type === Token$53.EOF) {
            throwUnexpected$174(token$365);
        }
        if (token$365.type === Token$53.Punctuator) {
            switch (token$365.value) {
            case ';':
                return parseEmptyStatement$310();
            case '{':
                return parseBlock$292();
            case '(':
                return parseExpressionStatement$311();
            default:
                break;
            }
        }
        if (token$365.type === Token$53.Keyword) {
            switch (token$365.value) {
            case 'break':
                return parseBreakStatement$338();
            case 'continue':
                return parseContinueStatement$335();
            case 'debugger':
                return parseDebuggerStatement$363();
            case 'do':
                return parseDoWhileStatement$317();
            case 'for':
                return parseForStatement$327();
            case 'function':
                return parseFunctionDeclaration$378();
            case 'if':
                return parseIfStatement$313();
            case 'return':
                return parseReturnStatement$341();
            case 'switch':
                return parseSwitchStatement$351();
            case 'throw':
                return parseThrowStatement$355();
            case 'try':
                return parseTryStatement$359();
            case 'var':
                return parseVariableStatement$305();
            case 'while':
                return parseWhileStatement$321();
            case 'with':
                return parseWithStatement$344();
            default:
                break;
            }
        }
        expr$366 = parseExpression$287();
        if (expr$366.type === Syntax$55.Identifier && match$183(':')) {
            lex$152();
            if (Object.prototype.hasOwnProperty.call(state$66.labelSet, expr$366.name)) {
                throwError$163({}, Messages$57.Redeclaration, 'Label', expr$366.name);
            }
            state$66.labelSet[expr$366.name] = true;
            labeledBody$367 = parseStatement$364();
            delete state$66.labelSet[expr$366.name];
            return {
                type: Syntax$55.LabeledStatement,
                label: expr$366,
                body: labeledBody$367
            };
        }
        consumeSemicolon$192();
        return {
            type: Syntax$55.ExpressionStatement,
            expression: expr$366
        };
    }
    function parseFunctionSourceElements$368() {
        var sourceElement$369, sourceElements$370 = [], token$371, directive$372, firstRestricted$373, oldLabelSet$374, oldInIteration$375, oldInSwitch$376, oldInFunctionBody$377;
        expect$177('{');
        while (index$61 < length$64) {
            token$371 = lookahead$154().token;
            if (token$371.type !== Token$53.StringLiteral) {
                break;
            }
            sourceElement$369 = parseSourceElement$398();
            sourceElements$370.push(sourceElement$369);
            if (sourceElement$369.expression.type !== Syntax$55.Literal) {
                break;
            }
            directive$372 = sliceSource$75(token$371.range[0] + 1, token$371.range[1] - 1);
            if (directive$372 === 'use strict') {
                strict$60 = true;
                if (firstRestricted$373) {
                    throwError$163(firstRestricted$373, Messages$57.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$373 && token$371.octal) {
                    firstRestricted$373 = token$371;
                }
            }
        }
        oldLabelSet$374 = state$66.labelSet;
        oldInIteration$375 = state$66.inIteration;
        oldInSwitch$376 = state$66.inSwitch;
        oldInFunctionBody$377 = state$66.inFunctionBody;
        state$66.labelSet = {};
        state$66.inIteration = false;
        state$66.inSwitch = false;
        state$66.inFunctionBody = true;
        while (index$61 < length$64) {
            if (match$183('}')) {
                break;
            }
            sourceElement$369 = parseSourceElement$398();
            if (typeof sourceElement$369 === 'undefined') {
                break;
            }
            sourceElements$370.push(sourceElement$369);
        }
        expect$177('}');
        state$66.labelSet = oldLabelSet$374;
        state$66.inIteration = oldInIteration$375;
        state$66.inSwitch = oldInSwitch$376;
        state$66.inFunctionBody = oldInFunctionBody$377;
        return {
            type: Syntax$55.BlockStatement,
            body: sourceElements$370
        };
    }
    function parseFunctionDeclaration$378() {
        var id$379, param$380, params$381 = [], body$382, token$383, firstRestricted$384, message$385, previousStrict$386, paramSet$387;
        expectKeyword$180('function');
        token$383 = lookahead$154().token;
        id$379 = parseVariableIdentifier$294();
        if (strict$60) {
            if (isRestrictedWord$99(token$383.value)) {
                throwError$163(token$383, Messages$57.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$99(token$383.value)) {
                firstRestricted$384 = token$383;
                message$385 = Messages$57.StrictFunctionName;
            } else if (isStrictModeReservedWord$97(token$383.value)) {
                firstRestricted$384 = token$383;
                message$385 = Messages$57.StrictReservedWord;
            }
        }
        expect$177('(');
        if (!match$183(')')) {
            paramSet$387 = {};
            while (index$61 < length$64) {
                token$383 = lookahead$154().token;
                param$380 = parseVariableIdentifier$294();
                if (strict$60) {
                    if (isRestrictedWord$99(token$383.value)) {
                        throwError$163(token$383, Messages$57.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$387, token$383.value)) {
                        throwError$163(token$383, Messages$57.StrictParamDupe);
                    }
                } else if (!firstRestricted$384) {
                    if (isRestrictedWord$99(token$383.value)) {
                        firstRestricted$384 = token$383;
                        message$385 = Messages$57.StrictParamName;
                    } else if (isStrictModeReservedWord$97(token$383.value)) {
                        firstRestricted$384 = token$383;
                        message$385 = Messages$57.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$387, token$383.value)) {
                        firstRestricted$384 = token$383;
                        message$385 = Messages$57.StrictParamDupe;
                    }
                }
                params$381.push(param$380);
                paramSet$387[param$380.name] = true;
                if (match$183(')')) {
                    break;
                }
                expect$177(',');
            }
        }
        expect$177(')');
        previousStrict$386 = strict$60;
        body$382 = parseFunctionSourceElements$368();
        if (strict$60 && firstRestricted$384) {
            throwError$163(firstRestricted$384, message$385);
        }
        strict$60 = previousStrict$386;
        return {
            type: Syntax$55.FunctionDeclaration,
            id: id$379,
            params: params$381,
            body: body$382
        };
    }
    function parseFunctionExpression$388() {
        var token$389, id$390 = null, firstRestricted$391, message$392, param$393, params$394 = [], body$395, previousStrict$396, paramSet$397;
        expectKeyword$180('function');
        if (!match$183('(')) {
            token$389 = lookahead$154().token;
            id$390 = parseVariableIdentifier$294();
            if (strict$60) {
                if (isRestrictedWord$99(token$389.value)) {
                    throwError$163(token$389, Messages$57.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$99(token$389.value)) {
                    firstRestricted$391 = token$389;
                    message$392 = Messages$57.StrictFunctionName;
                } else if (isStrictModeReservedWord$97(token$389.value)) {
                    firstRestricted$391 = token$389;
                    message$392 = Messages$57.StrictReservedWord;
                }
            }
        }
        expect$177('(');
        if (!match$183(')')) {
            paramSet$397 = {};
            while (index$61 < length$64) {
                token$389 = lookahead$154().token;
                param$393 = parseVariableIdentifier$294();
                if (strict$60) {
                    if (isRestrictedWord$99(token$389.value)) {
                        throwError$163(token$389, Messages$57.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$397, token$389.value)) {
                        throwError$163(token$389, Messages$57.StrictParamDupe);
                    }
                } else if (!firstRestricted$391) {
                    if (isRestrictedWord$99(token$389.value)) {
                        firstRestricted$391 = token$389;
                        message$392 = Messages$57.StrictParamName;
                    } else if (isStrictModeReservedWord$97(token$389.value)) {
                        firstRestricted$391 = token$389;
                        message$392 = Messages$57.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$397, token$389.value)) {
                        firstRestricted$391 = token$389;
                        message$392 = Messages$57.StrictParamDupe;
                    }
                }
                params$394.push(param$393);
                paramSet$397[param$393.name] = true;
                if (match$183(')')) {
                    break;
                }
                expect$177(',');
            }
        }
        expect$177(')');
        previousStrict$396 = strict$60;
        body$395 = parseFunctionSourceElements$368();
        if (strict$60 && firstRestricted$391) {
            throwError$163(firstRestricted$391, message$392);
        }
        strict$60 = previousStrict$396;
        return {
            type: Syntax$55.FunctionExpression,
            id: id$390,
            params: params$394,
            body: body$395
        };
    }
    function parseSourceElement$398() {
        var token$399 = lookahead$154().token;
        if (token$399.type === Token$53.Keyword) {
            switch (token$399.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$307(token$399.value);
            case 'function':
                return parseFunctionDeclaration$378();
            default:
                return parseStatement$364();
            }
        }
        if (token$399.type !== Token$53.EOF) {
            return parseStatement$364();
        }
    }
    function parseSourceElements$400() {
        var sourceElement$401, sourceElements$402 = [], token$403, directive$404, firstRestricted$405;
        while (index$61 < length$64) {
            token$403 = lookahead$154();
            if (token$403.type !== Token$53.StringLiteral) {
                break;
            }
            sourceElement$401 = parseSourceElement$398();
            sourceElements$402.push(sourceElement$401);
            if (sourceElement$401.expression.type !== Syntax$55.Literal) {
                break;
            }
            directive$404 = sliceSource$75(token$403.range[0] + 1, token$403.range[1] - 1);
            if (directive$404 === 'use strict') {
                strict$60 = true;
                if (firstRestricted$405) {
                    throwError$163(firstRestricted$405, Messages$57.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$405 && token$403.octal) {
                    firstRestricted$405 = token$403;
                }
            }
        }
        while (index$61 < length$64) {
            sourceElement$401 = parseSourceElement$398();
            if (typeof sourceElement$401 === 'undefined') {
                break;
            }
            sourceElements$402.push(sourceElement$401);
        }
        return sourceElements$402;
    }
    function parseProgram$406() {
        var program$407;
        strict$60 = false;
        program$407 = {
            type: Syntax$55.Program,
            body: parseSourceElements$400()
        };
        return program$407;
    }
    function addComment$408(start$409, end$410, type$411, value$412) {
        assert$69(typeof start$409 === 'number', 'Comment must have valid position');
        if (extra$68.comments.length > 0) {
            if (extra$68.comments[extra$68.comments.length - 1].range[1] > start$409) {
                return;
            }
        }
        extra$68.comments.push({
            range: [
                start$409,
                end$410
            ],
            type: type$411,
            value: value$412
        });
    }
    function scanComment$413() {
        var comment$414, ch$415, start$416, blockComment$417, lineComment$418;
        comment$414 = '';
        blockComment$417 = false;
        lineComment$418 = false;
        while (index$61 < length$64) {
            ch$415 = source$59[index$61];
            if (lineComment$418) {
                ch$415 = nextChar$104();
                if (index$61 >= length$64) {
                    lineComment$418 = false;
                    comment$414 += ch$415;
                    addComment$408(start$416, index$61, 'Line', comment$414);
                } else if (isLineTerminator$89(ch$415)) {
                    lineComment$418 = false;
                    addComment$408(start$416, index$61, 'Line', comment$414);
                    if (ch$415 === '\r' && source$59[index$61] === '\n') {
                        ++index$61;
                    }
                    ++lineNumber$62;
                    lineStart$63 = index$61;
                    comment$414 = '';
                } else {
                    comment$414 += ch$415;
                }
            } else if (blockComment$417) {
                if (isLineTerminator$89(ch$415)) {
                    if (ch$415 === '\r' && source$59[index$61 + 1] === '\n') {
                        ++index$61;
                        comment$414 += '\r\n';
                    } else {
                        comment$414 += ch$415;
                    }
                    ++lineNumber$62;
                    ++index$61;
                    lineStart$63 = index$61;
                    if (index$61 >= length$64) {
                        throwError$163({}, Messages$57.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$415 = nextChar$104();
                    if (index$61 >= length$64) {
                        throwError$163({}, Messages$57.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$414 += ch$415;
                    if (ch$415 === '*') {
                        ch$415 = source$59[index$61];
                        if (ch$415 === '/') {
                            comment$414 = comment$414.substr(0, comment$414.length - 1);
                            blockComment$417 = false;
                            ++index$61;
                            addComment$408(start$416, index$61, 'Block', comment$414);
                            comment$414 = '';
                        }
                    }
                }
            } else if (ch$415 === '/') {
                ch$415 = source$59[index$61 + 1];
                if (ch$415 === '/') {
                    start$416 = index$61;
                    index$61 += 2;
                    lineComment$418 = true;
                } else if (ch$415 === '*') {
                    start$416 = index$61;
                    index$61 += 2;
                    blockComment$417 = true;
                    if (index$61 >= length$64) {
                        throwError$163({}, Messages$57.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$87(ch$415)) {
                ++index$61;
            } else if (isLineTerminator$89(ch$415)) {
                ++index$61;
                if (ch$415 === '\r' && source$59[index$61] === '\n') {
                    ++index$61;
                }
                ++lineNumber$62;
                lineStart$63 = index$61;
            } else {
                break;
            }
        }
    }
    function collectToken$419() {
        var token$420 = extra$68.advance(), range$421, value$422;
        if (token$420.type !== Token$53.EOF) {
            range$421 = [
                token$420.range[0],
                token$420.range[1]
            ];
            value$422 = sliceSource$75(token$420.range[0], token$420.range[1]);
            extra$68.tokens.push({
                type: TokenName$54[token$420.type],
                value: value$422,
                lineNumber: lineNumber$62,
                lineStart: lineStart$63,
                range: range$421
            });
        }
        return token$420;
    }
    function collectRegex$423() {
        var pos$424, regex$425, token$426;
        skipComment$106();
        pos$424 = index$61;
        regex$425 = extra$68.scanRegExp();
        if (extra$68.tokens.length > 0) {
            token$426 = extra$68.tokens[extra$68.tokens.length - 1];
            if (token$426.range[0] === pos$424 && token$426.type === 'Punctuator') {
                if (token$426.value === '/' || token$426.value === '/=') {
                    extra$68.tokens.pop();
                }
            }
        }
        extra$68.tokens.push({
            type: 'RegularExpression',
            value: regex$425.literal,
            range: [
                pos$424,
                index$61
            ],
            lineStart: token$426.lineStart,
            lineNumber: token$426.lineNumber
        });
        return regex$425;
    }
    function createLiteral$427(token$428) {
        if (Array.isArray(token$428)) {
            return {
                type: Syntax$55.Literal,
                value: token$428
            };
        }
        return {
            type: Syntax$55.Literal,
            value: token$428.value,
            lineStart: token$428.lineStart,
            lineNumber: token$428.lineNumber
        };
    }
    function createRawLiteral$429(token$430) {
        return {
            type: Syntax$55.Literal,
            value: token$430.value,
            raw: sliceSource$75(token$430.range[0], token$430.range[1]),
            lineStart: token$430.lineStart,
            lineNumber: token$430.lineNumber
        };
    }
    function wrapTrackingFunction$431(range$432, loc$433) {
        return function (parseFunction$434) {
            function isBinary$435(node$436) {
                return node$436.type === Syntax$55.LogicalExpression || node$436.type === Syntax$55.BinaryExpression;
            }
            function visit$437(node$438) {
                if (isBinary$435(node$438.left)) {
                    visit$437(node$438.left);
                }
                if (isBinary$435(node$438.right)) {
                    visit$437(node$438.right);
                }
                if (range$432 && typeof node$438.range === 'undefined') {
                    node$438.range = [
                        node$438.left.range[0],
                        node$438.right.range[1]
                    ];
                }
                if (loc$433 && typeof node$438.loc === 'undefined') {
                    node$438.loc = {
                        start: node$438.left.loc.start,
                        end: node$438.right.loc.end
                    };
                }
            }
            return function () {
                var node$439, rangeInfo$440, locInfo$441;
                var curr$442 = tokenStream$67[index$61].token;
                rangeInfo$440 = [
                    curr$442.range[0],
                    0
                ];
                locInfo$441 = {start: {
                        line: curr$442.lineNumber,
                        column: curr$442.lineStart
                    }};
                node$439 = parseFunction$434.apply(null, arguments);
                if (typeof node$439 !== 'undefined') {
                    var last$443 = tokenStream$67[index$61].token;
                    if (range$432) {
                        rangeInfo$440[1] = last$443.range[1];
                        node$439.range = rangeInfo$440;
                    }
                    if (loc$433) {
                        locInfo$441.end = {
                            line: last$443.lineNumber,
                            column: last$443.lineStart
                        };
                        node$439.loc = locInfo$441;
                    }
                    if (isBinary$435(node$439)) {
                        visit$437(node$439);
                    }
                    if (node$439.type === Syntax$55.MemberExpression) {
                        if (typeof node$439.object.range !== 'undefined') {
                            node$439.range[0] = node$439.object.range[0];
                        }
                        if (typeof node$439.object.loc !== 'undefined') {
                            node$439.loc.start = node$439.object.loc.start;
                        }
                    }
                    if (node$439.type === Syntax$55.CallExpression) {
                        if (typeof node$439.callee.range !== 'undefined') {
                            node$439.range[0] = node$439.callee.range[0];
                        }
                        if (typeof node$439.callee.loc !== 'undefined') {
                            node$439.loc.start = node$439.callee.loc.start;
                        }
                    }
                    return node$439;
                }
            };
        };
    }
    function patch$444() {
        var wrapTracking$445;
        if (extra$68.comments) {
            extra$68.skipComment = skipComment$106;
            skipComment$106 = scanComment$413;
        }
        if (extra$68.raw) {
            extra$68.createLiteral = createLiteral$427;
            createLiteral$427 = createRawLiteral$429;
        }
        if (extra$68.range || extra$68.loc) {
            wrapTracking$445 = wrapTrackingFunction$431(extra$68.range, extra$68.loc);
            extra$68.parseAdditiveExpression = parseAdditiveExpression$262;
            extra$68.parseAssignmentExpression = parseAssignmentExpression$285;
            extra$68.parseBitwiseANDExpression = parseBitwiseANDExpression$271;
            extra$68.parseBitwiseORExpression = parseBitwiseORExpression$275;
            extra$68.parseBitwiseXORExpression = parseBitwiseXORExpression$273;
            extra$68.parseBlock = parseBlock$292;
            extra$68.parseFunctionSourceElements = parseFunctionSourceElements$368;
            extra$68.parseCallMember = parseCallMember$235;
            extra$68.parseCatchClause = parseCatchClause$357;
            extra$68.parseComputedMember = parseComputedMember$231;
            extra$68.parseConditionalExpression = parseConditionalExpression$281;
            extra$68.parseConstLetDeclaration = parseConstLetDeclaration$307;
            extra$68.parseEqualityExpression = parseEqualityExpression$269;
            extra$68.parseExpression = parseExpression$287;
            extra$68.parseForVariableDeclaration = parseForVariableDeclaration$325;
            extra$68.parseFunctionDeclaration = parseFunctionDeclaration$378;
            extra$68.parseFunctionExpression = parseFunctionExpression$388;
            extra$68.parseLogicalANDExpression = parseLogicalANDExpression$277;
            extra$68.parseLogicalORExpression = parseLogicalORExpression$279;
            extra$68.parseMultiplicativeExpression = parseMultiplicativeExpression$260;
            extra$68.parseNewExpression = parseNewExpression$237;
            extra$68.parseNonComputedMember = parseNonComputedMember$229;
            extra$68.parseNonComputedProperty = parseNonComputedProperty$227;
            extra$68.parseObjectProperty = parseObjectProperty$207;
            extra$68.parseObjectPropertyKey = parseObjectPropertyKey$205;
            extra$68.parsePostfixExpression = parsePostfixExpression$255;
            extra$68.parsePrimaryExpression = parsePrimaryExpression$220;
            extra$68.parseProgram = parseProgram$406;
            extra$68.parsePropertyFunction = parsePropertyFunction$200;
            extra$68.parseRelationalExpression = parseRelationalExpression$266;
            extra$68.parseStatement = parseStatement$364;
            extra$68.parseShiftExpression = parseShiftExpression$264;
            extra$68.parseSwitchCase = parseSwitchCase$347;
            extra$68.parseUnaryExpression = parseUnaryExpression$257;
            extra$68.parseVariableDeclaration = parseVariableDeclaration$298;
            extra$68.parseVariableIdentifier = parseVariableIdentifier$294;
            parseAdditiveExpression$262 = wrapTracking$445(extra$68.parseAdditiveExpression);
            parseAssignmentExpression$285 = wrapTracking$445(extra$68.parseAssignmentExpression);
            parseBitwiseANDExpression$271 = wrapTracking$445(extra$68.parseBitwiseANDExpression);
            parseBitwiseORExpression$275 = wrapTracking$445(extra$68.parseBitwiseORExpression);
            parseBitwiseXORExpression$273 = wrapTracking$445(extra$68.parseBitwiseXORExpression);
            parseBlock$292 = wrapTracking$445(extra$68.parseBlock);
            parseFunctionSourceElements$368 = wrapTracking$445(extra$68.parseFunctionSourceElements);
            parseCallMember$235 = wrapTracking$445(extra$68.parseCallMember);
            parseCatchClause$357 = wrapTracking$445(extra$68.parseCatchClause);
            parseComputedMember$231 = wrapTracking$445(extra$68.parseComputedMember);
            parseConditionalExpression$281 = wrapTracking$445(extra$68.parseConditionalExpression);
            parseConstLetDeclaration$307 = wrapTracking$445(extra$68.parseConstLetDeclaration);
            parseEqualityExpression$269 = wrapTracking$445(extra$68.parseEqualityExpression);
            parseExpression$287 = wrapTracking$445(extra$68.parseExpression);
            parseForVariableDeclaration$325 = wrapTracking$445(extra$68.parseForVariableDeclaration);
            parseFunctionDeclaration$378 = wrapTracking$445(extra$68.parseFunctionDeclaration);
            parseFunctionExpression$388 = wrapTracking$445(extra$68.parseFunctionExpression);
            parseLogicalANDExpression$277 = wrapTracking$445(extra$68.parseLogicalANDExpression);
            parseLogicalORExpression$279 = wrapTracking$445(extra$68.parseLogicalORExpression);
            parseMultiplicativeExpression$260 = wrapTracking$445(extra$68.parseMultiplicativeExpression);
            parseNewExpression$237 = wrapTracking$445(extra$68.parseNewExpression);
            parseNonComputedMember$229 = wrapTracking$445(extra$68.parseNonComputedMember);
            parseNonComputedProperty$227 = wrapTracking$445(extra$68.parseNonComputedProperty);
            parseObjectProperty$207 = wrapTracking$445(extra$68.parseObjectProperty);
            parseObjectPropertyKey$205 = wrapTracking$445(extra$68.parseObjectPropertyKey);
            parsePostfixExpression$255 = wrapTracking$445(extra$68.parsePostfixExpression);
            parsePrimaryExpression$220 = wrapTracking$445(extra$68.parsePrimaryExpression);
            parseProgram$406 = wrapTracking$445(extra$68.parseProgram);
            parsePropertyFunction$200 = wrapTracking$445(extra$68.parsePropertyFunction);
            parseRelationalExpression$266 = wrapTracking$445(extra$68.parseRelationalExpression);
            parseStatement$364 = wrapTracking$445(extra$68.parseStatement);
            parseShiftExpression$264 = wrapTracking$445(extra$68.parseShiftExpression);
            parseSwitchCase$347 = wrapTracking$445(extra$68.parseSwitchCase);
            parseUnaryExpression$257 = wrapTracking$445(extra$68.parseUnaryExpression);
            parseVariableDeclaration$298 = wrapTracking$445(extra$68.parseVariableDeclaration);
            parseVariableIdentifier$294 = wrapTracking$445(extra$68.parseVariableIdentifier);
        }
        if (typeof extra$68.tokens !== 'undefined') {
            extra$68.advance = advance$149;
            extra$68.scanRegExp = scanRegExp$137;
            advance$149 = collectToken$419;
            scanRegExp$137 = collectRegex$423;
        }
    }
    function unpatch$446() {
        if (typeof extra$68.skipComment === 'function') {
            skipComment$106 = extra$68.skipComment;
        }
        if (extra$68.raw) {
            createLiteral$427 = extra$68.createLiteral;
        }
        if (extra$68.range || extra$68.loc) {
            parseAdditiveExpression$262 = extra$68.parseAdditiveExpression;
            parseAssignmentExpression$285 = extra$68.parseAssignmentExpression;
            parseBitwiseANDExpression$271 = extra$68.parseBitwiseANDExpression;
            parseBitwiseORExpression$275 = extra$68.parseBitwiseORExpression;
            parseBitwiseXORExpression$273 = extra$68.parseBitwiseXORExpression;
            parseBlock$292 = extra$68.parseBlock;
            parseFunctionSourceElements$368 = extra$68.parseFunctionSourceElements;
            parseCallMember$235 = extra$68.parseCallMember;
            parseCatchClause$357 = extra$68.parseCatchClause;
            parseComputedMember$231 = extra$68.parseComputedMember;
            parseConditionalExpression$281 = extra$68.parseConditionalExpression;
            parseConstLetDeclaration$307 = extra$68.parseConstLetDeclaration;
            parseEqualityExpression$269 = extra$68.parseEqualityExpression;
            parseExpression$287 = extra$68.parseExpression;
            parseForVariableDeclaration$325 = extra$68.parseForVariableDeclaration;
            parseFunctionDeclaration$378 = extra$68.parseFunctionDeclaration;
            parseFunctionExpression$388 = extra$68.parseFunctionExpression;
            parseLogicalANDExpression$277 = extra$68.parseLogicalANDExpression;
            parseLogicalORExpression$279 = extra$68.parseLogicalORExpression;
            parseMultiplicativeExpression$260 = extra$68.parseMultiplicativeExpression;
            parseNewExpression$237 = extra$68.parseNewExpression;
            parseNonComputedMember$229 = extra$68.parseNonComputedMember;
            parseNonComputedProperty$227 = extra$68.parseNonComputedProperty;
            parseObjectProperty$207 = extra$68.parseObjectProperty;
            parseObjectPropertyKey$205 = extra$68.parseObjectPropertyKey;
            parsePrimaryExpression$220 = extra$68.parsePrimaryExpression;
            parsePostfixExpression$255 = extra$68.parsePostfixExpression;
            parseProgram$406 = extra$68.parseProgram;
            parsePropertyFunction$200 = extra$68.parsePropertyFunction;
            parseRelationalExpression$266 = extra$68.parseRelationalExpression;
            parseStatement$364 = extra$68.parseStatement;
            parseShiftExpression$264 = extra$68.parseShiftExpression;
            parseSwitchCase$347 = extra$68.parseSwitchCase;
            parseUnaryExpression$257 = extra$68.parseUnaryExpression;
            parseVariableDeclaration$298 = extra$68.parseVariableDeclaration;
            parseVariableIdentifier$294 = extra$68.parseVariableIdentifier;
        }
        if (typeof extra$68.scanRegExp === 'function') {
            advance$149 = extra$68.advance;
            scanRegExp$137 = extra$68.scanRegExp;
        }
    }
    function stringToArray$447(str$448) {
        var length$449 = str$448.length, result$450 = [], i$451;
        for (i$451 = 0; i$451 < length$449; ++i$451) {
            result$450[i$451] = str$448.charAt(i$451);
        }
        return result$450;
    }
    function blockAllowed$452(toks$453, start$454, inExprDelim$455, parentIsBlock$456) {
        var assignOps$457 = [
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
        var binaryOps$458 = [
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
        var unaryOps$459 = [
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
        function back$460(n$461) {
            var idx$462 = toks$453.length - n$461 > 0 ? toks$453.length - n$461 : 0;
            return toks$453[idx$462];
        }
        if (inExprDelim$455 && toks$453.length - (start$454 + 2) <= 0) {
            return false;
        } else if (back$460(start$454 + 2).value === ':' && parentIsBlock$456) {
            return true;
        } else if (isIn$72(back$460(start$454 + 2).value, unaryOps$459.concat(binaryOps$458).concat(assignOps$457))) {
            return false;
        } else if (back$460(start$454 + 2).value === 'return') {
            var currLineNumber$463 = typeof back$460(start$454 + 1).startLineNumber !== 'undefined' ? back$460(start$454 + 1).startLineNumber : back$460(start$454 + 1).lineNumber;
            if (back$460(start$454 + 2).lineNumber !== currLineNumber$463) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$72(back$460(start$454 + 2).value, [
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
    function readToken$464(toks$465, inExprDelim$466, parentIsBlock$467) {
        var delimiters$468 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$469 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$470 = toks$465.length - 1;
        function back$471(n$472) {
            var idx$473 = toks$465.length - n$472 > 0 ? toks$465.length - n$472 : 0;
            return toks$465[idx$473];
        }
        skipComment$106();
        if (isIn$72(getChar$105(), delimiters$468)) {
            return readDelim$475(toks$465, inExprDelim$466, parentIsBlock$467);
        }
        if (getChar$105() === '/') {
            var prev$474 = back$471(1);
            if (prev$474) {
                if (prev$474.value === '()') {
                    if (isIn$72(back$471(2).value, parenIdents$469)) {
                        return scanRegExp$137();
                    }
                    return advance$149();
                }
                if (prev$474.value === '{}') {
                    if (blockAllowed$452(toks$465, 0, inExprDelim$466, parentIsBlock$467)) {
                        if (back$471(2).value === '()') {
                            if (back$471(4).value === 'function') {
                                if (!blockAllowed$452(toks$465, 3, inExprDelim$466, parentIsBlock$467)) {
                                    return advance$149();
                                }
                                if (toks$465.length - 5 <= 0 && inExprDelim$466) {
                                    return advance$149();
                                }
                            }
                            if (back$471(3).value === 'function') {
                                if (!blockAllowed$452(toks$465, 2, inExprDelim$466, parentIsBlock$467)) {
                                    return advance$149();
                                }
                                if (toks$465.length - 4 <= 0 && inExprDelim$466) {
                                    return advance$149();
                                }
                            }
                        }
                        return scanRegExp$137();
                    } else {
                        return advance$149();
                    }
                }
                if (prev$474.type === Token$53.Punctuator) {
                    return scanRegExp$137();
                }
                if (isKeyword$101(prev$474.value)) {
                    return scanRegExp$137();
                }
                return advance$149();
            }
            return scanRegExp$137();
        }
        return advance$149();
    }
    function readDelim$475(toks$476, inExprDelim$477, parentIsBlock$478) {
        var startDelim$479 = advance$149(), matchDelim$480 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$481 = [];
        var delimiters$482 = [
                '(',
                '{',
                '['
            ];
        assert$69(delimiters$482.indexOf(startDelim$479.value) !== -1, 'Need to begin at the delimiter');
        var token$483 = startDelim$479;
        var startLineNumber$484 = token$483.lineNumber;
        var startLineStart$485 = token$483.lineStart;
        var startRange$486 = token$483.range;
        var delimToken$487 = {};
        delimToken$487.type = Token$53.Delimiter;
        delimToken$487.value = startDelim$479.value + matchDelim$480[startDelim$479.value];
        delimToken$487.startLineNumber = startLineNumber$484;
        delimToken$487.startLineStart = startLineStart$485;
        delimToken$487.startRange = startRange$486;
        var delimIsBlock$488 = false;
        if (startDelim$479.value === '{') {
            delimIsBlock$488 = blockAllowed$452(toks$476.concat(delimToken$487), 0, inExprDelim$477, parentIsBlock$478);
        }
        while (index$61 <= length$64) {
            token$483 = readToken$464(inner$481, startDelim$479.value === '(' || startDelim$479.value === '[', delimIsBlock$488);
            if (token$483.type === Token$53.Punctuator && token$483.value === matchDelim$480[startDelim$479.value]) {
                break;
            } else if (token$483.type === Token$53.EOF) {
                throwError$163({}, Messages$57.UnexpectedEOS);
            } else {
                inner$481.push(token$483);
            }
        }
        if (index$61 >= length$64 && matchDelim$480[startDelim$479.value] !== source$59[length$64 - 1]) {
            throwError$163({}, Messages$57.UnexpectedEOS);
        }
        var endLineNumber$489 = token$483.lineNumber;
        var endLineStart$490 = token$483.lineStart;
        var endRange$491 = token$483.range;
        delimToken$487.inner = inner$481;
        delimToken$487.endLineNumber = endLineNumber$489;
        delimToken$487.endLineStart = endLineStart$490;
        delimToken$487.endRange = endRange$491;
        return delimToken$487;
    }
    ;
    function read$492(code$493) {
        var token$494, tokenTree$495 = [];
        source$59 = code$493;
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
            tokenTree$495.push(readToken$464(tokenTree$495, false, false));
        }
        var last$496 = tokenTree$495[tokenTree$495.length - 1];
        if (last$496 && last$496.type !== Token$53.EOF) {
            tokenTree$495.push({
                type: Token$53.EOF,
                value: '',
                lineNumber: last$496.lineNumber,
                lineStart: last$496.lineStart,
                range: [
                    index$61,
                    index$61
                ]
            });
        }
        return expander$52.tokensToSyntax(tokenTree$495);
    }
    function parse$497(code$498, nodeType$499, options$500) {
        var program$501, toString$502;
        tokenStream$67 = code$498;
        nodeType$499 = nodeType$499 || 'base';
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
        if (typeof options$500 !== 'undefined') {
            if (options$500.range || options$500.loc) {
                assert$69(false, 'Note range and loc is not currently implemented');
            }
            extra$68.range = typeof options$500.range === 'boolean' && options$500.range;
            extra$68.loc = typeof options$500.loc === 'boolean' && options$500.loc;
            extra$68.raw = typeof options$500.raw === 'boolean' && options$500.raw;
            if (typeof options$500.tokens === 'boolean' && options$500.tokens) {
                extra$68.tokens = [];
            }
            if (typeof options$500.comment === 'boolean' && options$500.comment) {
                extra$68.comments = [];
            }
            if (typeof options$500.tolerant === 'boolean' && options$500.tolerant) {
                extra$68.errors = [];
            }
            if (typeof options$500.noresolve === 'boolean' && options$500.noresolve) {
                extra$68.noresolve = options$500.noresolve;
            } else {
                extra$68.noresolve = false;
            }
        }
        patch$444();
        try {
            var classToParse$503 = {
                    'base': parseProgram$406,
                    'Program': parseProgram$406,
                    'expr': parseAssignmentExpression$285,
                    'ident': parsePrimaryExpression$220,
                    'lit': parsePrimaryExpression$220,
                    'LogicalANDExpression': parseLogicalANDExpression$277,
                    'PrimaryExpression': parsePrimaryExpression$220,
                    'VariableDeclarationList': parseVariableDeclarationList$302,
                    'StatementList': parseStatementList$289,
                    'SourceElements': function () {
                        state$66.inFunctionBody = true;
                        return parseSourceElements$400();
                    },
                    'FunctionDeclaration': parseFunctionDeclaration$378,
                    'FunctionExpression': parseFunctionExpression$388,
                    'ExpressionStatement': parseExpressionStatement$311,
                    'IfStatement': parseIfStatement$313,
                    'BreakStatement': parseBreakStatement$338,
                    'ContinueStatement': parseContinueStatement$335,
                    'WithStatement': parseWithStatement$344,
                    'SwitchStatement': parseSwitchStatement$351,
                    'ReturnStatement': parseReturnStatement$341,
                    'ThrowStatement': parseThrowStatement$355,
                    'TryStatement': parseTryStatement$359,
                    'WhileStatement': parseWhileStatement$321,
                    'ForStatement': parseForStatement$327,
                    'VariableDeclaration': parseVariableDeclaration$298,
                    'ArrayExpression': parseArrayInitialiser$197,
                    'ObjectExpression': parseObjectInitialiser$212,
                    'SequenceExpression': parseExpression$287,
                    'AssignmentExpression': parseAssignmentExpression$285,
                    'ConditionalExpression': parseConditionalExpression$281,
                    'NewExpression': parseNewExpression$237,
                    'CallExpression': parseLeftHandSideExpressionAllowCall$249,
                    'Block': parseBlock$292
                };
            if (classToParse$503[nodeType$499]) {
                program$501 = classToParse$503[nodeType$499]();
            } else {
                assert$69(false, 'unmatched parse class' + nodeType$499);
            }
            if (typeof extra$68.comments !== 'undefined') {
                program$501.comments = extra$68.comments;
            }
            if (typeof extra$68.tokens !== 'undefined') {
                program$501.tokens = tokenStream$67.slice(0, index$61);
            }
            if (typeof extra$68.errors !== 'undefined') {
                program$501.errors = extra$68.errors;
            }
        } catch (e$504) {
            throw e$504;
        } finally {
            unpatch$446();
            extra$68 = {};
        }
        return program$501;
    }
    exports$51.parse = parse$497;
    exports$51.read = read$492;
    exports$51.Token = Token$53;
    exports$51.assert = assert$69;
    exports$51.Syntax = function () {
        var name$505, types$506 = {};
        if (typeof Object.create === 'function') {
            types$506 = Object.create(null);
        }
        for (name$505 in Syntax$55) {
            if (Syntax$55.hasOwnProperty(name$505)) {
                types$506[name$505] = Syntax$55[name$505];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$506);
        }
        return types$506;
    }();
}));