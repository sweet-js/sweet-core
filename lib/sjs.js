var fs$1861 = require('fs');
var path$1862 = require('path');
var sweet$1863 = require('./sweet.js');
var argv$1864 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').argv;
exports.run = function () {
    var infile$1865 = argv$1864._[0];
    var outfile$1866 = argv$1864.output;
    var watch$1867 = argv$1864.watch;
    var tokens$1868 = argv$1864.tokens;
    var sourcemap$1869 = argv$1864.sourcemap;
    var noparse$1870 = argv$1864['no-parse'];
    var file$1871;
    var globalMacros$1872;
    if (infile$1865) {
        file$1871 = fs$1861.readFileSync(infile$1865, 'utf8');
    } else if (argv$1864.stdin) {
        file$1871 = fs$1861.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$1864._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$1873 = argv$1864.module;
    var cwd$1874 = process.cwd();
    var Module$1875 = module.constructor;
    var modulemock$1876;
    if (mod$1873) {
        modulemock$1876 = {
            id: cwd$1874 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$1874) ? [cwd$1874] : Module$1875._nodeModulePaths(cwd$1874)
        };
        if (typeof mod$1873 === 'string') {
            mod$1873 = [mod$1873];
        }
        globalMacros$1872 = mod$1873.reduceRight(function (f$1877, m$1878) {
            var modulepath$1879 = Module$1875._resolveFilename(m$1878, modulemock$1876);
            var modulefile$1880 = fs$1861.readFileSync(modulepath$1879, 'utf8');
            return modulefile$1880 + '\n' + f$1877;
        }, '');
    }
    if (watch$1867 && outfile$1866) {
        fs$1861.watch(infile$1865, function () {
            file$1871 = fs$1861.readFileSync(infile$1865, 'utf8');
            try {
                fs$1861.writeFileSync(outfile$1866, sweet$1863.compile(file$1871, { macros: globalMacros$1872 }).code, 'utf8');
            } catch (e$1881) {
                console.log(e$1881);
            }
        });
    } else if (outfile$1866) {
        if (sourcemap$1869) {
            var result$1882 = sweet$1863.compile(file$1871, {
                    sourceMap: true,
                    filename: infile$1865,
                    macros: globalMacros$1872
                });
            var mapfile$1883 = path$1862.basename(outfile$1866) + '.map';
            fs$1861.writeFileSync(outfile$1866, result$1882.code + '\n//# sourceMappingURL=' + mapfile$1883, 'utf8');
            fs$1861.writeFileSync(outfile$1866 + '.map', result$1882.sourceMap, 'utf8');
        } else {
            fs$1861.writeFileSync(outfile$1866, sweet$1863.compile(file$1871).code, 'utf8');
        }
    } else if (tokens$1868) {
        console.log(sweet$1863.expand(file$1871, globalMacros$1872));
    } else if (noparse$1870) {
        var unparsedString$1884 = sweet$1863.expand(file$1871, globalMacros$1872).reduce(function (acc$1885, stx$1886) {
                return acc$1885 + ' ' + stx$1886.token.value;
            }, '');
        console.log(unparsedString$1884);
    } else {
        console.log(sweet$1863.compile(file$1871, { macros: globalMacros$1872 }).code);
    }
};
//# sourceMappingURL=sjs.js.map