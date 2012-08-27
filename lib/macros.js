var _ = require('underscore');
var Contracts = require('contracts.js');
exports = Contracts.exports('Macros', exports);
Contracts.autoload();
var CToken = object({
        type: Num,
        value: or(Str, Num),
        inner: opt(arr([
            ___(CToken)
        ])),
        lineNumber: Num,
        lineStart: Num
    });
var CSyntax = object({
        token: CToken,
        context: object({
            name: Str
        })
    });
exports.tokensToSyntax = guard(fun(arr([
    ___(CToken)
]), arr([
    ___(CSyntax)
])), function mkSyntax(tokens) {
    return _.map(tokens, function (token) {
        return {
            token: token,
            context: {
                name: '<dot>'
            }
        };
    });
});