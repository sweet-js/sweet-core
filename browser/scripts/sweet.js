(function (root$84, factory$85) {
    if (typeof exports === 'object') {
        var parser$86 = require('./parser');
        var expander$87 = require('./expander');
        var codegen$88 = require('escodegen');
        var path$89 = require('path');
        var fs$90 = require('fs');
        var lib$91 = path$89.join(path$89.dirname(fs$90.realpathSync(__filename)), '../macros');
        var stxcaseModule$92 = fs$90.readFileSync(lib$91 + '/stxcase.js', 'utf8');
        factory$85(exports, parser$86, expander$87, codegen$88, stxcaseModule$92, require('./es6-module-loader'));
        require.extensions['.sjs'] = function (module$93, filename$94) {
            var content$95 = require('fs').readFileSync(filename$94, 'utf8');
            module$93._compile(codegen$88.generate(exports.parse(content$95)), filename$94);
        };
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            './parser',
            './expander',
            './escodegen',
            'text!./stxcase.js',
            'es6-module-loader'
        ], factory$85);
    }
}(this, function (exports$96, parser$97, expander$98, codegen$99, stxcaseModule$100, moduleLoader$101) {
    var Loader$102 = moduleLoader$101.Loader;
    var Module$103 = moduleLoader$101.Module;
    var System$104 = moduleLoader$101.System;
    function expand$105(code$108, options$109) {
        var program$110, toString$111;
        toString$111 = String;
        if (typeof code$108 !== 'string' && !(code$108 instanceof String)) {
            code$108 = toString$111(code$108);
        }
        var source$112 = code$108;
        if (source$112.length > 0) {
            if (typeof source$112[0] === 'undefined') {
                if (code$108 instanceof String) {
                    source$112 = code$108.valueOf();
                }
                if (typeof source$112[0] === 'undefined') {
                    source$112 = stringToArray(code$108);
                }
            }
        }
        source$112 = stxcaseModule$100 + '\n\n' + source$112;
        var readTree$113 = parser$97.read(source$112);
        return expander$98.expand(readTree$113);
    }
    function parse$106(code$114, options$115) {
        return parser$97.parse(expand$105(code$114, options$115));
    }
    exports$96.module = function (file$116) {
        System$104.import(file$116);
    };
    exports$96.expand = expand$105;
    exports$96.parse = parse$106;
    exports$96.compile = function compile$107(code$117, options$118) {
        return codegen$99.generate(parse$106(code$117, options$118));
    };
}));