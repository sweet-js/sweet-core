var fs$2099 = require('fs');
var path$2100 = require('path');
var sweet$2101 = require('./sweet.js');
var argv$2102 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').argv;
exports.run = function () {
    var infile$2103 = argv$2102._[0];
    var outfile$2104 = argv$2102.output;
    var watch$2105 = argv$2102.watch;
    var tokens$2106 = argv$2102.tokens;
    var sourcemap$2107 = argv$2102.sourcemap;
    var noparse$2108 = argv$2102['no-parse'];
    var file$2109;
    var globalMacros$2110;
    if (infile$2103) {
        file$2109 = fs$2099.readFileSync(infile$2103, 'utf8');
    } else if (argv$2102.stdin) {
        file$2109 = fs$2099.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$2102._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$2111 = argv$2102.module;
    var cwd$2112 = process.cwd();
    var Module$2113 = module.constructor;
    var modulemock$2114;
    if (mod$2111) {
        modulemock$2114 = {
            id: cwd$2112 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$2112) ? [cwd$2112] : Module$2113._nodeModulePaths(cwd$2112)
        };
        if (typeof mod$2111 === 'string') {
            mod$2111 = [mod$2111];
        }
        globalMacros$2110 = mod$2111.reduceRight(function (f$2115, m$2116) {
            var modulepath$2117 = Module$2113._resolveFilename(m$2116, modulemock$2114);
            var modulefile$2118 = fs$2099.readFileSync(modulepath$2117, 'utf8');
            return modulefile$2118 + '\n' + f$2115;
        }, '');
    }
    if (watch$2105 && outfile$2104) {
        fs$2099.watch(infile$2103, function () {
            file$2109 = fs$2099.readFileSync(infile$2103, 'utf8');
            try {
                fs$2099.writeFileSync(outfile$2104, sweet$2101.compile(file$2109, { macros: globalMacros$2110 }).code, 'utf8');
            } catch (e$2119) {
                console.log(e$2119);
            }
        });
    } else if (outfile$2104) {
        if (sourcemap$2107) {
            var result$2120 = sweet$2101.compile(file$2109, {
                    sourceMap: true,
                    filename: infile$2103,
                    macros: globalMacros$2110
                });
            var mapfile$2121 = path$2100.basename(outfile$2104) + '.map';
            fs$2099.writeFileSync(outfile$2104, result$2120.code + '\n//# sourceMappingURL=' + mapfile$2121, 'utf8');
            fs$2099.writeFileSync(outfile$2104 + '.map', result$2120.sourceMap, 'utf8');
        } else {
            fs$2099.writeFileSync(outfile$2104, sweet$2101.compile(file$2109).code, 'utf8');
        }
    } else if (tokens$2106) {
        console.log(sweet$2101.expand(file$2109, globalMacros$2110));
    } else if (noparse$2108) {
        var unparsedString$2122 = sweet$2101.expand(file$2109, globalMacros$2110).reduce(function (acc$2123, stx$2124) {
                return acc$2123 + ' ' + stx$2124.token.value;
            }, '');
        console.log(unparsedString$2122);
    } else {
        console.log(sweet$2101.compile(file$2109, { macros: globalMacros$2110 }).code);
    }
};
//# sourceMappingURL=sjs.js.map