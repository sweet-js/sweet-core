var fs$2061 = require('fs');
var path$2062 = require('path');
var sweet$2063 = require('./sweet.js');
var argv$2064 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').argv;
exports.run = function () {
    var infile$2065 = argv$2064._[0];
    var outfile$2066 = argv$2064.output;
    var watch$2067 = argv$2064.watch;
    var tokens$2068 = argv$2064.tokens;
    var sourcemap$2069 = argv$2064.sourcemap;
    var noparse$2070 = argv$2064['no-parse'];
    var file$2071;
    var globalMacros$2072;
    if (infile$2065) {
        file$2071 = fs$2061.readFileSync(infile$2065, 'utf8');
    } else if (argv$2064.stdin) {
        file$2071 = fs$2061.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$2064._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$2073 = argv$2064.module;
    var cwd$2074 = process.cwd();
    var Module$2075 = module.constructor;
    var modulemock$2076;
    if (mod$2073) {
        modulemock$2076 = {
            id: cwd$2074 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$2074) ? [cwd$2074] : Module$2075._nodeModulePaths(cwd$2074)
        };
        if (typeof mod$2073 === 'string') {
            mod$2073 = [mod$2073];
        }
        globalMacros$2072 = mod$2073.reduceRight(function (f$2077, m$2078) {
            var modulepath$2079 = Module$2075._resolveFilename(m$2078, modulemock$2076);
            var modulefile$2080 = fs$2061.readFileSync(modulepath$2079, 'utf8');
            return modulefile$2080 + '\n' + f$2077;
        }, '');
    }
    if (watch$2067 && outfile$2066) {
        fs$2061.watch(infile$2065, function () {
            file$2071 = fs$2061.readFileSync(infile$2065, 'utf8');
            try {
                fs$2061.writeFileSync(outfile$2066, sweet$2063.compile(file$2071, { macros: globalMacros$2072 }).code, 'utf8');
            } catch (e$2081) {
                console.log(e$2081);
            }
        });
    } else if (outfile$2066) {
        if (sourcemap$2069) {
            var result$2082 = sweet$2063.compile(file$2071, {
                    sourceMap: true,
                    filename: infile$2065,
                    macros: globalMacros$2072
                });
            var mapfile$2083 = path$2062.basename(outfile$2066) + '.map';
            fs$2061.writeFileSync(outfile$2066, result$2082.code + '\n//# sourceMappingURL=' + mapfile$2083, 'utf8');
            fs$2061.writeFileSync(outfile$2066 + '.map', result$2082.sourceMap, 'utf8');
        } else {
            fs$2061.writeFileSync(outfile$2066, sweet$2063.compile(file$2071).code, 'utf8');
        }
    } else if (tokens$2068) {
        console.log(sweet$2063.expand(file$2071, globalMacros$2072));
    } else if (noparse$2070) {
        var unparsedString$2084 = sweet$2063.expand(file$2071, globalMacros$2072).reduce(function (acc$2085, stx$2086) {
                return acc$2085 + ' ' + stx$2086.token.value;
            }, '');
        console.log(unparsedString$2084);
    } else {
        console.log(sweet$2063.compile(file$2071, { macros: globalMacros$2072 }).code);
    }
};
//# sourceMappingURL=sjs.js.map