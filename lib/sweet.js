(function (root$49, factory$50) {
    if (typeof exports === 'object') {
        var parser$51 = require('./parser');
        var expander$52 = require('./expander');
        var codegen$53 = require('escodegen');
        var path$54 = require('path');
        var fs$55 = require('fs');
        var lib$56 = path$54.join(path$54.dirname(fs$55.realpathSync(__filename)), '../macros');
        var stxcaseModule$57 = fs$55.readFileSync(lib$56 + '/stxcase.js', 'utf8');
        factory$50(exports, parser$51, expander$52, codegen$53, stxcaseModule$57, require('./es6-module-loader'));
        require.extensions['.sjs'] = function (module$58, filename$59) {
            var content$60 = require('fs').readFileSync(filename$59, 'utf8');
            module$58._compile(codegen$53.generate(exports.parse(content$60)), filename$59);
        };
    } else if (typeof define === 'function' && define.amd) {
        define([
            'exports',
            './parser',
            './expander',
            './escodegen',
            'text!./stxcase.js',
            'es6-module-loader'
        ], factory$50);
    }
}(this, function (exports$61, parser$62, expander$63, codegen$64, stxcaseModule$65, moduleLoader$66) {
    var Loader$67 = moduleLoader$66.Loader;
    var Module$68 = moduleLoader$66.Module;
    var System$69 = moduleLoader$66.System;
    function expand$70(code$71, options$72) {
        var program$73, toString$74;
        toString$74 = String;
        if (typeof code$71 !== 'string' && !(code$71 instanceof String)) {
            code$71 = toString$74(code$71);
        }
        var source$75 = code$71;
        if (source$75.length > 0) {
            if (typeof source$75[0] === 'undefined') {
                if (code$71 instanceof String) {
                    source$75 = code$71.valueOf();
                }
                if (typeof source$75[0] === 'undefined') {
                    source$75 = stringToArray(code$71);
                }
            }
        }
        source$75 = stxcaseModule$65 + '\n\n' + source$75;
        var readTree$76 = parser$62.read(source$75);
        return expander$63.expand(readTree$76);
    }
    function parse$77(code$78, options$79) {
        return parser$62.parse(expand$70(code$78, options$79));
    }
    exports$61.module = function (file$80) {
        System$69.import(file$80);
    };
    exports$61.expand = expand$70;
    exports$61.parse = parse$77;
    exports$61.compile = function compile$81(code$82, options$83) {
        return codegen$64.generate(parse$77(code$82, options$83));
    };
}));