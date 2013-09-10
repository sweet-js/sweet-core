(function (root$90, factory$91) {
    if (typeof exports === 'object') {
        factory$91(exports, require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$91);
    }
}(this, function (exports$92, expander$93) {
    'use strict';
    var Token$94, TokenName$95, Syntax$96, PropertyKind$97, Messages$98, Regex$99, source$100, strict$101, index$102, lineNumber$103, lineStart$104, length$105, buffer$106, state$107, tokenStream$108, extra$109;
    Token$94 = {
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
    TokenName$95 = {};
    TokenName$95[Token$94.BooleanLiteral] = 'Boolean';
    TokenName$95[Token$94.EOF] = '<end>';
    TokenName$95[Token$94.Identifier] = 'Identifier';
    TokenName$95[Token$94.Keyword] = 'Keyword';
    TokenName$95[Token$94.NullLiteral] = 'Null';
    TokenName$95[Token$94.NumericLiteral] = 'Numeric';
    TokenName$95[Token$94.Punctuator] = 'Punctuator';
    TokenName$95[Token$94.StringLiteral] = 'String';
    TokenName$95[Token$94.Delimiter] = 'Delimiter';
    Syntax$96 = {
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
    PropertyKind$97 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    Messages$98 = {
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
    Regex$99 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    function assert$110(condition$225, message$226) {
        if (!condition$225) {
            throw new Error('ASSERT: ' + message$226);
        }
    }
    function isIn$111(el$227, list$228) {
        return list$228.indexOf(el$227) !== -1;
    }
    function sliceSource$112(from$229, to$230) {
        return source$100.slice(from$229, to$230);
    }
    if (typeof 'esprima'[0] === 'undefined') {
        sliceSource$112 = function sliceArraySource$231(from$232, to$233) {
            return source$100.slice(from$232, to$233).join('');
        };
    }
    function isDecimalDigit$113(ch$234) {
        return '0123456789'.indexOf(ch$234) >= 0;
    }
    function isHexDigit$114(ch$235) {
        return '0123456789abcdefABCDEF'.indexOf(ch$235) >= 0;
    }
    function isOctalDigit$115(ch$236) {
        return '01234567'.indexOf(ch$236) >= 0;
    }
    function isWhiteSpace$116(ch$237) {
        return ch$237 === ' ' || ch$237 === '\t' || ch$237 === '\x0B' || ch$237 === '\f' || ch$237 === '\xa0' || ch$237.charCodeAt(0) >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(ch$237) >= 0;
    }
    function isLineTerminator$117(ch$238) {
        return ch$238 === '\n' || ch$238 === '\r' || ch$238 === '\u2028' || ch$238 === '\u2029';
    }
    function isIdentifierStart$118(ch$239) {
        return ch$239 === '$' || ch$239 === '_' || ch$239 === '\\' || ch$239 >= 'a' && ch$239 <= 'z' || ch$239 >= 'A' && ch$239 <= 'Z' || ch$239.charCodeAt(0) >= 128 && Regex$99.NonAsciiIdentifierStart.test(ch$239);
    }
    function isIdentifierPart$119(ch$240) {
        return ch$240 === '$' || ch$240 === '_' || ch$240 === '\\' || ch$240 >= 'a' && ch$240 <= 'z' || ch$240 >= 'A' && ch$240 <= 'Z' || ch$240 >= '0' && ch$240 <= '9' || ch$240.charCodeAt(0) >= 128 && Regex$99.NonAsciiIdentifierPart.test(ch$240);
    }
    function isFutureReservedWord$120(id$241) {
        return false;
    }
    function isStrictModeReservedWord$121(id$242) {
        switch (id$242) {
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
    function isRestrictedWord$122(id$243) {
        return id$243 === 'eval' || id$243 === 'arguments';
    }
    function isKeyword$123(id$244) {
        var keyword$245 = false;
        switch (id$244.length) {
        case 2:
            keyword$245 = id$244 === 'if' || id$244 === 'in' || id$244 === 'do';
            break;
        case 3:
            keyword$245 = id$244 === 'var' || id$244 === 'for' || id$244 === 'new' || id$244 === 'try';
            break;
        case 4:
            keyword$245 = id$244 === 'this' || id$244 === 'else' || id$244 === 'case' || id$244 === 'void' || id$244 === 'with';
            break;
        case 5:
            keyword$245 = id$244 === 'while' || id$244 === 'break' || id$244 === 'catch' || id$244 === 'throw';
            break;
        case 6:
            keyword$245 = id$244 === 'return' || id$244 === 'typeof' || id$244 === 'delete' || id$244 === 'switch';
            break;
        case 7:
            keyword$245 = id$244 === 'default' || id$244 === 'finally';
            break;
        case 8:
            keyword$245 = id$244 === 'function' || id$244 === 'continue' || id$244 === 'debugger';
            break;
        case 10:
            keyword$245 = id$244 === 'instanceof';
            break;
        }
        if (keyword$245) {
            return true;
        }
        switch (id$244) {
        case 'const':
            return true;
        case 'yield':
        case 'let':
            return true;
        }
        if (strict$101 && isStrictModeReservedWord$121(id$244)) {
            return true;
        }
        return isFutureReservedWord$120(id$244);
    }
    function nextChar$124() {
        return source$100[index$102++];
    }
    function getChar$125() {
        return source$100[index$102];
    }
    function skipComment$126() {
        var ch$246, blockComment$247, lineComment$248;
        blockComment$247 = false;
        lineComment$248 = false;
        while (index$102 < length$105) {
            ch$246 = source$100[index$102];
            if (lineComment$248) {
                ch$246 = nextChar$124();
                if (isLineTerminator$117(ch$246)) {
                    lineComment$248 = false;
                    if (ch$246 === '\r' && source$100[index$102] === '\n') {
                        ++index$102;
                    }
                    ++lineNumber$103;
                    lineStart$104 = index$102;
                }
            } else if (blockComment$247) {
                if (isLineTerminator$117(ch$246)) {
                    if (ch$246 === '\r' && source$100[index$102 + 1] === '\n') {
                        ++index$102;
                    }
                    ++lineNumber$103;
                    ++index$102;
                    lineStart$104 = index$102;
                    if (index$102 >= length$105) {
                        throwError$138({}, Messages$98.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$246 = nextChar$124();
                    if (index$102 >= length$105) {
                        throwError$138({}, Messages$98.UnexpectedToken, 'ILLEGAL');
                    }
                    if (ch$246 === '*') {
                        ch$246 = source$100[index$102];
                        if (ch$246 === '/') {
                            ++index$102;
                            blockComment$247 = false;
                        }
                    }
                }
            } else if (ch$246 === '/') {
                ch$246 = source$100[index$102 + 1];
                if (ch$246 === '/') {
                    index$102 += 2;
                    lineComment$248 = true;
                } else if (ch$246 === '*') {
                    index$102 += 2;
                    blockComment$247 = true;
                    if (index$102 >= length$105) {
                        throwError$138({}, Messages$98.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$116(ch$246)) {
                ++index$102;
            } else if (isLineTerminator$117(ch$246)) {
                ++index$102;
                if (ch$246 === '\r' && source$100[index$102] === '\n') {
                    ++index$102;
                }
                ++lineNumber$103;
                lineStart$104 = index$102;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$127(prefix$249) {
        var i$250, len$251, ch$252, code$253 = 0;
        len$251 = prefix$249 === 'u' ? 4 : 2;
        for (i$250 = 0; i$250 < len$251; ++i$250) {
            if (index$102 < length$105 && isHexDigit$114(source$100[index$102])) {
                ch$252 = nextChar$124();
                code$253 = code$253 * 16 + '0123456789abcdef'.indexOf(ch$252.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$253);
    }
    function scanIdentifier$128() {
        var ch$254, start$255, id$256, restore$257;
        ch$254 = source$100[index$102];
        if (!isIdentifierStart$118(ch$254)) {
            return;
        }
        start$255 = index$102;
        if (ch$254 === '\\') {
            ++index$102;
            if (source$100[index$102] !== 'u') {
                return;
            }
            ++index$102;
            restore$257 = index$102;
            ch$254 = scanHexEscape$127('u');
            if (ch$254) {
                if (ch$254 === '\\' || !isIdentifierStart$118(ch$254)) {
                    return;
                }
                id$256 = ch$254;
            } else {
                index$102 = restore$257;
                id$256 = 'u';
            }
        } else {
            id$256 = nextChar$124();
        }
        while (index$102 < length$105) {
            ch$254 = source$100[index$102];
            if (!isIdentifierPart$119(ch$254)) {
                break;
            }
            if (ch$254 === '\\') {
                ++index$102;
                if (source$100[index$102] !== 'u') {
                    return;
                }
                ++index$102;
                restore$257 = index$102;
                ch$254 = scanHexEscape$127('u');
                if (ch$254) {
                    if (ch$254 === '\\' || !isIdentifierPart$119(ch$254)) {
                        return;
                    }
                    id$256 += ch$254;
                } else {
                    index$102 = restore$257;
                    id$256 += 'u';
                }
            } else {
                id$256 += nextChar$124();
            }
        }
        if (id$256.length === 1) {
            return {
                type: Token$94.Identifier,
                value: id$256,
                lineNumber: lineNumber$103,
                lineStart: lineStart$104,
                range: [
                    start$255,
                    index$102
                ]
            };
        }
        if (isKeyword$123(id$256)) {
            return {
                type: Token$94.Keyword,
                value: id$256,
                lineNumber: lineNumber$103,
                lineStart: lineStart$104,
                range: [
                    start$255,
                    index$102
                ]
            };
        }
        if (id$256 === 'null') {
            return {
                type: Token$94.NullLiteral,
                value: id$256,
                lineNumber: lineNumber$103,
                lineStart: lineStart$104,
                range: [
                    start$255,
                    index$102
                ]
            };
        }
        if (id$256 === 'true' || id$256 === 'false') {
            return {
                type: Token$94.BooleanLiteral,
                value: id$256,
                lineNumber: lineNumber$103,
                lineStart: lineStart$104,
                range: [
                    start$255,
                    index$102
                ]
            };
        }
        return {
            type: Token$94.Identifier,
            value: id$256,
            lineNumber: lineNumber$103,
            lineStart: lineStart$104,
            range: [
                start$255,
                index$102
            ]
        };
    }
    function scanPunctuator$129() {
        var start$258 = index$102, ch1$259 = source$100[index$102], ch2$260, ch3$261, ch4$262;
        if (ch1$259 === ';' || ch1$259 === '{' || ch1$259 === '}') {
            ++index$102;
            return {
                type: Token$94.Punctuator,
                value: ch1$259,
                lineNumber: lineNumber$103,
                lineStart: lineStart$104,
                range: [
                    start$258,
                    index$102
                ]
            };
        }
        if (ch1$259 === ',' || ch1$259 === '(' || ch1$259 === ')') {
            ++index$102;
            return {
                type: Token$94.Punctuator,
                value: ch1$259,
                lineNumber: lineNumber$103,
                lineStart: lineStart$104,
                range: [
                    start$258,
                    index$102
                ]
            };
        }
        if (ch1$259 === '#') {
            ++index$102;
            return {
                type: Token$94.Identifier,
                value: ch1$259,
                lineNumber: lineNumber$103,
                lineStart: lineStart$104,
                range: [
                    start$258,
                    index$102
                ]
            };
        }
        ch2$260 = source$100[index$102 + 1];
        if (ch1$259 === '.' && !isDecimalDigit$113(ch2$260)) {
            if (source$100[index$102 + 1] === '.' && source$100[index$102 + 2] === '.') {
                nextChar$124();
                nextChar$124();
                nextChar$124();
                return {
                    type: Token$94.Punctuator,
                    value: '...',
                    lineNumber: lineNumber$103,
                    lineStart: lineStart$104,
                    range: [
                        start$258,
                        index$102
                    ]
                };
            } else {
                return {
                    type: Token$94.Punctuator,
                    value: nextChar$124(),
                    lineNumber: lineNumber$103,
                    lineStart: lineStart$104,
                    range: [
                        start$258,
                        index$102
                    ]
                };
            }
        }
        ch3$261 = source$100[index$102 + 2];
        ch4$262 = source$100[index$102 + 3];
        if (ch1$259 === '>' && ch2$260 === '>' && ch3$261 === '>') {
            if (ch4$262 === '=') {
                index$102 += 4;
                return {
                    type: Token$94.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$103,
                    lineStart: lineStart$104,
                    range: [
                        start$258,
                        index$102
                    ]
                };
            }
        }
        if (ch1$259 === '=' && ch2$260 === '=' && ch3$261 === '=') {
            index$102 += 3;
            return {
                type: Token$94.Punctuator,
                value: '===',
                lineNumber: lineNumber$103,
                lineStart: lineStart$104,
                range: [
                    start$258,
                    index$102
                ]
            };
        }
        if (ch1$259 === '!' && ch2$260 === '=' && ch3$261 === '=') {
            index$102 += 3;
            return {
                type: Token$94.Punctuator,
                value: '!==',
                lineNumber: lineNumber$103,
                lineStart: lineStart$104,
                range: [
                    start$258,
                    index$102
                ]
            };
        }
        if (ch1$259 === '>' && ch2$260 === '>' && ch3$261 === '>') {
            index$102 += 3;
            return {
                type: Token$94.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$103,
                lineStart: lineStart$104,
                range: [
                    start$258,
                    index$102
                ]
            };
        }
        if (ch1$259 === '<' && ch2$260 === '<' && ch3$261 === '=') {
            index$102 += 3;
            return {
                type: Token$94.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$103,
                lineStart: lineStart$104,
                range: [
                    start$258,
                    index$102
                ]
            };
        }
        if (ch1$259 === '>' && ch2$260 === '>' && ch3$261 === '=') {
            index$102 += 3;
            return {
                type: Token$94.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$103,
                lineStart: lineStart$104,
                range: [
                    start$258,
                    index$102
                ]
            };
        }
        if (ch2$260 === '=') {
            if ('<>=!+-*%&|^/'.indexOf(ch1$259) >= 0) {
                index$102 += 2;
                return {
                    type: Token$94.Punctuator,
                    value: ch1$259 + ch2$260,
                    lineNumber: lineNumber$103,
                    lineStart: lineStart$104,
                    range: [
                        start$258,
                        index$102
                    ]
                };
            }
        }
        if (ch1$259 === ch2$260 && '+-<>&|'.indexOf(ch1$259) >= 0) {
            if ('+-<>&|'.indexOf(ch2$260) >= 0) {
                index$102 += 2;
                return {
                    type: Token$94.Punctuator,
                    value: ch1$259 + ch2$260,
                    lineNumber: lineNumber$103,
                    lineStart: lineStart$104,
                    range: [
                        start$258,
                        index$102
                    ]
                };
            }
        }
        if ('[]<>+-*%&|^!~?:=/'.indexOf(ch1$259) >= 0) {
            return {
                type: Token$94.Punctuator,
                value: nextChar$124(),
                lineNumber: lineNumber$103,
                lineStart: lineStart$104,
                range: [
                    start$258,
                    index$102
                ]
            };
        }
    }
    function scanNumericLiteral$130() {
        var number$263, start$264, ch$265;
        ch$265 = source$100[index$102];
        assert$110(isDecimalDigit$113(ch$265) || ch$265 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$264 = index$102;
        number$263 = '';
        if (ch$265 !== '.') {
            number$263 = nextChar$124();
            ch$265 = source$100[index$102];
            if (number$263 === '0') {
                if (ch$265 === 'x' || ch$265 === 'X') {
                    number$263 += nextChar$124();
                    while (index$102 < length$105) {
                        ch$265 = source$100[index$102];
                        if (!isHexDigit$114(ch$265)) {
                            break;
                        }
                        number$263 += nextChar$124();
                    }
                    if (number$263.length <= 2) {
                        throwError$138({}, Messages$98.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$102 < length$105) {
                        ch$265 = source$100[index$102];
                        if (isIdentifierStart$118(ch$265)) {
                            throwError$138({}, Messages$98.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$94.NumericLiteral,
                        value: parseInt(number$263, 16),
                        lineNumber: lineNumber$103,
                        lineStart: lineStart$104,
                        range: [
                            start$264,
                            index$102
                        ]
                    };
                } else if (isOctalDigit$115(ch$265)) {
                    number$263 += nextChar$124();
                    while (index$102 < length$105) {
                        ch$265 = source$100[index$102];
                        if (!isOctalDigit$115(ch$265)) {
                            break;
                        }
                        number$263 += nextChar$124();
                    }
                    if (index$102 < length$105) {
                        ch$265 = source$100[index$102];
                        if (isIdentifierStart$118(ch$265) || isDecimalDigit$113(ch$265)) {
                            throwError$138({}, Messages$98.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$94.NumericLiteral,
                        value: parseInt(number$263, 8),
                        octal: true,
                        lineNumber: lineNumber$103,
                        lineStart: lineStart$104,
                        range: [
                            start$264,
                            index$102
                        ]
                    };
                }
                if (isDecimalDigit$113(ch$265)) {
                    throwError$138({}, Messages$98.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (index$102 < length$105) {
                ch$265 = source$100[index$102];
                if (!isDecimalDigit$113(ch$265)) {
                    break;
                }
                number$263 += nextChar$124();
            }
        }
        if (ch$265 === '.') {
            number$263 += nextChar$124();
            while (index$102 < length$105) {
                ch$265 = source$100[index$102];
                if (!isDecimalDigit$113(ch$265)) {
                    break;
                }
                number$263 += nextChar$124();
            }
        }
        if (ch$265 === 'e' || ch$265 === 'E') {
            number$263 += nextChar$124();
            ch$265 = source$100[index$102];
            if (ch$265 === '+' || ch$265 === '-') {
                number$263 += nextChar$124();
            }
            ch$265 = source$100[index$102];
            if (isDecimalDigit$113(ch$265)) {
                number$263 += nextChar$124();
                while (index$102 < length$105) {
                    ch$265 = source$100[index$102];
                    if (!isDecimalDigit$113(ch$265)) {
                        break;
                    }
                    number$263 += nextChar$124();
                }
            } else {
                ch$265 = 'character ' + ch$265;
                if (index$102 >= length$105) {
                    ch$265 = '<end>';
                }
                throwError$138({}, Messages$98.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (index$102 < length$105) {
            ch$265 = source$100[index$102];
            if (isIdentifierStart$118(ch$265)) {
                throwError$138({}, Messages$98.UnexpectedToken, 'ILLEGAL');
            }
        }
        return {
            type: Token$94.NumericLiteral,
            value: parseFloat(number$263),
            lineNumber: lineNumber$103,
            lineStart: lineStart$104,
            range: [
                start$264,
                index$102
            ]
        };
    }
    function scanStringLiteral$131() {
        var str$266 = '', quote$267, start$268, ch$269, code$270, unescaped$271, restore$272, octal$273 = false;
        quote$267 = source$100[index$102];
        assert$110(quote$267 === '\'' || quote$267 === '"', 'String literal must starts with a quote');
        start$268 = index$102;
        ++index$102;
        while (index$102 < length$105) {
            ch$269 = nextChar$124();
            if (ch$269 === quote$267) {
                quote$267 = '';
                break;
            } else if (ch$269 === '\\') {
                ch$269 = nextChar$124();
                if (!isLineTerminator$117(ch$269)) {
                    switch (ch$269) {
                    case 'n':
                        str$266 += '\n';
                        break;
                    case 'r':
                        str$266 += '\r';
                        break;
                    case 't':
                        str$266 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        restore$272 = index$102;
                        unescaped$271 = scanHexEscape$127(ch$269);
                        if (unescaped$271) {
                            str$266 += unescaped$271;
                        } else {
                            index$102 = restore$272;
                            str$266 += ch$269;
                        }
                        break;
                    case 'b':
                        str$266 += '\b';
                        break;
                    case 'f':
                        str$266 += '\f';
                        break;
                    case 'v':
                        str$266 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$115(ch$269)) {
                            code$270 = '01234567'.indexOf(ch$269);
                            if (code$270 !== 0) {
                                octal$273 = true;
                            }
                            if (index$102 < length$105 && isOctalDigit$115(source$100[index$102])) {
                                octal$273 = true;
                                code$270 = code$270 * 8 + '01234567'.indexOf(nextChar$124());
                                if ('0123'.indexOf(ch$269) >= 0 && index$102 < length$105 && isOctalDigit$115(source$100[index$102])) {
                                    code$270 = code$270 * 8 + '01234567'.indexOf(nextChar$124());
                                }
                            }
                            str$266 += String.fromCharCode(code$270);
                        } else {
                            str$266 += ch$269;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$103;
                    if (ch$269 === '\r' && source$100[index$102] === '\n') {
                        ++index$102;
                    }
                }
            } else if (isLineTerminator$117(ch$269)) {
                break;
            } else {
                str$266 += ch$269;
            }
        }
        if (quote$267 !== '') {
            throwError$138({}, Messages$98.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$94.StringLiteral,
            value: str$266,
            octal: octal$273,
            lineNumber: lineNumber$103,
            lineStart: lineStart$104,
            range: [
                start$268,
                index$102
            ]
        };
    }
    function scanRegExp$132() {
        var str$274 = '', ch$275, start$276, pattern$277, flags$278, value$279, classMarker$280 = false, restore$281;
        buffer$106 = null;
        skipComment$126();
        start$276 = index$102;
        ch$275 = source$100[index$102];
        assert$110(ch$275 === '/', 'Regular expression literal must start with a slash');
        str$274 = nextChar$124();
        while (index$102 < length$105) {
            ch$275 = nextChar$124();
            str$274 += ch$275;
            if (classMarker$280) {
                if (ch$275 === ']') {
                    classMarker$280 = false;
                }
            } else {
                if (ch$275 === '\\') {
                    ch$275 = nextChar$124();
                    if (isLineTerminator$117(ch$275)) {
                        throwError$138({}, Messages$98.UnterminatedRegExp);
                    }
                    str$274 += ch$275;
                } else if (ch$275 === '/') {
                    break;
                } else if (ch$275 === '[') {
                    classMarker$280 = true;
                } else if (isLineTerminator$117(ch$275)) {
                    throwError$138({}, Messages$98.UnterminatedRegExp);
                }
            }
        }
        if (str$274.length === 1) {
            throwError$138({}, Messages$98.UnterminatedRegExp);
        }
        pattern$277 = str$274.substr(1, str$274.length - 2);
        flags$278 = '';
        while (index$102 < length$105) {
            ch$275 = source$100[index$102];
            if (!isIdentifierPart$119(ch$275)) {
                break;
            }
            ++index$102;
            if (ch$275 === '\\' && index$102 < length$105) {
                ch$275 = source$100[index$102];
                if (ch$275 === 'u') {
                    ++index$102;
                    restore$281 = index$102;
                    ch$275 = scanHexEscape$127('u');
                    if (ch$275) {
                        flags$278 += ch$275;
                        str$274 += '\\u';
                        for (; restore$281 < index$102; ++restore$281) {
                            str$274 += source$100[restore$281];
                        }
                    } else {
                        index$102 = restore$281;
                        flags$278 += 'u';
                        str$274 += '\\u';
                    }
                } else {
                    str$274 += '\\';
                }
            } else {
                flags$278 += ch$275;
                str$274 += ch$275;
            }
        }
        try {
            value$279 = new RegExp(pattern$277, flags$278);
        } catch (e$282) {
            throwError$138({}, Messages$98.InvalidRegExp);
        }
        return {
            type: Token$94.RegexLiteral,
            literal: str$274,
            value: value$279,
            lineNumber: lineNumber$103,
            lineStart: lineStart$104,
            range: [
                start$276,
                index$102
            ]
        };
    }
    function isIdentifierName$133(token$283) {
        return token$283.type === Token$94.Identifier || token$283.type === Token$94.Keyword || token$283.type === Token$94.BooleanLiteral || token$283.type === Token$94.NullLiteral;
    }
    function advance$134() {
        var ch$284, token$285;
        skipComment$126();
        if (index$102 >= length$105) {
            return {
                type: Token$94.EOF,
                lineNumber: lineNumber$103,
                lineStart: lineStart$104,
                range: [
                    index$102,
                    index$102
                ]
            };
        }
        ch$284 = source$100[index$102];
        token$285 = scanPunctuator$129();
        if (typeof token$285 !== 'undefined') {
            return token$285;
        }
        if (ch$284 === '\'' || ch$284 === '"') {
            return scanStringLiteral$131();
        }
        if (ch$284 === '.' || isDecimalDigit$113(ch$284)) {
            return scanNumericLiteral$130();
        }
        token$285 = scanIdentifier$128();
        if (typeof token$285 !== 'undefined') {
            return token$285;
        }
        throwError$138({}, Messages$98.UnexpectedToken, 'ILLEGAL');
    }
    function lex$135() {
        var token$286;
        if (buffer$106) {
            token$286 = buffer$106;
            buffer$106 = null;
            index$102++;
            return token$286;
        }
        buffer$106 = null;
        return tokenStream$108[index$102++];
    }
    function lookahead$136() {
        var pos$287, line$288, start$289;
        if (buffer$106 !== null) {
            return buffer$106;
        }
        buffer$106 = tokenStream$108[index$102];
        return buffer$106;
    }
    function peekLineTerminator$137() {
        var pos$290, line$291, start$292, found$293;
        found$293 = tokenStream$108[index$102 - 1].token.lineNumber !== tokenStream$108[index$102].token.lineNumber;
        return found$293;
    }
    function throwError$138(token$294, messageFormat$295) {
        var error$296, args$297 = Array.prototype.slice.call(arguments, 2), msg$298 = messageFormat$295.replace(/%(\d)/g, function (whole$299, index$300) {
                return args$297[index$300] || '';
            });
        if (typeof token$294.lineNumber === 'number') {
            error$296 = new Error('Line ' + token$294.lineNumber + ': ' + msg$298);
            error$296.lineNumber = token$294.lineNumber;
            if (token$294.range && token$294.range.length > 0) {
                error$296.index = token$294.range[0];
                error$296.column = token$294.range[0] - lineStart$104 + 1;
            }
        } else {
            error$296 = new Error('Line ' + lineNumber$103 + ': ' + msg$298);
            error$296.index = index$102;
            error$296.lineNumber = lineNumber$103;
            error$296.column = index$102 - lineStart$104 + 1;
        }
        throw error$296;
    }
    function throwErrorTolerant$139() {
        var error$301;
        try {
            throwError$138.apply(null, arguments);
        } catch (e$302) {
            if (extra$109.errors) {
                extra$109.errors.push(e$302);
            } else {
                throw e$302;
            }
        }
    }
    function throwUnexpected$140(token$303) {
        var s$304;
        if (token$303.type === Token$94.EOF) {
            throwError$138(token$303, Messages$98.UnexpectedEOS);
        }
        if (token$303.type === Token$94.NumericLiteral) {
            throwError$138(token$303, Messages$98.UnexpectedNumber);
        }
        if (token$303.type === Token$94.StringLiteral) {
            throwError$138(token$303, Messages$98.UnexpectedString);
        }
        if (token$303.type === Token$94.Identifier) {
            console.log(token$303);
            throwError$138(token$303, Messages$98.UnexpectedIdentifier);
        }
        if (token$303.type === Token$94.Keyword) {
            if (isFutureReservedWord$120(token$303.value)) {
                throwError$138(token$303, Messages$98.UnexpectedReserved);
            } else if (strict$101 && isStrictModeReservedWord$121(token$303.value)) {
                throwError$138(token$303, Messages$98.StrictReservedWord);
            }
            throwError$138(token$303, Messages$98.UnexpectedToken, token$303.value);
        }
        throwError$138(token$303, Messages$98.UnexpectedToken, token$303.value);
    }
    function expect$141(value$305) {
        var token$306 = lex$135().token;
        if (token$306.type !== Token$94.Punctuator || token$306.value !== value$305) {
            throwUnexpected$140(token$306);
        }
    }
    function expectKeyword$142(keyword$307) {
        var token$308 = lex$135().token;
        if (token$308.type !== Token$94.Keyword || token$308.value !== keyword$307) {
            throwUnexpected$140(token$308);
        }
    }
    function match$143(value$309) {
        var token$310 = lookahead$136().token;
        return token$310.type === Token$94.Punctuator && token$310.value === value$309;
    }
    function matchKeyword$144(keyword$311) {
        var token$312 = lookahead$136().token;
        return token$312.type === Token$94.Keyword && token$312.value === keyword$311;
    }
    function matchAssign$145() {
        var token$313 = lookahead$136().token, op$314 = token$313.value;
        if (token$313.type !== Token$94.Punctuator) {
            return false;
        }
        return op$314 === '=' || op$314 === '*=' || op$314 === '/=' || op$314 === '%=' || op$314 === '+=' || op$314 === '-=' || op$314 === '<<=' || op$314 === '>>=' || op$314 === '>>>=' || op$314 === '&=' || op$314 === '^=' || op$314 === '|=';
    }
    function consumeSemicolon$146() {
        var token$315, line$316;
        if (tokenStream$108[index$102].token.value === ';') {
            lex$135().token;
            return;
        }
        line$316 = tokenStream$108[index$102 - 1].token.lineNumber;
        token$315 = tokenStream$108[index$102].token;
        if (line$316 !== token$315.lineNumber) {
            return;
        }
        if (token$315.type !== Token$94.EOF && !match$143('}')) {
            throwUnexpected$140(token$315);
        }
        return;
    }
    function isLeftHandSide$147(expr$317) {
        return expr$317.type === Syntax$96.Identifier || expr$317.type === Syntax$96.MemberExpression;
    }
    function parseArrayInitialiser$148() {
        var elements$318 = [], undef$319;
        expect$141('[');
        while (!match$143(']')) {
            if (match$143(',')) {
                lex$135().token;
                elements$318.push(undef$319);
            } else {
                elements$318.push(parseAssignmentExpression$177());
                if (!match$143(']')) {
                    expect$141(',');
                }
            }
        }
        expect$141(']');
        return {
            type: Syntax$96.ArrayExpression,
            elements: elements$318
        };
    }
    function parsePropertyFunction$149(param$320, first$321) {
        var previousStrict$322, body$323;
        previousStrict$322 = strict$101;
        body$323 = parseFunctionSourceElements$204();
        if (first$321 && strict$101 && isRestrictedWord$122(param$320[0].name)) {
            throwError$138(first$321, Messages$98.StrictParamName);
        }
        strict$101 = previousStrict$322;
        return {
            type: Syntax$96.FunctionExpression,
            id: null,
            params: param$320,
            body: body$323
        };
    }
    function parseObjectPropertyKey$150() {
        var token$324 = lex$135().token;
        if (token$324.type === Token$94.StringLiteral || token$324.type === Token$94.NumericLiteral) {
            if (strict$101 && token$324.octal) {
                throwError$138(token$324, Messages$98.StrictOctalLiteral);
            }
            return createLiteral$214(token$324);
        }
        return {
            type: Syntax$96.Identifier,
            name: token$324.value
        };
    }
    function parseObjectProperty$151() {
        var token$325, key$326, id$327, param$328;
        token$325 = lookahead$136().token;
        if (token$325.type === Token$94.Identifier) {
            id$327 = parseObjectPropertyKey$150();
            if (token$325.value === 'get' && !match$143(':')) {
                key$326 = parseObjectPropertyKey$150();
                expect$141('(');
                expect$141(')');
                return {
                    type: Syntax$96.Property,
                    key: key$326,
                    value: parsePropertyFunction$149([]),
                    kind: 'get'
                };
            } else if (token$325.value === 'set' && !match$143(':')) {
                key$326 = parseObjectPropertyKey$150();
                expect$141('(');
                token$325 = lookahead$136().token;
                if (token$325.type !== Token$94.Identifier) {
                    throwUnexpected$140(lex$135().token);
                }
                param$328 = [parseVariableIdentifier$181()];
                expect$141(')');
                return {
                    type: Syntax$96.Property,
                    key: key$326,
                    value: parsePropertyFunction$149(param$328, token$325),
                    kind: 'set'
                };
            } else {
                expect$141(':');
                return {
                    type: Syntax$96.Property,
                    key: id$327,
                    value: parseAssignmentExpression$177(),
                    kind: 'init'
                };
            }
        } else if (token$325.type === Token$94.EOF || token$325.type === Token$94.Punctuator) {
            throwUnexpected$140(token$325);
        } else {
            key$326 = parseObjectPropertyKey$150();
            expect$141(':');
            return {
                type: Syntax$96.Property,
                key: key$326,
                value: parseAssignmentExpression$177(),
                kind: 'init'
            };
        }
    }
    function parseObjectInitialiser$152() {
        var token$329, properties$330 = [], property$331, name$332, kind$333, map$334 = {}, toString$335 = String;
        expect$141('{');
        while (!match$143('}')) {
            property$331 = parseObjectProperty$151();
            if (property$331.key.type === Syntax$96.Identifier) {
                name$332 = property$331.key.name;
            } else {
                name$332 = toString$335(property$331.key.value);
            }
            kind$333 = property$331.kind === 'init' ? PropertyKind$97.Data : property$331.kind === 'get' ? PropertyKind$97.Get : PropertyKind$97.Set;
            if (Object.prototype.hasOwnProperty.call(map$334, name$332)) {
                if (map$334[name$332] === PropertyKind$97.Data) {
                    if (strict$101 && kind$333 === PropertyKind$97.Data) {
                        throwErrorTolerant$139({}, Messages$98.StrictDuplicateProperty);
                    } else if (kind$333 !== PropertyKind$97.Data) {
                        throwError$138({}, Messages$98.AccessorDataProperty);
                    }
                } else {
                    if (kind$333 === PropertyKind$97.Data) {
                        throwError$138({}, Messages$98.AccessorDataProperty);
                    } else if (map$334[name$332] & kind$333) {
                        throwError$138({}, Messages$98.AccessorGetSet);
                    }
                }
                map$334[name$332] |= kind$333;
            } else {
                map$334[name$332] = kind$333;
            }
            properties$330.push(property$331);
            if (!match$143('}')) {
                expect$141(',');
            }
        }
        expect$141('}');
        return {
            type: Syntax$96.ObjectExpression,
            properties: properties$330
        };
    }
    function parsePrimaryExpression$153() {
        var expr$336, token$337 = lookahead$136().token, type$338 = token$337.type;
        if (type$338 === Token$94.Identifier) {
            var name$339 = expander$93.resolve(lex$135());
            return {
                type: Syntax$96.Identifier,
                name: name$339
            };
        }
        if (type$338 === Token$94.StringLiteral || type$338 === Token$94.NumericLiteral) {
            if (strict$101 && token$337.octal) {
                throwErrorTolerant$139(token$337, Messages$98.StrictOctalLiteral);
            }
            return createLiteral$214(lex$135().token);
        }
        if (type$338 === Token$94.Keyword) {
            if (matchKeyword$144('this')) {
                lex$135().token;
                return { type: Syntax$96.ThisExpression };
            }
            if (matchKeyword$144('function')) {
                return parseFunctionExpression$206();
            }
        }
        if (type$338 === Token$94.BooleanLiteral) {
            lex$135();
            token$337.value = token$337.value === 'true';
            return createLiteral$214(token$337);
        }
        if (type$338 === Token$94.NullLiteral) {
            lex$135();
            token$337.value = null;
            return createLiteral$214(token$337);
        }
        if (match$143('[')) {
            return parseArrayInitialiser$148();
        }
        if (match$143('{')) {
            return parseObjectInitialiser$152();
        }
        if (match$143('(')) {
            lex$135();
            state$107.lastParenthesized = expr$336 = parseExpression$178();
            expect$141(')');
            return expr$336;
        }
        if (token$337.value instanceof RegExp) {
            return createLiteral$214(lex$135().token);
        }
        return throwUnexpected$140(lex$135().token);
    }
    function parseArguments$154() {
        var args$340 = [];
        expect$141('(');
        if (!match$143(')')) {
            while (index$102 < length$105) {
                args$340.push(parseAssignmentExpression$177());
                if (match$143(')')) {
                    break;
                }
                expect$141(',');
            }
        }
        expect$141(')');
        return args$340;
    }
    function parseNonComputedProperty$155() {
        var token$341 = lex$135().token;
        if (!isIdentifierName$133(token$341)) {
            throwUnexpected$140(token$341);
        }
        return {
            type: Syntax$96.Identifier,
            name: token$341.value
        };
    }
    function parseNonComputedMember$156(object$342) {
        return {
            type: Syntax$96.MemberExpression,
            computed: false,
            object: object$342,
            property: parseNonComputedProperty$155()
        };
    }
    function parseComputedMember$157(object$343) {
        var property$344, expr$345;
        expect$141('[');
        property$344 = parseExpression$178();
        expr$345 = {
            type: Syntax$96.MemberExpression,
            computed: true,
            object: object$343,
            property: property$344
        };
        expect$141(']');
        return expr$345;
    }
    function parseCallMember$158(object$346) {
        return {
            type: Syntax$96.CallExpression,
            callee: object$346,
            'arguments': parseArguments$154()
        };
    }
    function parseNewExpression$159() {
        var expr$347;
        expectKeyword$142('new');
        expr$347 = {
            type: Syntax$96.NewExpression,
            callee: parseLeftHandSideExpression$163(),
            'arguments': []
        };
        if (match$143('(')) {
            expr$347['arguments'] = parseArguments$154();
        }
        return expr$347;
    }
    function toArrayNode$160(arr$348) {
        var els$349 = arr$348.map(function (el$350) {
                return {
                    type: 'Literal',
                    value: el$350,
                    raw: el$350.toString()
                };
            });
        return {
            type: 'ArrayExpression',
            elements: els$349
        };
    }
    function toObjectNode$161(obj$351) {
        var props$352 = Object.keys(obj$351).map(function (key$353) {
                var raw$354 = obj$351[key$353];
                var value$355;
                if (Array.isArray(raw$354)) {
                    value$355 = toArrayNode$160(raw$354);
                } else {
                    value$355 = {
                        type: 'Literal',
                        value: obj$351[key$353],
                        raw: obj$351[key$353].toString()
                    };
                }
                return {
                    type: 'Property',
                    key: {
                        type: 'Identifier',
                        name: key$353
                    },
                    value: value$355,
                    kind: 'init'
                };
            });
        return {
            type: 'ObjectExpression',
            properties: props$352
        };
    }
    function parseLeftHandSideExpressionAllowCall$162() {
        var useNew$356, expr$357;
        useNew$356 = matchKeyword$144('new');
        expr$357 = useNew$356 ? parseNewExpression$159() : parsePrimaryExpression$153();
        while (index$102 < length$105) {
            if (match$143('.')) {
                lex$135();
                expr$357 = parseNonComputedMember$156(expr$357);
            } else if (match$143('[')) {
                expr$357 = parseComputedMember$157(expr$357);
            } else if (match$143('(')) {
                expr$357 = parseCallMember$158(expr$357);
            } else {
                break;
            }
        }
        return expr$357;
    }
    function parseLeftHandSideExpression$163() {
        var useNew$358, expr$359;
        useNew$358 = matchKeyword$144('new');
        expr$359 = useNew$358 ? parseNewExpression$159() : parsePrimaryExpression$153();
        while (index$102 < length$105) {
            if (match$143('.')) {
                lex$135();
                expr$359 = parseNonComputedMember$156(expr$359);
            } else if (match$143('[')) {
                expr$359 = parseComputedMember$157(expr$359);
            } else {
                break;
            }
        }
        return expr$359;
    }
    function parsePostfixExpression$164() {
        var expr$360 = parseLeftHandSideExpressionAllowCall$162();
        if ((match$143('++') || match$143('--')) && !peekLineTerminator$137()) {
            if (strict$101 && expr$360.type === Syntax$96.Identifier && isRestrictedWord$122(expr$360.name)) {
                throwError$138({}, Messages$98.StrictLHSPostfix);
            }
            if (!isLeftHandSide$147(expr$360)) {
                throwError$138({}, Messages$98.InvalidLHSInAssignment);
            }
            expr$360 = {
                type: Syntax$96.UpdateExpression,
                operator: lex$135().token.value,
                argument: expr$360,
                prefix: false
            };
        }
        return expr$360;
    }
    function parseUnaryExpression$165() {
        var token$361, expr$362;
        if (match$143('++') || match$143('--')) {
            token$361 = lex$135().token;
            expr$362 = parseUnaryExpression$165();
            if (strict$101 && expr$362.type === Syntax$96.Identifier && isRestrictedWord$122(expr$362.name)) {
                throwError$138({}, Messages$98.StrictLHSPrefix);
            }
            if (!isLeftHandSide$147(expr$362)) {
                throwError$138({}, Messages$98.InvalidLHSInAssignment);
            }
            expr$362 = {
                type: Syntax$96.UpdateExpression,
                operator: token$361.value,
                argument: expr$362,
                prefix: true
            };
            return expr$362;
        }
        if (match$143('+') || match$143('-') || match$143('~') || match$143('!')) {
            expr$362 = {
                type: Syntax$96.UnaryExpression,
                operator: lex$135().token.value,
                argument: parseUnaryExpression$165()
            };
            return expr$362;
        }
        if (matchKeyword$144('delete') || matchKeyword$144('void') || matchKeyword$144('typeof')) {
            expr$362 = {
                type: Syntax$96.UnaryExpression,
                operator: lex$135().token.value,
                argument: parseUnaryExpression$165()
            };
            if (strict$101 && expr$362.operator === 'delete' && expr$362.argument.type === Syntax$96.Identifier) {
                throwErrorTolerant$139({}, Messages$98.StrictDelete);
            }
            return expr$362;
        }
        return parsePostfixExpression$164();
    }
    function parseMultiplicativeExpression$166() {
        var expr$363 = parseUnaryExpression$165();
        while (match$143('*') || match$143('/') || match$143('%')) {
            expr$363 = {
                type: Syntax$96.BinaryExpression,
                operator: lex$135().token.value,
                left: expr$363,
                right: parseUnaryExpression$165()
            };
        }
        return expr$363;
    }
    function parseAdditiveExpression$167() {
        var expr$364 = parseMultiplicativeExpression$166();
        while (match$143('+') || match$143('-')) {
            expr$364 = {
                type: Syntax$96.BinaryExpression,
                operator: lex$135().token.value,
                left: expr$364,
                right: parseMultiplicativeExpression$166()
            };
        }
        return expr$364;
    }
    function parseShiftExpression$168() {
        var expr$365 = parseAdditiveExpression$167();
        while (match$143('<<') || match$143('>>') || match$143('>>>')) {
            expr$365 = {
                type: Syntax$96.BinaryExpression,
                operator: lex$135().token.value,
                left: expr$365,
                right: parseAdditiveExpression$167()
            };
        }
        return expr$365;
    }
    function parseRelationalExpression$169() {
        var expr$366, previousAllowIn$367;
        previousAllowIn$367 = state$107.allowIn;
        state$107.allowIn = true;
        expr$366 = parseShiftExpression$168();
        while (match$143('<') || match$143('>') || match$143('<=') || match$143('>=') || previousAllowIn$367 && matchKeyword$144('in') || matchKeyword$144('instanceof')) {
            expr$366 = {
                type: Syntax$96.BinaryExpression,
                operator: lex$135().token.value,
                left: expr$366,
                right: parseRelationalExpression$169()
            };
        }
        state$107.allowIn = previousAllowIn$367;
        return expr$366;
    }
    function parseEqualityExpression$170() {
        var expr$368 = parseRelationalExpression$169();
        while (match$143('==') || match$143('!=') || match$143('===') || match$143('!==')) {
            expr$368 = {
                type: Syntax$96.BinaryExpression,
                operator: lex$135().token.value,
                left: expr$368,
                right: parseRelationalExpression$169()
            };
        }
        return expr$368;
    }
    function parseBitwiseANDExpression$171() {
        var expr$369 = parseEqualityExpression$170();
        while (match$143('&')) {
            lex$135();
            expr$369 = {
                type: Syntax$96.BinaryExpression,
                operator: '&',
                left: expr$369,
                right: parseEqualityExpression$170()
            };
        }
        return expr$369;
    }
    function parseBitwiseXORExpression$172() {
        var expr$370 = parseBitwiseANDExpression$171();
        while (match$143('^')) {
            lex$135();
            expr$370 = {
                type: Syntax$96.BinaryExpression,
                operator: '^',
                left: expr$370,
                right: parseBitwiseANDExpression$171()
            };
        }
        return expr$370;
    }
    function parseBitwiseORExpression$173() {
        var expr$371 = parseBitwiseXORExpression$172();
        while (match$143('|')) {
            lex$135();
            expr$371 = {
                type: Syntax$96.BinaryExpression,
                operator: '|',
                left: expr$371,
                right: parseBitwiseXORExpression$172()
            };
        }
        return expr$371;
    }
    function parseLogicalANDExpression$174() {
        var expr$372 = parseBitwiseORExpression$173();
        while (match$143('&&')) {
            lex$135();
            expr$372 = {
                type: Syntax$96.LogicalExpression,
                operator: '&&',
                left: expr$372,
                right: parseBitwiseORExpression$173()
            };
        }
        return expr$372;
    }
    function parseLogicalORExpression$175() {
        var expr$373 = parseLogicalANDExpression$174();
        while (match$143('||')) {
            lex$135();
            expr$373 = {
                type: Syntax$96.LogicalExpression,
                operator: '||',
                left: expr$373,
                right: parseLogicalANDExpression$174()
            };
        }
        return expr$373;
    }
    function parseConditionalExpression$176() {
        var expr$374, previousAllowIn$375, consequent$376;
        expr$374 = parseLogicalORExpression$175();
        if (match$143('?')) {
            lex$135();
            previousAllowIn$375 = state$107.allowIn;
            state$107.allowIn = true;
            consequent$376 = parseAssignmentExpression$177();
            state$107.allowIn = previousAllowIn$375;
            expect$141(':');
            expr$374 = {
                type: Syntax$96.ConditionalExpression,
                test: expr$374,
                consequent: consequent$376,
                alternate: parseAssignmentExpression$177()
            };
        }
        return expr$374;
    }
    function parseAssignmentExpression$177() {
        var expr$377;
        expr$377 = parseConditionalExpression$176();
        if (matchAssign$145()) {
            if (!isLeftHandSide$147(expr$377)) {
                throwError$138({}, Messages$98.InvalidLHSInAssignment);
            }
            if (strict$101 && expr$377.type === Syntax$96.Identifier && isRestrictedWord$122(expr$377.name)) {
                throwError$138({}, Messages$98.StrictLHSAssignment);
            }
            expr$377 = {
                type: Syntax$96.AssignmentExpression,
                operator: lex$135().token.value,
                left: expr$377,
                right: parseAssignmentExpression$177()
            };
        }
        return expr$377;
    }
    function parseExpression$178() {
        var expr$378 = parseAssignmentExpression$177();
        if (match$143(',')) {
            expr$378 = {
                type: Syntax$96.SequenceExpression,
                expressions: [expr$378]
            };
            while (index$102 < length$105) {
                if (!match$143(',')) {
                    break;
                }
                lex$135();
                expr$378.expressions.push(parseAssignmentExpression$177());
            }
        }
        return expr$378;
    }
    function parseStatementList$179() {
        var list$379 = [], statement$380;
        while (index$102 < length$105) {
            if (match$143('}')) {
                break;
            }
            statement$380 = parseSourceElement$207();
            if (typeof statement$380 === 'undefined') {
                break;
            }
            list$379.push(statement$380);
        }
        return list$379;
    }
    function parseBlock$180() {
        var block$381;
        expect$141('{');
        block$381 = parseStatementList$179();
        expect$141('}');
        return {
            type: Syntax$96.BlockStatement,
            body: block$381
        };
    }
    function parseVariableIdentifier$181() {
        var stx$382 = lex$135(), token$383 = stx$382.token;
        if (token$383.type !== Token$94.Identifier) {
            throwUnexpected$140(token$383);
        }
        var name$384 = expander$93.resolve(stx$382);
        return {
            type: Syntax$96.Identifier,
            name: name$384
        };
    }
    function parseVariableDeclaration$182(kind$385) {
        var id$386 = parseVariableIdentifier$181(), init$387 = null;
        if (strict$101 && isRestrictedWord$122(id$386.name)) {
            throwErrorTolerant$139({}, Messages$98.StrictVarName);
        }
        if (kind$385 === 'const') {
            expect$141('=');
            init$387 = parseAssignmentExpression$177();
        } else if (match$143('=')) {
            lex$135();
            init$387 = parseAssignmentExpression$177();
        }
        return {
            type: Syntax$96.VariableDeclarator,
            id: id$386,
            init: init$387
        };
    }
    function parseVariableDeclarationList$183(kind$388) {
        var list$389 = [];
        while (index$102 < length$105) {
            list$389.push(parseVariableDeclaration$182(kind$388));
            if (!match$143(',')) {
                break;
            }
            lex$135();
        }
        return list$389;
    }
    function parseVariableStatement$184() {
        var declarations$390;
        expectKeyword$142('var');
        declarations$390 = parseVariableDeclarationList$183();
        consumeSemicolon$146();
        return {
            type: Syntax$96.VariableDeclaration,
            declarations: declarations$390,
            kind: 'var'
        };
    }
    function parseConstLetDeclaration$185(kind$391) {
        var declarations$392;
        expectKeyword$142(kind$391);
        declarations$392 = parseVariableDeclarationList$183(kind$391);
        consumeSemicolon$146();
        return {
            type: Syntax$96.VariableDeclaration,
            declarations: declarations$392,
            kind: kind$391
        };
    }
    function parseEmptyStatement$186() {
        expect$141(';');
        return { type: Syntax$96.EmptyStatement };
    }
    function parseExpressionStatement$187() {
        var expr$393 = parseExpression$178();
        consumeSemicolon$146();
        return {
            type: Syntax$96.ExpressionStatement,
            expression: expr$393
        };
    }
    function parseIfStatement$188() {
        var test$394, consequent$395, alternate$396;
        expectKeyword$142('if');
        expect$141('(');
        test$394 = parseExpression$178();
        expect$141(')');
        consequent$395 = parseStatement$203();
        if (matchKeyword$144('else')) {
            lex$135();
            alternate$396 = parseStatement$203();
        } else {
            alternate$396 = null;
        }
        return {
            type: Syntax$96.IfStatement,
            test: test$394,
            consequent: consequent$395,
            alternate: alternate$396
        };
    }
    function parseDoWhileStatement$189() {
        var body$397, test$398, oldInIteration$399;
        expectKeyword$142('do');
        oldInIteration$399 = state$107.inIteration;
        state$107.inIteration = true;
        body$397 = parseStatement$203();
        state$107.inIteration = oldInIteration$399;
        expectKeyword$142('while');
        expect$141('(');
        test$398 = parseExpression$178();
        expect$141(')');
        if (match$143(';')) {
            lex$135();
        }
        return {
            type: Syntax$96.DoWhileStatement,
            body: body$397,
            test: test$398
        };
    }
    function parseWhileStatement$190() {
        var test$400, body$401, oldInIteration$402;
        expectKeyword$142('while');
        expect$141('(');
        test$400 = parseExpression$178();
        expect$141(')');
        oldInIteration$402 = state$107.inIteration;
        state$107.inIteration = true;
        body$401 = parseStatement$203();
        state$107.inIteration = oldInIteration$402;
        return {
            type: Syntax$96.WhileStatement,
            test: test$400,
            body: body$401
        };
    }
    function parseForVariableDeclaration$191() {
        var token$403 = lex$135().token;
        return {
            type: Syntax$96.VariableDeclaration,
            declarations: parseVariableDeclarationList$183(),
            kind: token$403.value
        };
    }
    function parseForStatement$192() {
        var init$404, test$405, update$406, left$407, right$408, body$409, oldInIteration$410;
        init$404 = test$405 = update$406 = null;
        expectKeyword$142('for');
        expect$141('(');
        if (match$143(';')) {
            lex$135();
        } else {
            if (matchKeyword$144('var') || matchKeyword$144('let')) {
                state$107.allowIn = false;
                init$404 = parseForVariableDeclaration$191();
                state$107.allowIn = true;
                if (init$404.declarations.length === 1 && matchKeyword$144('in')) {
                    lex$135();
                    left$407 = init$404;
                    right$408 = parseExpression$178();
                    init$404 = null;
                }
            } else {
                state$107.allowIn = false;
                init$404 = parseExpression$178();
                state$107.allowIn = true;
                if (matchKeyword$144('in')) {
                    if (!isLeftHandSide$147(init$404)) {
                        throwError$138({}, Messages$98.InvalidLHSInForIn);
                    }
                    lex$135();
                    left$407 = init$404;
                    right$408 = parseExpression$178();
                    init$404 = null;
                }
            }
            if (typeof left$407 === 'undefined') {
                expect$141(';');
            }
        }
        if (typeof left$407 === 'undefined') {
            if (!match$143(';')) {
                test$405 = parseExpression$178();
            }
            expect$141(';');
            if (!match$143(')')) {
                update$406 = parseExpression$178();
            }
        }
        expect$141(')');
        oldInIteration$410 = state$107.inIteration;
        state$107.inIteration = true;
        body$409 = parseStatement$203();
        state$107.inIteration = oldInIteration$410;
        if (typeof left$407 === 'undefined') {
            return {
                type: Syntax$96.ForStatement,
                init: init$404,
                test: test$405,
                update: update$406,
                body: body$409
            };
        }
        return {
            type: Syntax$96.ForInStatement,
            left: left$407,
            right: right$408,
            body: body$409,
            each: false
        };
    }
    function parseContinueStatement$193() {
        var token$411, label$412 = null;
        expectKeyword$142('continue');
        if (tokenStream$108[index$102].token.value === ';') {
            lex$135();
            if (!state$107.inIteration) {
                throwError$138({}, Messages$98.IllegalContinue);
            }
            return {
                type: Syntax$96.ContinueStatement,
                label: null
            };
        }
        if (peekLineTerminator$137()) {
            if (!state$107.inIteration) {
                throwError$138({}, Messages$98.IllegalContinue);
            }
            return {
                type: Syntax$96.ContinueStatement,
                label: null
            };
        }
        token$411 = lookahead$136().token;
        if (token$411.type === Token$94.Identifier) {
            label$412 = parseVariableIdentifier$181();
            if (!Object.prototype.hasOwnProperty.call(state$107.labelSet, label$412.name)) {
                throwError$138({}, Messages$98.UnknownLabel, label$412.name);
            }
        }
        consumeSemicolon$146();
        if (label$412 === null && !state$107.inIteration) {
            throwError$138({}, Messages$98.IllegalContinue);
        }
        return {
            type: Syntax$96.ContinueStatement,
            label: label$412
        };
    }
    function parseBreakStatement$194() {
        var token$413, label$414 = null;
        expectKeyword$142('break');
        if (peekLineTerminator$137()) {
            if (!(state$107.inIteration || state$107.inSwitch)) {
                throwError$138({}, Messages$98.IllegalBreak);
            }
            return {
                type: Syntax$96.BreakStatement,
                label: null
            };
        }
        token$413 = lookahead$136().token;
        if (token$413.type === Token$94.Identifier) {
            label$414 = parseVariableIdentifier$181();
            if (!Object.prototype.hasOwnProperty.call(state$107.labelSet, label$414.name)) {
                throwError$138({}, Messages$98.UnknownLabel, label$414.name);
            }
        }
        consumeSemicolon$146();
        if (label$414 === null && !(state$107.inIteration || state$107.inSwitch)) {
            throwError$138({}, Messages$98.IllegalBreak);
        }
        return {
            type: Syntax$96.BreakStatement,
            label: label$414
        };
    }
    function parseReturnStatement$195() {
        var token$415, argument$416 = null;
        expectKeyword$142('return');
        if (!state$107.inFunctionBody) {
            throwErrorTolerant$139({}, Messages$98.IllegalReturn);
        }
        if (peekLineTerminator$137()) {
            return {
                type: Syntax$96.ReturnStatement,
                argument: null
            };
        }
        if (!match$143(';')) {
            token$415 = lookahead$136().token;
            if (!match$143('}') && token$415.type !== Token$94.EOF) {
                argument$416 = parseExpression$178();
            }
        }
        consumeSemicolon$146();
        return {
            type: Syntax$96.ReturnStatement,
            argument: argument$416
        };
    }
    function parseWithStatement$196() {
        var object$417, body$418;
        if (strict$101) {
            throwErrorTolerant$139({}, Messages$98.StrictModeWith);
        }
        expectKeyword$142('with');
        expect$141('(');
        object$417 = parseExpression$178();
        expect$141(')');
        body$418 = parseStatement$203();
        return {
            type: Syntax$96.WithStatement,
            object: object$417,
            body: body$418
        };
    }
    function parseSwitchCase$197() {
        var test$419, consequent$420 = [], statement$421;
        if (matchKeyword$144('default')) {
            lex$135();
            test$419 = null;
        } else {
            expectKeyword$142('case');
            test$419 = parseExpression$178();
        }
        expect$141(':');
        while (index$102 < length$105) {
            if (match$143('}') || matchKeyword$144('default') || matchKeyword$144('case')) {
                break;
            }
            statement$421 = parseStatement$203();
            if (typeof statement$421 === 'undefined') {
                break;
            }
            consequent$420.push(statement$421);
        }
        return {
            type: Syntax$96.SwitchCase,
            test: test$419,
            consequent: consequent$420
        };
    }
    function parseSwitchStatement$198() {
        var discriminant$422, cases$423, oldInSwitch$424;
        expectKeyword$142('switch');
        expect$141('(');
        discriminant$422 = parseExpression$178();
        expect$141(')');
        expect$141('{');
        if (match$143('}')) {
            lex$135();
            return {
                type: Syntax$96.SwitchStatement,
                discriminant: discriminant$422
            };
        }
        cases$423 = [];
        oldInSwitch$424 = state$107.inSwitch;
        state$107.inSwitch = true;
        while (index$102 < length$105) {
            if (match$143('}')) {
                break;
            }
            cases$423.push(parseSwitchCase$197());
        }
        state$107.inSwitch = oldInSwitch$424;
        expect$141('}');
        return {
            type: Syntax$96.SwitchStatement,
            discriminant: discriminant$422,
            cases: cases$423
        };
    }
    function parseThrowStatement$199() {
        var argument$425;
        expectKeyword$142('throw');
        if (peekLineTerminator$137()) {
            throwError$138({}, Messages$98.NewlineAfterThrow);
        }
        argument$425 = parseExpression$178();
        consumeSemicolon$146();
        return {
            type: Syntax$96.ThrowStatement,
            argument: argument$425
        };
    }
    function parseCatchClause$200() {
        var param$426;
        expectKeyword$142('catch');
        expect$141('(');
        if (!match$143(')')) {
            param$426 = parseExpression$178();
            if (strict$101 && param$426.type === Syntax$96.Identifier && isRestrictedWord$122(param$426.name)) {
                throwErrorTolerant$139({}, Messages$98.StrictCatchVariable);
            }
        }
        expect$141(')');
        return {
            type: Syntax$96.CatchClause,
            param: param$426,
            guard: null,
            body: parseBlock$180()
        };
    }
    function parseTryStatement$201() {
        var block$427, handlers$428 = [], finalizer$429 = null;
        expectKeyword$142('try');
        block$427 = parseBlock$180();
        if (matchKeyword$144('catch')) {
            handlers$428.push(parseCatchClause$200());
        }
        if (matchKeyword$144('finally')) {
            lex$135();
            finalizer$429 = parseBlock$180();
        }
        if (handlers$428.length === 0 && !finalizer$429) {
            throwError$138({}, Messages$98.NoCatchOrFinally);
        }
        return {
            type: Syntax$96.TryStatement,
            block: block$427,
            handlers: handlers$428,
            finalizer: finalizer$429
        };
    }
    function parseDebuggerStatement$202() {
        expectKeyword$142('debugger');
        consumeSemicolon$146();
        return { type: Syntax$96.DebuggerStatement };
    }
    function parseStatement$203() {
        var token$430 = lookahead$136().token, expr$431, labeledBody$432;
        if (token$430.type === Token$94.EOF) {
            throwUnexpected$140(token$430);
        }
        if (token$430.type === Token$94.Punctuator) {
            switch (token$430.value) {
            case ';':
                return parseEmptyStatement$186();
            case '{':
                return parseBlock$180();
            case '(':
                return parseExpressionStatement$187();
            default:
                break;
            }
        }
        if (token$430.type === Token$94.Keyword) {
            switch (token$430.value) {
            case 'break':
                return parseBreakStatement$194();
            case 'continue':
                return parseContinueStatement$193();
            case 'debugger':
                return parseDebuggerStatement$202();
            case 'do':
                return parseDoWhileStatement$189();
            case 'for':
                return parseForStatement$192();
            case 'function':
                return parseFunctionDeclaration$205();
            case 'if':
                return parseIfStatement$188();
            case 'return':
                return parseReturnStatement$195();
            case 'switch':
                return parseSwitchStatement$198();
            case 'throw':
                return parseThrowStatement$199();
            case 'try':
                return parseTryStatement$201();
            case 'var':
                return parseVariableStatement$184();
            case 'while':
                return parseWhileStatement$190();
            case 'with':
                return parseWithStatement$196();
            default:
                break;
            }
        }
        expr$431 = parseExpression$178();
        if (expr$431.type === Syntax$96.Identifier && match$143(':')) {
            lex$135();
            if (Object.prototype.hasOwnProperty.call(state$107.labelSet, expr$431.name)) {
                throwError$138({}, Messages$98.Redeclaration, 'Label', expr$431.name);
            }
            state$107.labelSet[expr$431.name] = true;
            labeledBody$432 = parseStatement$203();
            delete state$107.labelSet[expr$431.name];
            return {
                type: Syntax$96.LabeledStatement,
                label: expr$431,
                body: labeledBody$432
            };
        }
        consumeSemicolon$146();
        return {
            type: Syntax$96.ExpressionStatement,
            expression: expr$431
        };
    }
    function parseFunctionSourceElements$204() {
        var sourceElement$433, sourceElements$434 = [], token$435, directive$436, firstRestricted$437, oldLabelSet$438, oldInIteration$439, oldInSwitch$440, oldInFunctionBody$441;
        expect$141('{');
        while (index$102 < length$105) {
            token$435 = lookahead$136().token;
            if (token$435.type !== Token$94.StringLiteral) {
                break;
            }
            sourceElement$433 = parseSourceElement$207();
            sourceElements$434.push(sourceElement$433);
            if (sourceElement$433.expression.type !== Syntax$96.Literal) {
                break;
            }
            directive$436 = sliceSource$112(token$435.range[0] + 1, token$435.range[1] - 1);
            if (directive$436 === 'use strict') {
                strict$101 = true;
                if (firstRestricted$437) {
                    throwError$138(firstRestricted$437, Messages$98.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$437 && token$435.octal) {
                    firstRestricted$437 = token$435;
                }
            }
        }
        oldLabelSet$438 = state$107.labelSet;
        oldInIteration$439 = state$107.inIteration;
        oldInSwitch$440 = state$107.inSwitch;
        oldInFunctionBody$441 = state$107.inFunctionBody;
        state$107.labelSet = {};
        state$107.inIteration = false;
        state$107.inSwitch = false;
        state$107.inFunctionBody = true;
        while (index$102 < length$105) {
            if (match$143('}')) {
                break;
            }
            sourceElement$433 = parseSourceElement$207();
            if (typeof sourceElement$433 === 'undefined') {
                break;
            }
            sourceElements$434.push(sourceElement$433);
        }
        expect$141('}');
        state$107.labelSet = oldLabelSet$438;
        state$107.inIteration = oldInIteration$439;
        state$107.inSwitch = oldInSwitch$440;
        state$107.inFunctionBody = oldInFunctionBody$441;
        return {
            type: Syntax$96.BlockStatement,
            body: sourceElements$434
        };
    }
    function parseFunctionDeclaration$205() {
        var id$442, param$443, params$444 = [], body$445, token$446, firstRestricted$447, message$448, previousStrict$449, paramSet$450;
        expectKeyword$142('function');
        token$446 = lookahead$136().token;
        id$442 = parseVariableIdentifier$181();
        if (strict$101) {
            if (isRestrictedWord$122(token$446.value)) {
                throwError$138(token$446, Messages$98.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$122(token$446.value)) {
                firstRestricted$447 = token$446;
                message$448 = Messages$98.StrictFunctionName;
            } else if (isStrictModeReservedWord$121(token$446.value)) {
                firstRestricted$447 = token$446;
                message$448 = Messages$98.StrictReservedWord;
            }
        }
        expect$141('(');
        if (!match$143(')')) {
            paramSet$450 = {};
            while (index$102 < length$105) {
                token$446 = lookahead$136().token;
                param$443 = parseVariableIdentifier$181();
                if (strict$101) {
                    if (isRestrictedWord$122(token$446.value)) {
                        throwError$138(token$446, Messages$98.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$450, token$446.value)) {
                        throwError$138(token$446, Messages$98.StrictParamDupe);
                    }
                } else if (!firstRestricted$447) {
                    if (isRestrictedWord$122(token$446.value)) {
                        firstRestricted$447 = token$446;
                        message$448 = Messages$98.StrictParamName;
                    } else if (isStrictModeReservedWord$121(token$446.value)) {
                        firstRestricted$447 = token$446;
                        message$448 = Messages$98.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$450, token$446.value)) {
                        firstRestricted$447 = token$446;
                        message$448 = Messages$98.StrictParamDupe;
                    }
                }
                params$444.push(param$443);
                paramSet$450[param$443.name] = true;
                if (match$143(')')) {
                    break;
                }
                expect$141(',');
            }
        }
        expect$141(')');
        previousStrict$449 = strict$101;
        body$445 = parseFunctionSourceElements$204();
        if (strict$101 && firstRestricted$447) {
            throwError$138(firstRestricted$447, message$448);
        }
        strict$101 = previousStrict$449;
        return {
            type: Syntax$96.FunctionDeclaration,
            id: id$442,
            params: params$444,
            body: body$445
        };
    }
    function parseFunctionExpression$206() {
        var token$451, id$452 = null, firstRestricted$453, message$454, param$455, params$456 = [], body$457, previousStrict$458, paramSet$459;
        expectKeyword$142('function');
        if (!match$143('(')) {
            token$451 = lookahead$136().token;
            id$452 = parseVariableIdentifier$181();
            if (strict$101) {
                if (isRestrictedWord$122(token$451.value)) {
                    throwError$138(token$451, Messages$98.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$122(token$451.value)) {
                    firstRestricted$453 = token$451;
                    message$454 = Messages$98.StrictFunctionName;
                } else if (isStrictModeReservedWord$121(token$451.value)) {
                    firstRestricted$453 = token$451;
                    message$454 = Messages$98.StrictReservedWord;
                }
            }
        }
        expect$141('(');
        if (!match$143(')')) {
            paramSet$459 = {};
            while (index$102 < length$105) {
                token$451 = lookahead$136().token;
                param$455 = parseVariableIdentifier$181();
                if (strict$101) {
                    if (isRestrictedWord$122(token$451.value)) {
                        throwError$138(token$451, Messages$98.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$459, token$451.value)) {
                        throwError$138(token$451, Messages$98.StrictParamDupe);
                    }
                } else if (!firstRestricted$453) {
                    if (isRestrictedWord$122(token$451.value)) {
                        firstRestricted$453 = token$451;
                        message$454 = Messages$98.StrictParamName;
                    } else if (isStrictModeReservedWord$121(token$451.value)) {
                        firstRestricted$453 = token$451;
                        message$454 = Messages$98.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$459, token$451.value)) {
                        firstRestricted$453 = token$451;
                        message$454 = Messages$98.StrictParamDupe;
                    }
                }
                params$456.push(param$455);
                paramSet$459[param$455.name] = true;
                if (match$143(')')) {
                    break;
                }
                expect$141(',');
            }
        }
        expect$141(')');
        previousStrict$458 = strict$101;
        body$457 = parseFunctionSourceElements$204();
        if (strict$101 && firstRestricted$453) {
            throwError$138(firstRestricted$453, message$454);
        }
        strict$101 = previousStrict$458;
        return {
            type: Syntax$96.FunctionExpression,
            id: id$452,
            params: params$456,
            body: body$457
        };
    }
    function parseSourceElement$207() {
        var token$460 = lookahead$136().token;
        if (token$460.type === Token$94.Keyword) {
            switch (token$460.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$185(token$460.value);
            case 'function':
                return parseFunctionDeclaration$205();
            default:
                return parseStatement$203();
            }
        }
        if (token$460.type !== Token$94.EOF) {
            return parseStatement$203();
        }
    }
    function parseSourceElements$208() {
        var sourceElement$461, sourceElements$462 = [], token$463, directive$464, firstRestricted$465;
        while (index$102 < length$105) {
            token$463 = lookahead$136();
            if (token$463.type !== Token$94.StringLiteral) {
                break;
            }
            sourceElement$461 = parseSourceElement$207();
            sourceElements$462.push(sourceElement$461);
            if (sourceElement$461.expression.type !== Syntax$96.Literal) {
                break;
            }
            directive$464 = sliceSource$112(token$463.range[0] + 1, token$463.range[1] - 1);
            if (directive$464 === 'use strict') {
                strict$101 = true;
                if (firstRestricted$465) {
                    throwError$138(firstRestricted$465, Messages$98.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$465 && token$463.octal) {
                    firstRestricted$465 = token$463;
                }
            }
        }
        while (index$102 < length$105) {
            sourceElement$461 = parseSourceElement$207();
            if (typeof sourceElement$461 === 'undefined') {
                break;
            }
            sourceElements$462.push(sourceElement$461);
        }
        return sourceElements$462;
    }
    function parseProgram$209() {
        var program$466;
        strict$101 = false;
        program$466 = {
            type: Syntax$96.Program,
            body: parseSourceElements$208()
        };
        return program$466;
    }
    function addComment$210(start$467, end$468, type$469, value$470) {
        assert$110(typeof start$467 === 'number', 'Comment must have valid position');
        if (extra$109.comments.length > 0) {
            if (extra$109.comments[extra$109.comments.length - 1].range[1] > start$467) {
                return;
            }
        }
        extra$109.comments.push({
            range: [
                start$467,
                end$468
            ],
            type: type$469,
            value: value$470
        });
    }
    function scanComment$211() {
        var comment$471, ch$472, start$473, blockComment$474, lineComment$475;
        comment$471 = '';
        blockComment$474 = false;
        lineComment$475 = false;
        while (index$102 < length$105) {
            ch$472 = source$100[index$102];
            if (lineComment$475) {
                ch$472 = nextChar$124();
                if (index$102 >= length$105) {
                    lineComment$475 = false;
                    comment$471 += ch$472;
                    addComment$210(start$473, index$102, 'Line', comment$471);
                } else if (isLineTerminator$117(ch$472)) {
                    lineComment$475 = false;
                    addComment$210(start$473, index$102, 'Line', comment$471);
                    if (ch$472 === '\r' && source$100[index$102] === '\n') {
                        ++index$102;
                    }
                    ++lineNumber$103;
                    lineStart$104 = index$102;
                    comment$471 = '';
                } else {
                    comment$471 += ch$472;
                }
            } else if (blockComment$474) {
                if (isLineTerminator$117(ch$472)) {
                    if (ch$472 === '\r' && source$100[index$102 + 1] === '\n') {
                        ++index$102;
                        comment$471 += '\r\n';
                    } else {
                        comment$471 += ch$472;
                    }
                    ++lineNumber$103;
                    ++index$102;
                    lineStart$104 = index$102;
                    if (index$102 >= length$105) {
                        throwError$138({}, Messages$98.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$472 = nextChar$124();
                    if (index$102 >= length$105) {
                        throwError$138({}, Messages$98.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$471 += ch$472;
                    if (ch$472 === '*') {
                        ch$472 = source$100[index$102];
                        if (ch$472 === '/') {
                            comment$471 = comment$471.substr(0, comment$471.length - 1);
                            blockComment$474 = false;
                            ++index$102;
                            addComment$210(start$473, index$102, 'Block', comment$471);
                            comment$471 = '';
                        }
                    }
                }
            } else if (ch$472 === '/') {
                ch$472 = source$100[index$102 + 1];
                if (ch$472 === '/') {
                    start$473 = index$102;
                    index$102 += 2;
                    lineComment$475 = true;
                } else if (ch$472 === '*') {
                    start$473 = index$102;
                    index$102 += 2;
                    blockComment$474 = true;
                    if (index$102 >= length$105) {
                        throwError$138({}, Messages$98.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$116(ch$472)) {
                ++index$102;
            } else if (isLineTerminator$117(ch$472)) {
                ++index$102;
                if (ch$472 === '\r' && source$100[index$102] === '\n') {
                    ++index$102;
                }
                ++lineNumber$103;
                lineStart$104 = index$102;
            } else {
                break;
            }
        }
    }
    function collectToken$212() {
        var token$476 = extra$109.advance(), range$477, value$478;
        if (token$476.type !== Token$94.EOF) {
            range$477 = [
                token$476.range[0],
                token$476.range[1]
            ];
            value$478 = sliceSource$112(token$476.range[0], token$476.range[1]);
            extra$109.tokens.push({
                type: TokenName$95[token$476.type],
                value: value$478,
                lineNumber: lineNumber$103,
                lineStart: lineStart$104,
                range: range$477
            });
        }
        return token$476;
    }
    function collectRegex$213() {
        var pos$479, regex$480, token$481;
        skipComment$126();
        pos$479 = index$102;
        regex$480 = extra$109.scanRegExp();
        if (extra$109.tokens.length > 0) {
            token$481 = extra$109.tokens[extra$109.tokens.length - 1];
            if (token$481.range[0] === pos$479 && token$481.type === 'Punctuator') {
                if (token$481.value === '/' || token$481.value === '/=') {
                    extra$109.tokens.pop();
                }
            }
        }
        extra$109.tokens.push({
            type: 'RegularExpression',
            value: regex$480.literal,
            range: [
                pos$479,
                index$102
            ],
            lineStart: token$481.lineStart,
            lineNumber: token$481.lineNumber
        });
        return regex$480;
    }
    function createLiteral$214(token$482) {
        if (Array.isArray(token$482)) {
            return {
                type: Syntax$96.Literal,
                value: token$482
            };
        }
        return {
            type: Syntax$96.Literal,
            value: token$482.value,
            lineStart: token$482.lineStart,
            lineNumber: token$482.lineNumber
        };
    }
    function createRawLiteral$215(token$483) {
        return {
            type: Syntax$96.Literal,
            value: token$483.value,
            raw: sliceSource$112(token$483.range[0], token$483.range[1]),
            lineStart: token$483.lineStart,
            lineNumber: token$483.lineNumber
        };
    }
    function wrapTrackingFunction$216(range$484, loc$485) {
        return function (parseFunction$486) {
            function isBinary$487(node$489) {
                return node$489.type === Syntax$96.LogicalExpression || node$489.type === Syntax$96.BinaryExpression;
            }
            function visit$488(node$490) {
                if (isBinary$487(node$490.left)) {
                    visit$488(node$490.left);
                }
                if (isBinary$487(node$490.right)) {
                    visit$488(node$490.right);
                }
                if (range$484 && typeof node$490.range === 'undefined') {
                    node$490.range = [
                        node$490.left.range[0],
                        node$490.right.range[1]
                    ];
                }
                if (loc$485 && typeof node$490.loc === 'undefined') {
                    node$490.loc = {
                        start: node$490.left.loc.start,
                        end: node$490.right.loc.end
                    };
                }
            }
            return function () {
                var node$491, rangeInfo$492, locInfo$493;
                var curr$494 = tokenStream$108[index$102].token;
                rangeInfo$492 = [
                    curr$494.range[0],
                    0
                ];
                locInfo$493 = {
                    start: {
                        line: curr$494.lineNumber,
                        column: curr$494.lineStart
                    }
                };
                node$491 = parseFunction$486.apply(null, arguments);
                if (typeof node$491 !== 'undefined') {
                    var last$495 = tokenStream$108[index$102].token;
                    if (range$484) {
                        rangeInfo$492[1] = last$495.range[1];
                        node$491.range = rangeInfo$492;
                    }
                    if (loc$485) {
                        locInfo$493.end = {
                            line: last$495.lineNumber,
                            column: last$495.lineStart
                        };
                        node$491.loc = locInfo$493;
                    }
                    if (isBinary$487(node$491)) {
                        visit$488(node$491);
                    }
                    if (node$491.type === Syntax$96.MemberExpression) {
                        if (typeof node$491.object.range !== 'undefined') {
                            node$491.range[0] = node$491.object.range[0];
                        }
                        if (typeof node$491.object.loc !== 'undefined') {
                            node$491.loc.start = node$491.object.loc.start;
                        }
                    }
                    if (node$491.type === Syntax$96.CallExpression) {
                        if (typeof node$491.callee.range !== 'undefined') {
                            node$491.range[0] = node$491.callee.range[0];
                        }
                        if (typeof node$491.callee.loc !== 'undefined') {
                            node$491.loc.start = node$491.callee.loc.start;
                        }
                    }
                    return node$491;
                }
            };
        };
    }
    function patch$217() {
        var wrapTracking$496;
        if (extra$109.comments) {
            extra$109.skipComment = skipComment$126;
            skipComment$126 = scanComment$211;
        }
        if (extra$109.raw) {
            extra$109.createLiteral = createLiteral$214;
            createLiteral$214 = createRawLiteral$215;
        }
        if (extra$109.range || extra$109.loc) {
            wrapTracking$496 = wrapTrackingFunction$216(extra$109.range, extra$109.loc);
            extra$109.parseAdditiveExpression = parseAdditiveExpression$167;
            extra$109.parseAssignmentExpression = parseAssignmentExpression$177;
            extra$109.parseBitwiseANDExpression = parseBitwiseANDExpression$171;
            extra$109.parseBitwiseORExpression = parseBitwiseORExpression$173;
            extra$109.parseBitwiseXORExpression = parseBitwiseXORExpression$172;
            extra$109.parseBlock = parseBlock$180;
            extra$109.parseFunctionSourceElements = parseFunctionSourceElements$204;
            extra$109.parseCallMember = parseCallMember$158;
            extra$109.parseCatchClause = parseCatchClause$200;
            extra$109.parseComputedMember = parseComputedMember$157;
            extra$109.parseConditionalExpression = parseConditionalExpression$176;
            extra$109.parseConstLetDeclaration = parseConstLetDeclaration$185;
            extra$109.parseEqualityExpression = parseEqualityExpression$170;
            extra$109.parseExpression = parseExpression$178;
            extra$109.parseForVariableDeclaration = parseForVariableDeclaration$191;
            extra$109.parseFunctionDeclaration = parseFunctionDeclaration$205;
            extra$109.parseFunctionExpression = parseFunctionExpression$206;
            extra$109.parseLogicalANDExpression = parseLogicalANDExpression$174;
            extra$109.parseLogicalORExpression = parseLogicalORExpression$175;
            extra$109.parseMultiplicativeExpression = parseMultiplicativeExpression$166;
            extra$109.parseNewExpression = parseNewExpression$159;
            extra$109.parseNonComputedMember = parseNonComputedMember$156;
            extra$109.parseNonComputedProperty = parseNonComputedProperty$155;
            extra$109.parseObjectProperty = parseObjectProperty$151;
            extra$109.parseObjectPropertyKey = parseObjectPropertyKey$150;
            extra$109.parsePostfixExpression = parsePostfixExpression$164;
            extra$109.parsePrimaryExpression = parsePrimaryExpression$153;
            extra$109.parseProgram = parseProgram$209;
            extra$109.parsePropertyFunction = parsePropertyFunction$149;
            extra$109.parseRelationalExpression = parseRelationalExpression$169;
            extra$109.parseStatement = parseStatement$203;
            extra$109.parseShiftExpression = parseShiftExpression$168;
            extra$109.parseSwitchCase = parseSwitchCase$197;
            extra$109.parseUnaryExpression = parseUnaryExpression$165;
            extra$109.parseVariableDeclaration = parseVariableDeclaration$182;
            extra$109.parseVariableIdentifier = parseVariableIdentifier$181;
            parseAdditiveExpression$167 = wrapTracking$496(extra$109.parseAdditiveExpression);
            parseAssignmentExpression$177 = wrapTracking$496(extra$109.parseAssignmentExpression);
            parseBitwiseANDExpression$171 = wrapTracking$496(extra$109.parseBitwiseANDExpression);
            parseBitwiseORExpression$173 = wrapTracking$496(extra$109.parseBitwiseORExpression);
            parseBitwiseXORExpression$172 = wrapTracking$496(extra$109.parseBitwiseXORExpression);
            parseBlock$180 = wrapTracking$496(extra$109.parseBlock);
            parseFunctionSourceElements$204 = wrapTracking$496(extra$109.parseFunctionSourceElements);
            parseCallMember$158 = wrapTracking$496(extra$109.parseCallMember);
            parseCatchClause$200 = wrapTracking$496(extra$109.parseCatchClause);
            parseComputedMember$157 = wrapTracking$496(extra$109.parseComputedMember);
            parseConditionalExpression$176 = wrapTracking$496(extra$109.parseConditionalExpression);
            parseConstLetDeclaration$185 = wrapTracking$496(extra$109.parseConstLetDeclaration);
            parseEqualityExpression$170 = wrapTracking$496(extra$109.parseEqualityExpression);
            parseExpression$178 = wrapTracking$496(extra$109.parseExpression);
            parseForVariableDeclaration$191 = wrapTracking$496(extra$109.parseForVariableDeclaration);
            parseFunctionDeclaration$205 = wrapTracking$496(extra$109.parseFunctionDeclaration);
            parseFunctionExpression$206 = wrapTracking$496(extra$109.parseFunctionExpression);
            parseLogicalANDExpression$174 = wrapTracking$496(extra$109.parseLogicalANDExpression);
            parseLogicalORExpression$175 = wrapTracking$496(extra$109.parseLogicalORExpression);
            parseMultiplicativeExpression$166 = wrapTracking$496(extra$109.parseMultiplicativeExpression);
            parseNewExpression$159 = wrapTracking$496(extra$109.parseNewExpression);
            parseNonComputedMember$156 = wrapTracking$496(extra$109.parseNonComputedMember);
            parseNonComputedProperty$155 = wrapTracking$496(extra$109.parseNonComputedProperty);
            parseObjectProperty$151 = wrapTracking$496(extra$109.parseObjectProperty);
            parseObjectPropertyKey$150 = wrapTracking$496(extra$109.parseObjectPropertyKey);
            parsePostfixExpression$164 = wrapTracking$496(extra$109.parsePostfixExpression);
            parsePrimaryExpression$153 = wrapTracking$496(extra$109.parsePrimaryExpression);
            parseProgram$209 = wrapTracking$496(extra$109.parseProgram);
            parsePropertyFunction$149 = wrapTracking$496(extra$109.parsePropertyFunction);
            parseRelationalExpression$169 = wrapTracking$496(extra$109.parseRelationalExpression);
            parseStatement$203 = wrapTracking$496(extra$109.parseStatement);
            parseShiftExpression$168 = wrapTracking$496(extra$109.parseShiftExpression);
            parseSwitchCase$197 = wrapTracking$496(extra$109.parseSwitchCase);
            parseUnaryExpression$165 = wrapTracking$496(extra$109.parseUnaryExpression);
            parseVariableDeclaration$182 = wrapTracking$496(extra$109.parseVariableDeclaration);
            parseVariableIdentifier$181 = wrapTracking$496(extra$109.parseVariableIdentifier);
        }
        if (typeof extra$109.tokens !== 'undefined') {
            extra$109.advance = advance$134;
            extra$109.scanRegExp = scanRegExp$132;
            advance$134 = collectToken$212;
            scanRegExp$132 = collectRegex$213;
        }
    }
    function unpatch$218() {
        if (typeof extra$109.skipComment === 'function') {
            skipComment$126 = extra$109.skipComment;
        }
        if (extra$109.raw) {
            createLiteral$214 = extra$109.createLiteral;
        }
        if (extra$109.range || extra$109.loc) {
            parseAdditiveExpression$167 = extra$109.parseAdditiveExpression;
            parseAssignmentExpression$177 = extra$109.parseAssignmentExpression;
            parseBitwiseANDExpression$171 = extra$109.parseBitwiseANDExpression;
            parseBitwiseORExpression$173 = extra$109.parseBitwiseORExpression;
            parseBitwiseXORExpression$172 = extra$109.parseBitwiseXORExpression;
            parseBlock$180 = extra$109.parseBlock;
            parseFunctionSourceElements$204 = extra$109.parseFunctionSourceElements;
            parseCallMember$158 = extra$109.parseCallMember;
            parseCatchClause$200 = extra$109.parseCatchClause;
            parseComputedMember$157 = extra$109.parseComputedMember;
            parseConditionalExpression$176 = extra$109.parseConditionalExpression;
            parseConstLetDeclaration$185 = extra$109.parseConstLetDeclaration;
            parseEqualityExpression$170 = extra$109.parseEqualityExpression;
            parseExpression$178 = extra$109.parseExpression;
            parseForVariableDeclaration$191 = extra$109.parseForVariableDeclaration;
            parseFunctionDeclaration$205 = extra$109.parseFunctionDeclaration;
            parseFunctionExpression$206 = extra$109.parseFunctionExpression;
            parseLogicalANDExpression$174 = extra$109.parseLogicalANDExpression;
            parseLogicalORExpression$175 = extra$109.parseLogicalORExpression;
            parseMultiplicativeExpression$166 = extra$109.parseMultiplicativeExpression;
            parseNewExpression$159 = extra$109.parseNewExpression;
            parseNonComputedMember$156 = extra$109.parseNonComputedMember;
            parseNonComputedProperty$155 = extra$109.parseNonComputedProperty;
            parseObjectProperty$151 = extra$109.parseObjectProperty;
            parseObjectPropertyKey$150 = extra$109.parseObjectPropertyKey;
            parsePrimaryExpression$153 = extra$109.parsePrimaryExpression;
            parsePostfixExpression$164 = extra$109.parsePostfixExpression;
            parseProgram$209 = extra$109.parseProgram;
            parsePropertyFunction$149 = extra$109.parsePropertyFunction;
            parseRelationalExpression$169 = extra$109.parseRelationalExpression;
            parseStatement$203 = extra$109.parseStatement;
            parseShiftExpression$168 = extra$109.parseShiftExpression;
            parseSwitchCase$197 = extra$109.parseSwitchCase;
            parseUnaryExpression$165 = extra$109.parseUnaryExpression;
            parseVariableDeclaration$182 = extra$109.parseVariableDeclaration;
            parseVariableIdentifier$181 = extra$109.parseVariableIdentifier;
        }
        if (typeof extra$109.scanRegExp === 'function') {
            advance$134 = extra$109.advance;
            scanRegExp$132 = extra$109.scanRegExp;
        }
    }
    function stringToArray$219(str$497) {
        var length$498 = str$497.length, result$499 = [], i$500;
        for (i$500 = 0; i$500 < length$498; ++i$500) {
            result$499[i$500] = str$497.charAt(i$500);
        }
        return result$499;
    }
    function blockAllowed$220(toks$501, start$502, inExprDelim$503, parentIsBlock$504) {
        var assignOps$505 = [
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
        var binaryOps$506 = [
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
        var unaryOps$507 = [
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
        function back$508(n$509) {
            var idx$510 = toks$501.length - n$509 > 0 ? toks$501.length - n$509 : 0;
            return toks$501[idx$510];
        }
        if (inExprDelim$503 && toks$501.length - (start$502 + 2) <= 0) {
            return false;
        } else if (back$508(start$502 + 2).value === ':' && parentIsBlock$504) {
            return true;
        } else if (isIn$111(back$508(start$502 + 2).value, unaryOps$507.concat(binaryOps$506).concat(assignOps$505))) {
            return false;
        } else if (back$508(start$502 + 2).value === 'return') {
            var currLineNumber$511 = typeof back$508(start$502 + 1).startLineNumber !== 'undefined' ? back$508(start$502 + 1).startLineNumber : back$508(start$502 + 1).lineNumber;
            if (back$508(start$502 + 2).lineNumber !== currLineNumber$511) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$111(back$508(start$502 + 2).value, [
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
    function readToken$221(toks$512, inExprDelim$513, parentIsBlock$514) {
        var delimiters$515 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$516 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$517 = toks$512.length - 1;
        function back$518(n$519) {
            var idx$520 = toks$512.length - n$519 > 0 ? toks$512.length - n$519 : 0;
            return toks$512[idx$520];
        }
        skipComment$126();
        if (isIn$111(getChar$125(), delimiters$515)) {
            return readDelim$222(toks$512, inExprDelim$513, parentIsBlock$514);
        }
        if (getChar$125() === '/') {
            var prev$521 = back$518(1);
            if (prev$521) {
                if (prev$521.value === '()') {
                    if (isIn$111(back$518(2).value, parenIdents$516)) {
                        return scanRegExp$132();
                    }
                    return advance$134();
                }
                if (prev$521.value === '{}') {
                    if (blockAllowed$220(toks$512, 0, inExprDelim$513, parentIsBlock$514)) {
                        if (back$518(2).value === '()') {
                            if (back$518(4).value === 'function') {
                                if (!blockAllowed$220(toks$512, 3, inExprDelim$513, parentIsBlock$514)) {
                                    return advance$134();
                                }
                                if (toks$512.length - 5 <= 0 && inExprDelim$513) {
                                    return advance$134();
                                }
                            }
                            if (back$518(3).value === 'function') {
                                if (!blockAllowed$220(toks$512, 2, inExprDelim$513, parentIsBlock$514)) {
                                    return advance$134();
                                }
                                if (toks$512.length - 4 <= 0 && inExprDelim$513) {
                                    return advance$134();
                                }
                            }
                        }
                        return scanRegExp$132();
                    } else {
                        return advance$134();
                    }
                }
                if (prev$521.type === Token$94.Punctuator) {
                    return scanRegExp$132();
                }
                if (isKeyword$123(prev$521.value)) {
                    return scanRegExp$132();
                }
                return advance$134();
            }
            return scanRegExp$132();
        }
        return advance$134();
    }
    function readDelim$222(toks$522, inExprDelim$523, parentIsBlock$524) {
        var startDelim$525 = advance$134(), matchDelim$526 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$527 = [];
        var delimiters$528 = [
                '(',
                '{',
                '['
            ];
        assert$110(delimiters$528.indexOf(startDelim$525.value) !== -1, 'Need to begin at the delimiter');
        var token$529 = startDelim$525;
        var startLineNumber$530 = token$529.lineNumber;
        var startLineStart$531 = token$529.lineStart;
        var startRange$532 = token$529.range;
        var delimToken$533 = {};
        delimToken$533.type = Token$94.Delimiter;
        delimToken$533.value = startDelim$525.value + matchDelim$526[startDelim$525.value];
        delimToken$533.startLineNumber = startLineNumber$530;
        delimToken$533.startLineStart = startLineStart$531;
        delimToken$533.startRange = startRange$532;
        var delimIsBlock$534 = false;
        if (startDelim$525.value === '{') {
            delimIsBlock$534 = blockAllowed$220(toks$522.concat(delimToken$533), 0, inExprDelim$523, parentIsBlock$524);
        }
        while (index$102 <= length$105) {
            token$529 = readToken$221(inner$527, startDelim$525.value === '(' || startDelim$525.value === '[', delimIsBlock$534);
            if (token$529.type === Token$94.Punctuator && token$529.value === matchDelim$526[startDelim$525.value]) {
                break;
            } else if (token$529.type === Token$94.EOF) {
                throwError$138({}, Messages$98.UnexpectedEOS);
            } else {
                inner$527.push(token$529);
            }
        }
        if (index$102 >= length$105 && matchDelim$526[startDelim$525.value] !== source$100[length$105 - 1]) {
            throwError$138({}, Messages$98.UnexpectedEOS);
        }
        var endLineNumber$535 = token$529.lineNumber;
        var endLineStart$536 = token$529.lineStart;
        var endRange$537 = token$529.range;
        delimToken$533.inner = inner$527;
        delimToken$533.endLineNumber = endLineNumber$535;
        delimToken$533.endLineStart = endLineStart$536;
        delimToken$533.endRange = endRange$537;
        return delimToken$533;
    }
    ;
    function read$223(code$538) {
        var token$539, tokenTree$540 = [];
        extra$109 = {};
        extra$109.comments = [];
        patch$217();
        source$100 = code$538;
        index$102 = 0;
        lineNumber$103 = source$100.length > 0 ? 1 : 0;
        lineStart$104 = 0;
        length$105 = source$100.length;
        buffer$106 = null;
        state$107 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$102 < length$105) {
            tokenTree$540.push(readToken$221(tokenTree$540, false, false));
        }
        var last$541 = tokenTree$540[tokenTree$540.length - 1];
        if (last$541 && last$541.type !== Token$94.EOF) {
            tokenTree$540.push({
                type: Token$94.EOF,
                value: '',
                lineNumber: last$541.lineNumber,
                lineStart: last$541.lineStart,
                range: [
                    index$102,
                    index$102
                ]
            });
        }
        return [
            expander$93.tokensToSyntax(tokenTree$540),
            extra$109.comments
        ];
    }
    function parse$224(code$542, comments$543) {
        var program$544, toString$545;
        tokenStream$108 = code$542;
        index$102 = 0;
        length$105 = tokenStream$108.length;
        buffer$106 = null;
        state$107 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        try {
            program$544 = parseProgram$209();
            program$544.comments = comments$543;
        } catch (e$546) {
            throw e$546;
        } finally {
            unpatch$218();
            extra$109 = {};
        }
        return program$544;
    }
    exports$92.parse = parse$224;
    exports$92.read = read$223;
    exports$92.Token = Token$94;
    exports$92.assert = assert$110;
    exports$92.Syntax = function () {
        var name$547, types$548 = {};
        if (typeof Object.create === 'function') {
            types$548 = Object.create(null);
        }
        for (name$547 in Syntax$96) {
            if (Syntax$96.hasOwnProperty(name$547)) {
                types$548[name$547] = Syntax$96[name$547];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$548);
        }
        return types$548;
    }();
}));