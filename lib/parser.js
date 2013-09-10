(function (root$92, factory$93) {
    if (typeof exports === 'object') {
        factory$93(exports, require('./expander'));
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            'expander'
        ], factory$93);
    }
}(this, function (exports$94, expander$95) {
    'use strict';
    var Token$96, TokenName$97, Syntax$98, PropertyKind$99, Messages$100, Regex$101, source$102, strict$103, index$104, lineNumber$105, lineStart$106, length$107, buffer$108, state$109, tokenStream$110, extra$111;
    Token$96 = {
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
    TokenName$97 = {};
    TokenName$97[Token$96.BooleanLiteral] = 'Boolean';
    TokenName$97[Token$96.EOF] = '<end>';
    TokenName$97[Token$96.Identifier] = 'Identifier';
    TokenName$97[Token$96.Keyword] = 'Keyword';
    TokenName$97[Token$96.NullLiteral] = 'Null';
    TokenName$97[Token$96.NumericLiteral] = 'Numeric';
    TokenName$97[Token$96.Punctuator] = 'Punctuator';
    TokenName$97[Token$96.StringLiteral] = 'String';
    TokenName$97[Token$96.Delimiter] = 'Delimiter';
    Syntax$98 = {
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
    PropertyKind$99 = {
        Data: 1,
        Get: 2,
        Set: 4
    };
    Messages$100 = {
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
    Regex$101 = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };
    function assert$112(condition$227, message$228) {
        if (!condition$227) {
            throw new Error('ASSERT: ' + message$228);
        }
    }
    function isIn$113(el$229, list$230) {
        return list$230.indexOf(el$229) !== -1;
    }
    function sliceSource$114(from$231, to$232) {
        return source$102.slice(from$231, to$232);
    }
    if (typeof 'esprima'[0] === 'undefined') {
        sliceSource$114 = function sliceArraySource$233(from$234, to$235) {
            return source$102.slice(from$234, to$235).join('');
        };
    }
    function isDecimalDigit$115(ch$236) {
        return '0123456789'.indexOf(ch$236) >= 0;
    }
    function isHexDigit$116(ch$237) {
        return '0123456789abcdefABCDEF'.indexOf(ch$237) >= 0;
    }
    function isOctalDigit$117(ch$238) {
        return '01234567'.indexOf(ch$238) >= 0;
    }
    function isWhiteSpace$118(ch$239) {
        return ch$239 === ' ' || ch$239 === '\t' || ch$239 === '\x0B' || ch$239 === '\f' || ch$239 === '\xa0' || ch$239.charCodeAt(0) >= 5760 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(ch$239) >= 0;
    }
    function isLineTerminator$119(ch$240) {
        return ch$240 === '\n' || ch$240 === '\r' || ch$240 === '\u2028' || ch$240 === '\u2029';
    }
    function isIdentifierStart$120(ch$241) {
        return ch$241 === '$' || ch$241 === '_' || ch$241 === '\\' || ch$241 >= 'a' && ch$241 <= 'z' || ch$241 >= 'A' && ch$241 <= 'Z' || ch$241.charCodeAt(0) >= 128 && Regex$101.NonAsciiIdentifierStart.test(ch$241);
    }
    function isIdentifierPart$121(ch$242) {
        return ch$242 === '$' || ch$242 === '_' || ch$242 === '\\' || ch$242 >= 'a' && ch$242 <= 'z' || ch$242 >= 'A' && ch$242 <= 'Z' || ch$242 >= '0' && ch$242 <= '9' || ch$242.charCodeAt(0) >= 128 && Regex$101.NonAsciiIdentifierPart.test(ch$242);
    }
    function isFutureReservedWord$122(id$243) {
        return false;
    }
    function isStrictModeReservedWord$123(id$244) {
        switch (id$244) {
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
    function isRestrictedWord$124(id$245) {
        return id$245 === 'eval' || id$245 === 'arguments';
    }
    function isKeyword$125(id$246) {
        var keyword$247 = false;
        switch (id$246.length) {
        case 2:
            keyword$247 = id$246 === 'if' || id$246 === 'in' || id$246 === 'do';
            break;
        case 3:
            keyword$247 = id$246 === 'var' || id$246 === 'for' || id$246 === 'new' || id$246 === 'try';
            break;
        case 4:
            keyword$247 = id$246 === 'this' || id$246 === 'else' || id$246 === 'case' || id$246 === 'void' || id$246 === 'with';
            break;
        case 5:
            keyword$247 = id$246 === 'while' || id$246 === 'break' || id$246 === 'catch' || id$246 === 'throw';
            break;
        case 6:
            keyword$247 = id$246 === 'return' || id$246 === 'typeof' || id$246 === 'delete' || id$246 === 'switch';
            break;
        case 7:
            keyword$247 = id$246 === 'default' || id$246 === 'finally';
            break;
        case 8:
            keyword$247 = id$246 === 'function' || id$246 === 'continue' || id$246 === 'debugger';
            break;
        case 10:
            keyword$247 = id$246 === 'instanceof';
            break;
        }
        if (keyword$247) {
            return true;
        }
        switch (id$246) {
        case 'const':
            return true;
        case 'yield':
        case 'let':
            return true;
        }
        if (strict$103 && isStrictModeReservedWord$123(id$246)) {
            return true;
        }
        return isFutureReservedWord$122(id$246);
    }
    function nextChar$126() {
        return source$102[index$104++];
    }
    function getChar$127() {
        return source$102[index$104];
    }
    function skipComment$128() {
        var ch$248, blockComment$249, lineComment$250;
        blockComment$249 = false;
        lineComment$250 = false;
        while (index$104 < length$107) {
            ch$248 = source$102[index$104];
            if (lineComment$250) {
                ch$248 = nextChar$126();
                if (isLineTerminator$119(ch$248)) {
                    lineComment$250 = false;
                    if (ch$248 === '\r' && source$102[index$104] === '\n') {
                        ++index$104;
                    }
                    ++lineNumber$105;
                    lineStart$106 = index$104;
                }
            } else if (blockComment$249) {
                if (isLineTerminator$119(ch$248)) {
                    if (ch$248 === '\r' && source$102[index$104 + 1] === '\n') {
                        ++index$104;
                    }
                    ++lineNumber$105;
                    ++index$104;
                    lineStart$106 = index$104;
                    if (index$104 >= length$107) {
                        throwError$140({}, Messages$100.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$248 = nextChar$126();
                    if (index$104 >= length$107) {
                        throwError$140({}, Messages$100.UnexpectedToken, 'ILLEGAL');
                    }
                    if (ch$248 === '*') {
                        ch$248 = source$102[index$104];
                        if (ch$248 === '/') {
                            ++index$104;
                            blockComment$249 = false;
                        }
                    }
                }
            } else if (ch$248 === '/') {
                ch$248 = source$102[index$104 + 1];
                if (ch$248 === '/') {
                    index$104 += 2;
                    lineComment$250 = true;
                } else if (ch$248 === '*') {
                    index$104 += 2;
                    blockComment$249 = true;
                    if (index$104 >= length$107) {
                        throwError$140({}, Messages$100.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$118(ch$248)) {
                ++index$104;
            } else if (isLineTerminator$119(ch$248)) {
                ++index$104;
                if (ch$248 === '\r' && source$102[index$104] === '\n') {
                    ++index$104;
                }
                ++lineNumber$105;
                lineStart$106 = index$104;
            } else {
                break;
            }
        }
    }
    function scanHexEscape$129(prefix$251) {
        var i$252, len$253, ch$254, code$255 = 0;
        len$253 = prefix$251 === 'u' ? 4 : 2;
        for (i$252 = 0; i$252 < len$253; ++i$252) {
            if (index$104 < length$107 && isHexDigit$116(source$102[index$104])) {
                ch$254 = nextChar$126();
                code$255 = code$255 * 16 + '0123456789abcdef'.indexOf(ch$254.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code$255);
    }
    function scanIdentifier$130() {
        var ch$256, start$257, id$258, restore$259;
        ch$256 = source$102[index$104];
        if (!isIdentifierStart$120(ch$256)) {
            return;
        }
        start$257 = index$104;
        if (ch$256 === '\\') {
            ++index$104;
            if (source$102[index$104] !== 'u') {
                return;
            }
            ++index$104;
            restore$259 = index$104;
            ch$256 = scanHexEscape$129('u');
            if (ch$256) {
                if (ch$256 === '\\' || !isIdentifierStart$120(ch$256)) {
                    return;
                }
                id$258 = ch$256;
            } else {
                index$104 = restore$259;
                id$258 = 'u';
            }
        } else {
            id$258 = nextChar$126();
        }
        while (index$104 < length$107) {
            ch$256 = source$102[index$104];
            if (!isIdentifierPart$121(ch$256)) {
                break;
            }
            if (ch$256 === '\\') {
                ++index$104;
                if (source$102[index$104] !== 'u') {
                    return;
                }
                ++index$104;
                restore$259 = index$104;
                ch$256 = scanHexEscape$129('u');
                if (ch$256) {
                    if (ch$256 === '\\' || !isIdentifierPart$121(ch$256)) {
                        return;
                    }
                    id$258 += ch$256;
                } else {
                    index$104 = restore$259;
                    id$258 += 'u';
                }
            } else {
                id$258 += nextChar$126();
            }
        }
        if (id$258.length === 1) {
            return {
                type: Token$96.Identifier,
                value: id$258,
                lineNumber: lineNumber$105,
                lineStart: lineStart$106,
                range: [
                    start$257,
                    index$104
                ]
            };
        }
        if (isKeyword$125(id$258)) {
            return {
                type: Token$96.Keyword,
                value: id$258,
                lineNumber: lineNumber$105,
                lineStart: lineStart$106,
                range: [
                    start$257,
                    index$104
                ]
            };
        }
        if (id$258 === 'null') {
            return {
                type: Token$96.NullLiteral,
                value: id$258,
                lineNumber: lineNumber$105,
                lineStart: lineStart$106,
                range: [
                    start$257,
                    index$104
                ]
            };
        }
        if (id$258 === 'true' || id$258 === 'false') {
            return {
                type: Token$96.BooleanLiteral,
                value: id$258,
                lineNumber: lineNumber$105,
                lineStart: lineStart$106,
                range: [
                    start$257,
                    index$104
                ]
            };
        }
        return {
            type: Token$96.Identifier,
            value: id$258,
            lineNumber: lineNumber$105,
            lineStart: lineStart$106,
            range: [
                start$257,
                index$104
            ]
        };
    }
    function scanPunctuator$131() {
        var start$260 = index$104, ch1$261 = source$102[index$104], ch2$262, ch3$263, ch4$264;
        if (ch1$261 === ';' || ch1$261 === '{' || ch1$261 === '}') {
            ++index$104;
            return {
                type: Token$96.Punctuator,
                value: ch1$261,
                lineNumber: lineNumber$105,
                lineStart: lineStart$106,
                range: [
                    start$260,
                    index$104
                ]
            };
        }
        if (ch1$261 === ',' || ch1$261 === '(' || ch1$261 === ')') {
            ++index$104;
            return {
                type: Token$96.Punctuator,
                value: ch1$261,
                lineNumber: lineNumber$105,
                lineStart: lineStart$106,
                range: [
                    start$260,
                    index$104
                ]
            };
        }
        if (ch1$261 === '#') {
            ++index$104;
            return {
                type: Token$96.Identifier,
                value: ch1$261,
                lineNumber: lineNumber$105,
                lineStart: lineStart$106,
                range: [
                    start$260,
                    index$104
                ]
            };
        }
        ch2$262 = source$102[index$104 + 1];
        if (ch1$261 === '.' && !isDecimalDigit$115(ch2$262)) {
            if (source$102[index$104 + 1] === '.' && source$102[index$104 + 2] === '.') {
                nextChar$126();
                nextChar$126();
                nextChar$126();
                return {
                    type: Token$96.Punctuator,
                    value: '...',
                    lineNumber: lineNumber$105,
                    lineStart: lineStart$106,
                    range: [
                        start$260,
                        index$104
                    ]
                };
            } else {
                return {
                    type: Token$96.Punctuator,
                    value: nextChar$126(),
                    lineNumber: lineNumber$105,
                    lineStart: lineStart$106,
                    range: [
                        start$260,
                        index$104
                    ]
                };
            }
        }
        ch3$263 = source$102[index$104 + 2];
        ch4$264 = source$102[index$104 + 3];
        if (ch1$261 === '>' && ch2$262 === '>' && ch3$263 === '>') {
            if (ch4$264 === '=') {
                index$104 += 4;
                return {
                    type: Token$96.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber$105,
                    lineStart: lineStart$106,
                    range: [
                        start$260,
                        index$104
                    ]
                };
            }
        }
        if (ch1$261 === '=' && ch2$262 === '=' && ch3$263 === '=') {
            index$104 += 3;
            return {
                type: Token$96.Punctuator,
                value: '===',
                lineNumber: lineNumber$105,
                lineStart: lineStart$106,
                range: [
                    start$260,
                    index$104
                ]
            };
        }
        if (ch1$261 === '!' && ch2$262 === '=' && ch3$263 === '=') {
            index$104 += 3;
            return {
                type: Token$96.Punctuator,
                value: '!==',
                lineNumber: lineNumber$105,
                lineStart: lineStart$106,
                range: [
                    start$260,
                    index$104
                ]
            };
        }
        if (ch1$261 === '>' && ch2$262 === '>' && ch3$263 === '>') {
            index$104 += 3;
            return {
                type: Token$96.Punctuator,
                value: '>>>',
                lineNumber: lineNumber$105,
                lineStart: lineStart$106,
                range: [
                    start$260,
                    index$104
                ]
            };
        }
        if (ch1$261 === '<' && ch2$262 === '<' && ch3$263 === '=') {
            index$104 += 3;
            return {
                type: Token$96.Punctuator,
                value: '<<=',
                lineNumber: lineNumber$105,
                lineStart: lineStart$106,
                range: [
                    start$260,
                    index$104
                ]
            };
        }
        if (ch1$261 === '>' && ch2$262 === '>' && ch3$263 === '=') {
            index$104 += 3;
            return {
                type: Token$96.Punctuator,
                value: '>>=',
                lineNumber: lineNumber$105,
                lineStart: lineStart$106,
                range: [
                    start$260,
                    index$104
                ]
            };
        }
        if (ch2$262 === '=') {
            if ('<>=!+-*%&|^/'.indexOf(ch1$261) >= 0) {
                index$104 += 2;
                return {
                    type: Token$96.Punctuator,
                    value: ch1$261 + ch2$262,
                    lineNumber: lineNumber$105,
                    lineStart: lineStart$106,
                    range: [
                        start$260,
                        index$104
                    ]
                };
            }
        }
        if (ch1$261 === ch2$262 && '+-<>&|'.indexOf(ch1$261) >= 0) {
            if ('+-<>&|'.indexOf(ch2$262) >= 0) {
                index$104 += 2;
                return {
                    type: Token$96.Punctuator,
                    value: ch1$261 + ch2$262,
                    lineNumber: lineNumber$105,
                    lineStart: lineStart$106,
                    range: [
                        start$260,
                        index$104
                    ]
                };
            }
        }
        if ('[]<>+-*%&|^!~?:=/'.indexOf(ch1$261) >= 0) {
            return {
                type: Token$96.Punctuator,
                value: nextChar$126(),
                lineNumber: lineNumber$105,
                lineStart: lineStart$106,
                range: [
                    start$260,
                    index$104
                ]
            };
        }
    }
    function scanNumericLiteral$132() {
        var number$265, start$266, ch$267;
        ch$267 = source$102[index$104];
        assert$112(isDecimalDigit$115(ch$267) || ch$267 === '.', 'Numeric literal must start with a decimal digit or a decimal point');
        start$266 = index$104;
        number$265 = '';
        if (ch$267 !== '.') {
            number$265 = nextChar$126();
            ch$267 = source$102[index$104];
            if (number$265 === '0') {
                if (ch$267 === 'x' || ch$267 === 'X') {
                    number$265 += nextChar$126();
                    while (index$104 < length$107) {
                        ch$267 = source$102[index$104];
                        if (!isHexDigit$116(ch$267)) {
                            break;
                        }
                        number$265 += nextChar$126();
                    }
                    if (number$265.length <= 2) {
                        throwError$140({}, Messages$100.UnexpectedToken, 'ILLEGAL');
                    }
                    if (index$104 < length$107) {
                        ch$267 = source$102[index$104];
                        if (isIdentifierStart$120(ch$267)) {
                            throwError$140({}, Messages$100.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$96.NumericLiteral,
                        value: parseInt(number$265, 16),
                        lineNumber: lineNumber$105,
                        lineStart: lineStart$106,
                        range: [
                            start$266,
                            index$104
                        ]
                    };
                } else if (isOctalDigit$117(ch$267)) {
                    number$265 += nextChar$126();
                    while (index$104 < length$107) {
                        ch$267 = source$102[index$104];
                        if (!isOctalDigit$117(ch$267)) {
                            break;
                        }
                        number$265 += nextChar$126();
                    }
                    if (index$104 < length$107) {
                        ch$267 = source$102[index$104];
                        if (isIdentifierStart$120(ch$267) || isDecimalDigit$115(ch$267)) {
                            throwError$140({}, Messages$100.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token$96.NumericLiteral,
                        value: parseInt(number$265, 8),
                        octal: true,
                        lineNumber: lineNumber$105,
                        lineStart: lineStart$106,
                        range: [
                            start$266,
                            index$104
                        ]
                    };
                }
                if (isDecimalDigit$115(ch$267)) {
                    throwError$140({}, Messages$100.UnexpectedToken, 'ILLEGAL');
                }
            }
            while (index$104 < length$107) {
                ch$267 = source$102[index$104];
                if (!isDecimalDigit$115(ch$267)) {
                    break;
                }
                number$265 += nextChar$126();
            }
        }
        if (ch$267 === '.') {
            number$265 += nextChar$126();
            while (index$104 < length$107) {
                ch$267 = source$102[index$104];
                if (!isDecimalDigit$115(ch$267)) {
                    break;
                }
                number$265 += nextChar$126();
            }
        }
        if (ch$267 === 'e' || ch$267 === 'E') {
            number$265 += nextChar$126();
            ch$267 = source$102[index$104];
            if (ch$267 === '+' || ch$267 === '-') {
                number$265 += nextChar$126();
            }
            ch$267 = source$102[index$104];
            if (isDecimalDigit$115(ch$267)) {
                number$265 += nextChar$126();
                while (index$104 < length$107) {
                    ch$267 = source$102[index$104];
                    if (!isDecimalDigit$115(ch$267)) {
                        break;
                    }
                    number$265 += nextChar$126();
                }
            } else {
                ch$267 = 'character ' + ch$267;
                if (index$104 >= length$107) {
                    ch$267 = '<end>';
                }
                throwError$140({}, Messages$100.UnexpectedToken, 'ILLEGAL');
            }
        }
        if (index$104 < length$107) {
            ch$267 = source$102[index$104];
            if (isIdentifierStart$120(ch$267)) {
                throwError$140({}, Messages$100.UnexpectedToken, 'ILLEGAL');
            }
        }
        return {
            type: Token$96.NumericLiteral,
            value: parseFloat(number$265),
            lineNumber: lineNumber$105,
            lineStart: lineStart$106,
            range: [
                start$266,
                index$104
            ]
        };
    }
    function scanStringLiteral$133() {
        var str$268 = '', quote$269, start$270, ch$271, code$272, unescaped$273, restore$274, octal$275 = false;
        quote$269 = source$102[index$104];
        assert$112(quote$269 === '\'' || quote$269 === '"', 'String literal must starts with a quote');
        start$270 = index$104;
        ++index$104;
        while (index$104 < length$107) {
            ch$271 = nextChar$126();
            if (ch$271 === quote$269) {
                quote$269 = '';
                break;
            } else if (ch$271 === '\\') {
                ch$271 = nextChar$126();
                if (!isLineTerminator$119(ch$271)) {
                    switch (ch$271) {
                    case 'n':
                        str$268 += '\n';
                        break;
                    case 'r':
                        str$268 += '\r';
                        break;
                    case 't':
                        str$268 += '\t';
                        break;
                    case 'u':
                    case 'x':
                        restore$274 = index$104;
                        unescaped$273 = scanHexEscape$129(ch$271);
                        if (unescaped$273) {
                            str$268 += unescaped$273;
                        } else {
                            index$104 = restore$274;
                            str$268 += ch$271;
                        }
                        break;
                    case 'b':
                        str$268 += '\b';
                        break;
                    case 'f':
                        str$268 += '\f';
                        break;
                    case 'v':
                        str$268 += '\x0B';
                        break;
                    default:
                        if (isOctalDigit$117(ch$271)) {
                            code$272 = '01234567'.indexOf(ch$271);
                            if (code$272 !== 0) {
                                octal$275 = true;
                            }
                            if (index$104 < length$107 && isOctalDigit$117(source$102[index$104])) {
                                octal$275 = true;
                                code$272 = code$272 * 8 + '01234567'.indexOf(nextChar$126());
                                if ('0123'.indexOf(ch$271) >= 0 && index$104 < length$107 && isOctalDigit$117(source$102[index$104])) {
                                    code$272 = code$272 * 8 + '01234567'.indexOf(nextChar$126());
                                }
                            }
                            str$268 += String.fromCharCode(code$272);
                        } else {
                            str$268 += ch$271;
                        }
                        break;
                    }
                } else {
                    ++lineNumber$105;
                    if (ch$271 === '\r' && source$102[index$104] === '\n') {
                        ++index$104;
                    }
                }
            } else if (isLineTerminator$119(ch$271)) {
                break;
            } else {
                str$268 += ch$271;
            }
        }
        if (quote$269 !== '') {
            throwError$140({}, Messages$100.UnexpectedToken, 'ILLEGAL');
        }
        return {
            type: Token$96.StringLiteral,
            value: str$268,
            octal: octal$275,
            lineNumber: lineNumber$105,
            lineStart: lineStart$106,
            range: [
                start$270,
                index$104
            ]
        };
    }
    function scanRegExp$134() {
        var str$276 = '', ch$277, start$278, pattern$279, flags$280, value$281, classMarker$282 = false, restore$283;
        buffer$108 = null;
        skipComment$128();
        start$278 = index$104;
        ch$277 = source$102[index$104];
        assert$112(ch$277 === '/', 'Regular expression literal must start with a slash');
        str$276 = nextChar$126();
        while (index$104 < length$107) {
            ch$277 = nextChar$126();
            str$276 += ch$277;
            if (classMarker$282) {
                if (ch$277 === ']') {
                    classMarker$282 = false;
                }
            } else {
                if (ch$277 === '\\') {
                    ch$277 = nextChar$126();
                    if (isLineTerminator$119(ch$277)) {
                        throwError$140({}, Messages$100.UnterminatedRegExp);
                    }
                    str$276 += ch$277;
                } else if (ch$277 === '/') {
                    break;
                } else if (ch$277 === '[') {
                    classMarker$282 = true;
                } else if (isLineTerminator$119(ch$277)) {
                    throwError$140({}, Messages$100.UnterminatedRegExp);
                }
            }
        }
        if (str$276.length === 1) {
            throwError$140({}, Messages$100.UnterminatedRegExp);
        }
        pattern$279 = str$276.substr(1, str$276.length - 2);
        flags$280 = '';
        while (index$104 < length$107) {
            ch$277 = source$102[index$104];
            if (!isIdentifierPart$121(ch$277)) {
                break;
            }
            ++index$104;
            if (ch$277 === '\\' && index$104 < length$107) {
                ch$277 = source$102[index$104];
                if (ch$277 === 'u') {
                    ++index$104;
                    restore$283 = index$104;
                    ch$277 = scanHexEscape$129('u');
                    if (ch$277) {
                        flags$280 += ch$277;
                        str$276 += '\\u';
                        for (; restore$283 < index$104; ++restore$283) {
                            str$276 += source$102[restore$283];
                        }
                    } else {
                        index$104 = restore$283;
                        flags$280 += 'u';
                        str$276 += '\\u';
                    }
                } else {
                    str$276 += '\\';
                }
            } else {
                flags$280 += ch$277;
                str$276 += ch$277;
            }
        }
        try {
            value$281 = new RegExp(pattern$279, flags$280);
        } catch (e$284) {
            throwError$140({}, Messages$100.InvalidRegExp);
        }
        return {
            type: Token$96.RegexLiteral,
            literal: str$276,
            value: value$281,
            lineNumber: lineNumber$105,
            lineStart: lineStart$106,
            range: [
                start$278,
                index$104
            ]
        };
    }
    function isIdentifierName$135(token$285) {
        return token$285.type === Token$96.Identifier || token$285.type === Token$96.Keyword || token$285.type === Token$96.BooleanLiteral || token$285.type === Token$96.NullLiteral;
    }
    function advance$136() {
        var ch$286, token$287;
        skipComment$128();
        if (index$104 >= length$107) {
            return {
                type: Token$96.EOF,
                lineNumber: lineNumber$105,
                lineStart: lineStart$106,
                range: [
                    index$104,
                    index$104
                ]
            };
        }
        ch$286 = source$102[index$104];
        token$287 = scanPunctuator$131();
        if (typeof token$287 !== 'undefined') {
            return token$287;
        }
        if (ch$286 === '\'' || ch$286 === '"') {
            return scanStringLiteral$133();
        }
        if (ch$286 === '.' || isDecimalDigit$115(ch$286)) {
            return scanNumericLiteral$132();
        }
        token$287 = scanIdentifier$130();
        if (typeof token$287 !== 'undefined') {
            return token$287;
        }
        throwError$140({}, Messages$100.UnexpectedToken, 'ILLEGAL');
    }
    function lex$137() {
        var token$288;
        if (buffer$108) {
            token$288 = buffer$108;
            buffer$108 = null;
            index$104++;
            return token$288;
        }
        buffer$108 = null;
        return tokenStream$110[index$104++];
    }
    function lookahead$138() {
        var pos$289, line$290, start$291;
        if (buffer$108 !== null) {
            return buffer$108;
        }
        buffer$108 = tokenStream$110[index$104];
        return buffer$108;
    }
    function peekLineTerminator$139() {
        var pos$292, line$293, start$294, found$295;
        found$295 = tokenStream$110[index$104 - 1].token.lineNumber !== tokenStream$110[index$104].token.lineNumber;
        return found$295;
    }
    function throwError$140(token$296, messageFormat$297) {
        var error$298, args$299 = Array.prototype.slice.call(arguments, 2), msg$300 = messageFormat$297.replace(/%(\d)/g, function (whole$301, index$302) {
                return args$299[index$302] || '';
            });
        if (typeof token$296.lineNumber === 'number') {
            error$298 = new Error('Line ' + token$296.lineNumber + ': ' + msg$300);
            error$298.lineNumber = token$296.lineNumber;
            if (token$296.range && token$296.range.length > 0) {
                error$298.index = token$296.range[0];
                error$298.column = token$296.range[0] - lineStart$106 + 1;
            }
        } else {
            error$298 = new Error('Line ' + lineNumber$105 + ': ' + msg$300);
            error$298.index = index$104;
            error$298.lineNumber = lineNumber$105;
            error$298.column = index$104 - lineStart$106 + 1;
        }
        throw error$298;
    }
    function throwErrorTolerant$141() {
        var error$303;
        try {
            throwError$140.apply(null, arguments);
        } catch (e$304) {
            if (extra$111.errors) {
                extra$111.errors.push(e$304);
            } else {
                throw e$304;
            }
        }
    }
    function throwUnexpected$142(token$305) {
        var s$306;
        if (token$305.type === Token$96.EOF) {
            throwError$140(token$305, Messages$100.UnexpectedEOS);
        }
        if (token$305.type === Token$96.NumericLiteral) {
            throwError$140(token$305, Messages$100.UnexpectedNumber);
        }
        if (token$305.type === Token$96.StringLiteral) {
            throwError$140(token$305, Messages$100.UnexpectedString);
        }
        if (token$305.type === Token$96.Identifier) {
            console.log(token$305);
            throwError$140(token$305, Messages$100.UnexpectedIdentifier);
        }
        if (token$305.type === Token$96.Keyword) {
            if (isFutureReservedWord$122(token$305.value)) {
                throwError$140(token$305, Messages$100.UnexpectedReserved);
            } else if (strict$103 && isStrictModeReservedWord$123(token$305.value)) {
                throwError$140(token$305, Messages$100.StrictReservedWord);
            }
            throwError$140(token$305, Messages$100.UnexpectedToken, token$305.value);
        }
        throwError$140(token$305, Messages$100.UnexpectedToken, token$305.value);
    }
    function expect$143(value$307) {
        var token$308 = lex$137().token;
        if (token$308.type !== Token$96.Punctuator || token$308.value !== value$307) {
            throwUnexpected$142(token$308);
        }
    }
    function expectKeyword$144(keyword$309) {
        var token$310 = lex$137().token;
        if (token$310.type !== Token$96.Keyword || token$310.value !== keyword$309) {
            throwUnexpected$142(token$310);
        }
    }
    function match$145(value$311) {
        var token$312 = lookahead$138().token;
        return token$312.type === Token$96.Punctuator && token$312.value === value$311;
    }
    function matchKeyword$146(keyword$313) {
        var token$314 = lookahead$138().token;
        return token$314.type === Token$96.Keyword && token$314.value === keyword$313;
    }
    function matchAssign$147() {
        var token$315 = lookahead$138().token, op$316 = token$315.value;
        if (token$315.type !== Token$96.Punctuator) {
            return false;
        }
        return op$316 === '=' || op$316 === '*=' || op$316 === '/=' || op$316 === '%=' || op$316 === '+=' || op$316 === '-=' || op$316 === '<<=' || op$316 === '>>=' || op$316 === '>>>=' || op$316 === '&=' || op$316 === '^=' || op$316 === '|=';
    }
    function consumeSemicolon$148() {
        var token$317, line$318;
        if (tokenStream$110[index$104].token.value === ';') {
            lex$137().token;
            return;
        }
        line$318 = tokenStream$110[index$104 - 1].token.lineNumber;
        token$317 = tokenStream$110[index$104].token;
        if (line$318 !== token$317.lineNumber) {
            return;
        }
        if (token$317.type !== Token$96.EOF && !match$145('}')) {
            throwUnexpected$142(token$317);
        }
        return;
    }
    function isLeftHandSide$149(expr$319) {
        return expr$319.type === Syntax$98.Identifier || expr$319.type === Syntax$98.MemberExpression;
    }
    function parseArrayInitialiser$150() {
        var elements$320 = [], undef$321;
        expect$143('[');
        while (!match$145(']')) {
            if (match$145(',')) {
                lex$137().token;
                elements$320.push(undef$321);
            } else {
                elements$320.push(parseAssignmentExpression$179());
                if (!match$145(']')) {
                    expect$143(',');
                }
            }
        }
        expect$143(']');
        return {
            type: Syntax$98.ArrayExpression,
            elements: elements$320
        };
    }
    function parsePropertyFunction$151(param$322, first$323) {
        var previousStrict$324, body$325;
        previousStrict$324 = strict$103;
        body$325 = parseFunctionSourceElements$206();
        if (first$323 && strict$103 && isRestrictedWord$124(param$322[0].name)) {
            throwError$140(first$323, Messages$100.StrictParamName);
        }
        strict$103 = previousStrict$324;
        return {
            type: Syntax$98.FunctionExpression,
            id: null,
            params: param$322,
            body: body$325
        };
    }
    function parseObjectPropertyKey$152() {
        var token$326 = lex$137().token;
        if (token$326.type === Token$96.StringLiteral || token$326.type === Token$96.NumericLiteral) {
            if (strict$103 && token$326.octal) {
                throwError$140(token$326, Messages$100.StrictOctalLiteral);
            }
            return createLiteral$216(token$326);
        }
        return {
            type: Syntax$98.Identifier,
            name: token$326.value
        };
    }
    function parseObjectProperty$153() {
        var token$327, key$328, id$329, param$330;
        token$327 = lookahead$138().token;
        if (token$327.type === Token$96.Identifier) {
            id$329 = parseObjectPropertyKey$152();
            if (token$327.value === 'get' && !match$145(':')) {
                key$328 = parseObjectPropertyKey$152();
                expect$143('(');
                expect$143(')');
                return {
                    type: Syntax$98.Property,
                    key: key$328,
                    value: parsePropertyFunction$151([]),
                    kind: 'get'
                };
            } else if (token$327.value === 'set' && !match$145(':')) {
                key$328 = parseObjectPropertyKey$152();
                expect$143('(');
                token$327 = lookahead$138().token;
                if (token$327.type !== Token$96.Identifier) {
                    throwUnexpected$142(lex$137().token);
                }
                param$330 = [parseVariableIdentifier$183()];
                expect$143(')');
                return {
                    type: Syntax$98.Property,
                    key: key$328,
                    value: parsePropertyFunction$151(param$330, token$327),
                    kind: 'set'
                };
            } else {
                expect$143(':');
                return {
                    type: Syntax$98.Property,
                    key: id$329,
                    value: parseAssignmentExpression$179(),
                    kind: 'init'
                };
            }
        } else if (token$327.type === Token$96.EOF || token$327.type === Token$96.Punctuator) {
            throwUnexpected$142(token$327);
        } else {
            key$328 = parseObjectPropertyKey$152();
            expect$143(':');
            return {
                type: Syntax$98.Property,
                key: key$328,
                value: parseAssignmentExpression$179(),
                kind: 'init'
            };
        }
    }
    function parseObjectInitialiser$154() {
        var token$331, properties$332 = [], property$333, name$334, kind$335, map$336 = {}, toString$337 = String;
        expect$143('{');
        while (!match$145('}')) {
            property$333 = parseObjectProperty$153();
            if (property$333.key.type === Syntax$98.Identifier) {
                name$334 = property$333.key.name;
            } else {
                name$334 = toString$337(property$333.key.value);
            }
            kind$335 = property$333.kind === 'init' ? PropertyKind$99.Data : property$333.kind === 'get' ? PropertyKind$99.Get : PropertyKind$99.Set;
            if (Object.prototype.hasOwnProperty.call(map$336, name$334)) {
                if (map$336[name$334] === PropertyKind$99.Data) {
                    if (strict$103 && kind$335 === PropertyKind$99.Data) {
                        throwErrorTolerant$141({}, Messages$100.StrictDuplicateProperty);
                    } else if (kind$335 !== PropertyKind$99.Data) {
                        throwError$140({}, Messages$100.AccessorDataProperty);
                    }
                } else {
                    if (kind$335 === PropertyKind$99.Data) {
                        throwError$140({}, Messages$100.AccessorDataProperty);
                    } else if (map$336[name$334] & kind$335) {
                        throwError$140({}, Messages$100.AccessorGetSet);
                    }
                }
                map$336[name$334] |= kind$335;
            } else {
                map$336[name$334] = kind$335;
            }
            properties$332.push(property$333);
            if (!match$145('}')) {
                expect$143(',');
            }
        }
        expect$143('}');
        return {
            type: Syntax$98.ObjectExpression,
            properties: properties$332
        };
    }
    function parsePrimaryExpression$155() {
        var expr$338, token$339 = lookahead$138().token, type$340 = token$339.type;
        if (type$340 === Token$96.Identifier) {
            var name$341 = expander$95.resolve(lex$137());
            return {
                type: Syntax$98.Identifier,
                name: name$341
            };
        }
        if (type$340 === Token$96.StringLiteral || type$340 === Token$96.NumericLiteral) {
            if (strict$103 && token$339.octal) {
                throwErrorTolerant$141(token$339, Messages$100.StrictOctalLiteral);
            }
            return createLiteral$216(lex$137().token);
        }
        if (type$340 === Token$96.Keyword) {
            if (matchKeyword$146('this')) {
                lex$137().token;
                return { type: Syntax$98.ThisExpression };
            }
            if (matchKeyword$146('function')) {
                return parseFunctionExpression$208();
            }
        }
        if (type$340 === Token$96.BooleanLiteral) {
            lex$137();
            token$339.value = token$339.value === 'true';
            return createLiteral$216(token$339);
        }
        if (type$340 === Token$96.NullLiteral) {
            lex$137();
            token$339.value = null;
            return createLiteral$216(token$339);
        }
        if (match$145('[')) {
            return parseArrayInitialiser$150();
        }
        if (match$145('{')) {
            return parseObjectInitialiser$154();
        }
        if (match$145('(')) {
            lex$137();
            state$109.lastParenthesized = expr$338 = parseExpression$180();
            expect$143(')');
            return expr$338;
        }
        if (token$339.value instanceof RegExp) {
            return createLiteral$216(lex$137().token);
        }
        return throwUnexpected$142(lex$137().token);
    }
    function parseArguments$156() {
        var args$342 = [];
        expect$143('(');
        if (!match$145(')')) {
            while (index$104 < length$107) {
                args$342.push(parseAssignmentExpression$179());
                if (match$145(')')) {
                    break;
                }
                expect$143(',');
            }
        }
        expect$143(')');
        return args$342;
    }
    function parseNonComputedProperty$157() {
        var token$343 = lex$137().token;
        if (!isIdentifierName$135(token$343)) {
            throwUnexpected$142(token$343);
        }
        return {
            type: Syntax$98.Identifier,
            name: token$343.value
        };
    }
    function parseNonComputedMember$158(object$344) {
        return {
            type: Syntax$98.MemberExpression,
            computed: false,
            object: object$344,
            property: parseNonComputedProperty$157()
        };
    }
    function parseComputedMember$159(object$345) {
        var property$346, expr$347;
        expect$143('[');
        property$346 = parseExpression$180();
        expr$347 = {
            type: Syntax$98.MemberExpression,
            computed: true,
            object: object$345,
            property: property$346
        };
        expect$143(']');
        return expr$347;
    }
    function parseCallMember$160(object$348) {
        return {
            type: Syntax$98.CallExpression,
            callee: object$348,
            'arguments': parseArguments$156()
        };
    }
    function parseNewExpression$161() {
        var expr$349;
        expectKeyword$144('new');
        expr$349 = {
            type: Syntax$98.NewExpression,
            callee: parseLeftHandSideExpression$165(),
            'arguments': []
        };
        if (match$145('(')) {
            expr$349['arguments'] = parseArguments$156();
        }
        return expr$349;
    }
    function toArrayNode$162(arr$350) {
        var els$351 = arr$350.map(function (el$352) {
                return {
                    type: 'Literal',
                    value: el$352,
                    raw: el$352.toString()
                };
            });
        return {
            type: 'ArrayExpression',
            elements: els$351
        };
    }
    function toObjectNode$163(obj$353) {
        var props$354 = Object.keys(obj$353).map(function (key$355) {
                var raw$356 = obj$353[key$355];
                var value$357;
                if (Array.isArray(raw$356)) {
                    value$357 = toArrayNode$162(raw$356);
                } else {
                    value$357 = {
                        type: 'Literal',
                        value: obj$353[key$355],
                        raw: obj$353[key$355].toString()
                    };
                }
                return {
                    type: 'Property',
                    key: {
                        type: 'Identifier',
                        name: key$355
                    },
                    value: value$357,
                    kind: 'init'
                };
            });
        return {
            type: 'ObjectExpression',
            properties: props$354
        };
    }
    function parseLeftHandSideExpressionAllowCall$164() {
        var useNew$358, expr$359;
        useNew$358 = matchKeyword$146('new');
        expr$359 = useNew$358 ? parseNewExpression$161() : parsePrimaryExpression$155();
        while (index$104 < length$107) {
            if (match$145('.')) {
                lex$137();
                expr$359 = parseNonComputedMember$158(expr$359);
            } else if (match$145('[')) {
                expr$359 = parseComputedMember$159(expr$359);
            } else if (match$145('(')) {
                expr$359 = parseCallMember$160(expr$359);
            } else {
                break;
            }
        }
        return expr$359;
    }
    function parseLeftHandSideExpression$165() {
        var useNew$360, expr$361;
        useNew$360 = matchKeyword$146('new');
        expr$361 = useNew$360 ? parseNewExpression$161() : parsePrimaryExpression$155();
        while (index$104 < length$107) {
            if (match$145('.')) {
                lex$137();
                expr$361 = parseNonComputedMember$158(expr$361);
            } else if (match$145('[')) {
                expr$361 = parseComputedMember$159(expr$361);
            } else {
                break;
            }
        }
        return expr$361;
    }
    function parsePostfixExpression$166() {
        var expr$362 = parseLeftHandSideExpressionAllowCall$164();
        if ((match$145('++') || match$145('--')) && !peekLineTerminator$139()) {
            if (strict$103 && expr$362.type === Syntax$98.Identifier && isRestrictedWord$124(expr$362.name)) {
                throwError$140({}, Messages$100.StrictLHSPostfix);
            }
            if (!isLeftHandSide$149(expr$362)) {
                throwError$140({}, Messages$100.InvalidLHSInAssignment);
            }
            expr$362 = {
                type: Syntax$98.UpdateExpression,
                operator: lex$137().token.value,
                argument: expr$362,
                prefix: false
            };
        }
        return expr$362;
    }
    function parseUnaryExpression$167() {
        var token$363, expr$364;
        if (match$145('++') || match$145('--')) {
            token$363 = lex$137().token;
            expr$364 = parseUnaryExpression$167();
            if (strict$103 && expr$364.type === Syntax$98.Identifier && isRestrictedWord$124(expr$364.name)) {
                throwError$140({}, Messages$100.StrictLHSPrefix);
            }
            if (!isLeftHandSide$149(expr$364)) {
                throwError$140({}, Messages$100.InvalidLHSInAssignment);
            }
            expr$364 = {
                type: Syntax$98.UpdateExpression,
                operator: token$363.value,
                argument: expr$364,
                prefix: true
            };
            return expr$364;
        }
        if (match$145('+') || match$145('-') || match$145('~') || match$145('!')) {
            expr$364 = {
                type: Syntax$98.UnaryExpression,
                operator: lex$137().token.value,
                argument: parseUnaryExpression$167()
            };
            return expr$364;
        }
        if (matchKeyword$146('delete') || matchKeyword$146('void') || matchKeyword$146('typeof')) {
            expr$364 = {
                type: Syntax$98.UnaryExpression,
                operator: lex$137().token.value,
                argument: parseUnaryExpression$167()
            };
            if (strict$103 && expr$364.operator === 'delete' && expr$364.argument.type === Syntax$98.Identifier) {
                throwErrorTolerant$141({}, Messages$100.StrictDelete);
            }
            return expr$364;
        }
        return parsePostfixExpression$166();
    }
    function parseMultiplicativeExpression$168() {
        var expr$365 = parseUnaryExpression$167();
        while (match$145('*') || match$145('/') || match$145('%')) {
            expr$365 = {
                type: Syntax$98.BinaryExpression,
                operator: lex$137().token.value,
                left: expr$365,
                right: parseUnaryExpression$167()
            };
        }
        return expr$365;
    }
    function parseAdditiveExpression$169() {
        var expr$366 = parseMultiplicativeExpression$168();
        while (match$145('+') || match$145('-')) {
            expr$366 = {
                type: Syntax$98.BinaryExpression,
                operator: lex$137().token.value,
                left: expr$366,
                right: parseMultiplicativeExpression$168()
            };
        }
        return expr$366;
    }
    function parseShiftExpression$170() {
        var expr$367 = parseAdditiveExpression$169();
        while (match$145('<<') || match$145('>>') || match$145('>>>')) {
            expr$367 = {
                type: Syntax$98.BinaryExpression,
                operator: lex$137().token.value,
                left: expr$367,
                right: parseAdditiveExpression$169()
            };
        }
        return expr$367;
    }
    function parseRelationalExpression$171() {
        var expr$368, previousAllowIn$369;
        previousAllowIn$369 = state$109.allowIn;
        state$109.allowIn = true;
        expr$368 = parseShiftExpression$170();
        while (match$145('<') || match$145('>') || match$145('<=') || match$145('>=') || previousAllowIn$369 && matchKeyword$146('in') || matchKeyword$146('instanceof')) {
            expr$368 = {
                type: Syntax$98.BinaryExpression,
                operator: lex$137().token.value,
                left: expr$368,
                right: parseRelationalExpression$171()
            };
        }
        state$109.allowIn = previousAllowIn$369;
        return expr$368;
    }
    function parseEqualityExpression$172() {
        var expr$370 = parseRelationalExpression$171();
        while (match$145('==') || match$145('!=') || match$145('===') || match$145('!==')) {
            expr$370 = {
                type: Syntax$98.BinaryExpression,
                operator: lex$137().token.value,
                left: expr$370,
                right: parseRelationalExpression$171()
            };
        }
        return expr$370;
    }
    function parseBitwiseANDExpression$173() {
        var expr$371 = parseEqualityExpression$172();
        while (match$145('&')) {
            lex$137();
            expr$371 = {
                type: Syntax$98.BinaryExpression,
                operator: '&',
                left: expr$371,
                right: parseEqualityExpression$172()
            };
        }
        return expr$371;
    }
    function parseBitwiseXORExpression$174() {
        var expr$372 = parseBitwiseANDExpression$173();
        while (match$145('^')) {
            lex$137();
            expr$372 = {
                type: Syntax$98.BinaryExpression,
                operator: '^',
                left: expr$372,
                right: parseBitwiseANDExpression$173()
            };
        }
        return expr$372;
    }
    function parseBitwiseORExpression$175() {
        var expr$373 = parseBitwiseXORExpression$174();
        while (match$145('|')) {
            lex$137();
            expr$373 = {
                type: Syntax$98.BinaryExpression,
                operator: '|',
                left: expr$373,
                right: parseBitwiseXORExpression$174()
            };
        }
        return expr$373;
    }
    function parseLogicalANDExpression$176() {
        var expr$374 = parseBitwiseORExpression$175();
        while (match$145('&&')) {
            lex$137();
            expr$374 = {
                type: Syntax$98.LogicalExpression,
                operator: '&&',
                left: expr$374,
                right: parseBitwiseORExpression$175()
            };
        }
        return expr$374;
    }
    function parseLogicalORExpression$177() {
        var expr$375 = parseLogicalANDExpression$176();
        while (match$145('||')) {
            lex$137();
            expr$375 = {
                type: Syntax$98.LogicalExpression,
                operator: '||',
                left: expr$375,
                right: parseLogicalANDExpression$176()
            };
        }
        return expr$375;
    }
    function parseConditionalExpression$178() {
        var expr$376, previousAllowIn$377, consequent$378;
        expr$376 = parseLogicalORExpression$177();
        if (match$145('?')) {
            lex$137();
            previousAllowIn$377 = state$109.allowIn;
            state$109.allowIn = true;
            consequent$378 = parseAssignmentExpression$179();
            state$109.allowIn = previousAllowIn$377;
            expect$143(':');
            expr$376 = {
                type: Syntax$98.ConditionalExpression,
                test: expr$376,
                consequent: consequent$378,
                alternate: parseAssignmentExpression$179()
            };
        }
        return expr$376;
    }
    function parseAssignmentExpression$179() {
        var expr$379;
        expr$379 = parseConditionalExpression$178();
        if (matchAssign$147()) {
            if (!isLeftHandSide$149(expr$379)) {
                throwError$140({}, Messages$100.InvalidLHSInAssignment);
            }
            if (strict$103 && expr$379.type === Syntax$98.Identifier && isRestrictedWord$124(expr$379.name)) {
                throwError$140({}, Messages$100.StrictLHSAssignment);
            }
            expr$379 = {
                type: Syntax$98.AssignmentExpression,
                operator: lex$137().token.value,
                left: expr$379,
                right: parseAssignmentExpression$179()
            };
        }
        return expr$379;
    }
    function parseExpression$180() {
        var expr$380 = parseAssignmentExpression$179();
        if (match$145(',')) {
            expr$380 = {
                type: Syntax$98.SequenceExpression,
                expressions: [expr$380]
            };
            while (index$104 < length$107) {
                if (!match$145(',')) {
                    break;
                }
                lex$137();
                expr$380.expressions.push(parseAssignmentExpression$179());
            }
        }
        return expr$380;
    }
    function parseStatementList$181() {
        var list$381 = [], statement$382;
        while (index$104 < length$107) {
            if (match$145('}')) {
                break;
            }
            statement$382 = parseSourceElement$209();
            if (typeof statement$382 === 'undefined') {
                break;
            }
            list$381.push(statement$382);
        }
        return list$381;
    }
    function parseBlock$182() {
        var block$383;
        expect$143('{');
        block$383 = parseStatementList$181();
        expect$143('}');
        return {
            type: Syntax$98.BlockStatement,
            body: block$383
        };
    }
    function parseVariableIdentifier$183() {
        var stx$384 = lex$137(), token$385 = stx$384.token;
        if (token$385.type !== Token$96.Identifier) {
            throwUnexpected$142(token$385);
        }
        var name$386 = expander$95.resolve(stx$384);
        return {
            type: Syntax$98.Identifier,
            name: name$386
        };
    }
    function parseVariableDeclaration$184(kind$387) {
        var id$388 = parseVariableIdentifier$183(), init$389 = null;
        if (strict$103 && isRestrictedWord$124(id$388.name)) {
            throwErrorTolerant$141({}, Messages$100.StrictVarName);
        }
        if (kind$387 === 'const') {
            expect$143('=');
            init$389 = parseAssignmentExpression$179();
        } else if (match$145('=')) {
            lex$137();
            init$389 = parseAssignmentExpression$179();
        }
        return {
            type: Syntax$98.VariableDeclarator,
            id: id$388,
            init: init$389
        };
    }
    function parseVariableDeclarationList$185(kind$390) {
        var list$391 = [];
        while (index$104 < length$107) {
            list$391.push(parseVariableDeclaration$184(kind$390));
            if (!match$145(',')) {
                break;
            }
            lex$137();
        }
        return list$391;
    }
    function parseVariableStatement$186() {
        var declarations$392;
        expectKeyword$144('var');
        declarations$392 = parseVariableDeclarationList$185();
        consumeSemicolon$148();
        return {
            type: Syntax$98.VariableDeclaration,
            declarations: declarations$392,
            kind: 'var'
        };
    }
    function parseConstLetDeclaration$187(kind$393) {
        var declarations$394;
        expectKeyword$144(kind$393);
        declarations$394 = parseVariableDeclarationList$185(kind$393);
        consumeSemicolon$148();
        return {
            type: Syntax$98.VariableDeclaration,
            declarations: declarations$394,
            kind: kind$393
        };
    }
    function parseEmptyStatement$188() {
        expect$143(';');
        return { type: Syntax$98.EmptyStatement };
    }
    function parseExpressionStatement$189() {
        var expr$395 = parseExpression$180();
        consumeSemicolon$148();
        return {
            type: Syntax$98.ExpressionStatement,
            expression: expr$395
        };
    }
    function parseIfStatement$190() {
        var test$396, consequent$397, alternate$398;
        expectKeyword$144('if');
        expect$143('(');
        test$396 = parseExpression$180();
        expect$143(')');
        consequent$397 = parseStatement$205();
        if (matchKeyword$146('else')) {
            lex$137();
            alternate$398 = parseStatement$205();
        } else {
            alternate$398 = null;
        }
        return {
            type: Syntax$98.IfStatement,
            test: test$396,
            consequent: consequent$397,
            alternate: alternate$398
        };
    }
    function parseDoWhileStatement$191() {
        var body$399, test$400, oldInIteration$401;
        expectKeyword$144('do');
        oldInIteration$401 = state$109.inIteration;
        state$109.inIteration = true;
        body$399 = parseStatement$205();
        state$109.inIteration = oldInIteration$401;
        expectKeyword$144('while');
        expect$143('(');
        test$400 = parseExpression$180();
        expect$143(')');
        if (match$145(';')) {
            lex$137();
        }
        return {
            type: Syntax$98.DoWhileStatement,
            body: body$399,
            test: test$400
        };
    }
    function parseWhileStatement$192() {
        var test$402, body$403, oldInIteration$404;
        expectKeyword$144('while');
        expect$143('(');
        test$402 = parseExpression$180();
        expect$143(')');
        oldInIteration$404 = state$109.inIteration;
        state$109.inIteration = true;
        body$403 = parseStatement$205();
        state$109.inIteration = oldInIteration$404;
        return {
            type: Syntax$98.WhileStatement,
            test: test$402,
            body: body$403
        };
    }
    function parseForVariableDeclaration$193() {
        var token$405 = lex$137().token;
        return {
            type: Syntax$98.VariableDeclaration,
            declarations: parseVariableDeclarationList$185(),
            kind: token$405.value
        };
    }
    function parseForStatement$194() {
        var init$406, test$407, update$408, left$409, right$410, body$411, oldInIteration$412;
        init$406 = test$407 = update$408 = null;
        expectKeyword$144('for');
        expect$143('(');
        if (match$145(';')) {
            lex$137();
        } else {
            if (matchKeyword$146('var') || matchKeyword$146('let')) {
                state$109.allowIn = false;
                init$406 = parseForVariableDeclaration$193();
                state$109.allowIn = true;
                if (init$406.declarations.length === 1 && matchKeyword$146('in')) {
                    lex$137();
                    left$409 = init$406;
                    right$410 = parseExpression$180();
                    init$406 = null;
                }
            } else {
                state$109.allowIn = false;
                init$406 = parseExpression$180();
                state$109.allowIn = true;
                if (matchKeyword$146('in')) {
                    if (!isLeftHandSide$149(init$406)) {
                        throwError$140({}, Messages$100.InvalidLHSInForIn);
                    }
                    lex$137();
                    left$409 = init$406;
                    right$410 = parseExpression$180();
                    init$406 = null;
                }
            }
            if (typeof left$409 === 'undefined') {
                expect$143(';');
            }
        }
        if (typeof left$409 === 'undefined') {
            if (!match$145(';')) {
                test$407 = parseExpression$180();
            }
            expect$143(';');
            if (!match$145(')')) {
                update$408 = parseExpression$180();
            }
        }
        expect$143(')');
        oldInIteration$412 = state$109.inIteration;
        state$109.inIteration = true;
        body$411 = parseStatement$205();
        state$109.inIteration = oldInIteration$412;
        if (typeof left$409 === 'undefined') {
            return {
                type: Syntax$98.ForStatement,
                init: init$406,
                test: test$407,
                update: update$408,
                body: body$411
            };
        }
        return {
            type: Syntax$98.ForInStatement,
            left: left$409,
            right: right$410,
            body: body$411,
            each: false
        };
    }
    function parseContinueStatement$195() {
        var token$413, label$414 = null;
        expectKeyword$144('continue');
        if (tokenStream$110[index$104].token.value === ';') {
            lex$137();
            if (!state$109.inIteration) {
                throwError$140({}, Messages$100.IllegalContinue);
            }
            return {
                type: Syntax$98.ContinueStatement,
                label: null
            };
        }
        if (peekLineTerminator$139()) {
            if (!state$109.inIteration) {
                throwError$140({}, Messages$100.IllegalContinue);
            }
            return {
                type: Syntax$98.ContinueStatement,
                label: null
            };
        }
        token$413 = lookahead$138().token;
        if (token$413.type === Token$96.Identifier) {
            label$414 = parseVariableIdentifier$183();
            if (!Object.prototype.hasOwnProperty.call(state$109.labelSet, label$414.name)) {
                throwError$140({}, Messages$100.UnknownLabel, label$414.name);
            }
        }
        consumeSemicolon$148();
        if (label$414 === null && !state$109.inIteration) {
            throwError$140({}, Messages$100.IllegalContinue);
        }
        return {
            type: Syntax$98.ContinueStatement,
            label: label$414
        };
    }
    function parseBreakStatement$196() {
        var token$415, label$416 = null;
        expectKeyword$144('break');
        if (peekLineTerminator$139()) {
            if (!(state$109.inIteration || state$109.inSwitch)) {
                throwError$140({}, Messages$100.IllegalBreak);
            }
            return {
                type: Syntax$98.BreakStatement,
                label: null
            };
        }
        token$415 = lookahead$138().token;
        if (token$415.type === Token$96.Identifier) {
            label$416 = parseVariableIdentifier$183();
            if (!Object.prototype.hasOwnProperty.call(state$109.labelSet, label$416.name)) {
                throwError$140({}, Messages$100.UnknownLabel, label$416.name);
            }
        }
        consumeSemicolon$148();
        if (label$416 === null && !(state$109.inIteration || state$109.inSwitch)) {
            throwError$140({}, Messages$100.IllegalBreak);
        }
        return {
            type: Syntax$98.BreakStatement,
            label: label$416
        };
    }
    function parseReturnStatement$197() {
        var token$417, argument$418 = null;
        expectKeyword$144('return');
        if (!state$109.inFunctionBody) {
            throwErrorTolerant$141({}, Messages$100.IllegalReturn);
        }
        if (peekLineTerminator$139()) {
            return {
                type: Syntax$98.ReturnStatement,
                argument: null
            };
        }
        if (!match$145(';')) {
            token$417 = lookahead$138().token;
            if (!match$145('}') && token$417.type !== Token$96.EOF) {
                argument$418 = parseExpression$180();
            }
        }
        consumeSemicolon$148();
        return {
            type: Syntax$98.ReturnStatement,
            argument: argument$418
        };
    }
    function parseWithStatement$198() {
        var object$419, body$420;
        if (strict$103) {
            throwErrorTolerant$141({}, Messages$100.StrictModeWith);
        }
        expectKeyword$144('with');
        expect$143('(');
        object$419 = parseExpression$180();
        expect$143(')');
        body$420 = parseStatement$205();
        return {
            type: Syntax$98.WithStatement,
            object: object$419,
            body: body$420
        };
    }
    function parseSwitchCase$199() {
        var test$421, consequent$422 = [], statement$423;
        if (matchKeyword$146('default')) {
            lex$137();
            test$421 = null;
        } else {
            expectKeyword$144('case');
            test$421 = parseExpression$180();
        }
        expect$143(':');
        while (index$104 < length$107) {
            if (match$145('}') || matchKeyword$146('default') || matchKeyword$146('case')) {
                break;
            }
            statement$423 = parseStatement$205();
            if (typeof statement$423 === 'undefined') {
                break;
            }
            consequent$422.push(statement$423);
        }
        return {
            type: Syntax$98.SwitchCase,
            test: test$421,
            consequent: consequent$422
        };
    }
    function parseSwitchStatement$200() {
        var discriminant$424, cases$425, oldInSwitch$426;
        expectKeyword$144('switch');
        expect$143('(');
        discriminant$424 = parseExpression$180();
        expect$143(')');
        expect$143('{');
        if (match$145('}')) {
            lex$137();
            return {
                type: Syntax$98.SwitchStatement,
                discriminant: discriminant$424
            };
        }
        cases$425 = [];
        oldInSwitch$426 = state$109.inSwitch;
        state$109.inSwitch = true;
        while (index$104 < length$107) {
            if (match$145('}')) {
                break;
            }
            cases$425.push(parseSwitchCase$199());
        }
        state$109.inSwitch = oldInSwitch$426;
        expect$143('}');
        return {
            type: Syntax$98.SwitchStatement,
            discriminant: discriminant$424,
            cases: cases$425
        };
    }
    function parseThrowStatement$201() {
        var argument$427;
        expectKeyword$144('throw');
        if (peekLineTerminator$139()) {
            throwError$140({}, Messages$100.NewlineAfterThrow);
        }
        argument$427 = parseExpression$180();
        consumeSemicolon$148();
        return {
            type: Syntax$98.ThrowStatement,
            argument: argument$427
        };
    }
    function parseCatchClause$202() {
        var param$428;
        expectKeyword$144('catch');
        expect$143('(');
        if (!match$145(')')) {
            param$428 = parseExpression$180();
            if (strict$103 && param$428.type === Syntax$98.Identifier && isRestrictedWord$124(param$428.name)) {
                throwErrorTolerant$141({}, Messages$100.StrictCatchVariable);
            }
        }
        expect$143(')');
        return {
            type: Syntax$98.CatchClause,
            param: param$428,
            guard: null,
            body: parseBlock$182()
        };
    }
    function parseTryStatement$203() {
        var block$429, handlers$430 = [], finalizer$431 = null;
        expectKeyword$144('try');
        block$429 = parseBlock$182();
        if (matchKeyword$146('catch')) {
            handlers$430.push(parseCatchClause$202());
        }
        if (matchKeyword$146('finally')) {
            lex$137();
            finalizer$431 = parseBlock$182();
        }
        if (handlers$430.length === 0 && !finalizer$431) {
            throwError$140({}, Messages$100.NoCatchOrFinally);
        }
        return {
            type: Syntax$98.TryStatement,
            block: block$429,
            handlers: handlers$430,
            finalizer: finalizer$431
        };
    }
    function parseDebuggerStatement$204() {
        expectKeyword$144('debugger');
        consumeSemicolon$148();
        return { type: Syntax$98.DebuggerStatement };
    }
    function parseStatement$205() {
        var token$432 = lookahead$138().token, expr$433, labeledBody$434;
        if (token$432.type === Token$96.EOF) {
            throwUnexpected$142(token$432);
        }
        if (token$432.type === Token$96.Punctuator) {
            switch (token$432.value) {
            case ';':
                return parseEmptyStatement$188();
            case '{':
                return parseBlock$182();
            case '(':
                return parseExpressionStatement$189();
            default:
                break;
            }
        }
        if (token$432.type === Token$96.Keyword) {
            switch (token$432.value) {
            case 'break':
                return parseBreakStatement$196();
            case 'continue':
                return parseContinueStatement$195();
            case 'debugger':
                return parseDebuggerStatement$204();
            case 'do':
                return parseDoWhileStatement$191();
            case 'for':
                return parseForStatement$194();
            case 'function':
                return parseFunctionDeclaration$207();
            case 'if':
                return parseIfStatement$190();
            case 'return':
                return parseReturnStatement$197();
            case 'switch':
                return parseSwitchStatement$200();
            case 'throw':
                return parseThrowStatement$201();
            case 'try':
                return parseTryStatement$203();
            case 'var':
                return parseVariableStatement$186();
            case 'while':
                return parseWhileStatement$192();
            case 'with':
                return parseWithStatement$198();
            default:
                break;
            }
        }
        expr$433 = parseExpression$180();
        if (expr$433.type === Syntax$98.Identifier && match$145(':')) {
            lex$137();
            if (Object.prototype.hasOwnProperty.call(state$109.labelSet, expr$433.name)) {
                throwError$140({}, Messages$100.Redeclaration, 'Label', expr$433.name);
            }
            state$109.labelSet[expr$433.name] = true;
            labeledBody$434 = parseStatement$205();
            delete state$109.labelSet[expr$433.name];
            return {
                type: Syntax$98.LabeledStatement,
                label: expr$433,
                body: labeledBody$434
            };
        }
        consumeSemicolon$148();
        return {
            type: Syntax$98.ExpressionStatement,
            expression: expr$433
        };
    }
    function parseFunctionSourceElements$206() {
        var sourceElement$435, sourceElements$436 = [], token$437, directive$438, firstRestricted$439, oldLabelSet$440, oldInIteration$441, oldInSwitch$442, oldInFunctionBody$443;
        expect$143('{');
        while (index$104 < length$107) {
            token$437 = lookahead$138().token;
            if (token$437.type !== Token$96.StringLiteral) {
                break;
            }
            sourceElement$435 = parseSourceElement$209();
            sourceElements$436.push(sourceElement$435);
            if (sourceElement$435.expression.type !== Syntax$98.Literal) {
                break;
            }
            directive$438 = sliceSource$114(token$437.range[0] + 1, token$437.range[1] - 1);
            if (directive$438 === 'use strict') {
                strict$103 = true;
                if (firstRestricted$439) {
                    throwError$140(firstRestricted$439, Messages$100.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$439 && token$437.octal) {
                    firstRestricted$439 = token$437;
                }
            }
        }
        oldLabelSet$440 = state$109.labelSet;
        oldInIteration$441 = state$109.inIteration;
        oldInSwitch$442 = state$109.inSwitch;
        oldInFunctionBody$443 = state$109.inFunctionBody;
        state$109.labelSet = {};
        state$109.inIteration = false;
        state$109.inSwitch = false;
        state$109.inFunctionBody = true;
        while (index$104 < length$107) {
            if (match$145('}')) {
                break;
            }
            sourceElement$435 = parseSourceElement$209();
            if (typeof sourceElement$435 === 'undefined') {
                break;
            }
            sourceElements$436.push(sourceElement$435);
        }
        expect$143('}');
        state$109.labelSet = oldLabelSet$440;
        state$109.inIteration = oldInIteration$441;
        state$109.inSwitch = oldInSwitch$442;
        state$109.inFunctionBody = oldInFunctionBody$443;
        return {
            type: Syntax$98.BlockStatement,
            body: sourceElements$436
        };
    }
    function parseFunctionDeclaration$207() {
        var id$444, param$445, params$446 = [], body$447, token$448, firstRestricted$449, message$450, previousStrict$451, paramSet$452;
        expectKeyword$144('function');
        token$448 = lookahead$138().token;
        id$444 = parseVariableIdentifier$183();
        if (strict$103) {
            if (isRestrictedWord$124(token$448.value)) {
                throwError$140(token$448, Messages$100.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord$124(token$448.value)) {
                firstRestricted$449 = token$448;
                message$450 = Messages$100.StrictFunctionName;
            } else if (isStrictModeReservedWord$123(token$448.value)) {
                firstRestricted$449 = token$448;
                message$450 = Messages$100.StrictReservedWord;
            }
        }
        expect$143('(');
        if (!match$145(')')) {
            paramSet$452 = {};
            while (index$104 < length$107) {
                token$448 = lookahead$138().token;
                param$445 = parseVariableIdentifier$183();
                if (strict$103) {
                    if (isRestrictedWord$124(token$448.value)) {
                        throwError$140(token$448, Messages$100.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$452, token$448.value)) {
                        throwError$140(token$448, Messages$100.StrictParamDupe);
                    }
                } else if (!firstRestricted$449) {
                    if (isRestrictedWord$124(token$448.value)) {
                        firstRestricted$449 = token$448;
                        message$450 = Messages$100.StrictParamName;
                    } else if (isStrictModeReservedWord$123(token$448.value)) {
                        firstRestricted$449 = token$448;
                        message$450 = Messages$100.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$452, token$448.value)) {
                        firstRestricted$449 = token$448;
                        message$450 = Messages$100.StrictParamDupe;
                    }
                }
                params$446.push(param$445);
                paramSet$452[param$445.name] = true;
                if (match$145(')')) {
                    break;
                }
                expect$143(',');
            }
        }
        expect$143(')');
        previousStrict$451 = strict$103;
        body$447 = parseFunctionSourceElements$206();
        if (strict$103 && firstRestricted$449) {
            throwError$140(firstRestricted$449, message$450);
        }
        strict$103 = previousStrict$451;
        return {
            type: Syntax$98.FunctionDeclaration,
            id: id$444,
            params: params$446,
            body: body$447
        };
    }
    function parseFunctionExpression$208() {
        var token$453, id$454 = null, firstRestricted$455, message$456, param$457, params$458 = [], body$459, previousStrict$460, paramSet$461;
        expectKeyword$144('function');
        if (!match$145('(')) {
            token$453 = lookahead$138().token;
            id$454 = parseVariableIdentifier$183();
            if (strict$103) {
                if (isRestrictedWord$124(token$453.value)) {
                    throwError$140(token$453, Messages$100.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord$124(token$453.value)) {
                    firstRestricted$455 = token$453;
                    message$456 = Messages$100.StrictFunctionName;
                } else if (isStrictModeReservedWord$123(token$453.value)) {
                    firstRestricted$455 = token$453;
                    message$456 = Messages$100.StrictReservedWord;
                }
            }
        }
        expect$143('(');
        if (!match$145(')')) {
            paramSet$461 = {};
            while (index$104 < length$107) {
                token$453 = lookahead$138().token;
                param$457 = parseVariableIdentifier$183();
                if (strict$103) {
                    if (isRestrictedWord$124(token$453.value)) {
                        throwError$140(token$453, Messages$100.StrictParamName);
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet$461, token$453.value)) {
                        throwError$140(token$453, Messages$100.StrictParamDupe);
                    }
                } else if (!firstRestricted$455) {
                    if (isRestrictedWord$124(token$453.value)) {
                        firstRestricted$455 = token$453;
                        message$456 = Messages$100.StrictParamName;
                    } else if (isStrictModeReservedWord$123(token$453.value)) {
                        firstRestricted$455 = token$453;
                        message$456 = Messages$100.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet$461, token$453.value)) {
                        firstRestricted$455 = token$453;
                        message$456 = Messages$100.StrictParamDupe;
                    }
                }
                params$458.push(param$457);
                paramSet$461[param$457.name] = true;
                if (match$145(')')) {
                    break;
                }
                expect$143(',');
            }
        }
        expect$143(')');
        previousStrict$460 = strict$103;
        body$459 = parseFunctionSourceElements$206();
        if (strict$103 && firstRestricted$455) {
            throwError$140(firstRestricted$455, message$456);
        }
        strict$103 = previousStrict$460;
        return {
            type: Syntax$98.FunctionExpression,
            id: id$454,
            params: params$458,
            body: body$459
        };
    }
    function parseSourceElement$209() {
        var token$462 = lookahead$138().token;
        if (token$462.type === Token$96.Keyword) {
            switch (token$462.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration$187(token$462.value);
            case 'function':
                return parseFunctionDeclaration$207();
            default:
                return parseStatement$205();
            }
        }
        if (token$462.type !== Token$96.EOF) {
            return parseStatement$205();
        }
    }
    function parseSourceElements$210() {
        var sourceElement$463, sourceElements$464 = [], token$465, directive$466, firstRestricted$467;
        while (index$104 < length$107) {
            token$465 = lookahead$138();
            if (token$465.type !== Token$96.StringLiteral) {
                break;
            }
            sourceElement$463 = parseSourceElement$209();
            sourceElements$464.push(sourceElement$463);
            if (sourceElement$463.expression.type !== Syntax$98.Literal) {
                break;
            }
            directive$466 = sliceSource$114(token$465.range[0] + 1, token$465.range[1] - 1);
            if (directive$466 === 'use strict') {
                strict$103 = true;
                if (firstRestricted$467) {
                    throwError$140(firstRestricted$467, Messages$100.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted$467 && token$465.octal) {
                    firstRestricted$467 = token$465;
                }
            }
        }
        while (index$104 < length$107) {
            sourceElement$463 = parseSourceElement$209();
            if (typeof sourceElement$463 === 'undefined') {
                break;
            }
            sourceElements$464.push(sourceElement$463);
        }
        return sourceElements$464;
    }
    function parseProgram$211() {
        var program$468;
        strict$103 = false;
        program$468 = {
            type: Syntax$98.Program,
            body: parseSourceElements$210()
        };
        return program$468;
    }
    function addComment$212(start$469, end$470, type$471, value$472) {
        assert$112(typeof start$469 === 'number', 'Comment must have valid position');
        if (extra$111.comments.length > 0) {
            if (extra$111.comments[extra$111.comments.length - 1].range[1] > start$469) {
                return;
            }
        }
        extra$111.comments.push({
            range: [
                start$469,
                end$470
            ],
            type: type$471,
            value: value$472
        });
    }
    function scanComment$213() {
        var comment$473, ch$474, start$475, blockComment$476, lineComment$477;
        comment$473 = '';
        blockComment$476 = false;
        lineComment$477 = false;
        while (index$104 < length$107) {
            ch$474 = source$102[index$104];
            if (lineComment$477) {
                ch$474 = nextChar$126();
                if (index$104 >= length$107) {
                    lineComment$477 = false;
                    comment$473 += ch$474;
                    addComment$212(start$475, index$104, 'Line', comment$473);
                } else if (isLineTerminator$119(ch$474)) {
                    lineComment$477 = false;
                    addComment$212(start$475, index$104, 'Line', comment$473);
                    if (ch$474 === '\r' && source$102[index$104] === '\n') {
                        ++index$104;
                    }
                    ++lineNumber$105;
                    lineStart$106 = index$104;
                    comment$473 = '';
                } else {
                    comment$473 += ch$474;
                }
            } else if (blockComment$476) {
                if (isLineTerminator$119(ch$474)) {
                    if (ch$474 === '\r' && source$102[index$104 + 1] === '\n') {
                        ++index$104;
                        comment$473 += '\r\n';
                    } else {
                        comment$473 += ch$474;
                    }
                    ++lineNumber$105;
                    ++index$104;
                    lineStart$106 = index$104;
                    if (index$104 >= length$107) {
                        throwError$140({}, Messages$100.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch$474 = nextChar$126();
                    if (index$104 >= length$107) {
                        throwError$140({}, Messages$100.UnexpectedToken, 'ILLEGAL');
                    }
                    comment$473 += ch$474;
                    if (ch$474 === '*') {
                        ch$474 = source$102[index$104];
                        if (ch$474 === '/') {
                            comment$473 = comment$473.substr(0, comment$473.length - 1);
                            blockComment$476 = false;
                            ++index$104;
                            addComment$212(start$475, index$104, 'Block', comment$473);
                            comment$473 = '';
                        }
                    }
                }
            } else if (ch$474 === '/') {
                ch$474 = source$102[index$104 + 1];
                if (ch$474 === '/') {
                    start$475 = index$104;
                    index$104 += 2;
                    lineComment$477 = true;
                } else if (ch$474 === '*') {
                    start$475 = index$104;
                    index$104 += 2;
                    blockComment$476 = true;
                    if (index$104 >= length$107) {
                        throwError$140({}, Messages$100.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace$118(ch$474)) {
                ++index$104;
            } else if (isLineTerminator$119(ch$474)) {
                ++index$104;
                if (ch$474 === '\r' && source$102[index$104] === '\n') {
                    ++index$104;
                }
                ++lineNumber$105;
                lineStart$106 = index$104;
            } else {
                break;
            }
        }
    }
    function collectToken$214() {
        var token$478 = extra$111.advance(), range$479, value$480;
        if (token$478.type !== Token$96.EOF) {
            range$479 = [
                token$478.range[0],
                token$478.range[1]
            ];
            value$480 = sliceSource$114(token$478.range[0], token$478.range[1]);
            extra$111.tokens.push({
                type: TokenName$97[token$478.type],
                value: value$480,
                lineNumber: lineNumber$105,
                lineStart: lineStart$106,
                range: range$479
            });
        }
        return token$478;
    }
    function collectRegex$215() {
        var pos$481, regex$482, token$483;
        skipComment$128();
        pos$481 = index$104;
        regex$482 = extra$111.scanRegExp();
        if (extra$111.tokens.length > 0) {
            token$483 = extra$111.tokens[extra$111.tokens.length - 1];
            if (token$483.range[0] === pos$481 && token$483.type === 'Punctuator') {
                if (token$483.value === '/' || token$483.value === '/=') {
                    extra$111.tokens.pop();
                }
            }
        }
        extra$111.tokens.push({
            type: 'RegularExpression',
            value: regex$482.literal,
            range: [
                pos$481,
                index$104
            ],
            lineStart: token$483.lineStart,
            lineNumber: token$483.lineNumber
        });
        return regex$482;
    }
    function createLiteral$216(token$484) {
        if (Array.isArray(token$484)) {
            return {
                type: Syntax$98.Literal,
                value: token$484
            };
        }
        return {
            type: Syntax$98.Literal,
            value: token$484.value,
            lineStart: token$484.lineStart,
            lineNumber: token$484.lineNumber
        };
    }
    function createRawLiteral$217(token$485) {
        return {
            type: Syntax$98.Literal,
            value: token$485.value,
            raw: sliceSource$114(token$485.range[0], token$485.range[1]),
            lineStart: token$485.lineStart,
            lineNumber: token$485.lineNumber
        };
    }
    function wrapTrackingFunction$218(range$486, loc$487) {
        return function (parseFunction$488) {
            function isBinary$489(node$491) {
                return node$491.type === Syntax$98.LogicalExpression || node$491.type === Syntax$98.BinaryExpression;
            }
            function visit$490(node$492) {
                if (isBinary$489(node$492.left)) {
                    visit$490(node$492.left);
                }
                if (isBinary$489(node$492.right)) {
                    visit$490(node$492.right);
                }
                if (range$486 && typeof node$492.range === 'undefined') {
                    node$492.range = [
                        node$492.left.range[0],
                        node$492.right.range[1]
                    ];
                }
                if (loc$487 && typeof node$492.loc === 'undefined') {
                    node$492.loc = {
                        start: node$492.left.loc.start,
                        end: node$492.right.loc.end
                    };
                }
            }
            return function () {
                var node$493, rangeInfo$494, locInfo$495;
                var curr$496 = tokenStream$110[index$104].token;
                rangeInfo$494 = [
                    curr$496.range[0],
                    0
                ];
                locInfo$495 = {
                    start: {
                        line: curr$496.lineNumber,
                        column: curr$496.lineStart
                    }
                };
                node$493 = parseFunction$488.apply(null, arguments);
                if (typeof node$493 !== 'undefined') {
                    var last$497 = tokenStream$110[index$104].token;
                    if (range$486) {
                        rangeInfo$494[1] = last$497.range[1];
                        node$493.range = rangeInfo$494;
                    }
                    if (loc$487) {
                        locInfo$495.end = {
                            line: last$497.lineNumber,
                            column: last$497.lineStart
                        };
                        node$493.loc = locInfo$495;
                    }
                    if (isBinary$489(node$493)) {
                        visit$490(node$493);
                    }
                    if (node$493.type === Syntax$98.MemberExpression) {
                        if (typeof node$493.object.range !== 'undefined') {
                            node$493.range[0] = node$493.object.range[0];
                        }
                        if (typeof node$493.object.loc !== 'undefined') {
                            node$493.loc.start = node$493.object.loc.start;
                        }
                    }
                    if (node$493.type === Syntax$98.CallExpression) {
                        if (typeof node$493.callee.range !== 'undefined') {
                            node$493.range[0] = node$493.callee.range[0];
                        }
                        if (typeof node$493.callee.loc !== 'undefined') {
                            node$493.loc.start = node$493.callee.loc.start;
                        }
                    }
                    return node$493;
                }
            };
        };
    }
    function patch$219() {
        var wrapTracking$498;
        if (extra$111.comments) {
            extra$111.skipComment = skipComment$128;
            skipComment$128 = scanComment$213;
        }
        if (extra$111.raw) {
            extra$111.createLiteral = createLiteral$216;
            createLiteral$216 = createRawLiteral$217;
        }
        if (extra$111.range || extra$111.loc) {
            wrapTracking$498 = wrapTrackingFunction$218(extra$111.range, extra$111.loc);
            extra$111.parseAdditiveExpression = parseAdditiveExpression$169;
            extra$111.parseAssignmentExpression = parseAssignmentExpression$179;
            extra$111.parseBitwiseANDExpression = parseBitwiseANDExpression$173;
            extra$111.parseBitwiseORExpression = parseBitwiseORExpression$175;
            extra$111.parseBitwiseXORExpression = parseBitwiseXORExpression$174;
            extra$111.parseBlock = parseBlock$182;
            extra$111.parseFunctionSourceElements = parseFunctionSourceElements$206;
            extra$111.parseCallMember = parseCallMember$160;
            extra$111.parseCatchClause = parseCatchClause$202;
            extra$111.parseComputedMember = parseComputedMember$159;
            extra$111.parseConditionalExpression = parseConditionalExpression$178;
            extra$111.parseConstLetDeclaration = parseConstLetDeclaration$187;
            extra$111.parseEqualityExpression = parseEqualityExpression$172;
            extra$111.parseExpression = parseExpression$180;
            extra$111.parseForVariableDeclaration = parseForVariableDeclaration$193;
            extra$111.parseFunctionDeclaration = parseFunctionDeclaration$207;
            extra$111.parseFunctionExpression = parseFunctionExpression$208;
            extra$111.parseLogicalANDExpression = parseLogicalANDExpression$176;
            extra$111.parseLogicalORExpression = parseLogicalORExpression$177;
            extra$111.parseMultiplicativeExpression = parseMultiplicativeExpression$168;
            extra$111.parseNewExpression = parseNewExpression$161;
            extra$111.parseNonComputedMember = parseNonComputedMember$158;
            extra$111.parseNonComputedProperty = parseNonComputedProperty$157;
            extra$111.parseObjectProperty = parseObjectProperty$153;
            extra$111.parseObjectPropertyKey = parseObjectPropertyKey$152;
            extra$111.parsePostfixExpression = parsePostfixExpression$166;
            extra$111.parsePrimaryExpression = parsePrimaryExpression$155;
            extra$111.parseProgram = parseProgram$211;
            extra$111.parsePropertyFunction = parsePropertyFunction$151;
            extra$111.parseRelationalExpression = parseRelationalExpression$171;
            extra$111.parseStatement = parseStatement$205;
            extra$111.parseShiftExpression = parseShiftExpression$170;
            extra$111.parseSwitchCase = parseSwitchCase$199;
            extra$111.parseUnaryExpression = parseUnaryExpression$167;
            extra$111.parseVariableDeclaration = parseVariableDeclaration$184;
            extra$111.parseVariableIdentifier = parseVariableIdentifier$183;
            parseAdditiveExpression$169 = wrapTracking$498(extra$111.parseAdditiveExpression);
            parseAssignmentExpression$179 = wrapTracking$498(extra$111.parseAssignmentExpression);
            parseBitwiseANDExpression$173 = wrapTracking$498(extra$111.parseBitwiseANDExpression);
            parseBitwiseORExpression$175 = wrapTracking$498(extra$111.parseBitwiseORExpression);
            parseBitwiseXORExpression$174 = wrapTracking$498(extra$111.parseBitwiseXORExpression);
            parseBlock$182 = wrapTracking$498(extra$111.parseBlock);
            parseFunctionSourceElements$206 = wrapTracking$498(extra$111.parseFunctionSourceElements);
            parseCallMember$160 = wrapTracking$498(extra$111.parseCallMember);
            parseCatchClause$202 = wrapTracking$498(extra$111.parseCatchClause);
            parseComputedMember$159 = wrapTracking$498(extra$111.parseComputedMember);
            parseConditionalExpression$178 = wrapTracking$498(extra$111.parseConditionalExpression);
            parseConstLetDeclaration$187 = wrapTracking$498(extra$111.parseConstLetDeclaration);
            parseEqualityExpression$172 = wrapTracking$498(extra$111.parseEqualityExpression);
            parseExpression$180 = wrapTracking$498(extra$111.parseExpression);
            parseForVariableDeclaration$193 = wrapTracking$498(extra$111.parseForVariableDeclaration);
            parseFunctionDeclaration$207 = wrapTracking$498(extra$111.parseFunctionDeclaration);
            parseFunctionExpression$208 = wrapTracking$498(extra$111.parseFunctionExpression);
            parseLogicalANDExpression$176 = wrapTracking$498(extra$111.parseLogicalANDExpression);
            parseLogicalORExpression$177 = wrapTracking$498(extra$111.parseLogicalORExpression);
            parseMultiplicativeExpression$168 = wrapTracking$498(extra$111.parseMultiplicativeExpression);
            parseNewExpression$161 = wrapTracking$498(extra$111.parseNewExpression);
            parseNonComputedMember$158 = wrapTracking$498(extra$111.parseNonComputedMember);
            parseNonComputedProperty$157 = wrapTracking$498(extra$111.parseNonComputedProperty);
            parseObjectProperty$153 = wrapTracking$498(extra$111.parseObjectProperty);
            parseObjectPropertyKey$152 = wrapTracking$498(extra$111.parseObjectPropertyKey);
            parsePostfixExpression$166 = wrapTracking$498(extra$111.parsePostfixExpression);
            parsePrimaryExpression$155 = wrapTracking$498(extra$111.parsePrimaryExpression);
            parseProgram$211 = wrapTracking$498(extra$111.parseProgram);
            parsePropertyFunction$151 = wrapTracking$498(extra$111.parsePropertyFunction);
            parseRelationalExpression$171 = wrapTracking$498(extra$111.parseRelationalExpression);
            parseStatement$205 = wrapTracking$498(extra$111.parseStatement);
            parseShiftExpression$170 = wrapTracking$498(extra$111.parseShiftExpression);
            parseSwitchCase$199 = wrapTracking$498(extra$111.parseSwitchCase);
            parseUnaryExpression$167 = wrapTracking$498(extra$111.parseUnaryExpression);
            parseVariableDeclaration$184 = wrapTracking$498(extra$111.parseVariableDeclaration);
            parseVariableIdentifier$183 = wrapTracking$498(extra$111.parseVariableIdentifier);
        }
        if (typeof extra$111.tokens !== 'undefined') {
            extra$111.advance = advance$136;
            extra$111.scanRegExp = scanRegExp$134;
            advance$136 = collectToken$214;
            scanRegExp$134 = collectRegex$215;
        }
    }
    function unpatch$220() {
        if (typeof extra$111.skipComment === 'function') {
            skipComment$128 = extra$111.skipComment;
        }
        if (extra$111.raw) {
            createLiteral$216 = extra$111.createLiteral;
        }
        if (extra$111.range || extra$111.loc) {
            parseAdditiveExpression$169 = extra$111.parseAdditiveExpression;
            parseAssignmentExpression$179 = extra$111.parseAssignmentExpression;
            parseBitwiseANDExpression$173 = extra$111.parseBitwiseANDExpression;
            parseBitwiseORExpression$175 = extra$111.parseBitwiseORExpression;
            parseBitwiseXORExpression$174 = extra$111.parseBitwiseXORExpression;
            parseBlock$182 = extra$111.parseBlock;
            parseFunctionSourceElements$206 = extra$111.parseFunctionSourceElements;
            parseCallMember$160 = extra$111.parseCallMember;
            parseCatchClause$202 = extra$111.parseCatchClause;
            parseComputedMember$159 = extra$111.parseComputedMember;
            parseConditionalExpression$178 = extra$111.parseConditionalExpression;
            parseConstLetDeclaration$187 = extra$111.parseConstLetDeclaration;
            parseEqualityExpression$172 = extra$111.parseEqualityExpression;
            parseExpression$180 = extra$111.parseExpression;
            parseForVariableDeclaration$193 = extra$111.parseForVariableDeclaration;
            parseFunctionDeclaration$207 = extra$111.parseFunctionDeclaration;
            parseFunctionExpression$208 = extra$111.parseFunctionExpression;
            parseLogicalANDExpression$176 = extra$111.parseLogicalANDExpression;
            parseLogicalORExpression$177 = extra$111.parseLogicalORExpression;
            parseMultiplicativeExpression$168 = extra$111.parseMultiplicativeExpression;
            parseNewExpression$161 = extra$111.parseNewExpression;
            parseNonComputedMember$158 = extra$111.parseNonComputedMember;
            parseNonComputedProperty$157 = extra$111.parseNonComputedProperty;
            parseObjectProperty$153 = extra$111.parseObjectProperty;
            parseObjectPropertyKey$152 = extra$111.parseObjectPropertyKey;
            parsePrimaryExpression$155 = extra$111.parsePrimaryExpression;
            parsePostfixExpression$166 = extra$111.parsePostfixExpression;
            parseProgram$211 = extra$111.parseProgram;
            parsePropertyFunction$151 = extra$111.parsePropertyFunction;
            parseRelationalExpression$171 = extra$111.parseRelationalExpression;
            parseStatement$205 = extra$111.parseStatement;
            parseShiftExpression$170 = extra$111.parseShiftExpression;
            parseSwitchCase$199 = extra$111.parseSwitchCase;
            parseUnaryExpression$167 = extra$111.parseUnaryExpression;
            parseVariableDeclaration$184 = extra$111.parseVariableDeclaration;
            parseVariableIdentifier$183 = extra$111.parseVariableIdentifier;
        }
        if (typeof extra$111.scanRegExp === 'function') {
            advance$136 = extra$111.advance;
            scanRegExp$134 = extra$111.scanRegExp;
        }
    }
    function stringToArray$221(str$499) {
        var length$500 = str$499.length, result$501 = [], i$502;
        for (i$502 = 0; i$502 < length$500; ++i$502) {
            result$501[i$502] = str$499.charAt(i$502);
        }
        return result$501;
    }
    function blockAllowed$222(toks$503, start$504, inExprDelim$505, parentIsBlock$506) {
        var assignOps$507 = [
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
        var binaryOps$508 = [
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
        var unaryOps$509 = [
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
        function back$510(n$511) {
            var idx$512 = toks$503.length - n$511 > 0 ? toks$503.length - n$511 : 0;
            return toks$503[idx$512];
        }
        if (inExprDelim$505 && toks$503.length - (start$504 + 2) <= 0) {
            return false;
        } else if (back$510(start$504 + 2).value === ':' && parentIsBlock$506) {
            return true;
        } else if (isIn$113(back$510(start$504 + 2).value, unaryOps$509.concat(binaryOps$508).concat(assignOps$507))) {
            return false;
        } else if (back$510(start$504 + 2).value === 'return') {
            var currLineNumber$513 = typeof back$510(start$504 + 1).startLineNumber !== 'undefined' ? back$510(start$504 + 1).startLineNumber : back$510(start$504 + 1).lineNumber;
            if (back$510(start$504 + 2).lineNumber !== currLineNumber$513) {
                return true;
            } else {
                return false;
            }
        } else if (isIn$113(back$510(start$504 + 2).value, [
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
    function readToken$223(toks$514, inExprDelim$515, parentIsBlock$516) {
        var delimiters$517 = [
                '(',
                '{',
                '['
            ];
        var parenIdents$518 = [
                'if',
                'while',
                'for',
                'with'
            ];
        var last$519 = toks$514.length - 1;
        function back$520(n$521) {
            var idx$522 = toks$514.length - n$521 > 0 ? toks$514.length - n$521 : 0;
            return toks$514[idx$522];
        }
        skipComment$128();
        if (isIn$113(getChar$127(), delimiters$517)) {
            return readDelim$224(toks$514, inExprDelim$515, parentIsBlock$516);
        }
        if (getChar$127() === '/') {
            var prev$523 = back$520(1);
            if (prev$523) {
                if (prev$523.value === '()') {
                    if (isIn$113(back$520(2).value, parenIdents$518)) {
                        return scanRegExp$134();
                    }
                    return advance$136();
                }
                if (prev$523.value === '{}') {
                    if (blockAllowed$222(toks$514, 0, inExprDelim$515, parentIsBlock$516)) {
                        if (back$520(2).value === '()') {
                            if (back$520(4).value === 'function') {
                                if (!blockAllowed$222(toks$514, 3, inExprDelim$515, parentIsBlock$516)) {
                                    return advance$136();
                                }
                                if (toks$514.length - 5 <= 0 && inExprDelim$515) {
                                    return advance$136();
                                }
                            }
                            if (back$520(3).value === 'function') {
                                if (!blockAllowed$222(toks$514, 2, inExprDelim$515, parentIsBlock$516)) {
                                    return advance$136();
                                }
                                if (toks$514.length - 4 <= 0 && inExprDelim$515) {
                                    return advance$136();
                                }
                            }
                        }
                        return scanRegExp$134();
                    } else {
                        return advance$136();
                    }
                }
                if (prev$523.type === Token$96.Punctuator) {
                    return scanRegExp$134();
                }
                if (isKeyword$125(prev$523.value)) {
                    return scanRegExp$134();
                }
                return advance$136();
            }
            return scanRegExp$134();
        }
        return advance$136();
    }
    function readDelim$224(toks$524, inExprDelim$525, parentIsBlock$526) {
        var startDelim$527 = advance$136(), matchDelim$528 = {
                '(': ')',
                '{': '}',
                '[': ']'
            }, inner$529 = [];
        var delimiters$530 = [
                '(',
                '{',
                '['
            ];
        assert$112(delimiters$530.indexOf(startDelim$527.value) !== -1, 'Need to begin at the delimiter');
        var token$531 = startDelim$527;
        var startLineNumber$532 = token$531.lineNumber;
        var startLineStart$533 = token$531.lineStart;
        var startRange$534 = token$531.range;
        var delimToken$535 = {};
        delimToken$535.type = Token$96.Delimiter;
        delimToken$535.value = startDelim$527.value + matchDelim$528[startDelim$527.value];
        delimToken$535.startLineNumber = startLineNumber$532;
        delimToken$535.startLineStart = startLineStart$533;
        delimToken$535.startRange = startRange$534;
        var delimIsBlock$536 = false;
        if (startDelim$527.value === '{') {
            delimIsBlock$536 = blockAllowed$222(toks$524.concat(delimToken$535), 0, inExprDelim$525, parentIsBlock$526);
        }
        while (index$104 <= length$107) {
            token$531 = readToken$223(inner$529, startDelim$527.value === '(' || startDelim$527.value === '[', delimIsBlock$536);
            if (token$531.type === Token$96.Punctuator && token$531.value === matchDelim$528[startDelim$527.value]) {
                break;
            } else if (token$531.type === Token$96.EOF) {
                throwError$140({}, Messages$100.UnexpectedEOS);
            } else {
                inner$529.push(token$531);
            }
        }
        if (index$104 >= length$107 && matchDelim$528[startDelim$527.value] !== source$102[length$107 - 1]) {
            throwError$140({}, Messages$100.UnexpectedEOS);
        }
        var endLineNumber$537 = token$531.lineNumber;
        var endLineStart$538 = token$531.lineStart;
        var endRange$539 = token$531.range;
        delimToken$535.inner = inner$529;
        delimToken$535.endLineNumber = endLineNumber$537;
        delimToken$535.endLineStart = endLineStart$538;
        delimToken$535.endRange = endRange$539;
        return delimToken$535;
    }
    ;
    function read$225(code$540) {
        var token$541, tokenTree$542 = [];
        extra$111 = {};
        extra$111.comments = [];
        patch$219();
        source$102 = code$540;
        index$104 = 0;
        lineNumber$105 = source$102.length > 0 ? 1 : 0;
        lineStart$106 = 0;
        length$107 = source$102.length;
        buffer$108 = null;
        state$109 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        while (index$104 < length$107) {
            tokenTree$542.push(readToken$223(tokenTree$542, false, false));
        }
        var last$543 = tokenTree$542[tokenTree$542.length - 1];
        if (last$543 && last$543.type !== Token$96.EOF) {
            tokenTree$542.push({
                type: Token$96.EOF,
                value: '',
                lineNumber: last$543.lineNumber,
                lineStart: last$543.lineStart,
                range: [
                    index$104,
                    index$104
                ]
            });
        }
        return [
            expander$95.tokensToSyntax(tokenTree$542),
            extra$111.comments
        ];
    }
    function parse$226(code$544, comments$545) {
        var program$546, toString$547;
        tokenStream$110 = code$544;
        index$104 = 0;
        length$107 = tokenStream$110.length;
        buffer$108 = null;
        state$109 = {
            allowIn: true,
            labelSet: {},
            lastParenthesized: null,
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };
        try {
            program$546 = parseProgram$211();
            program$546.comments = comments$545;
            program$546.tokens = expander$95.syntaxToTokens(code$544);
        } catch (e$548) {
            throw e$548;
        } finally {
            unpatch$220();
            extra$111 = {};
        }
        return program$546;
    }
    exports$94.parse = parse$226;
    exports$94.read = read$225;
    exports$94.Token = Token$96;
    exports$94.assert = assert$112;
    exports$94.Syntax = function () {
        var name$549, types$550 = {};
        if (typeof Object.create === 'function') {
            types$550 = Object.create(null);
        }
        for (name$549 in Syntax$98) {
            if (Syntax$98.hasOwnProperty(name$549)) {
                types$550[name$549] = Syntax$98[name$549];
            }
        }
        if (typeof Object.freeze === 'function') {
            Object.freeze(types$550);
        }
        return types$550;
    }();
}));