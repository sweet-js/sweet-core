(function (root$90, factory$91) {
    if (typeof exports === 'object') {
        var parser$92 = require('./parser');
        var expander$93 = require('./expander');
        var codegen$94 = require('escodegen');
        var path$95 = require('path');
        var fs$96 = require('fs');
        var lib$97 = path$95.join(path$95.dirname(fs$96.realpathSync(__filename)), '../macros');
        var stxcaseModule$98 = fs$96.readFileSync(lib$97 + '/stxcase.js', 'utf8');
        factory$91(exports, parser$92, expander$93, codegen$94, stxcaseModule$98, require('./es6-module-loader'));
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
            'text!./stxcase.js',
            'es6-module-loader'
        ], factory$91);
    }
}(this, function (exports$102, parser$103, expander$104, codegen$105, stxcaseModule$106, moduleLoader$107) {
    var Loader$108 = moduleLoader$107.Loader;
    var Module$109 = moduleLoader$107.Module;
    var System$110 = moduleLoader$107.System;
    function expand$111(code$114, options$115) {
        var program$116, toString$117;
        toString$117 = String;
        if (typeof code$114 !== 'string' && !(code$114 instanceof String)) {
            code$114 = toString$117(code$114);
        }
        var source$118 = code$114;
        if (source$118.length > 0) {
            if (typeof source$118[0] === 'undefined') {
                if (code$114 instanceof String) {
                    source$118 = code$114.valueOf();
                }
                if (typeof source$118[0] === 'undefined') {
                    source$118 = stringToArray(code$114);
                }
            }
        }
        source$118 = stxcaseModule$106 + '\n\n' + source$118;
        var readTree$119 = parser$103.read(source$118);
        return expander$104.expand(readTree$119);
    }
    function parse$112(code$120, options$121) {
        return parser$103.parse(expand$111(code$120, options$121));
    }
    exports$102.module = function (file$122) {
        System$110.import(file$122);
    };
    exports$102.expand = expand$111;
    exports$102.parse = parse$112;
    exports$102.compile = function compile$113(code$123, options$124) {
        return codegen$105.generate(parse$112(code$123, options$124));
    };
}));