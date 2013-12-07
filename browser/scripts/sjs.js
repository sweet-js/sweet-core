var fs$1839 = require('fs');
var path$1840 = require('path');
var sweet$1841 = require('./sweet.js');
var argv$1842 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').argv;
exports.run = function () {
    var infile$1843 = argv$1842._[0];
    var outfile$1844 = argv$1842.output;
    var watch$1845 = argv$1842.watch;
    var tokens$1846 = argv$1842.tokens;
    var sourcemap$1847 = argv$1842.sourcemap;
    var noparse$1848 = argv$1842['no-parse'];
    var file$1849;
    var globalMacros$1850;
    if (infile$1843) {
        file$1849 = fs$1839.readFileSync(infile$1843, 'utf8');
    } else if (argv$1842.stdin) {
        file$1849 = fs$1839.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$1842._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$1851 = argv$1842.module;
    var cwd$1852 = process.cwd();
    var Module$1853 = module.constructor;
    var modulemock$1854;
    if (mod$1851) {
        modulemock$1854 = {
            id: cwd$1852 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$1852) ? [cwd$1852] : Module$1853._nodeModulePaths(cwd$1852)
        };
        if (typeof mod$1851 === 'string') {
            mod$1851 = [mod$1851];
        }
        globalMacros$1850 = mod$1851.reduceRight(function (f$1855, m$1856) {
            var modulepath$1857 = Module$1853._resolveFilename(m$1856, modulemock$1854);
            var modulefile$1858 = fs$1839.readFileSync(modulepath$1857, 'utf8');
            return modulefile$1858 + '\n' + f$1855;
        }, '');
    }
    if (watch$1845 && outfile$1844) {
        fs$1839.watch(infile$1843, function () {
            file$1849 = fs$1839.readFileSync(infile$1843, 'utf8');
            try {
                fs$1839.writeFileSync(outfile$1844, sweet$1841.compile(file$1849, { macros: globalMacros$1850 }).code, 'utf8');
            } catch (e$1859) {
                console.log(e$1859);
            }
        });
    } else if (outfile$1844) {
        if (sourcemap$1847) {
            var result$1860 = sweet$1841.compile(file$1849, {
                    sourceMap: true,
                    filename: infile$1843,
                    macros: globalMacros$1850
                });
            var mapfile$1861 = path$1840.basename(outfile$1844) + '.map';
            fs$1839.writeFileSync(outfile$1844, result$1860.code + '\n//# sourceMappingURL=' + mapfile$1861, 'utf8');
            fs$1839.writeFileSync(outfile$1844 + '.map', result$1860.sourceMap, 'utf8');
        } else {
            fs$1839.writeFileSync(outfile$1844, sweet$1841.compile(file$1849).code, 'utf8');
        }
    } else if (tokens$1846) {
        console.log(sweet$1841.expand(file$1849, globalMacros$1850));
    } else if (noparse$1848) {
        var unparsedString$1862 = sweet$1841.expand(file$1849, globalMacros$1850).reduce(function (acc$1863, stx$1864) {
                return acc$1863 + ' ' + stx$1864.token.value;
            }, '');
        console.log(unparsedString$1862);
    } else {
        console.log(sweet$1841.compile(file$1849, { macros: globalMacros$1850 }).code);
    }
};