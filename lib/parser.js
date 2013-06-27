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
    var Token$432, TokenName$433, Syntax$434, PropertyKind$435, Messages$436, Regex$437, source$438, strict$439, index$440, lineNumber$441, lineStart$442, length$443, buffer$444, state$445, tokenStream$446, extra$447;
    Token$432 = {
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
    TokenName$433 = {};
    TokenName$433[Token$432.BooleanLiteral] = 'Boolean';
    TokenName$433[Token$432.EOF] = '<end>';
    TokenName$433[Token$432.Identifier] = 'Identifier';
    TokenName$433[Token$432.Keyword] = 'Keyword';
    TokenName$433[Token$432.NullLiteral] = 'Null';
    TokenName$433[Token$432.NumericLiteral] = 'Numeric';
    TokenName$433[Token$432.Punctuator] = 'Punctuator';
    TokenName$433[Token$432.StringLiteral] = 'String';
    TokenName$433[Token$432.Delimiter] = 'Delimiter';
    Syntax$434 = {
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
    PropertyKind$435 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    Messages$436 = {
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
    Regex$437 = {
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
        return source$438.slice(from$13, to$14);
    }
    if (typeof 'esprima'[0] === 'undefined') {
        sliceSource = function sliceArraySource(from$16, to$17) {
            return source$438.slice(from$16, to$17).join('');
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
        return ch$29 === '$' || ch$29 === '_' || ch$29 === '\\' || ch$29 >= 'a' && ch$29 <= 'z' || ch$29 >= 'A' && ch$29 <= 'Z' || ch$29.charCodeAt(0) >= 128 && Regex$437.NonAsciiIdentifierStart.test(ch$29);
    }
    function isIdentifierPart(ch$31) {
        return ch$31 === '$' || ch$31 === '_' || ch$31 === '\\' || ch$31 >= 'a' && ch$31 <= 'z' || ch$31 >= 'A' && ch$31 <= 'Z' || ch$31 >= '0' && ch$31 <= '9' || ch$31.charCodeAt(0) >= 128 && Regex$437.NonAsciiIdentifierPart.test(ch$31);
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
        if (strict$439 && isStrictModeReservedWord(id$39)) {
            return true;
        }
        return isFutureReservedWord(id$39);
    }
    function nextChar() {
        return source$438[index$440++];
    }
    function getChar() {
        return source$438[index$440];
    }
    function skipComment() {
        var ch$45, blockComment$46, lineComment$47;
        blockComment$46 = false;
        lineComment$47 = false;
        while (index$440 < length$443) {
            ch$45 = source$438[index$440];
            if (lineComment$47) {
                ch$45 = nextChar();
                if (isLineTerminator(ch$45)) {
                    lineComment$47 = false;
                    if (ch$45 === '\r' && source$438[index$440] === '\n') {
                        ++index$440;
                    }
                    ++lineNumber$441;
                    lineStart$442 = index$440;
                }
            } else if (blockComment$46) {
                if (isLineTerminator(ch$45)) {
                    if (ch$45 === '\r' && source$438[index$440 + 1] === '\n') {
                        ++index$440;
                    }
                    ++lineNumber$441;
                    ++index$440;
                    lineStart$442 = index$440;
                    if (index$440 >= length$443) {
                        throwError({}, Messages$436.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$45 = nextChar();
                    if (index$440 >= length$443) {
                        throwError({}, Messages$436.UnexpectedToken, 'ILLEGAL');
                    }
                    if (ch$45 === '*') {
                        ch$45 = source$438[index$440];
                        if (ch$45 === '/') {
                            ++index$440;
                            blockComment$46 = false;
                        }
                    }
                }
            } else if (ch$45 === '/') {
                ch$45 = source$438[index$440 + 1];
                if (ch$45 === '/') {
                    index$440 += 2;
                    lineComment$47 = true;
                } else if (ch$45 === '*') {
                    index$440 += 2;
                    blockComment$46 = true;
                    if (index$440 >= length$443) {
                        throwError({}, Messages$436.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace(ch$45)) {
                ++index$440;
            } else if (isLineTerminator(ch$45)) {
                ++index$440;
                if (ch$45 === '\r' && source$438[index$440] === '\n') {
                    ++index$440;
                }
                ++lineNumber$441;
                lineStart$442 = index$440;
            } else {
                break;
            }
        }
    }
    function scanHexEscape(prefix$48) {
        var i$50, len$51, ch$52, code$53 = 0;
        len$51 = prefix$48 === 'u' ? 4 : 2;
        for (i$50 = 0; i$50 < len$51; ++i$50) {
            if (index$440 < length$443 && isHexDigit(source$438[index$440])) {
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
        ch$55 = source$438[index$440];
        if (!isIdentifierStart(ch$55)) {
            return;
        }
        start$56 = index$440;
        if (ch$55 === '\\') {
            ++index$440;
            if (source$438[index$440] !== 'u') {
                return;
            }
            ++index$440;
            restore$58 = index$440;
            ch$55 = scanHexEscape('u');
            if (ch$55) {
                if (ch$55 === '\\' || !isIdentifierStart(ch$55)) {
                    return;
                }
                id$57 = ch$55;
            } else {
                index$440 = restore$58;
                id$57 = 'u';
            }
        } else {
            id$57 = nextChar();
        }
        while (index$440 < length$443) {
            ch$55 = source$438[index$440];
            if (!isIdentifierPart(ch$55)) {
                break;
            }
            if (ch$55 === '\\') {
                ++index$440;
                if (source$438[index$440] !== 'u') {
                    return;
                }
                ++index$440;
                restore$58 = index$440;
                ch$55 = scanHexEscape('u');
                if (ch$55) {
                    if (ch$55 === '\\' || !isIdentifierPart(ch$55)) {
                        return;
                    }
                    id$57 += ch$55;
                } else {
                    index$440 = restore$58;
                    id$57 += 'u';
                }
            } else {
                id$57 += nextChar();
            }
        }
        if (id$57.length === 1) {
            return {
                type: Token$432.Identifier,
                value: id$57,
                lineNumber: lineNumber$441,
                lineStart: lineStart$442,
                range: [
                    start$56,
                    index$440
                ]
            };
        }
        if (isKeyword(id$57)) {
            return {
                type: Token$432.Keyword,
                value: id$57,
                lineNumber: lineNumber$441,
                lineStart: lineStart$442,
                range: [
                    start$56,
                    index$440
                ]
            };
        }
        if (id$57 === 'null') {
            return {
                type: Token$432.NullLiteral,
                value: id$57,
                lineNumber: lineNumber$441,
                lineStart: lineStart$442,
                range: [
                    start$56,
                    index$440
                ]
            };
        }
        if (id$57 === 'true' || id$57 === 'false') {
            return {
                type: Token$432.BooleanLiteral,
                value: id$57,
                lineNumber: lineNumber$441,
                lineStart: lineStart$442,
                range: [
                    start$56,
                    index$440
                ]
            };
        }
        return {
            type: Token$432.Identifier,
            value: id$57,
            lineNumber: lineNumber$441,
            lineStart: lineStart$442,
            range: [
                start$56,
                index$440
            ]
        };
    }
    function scanPunctuator() {
        var start$60 = index$440, ch1$61 = source$438[index$440], ch2, ch3, ch4;
        if (ch1$61 === ';' || ch1$61 === '{' || ch1$61 === '}') {
            ++index$440;
            return {
                type: Token$432.Punctuator,
                value: ch1$61,
                lineNumber: lineNumber$441,
                lineStart: lineStart$442,
                range: [
                    start$60,
                    index$440
                ]
            };
        }
        if (ch1$61 === ',' || ch1$61 === '(' || ch1$61 === ')') {
            ++index$440;
            return {
                type: Token$432.Punctuator,
                value: ch1$61,
                lineNumber: lineNumber$441,
                lineStart: lineStart$442,
                range: [
                    start$60,
                    index$440
                ]
            };
        }
        if (ch1$61 === '#') {
            ++index$440;
            return {
                type: Token$432.Punctuator,
                value: ch1$61,
                lineNumber: lineNumber$441,
                lineStart: lineStart$442,
                range: [
                    start$60,
                    index$440
                ]
            };
        }
        ch2 = source$438[index$440 + 1];
        if (ch1$61 === '.' && !isDecimalDigit(ch2)) {
            if (source$438[index$440 + 1] === '.' && source$438[index$440 + 2] === '.') {
                nextChar();
                nextChar();
                nextChar();
                return {
                    type: Token$432.Punctuator,
                    value: '...',
                    lineNumber: lineNumber$441,
                    lineStart: lineStart$442,
                    range: [
                        start$60,
                        index$440
                    ]
                };
            } else {
                return {
                    type: Token$432.Punctuator,
                    value: nextChar(),
                    lineNumber: lineNumber$441,
                    lineStart: lineStart$442,
                    range: [
                        start$60,
                        index$440
                    ]
                };
            }
        }
        ch3 = source$438[index$440 + 2];
        ch4 = source$438[index$440 + 3];
        if (ch1$61 === '>' && ch2 === '>' && ch3 === '>') {
            if (ch4 === '=') {
                index$440 += 4;
                return {
                    type: Token$432.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$441,
                    lineStart: lineStart$442,
                    range: [
                        start$60,
                        index$440
                    ]
                };
            }
        }
        if (ch1$61 === '=' && ch2 === '=' && ch3 === '=') {
            index$440 += 3;
            return {
                type: Token$432.Punctuator,
                value: '===',
                lineNumber: lineNumber$441,
                lineStart: lineStart$442,
                range: [
                    start$60,
                    index$440
                ]
            };
        }
        if (ch1$61 === '!' && ch2 === '=' && ch3 === '=') {
            index$440 += 3;
            return {
                type: Token$432.Punctuator,
                value: '!==',
                lineNumber: lineNumber$441,
                lineStart: lineStart$442,
                range: [
                    start$60,
                    index$440
                ]
            };
        }
        if (ch1$61 === '>' && ch2 === '>' && ch3 === '>') {
            index$440 += 3;
            return {
                type: Token$432.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$441,
                lineStart: lineStart$442,
                range: [
                    start$60,
                    index$440
                ]
            };
        }
        if (ch1$61 === '<' && ch2 === '<' && ch3 === '=') {
            index$440 += 3;
            return {
                type: Token$432.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$441,
                lineStart: lineStart$442,
                range: [
                    start$60,
                    index$440
                ]
            };
        }
        if (ch1$61 === '>' && ch2 === '>' && ch3 === '=') {
            index$440 += 3;
            return {
                type: Token$432.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$441,
                lineStart: lineStart$442,
                range: [
                    start$60,
                    index$440
                ]
            };
        }
        if (ch2 === '=') {
            if ('<>=!+-*%&|^/'.indexOf(ch1$61) >= 0) {
                index$440 += 2;
                return {
                    type: Token$432.Punctuator,
                    value: ch1$61 + ch2,
                    lineNumber: lineNumber$441,
                    lineStart: lineStart$442,
                    range: [
                        start$60,
                        index$440
                    ]
                };
            }
        }
        if (ch1$61 === ch2 && '+-<>&|'.indexOf(ch1$61) >= 0) {
            if ('+-<>&|'.indexOf(ch2) >= 0) {
                index$440 += 2;
                return {
                    type: Token$432.Punctuator,
                    value: ch1$61 + ch2,
                    lineNumber: lineNumber$441,
                    lineStart: lineStart$442,
                    range: [
                        start$60,
                        index$440
                    ]
                };
            }
        }
        if ('[]<>+-*%&|^!~?:=/'.indexOf(ch1$61) >= 0) {
            return {
                type: Token$432.Punctuator,
                value: nextChar(),
                lineNumber: lineNumber$441,
                lineStart: lineStart$442,
                range: [
                    start$60,
                    index$440
                ]
            };
        }
    }
    function scanNumericLiteral() {
        var number$63, start$64, ch$65;
        ch$65 = source$438[index$440];
        assert(isDecimalDigit(ch$65) || ch$65 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$64 = index$440;
        number$63 = '';
        if (ch$65 !== '.') {
            number$63 = nextChar();
            ch$65 = source$438[index$440];
            if (number$63 === '0') {
                if (ch$65 === 'x' || ch$65 === 'X') {
                    number$63 += nextChar();
                    while (index$440 < length$443) {
                        ch$65 = source$438[index$440];
                        if (!isHexDigit(ch$65)) {
                            break;
                        }
                        number$63 += nextChar();
                    }
                    if (number$63.length <= 2) {
                        throwError({}, Messages$436.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$440 < length$443) {
                        ch$65 = source$438[index$440];
                        if (isIdentifierStart(ch$65)) {
                            throwError({}, Messages$436.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$432.NumericLiteral,
                        value: parseInt(number$63, 16),
                        lineNumber: lineNumber$441,
                        lineStart: lineStart$442,
                        range: [
                            start$64,
                            index$440
                        ]
                    };
                } else if (isOctalDigit(ch$65)) {
                    number$63 += nextChar();
                    while (index$440 < length$443) {
                        ch$65 = source$438[index$440];
                        if (!isOctalDigit(ch$65)) {
                            break;
                        }
                        number$63 += nextChar();
                    }
                    if (index$440 < length$443) {
                        ch$65 = source$438[index$440];
                        if (isIdentifierStart(ch$65) || isDecimalDigit(ch$65)) {
                            throwError({}, Messages$436.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$432.NumericLiteral,
                        value: parseInt(number$63, 8),
                        octal: true,
                        lineNumber: lineNumber$441,
                        lineStart: lineStart$442,
                        range: [
                            start$64,
                            index$440
                        ]
                    };
                }
                if (isDecimalDigit(ch$65)) {
                    throwError({}, Messages$436.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (index$440 < length$443) {
                ch$65 = source$438[index$440];
                if (!isDecimalDigit(ch$65)) {
                    break;
                }
                number$63 += nextChar();
            }
        }
        if (ch$65 === '.') {
            number$63 += nextChar();
            while (index$440 < length$443) {
                ch$65 = source$438[index$440];
                if (!isDecimalDigit(ch$65)) {
                    break;
                }
                number$63 += nextChar();
            }
        }
        if (ch$65 === 'e' || ch$65 === 'E') {
            number$63 += nextChar();
            ch$65 = source$438[index$440];
            if (ch$65 === '+' || ch$65 === '-') {
                number$63 += nextChar();
            }
            ch$65 = source$438[index$440];
            if (isDecimalDigit(ch$65)) {
                number$63 += nextChar();
                while (index$440 < length$443) {
                    ch$65 = source$438[index$440];
                    if (!isDecimalDigit(ch$65)) {
                        break;
                    }
                    number$63 += nextChar();
                }
            } else {
                ch$65 = 'character ' + ch$65;
                if (index$440 >= length$443) {
                    ch$65 = '<end>';
                }
                throwError({}, Messages$436.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (index$440 < length$443) {
            ch$65 = source$438[index$440];
            if (isIdentifierStart(ch$65)) {
                throwError({}, Messages$436.UnexpectedToken, 'ILLEGAL');
            }
        }
        return {
            type: Token$432.NumericLiteral,
            value: parseFloat(number$63),
            lineNumber: lineNumber$441,
            lineStart: lineStart$442,
            range: [
                start$64,
                index$440
            ]
        };
    }
    function scanStringLiteral() {
        var str$67 = '', quote$68, start$69, ch$70, code$71, unescaped$72, restore$73, octal$74 = false;
        quote$68 = source$438[index$440];
        assert(quote$68 === '\'' || quote$68 === '"', 'String literal must starts with a quote');
        start$69 = index$440;
        ++index$440;
        while (index$440 < length$443) {
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
                        restore$73 = index$440;
                        unescaped$72 = scanHexEscape(ch$70);
                        if (unescaped$72) {
                            str$67 += unescaped$72;
                        } else {
                            index$440 = restore$73;
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
                            if (index$440 < length$443 && isOctalDigit(source$438[index$440])) {
                                octal$74 = true;
                                code$71 = code$71 * 8 + '01234567'.indexOf(nextChar());
                                if ('0123'.indexOf(ch$70) >= 0 && index$440 < length$443 && isOctalDigit(source$438[index$440])) {
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
                    ++lineNumber$441;
                    if (ch$70 === '\r' && source$438[index$440] === '\n') {
                        ++index$440;
                    }
                }
            } else if (isLineTerminator(ch$70)) {
                break;
            } else {
                str$67 += ch$70;
            }
        }
        if (quote$68 !== '') {
            throwError({}, Messages$436.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$432.StringLiteral,
            value: str$67,
            octal: octal$74,
            lineNumber: lineNumber$441,
            lineStart: lineStart$442,
            range: [
                start$69,
                index$440
            ]
        };
    }
    function scanRegExp() {
        var str$76 = '', ch$77, start$78, pattern$79, flags$80, value$81, classMarker$82 = false, restore$83;
        buffer$444 = null;
        skipComment();
        start$78 = index$440;
        ch$77 = source$438[index$440];
        assert(ch$77 === '/', 'Regular expression literal must start with a slash');
        str$76 = nextChar();
        while (index$440 < length$443) {
            ch$77 = nextChar();
            str$76 += ch$77;
            if (classMarker$82) {
                if (ch$77 === ']') {
                    classMarker$82 = false;
                }
            } else {
                if (ch$77 === '\\') {
                    ch$77 = nextChar();
                    if (isLineTerminator(ch$77)) {
                        throwError({}, Messages$436.UnterminatedRegExp);
                    }
                    str$76 += ch$77;
                } else if (ch$77 === '/') {
                    break;
                } else if (ch$77 === '[') {
                    classMarker$82 = true;
                } else if (isLineTerminator(ch$77)) {
                    throwError({}, Messages$436.UnterminatedRegExp);
                }
            }
        }
        if (str$76.length === 1) {
            throwError({}, Messages$436.UnterminatedRegExp);
        }
        pattern$79 = str$76.substr(1, str$76.length - 2);
        flags$80 = '';
        while (index$440 < length$443) {
            ch$77 = source$438[index$440];
            if (!isIdentifierPart(ch$77)) {
                break;
            }
            ++index$440;
            if (ch$77 === '\\' && index$440 < length$443) {
                ch$77 = source$438[index$440];
                if (ch$77 === 'u') {
                    ++index$440;
                    restore$83 = index$440;
                    ch$77 = scanHexEscape('u');
                    if (ch$77) {
                        flags$80 += ch$77;
                        str$76 += '\\u';
                        for (; restore$83 < index$440; ++restore$83) {
                            str$76 += source$438[restore$83];
                        }
                    } else {
                        index$440 = restore$83;
                        flags$80 += 'u';
                        str$76 += '\\u';
                    }
                } else {
                    str$76 += '\\';
                }
            } else {
                flags$80 += ch$77;
                str$76 += ch$77;
            }
        }
        try {
            value$81 = new RegExp(pattern$79, flags$80);
        } catch (e) {
            throwError({}, Messages$436.InvalidRegExp);
        }
        return {
            type: Token$432.RegexLiteral,
            literal: str$76,
            value: value$81,
            lineNumber: lineNumber$441,
            lineStart: lineStart$442,
            range: [
                start$78,
                index$440
            ]
        };
    }
    function isIdentifierName(token$84) {
        return token$84.type === Token$432.Identifier || token$84.type === Token$432.Keyword || token$84.type === Token$432.BooleanLiteral || token$84.type === Token$432.NullLiteral;
    }
    function advance() {
        var ch$87, token$88;
        skipComment();
        if (index$440 >= length$443) {
            return {
                type: Token$432.EOF,
                lineNumber: lineNumber$441,
                lineStart: lineStart$442,
                range: [
                    index$440,
                    index$440
                ]
            };
        }
        ch$87 = source$438[index$440];
        token$88 = scanPunctuator();
        if (typeof token$88 !== 'undefined') {
            return token$88;
        }
        if (ch$87 === '\'' || ch$87 === '"') {
            return scanStringLiteral();
        }
        if (ch$87 === '.' || isDecimalDigit(ch$87)) {
            return scanNumericLiteral();
        }
        token$88 = scanIdentifier();
        if (typeof token$88 !== 'undefined') {
            return token$88;
        }
        throwError({}, Messages$436.UnexpectedToken, 'ILLEGAL');
    }
    function lex() {
        var token$90;
        if (buffer$444) {
            token$90 = buffer$444;
            buffer$444 = null;
            index$440++;
            return token$90;
        }
        buffer$444 = null;
        return tokenStream$446[index$440++];
    }
    function lookahead() {
        var pos$92, line$93, start$94;
        if (buffer$444 !== null) {
            return buffer$444;
        }
        buffer$444 = tokenStream$446[index$440];
        return buffer$444;
    }
    function peekLineTerminator() {
        var pos$96, line$97, start$98, found$99;
        found$99 = tokenStream$446[index$440 - 1].token.lineNumber !== tokenStream$446[index$440].token.lineNumber;
        return found$99;
    }
    function throwError(token$100, messageFormat$101) {
        var error$106, args$107 = Array.prototype.slice.call(arguments, 2), msg$108 = messageFormat$101.replace(/%(\d)/g, function (whole$103, index$104) {
                return args$107[index$104] || '';
            });
        if (typeof token$100.lineNumber === 'number') {
            error$106 = new Error('Line ' + token$100.lineNumber + ': ' + msg$108);
            error$106.lineNumber = token$100.lineNumber;
            if (token$100.range && token$100.range.length > 0) {
                error$106.index = token$100.range[0];
                error$106.column = token$100.range[0] - lineStart$442 + 1;
            }
        } else {
            error$106 = new Error('Line ' + lineNumber$441 + ': ' + msg$108);
            error$106.index = index$440;
            error$106.lineNumber = lineNumber$441;
            error$106.column = index$440 - lineStart$442 + 1;
        }
        throw error$106;
    }
    function throwErrorTolerant() {
        var error$110;
        try {
            throwError.apply(null, arguments);
        } catch (e) {
            if (extra$447.errors) {
                extra$447.errors.push(e);
            } else {
                throw e;
            }
        }
    }
    function throwUnexpected(token$111) {
        var s$113;
        if (token$111.type === Token$432.EOF) {
            throwError(token$111, Messages$436.UnexpectedEOS);
        }
        if (token$111.type === Token$432.NumericLiteral) {
            throwError(token$111, Messages$436.UnexpectedNumber);
        }
        if (token$111.type === Token$432.StringLiteral) {
            throwError(token$111, Messages$436.UnexpectedString);
        }
        if (token$111.type === Token$432.Identifier) {
            console.log(token$111);
            throwError(token$111, Messages$436.UnexpectedIdentifier);
        }
        if (token$111.type === Token$432.Keyword) {
            if (isFutureReservedWord(token$111.value)) {
                throwError(token$111, Messages$436.UnexpectedReserved);
            } else if (strict$439 && isStrictModeReservedWord(token$111.value)) {
                throwError(token$111, Messages$436.StrictReservedWord);
            }
            throwError(token$111, Messages$436.UnexpectedToken, token$111.value);
        }
        throwError(token$111, Messages$436.UnexpectedToken, token$111.value);
    }
    function expect(value$114) {
        var token$116 = lex().token;
        if (token$116.type !== Token$432.Punctuator || token$116.value !== value$114) {
            throwUnexpected(token$116);
        }
    }
    function expectKeyword(keyword$117) {
        var token$119 = lex().token;
        if (token$119.type !== Token$432.Keyword || token$119.value !== keyword$117) {
            throwUnexpected(token$119);
        }
    }
    function match(value$120) {
        var token$122 = lookahead().token;
        return token$122.type === Token$432.Punctuator && token$122.value === value$120;
    }
    function matchKeyword(keyword$123) {
        var token$125 = lookahead().token;
        return token$125.type === Token$432.Keyword && token$125.value === keyword$123;
    }
    function matchAssign() {
        var token$127 = lookahead().token, op$128 = token$127.value;
        if (token$127.type !== Token$432.Punctuator) {
            return false;
        }
        return op$128 === '=' || op$128 === '*=' || op$128 === '/=' || op$128 === '%=' || op$128 === '+=' || op$128 === '-=' || op$128 === '<<=' || op$128 === '>>=' || op$128 === '>>>=' || op$128 === '&=' || op$128 === '^=' || op$128 === '|=';
    }
    function consumeSemicolon() {
        var token$130, line$131;
        if (tokenStream$446[index$440].token.value === ';') {
            lex().token;
            return;
        }
        line$131 = tokenStream$446[index$440 - 1].token.lineNumber;
        token$130 = tokenStream$446[index$440].token;
        if (line$131 !== token$130.lineNumber) {
            return;
        }
        if (token$130.type !== Token$432.EOF && !match('}')) {
            throwUnexpected(token$130);
        }
        return;
    }
    function isLeftHandSide(expr$132) {
        return expr$132.type === Syntax$434.Identifier || expr$132.type === Syntax$434.MemberExpression;
    }
    function parseArrayInitialiser() {
        var elements$135 = [], undef$136;
        expect('[');
        while (!match(']')) {
            if (match(',')) {
                lex().token;
                elements$135.push(undef$136);
            } else {
                elements$135.push(parseAssignmentExpression());
                if (!match(']')) {
                    expect(',');
                }
            }
        }
        expect(']');
        return {
            type: Syntax$434.ArrayExpression,
            elements: elements$135
        };
    }
    function parsePropertyFunction(param$137, first$138) {
        var previousStrict$140, body$141;
        previousStrict$140 = strict$439;
        body$141 = parseFunctionSourceElements();
        if (first$138 && strict$439 && isRestrictedWord(param$137[0].name)) {
            throwError(first$138, Messages$436.StrictParamName);
        }
        strict$439 = previousStrict$140;
        return {
            type: Syntax$434.FunctionExpression,
            id: null,
            params: param$137,
            body: body$141
        };
    }
    function parseObjectPropertyKey() {
        var token$143 = lex().token;
        if (token$143.type === Token$432.StringLiteral || token$143.type === Token$432.NumericLiteral) {
            if (strict$439 && token$143.octal) {
                throwError(token$143, Messages$436.StrictOctalLiteral);
            }
            return createLiteral(token$143);
        }
        return {
            type: Syntax$434.Identifier,
            name: token$143.value
        };
    }
    function parseObjectProperty() {
        var token$145, key$146, id$147, param$148;
        token$145 = lookahead().token;
        if (token$145.type === Token$432.Identifier) {
            id$147 = parseObjectPropertyKey();
            if (token$145.value === 'get' && !match(':')) {
                key$146 = parseObjectPropertyKey();
                expect('(');
                expect(')');
                return {
                    type: Syntax$434.Property,
                    key: key$146,
                    value: parsePropertyFunction([]),
                    kind: 'get'
                };
            } else if (token$145.value === 'set' && !match(':')) {
                key$146 = parseObjectPropertyKey();
                expect('(');
                token$145 = lookahead().token;
                if (token$145.type !== Token$432.Identifier) {
                    throwUnexpected(lex().token);
                }
                param$148 = [parseVariableIdentifier()];
                expect(')');
                return {
                    type: Syntax$434.Property,
                    key: key$146,
                    value: parsePropertyFunction(param$148, token$145),
                    kind: 'set'
                };
            } else {
                expect(':');
                return {
                    type: Syntax$434.Property,
                    key: id$147,
                    value: parseAssignmentExpression(),
                    kind: 'init'
                };
            }
        } else if (token$145.type === Token$432.EOF || token$145.type === Token$432.Punctuator) {
            throwUnexpected(token$145);
        } else {
            key$146 = parseObjectPropertyKey();
            expect(':');
            return {
                type: Syntax$434.Property,
                key: key$146,
                value: parseAssignmentExpression(),
                kind: 'init'
            };
        }
    }
    function parseObjectInitialiser() {
        var token$150, properties$151 = [], property$152, name$153, kind$154, map$155 = {}, toString$156 = String;
        expect('{');
        while (!match('}')) {
            property$152 = parseObjectProperty();
            if (property$152.key.type === Syntax$434.Identifier) {
                name$153 = property$152.key.name;
            } else {
                name$153 = toString$156(property$152.key.value);
            }
            kind$154 = property$152.kind === 'init' ? PropertyKind$435.Data : property$152.kind === 'get' ? PropertyKind$435.Get : PropertyKind$435.Set;
            if (Object.prototype.hasOwnProperty.call(map$155, name$153)) {
                if (map$155[name$153] === PropertyKind$435.Data) {
                    if (strict$439 && kind$154 === PropertyKind$435.Data) {
                        throwErrorTolerant({}, Messages$436.StrictDuplicateProperty);
                    } else if (kind$154 !== PropertyKind$435.Data) {
                        throwError({}, Messages$436.AccessorDataProperty);
                    }
                } else {
                    if (kind$154 === PropertyKind$435.Data) {
                        throwError({}, Messages$436.AccessorDataProperty);
                    } else if (map$155[name$153] & kind$154) {
                        throwError({}, Messages$436.AccessorGetSet);
                    }
                }
                map$155[name$153] |= kind$154;
            } else {
                map$155[name$153] = kind$154;
            }
            properties$151.push(property$152);
            if (!match('}')) {
                expect(',');
            }
        }
        expect('}');
        return {
            type: Syntax$434.ObjectExpression,
            properties: properties$151
        };
    }
    function parsePrimaryExpression() {
        var expr$158, token$159 = lookahead().token, type$160 = token$159.type;
        if (type$160 === Token$432.Identifier) {
            var name$161 = extra$447.noresolve ? lex().token.value : expander$5.resolve(lex());
            return {
                type: Syntax$434.Identifier,
                name: name$161
            };
        }
        if (type$160 === Token$432.StringLiteral || type$160 === Token$432.NumericLiteral) {
            if (strict$439 && token$159.octal) {
                throwErrorTolerant(token$159, Messages$436.StrictOctalLiteral);
            }
            return createLiteral(lex().token);
        }
        if (type$160 === Token$432.Keyword) {
            if (matchKeyword('this')) {
                lex().token;
                return {type: Syntax$434.ThisExpression};
            }
            if (matchKeyword('function')) {
                return parseFunctionExpression();
            }
        }
        if (type$160 === Token$432.BooleanLiteral) {
            lex();
            token$159.value = token$159.value === 'true';
            return createLiteral(token$159);
        }
        if (type$160 === Token$432.NullLiteral) {
            lex();
            token$159.value = null;
            return createLiteral(token$159);
        }
        if (match('[')) {
            return parseArrayInitialiser();
        }
        if (match('{')) {
            return parseObjectInitialiser();
        }
        if (match('(')) {
            lex();
            state$445.lastParenthesized = expr$158 = parseExpression();
            expect(')');
            return expr$158;
        }
        if (token$159.value instanceof RegExp) {
            return createLiteral(lex().token);
        }
        return throwUnexpected(lex().token);
    }
    function parseArguments() {
        var args$163 = [];
        expect('(');
        if (!match(')')) {
            while (index$440 < length$443) {
                args$163.push(parseAssignmentExpression());
                if (match(')')) {
                    break;
                }
                expect(',');
            }
        }
        expect(')');
        return args$163;
    }
    function parseNonComputedProperty() {
        var token$165 = lex().token;
        if (!isIdentifierName(token$165)) {
            throwUnexpected(token$165);
        }
        return {
            type: Syntax$434.Identifier,
            name: token$165.value
        };
    }
    function parseNonComputedMember(object$166) {
        return {
            type: Syntax$434.MemberExpression,
            computed: false,
            object: object$166,
            property: parseNonComputedProperty()
        };
    }
    function parseComputedMember(object$168) {
        var property$170, expr$171;
        expect('[');
        property$170 = parseExpression();
        expr$171 = {
            type: Syntax$434.MemberExpression,
            computed: true,
            object: object$168,
            property: property$170
        };
        expect(']');
        return expr$171;
    }
    function parseCallMember(object$172) {
        return {
            type: Syntax$434.CallExpression,
            callee: object$172,
            'arguments': parseArguments()
        };
    }
    function parseNewExpression() {
        var expr$175;
        expectKeyword('new');
        expr$175 = {
            type: Syntax$434.NewExpression,
            callee: parseLeftHandSideExpression(),
            'arguments': []
        };
        if (match('(')) {
            expr$175['arguments'] = parseArguments();
        }
        return expr$175;
    }
    function toArrayNode(arr$176) {
        var els$180 = arr$176.map(function (el$178) {
                return {
                    type: 'Literal',
                    value: el$178,
                    raw: el$178.toString()
                };
            });
        return {
            type: 'ArrayExpression',
            elements: els$180
        };
    }
    function toObjectNode(obj$181) {
        var props$187 = Object.keys(obj$181).map(function (key$183) {
                var raw$185 = obj$181[key$183];
                var value$186;
                if (Array.isArray(raw$185)) {
                    value$186 = toArrayNode(raw$185);
                } else {
                    value$186 = {
                        type: 'Literal',
                        value: obj$181[key$183],
                        raw: obj$181[key$183].toString()
                    };
                }
                return {
                    type: 'Property',
                    key: {
                        type: 'Identifier',
                        name: key$183
                    },
                    value: value$186,
                    kind: 'init'
                };
            });
        return {
            type: 'ObjectExpression',
            properties: props$187
        };
    }
    function parseLeftHandSideExpressionAllowCall() {
        var useNew$189, expr$190;
        useNew$189 = matchKeyword('new');
        expr$190 = useNew$189 ? parseNewExpression() : parsePrimaryExpression();
        while (index$440 < length$443) {
            if (match('.')) {
                lex();
                expr$190 = parseNonComputedMember(expr$190);
            } else if (match('[')) {
                expr$190 = parseComputedMember(expr$190);
            } else if (match('(')) {
                expr$190 = parseCallMember(expr$190);
            } else {
                break;
            }
        }
        return expr$190;
    }
    function parseLeftHandSideExpression() {
        var useNew$192, expr$193;
        useNew$192 = matchKeyword('new');
        expr$193 = useNew$192 ? parseNewExpression() : parsePrimaryExpression();
        while (index$440 < length$443) {
            if (match('.')) {
                lex();
                expr$193 = parseNonComputedMember(expr$193);
            } else if (match('[')) {
                expr$193 = parseComputedMember(expr$193);
            } else {
                break;
            }
        }
        return expr$193;
    }
    function parsePostfixExpression() {
        var expr$195 = parseLeftHandSideExpressionAllowCall();
        if ((match('++') || match('--')) && !peekLineTerminator()) {
            if (strict$439 && expr$195.type === Syntax$434.Identifier && isRestrictedWord(expr$195.name)) {
                throwError({}, Messages$436.StrictLHSPostfix);
            }
            if (!isLeftHandSide(expr$195)) {
                throwError({}, Messages$436.InvalidLHSInAssignment);
            }
            expr$195 = {
                type: Syntax$434.UpdateExpression,
                operator: lex().token.value,
                argument: expr$195,
                prefix: false
            };
        }
        return expr$195;
    }
    function parseUnaryExpression() {
        var token$197, expr$198;
        if (match('++') || match('--')) {
            token$197 = lex().token;
            expr$198 = parseUnaryExpression();
            if (strict$439 && expr$198.type === Syntax$434.Identifier && isRestrictedWord(expr$198.name)) {
                throwError({}, Messages$436.StrictLHSPrefix);
            }
            if (!isLeftHandSide(expr$198)) {
                throwError({}, Messages$436.InvalidLHSInAssignment);
            }
            expr$198 = {
                type: Syntax$434.UpdateExpression,
                operator: token$197.value,
                argument: expr$198,
                prefix: true
            };
            return expr$198;
        }
        if (match('+') || match('-') || match('~') || match('!')) {
            expr$198 = {
                type: Syntax$434.UnaryExpression,
                operator: lex().token.value,
                argument: parseUnaryExpression()
            };
            return expr$198;
        }
        if (matchKeyword('delete') || matchKeyword('void') || matchKeyword('typeof')) {
            expr$198 = {
                type: Syntax$434.UnaryExpression,
                operator: lex().token.value,
                argument: parseUnaryExpression()
            };
            if (strict$439 && expr$198.operator === 'delete' && expr$198.argument.type === Syntax$434.Identifier) {
                throwErrorTolerant({}, Messages$436.StrictDelete);
            }
            return expr$198;
        }
        return parsePostfixExpression();
    }
    function parseMultiplicativeExpression() {
        var expr$200 = parseUnaryExpression();
        while (match('*') || match('/') || match('%')) {
            expr$200 = {
                type: Syntax$434.BinaryExpression,
                operator: lex().token.value,
                left: expr$200,
                right: parseUnaryExpression()
            };
        }
        return expr$200;
    }
    function parseAdditiveExpression() {
        var expr$202 = parseMultiplicativeExpression();
        while (match('+') || match('-')) {
            expr$202 = {
                type: Syntax$434.BinaryExpression,
                operator: lex().token.value,
                left: expr$202,
                right: parseMultiplicativeExpression()
            };
        }
        return expr$202;
    }
    function parseShiftExpression() {
        var expr$204 = parseAdditiveExpression();
        while (match('<<') || match('>>') || match('>>>')) {
            expr$204 = {
                type: Syntax$434.BinaryExpression,
                operator: lex().token.value,
                left: expr$204,
                right: parseAdditiveExpression()
            };
        }
        return expr$204;
    }
    function parseRelationalExpression() {
        var expr$206, previousAllowIn$207;
        previousAllowIn$207 = state$445.allowIn;
        state$445.allowIn = true;
        expr$206 = parseShiftExpression();
        while (match('<') || match('>') || match('<=') || match('>=') || previousAllowIn$207 && matchKeyword('in') || matchKeyword('instanceof')) {
            expr$206 = {
                type: Syntax$434.BinaryExpression,
                operator: lex().token.value,
                left: expr$206,
                right: parseRelationalExpression()
            };
        }
        state$445.allowIn = previousAllowIn$207;
        return expr$206;
    }
    function parseEqualityExpression() {
        var expr$209 = parseRelationalExpression();
        while (match('==') || match('!=') || match('===') || match('!==')) {
            expr$209 = {
                type: Syntax$434.BinaryExpression,
                operator: lex().token.value,
                left: expr$209,
                right: parseRelationalExpression()
            };
        }
        return expr$209;
    }
    function parseBitwiseANDExpression() {
        var expr$211 = parseEqualityExpression();
        while (match('&')) {
            lex();
            expr$211 = {
                type: Syntax$434.BinaryExpression,
                operator: '&',
                left: expr$211,
                right: parseEqualityExpression()
            };
        }
        return expr$211;
    }
    function parseBitwiseXORExpression() {
        var expr$213 = parseBitwiseANDExpression();
        while (match('^')) {
            lex();
            expr$213 = {
                type: Syntax$434.BinaryExpression,
                operator: '^',
                left: expr$213,
                right: parseBitwiseANDExpression()
            };
        }
        return expr$213;
    }
    function parseBitwiseORExpression() {
        var expr$215 = parseBitwiseXORExpression();
        while (match('|')) {
            lex();
            expr$215 = {
                type: Syntax$434.BinaryExpression,
                operator: '|',
                left: expr$215,
                right: parseBitwiseXORExpression()
            };
        }
        return expr$215;
    }
    function parseLogicalANDExpression() {
        var expr$217 = parseBitwiseORExpression();
        while (match('&&')) {
            lex();
            expr$217 = {
                type: Syntax$434.LogicalExpression,
                operator: '&&',
                left: expr$217,
                right: parseBitwiseORExpression()
            };
        }
        return expr$217;
    }
    function parseLogicalORExpression() {
        var expr$219 = parseLogicalANDExpression();
        while (match('||')) {
            lex();
            expr$219 = {
                type: Syntax$434.LogicalExpression,
                operator: '||',
                left: expr$219,
                right: parseLogicalANDExpression()
            };
        }
        return expr$219;
    }
    function parseConditionalExpression() {
        var expr$221, previousAllowIn$222, consequent$223;
        expr$221 = parseLogicalORExpression();
        if (match('?')) {
            lex();
            previousAllowIn$222 = state$445.allowIn;
            state$445.allowIn = true;
            consequent$223 = parseAssignmentExpression();
            state$445.allowIn = previousAllowIn$222;
            expect(':');
            expr$221 = {
                type: Syntax$434.ConditionalExpression,
                test: expr$221,
                consequent: consequent$223,
                alternate: parseAssignmentExpression()
            };
        }
        return expr$221;
    }
    function parseAssignmentExpression() {
        var expr$225;
        expr$225 = parseConditionalExpression();
        if (matchAssign()) {
            if (!isLeftHandSide(expr$225)) {
                throwError({}, Messages$436.InvalidLHSInAssignment);
            }
            if (strict$439 && expr$225.type === Syntax$434.Identifier && isRestrictedWord(expr$225.name)) {
                throwError({}, Messages$436.StrictLHSAssignment);
            }
            expr$225 = {
                type: Syntax$434.AssignmentExpression,
                operator: lex().token.value,
                left: expr$225,
                right: parseAssignmentExpression()
            };
        }
        return expr$225;
    }
    function parseExpression() {
        var expr$227 = parseAssignmentExpression();
        if (match(',')) {
            expr$227 = {
                type: Syntax$434.SequenceExpression,
                expressions: [expr$227]
            };
            while (index$440 < length$443) {
                if (!match(',')) {
                    break;
                }
                lex();
                expr$227.expressions.push(parseAssignmentExpression());
            }
        }
        return expr$227;
    }
    function parseStatementList() {
        var list$229 = [], statement$230;
        while (index$440 < length$443) {
            if (match('}')) {
                break;
            }
            statement$230 = parseSourceElement();
            if (typeof statement$230 === 'undefined') {
                break;
            }
            list$229.push(statement$230);
        }
        return list$229;
    }
    function parseBlock() {
        var block$232;
        expect('{');
        block$232 = parseStatementList();
        expect('}');
        return {
            type: Syntax$434.BlockStatement,
            body: block$232
        };
    }
    function parseVariableIdentifier() {
        var stx$234 = lex(), token$235 = stx$234.token;
        if (token$235.type !== Token$432.Identifier) {
            throwUnexpected(token$235);
        }
        var name$236 = extra$447.noresolve ? stx$234 : expander$5.resolve(stx$234);
        return {
            type: Syntax$434.Identifier,
            name: name$236
        };
    }
    function parseVariableDeclaration(kind$237) {
        var id$239 = parseVariableIdentifier(), init$240 = null;
        if (strict$439 && isRestrictedWord(id$239.name)) {
            throwErrorTolerant({}, Messages$436.StrictVarName);
        }
        if (kind$237 === 'const') {
            expect('=');
            init$240 = parseAssignmentExpression();
        } else if (match('=')) {
            lex();
            init$240 = parseAssignmentExpression();
        }
        return {
            type: Syntax$434.VariableDeclarator,
            id: id$239,
            init: init$240
        };
    }
    function parseVariableDeclarationList(kind$241) {
        var list$243 = [];
        while (index$440 < length$443) {
            list$243.push(parseVariableDeclaration(kind$241));
            if (!match(',')) {
                break;
            }
            lex();
        }
        return list$243;
    }
    function parseVariableStatement() {
        var declarations$245;
        expectKeyword('var');
        declarations$245 = parseVariableDeclarationList();
        consumeSemicolon();
        return {
            type: Syntax$434.VariableDeclaration,
            declarations: declarations$245,
            kind: 'var'
        };
    }
    function parseConstLetDeclaration(kind$246) {
        var declarations$248;
        expectKeyword(kind$246);
        declarations$248 = parseVariableDeclarationList(kind$246);
        consumeSemicolon();
        return {
            type: Syntax$434.VariableDeclaration,
            declarations: declarations$248,
            kind: kind$246
        };
    }
    function parseEmptyStatement() {
        expect(';');
        return {type: Syntax$434.EmptyStatement};
    }
    function parseExpressionStatement() {
        var expr$251 = parseExpression();
        consumeSemicolon();
        return {
            type: Syntax$434.ExpressionStatement,
            expression: expr$251
        };
    }
    function parseIfStatement() {
        var test$253, consequent$254, alternate$255;
        expectKeyword('if');
        expect('(');
        test$253 = parseExpression();
        expect(')');
        consequent$254 = parseStatement();
        if (matchKeyword('else')) {
            lex();
            alternate$255 = parseStatement();
        } else {
            alternate$255 = null;
        }
        return {
            type: Syntax$434.IfStatement,
            test: test$253,
            consequent: consequent$254,
            alternate: alternate$255
        };
    }
    function parseDoWhileStatement() {
        var body$257, test$258, oldInIteration$259;
        expectKeyword('do');
        oldInIteration$259 = state$445.inIteration;
        state$445.inIteration = true;
        body$257 = parseStatement();
        state$445.inIteration = oldInIteration$259;
        expectKeyword('while');
        expect('(');
        test$258 = parseExpression();
        expect(')');
        if (match(';')) {
            lex();
        }
        return {
            type: Syntax$434.DoWhileStatement,
            body: body$257,
            test: test$258
        };
    }
    function parseWhileStatement() {
        var test$261, body$262, oldInIteration$263;
        expectKeyword('while');
        expect('(');
        test$261 = parseExpression();
        expect(')');
        oldInIteration$263 = state$445.inIteration;
        state$445.inIteration = true;
        body$262 = parseStatement();
        state$445.inIteration = oldInIteration$263;
        return {
            type: Syntax$434.WhileStatement,
            test: test$261,
            body: body$262
        };
    }
    function parseForVariableDeclaration() {
        var token$265 = lex().token;
        return {
            type: Syntax$434.VariableDeclaration,
            declarations: parseVariableDeclarationList(),
            kind: token$265.value
        };
    }
    function parseForStatement() {
        var init$267, test$268, update$269, left$270, right$271, body$272, oldInIteration$273;
        init$267 = test$268 = update$269 = null;
        expectKeyword('for');
        expect('(');
        if (match(';')) {
            lex();
        } else {
            if (matchKeyword('var') || matchKeyword('let')) {
                state$445.allowIn = false;
                init$267 = parseForVariableDeclaration();
                state$445.allowIn = true;
                if (init$267.declarations.length === 1 && matchKeyword('in')) {
                    lex();
                    left$270 = init$267;
                    right$271 = parseExpression();
                    init$267 = null;
                }
            } else {
                state$445.allowIn = false;
                init$267 = parseExpression();
                state$445.allowIn = true;
                if (matchKeyword('in')) {
                    if (!isLeftHandSide(init$267)) {
                        throwError({}, Messages$436.InvalidLHSInForIn);
                    }
                    lex();
                    left$270 = init$267;
                    right$271 = parseExpression();
                    init$267 = null;
                }
            }
            if (typeof left$270 === 'undefined') {
                expect(';');
            }
        }
        if (typeof left$270 === 'undefined') {
            if (!match(';')) {
                test$268 = parseExpression();
            }
            expect(';');
            if (!match(')')) {
                update$269 = parseExpression();
            }
        }
        expect(')');
        oldInIteration$273 = state$445.inIteration;
        state$445.inIteration = true;
        body$272 = parseStatement();
        state$445.inIteration = oldInIteration$273;
        if (typeof left$270 === 'undefined') {
            return {
                type: Syntax$434.ForStatement,
                init: init$267,
                test: test$268,
                update: update$269,
                body: body$272
            };
        }
        return {
            type: Syntax$434.ForInStatement,
            left: left$270,
            right: right$271,
            body: body$272,
            each: false
        };
    }
    function parseContinueStatement() {
        var token$275, label$276 = null;
        expectKeyword('continue');
        if (tokenStream$446[index$440].token.value === ';') {
            lex();
            if (!state$445.inIteration) {
                throwError({}, Messages$436.IllegalContinue);
            }
            return {
                type: Syntax$434.ContinueStatement,
                label: null
            };
        }
        if (peekLineTerminator()) {
            if (!state$445.inIteration) {
                throwError({}, Messages$436.IllegalContinue);
            }
            return {
                type: Syntax$434.ContinueStatement,
                label: null
            };
        }
        token$275 = lookahead().token;
        if (token$275.type === Token$432.Identifier) {
            label$276 = parseVariableIdentifier();
            if (!Object.prototype.hasOwnProperty.call(state$445.labelSet, label$276.name)) {
                throwError({}, Messages$436.UnknownLabel, label$276.name);
            }
        }
        consumeSemicolon();
        if (label$276 === null && !state$445.inIteration) {
            throwError({}, Messages$436.IllegalContinue);
        }
        return {
            type: Syntax$434.ContinueStatement,
            label: label$276
        };
    }
    function parseBreakStatement() {
        var token$278, label$279 = null;
        expectKeyword('break');
        if (source$438[index$440] === ';') {
            lex();
            if (!(state$445.inIteration || state$445.inSwitch)) {
                throwError({}, Messages$436.IllegalBreak);
            }
            return {
                type: Syntax$434.BreakStatement,
                label: null
            };
        }
        if (peekLineTerminator()) {
            if (!(state$445.inIteration || state$445.inSwitch)) {
                throwError({}, Messages$436.IllegalBreak);
            }
            return {
                type: Syntax$434.BreakStatement,
                label: null
            };
        }
        token$278 = lookahead().token;
        if (token$278.type === Token$432.Identifier) {
            label$279 = parseVariableIdentifier();
            if (!Object.prototype.hasOwnProperty.call(state$445.labelSet, label$279.name)) {
                throwError({}, Messages$436.UnknownLabel, label$279.name);
            }
        }
        consumeSemicolon();
        if (label$279 === null && !(state$445.inIteration || state$445.inSwitch)) {
            throwError({}, Messages$436.IllegalBreak);
        }
        return {
            type: Syntax$434.BreakStatement,
            label: label$279
        };
    }
    function parseReturnStatement() {
        var token$281, argument$282 = null;
        expectKeyword('return');
        if (!state$445.inFunctionBody) {
            throwErrorTolerant({}, Messages$436.IllegalReturn);
        }
        if (source$438[index$440] === ' ') {
            if (isIdentifierStart(source$438[index$440 + 1])) {
                argument$282 = parseExpression();
                consumeSemicolon();
                return {
                    type: Syntax$434.ReturnStatement,
                    argument: argument$282
                };
            }
        }
        if (peekLineTerminator()) {
            return {
                type: Syntax$434.ReturnStatement,
                argument: null
            };
        }
        if (!match(';')) {
            token$281 = lookahead().token;
            if (!match('}') && token$281.type !== Token$432.EOF) {
                argument$282 = parseExpression();
            }
        }
        consumeSemicolon();
        return {
            type: Syntax$434.ReturnStatement,
            argument: argument$282
        };
    }
    function parseWithStatement() {
        var object$284, body$285;
        if (strict$439) {
            throwErrorTolerant({}, Messages$436.StrictModeWith);
        }
        expectKeyword('with');
        expect('(');
        object$284 = parseExpression();
        expect(')');
        body$285 = parseStatement();
        return {
            type: Syntax$434.WithStatement,
            object: object$284,
            body: body$285
        };
    }
    function parseSwitchCase() {
        var test$287, consequent$288 = [], statement$289;
        if (matchKeyword('default')) {
            lex();
            test$287 = null;
        } else {
            expectKeyword('case');
            test$287 = parseExpression();
        }
        expect(':');
        while (index$440 < length$443) {
            if (match('}') || matchKeyword('default') || matchKeyword('case')) {
                break;
            }
            statement$289 = parseStatement();
            if (typeof statement$289 === 'undefined') {
                break;
            }
            consequent$288.push(statement$289);
        }
        return {
            type: Syntax$434.SwitchCase,
            test: test$287,
            consequent: consequent$288
        };
    }
    function parseSwitchStatement() {
        var discriminant$291, cases$292, oldInSwitch$293;
        expectKeyword('switch');
        expect('(');
        discriminant$291 = parseExpression();
        expect(')');
        expect('{');
        if (match('}')) {
            lex();
            return {
                type: Syntax$434.SwitchStatement,
                discriminant: discriminant$291
            };
        }
        cases$292 = [];
        oldInSwitch$293 = state$445.inSwitch;
        state$445.inSwitch = true;
        while (index$440 < length$443) {
            if (match('}')) {
                break;
            }
            cases$292.push(parseSwitchCase());
        }
        state$445.inSwitch = oldInSwitch$293;
        expect('}');
        return {
            type: Syntax$434.SwitchStatement,
            discriminant: discriminant$291,
            cases: cases$292
        };
    }
    function parseThrowStatement() {
        var argument$295;
        expectKeyword('throw');
        if (peekLineTerminator()) {
            throwError({}, Messages$436.NewlineAfterThrow);
        }
        argument$295 = parseExpression();
        consumeSemicolon();
        return {
            type: Syntax$434.ThrowStatement,
            argument: argument$295
        };
    }
    function parseCatchClause() {
        var param$297;
        expectKeyword('catch');
        expect('(');
        if (!match(')')) {
            param$297 = parseExpression();
            if (strict$439 && param$297.type === Syntax$434.Identifier && isRestrictedWord(param$297.name)) {
                throwErrorTolerant({}, Messages$436.StrictCatchVariable);
            }
        }
        expect(')');
        return {
            type: Syntax$434.CatchClause,
            param: param$297,
            guard: null,
            body: parseBlock()
        };
    }
    function parseTryStatement() {
        var block$299, handlers$300 = [], finalizer$301 = null;
        expectKeyword('try');
        block$299 = parseBlock();
        if (matchKeyword('catch')) {
            handlers$300.push(parseCatchClause());
        }
        if (matchKeyword('finally')) {
            lex();
            finalizer$301 = parseBlock();
        }
        if (handlers$300.length === 0 && !finalizer$301) {
            throwError({}, Messages$436.NoCatchOrFinally);
        }
        return {
            type: Syntax$434.TryStatement,
            block: block$299,
            handlers: handlers$300,
            finalizer: finalizer$301
        };
    }
    function parseDebuggerStatement() {
        expectKeyword('debugger');
        consumeSemicolon();
        return {type: Syntax$434.DebuggerStatement};
    }
    function parseStatement() {
        var token$304 = lookahead().token, expr$305, labeledBody$306;
        if (token$304.type === Token$432.EOF) {
            throwUnexpected(token$304);
        }
        if (token$304.type === Token$432.Punctuator) {
            switch (token$304.value) {
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
        if (token$304.type === Token$432.Keyword) {
            switch (token$304.value) {
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
        expr$305 = parseExpression();
        if (expr$305.type === Syntax$434.Identifier && match(':')) {
            lex();
            if (Object.prototype.hasOwnProperty.call(state$445.labelSet, expr$305.name)) {
                throwError({}, Messages$436.Redeclaration, 'Label', expr$305.name);
            }
            state$445.labelSet[expr$305.name] = true;
            labeledBody$306 = parseStatement();
            delete state$445.labelSet[expr$305.name];
            return {
                type: Syntax$434.LabeledStatement,
                label: expr$305,
                body: labeledBody$306
            };
        }
        consumeSemicolon();
        return {
            type: Syntax$434.ExpressionStatement,
            expression: expr$305
        };
    }
    function parseFunctionSourceElements() {
        var sourceElement$308, sourceElements$309 = [], token$310, directive$311, firstRestricted$312, oldLabelSet$313, oldInIteration$314, oldInSwitch$315, oldInFunctionBody$316;
        expect('{');
        while (index$440 < length$443) {
            token$310 = lookahead().token;
            if (token$310.type !== Token$432.StringLiteral) {
                break;
            }
            sourceElement$308 = parseSourceElement();
            sourceElements$309.push(sourceElement$308);
            if (sourceElement$308.expression.type !== Syntax$434.Literal) {
                break;
            }
            directive$311 = sliceSource(token$310.range[0] + 1, token$310.range[1] - 1);
            if (directive$311 === 'use strict') {
                strict$439 = true;
                if (firstRestricted$312) {
                    throwError(firstRestricted$312, Messages$436.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$312 && token$310.octal) {
                    firstRestricted$312 = token$310;
                }
            }
        }
        oldLabelSet$313 = state$445.labelSet;
        oldInIteration$314 = state$445.inIteration;
        oldInSwitch$315 = state$445.inSwitch;
        oldInFunctionBody$316 = state$445.inFunctionBody;
        state$445.labelSet = {};
        state$445.inIteration = false;
        state$445.inSwitch = false;
        state$445.inFunctionBody = true;
        while (index$440 < length$443) {
            if (match('}')) {
                break;
            }
            sourceElement$308 = parseSourceElement();
            if (typeof sourceElement$308 === 'undefined') {
                break;
            }
            sourceElements$309.push(sourceElement$308);
        }
        expect('}');
        state$445.labelSet = oldLabelSet$313;
        state$445.inIteration = oldInIteration$314;
        state$445.inSwitch = oldInSwitch$315;
        state$445.inFunctionBody = oldInFunctionBody$316;
        return {
            type: Syntax$434.BlockStatement,
            body: sourceElements$309
        };
    }
    function parseFunctionDeclaration() {
        var id$318, param$319, params$320 = [], body$321, token$322, firstRestricted$323, message$324, previousStrict$325, paramSet$326;
        expectKeyword('function');
        token$322 = lookahead().token;
        id$318 = parseVariableIdentifier();
        if (strict$439) {
            if (isRestrictedWord(token$322.value)) {
                throwError(token$322, Messages$436.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord(token$322.value)) {
                firstRestricted$323 = token$322;
                message$324 = Messages$436.StrictFunctionName;
            } else if (isStrictModeReservedWord(token$322.value)) {
                firstRestricted$323 = token$322;
                message$324 = Messages$436.StrictReservedWord;
            }
        }
        expect('(');
        if (!match(')')) {
            paramSet$326 = {};
            while (index$440 < length$443) {
                token$322 = lookahead().token;
                param$319 = parseVariableIdentifier();
                if (strict$439) {
                    if (isRestrictedWord(token$322.value)) {
                        throwError(token$322, Messages$436.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$326, token$322.value)) {
                        throwError(token$322, Messages$436.StrictParamDupe);
                    }
                } else if (!firstRestricted$323) {
                    if (isRestrictedWord(token$322.value)) {
                        firstRestricted$323 = token$322;
                        message$324 = Messages$436.StrictParamName;
                    } else if (isStrictModeReservedWord(token$322.value)) {
                        firstRestricted$323 = token$322;
                        message$324 = Messages$436.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$326, token$322.value)) {
                        firstRestricted$323 = token$322;
                        message$324 = Messages$436.StrictParamDupe;
                    }
                }
                params$320.push(param$319);
                paramSet$326[param$319.name] = true;
                if (match(')')) {
                    break;
                }
                expect(',');
            }
        }
        expect(')');
        previousStrict$325 = strict$439;
        body$321 = parseFunctionSourceElements();
        if (strict$439 && firstRestricted$323) {
            throwError(firstRestricted$323, message$324);
        }
        strict$439 = previousStrict$325;
        return {
            type: Syntax$434.FunctionDeclaration,
            id: id$318,
            params: params$320,
            body: body$321
        };
    }
    function parseFunctionExpression() {
        var token$328, id$329 = null, firstRestricted$330, message$331, param$332, params$333 = [], body$334, previousStrict$335, paramSet$336;
        expectKeyword('function');
        if (!match('(')) {
            token$328 = lookahead().token;
            id$329 = parseVariableIdentifier();
            if (strict$439) {
                if (isRestrictedWord(token$328.value)) {
                    throwError(token$328, Messages$436.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord(token$328.value)) {
                    firstRestricted$330 = token$328;
                    message$331 = Messages$436.StrictFunctionName;
                } else if (isStrictModeReservedWord(token$328.value)) {
                    firstRestricted$330 = token$328;
                    message$331 = Messages$436.StrictReservedWord;
                }
            }
        }
        expect('(');
        if (!match(')')) {
            paramSet$336 = {};
            while (index$440 < length$443) {
                token$328 = lookahead().token;
                param$332 = parseVariableIdentifier();
                if (strict$439) {
                    if (isRestrictedWord(token$328.value)) {
                        throwError(token$328, Messages$436.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$336, token$328.value)) {
                        throwError(token$328, Messages$436.StrictParamDupe);
                    }
                } else if (!firstRestricted$330) {
                    if (isRestrictedWord(token$328.value)) {
                        firstRestricted$330 = token$328;
                        message$331 = Messages$436.StrictParamName;
                    } else if (isStrictModeReservedWord(token$328.value)) {
                        firstRestricted$330 = token$328;
                        message$331 = Messages$436.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$336, token$328.value)) {
                        firstRestricted$330 = token$328;
                        message$331 = Messages$436.StrictParamDupe;
                    }
                }
                params$333.push(param$332);
                paramSet$336[param$332.name] = true;
                if (match(')')) {
                    break;
                }
                expect(',');
            }
        }
        expect(')');
        previousStrict$335 = strict$439;
        body$334 = parseFunctionSourceElements();
        if (strict$439 && firstRestricted$330) {
            throwError(firstRestricted$330, message$331);
        }
        strict$439 = previousStrict$335;
        return {
            type: Syntax$434.FunctionExpression,
            id: id$329,
            params: params$333,
            body: body$334
        };
    }
    function parseSourceElement() {
        var token$338 = lookahead().token;
        if (token$338.type === Token$432.Keyword) {
            switch (token$338.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration(token$338.value);
            case 'function':
                return parseFunctionDeclaration();
            default:
                return parseStatement();
            }
        }
        if (token$338.type !== Token$432.EOF) {
            return parseStatement();
        }
    }
    function parseSourceElements() {
        var sourceElement$340, sourceElements$341 = [], token$342, directive$343, firstRestricted$344;
        while (index$440 < length$443) {
            token$342 = lookahead();
            if (token$342.type !== Token$432.StringLiteral) {
                break;
            }
            sourceElement$340 = parseSourceElement();
            sourceElements$341.push(sourceElement$340);
            if (sourceElement$340.expression.type !== Syntax$434.Literal) {
                break;
            }
            directive$343 = sliceSource(token$342.range[0] + 1, token$342.range[1] - 1);
            if (directive$343 === 'use strict') {
                strict$439 = true;
                if (firstRestricted$344) {
                    throwError(firstRestricted$344, Messages$436.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$344 && token$342.octal) {
                    firstRestricted$344 = token$342;
                }
            }
        }
        while (index$440 < length$443) {
            sourceElement$340 = parseSourceElement();
            if (typeof sourceElement$340 === 'undefined') {
                break;
            }
            sourceElements$341.push(sourceElement$340);
        }
        return sourceElements$341;
    }
    function parseProgram() {
        var program$346;
        strict$439 = false;
        program$346 = {
            type: Syntax$434.Program,
            body: parseSourceElements()
        };
        return program$346;
    }
    function addComment(start$347, end$348, type$349, value$350) {
        assert(typeof start$347 === 'number', 'Comment must have valid position');
        if (extra$447.comments.length > 0) {
            if (extra$447.comments[extra$447.comments.length - 1].range[1] > start$347) {
                return;
            }
        }
        extra$447.comments.push({
            range: [
                start$347,
                end$348
            ],
            type: type$349,
            value: value$350
        });
    }
    function scanComment() {
        var comment$353, ch$354, start$355, blockComment$356, lineComment$357;
        comment$353 = '';
        blockComment$356 = false;
        lineComment$357 = false;
        while (index$440 < length$443) {
            ch$354 = source$438[index$440];
            if (lineComment$357) {
                ch$354 = nextChar();
                if (index$440 >= length$443) {
                    lineComment$357 = false;
                    comment$353 += ch$354;
                    addComment(start$355, index$440, 'Line', comment$353);
                } else if (isLineTerminator(ch$354)) {
                    lineComment$357 = false;
                    addComment(start$355, index$440, 'Line', comment$353);
                    if (ch$354 === '\r' && source$438[index$440] === '\n') {
                        ++index$440;
                    }
                    ++lineNumber$441;
                    lineStart$442 = index$440;
                    comment$353 = '';
                } else {
                    comment$353 += ch$354;
                }
            } else if (blockComment$356) {
                if (isLineTerminator(ch$354)) {
                    if (ch$354 === '\r' && source$438[index$440 + 1] === '\n') {
                        ++index$440;
                        comment$353 += '\r\n';
                    } else {
                        comment$353 += ch$354;
                    }
                    ++lineNumber$441;
                    ++index$440;
                    lineStart$442 = index$440;
                    if (index$440 >= length$443) {
                        throwError({}, Messages$436.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$354 = nextChar();
                    if (index$440 >= length$443) {
                        throwError({}, Messages$436.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$353 += ch$354;
                    if (ch$354 === '*') {
                        ch$354 = source$438[index$440];
                        if (ch$354 === '/') {
                            comment$353 = comment$353.substr(0, comment$353.length - 1);
                            blockComment$356 = false;
                            ++index$440;
                            addComment(start$355, index$440, 'Block', comment$353);
                            comment$353 = '';
                        }
                    }
                }
            } else if (ch$354 === '/') {
                ch$354 = source$438[index$440 + 1];
                if (ch$354 === '/') {
                    start$355 = index$440;
                    index$440 += 2;
                    lineComment$357 = true;
                } else if (ch$354 === '*') {
                    start$355 = index$440;
                    index$440 += 2;
                    blockComment$356 = true;
                    if (index$440 >= length$443) {
                        throwError({}, Messages$436.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace(ch$354)) {
                ++index$440;
            } else if (isLineTerminator(ch$354)) {
                ++index$440;
                if (ch$354 === '\r' && source$438[index$440] === '\n') {
                    ++index$440;
                }
                ++lineNumber$441;
                lineStart$442 = index$440;
            } else {
                break;
            }
        }
    }
    function collectToken() {
        var token$359 = extra$447.advance(), range$360, value$361;
        if (token$359.type !== Token$432.EOF) {
            range$360 = [
                token$359.range[0],
                token$359.range[1]
            ];
            value$361 = sliceSource(token$359.range[0], token$359.range[1]);
            extra$447.tokens.push({
                type: TokenName$433[token$359.type],
                value: value$361,
                lineNumber: lineNumber$441,
                lineStart: lineStart$442,
                range: range$360
            });
        }
        return token$359;
    }
    function collectRegex() {
        var pos$363, regex$364, token$365;
        skipComment();
        pos$363 = index$440;
        regex$364 = extra$447.scanRegExp();
        if (extra$447.tokens.length > 0) {
            token$365 = extra$447.tokens[extra$447.tokens.length - 1];
            if (token$365.range[0] === pos$363 && token$365.type === 'Punctuator') {
                if (token$365.value === '/' || token$365.value === '/=') {
                    extra$447.tokens.pop();
                }
            }
        }
        extra$447.tokens.push({
            type: 'RegularExpression',
            value: regex$364.literal,
            range: [
                pos$363,
                index$440
            ],
            lineStart: token$365.lineStart,
            lineNumber: token$365.lineNumber
        });
        return regex$364;
    }
    function createLiteral(token$366) {
        if (Array.isArray(token$366)) {
            return {
                type: Syntax$434.Literal,
                value: token$366
            };
        }
        return {
            type: Syntax$434.Literal,
            value: token$366.value,
            lineStart: token$366.lineStart,
            lineNumber: token$366.lineNumber
        };
    }
    function createRawLiteral(token$368) {
        return {
            type: Syntax$434.Literal,
            value: token$368.value,
            raw: sliceSource(token$368.range[0], token$368.range[1]),
            lineStart: token$368.lineStart,
            lineNumber: token$368.lineNumber
        };
    }
    function wrapTrackingFunction(range$370, loc$371) {
        return function (parseFunction$373) {
            function isBinary(node$375) {
                return node$375.type === Syntax$434.LogicalExpression || node$375.type === Syntax$434.BinaryExpression;
            }
            function visit(node$377) {
                if (isBinary(node$377.left)) {
                    visit(node$377.left);
                }
                if (isBinary(node$377.right)) {
                    visit(node$377.right);
                }
                if (range$370 && typeof node$377.range === 'undefined') {
                    node$377.range = [
                        node$377.left.range[0],
                        node$377.right.range[1]
                    ];
                }
                if (loc$371 && typeof node$377.loc === 'undefined') {
                    node$377.loc = {
                        start: node$377.left.loc.start,
                        end: node$377.right.loc.end
                    };
                }
            }
            return function () {
                var node$380, rangeInfo$381, locInfo$382;
                var curr$383 = tokenStream$446[index$440].token;
                rangeInfo$381 = [
                    curr$383.range[0],
                    0
                ];
                locInfo$382 = {start: {
                        line: curr$383.lineNumber,
                        column: curr$383.lineStart
                    }};
                node$380 = parseFunction$373.apply(null, arguments);
                if (typeof node$380 !== 'undefined') {
                    var last$384 = tokenStream$446[index$440].token;
                    if (range$370) {
                        rangeInfo$381[1] = last$384.range[1];
                        node$380.range = rangeInfo$381;
                    }
                    if (loc$371) {
                        locInfo$382.end = {
                            line: last$384.lineNumber,
                            column: last$384.lineStart
                        };
                        node$380.loc = locInfo$382;
                    }
                    if (isBinary(node$380)) {
                        visit(node$380);
                    }
                    if (node$380.type === Syntax$434.MemberExpression) {
                        if (typeof node$380.object.range !== 'undefined') {
                            node$380.range[0] = node$380.object.range[0];
                        }
                        if (typeof node$380.object.loc !== 'undefined') {
                            node$380.loc.start = node$380.object.loc.start;
                        }
                    }
                    if (node$380.type === Syntax$434.CallExpression) {
                        if (typeof node$380.callee.range !== 'undefined') {
                            node$380.range[0] = node$380.callee.range[0];
                        }
                        if (typeof node$380.callee.loc !== 'undefined') {
                            node$380.loc.start = node$380.callee.loc.start;
                        }
                    }
                    return node$380;
                }
            };
        };
    }
    function patch() {
        var wrapTracking$386;
        if (extra$447.comments) {
            extra$447.skipComment = skipComment;
            skipComment = scanComment;
        }
        if (extra$447.raw) {
            extra$447.createLiteral = createLiteral;
            createLiteral = createRawLiteral;
        }
        if (extra$447.range || extra$447.loc) {
            wrapTracking$386 = wrapTrackingFunction(extra$447.range, extra$447.loc);
            extra$447.parseAdditiveExpression = parseAdditiveExpression;
            extra$447.parseAssignmentExpression = parseAssignmentExpression;
            extra$447.parseBitwiseANDExpression = parseBitwiseANDExpression;
            extra$447.parseBitwiseORExpression = parseBitwiseORExpression;
            extra$447.parseBitwiseXORExpression = parseBitwiseXORExpression;
            extra$447.parseBlock = parseBlock;
            extra$447.parseFunctionSourceElements = parseFunctionSourceElements;
            extra$447.parseCallMember = parseCallMember;
            extra$447.parseCatchClause = parseCatchClause;
            extra$447.parseComputedMember = parseComputedMember;
            extra$447.parseConditionalExpression = parseConditionalExpression;
            extra$447.parseConstLetDeclaration = parseConstLetDeclaration;
            extra$447.parseEqualityExpression = parseEqualityExpression;
            extra$447.parseExpression = parseExpression;
            extra$447.parseForVariableDeclaration = parseForVariableDeclaration;
            extra$447.parseFunctionDeclaration = parseFunctionDeclaration;
            extra$447.parseFunctionExpression = parseFunctionExpression;
            extra$447.parseLogicalANDExpression = parseLogicalANDExpression;
            extra$447.parseLogicalORExpression = parseLogicalORExpression;
            extra$447.parseMultiplicativeExpression = parseMultiplicativeExpression;
            extra$447.parseNewExpression = parseNewExpression;
            extra$447.parseNonComputedMember = parseNonComputedMember;
            extra$447.parseNonComputedProperty = parseNonComputedProperty;
            extra$447.parseObjectProperty = parseObjectProperty;
            extra$447.parseObjectPropertyKey = parseObjectPropertyKey;
            extra$447.parsePostfixExpression = parsePostfixExpression;
            extra$447.parsePrimaryExpression = parsePrimaryExpression;
            extra$447.parseProgram = parseProgram;
            extra$447.parsePropertyFunction = parsePropertyFunction;
            extra$447.parseRelationalExpression = parseRelationalExpression;
            extra$447.parseStatement = parseStatement;
            extra$447.parseShiftExpression = parseShiftExpression;
            extra$447.parseSwitchCase = parseSwitchCase;
            extra$447.parseUnaryExpression = parseUnaryExpression;
            extra$447.parseVariableDeclaration = parseVariableDeclaration;
            extra$447.parseVariableIdentifier = parseVariableIdentifier;
            parseAdditiveExpression = wrapTracking$386(extra$447.parseAdditiveExpression);
            parseAssignmentExpression = wrapTracking$386(extra$447.parseAssignmentExpression);
            parseBitwiseANDExpression = wrapTracking$386(extra$447.parseBitwiseANDExpression);
            parseBitwiseORExpression = wrapTracking$386(extra$447.parseBitwiseORExpression);
            parseBitwiseXORExpression = wrapTracking$386(extra$447.parseBitwiseXORExpression);
            parseBlock = wrapTracking$386(extra$447.parseBlock);
            parseFunctionSourceElements = wrapTracking$386(extra$447.parseFunctionSourceElements);
            parseCallMember = wrapTracking$386(extra$447.parseCallMember);
            parseCatchClause = wrapTracking$386(extra$447.parseCatchClause);
            parseComputedMember = wrapTracking$386(extra$447.parseComputedMember);
            parseConditionalExpression = wrapTracking$386(extra$447.parseConditionalExpression);
            parseConstLetDeclaration = wrapTracking$386(extra$447.parseConstLetDeclaration);
            parseEqualityExpression = wrapTracking$386(extra$447.parseEqualityExpression);
            parseExpression = wrapTracking$386(extra$447.parseExpression);
            parseForVariableDeclaration = wrapTracking$386(extra$447.parseForVariableDeclaration);
            parseFunctionDeclaration = wrapTracking$386(extra$447.parseFunctionDeclaration);
            parseFunctionExpression = wrapTracking$386(extra$447.parseFunctionExpression);
            parseLogicalANDExpression = wrapTracking$386(extra$447.parseLogicalANDExpression);
            parseLogicalORExpression = wrapTracking$386(extra$447.parseLogicalORExpression);
            parseMultiplicativeExpression = wrapTracking$386(extra$447.parseMultiplicativeExpression);
            parseNewExpression = wrapTracking$386(extra$447.parseNewExpression);
            parseNonComputedMember = wrapTracking$386(extra$447.parseNonComputedMember);
            parseNonComputedProperty = wrapTracking$386(extra$447.parseNonComputedProperty);
            parseObjectProperty = wrapTracking$386(extra$447.parseObjectProperty);
            parseObjectPropertyKey = wrapTracking$386(extra$447.parseObjectPropertyKey);
            parsePostfixExpression = wrapTracking$386(extra$447.parsePostfixExpression);
            parsePrimaryExpression = wrapTracking$386(extra$447.parsePrimaryExpression);
            parseProgram = wrapTracking$386(extra$447.parseProgram);
            parsePropertyFunction = wrapTracking$386(extra$447.parsePropertyFunction);
            parseRelationalExpression = wrapTracking$386(extra$447.parseRelationalExpression);
            parseStatement = wrapTracking$386(extra$447.parseStatement);
            parseShiftExpression = wrapTracking$386(extra$447.parseShiftExpression);
            parseSwitchCase = wrapTracking$386(extra$447.parseSwitchCase);
            parseUnaryExpression = wrapTracking$386(extra$447.parseUnaryExpression);
            parseVariableDeclaration = wrapTracking$386(extra$447.parseVariableDeclaration);
            parseVariableIdentifier = wrapTracking$386(extra$447.parseVariableIdentifier);
        }
        if (typeof extra$447.tokens !== 'undefined') {
            extra$447.advance = advance;
            extra$447.scanRegExp = scanRegExp;
            advance = collectToken;
            scanRegExp = collectRegex;
        }
    }
    function unpatch() {
        if (typeof extra$447.skipComment === 'function') {
            skipComment = extra$447.skipComment;
        }
        if (extra$447.raw) {
            createLiteral = extra$447.createLiteral;
        }
        if (extra$447.range || extra$447.loc) {
            parseAdditiveExpression = extra$447.parseAdditiveExpression;
            parseAssignmentExpression = extra$447.parseAssignmentExpression;
            parseBitwiseANDExpression = extra$447.parseBitwiseANDExpression;
            parseBitwiseORExpression = extra$447.parseBitwiseORExpression;
            parseBitwiseXORExpression = extra$447.parseBitwiseXORExpression;
            parseBlock = extra$447.parseBlock;
            parseFunctionSourceElements = extra$447.parseFunctionSourceElements;
            parseCallMember = extra$447.parseCallMember;
            parseCatchClause = extra$447.parseCatchClause;
            parseComputedMember = extra$447.parseComputedMember;
            parseConditionalExpression = extra$447.parseConditionalExpression;
            parseConstLetDeclaration = extra$447.parseConstLetDeclaration;
            parseEqualityExpression = extra$447.parseEqualityExpression;
            parseExpression = extra$447.parseExpression;
            parseForVariableDeclaration = extra$447.parseForVariableDeclaration;
            parseFunctionDeclaration = extra$447.parseFunctionDeclaration;
            parseFunctionExpression = extra$447.parseFunctionExpression;
            parseLogicalANDExpression = extra$447.parseLogicalANDExpression;
            parseLogicalORExpression = extra$447.parseLogicalORExpression;
            parseMultiplicativeExpression = extra$447.parseMultiplicativeExpression;
            parseNewExpression = extra$447.parseNewExpression;
            parseNonComputedMember = extra$447.parseNonComputedMember;
            parseNonComputedProperty = extra$447.parseNonComputedProperty;
            parseObjectProperty = extra$447.parseObjectProperty;
            parseObjectPropertyKey = extra$447.parseObjectPropertyKey;
            parsePrimaryExpression = extra$447.parsePrimaryExpression;
            parsePostfixExpression = extra$447.parsePostfixExpression;
            parseProgram = extra$447.parseProgram;
            parsePropertyFunction = extra$447.parsePropertyFunction;
            parseRelationalExpression = extra$447.parseRelationalExpression;
            parseStatement = extra$447.parseStatement;
            parseShiftExpression = extra$447.parseShiftExpression;
            parseSwitchCase = extra$447.parseSwitchCase;
            parseUnaryExpression = extra$447.parseUnaryExpression;
            parseVariableDeclaration = extra$447.parseVariableDeclaration;
            parseVariableIdentifier = extra$447.parseVariableIdentifier;
        }
        if (typeof extra$447.scanRegExp === 'function') {
            advance = extra$447.advance;
            scanRegExp = extra$447.scanRegExp;
        }
    }
    function stringToArray(str$388) {
        var length$390 = str$388.length, result$391 = [], i$392;
        for (i$392 = 0; i$392 < length$390; ++i$392) {
            result$391[i$392] = str$388.charAt(i$392);
        }
        return result$391;
    }
    function readLoop(toks$393, inExprDelim$394) {
        var delimiters$399 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$400 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$401 = toks$393.length - 1;
        var fnExprTokens$402 = [
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
        function back(n$396) {
            var idx$398 = toks$393.length - n$396 > 0 ? toks$393.length - n$396 : 0;
            return toks$393[idx$398];
        }
        skipComment();
        if (isIn(getChar(), delimiters$399)) {
            return readDelim();
        }
        if (getChar() === '/') {
            var prev$403 = back(1);
            if (prev$403) {
                if (prev$403.value === '()') {
                    if (isIn(back(2).value, parenIdents$400)) {
                        return scanRegExp();
                    }
                    return advance();
                }
                if (prev$403.value === '{}') {
                    if (back(4).value === 'function') {
                        if (isIn(back(5).value, fnExprTokens$402)) {
                            return advance();
                        }
                        if (toks$393.length - 5 <= 0 && inExprDelim$394) {
                            return advance();
                        }
                    }
                    if (back(3).value === 'function') {
                        if (isIn(back(4).value, fnExprTokens$402)) {
                            return advance();
                        }
                        if (toks$393.length - 4 <= 0 && inExprDelim$394) {
                            return advance();
                        }
                    }
                    return scanRegExp();
                }
                if (prev$403.type === Token$432.Punctuator) {
                    return scanRegExp();
                }
                if (isKeyword(toks$393[toks$393.length - 1].value)) {
                    return scanRegExp();
                }
                return advance();
            }
            return scanRegExp();
        }
        return advance();
    }
    function readDelim() {
        var startDelim$405 = advance(), matchDelim$406 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$407 = [];
        var delimiters$408 = [
                '(',
                '{',
                '['
            ];
        var token$409 = startDelim$405;
        assert(delimiters$408.indexOf(startDelim$405.value) !== -1, 'Need to begin at the delimiter');
        var startLineNumber$410 = token$409.lineNumber;
        var startLineStart$411 = token$409.lineStart;
        var startRange$412 = token$409.range;
        while (index$440 <= length$443) {
            token$409 = readLoop(inner$407, startDelim$405.value === '(' || startDelim$405.value === '[');
            if (token$409.type === Token$432.Punctuator && token$409.value === matchDelim$406[startDelim$405.value]) {
                break;
            } else if (token$409.type === Token$432.EOF) {
                throwError({}, Messages$436.UnexpectedEOS);
            } else {
                inner$407.push(token$409);
            }
        }
        if (index$440 >= length$443 && matchDelim$406[startDelim$405.value] !== source$438[length$443 - 1]) {
            throwError({}, Messages$436.UnexpectedEOS);
        }
        var endLineNumber$413 = token$409.lineNumber;
        var endLineStart$414 = token$409.lineStart;
        var endRange$415 = token$409.range;
        return {
            type: Token$432.Delimiter,
            value: startDelim$405.value + matchDelim$406[startDelim$405.value],
            inner: inner$407,
            startLineNumber: startLineNumber$410,
            startLineStart: startLineStart$411,
            startRange: startRange$412,
            endLineNumber: endLineNumber$413,
            endLineStart: endLineStart$414,
            endRange: endRange$415
        };
    }
    ;
    function read(code$416) {
        var token$418, tokenTree$419 = [];
        source$438 = code$416;
        index$440 = 0;
        lineNumber$441 = source$438.length > 0 ? 1 : 0;
        lineStart$442 = 0;
        length$443 = source$438.length;
        buffer$444 = null;
        state$445 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$440 < length$443) {
            tokenTree$419.push(readLoop(tokenTree$419));
        }
        var last$420 = tokenTree$419[tokenTree$419.length - 1];
        if (last$420 && last$420.type !== Token$432.EOF) {
            tokenTree$419.push({
                type: Token$432.EOF,
                value: '',
                lineNumber: last$420.lineNumber,
                lineStart: last$420.lineStart,
                range: [
                    index$440,
                    index$440
                ]
            });
        }
        return expander$5.tokensToSyntax(tokenTree$419);
    }
    function parse(code$421, nodeType$422, options$423) {
        var program$426, toString$427;
        tokenStream$446 = code$421;
        nodeType$422 = nodeType$422 || 'base';
        index$440 = 0;
        length$443 = tokenStream$446.length;
        buffer$444 = null;
        state$445 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$447 = {};
        if (typeof options$423 !== 'undefined') {
            if (options$423.range || options$423.loc) {
                assert(false, 'Note range and loc is not currently implemented');
            }
            extra$447.range = typeof options$423.range === 'boolean' && options$423.range;
            extra$447.loc = typeof options$423.loc === 'boolean' && options$423.loc;
            extra$447.raw = typeof options$423.raw === 'boolean' && options$423.raw;
            if (typeof options$423.tokens === 'boolean' && options$423.tokens) {
                extra$447.tokens = [];
            }
            if (typeof options$423.comment === 'boolean' && options$423.comment) {
                extra$447.comments = [];
            }
            if (typeof options$423.tolerant === 'boolean' && options$423.tolerant) {
                extra$447.errors = [];
            }
            if (typeof options$423.noresolve === 'boolean' && options$423.noresolve) {
                extra$447.noresolve = options$423.noresolve;
            } else {
                extra$447.noresolve = false;
            }
        }
        patch();
        try {
            var classToParse$428 = {
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
                        state$445.inFunctionBody = true;
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
            if (classToParse$428[nodeType$422]) {
                program$426 = classToParse$428[nodeType$422]();
            } else {
                assert(false, 'unmatched parse class' + nodeType$422);
            }
            if (typeof extra$447.comments !== 'undefined') {
                program$426.comments = extra$447.comments;
            }
            if (typeof extra$447.tokens !== 'undefined') {
                program$426.tokens = tokenStream$446.slice(0, index$440);
            }
            if (typeof extra$447.errors !== 'undefined') {
                program$426.errors = extra$447.errors;
            }
        } catch (e) {
            throw e;
        } finally {
            unpatch();
            extra$447 = {};
        }
        return program$426;
    }
    exports$4.parse = parse;
    exports$4.read = read;
    exports$4.Token = Token$432;
    exports$4.assert = assert;
    exports$4.Syntax = function () {
        var name$430, types$431 = {};
        if (typeof Object.create === 'function') {
            types$431 = Object.create(null);
        }
        for (name$430 in Syntax$434) {
            if (Syntax$434.hasOwnProperty(name$430)) {
                types$431[name$430] = Syntax$434[name$430];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$431);
        }
        return types$431;
    }();
}));