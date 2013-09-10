(function (root$90, factory$91) {
    if (typeof exports === 'object') {
        var parser$92 = require('./parser');
        var expander$93 = require('./expander');
        var codegen$94 = require('escodegen');
        var path$95 = require('path');
        var fs$96 = require('fs');
        var lib$97 = path$95.join(path$95.dirname(fs$96.realpathSync(__filename)), '../macros');
        var stxcaseModule$98 = fs$96.readFileSync(lib$97 + '/stxcase.js', 'utf8');
        factory$91(exports, parser$92, expander$93, codegen$94, stxcaseModule$98);
        require.extensions['.sjs'] = function (module$99, filename$100) {
            var content$101 = require('fs').readFileSync(filename$100, 'utf8');
            module$99._compile(codegen$94.generate(exports.parse(content$101)), filename$100);
        };
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            './parser',
            './expander',
            './escodegen',
            'text!./stxcase.js'
        ], factory$91);
    }
}(this, function (exports$102, parser$103, expander$104, codegen$105, stxcaseModule$106) {
    function expand$107(code$110, options$111) {
        var program$112, toString$113;
        toString$113 = String;
        if (typeof code$110 !== 'string' && !(code$110 instanceof String)) {
            code$110 = toString$113(code$110);
        }
        var source$114 = code$110;
        if (source$114.length > 0) {
            if (typeof source$114[0] === 'undefined') {
                if (code$110 instanceof String) {
                    source$114 = code$110.valueOf();
                }
                if (typeof source$114[0] === 'undefined') {
                    source$114 = stringToArray(code$110);
                }
            }
        }
        source$114 = stxcaseModule$106 + '\n\n' + source$114;
        var readTree$115 = parser$103.read(source$114);
        return expander$104.expand(readTree$115);
    }
    function parse$108(code$116, options$117) {
        return parser$103.parse(expand$107(code$116, options$117));
    }
    exports$102.expand = expand$107;
    exports$102.parse = parse$108;
    exports$102.compile = function compile$109(code$118, options$119) {
        return codegen$105.generate(parse$108(code$118, options$119));
    };
}));