var fs$1850 = require('fs');
var path$1851 = require('path');
var sweet$1852 = require('./sweet.js');
var argv$1853 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').argv;
exports.run = function () {
    var infile$1854 = argv$1853._[0];
    var outfile$1855 = argv$1853.output;
    var watch$1856 = argv$1853.watch;
    var tokens$1857 = argv$1853.tokens;
    var sourcemap$1858 = argv$1853.sourcemap;
    var noparse$1859 = argv$1853['no-parse'];
    var file$1860;
    var globalMacros$1861;
    if (infile$1854) {
        file$1860 = fs$1850.readFileSync(infile$1854, 'utf8');
    } else if (argv$1853.stdin) {
        file$1860 = fs$1850.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$1853._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$1862 = argv$1853.module;
    var cwd$1863 = process.cwd();
    var Module$1864 = module.constructor;
    var modulemock$1865;
    if (mod$1862) {
        modulemock$1865 = {
            id: cwd$1863 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$1863) ? [cwd$1863] : Module$1864._nodeModulePaths(cwd$1863)
        };
        if (typeof mod$1862 === 'string') {
            mod$1862 = [mod$1862];
        }
        globalMacros$1861 = mod$1862.reduceRight(function (f$1866, m$1867) {
            var modulepath$1868 = Module$1864._resolveFilename(m$1867, modulemock$1865);
            var modulefile$1869 = fs$1850.readFileSync(modulepath$1868, 'utf8');
            return modulefile$1869 + '\n' + f$1866;
        }, '');
    }
    if (watch$1856 && outfile$1855) {
        fs$1850.watch(infile$1854, function () {
            file$1860 = fs$1850.readFileSync(infile$1854, 'utf8');
            try {
                fs$1850.writeFileSync(outfile$1855, sweet$1852.compile(file$1860, { macros: globalMacros$1861 }).code, 'utf8');
            } catch (e$1870) {
                console.log(e$1870);
            }
        });
    } else if (outfile$1855) {
        if (sourcemap$1858) {
            var result$1871 = sweet$1852.compile(file$1860, {
                    sourceMap: true,
                    filename: infile$1854,
                    macros: globalMacros$1861
                });
            var mapfile$1872 = path$1851.basename(outfile$1855) + '.map';
            fs$1850.writeFileSync(outfile$1855, result$1871.code + '\n//# sourceMappingURL=' + mapfile$1872, 'utf8');
            fs$1850.writeFileSync(outfile$1855 + '.map', result$1871.sourceMap, 'utf8');
        } else {
            fs$1850.writeFileSync(outfile$1855, sweet$1852.compile(file$1860).code, 'utf8');
        }
    } else if (tokens$1857) {
        console.log(sweet$1852.expand(file$1860, globalMacros$1861));
    } else if (noparse$1859) {
        var unparsedString$1873 = sweet$1852.expand(file$1860, globalMacros$1861).reduce(function (acc$1874, stx$1875) {
                return acc$1874 + ' ' + stx$1875.token.value;
            }, '');
        console.log(unparsedString$1873);
    } else {
        console.log(sweet$1852.compile(file$1860, { macros: globalMacros$1861 }).code);
    }
};