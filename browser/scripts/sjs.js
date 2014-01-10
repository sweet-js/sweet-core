var fs$1825 = require('fs');
var path$1826 = require('path');
var sweet$1827 = require('./sweet.js');
var syn$1828 = require('./syntax.js');
var argv$1829 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').alias('n', 'num-expands').describe('n', 'the maximum number of expands to perform').alias('h', 'step-hygiene').describe('h', 'display hygienic renames when stepping with "--num-expands"').argv;
exports.run = function () {
    var infile$1830 = argv$1829._[0];
    var outfile$1831 = argv$1829.output;
    var watch$1832 = argv$1829.watch;
    var tokens$1833 = argv$1829.tokens;
    var sourcemap$1834 = argv$1829.sourcemap;
    var noparse$1835 = argv$1829['no-parse'];
    var numexpands$1836 = argv$1829['num-expands'];
    var displayHygiene$1837 = argv$1829['step-hygiene'];
    var file$1838;
    if (infile$1830) {
        file$1838 = fs$1825.readFileSync(infile$1830, 'utf8');
    } else if (argv$1829.stdin) {
        file$1838 = fs$1825.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$1829._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var cwd$1839 = process.cwd();
    var modules$1840 = typeof argv$1829.module === 'string' ? [argv$1829.module] : argv$1829.module;
    modules$1840 = (modules$1840 || []).map(function (path$1842) {
        return sweet$1827.loadNodeModule(cwd$1839, path$1842);
    });
    var options$1841 = {
            filename: infile$1830,
            modules: modules$1840
        };
    if (watch$1832 && outfile$1831) {
        fs$1825.watch(infile$1830, function () {
            file$1838 = fs$1825.readFileSync(infile$1830, 'utf8');
            try {
                fs$1825.writeFileSync(outfile$1831, sweet$1827.compile(file$1838, options$1841).code, 'utf8');
            } catch (e$1843) {
                console.log(e$1843);
            }
        });
    } else if (outfile$1831) {
        if (sourcemap$1834) {
            options$1841.sourceMap = true;
            var result$1844 = sweet$1827.compile(file$1838, options$1841);
            var mapfile$1845 = path$1826.basename(outfile$1831) + '.map';
            fs$1825.writeFileSync(outfile$1831, result$1844.code + '\n//# sourceMappingURL=' + mapfile$1845, 'utf8');
            fs$1825.writeFileSync(outfile$1831 + '.map', result$1844.sourceMap, 'utf8');
        } else {
            fs$1825.writeFileSync(outfile$1831, sweet$1827.compile(file$1838, options$1841).code, 'utf8');
        }
    } else if (tokens$1833) {
        console.log(sweet$1827.expand(file$1838, modules$1840, numexpands$1836));
    } else if (noparse$1835) {
        var unparsedString$1846 = syn$1828.prettyPrint(sweet$1827.expand(file$1838, modules$1840, numexpands$1836), displayHygiene$1837);
        console.log(unparsedString$1846);
    } else {
        options$1841.numExpands = numexpands$1836;
        console.log(sweet$1827.compile(file$1838, options$1841).code);
    }
};
//# sourceMappingURL=sjs.js.map