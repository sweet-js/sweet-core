var fs$1848 = require('fs');
var path$1849 = require('path');
var sweet$1850 = require('./sweet.js');
var argv$1851 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').argv;
exports.run = function () {
    var infile$1852 = argv$1851._[0];
    var outfile$1853 = argv$1851.output;
    var watch$1854 = argv$1851.watch;
    var tokens$1855 = argv$1851.tokens;
    var sourcemap$1856 = argv$1851.sourcemap;
    var noparse$1857 = argv$1851['no-parse'];
    var file$1858;
    var globalMacros$1859;
    if (infile$1852) {
        file$1858 = fs$1848.readFileSync(infile$1852, 'utf8');
    } else if (argv$1851.stdin) {
        file$1858 = fs$1848.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$1851._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$1860 = argv$1851.module;
    var cwd$1861 = process.cwd();
    var Module$1862 = module.constructor;
    var modulemock$1863;
    if (mod$1860) {
        modulemock$1863 = {
            id: cwd$1861 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$1861) ? [cwd$1861] : Module$1862._nodeModulePaths(cwd$1861)
        };
        if (typeof mod$1860 === 'string') {
            mod$1860 = [mod$1860];
        }
        globalMacros$1859 = mod$1860.reduceRight(function (f$1864, m$1865) {
            var modulepath$1866 = Module$1862._resolveFilename(m$1865, modulemock$1863);
            var modulefile$1867 = fs$1848.readFileSync(modulepath$1866, 'utf8');
            return modulefile$1867 + '\n' + f$1864;
        }, '');
    }
    if (watch$1854 && outfile$1853) {
        fs$1848.watch(infile$1852, function () {
            file$1858 = fs$1848.readFileSync(infile$1852, 'utf8');
            try {
                fs$1848.writeFileSync(outfile$1853, sweet$1850.compile(file$1858, { macros: globalMacros$1859 }).code, 'utf8');
            } catch (e$1868) {
                console.log(e$1868);
            }
        });
    } else if (outfile$1853) {
        if (sourcemap$1856) {
            var result$1869 = sweet$1850.compile(file$1858, {
                    sourceMap: true,
                    filename: infile$1852,
                    macros: globalMacros$1859
                });
            var mapfile$1870 = path$1849.basename(outfile$1853) + '.map';
            fs$1848.writeFileSync(outfile$1853, result$1869.code + '\n//# sourceMappingURL=' + mapfile$1870, 'utf8');
            fs$1848.writeFileSync(outfile$1853 + '.map', result$1869.sourceMap, 'utf8');
        } else {
            fs$1848.writeFileSync(outfile$1853, sweet$1850.compile(file$1858).code, 'utf8');
        }
    } else if (tokens$1855) {
        console.log(sweet$1850.expand(file$1858, globalMacros$1859));
    } else if (noparse$1857) {
        var unparsedString$1871 = sweet$1850.expand(file$1858, globalMacros$1859).reduce(function (acc$1872, stx$1873) {
                return acc$1872 + ' ' + stx$1873.token.value;
            }, '');
        console.log(unparsedString$1871);
    } else {
        console.log(sweet$1850.compile(file$1858, { macros: globalMacros$1859 }).code);
    }
};
//# sourceMappingURL=sjs.js.map