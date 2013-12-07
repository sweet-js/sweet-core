var fs$1846 = require('fs');
var path$1847 = require('path');
var sweet$1848 = require('./sweet.js');
var argv$1849 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').argv;
exports.run = function () {
    var infile$1850 = argv$1849._[0];
    var outfile$1851 = argv$1849.output;
    var watch$1852 = argv$1849.watch;
    var tokens$1853 = argv$1849.tokens;
    var sourcemap$1854 = argv$1849.sourcemap;
    var noparse$1855 = argv$1849['no-parse'];
    var file$1856;
    var globalMacros$1857;
    if (infile$1850) {
        file$1856 = fs$1846.readFileSync(infile$1850, 'utf8');
    } else if (argv$1849.stdin) {
        file$1856 = fs$1846.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$1849._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$1858 = argv$1849.module;
    var cwd$1859 = process.cwd();
    var Module$1860 = module.constructor;
    var modulemock$1861;
    if (mod$1858) {
        modulemock$1861 = {
            id: cwd$1859 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$1859) ? [cwd$1859] : Module$1860._nodeModulePaths(cwd$1859)
        };
        if (typeof mod$1858 === 'string') {
            mod$1858 = [mod$1858];
        }
        globalMacros$1857 = mod$1858.reduceRight(function (f$1862, m$1863) {
            var modulepath$1864 = Module$1860._resolveFilename(m$1863, modulemock$1861);
            var modulefile$1865 = fs$1846.readFileSync(modulepath$1864, 'utf8');
            return modulefile$1865 + '\n' + f$1862;
        }, '');
    }
    if (watch$1852 && outfile$1851) {
        fs$1846.watch(infile$1850, function () {
            file$1856 = fs$1846.readFileSync(infile$1850, 'utf8');
            try {
                fs$1846.writeFileSync(outfile$1851, sweet$1848.compile(file$1856, { macros: globalMacros$1857 }).code, 'utf8');
            } catch (e$1866) {
                console.log(e$1866);
            }
        });
    } else if (outfile$1851) {
        if (sourcemap$1854) {
            var result$1867 = sweet$1848.compile(file$1856, {
                    sourceMap: true,
                    filename: infile$1850,
                    macros: globalMacros$1857
                });
            var mapfile$1868 = path$1847.basename(outfile$1851) + '.map';
            fs$1846.writeFileSync(outfile$1851, result$1867.code + '\n//# sourceMappingURL=' + mapfile$1868, 'utf8');
            fs$1846.writeFileSync(outfile$1851 + '.map', result$1867.sourceMap, 'utf8');
        } else {
            fs$1846.writeFileSync(outfile$1851, sweet$1848.compile(file$1856).code, 'utf8');
        }
    } else if (tokens$1853) {
        console.log(sweet$1848.expand(file$1856, globalMacros$1857));
    } else if (noparse$1855) {
        var unparsedString$1869 = sweet$1848.expand(file$1856, globalMacros$1857).reduce(function (acc$1870, stx$1871) {
                return acc$1870 + ' ' + stx$1871.token.value;
            }, '');
        console.log(unparsedString$1869);
    } else {
        console.log(sweet$1848.compile(file$1856, { macros: globalMacros$1857 }).code);
    }
};
//# sourceMappingURL=sjs.js.map