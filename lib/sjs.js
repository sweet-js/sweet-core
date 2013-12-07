var fs$1879 = require('fs');
var path$1880 = require('path');
var sweet$1881 = require('./sweet.js');
var argv$1882 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').argv;
exports.run = function () {
    var infile$1883 = argv$1882._[0];
    var outfile$1884 = argv$1882.output;
    var watch$1885 = argv$1882.watch;
    var tokens$1886 = argv$1882.tokens;
    var sourcemap$1887 = argv$1882.sourcemap;
    var noparse$1888 = argv$1882['no-parse'];
    var file$1889;
    var globalMacros$1890;
    if (infile$1883) {
        file$1889 = fs$1879.readFileSync(infile$1883, 'utf8');
    } else if (argv$1882.stdin) {
        file$1889 = fs$1879.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$1882._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$1891 = argv$1882.module;
    var cwd$1892 = process.cwd();
    var Module$1893 = module.constructor;
    var modulemock$1894;
    if (mod$1891) {
        modulemock$1894 = {
            id: cwd$1892 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$1892) ? [cwd$1892] : Module$1893._nodeModulePaths(cwd$1892)
        };
        if (typeof mod$1891 === 'string') {
            mod$1891 = [mod$1891];
        }
        globalMacros$1890 = mod$1891.reduceRight(function (f$1895, m$1896) {
            var modulepath$1897 = Module$1893._resolveFilename(m$1896, modulemock$1894);
            var modulefile$1898 = fs$1879.readFileSync(modulepath$1897, 'utf8');
            return modulefile$1898 + '\n' + f$1895;
        }, '');
    }
    if (watch$1885 && outfile$1884) {
        fs$1879.watch(infile$1883, function () {
            file$1889 = fs$1879.readFileSync(infile$1883, 'utf8');
            try {
                fs$1879.writeFileSync(outfile$1884, sweet$1881.compile(file$1889, { macros: globalMacros$1890 }).code, 'utf8');
            } catch (e$1899) {
                console.log(e$1899);
            }
        });
    } else if (outfile$1884) {
        if (sourcemap$1887) {
            var result$1900 = sweet$1881.compile(file$1889, {
                    sourceMap: true,
                    filename: infile$1883,
                    macros: globalMacros$1890
                });
            var mapfile$1901 = path$1880.basename(outfile$1884) + '.map';
            fs$1879.writeFileSync(outfile$1884, result$1900.code + '\n//# sourceMappingURL=' + mapfile$1901, 'utf8');
            fs$1879.writeFileSync(outfile$1884 + '.map', result$1900.sourceMap, 'utf8');
        } else {
            fs$1879.writeFileSync(outfile$1884, sweet$1881.compile(file$1889).code, 'utf8');
        }
    } else if (tokens$1886) {
        console.log(sweet$1881.expand(file$1889, globalMacros$1890));
    } else if (noparse$1888) {
        var unparsedString$1902 = sweet$1881.expand(file$1889, globalMacros$1890).reduce(function (acc$1903, stx$1904) {
                return acc$1903 + ' ' + stx$1904.token.value;
            }, '');
        console.log(unparsedString$1902);
    } else {
        console.log(sweet$1881.compile(file$1889, { macros: globalMacros$1890 }).code);
    }
};
//# sourceMappingURL=sjs.js.map