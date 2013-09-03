(function (root$84, factory$85) {
    if (typeof exports === 'object') {
        factory$85(exports, require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$85);
    }
}(this, function (exports$86, expander$87) {
    'use strict';
    var Token$88, TokenName$89, Syntax$90, PropertyKind$91, Messages$92, Regex$93, source$94, strict$95, index$96, lineNumber$97, lineStart$98, length$99, buffer$100, state$101, tokenStream$102, extra$103;
    Token$88 = {
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
    TokenName$89 = {};
    TokenName$89[Token$88.BooleanLiteral] = 'Boolean';
    TokenName$89[Token$88.EOF] = '<end>';
    TokenName$89[Token$88.Identifier] = 'Identifier';
    TokenName$89[Token$88.Keyword] = 'Keyword';
    TokenName$89[Token$88.NullLiteral] = 'Null';
    TokenName$89[Token$88.NumericLiteral] = 'Numeric';
    TokenName$89[Token$88.Punctuator] = 'Punctuator';
    TokenName$89[Token$88.StringLiteral] = 'String';
    TokenName$89[Token$88.Delimiter] = 'Delimiter';
    Syntax$90 = {
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
    PropertyKind$91 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    Messages$92 = {
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
    Regex$93 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    function assert$104(condition$219, message$220) {
        if (!condition$219) {
            throw new Error('ASSERT: ' + message$220);
        }
    }
    function isIn$105(el$221, list$222) {
        return list$222.indexOf(el$221) !== -1;
    }
    function sliceSource$106(from$223, to$224) {
        return source$94.slice(from$223, to$224);
    }
    if (typeof 'esprima'[0] === 'undefined') {
        sliceSource$106 = function sliceArraySource$225(from$226, to$227) {
            return source$94.slice(from$226, to$227).join('');
        };
    }
    function isDecimalDigit$107(ch$228) {
        return '0123456789'.indexOf(ch$228) >= 0;
    }
    function isHexDigit$108(ch$229) {
        return '0123456789abcdefABCDEF'.indexOf(ch$229) >= 0;
    }
    function isOctalDigit$109(ch$230) {
        return '01234567'.indexOf(ch$230) >= 0;
    }
    function isWhiteSpace$110(ch$231) {
        return ch$231 === ' ' || ch$231 === '\t' || ch$231 === '\v' || ch$231 === '\f' || ch$231 === '\xa0' || ch$231.charCodeAt(0) >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(ch$231) >= 0;
    }
    function isLineTerminator$111(ch$232) {
        return ch$232 === '\n' || ch$232 === '\r' || ch$232 === '\u2028' || ch$232 === '\u2029';
    }
    function isIdentifierStart$112(ch$233) {
        return ch$233 === '$' || ch$233 === '_' || ch$233 === '\\' || ch$233 >= 'a' && ch$233 <= 'z' || ch$233 >= 'A' && ch$233 <= 'Z' || ch$233.charCodeAt(0) >= 128 && Regex$93.NonAsciiIdentifierStart.test(ch$233);
    }
    function isIdentifierPart$113(ch$234) {
        return ch$234 === '$' || ch$234 === '_' || ch$234 === '\\' || ch$234 >= 'a' && ch$234 <= 'z' || ch$234 >= 'A' && ch$234 <= 'Z' || ch$234 >= '0' && ch$234 <= '9' || ch$234.charCodeAt(0) >= 128 && Regex$93.NonAsciiIdentifierPart.test(ch$234);
    }
    function isFutureReservedWord$114(id$235) {
        return false;
    }
    function isStrictModeReservedWord$115(id$236) {
        switch (id$236) {
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
    function isRestrictedWord$116(id$237) {
        return id$237 === 'eval' || id$237 === 'arguments';
    }
    function isKeyword$117(id$238) {
        var keyword$239 = false;
        switch (id$238.length) {
        case 2:
            keyword$239 = id$238 === 'if' || id$238 === 'in' || id$238 === 'do';
            break;
        case 3:
            keyword$239 = id$238 === 'var' || id$238 === 'for' || id$238 === 'new' || id$238 === 'try';
            break;
        case 4:
            keyword$239 = id$238 === 'this' || id$238 === 'else' || id$238 === 'case' || id$238 === 'void' || id$238 === 'with';
            break;
        case 5:
            keyword$239 = id$238 === 'while' || id$238 === 'break' || id$238 === 'catch' || id$238 === 'throw';
            break;
        case 6:
            keyword$239 = id$238 === 'return' || id$238 === 'typeof' || id$238 === 'delete' || id$238 === 'switch';
            break;
        case 7:
            keyword$239 = id$238 === 'default' || id$238 === 'finally';
            break;
        case 8:
            keyword$239 = id$238 === 'function' || id$238 === 'continue' || id$238 === 'debugger';
            break;
        case 10:
            keyword$239 = id$238 === 'instanceof';
            break;
        }
        if (keyword$239) {
            return true;
        }
        switch (id$238) {
        case 'const':
            return true;
        case 'yield':
        case 'let':
            return true;
        }
        if (strict$95 && isStrictModeReservedWord$115(id$238)) {
            return true;
        }
        return isFutureReservedWord$114(id$238);
    }
    function nextChar$118() {
        return source$94[index$96++];
    }
    function getChar$119() {
        return source$94[index$96];
    }
    function skipComment$120() {
        var ch$240, blockComment$241, lineComment$242;
        blockComment$241 = false;
        lineComment$242 = false;
        while (index$96 < length$99) {
            ch$240 = source$94[index$96];
            if (lineComment$242) {
                ch$240 = nextChar$118();
                if (isLineTerminator$111(ch$240)) {
                    lineComment$242 = false;
                    if (ch$240 === '\r' && source$94[index$96] === '\n') {
                        ++index$96;
                    }
                    ++lineNumber$97;
                    lineStart$98 = index$96;
                }
            } else if (blockComment$241) {
                if (isLineTerminator$111(ch$240)) {
                    if (ch$240 === '\r' && source$94[index$96 + 1] === '\n') {
                        ++index$96;
                    }
                    ++lineNumber$97;
                    ++index$96;
                    lineStart$98 = index$96;
                    if (index$96 >= length$99) {
                        throwError$132({}, Messages$92.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$240 = nextChar$118();
                    if (index$96 >= length$99) {
                        throwError$132({}, Messages$92.UnexpectedToken, 'ILLEGAL');
                    }
                    if (ch$240 === '*') {
                        ch$240 = source$94[index$96];
                        if (ch$240 === '/') {
                            ++index$96;
                            blockComment$241 = false;
                        }
                    }
                }
            } else if (ch$240 === '/') {
                ch$240 = source$94[index$96 + 1];
                if (ch$240 === '/') {
                    index$96 += 2;
                    lineComment$242 = true;
                } else if (ch$240 === '*') {
                    index$96 += 2;
                    blockComment$241 = true;
                    if (index$96 >= length$99) {
                        throwError$132({}, Messages$92.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$110(ch$240)) {
                ++index$96;
            } else if (isLineTerminator$111(ch$240)) {
                ++index$96;
                if (ch$240 === '\r' && source$94[index$96] === '\n') {
                    ++index$96;
                }
                ++lineNumber$97;
                lineStart$98 = index$96;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$121(prefix$243) {
        var i$244, len$245, ch$246, code$247 = 0;
        len$245 = prefix$243 === 'u' ? 4 : 2;
        for (i$244 = 0; i$244 < len$245; ++i$244) {
            if (index$96 < length$99 && isHexDigit$108(source$94[index$96])) {
                ch$246 = nextChar$118();
                code$247 = code$247 * 16 + '0123456789abcdef'.indexOf(ch$246.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$247);
    }
    function scanIdentifier$122() {
        var ch$248, start$249, id$250, restore$251;
        ch$248 = source$94[index$96];
        if (!isIdentifierStart$112(ch$248)) {
            return;
        }
        start$249 = index$96;
        if (ch$248 === '\\') {
            ++index$96;
            if (source$94[index$96] !== 'u') {
                return;
            }
            ++index$96;
            restore$251 = index$96;
            ch$248 = scanHexEscape$121('u');
            if (ch$248) {
                if (ch$248 === '\\' || !isIdentifierStart$112(ch$248)) {
                    return;
                }
                id$250 = ch$248;
            } else {
                index$96 = restore$251;
                id$250 = 'u';
            }
        } else {
            id$250 = nextChar$118();
        }
        while (index$96 < length$99) {
            ch$248 = source$94[index$96];
            if (!isIdentifierPart$113(ch$248)) {
                break;
            }
            if (ch$248 === '\\') {
                ++index$96;
                if (source$94[index$96] !== 'u') {
                    return;
                }
                ++index$96;
                restore$251 = index$96;
                ch$248 = scanHexEscape$121('u');
                if (ch$248) {
                    if (ch$248 === '\\' || !isIdentifierPart$113(ch$248)) {
                        return;
                    }
                    id$250 += ch$248;
                } else {
                    index$96 = restore$251;
                    id$250 += 'u';
                }
            } else {
                id$250 += nextChar$118();
            }
        }
        if (id$250.length === 1) {
            return {
                type: Token$88.Identifier,
                value: id$250,
                lineNumber: lineNumber$97,
                lineStart: lineStart$98,
                range: [
                    start$249,
                    index$96
                ]
            };
        }
        if (isKeyword$117(id$250)) {
            return {
                type: Token$88.Keyword,
                value: id$250,
                lineNumber: lineNumber$97,
                lineStart: lineStart$98,
                range: [
                    start$249,
                    index$96
                ]
            };
        }
        if (id$250 === 'null') {
            return {
                type: Token$88.NullLiteral,
                value: id$250,
                lineNumber: lineNumber$97,
                lineStart: lineStart$98,
                range: [
                    start$249,
                    index$96
                ]
            };
        }
        if (id$250 === 'true' || id$250 === 'false') {
            return {
                type: Token$88.BooleanLiteral,
                value: id$250,
                lineNumber: lineNumber$97,
                lineStart: lineStart$98,
                range: [
                    start$249,
                    index$96
                ]
            };
        }
        return {
            type: Token$88.Identifier,
            value: id$250,
            lineNumber: lineNumber$97,
            lineStart: lineStart$98,
            range: [
                start$249,
                index$96
            ]
        };
    }
    function scanPunctuator$123() {
        var start$252 = index$96, ch1$253 = source$94[index$96], ch2$254, ch3$255, ch4$256;
        if (ch1$253 === ';' || ch1$253 === '{' || ch1$253 === '}') {
            ++index$96;
            return {
                type: Token$88.Punctuator,
                value: ch1$253,
                lineNumber: lineNumber$97,
                lineStart: lineStart$98,
                range: [
                    start$252,
                    index$96
                ]
            };
        }
        if (ch1$253 === ',' || ch1$253 === '(' || ch1$253 === ')') {
            ++index$96;
            return {
                type: Token$88.Punctuator,
                value: ch1$253,
                lineNumber: lineNumber$97,
                lineStart: lineStart$98,
                range: [
                    start$252,
                    index$96
                ]
            };
        }
        if (ch1$253 === '#') {
            ++index$96;
            return {
                type: Token$88.Identifier,
                value: ch1$253,
                lineNumber: lineNumber$97,
                lineStart: lineStart$98,
                range: [
                    start$252,
                    index$96
                ]
            };
        }
        ch2$254 = source$94[index$96 + 1];
        if (ch1$253 === '.' && !isDecimalDigit$107(ch2$254)) {
            if (source$94[index$96 + 1] === '.' && source$94[index$96 + 2] === '.') {
                nextChar$118();
                nextChar$118();
                nextChar$118();
                return {
                    type: Token$88.Punctuator,
                    value: '...',
                    lineNumber: lineNumber$97,
                    lineStart: lineStart$98,
                    range: [
                        start$252,
                        index$96
                    ]
                };
            } else {
                return {
                    type: Token$88.Punctuator,
                    value: nextChar$118(),
                    lineNumber: lineNumber$97,
                    lineStart: lineStart$98,
                    range: [
                        start$252,
                        index$96
                    ]
                };
            }
        }
        ch3$255 = source$94[index$96 + 2];
        ch4$256 = source$94[index$96 + 3];
        if (ch1$253 === '>' && ch2$254 === '>' && ch3$255 === '>') {
            if (ch4$256 === '=') {
                index$96 += 4;
                return {
                    type: Token$88.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$97,
                    lineStart: lineStart$98,
                    range: [
                        start$252,
                        index$96
                    ]
                };
            }
        }
        if (ch1$253 === '=' && ch2$254 === '=' && ch3$255 === '=') {
            index$96 += 3;
            return {
                type: Token$88.Punctuator,
                value: '===',
                lineNumber: lineNumber$97,
                lineStart: lineStart$98,
                range: [
                    start$252,
                    index$96
                ]
            };
        }
        if (ch1$253 === '!' && ch2$254 === '=' && ch3$255 === '=') {
            index$96 += 3;
            return {
                type: Token$88.Punctuator,
                value: '!==',
                lineNumber: lineNumber$97,
                lineStart: lineStart$98,
                range: [
                    start$252,
                    index$96
                ]
            };
        }
        if (ch1$253 === '>' && ch2$254 === '>' && ch3$255 === '>') {
            index$96 += 3;
            return {
                type: Token$88.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$97,
                lineStart: lineStart$98,
                range: [
                    start$252,
                    index$96
                ]
            };
        }
        if (ch1$253 === '<' && ch2$254 === '<' && ch3$255 === '=') {
            index$96 += 3;
            return {
                type: Token$88.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$97,
                lineStart: lineStart$98,
                range: [
                    start$252,
                    index$96
                ]
            };
        }
        if (ch1$253 === '>' && ch2$254 === '>' && ch3$255 === '=') {
            index$96 += 3;
            return {
                type: Token$88.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$97,
                lineStart: lineStart$98,
                range: [
                    start$252,
                    index$96
                ]
            };
        }
        if (ch2$254 === '=') {
            if ('<>=!+-*%&|^/'.indexOf(ch1$253) >= 0) {
                index$96 += 2;
                return {
                    type: Token$88.Punctuator,
                    value: ch1$253 + ch2$254,
                    lineNumber: lineNumber$97,
                    lineStart: lineStart$98,
                    range: [
                        start$252,
                        index$96
                    ]
                };
            }
        }
        if (ch1$253 === ch2$254 && '+-<>&|'.indexOf(ch1$253) >= 0) {
            if ('+-<>&|'.indexOf(ch2$254) >= 0) {
                index$96 += 2;
                return {
                    type: Token$88.Punctuator,
                    value: ch1$253 + ch2$254,
                    lineNumber: lineNumber$97,
                    lineStart: lineStart$98,
                    range: [
                        start$252,
                        index$96
                    ]
                };
            }
        }
        if ('[]<>+-*%&|^!~?:=/'.indexOf(ch1$253) >= 0) {
            return {
                type: Token$88.Punctuator,
                value: nextChar$118(),
                lineNumber: lineNumber$97,
                lineStart: lineStart$98,
                range: [
                    start$252,
                    index$96
                ]
            };
        }
    }
    function scanNumericLiteral$124() {
        var number$257, start$258, ch$259;
        ch$259 = source$94[index$96];
        assert$104(isDecimalDigit$107(ch$259) || ch$259 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$258 = index$96;
        number$257 = '';
        if (ch$259 !== '.') {
            number$257 = nextChar$118();
            ch$259 = source$94[index$96];
            if (number$257 === '0') {
                if (ch$259 === 'x' || ch$259 === 'X') {
                    number$257 += nextChar$118();
                    while (index$96 < length$99) {
                        ch$259 = source$94[index$96];
                        if (!isHexDigit$108(ch$259)) {
                            break;
                        }
                        number$257 += nextChar$118();
                    }
                    if (number$257.length <= 2) {
                        throwError$132({}, Messages$92.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$96 < length$99) {
                        ch$259 = source$94[index$96];
                        if (isIdentifierStart$112(ch$259)) {
                            throwError$132({}, Messages$92.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$88.NumericLiteral,
                        value: parseInt(number$257, 16),
                        lineNumber: lineNumber$97,
                        lineStart: lineStart$98,
                        range: [
                            start$258,
                            index$96
                        ]
                    };
                } else if (isOctalDigit$109(ch$259)) {
                    number$257 += nextChar$118();
                    while (index$96 < length$99) {
                        ch$259 = source$94[index$96];
                        if (!isOctalDigit$109(ch$259)) {
                            break;
                        }
                        number$257 += nextChar$118();
                    }
                    if (index$96 < length$99) {
                        ch$259 = source$94[index$96];
                        if (isIdentifierStart$112(ch$259) || isDecimalDigit$107(ch$259)) {
                            throwError$132({}, Messages$92.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$88.NumericLiteral,
                        value: parseInt(number$257, 8),
                        octal: true,
                        lineNumber: lineNumber$97,
                        lineStart: lineStart$98,
                        range: [
                            start$258,
                            index$96
                        ]
                    };
                }
                if (isDecimalDigit$107(ch$259)) {
                    throwError$132({}, Messages$92.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (index$96 < length$99) {
                ch$259 = source$94[index$96];
                if (!isDecimalDigit$107(ch$259)) {
                    break;
                }
                number$257 += nextChar$118();
            }
        }
        if (ch$259 === '.') {
            number$257 += nextChar$118();
            while (index$96 < length$99) {
                ch$259 = source$94[index$96];
                if (!isDecimalDigit$107(ch$259)) {
                    break;
                }
                number$257 += nextChar$118();
            }
        }
        if (ch$259 === 'e' || ch$259 === 'E') {
            number$257 += nextChar$118();
            ch$259 = source$94[index$96];
            if (ch$259 === '+' || ch$259 === '-') {
                number$257 += nextChar$118();
            }
            ch$259 = source$94[index$96];
            if (isDecimalDigit$107(ch$259)) {
                number$257 += nextChar$118();
                while (index$96 < length$99) {
                    ch$259 = source$94[index$96];
                    if (!isDecimalDigit$107(ch$259)) {
                        break;
                    }
                    number$257 += nextChar$118();
                }
            } else {
                ch$259 = 'character ' + ch$259;
                if (index$96 >= length$99) {
                    ch$259 = '<end>';
                }
                throwError$132({}, Messages$92.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (index$96 < length$99) {
            ch$259 = source$94[index$96];
            if (isIdentifierStart$112(ch$259)) {
                throwError$132({}, Messages$92.UnexpectedToken, 'ILLEGAL');
            }
        }
        return {
            type: Token$88.NumericLiteral,
            value: parseFloat(number$257),
            lineNumber: lineNumber$97,
            lineStart: lineStart$98,
            range: [
                start$258,
                index$96
            ]
        };
    }
    function scanStringLiteral$125() {
        var str$260 = '', quote$261, start$262, ch$263, code$264, unescaped$265, restore$266, octal$267 = false;
        quote$261 = source$94[index$96];
        assert$104(quote$261 === '\'' || quote$261 === '"', 'String literal must starts with a quote');
        start$262 = index$96;
        ++index$96;
        while (index$96 < length$99) {
            ch$263 = nextChar$118();
            if (ch$263 === quote$261) {
                quote$261 = '';
                break;
            } else if (ch$263 === '\\') {
                ch$263 = nextChar$118();
                if (!isLineTerminator$111(ch$263)) {
                    switch (ch$263) {
                    case 'n':
                        str$260 += '\n';
                        break;
                    case 'r':
                        str$260 += '\r';
                        break;
                    case 't':
                        str$260 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        restore$266 = index$96;
                        unescaped$265 = scanHexEscape$121(ch$263);
                        if (unescaped$265) {
                            str$260 += unescaped$265;
                        } else {
                            index$96 = restore$266;
                            str$260 += ch$263;
                        }
                        break;
                    case 'b':
                        str$260 += '\b';
                        break;
                    case 'f':
                        str$260 += '\f';
                        break;
                    case 'v':
                        str$260 += '\v';
                        break;
                    default:
                        if (isOctalDigit$109(ch$263)) {
                            code$264 = '01234567'.indexOf(ch$263);
                            if (code$264 !== 0) {
                                octal$267 = true;
                            }
                            if (index$96 < length$99 && isOctalDigit$109(source$94[index$96])) {
                                octal$267 = true;
                                code$264 = code$264 * 8 + '01234567'.indexOf(nextChar$118());
                                if ('0123'.indexOf(ch$263) >= 0 && index$96 < length$99 && isOctalDigit$109(source$94[index$96])) {
                                    code$264 = code$264 * 8 + '01234567'.indexOf(nextChar$118());
                                }
                            }
                            str$260 += String.fromCharCode(code$264);
                        } else {
                            str$260 += ch$263;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$97;
                    if (ch$263 === '\r' && source$94[index$96] === '\n') {
                        ++index$96;
                    }
                }
            } else if (isLineTerminator$111(ch$263)) {
                break;
            } else {
                str$260 += ch$263;
            }
        }
        if (quote$261 !== '') {
            throwError$132({}, Messages$92.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$88.StringLiteral,
            value: str$260,
            octal: octal$267,
            lineNumber: lineNumber$97,
            lineStart: lineStart$98,
            range: [
                start$262,
                index$96
            ]
        };
    }
    function scanRegExp$126() {
        var str$268 = '', ch$269, start$270, pattern$271, flags$272, value$273, classMarker$274 = false, restore$275;
        buffer$100 = null;
        skipComment$120();
        start$270 = index$96;
        ch$269 = source$94[index$96];
        assert$104(ch$269 === '/', 'Regular expression literal must start with a slash');
        str$268 = nextChar$118();
        while (index$96 < length$99) {
            ch$269 = nextChar$118();
            str$268 += ch$269;
            if (classMarker$274) {
                if (ch$269 === ']') {
                    classMarker$274 = false;
                }
            } else {
                if (ch$269 === '\\') {
                    ch$269 = nextChar$118();
                    if (isLineTerminator$111(ch$269)) {
                        throwError$132({}, Messages$92.UnterminatedRegExp);
                    }
                    str$268 += ch$269;
                } else if (ch$269 === '/') {
                    break;
                } else if (ch$269 === '[') {
                    classMarker$274 = true;
                } else if (isLineTerminator$111(ch$269)) {
                    throwError$132({}, Messages$92.UnterminatedRegExp);
                }
            }
        }
        if (str$268.length === 1) {
            throwError$132({}, Messages$92.UnterminatedRegExp);
        }
        pattern$271 = str$268.substr(1, str$268.length - 2);
        flags$272 = '';
        while (index$96 < length$99) {
            ch$269 = source$94[index$96];
            if (!isIdentifierPart$113(ch$269)) {
                break;
            }
            ++index$96;
            if (ch$269 === '\\' && index$96 < length$99) {
                ch$269 = source$94[index$96];
                if (ch$269 === 'u') {
                    ++index$96;
                    restore$275 = index$96;
                    ch$269 = scanHexEscape$121('u');
                    if (ch$269) {
                        flags$272 += ch$269;
                        str$268 += '\\u';
                        for (; restore$275 < index$96; ++restore$275) {
                            str$268 += source$94[restore$275];
                        }
                    } else {
                        index$96 = restore$275;
                        flags$272 += 'u';
                        str$268 += '\\u';
                    }
                } else {
                    str$268 += '\\';
                }
            } else {
                flags$272 += ch$269;
                str$268 += ch$269;
            }
        }
        try {
            value$273 = new RegExp(pattern$271, flags$272);
        } catch (e$276) {
            throwError$132({}, Messages$92.InvalidRegExp);
        }
        return {
            type: Token$88.RegexLiteral,
            literal: str$268,
            value: value$273,
            lineNumber: lineNumber$97,
            lineStart: lineStart$98,
            range: [
                start$270,
                index$96
            ]
        };
    }
    function isIdentifierName$127(token$277) {
        return token$277.type === Token$88.Identifier || token$277.type === Token$88.Keyword || token$277.type === Token$88.BooleanLiteral || token$277.type === Token$88.NullLiteral;
    }
    function advance$128() {
        var ch$278, token$279;
        skipComment$120();
        if (index$96 >= length$99) {
            return {
                type: Token$88.EOF,
                lineNumber: lineNumber$97,
                lineStart: lineStart$98,
                range: [
                    index$96,
                    index$96
                ]
            };
        }
        ch$278 = source$94[index$96];
        token$279 = scanPunctuator$123();
        if (typeof token$279 !== 'undefined') {
            return token$279;
        }
        if (ch$278 === '\'' || ch$278 === '"') {
            return scanStringLiteral$125();
        }
        if (ch$278 === '.' || isDecimalDigit$107(ch$278)) {
            return scanNumericLiteral$124();
        }
        token$279 = scanIdentifier$122();
        if (typeof token$279 !== 'undefined') {
            return token$279;
        }
        throwError$132({}, Messages$92.UnexpectedToken, 'ILLEGAL');
    }
    function lex$129() {
        var token$280;
        if (buffer$100) {
            token$280 = buffer$100;
            buffer$100 = null;
            index$96++;
            return token$280;
        }
        buffer$100 = null;
        return tokenStream$102[index$96++];
    }
    function lookahead$130() {
        var pos$281, line$282, start$283;
        if (buffer$100 !== null) {
            return buffer$100;
        }
        buffer$100 = tokenStream$102[index$96];
        return buffer$100;
    }
    function peekLineTerminator$131() {
        var pos$284, line$285, start$286, found$287;
        found$287 = tokenStream$102[index$96 - 1].token.lineNumber !== tokenStream$102[index$96].token.lineNumber;
        return found$287;
    }
    function throwError$132(token$288, messageFormat$289) {
        var error$290, args$291 = Array.prototype.slice.call(arguments, 2), msg$292 = messageFormat$289.replace(/%(\d)/g, function (whole$293, index$294) {
                return args$291[index$294] || '';
            });
        if (typeof token$288.lineNumber === 'number') {
            error$290 = new Error('Line ' + token$288.lineNumber + ': ' + msg$292);
            error$290.lineNumber = token$288.lineNumber;
            if (token$288.range && token$288.range.length > 0) {
                error$290.index = token$288.range[0];
                error$290.column = token$288.range[0] - lineStart$98 + 1;
            }
        } else {
            error$290 = new Error('Line ' + lineNumber$97 + ': ' + msg$292);
            error$290.index = index$96;
            error$290.lineNumber = lineNumber$97;
            error$290.column = index$96 - lineStart$98 + 1;
        }
        throw error$290;
    }
    function throwErrorTolerant$133() {
        var error$295;
        try {
            throwError$132.apply(null, arguments);
        } catch (e$296) {
            if (extra$103.errors) {
                extra$103.errors.push(e$296);
            } else {
                throw e$296;
            }
        }
    }
    function throwUnexpected$134(token$297) {
        var s$298;
        if (token$297.type === Token$88.EOF) {
            throwError$132(token$297, Messages$92.UnexpectedEOS);
        }
        if (token$297.type === Token$88.NumericLiteral) {
            throwError$132(token$297, Messages$92.UnexpectedNumber);
        }
        if (token$297.type === Token$88.StringLiteral) {
            throwError$132(token$297, Messages$92.UnexpectedString);
        }
        if (token$297.type === Token$88.Identifier) {
            console.log(token$297);
            throwError$132(token$297, Messages$92.UnexpectedIdentifier);
        }
        if (token$297.type === Token$88.Keyword) {
            if (isFutureReservedWord$114(token$297.value)) {
                throwError$132(token$297, Messages$92.UnexpectedReserved);
            } else if (strict$95 && isStrictModeReservedWord$115(token$297.value)) {
                throwError$132(token$297, Messages$92.StrictReservedWord);
            }
            throwError$132(token$297, Messages$92.UnexpectedToken, token$297.value);
        }
        throwError$132(token$297, Messages$92.UnexpectedToken, token$297.value);
    }
    function expect$135(value$299) {
        var token$300 = lex$129().token;
        if (token$300.type !== Token$88.Punctuator || token$300.value !== value$299) {
            throwUnexpected$134(token$300);
        }
    }
    function expectKeyword$136(keyword$301) {
        var token$302 = lex$129().token;
        if (token$302.type !== Token$88.Keyword || token$302.value !== keyword$301) {
            throwUnexpected$134(token$302);
        }
    }
    function match$137(value$303) {
        var token$304 = lookahead$130().token;
        return token$304.type === Token$88.Punctuator && token$304.value === value$303;
    }
    function matchKeyword$138(keyword$305) {
        var token$306 = lookahead$130().token;
        return token$306.type === Token$88.Keyword && token$306.value === keyword$305;
    }
    function matchAssign$139() {
        var token$307 = lookahead$130().token, op$308 = token$307.value;
        if (token$307.type !== Token$88.Punctuator) {
            return false;
        }
        return op$308 === '=' || op$308 === '*=' || op$308 === '/=' || op$308 === '%=' || op$308 === '+=' || op$308 === '-=' || op$308 === '<<=' || op$308 === '>>=' || op$308 === '>>>=' || op$308 === '&=' || op$308 === '^=' || op$308 === '|=';
    }
    function consumeSemicolon$140() {
        var token$309, line$310;
        if (tokenStream$102[index$96].token.value === ';') {
            lex$129().token;
            return;
        }
        line$310 = tokenStream$102[index$96 - 1].token.lineNumber;
        token$309 = tokenStream$102[index$96].token;
        if (line$310 !== token$309.lineNumber) {
            return;
        }
        if (token$309.type !== Token$88.EOF && !match$137('}')) {
            throwUnexpected$134(token$309);
        }
        return;
    }
    function isLeftHandSide$141(expr$311) {
        return expr$311.type === Syntax$90.Identifier || expr$311.type === Syntax$90.MemberExpression;
    }
    function parseArrayInitialiser$142() {
        var elements$312 = [], undef$313;
        expect$135('[');
        while (!match$137(']')) {
            if (match$137(',')) {
                lex$129().token;
                elements$312.push(undef$313);
            } else {
                elements$312.push(parseAssignmentExpression$171());
                if (!match$137(']')) {
                    expect$135(',');
                }
            }
        }
        expect$135(']');
        return {
            type: Syntax$90.ArrayExpression,
            elements: elements$312
        };
    }
    function parsePropertyFunction$143(param$314, first$315) {
        var previousStrict$316, body$317;
        previousStrict$316 = strict$95;
        body$317 = parseFunctionSourceElements$198();
        if (first$315 && strict$95 && isRestrictedWord$116(param$314[0].name)) {
            throwError$132(first$315, Messages$92.StrictParamName);
        }
        strict$95 = previousStrict$316;
        return {
            type: Syntax$90.FunctionExpression,
            id: null,
            params: param$314,
            body: body$317
        };
    }
    function parseObjectPropertyKey$144() {
        var token$318 = lex$129().token;
        if (token$318.type === Token$88.StringLiteral || token$318.type === Token$88.NumericLiteral) {
            if (strict$95 && token$318.octal) {
                throwError$132(token$318, Messages$92.StrictOctalLiteral);
            }
            return createLiteral$208(token$318);
        }
        return {
            type: Syntax$90.Identifier,
            name: token$318.value
        };
    }
    function parseObjectProperty$145() {
        var token$319, key$320, id$321, param$322;
        token$319 = lookahead$130().token;
        if (token$319.type === Token$88.Identifier) {
            id$321 = parseObjectPropertyKey$144();
            if (token$319.value === 'get' && !match$137(':')) {
                key$320 = parseObjectPropertyKey$144();
                expect$135('(');
                expect$135(')');
                return {
                    type: Syntax$90.Property,
                    key: key$320,
                    value: parsePropertyFunction$143([]),
                    kind: 'get'
                };
            } else if (token$319.value === 'set' && !match$137(':')) {
                key$320 = parseObjectPropertyKey$144();
                expect$135('(');
                token$319 = lookahead$130().token;
                if (token$319.type !== Token$88.Identifier) {
                    throwUnexpected$134(lex$129().token);
                }
                param$322 = [parseVariableIdentifier$175()];
                expect$135(')');
                return {
                    type: Syntax$90.Property,
                    key: key$320,
                    value: parsePropertyFunction$143(param$322, token$319),
                    kind: 'set'
                };
            } else {
                expect$135(':');
                return {
                    type: Syntax$90.Property,
                    key: id$321,
                    value: parseAssignmentExpression$171(),
                    kind: 'init'
                };
            }
        } else if (token$319.type === Token$88.EOF || token$319.type === Token$88.Punctuator) {
            throwUnexpected$134(token$319);
        } else {
            key$320 = parseObjectPropertyKey$144();
            expect$135(':');
            return {
                type: Syntax$90.Property,
                key: key$320,
                value: parseAssignmentExpression$171(),
                kind: 'init'
            };
        }
    }
    function parseObjectInitialiser$146() {
        var token$323, properties$324 = [], property$325, name$326, kind$327, map$328 = {}, toString$329 = String;
        expect$135('{');
        while (!match$137('}')) {
            property$325 = parseObjectProperty$145();
            if (property$325.key.type === Syntax$90.Identifier) {
                name$326 = property$325.key.name;
            } else {
                name$326 = toString$329(property$325.key.value);
            }
            kind$327 = property$325.kind === 'init' ? PropertyKind$91.Data : property$325.kind === 'get' ? PropertyKind$91.Get : PropertyKind$91.Set;
            if (Object.prototype.hasOwnProperty.call(map$328, name$326)) {
                if (map$328[name$326] === PropertyKind$91.Data) {
                    if (strict$95 && kind$327 === PropertyKind$91.Data) {
                        throwErrorTolerant$133({}, Messages$92.StrictDuplicateProperty);
                    } else if (kind$327 !== PropertyKind$91.Data) {
                        throwError$132({}, Messages$92.AccessorDataProperty);
                    }
                } else {
                    if (kind$327 === PropertyKind$91.Data) {
                        throwError$132({}, Messages$92.AccessorDataProperty);
                    } else if (map$328[name$326] & kind$327) {
                        throwError$132({}, Messages$92.AccessorGetSet);
                    }
                }
                map$328[name$326] |= kind$327;
            } else {
                map$328[name$326] = kind$327;
            }
            properties$324.push(property$325);
            if (!match$137('}')) {
                expect$135(',');
            }
        }
        expect$135('}');
        return {
            type: Syntax$90.ObjectExpression,
            properties: properties$324
        };
    }
    function parsePrimaryExpression$147() {
        var expr$330, token$331 = lookahead$130().token, type$332 = token$331.type;
        if (type$332 === Token$88.Identifier) {
            var name$333 = extra$103.noresolve ? lex$129().token.value : expander$87.resolve(lex$129());
            return {
                type: Syntax$90.Identifier,
                name: name$333
            };
        }
        if (type$332 === Token$88.StringLiteral || type$332 === Token$88.NumericLiteral) {
            if (strict$95 && token$331.octal) {
                throwErrorTolerant$133(token$331, Messages$92.StrictOctalLiteral);
            }
            return createLiteral$208(lex$129().token);
        }
        if (type$332 === Token$88.Keyword) {
            if (matchKeyword$138('this')) {
                lex$129().token;
                return {type: Syntax$90.ThisExpression};
            }
            if (matchKeyword$138('function')) {
                return parseFunctionExpression$200();
            }
        }
        if (type$332 === Token$88.BooleanLiteral) {
            lex$129();
            token$331.value = token$331.value === 'true';
            return createLiteral$208(token$331);
        }
        if (type$332 === Token$88.NullLiteral) {
            lex$129();
            token$331.value = null;
            return createLiteral$208(token$331);
        }
        if (match$137('[')) {
            return parseArrayInitialiser$142();
        }
        if (match$137('{')) {
            return parseObjectInitialiser$146();
        }
        if (match$137('(')) {
            lex$129();
            state$101.lastParenthesized = expr$330 = parseExpression$172();
            expect$135(')');
            return expr$330;
        }
        if (token$331.value instanceof RegExp) {
            return createLiteral$208(lex$129().token);
        }
        return throwUnexpected$134(lex$129().token);
    }
    function parseArguments$148() {
        var args$334 = [];
        expect$135('(');
        if (!match$137(')')) {
            while (index$96 < length$99) {
                args$334.push(parseAssignmentExpression$171());
                if (match$137(')')) {
                    break;
                }
                expect$135(',');
            }
        }
        expect$135(')');
        return args$334;
    }
    function parseNonComputedProperty$149() {
        var token$335 = lex$129().token;
        if (!isIdentifierName$127(token$335)) {
            throwUnexpected$134(token$335);
        }
        return {
            type: Syntax$90.Identifier,
            name: token$335.value
        };
    }
    function parseNonComputedMember$150(object$336) {
        return {
            type: Syntax$90.MemberExpression,
            computed: false,
            object: object$336,
            property: parseNonComputedProperty$149()
        };
    }
    function parseComputedMember$151(object$337) {
        var property$338, expr$339;
        expect$135('[');
        property$338 = parseExpression$172();
        expr$339 = {
            type: Syntax$90.MemberExpression,
            computed: true,
            object: object$337,
            property: property$338
        };
        expect$135(']');
        return expr$339;
    }
    function parseCallMember$152(object$340) {
        return {
            type: Syntax$90.CallExpression,
            callee: object$340,
            'arguments': parseArguments$148()
        };
    }
    function parseNewExpression$153() {
        var expr$341;
        expectKeyword$136('new');
        expr$341 = {
            type: Syntax$90.NewExpression,
            callee: parseLeftHandSideExpression$157(),
            'arguments': []
        };
        if (match$137('(')) {
            expr$341['arguments'] = parseArguments$148();
        }
        return expr$341;
    }
    function toArrayNode$154(arr$342) {
        var els$343 = arr$342.map(function (el$344) {
                return {
                    type: 'Literal',
                    value: el$344,
                    raw: el$344.toString()
                };
            });
        return {
            type: 'ArrayExpression',
            elements: els$343
        };
    }
    function toObjectNode$155(obj$345) {
        var props$346 = Object.keys(obj$345).map(function (key$347) {
                var raw$348 = obj$345[key$347];
                var value$349;
                if (Array.isArray(raw$348)) {
                    value$349 = toArrayNode$154(raw$348);
                } else {
                    value$349 = {
                        type: 'Literal',
                        value: obj$345[key$347],
                        raw: obj$345[key$347].toString()
                    };
                }
                return {
                    type: 'Property',
                    key: {
                        type: 'Identifier',
                        name: key$347
                    },
                    value: value$349,
                    kind: 'init'
                };
            });
        return {
            type: 'ObjectExpression',
            properties: props$346
        };
    }
    function parseLeftHandSideExpressionAllowCall$156() {
        var useNew$350, expr$351;
        useNew$350 = matchKeyword$138('new');
        expr$351 = useNew$350 ? parseNewExpression$153() : parsePrimaryExpression$147();
        while (index$96 < length$99) {
            if (match$137('.')) {
                lex$129();
                expr$351 = parseNonComputedMember$150(expr$351);
            } else if (match$137('[')) {
                expr$351 = parseComputedMember$151(expr$351);
            } else if (match$137('(')) {
                expr$351 = parseCallMember$152(expr$351);
            } else {
                break;
            }
        }
        return expr$351;
    }
    function parseLeftHandSideExpression$157() {
        var useNew$352, expr$353;
        useNew$352 = matchKeyword$138('new');
        expr$353 = useNew$352 ? parseNewExpression$153() : parsePrimaryExpression$147();
        while (index$96 < length$99) {
            if (match$137('.')) {
                lex$129();
                expr$353 = parseNonComputedMember$150(expr$353);
            } else if (match$137('[')) {
                expr$353 = parseComputedMember$151(expr$353);
            } else {
                break;
            }
        }
        return expr$353;
    }
    function parsePostfixExpression$158() {
        var expr$354 = parseLeftHandSideExpressionAllowCall$156();
        if ((match$137('++') || match$137('--')) && !peekLineTerminator$131()) {
            if (strict$95 && expr$354.type === Syntax$90.Identifier && isRestrictedWord$116(expr$354.name)) {
                throwError$132({}, Messages$92.StrictLHSPostfix);
            }
            if (!isLeftHandSide$141(expr$354)) {
                throwError$132({}, Messages$92.InvalidLHSInAssignment);
            }
            expr$354 = {
                type: Syntax$90.UpdateExpression,
                operator: lex$129().token.value,
                argument: expr$354,
                prefix: false
            };
        }
        return expr$354;
    }
    function parseUnaryExpression$159() {
        var token$355, expr$356;
        if (match$137('++') || match$137('--')) {
            token$355 = lex$129().token;
            expr$356 = parseUnaryExpression$159();
            if (strict$95 && expr$356.type === Syntax$90.Identifier && isRestrictedWord$116(expr$356.name)) {
                throwError$132({}, Messages$92.StrictLHSPrefix);
            }
            if (!isLeftHandSide$141(expr$356)) {
                throwError$132({}, Messages$92.InvalidLHSInAssignment);
            }
            expr$356 = {
                type: Syntax$90.UpdateExpression,
                operator: token$355.value,
                argument: expr$356,
                prefix: true
            };
            return expr$356;
        }
        if (match$137('+') || match$137('-') || match$137('~') || match$137('!')) {
            expr$356 = {
                type: Syntax$90.UnaryExpression,
                operator: lex$129().token.value,
                argument: parseUnaryExpression$159()
            };
            return expr$356;
        }
        if (matchKeyword$138('delete') || matchKeyword$138('void') || matchKeyword$138('typeof')) {
            expr$356 = {
                type: Syntax$90.UnaryExpression,
                operator: lex$129().token.value,
                argument: parseUnaryExpression$159()
            };
            if (strict$95 && expr$356.operator === 'delete' && expr$356.argument.type === Syntax$90.Identifier) {
                throwErrorTolerant$133({}, Messages$92.StrictDelete);
            }
            return expr$356;
        }
        return parsePostfixExpression$158();
    }
    function parseMultiplicativeExpression$160() {
        var expr$357 = parseUnaryExpression$159();
        while (match$137('*') || match$137('/') || match$137('%')) {
            expr$357 = {
                type: Syntax$90.BinaryExpression,
                operator: lex$129().token.value,
                left: expr$357,
                right: parseUnaryExpression$159()
            };
        }
        return expr$357;
    }
    function parseAdditiveExpression$161() {
        var expr$358 = parseMultiplicativeExpression$160();
        while (match$137('+') || match$137('-')) {
            expr$358 = {
                type: Syntax$90.BinaryExpression,
                operator: lex$129().token.value,
                left: expr$358,
                right: parseMultiplicativeExpression$160()
            };
        }
        return expr$358;
    }
    function parseShiftExpression$162() {
        var expr$359 = parseAdditiveExpression$161();
        while (match$137('<<') || match$137('>>') || match$137('>>>')) {
            expr$359 = {
                type: Syntax$90.BinaryExpression,
                operator: lex$129().token.value,
                left: expr$359,
                right: parseAdditiveExpression$161()
            };
        }
        return expr$359;
    }
    function parseRelationalExpression$163() {
        var expr$360, previousAllowIn$361;
        previousAllowIn$361 = state$101.allowIn;
        state$101.allowIn = true;
        expr$360 = parseShiftExpression$162();
        while (match$137('<') || match$137('>') || match$137('<=') || match$137('>=') || previousAllowIn$361 && matchKeyword$138('in') || matchKeyword$138('instanceof')) {
            expr$360 = {
                type: Syntax$90.BinaryExpression,
                operator: lex$129().token.value,
                left: expr$360,
                right: parseRelationalExpression$163()
            };
        }
        state$101.allowIn = previousAllowIn$361;
        return expr$360;
    }
    function parseEqualityExpression$164() {
        var expr$362 = parseRelationalExpression$163();
        while (match$137('==') || match$137('!=') || match$137('===') || match$137('!==')) {
            expr$362 = {
                type: Syntax$90.BinaryExpression,
                operator: lex$129().token.value,
                left: expr$362,
                right: parseRelationalExpression$163()
            };
        }
        return expr$362;
    }
    function parseBitwiseANDExpression$165() {
        var expr$363 = parseEqualityExpression$164();
        while (match$137('&')) {
            lex$129();
            expr$363 = {
                type: Syntax$90.BinaryExpression,
                operator: '&',
                left: expr$363,
                right: parseEqualityExpression$164()
            };
        }
        return expr$363;
    }
    function parseBitwiseXORExpression$166() {
        var expr$364 = parseBitwiseANDExpression$165();
        while (match$137('^')) {
            lex$129();
            expr$364 = {
                type: Syntax$90.BinaryExpression,
                operator: '^',
                left: expr$364,
                right: parseBitwiseANDExpression$165()
            };
        }
        return expr$364;
    }
    function parseBitwiseORExpression$167() {
        var expr$365 = parseBitwiseXORExpression$166();
        while (match$137('|')) {
            lex$129();
            expr$365 = {
                type: Syntax$90.BinaryExpression,
                operator: '|',
                left: expr$365,
                right: parseBitwiseXORExpression$166()
            };
        }
        return expr$365;
    }
    function parseLogicalANDExpression$168() {
        var expr$366 = parseBitwiseORExpression$167();
        while (match$137('&&')) {
            lex$129();
            expr$366 = {
                type: Syntax$90.LogicalExpression,
                operator: '&&',
                left: expr$366,
                right: parseBitwiseORExpression$167()
            };
        }
        return expr$366;
    }
    function parseLogicalORExpression$169() {
        var expr$367 = parseLogicalANDExpression$168();
        while (match$137('||')) {
            lex$129();
            expr$367 = {
                type: Syntax$90.LogicalExpression,
                operator: '||',
                left: expr$367,
                right: parseLogicalANDExpression$168()
            };
        }
        return expr$367;
    }
    function parseConditionalExpression$170() {
        var expr$368, previousAllowIn$369, consequent$370;
        expr$368 = parseLogicalORExpression$169();
        if (match$137('?')) {
            lex$129();
            previousAllowIn$369 = state$101.allowIn;
            state$101.allowIn = true;
            consequent$370 = parseAssignmentExpression$171();
            state$101.allowIn = previousAllowIn$369;
            expect$135(':');
            expr$368 = {
                type: Syntax$90.ConditionalExpression,
                test: expr$368,
                consequent: consequent$370,
                alternate: parseAssignmentExpression$171()
            };
        }
        return expr$368;
    }
    function parseAssignmentExpression$171() {
        var expr$371;
        expr$371 = parseConditionalExpression$170();
        if (matchAssign$139()) {
            if (!isLeftHandSide$141(expr$371)) {
                throwError$132({}, Messages$92.InvalidLHSInAssignment);
            }
            if (strict$95 && expr$371.type === Syntax$90.Identifier && isRestrictedWord$116(expr$371.name)) {
                throwError$132({}, Messages$92.StrictLHSAssignment);
            }
            expr$371 = {
                type: Syntax$90.AssignmentExpression,
                operator: lex$129().token.value,
                left: expr$371,
                right: parseAssignmentExpression$171()
            };
        }
        return expr$371;
    }
    function parseExpression$172() {
        var expr$372 = parseAssignmentExpression$171();
        if (match$137(',')) {
            expr$372 = {
                type: Syntax$90.SequenceExpression,
                expressions: [expr$372]
            };
            while (index$96 < length$99) {
                if (!match$137(',')) {
                    break;
                }
                lex$129();
                expr$372.expressions.push(parseAssignmentExpression$171());
            }
        }
        return expr$372;
    }
    function parseStatementList$173() {
        var list$373 = [], statement$374;
        while (index$96 < length$99) {
            if (match$137('}')) {
                break;
            }
            statement$374 = parseSourceElement$201();
            if (typeof statement$374 === 'undefined') {
                break;
            }
            list$373.push(statement$374);
        }
        return list$373;
    }
    function parseBlock$174() {
        var block$375;
        expect$135('{');
        block$375 = parseStatementList$173();
        expect$135('}');
        return {
            type: Syntax$90.BlockStatement,
            body: block$375
        };
    }
    function parseVariableIdentifier$175() {
        var stx$376 = lex$129(), token$377 = stx$376.token;
        if (token$377.type !== Token$88.Identifier) {
            throwUnexpected$134(token$377);
        }
        var name$378 = extra$103.noresolve ? stx$376 : expander$87.resolve(stx$376);
        return {
            type: Syntax$90.Identifier,
            name: name$378
        };
    }
    function parseVariableDeclaration$176(kind$379) {
        var id$380 = parseVariableIdentifier$175(), init$381 = null;
        if (strict$95 && isRestrictedWord$116(id$380.name)) {
            throwErrorTolerant$133({}, Messages$92.StrictVarName);
        }
        if (kind$379 === 'const') {
            expect$135('=');
            init$381 = parseAssignmentExpression$171();
        } else if (match$137('=')) {
            lex$129();
            init$381 = parseAssignmentExpression$171();
        }
        return {
            type: Syntax$90.VariableDeclarator,
            id: id$380,
            init: init$381
        };
    }
    function parseVariableDeclarationList$177(kind$382) {
        var list$383 = [];
        while (index$96 < length$99) {
            list$383.push(parseVariableDeclaration$176(kind$382));
            if (!match$137(',')) {
                break;
            }
            lex$129();
        }
        return list$383;
    }
    function parseVariableStatement$178() {
        var declarations$384;
        expectKeyword$136('var');
        declarations$384 = parseVariableDeclarationList$177();
        consumeSemicolon$140();
        return {
            type: Syntax$90.VariableDeclaration,
            declarations: declarations$384,
            kind: 'var'
        };
    }
    function parseConstLetDeclaration$179(kind$385) {
        var declarations$386;
        expectKeyword$136(kind$385);
        declarations$386 = parseVariableDeclarationList$177(kind$385);
        consumeSemicolon$140();
        return {
            type: Syntax$90.VariableDeclaration,
            declarations: declarations$386,
            kind: kind$385
        };
    }
    function parseEmptyStatement$180() {
        expect$135(';');
        return {type: Syntax$90.EmptyStatement};
    }
    function parseExpressionStatement$181() {
        var expr$387 = parseExpression$172();
        consumeSemicolon$140();
        return {
            type: Syntax$90.ExpressionStatement,
            expression: expr$387
        };
    }
    function parseIfStatement$182() {
        var test$388, consequent$389, alternate$390;
        expectKeyword$136('if');
        expect$135('(');
        test$388 = parseExpression$172();
        expect$135(')');
        consequent$389 = parseStatement$197();
        if (matchKeyword$138('else')) {
            lex$129();
            alternate$390 = parseStatement$197();
        } else {
            alternate$390 = null;
        }
        return {
            type: Syntax$90.IfStatement,
            test: test$388,
            consequent: consequent$389,
            alternate: alternate$390
        };
    }
    function parseDoWhileStatement$183() {
        var body$391, test$392, oldInIteration$393;
        expectKeyword$136('do');
        oldInIteration$393 = state$101.inIteration;
        state$101.inIteration = true;
        body$391 = parseStatement$197();
        state$101.inIteration = oldInIteration$393;
        expectKeyword$136('while');
        expect$135('(');
        test$392 = parseExpression$172();
        expect$135(')');
        if (match$137(';')) {
            lex$129();
        }
        return {
            type: Syntax$90.DoWhileStatement,
            body: body$391,
            test: test$392
        };
    }
    function parseWhileStatement$184() {
        var test$394, body$395, oldInIteration$396;
        expectKeyword$136('while');
        expect$135('(');
        test$394 = parseExpression$172();
        expect$135(')');
        oldInIteration$396 = state$101.inIteration;
        state$101.inIteration = true;
        body$395 = parseStatement$197();
        state$101.inIteration = oldInIteration$396;
        return {
            type: Syntax$90.WhileStatement,
            test: test$394,
            body: body$395
        };
    }
    function parseForVariableDeclaration$185() {
        var token$397 = lex$129().token;
        return {
            type: Syntax$90.VariableDeclaration,
            declarations: parseVariableDeclarationList$177(),
            kind: token$397.value
        };
    }
    function parseForStatement$186() {
        var init$398, test$399, update$400, left$401, right$402, body$403, oldInIteration$404;
        init$398 = test$399 = update$400 = null;
        expectKeyword$136('for');
        expect$135('(');
        if (match$137(';')) {
            lex$129();
        } else {
            if (matchKeyword$138('var') || matchKeyword$138('let')) {
                state$101.allowIn = false;
                init$398 = parseForVariableDeclaration$185();
                state$101.allowIn = true;
                if (init$398.declarations.length === 1 && matchKeyword$138('in')) {
                    lex$129();
                    left$401 = init$398;
                    right$402 = parseExpression$172();
                    init$398 = null;
                }
            } else {
                state$101.allowIn = false;
                init$398 = parseExpression$172();
                state$101.allowIn = true;
                if (matchKeyword$138('in')) {
                    if (!isLeftHandSide$141(init$398)) {
                        throwError$132({}, Messages$92.InvalidLHSInForIn);
                    }
                    lex$129();
                    left$401 = init$398;
                    right$402 = parseExpression$172();
                    init$398 = null;
                }
            }
            if (typeof left$401 === 'undefined') {
                expect$135(';');
            }
        }
        if (typeof left$401 === 'undefined') {
            if (!match$137(';')) {
                test$399 = parseExpression$172();
            }
            expect$135(';');
            if (!match$137(')')) {
                update$400 = parseExpression$172();
            }
        }
        expect$135(')');
        oldInIteration$404 = state$101.inIteration;
        state$101.inIteration = true;
        body$403 = parseStatement$197();
        state$101.inIteration = oldInIteration$404;
        if (typeof left$401 === 'undefined') {
            return {
                type: Syntax$90.ForStatement,
                init: init$398,
                test: test$399,
                update: update$400,
                body: body$403
            };
        }
        return {
            type: Syntax$90.ForInStatement,
            left: left$401,
            right: right$402,
            body: body$403,
            each: false
        };
    }
    function parseContinueStatement$187() {
        var token$405, label$406 = null;
        expectKeyword$136('continue');
        if (tokenStream$102[index$96].token.value === ';') {
            lex$129();
            if (!state$101.inIteration) {
                throwError$132({}, Messages$92.IllegalContinue);
            }
            return {
                type: Syntax$90.ContinueStatement,
                label: null
            };
        }
        if (peekLineTerminator$131()) {
            if (!state$101.inIteration) {
                throwError$132({}, Messages$92.IllegalContinue);
            }
            return {
                type: Syntax$90.ContinueStatement,
                label: null
            };
        }
        token$405 = lookahead$130().token;
        if (token$405.type === Token$88.Identifier) {
            label$406 = parseVariableIdentifier$175();
            if (!Object.prototype.hasOwnProperty.call(state$101.labelSet, label$406.name)) {
                throwError$132({}, Messages$92.UnknownLabel, label$406.name);
            }
        }
        consumeSemicolon$140();
        if (label$406 === null && !state$101.inIteration) {
            throwError$132({}, Messages$92.IllegalContinue);
        }
        return {
            type: Syntax$90.ContinueStatement,
            label: label$406
        };
    }
    function parseBreakStatement$188() {
        var token$407, label$408 = null;
        expectKeyword$136('break');
        if (peekLineTerminator$131()) {
            if (!(state$101.inIteration || state$101.inSwitch)) {
                throwError$132({}, Messages$92.IllegalBreak);
            }
            return {
                type: Syntax$90.BreakStatement,
                label: null
            };
        }
        token$407 = lookahead$130().token;
        if (token$407.type === Token$88.Identifier) {
            label$408 = parseVariableIdentifier$175();
            if (!Object.prototype.hasOwnProperty.call(state$101.labelSet, label$408.name)) {
                throwError$132({}, Messages$92.UnknownLabel, label$408.name);
            }
        }
        consumeSemicolon$140();
        if (label$408 === null && !(state$101.inIteration || state$101.inSwitch)) {
            throwError$132({}, Messages$92.IllegalBreak);
        }
        return {
            type: Syntax$90.BreakStatement,
            label: label$408
        };
    }
    function parseReturnStatement$189() {
        var token$409, argument$410 = null;
        expectKeyword$136('return');
        if (!state$101.inFunctionBody) {
            throwErrorTolerant$133({}, Messages$92.IllegalReturn);
        }
        if (peekLineTerminator$131()) {
            return {
                type: Syntax$90.ReturnStatement,
                argument: null
            };
        }
        if (!match$137(';')) {
            token$409 = lookahead$130().token;
            if (!match$137('}') && token$409.type !== Token$88.EOF) {
                argument$410 = parseExpression$172();
            }
        }
        consumeSemicolon$140();
        return {
            type: Syntax$90.ReturnStatement,
            argument: argument$410
        };
    }
    function parseWithStatement$190() {
        var object$411, body$412;
        if (strict$95) {
            throwErrorTolerant$133({}, Messages$92.StrictModeWith);
        }
        expectKeyword$136('with');
        expect$135('(');
        object$411 = parseExpression$172();
        expect$135(')');
        body$412 = parseStatement$197();
        return {
            type: Syntax$90.WithStatement,
            object: object$411,
            body: body$412
        };
    }
    function parseSwitchCase$191() {
        var test$413, consequent$414 = [], statement$415;
        if (matchKeyword$138('default')) {
            lex$129();
            test$413 = null;
        } else {
            expectKeyword$136('case');
            test$413 = parseExpression$172();
        }
        expect$135(':');
        while (index$96 < length$99) {
            if (match$137('}') || matchKeyword$138('default') || matchKeyword$138('case')) {
                break;
            }
            statement$415 = parseStatement$197();
            if (typeof statement$415 === 'undefined') {
                break;
            }
            consequent$414.push(statement$415);
        }
        return {
            type: Syntax$90.SwitchCase,
            test: test$413,
            consequent: consequent$414
        };
    }
    function parseSwitchStatement$192() {
        var discriminant$416, cases$417, oldInSwitch$418;
        expectKeyword$136('switch');
        expect$135('(');
        discriminant$416 = parseExpression$172();
        expect$135(')');
        expect$135('{');
        if (match$137('}')) {
            lex$129();
            return {
                type: Syntax$90.SwitchStatement,
                discriminant: discriminant$416
            };
        }
        cases$417 = [];
        oldInSwitch$418 = state$101.inSwitch;
        state$101.inSwitch = true;
        while (index$96 < length$99) {
            if (match$137('}')) {
                break;
            }
            cases$417.push(parseSwitchCase$191());
        }
        state$101.inSwitch = oldInSwitch$418;
        expect$135('}');
        return {
            type: Syntax$90.SwitchStatement,
            discriminant: discriminant$416,
            cases: cases$417
        };
    }
    function parseThrowStatement$193() {
        var argument$419;
        expectKeyword$136('throw');
        if (peekLineTerminator$131()) {
            throwError$132({}, Messages$92.NewlineAfterThrow);
        }
        argument$419 = parseExpression$172();
        consumeSemicolon$140();
        return {
            type: Syntax$90.ThrowStatement,
            argument: argument$419
        };
    }
    function parseCatchClause$194() {
        var param$420;
        expectKeyword$136('catch');
        expect$135('(');
        if (!match$137(')')) {
            param$420 = parseExpression$172();
            if (strict$95 && param$420.type === Syntax$90.Identifier && isRestrictedWord$116(param$420.name)) {
                throwErrorTolerant$133({}, Messages$92.StrictCatchVariable);
            }
        }
        expect$135(')');
        return {
            type: Syntax$90.CatchClause,
            param: param$420,
            guard: null,
            body: parseBlock$174()
        };
    }
    function parseTryStatement$195() {
        var block$421, handlers$422 = [], finalizer$423 = null;
        expectKeyword$136('try');
        block$421 = parseBlock$174();
        if (matchKeyword$138('catch')) {
            handlers$422.push(parseCatchClause$194());
        }
        if (matchKeyword$138('finally')) {
            lex$129();
            finalizer$423 = parseBlock$174();
        }
        if (handlers$422.length === 0 && !finalizer$423) {
            throwError$132({}, Messages$92.NoCatchOrFinally);
        }
        return {
            type: Syntax$90.TryStatement,
            block: block$421,
            handlers: handlers$422,
            finalizer: finalizer$423
        };
    }
    function parseDebuggerStatement$196() {
        expectKeyword$136('debugger');
        consumeSemicolon$140();
        return {type: Syntax$90.DebuggerStatement};
    }
    function parseStatement$197() {
        var token$424 = lookahead$130().token, expr$425, labeledBody$426;
        if (token$424.type === Token$88.EOF) {
            throwUnexpected$134(token$424);
        }
        if (token$424.type === Token$88.Punctuator) {
            switch (token$424.value) {
            case ';':
                return parseEmptyStatement$180();
            case '{':
                return parseBlock$174();
            case '(':
                return parseExpressionStatement$181();
            default:
                break;
            }
        }
        if (token$424.type === Token$88.Keyword) {
            switch (token$424.value) {
            case 'break':
                return parseBreakStatement$188();
            case 'continue':
                return parseContinueStatement$187();
            case 'debugger':
                return parseDebuggerStatement$196();
            case 'do':
                return parseDoWhileStatement$183();
            case 'for':
                return parseForStatement$186();
            case 'function':
                return parseFunctionDeclaration$199();
            case 'if':
                return parseIfStatement$182();
            case 'return':
                return parseReturnStatement$189();
            case 'switch':
                return parseSwitchStatement$192();
            case 'throw':
                return parseThrowStatement$193();
            case 'try':
                return parseTryStatement$195();
            case 'var':
                return parseVariableStatement$178();
            case 'while':
                return parseWhileStatement$184();
            case 'with':
                return parseWithStatement$190();
            default:
                break;
            }
        }
        expr$425 = parseExpression$172();
        if (expr$425.type === Syntax$90.Identifier && match$137(':')) {
            lex$129();
            if (Object.prototype.hasOwnProperty.call(state$101.labelSet, expr$425.name)) {
                throwError$132({}, Messages$92.Redeclaration, 'Label', expr$425.name);
            }
            state$101.labelSet[expr$425.name] = true;
            labeledBody$426 = parseStatement$197();
            delete state$101.labelSet[expr$425.name];
            return {
                type: Syntax$90.LabeledStatement,
                label: expr$425,
                body: labeledBody$426
            };
        }
        consumeSemicolon$140();
        return {
            type: Syntax$90.ExpressionStatement,
            expression: expr$425
        };
    }
    function parseFunctionSourceElements$198() {
        var sourceElement$427, sourceElements$428 = [], token$429, directive$430, firstRestricted$431, oldLabelSet$432, oldInIteration$433, oldInSwitch$434, oldInFunctionBody$435;
        expect$135('{');
        while (index$96 < length$99) {
            token$429 = lookahead$130().token;
            if (token$429.type !== Token$88.StringLiteral) {
                break;
            }
            sourceElement$427 = parseSourceElement$201();
            sourceElements$428.push(sourceElement$427);
            if (sourceElement$427.expression.type !== Syntax$90.Literal) {
                break;
            }
            directive$430 = sliceSource$106(token$429.range[0] + 1, token$429.range[1] - 1);
            if (directive$430 === 'use strict') {
                strict$95 = true;
                if (firstRestricted$431) {
                    throwError$132(firstRestricted$431, Messages$92.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$431 && token$429.octal) {
                    firstRestricted$431 = token$429;
                }
            }
        }
        oldLabelSet$432 = state$101.labelSet;
        oldInIteration$433 = state$101.inIteration;
        oldInSwitch$434 = state$101.inSwitch;
        oldInFunctionBody$435 = state$101.inFunctionBody;
        state$101.labelSet = {};
        state$101.inIteration = false;
        state$101.inSwitch = false;
        state$101.inFunctionBody = true;
        while (index$96 < length$99) {
            if (match$137('}')) {
                break;
            }
            sourceElement$427 = parseSourceElement$201();
            if (typeof sourceElement$427 === 'undefined') {
                break;
            }
            sourceElements$428.push(sourceElement$427);
        }
        expect$135('}');
        state$101.labelSet = oldLabelSet$432;
        state$101.inIteration = oldInIteration$433;
        state$101.inSwitch = oldInSwitch$434;
        state$101.inFunctionBody = oldInFunctionBody$435;
        return {
            type: Syntax$90.BlockStatement,
            body: sourceElements$428
        };
    }
    function parseFunctionDeclaration$199() {
        var id$436, param$437, params$438 = [], body$439, token$440, firstRestricted$441, message$442, previousStrict$443, paramSet$444;
        expectKeyword$136('function');
        token$440 = lookahead$130().token;
        id$436 = parseVariableIdentifier$175();
        if (strict$95) {
            if (isRestrictedWord$116(token$440.value)) {
                throwError$132(token$440, Messages$92.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$116(token$440.value)) {
                firstRestricted$441 = token$440;
                message$442 = Messages$92.StrictFunctionName;
            } else if (isStrictModeReservedWord$115(token$440.value)) {
                firstRestricted$441 = token$440;
                message$442 = Messages$92.StrictReservedWord;
            }
        }
        expect$135('(');
        if (!match$137(')')) {
            paramSet$444 = {};
            while (index$96 < length$99) {
                token$440 = lookahead$130().token;
                param$437 = parseVariableIdentifier$175();
                if (strict$95) {
                    if (isRestrictedWord$116(token$440.value)) {
                        throwError$132(token$440, Messages$92.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$444, token$440.value)) {
                        throwError$132(token$440, Messages$92.StrictParamDupe);
                    }
                } else if (!firstRestricted$441) {
                    if (isRestrictedWord$116(token$440.value)) {
                        firstRestricted$441 = token$440;
                        message$442 = Messages$92.StrictParamName;
                    } else if (isStrictModeReservedWord$115(token$440.value)) {
                        firstRestricted$441 = token$440;
                        message$442 = Messages$92.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$444, token$440.value)) {
                        firstRestricted$441 = token$440;
                        message$442 = Messages$92.StrictParamDupe;
                    }
                }
                params$438.push(param$437);
                paramSet$444[param$437.name] = true;
                if (match$137(')')) {
                    break;
                }
                expect$135(',');
            }
        }
        expect$135(')');
        previousStrict$443 = strict$95;
        body$439 = parseFunctionSourceElements$198();
        if (strict$95 && firstRestricted$441) {
            throwError$132(firstRestricted$441, message$442);
        }
        strict$95 = previousStrict$443;
        return {
            type: Syntax$90.FunctionDeclaration,
            id: id$436,
            params: params$438,
            body: body$439
        };
    }
    function parseFunctionExpression$200() {
        var token$445, id$446 = null, firstRestricted$447, message$448, param$449, params$450 = [], body$451, previousStrict$452, paramSet$453;
        expectKeyword$136('function');
        if (!match$137('(')) {
            token$445 = lookahead$130().token;
            id$446 = parseVariableIdentifier$175();
            if (strict$95) {
                if (isRestrictedWord$116(token$445.value)) {
                    throwError$132(token$445, Messages$92.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$116(token$445.value)) {
                    firstRestricted$447 = token$445;
                    message$448 = Messages$92.StrictFunctionName;
                } else if (isStrictModeReservedWord$115(token$445.value)) {
                    firstRestricted$447 = token$445;
                    message$448 = Messages$92.StrictReservedWord;
                }
            }
        }
        expect$135('(');
        if (!match$137(')')) {
            paramSet$453 = {};
            while (index$96 < length$99) {
                token$445 = lookahead$130().token;
                param$449 = parseVariableIdentifier$175();
                if (strict$95) {
                    if (isRestrictedWord$116(token$445.value)) {
                        throwError$132(token$445, Messages$92.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$453, token$445.value)) {
                        throwError$132(token$445, Messages$92.StrictParamDupe);
                    }
                } else if (!firstRestricted$447) {
                    if (isRestrictedWord$116(token$445.value)) {
                        firstRestricted$447 = token$445;
                        message$448 = Messages$92.StrictParamName;
                    } else if (isStrictModeReservedWord$115(token$445.value)) {
                        firstRestricted$447 = token$445;
                        message$448 = Messages$92.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$453, token$445.value)) {
                        firstRestricted$447 = token$445;
                        message$448 = Messages$92.StrictParamDupe;
                    }
                }
                params$450.push(param$449);
                paramSet$453[param$449.name] = true;
                if (match$137(')')) {
                    break;
                }
                expect$135(',');
            }
        }
        expect$135(')');
        previousStrict$452 = strict$95;
        body$451 = parseFunctionSourceElements$198();
        if (strict$95 && firstRestricted$447) {
            throwError$132(firstRestricted$447, message$448);
        }
        strict$95 = previousStrict$452;
        return {
            type: Syntax$90.FunctionExpression,
            id: id$446,
            params: params$450,
            body: body$451
        };
    }
    function parseSourceElement$201() {
        var token$454 = lookahead$130().token;
        if (token$454.type === Token$88.Keyword) {
            switch (token$454.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$179(token$454.value);
            case 'function':
                return parseFunctionDeclaration$199();
            default:
                return parseStatement$197();
            }
        }
        if (token$454.type !== Token$88.EOF) {
            return parseStatement$197();
        }
    }
    function parseSourceElements$202() {
        var sourceElement$455, sourceElements$456 = [], token$457, directive$458, firstRestricted$459;
        while (index$96 < length$99) {
            token$457 = lookahead$130();
            if (token$457.type !== Token$88.StringLiteral) {
                break;
            }
            sourceElement$455 = parseSourceElement$201();
            sourceElements$456.push(sourceElement$455);
            if (sourceElement$455.expression.type !== Syntax$90.Literal) {
                break;
            }
            directive$458 = sliceSource$106(token$457.range[0] + 1, token$457.range[1] - 1);
            if (directive$458 === 'use strict') {
                strict$95 = true;
                if (firstRestricted$459) {
                    throwError$132(firstRestricted$459, Messages$92.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$459 && token$457.octal) {
                    firstRestricted$459 = token$457;
                }
            }
        }
        while (index$96 < length$99) {
            sourceElement$455 = parseSourceElement$201();
            if (typeof sourceElement$455 === 'undefined') {
                break;
            }
            sourceElements$456.push(sourceElement$455);
        }
        return sourceElements$456;
    }
    function parseProgram$203() {
        var program$460;
        strict$95 = false;
        program$460 = {
            type: Syntax$90.Program,
            body: parseSourceElements$202()
        };
        return program$460;
    }
    function addComment$204(start$461, end$462, type$463, value$464) {
        assert$104(typeof start$461 === 'number', 'Comment must have valid position');
        if (extra$103.comments.length > 0) {
            if (extra$103.comments[extra$103.comments.length - 1].range[1] > start$461) {
                return;
            }
        }
        extra$103.comments.push({
            range: [
                start$461,
                end$462
            ],
            type: type$463,
            value: value$464
        });
    }
    function scanComment$205() {
        var comment$465, ch$466, start$467, blockComment$468, lineComment$469;
        comment$465 = '';
        blockComment$468 = false;
        lineComment$469 = false;
        while (index$96 < length$99) {
            ch$466 = source$94[index$96];
            if (lineComment$469) {
                ch$466 = nextChar$118();
                if (index$96 >= length$99) {
                    lineComment$469 = false;
                    comment$465 += ch$466;
                    addComment$204(start$467, index$96, 'Line', comment$465);
                } else if (isLineTerminator$111(ch$466)) {
                    lineComment$469 = false;
                    addComment$204(start$467, index$96, 'Line', comment$465);
                    if (ch$466 === '\r' && source$94[index$96] === '\n') {
                        ++index$96;
                    }
                    ++lineNumber$97;
                    lineStart$98 = index$96;
                    comment$465 = '';
                } else {
                    comment$465 += ch$466;
                }
            } else if (blockComment$468) {
                if (isLineTerminator$111(ch$466)) {
                    if (ch$466 === '\r' && source$94[index$96 + 1] === '\n') {
                        ++index$96;
                        comment$465 += '\r\n';
                    } else {
                        comment$465 += ch$466;
                    }
                    ++lineNumber$97;
                    ++index$96;
                    lineStart$98 = index$96;
                    if (index$96 >= length$99) {
                        throwError$132({}, Messages$92.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$466 = nextChar$118();
                    if (index$96 >= length$99) {
                        throwError$132({}, Messages$92.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$465 += ch$466;
                    if (ch$466 === '*') {
                        ch$466 = source$94[index$96];
                        if (ch$466 === '/') {
                            comment$465 = comment$465.substr(0, comment$465.length - 1);
                            blockComment$468 = false;
                            ++index$96;
                            addComment$204(start$467, index$96, 'Block', comment$465);
                            comment$465 = '';
                        }
                    }
                }
            } else if (ch$466 === '/') {
                ch$466 = source$94[index$96 + 1];
                if (ch$466 === '/') {
                    start$467 = index$96;
                    index$96 += 2;
                    lineComment$469 = true;
                } else if (ch$466 === '*') {
                    start$467 = index$96;
                    index$96 += 2;
                    blockComment$468 = true;
                    if (index$96 >= length$99) {
                        throwError$132({}, Messages$92.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$110(ch$466)) {
                ++index$96;
            } else if (isLineTerminator$111(ch$466)) {
                ++index$96;
                if (ch$466 === '\r' && source$94[index$96] === '\n') {
                    ++index$96;
                }
                ++lineNumber$97;
                lineStart$98 = index$96;
            } else {
                break;
            }
        }
    }
    function collectToken$206() {
        var token$470 = extra$103.advance(), range$471, value$472;
        if (token$470.type !== Token$88.EOF) {
            range$471 = [
                token$470.range[0],
                token$470.range[1]
            ];
            value$472 = sliceSource$106(token$470.range[0], token$470.range[1]);
            extra$103.tokens.push({
                type: TokenName$89[token$470.type],
                value: value$472,
                lineNumber: lineNumber$97,
                lineStart: lineStart$98,
                range: range$471
            });
        }
        return token$470;
    }
    function collectRegex$207() {
        var pos$473, regex$474, token$475;
        skipComment$120();
        pos$473 = index$96;
        regex$474 = extra$103.scanRegExp();
        if (extra$103.tokens.length > 0) {
            token$475 = extra$103.tokens[extra$103.tokens.length - 1];
            if (token$475.range[0] === pos$473 && token$475.type === 'Punctuator') {
                if (token$475.value === '/' || token$475.value === '/=') {
                    extra$103.tokens.pop();
                }
            }
        }
        extra$103.tokens.push({
            type: 'RegularExpression',
            value: regex$474.literal,
            range: [
                pos$473,
                index$96
            ],
            lineStart: token$475.lineStart,
            lineNumber: token$475.lineNumber
        });
        return regex$474;
    }
    function createLiteral$208(token$476) {
        if (Array.isArray(token$476)) {
            return {
                type: Syntax$90.Literal,
                value: token$476
            };
        }
        return {
            type: Syntax$90.Literal,
            value: token$476.value,
            lineStart: token$476.lineStart,
            lineNumber: token$476.lineNumber
        };
    }
    function createRawLiteral$209(token$477) {
        return {
            type: Syntax$90.Literal,
            value: token$477.value,
            raw: sliceSource$106(token$477.range[0], token$477.range[1]),
            lineStart: token$477.lineStart,
            lineNumber: token$477.lineNumber
        };
    }
    function wrapTrackingFunction$210(range$478, loc$479) {
        return function (parseFunction$480) {
            function isBinary$481(node$483) {
                return node$483.type === Syntax$90.LogicalExpression || node$483.type === Syntax$90.BinaryExpression;
            }
            function visit$482(node$484) {
                if (isBinary$481(node$484.left)) {
                    visit$482(node$484.left);
                }
                if (isBinary$481(node$484.right)) {
                    visit$482(node$484.right);
                }
                if (range$478 && typeof node$484.range === 'undefined') {
                    node$484.range = [
                        node$484.left.range[0],
                        node$484.right.range[1]
                    ];
                }
                if (loc$479 && typeof node$484.loc === 'undefined') {
                    node$484.loc = {
                        start: node$484.left.loc.start,
                        end: node$484.right.loc.end
                    };
                }
            }
            return function () {
                var node$485, rangeInfo$486, locInfo$487;
                var curr$488 = tokenStream$102[index$96].token;
                rangeInfo$486 = [
                    curr$488.range[0],
                    0
                ];
                locInfo$487 = {start: {
                        line: curr$488.lineNumber,
                        column: curr$488.lineStart
                    }};
                node$485 = parseFunction$480.apply(null, arguments);
                if (typeof node$485 !== 'undefined') {
                    var last$489 = tokenStream$102[index$96].token;
                    if (range$478) {
                        rangeInfo$486[1] = last$489.range[1];
                        node$485.range = rangeInfo$486;
                    }
                    if (loc$479) {
                        locInfo$487.end = {
                            line: last$489.lineNumber,
                            column: last$489.lineStart
                        };
                        node$485.loc = locInfo$487;
                    }
                    if (isBinary$481(node$485)) {
                        visit$482(node$485);
                    }
                    if (node$485.type === Syntax$90.MemberExpression) {
                        if (typeof node$485.object.range !== 'undefined') {
                            node$485.range[0] = node$485.object.range[0];
                        }
                        if (typeof node$485.object.loc !== 'undefined') {
                            node$485.loc.start = node$485.object.loc.start;
                        }
                    }
                    if (node$485.type === Syntax$90.CallExpression) {
                        if (typeof node$485.callee.range !== 'undefined') {
                            node$485.range[0] = node$485.callee.range[0];
                        }
                        if (typeof node$485.callee.loc !== 'undefined') {
                            node$485.loc.start = node$485.callee.loc.start;
                        }
                    }
                    return node$485;
                }
            };
        };
    }
    function patch$211() {
        var wrapTracking$490;
        if (extra$103.comments) {
            extra$103.skipComment = skipComment$120;
            skipComment$120 = scanComment$205;
        }
        if (extra$103.raw) {
            extra$103.createLiteral = createLiteral$208;
            createLiteral$208 = createRawLiteral$209;
        }
        if (extra$103.range || extra$103.loc) {
            wrapTracking$490 = wrapTrackingFunction$210(extra$103.range, extra$103.loc);
            extra$103.parseAdditiveExpression = parseAdditiveExpression$161;
            extra$103.parseAssignmentExpression = parseAssignmentExpression$171;
            extra$103.parseBitwiseANDExpression = parseBitwiseANDExpression$165;
            extra$103.parseBitwiseORExpression = parseBitwiseORExpression$167;
            extra$103.parseBitwiseXORExpression = parseBitwiseXORExpression$166;
            extra$103.parseBlock = parseBlock$174;
            extra$103.parseFunctionSourceElements = parseFunctionSourceElements$198;
            extra$103.parseCallMember = parseCallMember$152;
            extra$103.parseCatchClause = parseCatchClause$194;
            extra$103.parseComputedMember = parseComputedMember$151;
            extra$103.parseConditionalExpression = parseConditionalExpression$170;
            extra$103.parseConstLetDeclaration = parseConstLetDeclaration$179;
            extra$103.parseEqualityExpression = parseEqualityExpression$164;
            extra$103.parseExpression = parseExpression$172;
            extra$103.parseForVariableDeclaration = parseForVariableDeclaration$185;
            extra$103.parseFunctionDeclaration = parseFunctionDeclaration$199;
            extra$103.parseFunctionExpression = parseFunctionExpression$200;
            extra$103.parseLogicalANDExpression = parseLogicalANDExpression$168;
            extra$103.parseLogicalORExpression = parseLogicalORExpression$169;
            extra$103.parseMultiplicativeExpression = parseMultiplicativeExpression$160;
            extra$103.parseNewExpression = parseNewExpression$153;
            extra$103.parseNonComputedMember = parseNonComputedMember$150;
            extra$103.parseNonComputedProperty = parseNonComputedProperty$149;
            extra$103.parseObjectProperty = parseObjectProperty$145;
            extra$103.parseObjectPropertyKey = parseObjectPropertyKey$144;
            extra$103.parsePostfixExpression = parsePostfixExpression$158;
            extra$103.parsePrimaryExpression = parsePrimaryExpression$147;
            extra$103.parseProgram = parseProgram$203;
            extra$103.parsePropertyFunction = parsePropertyFunction$143;
            extra$103.parseRelationalExpression = parseRelationalExpression$163;
            extra$103.parseStatement = parseStatement$197;
            extra$103.parseShiftExpression = parseShiftExpression$162;
            extra$103.parseSwitchCase = parseSwitchCase$191;
            extra$103.parseUnaryExpression = parseUnaryExpression$159;
            extra$103.parseVariableDeclaration = parseVariableDeclaration$176;
            extra$103.parseVariableIdentifier = parseVariableIdentifier$175;
            parseAdditiveExpression$161 = wrapTracking$490(extra$103.parseAdditiveExpression);
            parseAssignmentExpression$171 = wrapTracking$490(extra$103.parseAssignmentExpression);
            parseBitwiseANDExpression$165 = wrapTracking$490(extra$103.parseBitwiseANDExpression);
            parseBitwiseORExpression$167 = wrapTracking$490(extra$103.parseBitwiseORExpression);
            parseBitwiseXORExpression$166 = wrapTracking$490(extra$103.parseBitwiseXORExpression);
            parseBlock$174 = wrapTracking$490(extra$103.parseBlock);
            parseFunctionSourceElements$198 = wrapTracking$490(extra$103.parseFunctionSourceElements);
            parseCallMember$152 = wrapTracking$490(extra$103.parseCallMember);
            parseCatchClause$194 = wrapTracking$490(extra$103.parseCatchClause);
            parseComputedMember$151 = wrapTracking$490(extra$103.parseComputedMember);
            parseConditionalExpression$170 = wrapTracking$490(extra$103.parseConditionalExpression);
            parseConstLetDeclaration$179 = wrapTracking$490(extra$103.parseConstLetDeclaration);
            parseEqualityExpression$164 = wrapTracking$490(extra$103.parseEqualityExpression);
            parseExpression$172 = wrapTracking$490(extra$103.parseExpression);
            parseForVariableDeclaration$185 = wrapTracking$490(extra$103.parseForVariableDeclaration);
            parseFunctionDeclaration$199 = wrapTracking$490(extra$103.parseFunctionDeclaration);
            parseFunctionExpression$200 = wrapTracking$490(extra$103.parseFunctionExpression);
            parseLogicalANDExpression$168 = wrapTracking$490(extra$103.parseLogicalANDExpression);
            parseLogicalORExpression$169 = wrapTracking$490(extra$103.parseLogicalORExpression);
            parseMultiplicativeExpression$160 = wrapTracking$490(extra$103.parseMultiplicativeExpression);
            parseNewExpression$153 = wrapTracking$490(extra$103.parseNewExpression);
            parseNonComputedMember$150 = wrapTracking$490(extra$103.parseNonComputedMember);
            parseNonComputedProperty$149 = wrapTracking$490(extra$103.parseNonComputedProperty);
            parseObjectProperty$145 = wrapTracking$490(extra$103.parseObjectProperty);
            parseObjectPropertyKey$144 = wrapTracking$490(extra$103.parseObjectPropertyKey);
            parsePostfixExpression$158 = wrapTracking$490(extra$103.parsePostfixExpression);
            parsePrimaryExpression$147 = wrapTracking$490(extra$103.parsePrimaryExpression);
            parseProgram$203 = wrapTracking$490(extra$103.parseProgram);
            parsePropertyFunction$143 = wrapTracking$490(extra$103.parsePropertyFunction);
            parseRelationalExpression$163 = wrapTracking$490(extra$103.parseRelationalExpression);
            parseStatement$197 = wrapTracking$490(extra$103.parseStatement);
            parseShiftExpression$162 = wrapTracking$490(extra$103.parseShiftExpression);
            parseSwitchCase$191 = wrapTracking$490(extra$103.parseSwitchCase);
            parseUnaryExpression$159 = wrapTracking$490(extra$103.parseUnaryExpression);
            parseVariableDeclaration$176 = wrapTracking$490(extra$103.parseVariableDeclaration);
            parseVariableIdentifier$175 = wrapTracking$490(extra$103.parseVariableIdentifier);
        }
        if (typeof extra$103.tokens !== 'undefined') {
            extra$103.advance = advance$128;
            extra$103.scanRegExp = scanRegExp$126;
            advance$128 = collectToken$206;
            scanRegExp$126 = collectRegex$207;
        }
    }
    function unpatch$212() {
        if (typeof extra$103.skipComment === 'function') {
            skipComment$120 = extra$103.skipComment;
        }
        if (extra$103.raw) {
            createLiteral$208 = extra$103.createLiteral;
        }
        if (extra$103.range || extra$103.loc) {
            parseAdditiveExpression$161 = extra$103.parseAdditiveExpression;
            parseAssignmentExpression$171 = extra$103.parseAssignmentExpression;
            parseBitwiseANDExpression$165 = extra$103.parseBitwiseANDExpression;
            parseBitwiseORExpression$167 = extra$103.parseBitwiseORExpression;
            parseBitwiseXORExpression$166 = extra$103.parseBitwiseXORExpression;
            parseBlock$174 = extra$103.parseBlock;
            parseFunctionSourceElements$198 = extra$103.parseFunctionSourceElements;
            parseCallMember$152 = extra$103.parseCallMember;
            parseCatchClause$194 = extra$103.parseCatchClause;
            parseComputedMember$151 = extra$103.parseComputedMember;
            parseConditionalExpression$170 = extra$103.parseConditionalExpression;
            parseConstLetDeclaration$179 = extra$103.parseConstLetDeclaration;
            parseEqualityExpression$164 = extra$103.parseEqualityExpression;
            parseExpression$172 = extra$103.parseExpression;
            parseForVariableDeclaration$185 = extra$103.parseForVariableDeclaration;
            parseFunctionDeclaration$199 = extra$103.parseFunctionDeclaration;
            parseFunctionExpression$200 = extra$103.parseFunctionExpression;
            parseLogicalANDExpression$168 = extra$103.parseLogicalANDExpression;
            parseLogicalORExpression$169 = extra$103.parseLogicalORExpression;
            parseMultiplicativeExpression$160 = extra$103.parseMultiplicativeExpression;
            parseNewExpression$153 = extra$103.parseNewExpression;
            parseNonComputedMember$150 = extra$103.parseNonComputedMember;
            parseNonComputedProperty$149 = extra$103.parseNonComputedProperty;
            parseObjectProperty$145 = extra$103.parseObjectProperty;
            parseObjectPropertyKey$144 = extra$103.parseObjectPropertyKey;
            parsePrimaryExpression$147 = extra$103.parsePrimaryExpression;
            parsePostfixExpression$158 = extra$103.parsePostfixExpression;
            parseProgram$203 = extra$103.parseProgram;
            parsePropertyFunction$143 = extra$103.parsePropertyFunction;
            parseRelationalExpression$163 = extra$103.parseRelationalExpression;
            parseStatement$197 = extra$103.parseStatement;
            parseShiftExpression$162 = extra$103.parseShiftExpression;
            parseSwitchCase$191 = extra$103.parseSwitchCase;
            parseUnaryExpression$159 = extra$103.parseUnaryExpression;
            parseVariableDeclaration$176 = extra$103.parseVariableDeclaration;
            parseVariableIdentifier$175 = extra$103.parseVariableIdentifier;
        }
        if (typeof extra$103.scanRegExp === 'function') {
            advance$128 = extra$103.advance;
            scanRegExp$126 = extra$103.scanRegExp;
        }
    }
    function stringToArray$213(str$491) {
        var length$492 = str$491.length, result$493 = [], i$494;
        for (i$494 = 0; i$494 < length$492; ++i$494) {
            result$493[i$494] = str$491.charAt(i$494);
        }
        return result$493;
    }
    function blockAllowed$214(toks$495, start$496, inExprDelim$497, parentIsBlock$498) {
        var assignOps$499 = [
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
        var binaryOps$500 = [
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
        var unaryOps$501 = [
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
        function back$502(n$503) {
            var idx$504 = toks$495.length - n$503 > 0 ? toks$495.length - n$503 : 0;
            return toks$495[idx$504];
        }
        if (inExprDelim$497 && toks$495.length - (start$496 + 2) <= 0) {
            return false;
        } else if (back$502(start$496 + 2).value === ':' && parentIsBlock$498) {
            return true;
        } else if (isIn$105(back$502(start$496 + 2).value, unaryOps$501.concat(binaryOps$500).concat(assignOps$499))) {
            return false;
        } else if (back$502(start$496 + 2).value === 'return') {
            var currLineNumber$505 = typeof back$502(start$496 + 1).startLineNumber !== 'undefined' ? back$502(start$496 + 1).startLineNumber : back$502(start$496 + 1).lineNumber;
            if (back$502(start$496 + 2).lineNumber !== currLineNumber$505) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$105(back$502(start$496 + 2).value, [
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
    function readToken$215(toks$506, inExprDelim$507, parentIsBlock$508) {
        var delimiters$509 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$510 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$511 = toks$506.length - 1;
        function back$512(n$513) {
            var idx$514 = toks$506.length - n$513 > 0 ? toks$506.length - n$513 : 0;
            return toks$506[idx$514];
        }
        skipComment$120();
        if (isIn$105(getChar$119(), delimiters$509)) {
            return readDelim$216(toks$506, inExprDelim$507, parentIsBlock$508);
        }
        if (getChar$119() === '/') {
            var prev$515 = back$512(1);
            if (prev$515) {
                if (prev$515.value === '()') {
                    if (isIn$105(back$512(2).value, parenIdents$510)) {
                        return scanRegExp$126();
                    }
                    return advance$128();
                }
                if (prev$515.value === '{}') {
                    if (blockAllowed$214(toks$506, 0, inExprDelim$507, parentIsBlock$508)) {
                        if (back$512(2).value === '()') {
                            if (back$512(4).value === 'function') {
                                if (!blockAllowed$214(toks$506, 3, inExprDelim$507, parentIsBlock$508)) {
                                    return advance$128();
                                }
                                if (toks$506.length - 5 <= 0 && inExprDelim$507) {
                                    return advance$128();
                                }
                            }
                            if (back$512(3).value === 'function') {
                                if (!blockAllowed$214(toks$506, 2, inExprDelim$507, parentIsBlock$508)) {
                                    return advance$128();
                                }
                                if (toks$506.length - 4 <= 0 && inExprDelim$507) {
                                    return advance$128();
                                }
                            }
                        }
                        return scanRegExp$126();
                    } else {
                        return advance$128();
                    }
                }
                if (prev$515.type === Token$88.Punctuator) {
                    return scanRegExp$126();
                }
                if (isKeyword$117(prev$515.value)) {
                    return scanRegExp$126();
                }
                return advance$128();
            }
            return scanRegExp$126();
        }
        return advance$128();
    }
    function readDelim$216(toks$516, inExprDelim$517, parentIsBlock$518) {
        var startDelim$519 = advance$128(), matchDelim$520 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$521 = [];
        var delimiters$522 = [
                '(',
                '{',
                '['
            ];
        assert$104(delimiters$522.indexOf(startDelim$519.value) !== -1, 'Need to begin at the delimiter');
        var token$523 = startDelim$519;
        var startLineNumber$524 = token$523.lineNumber;
        var startLineStart$525 = token$523.lineStart;
        var startRange$526 = token$523.range;
        var delimToken$527 = {};
        delimToken$527.type = Token$88.Delimiter;
        delimToken$527.value = startDelim$519.value + matchDelim$520[startDelim$519.value];
        delimToken$527.startLineNumber = startLineNumber$524;
        delimToken$527.startLineStart = startLineStart$525;
        delimToken$527.startRange = startRange$526;
        var delimIsBlock$528 = false;
        if (startDelim$519.value === '{') {
            delimIsBlock$528 = blockAllowed$214(toks$516.concat(delimToken$527), 0, inExprDelim$517, parentIsBlock$518);
        }
        while (index$96 <= length$99) {
            token$523 = readToken$215(inner$521, startDelim$519.value === '(' || startDelim$519.value === '[', delimIsBlock$528);
            if (token$523.type === Token$88.Punctuator && token$523.value === matchDelim$520[startDelim$519.value]) {
                break;
            } else if (token$523.type === Token$88.EOF) {
                throwError$132({}, Messages$92.UnexpectedEOS);
            } else {
                inner$521.push(token$523);
            }
        }
        if (index$96 >= length$99 && matchDelim$520[startDelim$519.value] !== source$94[length$99 - 1]) {
            throwError$132({}, Messages$92.UnexpectedEOS);
        }
        var endLineNumber$529 = token$523.lineNumber;
        var endLineStart$530 = token$523.lineStart;
        var endRange$531 = token$523.range;
        delimToken$527.inner = inner$521;
        delimToken$527.endLineNumber = endLineNumber$529;
        delimToken$527.endLineStart = endLineStart$530;
        delimToken$527.endRange = endRange$531;
        return delimToken$527;
    }
    ;
    function read$217(code$532) {
        var token$533, tokenTree$534 = [];
        source$94 = code$532;
        index$96 = 0;
        lineNumber$97 = source$94.length > 0 ? 1 : 0;
        lineStart$98 = 0;
        length$99 = source$94.length;
        buffer$100 = null;
        state$101 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$96 < length$99) {
            tokenTree$534.push(readToken$215(tokenTree$534, false, false));
        }
        var last$535 = tokenTree$534[tokenTree$534.length - 1];
        if (last$535 && last$535.type !== Token$88.EOF) {
            tokenTree$534.push({
                type: Token$88.EOF,
                value: '',
                lineNumber: last$535.lineNumber,
                lineStart: last$535.lineStart,
                range: [
                    index$96,
                    index$96
                ]
            });
        }
        return expander$87.tokensToSyntax(tokenTree$534);
    }
    function parse$218(code$536, nodeType$537, options$538) {
        var program$539, toString$540;
        tokenStream$102 = code$536;
        nodeType$537 = nodeType$537 || 'base';
        index$96 = 0;
        length$99 = tokenStream$102.length;
        buffer$100 = null;
        state$101 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        extra$103 = {};
        if (typeof options$538 !== 'undefined') {
            if (options$538.range || options$538.loc) {
                assert$104(false, 'Note range and loc is not currently implemented');
            }
            extra$103.range = typeof options$538.range === 'boolean' && options$538.range;
            extra$103.loc = typeof options$538.loc === 'boolean' && options$538.loc;
            extra$103.raw = typeof options$538.raw === 'boolean' && options$538.raw;
            if (typeof options$538.tokens === 'boolean' && options$538.tokens) {
                extra$103.tokens = [];
            }
            if (typeof options$538.comment === 'boolean' && options$538.comment) {
                extra$103.comments = [];
            }
            if (typeof options$538.tolerant === 'boolean' && options$538.tolerant) {
                extra$103.errors = [];
            }
            if (typeof options$538.noresolve === 'boolean' && options$538.noresolve) {
                extra$103.noresolve = options$538.noresolve;
            } else {
                extra$103.noresolve = false;
            }
        }
        patch$211();
        try {
            var classToParse$541 = {
                    'base': parseProgram$203,
                    'Program': parseProgram$203,
                    'expr': parseAssignmentExpression$171,
                    'ident': parsePrimaryExpression$147,
                    'lit': parsePrimaryExpression$147,
                    'LogicalANDExpression': parseLogicalANDExpression$168,
                    'PrimaryExpression': parsePrimaryExpression$147,
                    'VariableDeclarationList': parseVariableDeclarationList$177,
                    'StatementList': parseStatementList$173,
                    'SourceElements': function () {
                        state$101.inFunctionBody = true;
                        return parseSourceElements$202();
                    },
                    'FunctionDeclaration': parseFunctionDeclaration$199,
                    'FunctionExpression': parseFunctionExpression$200,
                    'ExpressionStatement': parseExpressionStatement$181,
                    'IfStatement': parseIfStatement$182,
                    'BreakStatement': parseBreakStatement$188,
                    'ContinueStatement': parseContinueStatement$187,
                    'WithStatement': parseWithStatement$190,
                    'SwitchStatement': parseSwitchStatement$192,
                    'ReturnStatement': parseReturnStatement$189,
                    'ThrowStatement': parseThrowStatement$193,
                    'TryStatement': parseTryStatement$195,
                    'WhileStatement': parseWhileStatement$184,
                    'ForStatement': parseForStatement$186,
                    'VariableDeclaration': parseVariableDeclaration$176,
                    'ArrayExpression': parseArrayInitialiser$142,
                    'ObjectExpression': parseObjectInitialiser$146,
                    'SequenceExpression': parseExpression$172,
                    'AssignmentExpression': parseAssignmentExpression$171,
                    'ConditionalExpression': parseConditionalExpression$170,
                    'NewExpression': parseNewExpression$153,
                    'CallExpression': parseLeftHandSideExpressionAllowCall$156,
                    'Block': parseBlock$174
                };
            if (classToParse$541[nodeType$537]) {
                program$539 = classToParse$541[nodeType$537]();
            } else {
                assert$104(false, 'unmatched parse class' + nodeType$537);
            }
            if (typeof extra$103.comments !== 'undefined') {
                program$539.comments = extra$103.comments;
            }
            if (typeof extra$103.tokens !== 'undefined') {
                program$539.tokens = tokenStream$102.slice(0, index$96);
            }
            if (typeof extra$103.errors !== 'undefined') {
                program$539.errors = extra$103.errors;
            }
        } catch (e$542) {
            throw e$542;
        } finally {
            unpatch$212();
            extra$103 = {};
        }
        return program$539;
    }
    exports$86.parse = parse$218;
    exports$86.read = read$217;
    exports$86.Token = Token$88;
    exports$86.assert = assert$104;
    exports$86.Syntax = function () {
        var name$543, types$544 = {};
        if (typeof Object.create === 'function') {
            types$544 = Object.create(null);
        }
        for (name$543 in Syntax$90) {
            if (Syntax$90.hasOwnProperty(name$543)) {
                types$544[name$543] = Syntax$90[name$543];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$544);
        }
        return types$544;
    }();
}));