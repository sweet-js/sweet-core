(function (root$92, factory$93) {
    if (typeof exports === 'object') {
        var parser$94 = require('./parser');
        var expander$95 = require('./expander');
        var codegen$96 = require('escodegen');
        var path$97 = require('path');
        var fs$98 = require('fs');
        var lib$99 = path$97.join(path$97.dirname(fs$98.realpathSync(__filename)), '../macros');
        var stxcaseModule$100 = fs$98.readFileSync(lib$99 + '/stxcase.js', 'utf8');
        factory$93(exports, parser$94, expander$95, stxcaseModule$100, codegen$96);
        require.extensions['.sjs'] = function (module$101, filename$102) {
            var content$103 = require('fs').readFileSync(filename$102, 'utf8');
            module$101._compile(codegen$96.generate(exports.parse(content$103)), filename$102);
        };
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            './parser',
            './expander',
            'text!./stxcase.js'
        ], factory$93);
    }
}(this, function (exports$104, parser$105, expander$106, stxcaseModule$107, gen$108) {
    var codegen$109 = gen$108 || escodegen;
    function expand$110(code$113) {
        var program$114, toString$115;
        toString$115 = String;
        if (typeof code$113 !== 'string' && !(code$113 instanceof String)) {
            code$113 = toString$115(code$113);
        }
        var source$116 = code$113;
        if (source$116.length > 0) {
            if (typeof source$116[0] === 'undefined') {
                if (code$113 instanceof String) {
                    source$116 = code$113.valueOf();
                }
                if (typeof source$116[0] === 'undefined') {
                    source$116 = stringToArray(code$113);
                }
            }
        }
        source$116 = stxcaseModule$107 + '\n\n' + source$116;
        var readTree$117 = parser$105.read(source$116);
        return [
            expander$106.expand(readTree$117[0]),
            readTree$117[1]
        ];
    }
    function parse$111(code$118) {
        var exp$119 = expand$110(code$118);
        return parser$105.parse(exp$119[0], exp$119[1]);
    }
    exports$104.expand = expand$110;
    exports$104.parse = parse$111;
    exports$104.compile = function compile$112(code$120) {
        var ast$121 = parse$111(code$120);
        var output$122 = codegen$109.generate(ast$121, { comment: true });
        return output$122;
    };
}));