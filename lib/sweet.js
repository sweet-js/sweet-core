(function (root$93, factory$94) {
    if (typeof exports === 'object') {
        var parser$95 = require('./parser');
        var expander$96 = require('./expander');
        var codegen$97 = require('escodegen');
        var path$98 = require('path');
        var fs$99 = require('fs');
        var lib$100 = path$98.join(path$98.dirname(fs$99.realpathSync(__filename)), '../macros');
        var stxcaseModule$101 = fs$99.readFileSync(lib$100 + '/stxcase.js', 'utf8');
        factory$94(exports, parser$95, expander$96, stxcaseModule$101, codegen$97);
        require.extensions['.sjs'] = function (module$102, filename$103) {
            var content$104 = require('fs').readFileSync(filename$103, 'utf8');
            module$102._compile(codegen$97.generate(exports.parse(content$104)), filename$103);
        };
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            './parser',
            './expander',
            'text!./stxcase.js'
        ], factory$94);
    }
}(this, function (exports$105, parser$106, expander$107, stxcaseModule$108, gen$109) {
    var codegen$110 = gen$109 || escodegen;
    function expand$111(code$114) {
        var program$115, toString$116;
        toString$116 = String;
        if (typeof code$114 !== 'string' && !(code$114 instanceof String)) {
            code$114 = toString$116(code$114);
        }
        var source$117 = code$114;
        if (source$117.length > 0) {
            if (typeof source$117[0] === 'undefined') {
                if (code$114 instanceof String) {
                    source$117 = code$114.valueOf();
                }
                if (typeof source$117[0] === 'undefined') {
                    source$117 = stringToArray(code$114);
                }
            }
        }
        source$117 = stxcaseModule$108 + '\n\n' + source$117;
        var readTree$118 = parser$106.read(source$117);
        return [
            expander$107.expand(readTree$118[0]),
            readTree$118[1]
        ];
    }
    function parse$112(code$119) {
        var exp$120 = expand$111(code$119);
        return parser$106.parse(exp$120[0], exp$120[1]);
    }
    exports$105.expand = expand$111;
    exports$105.parse = parse$112;
    exports$105.compile = function compile$113(code$121) {
        var ast$122 = parse$112(code$121);
        codegen$110.attachComments(ast$122, ast$122.comments, ast$122.tokens);
        var output$123 = codegen$110.generate(ast$122, { comment: true });
        return output$123;
    };
}));