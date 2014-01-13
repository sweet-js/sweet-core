var fs$1838 = require('fs');
var path$1839 = require('path');
var sweet$1840 = require('./sweet.js');
var syn$1841 = require('./syntax.js');
var argv$1842 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').alias('n', 'num-expands').describe('n', 'the maximum number of expands to perform').alias('h', 'step-hygiene').describe('h', 'display hygienic renames when stepping with "--num-expands"').argv;
exports.run = function () {
    var infile$1843 = argv$1842._[0];
    var outfile$1844 = argv$1842.output;
    var watch$1845 = argv$1842.watch;
    var tokens$1846 = argv$1842.tokens;
    var sourcemap$1847 = argv$1842.sourcemap;
    var noparse$1848 = argv$1842['no-parse'];
    var numexpands$1849 = argv$1842['num-expands'];
    var displayHygiene$1850 = argv$1842['step-hygiene'];
    var file$1851;
    if (infile$1843) {
        file$1851 = fs$1838.readFileSync(infile$1843, 'utf8');
    } else if (argv$1842.stdin) {
        file$1851 = fs$1838.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$1842._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var cwd$1852 = process.cwd();
    var modules$1853 = typeof argv$1842.module === 'string' ? [argv$1842.module] : argv$1842.module;
    modules$1853 = (modules$1853 || []).map(function (path$1855) {
        return sweet$1840.loadNodeModule(cwd$1852, path$1855);
    });
    var options$1854 = {
            filename: infile$1843,
            modules: modules$1853
        };
    if (watch$1845 && outfile$1844) {
        fs$1838.watch(infile$1843, function () {
            file$1851 = fs$1838.readFileSync(infile$1843, 'utf8');
            try {
                fs$1838.writeFileSync(outfile$1844, sweet$1840.compile(file$1851, options$1854).code, 'utf8');
            } catch (e$1856) {
                console.log(e$1856);
            }
        });
    } else if (outfile$1844) {
        if (sourcemap$1847) {
            options$1854.sourceMap = true;
            var result$1857 = sweet$1840.compile(file$1851, options$1854);
            var mapfile$1858 = path$1839.basename(outfile$1844) + '.map';
            fs$1838.writeFileSync(outfile$1844, result$1857.code + '\n//# sourceMappingURL=' + mapfile$1858, 'utf8');
            fs$1838.writeFileSync(outfile$1844 + '.map', result$1857.sourceMap, 'utf8');
        } else {
            fs$1838.writeFileSync(outfile$1844, sweet$1840.compile(file$1851, options$1854).code, 'utf8');
        }
    } else if (tokens$1846) {
        console.log(sweet$1840.expand(file$1851, modules$1853, numexpands$1849));
    } else if (noparse$1848) {
        var unparsedString$1859 = syn$1841.prettyPrint(sweet$1840.expand(file$1851, modules$1853, numexpands$1849), displayHygiene$1850);
        console.log(unparsedString$1859);
    } else {
        options$1854.numExpands = numexpands$1849;
        console.log(sweet$1840.compile(file$1851, options$1854).code);
    }
};
//# sourceMappingURL=sjs.js.map