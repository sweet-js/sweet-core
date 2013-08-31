(function (root$82, factory$83) {
    if (typeof exports === 'object') {
        var parser$84 = require('./parser');
        var expander$85 = require('./expander');
        var codegen$86 = require('escodegen');
        var path$87 = require('path');
        var fs$88 = require('fs');
        var lib$89 = path$87.join(path$87.dirname(fs$88.realpathSync(__filename)), '../macros');
        var stxcaseModule$90 = fs$88.readFileSync(lib$89 + '/stxcase.js', 'utf8');
        factory$83(exports, parser$84, expander$85, codegen$86, stxcaseModule$90, require('./es6-module-loader'));
        require.extensions['.sjs'] = function (module$91, filename$92) {
            var content$93 = require('fs').readFileSync(filename$92, 'utf8');
            module$91._compile(codegen$86.generate(exports.parse(content$93)), filename$92);
        };
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            './parser',
            './expander',
            './escodegen',
            'text!./stxcase.js',
            'es6-module-loader'
        ], factory$83);
    }
}(this, function (exports$94, parser$95, expander$96, codegen$97, stxcaseModule$98, moduleLoader$99) {
    var Loader$100 = moduleLoader$99.Loader;
    var Module$101 = moduleLoader$99.Module;
    var System$102 = moduleLoader$99.System;
    function expand$103(code$104, options$105) {
        var program$106, toString$107;
        toString$107 = String;
        if (typeof code$104 !== 'string' && !(code$104 instanceof String)) {
            code$104 = toString$107(code$104);
        }
        var source$108 = code$104;
        if (source$108.length > 0) {
            if (typeof source$108[0] === 'undefined') {
                if (code$104 instanceof String) {
                    source$108 = code$104.valueOf();
                }
                if (typeof source$108[0] === 'undefined') {
                    source$108 = stringToArray(code$104);
                }
            }
        }
        source$108 = stxcaseModule$98 + '\n\n' + source$108;
        var readTree$109 = parser$95.read(source$108);
        return expander$96.expand(readTree$109);
    }
    function parse$110(code$111, options$112) {
        return parser$95.parse(expand$103(code$111, options$112));
    }
    exports$94.module = function (file$113) {
        System$102.import(file$113);
    };
    exports$94.expand = expand$103;
    exports$94.parse = parse$110;
    exports$94.compile = function compile$114(code$115, options$116) {
        return codegen$97.generate(parse$110(code$115, options$116));
    };
}));