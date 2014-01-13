var fs$1832 = require('fs');
var path$1833 = require('path');
var sweet$1834 = require('./sweet.js');
var syn$1835 = require('./syntax.js');
var argv$1836 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').alias('n', 'num-expands').describe('n', 'the maximum number of expands to perform').alias('h', 'step-hygiene').describe('h', 'display hygienic renames when stepping with "--num-expands"').argv;
exports.run = function () {
    var infile$1837 = argv$1836._[0];
    var outfile$1838 = argv$1836.output;
    var watch$1839 = argv$1836.watch;
    var tokens$1840 = argv$1836.tokens;
    var sourcemap$1841 = argv$1836.sourcemap;
    var noparse$1842 = argv$1836['no-parse'];
    var numexpands$1843 = argv$1836['num-expands'];
    var displayHygiene$1844 = argv$1836['step-hygiene'];
    var file$1845;
    if (infile$1837) {
        file$1845 = fs$1832.readFileSync(infile$1837, 'utf8');
    } else if (argv$1836.stdin) {
        file$1845 = fs$1832.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$1836._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var cwd$1846 = process.cwd();
    var modules$1847 = typeof argv$1836.module === 'string' ? [argv$1836.module] : argv$1836.module;
    modules$1847 = (modules$1847 || []).map(function (path$1849) {
        return sweet$1834.loadNodeModule(cwd$1846, path$1849);
    });
    var options$1848 = {
            filename: infile$1837,
            modules: modules$1847
        };
    if (watch$1839 && outfile$1838) {
        fs$1832.watch(infile$1837, function () {
            file$1845 = fs$1832.readFileSync(infile$1837, 'utf8');
            try {
                fs$1832.writeFileSync(outfile$1838, sweet$1834.compile(file$1845, options$1848).code, 'utf8');
            } catch (e$1850) {
                console.log(e$1850);
            }
        });
    } else if (outfile$1838) {
        if (sourcemap$1841) {
            options$1848.sourceMap = true;
            var result$1851 = sweet$1834.compile(file$1845, options$1848);
            var mapfile$1852 = path$1833.basename(outfile$1838) + '.map';
            fs$1832.writeFileSync(outfile$1838, result$1851.code + '\n//# sourceMappingURL=' + mapfile$1852, 'utf8');
            fs$1832.writeFileSync(outfile$1838 + '.map', result$1851.sourceMap, 'utf8');
        } else {
            fs$1832.writeFileSync(outfile$1838, sweet$1834.compile(file$1845, options$1848).code, 'utf8');
        }
    } else if (tokens$1840) {
        console.log(sweet$1834.expand(file$1845, modules$1847, numexpands$1843));
    } else if (noparse$1842) {
        var unparsedString$1853 = syn$1835.prettyPrint(sweet$1834.expand(file$1845, modules$1847, numexpands$1843), displayHygiene$1844);
        console.log(unparsedString$1853);
    } else {
        options$1848.numExpands = numexpands$1843;
        console.log(sweet$1834.compile(file$1845, options$1848).code);
    }
};
//# sourceMappingURL=sjs.js.map