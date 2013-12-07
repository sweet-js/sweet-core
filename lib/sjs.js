var fs$1838 = require('fs');
var path$1839 = require('path');
var sweet$1840 = require('./sweet.js');
var argv$1841 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').argv;
exports.run = function () {
    var infile$1842 = argv$1841._[0];
    var outfile$1843 = argv$1841.output;
    var watch$1844 = argv$1841.watch;
    var tokens$1845 = argv$1841.tokens;
    var sourcemap$1846 = argv$1841.sourcemap;
    var noparse$1847 = argv$1841['no-parse'];
    var file$1848;
    var globalMacros$1849;
    if (infile$1842) {
        file$1848 = fs$1838.readFileSync(infile$1842, 'utf8');
    } else if (argv$1841.stdin) {
        file$1848 = fs$1838.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$1841._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$1850 = argv$1841.module;
    var cwd$1851 = process.cwd();
    var Module$1852 = module.constructor;
    var modulemock$1853;
    if (mod$1850) {
        modulemock$1853 = {
            id: cwd$1851 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$1851) ? [cwd$1851] : Module$1852._nodeModulePaths(cwd$1851)
        };
        if (typeof mod$1850 === 'string') {
            mod$1850 = [mod$1850];
        }
        globalMacros$1849 = mod$1850.reduceRight(function (f$1854, m$1855) {
            var modulepath$1856 = Module$1852._resolveFilename(m$1855, modulemock$1853);
            var modulefile$1857 = fs$1838.readFileSync(modulepath$1856, 'utf8');
            return modulefile$1857 + '\n' + f$1854;
        }, '');
    }
    if (watch$1844 && outfile$1843) {
        fs$1838.watch(infile$1842, function () {
            file$1848 = fs$1838.readFileSync(infile$1842, 'utf8');
            try {
                fs$1838.writeFileSync(outfile$1843, sweet$1840.compile(file$1848, { macros: globalMacros$1849 }).code, 'utf8');
            } catch (e$1858) {
                console.log(e$1858);
            }
        });
    } else if (outfile$1843) {
        if (sourcemap$1846) {
            var result$1859 = sweet$1840.compile(file$1848, {
                    sourceMap: true,
                    filename: infile$1842,
                    macros: globalMacros$1849
                });
            var mapfile$1860 = path$1839.basename(outfile$1843) + '.map';
            fs$1838.writeFileSync(outfile$1843, result$1859.code + '\n//# sourceMappingURL=' + mapfile$1860, 'utf8');
            fs$1838.writeFileSync(outfile$1843 + '.map', result$1859.sourceMap, 'utf8');
        } else {
            fs$1838.writeFileSync(outfile$1843, sweet$1840.compile(file$1848).code, 'utf8');
        }
    } else if (tokens$1845) {
        console.log(sweet$1840.expand(file$1848, globalMacros$1849));
    } else if (noparse$1847) {
        var unparsedString$1861 = sweet$1840.expand(file$1848, globalMacros$1849).reduce(function (acc$1862, stx$1863) {
                return acc$1862 + ' ' + stx$1863.token.value;
            }, '');
        console.log(unparsedString$1861);
    } else {
        console.log(sweet$1840.compile(file$1848, { macros: globalMacros$1849 }).code);
    }
};