var fs$1826 = require('fs');
var path$1827 = require('path');
var sweet$1828 = require('./sweet.js');
var syn$1829 = require('./syntax.js');
var argv$1830 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').alias('n', 'num-expands').describe('n', 'the maximum number of expands to perform').alias('h', 'step-hygiene').describe('h', 'display hygienic renames when stepping with "--num-expands"').argv;
exports.run = function () {
    var infile$1831 = argv$1830._[0];
    var outfile$1832 = argv$1830.output;
    var watch$1833 = argv$1830.watch;
    var tokens$1834 = argv$1830.tokens;
    var sourcemap$1835 = argv$1830.sourcemap;
    var noparse$1836 = argv$1830['no-parse'];
    var numexpands$1837 = argv$1830['num-expands'];
    var displayHygiene$1838 = argv$1830['step-hygiene'];
    var file$1839;
    if (infile$1831) {
        file$1839 = fs$1826.readFileSync(infile$1831, 'utf8');
    } else if (argv$1830.stdin) {
        file$1839 = fs$1826.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$1830._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var cwd$1840 = process.cwd();
    var modules$1841 = typeof argv$1830.module === 'string' ? [argv$1830.module] : argv$1830.module;
    modules$1841 = (modules$1841 || []).map(function (path$1843) {
        return sweet$1828.loadNodeModule(cwd$1840, path$1843);
    });
    var options$1842 = {
            filename: infile$1831,
            modules: modules$1841
        };
    if (watch$1833 && outfile$1832) {
        fs$1826.watch(infile$1831, function () {
            file$1839 = fs$1826.readFileSync(infile$1831, 'utf8');
            try {
                fs$1826.writeFileSync(outfile$1832, sweet$1828.compile(file$1839, options$1842).code, 'utf8');
            } catch (e$1844) {
                console.log(e$1844);
            }
        });
    } else if (outfile$1832) {
        if (sourcemap$1835) {
            options$1842.sourceMap = true;
            var result$1845 = sweet$1828.compile(file$1839, options$1842);
            var mapfile$1846 = path$1827.basename(outfile$1832) + '.map';
            fs$1826.writeFileSync(outfile$1832, result$1845.code + '\n//# sourceMappingURL=' + mapfile$1846, 'utf8');
            fs$1826.writeFileSync(outfile$1832 + '.map', result$1845.sourceMap, 'utf8');
        } else {
            fs$1826.writeFileSync(outfile$1832, sweet$1828.compile(file$1839, options$1842).code, 'utf8');
        }
    } else if (tokens$1834) {
        console.log(sweet$1828.expand(file$1839, modules$1841, numexpands$1837));
    } else if (noparse$1836) {
        var unparsedString$1847 = syn$1829.prettyPrint(sweet$1828.expand(file$1839, modules$1841, numexpands$1837), displayHygiene$1838);
        console.log(unparsedString$1847);
    } else {
        options$1842.numExpands = numexpands$1837;
        console.log(sweet$1828.compile(file$1839, options$1842).code);
    }
};
//# sourceMappingURL=sjs.js.map