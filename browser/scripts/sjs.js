var fs$1817 = require('fs');
var path$1818 = require('path');
var sweet$1819 = require('./sweet.js');
var syn$1820 = require('./syntax.js');
var argv$1821 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').alias('n', 'num-expands').describe('n', 'the maximum number of expands to perform').alias('h', 'step-hygiene').describe('h', 'display hygienic renames when stepping with "--num-expands"').argv;
exports.run = function () {
    var infile$1822 = argv$1821._[0];
    var outfile$1823 = argv$1821.output;
    var watch$1824 = argv$1821.watch;
    var tokens$1825 = argv$1821.tokens;
    var sourcemap$1826 = argv$1821.sourcemap;
    var noparse$1827 = argv$1821['no-parse'];
    var numexpands$1828 = argv$1821['num-expands'];
    var displayHygiene$1829 = argv$1821['step-hygiene'];
    var file$1830;
    if (infile$1822) {
        file$1830 = fs$1817.readFileSync(infile$1822, 'utf8');
    } else if (argv$1821.stdin) {
        file$1830 = fs$1817.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$1821._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var cwd$1831 = process.cwd();
    var modules$1832 = typeof argv$1821.module === 'string' ? [argv$1821.module] : argv$1821.module;
    modules$1832 = (modules$1832 || []).map(function (path$1834) {
        return sweet$1819.loadNodeModule(cwd$1831, path$1834);
    });
    var options$1833 = {
            filename: infile$1822,
            modules: modules$1832
        };
    if (watch$1824 && outfile$1823) {
        fs$1817.watch(infile$1822, function () {
            file$1830 = fs$1817.readFileSync(infile$1822, 'utf8');
            try {
                fs$1817.writeFileSync(outfile$1823, sweet$1819.compile(file$1830, options$1833).code, 'utf8');
            } catch (e$1835) {
                console.log(e$1835);
            }
        });
    } else if (outfile$1823) {
        if (sourcemap$1826) {
            options$1833.sourceMap = true;
            var result$1836 = sweet$1819.compile(file$1830, options$1833);
            var mapfile$1837 = path$1818.basename(outfile$1823) + '.map';
            fs$1817.writeFileSync(outfile$1823, result$1836.code + '\n//# sourceMappingURL=' + mapfile$1837, 'utf8');
            fs$1817.writeFileSync(outfile$1823 + '.map', result$1836.sourceMap, 'utf8');
        } else {
            fs$1817.writeFileSync(outfile$1823, sweet$1819.compile(file$1830, options$1833).code, 'utf8');
        }
    } else if (tokens$1825) {
        console.log(sweet$1819.expand(file$1830, modules$1832, numexpands$1828));
    } else if (noparse$1827) {
        var unparsedString$1838 = syn$1820.prettyPrint(sweet$1819.expand(file$1830, modules$1832, numexpands$1828), displayHygiene$1829);
        console.log(unparsedString$1838);
    } else {
        options$1833.numExpands = numexpands$1828;
        console.log(sweet$1819.compile(file$1830, options$1833).code);
    }
};
//# sourceMappingURL=sjs.js.map