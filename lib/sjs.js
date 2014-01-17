var fs$1838 = require('fs');
var path$1839 = require('path');
var sweet$1840 = require('./sweet.js');
var syn$1841 = require('./syntax.js');
var argv$1842 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('a', 'ast').describe('a', 'just emit the expanded AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').alias('n', 'num-expands').describe('n', 'the maximum number of expands to perform').alias('h', 'step-hygiene').describe('h', 'display hygienic renames when stepping with "--num-expands"').alias('r', 'readable-names').describe('r', 'remove as many hygienic renames as possible (ES5 code only!)').boolean('readable-names').describe('format-indent', 'number of spaces for indentation').argv;
exports.run = function () {
    var infile$1843 = argv$1842._[0];
    var outfile$1844 = argv$1842.output;
    var watch$1845 = argv$1842.watch;
    var tokens$1846 = argv$1842.tokens;
    var ast$1847 = argv$1842.ast;
    var sourcemap$1848 = argv$1842.sourcemap;
    var noparse$1849 = argv$1842['no-parse'];
    var numexpands$1850 = argv$1842['num-expands'];
    var displayHygiene$1851 = argv$1842['step-hygiene'];
    var readableNames$1852 = argv$1842['readable-names'];
    var formatIndent$1853 = parseInt(argv$1842['format-indent'], 10);
    if (formatIndent$1853 !== formatIndent$1853) {
        formatIndent$1853 = 4;
    }
    var file$1854;
    if (infile$1843) {
        file$1854 = fs$1838.readFileSync(infile$1843, 'utf8');
    } else if (argv$1842.stdin) {
        file$1854 = fs$1838.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$1842._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var cwd$1855 = process.cwd();
    var modules$1856 = typeof argv$1842.module === 'string' ? [argv$1842.module] : argv$1842.module;
    modules$1856 = (modules$1856 || []).map(function (path$1858) {
        return sweet$1840.loadNodeModule(cwd$1855, path$1858);
    });
    var options$1857 = {
            filename: infile$1843,
            modules: modules$1856,
            ast: ast$1847,
            readableNames: readableNames$1852,
            escodegen: { format: { indent: { style: Array(formatIndent$1853 + 1).join(' ') } } }
        };
    if (watch$1845 && outfile$1844) {
        fs$1838.watch(infile$1843, function () {
            file$1854 = fs$1838.readFileSync(infile$1843, 'utf8');
            try {
                fs$1838.writeFileSync(outfile$1844, sweet$1840.compile(file$1854, options$1857).code, 'utf8');
            } catch (e$1859) {
                console.log(e$1859);
            }
        });
    } else if (outfile$1844) {
        if (sourcemap$1848) {
            options$1857.sourceMap = true;
            var result$1860 = sweet$1840.compile(file$1854, options$1857);
            var mapfile$1861 = path$1839.basename(outfile$1844) + '.map';
            fs$1838.writeFileSync(outfile$1844, result$1860.code + '\n//# sourceMappingURL=' + mapfile$1861, 'utf8');
            fs$1838.writeFileSync(outfile$1844 + '.map', result$1860.sourceMap, 'utf8');
        } else {
            fs$1838.writeFileSync(outfile$1844, sweet$1840.compile(file$1854, options$1857).code, 'utf8');
        }
    } else if (tokens$1846) {
        console.log(sweet$1840.expand(file$1854, modules$1856, numexpands$1850));
    } else if (ast$1847) {
        console.log(JSON.stringify(sweet$1840.compile(file$1854, options$1857), null, formatIndent$1853));
    } else if (noparse$1849) {
        var unparsedString$1862 = syn$1841.prettyPrint(sweet$1840.expand(file$1854, modules$1856, numexpands$1850), displayHygiene$1851);
        console.log(unparsedString$1862);
    } else {
        options$1857.numExpands = numexpands$1850;
        console.log(sweet$1840.compile(file$1854, options$1857).code);
    }
};
//# sourceMappingURL=sjs.js.map