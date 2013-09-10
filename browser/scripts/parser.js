(function (root$91, factory$92) {
    if (typeof exports === 'object') {
        factory$92(exports, require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$92);
    }
}(this, function (exports$93, expander$94) {
    'use strict';
    var Token$95, TokenName$96, Syntax$97, PropertyKind$98, Messages$99, Regex$100, source$101, strict$102, index$103, lineNumber$104, lineStart$105, length$106, buffer$107, state$108, tokenStream$109, extra$110;
    Token$95 = {
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
    TokenName$96 = {};
    TokenName$96[Token$95.BooleanLiteral] = 'Boolean';
    TokenName$96[Token$95.EOF] = '<end>';
    TokenName$96[Token$95.Identifier] = 'Identifier';
    TokenName$96[Token$95.Keyword] = 'Keyword';
    TokenName$96[Token$95.NullLiteral] = 'Null';
    TokenName$96[Token$95.NumericLiteral] = 'Numeric';
    TokenName$96[Token$95.Punctuator] = 'Punctuator';
    TokenName$96[Token$95.StringLiteral] = 'String';
    TokenName$96[Token$95.Delimiter] = 'Delimiter';
    Syntax$97 = {
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
    PropertyKind$98 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    Messages$99 = {
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
    Regex$100 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    function assert$111(condition$226, message$227) {
        if (!condition$226) {
            throw new Error('ASSERT: ' + message$227);
        }
    }
    function isIn$112(el$228, list$229) {
        return list$229.indexOf(el$228) !== -1;
    }
    function sliceSource$113(from$230, to$231) {
        return source$101.slice(from$230, to$231);
    }
    if (typeof 'esprima'[0] === 'undefined') {
        sliceSource$113 = function sliceArraySource$232(from$233, to$234) {
            return source$101.slice(from$233, to$234).join('');
        };
    }
    function isDecimalDigit$114(ch$235) {
        return '0123456789'.indexOf(ch$235) >= 0;
    }
    function isHexDigit$115(ch$236) {
        return '0123456789abcdefABCDEF'.indexOf(ch$236) >= 0;
    }
    function isOctalDigit$116(ch$237) {
        return '01234567'.indexOf(ch$237) >= 0;
    }
    function isWhiteSpace$117(ch$238) {
        return ch$238 === ' ' || ch$238 === '\t' || ch$238 === '\x0B' || ch$238 === '\f' || ch$238 === '\xa0' || ch$238.charCodeAt(0) >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(ch$238) >= 0;
    }
    function isLineTerminator$118(ch$239) {
        return ch$239 === '\n' || ch$239 === '\r' || ch$239 === '\u2028' || ch$239 === '\u2029';
    }
    function isIdentifierStart$119(ch$240) {
        return ch$240 === '$' || ch$240 === '_' || ch$240 === '\\' || ch$240 >= 'a' && ch$240 <= 'z' || ch$240 >= 'A' && ch$240 <= 'Z' || ch$240.charCodeAt(0) >= 128 && Regex$100.NonAsciiIdentifierStart.test(ch$240);
    }
    function isIdentifierPart$120(ch$241) {
        return ch$241 === '$' || ch$241 === '_' || ch$241 === '\\' || ch$241 >= 'a' && ch$241 <= 'z' || ch$241 >= 'A' && ch$241 <= 'Z' || ch$241 >= '0' && ch$241 <= '9' || ch$241.charCodeAt(0) >= 128 && Regex$100.NonAsciiIdentifierPart.test(ch$241);
    }
    function isFutureReservedWord$121(id$242) {
        return false;
    }
    function isStrictModeReservedWord$122(id$243) {
        switch (id$243) {
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
    function isRestrictedWord$123(id$244) {
        return id$244 === 'eval' || id$244 === 'arguments';
    }
    function isKeyword$124(id$245) {
        var keyword$246 = false;
        switch (id$245.length) {
        case 2:
            keyword$246 = id$245 === 'if' || id$245 === 'in' || id$245 === 'do';
            break;
        case 3:
            keyword$246 = id$245 === 'var' || id$245 === 'for' || id$245 === 'new' || id$245 === 'try';
            break;
        case 4:
            keyword$246 = id$245 === 'this' || id$245 === 'else' || id$245 === 'case' || id$245 === 'void' || id$245 === 'with';
            break;
        case 5:
            keyword$246 = id$245 === 'while' || id$245 === 'break' || id$245 === 'catch' || id$245 === 'throw';
            break;
        case 6:
            keyword$246 = id$245 === 'return' || id$245 === 'typeof' || id$245 === 'delete' || id$245 === 'switch';
            break;
        case 7:
            keyword$246 = id$245 === 'default' || id$245 === 'finally';
            break;
        case 8:
            keyword$246 = id$245 === 'function' || id$245 === 'continue' || id$245 === 'debugger';
            break;
        case 10:
            keyword$246 = id$245 === 'instanceof';
            break;
        }
        if (keyword$246) {
            return true;
        }
        switch (id$245) {
        case 'const':
            return true;
        case 'yield':
        case 'let':
            return true;
        }
        if (strict$102 && isStrictModeReservedWord$122(id$245)) {
            return true;
        }
        return isFutureReservedWord$121(id$245);
    }
    function nextChar$125() {
        return source$101[index$103++];
    }
    function getChar$126() {
        return source$101[index$103];
    }
    function skipComment$127() {
        var ch$247, blockComment$248, lineComment$249;
        blockComment$248 = false;
        lineComment$249 = false;
        while (index$103 < length$106) {
            ch$247 = source$101[index$103];
            if (lineComment$249) {
                ch$247 = nextChar$125();
                if (isLineTerminator$118(ch$247)) {
                    lineComment$249 = false;
                    if (ch$247 === '\r' && source$101[index$103] === '\n') {
                        ++index$103;
                    }
                    ++lineNumber$104;
                    lineStart$105 = index$103;
                }
            } else if (blockComment$248) {
                if (isLineTerminator$118(ch$247)) {
                    if (ch$247 === '\r' && source$101[index$103 + 1] === '\n') {
                        ++index$103;
                    }
                    ++lineNumber$104;
                    ++index$103;
                    lineStart$105 = index$103;
                    if (index$103 >= length$106) {
                        throwError$139({}, Messages$99.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$247 = nextChar$125();
                    if (index$103 >= length$106) {
                        throwError$139({}, Messages$99.UnexpectedToken, 'ILLEGAL');
                    }
                    if (ch$247 === '*') {
                        ch$247 = source$101[index$103];
                        if (ch$247 === '/') {
                            ++index$103;
                            blockComment$248 = false;
                        }
                    }
                }
            } else if (ch$247 === '/') {
                ch$247 = source$101[index$103 + 1];
                if (ch$247 === '/') {
                    index$103 += 2;
                    lineComment$249 = true;
                } else if (ch$247 === '*') {
                    index$103 += 2;
                    blockComment$248 = true;
                    if (index$103 >= length$106) {
                        throwError$139({}, Messages$99.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$117(ch$247)) {
                ++index$103;
            } else if (isLineTerminator$118(ch$247)) {
                ++index$103;
                if (ch$247 === '\r' && source$101[index$103] === '\n') {
                    ++index$103;
                }
                ++lineNumber$104;
                lineStart$105 = index$103;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$128(prefix$250) {
        var i$251, len$252, ch$253, code$254 = 0;
        len$252 = prefix$250 === 'u' ? 4 : 2;
        for (i$251 = 0; i$251 < len$252; ++i$251) {
            if (index$103 < length$106 && isHexDigit$115(source$101[index$103])) {
                ch$253 = nextChar$125();
                code$254 = code$254 * 16 + '0123456789abcdef'.indexOf(ch$253.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$254);
    }
    function scanIdentifier$129() {
        var ch$255, start$256, id$257, restore$258;
        ch$255 = source$101[index$103];
        if (!isIdentifierStart$119(ch$255)) {
            return;
        }
        start$256 = index$103;
        if (ch$255 === '\\') {
            ++index$103;
            if (source$101[index$103] !== 'u') {
                return;
            }
            ++index$103;
            restore$258 = index$103;
            ch$255 = scanHexEscape$128('u');
            if (ch$255) {
                if (ch$255 === '\\' || !isIdentifierStart$119(ch$255)) {
                    return;
                }
                id$257 = ch$255;
            } else {
                index$103 = restore$258;
                id$257 = 'u';
            }
        } else {
            id$257 = nextChar$125();
        }
        while (index$103 < length$106) {
            ch$255 = source$101[index$103];
            if (!isIdentifierPart$120(ch$255)) {
                break;
            }
            if (ch$255 === '\\') {
                ++index$103;
                if (source$101[index$103] !== 'u') {
                    return;
                }
                ++index$103;
                restore$258 = index$103;
                ch$255 = scanHexEscape$128('u');
                if (ch$255) {
                    if (ch$255 === '\\' || !isIdentifierPart$120(ch$255)) {
                        return;
                    }
                    id$257 += ch$255;
                } else {
                    index$103 = restore$258;
                    id$257 += 'u';
                }
            } else {
                id$257 += nextChar$125();
            }
        }
        if (id$257.length === 1) {
            return {
                type: Token$95.Identifier,
                value: id$257,
                lineNumber: lineNumber$104,
                lineStart: lineStart$105,
                range: [
                    start$256,
                    index$103
                ]
            };
        }
        if (isKeyword$124(id$257)) {
            return {
                type: Token$95.Keyword,
                value: id$257,
                lineNumber: lineNumber$104,
                lineStart: lineStart$105,
                range: [
                    start$256,
                    index$103
                ]
            };
        }
        if (id$257 === 'null') {
            return {
                type: Token$95.NullLiteral,
                value: id$257,
                lineNumber: lineNumber$104,
                lineStart: lineStart$105,
                range: [
                    start$256,
                    index$103
                ]
            };
        }
        if (id$257 === 'true' || id$257 === 'false') {
            return {
                type: Token$95.BooleanLiteral,
                value: id$257,
                lineNumber: lineNumber$104,
                lineStart: lineStart$105,
                range: [
                    start$256,
                    index$103
                ]
            };
        }
        return {
            type: Token$95.Identifier,
            value: id$257,
            lineNumber: lineNumber$104,
            lineStart: lineStart$105,
            range: [
                start$256,
                index$103
            ]
        };
    }
    function scanPunctuator$130() {
        var start$259 = index$103, ch1$260 = source$101[index$103], ch2$261, ch3$262, ch4$263;
        if (ch1$260 === ';' || ch1$260 === '{' || ch1$260 === '}') {
            ++index$103;
            return {
                type: Token$95.Punctuator,
                value: ch1$260,
                lineNumber: lineNumber$104,
                lineStart: lineStart$105,
                range: [
                    start$259,
                    index$103
                ]
            };
        }
        if (ch1$260 === ',' || ch1$260 === '(' || ch1$260 === ')') {
            ++index$103;
            return {
                type: Token$95.Punctuator,
                value: ch1$260,
                lineNumber: lineNumber$104,
                lineStart: lineStart$105,
                range: [
                    start$259,
                    index$103
                ]
            };
        }
        if (ch1$260 === '#') {
            ++index$103;
            return {
                type: Token$95.Identifier,
                value: ch1$260,
                lineNumber: lineNumber$104,
                lineStart: lineStart$105,
                range: [
                    start$259,
                    index$103
                ]
            };
        }
        ch2$261 = source$101[index$103 + 1];
        if (ch1$260 === '.' && !isDecimalDigit$114(ch2$261)) {
            if (source$101[index$103 + 1] === '.' && source$101[index$103 + 2] === '.') {
                nextChar$125();
                nextChar$125();
                nextChar$125();
                return {
                    type: Token$95.Punctuator,
                    value: '...',
                    lineNumber: lineNumber$104,
                    lineStart: lineStart$105,
                    range: [
                        start$259,
                        index$103
                    ]
                };
            } else {
                return {
                    type: Token$95.Punctuator,
                    value: nextChar$125(),
                    lineNumber: lineNumber$104,
                    lineStart: lineStart$105,
                    range: [
                        start$259,
                        index$103
                    ]
                };
            }
        }
        ch3$262 = source$101[index$103 + 2];
        ch4$263 = source$101[index$103 + 3];
        if (ch1$260 === '>' && ch2$261 === '>' && ch3$262 === '>') {
            if (ch4$263 === '=') {
                index$103 += 4;
                return {
                    type: Token$95.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$104,
                    lineStart: lineStart$105,
                    range: [
                        start$259,
                        index$103
                    ]
                };
            }
        }
        if (ch1$260 === '=' && ch2$261 === '=' && ch3$262 === '=') {
            index$103 += 3;
            return {
                type: Token$95.Punctuator,
                value: '===',
                lineNumber: lineNumber$104,
                lineStart: lineStart$105,
                range: [
                    start$259,
                    index$103
                ]
            };
        }
        if (ch1$260 === '!' && ch2$261 === '=' && ch3$262 === '=') {
            index$103 += 3;
            return {
                type: Token$95.Punctuator,
                value: '!==',
                lineNumber: lineNumber$104,
                lineStart: lineStart$105,
                range: [
                    start$259,
                    index$103
                ]
            };
        }
        if (ch1$260 === '>' && ch2$261 === '>' && ch3$262 === '>') {
            index$103 += 3;
            return {
                type: Token$95.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$104,
                lineStart: lineStart$105,
                range: [
                    start$259,
                    index$103
                ]
            };
        }
        if (ch1$260 === '<' && ch2$261 === '<' && ch3$262 === '=') {
            index$103 += 3;
            return {
                type: Token$95.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$104,
                lineStart: lineStart$105,
                range: [
                    start$259,
                    index$103
                ]
            };
        }
        if (ch1$260 === '>' && ch2$261 === '>' && ch3$262 === '=') {
            index$103 += 3;
            return {
                type: Token$95.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$104,
                lineStart: lineStart$105,
                range: [
                    start$259,
                    index$103
                ]
            };
        }
        if (ch2$261 === '=') {
            if ('<>=!+-*%&|^/'.indexOf(ch1$260) >= 0) {
                index$103 += 2;
                return {
                    type: Token$95.Punctuator,
                    value: ch1$260 + ch2$261,
                    lineNumber: lineNumber$104,
                    lineStart: lineStart$105,
                    range: [
                        start$259,
                        index$103
                    ]
                };
            }
        }
        if (ch1$260 === ch2$261 && '+-<>&|'.indexOf(ch1$260) >= 0) {
            if ('+-<>&|'.indexOf(ch2$261) >= 0) {
                index$103 += 2;
                return {
                    type: Token$95.Punctuator,
                    value: ch1$260 + ch2$261,
                    lineNumber: lineNumber$104,
                    lineStart: lineStart$105,
                    range: [
                        start$259,
                        index$103
                    ]
                };
            }
        }
        if ('[]<>+-*%&|^!~?:=/'.indexOf(ch1$260) >= 0) {
            return {
                type: Token$95.Punctuator,
                value: nextChar$125(),
                lineNumber: lineNumber$104,
                lineStart: lineStart$105,
                range: [
                    start$259,
                    index$103
                ]
            };
        }
    }
    function scanNumericLiteral$131() {
        var number$264, start$265, ch$266;
        ch$266 = source$101[index$103];
        assert$111(isDecimalDigit$114(ch$266) || ch$266 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$265 = index$103;
        number$264 = '';
        if (ch$266 !== '.') {
            number$264 = nextChar$125();
            ch$266 = source$101[index$103];
            if (number$264 === '0') {
                if (ch$266 === 'x' || ch$266 === 'X') {
                    number$264 += nextChar$125();
                    while (index$103 < length$106) {
                        ch$266 = source$101[index$103];
                        if (!isHexDigit$115(ch$266)) {
                            break;
                        }
                        number$264 += nextChar$125();
                    }
                    if (number$264.length <= 2) {
                        throwError$139({}, Messages$99.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$103 < length$106) {
                        ch$266 = source$101[index$103];
                        if (isIdentifierStart$119(ch$266)) {
                            throwError$139({}, Messages$99.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$95.NumericLiteral,
                        value: parseInt(number$264, 16),
                        lineNumber: lineNumber$104,
                        lineStart: lineStart$105,
                        range: [
                            start$265,
                            index$103
                        ]
                    };
                } else if (isOctalDigit$116(ch$266)) {
                    number$264 += nextChar$125();
                    while (index$103 < length$106) {
                        ch$266 = source$101[index$103];
                        if (!isOctalDigit$116(ch$266)) {
                            break;
                        }
                        number$264 += nextChar$125();
                    }
                    if (index$103 < length$106) {
                        ch$266 = source$101[index$103];
                        if (isIdentifierStart$119(ch$266) || isDecimalDigit$114(ch$266)) {
                            throwError$139({}, Messages$99.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$95.NumericLiteral,
                        value: parseInt(number$264, 8),
                        octal: true,
                        lineNumber: lineNumber$104,
                        lineStart: lineStart$105,
                        range: [
                            start$265,
                            index$103
                        ]
                    };
                }
                if (isDecimalDigit$114(ch$266)) {
                    throwError$139({}, Messages$99.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (index$103 < length$106) {
                ch$266 = source$101[index$103];
                if (!isDecimalDigit$114(ch$266)) {
                    break;
                }
                number$264 += nextChar$125();
            }
        }
        if (ch$266 === '.') {
            number$264 += nextChar$125();
            while (index$103 < length$106) {
                ch$266 = source$101[index$103];
                if (!isDecimalDigit$114(ch$266)) {
                    break;
                }
                number$264 += nextChar$125();
            }
        }
        if (ch$266 === 'e' || ch$266 === 'E') {
            number$264 += nextChar$125();
            ch$266 = source$101[index$103];
            if (ch$266 === '+' || ch$266 === '-') {
                number$264 += nextChar$125();
            }
            ch$266 = source$101[index$103];
            if (isDecimalDigit$114(ch$266)) {
                number$264 += nextChar$125();
                while (index$103 < length$106) {
                    ch$266 = source$101[index$103];
                    if (!isDecimalDigit$114(ch$266)) {
                        break;
                    }
                    number$264 += nextChar$125();
                }
            } else {
                ch$266 = 'character ' + ch$266;
                if (index$103 >= length$106) {
                    ch$266 = '<end>';
                }
                throwError$139({}, Messages$99.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (index$103 < length$106) {
            ch$266 = source$101[index$103];
            if (isIdentifierStart$119(ch$266)) {
                throwError$139({}, Messages$99.UnexpectedToken, 'ILLEGAL');
            }
        }
        return {
            type: Token$95.NumericLiteral,
            value: parseFloat(number$264),
            lineNumber: lineNumber$104,
            lineStart: lineStart$105,
            range: [
                start$265,
                index$103
            ]
        };
    }
    function scanStringLiteral$132() {
        var str$267 = '', quote$268, start$269, ch$270, code$271, unescaped$272, restore$273, octal$274 = false;
        quote$268 = source$101[index$103];
        assert$111(quote$268 === '\'' || quote$268 === '"', 'String literal must starts with a quote');
        start$269 = index$103;
        ++index$103;
        while (index$103 < length$106) {
            ch$270 = nextChar$125();
            if (ch$270 === quote$268) {
                quote$268 = '';
                break;
            } else if (ch$270 === '\\') {
                ch$270 = nextChar$125();
                if (!isLineTerminator$118(ch$270)) {
                    switch (ch$270) {
                    case 'n':
                        str$267 += '\n';
                        break;
                    case 'r':
                        str$267 += '\r';
                        break;
                    case 't':
                        str$267 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        restore$273 = index$103;
                        unescaped$272 = scanHexEscape$128(ch$270);
                        if (unescaped$272) {
                            str$267 += unescaped$272;
                        } else {
                            index$103 = restore$273;
                            str$267 += ch$270;
                        }
                        break;
                    case 'b':
                        str$267 += '\b';
                        break;
                    case 'f':
                        str$267 += '\f';
                        break;
                    case 'v':
                        str$267 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$116(ch$270)) {
                            code$271 = '01234567'.indexOf(ch$270);
                            if (code$271 !== 0) {
                                octal$274 = true;
                            }
                            if (index$103 < length$106 && isOctalDigit$116(source$101[index$103])) {
                                octal$274 = true;
                                code$271 = code$271 * 8 + '01234567'.indexOf(nextChar$125());
                                if ('0123'.indexOf(ch$270) >= 0 && index$103 < length$106 && isOctalDigit$116(source$101[index$103])) {
                                    code$271 = code$271 * 8 + '01234567'.indexOf(nextChar$125());
                                }
                            }
                            str$267 += String.fromCharCode(code$271);
                        } else {
                            str$267 += ch$270;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$104;
                    if (ch$270 === '\r' && source$101[index$103] === '\n') {
                        ++index$103;
                    }
                }
            } else if (isLineTerminator$118(ch$270)) {
                break;
            } else {
                str$267 += ch$270;
            }
        }
        if (quote$268 !== '') {
            throwError$139({}, Messages$99.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$95.StringLiteral,
            value: str$267,
            octal: octal$274,
            lineNumber: lineNumber$104,
            lineStart: lineStart$105,
            range: [
                start$269,
                index$103
            ]
        };
    }
    function scanRegExp$133() {
        var str$275 = '', ch$276, start$277, pattern$278, flags$279, value$280, classMarker$281 = false, restore$282;
        buffer$107 = null;
        skipComment$127();
        start$277 = index$103;
        ch$276 = source$101[index$103];
        assert$111(ch$276 === '/', 'Regular expression literal must start with a slash');
        str$275 = nextChar$125();
        while (index$103 < length$106) {
            ch$276 = nextChar$125();
            str$275 += ch$276;
            if (classMarker$281) {
                if (ch$276 === ']') {
                    classMarker$281 = false;
                }
            } else {
                if (ch$276 === '\\') {
                    ch$276 = nextChar$125();
                    if (isLineTerminator$118(ch$276)) {
                        throwError$139({}, Messages$99.UnterminatedRegExp);
                    }
                    str$275 += ch$276;
                } else if (ch$276 === '/') {
                    break;
                } else if (ch$276 === '[') {
                    classMarker$281 = true;
                } else if (isLineTerminator$118(ch$276)) {
                    throwError$139({}, Messages$99.UnterminatedRegExp);
                }
            }
        }
        if (str$275.length === 1) {
            throwError$139({}, Messages$99.UnterminatedRegExp);
        }
        pattern$278 = str$275.substr(1, str$275.length - 2);
        flags$279 = '';
        while (index$103 < length$106) {
            ch$276 = source$101[index$103];
            if (!isIdentifierPart$120(ch$276)) {
                break;
            }
            ++index$103;
            if (ch$276 === '\\' && index$103 < length$106) {
                ch$276 = source$101[index$103];
                if (ch$276 === 'u') {
                    ++index$103;
                    restore$282 = index$103;
                    ch$276 = scanHexEscape$128('u');
                    if (ch$276) {
                        flags$279 += ch$276;
                        str$275 += '\\u';
                        for (; restore$282 < index$103; ++restore$282) {
                            str$275 += source$101[restore$282];
                        }
                    } else {
                        index$103 = restore$282;
                        flags$279 += 'u';
                        str$275 += '\\u';
                    }
                } else {
                    str$275 += '\\';
                }
            } else {
                flags$279 += ch$276;
                str$275 += ch$276;
            }
        }
        try {
            value$280 = new RegExp(pattern$278, flags$279);
        } catch (e$283) {
            throwError$139({}, Messages$99.InvalidRegExp);
        }
        return {
            type: Token$95.RegexLiteral,
            literal: str$275,
            value: value$280,
            lineNumber: lineNumber$104,
            lineStart: lineStart$105,
            range: [
                start$277,
                index$103
            ]
        };
    }
    function isIdentifierName$134(token$284) {
        return token$284.type === Token$95.Identifier || token$284.type === Token$95.Keyword || token$284.type === Token$95.BooleanLiteral || token$284.type === Token$95.NullLiteral;
    }
    function advance$135() {
        var ch$285, token$286;
        skipComment$127();
        if (index$103 >= length$106) {
            return {
                type: Token$95.EOF,
                lineNumber: lineNumber$104,
                lineStart: lineStart$105,
                range: [
                    index$103,
                    index$103
                ]
            };
        }
        ch$285 = source$101[index$103];
        token$286 = scanPunctuator$130();
        if (typeof token$286 !== 'undefined') {
            return token$286;
        }
        if (ch$285 === '\'' || ch$285 === '"') {
            return scanStringLiteral$132();
        }
        if (ch$285 === '.' || isDecimalDigit$114(ch$285)) {
            return scanNumericLiteral$131();
        }
        token$286 = scanIdentifier$129();
        if (typeof token$286 !== 'undefined') {
            return token$286;
        }
        throwError$139({}, Messages$99.UnexpectedToken, 'ILLEGAL');
    }
    function lex$136() {
        var token$287;
        if (buffer$107) {
            token$287 = buffer$107;
            buffer$107 = null;
            index$103++;
            return token$287;
        }
        buffer$107 = null;
        return tokenStream$109[index$103++];
    }
    function lookahead$137() {
        var pos$288, line$289, start$290;
        if (buffer$107 !== null) {
            return buffer$107;
        }
        buffer$107 = tokenStream$109[index$103];
        return buffer$107;
    }
    function peekLineTerminator$138() {
        var pos$291, line$292, start$293, found$294;
        found$294 = tokenStream$109[index$103 - 1].token.lineNumber !== tokenStream$109[index$103].token.lineNumber;
        return found$294;
    }
    function throwError$139(token$295, messageFormat$296) {
        var error$297, args$298 = Array.prototype.slice.call(arguments, 2), msg$299 = messageFormat$296.replace(/%(\d)/g, function (whole$300, index$301) {
                return args$298[index$301] || '';
            });
        if (typeof token$295.lineNumber === 'number') {
            error$297 = new Error('Line ' + token$295.lineNumber + ': ' + msg$299);
            error$297.lineNumber = token$295.lineNumber;
            if (token$295.range && token$295.range.length > 0) {
                error$297.index = token$295.range[0];
                error$297.column = token$295.range[0] - lineStart$105 + 1;
            }
        } else {
            error$297 = new Error('Line ' + lineNumber$104 + ': ' + msg$299);
            error$297.index = index$103;
            error$297.lineNumber = lineNumber$104;
            error$297.column = index$103 - lineStart$105 + 1;
        }
        throw error$297;
    }
    function throwErrorTolerant$140() {
        var error$302;
        try {
            throwError$139.apply(null, arguments);
        } catch (e$303) {
            if (extra$110.errors) {
                extra$110.errors.push(e$303);
            } else {
                throw e$303;
            }
        }
    }
    function throwUnexpected$141(token$304) {
        var s$305;
        if (token$304.type === Token$95.EOF) {
            throwError$139(token$304, Messages$99.UnexpectedEOS);
        }
        if (token$304.type === Token$95.NumericLiteral) {
            throwError$139(token$304, Messages$99.UnexpectedNumber);
        }
        if (token$304.type === Token$95.StringLiteral) {
            throwError$139(token$304, Messages$99.UnexpectedString);
        }
        if (token$304.type === Token$95.Identifier) {
            console.log(token$304);
            throwError$139(token$304, Messages$99.UnexpectedIdentifier);
        }
        if (token$304.type === Token$95.Keyword) {
            if (isFutureReservedWord$121(token$304.value)) {
                throwError$139(token$304, Messages$99.UnexpectedReserved);
            } else if (strict$102 && isStrictModeReservedWord$122(token$304.value)) {
                throwError$139(token$304, Messages$99.StrictReservedWord);
            }
            throwError$139(token$304, Messages$99.UnexpectedToken, token$304.value);
        }
        throwError$139(token$304, Messages$99.UnexpectedToken, token$304.value);
    }
    function expect$142(value$306) {
        var token$307 = lex$136().token;
        if (token$307.type !== Token$95.Punctuator || token$307.value !== value$306) {
            throwUnexpected$141(token$307);
        }
    }
    function expectKeyword$143(keyword$308) {
        var token$309 = lex$136().token;
        if (token$309.type !== Token$95.Keyword || token$309.value !== keyword$308) {
            throwUnexpected$141(token$309);
        }
    }
    function match$144(value$310) {
        var token$311 = lookahead$137().token;
        return token$311.type === Token$95.Punctuator && token$311.value === value$310;
    }
    function matchKeyword$145(keyword$312) {
        var token$313 = lookahead$137().token;
        return token$313.type === Token$95.Keyword && token$313.value === keyword$312;
    }
    function matchAssign$146() {
        var token$314 = lookahead$137().token, op$315 = token$314.value;
        if (token$314.type !== Token$95.Punctuator) {
            return false;
        }
        return op$315 === '=' || op$315 === '*=' || op$315 === '/=' || op$315 === '%=' || op$315 === '+=' || op$315 === '-=' || op$315 === '<<=' || op$315 === '>>=' || op$315 === '>>>=' || op$315 === '&=' || op$315 === '^=' || op$315 === '|=';
    }
    function consumeSemicolon$147() {
        var token$316, line$317;
        if (tokenStream$109[index$103].token.value === ';') {
            lex$136().token;
            return;
        }
        line$317 = tokenStream$109[index$103 - 1].token.lineNumber;
        token$316 = tokenStream$109[index$103].token;
        if (line$317 !== token$316.lineNumber) {
            return;
        }
        if (token$316.type !== Token$95.EOF && !match$144('}')) {
            throwUnexpected$141(token$316);
        }
        return;
    }
    function isLeftHandSide$148(expr$318) {
        return expr$318.type === Syntax$97.Identifier || expr$318.type === Syntax$97.MemberExpression;
    }
    function parseArrayInitialiser$149() {
        var elements$319 = [], undef$320;
        expect$142('[');
        while (!match$144(']')) {
            if (match$144(',')) {
                lex$136().token;
                elements$319.push(undef$320);
            } else {
                elements$319.push(parseAssignmentExpression$178());
                if (!match$144(']')) {
                    expect$142(',');
                }
            }
        }
        expect$142(']');
        return {
            type: Syntax$97.ArrayExpression,
            elements: elements$319
        };
    }
    function parsePropertyFunction$150(param$321, first$322) {
        var previousStrict$323, body$324;
        previousStrict$323 = strict$102;
        body$324 = parseFunctionSourceElements$205();
        if (first$322 && strict$102 && isRestrictedWord$123(param$321[0].name)) {
            throwError$139(first$322, Messages$99.StrictParamName);
        }
        strict$102 = previousStrict$323;
        return {
            type: Syntax$97.FunctionExpression,
            id: null,
            params: param$321,
            body: body$324
        };
    }
    function parseObjectPropertyKey$151() {
        var token$325 = lex$136().token;
        if (token$325.type === Token$95.StringLiteral || token$325.type === Token$95.NumericLiteral) {
            if (strict$102 && token$325.octal) {
                throwError$139(token$325, Messages$99.StrictOctalLiteral);
            }
            return createLiteral$215(token$325);
        }
        return {
            type: Syntax$97.Identifier,
            name: token$325.value
        };
    }
    function parseObjectProperty$152() {
        var token$326, key$327, id$328, param$329;
        token$326 = lookahead$137().token;
        if (token$326.type === Token$95.Identifier) {
            id$328 = parseObjectPropertyKey$151();
            if (token$326.value === 'get' && !match$144(':')) {
                key$327 = parseObjectPropertyKey$151();
                expect$142('(');
                expect$142(')');
                return {
                    type: Syntax$97.Property,
                    key: key$327,
                    value: parsePropertyFunction$150([]),
                    kind: 'get'
                };
            } else if (token$326.value === 'set' && !match$144(':')) {
                key$327 = parseObjectPropertyKey$151();
                expect$142('(');
                token$326 = lookahead$137().token;
                if (token$326.type !== Token$95.Identifier) {
                    throwUnexpected$141(lex$136().token);
                }
                param$329 = [parseVariableIdentifier$182()];
                expect$142(')');
                return {
                    type: Syntax$97.Property,
                    key: key$327,
                    value: parsePropertyFunction$150(param$329, token$326),
                    kind: 'set'
                };
            } else {
                expect$142(':');
                return {
                    type: Syntax$97.Property,
                    key: id$328,
                    value: parseAssignmentExpression$178(),
                    kind: 'init'
                };
            }
        } else if (token$326.type === Token$95.EOF || token$326.type === Token$95.Punctuator) {
            throwUnexpected$141(token$326);
        } else {
            key$327 = parseObjectPropertyKey$151();
            expect$142(':');
            return {
                type: Syntax$97.Property,
                key: key$327,
                value: parseAssignmentExpression$178(),
                kind: 'init'
            };
        }
    }
    function parseObjectInitialiser$153() {
        var token$330, properties$331 = [], property$332, name$333, kind$334, map$335 = {}, toString$336 = String;
        expect$142('{');
        while (!match$144('}')) {
            property$332 = parseObjectProperty$152();
            if (property$332.key.type === Syntax$97.Identifier) {
                name$333 = property$332.key.name;
            } else {
                name$333 = toString$336(property$332.key.value);
            }
            kind$334 = property$332.kind === 'init' ? PropertyKind$98.Data : property$332.kind === 'get' ? PropertyKind$98.Get : PropertyKind$98.Set;
            if (Object.prototype.hasOwnProperty.call(map$335, name$333)) {
                if (map$335[name$333] === PropertyKind$98.Data) {
                    if (strict$102 && kind$334 === PropertyKind$98.Data) {
                        throwErrorTolerant$140({}, Messages$99.StrictDuplicateProperty);
                    } else if (kind$334 !== PropertyKind$98.Data) {
                        throwError$139({}, Messages$99.AccessorDataProperty);
                    }
                } else {
                    if (kind$334 === PropertyKind$98.Data) {
                        throwError$139({}, Messages$99.AccessorDataProperty);
                    } else if (map$335[name$333] & kind$334) {
                        throwError$139({}, Messages$99.AccessorGetSet);
                    }
                }
                map$335[name$333] |= kind$334;
            } else {
                map$335[name$333] = kind$334;
            }
            properties$331.push(property$332);
            if (!match$144('}')) {
                expect$142(',');
            }
        }
        expect$142('}');
        return {
            type: Syntax$97.ObjectExpression,
            properties: properties$331
        };
    }
    function parsePrimaryExpression$154() {
        var expr$337, token$338 = lookahead$137().token, type$339 = token$338.type;
        if (type$339 === Token$95.Identifier) {
            var name$340 = expander$94.resolve(lex$136());
            return {
                type: Syntax$97.Identifier,
                name: name$340
            };
        }
        if (type$339 === Token$95.StringLiteral || type$339 === Token$95.NumericLiteral) {
            if (strict$102 && token$338.octal) {
                throwErrorTolerant$140(token$338, Messages$99.StrictOctalLiteral);
            }
            return createLiteral$215(lex$136().token);
        }
        if (type$339 === Token$95.Keyword) {
            if (matchKeyword$145('this')) {
                lex$136().token;
                return { type: Syntax$97.ThisExpression };
            }
            if (matchKeyword$145('function')) {
                return parseFunctionExpression$207();
            }
        }
        if (type$339 === Token$95.BooleanLiteral) {
            lex$136();
            token$338.value = token$338.value === 'true';
            return createLiteral$215(token$338);
        }
        if (type$339 === Token$95.NullLiteral) {
            lex$136();
            token$338.value = null;
            return createLiteral$215(token$338);
        }
        if (match$144('[')) {
            return parseArrayInitialiser$149();
        }
        if (match$144('{')) {
            return parseObjectInitialiser$153();
        }
        if (match$144('(')) {
            lex$136();
            state$108.lastParenthesized = expr$337 = parseExpression$179();
            expect$142(')');
            return expr$337;
        }
        if (token$338.value instanceof RegExp) {
            return createLiteral$215(lex$136().token);
        }
        return throwUnexpected$141(lex$136().token);
    }
    function parseArguments$155() {
        var args$341 = [];
        expect$142('(');
        if (!match$144(')')) {
            while (index$103 < length$106) {
                args$341.push(parseAssignmentExpression$178());
                if (match$144(')')) {
                    break;
                }
                expect$142(',');
            }
        }
        expect$142(')');
        return args$341;
    }
    function parseNonComputedProperty$156() {
        var token$342 = lex$136().token;
        if (!isIdentifierName$134(token$342)) {
            throwUnexpected$141(token$342);
        }
        return {
            type: Syntax$97.Identifier,
            name: token$342.value
        };
    }
    function parseNonComputedMember$157(object$343) {
        return {
            type: Syntax$97.MemberExpression,
            computed: false,
            object: object$343,
            property: parseNonComputedProperty$156()
        };
    }
    function parseComputedMember$158(object$344) {
        var property$345, expr$346;
        expect$142('[');
        property$345 = parseExpression$179();
        expr$346 = {
            type: Syntax$97.MemberExpression,
            computed: true,
            object: object$344,
            property: property$345
        };
        expect$142(']');
        return expr$346;
    }
    function parseCallMember$159(object$347) {
        return {
            type: Syntax$97.CallExpression,
            callee: object$347,
            'arguments': parseArguments$155()
        };
    }
    function parseNewExpression$160() {
        var expr$348;
        expectKeyword$143('new');
        expr$348 = {
            type: Syntax$97.NewExpression,
            callee: parseLeftHandSideExpression$164(),
            'arguments': []
        };
        if (match$144('(')) {
            expr$348['arguments'] = parseArguments$155();
        }
        return expr$348;
    }
    function toArrayNode$161(arr$349) {
        var els$350 = arr$349.map(function (el$351) {
                return {
                    type: 'Literal',
                    value: el$351,
                    raw: el$351.toString()
                };
            });
        return {
            type: 'ArrayExpression',
            elements: els$350
        };
    }
    function toObjectNode$162(obj$352) {
        var props$353 = Object.keys(obj$352).map(function (key$354) {
                var raw$355 = obj$352[key$354];
                var value$356;
                if (Array.isArray(raw$355)) {
                    value$356 = toArrayNode$161(raw$355);
                } else {
                    value$356 = {
                        type: 'Literal',
                        value: obj$352[key$354],
                        raw: obj$352[key$354].toString()
                    };
                }
                return {
                    type: 'Property',
                    key: {
                        type: 'Identifier',
                        name: key$354
                    },
                    value: value$356,
                    kind: 'init'
                };
            });
        return {
            type: 'ObjectExpression',
            properties: props$353
        };
    }
    function parseLeftHandSideExpressionAllowCall$163() {
        var useNew$357, expr$358;
        useNew$357 = matchKeyword$145('new');
        expr$358 = useNew$357 ? parseNewExpression$160() : parsePrimaryExpression$154();
        while (index$103 < length$106) {
            if (match$144('.')) {
                lex$136();
                expr$358 = parseNonComputedMember$157(expr$358);
            } else if (match$144('[')) {
                expr$358 = parseComputedMember$158(expr$358);
            } else if (match$144('(')) {
                expr$358 = parseCallMember$159(expr$358);
            } else {
                break;
            }
        }
        return expr$358;
    }
    function parseLeftHandSideExpression$164() {
        var useNew$359, expr$360;
        useNew$359 = matchKeyword$145('new');
        expr$360 = useNew$359 ? parseNewExpression$160() : parsePrimaryExpression$154();
        while (index$103 < length$106) {
            if (match$144('.')) {
                lex$136();
                expr$360 = parseNonComputedMember$157(expr$360);
            } else if (match$144('[')) {
                expr$360 = parseComputedMember$158(expr$360);
            } else {
                break;
            }
        }
        return expr$360;
    }
    function parsePostfixExpression$165() {
        var expr$361 = parseLeftHandSideExpressionAllowCall$163();
        if ((match$144('++') || match$144('--')) && !peekLineTerminator$138()) {
            if (strict$102 && expr$361.type === Syntax$97.Identifier && isRestrictedWord$123(expr$361.name)) {
                throwError$139({}, Messages$99.StrictLHSPostfix);
            }
            if (!isLeftHandSide$148(expr$361)) {
                throwError$139({}, Messages$99.InvalidLHSInAssignment);
            }
            expr$361 = {
                type: Syntax$97.UpdateExpression,
                operator: lex$136().token.value,
                argument: expr$361,
                prefix: false
            };
        }
        return expr$361;
    }
    function parseUnaryExpression$166() {
        var token$362, expr$363;
        if (match$144('++') || match$144('--')) {
            token$362 = lex$136().token;
            expr$363 = parseUnaryExpression$166();
            if (strict$102 && expr$363.type === Syntax$97.Identifier && isRestrictedWord$123(expr$363.name)) {
                throwError$139({}, Messages$99.StrictLHSPrefix);
            }
            if (!isLeftHandSide$148(expr$363)) {
                throwError$139({}, Messages$99.InvalidLHSInAssignment);
            }
            expr$363 = {
                type: Syntax$97.UpdateExpression,
                operator: token$362.value,
                argument: expr$363,
                prefix: true
            };
            return expr$363;
        }
        if (match$144('+') || match$144('-') || match$144('~') || match$144('!')) {
            expr$363 = {
                type: Syntax$97.UnaryExpression,
                operator: lex$136().token.value,
                argument: parseUnaryExpression$166()
            };
            return expr$363;
        }
        if (matchKeyword$145('delete') || matchKeyword$145('void') || matchKeyword$145('typeof')) {
            expr$363 = {
                type: Syntax$97.UnaryExpression,
                operator: lex$136().token.value,
                argument: parseUnaryExpression$166()
            };
            if (strict$102 && expr$363.operator === 'delete' && expr$363.argument.type === Syntax$97.Identifier) {
                throwErrorTolerant$140({}, Messages$99.StrictDelete);
            }
            return expr$363;
        }
        return parsePostfixExpression$165();
    }
    function parseMultiplicativeExpression$167() {
        var expr$364 = parseUnaryExpression$166();
        while (match$144('*') || match$144('/') || match$144('%')) {
            expr$364 = {
                type: Syntax$97.BinaryExpression,
                operator: lex$136().token.value,
                left: expr$364,
                right: parseUnaryExpression$166()
            };
        }
        return expr$364;
    }
    function parseAdditiveExpression$168() {
        var expr$365 = parseMultiplicativeExpression$167();
        while (match$144('+') || match$144('-')) {
            expr$365 = {
                type: Syntax$97.BinaryExpression,
                operator: lex$136().token.value,
                left: expr$365,
                right: parseMultiplicativeExpression$167()
            };
        }
        return expr$365;
    }
    function parseShiftExpression$169() {
        var expr$366 = parseAdditiveExpression$168();
        while (match$144('<<') || match$144('>>') || match$144('>>>')) {
            expr$366 = {
                type: Syntax$97.BinaryExpression,
                operator: lex$136().token.value,
                left: expr$366,
                right: parseAdditiveExpression$168()
            };
        }
        return expr$366;
    }
    function parseRelationalExpression$170() {
        var expr$367, previousAllowIn$368;
        previousAllowIn$368 = state$108.allowIn;
        state$108.allowIn = true;
        expr$367 = parseShiftExpression$169();
        while (match$144('<') || match$144('>') || match$144('<=') || match$144('>=') || previousAllowIn$368 && matchKeyword$145('in') || matchKeyword$145('instanceof')) {
            expr$367 = {
                type: Syntax$97.BinaryExpression,
                operator: lex$136().token.value,
                left: expr$367,
                right: parseRelationalExpression$170()
            };
        }
        state$108.allowIn = previousAllowIn$368;
        return expr$367;
    }
    function parseEqualityExpression$171() {
        var expr$369 = parseRelationalExpression$170();
        while (match$144('==') || match$144('!=') || match$144('===') || match$144('!==')) {
            expr$369 = {
                type: Syntax$97.BinaryExpression,
                operator: lex$136().token.value,
                left: expr$369,
                right: parseRelationalExpression$170()
            };
        }
        return expr$369;
    }
    function parseBitwiseANDExpression$172() {
        var expr$370 = parseEqualityExpression$171();
        while (match$144('&')) {
            lex$136();
            expr$370 = {
                type: Syntax$97.BinaryExpression,
                operator: '&',
                left: expr$370,
                right: parseEqualityExpression$171()
            };
        }
        return expr$370;
    }
    function parseBitwiseXORExpression$173() {
        var expr$371 = parseBitwiseANDExpression$172();
        while (match$144('^')) {
            lex$136();
            expr$371 = {
                type: Syntax$97.BinaryExpression,
                operator: '^',
                left: expr$371,
                right: parseBitwiseANDExpression$172()
            };
        }
        return expr$371;
    }
    function parseBitwiseORExpression$174() {
        var expr$372 = parseBitwiseXORExpression$173();
        while (match$144('|')) {
            lex$136();
            expr$372 = {
                type: Syntax$97.BinaryExpression,
                operator: '|',
                left: expr$372,
                right: parseBitwiseXORExpression$173()
            };
        }
        return expr$372;
    }
    function parseLogicalANDExpression$175() {
        var expr$373 = parseBitwiseORExpression$174();
        while (match$144('&&')) {
            lex$136();
            expr$373 = {
                type: Syntax$97.LogicalExpression,
                operator: '&&',
                left: expr$373,
                right: parseBitwiseORExpression$174()
            };
        }
        return expr$373;
    }
    function parseLogicalORExpression$176() {
        var expr$374 = parseLogicalANDExpression$175();
        while (match$144('||')) {
            lex$136();
            expr$374 = {
                type: Syntax$97.LogicalExpression,
                operator: '||',
                left: expr$374,
                right: parseLogicalANDExpression$175()
            };
        }
        return expr$374;
    }
    function parseConditionalExpression$177() {
        var expr$375, previousAllowIn$376, consequent$377;
        expr$375 = parseLogicalORExpression$176();
        if (match$144('?')) {
            lex$136();
            previousAllowIn$376 = state$108.allowIn;
            state$108.allowIn = true;
            consequent$377 = parseAssignmentExpression$178();
            state$108.allowIn = previousAllowIn$376;
            expect$142(':');
            expr$375 = {
                type: Syntax$97.ConditionalExpression,
                test: expr$375,
                consequent: consequent$377,
                alternate: parseAssignmentExpression$178()
            };
        }
        return expr$375;
    }
    function parseAssignmentExpression$178() {
        var expr$378;
        expr$378 = parseConditionalExpression$177();
        if (matchAssign$146()) {
            if (!isLeftHandSide$148(expr$378)) {
                throwError$139({}, Messages$99.InvalidLHSInAssignment);
            }
            if (strict$102 && expr$378.type === Syntax$97.Identifier && isRestrictedWord$123(expr$378.name)) {
                throwError$139({}, Messages$99.StrictLHSAssignment);
            }
            expr$378 = {
                type: Syntax$97.AssignmentExpression,
                operator: lex$136().token.value,
                left: expr$378,
                right: parseAssignmentExpression$178()
            };
        }
        return expr$378;
    }
    function parseExpression$179() {
        var expr$379 = parseAssignmentExpression$178();
        if (match$144(',')) {
            expr$379 = {
                type: Syntax$97.SequenceExpression,
                expressions: [expr$379]
            };
            while (index$103 < length$106) {
                if (!match$144(',')) {
                    break;
                }
                lex$136();
                expr$379.expressions.push(parseAssignmentExpression$178());
            }
        }
        return expr$379;
    }
    function parseStatementList$180() {
        var list$380 = [], statement$381;
        while (index$103 < length$106) {
            if (match$144('}')) {
                break;
            }
            statement$381 = parseSourceElement$208();
            if (typeof statement$381 === 'undefined') {
                break;
            }
            list$380.push(statement$381);
        }
        return list$380;
    }
    function parseBlock$181() {
        var block$382;
        expect$142('{');
        block$382 = parseStatementList$180();
        expect$142('}');
        return {
            type: Syntax$97.BlockStatement,
            body: block$382
        };
    }
    function parseVariableIdentifier$182() {
        var stx$383 = lex$136(), token$384 = stx$383.token;
        if (token$384.type !== Token$95.Identifier) {
            throwUnexpected$141(token$384);
        }
        var name$385 = expander$94.resolve(stx$383);
        return {
            type: Syntax$97.Identifier,
            name: name$385
        };
    }
    function parseVariableDeclaration$183(kind$386) {
        var id$387 = parseVariableIdentifier$182(), init$388 = null;
        if (strict$102 && isRestrictedWord$123(id$387.name)) {
            throwErrorTolerant$140({}, Messages$99.StrictVarName);
        }
        if (kind$386 === 'const') {
            expect$142('=');
            init$388 = parseAssignmentExpression$178();
        } else if (match$144('=')) {
            lex$136();
            init$388 = parseAssignmentExpression$178();
        }
        return {
            type: Syntax$97.VariableDeclarator,
            id: id$387,
            init: init$388
        };
    }
    function parseVariableDeclarationList$184(kind$389) {
        var list$390 = [];
        while (index$103 < length$106) {
            list$390.push(parseVariableDeclaration$183(kind$389));
            if (!match$144(',')) {
                break;
            }
            lex$136();
        }
        return list$390;
    }
    function parseVariableStatement$185() {
        var declarations$391;
        expectKeyword$143('var');
        declarations$391 = parseVariableDeclarationList$184();
        consumeSemicolon$147();
        return {
            type: Syntax$97.VariableDeclaration,
            declarations: declarations$391,
            kind: 'var'
        };
    }
    function parseConstLetDeclaration$186(kind$392) {
        var declarations$393;
        expectKeyword$143(kind$392);
        declarations$393 = parseVariableDeclarationList$184(kind$392);
        consumeSemicolon$147();
        return {
            type: Syntax$97.VariableDeclaration,
            declarations: declarations$393,
            kind: kind$392
        };
    }
    function parseEmptyStatement$187() {
        expect$142(';');
        return { type: Syntax$97.EmptyStatement };
    }
    function parseExpressionStatement$188() {
        var expr$394 = parseExpression$179();
        consumeSemicolon$147();
        return {
            type: Syntax$97.ExpressionStatement,
            expression: expr$394
        };
    }
    function parseIfStatement$189() {
        var test$395, consequent$396, alternate$397;
        expectKeyword$143('if');
        expect$142('(');
        test$395 = parseExpression$179();
        expect$142(')');
        consequent$396 = parseStatement$204();
        if (matchKeyword$145('else')) {
            lex$136();
            alternate$397 = parseStatement$204();
        } else {
            alternate$397 = null;
        }
        return {
            type: Syntax$97.IfStatement,
            test: test$395,
            consequent: consequent$396,
            alternate: alternate$397
        };
    }
    function parseDoWhileStatement$190() {
        var body$398, test$399, oldInIteration$400;
        expectKeyword$143('do');
        oldInIteration$400 = state$108.inIteration;
        state$108.inIteration = true;
        body$398 = parseStatement$204();
        state$108.inIteration = oldInIteration$400;
        expectKeyword$143('while');
        expect$142('(');
        test$399 = parseExpression$179();
        expect$142(')');
        if (match$144(';')) {
            lex$136();
        }
        return {
            type: Syntax$97.DoWhileStatement,
            body: body$398,
            test: test$399
        };
    }
    function parseWhileStatement$191() {
        var test$401, body$402, oldInIteration$403;
        expectKeyword$143('while');
        expect$142('(');
        test$401 = parseExpression$179();
        expect$142(')');
        oldInIteration$403 = state$108.inIteration;
        state$108.inIteration = true;
        body$402 = parseStatement$204();
        state$108.inIteration = oldInIteration$403;
        return {
            type: Syntax$97.WhileStatement,
            test: test$401,
            body: body$402
        };
    }
    function parseForVariableDeclaration$192() {
        var token$404 = lex$136().token;
        return {
            type: Syntax$97.VariableDeclaration,
            declarations: parseVariableDeclarationList$184(),
            kind: token$404.value
        };
    }
    function parseForStatement$193() {
        var init$405, test$406, update$407, left$408, right$409, body$410, oldInIteration$411;
        init$405 = test$406 = update$407 = null;
        expectKeyword$143('for');
        expect$142('(');
        if (match$144(';')) {
            lex$136();
        } else {
            if (matchKeyword$145('var') || matchKeyword$145('let')) {
                state$108.allowIn = false;
                init$405 = parseForVariableDeclaration$192();
                state$108.allowIn = true;
                if (init$405.declarations.length === 1 && matchKeyword$145('in')) {
                    lex$136();
                    left$408 = init$405;
                    right$409 = parseExpression$179();
                    init$405 = null;
                }
            } else {
                state$108.allowIn = false;
                init$405 = parseExpression$179();
                state$108.allowIn = true;
                if (matchKeyword$145('in')) {
                    if (!isLeftHandSide$148(init$405)) {
                        throwError$139({}, Messages$99.InvalidLHSInForIn);
                    }
                    lex$136();
                    left$408 = init$405;
                    right$409 = parseExpression$179();
                    init$405 = null;
                }
            }
            if (typeof left$408 === 'undefined') {
                expect$142(';');
            }
        }
        if (typeof left$408 === 'undefined') {
            if (!match$144(';')) {
                test$406 = parseExpression$179();
            }
            expect$142(';');
            if (!match$144(')')) {
                update$407 = parseExpression$179();
            }
        }
        expect$142(')');
        oldInIteration$411 = state$108.inIteration;
        state$108.inIteration = true;
        body$410 = parseStatement$204();
        state$108.inIteration = oldInIteration$411;
        if (typeof left$408 === 'undefined') {
            return {
                type: Syntax$97.ForStatement,
                init: init$405,
                test: test$406,
                update: update$407,
                body: body$410
            };
        }
        return {
            type: Syntax$97.ForInStatement,
            left: left$408,
            right: right$409,
            body: body$410,
            each: false
        };
    }
    function parseContinueStatement$194() {
        var token$412, label$413 = null;
        expectKeyword$143('continue');
        if (tokenStream$109[index$103].token.value === ';') {
            lex$136();
            if (!state$108.inIteration) {
                throwError$139({}, Messages$99.IllegalContinue);
            }
            return {
                type: Syntax$97.ContinueStatement,
                label: null
            };
        }
        if (peekLineTerminator$138()) {
            if (!state$108.inIteration) {
                throwError$139({}, Messages$99.IllegalContinue);
            }
            return {
                type: Syntax$97.ContinueStatement,
                label: null
            };
        }
        token$412 = lookahead$137().token;
        if (token$412.type === Token$95.Identifier) {
            label$413 = parseVariableIdentifier$182();
            if (!Object.prototype.hasOwnProperty.call(state$108.labelSet, label$413.name)) {
                throwError$139({}, Messages$99.UnknownLabel, label$413.name);
            }
        }
        consumeSemicolon$147();
        if (label$413 === null && !state$108.inIteration) {
            throwError$139({}, Messages$99.IllegalContinue);
        }
        return {
            type: Syntax$97.ContinueStatement,
            label: label$413
        };
    }
    function parseBreakStatement$195() {
        var token$414, label$415 = null;
        expectKeyword$143('break');
        if (peekLineTerminator$138()) {
            if (!(state$108.inIteration || state$108.inSwitch)) {
                throwError$139({}, Messages$99.IllegalBreak);
            }
            return {
                type: Syntax$97.BreakStatement,
                label: null
            };
        }
        token$414 = lookahead$137().token;
        if (token$414.type === Token$95.Identifier) {
            label$415 = parseVariableIdentifier$182();
            if (!Object.prototype.hasOwnProperty.call(state$108.labelSet, label$415.name)) {
                throwError$139({}, Messages$99.UnknownLabel, label$415.name);
            }
        }
        consumeSemicolon$147();
        if (label$415 === null && !(state$108.inIteration || state$108.inSwitch)) {
            throwError$139({}, Messages$99.IllegalBreak);
        }
        return {
            type: Syntax$97.BreakStatement,
            label: label$415
        };
    }
    function parseReturnStatement$196() {
        var token$416, argument$417 = null;
        expectKeyword$143('return');
        if (!state$108.inFunctionBody) {
            throwErrorTolerant$140({}, Messages$99.IllegalReturn);
        }
        if (peekLineTerminator$138()) {
            return {
                type: Syntax$97.ReturnStatement,
                argument: null
            };
        }
        if (!match$144(';')) {
            token$416 = lookahead$137().token;
            if (!match$144('}') && token$416.type !== Token$95.EOF) {
                argument$417 = parseExpression$179();
            }
        }
        consumeSemicolon$147();
        return {
            type: Syntax$97.ReturnStatement,
            argument: argument$417
        };
    }
    function parseWithStatement$197() {
        var object$418, body$419;
        if (strict$102) {
            throwErrorTolerant$140({}, Messages$99.StrictModeWith);
        }
        expectKeyword$143('with');
        expect$142('(');
        object$418 = parseExpression$179();
        expect$142(')');
        body$419 = parseStatement$204();
        return {
            type: Syntax$97.WithStatement,
            object: object$418,
            body: body$419
        };
    }
    function parseSwitchCase$198() {
        var test$420, consequent$421 = [], statement$422;
        if (matchKeyword$145('default')) {
            lex$136();
            test$420 = null;
        } else {
            expectKeyword$143('case');
            test$420 = parseExpression$179();
        }
        expect$142(':');
        while (index$103 < length$106) {
            if (match$144('}') || matchKeyword$145('default') || matchKeyword$145('case')) {
                break;
            }
            statement$422 = parseStatement$204();
            if (typeof statement$422 === 'undefined') {
                break;
            }
            consequent$421.push(statement$422);
        }
        return {
            type: Syntax$97.SwitchCase,
            test: test$420,
            consequent: consequent$421
        };
    }
    function parseSwitchStatement$199() {
        var discriminant$423, cases$424, oldInSwitch$425;
        expectKeyword$143('switch');
        expect$142('(');
        discriminant$423 = parseExpression$179();
        expect$142(')');
        expect$142('{');
        if (match$144('}')) {
            lex$136();
            return {
                type: Syntax$97.SwitchStatement,
                discriminant: discriminant$423
            };
        }
        cases$424 = [];
        oldInSwitch$425 = state$108.inSwitch;
        state$108.inSwitch = true;
        while (index$103 < length$106) {
            if (match$144('}')) {
                break;
            }
            cases$424.push(parseSwitchCase$198());
        }
        state$108.inSwitch = oldInSwitch$425;
        expect$142('}');
        return {
            type: Syntax$97.SwitchStatement,
            discriminant: discriminant$423,
            cases: cases$424
        };
    }
    function parseThrowStatement$200() {
        var argument$426;
        expectKeyword$143('throw');
        if (peekLineTerminator$138()) {
            throwError$139({}, Messages$99.NewlineAfterThrow);
        }
        argument$426 = parseExpression$179();
        consumeSemicolon$147();
        return {
            type: Syntax$97.ThrowStatement,
            argument: argument$426
        };
    }
    function parseCatchClause$201() {
        var param$427;
        expectKeyword$143('catch');
        expect$142('(');
        if (!match$144(')')) {
            param$427 = parseExpression$179();
            if (strict$102 && param$427.type === Syntax$97.Identifier && isRestrictedWord$123(param$427.name)) {
                throwErrorTolerant$140({}, Messages$99.StrictCatchVariable);
            }
        }
        expect$142(')');
        return {
            type: Syntax$97.CatchClause,
            param: param$427,
            guard: null,
            body: parseBlock$181()
        };
    }
    function parseTryStatement$202() {
        var block$428, handlers$429 = [], finalizer$430 = null;
        expectKeyword$143('try');
        block$428 = parseBlock$181();
        if (matchKeyword$145('catch')) {
            handlers$429.push(parseCatchClause$201());
        }
        if (matchKeyword$145('finally')) {
            lex$136();
            finalizer$430 = parseBlock$181();
        }
        if (handlers$429.length === 0 && !finalizer$430) {
            throwError$139({}, Messages$99.NoCatchOrFinally);
        }
        return {
            type: Syntax$97.TryStatement,
            block: block$428,
            handlers: handlers$429,
            finalizer: finalizer$430
        };
    }
    function parseDebuggerStatement$203() {
        expectKeyword$143('debugger');
        consumeSemicolon$147();
        return { type: Syntax$97.DebuggerStatement };
    }
    function parseStatement$204() {
        var token$431 = lookahead$137().token, expr$432, labeledBody$433;
        if (token$431.type === Token$95.EOF) {
            throwUnexpected$141(token$431);
        }
        if (token$431.type === Token$95.Punctuator) {
            switch (token$431.value) {
            case ';':
                return parseEmptyStatement$187();
            case '{':
                return parseBlock$181();
            case '(':
                return parseExpressionStatement$188();
            default:
                break;
            }
        }
        if (token$431.type === Token$95.Keyword) {
            switch (token$431.value) {
            case 'break':
                return parseBreakStatement$195();
            case 'continue':
                return parseContinueStatement$194();
            case 'debugger':
                return parseDebuggerStatement$203();
            case 'do':
                return parseDoWhileStatement$190();
            case 'for':
                return parseForStatement$193();
            case 'function':
                return parseFunctionDeclaration$206();
            case 'if':
                return parseIfStatement$189();
            case 'return':
                return parseReturnStatement$196();
            case 'switch':
                return parseSwitchStatement$199();
            case 'throw':
                return parseThrowStatement$200();
            case 'try':
                return parseTryStatement$202();
            case 'var':
                return parseVariableStatement$185();
            case 'while':
                return parseWhileStatement$191();
            case 'with':
                return parseWithStatement$197();
            default:
                break;
            }
        }
        expr$432 = parseExpression$179();
        if (expr$432.type === Syntax$97.Identifier && match$144(':')) {
            lex$136();
            if (Object.prototype.hasOwnProperty.call(state$108.labelSet, expr$432.name)) {
                throwError$139({}, Messages$99.Redeclaration, 'Label', expr$432.name);
            }
            state$108.labelSet[expr$432.name] = true;
            labeledBody$433 = parseStatement$204();
            delete state$108.labelSet[expr$432.name];
            return {
                type: Syntax$97.LabeledStatement,
                label: expr$432,
                body: labeledBody$433
            };
        }
        consumeSemicolon$147();
        return {
            type: Syntax$97.ExpressionStatement,
            expression: expr$432
        };
    }
    function parseFunctionSourceElements$205() {
        var sourceElement$434, sourceElements$435 = [], token$436, directive$437, firstRestricted$438, oldLabelSet$439, oldInIteration$440, oldInSwitch$441, oldInFunctionBody$442;
        expect$142('{');
        while (index$103 < length$106) {
            token$436 = lookahead$137().token;
            if (token$436.type !== Token$95.StringLiteral) {
                break;
            }
            sourceElement$434 = parseSourceElement$208();
            sourceElements$435.push(sourceElement$434);
            if (sourceElement$434.expression.type !== Syntax$97.Literal) {
                break;
            }
            directive$437 = sliceSource$113(token$436.range[0] + 1, token$436.range[1] - 1);
            if (directive$437 === 'use strict') {
                strict$102 = true;
                if (firstRestricted$438) {
                    throwError$139(firstRestricted$438, Messages$99.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$438 && token$436.octal) {
                    firstRestricted$438 = token$436;
                }
            }
        }
        oldLabelSet$439 = state$108.labelSet;
        oldInIteration$440 = state$108.inIteration;
        oldInSwitch$441 = state$108.inSwitch;
        oldInFunctionBody$442 = state$108.inFunctionBody;
        state$108.labelSet = {};
        state$108.inIteration = false;
        state$108.inSwitch = false;
        state$108.inFunctionBody = true;
        while (index$103 < length$106) {
            if (match$144('}')) {
                break;
            }
            sourceElement$434 = parseSourceElement$208();
            if (typeof sourceElement$434 === 'undefined') {
                break;
            }
            sourceElements$435.push(sourceElement$434);
        }
        expect$142('}');
        state$108.labelSet = oldLabelSet$439;
        state$108.inIteration = oldInIteration$440;
        state$108.inSwitch = oldInSwitch$441;
        state$108.inFunctionBody = oldInFunctionBody$442;
        return {
            type: Syntax$97.BlockStatement,
            body: sourceElements$435
        };
    }
    function parseFunctionDeclaration$206() {
        var id$443, param$444, params$445 = [], body$446, token$447, firstRestricted$448, message$449, previousStrict$450, paramSet$451;
        expectKeyword$143('function');
        token$447 = lookahead$137().token;
        id$443 = parseVariableIdentifier$182();
        if (strict$102) {
            if (isRestrictedWord$123(token$447.value)) {
                throwError$139(token$447, Messages$99.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$123(token$447.value)) {
                firstRestricted$448 = token$447;
                message$449 = Messages$99.StrictFunctionName;
            } else if (isStrictModeReservedWord$122(token$447.value)) {
                firstRestricted$448 = token$447;
                message$449 = Messages$99.StrictReservedWord;
            }
        }
        expect$142('(');
        if (!match$144(')')) {
            paramSet$451 = {};
            while (index$103 < length$106) {
                token$447 = lookahead$137().token;
                param$444 = parseVariableIdentifier$182();
                if (strict$102) {
                    if (isRestrictedWord$123(token$447.value)) {
                        throwError$139(token$447, Messages$99.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$451, token$447.value)) {
                        throwError$139(token$447, Messages$99.StrictParamDupe);
                    }
                } else if (!firstRestricted$448) {
                    if (isRestrictedWord$123(token$447.value)) {
                        firstRestricted$448 = token$447;
                        message$449 = Messages$99.StrictParamName;
                    } else if (isStrictModeReservedWord$122(token$447.value)) {
                        firstRestricted$448 = token$447;
                        message$449 = Messages$99.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$451, token$447.value)) {
                        firstRestricted$448 = token$447;
                        message$449 = Messages$99.StrictParamDupe;
                    }
                }
                params$445.push(param$444);
                paramSet$451[param$444.name] = true;
                if (match$144(')')) {
                    break;
                }
                expect$142(',');
            }
        }
        expect$142(')');
        previousStrict$450 = strict$102;
        body$446 = parseFunctionSourceElements$205();
        if (strict$102 && firstRestricted$448) {
            throwError$139(firstRestricted$448, message$449);
        }
        strict$102 = previousStrict$450;
        return {
            type: Syntax$97.FunctionDeclaration,
            id: id$443,
            params: params$445,
            body: body$446
        };
    }
    function parseFunctionExpression$207() {
        var token$452, id$453 = null, firstRestricted$454, message$455, param$456, params$457 = [], body$458, previousStrict$459, paramSet$460;
        expectKeyword$143('function');
        if (!match$144('(')) {
            token$452 = lookahead$137().token;
            id$453 = parseVariableIdentifier$182();
            if (strict$102) {
                if (isRestrictedWord$123(token$452.value)) {
                    throwError$139(token$452, Messages$99.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$123(token$452.value)) {
                    firstRestricted$454 = token$452;
                    message$455 = Messages$99.StrictFunctionName;
                } else if (isStrictModeReservedWord$122(token$452.value)) {
                    firstRestricted$454 = token$452;
                    message$455 = Messages$99.StrictReservedWord;
                }
            }
        }
        expect$142('(');
        if (!match$144(')')) {
            paramSet$460 = {};
            while (index$103 < length$106) {
                token$452 = lookahead$137().token;
                param$456 = parseVariableIdentifier$182();
                if (strict$102) {
                    if (isRestrictedWord$123(token$452.value)) {
                        throwError$139(token$452, Messages$99.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$460, token$452.value)) {
                        throwError$139(token$452, Messages$99.StrictParamDupe);
                    }
                } else if (!firstRestricted$454) {
                    if (isRestrictedWord$123(token$452.value)) {
                        firstRestricted$454 = token$452;
                        message$455 = Messages$99.StrictParamName;
                    } else if (isStrictModeReservedWord$122(token$452.value)) {
                        firstRestricted$454 = token$452;
                        message$455 = Messages$99.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$460, token$452.value)) {
                        firstRestricted$454 = token$452;
                        message$455 = Messages$99.StrictParamDupe;
                    }
                }
                params$457.push(param$456);
                paramSet$460[param$456.name] = true;
                if (match$144(')')) {
                    break;
                }
                expect$142(',');
            }
        }
        expect$142(')');
        previousStrict$459 = strict$102;
        body$458 = parseFunctionSourceElements$205();
        if (strict$102 && firstRestricted$454) {
            throwError$139(firstRestricted$454, message$455);
        }
        strict$102 = previousStrict$459;
        return {
            type: Syntax$97.FunctionExpression,
            id: id$453,
            params: params$457,
            body: body$458
        };
    }
    function parseSourceElement$208() {
        var token$461 = lookahead$137().token;
        if (token$461.type === Token$95.Keyword) {
            switch (token$461.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$186(token$461.value);
            case 'function':
                return parseFunctionDeclaration$206();
            default:
                return parseStatement$204();
            }
        }
        if (token$461.type !== Token$95.EOF) {
            return parseStatement$204();
        }
    }
    function parseSourceElements$209() {
        var sourceElement$462, sourceElements$463 = [], token$464, directive$465, firstRestricted$466;
        while (index$103 < length$106) {
            token$464 = lookahead$137();
            if (token$464.type !== Token$95.StringLiteral) {
                break;
            }
            sourceElement$462 = parseSourceElement$208();
            sourceElements$463.push(sourceElement$462);
            if (sourceElement$462.expression.type !== Syntax$97.Literal) {
                break;
            }
            directive$465 = sliceSource$113(token$464.range[0] + 1, token$464.range[1] - 1);
            if (directive$465 === 'use strict') {
                strict$102 = true;
                if (firstRestricted$466) {
                    throwError$139(firstRestricted$466, Messages$99.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$466 && token$464.octal) {
                    firstRestricted$466 = token$464;
                }
            }
        }
        while (index$103 < length$106) {
            sourceElement$462 = parseSourceElement$208();
            if (typeof sourceElement$462 === 'undefined') {
                break;
            }
            sourceElements$463.push(sourceElement$462);
        }
        return sourceElements$463;
    }
    function parseProgram$210() {
        var program$467;
        strict$102 = false;
        program$467 = {
            type: Syntax$97.Program,
            body: parseSourceElements$209()
        };
        return program$467;
    }
    function addComment$211(start$468, end$469, type$470, value$471) {
        assert$111(typeof start$468 === 'number', 'Comment must have valid position');
        if (extra$110.comments.length > 0) {
            if (extra$110.comments[extra$110.comments.length - 1].range[1] > start$468) {
                return;
            }
        }
        extra$110.comments.push({
            range: [
                start$468,
                end$469
            ],
            type: type$470,
            value: value$471
        });
    }
    function scanComment$212() {
        var comment$472, ch$473, start$474, blockComment$475, lineComment$476;
        comment$472 = '';
        blockComment$475 = false;
        lineComment$476 = false;
        while (index$103 < length$106) {
            ch$473 = source$101[index$103];
            if (lineComment$476) {
                ch$473 = nextChar$125();
                if (index$103 >= length$106) {
                    lineComment$476 = false;
                    comment$472 += ch$473;
                    addComment$211(start$474, index$103, 'Line', comment$472);
                } else if (isLineTerminator$118(ch$473)) {
                    lineComment$476 = false;
                    addComment$211(start$474, index$103, 'Line', comment$472);
                    if (ch$473 === '\r' && source$101[index$103] === '\n') {
                        ++index$103;
                    }
                    ++lineNumber$104;
                    lineStart$105 = index$103;
                    comment$472 = '';
                } else {
                    comment$472 += ch$473;
                }
            } else if (blockComment$475) {
                if (isLineTerminator$118(ch$473)) {
                    if (ch$473 === '\r' && source$101[index$103 + 1] === '\n') {
                        ++index$103;
                        comment$472 += '\r\n';
                    } else {
                        comment$472 += ch$473;
                    }
                    ++lineNumber$104;
                    ++index$103;
                    lineStart$105 = index$103;
                    if (index$103 >= length$106) {
                        throwError$139({}, Messages$99.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$473 = nextChar$125();
                    if (index$103 >= length$106) {
                        throwError$139({}, Messages$99.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$472 += ch$473;
                    if (ch$473 === '*') {
                        ch$473 = source$101[index$103];
                        if (ch$473 === '/') {
                            comment$472 = comment$472.substr(0, comment$472.length - 1);
                            blockComment$475 = false;
                            ++index$103;
                            addComment$211(start$474, index$103, 'Block', comment$472);
                            comment$472 = '';
                        }
                    }
                }
            } else if (ch$473 === '/') {
                ch$473 = source$101[index$103 + 1];
                if (ch$473 === '/') {
                    start$474 = index$103;
                    index$103 += 2;
                    lineComment$476 = true;
                } else if (ch$473 === '*') {
                    start$474 = index$103;
                    index$103 += 2;
                    blockComment$475 = true;
                    if (index$103 >= length$106) {
                        throwError$139({}, Messages$99.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$117(ch$473)) {
                ++index$103;
            } else if (isLineTerminator$118(ch$473)) {
                ++index$103;
                if (ch$473 === '\r' && source$101[index$103] === '\n') {
                    ++index$103;
                }
                ++lineNumber$104;
                lineStart$105 = index$103;
            } else {
                break;
            }
        }
    }
    function collectToken$213() {
        var token$477 = extra$110.advance(), range$478, value$479;
        if (token$477.type !== Token$95.EOF) {
            range$478 = [
                token$477.range[0],
                token$477.range[1]
            ];
            value$479 = sliceSource$113(token$477.range[0], token$477.range[1]);
            extra$110.tokens.push({
                type: TokenName$96[token$477.type],
                value: value$479,
                lineNumber: lineNumber$104,
                lineStart: lineStart$105,
                range: range$478
            });
        }
        return token$477;
    }
    function collectRegex$214() {
        var pos$480, regex$481, token$482;
        skipComment$127();
        pos$480 = index$103;
        regex$481 = extra$110.scanRegExp();
        if (extra$110.tokens.length > 0) {
            token$482 = extra$110.tokens[extra$110.tokens.length - 1];
            if (token$482.range[0] === pos$480 && token$482.type === 'Punctuator') {
                if (token$482.value === '/' || token$482.value === '/=') {
                    extra$110.tokens.pop();
                }
            }
        }
        extra$110.tokens.push({
            type: 'RegularExpression',
            value: regex$481.literal,
            range: [
                pos$480,
                index$103
            ],
            lineStart: token$482.lineStart,
            lineNumber: token$482.lineNumber
        });
        return regex$481;
    }
    function createLiteral$215(token$483) {
        if (Array.isArray(token$483)) {
            return {
                type: Syntax$97.Literal,
                value: token$483
            };
        }
        return {
            type: Syntax$97.Literal,
            value: token$483.value,
            lineStart: token$483.lineStart,
            lineNumber: token$483.lineNumber
        };
    }
    function createRawLiteral$216(token$484) {
        return {
            type: Syntax$97.Literal,
            value: token$484.value,
            raw: sliceSource$113(token$484.range[0], token$484.range[1]),
            lineStart: token$484.lineStart,
            lineNumber: token$484.lineNumber
        };
    }
    function wrapTrackingFunction$217(range$485, loc$486) {
        return function (parseFunction$487) {
            function isBinary$488(node$490) {
                return node$490.type === Syntax$97.LogicalExpression || node$490.type === Syntax$97.BinaryExpression;
            }
            function visit$489(node$491) {
                if (isBinary$488(node$491.left)) {
                    visit$489(node$491.left);
                }
                if (isBinary$488(node$491.right)) {
                    visit$489(node$491.right);
                }
                if (range$485 && typeof node$491.range === 'undefined') {
                    node$491.range = [
                        node$491.left.range[0],
                        node$491.right.range[1]
                    ];
                }
                if (loc$486 && typeof node$491.loc === 'undefined') {
                    node$491.loc = {
                        start: node$491.left.loc.start,
                        end: node$491.right.loc.end
                    };
                }
            }
            return function () {
                var node$492, rangeInfo$493, locInfo$494;
                var curr$495 = tokenStream$109[index$103].token;
                rangeInfo$493 = [
                    curr$495.range[0],
                    0
                ];
                locInfo$494 = {
                    start: {
                        line: curr$495.lineNumber,
                        column: curr$495.lineStart
                    }
                };
                node$492 = parseFunction$487.apply(null, arguments);
                if (typeof node$492 !== 'undefined') {
                    var last$496 = tokenStream$109[index$103].token;
                    if (range$485) {
                        rangeInfo$493[1] = last$496.range[1];
                        node$492.range = rangeInfo$493;
                    }
                    if (loc$486) {
                        locInfo$494.end = {
                            line: last$496.lineNumber,
                            column: last$496.lineStart
                        };
                        node$492.loc = locInfo$494;
                    }
                    if (isBinary$488(node$492)) {
                        visit$489(node$492);
                    }
                    if (node$492.type === Syntax$97.MemberExpression) {
                        if (typeof node$492.object.range !== 'undefined') {
                            node$492.range[0] = node$492.object.range[0];
                        }
                        if (typeof node$492.object.loc !== 'undefined') {
                            node$492.loc.start = node$492.object.loc.start;
                        }
                    }
                    if (node$492.type === Syntax$97.CallExpression) {
                        if (typeof node$492.callee.range !== 'undefined') {
                            node$492.range[0] = node$492.callee.range[0];
                        }
                        if (typeof node$492.callee.loc !== 'undefined') {
                            node$492.loc.start = node$492.callee.loc.start;
                        }
                    }
                    return node$492;
                }
            };
        };
    }
    function patch$218() {
        var wrapTracking$497;
        if (extra$110.comments) {
            extra$110.skipComment = skipComment$127;
            skipComment$127 = scanComment$212;
        }
        if (extra$110.raw) {
            extra$110.createLiteral = createLiteral$215;
            createLiteral$215 = createRawLiteral$216;
        }
        if (extra$110.range || extra$110.loc) {
            wrapTracking$497 = wrapTrackingFunction$217(extra$110.range, extra$110.loc);
            extra$110.parseAdditiveExpression = parseAdditiveExpression$168;
            extra$110.parseAssignmentExpression = parseAssignmentExpression$178;
            extra$110.parseBitwiseANDExpression = parseBitwiseANDExpression$172;
            extra$110.parseBitwiseORExpression = parseBitwiseORExpression$174;
            extra$110.parseBitwiseXORExpression = parseBitwiseXORExpression$173;
            extra$110.parseBlock = parseBlock$181;
            extra$110.parseFunctionSourceElements = parseFunctionSourceElements$205;
            extra$110.parseCallMember = parseCallMember$159;
            extra$110.parseCatchClause = parseCatchClause$201;
            extra$110.parseComputedMember = parseComputedMember$158;
            extra$110.parseConditionalExpression = parseConditionalExpression$177;
            extra$110.parseConstLetDeclaration = parseConstLetDeclaration$186;
            extra$110.parseEqualityExpression = parseEqualityExpression$171;
            extra$110.parseExpression = parseExpression$179;
            extra$110.parseForVariableDeclaration = parseForVariableDeclaration$192;
            extra$110.parseFunctionDeclaration = parseFunctionDeclaration$206;
            extra$110.parseFunctionExpression = parseFunctionExpression$207;
            extra$110.parseLogicalANDExpression = parseLogicalANDExpression$175;
            extra$110.parseLogicalORExpression = parseLogicalORExpression$176;
            extra$110.parseMultiplicativeExpression = parseMultiplicativeExpression$167;
            extra$110.parseNewExpression = parseNewExpression$160;
            extra$110.parseNonComputedMember = parseNonComputedMember$157;
            extra$110.parseNonComputedProperty = parseNonComputedProperty$156;
            extra$110.parseObjectProperty = parseObjectProperty$152;
            extra$110.parseObjectPropertyKey = parseObjectPropertyKey$151;
            extra$110.parsePostfixExpression = parsePostfixExpression$165;
            extra$110.parsePrimaryExpression = parsePrimaryExpression$154;
            extra$110.parseProgram = parseProgram$210;
            extra$110.parsePropertyFunction = parsePropertyFunction$150;
            extra$110.parseRelationalExpression = parseRelationalExpression$170;
            extra$110.parseStatement = parseStatement$204;
            extra$110.parseShiftExpression = parseShiftExpression$169;
            extra$110.parseSwitchCase = parseSwitchCase$198;
            extra$110.parseUnaryExpression = parseUnaryExpression$166;
            extra$110.parseVariableDeclaration = parseVariableDeclaration$183;
            extra$110.parseVariableIdentifier = parseVariableIdentifier$182;
            parseAdditiveExpression$168 = wrapTracking$497(extra$110.parseAdditiveExpression);
            parseAssignmentExpression$178 = wrapTracking$497(extra$110.parseAssignmentExpression);
            parseBitwiseANDExpression$172 = wrapTracking$497(extra$110.parseBitwiseANDExpression);
            parseBitwiseORExpression$174 = wrapTracking$497(extra$110.parseBitwiseORExpression);
            parseBitwiseXORExpression$173 = wrapTracking$497(extra$110.parseBitwiseXORExpression);
            parseBlock$181 = wrapTracking$497(extra$110.parseBlock);
            parseFunctionSourceElements$205 = wrapTracking$497(extra$110.parseFunctionSourceElements);
            parseCallMember$159 = wrapTracking$497(extra$110.parseCallMember);
            parseCatchClause$201 = wrapTracking$497(extra$110.parseCatchClause);
            parseComputedMember$158 = wrapTracking$497(extra$110.parseComputedMember);
            parseConditionalExpression$177 = wrapTracking$497(extra$110.parseConditionalExpression);
            parseConstLetDeclaration$186 = wrapTracking$497(extra$110.parseConstLetDeclaration);
            parseEqualityExpression$171 = wrapTracking$497(extra$110.parseEqualityExpression);
            parseExpression$179 = wrapTracking$497(extra$110.parseExpression);
            parseForVariableDeclaration$192 = wrapTracking$497(extra$110.parseForVariableDeclaration);
            parseFunctionDeclaration$206 = wrapTracking$497(extra$110.parseFunctionDeclaration);
            parseFunctionExpression$207 = wrapTracking$497(extra$110.parseFunctionExpression);
            parseLogicalANDExpression$175 = wrapTracking$497(extra$110.parseLogicalANDExpression);
            parseLogicalORExpression$176 = wrapTracking$497(extra$110.parseLogicalORExpression);
            parseMultiplicativeExpression$167 = wrapTracking$497(extra$110.parseMultiplicativeExpression);
            parseNewExpression$160 = wrapTracking$497(extra$110.parseNewExpression);
            parseNonComputedMember$157 = wrapTracking$497(extra$110.parseNonComputedMember);
            parseNonComputedProperty$156 = wrapTracking$497(extra$110.parseNonComputedProperty);
            parseObjectProperty$152 = wrapTracking$497(extra$110.parseObjectProperty);
            parseObjectPropertyKey$151 = wrapTracking$497(extra$110.parseObjectPropertyKey);
            parsePostfixExpression$165 = wrapTracking$497(extra$110.parsePostfixExpression);
            parsePrimaryExpression$154 = wrapTracking$497(extra$110.parsePrimaryExpression);
            parseProgram$210 = wrapTracking$497(extra$110.parseProgram);
            parsePropertyFunction$150 = wrapTracking$497(extra$110.parsePropertyFunction);
            parseRelationalExpression$170 = wrapTracking$497(extra$110.parseRelationalExpression);
            parseStatement$204 = wrapTracking$497(extra$110.parseStatement);
            parseShiftExpression$169 = wrapTracking$497(extra$110.parseShiftExpression);
            parseSwitchCase$198 = wrapTracking$497(extra$110.parseSwitchCase);
            parseUnaryExpression$166 = wrapTracking$497(extra$110.parseUnaryExpression);
            parseVariableDeclaration$183 = wrapTracking$497(extra$110.parseVariableDeclaration);
            parseVariableIdentifier$182 = wrapTracking$497(extra$110.parseVariableIdentifier);
        }
        if (typeof extra$110.tokens !== 'undefined') {
            extra$110.advance = advance$135;
            extra$110.scanRegExp = scanRegExp$133;
            advance$135 = collectToken$213;
            scanRegExp$133 = collectRegex$214;
        }
    }
    function unpatch$219() {
        if (typeof extra$110.skipComment === 'function') {
            skipComment$127 = extra$110.skipComment;
        }
        if (extra$110.raw) {
            createLiteral$215 = extra$110.createLiteral;
        }
        if (extra$110.range || extra$110.loc) {
            parseAdditiveExpression$168 = extra$110.parseAdditiveExpression;
            parseAssignmentExpression$178 = extra$110.parseAssignmentExpression;
            parseBitwiseANDExpression$172 = extra$110.parseBitwiseANDExpression;
            parseBitwiseORExpression$174 = extra$110.parseBitwiseORExpression;
            parseBitwiseXORExpression$173 = extra$110.parseBitwiseXORExpression;
            parseBlock$181 = extra$110.parseBlock;
            parseFunctionSourceElements$205 = extra$110.parseFunctionSourceElements;
            parseCallMember$159 = extra$110.parseCallMember;
            parseCatchClause$201 = extra$110.parseCatchClause;
            parseComputedMember$158 = extra$110.parseComputedMember;
            parseConditionalExpression$177 = extra$110.parseConditionalExpression;
            parseConstLetDeclaration$186 = extra$110.parseConstLetDeclaration;
            parseEqualityExpression$171 = extra$110.parseEqualityExpression;
            parseExpression$179 = extra$110.parseExpression;
            parseForVariableDeclaration$192 = extra$110.parseForVariableDeclaration;
            parseFunctionDeclaration$206 = extra$110.parseFunctionDeclaration;
            parseFunctionExpression$207 = extra$110.parseFunctionExpression;
            parseLogicalANDExpression$175 = extra$110.parseLogicalANDExpression;
            parseLogicalORExpression$176 = extra$110.parseLogicalORExpression;
            parseMultiplicativeExpression$167 = extra$110.parseMultiplicativeExpression;
            parseNewExpression$160 = extra$110.parseNewExpression;
            parseNonComputedMember$157 = extra$110.parseNonComputedMember;
            parseNonComputedProperty$156 = extra$110.parseNonComputedProperty;
            parseObjectProperty$152 = extra$110.parseObjectProperty;
            parseObjectPropertyKey$151 = extra$110.parseObjectPropertyKey;
            parsePrimaryExpression$154 = extra$110.parsePrimaryExpression;
            parsePostfixExpression$165 = extra$110.parsePostfixExpression;
            parseProgram$210 = extra$110.parseProgram;
            parsePropertyFunction$150 = extra$110.parsePropertyFunction;
            parseRelationalExpression$170 = extra$110.parseRelationalExpression;
            parseStatement$204 = extra$110.parseStatement;
            parseShiftExpression$169 = extra$110.parseShiftExpression;
            parseSwitchCase$198 = extra$110.parseSwitchCase;
            parseUnaryExpression$166 = extra$110.parseUnaryExpression;
            parseVariableDeclaration$183 = extra$110.parseVariableDeclaration;
            parseVariableIdentifier$182 = extra$110.parseVariableIdentifier;
        }
        if (typeof extra$110.scanRegExp === 'function') {
            advance$135 = extra$110.advance;
            scanRegExp$133 = extra$110.scanRegExp;
        }
    }
    function stringToArray$220(str$498) {
        var length$499 = str$498.length, result$500 = [], i$501;
        for (i$501 = 0; i$501 < length$499; ++i$501) {
            result$500[i$501] = str$498.charAt(i$501);
        }
        return result$500;
    }
    function blockAllowed$221(toks$502, start$503, inExprDelim$504, parentIsBlock$505) {
        var assignOps$506 = [
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
        var binaryOps$507 = [
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
        var unaryOps$508 = [
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
        function back$509(n$510) {
            var idx$511 = toks$502.length - n$510 > 0 ? toks$502.length - n$510 : 0;
            return toks$502[idx$511];
        }
        if (inExprDelim$504 && toks$502.length - (start$503 + 2) <= 0) {
            return false;
        } else if (back$509(start$503 + 2).value === ':' && parentIsBlock$505) {
            return true;
        } else if (isIn$112(back$509(start$503 + 2).value, unaryOps$508.concat(binaryOps$507).concat(assignOps$506))) {
            return false;
        } else if (back$509(start$503 + 2).value === 'return') {
            var currLineNumber$512 = typeof back$509(start$503 + 1).startLineNumber !== 'undefined' ? back$509(start$503 + 1).startLineNumber : back$509(start$503 + 1).lineNumber;
            if (back$509(start$503 + 2).lineNumber !== currLineNumber$512) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$112(back$509(start$503 + 2).value, [
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
    function readToken$222(toks$513, inExprDelim$514, parentIsBlock$515) {
        var delimiters$516 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$517 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$518 = toks$513.length - 1;
        function back$519(n$520) {
            var idx$521 = toks$513.length - n$520 > 0 ? toks$513.length - n$520 : 0;
            return toks$513[idx$521];
        }
        skipComment$127();
        if (isIn$112(getChar$126(), delimiters$516)) {
            return readDelim$223(toks$513, inExprDelim$514, parentIsBlock$515);
        }
        if (getChar$126() === '/') {
            var prev$522 = back$519(1);
            if (prev$522) {
                if (prev$522.value === '()') {
                    if (isIn$112(back$519(2).value, parenIdents$517)) {
                        return scanRegExp$133();
                    }
                    return advance$135();
                }
                if (prev$522.value === '{}') {
                    if (blockAllowed$221(toks$513, 0, inExprDelim$514, parentIsBlock$515)) {
                        if (back$519(2).value === '()') {
                            if (back$519(4).value === 'function') {
                                if (!blockAllowed$221(toks$513, 3, inExprDelim$514, parentIsBlock$515)) {
                                    return advance$135();
                                }
                                if (toks$513.length - 5 <= 0 && inExprDelim$514) {
                                    return advance$135();
                                }
                            }
                            if (back$519(3).value === 'function') {
                                if (!blockAllowed$221(toks$513, 2, inExprDelim$514, parentIsBlock$515)) {
                                    return advance$135();
                                }
                                if (toks$513.length - 4 <= 0 && inExprDelim$514) {
                                    return advance$135();
                                }
                            }
                        }
                        return scanRegExp$133();
                    } else {
                        return advance$135();
                    }
                }
                if (prev$522.type === Token$95.Punctuator) {
                    return scanRegExp$133();
                }
                if (isKeyword$124(prev$522.value)) {
                    return scanRegExp$133();
                }
                return advance$135();
            }
            return scanRegExp$133();
        }
        return advance$135();
    }
    function readDelim$223(toks$523, inExprDelim$524, parentIsBlock$525) {
        var startDelim$526 = advance$135(), matchDelim$527 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$528 = [];
        var delimiters$529 = [
                '(',
                '{',
                '['
            ];
        assert$111(delimiters$529.indexOf(startDelim$526.value) !== -1, 'Need to begin at the delimiter');
        var token$530 = startDelim$526;
        var startLineNumber$531 = token$530.lineNumber;
        var startLineStart$532 = token$530.lineStart;
        var startRange$533 = token$530.range;
        var delimToken$534 = {};
        delimToken$534.type = Token$95.Delimiter;
        delimToken$534.value = startDelim$526.value + matchDelim$527[startDelim$526.value];
        delimToken$534.startLineNumber = startLineNumber$531;
        delimToken$534.startLineStart = startLineStart$532;
        delimToken$534.startRange = startRange$533;
        var delimIsBlock$535 = false;
        if (startDelim$526.value === '{') {
            delimIsBlock$535 = blockAllowed$221(toks$523.concat(delimToken$534), 0, inExprDelim$524, parentIsBlock$525);
        }
        while (index$103 <= length$106) {
            token$530 = readToken$222(inner$528, startDelim$526.value === '(' || startDelim$526.value === '[', delimIsBlock$535);
            if (token$530.type === Token$95.Punctuator && token$530.value === matchDelim$527[startDelim$526.value]) {
                break;
            } else if (token$530.type === Token$95.EOF) {
                throwError$139({}, Messages$99.UnexpectedEOS);
            } else {
                inner$528.push(token$530);
            }
        }
        if (index$103 >= length$106 && matchDelim$527[startDelim$526.value] !== source$101[length$106 - 1]) {
            throwError$139({}, Messages$99.UnexpectedEOS);
        }
        var endLineNumber$536 = token$530.lineNumber;
        var endLineStart$537 = token$530.lineStart;
        var endRange$538 = token$530.range;
        delimToken$534.inner = inner$528;
        delimToken$534.endLineNumber = endLineNumber$536;
        delimToken$534.endLineStart = endLineStart$537;
        delimToken$534.endRange = endRange$538;
        return delimToken$534;
    }
    ;
    function read$224(code$539) {
        var token$540, tokenTree$541 = [];
        extra$110 = {};
        extra$110.comments = [];
        patch$218();
        source$101 = code$539;
        index$103 = 0;
        lineNumber$104 = source$101.length > 0 ? 1 : 0;
        lineStart$105 = 0;
        length$106 = source$101.length;
        buffer$107 = null;
        state$108 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$103 < length$106) {
            tokenTree$541.push(readToken$222(tokenTree$541, false, false));
        }
        var last$542 = tokenTree$541[tokenTree$541.length - 1];
        if (last$542 && last$542.type !== Token$95.EOF) {
            tokenTree$541.push({
                type: Token$95.EOF,
                value: '',
                lineNumber: last$542.lineNumber,
                lineStart: last$542.lineStart,
                range: [
                    index$103,
                    index$103
                ]
            });
        }
        return [
            expander$94.tokensToSyntax(tokenTree$541),
            extra$110.comments
        ];
    }
    function parse$225(code$543, comments$544) {
        var program$545, toString$546;
        tokenStream$109 = code$543;
        index$103 = 0;
        length$106 = tokenStream$109.length;
        buffer$107 = null;
        state$108 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        try {
            program$545 = parseProgram$210();
            program$545.comments = comments$544;
            program$545.tokens = expander$94.syntaxToTokens(code$543);
        } catch (e$547) {
            throw e$547;
        } finally {
            unpatch$219();
            extra$110 = {};
        }
        return program$545;
    }
    exports$93.parse = parse$225;
    exports$93.read = read$224;
    exports$93.Token = Token$95;
    exports$93.assert = assert$111;
    exports$93.Syntax = function () {
        var name$548, types$549 = {};
        if (typeof Object.create === 'function') {
            types$549 = Object.create(null);
        }
        for (name$548 in Syntax$97) {
            if (Syntax$97.hasOwnProperty(name$548)) {
                types$549[name$548] = Syntax$97[name$548];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$549);
        }
        return types$549;
    }();
}));