var fs$1843 = require('fs');
var path$1844 = require('path');
var sweet$1845 = require('./sweet.js');
var argv$1846 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').argv;
exports.run = function () {
    var infile$1847 = argv$1846._[0];
    var outfile$1848 = argv$1846.output;
    var watch$1849 = argv$1846.watch;
    var tokens$1850 = argv$1846.tokens;
    var sourcemap$1851 = argv$1846.sourcemap;
    var noparse$1852 = argv$1846['no-parse'];
    var file$1853;
    var globalMacros$1854;
    if (infile$1847) {
        file$1853 = fs$1843.readFileSync(infile$1847, 'utf8');
    } else if (argv$1846.stdin) {
        file$1853 = fs$1843.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$1846._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$1855 = argv$1846.module;
    var cwd$1856 = process.cwd();
    var Module$1857 = module.constructor;
    var modulemock$1858;
    if (mod$1855) {
        modulemock$1858 = {
            id: cwd$1856 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$1856) ? [cwd$1856] : Module$1857._nodeModulePaths(cwd$1856)
        };
        if (typeof mod$1855 === 'string') {
            mod$1855 = [mod$1855];
        }
        globalMacros$1854 = mod$1855.reduceRight(function (f$1859, m$1860) {
            var modulepath$1861 = Module$1857._resolveFilename(m$1860, modulemock$1858);
            var modulefile$1862 = fs$1843.readFileSync(modulepath$1861, 'utf8');
            return modulefile$1862 + '\n' + f$1859;
        }, '');
    }
    if (watch$1849 && outfile$1848) {
        fs$1843.watch(infile$1847, function () {
            file$1853 = fs$1843.readFileSync(infile$1847, 'utf8');
            try {
                fs$1843.writeFileSync(outfile$1848, sweet$1845.compile(file$1853, { macros: globalMacros$1854 }).code, 'utf8');
            } catch (e$1863) {
                console.log(e$1863);
            }
        });
    } else if (outfile$1848) {
        if (sourcemap$1851) {
            var result$1864 = sweet$1845.compile(file$1853, {
                    sourceMap: true,
                    filename: infile$1847,
                    macros: globalMacros$1854
                });
            var mapfile$1865 = path$1844.basename(outfile$1848) + '.map';
            fs$1843.writeFileSync(outfile$1848, result$1864.code + '\n//# sourceMappingURL=' + mapfile$1865, 'utf8');
            fs$1843.writeFileSync(outfile$1848 + '.map', result$1864.sourceMap, 'utf8');
        } else {
            fs$1843.writeFileSync(outfile$1848, sweet$1845.compile(file$1853).code, 'utf8');
        }
    } else if (tokens$1850) {
        console.log(sweet$1845.expand(file$1853, globalMacros$1854));
    } else if (noparse$1852) {
        var unparsedString$1866 = sweet$1845.expand(file$1853, globalMacros$1854).reduce(function (acc$1867, stx$1868) {
                return acc$1867 + ' ' + stx$1868.token.value;
            }, '');
        console.log(unparsedString$1866);
    } else {
        console.log(sweet$1845.compile(file$1853, { macros: globalMacros$1854 }).code);
    }
};