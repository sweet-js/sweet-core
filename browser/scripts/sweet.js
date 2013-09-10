(function (root$91, factory$92) {
    if (typeof exports === 'object') {
        var parser$93 = require('./parser');
        var expander$94 = require('./expander');
        var codegen$95 = require('escodegen');
        var path$96 = require('path');
        var fs$97 = require('fs');
        var lib$98 = path$96.join(path$96.dirname(fs$97.realpathSync(__filename)), '../macros');
        var stxcaseModule$99 = fs$97.readFileSync(lib$98 + '/stxcase.js', 'utf8');
        factory$92(exports, parser$93, expander$94, stxcaseModule$99, codegen$95);
        require.extensions['.sjs'] = function (module$100, filename$101) {
            var content$102 = require('fs').readFileSync(filename$101, 'utf8');
            module$100._compile(codegen$95.generate(exports.parse(content$102)), filename$101);
        };
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            './parser',
            './expander',
            'text!./stxcase.js'
        ], factory$92);
    }
}(this, function (exports$103, parser$104, expander$105, stxcaseModule$106, gen$107) {
    var codegen$108 = gen$107 || escodegen;
    function expand$109(code$112) {
        var program$113, toString$114;
        toString$114 = String;
        if (typeof code$112 !== 'string' && !(code$112 instanceof String)) {
            code$112 = toString$114(code$112);
        }
        var source$115 = code$112;
        if (source$115.length > 0) {
            if (typeof source$115[0] === 'undefined') {
                if (code$112 instanceof String) {
                    source$115 = code$112.valueOf();
                }
                if (typeof source$115[0] === 'undefined') {
                    source$115 = stringToArray(code$112);
                }
            }
        }
        source$115 = stxcaseModule$106 + '\n\n' + source$115;
        var readTree$116 = parser$104.read(source$115);
        return [
            expander$105.expand(readTree$116[0]),
            readTree$116[1]
        ];
    }
    function parse$110(code$117) {
        var exp$118 = expand$109(code$117);
        return parser$104.parse(exp$118[0], exp$118[1]);
    }
    exports$103.expand = expand$109;
    exports$103.parse = parse$110;
    exports$103.compile = function compile$111(code$119) {
        var ast$120 = parse$110(code$119);
        var output$121 = codegen$108.generate(ast$120, { comment: true });
        return output$121;
    };
}));