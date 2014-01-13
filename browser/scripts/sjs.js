var fs$1830 = require('fs');
var path$1831 = require('path');
var sweet$1832 = require('./sweet.js');
var syn$1833 = require('./syntax.js');
var argv$1834 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').alias('n', 'num-expands').describe('n', 'the maximum number of expands to perform').alias('h', 'step-hygiene').describe('h', 'display hygienic renames when stepping with "--num-expands"').argv;
exports.run = function () {
    var infile$1835 = argv$1834._[0];
    var outfile$1836 = argv$1834.output;
    var watch$1837 = argv$1834.watch;
    var tokens$1838 = argv$1834.tokens;
    var sourcemap$1839 = argv$1834.sourcemap;
    var noparse$1840 = argv$1834['no-parse'];
    var numexpands$1841 = argv$1834['num-expands'];
    var displayHygiene$1842 = argv$1834['step-hygiene'];
    var file$1843;
    if (infile$1835) {
        file$1843 = fs$1830.readFileSync(infile$1835, 'utf8');
    } else if (argv$1834.stdin) {
        file$1843 = fs$1830.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$1834._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var cwd$1844 = process.cwd();
    var modules$1845 = typeof argv$1834.module === 'string' ? [argv$1834.module] : argv$1834.module;
    modules$1845 = (modules$1845 || []).map(function (path$1847) {
        return sweet$1832.loadNodeModule(cwd$1844, path$1847);
    });
    var options$1846 = {
            filename: infile$1835,
            modules: modules$1845
        };
    if (watch$1837 && outfile$1836) {
        fs$1830.watch(infile$1835, function () {
            file$1843 = fs$1830.readFileSync(infile$1835, 'utf8');
            try {
                fs$1830.writeFileSync(outfile$1836, sweet$1832.compile(file$1843, options$1846).code, 'utf8');
            } catch (e$1848) {
                console.log(e$1848);
            }
        });
    } else if (outfile$1836) {
        if (sourcemap$1839) {
            options$1846.sourceMap = true;
            var result$1849 = sweet$1832.compile(file$1843, options$1846);
            var mapfile$1850 = path$1831.basename(outfile$1836) + '.map';
            fs$1830.writeFileSync(outfile$1836, result$1849.code + '\n//# sourceMappingURL=' + mapfile$1850, 'utf8');
            fs$1830.writeFileSync(outfile$1836 + '.map', result$1849.sourceMap, 'utf8');
        } else {
            fs$1830.writeFileSync(outfile$1836, sweet$1832.compile(file$1843, options$1846).code, 'utf8');
        }
    } else if (tokens$1838) {
        console.log(sweet$1832.expand(file$1843, modules$1845, numexpands$1841));
    } else if (noparse$1840) {
        var unparsedString$1851 = syn$1833.prettyPrint(sweet$1832.expand(file$1843, modules$1845, numexpands$1841), displayHygiene$1842);
        console.log(unparsedString$1851);
    } else {
        options$1846.numExpands = numexpands$1841;
        console.log(sweet$1832.compile(file$1843, options$1846).code);
    }
};
//# sourceMappingURL=sjs.js.map