(function (root$1, factory$2) {
    if (typeof exports === 'object') {
        factory$2(exports, require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$2);
    } else {
        factory$2(root$1.parser = {}, root$1.expander);
    }
}(this, function (exports$4, expander$5) {
    'use strict';
    var Token$438, TokenName$439, Syntax$440, PropertyKind$441, Messages$442, Regex$443, source$444, strict$445, index$446, lineNumber$447, lineStart$448, length$449, buffer$450, state$451, tokenStream$452, extra$453;
    Token$438 = {
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
    TokenName$439 = {};
    TokenName$439[Token$438.BooleanLiteral] = 'Boolean';
    TokenName$439[Token$438.EOF] = '<end>';
    TokenName$439[Token$438.Identifier] = 'Identifier';
    TokenName$439[Token$438.Keyword] = 'Keyword';
    TokenName$439[Token$438.NullLiteral] = 'Null';
    TokenName$439[Token$438.NumericLiteral] = 'Numeric';
    TokenName$439[Token$438.Punctuator] = 'Punctuator';
    TokenName$439[Token$438.StringLiteral] = 'String';
    TokenName$439[Token$438.Delimiter] = 'Delimiter';
    Syntax$440 = {
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
    PropertyKind$441 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    Messages$442 = {
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
    Regex$443 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    function assert(condition$7, message$8) {
        if (!condition$7) {
            throw new Error('ASSERT: ' + message$8);
        }
    }
    function isIn(el$10, list$11) {
        return list$11.indexOf(el$10) !== -1;
    }
    function sliceSource(from$13, to$14) {
        return source$444.slice(from$13, to$14);
    }
    if (typeof 'esprima'[0] === 'undefined') {
        sliceSource = function sliceArraySource(from$16, to$17) {
            return source$444.slice(from$16, to$17).join('');
        };
    }
    function isDecimalDigit(ch$19) {
        return '0123456789'.indexOf(ch$19) >= 0;
    }
    function isHexDigit(ch$21) {
        return '0123456789abcdefABCDEF'.indexOf(ch$21) >= 0;
    }
    function isOctalDigit(ch$23) {
        return '01234567'.indexOf(ch$23) >= 0;
    }
    function isWhiteSpace(ch$25) {
        return ch$25 === ' ' || ch$25 === '\t' || ch$25 === '\v' || ch$25 === '\f' || ch$25 === '\xa0' || ch$25.charCodeAt(0) >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(ch$25) >= 0;
    }
    function isLineTerminator(ch$27) {
        return ch$27 === '\n' || ch$27 === '\r' || ch$27 === '\u2028' || ch$27 === '\u2029';
    }
    function isIdentifierStart(ch$29) {
        return ch$29 === '$' || ch$29 === '_' || ch$29 === '\\' || ch$29 >= 'a' && ch$29 <= 'z' || ch$29 >= 'A' && ch$29 <= 'Z' || ch$29.charCodeAt(0) >= 128 && Regex$443.NonAsciiIdentifierStart.test(ch$29);
    }
    function isIdentifierPart(ch$31) {
        return ch$31 === '$' || ch$31 === '_' || ch$31 === '\\' || ch$31 >= 'a' && ch$31 <= 'z' || ch$31 >= 'A' && ch$31 <= 'Z' || ch$31 >= '0' && ch$31 <= '9' || ch$31.charCodeAt(0) >= 128 && Regex$443.NonAsciiIdentifierPart.test(ch$31);
    }
    function isFutureReservedWord(id$33) {
        return false;
    }
    function isStrictModeReservedWord(id$35) {
        switch (id$35) {
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
    function isKeyword(id$39) {
        var keyword$41 = false;
        switch (id$39.length) {
        case 2:
            keyword$41 = id$39 === 'if' || id$39 === 'in' || id$39 === 'do';
            break;
        case 3:
            keyword$41 = id$39 === 'var' || id$39 === 'for' || id$39 === 'new' || id$39 === 'try';
            break;
        case 4:
            keyword$41 = id$39 === 'this' || id$39 === 'else' || id$39 === 'case' || id$39 === 'void' || id$39 === 'with';
            break;
        case 5:
            keyword$41 = id$39 === 'while' || id$39 === 'break' || id$39 === 'catch' || id$39 === 'throw';
            break;
        case 6:
            keyword$41 = id$39 === 'return' || id$39 === 'typeof' || id$39 === 'delete' || id$39 === 'switch';
            break;
        case 7:
            keyword$41 = id$39 === 'default' || id$39 === 'finally';
            break;
        case 8:
            keyword$41 = id$39 === 'function' || id$39 === 'continue' || id$39 === 'debugger';
            break;
        case 10:
            keyword$41 = id$39 === 'instanceof';
            break;
        }
        if (keyword$41) {
            return true;
        }
        switch (id$39) {
        case 'const':
            return true;
        case 'yield':
        case 'let':
            return true;
        }
        if (strict$445 && isStrictModeReservedWord(id$39)) {
            return true;
        }
        return isFutureReservedWord(id$39);
    }
    function nextChar() {
        return source$444[index$446++];
    }
    function getChar() {
        return source$444[index$446];
    }
    function skipComment() {
        var ch$45, blockComment$46, lineComment$47;
        blockComment$46 = false;
        lineComment$47 = false;
        while (index$446 < length$449) {
            ch$45 = source$444[index$446];
            if (lineComment$47) {
                ch$45 = nextChar();
                if (isLineTerminator(ch$45)) {
                    lineComment$47 = false;
                    if (ch$45 === '\r' && source$444[index$446] === '\n') {
                        ++index$446;
                    }
                    ++lineNumber$447;
                    lineStart$448 = index$446;
                }
            } else if (blockComment$46) {
                if (isLineTerminator(ch$45)) {
                    if (ch$45 === '\r' && source$444[index$446 + 1] === '\n') {
                        ++index$446;
                    }
                    ++lineNumber$447;
                    ++index$446;
                    lineStart$448 = index$446;
                    if (index$446 >= length$449) {
                        throwError({}, Messages$442.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$45 = nextChar();
                    if (index$446 >= length$449) {
                        throwError({}, Messages$442.UnexpectedToken, 'ILLEGAL');
                    }
                    if (ch$45 === '*') {
                        ch$45 = source$444[index$446];
                        if (ch$45 === '/') {
                            ++index$446;
                            blockComment$46 = false;
                        }
                    }
                }
            } else if (ch$45 === '/') {
                ch$45 = source$444[index$446 + 1];
                if (ch$45 === '/') {
                    index$446 += 2;
                    lineComment$47 = true;
                } else if (ch$45 === '*') {
                    index$446 += 2;
                    blockComment$46 = true;
                    if (index$446 >= length$449) {
                        throwError({}, Messages$442.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace(ch$45)) {
                ++index$446;
            } else if (isLineTerminator(ch$45)) {
                ++index$446;
                if (ch$45 === '\r' && source$444[index$446] === '\n') {
                    ++index$446;
                }
                ++lineNumber$447;
                lineStart$448 = index$446;
            } else {
                break;
            }
        }
    }
    function scanHexEscape(prefix$48) {
        var i$50, len$51, ch$52, code$53 = 0;
        len$51 = prefix$48 === 'u' ? 4 : 2;
        for (i$50 = 0; i$50 < len$51; ++i$50) {
            if (index$446 < length$449 && isHexDigit(source$444[index$446])) {
                ch$52 = nextChar();
                code$53 = code$53 * 16 + '0123456789abcdef'.indexOf(ch$52.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$53);
    }
    function scanIdentifier() {
        var ch$55, start$56, id$57, restore$58;
        ch$55 = source$444[index$446];
        if (!isIdentifierStart(ch$55)) {
            return;
        }
        start$56 = index$446;
        if (ch$55 === '\\') {
            ++index$446;
            if (source$444[index$446] !== 'u') {
                return;
            }
            ++index$446;
            restore$58 = index$446;
            ch$55 = scanHexEscape('u');
            if (ch$55) {
                if (ch$55 === '\\' || !isIdentifierStart(ch$55)) {
                    return;
                }
                id$57 = ch$55;
            } else {
                index$446 = restore$58;
                id$57 = 'u';
            }
        } else {
            id$57 = nextChar();
        }
        while (index$446 < length$449) {
            ch$55 = source$444[index$446];
            if (!isIdentifierPart(ch$55)) {
                break;
            }
            if (ch$55 === '\\') {
                ++index$446;
                if (source$444[index$446] !== 'u') {
                    return;
                }
                ++index$446;
                restore$58 = index$446;
                ch$55 = scanHexEscape('u');
                if (ch$55) {
                    if (ch$55 === '\\' || !isIdentifierPart(ch$55)) {
                        return;
                    }
                    id$57 += ch$55;
                } else {
                    index$446 = restore$58;
                    id$57 += 'u';
                }
            } else {
                id$57 += nextChar();
            }
        }
        if (id$57.length === 1) {
            return {
                type: Token$438.Identifier,
                value: id$57,
                lineNumber: lineNumber$447,
                lineStart: lineStart$448,
                range: [
                    start$56,
                    index$446
                ]
            };
        }
        if (isKeyword(id$57)) {
            return {
                type: Token$438.Keyword,
                value: id$57,
                lineNumber: lineNumber$447,
                lineStart: lineStart$448,
                range: [
                    start$56,
                    index$446
                ]
            };
        }
        if (id$57 === 'null') {
            return {
                type: Token$438.NullLiteral,
                value: id$57,
                lineNumber: lineNumber$447,
                lineStart: lineStart$448,
                range: [
                    start$56,
                    index$446
                ]
            };
        }
        if (id$57 === 'true' || id$57 === 'false') {
            return {
                type: Token$438.BooleanLiteral,
                value: id$57,
                lineNumber: lineNumber$447,
                lineStart: lineStart$448,
                range: [
                    start$56,
                    index$446
                ]
            };
        }
        return {
            type: Token$438.Identifier,
            value: id$57,
            lineNumber: lineNumber$447,
            lineStart: lineStart$448,
            range: [
                start$56,
                index$446
            ]
        };
    }
    function scanPunctuator() {
        var start$60 = index$446, ch1$61 = source$444[index$446], ch2, ch3, ch4;
        if (ch1$61 === ';' || ch1$61 === '{' || ch1$61 === '}') {
            ++index$446;
            return {
                type: Token$438.Punctuator,
                value: ch1$61,
                lineNumber: lineNumber$447,
                lineStart: lineStart$448,
                range: [
                    start$60,
                    index$446
                ]
            };
        }
        if (ch1$61 === ',' || ch1$61 === '(' || ch1$61 === ')') {
            ++index$446;
            return {
                type: Token$438.Punctuator,
                value: ch1$61,
                lineNumber: lineNumber$447,
                lineStart: lineStart$448,
                range: [
                    start$60,
                    index$446
                ]
            };
        }
        if (ch1$61 === '#') {
            ++index$446;
            return {
                type: Token$438.Punctuator,
                value: ch1$61,
                lineNumber: lineNumber$447,
                lineStart: lineStart$448,
                range: [
                    start$60,
                    index$446
                ]
            };
        }
        ch2 = source$444[index$446 + 1];
        if (ch1$61 === '.' && !isDecimalDigit(ch2)) {
            if (source$444[index$446 + 1] === '.' && source$444[index$446 + 2] === '.') {
                nextChar();
                nextChar();
                nextChar();
                return {
                    type: Token$438.Punctuator,
                    value: '...',
                    lineNumber: lineNumber$447,
                    lineStart: lineStart$448,
                    range: [
                        start$60,
                        index$446
                    ]
                };
            } else {
                return {
                    type: Token$438.Punctuator,
                    value: nextChar(),
                    lineNumber: lineNumber$447,
                    lineStart: lineStart$448,
                    range: [
                        start$60,
                        index$446
                    ]
                };
            }
        }
        ch3 = source$444[index$446 + 2];
        ch4 = source$444[index$446 + 3];
        if (ch1$61 === '>' && ch2 === '>' && ch3 === '>') {
            if (ch4 === '=') {
                index$446 += 4;
                return {
                    type: Token$438.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$447,
                    lineStart: lineStart$448,
                    range: [
                        start$60,
                        index$446
                    ]
                };
            }
        }
        if (ch1$61 === '=' && ch2 === '=' && ch3 === '=') {
            index$446 += 3;
            return {
                type: Token$438.Punctuator,
                value: '===',
                lineNumber: lineNumber$447,
                lineStart: lineStart$448,
                range: [
                    start$60,
                    index$446
                ]
            };
        }
        if (ch1$61 === '!' && ch2 === '=' && ch3 === '=') {
            index$446 += 3;
            return {
                type: Token$438.Punctuator,
                value: '!==',
                lineNumber: lineNumber$447,
                lineStart: lineStart$448,
                range: [
                    start$60,
                    index$446
                ]
            };
        }
        if (ch1$61 === '>' && ch2 === '>' && ch3 === '>') {
            index$446 += 3;
            return {
                type: Token$438.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$447,
                lineStart: lineStart$448,
                range: [
                    start$60,
                    index$446
                ]
            };
        }
        if (ch1$61 === '<' && ch2 === '<' && ch3 === '=') {
            index$446 += 3;
            return {
                type: Token$438.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$447,
                lineStart: lineStart$448,
                range: [
                    start$60,
                    index$446
                ]
            };
        }
        if (ch1$61 === '>' && ch2 === '>' && ch3 === '=') {
            index$446 += 3;
            return {
                type: Token$438.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$447,
                lineStart: lineStart$448,
                range: [
                    start$60,
                    index$446
                ]
            };
        }
        if (ch2 === '=') {
            if ('<>=!+-*%&|^/'.indexOf(ch1$61) >= 0) {
                index$446 += 2;
                return {
                    type: Token$438.Punctuator,
                    value: ch1$61 + ch2,
                    lineNumber: lineNumber$447,
                    lineStart: lineStart$448,
                    range: [
                        start$60,
                        index$446
                    ]
                };
            }
        }
        if (ch1$61 === ch2 && '+-<>&|'.indexOf(ch1$61) >= 0) {
            if ('+-<>&|'.indexOf(ch2) >= 0) {
                index$446 += 2;
                return {
                    type: Token$438.Punctuator,
                    value: ch1$61 + ch2,
                    lineNumber: lineNumber$447,
                    lineStart: lineStart$448,
                    range: [
                        start$60,
                        index$446
                    ]
                };
            }
        }
        if ('[]<>+-*%&|^!~?:=/'.indexOf(ch1$61) >= 0) {
            return {
                type: Token$438.Punctuator,
                value: nextChar(),
                lineNumber: lineNumber$447,
                lineStart: lineStart$448,
                range: [
                    start$60,
                    index$446
                ]
            };
        }
    }
    function scanNumericLiteral() {
        var number$63, start$64, ch$65;
        ch$65 = source$444[index$446];
        assert(isDecimalDigit(ch$65) || ch$65 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$64 = index$446;
        number$63 = '';
        if (ch$65 !== '.') {
            number$63 = nextChar();
            ch$65 = source$444[index$446];
            if (number$63 === '0') {
                if (ch$65 === 'x' || ch$65 === 'X') {
                    number$63 += nextChar();
                    while (index$446 < length$449) {
                        ch$65 = source$444[index$446];
                        if (!isHexDigit(ch$65)) {
                            break;
                        }
                        number$63 += nextChar();
                    }
                    if (number$63.length <= 2) {
                        throwError({}, Messages$442.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$446 < length$449) {
                        ch$65 = source$444[index$446];
                        if (isIdentifierStart(ch$65)) {
                            throwError({}, Messages$442.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$438.NumericLiteral,
                        value: parseInt(number$63, 16),
                        lineNumber: lineNumber$447,
                        lineStart: lineStart$448,
                        range: [
                            start$64,
                            index$446
                        ]
                    };
                } else if (isOctalDigit(ch$65)) {
                    number$63 += nextChar();
                    while (index$446 < length$449) {
                        ch$65 = source$444[index$446];
                        if (!isOctalDigit(ch$65)) {
                            break;
                        }
                        number$63 += nextChar();
                    }
                    if (index$446 < length$449) {
                        ch$65 = source$444[index$446];
                        if (isIdentifierStart(ch$65) || isDecimalDigit(ch$65)) {
                            throwError({}, Messages$442.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$438.NumericLiteral,
                        value: parseInt(number$63, 8),
                        octal: true,
                        lineNumber: lineNumber$447,
                        lineStart: lineStart$448,
                        range: [
                            start$64,
                            index$446
                        ]
                    };
                }
                if (isDecimalDigit(ch$65)) {
                    throwError({}, Messages$442.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (index$446 < length$449) {
                ch$65 = source$444[index$446];
                if (!isDecimalDigit(ch$65)) {
                    break;
                }
                number$63 += nextChar();
            }
        }
        if (ch$65 === '.') {
            number$63 += nextChar();
            while (index$446 < length$449) {
                ch$65 = source$444[index$446];
                if (!isDecimalDigit(ch$65)) {
                    break;
                }
                number$63 += nextChar();
            }
        }
        if (ch$65 === 'e' || ch$65 === 'E') {
            number$63 += nextChar();
            ch$65 = source$444[index$446];
            if (ch$65 === '+' || ch$65 === '-') {
                number$63 += nextChar();
            }
            ch$65 = source$444[index$446];
            if (isDecimalDigit(ch$65)) {
                number$63 += nextChar();
                while (index$446 < length$449) {
                    ch$65 = source$444[index$446];
                    if (!isDecimalDigit(ch$65)) {
                        break;
                    }
                    number$63 += nextChar();
                }
            } else {
                ch$65 = 'character ' + ch$65;
                if (index$446 >= length$449) {
                    ch$65 = '<end>';
                }
                throwError({}, Messages$442.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (index$446 < length$449) {
            ch$65 = source$444[index$446];
            if (isIdentifierStart(ch$65)) {
                throwError({}, Messages$442.UnexpectedToken, 'ILLEGAL');
            }
        }
        return {
            type: Token$438.NumericLiteral,
            value: parseFloat(number$63),
            lineNumber: lineNumber$447,
            lineStart: lineStart$448,
            range: [
                start$64,
                index$446
            ]
        };
    }
    function scanStringLiteral() {
        var str$67 = '', quote$68, start$69, ch$70, code$71, unescaped$72, restore$73, octal$74 = false;
        quote$68 = source$444[index$446];
        assert(quote$68 === '\'' || quote$68 === '"', 'String literal must starts with a quote');
        start$69 = index$446;
        ++index$446;
        while (index$446 < length$449) {
            ch$70 = nextChar();
            if (ch$70 === quote$68) {
                quote$68 = '';
                break;
            } else if (ch$70 === '\\') {
                ch$70 = nextChar();
                if (!isLineTerminator(ch$70)) {
                    switch (ch$70) {
                    case 'n':
                        str$67 += '\n';
                        break;
                    case 'r':
                        str$67 += '\r';
                        break;
                    case 't':
                        str$67 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        restore$73 = index$446;
                        unescaped$72 = scanHexEscape(ch$70);
                        if (unescaped$72) {
                            str$67 += unescaped$72;
                        } else {
                            index$446 = restore$73;
                            str$67 += ch$70;
                        }
                        break;
                    case 'b':
                        str$67 += '\b';
                        break;
                    case 'f':
                        str$67 += '\f';
                        break;
                    case 'v':
                        str$67 += '\v';
                        break;
                    default:
                        if (isOctalDigit(ch$70)) {
                            code$71 = '01234567'.indexOf(ch$70);
                            if (code$71 !== 0) {
                                octal$74 = true;
                            }
                            if (index$446 < length$449 && isOctalDigit(source$444[index$446])) {
                                octal$74 = true;
                                code$71 = code$71 * 8 + '01234567'.indexOf(nextChar());
                                if ('0123'.indexOf(ch$70) >= 0 && index$446 < length$449 && isOctalDigit(source$444[index$446])) {
                                    code$71 = code$71 * 8 + '01234567'.indexOf(nextChar());
                                }
                            }
                            str$67 += String.fromCharCode(code$71);
                        } else {
                            str$67 += ch$70;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$447;
                    if (ch$70 === '\r' && source$444[index$446] === '\n') {
                        ++index$446;
                    }
                }
            } else if (isLineTerminator(ch$70)) {
                break;
            } else {
                str$67 += ch$70;
            }
        }
        if (quote$68 !== '') {
            throwError({}, Messages$442.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$438.StringLiteral,
            value: str$67,
            octal: octal$74,
            lineNumber: lineNumber$447,
            lineStart: lineStart$448,
            range: [
                start$69,
                index$446
            ]
        };
    }
    function scanRegExp() {
        var str$78 = '', ch$79, start$80, pattern$81, flags$82, value$83, classMarker$84 = false, restore$85;
        buffer$450 = null;
        skipComment();
        start$80 = index$446;
        ch$79 = source$444[index$446];
        assert(ch$79 === '/', 'Regular expression literal must start with a slash');
        str$78 = nextChar();
        while (index$446 < length$449) {
            ch$79 = nextChar();
            str$78 += ch$79;
            if (classMarker$84) {
                if (ch$79 === ']') {
                    classMarker$84 = false;
                }
            } else {
                if (ch$79 === '\\') {
                    ch$79 = nextChar();
                    if (isLineTerminator(ch$79)) {
                        throwError({}, Messages$442.UnterminatedRegExp);
                    }
                    str$78 += ch$79;
                } else if (ch$79 === '/') {
                    break;
                } else if (ch$79 === '[') {
                    classMarker$84 = true;
                } else if (isLineTerminator(ch$79)) {
                    throwError({}, Messages$442.UnterminatedRegExp);
                }
            }
        }
        if (str$78.length === 1) {
            throwError({}, Messages$442.UnterminatedRegExp);
        }
        pattern$81 = str$78.substr(1, str$78.length - 2);
        flags$82 = '';
        while (index$446 < length$449) {
            ch$79 = source$444[index$446];
            if (!isIdentifierPart(ch$79)) {
                break;
            }
            ++index$446;
            if (ch$79 === '\\' && index$446 < length$449) {
                ch$79 = source$444[index$446];
                if (ch$79 === 'u') {
                    ++index$446;
                    restore$85 = index$446;
                    ch$79 = scanHexEscape('u');
                    if (ch$79) {
                        flags$82 += ch$79;
                        str$78 += '\\u';
                        for (; restore$85 < index$446; ++restore$85) {
                            str$78 += source$444[restore$85];
                        }
                    } else {
                        index$446 = restore$85;
                        flags$82 += 'u';
                        str$78 += '\\u';
                    }
                } else {
                    str$78 += '\\';
                }
            } else {
                flags$82 += ch$79;
                str$78 += ch$79;
            }
        }
        try {
            value$83 = new RegExp(pattern$81, flags$82);
        } catch (e$76) {
            throwError({}, Messages$442.InvalidRegExp);
        }
        return {
            type: Token$438.RegexLiteral,
            literal: str$78,
            value: value$83,
            lineNumber: lineNumber$447,
            lineStart: lineStart$448,
            range: [
                start$80,
                index$446
            ]
        };
    }
    function isIdentifierName(token$86) {
        return token$86.type === Token$438.Identifier || token$86.type === Token$438.Keyword || token$86.type === Token$438.BooleanLiteral || token$86.type === Token$438.NullLiteral;
    }
    function advance() {
        var ch$89, token$90;
        skipComment();
        if (index$446 >= length$449) {
            return {
                type: Token$438.EOF,
                lineNumber: lineNumber$447,
                lineStart: lineStart$448,
                range: [
                    index$446,
                    index$446
                ]
            };
        }
        ch$89 = source$444[index$446];
        token$90 = scanPunctuator();
        if (typeof token$90 !== 'undefined') {
            return token$90;
        }
        if (ch$89 === '\'' || ch$89 === '"') {
            return scanStringLiteral();
        }
        if (ch$89 === '.' || isDecimalDigit(ch$89)) {
            return scanNumericLiteral();
        }
        token$90 = scanIdentifier();
        if (typeof token$90 !== 'undefined') {
            return token$90;
        }
        throwError({}, Messages$442.UnexpectedToken, 'ILLEGAL');
    }
    function lex() {
        var token$92;
        if (buffer$450) {
            token$92 = buffer$450;
            buffer$450 = null;
            index$446++;
            return token$92;
        }
        buffer$450 = null;
        return tokenStream$452[index$446++];
    }
    function lookahead() {
        var pos$94, line$95, start$96;
        if (buffer$450 !== null) {
            return buffer$450;
        }
        buffer$450 = tokenStream$452[index$446];
        return buffer$450;
    }
    function peekLineTerminator() {
        var pos$98, line$99, start$100, found$101;
        found$101 = tokenStream$452[index$446 - 1].token.lineNumber !== tokenStream$452[index$446].token.lineNumber;
        return found$101;
    }
    function throwError(token$102, messageFormat$103) {
        var error$108, args$109 = Array.prototype.slice.call(arguments, 2), msg$110 = messageFormat$103.replace(/%(\d)/g, function (whole$105, index$106) {
                return args$109[index$106] || '';
            });
        if (typeof token$102.lineNumber === 'number') {
            error$108 = new Error('Line ' + token$102.lineNumber + ': ' + msg$110);
            error$108.lineNumber = token$102.lineNumber;
            if (token$102.range && token$102.range.length > 0) {
                error$108.index = token$102.range[0];
                error$108.column = token$102.range[0] - lineStart$448 + 1;
            }
        } else {
            error$108 = new Error('Line ' + lineNumber$447 + ': ' + msg$110);
            error$108.index = index$446;
            error$108.lineNumber = lineNumber$447;
            error$108.column = index$446 - lineStart$448 + 1;
        }
        throw error$108;
    }
    function throwErrorTolerant() {
        var error$114;
        try {
            throwError.apply(null, arguments);
        } catch (e$112) {
            if (extra$453.errors) {
                extra$453.errors.push(e$112);
            } else {
                throw e$112;
            }
        }
    }
    function throwUnexpected(token$115) {
        var s$117;
        if (token$115.type === Token$438.EOF) {
            throwError(token$115, Messages$442.UnexpectedEOS);
        }
        if (token$115.type === Token$438.NumericLiteral) {
            throwError(token$115, Messages$442.UnexpectedNumber);
        }
        if (token$115.type === Token$438.StringLiteral) {
            throwError(token$115, Messages$442.UnexpectedString);
        }
        if (token$115.type === Token$438.Identifier) {
            console.log(token$115);
            throwError(token$115, Messages$442.UnexpectedIdentifier);
        }
        if (token$115.type === Token$438.Keyword) {
            if (isFutureReservedWord(token$115.value)) {
                throwError(token$115, Messages$442.UnexpectedReserved);
            } else if (strict$445 && isStrictModeReservedWord(token$115.value)) {
                throwError(token$115, Messages$442.StrictReservedWord);
            }
            throwError(token$115, Messages$442.UnexpectedToken, token$115.value);
        }
        throwError(token$115, Messages$442.UnexpectedToken, token$115.value);
    }
    function expect(value$118) {
        var token$120 = lex().token;
        if (token$120.type !== Token$438.Punctuator || token$120.value !== value$118) {
            throwUnexpected(token$120);
        }
    }
    function expectKeyword(keyword$121) {
        var token$123 = lex().token;
        if (token$123.type !== Token$438.Keyword || token$123.value !== keyword$121) {
            throwUnexpected(token$123);
        }
    }
    function match(value$124) {
        var token$126 = lookahead().token;
        return token$126.type === Token$438.Punctuator && token$126.value === value$124;
    }
    function matchKeyword(keyword$127) {
        var token$129 = lookahead().token;
        return token$129.type === Token$438.Keyword && token$129.value === keyword$127;
    }
    function matchAssign() {
        var token$131 = lookahead().token, op$132 = token$131.value;
        if (token$131.type !== Token$438.Punctuator) {
            return false;
        }
        return op$132 === '=' || op$132 === '*=' || op$132 === '/=' || op$132 === '%=' || op$132 === '+=' || op$132 === '-=' || op$132 === '<<=' || op$132 === '>>=' || op$132 === '>>>=' || op$132 === '&=' || op$132 === '^=' || op$132 === '|=';
    }
    function consumeSemicolon() {
        var token$134, line$135;
        if (tokenStream$452[index$446].token.value === ';') {
            lex().token;
            return;
        }
        line$135 = tokenStream$452[index$446 - 1].token.lineNumber;
        token$134 = tokenStream$452[index$446].token;
        if (line$135 !== token$134.lineNumber) {
            return;
        }
        if (token$134.type !== Token$438.EOF && !match('}')) {
            throwUnexpected(token$134);
        }
        return;
    }
    function isLeftHandSide(expr$136) {
        return expr$136.type === Syntax$440.Identifier || expr$136.type === Syntax$440.MemberExpression;
    }
    function parseArrayInitialiser() {
        var elements$139 = [], undef$140;
        expect('[');
        while (!match(']')) {
            if (match(',')) {
                lex().token;
                elements$139.push(undef$140);
            } else {
                elements$139.push(parseAssignmentExpression());
                if (!match(']')) {
                    expect(',');
                }
            }
        }
        expect(']');
        return {
            type: Syntax$440.ArrayExpression,
            elements: elements$139
        };
    }
    function parsePropertyFunction(param$141, first$142) {
        var previousStrict$144, body$145;
        previousStrict$144 = strict$445;
        body$145 = parseFunctionSourceElements();
        if (first$142 && strict$445 && isRestrictedWord(param$141[0].name)) {
            throwError(first$142, Messages$442.StrictParamName);
        }
        strict$445 = previousStrict$144;
        return {
            type: Syntax$440.FunctionExpression,
            id: null,
            params: param$141,
            body: body$145
        };
    }
    function parseObjectPropertyKey() {
        var token$147 = lex().token;
        if (token$147.type === Token$438.StringLiteral || token$147.type === Token$438.NumericLiteral) {
            if (strict$445 && token$147.octal) {
                throwError(token$147, Messages$442.StrictOctalLiteral);
            }
            return createLiteral(token$147);
        }
        return {
            type: Syntax$440.Identifier,
            name: token$147.value
        };
    }
    function parseObjectProperty() {
        var token$149, key$150, id$151, param$152;
        token$149 = lookahead().token;
        if (token$149.type === Token$438.Identifier) {
            id$151 = parseObjectPropertyKey();
            if (token$149.value === 'get' && !match(':')) {
                key$150 = parseObjectPropertyKey();
                expect('(');
                expect(')');
                return {
                    type: Syntax$440.Property,
                    key: key$150,
                    value: parsePropertyFunction([]),
                    kind: 'get'
                };
            } else if (token$149.value === 'set' && !match(':')) {
                key$150 = parseObjectPropertyKey();
                expect('(');
                token$149 = lookahead().token;
                if (token$149.type !== Token$438.Identifier) {
                    throwUnexpected(lex().token);
                }
                param$152 = [parseVariableIdentifier()];
                expect(')');
                return {
                    type: Syntax$440.Property,
                    key: key$150,
                    value: parsePropertyFunction(param$152, token$149),
                    kind: 'set'
                };
            } else {
                expect(':');
                return {
                    type: Syntax$440.Property,
                    key: id$151,
                    value: parseAssignmentExpression(),
                    kind: 'init'
                };
            }
        } else if (token$149.type === Token$438.EOF || token$149.type === Token$438.Punctuator) {
            throwUnexpected(token$149);
        } else {
            key$150 = parseObjectPropertyKey();
            expect(':');
            return {
                type: Syntax$440.Property,
                key: key$150,
                value: parseAssignmentExpression(),
                kind: 'init'
            };
        }
    }
    function parseObjectInitialiser() {
        var token$154, properties$155 = [], property$156, name$157, kind$158, map$159 = {}, toString$160 = String;
        expect('{');
        while (!match('}')) {
            property$156 = parseObjectProperty();
            if (property$156.key.type === Syntax$440.Identifier) {
                name$157 = property$156.key.name;
            } else {
                name$157 = toString$160(property$156.key.value);
            }
            kind$158 = property$156.kind === 'init' ? PropertyKind$441.Data : property$156.kind === 'get' ? PropertyKind$441.Get : PropertyKind$441.Set;
            if (Object.prototype.hasOwnProperty.call(map$159, name$157)) {
                if (map$159[name$157] === PropertyKind$441.Data) {
                    if (strict$445 && kind$158 === PropertyKind$441.Data) {
                        throwErrorTolerant({}, Messages$442.StrictDuplicateProperty);
                    } else if (kind$158 !== PropertyKind$441.Data) {
                        throwError({}, Messages$442.AccessorDataProperty);
                    }
                } else {
                    if (kind$158 === PropertyKind$441.Data) {
                        throwError({}, Messages$442.AccessorDataProperty);
                    } else if (map$159[name$157] & kind$158) {
                        throwError({}, Messages$442.AccessorGetSet);
                    }
                }
                map$159[name$157] |= kind$158;
            } else {
                map$159[name$157] = kind$158;
            }
            properties$155.push(property$156);
            if (!match('}')) {
                expect(',');
            }
        }
        expect('}');
        return {
            type: Syntax$440.ObjectExpression,
            properties: properties$155
        };
    }
    function parsePrimaryExpression() {
        var expr$162, token$163 = lookahead().token, type$164 = token$163.type;
        if (type$164 === Token$438.Identifier) {
            var name$165 = extra$453.noresolve ? lex().token.value : expander$5.resolve(lex());
            return {
                type: Syntax$440.Identifier,
                name: name$165
            };
        }
        if (type$164 === Token$438.StringLiteral || type$164 === Token$438.NumericLiteral) {
            if (strict$445 && token$163.octal) {
                throwErrorTolerant(token$163, Messages$442.StrictOctalLiteral);
            }
            return createLiteral(lex().token);
        }
        if (type$164 === Token$438.Keyword) {
            if (matchKeyword('this')) {
                lex().token;
                return {type: Syntax$440.ThisExpression};
            }
            if (matchKeyword('function')) {
                return parseFunctionExpression();
            }
        }
        if (type$164 === Token$438.BooleanLiteral) {
            lex();
            token$163.value = token$163.value === 'true';
            return createLiteral(token$163);
        }
        if (type$164 === Token$438.NullLiteral) {
            lex();
            token$163.value = null;
            return createLiteral(token$163);
        }
        if (match('[')) {
            return parseArrayInitialiser();
        }
        if (match('{')) {
            return parseObjectInitialiser();
        }
        if (match('(')) {
            lex();
            state$451.lastParenthesized = expr$162 = parseExpression();
            expect(')');
            return expr$162;
        }
        if (token$163.value instanceof RegExp) {
            return createLiteral(lex().token);
        }
        return throwUnexpected(lex().token);
    }
    function parseArguments() {
        var args$167 = [];
        expect('(');
        if (!match(')')) {
            while (index$446 < length$449) {
                args$167.push(parseAssignmentExpression());
                if (match(')')) {
                    break;
                }
                expect(',');
            }
        }
        expect(')');
        return args$167;
    }
    function parseNonComputedProperty() {
        var token$169 = lex().token;
        if (!isIdentifierName(token$169)) {
            throwUnexpected(token$169);
        }
        return {
            type: Syntax$440.Identifier,
            name: token$169.value
        };
    }
    function parseNonComputedMember(object$170) {
        return {
            type: Syntax$440.MemberExpression,
            computed: false,
            object: object$170,
            property: parseNonComputedProperty()
        };
    }
    function parseComputedMember(object$172) {
        var property$174, expr$175;
        expect('[');
        property$174 = parseExpression();
        expr$175 = {
            type: Syntax$440.MemberExpression,
            computed: true,
            object: object$172,
            property: property$174
        };
        expect(']');
        return expr$175;
    }
    function parseCallMember(object$176) {
        return {
            type: Syntax$440.CallExpression,
            callee: object$176,
            'arguments': parseArguments()
        };
    }
    function parseNewExpression() {
        var expr$179;
        expectKeyword('new');
        expr$179 = {
            type: Syntax$440.NewExpression,
            callee: parseLeftHandSideExpression(),
            'arguments': []
        };
        if (match('(')) {
            expr$179['arguments'] = parseArguments();
        }
        return expr$179;
    }
    function toArrayNode(arr$180) {
        var els$184 = arr$180.map(function (el$182) {
                return {
                    type: 'Literal',
                    value: el$182,
                    raw: el$182.toString()
                };
            });
        return {
            type: 'ArrayExpression',
            elements: els$184
        };
    }
    function toObjectNode(obj$185) {
        var props$191 = Object.keys(obj$185).map(function (key$187) {
                var raw$189 = obj$185[key$187];
                var value$190;
                if (Array.isArray(raw$189)) {
                    value$190 = toArrayNode(raw$189);
                } else {
                    value$190 = {
                        type: 'Literal',
                        value: obj$185[key$187],
                        raw: obj$185[key$187].toString()
                    };
                }
                return {
                    type: 'Property',
                    key: {
                        type: 'Identifier',
                        name: key$187
                    },
                    value: value$190,
                    kind: 'init'
                };
            });
        return {
            type: 'ObjectExpression',
            properties: props$191
        };
    }
    function parseLeftHandSideExpressionAllowCall() {
        var useNew$193, expr$194;
        useNew$193 = matchKeyword('new');
        expr$194 = useNew$193 ? parseNewExpression() : parsePrimaryExpression();
        while (index$446 < length$449) {
            if (match('.')) {
                lex();
                expr$194 = parseNonComputedMember(expr$194);
            } else if (match('[')) {
                expr$194 = parseComputedMember(expr$194);
            } else if (match('(')) {
                expr$194 = parseCallMember(expr$194);
            } else {
                break;
            }
        }
        return expr$194;
    }
    function parseLeftHandSideExpression() {
        var useNew$196, expr$197;
        useNew$196 = matchKeyword('new');
        expr$197 = useNew$196 ? parseNewExpression() : parsePrimaryExpression();
        while (index$446 < length$449) {
            if (match('.')) {
                lex();
                expr$197 = parseNonComputedMember(expr$197);
            } else if (match('[')) {
                expr$197 = parseComputedMember(expr$197);
            } else {
                break;
            }
        }
        return expr$197;
    }
    function parsePostfixExpression() {
        var expr$199 = parseLeftHandSideExpressionAllowCall();
        if ((match('++') || match('--')) && !peekLineTerminator()) {
            if (strict$445 && expr$199.type === Syntax$440.Identifier && isRestrictedWord(expr$199.name)) {
                throwError({}, Messages$442.StrictLHSPostfix);
            }
            if (!isLeftHandSide(expr$199)) {
                throwError({}, Messages$442.InvalidLHSInAssignment);
            }
            expr$199 = {
                type: Syntax$440.UpdateExpression,
                operator: lex().token.value,
                argument: expr$199,
                prefix: false
            };
        }
        return expr$199;
    }
    function parseUnaryExpression() {
        var token$201, expr$202;
        if (match('++') || match('--')) {
            token$201 = lex().token;
            expr$202 = parseUnaryExpression();
            if (strict$445 && expr$202.type === Syntax$440.Identifier && isRestrictedWord(expr$202.name)) {
                throwError({}, Messages$442.StrictLHSPrefix);
            }
            if (!isLeftHandSide(expr$202)) {
                throwError({}, Messages$442.InvalidLHSInAssignment);
            }
            expr$202 = {
                type: Syntax$440.UpdateExpression,
                operator: token$201.value,
                argument: expr$202,
                prefix: true
            };
            return expr$202;
        }
        if (match('+') || match('-') || match('~') || match('!')) {
            expr$202 = {
                type: Syntax$440.UnaryExpression,
                operator: lex().token.value,
                argument: parseUnaryExpression()
            };
            return expr$202;
        }
        if (matchKeyword('delete') || matchKeyword('void') || matchKeyword('typeof')) {
            expr$202 = {
                type: Syntax$440.UnaryExpression,
                operator: lex().token.value,
                argument: parseUnaryExpression()
            };
            if (strict$445 && expr$202.operator === 'delete' && expr$202.argument.type === Syntax$440.Identifier) {
                throwErrorTolerant({}, Messages$442.StrictDelete);
            }
            return expr$202;
        }
        return parsePostfixExpression();
    }
    function parseMultiplicativeExpression() {
        var expr$204 = parseUnaryExpression();
        while (match('*') || match('/') || match('%')) {
            expr$204 = {
                type: Syntax$440.BinaryExpression,
                operator: lex().token.value,
                left: expr$204,
                right: parseUnaryExpression()
            };
        }
        return expr$204;
    }
    function parseAdditiveExpression() {
        var expr$206 = parseMultiplicativeExpression();
        while (match('+') || match('-')) {
            expr$206 = {
                type: Syntax$440.BinaryExpression,
                operator: lex().token.value,
                left: expr$206,
                right: parseMultiplicativeExpression()
            };
        }
        return expr$206;
    }
    function parseShiftExpression() {
        var expr$208 = parseAdditiveExpression();
        while (match('<<') || match('>>') || match('>>>')) {
            expr$208 = {
                type: Syntax$440.BinaryExpression,
                operator: lex().token.value,
                left: expr$208,
                right: parseAdditiveExpression()
            };
        }
        return expr$208;
    }
    function parseRelationalExpression() {
        var expr$210, previousAllowIn$211;
        previousAllowIn$211 = state$451.allowIn;
        state$451.allowIn = true;
        expr$210 = parseShiftExpression();
        while (match('<') || match('>') || match('<=') || match('>=') || previousAllowIn$211 && matchKeyword('in') || matchKeyword('instanceof')) {
            expr$210 = {
                type: Syntax$440.BinaryExpression,
                operator: lex().token.value,
                left: expr$210,
                right: parseRelationalExpression()
            };
        }
        state$451.allowIn = previousAllowIn$211;
        return expr$210;
    }
    function parseEqualityExpression() {
        var expr$213 = parseRelationalExpression();
        while (match('==') || match('!=') || match('===') || match('!==')) {
            expr$213 = {
                type: Syntax$440.BinaryExpression,
                operator: lex().token.value,
                left: expr$213,
                right: parseRelationalExpression()
            };
        }
        return expr$213;
    }
    function parseBitwiseANDExpression() {
        var expr$215 = parseEqualityExpression();
        while (match('&')) {
            lex();
            expr$215 = {
                type: Syntax$440.BinaryExpression,
                operator: '&',
                left: expr$215,
                right: parseEqualityExpression()
            };
        }
        return expr$215;
    }
    function parseBitwiseXORExpression() {
        var expr$217 = parseBitwiseANDExpression();
        while (match('^')) {
            lex();
            expr$217 = {
                type: Syntax$440.BinaryExpression,
                operator: '^',
                left: expr$217,
                right: parseBitwiseANDExpression()
            };
        }
        return expr$217;
    }
    function parseBitwiseORExpression() {
        var expr$219 = parseBitwiseXORExpression();
        while (match('|')) {
            lex();
            expr$219 = {
                type: Syntax$440.BinaryExpression,
                operator: '|',
                left: expr$219,
                right: parseBitwiseXORExpression()
            };
        }
        return expr$219;
    }
    function parseLogicalANDExpression() {
        var expr$221 = parseBitwiseORExpression();
        while (match('&&')) {
            lex();
            expr$221 = {
                type: Syntax$440.LogicalExpression,
                operator: '&&',
                left: expr$221,
                right: parseBitwiseORExpression()
            };
        }
        return expr$221;
    }
    function parseLogicalORExpression() {
        var expr$223 = parseLogicalANDExpression();
        while (match('||')) {
            lex();
            expr$223 = {
                type: Syntax$440.LogicalExpression,
                operator: '||',
                left: expr$223,
                right: parseLogicalANDExpression()
            };
        }
        return expr$223;
    }
    function parseConditionalExpression() {
        var expr$225, previousAllowIn$226, consequent$227;
        expr$225 = parseLogicalORExpression();
        if (match('?')) {
            lex();
            previousAllowIn$226 = state$451.allowIn;
            state$451.allowIn = true;
            consequent$227 = parseAssignmentExpression();
            state$451.allowIn = previousAllowIn$226;
            expect(':');
            expr$225 = {
                type: Syntax$440.ConditionalExpression,
                test: expr$225,
                consequent: consequent$227,
                alternate: parseAssignmentExpression()
            };
        }
        return expr$225;
    }
    function parseAssignmentExpression() {
        var expr$229;
        expr$229 = parseConditionalExpression();
        if (matchAssign()) {
            if (!isLeftHandSide(expr$229)) {
                throwError({}, Messages$442.InvalidLHSInAssignment);
            }
            if (strict$445 && expr$229.type === Syntax$440.Identifier && isRestrictedWord(expr$229.name)) {
                throwError({}, Messages$442.StrictLHSAssignment);
            }
            expr$229 = {
                type: Syntax$440.AssignmentExpression,
                operator: lex().token.value,
                left: expr$229,
                right: parseAssignmentExpression()
            };
        }
        return expr$229;
    }
    function parseExpression() {
        var expr$231 = parseAssignmentExpression();
        if (match(',')) {
            expr$231 = {
                type: Syntax$440.SequenceExpression,
                expressions: [expr$231]
            };
            while (index$446 < length$449) {
                if (!match(',')) {
                    break;
                }
                lex();
                expr$231.expressions.push(parseAssignmentExpression());
            }
        }
        return expr$231;
    }
    function parseStatementList() {
        var list$233 = [], statement$234;
        while (index$446 < length$449) {
            if (match('}')) {
                break;
            }
            statement$234 = parseSourceElement();
            if (typeof statement$234 === 'undefined') {
                break;
            }
            list$233.push(statement$234);
        }
        return list$233;
    }
    function parseBlock() {
        var block$236;
        expect('{');
        block$236 = parseStatementList();
        expect('}');
        return {
            type: Syntax$440.BlockStatement,
            body: block$236
        };
    }
    function parseVariableIdentifier() {
        var stx$238 = lex(), token$239 = stx$238.token;
        if (token$239.type !== Token$438.Identifier) {
            throwUnexpected(token$239);
        }
        var name$240 = extra$453.noresolve ? stx$238 : expander$5.resolve(stx$238);
        return {
            type: Syntax$440.Identifier,
            name: name$240
        };
    }
    function parseVariableDeclaration(kind$241) {
        var id$243 = parseVariableIdentifier(), init$244 = null;
        if (strict$445 && isRestrictedWord(id$243.name)) {
            throwErrorTolerant({}, Messages$442.StrictVarName);
        }
        if (kind$241 === 'const') {
            expect('=');
            init$244 = parseAssignmentExpression();
        } else if (match('=')) {
            lex();
            init$244 = parseAssignmentExpression();
        }
        return {
            type: Syntax$440.VariableDeclarator,
            id: id$243,
            init: init$244
        };
    }
    function parseVariableDeclarationList(kind$245) {
        var list$247 = [];
        while (index$446 < length$449) {
            list$247.push(parseVariableDeclaration(kind$245));
            if (!match(',')) {
                break;
            }
            lex();
        }
        return list$247;
    }
    function parseVariableStatement() {
        var declarations$249;
        expectKeyword('var');
        declarations$249 = parseVariableDeclarationList();
        consumeSemicolon();
        return {
            type: Syntax$440.VariableDeclaration,
            declarations: declarations$249,
            kind: 'var'
        };
    }
    function parseConstLetDeclaration(kind$250) {
        var declarations$252;
        expectKeyword(kind$250);
        declarations$252 = parseVariableDeclarationList(kind$250);
        consumeSemicolon();
        return {
            type: Syntax$440.VariableDeclaration,
            declarations: declarations$252,
            kind: kind$250
        };
    }
    function parseEmptyStatement() {
        expect(';');
        return {type: Syntax$440.EmptyStatement};
    }
    function parseExpressionStatement() {
        var expr$255 = parseExpression();
        consumeSemicolon();
        return {
            type: Syntax$440.ExpressionStatement,
            expression: expr$255
        };
    }
    function parseIfStatement() {
        var test$257, consequent$258, alternate$259;
        expectKeyword('if');
        expect('(');
        test$257 = parseExpression();
        expect(')');
        consequent$258 = parseStatement();
        if (matchKeyword('else')) {
            lex();
            alternate$259 = parseStatement();
        } else {
            alternate$259 = null;
        }
        return {
            type: Syntax$440.IfStatement,
            test: test$257,
            consequent: consequent$258,
            alternate: alternate$259
        };
    }
    function parseDoWhileStatement() {
        var body$261, test$262, oldInIteration$263;
        expectKeyword('do');
        oldInIteration$263 = state$451.inIteration;
        state$451.inIteration = true;
        body$261 = parseStatement();
        state$451.inIteration = oldInIteration$263;
        expectKeyword('while');
        expect('(');
        test$262 = parseExpression();
        expect(')');
        if (match(';')) {
            lex();
        }
        return {
            type: Syntax$440.DoWhileStatement,
            body: body$261,
            test: test$262
        };
    }
    function parseWhileStatement() {
        var test$265, body$266, oldInIteration$267;
        expectKeyword('while');
        expect('(');
        test$265 = parseExpression();
        expect(')');
        oldInIteration$267 = state$451.inIteration;
        state$451.inIteration = true;
        body$266 = parseStatement();
        state$451.inIteration = oldInIteration$267;
        return {
            type: Syntax$440.WhileStatement,
            test: test$265,
            body: body$266
        };
    }
    function parseForVariableDeclaration() {
        var token$269 = lex().token;
        return {
            type: Syntax$440.VariableDeclaration,
            declarations: parseVariableDeclarationList(),
            kind: token$269.value
        };
    }
    function parseForStatement() {
        var init$271, test$272, update$273, left$274, right$275, body$276, oldInIteration$277;
        init$271 = test$272 = update$273 = null;
        expectKeyword('for');
        expect('(');
        if (match(';')) {
            lex();
        } else {
            if (matchKeyword('var') || matchKeyword('let')) {
                state$451.allowIn = false;
                init$271 = parseForVariableDeclaration();
                state$451.allowIn = true;
                if (init$271.declarations.length === 1 && matchKeyword('in')) {
                    lex();
                    left$274 = init$271;
                    right$275 = parseExpression();
                    init$271 = null;
                }
            } else {
                state$451.allowIn = false;
                init$271 = parseExpression();
                state$451.allowIn = true;
                if (matchKeyword('in')) {
                    if (!isLeftHandSide(init$271)) {
                        throwError({}, Messages$442.InvalidLHSInForIn);
                    }
                    lex();
                    left$274 = init$271;
                    right$275 = parseExpression();
                    init$271 = null;
                }
            }
            if (typeof left$274 === 'undefined') {
                expect(';');
            }
        }
        if (typeof left$274 === 'undefined') {
            if (!match(';')) {
                test$272 = parseExpression();
            }
            expect(';');
            if (!match(')')) {
                update$273 = parseExpression();
            }
        }
        expect(')');
        oldInIteration$277 = state$451.inIteration;
        state$451.inIteration = true;
        body$276 = parseStatement();
        state$451.inIteration = oldInIteration$277;
        if (typeof left$274 === 'undefined') {
            return {
                type: Syntax$440.ForStatement,
                init: init$271,
                test: test$272,
                update: update$273,
                body: body$276
            };
        }
        return {
            type: Syntax$440.ForInStatement,
            left: left$274,
            right: right$275,
            body: body$276,
            each: false
        };
    }
    function parseContinueStatement() {
        var token$279, label$280 = null;
        expectKeyword('continue');
        if (tokenStream$452[index$446].token.value === ';') {
            lex();
            if (!state$451.inIteration) {
                throwError({}, Messages$442.IllegalContinue);
            }
            return {
                type: Syntax$440.ContinueStatement,
                label: null
            };
        }
        if (peekLineTerminator()) {
            if (!state$451.inIteration) {
                throwError({}, Messages$442.IllegalContinue);
            }
            return {
                type: Syntax$440.ContinueStatement,
                label: null
            };
        }
        token$279 = lookahead().token;
        if (token$279.type === Token$438.Identifier) {
            label$280 = parseVariableIdentifier();
            if (!Object.prototype.hasOwnProperty.call(state$451.labelSet, label$280.name)) {
                throwError({}, Messages$442.UnknownLabel, label$280.name);
            }
        }
        consumeSemicolon();
        if (label$280 === null && !state$451.inIteration) {
            throwError({}, Messages$442.IllegalContinue);
        }
        return {
            type: Syntax$440.ContinueStatement,
            label: label$280
        };
    }
    function parseBreakStatement() {
        var token$282, label$283 = null;
        expectKeyword('break');
        if (source$444[index$446] === ';') {
            lex();
            if (!(state$451.inIteration || state$451.inSwitch)) {
                throwError({}, Messages$442.IllegalBreak);
            }
            return {
                type: Syntax$440.BreakStatement,
                label: null
            };
        }
        if (peekLineTerminator()) {
            if (!(state$451.inIteration || state$451.inSwitch)) {
                throwError({}, Messages$442.IllegalBreak);
            }
            return {
                type: Syntax$440.BreakStatement,
                label: null
            };
        }
        token$282 = lookahead().token;
        if (token$282.type === Token$438.Identifier) {
            label$283 = parseVariableIdentifier();
            if (!Object.prototype.hasOwnProperty.call(state$451.labelSet, label$283.name)) {
                throwError({}, Messages$442.UnknownLabel, label$283.name);
            }
        }
        consumeSemicolon();
        if (label$283 === null && !(state$451.inIteration || state$451.inSwitch)) {
            throwError({}, Messages$442.IllegalBreak);
        }
        return {
            type: Syntax$440.BreakStatement,
            label: label$283
        };
    }
    function parseReturnStatement() {
        var token$285, argument$286 = null;
        expectKeyword('return');
        if (!state$451.inFunctionBody) {
            throwErrorTolerant({}, Messages$442.IllegalReturn);
        }
        if (source$444[index$446] === ' ') {
            if (isIdentifierStart(source$444[index$446 + 1])) {
                argument$286 = parseExpression();
                consumeSemicolon();
                return {
                    type: Syntax$440.ReturnStatement,
                    argument: argument$286
                };
            }
        }
        if (peekLineTerminator()) {
            return {
                type: Syntax$440.ReturnStatement,
                argument: null
            };
        }
        if (!match(';')) {
            token$285 = lookahead().token;
            if (!match('}') && token$285.type !== Token$438.EOF) {
                argument$286 = parseExpression();
            }
        }
        consumeSemicolon();
        return {
            type: Syntax$440.ReturnStatement,
            argument: argument$286
        };
    }
    function parseWithStatement() {
        var object$288, body$289;
        if (strict$445) {
            throwErrorTolerant({}, Messages$442.StrictModeWith);
        }
        expectKeyword('with');
        expect('(');
        object$288 = parseExpression();
        expect(')');
        body$289 = parseStatement();
        return {
            type: Syntax$440.WithStatement,
            object: object$288,
            body: body$289
        };
    }
    function parseSwitchCase() {
        var test$291, consequent$292 = [], statement$293;
        if (matchKeyword('default')) {
            lex();
            test$291 = null;
        } else {
            expectKeyword('case');
            test$291 = parseExpression();
        }
        expect(':');
        while (index$446 < length$449) {
            if (match('}') || matchKeyword('default') || matchKeyword('case')) {
                break;
            }
            statement$293 = parseStatement();
            if (typeof statement$293 === 'undefined') {
                break;
            }
            consequent$292.push(statement$293);
        }
        return {
            type: Syntax$440.SwitchCase,
            test: test$291,
            consequent: consequent$292
        };
    }
    function parseSwitchStatement() {
        var discriminant$295, cases$296, oldInSwitch$297;
        expectKeyword('switch');
        expect('(');
        discriminant$295 = parseExpression();
        expect(')');
        expect('{');
        if (match('}')) {
            lex();
            return {
                type: Syntax$440.SwitchStatement,
                discriminant: discriminant$295
            };
        }
        cases$296 = [];
        oldInSwitch$297 = state$451.inSwitch;
        state$451.inSwitch = true;
        while (index$446 < length$449) {
            if (match('}')) {
                break;
            }
            cases$296.push(parseSwitchCase());
        }
        state$451.inSwitch = oldInSwitch$297;
        expect('}');
        return {
            type: Syntax$440.SwitchStatement,
            discriminant: discriminant$295,
            cases: cases$296
        };
    }
    function parseThrowStatement() {
        var argument$299;
        expectKeyword('throw');
        if (peekLineTerminator()) {
            throwError({}, Messages$442.NewlineAfterThrow);
        }
        argument$299 = parseExpression();
        consumeSemicolon();
        return {
            type: Syntax$440.ThrowStatement,
            argument: argument$299
        };
    }
    function parseCatchClause() {
        var param$301;
        expectKeyword('catch');
        expect('(');
        if (!match(')')) {
            param$301 = parseExpression();
            if (strict$445 && param$301.type === Syntax$440.Identifier && isRestrictedWord(param$301.name)) {
                throwErrorTolerant({}, Messages$442.StrictCatchVariable);
            }
        }
        expect(')');
        return {
            type: Syntax$440.CatchClause,
            param: param$301,
            guard: null,
            body: parseBlock()
        };
    }
    function parseTryStatement() {
        var block$303, handlers$304 = [], finalizer$305 = null;
        expectKeyword('try');
        block$303 = parseBlock();
        if (matchKeyword('catch')) {
            handlers$304.push(parseCatchClause());
        }
        if (matchKeyword('finally')) {
            lex();
            finalizer$305 = parseBlock();
        }
        if (handlers$304.length === 0 && !finalizer$305) {
            throwError({}, Messages$442.NoCatchOrFinally);
        }
        return {
            type: Syntax$440.TryStatement,
            block: block$303,
            handlers: handlers$304,
            finalizer: finalizer$305
        };
    }
    function parseDebuggerStatement() {
        expectKeyword('debugger');
        consumeSemicolon();
        return {type: Syntax$440.DebuggerStatement};
    }
    function parseStatement() {
        var token$308 = lookahead().token, expr$309, labeledBody$310;
        if (token$308.type === Token$438.EOF) {
            throwUnexpected(token$308);
        }
        if (token$308.type === Token$438.Punctuator) {
            switch (token$308.value) {
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
        if (token$308.type === Token$438.Keyword) {
            switch (token$308.value) {
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
        expr$309 = parseExpression();
        if (expr$309.type === Syntax$440.Identifier && match(':')) {
            lex();
            if (Object.prototype.hasOwnProperty.call(state$451.labelSet, expr$309.name)) {
                throwError({}, Messages$442.Redeclaration, 'Label', expr$309.name);
            }
            state$451.labelSet[expr$309.name] = true;
            labeledBody$310 = parseStatement();
            delete state$451.labelSet[expr$309.name];
            return {
                type: Syntax$440.LabeledStatement,
                label: expr$309,
                body: labeledBody$310
            };
        }
        consumeSemicolon();
        return {
            type: Syntax$440.ExpressionStatement,
            expression: expr$309
        };
    }
    function parseFunctionSourceElements() {
        var sourceElement$312, sourceElements$313 = [], token$314, directive$315, firstRestricted$316, oldLabelSet$317, oldInIteration$318, oldInSwitch$319, oldInFunctionBody$320;
        expect('{');
        while (index$446 < length$449) {
            token$314 = lookahead().token;
            if (token$314.type !== Token$438.StringLiteral) {
                break;
            }
            sourceElement$312 = parseSourceElement();
            sourceElements$313.push(sourceElement$312);
            if (sourceElement$312.expression.type !== Syntax$440.Literal) {
                break;
            }
            directive$315 = sliceSource(token$314.range[0] + 1, token$314.range[1] - 1);
            if (directive$315 === 'use strict') {
                strict$445 = true;
                if (firstRestricted$316) {
                    throwError(firstRestricted$316, Messages$442.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$316 && token$314.octal) {
                    firstRestricted$316 = token$314;
                }
            }
        }
        oldLabelSet$317 = state$451.labelSet;
        oldInIteration$318 = state$451.inIteration;
        oldInSwitch$319 = state$451.inSwitch;
        oldInFunctionBody$320 = state$451.inFunctionBody;
        state$451.labelSet = {};
        state$451.inIteration = false;
        state$451.inSwitch = false;
        state$451.inFunctionBody = true;
        while (index$446 < length$449) {
            if (match('}')) {
                break;
            }
            sourceElement$312 = parseSourceElement();
            if (typeof sourceElement$312 === 'undefined') {
                break;
            }
            sourceElements$313.push(sourceElement$312);
        }
        expect('}');
        state$451.labelSet = oldLabelSet$317;
        state$451.inIteration = oldInIteration$318;
        state$451.inSwitch = oldInSwitch$319;
        state$451.inFunctionBody = oldInFunctionBody$320;
        return {
            type: Syntax$440.BlockStatement,
            body: sourceElements$313
        };
    }
    function parseFunctionDeclaration() {
        var id$322, param$323, params$324 = [], body$325, token$326, firstRestricted$327, message$328, previousStrict$329, paramSet$330;
        expectKeyword('function');
        token$326 = lookahead().token;
        id$322 = parseVariableIdentifier();
        if (strict$445) {
            if (isRestrictedWord(token$326.value)) {
                throwError(token$326, Messages$442.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord(token$326.value)) {
                firstRestricted$327 = token$326;
                message$328 = Messages$442.StrictFunctionName;
            } else if (isStrictModeReservedWord(token$326.value)) {
                firstRestricted$327 = token$326;
                message$328 = Messages$442.StrictReservedWord;
            }
        }
        expect('(');
        if (!match(')')) {
            paramSet$330 = {};
            while (index$446 < length$449) {
                token$326 = lookahead().token;
                param$323 = parseVariableIdentifier();
                if (strict$445) {
                    if (isRestrictedWord(token$326.value)) {
                        throwError(token$326, Messages$442.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$330, token$326.value)) {
                        throwError(token$326, Messages$442.StrictParamDupe);
                    }
                } else if (!firstRestricted$327) {
                    if (isRestrictedWord(token$326.value)) {
                        firstRestricted$327 = token$326;
                        message$328 = Messages$442.StrictParamName;
                    } else if (isStrictModeReservedWord(token$326.value)) {
                        firstRestricted$327 = token$326;
                        message$328 = Messages$442.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$330, token$326.value)) {
                        firstRestricted$327 = token$326;
                        message$328 = Messages$442.StrictParamDupe;
                    }
                }
                params$324.push(param$323);
                paramSet$330[param$323.name] = true;
                if (match(')')) {
                    break;
                }
                expect(',');
            }
        }
        expect(')');
        previousStrict$329 = strict$445;
        body$325 = parseFunctionSourceElements();
        if (strict$445 && firstRestricted$327) {
            throwError(firstRestricted$327, message$328);
        }
        strict$445 = previousStrict$329;
        return {
            type: Syntax$440.FunctionDeclaration,
            id: id$322,
            params: params$324,
            body: body$325
        };
    }
    function parseFunctionExpression() {
        var token$332, id$333 = null, firstRestricted$334, message$335, param$336, params$337 = [], body$338, previousStrict$339, paramSet$340;
        expectKeyword('function');
        if (!match('(')) {
            token$332 = lookahead().token;
            id$333 = parseVariableIdentifier();
            if (strict$445) {
                if (isRestrictedWord(token$332.value)) {
                    throwError(token$332, Messages$442.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord(token$332.value)) {
                    firstRestricted$334 = token$332;
                    message$335 = Messages$442.StrictFunctionName;
                } else if (isStrictModeReservedWord(token$332.value)) {
                    firstRestricted$334 = token$332;
                    message$335 = Messages$442.StrictReservedWord;
                }
            }
        }
        expect('(');
        if (!match(')')) {
            paramSet$340 = {};
            while (index$446 < length$449) {
                token$332 = lookahead().token;
                param$336 = parseVariableIdentifier();
                if (strict$445) {
                    if (isRestrictedWord(token$332.value)) {
                        throwError(token$332, Messages$442.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$340, token$332.value)) {
                        throwError(token$332, Messages$442.StrictParamDupe);
                    }
                } else if (!firstRestricted$334) {
                    if (isRestrictedWord(token$332.value)) {
                        firstRestricted$334 = token$332;
                        message$335 = Messages$442.StrictParamName;
                    } else if (isStrictModeReservedWord(token$332.value)) {
                        firstRestricted$334 = token$332;
                        message$335 = Messages$442.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$340, token$332.value)) {
                        firstRestricted$334 = token$332;
                        message$335 = Messages$442.StrictParamDupe;
                    }
                }
                params$337.push(param$336);
                paramSet$340[param$336.name] = true;
                if (match(')')) {
                    break;
                }
                expect(',');
            }
        }
        expect(')');
        previousStrict$339 = strict$445;
        body$338 = parseFunctionSourceElements();
        if (strict$445 && firstRestricted$334) {
            throwError(firstRestricted$334, message$335);
        }
        strict$445 = previousStrict$339;
        return {
            type: Syntax$440.FunctionExpression,
            id: id$333,
            params: params$337,
            body: body$338
        };
    }
    function parseSourceElement() {
        var token$342 = lookahead().token;
        if (token$342.type === Token$438.Keyword) {
            switch (token$342.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration(token$342.value);
            case 'function':
                return parseFunctionDeclaration();
            default:
                return parseStatement();
            }
        }
        if (token$342.type !== Token$438.EOF) {
            return parseStatement();
        }
    }
    function parseSourceElements() {
        var sourceElement$344, sourceElements$345 = [], token$346, directive$347, firstRestricted$348;
        while (index$446 < length$449) {
            token$346 = lookahead();
            if (token$346.type !== Token$438.StringLiteral) {
                break;
            }
            sourceElement$344 = parseSourceElement();
            sourceElements$345.push(sourceElement$344);
            if (sourceElement$344.expression.type !== Syntax$440.Literal) {
                break;
            }
            directive$347 = sliceSource(token$346.range[0] + 1, token$346.range[1] - 1);
            if (directive$347 === 'use strict') {
                strict$445 = true;
                if (firstRestricted$348) {
                    throwError(firstRestricted$348, Messages$442.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$348 && token$346.octal) {
                    firstRestricted$348 = token$346;
                }
            }
        }
        while (index$446 < length$449) {
            sourceElement$344 = parseSourceElement();
            if (typeof sourceElement$344 === 'undefined') {
                break;
            }
            sourceElements$345.push(sourceElement$344);
        }
        return sourceElements$345;
    }
    function parseProgram() {
        var program$350;
        strict$445 = false;
        program$350 = {
            type: Syntax$440.Program,
            body: parseSourceElements()
        };
        return program$350;
    }
    function addComment(start$351, end$352, type$353, value$354) {
        assert(typeof start$351 === 'number', 'Comment must have valid position');
        if (extra$453.comments.length > 0) {
            if (extra$453.comments[extra$453.comments.length - 1].range[1] > start$351) {
                return;
            }
        }
        extra$453.comments.push({
            range: [
                start$351,
                end$352
            ],
            type: type$353,
            value: value$354
        });
    }
    function scanComment() {
        var comment$357, ch$358, start$359, blockComment$360, lineComment$361;
        comment$357 = '';
        blockComment$360 = false;
        lineComment$361 = false;
        while (index$446 < length$449) {
            ch$358 = source$444[index$446];
            if (lineComment$361) {
                ch$358 = nextChar();
                if (index$446 >= length$449) {
                    lineComment$361 = false;
                    comment$357 += ch$358;
                    addComment(start$359, index$446, 'Line', comment$357);
                } else if (isLineTerminator(ch$358)) {
                    lineComment$361 = false;
                    addComment(start$359, index$446, 'Line', comment$357);
                    if (ch$358 === '\r' && source$444[index$446] === '\n') {
                        ++index$446;
                    }
                    ++lineNumber$447;
                    lineStart$448 = index$446;
                    comment$357 = '';
                } else {
                    comment$357 += ch$358;
                }
            } else if (blockComment$360) {
                if (isLineTerminator(ch$358)) {
                    if (ch$358 === '\r' && source$444[index$446 + 1] === '\n') {
                        ++index$446;
                        comment$357 += '\r\n';
                    } else {
                        comment$357 += ch$358;
                    }
                    ++lineNumber$447;
                    ++index$446;
                    lineStart$448 = index$446;
                    if (index$446 >= length$449) {
                        throwError({}, Messages$442.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$358 = nextChar();
                    if (index$446 >= length$449) {
                        throwError({}, Messages$442.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$357 += ch$358;
                    if (ch$358 === '*') {
                        ch$358 = source$444[index$446];
                        if (ch$358 === '/') {
                            comment$357 = comment$357.substr(0, comment$357.length - 1);
                            blockComment$360 = false;
                            ++index$446;
                            addComment(start$359, index$446, 'Block', comment$357);
                            comment$357 = '';
                        }
                    }
                }
            } else if (ch$358 === '/') {
                ch$358 = source$444[index$446 + 1];
                if (ch$358 === '/') {
                    start$359 = index$446;
                    index$446 += 2;
                    lineComment$361 = true;
                } else if (ch$358 === '*') {
                    start$359 = index$446;
                    index$446 += 2;
                    blockComment$360 = true;
                    if (index$446 >= length$449) {
                        throwError({}, Messages$442.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace(ch$358)) {
                ++index$446;
            } else if (isLineTerminator(ch$358)) {
                ++index$446;
                if (ch$358 === '\r' && source$444[index$446] === '\n') {
                    ++index$446;
                }
                ++lineNumber$447;
                lineStart$448 = index$446;
            } else {
                break;
            }
        }
    }
    function collectToken() {
        var token$363 = extra$453.advance(), range$364, value$365;
        if (token$363.type !== Token$438.EOF) {
            range$364 = [
                token$363.range[0],
                token$363.range[1]
            ];
            value$365 = sliceSource(token$363.range[0], token$363.range[1]);
            extra$453.tokens.push({
                type: TokenName$439[token$363.type],
                value: value$365,
                lineNumber: lineNumber$447,
                lineStart: lineStart$448,
                range: range$364
            });
        }
        return token$363;
    }
    function collectRegex() {
        var pos$367, regex$368, token$369;
        skipComment();
        pos$367 = index$446;
        regex$368 = extra$453.scanRegExp();
        if (extra$453.tokens.length > 0) {
            token$369 = extra$453.tokens[extra$453.tokens.length - 1];
            if (token$369.range[0] === pos$367 && token$369.type === 'Punctuator') {
                if (token$369.value === '/' || token$369.value === '/=') {
                    extra$453.tokens.pop();
                }
            }
        }
        extra$453.tokens.push({
            type: 'RegularExpression',
            value: regex$368.literal,
            range: [
                pos$367,
                index$446
            ],
            lineStart: token$369.lineStart,
            lineNumber: token$369.lineNumber
        });
        return regex$368;
    }
    function createLiteral(token$370) {
        if (Array.isArray(token$370)) {
            return {
                type: Syntax$440.Literal,
                value: token$370
            };
        }
        return {
            type: Syntax$440.Literal,
            value: token$370.value,
            lineStart: token$370.lineStart,
            lineNumber: token$370.lineNumber
        };
    }
    function createRawLiteral(token$372) {
        return {
            type: Syntax$440.Literal,
            value: token$372.value,
            raw: sliceSource(token$372.range[0], token$372.range[1]),
            lineStart: token$372.lineStart,
            lineNumber: token$372.lineNumber
        };
    }
    function wrapTrackingFunction(range$374, loc$375) {
        return function (parseFunction$377) {
            function isBinary(node$379) {
                return node$379.type === Syntax$440.LogicalExpression || node$379.type === Syntax$440.BinaryExpression;
            }
            function visit(node$381) {
                if (isBinary(node$381.left)) {
                    visit(node$381.left);
                }
                if (isBinary(node$381.right)) {
                    visit(node$381.right);
                }
                if (range$374 && typeof node$381.range === 'undefined') {
                    node$381.range = [
                        node$381.left.range[0],
                        node$381.right.range[1]
                    ];
                }
                if (loc$375 && typeof node$381.loc === 'undefined') {
                    node$381.loc = {
                        start: node$381.left.loc.start,
                        end: node$381.right.loc.end
                    };
                }
            }
            return function () {
                var node$384, rangeInfo$385, locInfo$386;
                var curr$387 = tokenStream$452[index$446].token;
                rangeInfo$385 = [
                    curr$387.range[0],
                    0
                ];
                locInfo$386 = {start: {
                        line: curr$387.lineNumber,
                        column: curr$387.lineStart
                    }};
                node$384 = parseFunction$377.apply(null, arguments);
                if (typeof node$384 !== 'undefined') {
                    var last$388 = tokenStream$452[index$446].token;
                    if (range$374) {
                        rangeInfo$385[1] = last$388.range[1];
                        node$384.range = rangeInfo$385;
                    }
                    if (loc$375) {
                        locInfo$386.end = {
                            line: last$388.lineNumber,
                            column: last$388.lineStart
                        };
                        node$384.loc = locInfo$386;
                    }
                    if (isBinary(node$384)) {
                        visit(node$384);
                    }
                    if (node$384.type === Syntax$440.MemberExpression) {
                        if (typeof node$384.object.range !== 'undefined') {
                            node$384.range[0] = node$384.object.range[0];
                        }
                        if (typeof node$384.object.loc !== 'undefined') {
                            node$384.loc.start = node$384.object.loc.start;
                        }
                    }
                    if (node$384.type === Syntax$440.CallExpression) {
                        if (typeof node$384.callee.range !== 'undefined') {
                            node$384.range[0] = node$384.callee.range[0];
                        }
                        if (typeof node$384.callee.loc !== 'undefined') {
                            node$384.loc.start = node$384.callee.loc.start;
                        }
                    }
                    return node$384;
                }
            };
        };
    }
    function patch() {
        var wrapTracking$390;
        if (extra$453.comments) {
            extra$453.skipComment = skipComment;
            skipComment = scanComment;
        }
        if (extra$453.raw) {
            extra$453.createLiteral = createLiteral;
            createLiteral = createRawLiteral;
        }
        if (extra$453.range || extra$453.loc) {
            wrapTracking$390 = wrapTrackingFunction(extra$453.range, extra$453.loc);
            extra$453.parseAdditiveExpression = parseAdditiveExpression;
            extra$453.parseAssignmentExpression = parseAssignmentExpression;
            extra$453.parseBitwiseANDExpression = parseBitwiseANDExpression;
            extra$453.parseBitwiseORExpression = parseBitwiseORExpression;
            extra$453.parseBitwiseXORExpression = parseBitwiseXORExpression;
            extra$453.parseBlock = parseBlock;
            extra$453.parseFunctionSourceElements = parseFunctionSourceElements;
            extra$453.parseCallMember = parseCallMember;
            extra$453.parseCatchClause = parseCatchClause;
            extra$453.parseComputedMember = parseComputedMember;
            extra$453.parseConditionalExpression = parseConditionalExpression;
            extra$453.parseConstLetDeclaration = parseConstLetDeclaration;
            extra$453.parseEqualityExpression = parseEqualityExpression;
            extra$453.parseExpression = parseExpression;
            extra$453.parseForVariableDeclaration = parseForVariableDeclaration;
            extra$453.parseFunctionDeclaration = parseFunctionDeclaration;
            extra$453.parseFunctionExpression = parseFunctionExpression;
            extra$453.parseLogicalANDExpression = parseLogicalANDExpression;
            extra$453.parseLogicalORExpression = parseLogicalORExpression;
            extra$453.parseMultiplicativeExpression = parseMultiplicativeExpression;
            extra$453.parseNewExpression = parseNewExpression;
            extra$453.parseNonComputedMember = parseNonComputedMember;
            extra$453.parseNonComputedProperty = parseNonComputedProperty;
            extra$453.parseObjectProperty = parseObjectProperty;
            extra$453.parseObjectPropertyKey = parseObjectPropertyKey;
            extra$453.parsePostfixExpression = parsePostfixExpression;
            extra$453.parsePrimaryExpression = parsePrimaryExpression;
            extra$453.parseProgram = parseProgram;
            extra$453.parsePropertyFunction = parsePropertyFunction;
            extra$453.parseRelationalExpression = parseRelationalExpression;
            extra$453.parseStatement = parseStatement;
            extra$453.parseShiftExpression = parseShiftExpression;
            extra$453.parseSwitchCase = parseSwitchCase;
            extra$453.parseUnaryExpression = parseUnaryExpression;
            extra$453.parseVariableDeclaration = parseVariableDeclaration;
            extra$453.parseVariableIdentifier = parseVariableIdentifier;
            parseAdditiveExpression = wrapTracking$390(extra$453.parseAdditiveExpression);
            parseAssignmentExpression = wrapTracking$390(extra$453.parseAssignmentExpression);
            parseBitwiseANDExpression = wrapTracking$390(extra$453.parseBitwiseANDExpression);
            parseBitwiseORExpression = wrapTracking$390(extra$453.parseBitwiseORExpression);
            parseBitwiseXORExpression = wrapTracking$390(extra$453.parseBitwiseXORExpression);
            parseBlock = wrapTracking$390(extra$453.parseBlock);
            parseFunctionSourceElements = wrapTracking$390(extra$453.parseFunctionSourceElements);
            parseCallMember = wrapTracking$390(extra$453.parseCallMember);
            parseCatchClause = wrapTracking$390(extra$453.parseCatchClause);
            parseComputedMember = wrapTracking$390(extra$453.parseComputedMember);
            parseConditionalExpression = wrapTracking$390(extra$453.parseConditionalExpression);
            parseConstLetDeclaration = wrapTracking$390(extra$453.parseConstLetDeclaration);
            parseEqualityExpression = wrapTracking$390(extra$453.parseEqualityExpression);
            parseExpression = wrapTracking$390(extra$453.parseExpression);
            parseForVariableDeclaration = wrapTracking$390(extra$453.parseForVariableDeclaration);
            parseFunctionDeclaration = wrapTracking$390(extra$453.parseFunctionDeclaration);
            parseFunctionExpression = wrapTracking$390(extra$453.parseFunctionExpression);
            parseLogicalANDExpression = wrapTracking$390(extra$453.parseLogicalANDExpression);
            parseLogicalORExpression = wrapTracking$390(extra$453.parseLogicalORExpression);
            parseMultiplicativeExpression = wrapTracking$390(extra$453.parseMultiplicativeExpression);
            parseNewExpression = wrapTracking$390(extra$453.parseNewExpression);
            parseNonComputedMember = wrapTracking$390(extra$453.parseNonComputedMember);
            parseNonComputedProperty = wrapTracking$390(extra$453.parseNonComputedProperty);
            parseObjectProperty = wrapTracking$390(extra$453.parseObjectProperty);
            parseObjectPropertyKey = wrapTracking$390(extra$453.parseObjectPropertyKey);
            parsePostfixExpression = wrapTracking$390(extra$453.parsePostfixExpression);
            parsePrimaryExpression = wrapTracking$390(extra$453.parsePrimaryExpression);
            parseProgram = wrapTracking$390(extra$453.parseProgram);
            parsePropertyFunction = wrapTracking$390(extra$453.parsePropertyFunction);
            parseRelationalExpression = wrapTracking$390(extra$453.parseRelationalExpression);
            parseStatement = wrapTracking$390(extra$453.parseStatement);
            parseShiftExpression = wrapTracking$390(extra$453.parseShiftExpression);
            parseSwitchCase = wrapTracking$390(extra$453.parseSwitchCase);
            parseUnaryExpression = wrapTracking$390(extra$453.parseUnaryExpression);
            parseVariableDeclaration = wrapTracking$390(extra$453.parseVariableDeclaration);
            parseVariableIdentifier = wrapTracking$390(extra$453.parseVariableIdentifier);
        }
        if (typeof extra$453.tokens !== 'undefined') {
            extra$453.advance = advance;
            extra$453.scanRegExp = scanRegExp;
            advance = collectToken;
            scanRegExp = collectRegex;
        }
    }
    function unpatch() {
        if (typeof extra$453.skipComment === 'function') {
            skipComment = extra$453.skipComment;
        }
        if (extra$453.raw) {
            createLiteral = extra$453.createLiteral;
        }
        if (extra$453.range || extra$453.loc) {
            parseAdditiveExpression = extra$453.parseAdditiveExpression;
            parseAssignmentExpression = extra$453.parseAssignmentExpression;
            parseBitwiseANDExpression = extra$453.parseBitwiseANDExpression;
            parseBitwiseORExpression = extra$453.parseBitwiseORExpression;
            parseBitwiseXORExpression = extra$453.parseBitwiseXORExpression;
            parseBlock = extra$453.parseBlock;
            parseFunctionSourceElements = extra$453.parseFunctionSourceElements;
            parseCallMember = extra$453.parseCallMember;
            parseCatchClause = extra$453.parseCatchClause;
            parseComputedMember = extra$453.parseComputedMember;
            parseConditionalExpression = extra$453.parseConditionalExpression;
            parseConstLetDeclaration = extra$453.parseConstLetDeclaration;
            parseEqualityExpression = extra$453.parseEqualityExpression;
            parseExpression = extra$453.parseExpression;
            parseForVariableDeclaration = extra$453.parseForVariableDeclaration;
            parseFunctionDeclaration = extra$453.parseFunctionDeclaration;
            parseFunctionExpression = extra$453.parseFunctionExpression;
            parseLogicalANDExpression = extra$453.parseLogicalANDExpression;
            parseLogicalORExpression = extra$453.parseLogicalORExpression;
            parseMultiplicativeExpression = extra$453.parseMultiplicativeExpression;
            parseNewExpression = extra$453.parseNewExpression;
            parseNonComputedMember = extra$453.parseNonComputedMember;
            parseNonComputedProperty = extra$453.parseNonComputedProperty;
            parseObjectProperty = extra$453.parseObjectProperty;
            parseObjectPropertyKey = extra$453.parseObjectPropertyKey;
            parsePrimaryExpression = extra$453.parsePrimaryExpression;
            parsePostfixExpression = extra$453.parsePostfixExpression;
            parseProgram = extra$453.parseProgram;
            parsePropertyFunction = extra$453.parsePropertyFunction;
            parseRelationalExpression = extra$453.parseRelationalExpression;
            parseStatement = extra$453.parseStatement;
            parseShiftExpression = extra$453.parseShiftExpression;
            parseSwitchCase = extra$453.parseSwitchCase;
            parseUnaryExpression = extra$453.parseUnaryExpression;
            parseVariableDeclaration = extra$453.parseVariableDeclaration;
            parseVariableIdentifier = extra$453.parseVariableIdentifier;
        }
        if (typeof extra$453.scanRegExp === 'function') {
            advance = extra$453.advance;
            scanRegExp = extra$453.scanRegExp;
        }
    }
    function stringToArray(str$392) {
        var length$394 = str$392.length, result$395 = [], i$396;
        for (i$396 = 0; i$396 < length$394; ++i$396) {
            result$395[i$396] = str$392.charAt(i$396);
        }
        return result$395;
    }
    function readLoop(toks$397, inExprDelim$398) {
        var delimiters$403 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$404 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$405 = toks$397.length - 1;
        var fnExprTokens$406 = [
                '(',
                '{',
                '[',
                'in',
                'typeof',
                'instanceof',
                'new',
                'return',
                'case',
                'delete',
                'throw',
                'void',
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
                ',',
                '+',
                '-',
                '*',
                '/',
                '%',
                '++',
                '--',
                '<<',
                '>>',
                '>>>',
                '&',
                '|',
                '^',
                '!',
                '~',
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
                '!=='
            ];
        function back(n$400) {
            var idx$402 = toks$397.length - n$400 > 0 ? toks$397.length - n$400 : 0;
            return toks$397[idx$402];
        }
        skipComment();
        if (isIn(getChar(), delimiters$403)) {
            return readDelim();
        }
        if (getChar() === '/') {
            var prev$407 = back(1);
            if (prev$407) {
                if (prev$407.value === '()') {
                    if (isIn(back(2).value, parenIdents$404)) {
                        return scanRegExp();
                    }
                    return advance();
                }
                if (prev$407.value === '{}') {
                    if (back(4).value === 'function') {
                        if (isIn(back(5).value, fnExprTokens$406)) {
                            return advance();
                        }
                        if (toks$397.length - 5 <= 0 && inExprDelim$398) {
                            return advance();
                        }
                    }
                    if (back(3).value === 'function') {
                        if (isIn(back(4).value, fnExprTokens$406)) {
                            return advance();
                        }
                        if (toks$397.length - 4 <= 0 && inExprDelim$398) {
                            return advance();
                        }
                    }
                    return scanRegExp();
                }
                if (prev$407.type === Token$438.Punctuator) {
                    return scanRegExp();
                }
                if (isKeyword(toks$397[toks$397.length - 1].value)) {
                    return scanRegExp();
                }
                return advance();
            }
            return scanRegExp();
        }
        return advance();
    }
    function readDelim() {
        var startDelim$409 = advance(), matchDelim$410 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$411 = [];
        var delimiters$412 = [
                '(',
                '{',
                '['
            ];
        var token$413 = startDelim$409;
        assert(delimiters$412.indexOf(startDelim$409.value) !== -1, 'Need to begin at the delimiter');
        var startLineNumber$414 = token$413.lineNumber;
        var startLineStart$415 = token$413.lineStart;
        var startRange$416 = token$413.range;
        while (index$446 <= length$449) {
            token$413 = readLoop(inner$411, startDelim$409.value === '(' || startDelim$409.value === '[');
            if (token$413.type === Token$438.Punctuator && token$413.value === matchDelim$410[startDelim$409.value]) {
                break;
            } else if (token$413.type === Token$438.EOF) {
                throwError({}, Messages$442.UnexpectedEOS);
            } else {
                inner$411.push(token$413);
            }
        }
        if (index$446 >= length$449 && matchDelim$410[startDelim$409.value] !== source$444[length$449 - 1]) {
            throwError({}, Messages$442.UnexpectedEOS);
        }
        var endLineNumber$417 = token$413.lineNumber;
        var endLineStart$418 = token$413.lineStart;
        var endRange$419 = token$413.range;
        return {
            type: Token$438.Delimiter,
            value: startDelim$409.value + matchDelim$410[startDelim$409.value],
            inner: inner$411,
            startLineNumber: startLineNumber$414,
            startLineStart: startLineStart$415,
            startRange: startRange$416,
            endLineNumber: endLineNumber$417,
            endLineStart: endLineStart$418,
            endRange: endRange$419
        };
    }
    ;
    function read(code$420) {
        var token$422, tokenTree$423 = [];
        source$444 = code$420;
        index$446 = 0;
        lineNumber$447 = source$444.length > 0 ? 1 : 0;
        lineStart$448 = 0;
        length$449 = source$444.length;
        buffer$450 = null;
        state$451 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$446 < length$449) {
            tokenTree$423.push(readLoop(tokenTree$423));
        }
        var last$424 = tokenTree$423[tokenTree$423.length - 1];
        if (last$424 && last$424.type !== Token$438.EOF) {
            tokenTree$423.push({
                type: Token$438.EOF,
                value: '',
                lineNumber: last$424.lineNumber,
                lineStart: last$424.lineStart,
                range: [
                    index$446,
                    index$446
                ]
            });
        }
        return expander$5.tokensToSyntax(tokenTree$423);
    }
    function parse(code$425, nodeType$426, options$427) {
        var program$432, toString$433;
        tokenStream$452 = code$425;
        nodeType$426 = nodeType$426 || 'base';
        index$446 = 0;
        length$449 = tokenStream$452.length;
        buffer$450 = null;
        state$451 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$453 = {};
        if (typeof options$427 !== 'undefined') {
            if (options$427.range || options$427.loc) {
                assert(false, 'Note range and loc is not currently implemented');
            }
            extra$453.range = typeof options$427.range === 'boolean' && options$427.range;
            extra$453.loc = typeof options$427.loc === 'boolean' && options$427.loc;
            extra$453.raw = typeof options$427.raw === 'boolean' && options$427.raw;
            if (typeof options$427.tokens === 'boolean' && options$427.tokens) {
                extra$453.tokens = [];
            }
            if (typeof options$427.comment === 'boolean' && options$427.comment) {
                extra$453.comments = [];
            }
            if (typeof options$427.tolerant === 'boolean' && options$427.tolerant) {
                extra$453.errors = [];
            }
            if (typeof options$427.noresolve === 'boolean' && options$427.noresolve) {
                extra$453.noresolve = options$427.noresolve;
            } else {
                extra$453.noresolve = false;
            }
        }
        patch();
        try {
            var classToParse$434 = {
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
                        state$451.inFunctionBody = true;
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
            if (classToParse$434[nodeType$426]) {
                program$432 = classToParse$434[nodeType$426]();
            } else {
                assert(false, 'unmatched parse class' + nodeType$426);
            }
            if (typeof extra$453.comments !== 'undefined') {
                program$432.comments = extra$453.comments;
            }
            if (typeof extra$453.tokens !== 'undefined') {
                program$432.tokens = tokenStream$452.slice(0, index$446);
            }
            if (typeof extra$453.errors !== 'undefined') {
                program$432.errors = extra$453.errors;
            }
        } catch (e$430) {
            throw e$430;
        } finally {
            unpatch();
            extra$453 = {};
        }
        return program$432;
    }
    exports$4.parse = parse;
    exports$4.read = read;
    exports$4.Token = Token$438;
    exports$4.assert = assert;
    exports$4.Syntax = function () {
        var name$436, types$437 = {};
        if (typeof Object.create === 'function') {
            types$437 = Object.create(null);
        }
        for (name$436 in Syntax$440) {
            if (Syntax$440.hasOwnProperty(name$436)) {
                types$437[name$436] = Syntax$440[name$436];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$437);
        }
        return types$437;
    }();
}));