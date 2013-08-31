(function (root$82, factory$83) {
    if (typeof exports === 'object') {
        factory$83(exports, require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$83);
    }
}(this, function (exports$84, expander$85) {
    'use strict';
    var Token$86, TokenName$87, Syntax$88, PropertyKind$89, Messages$90, Regex$91, source$92, strict$93, index$94, lineNumber$95, lineStart$96, length$97, buffer$98, state$99, tokenStream$100, extra$101;
    Token$86 = {
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
    TokenName$87 = {};
    TokenName$87[Token$86.BooleanLiteral] = 'Boolean';
    TokenName$87[Token$86.EOF] = '<end>';
    TokenName$87[Token$86.Identifier] = 'Identifier';
    TokenName$87[Token$86.Keyword] = 'Keyword';
    TokenName$87[Token$86.NullLiteral] = 'Null';
    TokenName$87[Token$86.NumericLiteral] = 'Numeric';
    TokenName$87[Token$86.Punctuator] = 'Punctuator';
    TokenName$87[Token$86.StringLiteral] = 'String';
    TokenName$87[Token$86.Delimiter] = 'Delimiter';
    Syntax$88 = {
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
    PropertyKind$89 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    Messages$90 = {
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
    Regex$91 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    function assert$102(condition$103, message$104) {
        if (!condition$103) {
            throw new Error('ASSERT: ' + message$104);
        }
    }
    function isIn$105(el$106, list$107) {
        return list$107.indexOf(el$106) !== -1;
    }
    function sliceSource$108(from$109, to$110) {
        return source$92.slice(from$109, to$110);
    }
    if (typeof 'esprima'[0] === 'undefined') {
        sliceSource$108 = function sliceArraySource$111(from$112, to$113) {
            return source$92.slice(from$112, to$113).join('');
        };
    }
    function isDecimalDigit$114(ch$115) {
        return '0123456789'.indexOf(ch$115) >= 0;
    }
    function isHexDigit$116(ch$117) {
        return '0123456789abcdefABCDEF'.indexOf(ch$117) >= 0;
    }
    function isOctalDigit$118(ch$119) {
        return '01234567'.indexOf(ch$119) >= 0;
    }
    function isWhiteSpace$120(ch$121) {
        return ch$121 === ' ' || ch$121 === '\t' || ch$121 === '\v' || ch$121 === '\f' || ch$121 === '\xa0' || ch$121.charCodeAt(0) >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(ch$121) >= 0;
    }
    function isLineTerminator$122(ch$123) {
        return ch$123 === '\n' || ch$123 === '\r' || ch$123 === '\u2028' || ch$123 === '\u2029';
    }
    function isIdentifierStart$124(ch$125) {
        return ch$125 === '$' || ch$125 === '_' || ch$125 === '\\' || ch$125 >= 'a' && ch$125 <= 'z' || ch$125 >= 'A' && ch$125 <= 'Z' || ch$125.charCodeAt(0) >= 128 && Regex$91.NonAsciiIdentifierStart.test(ch$125);
    }
    function isIdentifierPart$126(ch$127) {
        return ch$127 === '$' || ch$127 === '_' || ch$127 === '\\' || ch$127 >= 'a' && ch$127 <= 'z' || ch$127 >= 'A' && ch$127 <= 'Z' || ch$127 >= '0' && ch$127 <= '9' || ch$127.charCodeAt(0) >= 128 && Regex$91.NonAsciiIdentifierPart.test(ch$127);
    }
    function isFutureReservedWord$128(id$129) {
        return false;
    }
    function isStrictModeReservedWord$130(id$131) {
        switch (id$131) {
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
    function isRestrictedWord$132(id$133) {
        return id$133 === 'eval' || id$133 === 'arguments';
    }
    function isKeyword$134(id$135) {
        var keyword$136 = false;
        switch (id$135.length) {
        case 2:
            keyword$136 = id$135 === 'if' || id$135 === 'in' || id$135 === 'do';
            break;
        case 3:
            keyword$136 = id$135 === 'var' || id$135 === 'for' || id$135 === 'new' || id$135 === 'try';
            break;
        case 4:
            keyword$136 = id$135 === 'this' || id$135 === 'else' || id$135 === 'case' || id$135 === 'void' || id$135 === 'with';
            break;
        case 5:
            keyword$136 = id$135 === 'while' || id$135 === 'break' || id$135 === 'catch' || id$135 === 'throw';
            break;
        case 6:
            keyword$136 = id$135 === 'return' || id$135 === 'typeof' || id$135 === 'delete' || id$135 === 'switch';
            break;
        case 7:
            keyword$136 = id$135 === 'default' || id$135 === 'finally';
            break;
        case 8:
            keyword$136 = id$135 === 'function' || id$135 === 'continue' || id$135 === 'debugger';
            break;
        case 10:
            keyword$136 = id$135 === 'instanceof';
            break;
        }
        if (keyword$136) {
            return true;
        }
        switch (id$135) {
        case 'const':
            return true;
        case 'yield':
        case 'let':
            return true;
        }
        if (strict$93 && isStrictModeReservedWord$130(id$135)) {
            return true;
        }
        return isFutureReservedWord$128(id$135);
    }
    function nextChar$137() {
        return source$92[index$94++];
    }
    function getChar$138() {
        return source$92[index$94];
    }
    function skipComment$139() {
        var ch$140, blockComment$141, lineComment$142;
        blockComment$141 = false;
        lineComment$142 = false;
        while (index$94 < length$97) {
            ch$140 = source$92[index$94];
            if (lineComment$142) {
                ch$140 = nextChar$137();
                if (isLineTerminator$122(ch$140)) {
                    lineComment$142 = false;
                    if (ch$140 === '\r' && source$92[index$94] === '\n') {
                        ++index$94;
                    }
                    ++lineNumber$95;
                    lineStart$96 = index$94;
                }
            } else if (blockComment$141) {
                if (isLineTerminator$122(ch$140)) {
                    if (ch$140 === '\r' && source$92[index$94 + 1] === '\n') {
                        ++index$94;
                    }
                    ++lineNumber$95;
                    ++index$94;
                    lineStart$96 = index$94;
                    if (index$94 >= length$97) {
                        throwError$199({}, Messages$90.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$140 = nextChar$137();
                    if (index$94 >= length$97) {
                        throwError$199({}, Messages$90.UnexpectedToken, 'ILLEGAL');
                    }
                    if (ch$140 === '*') {
                        ch$140 = source$92[index$94];
                        if (ch$140 === '/') {
                            ++index$94;
                            blockComment$141 = false;
                        }
                    }
                }
            } else if (ch$140 === '/') {
                ch$140 = source$92[index$94 + 1];
                if (ch$140 === '/') {
                    index$94 += 2;
                    lineComment$142 = true;
                } else if (ch$140 === '*') {
                    index$94 += 2;
                    blockComment$141 = true;
                    if (index$94 >= length$97) {
                        throwError$199({}, Messages$90.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$120(ch$140)) {
                ++index$94;
            } else if (isLineTerminator$122(ch$140)) {
                ++index$94;
                if (ch$140 === '\r' && source$92[index$94] === '\n') {
                    ++index$94;
                }
                ++lineNumber$95;
                lineStart$96 = index$94;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$143(prefix$144) {
        var i$145, len$146, ch$147, code$148 = 0;
        len$146 = prefix$144 === 'u' ? 4 : 2;
        for (i$145 = 0; i$145 < len$146; ++i$145) {
            if (index$94 < length$97 && isHexDigit$116(source$92[index$94])) {
                ch$147 = nextChar$137();
                code$148 = code$148 * 16 + '0123456789abcdef'.indexOf(ch$147.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$148);
    }
    function scanIdentifier$149() {
        var ch$150, start$151, id$152, restore$153;
        ch$150 = source$92[index$94];
        if (!isIdentifierStart$124(ch$150)) {
            return;
        }
        start$151 = index$94;
        if (ch$150 === '\\') {
            ++index$94;
            if (source$92[index$94] !== 'u') {
                return;
            }
            ++index$94;
            restore$153 = index$94;
            ch$150 = scanHexEscape$143('u');
            if (ch$150) {
                if (ch$150 === '\\' || !isIdentifierStart$124(ch$150)) {
                    return;
                }
                id$152 = ch$150;
            } else {
                index$94 = restore$153;
                id$152 = 'u';
            }
        } else {
            id$152 = nextChar$137();
        }
        while (index$94 < length$97) {
            ch$150 = source$92[index$94];
            if (!isIdentifierPart$126(ch$150)) {
                break;
            }
            if (ch$150 === '\\') {
                ++index$94;
                if (source$92[index$94] !== 'u') {
                    return;
                }
                ++index$94;
                restore$153 = index$94;
                ch$150 = scanHexEscape$143('u');
                if (ch$150) {
                    if (ch$150 === '\\' || !isIdentifierPart$126(ch$150)) {
                        return;
                    }
                    id$152 += ch$150;
                } else {
                    index$94 = restore$153;
                    id$152 += 'u';
                }
            } else {
                id$152 += nextChar$137();
            }
        }
        if (id$152.length === 1) {
            return {
                type: Token$86.Identifier,
                value: id$152,
                lineNumber: lineNumber$95,
                lineStart: lineStart$96,
                range: [
                    start$151,
                    index$94
                ]
            };
        }
        if (isKeyword$134(id$152)) {
            return {
                type: Token$86.Keyword,
                value: id$152,
                lineNumber: lineNumber$95,
                lineStart: lineStart$96,
                range: [
                    start$151,
                    index$94
                ]
            };
        }
        if (id$152 === 'null') {
            return {
                type: Token$86.NullLiteral,
                value: id$152,
                lineNumber: lineNumber$95,
                lineStart: lineStart$96,
                range: [
                    start$151,
                    index$94
                ]
            };
        }
        if (id$152 === 'true' || id$152 === 'false') {
            return {
                type: Token$86.BooleanLiteral,
                value: id$152,
                lineNumber: lineNumber$95,
                lineStart: lineStart$96,
                range: [
                    start$151,
                    index$94
                ]
            };
        }
        return {
            type: Token$86.Identifier,
            value: id$152,
            lineNumber: lineNumber$95,
            lineStart: lineStart$96,
            range: [
                start$151,
                index$94
            ]
        };
    }
    function scanPunctuator$154() {
        var start$155 = index$94, ch1$156 = source$92[index$94], ch2$157, ch3$158, ch4$159;
        if (ch1$156 === ';' || ch1$156 === '{' || ch1$156 === '}') {
            ++index$94;
            return {
                type: Token$86.Punctuator,
                value: ch1$156,
                lineNumber: lineNumber$95,
                lineStart: lineStart$96,
                range: [
                    start$155,
                    index$94
                ]
            };
        }
        if (ch1$156 === ',' || ch1$156 === '(' || ch1$156 === ')') {
            ++index$94;
            return {
                type: Token$86.Punctuator,
                value: ch1$156,
                lineNumber: lineNumber$95,
                lineStart: lineStart$96,
                range: [
                    start$155,
                    index$94
                ]
            };
        }
        if (ch1$156 === '#') {
            ++index$94;
            return {
                type: Token$86.Punctuator,
                value: ch1$156,
                lineNumber: lineNumber$95,
                lineStart: lineStart$96,
                range: [
                    start$155,
                    index$94
                ]
            };
        }
        ch2$157 = source$92[index$94 + 1];
        if (ch1$156 === '.' && !isDecimalDigit$114(ch2$157)) {
            if (source$92[index$94 + 1] === '.' && source$92[index$94 + 2] === '.') {
                nextChar$137();
                nextChar$137();
                nextChar$137();
                return {
                    type: Token$86.Punctuator,
                    value: '...',
                    lineNumber: lineNumber$95,
                    lineStart: lineStart$96,
                    range: [
                        start$155,
                        index$94
                    ]
                };
            } else {
                return {
                    type: Token$86.Punctuator,
                    value: nextChar$137(),
                    lineNumber: lineNumber$95,
                    lineStart: lineStart$96,
                    range: [
                        start$155,
                        index$94
                    ]
                };
            }
        }
        ch3$158 = source$92[index$94 + 2];
        ch4$159 = source$92[index$94 + 3];
        if (ch1$156 === '>' && ch2$157 === '>' && ch3$158 === '>') {
            if (ch4$159 === '=') {
                index$94 += 4;
                return {
                    type: Token$86.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$95,
                    lineStart: lineStart$96,
                    range: [
                        start$155,
                        index$94
                    ]
                };
            }
        }
        if (ch1$156 === '=' && ch2$157 === '=' && ch3$158 === '=') {
            index$94 += 3;
            return {
                type: Token$86.Punctuator,
                value: '===',
                lineNumber: lineNumber$95,
                lineStart: lineStart$96,
                range: [
                    start$155,
                    index$94
                ]
            };
        }
        if (ch1$156 === '!' && ch2$157 === '=' && ch3$158 === '=') {
            index$94 += 3;
            return {
                type: Token$86.Punctuator,
                value: '!==',
                lineNumber: lineNumber$95,
                lineStart: lineStart$96,
                range: [
                    start$155,
                    index$94
                ]
            };
        }
        if (ch1$156 === '>' && ch2$157 === '>' && ch3$158 === '>') {
            index$94 += 3;
            return {
                type: Token$86.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$95,
                lineStart: lineStart$96,
                range: [
                    start$155,
                    index$94
                ]
            };
        }
        if (ch1$156 === '<' && ch2$157 === '<' && ch3$158 === '=') {
            index$94 += 3;
            return {
                type: Token$86.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$95,
                lineStart: lineStart$96,
                range: [
                    start$155,
                    index$94
                ]
            };
        }
        if (ch1$156 === '>' && ch2$157 === '>' && ch3$158 === '=') {
            index$94 += 3;
            return {
                type: Token$86.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$95,
                lineStart: lineStart$96,
                range: [
                    start$155,
                    index$94
                ]
            };
        }
        if (ch2$157 === '=') {
            if ('<>=!+-*%&|^/'.indexOf(ch1$156) >= 0) {
                index$94 += 2;
                return {
                    type: Token$86.Punctuator,
                    value: ch1$156 + ch2$157,
                    lineNumber: lineNumber$95,
                    lineStart: lineStart$96,
                    range: [
                        start$155,
                        index$94
                    ]
                };
            }
        }
        if (ch1$156 === ch2$157 && '+-<>&|'.indexOf(ch1$156) >= 0) {
            if ('+-<>&|'.indexOf(ch2$157) >= 0) {
                index$94 += 2;
                return {
                    type: Token$86.Punctuator,
                    value: ch1$156 + ch2$157,
                    lineNumber: lineNumber$95,
                    lineStart: lineStart$96,
                    range: [
                        start$155,
                        index$94
                    ]
                };
            }
        }
        if ('[]<>+-*%&|^!~?:=/'.indexOf(ch1$156) >= 0) {
            return {
                type: Token$86.Punctuator,
                value: nextChar$137(),
                lineNumber: lineNumber$95,
                lineStart: lineStart$96,
                range: [
                    start$155,
                    index$94
                ]
            };
        }
    }
    function scanNumericLiteral$160() {
        var number$161, start$162, ch$163;
        ch$163 = source$92[index$94];
        assert$102(isDecimalDigit$114(ch$163) || ch$163 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$162 = index$94;
        number$161 = '';
        if (ch$163 !== '.') {
            number$161 = nextChar$137();
            ch$163 = source$92[index$94];
            if (number$161 === '0') {
                if (ch$163 === 'x' || ch$163 === 'X') {
                    number$161 += nextChar$137();
                    while (index$94 < length$97) {
                        ch$163 = source$92[index$94];
                        if (!isHexDigit$116(ch$163)) {
                            break;
                        }
                        number$161 += nextChar$137();
                    }
                    if (number$161.length <= 2) {
                        throwError$199({}, Messages$90.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$94 < length$97) {
                        ch$163 = source$92[index$94];
                        if (isIdentifierStart$124(ch$163)) {
                            throwError$199({}, Messages$90.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$86.NumericLiteral,
                        value: parseInt(number$161, 16),
                        lineNumber: lineNumber$95,
                        lineStart: lineStart$96,
                        range: [
                            start$162,
                            index$94
                        ]
                    };
                } else if (isOctalDigit$118(ch$163)) {
                    number$161 += nextChar$137();
                    while (index$94 < length$97) {
                        ch$163 = source$92[index$94];
                        if (!isOctalDigit$118(ch$163)) {
                            break;
                        }
                        number$161 += nextChar$137();
                    }
                    if (index$94 < length$97) {
                        ch$163 = source$92[index$94];
                        if (isIdentifierStart$124(ch$163) || isDecimalDigit$114(ch$163)) {
                            throwError$199({}, Messages$90.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$86.NumericLiteral,
                        value: parseInt(number$161, 8),
                        octal: true,
                        lineNumber: lineNumber$95,
                        lineStart: lineStart$96,
                        range: [
                            start$162,
                            index$94
                        ]
                    };
                }
                if (isDecimalDigit$114(ch$163)) {
                    throwError$199({}, Messages$90.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (index$94 < length$97) {
                ch$163 = source$92[index$94];
                if (!isDecimalDigit$114(ch$163)) {
                    break;
                }
                number$161 += nextChar$137();
            }
        }
        if (ch$163 === '.') {
            number$161 += nextChar$137();
            while (index$94 < length$97) {
                ch$163 = source$92[index$94];
                if (!isDecimalDigit$114(ch$163)) {
                    break;
                }
                number$161 += nextChar$137();
            }
        }
        if (ch$163 === 'e' || ch$163 === 'E') {
            number$161 += nextChar$137();
            ch$163 = source$92[index$94];
            if (ch$163 === '+' || ch$163 === '-') {
                number$161 += nextChar$137();
            }
            ch$163 = source$92[index$94];
            if (isDecimalDigit$114(ch$163)) {
                number$161 += nextChar$137();
                while (index$94 < length$97) {
                    ch$163 = source$92[index$94];
                    if (!isDecimalDigit$114(ch$163)) {
                        break;
                    }
                    number$161 += nextChar$137();
                }
            } else {
                ch$163 = 'character ' + ch$163;
                if (index$94 >= length$97) {
                    ch$163 = '<end>';
                }
                throwError$199({}, Messages$90.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (index$94 < length$97) {
            ch$163 = source$92[index$94];
            if (isIdentifierStart$124(ch$163)) {
                throwError$199({}, Messages$90.UnexpectedToken, 'ILLEGAL');
            }
        }
        return {
            type: Token$86.NumericLiteral,
            value: parseFloat(number$161),
            lineNumber: lineNumber$95,
            lineStart: lineStart$96,
            range: [
                start$162,
                index$94
            ]
        };
    }
    function scanStringLiteral$164() {
        var str$165 = '', quote$166, start$167, ch$168, code$169, unescaped$170, restore$171, octal$172 = false;
        quote$166 = source$92[index$94];
        assert$102(quote$166 === '\'' || quote$166 === '"', 'String literal must starts with a quote');
        start$167 = index$94;
        ++index$94;
        while (index$94 < length$97) {
            ch$168 = nextChar$137();
            if (ch$168 === quote$166) {
                quote$166 = '';
                break;
            } else if (ch$168 === '\\') {
                ch$168 = nextChar$137();
                if (!isLineTerminator$122(ch$168)) {
                    switch (ch$168) {
                    case 'n':
                        str$165 += '\n';
                        break;
                    case 'r':
                        str$165 += '\r';
                        break;
                    case 't':
                        str$165 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        restore$171 = index$94;
                        unescaped$170 = scanHexEscape$143(ch$168);
                        if (unescaped$170) {
                            str$165 += unescaped$170;
                        } else {
                            index$94 = restore$171;
                            str$165 += ch$168;
                        }
                        break;
                    case 'b':
                        str$165 += '\b';
                        break;
                    case 'f':
                        str$165 += '\f';
                        break;
                    case 'v':
                        str$165 += '\v';
                        break;
                    default:
                        if (isOctalDigit$118(ch$168)) {
                            code$169 = '01234567'.indexOf(ch$168);
                            if (code$169 !== 0) {
                                octal$172 = true;
                            }
                            if (index$94 < length$97 && isOctalDigit$118(source$92[index$94])) {
                                octal$172 = true;
                                code$169 = code$169 * 8 + '01234567'.indexOf(nextChar$137());
                                if ('0123'.indexOf(ch$168) >= 0 && index$94 < length$97 && isOctalDigit$118(source$92[index$94])) {
                                    code$169 = code$169 * 8 + '01234567'.indexOf(nextChar$137());
                                }
                            }
                            str$165 += String.fromCharCode(code$169);
                        } else {
                            str$165 += ch$168;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$95;
                    if (ch$168 === '\r' && source$92[index$94] === '\n') {
                        ++index$94;
                    }
                }
            } else if (isLineTerminator$122(ch$168)) {
                break;
            } else {
                str$165 += ch$168;
            }
        }
        if (quote$166 !== '') {
            throwError$199({}, Messages$90.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$86.StringLiteral,
            value: str$165,
            octal: octal$172,
            lineNumber: lineNumber$95,
            lineStart: lineStart$96,
            range: [
                start$167,
                index$94
            ]
        };
    }
    function scanRegExp$173() {
        var str$174 = '', ch$175, start$176, pattern$177, flags$178, value$179, classMarker$180 = false, restore$181;
        buffer$98 = null;
        skipComment$139();
        start$176 = index$94;
        ch$175 = source$92[index$94];
        assert$102(ch$175 === '/', 'Regular expression literal must start with a slash');
        str$174 = nextChar$137();
        while (index$94 < length$97) {
            ch$175 = nextChar$137();
            str$174 += ch$175;
            if (classMarker$180) {
                if (ch$175 === ']') {
                    classMarker$180 = false;
                }
            } else {
                if (ch$175 === '\\') {
                    ch$175 = nextChar$137();
                    if (isLineTerminator$122(ch$175)) {
                        throwError$199({}, Messages$90.UnterminatedRegExp);
                    }
                    str$174 += ch$175;
                } else if (ch$175 === '/') {
                    break;
                } else if (ch$175 === '[') {
                    classMarker$180 = true;
                } else if (isLineTerminator$122(ch$175)) {
                    throwError$199({}, Messages$90.UnterminatedRegExp);
                }
            }
        }
        if (str$174.length === 1) {
            throwError$199({}, Messages$90.UnterminatedRegExp);
        }
        pattern$177 = str$174.substr(1, str$174.length - 2);
        flags$178 = '';
        while (index$94 < length$97) {
            ch$175 = source$92[index$94];
            if (!isIdentifierPart$126(ch$175)) {
                break;
            }
            ++index$94;
            if (ch$175 === '\\' && index$94 < length$97) {
                ch$175 = source$92[index$94];
                if (ch$175 === 'u') {
                    ++index$94;
                    restore$181 = index$94;
                    ch$175 = scanHexEscape$143('u');
                    if (ch$175) {
                        flags$178 += ch$175;
                        str$174 += '\\u';
                        for (; restore$181 < index$94; ++restore$181) {
                            str$174 += source$92[restore$181];
                        }
                    } else {
                        index$94 = restore$181;
                        flags$178 += 'u';
                        str$174 += '\\u';
                    }
                } else {
                    str$174 += '\\';
                }
            } else {
                flags$178 += ch$175;
                str$174 += ch$175;
            }
        }
        try {
            value$179 = new RegExp(pattern$177, flags$178);
        } catch (e$182) {
            throwError$199({}, Messages$90.InvalidRegExp);
        }
        return {
            type: Token$86.RegexLiteral,
            literal: str$174,
            value: value$179,
            lineNumber: lineNumber$95,
            lineStart: lineStart$96,
            range: [
                start$176,
                index$94
            ]
        };
    }
    function isIdentifierName$183(token$184) {
        return token$184.type === Token$86.Identifier || token$184.type === Token$86.Keyword || token$184.type === Token$86.BooleanLiteral || token$184.type === Token$86.NullLiteral;
    }
    function advance$185() {
        var ch$186, token$187;
        skipComment$139();
        if (index$94 >= length$97) {
            return {
                type: Token$86.EOF,
                lineNumber: lineNumber$95,
                lineStart: lineStart$96,
                range: [
                    index$94,
                    index$94
                ]
            };
        }
        ch$186 = source$92[index$94];
        token$187 = scanPunctuator$154();
        if (typeof token$187 !== 'undefined') {
            return token$187;
        }
        if (ch$186 === '\'' || ch$186 === '"') {
            return scanStringLiteral$164();
        }
        if (ch$186 === '.' || isDecimalDigit$114(ch$186)) {
            return scanNumericLiteral$160();
        }
        token$187 = scanIdentifier$149();
        if (typeof token$187 !== 'undefined') {
            return token$187;
        }
        throwError$199({}, Messages$90.UnexpectedToken, 'ILLEGAL');
    }
    function lex$188() {
        var token$189;
        if (buffer$98) {
            token$189 = buffer$98;
            buffer$98 = null;
            index$94++;
            return token$189;
        }
        buffer$98 = null;
        return tokenStream$100[index$94++];
    }
    function lookahead$190() {
        var pos$191, line$192, start$193;
        if (buffer$98 !== null) {
            return buffer$98;
        }
        buffer$98 = tokenStream$100[index$94];
        return buffer$98;
    }
    function peekLineTerminator$194() {
        var pos$195, line$196, start$197, found$198;
        found$198 = tokenStream$100[index$94 - 1].token.lineNumber !== tokenStream$100[index$94].token.lineNumber;
        return found$198;
    }
    function throwError$199(token$200, messageFormat$201) {
        var error$202, args$203 = Array.prototype.slice.call(arguments, 2), msg$204 = messageFormat$201.replace(/%(\d)/g, function (whole$205, index$206) {
                return args$203[index$206] || '';
            });
        if (typeof token$200.lineNumber === 'number') {
            error$202 = new Error('Line ' + token$200.lineNumber + ': ' + msg$204);
            error$202.lineNumber = token$200.lineNumber;
            if (token$200.range && token$200.range.length > 0) {
                error$202.index = token$200.range[0];
                error$202.column = token$200.range[0] - lineStart$96 + 1;
            }
        } else {
            error$202 = new Error('Line ' + lineNumber$95 + ': ' + msg$204);
            error$202.index = index$94;
            error$202.lineNumber = lineNumber$95;
            error$202.column = index$94 - lineStart$96 + 1;
        }
        throw error$202;
    }
    function throwErrorTolerant$207() {
        var error$208;
        try {
            throwError$199.apply(null, arguments);
        } catch (e$209) {
            if (extra$101.errors) {
                extra$101.errors.push(e$209);
            } else {
                throw e$209;
            }
        }
    }
    function throwUnexpected$210(token$211) {
        var s$212;
        if (token$211.type === Token$86.EOF) {
            throwError$199(token$211, Messages$90.UnexpectedEOS);
        }
        if (token$211.type === Token$86.NumericLiteral) {
            throwError$199(token$211, Messages$90.UnexpectedNumber);
        }
        if (token$211.type === Token$86.StringLiteral) {
            throwError$199(token$211, Messages$90.UnexpectedString);
        }
        if (token$211.type === Token$86.Identifier) {
            console.log(token$211);
            throwError$199(token$211, Messages$90.UnexpectedIdentifier);
        }
        if (token$211.type === Token$86.Keyword) {
            if (isFutureReservedWord$128(token$211.value)) {
                throwError$199(token$211, Messages$90.UnexpectedReserved);
            } else if (strict$93 && isStrictModeReservedWord$130(token$211.value)) {
                throwError$199(token$211, Messages$90.StrictReservedWord);
            }
            throwError$199(token$211, Messages$90.UnexpectedToken, token$211.value);
        }
        throwError$199(token$211, Messages$90.UnexpectedToken, token$211.value);
    }
    function expect$213(value$214) {
        var token$215 = lex$188().token;
        if (token$215.type !== Token$86.Punctuator || token$215.value !== value$214) {
            throwUnexpected$210(token$215);
        }
    }
    function expectKeyword$216(keyword$217) {
        var token$218 = lex$188().token;
        if (token$218.type !== Token$86.Keyword || token$218.value !== keyword$217) {
            throwUnexpected$210(token$218);
        }
    }
    function match$219(value$220) {
        var token$221 = lookahead$190().token;
        return token$221.type === Token$86.Punctuator && token$221.value === value$220;
    }
    function matchKeyword$222(keyword$223) {
        var token$224 = lookahead$190().token;
        return token$224.type === Token$86.Keyword && token$224.value === keyword$223;
    }
    function matchAssign$225() {
        var token$226 = lookahead$190().token, op$227 = token$226.value;
        if (token$226.type !== Token$86.Punctuator) {
            return false;
        }
        return op$227 === '=' || op$227 === '*=' || op$227 === '/=' || op$227 === '%=' || op$227 === '+=' || op$227 === '-=' || op$227 === '<<=' || op$227 === '>>=' || op$227 === '>>>=' || op$227 === '&=' || op$227 === '^=' || op$227 === '|=';
    }
    function consumeSemicolon$228() {
        var token$229, line$230;
        if (tokenStream$100[index$94].token.value === ';') {
            lex$188().token;
            return;
        }
        line$230 = tokenStream$100[index$94 - 1].token.lineNumber;
        token$229 = tokenStream$100[index$94].token;
        if (line$230 !== token$229.lineNumber) {
            return;
        }
        if (token$229.type !== Token$86.EOF && !match$219('}')) {
            throwUnexpected$210(token$229);
        }
        return;
    }
    function isLeftHandSide$231(expr$232) {
        return expr$232.type === Syntax$88.Identifier || expr$232.type === Syntax$88.MemberExpression;
    }
    function parseArrayInitialiser$233() {
        var elements$234 = [], undef$235;
        expect$213('[');
        while (!match$219(']')) {
            if (match$219(',')) {
                lex$188().token;
                elements$234.push(undef$235);
            } else {
                elements$234.push(parseAssignmentExpression$321());
                if (!match$219(']')) {
                    expect$213(',');
                }
            }
        }
        expect$213(']');
        return {
            type: Syntax$88.ArrayExpression,
            elements: elements$234
        };
    }
    function parsePropertyFunction$236(param$237, first$238) {
        var previousStrict$239, body$240;
        previousStrict$239 = strict$93;
        body$240 = parseFunctionSourceElements$404();
        if (first$238 && strict$93 && isRestrictedWord$132(param$237[0].name)) {
            throwError$199(first$238, Messages$90.StrictParamName);
        }
        strict$93 = previousStrict$239;
        return {
            type: Syntax$88.FunctionExpression,
            id: null,
            params: param$237,
            body: body$240
        };
    }
    function parseObjectPropertyKey$241() {
        var token$242 = lex$188().token;
        if (token$242.type === Token$86.StringLiteral || token$242.type === Token$86.NumericLiteral) {
            if (strict$93 && token$242.octal) {
                throwError$199(token$242, Messages$90.StrictOctalLiteral);
            }
            return createLiteral$463(token$242);
        }
        return {
            type: Syntax$88.Identifier,
            name: token$242.value
        };
    }
    function parseObjectProperty$243() {
        var token$244, key$245, id$246, param$247;
        token$244 = lookahead$190().token;
        if (token$244.type === Token$86.Identifier) {
            id$246 = parseObjectPropertyKey$241();
            if (token$244.value === 'get' && !match$219(':')) {
                key$245 = parseObjectPropertyKey$241();
                expect$213('(');
                expect$213(')');
                return {
                    type: Syntax$88.Property,
                    key: key$245,
                    value: parsePropertyFunction$236([]),
                    kind: 'get'
                };
            } else if (token$244.value === 'set' && !match$219(':')) {
                key$245 = parseObjectPropertyKey$241();
                expect$213('(');
                token$244 = lookahead$190().token;
                if (token$244.type !== Token$86.Identifier) {
                    throwUnexpected$210(lex$188().token);
                }
                param$247 = [parseVariableIdentifier$330()];
                expect$213(')');
                return {
                    type: Syntax$88.Property,
                    key: key$245,
                    value: parsePropertyFunction$236(param$247, token$244),
                    kind: 'set'
                };
            } else {
                expect$213(':');
                return {
                    type: Syntax$88.Property,
                    key: id$246,
                    value: parseAssignmentExpression$321(),
                    kind: 'init'
                };
            }
        } else if (token$244.type === Token$86.EOF || token$244.type === Token$86.Punctuator) {
            throwUnexpected$210(token$244);
        } else {
            key$245 = parseObjectPropertyKey$241();
            expect$213(':');
            return {
                type: Syntax$88.Property,
                key: key$245,
                value: parseAssignmentExpression$321(),
                kind: 'init'
            };
        }
    }
    function parseObjectInitialiser$248() {
        var token$249, properties$250 = [], property$251, name$252, kind$253, map$254 = {}, toString$255 = String;
        expect$213('{');
        while (!match$219('}')) {
            property$251 = parseObjectProperty$243();
            if (property$251.key.type === Syntax$88.Identifier) {
                name$252 = property$251.key.name;
            } else {
                name$252 = toString$255(property$251.key.value);
            }
            kind$253 = property$251.kind === 'init' ? PropertyKind$89.Data : property$251.kind === 'get' ? PropertyKind$89.Get : PropertyKind$89.Set;
            if (Object.prototype.hasOwnProperty.call(map$254, name$252)) {
                if (map$254[name$252] === PropertyKind$89.Data) {
                    if (strict$93 && kind$253 === PropertyKind$89.Data) {
                        throwErrorTolerant$207({}, Messages$90.StrictDuplicateProperty);
                    } else if (kind$253 !== PropertyKind$89.Data) {
                        throwError$199({}, Messages$90.AccessorDataProperty);
                    }
                } else {
                    if (kind$253 === PropertyKind$89.Data) {
                        throwError$199({}, Messages$90.AccessorDataProperty);
                    } else if (map$254[name$252] & kind$253) {
                        throwError$199({}, Messages$90.AccessorGetSet);
                    }
                }
                map$254[name$252] |= kind$253;
            } else {
                map$254[name$252] = kind$253;
            }
            properties$250.push(property$251);
            if (!match$219('}')) {
                expect$213(',');
            }
        }
        expect$213('}');
        return {
            type: Syntax$88.ObjectExpression,
            properties: properties$250
        };
    }
    function parsePrimaryExpression$256() {
        var expr$257, token$258 = lookahead$190().token, type$259 = token$258.type;
        if (type$259 === Token$86.Identifier) {
            var name$260 = extra$101.noresolve ? lex$188().token.value : expander$85.resolve(lex$188());
            return {
                type: Syntax$88.Identifier,
                name: name$260
            };
        }
        if (type$259 === Token$86.StringLiteral || type$259 === Token$86.NumericLiteral) {
            if (strict$93 && token$258.octal) {
                throwErrorTolerant$207(token$258, Messages$90.StrictOctalLiteral);
            }
            return createLiteral$463(lex$188().token);
        }
        if (type$259 === Token$86.Keyword) {
            if (matchKeyword$222('this')) {
                lex$188().token;
                return {type: Syntax$88.ThisExpression};
            }
            if (matchKeyword$222('function')) {
                return parseFunctionExpression$424();
            }
        }
        if (type$259 === Token$86.BooleanLiteral) {
            lex$188();
            token$258.value = token$258.value === 'true';
            return createLiteral$463(token$258);
        }
        if (type$259 === Token$86.NullLiteral) {
            lex$188();
            token$258.value = null;
            return createLiteral$463(token$258);
        }
        if (match$219('[')) {
            return parseArrayInitialiser$233();
        }
        if (match$219('{')) {
            return parseObjectInitialiser$248();
        }
        if (match$219('(')) {
            lex$188();
            state$99.lastParenthesized = expr$257 = parseExpression$323();
            expect$213(')');
            return expr$257;
        }
        if (token$258.value instanceof RegExp) {
            return createLiteral$463(lex$188().token);
        }
        return throwUnexpected$210(lex$188().token);
    }
    function parseArguments$261() {
        var args$262 = [];
        expect$213('(');
        if (!match$219(')')) {
            while (index$94 < length$97) {
                args$262.push(parseAssignmentExpression$321());
                if (match$219(')')) {
                    break;
                }
                expect$213(',');
            }
        }
        expect$213(')');
        return args$262;
    }
    function parseNonComputedProperty$263() {
        var token$264 = lex$188().token;
        if (!isIdentifierName$183(token$264)) {
            throwUnexpected$210(token$264);
        }
        return {
            type: Syntax$88.Identifier,
            name: token$264.value
        };
    }
    function parseNonComputedMember$265(object$266) {
        return {
            type: Syntax$88.MemberExpression,
            computed: false,
            object: object$266,
            property: parseNonComputedProperty$263()
        };
    }
    function parseComputedMember$267(object$268) {
        var property$269, expr$270;
        expect$213('[');
        property$269 = parseExpression$323();
        expr$270 = {
            type: Syntax$88.MemberExpression,
            computed: true,
            object: object$268,
            property: property$269
        };
        expect$213(']');
        return expr$270;
    }
    function parseCallMember$271(object$272) {
        return {
            type: Syntax$88.CallExpression,
            callee: object$272,
            'arguments': parseArguments$261()
        };
    }
    function parseNewExpression$273() {
        var expr$274;
        expectKeyword$216('new');
        expr$274 = {
            type: Syntax$88.NewExpression,
            callee: parseLeftHandSideExpression$288(),
            'arguments': []
        };
        if (match$219('(')) {
            expr$274['arguments'] = parseArguments$261();
        }
        return expr$274;
    }
    function toArrayNode$275(arr$276) {
        var els$277 = arr$276.map(function (el$278) {
                return {
                    type: 'Literal',
                    value: el$278,
                    raw: el$278.toString()
                };
            });
        return {
            type: 'ArrayExpression',
            elements: els$277
        };
    }
    function toObjectNode$279(obj$280) {
        var props$281 = Object.keys(obj$280).map(function (key$282) {
                var raw$283 = obj$280[key$282];
                var value$284;
                if (Array.isArray(raw$283)) {
                    value$284 = toArrayNode$275(raw$283);
                } else {
                    value$284 = {
                        type: 'Literal',
                        value: obj$280[key$282],
                        raw: obj$280[key$282].toString()
                    };
                }
                return {
                    type: 'Property',
                    key: {
                        type: 'Identifier',
                        name: key$282
                    },
                    value: value$284,
                    kind: 'init'
                };
            });
        return {
            type: 'ObjectExpression',
            properties: props$281
        };
    }
    function parseLeftHandSideExpressionAllowCall$285() {
        var useNew$286, expr$287;
        useNew$286 = matchKeyword$222('new');
        expr$287 = useNew$286 ? parseNewExpression$273() : parsePrimaryExpression$256();
        while (index$94 < length$97) {
            if (match$219('.')) {
                lex$188();
                expr$287 = parseNonComputedMember$265(expr$287);
            } else if (match$219('[')) {
                expr$287 = parseComputedMember$267(expr$287);
            } else if (match$219('(')) {
                expr$287 = parseCallMember$271(expr$287);
            } else {
                break;
            }
        }
        return expr$287;
    }
    function parseLeftHandSideExpression$288() {
        var useNew$289, expr$290;
        useNew$289 = matchKeyword$222('new');
        expr$290 = useNew$289 ? parseNewExpression$273() : parsePrimaryExpression$256();
        while (index$94 < length$97) {
            if (match$219('.')) {
                lex$188();
                expr$290 = parseNonComputedMember$265(expr$290);
            } else if (match$219('[')) {
                expr$290 = parseComputedMember$267(expr$290);
            } else {
                break;
            }
        }
        return expr$290;
    }
    function parsePostfixExpression$291() {
        var expr$292 = parseLeftHandSideExpressionAllowCall$285();
        if ((match$219('++') || match$219('--')) && !peekLineTerminator$194()) {
            if (strict$93 && expr$292.type === Syntax$88.Identifier && isRestrictedWord$132(expr$292.name)) {
                throwError$199({}, Messages$90.StrictLHSPostfix);
            }
            if (!isLeftHandSide$231(expr$292)) {
                throwError$199({}, Messages$90.InvalidLHSInAssignment);
            }
            expr$292 = {
                type: Syntax$88.UpdateExpression,
                operator: lex$188().token.value,
                argument: expr$292,
                prefix: false
            };
        }
        return expr$292;
    }
    function parseUnaryExpression$293() {
        var token$294, expr$295;
        if (match$219('++') || match$219('--')) {
            token$294 = lex$188().token;
            expr$295 = parseUnaryExpression$293();
            if (strict$93 && expr$295.type === Syntax$88.Identifier && isRestrictedWord$132(expr$295.name)) {
                throwError$199({}, Messages$90.StrictLHSPrefix);
            }
            if (!isLeftHandSide$231(expr$295)) {
                throwError$199({}, Messages$90.InvalidLHSInAssignment);
            }
            expr$295 = {
                type: Syntax$88.UpdateExpression,
                operator: token$294.value,
                argument: expr$295,
                prefix: true
            };
            return expr$295;
        }
        if (match$219('+') || match$219('-') || match$219('~') || match$219('!')) {
            expr$295 = {
                type: Syntax$88.UnaryExpression,
                operator: lex$188().token.value,
                argument: parseUnaryExpression$293()
            };
            return expr$295;
        }
        if (matchKeyword$222('delete') || matchKeyword$222('void') || matchKeyword$222('typeof')) {
            expr$295 = {
                type: Syntax$88.UnaryExpression,
                operator: lex$188().token.value,
                argument: parseUnaryExpression$293()
            };
            if (strict$93 && expr$295.operator === 'delete' && expr$295.argument.type === Syntax$88.Identifier) {
                throwErrorTolerant$207({}, Messages$90.StrictDelete);
            }
            return expr$295;
        }
        return parsePostfixExpression$291();
    }
    function parseMultiplicativeExpression$296() {
        var expr$297 = parseUnaryExpression$293();
        while (match$219('*') || match$219('/') || match$219('%')) {
            expr$297 = {
                type: Syntax$88.BinaryExpression,
                operator: lex$188().token.value,
                left: expr$297,
                right: parseUnaryExpression$293()
            };
        }
        return expr$297;
    }
    function parseAdditiveExpression$298() {
        var expr$299 = parseMultiplicativeExpression$296();
        while (match$219('+') || match$219('-')) {
            expr$299 = {
                type: Syntax$88.BinaryExpression,
                operator: lex$188().token.value,
                left: expr$299,
                right: parseMultiplicativeExpression$296()
            };
        }
        return expr$299;
    }
    function parseShiftExpression$300() {
        var expr$301 = parseAdditiveExpression$298();
        while (match$219('<<') || match$219('>>') || match$219('>>>')) {
            expr$301 = {
                type: Syntax$88.BinaryExpression,
                operator: lex$188().token.value,
                left: expr$301,
                right: parseAdditiveExpression$298()
            };
        }
        return expr$301;
    }
    function parseRelationalExpression$302() {
        var expr$303, previousAllowIn$304;
        previousAllowIn$304 = state$99.allowIn;
        state$99.allowIn = true;
        expr$303 = parseShiftExpression$300();
        while (match$219('<') || match$219('>') || match$219('<=') || match$219('>=') || previousAllowIn$304 && matchKeyword$222('in') || matchKeyword$222('instanceof')) {
            expr$303 = {
                type: Syntax$88.BinaryExpression,
                operator: lex$188().token.value,
                left: expr$303,
                right: parseRelationalExpression$302()
            };
        }
        state$99.allowIn = previousAllowIn$304;
        return expr$303;
    }
    function parseEqualityExpression$305() {
        var expr$306 = parseRelationalExpression$302();
        while (match$219('==') || match$219('!=') || match$219('===') || match$219('!==')) {
            expr$306 = {
                type: Syntax$88.BinaryExpression,
                operator: lex$188().token.value,
                left: expr$306,
                right: parseRelationalExpression$302()
            };
        }
        return expr$306;
    }
    function parseBitwiseANDExpression$307() {
        var expr$308 = parseEqualityExpression$305();
        while (match$219('&')) {
            lex$188();
            expr$308 = {
                type: Syntax$88.BinaryExpression,
                operator: '&',
                left: expr$308,
                right: parseEqualityExpression$305()
            };
        }
        return expr$308;
    }
    function parseBitwiseXORExpression$309() {
        var expr$310 = parseBitwiseANDExpression$307();
        while (match$219('^')) {
            lex$188();
            expr$310 = {
                type: Syntax$88.BinaryExpression,
                operator: '^',
                left: expr$310,
                right: parseBitwiseANDExpression$307()
            };
        }
        return expr$310;
    }
    function parseBitwiseORExpression$311() {
        var expr$312 = parseBitwiseXORExpression$309();
        while (match$219('|')) {
            lex$188();
            expr$312 = {
                type: Syntax$88.BinaryExpression,
                operator: '|',
                left: expr$312,
                right: parseBitwiseXORExpression$309()
            };
        }
        return expr$312;
    }
    function parseLogicalANDExpression$313() {
        var expr$314 = parseBitwiseORExpression$311();
        while (match$219('&&')) {
            lex$188();
            expr$314 = {
                type: Syntax$88.LogicalExpression,
                operator: '&&',
                left: expr$314,
                right: parseBitwiseORExpression$311()
            };
        }
        return expr$314;
    }
    function parseLogicalORExpression$315() {
        var expr$316 = parseLogicalANDExpression$313();
        while (match$219('||')) {
            lex$188();
            expr$316 = {
                type: Syntax$88.LogicalExpression,
                operator: '||',
                left: expr$316,
                right: parseLogicalANDExpression$313()
            };
        }
        return expr$316;
    }
    function parseConditionalExpression$317() {
        var expr$318, previousAllowIn$319, consequent$320;
        expr$318 = parseLogicalORExpression$315();
        if (match$219('?')) {
            lex$188();
            previousAllowIn$319 = state$99.allowIn;
            state$99.allowIn = true;
            consequent$320 = parseAssignmentExpression$321();
            state$99.allowIn = previousAllowIn$319;
            expect$213(':');
            expr$318 = {
                type: Syntax$88.ConditionalExpression,
                test: expr$318,
                consequent: consequent$320,
                alternate: parseAssignmentExpression$321()
            };
        }
        return expr$318;
    }
    function parseAssignmentExpression$321() {
        var expr$322;
        expr$322 = parseConditionalExpression$317();
        if (matchAssign$225()) {
            if (!isLeftHandSide$231(expr$322)) {
                throwError$199({}, Messages$90.InvalidLHSInAssignment);
            }
            if (strict$93 && expr$322.type === Syntax$88.Identifier && isRestrictedWord$132(expr$322.name)) {
                throwError$199({}, Messages$90.StrictLHSAssignment);
            }
            expr$322 = {
                type: Syntax$88.AssignmentExpression,
                operator: lex$188().token.value,
                left: expr$322,
                right: parseAssignmentExpression$321()
            };
        }
        return expr$322;
    }
    function parseExpression$323() {
        var expr$324 = parseAssignmentExpression$321();
        if (match$219(',')) {
            expr$324 = {
                type: Syntax$88.SequenceExpression,
                expressions: [expr$324]
            };
            while (index$94 < length$97) {
                if (!match$219(',')) {
                    break;
                }
                lex$188();
                expr$324.expressions.push(parseAssignmentExpression$321());
            }
        }
        return expr$324;
    }
    function parseStatementList$325() {
        var list$326 = [], statement$327;
        while (index$94 < length$97) {
            if (match$219('}')) {
                break;
            }
            statement$327 = parseSourceElement$434();
            if (typeof statement$327 === 'undefined') {
                break;
            }
            list$326.push(statement$327);
        }
        return list$326;
    }
    function parseBlock$328() {
        var block$329;
        expect$213('{');
        block$329 = parseStatementList$325();
        expect$213('}');
        return {
            type: Syntax$88.BlockStatement,
            body: block$329
        };
    }
    function parseVariableIdentifier$330() {
        var stx$331 = lex$188(), token$332 = stx$331.token;
        if (token$332.type !== Token$86.Identifier) {
            throwUnexpected$210(token$332);
        }
        var name$333 = extra$101.noresolve ? stx$331 : expander$85.resolve(stx$331);
        return {
            type: Syntax$88.Identifier,
            name: name$333
        };
    }
    function parseVariableDeclaration$334(kind$335) {
        var id$336 = parseVariableIdentifier$330(), init$337 = null;
        if (strict$93 && isRestrictedWord$132(id$336.name)) {
            throwErrorTolerant$207({}, Messages$90.StrictVarName);
        }
        if (kind$335 === 'const') {
            expect$213('=');
            init$337 = parseAssignmentExpression$321();
        } else if (match$219('=')) {
            lex$188();
            init$337 = parseAssignmentExpression$321();
        }
        return {
            type: Syntax$88.VariableDeclarator,
            id: id$336,
            init: init$337
        };
    }
    function parseVariableDeclarationList$338(kind$339) {
        var list$340 = [];
        while (index$94 < length$97) {
            list$340.push(parseVariableDeclaration$334(kind$339));
            if (!match$219(',')) {
                break;
            }
            lex$188();
        }
        return list$340;
    }
    function parseVariableStatement$341() {
        var declarations$342;
        expectKeyword$216('var');
        declarations$342 = parseVariableDeclarationList$338();
        consumeSemicolon$228();
        return {
            type: Syntax$88.VariableDeclaration,
            declarations: declarations$342,
            kind: 'var'
        };
    }
    function parseConstLetDeclaration$343(kind$344) {
        var declarations$345;
        expectKeyword$216(kind$344);
        declarations$345 = parseVariableDeclarationList$338(kind$344);
        consumeSemicolon$228();
        return {
            type: Syntax$88.VariableDeclaration,
            declarations: declarations$345,
            kind: kind$344
        };
    }
    function parseEmptyStatement$346() {
        expect$213(';');
        return {type: Syntax$88.EmptyStatement};
    }
    function parseExpressionStatement$347() {
        var expr$348 = parseExpression$323();
        consumeSemicolon$228();
        return {
            type: Syntax$88.ExpressionStatement,
            expression: expr$348
        };
    }
    function parseIfStatement$349() {
        var test$350, consequent$351, alternate$352;
        expectKeyword$216('if');
        expect$213('(');
        test$350 = parseExpression$323();
        expect$213(')');
        consequent$351 = parseStatement$400();
        if (matchKeyword$222('else')) {
            lex$188();
            alternate$352 = parseStatement$400();
        } else {
            alternate$352 = null;
        }
        return {
            type: Syntax$88.IfStatement,
            test: test$350,
            consequent: consequent$351,
            alternate: alternate$352
        };
    }
    function parseDoWhileStatement$353() {
        var body$354, test$355, oldInIteration$356;
        expectKeyword$216('do');
        oldInIteration$356 = state$99.inIteration;
        state$99.inIteration = true;
        body$354 = parseStatement$400();
        state$99.inIteration = oldInIteration$356;
        expectKeyword$216('while');
        expect$213('(');
        test$355 = parseExpression$323();
        expect$213(')');
        if (match$219(';')) {
            lex$188();
        }
        return {
            type: Syntax$88.DoWhileStatement,
            body: body$354,
            test: test$355
        };
    }
    function parseWhileStatement$357() {
        var test$358, body$359, oldInIteration$360;
        expectKeyword$216('while');
        expect$213('(');
        test$358 = parseExpression$323();
        expect$213(')');
        oldInIteration$360 = state$99.inIteration;
        state$99.inIteration = true;
        body$359 = parseStatement$400();
        state$99.inIteration = oldInIteration$360;
        return {
            type: Syntax$88.WhileStatement,
            test: test$358,
            body: body$359
        };
    }
    function parseForVariableDeclaration$361() {
        var token$362 = lex$188().token;
        return {
            type: Syntax$88.VariableDeclaration,
            declarations: parseVariableDeclarationList$338(),
            kind: token$362.value
        };
    }
    function parseForStatement$363() {
        var init$364, test$365, update$366, left$367, right$368, body$369, oldInIteration$370;
        init$364 = test$365 = update$366 = null;
        expectKeyword$216('for');
        expect$213('(');
        if (match$219(';')) {
            lex$188();
        } else {
            if (matchKeyword$222('var') || matchKeyword$222('let')) {
                state$99.allowIn = false;
                init$364 = parseForVariableDeclaration$361();
                state$99.allowIn = true;
                if (init$364.declarations.length === 1 && matchKeyword$222('in')) {
                    lex$188();
                    left$367 = init$364;
                    right$368 = parseExpression$323();
                    init$364 = null;
                }
            } else {
                state$99.allowIn = false;
                init$364 = parseExpression$323();
                state$99.allowIn = true;
                if (matchKeyword$222('in')) {
                    if (!isLeftHandSide$231(init$364)) {
                        throwError$199({}, Messages$90.InvalidLHSInForIn);
                    }
                    lex$188();
                    left$367 = init$364;
                    right$368 = parseExpression$323();
                    init$364 = null;
                }
            }
            if (typeof left$367 === 'undefined') {
                expect$213(';');
            }
        }
        if (typeof left$367 === 'undefined') {
            if (!match$219(';')) {
                test$365 = parseExpression$323();
            }
            expect$213(';');
            if (!match$219(')')) {
                update$366 = parseExpression$323();
            }
        }
        expect$213(')');
        oldInIteration$370 = state$99.inIteration;
        state$99.inIteration = true;
        body$369 = parseStatement$400();
        state$99.inIteration = oldInIteration$370;
        if (typeof left$367 === 'undefined') {
            return {
                type: Syntax$88.ForStatement,
                init: init$364,
                test: test$365,
                update: update$366,
                body: body$369
            };
        }
        return {
            type: Syntax$88.ForInStatement,
            left: left$367,
            right: right$368,
            body: body$369,
            each: false
        };
    }
    function parseContinueStatement$371() {
        var token$372, label$373 = null;
        expectKeyword$216('continue');
        if (tokenStream$100[index$94].token.value === ';') {
            lex$188();
            if (!state$99.inIteration) {
                throwError$199({}, Messages$90.IllegalContinue);
            }
            return {
                type: Syntax$88.ContinueStatement,
                label: null
            };
        }
        if (peekLineTerminator$194()) {
            if (!state$99.inIteration) {
                throwError$199({}, Messages$90.IllegalContinue);
            }
            return {
                type: Syntax$88.ContinueStatement,
                label: null
            };
        }
        token$372 = lookahead$190().token;
        if (token$372.type === Token$86.Identifier) {
            label$373 = parseVariableIdentifier$330();
            if (!Object.prototype.hasOwnProperty.call(state$99.labelSet, label$373.name)) {
                throwError$199({}, Messages$90.UnknownLabel, label$373.name);
            }
        }
        consumeSemicolon$228();
        if (label$373 === null && !state$99.inIteration) {
            throwError$199({}, Messages$90.IllegalContinue);
        }
        return {
            type: Syntax$88.ContinueStatement,
            label: label$373
        };
    }
    function parseBreakStatement$374() {
        var token$375, label$376 = null;
        expectKeyword$216('break');
        if (peekLineTerminator$194()) {
            if (!(state$99.inIteration || state$99.inSwitch)) {
                throwError$199({}, Messages$90.IllegalBreak);
            }
            return {
                type: Syntax$88.BreakStatement,
                label: null
            };
        }
        token$375 = lookahead$190().token;
        if (token$375.type === Token$86.Identifier) {
            label$376 = parseVariableIdentifier$330();
            if (!Object.prototype.hasOwnProperty.call(state$99.labelSet, label$376.name)) {
                throwError$199({}, Messages$90.UnknownLabel, label$376.name);
            }
        }
        consumeSemicolon$228();
        if (label$376 === null && !(state$99.inIteration || state$99.inSwitch)) {
            throwError$199({}, Messages$90.IllegalBreak);
        }
        return {
            type: Syntax$88.BreakStatement,
            label: label$376
        };
    }
    function parseReturnStatement$377() {
        var token$378, argument$379 = null;
        expectKeyword$216('return');
        if (!state$99.inFunctionBody) {
            throwErrorTolerant$207({}, Messages$90.IllegalReturn);
        }
        if (peekLineTerminator$194()) {
            return {
                type: Syntax$88.ReturnStatement,
                argument: null
            };
        }
        if (!match$219(';')) {
            token$378 = lookahead$190().token;
            if (!match$219('}') && token$378.type !== Token$86.EOF) {
                argument$379 = parseExpression$323();
            }
        }
        consumeSemicolon$228();
        return {
            type: Syntax$88.ReturnStatement,
            argument: argument$379
        };
    }
    function parseWithStatement$380() {
        var object$381, body$382;
        if (strict$93) {
            throwErrorTolerant$207({}, Messages$90.StrictModeWith);
        }
        expectKeyword$216('with');
        expect$213('(');
        object$381 = parseExpression$323();
        expect$213(')');
        body$382 = parseStatement$400();
        return {
            type: Syntax$88.WithStatement,
            object: object$381,
            body: body$382
        };
    }
    function parseSwitchCase$383() {
        var test$384, consequent$385 = [], statement$386;
        if (matchKeyword$222('default')) {
            lex$188();
            test$384 = null;
        } else {
            expectKeyword$216('case');
            test$384 = parseExpression$323();
        }
        expect$213(':');
        while (index$94 < length$97) {
            if (match$219('}') || matchKeyword$222('default') || matchKeyword$222('case')) {
                break;
            }
            statement$386 = parseStatement$400();
            if (typeof statement$386 === 'undefined') {
                break;
            }
            consequent$385.push(statement$386);
        }
        return {
            type: Syntax$88.SwitchCase,
            test: test$384,
            consequent: consequent$385
        };
    }
    function parseSwitchStatement$387() {
        var discriminant$388, cases$389, oldInSwitch$390;
        expectKeyword$216('switch');
        expect$213('(');
        discriminant$388 = parseExpression$323();
        expect$213(')');
        expect$213('{');
        if (match$219('}')) {
            lex$188();
            return {
                type: Syntax$88.SwitchStatement,
                discriminant: discriminant$388
            };
        }
        cases$389 = [];
        oldInSwitch$390 = state$99.inSwitch;
        state$99.inSwitch = true;
        while (index$94 < length$97) {
            if (match$219('}')) {
                break;
            }
            cases$389.push(parseSwitchCase$383());
        }
        state$99.inSwitch = oldInSwitch$390;
        expect$213('}');
        return {
            type: Syntax$88.SwitchStatement,
            discriminant: discriminant$388,
            cases: cases$389
        };
    }
    function parseThrowStatement$391() {
        var argument$392;
        expectKeyword$216('throw');
        if (peekLineTerminator$194()) {
            throwError$199({}, Messages$90.NewlineAfterThrow);
        }
        argument$392 = parseExpression$323();
        consumeSemicolon$228();
        return {
            type: Syntax$88.ThrowStatement,
            argument: argument$392
        };
    }
    function parseCatchClause$393() {
        var param$394;
        expectKeyword$216('catch');
        expect$213('(');
        if (!match$219(')')) {
            param$394 = parseExpression$323();
            if (strict$93 && param$394.type === Syntax$88.Identifier && isRestrictedWord$132(param$394.name)) {
                throwErrorTolerant$207({}, Messages$90.StrictCatchVariable);
            }
        }
        expect$213(')');
        return {
            type: Syntax$88.CatchClause,
            param: param$394,
            guard: null,
            body: parseBlock$328()
        };
    }
    function parseTryStatement$395() {
        var block$396, handlers$397 = [], finalizer$398 = null;
        expectKeyword$216('try');
        block$396 = parseBlock$328();
        if (matchKeyword$222('catch')) {
            handlers$397.push(parseCatchClause$393());
        }
        if (matchKeyword$222('finally')) {
            lex$188();
            finalizer$398 = parseBlock$328();
        }
        if (handlers$397.length === 0 && !finalizer$398) {
            throwError$199({}, Messages$90.NoCatchOrFinally);
        }
        return {
            type: Syntax$88.TryStatement,
            block: block$396,
            handlers: handlers$397,
            finalizer: finalizer$398
        };
    }
    function parseDebuggerStatement$399() {
        expectKeyword$216('debugger');
        consumeSemicolon$228();
        return {type: Syntax$88.DebuggerStatement};
    }
    function parseStatement$400() {
        var token$401 = lookahead$190().token, expr$402, labeledBody$403;
        if (token$401.type === Token$86.EOF) {
            throwUnexpected$210(token$401);
        }
        if (token$401.type === Token$86.Punctuator) {
            switch (token$401.value) {
            case ';':
                return parseEmptyStatement$346();
            case '{':
                return parseBlock$328();
            case '(':
                return parseExpressionStatement$347();
            default:
                break;
            }
        }
        if (token$401.type === Token$86.Keyword) {
            switch (token$401.value) {
            case 'break':
                return parseBreakStatement$374();
            case 'continue':
                return parseContinueStatement$371();
            case 'debugger':
                return parseDebuggerStatement$399();
            case 'do':
                return parseDoWhileStatement$353();
            case 'for':
                return parseForStatement$363();
            case 'function':
                return parseFunctionDeclaration$414();
            case 'if':
                return parseIfStatement$349();
            case 'return':
                return parseReturnStatement$377();
            case 'switch':
                return parseSwitchStatement$387();
            case 'throw':
                return parseThrowStatement$391();
            case 'try':
                return parseTryStatement$395();
            case 'var':
                return parseVariableStatement$341();
            case 'while':
                return parseWhileStatement$357();
            case 'with':
                return parseWithStatement$380();
            default:
                break;
            }
        }
        expr$402 = parseExpression$323();
        if (expr$402.type === Syntax$88.Identifier && match$219(':')) {
            lex$188();
            if (Object.prototype.hasOwnProperty.call(state$99.labelSet, expr$402.name)) {
                throwError$199({}, Messages$90.Redeclaration, 'Label', expr$402.name);
            }
            state$99.labelSet[expr$402.name] = true;
            labeledBody$403 = parseStatement$400();
            delete state$99.labelSet[expr$402.name];
            return {
                type: Syntax$88.LabeledStatement,
                label: expr$402,
                body: labeledBody$403
            };
        }
        consumeSemicolon$228();
        return {
            type: Syntax$88.ExpressionStatement,
            expression: expr$402
        };
    }
    function parseFunctionSourceElements$404() {
        var sourceElement$405, sourceElements$406 = [], token$407, directive$408, firstRestricted$409, oldLabelSet$410, oldInIteration$411, oldInSwitch$412, oldInFunctionBody$413;
        expect$213('{');
        while (index$94 < length$97) {
            token$407 = lookahead$190().token;
            if (token$407.type !== Token$86.StringLiteral) {
                break;
            }
            sourceElement$405 = parseSourceElement$434();
            sourceElements$406.push(sourceElement$405);
            if (sourceElement$405.expression.type !== Syntax$88.Literal) {
                break;
            }
            directive$408 = sliceSource$108(token$407.range[0] + 1, token$407.range[1] - 1);
            if (directive$408 === 'use strict') {
                strict$93 = true;
                if (firstRestricted$409) {
                    throwError$199(firstRestricted$409, Messages$90.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$409 && token$407.octal) {
                    firstRestricted$409 = token$407;
                }
            }
        }
        oldLabelSet$410 = state$99.labelSet;
        oldInIteration$411 = state$99.inIteration;
        oldInSwitch$412 = state$99.inSwitch;
        oldInFunctionBody$413 = state$99.inFunctionBody;
        state$99.labelSet = {};
        state$99.inIteration = false;
        state$99.inSwitch = false;
        state$99.inFunctionBody = true;
        while (index$94 < length$97) {
            if (match$219('}')) {
                break;
            }
            sourceElement$405 = parseSourceElement$434();
            if (typeof sourceElement$405 === 'undefined') {
                break;
            }
            sourceElements$406.push(sourceElement$405);
        }
        expect$213('}');
        state$99.labelSet = oldLabelSet$410;
        state$99.inIteration = oldInIteration$411;
        state$99.inSwitch = oldInSwitch$412;
        state$99.inFunctionBody = oldInFunctionBody$413;
        return {
            type: Syntax$88.BlockStatement,
            body: sourceElements$406
        };
    }
    function parseFunctionDeclaration$414() {
        var id$415, param$416, params$417 = [], body$418, token$419, firstRestricted$420, message$421, previousStrict$422, paramSet$423;
        expectKeyword$216('function');
        token$419 = lookahead$190().token;
        id$415 = parseVariableIdentifier$330();
        if (strict$93) {
            if (isRestrictedWord$132(token$419.value)) {
                throwError$199(token$419, Messages$90.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$132(token$419.value)) {
                firstRestricted$420 = token$419;
                message$421 = Messages$90.StrictFunctionName;
            } else if (isStrictModeReservedWord$130(token$419.value)) {
                firstRestricted$420 = token$419;
                message$421 = Messages$90.StrictReservedWord;
            }
        }
        expect$213('(');
        if (!match$219(')')) {
            paramSet$423 = {};
            while (index$94 < length$97) {
                token$419 = lookahead$190().token;
                param$416 = parseVariableIdentifier$330();
                if (strict$93) {
                    if (isRestrictedWord$132(token$419.value)) {
                        throwError$199(token$419, Messages$90.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$423, token$419.value)) {
                        throwError$199(token$419, Messages$90.StrictParamDupe);
                    }
                } else if (!firstRestricted$420) {
                    if (isRestrictedWord$132(token$419.value)) {
                        firstRestricted$420 = token$419;
                        message$421 = Messages$90.StrictParamName;
                    } else if (isStrictModeReservedWord$130(token$419.value)) {
                        firstRestricted$420 = token$419;
                        message$421 = Messages$90.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$423, token$419.value)) {
                        firstRestricted$420 = token$419;
                        message$421 = Messages$90.StrictParamDupe;
                    }
                }
                params$417.push(param$416);
                paramSet$423[param$416.name] = true;
                if (match$219(')')) {
                    break;
                }
                expect$213(',');
            }
        }
        expect$213(')');
        previousStrict$422 = strict$93;
        body$418 = parseFunctionSourceElements$404();
        if (strict$93 && firstRestricted$420) {
            throwError$199(firstRestricted$420, message$421);
        }
        strict$93 = previousStrict$422;
        return {
            type: Syntax$88.FunctionDeclaration,
            id: id$415,
            params: params$417,
            body: body$418
        };
    }
    function parseFunctionExpression$424() {
        var token$425, id$426 = null, firstRestricted$427, message$428, param$429, params$430 = [], body$431, previousStrict$432, paramSet$433;
        expectKeyword$216('function');
        if (!match$219('(')) {
            token$425 = lookahead$190().token;
            id$426 = parseVariableIdentifier$330();
            if (strict$93) {
                if (isRestrictedWord$132(token$425.value)) {
                    throwError$199(token$425, Messages$90.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$132(token$425.value)) {
                    firstRestricted$427 = token$425;
                    message$428 = Messages$90.StrictFunctionName;
                } else if (isStrictModeReservedWord$130(token$425.value)) {
                    firstRestricted$427 = token$425;
                    message$428 = Messages$90.StrictReservedWord;
                }
            }
        }
        expect$213('(');
        if (!match$219(')')) {
            paramSet$433 = {};
            while (index$94 < length$97) {
                token$425 = lookahead$190().token;
                param$429 = parseVariableIdentifier$330();
                if (strict$93) {
                    if (isRestrictedWord$132(token$425.value)) {
                        throwError$199(token$425, Messages$90.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$433, token$425.value)) {
                        throwError$199(token$425, Messages$90.StrictParamDupe);
                    }
                } else if (!firstRestricted$427) {
                    if (isRestrictedWord$132(token$425.value)) {
                        firstRestricted$427 = token$425;
                        message$428 = Messages$90.StrictParamName;
                    } else if (isStrictModeReservedWord$130(token$425.value)) {
                        firstRestricted$427 = token$425;
                        message$428 = Messages$90.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$433, token$425.value)) {
                        firstRestricted$427 = token$425;
                        message$428 = Messages$90.StrictParamDupe;
                    }
                }
                params$430.push(param$429);
                paramSet$433[param$429.name] = true;
                if (match$219(')')) {
                    break;
                }
                expect$213(',');
            }
        }
        expect$213(')');
        previousStrict$432 = strict$93;
        body$431 = parseFunctionSourceElements$404();
        if (strict$93 && firstRestricted$427) {
            throwError$199(firstRestricted$427, message$428);
        }
        strict$93 = previousStrict$432;
        return {
            type: Syntax$88.FunctionExpression,
            id: id$426,
            params: params$430,
            body: body$431
        };
    }
    function parseSourceElement$434() {
        var token$435 = lookahead$190().token;
        if (token$435.type === Token$86.Keyword) {
            switch (token$435.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$343(token$435.value);
            case 'function':
                return parseFunctionDeclaration$414();
            default:
                return parseStatement$400();
            }
        }
        if (token$435.type !== Token$86.EOF) {
            return parseStatement$400();
        }
    }
    function parseSourceElements$436() {
        var sourceElement$437, sourceElements$438 = [], token$439, directive$440, firstRestricted$441;
        while (index$94 < length$97) {
            token$439 = lookahead$190();
            if (token$439.type !== Token$86.StringLiteral) {
                break;
            }
            sourceElement$437 = parseSourceElement$434();
            sourceElements$438.push(sourceElement$437);
            if (sourceElement$437.expression.type !== Syntax$88.Literal) {
                break;
            }
            directive$440 = sliceSource$108(token$439.range[0] + 1, token$439.range[1] - 1);
            if (directive$440 === 'use strict') {
                strict$93 = true;
                if (firstRestricted$441) {
                    throwError$199(firstRestricted$441, Messages$90.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$441 && token$439.octal) {
                    firstRestricted$441 = token$439;
                }
            }
        }
        while (index$94 < length$97) {
            sourceElement$437 = parseSourceElement$434();
            if (typeof sourceElement$437 === 'undefined') {
                break;
            }
            sourceElements$438.push(sourceElement$437);
        }
        return sourceElements$438;
    }
    function parseProgram$442() {
        var program$443;
        strict$93 = false;
        program$443 = {
            type: Syntax$88.Program,
            body: parseSourceElements$436()
        };
        return program$443;
    }
    function addComment$444(start$445, end$446, type$447, value$448) {
        assert$102(typeof start$445 === 'number', 'Comment must have valid position');
        if (extra$101.comments.length > 0) {
            if (extra$101.comments[extra$101.comments.length - 1].range[1] > start$445) {
                return;
            }
        }
        extra$101.comments.push({
            range: [
                start$445,
                end$446
            ],
            type: type$447,
            value: value$448
        });
    }
    function scanComment$449() {
        var comment$450, ch$451, start$452, blockComment$453, lineComment$454;
        comment$450 = '';
        blockComment$453 = false;
        lineComment$454 = false;
        while (index$94 < length$97) {
            ch$451 = source$92[index$94];
            if (lineComment$454) {
                ch$451 = nextChar$137();
                if (index$94 >= length$97) {
                    lineComment$454 = false;
                    comment$450 += ch$451;
                    addComment$444(start$452, index$94, 'Line', comment$450);
                } else if (isLineTerminator$122(ch$451)) {
                    lineComment$454 = false;
                    addComment$444(start$452, index$94, 'Line', comment$450);
                    if (ch$451 === '\r' && source$92[index$94] === '\n') {
                        ++index$94;
                    }
                    ++lineNumber$95;
                    lineStart$96 = index$94;
                    comment$450 = '';
                } else {
                    comment$450 += ch$451;
                }
            } else if (blockComment$453) {
                if (isLineTerminator$122(ch$451)) {
                    if (ch$451 === '\r' && source$92[index$94 + 1] === '\n') {
                        ++index$94;
                        comment$450 += '\r\n';
                    } else {
                        comment$450 += ch$451;
                    }
                    ++lineNumber$95;
                    ++index$94;
                    lineStart$96 = index$94;
                    if (index$94 >= length$97) {
                        throwError$199({}, Messages$90.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$451 = nextChar$137();
                    if (index$94 >= length$97) {
                        throwError$199({}, Messages$90.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$450 += ch$451;
                    if (ch$451 === '*') {
                        ch$451 = source$92[index$94];
                        if (ch$451 === '/') {
                            comment$450 = comment$450.substr(0, comment$450.length - 1);
                            blockComment$453 = false;
                            ++index$94;
                            addComment$444(start$452, index$94, 'Block', comment$450);
                            comment$450 = '';
                        }
                    }
                }
            } else if (ch$451 === '/') {
                ch$451 = source$92[index$94 + 1];
                if (ch$451 === '/') {
                    start$452 = index$94;
                    index$94 += 2;
                    lineComment$454 = true;
                } else if (ch$451 === '*') {
                    start$452 = index$94;
                    index$94 += 2;
                    blockComment$453 = true;
                    if (index$94 >= length$97) {
                        throwError$199({}, Messages$90.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$120(ch$451)) {
                ++index$94;
            } else if (isLineTerminator$122(ch$451)) {
                ++index$94;
                if (ch$451 === '\r' && source$92[index$94] === '\n') {
                    ++index$94;
                }
                ++lineNumber$95;
                lineStart$96 = index$94;
            } else {
                break;
            }
        }
    }
    function collectToken$455() {
        var token$456 = extra$101.advance(), range$457, value$458;
        if (token$456.type !== Token$86.EOF) {
            range$457 = [
                token$456.range[0],
                token$456.range[1]
            ];
            value$458 = sliceSource$108(token$456.range[0], token$456.range[1]);
            extra$101.tokens.push({
                type: TokenName$87[token$456.type],
                value: value$458,
                lineNumber: lineNumber$95,
                lineStart: lineStart$96,
                range: range$457
            });
        }
        return token$456;
    }
    function collectRegex$459() {
        var pos$460, regex$461, token$462;
        skipComment$139();
        pos$460 = index$94;
        regex$461 = extra$101.scanRegExp();
        if (extra$101.tokens.length > 0) {
            token$462 = extra$101.tokens[extra$101.tokens.length - 1];
            if (token$462.range[0] === pos$460 && token$462.type === 'Punctuator') {
                if (token$462.value === '/' || token$462.value === '/=') {
                    extra$101.tokens.pop();
                }
            }
        }
        extra$101.tokens.push({
            type: 'RegularExpression',
            value: regex$461.literal,
            range: [
                pos$460,
                index$94
            ],
            lineStart: token$462.lineStart,
            lineNumber: token$462.lineNumber
        });
        return regex$461;
    }
    function createLiteral$463(token$464) {
        if (Array.isArray(token$464)) {
            return {
                type: Syntax$88.Literal,
                value: token$464
            };
        }
        return {
            type: Syntax$88.Literal,
            value: token$464.value,
            lineStart: token$464.lineStart,
            lineNumber: token$464.lineNumber
        };
    }
    function createRawLiteral$465(token$466) {
        return {
            type: Syntax$88.Literal,
            value: token$466.value,
            raw: sliceSource$108(token$466.range[0], token$466.range[1]),
            lineStart: token$466.lineStart,
            lineNumber: token$466.lineNumber
        };
    }
    function wrapTrackingFunction$467(range$468, loc$469) {
        return function (parseFunction$470) {
            function isBinary$471(node$472) {
                return node$472.type === Syntax$88.LogicalExpression || node$472.type === Syntax$88.BinaryExpression;
            }
            function visit$473(node$474) {
                if (isBinary$471(node$474.left)) {
                    visit$473(node$474.left);
                }
                if (isBinary$471(node$474.right)) {
                    visit$473(node$474.right);
                }
                if (range$468 && typeof node$474.range === 'undefined') {
                    node$474.range = [
                        node$474.left.range[0],
                        node$474.right.range[1]
                    ];
                }
                if (loc$469 && typeof node$474.loc === 'undefined') {
                    node$474.loc = {
                        start: node$474.left.loc.start,
                        end: node$474.right.loc.end
                    };
                }
            }
            return function () {
                var node$475, rangeInfo$476, locInfo$477;
                var curr$478 = tokenStream$100[index$94].token;
                rangeInfo$476 = [
                    curr$478.range[0],
                    0
                ];
                locInfo$477 = {start: {
                        line: curr$478.lineNumber,
                        column: curr$478.lineStart
                    }};
                node$475 = parseFunction$470.apply(null, arguments);
                if (typeof node$475 !== 'undefined') {
                    var last$479 = tokenStream$100[index$94].token;
                    if (range$468) {
                        rangeInfo$476[1] = last$479.range[1];
                        node$475.range = rangeInfo$476;
                    }
                    if (loc$469) {
                        locInfo$477.end = {
                            line: last$479.lineNumber,
                            column: last$479.lineStart
                        };
                        node$475.loc = locInfo$477;
                    }
                    if (isBinary$471(node$475)) {
                        visit$473(node$475);
                    }
                    if (node$475.type === Syntax$88.MemberExpression) {
                        if (typeof node$475.object.range !== 'undefined') {
                            node$475.range[0] = node$475.object.range[0];
                        }
                        if (typeof node$475.object.loc !== 'undefined') {
                            node$475.loc.start = node$475.object.loc.start;
                        }
                    }
                    if (node$475.type === Syntax$88.CallExpression) {
                        if (typeof node$475.callee.range !== 'undefined') {
                            node$475.range[0] = node$475.callee.range[0];
                        }
                        if (typeof node$475.callee.loc !== 'undefined') {
                            node$475.loc.start = node$475.callee.loc.start;
                        }
                    }
                    return node$475;
                }
            };
        };
    }
    function patch$480() {
        var wrapTracking$481;
        if (extra$101.comments) {
            extra$101.skipComment = skipComment$139;
            skipComment$139 = scanComment$449;
        }
        if (extra$101.raw) {
            extra$101.createLiteral = createLiteral$463;
            createLiteral$463 = createRawLiteral$465;
        }
        if (extra$101.range || extra$101.loc) {
            wrapTracking$481 = wrapTrackingFunction$467(extra$101.range, extra$101.loc);
            extra$101.parseAdditiveExpression = parseAdditiveExpression$298;
            extra$101.parseAssignmentExpression = parseAssignmentExpression$321;
            extra$101.parseBitwiseANDExpression = parseBitwiseANDExpression$307;
            extra$101.parseBitwiseORExpression = parseBitwiseORExpression$311;
            extra$101.parseBitwiseXORExpression = parseBitwiseXORExpression$309;
            extra$101.parseBlock = parseBlock$328;
            extra$101.parseFunctionSourceElements = parseFunctionSourceElements$404;
            extra$101.parseCallMember = parseCallMember$271;
            extra$101.parseCatchClause = parseCatchClause$393;
            extra$101.parseComputedMember = parseComputedMember$267;
            extra$101.parseConditionalExpression = parseConditionalExpression$317;
            extra$101.parseConstLetDeclaration = parseConstLetDeclaration$343;
            extra$101.parseEqualityExpression = parseEqualityExpression$305;
            extra$101.parseExpression = parseExpression$323;
            extra$101.parseForVariableDeclaration = parseForVariableDeclaration$361;
            extra$101.parseFunctionDeclaration = parseFunctionDeclaration$414;
            extra$101.parseFunctionExpression = parseFunctionExpression$424;
            extra$101.parseLogicalANDExpression = parseLogicalANDExpression$313;
            extra$101.parseLogicalORExpression = parseLogicalORExpression$315;
            extra$101.parseMultiplicativeExpression = parseMultiplicativeExpression$296;
            extra$101.parseNewExpression = parseNewExpression$273;
            extra$101.parseNonComputedMember = parseNonComputedMember$265;
            extra$101.parseNonComputedProperty = parseNonComputedProperty$263;
            extra$101.parseObjectProperty = parseObjectProperty$243;
            extra$101.parseObjectPropertyKey = parseObjectPropertyKey$241;
            extra$101.parsePostfixExpression = parsePostfixExpression$291;
            extra$101.parsePrimaryExpression = parsePrimaryExpression$256;
            extra$101.parseProgram = parseProgram$442;
            extra$101.parsePropertyFunction = parsePropertyFunction$236;
            extra$101.parseRelationalExpression = parseRelationalExpression$302;
            extra$101.parseStatement = parseStatement$400;
            extra$101.parseShiftExpression = parseShiftExpression$300;
            extra$101.parseSwitchCase = parseSwitchCase$383;
            extra$101.parseUnaryExpression = parseUnaryExpression$293;
            extra$101.parseVariableDeclaration = parseVariableDeclaration$334;
            extra$101.parseVariableIdentifier = parseVariableIdentifier$330;
            parseAdditiveExpression$298 = wrapTracking$481(extra$101.parseAdditiveExpression);
            parseAssignmentExpression$321 = wrapTracking$481(extra$101.parseAssignmentExpression);
            parseBitwiseANDExpression$307 = wrapTracking$481(extra$101.parseBitwiseANDExpression);
            parseBitwiseORExpression$311 = wrapTracking$481(extra$101.parseBitwiseORExpression);
            parseBitwiseXORExpression$309 = wrapTracking$481(extra$101.parseBitwiseXORExpression);
            parseBlock$328 = wrapTracking$481(extra$101.parseBlock);
            parseFunctionSourceElements$404 = wrapTracking$481(extra$101.parseFunctionSourceElements);
            parseCallMember$271 = wrapTracking$481(extra$101.parseCallMember);
            parseCatchClause$393 = wrapTracking$481(extra$101.parseCatchClause);
            parseComputedMember$267 = wrapTracking$481(extra$101.parseComputedMember);
            parseConditionalExpression$317 = wrapTracking$481(extra$101.parseConditionalExpression);
            parseConstLetDeclaration$343 = wrapTracking$481(extra$101.parseConstLetDeclaration);
            parseEqualityExpression$305 = wrapTracking$481(extra$101.parseEqualityExpression);
            parseExpression$323 = wrapTracking$481(extra$101.parseExpression);
            parseForVariableDeclaration$361 = wrapTracking$481(extra$101.parseForVariableDeclaration);
            parseFunctionDeclaration$414 = wrapTracking$481(extra$101.parseFunctionDeclaration);
            parseFunctionExpression$424 = wrapTracking$481(extra$101.parseFunctionExpression);
            parseLogicalANDExpression$313 = wrapTracking$481(extra$101.parseLogicalANDExpression);
            parseLogicalORExpression$315 = wrapTracking$481(extra$101.parseLogicalORExpression);
            parseMultiplicativeExpression$296 = wrapTracking$481(extra$101.parseMultiplicativeExpression);
            parseNewExpression$273 = wrapTracking$481(extra$101.parseNewExpression);
            parseNonComputedMember$265 = wrapTracking$481(extra$101.parseNonComputedMember);
            parseNonComputedProperty$263 = wrapTracking$481(extra$101.parseNonComputedProperty);
            parseObjectProperty$243 = wrapTracking$481(extra$101.parseObjectProperty);
            parseObjectPropertyKey$241 = wrapTracking$481(extra$101.parseObjectPropertyKey);
            parsePostfixExpression$291 = wrapTracking$481(extra$101.parsePostfixExpression);
            parsePrimaryExpression$256 = wrapTracking$481(extra$101.parsePrimaryExpression);
            parseProgram$442 = wrapTracking$481(extra$101.parseProgram);
            parsePropertyFunction$236 = wrapTracking$481(extra$101.parsePropertyFunction);
            parseRelationalExpression$302 = wrapTracking$481(extra$101.parseRelationalExpression);
            parseStatement$400 = wrapTracking$481(extra$101.parseStatement);
            parseShiftExpression$300 = wrapTracking$481(extra$101.parseShiftExpression);
            parseSwitchCase$383 = wrapTracking$481(extra$101.parseSwitchCase);
            parseUnaryExpression$293 = wrapTracking$481(extra$101.parseUnaryExpression);
            parseVariableDeclaration$334 = wrapTracking$481(extra$101.parseVariableDeclaration);
            parseVariableIdentifier$330 = wrapTracking$481(extra$101.parseVariableIdentifier);
        }
        if (typeof extra$101.tokens !== 'undefined') {
            extra$101.advance = advance$185;
            extra$101.scanRegExp = scanRegExp$173;
            advance$185 = collectToken$455;
            scanRegExp$173 = collectRegex$459;
        }
    }
    function unpatch$482() {
        if (typeof extra$101.skipComment === 'function') {
            skipComment$139 = extra$101.skipComment;
        }
        if (extra$101.raw) {
            createLiteral$463 = extra$101.createLiteral;
        }
        if (extra$101.range || extra$101.loc) {
            parseAdditiveExpression$298 = extra$101.parseAdditiveExpression;
            parseAssignmentExpression$321 = extra$101.parseAssignmentExpression;
            parseBitwiseANDExpression$307 = extra$101.parseBitwiseANDExpression;
            parseBitwiseORExpression$311 = extra$101.parseBitwiseORExpression;
            parseBitwiseXORExpression$309 = extra$101.parseBitwiseXORExpression;
            parseBlock$328 = extra$101.parseBlock;
            parseFunctionSourceElements$404 = extra$101.parseFunctionSourceElements;
            parseCallMember$271 = extra$101.parseCallMember;
            parseCatchClause$393 = extra$101.parseCatchClause;
            parseComputedMember$267 = extra$101.parseComputedMember;
            parseConditionalExpression$317 = extra$101.parseConditionalExpression;
            parseConstLetDeclaration$343 = extra$101.parseConstLetDeclaration;
            parseEqualityExpression$305 = extra$101.parseEqualityExpression;
            parseExpression$323 = extra$101.parseExpression;
            parseForVariableDeclaration$361 = extra$101.parseForVariableDeclaration;
            parseFunctionDeclaration$414 = extra$101.parseFunctionDeclaration;
            parseFunctionExpression$424 = extra$101.parseFunctionExpression;
            parseLogicalANDExpression$313 = extra$101.parseLogicalANDExpression;
            parseLogicalORExpression$315 = extra$101.parseLogicalORExpression;
            parseMultiplicativeExpression$296 = extra$101.parseMultiplicativeExpression;
            parseNewExpression$273 = extra$101.parseNewExpression;
            parseNonComputedMember$265 = extra$101.parseNonComputedMember;
            parseNonComputedProperty$263 = extra$101.parseNonComputedProperty;
            parseObjectProperty$243 = extra$101.parseObjectProperty;
            parseObjectPropertyKey$241 = extra$101.parseObjectPropertyKey;
            parsePrimaryExpression$256 = extra$101.parsePrimaryExpression;
            parsePostfixExpression$291 = extra$101.parsePostfixExpression;
            parseProgram$442 = extra$101.parseProgram;
            parsePropertyFunction$236 = extra$101.parsePropertyFunction;
            parseRelationalExpression$302 = extra$101.parseRelationalExpression;
            parseStatement$400 = extra$101.parseStatement;
            parseShiftExpression$300 = extra$101.parseShiftExpression;
            parseSwitchCase$383 = extra$101.parseSwitchCase;
            parseUnaryExpression$293 = extra$101.parseUnaryExpression;
            parseVariableDeclaration$334 = extra$101.parseVariableDeclaration;
            parseVariableIdentifier$330 = extra$101.parseVariableIdentifier;
        }
        if (typeof extra$101.scanRegExp === 'function') {
            advance$185 = extra$101.advance;
            scanRegExp$173 = extra$101.scanRegExp;
        }
    }
    function stringToArray$483(str$484) {
        var length$485 = str$484.length, result$486 = [], i$487;
        for (i$487 = 0; i$487 < length$485; ++i$487) {
            result$486[i$487] = str$484.charAt(i$487);
        }
        return result$486;
    }
    function blockAllowed$488(toks$489, start$490, inExprDelim$491, parentIsBlock$492) {
        var assignOps$493 = [
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
        var binaryOps$494 = [
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
        var unaryOps$495 = [
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
        function back$496(n$497) {
            var idx$498 = toks$489.length - n$497 > 0 ? toks$489.length - n$497 : 0;
            return toks$489[idx$498];
        }
        if (inExprDelim$491 && toks$489.length - (start$490 + 2) <= 0) {
            return false;
        } else if (back$496(start$490 + 2).value === ':' && parentIsBlock$492) {
            return true;
        } else if (isIn$105(back$496(start$490 + 2).value, unaryOps$495.concat(binaryOps$494).concat(assignOps$493))) {
            return false;
        } else if (back$496(start$490 + 2).value === 'return') {
            var currLineNumber$499 = typeof back$496(start$490 + 1).startLineNumber !== 'undefined' ? back$496(start$490 + 1).startLineNumber : back$496(start$490 + 1).lineNumber;
            if (back$496(start$490 + 2).lineNumber !== currLineNumber$499) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$105(back$496(start$490 + 2).value, [
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
    function readToken$500(toks$501, inExprDelim$502, parentIsBlock$503) {
        var delimiters$504 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$505 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$506 = toks$501.length - 1;
        function back$507(n$508) {
            var idx$509 = toks$501.length - n$508 > 0 ? toks$501.length - n$508 : 0;
            return toks$501[idx$509];
        }
        skipComment$139();
        if (isIn$105(getChar$138(), delimiters$504)) {
            return readDelim$511(toks$501, inExprDelim$502, parentIsBlock$503);
        }
        if (getChar$138() === '/') {
            var prev$510 = back$507(1);
            if (prev$510) {
                if (prev$510.value === '()') {
                    if (isIn$105(back$507(2).value, parenIdents$505)) {
                        return scanRegExp$173();
                    }
                    return advance$185();
                }
                if (prev$510.value === '{}') {
                    if (blockAllowed$488(toks$501, 0, inExprDelim$502, parentIsBlock$503)) {
                        if (back$507(2).value === '()') {
                            if (back$507(4).value === 'function') {
                                if (!blockAllowed$488(toks$501, 3, inExprDelim$502, parentIsBlock$503)) {
                                    return advance$185();
                                }
                                if (toks$501.length - 5 <= 0 && inExprDelim$502) {
                                    return advance$185();
                                }
                            }
                            if (back$507(3).value === 'function') {
                                if (!blockAllowed$488(toks$501, 2, inExprDelim$502, parentIsBlock$503)) {
                                    return advance$185();
                                }
                                if (toks$501.length - 4 <= 0 && inExprDelim$502) {
                                    return advance$185();
                                }
                            }
                        }
                        return scanRegExp$173();
                    } else {
                        return advance$185();
                    }
                }
                if (prev$510.type === Token$86.Punctuator) {
                    return scanRegExp$173();
                }
                if (isKeyword$134(prev$510.value)) {
                    return scanRegExp$173();
                }
                return advance$185();
            }
            return scanRegExp$173();
        }
        return advance$185();
    }
    function readDelim$511(toks$512, inExprDelim$513, parentIsBlock$514) {
        var startDelim$515 = advance$185(), matchDelim$516 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$517 = [];
        var delimiters$518 = [
                '(',
                '{',
                '['
            ];
        assert$102(delimiters$518.indexOf(startDelim$515.value) !== -1, 'Need to begin at the delimiter');
        var token$519 = startDelim$515;
        var startLineNumber$520 = token$519.lineNumber;
        var startLineStart$521 = token$519.lineStart;
        var startRange$522 = token$519.range;
        var delimToken$523 = {};
        delimToken$523.type = Token$86.Delimiter;
        delimToken$523.value = startDelim$515.value + matchDelim$516[startDelim$515.value];
        delimToken$523.startLineNumber = startLineNumber$520;
        delimToken$523.startLineStart = startLineStart$521;
        delimToken$523.startRange = startRange$522;
        var delimIsBlock$524 = false;
        if (startDelim$515.value === '{') {
            delimIsBlock$524 = blockAllowed$488(toks$512.concat(delimToken$523), 0, inExprDelim$513, parentIsBlock$514);
        }
        while (index$94 <= length$97) {
            token$519 = readToken$500(inner$517, startDelim$515.value === '(' || startDelim$515.value === '[', delimIsBlock$524);
            if (token$519.type === Token$86.Punctuator && token$519.value === matchDelim$516[startDelim$515.value]) {
                break;
            } else if (token$519.type === Token$86.EOF) {
                throwError$199({}, Messages$90.UnexpectedEOS);
            } else {
                inner$517.push(token$519);
            }
        }
        if (index$94 >= length$97 && matchDelim$516[startDelim$515.value] !== source$92[length$97 - 1]) {
            throwError$199({}, Messages$90.UnexpectedEOS);
        }
        var endLineNumber$525 = token$519.lineNumber;
        var endLineStart$526 = token$519.lineStart;
        var endRange$527 = token$519.range;
        delimToken$523.inner = inner$517;
        delimToken$523.endLineNumber = endLineNumber$525;
        delimToken$523.endLineStart = endLineStart$526;
        delimToken$523.endRange = endRange$527;
        return delimToken$523;
    }
    ;
    function read$528(code$529) {
        var token$530, tokenTree$531 = [];
        source$92 = code$529;
        index$94 = 0;
        lineNumber$95 = source$92.length > 0 ? 1 : 0;
        lineStart$96 = 0;
        length$97 = source$92.length;
        buffer$98 = null;
        state$99 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$94 < length$97) {
            tokenTree$531.push(readToken$500(tokenTree$531, false, false));
        }
        var last$532 = tokenTree$531[tokenTree$531.length - 1];
        if (last$532 && last$532.type !== Token$86.EOF) {
            tokenTree$531.push({
                type: Token$86.EOF,
                value: '',
                lineNumber: last$532.lineNumber,
                lineStart: last$532.lineStart,
                range: [
                    index$94,
                    index$94
                ]
            });
        }
        return expander$85.tokensToSyntax(tokenTree$531);
    }
    function parse$533(code$534, nodeType$535, options$536) {
        var program$537, toString$538;
        tokenStream$100 = code$534;
        nodeType$535 = nodeType$535 || 'base';
        index$94 = 0;
        length$97 = tokenStream$100.length;
        buffer$98 = null;
        state$99 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$101 = {};
        if (typeof options$536 !== 'undefined') {
            if (options$536.range || options$536.loc) {
                assert$102(false, 'Note range and loc is not currently implemented');
            }
            extra$101.range = typeof options$536.range === 'boolean' && options$536.range;
            extra$101.loc = typeof options$536.loc === 'boolean' && options$536.loc;
            extra$101.raw = typeof options$536.raw === 'boolean' && options$536.raw;
            if (typeof options$536.tokens === 'boolean' && options$536.tokens) {
                extra$101.tokens = [];
            }
            if (typeof options$536.comment === 'boolean' && options$536.comment) {
                extra$101.comments = [];
            }
            if (typeof options$536.tolerant === 'boolean' && options$536.tolerant) {
                extra$101.errors = [];
            }
            if (typeof options$536.noresolve === 'boolean' && options$536.noresolve) {
                extra$101.noresolve = options$536.noresolve;
            } else {
                extra$101.noresolve = false;
            }
        }
        patch$480();
        try {
            var classToParse$539 = {
                    'base': parseProgram$442,
                    'Program': parseProgram$442,
                    'expr': parseAssignmentExpression$321,
                    'ident': parsePrimaryExpression$256,
                    'lit': parsePrimaryExpression$256,
                    'LogicalANDExpression': parseLogicalANDExpression$313,
                    'PrimaryExpression': parsePrimaryExpression$256,
                    'VariableDeclarationList': parseVariableDeclarationList$338,
                    'StatementList': parseStatementList$325,
                    'SourceElements': function () {
                        state$99.inFunctionBody = true;
                        return parseSourceElements$436();
                    },
                    'FunctionDeclaration': parseFunctionDeclaration$414,
                    'FunctionExpression': parseFunctionExpression$424,
                    'ExpressionStatement': parseExpressionStatement$347,
                    'IfStatement': parseIfStatement$349,
                    'BreakStatement': parseBreakStatement$374,
                    'ContinueStatement': parseContinueStatement$371,
                    'WithStatement': parseWithStatement$380,
                    'SwitchStatement': parseSwitchStatement$387,
                    'ReturnStatement': parseReturnStatement$377,
                    'ThrowStatement': parseThrowStatement$391,
                    'TryStatement': parseTryStatement$395,
                    'WhileStatement': parseWhileStatement$357,
                    'ForStatement': parseForStatement$363,
                    'VariableDeclaration': parseVariableDeclaration$334,
                    'ArrayExpression': parseArrayInitialiser$233,
                    'ObjectExpression': parseObjectInitialiser$248,
                    'SequenceExpression': parseExpression$323,
                    'AssignmentExpression': parseAssignmentExpression$321,
                    'ConditionalExpression': parseConditionalExpression$317,
                    'NewExpression': parseNewExpression$273,
                    'CallExpression': parseLeftHandSideExpressionAllowCall$285,
                    'Block': parseBlock$328
                };
            if (classToParse$539[nodeType$535]) {
                program$537 = classToParse$539[nodeType$535]();
            } else {
                assert$102(false, 'unmatched parse class' + nodeType$535);
            }
            if (typeof extra$101.comments !== 'undefined') {
                program$537.comments = extra$101.comments;
            }
            if (typeof extra$101.tokens !== 'undefined') {
                program$537.tokens = tokenStream$100.slice(0, index$94);
            }
            if (typeof extra$101.errors !== 'undefined') {
                program$537.errors = extra$101.errors;
            }
        } catch (e$540) {
            throw e$540;
        } finally {
            unpatch$482();
            extra$101 = {};
        }
        return program$537;
    }
    exports$84.parse = parse$533;
    exports$84.read = read$528;
    exports$84.Token = Token$86;
    exports$84.assert = assert$102;
    exports$84.Syntax = function () {
        var name$541, types$542 = {};
        if (typeof Object.create === 'function') {
            types$542 = Object.create(null);
        }
        for (name$541 in Syntax$88) {
            if (Syntax$88.hasOwnProperty(name$541)) {
                types$542[name$541] = Syntax$88[name$541];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$542);
        }
        return types$542;
    }();
}));