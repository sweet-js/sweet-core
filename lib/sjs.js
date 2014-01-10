var fs$1822 = require('fs');
var path$1823 = require('path');
var sweet$1824 = require('./sweet.js');
var syn$1825 = require('./syntax.js');
var argv$1826 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').alias('n', 'num-expands').describe('n', 'the maximum number of expands to perform').alias('h', 'step-hygiene').describe('h', 'display hygienic renames when stepping with "--num-expands"').argv;
exports.run = function () {
    var infile$1827 = argv$1826._[0];
    var outfile$1828 = argv$1826.output;
    var watch$1829 = argv$1826.watch;
    var tokens$1830 = argv$1826.tokens;
    var sourcemap$1831 = argv$1826.sourcemap;
    var noparse$1832 = argv$1826['no-parse'];
    var numexpands$1833 = argv$1826['num-expands'];
    var displayHygiene$1834 = argv$1826['step-hygiene'];
    var file$1835;
    if (infile$1827) {
        file$1835 = fs$1822.readFileSync(infile$1827, 'utf8');
    } else if (argv$1826.stdin) {
        file$1835 = fs$1822.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$1826._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var cwd$1836 = process.cwd();
    var modules$1837 = typeof argv$1826.module === 'string' ? [argv$1826.module] : argv$1826.module;
    modules$1837 = (modules$1837 || []).map(function (path$1839) {
        return sweet$1824.loadNodeModule(cwd$1836, path$1839);
    });
    var options$1838 = {
            filename: infile$1827,
            modules: modules$1837
        };
    if (watch$1829 && outfile$1828) {
        fs$1822.watch(infile$1827, function () {
            file$1835 = fs$1822.readFileSync(infile$1827, 'utf8');
            try {
                fs$1822.writeFileSync(outfile$1828, sweet$1824.compile(file$1835, options$1838).code, 'utf8');
            } catch (e$1840) {
                console.log(e$1840);
            }
        });
    } else if (outfile$1828) {
        if (sourcemap$1831) {
            options$1838.sourceMap = true;
            var result$1841 = sweet$1824.compile(file$1835, options$1838);
            var mapfile$1842 = path$1823.basename(outfile$1828) + '.map';
            fs$1822.writeFileSync(outfile$1828, result$1841.code + '\n//# sourceMappingURL=' + mapfile$1842, 'utf8');
            fs$1822.writeFileSync(outfile$1828 + '.map', result$1841.sourceMap, 'utf8');
        } else {
            fs$1822.writeFileSync(outfile$1828, sweet$1824.compile(file$1835, options$1838).code, 'utf8');
        }
    } else if (tokens$1830) {
        console.log(sweet$1824.expand(file$1835, modules$1837, numexpands$1833));
    } else if (noparse$1832) {
        var unparsedString$1843 = syn$1825.prettyPrint(sweet$1824.expand(file$1835, modules$1837, numexpands$1833), displayHygiene$1834);
        console.log(unparsedString$1843);
    } else {
        options$1838.numExpands = numexpands$1833;
        console.log(sweet$1824.compile(file$1835, options$1838).code);
    }
};
//# sourceMappingURL=sjs.js.map