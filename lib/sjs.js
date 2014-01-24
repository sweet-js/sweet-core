var fs$1842 = require('fs');
var path$1843 = require('path');
var sweet$1844 = require('./sweet.js');
var syn$1845 = require('./syntax.js');
var argv$1846 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('a', 'ast').describe('a', 'just emit the expanded AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').alias('n', 'num-expands').describe('n', 'the maximum number of expands to perform').alias('h', 'step-hygiene').describe('h', 'display hygienic renames when stepping with "--num-expands"').alias('r', 'readable-names').describe('r', 'remove as many hygienic renames as possible (ES5 code only!)').boolean('readable-names').describe('format-indent', 'number of spaces for indentation').argv;
exports.run = function () {
    var infile$1847 = argv$1846._[0];
    var outfile$1848 = argv$1846.output;
    var watch$1849 = argv$1846.watch;
    var tokens$1850 = argv$1846.tokens;
    var ast$1851 = argv$1846.ast;
    var sourcemap$1852 = argv$1846.sourcemap;
    var noparse$1853 = argv$1846['no-parse'];
    var numexpands$1854 = argv$1846['num-expands'];
    var displayHygiene$1855 = argv$1846['step-hygiene'];
    var readableNames$1856 = argv$1846['readable-names'];
    var formatIndent$1857 = parseInt(argv$1846['format-indent'], 10);
    if (formatIndent$1857 !== formatIndent$1857) {
        formatIndent$1857 = 4;
    }
    var file$1858;
    if (infile$1847) {
        file$1858 = fs$1842.readFileSync(infile$1847, 'utf8');
    } else if (argv$1846.stdin) {
        file$1858 = fs$1842.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$1846._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var cwd$1859 = process.cwd();
    var modules$1860 = typeof argv$1846.module === 'string' ? [argv$1846.module] : argv$1846.module;
    modules$1860 = (modules$1860 || []).map(function (path$1862) {
        return sweet$1844.loadNodeModule(cwd$1859, path$1862);
    });
    var options$1861 = {
            filename: infile$1847,
            modules: modules$1860,
            ast: ast$1851,
            readableNames: readableNames$1856,
            escodegen: { format: { indent: { style: Array(formatIndent$1857 + 1).join(' ') } } }
        };
    if (watch$1849 && outfile$1848) {
        fs$1842.watch(infile$1847, function () {
            file$1858 = fs$1842.readFileSync(infile$1847, 'utf8');
            try {
                fs$1842.writeFileSync(outfile$1848, sweet$1844.compile(file$1858, options$1861).code, 'utf8');
            } catch (e$1863) {
                console.log(e$1863);
            }
        });
    } else if (outfile$1848) {
        if (sourcemap$1852) {
            options$1861.sourceMap = true;
            var result$1864 = sweet$1844.compile(file$1858, options$1861);
            var mapfile$1865 = path$1843.basename(outfile$1848) + '.map';
            fs$1842.writeFileSync(outfile$1848, result$1864.code + '\n//# sourceMappingURL=' + mapfile$1865, 'utf8');
            fs$1842.writeFileSync(outfile$1848 + '.map', result$1864.sourceMap, 'utf8');
        } else {
            fs$1842.writeFileSync(outfile$1848, sweet$1844.compile(file$1858, options$1861).code, 'utf8');
        }
    } else if (tokens$1850) {
        console.log(sweet$1844.expand(file$1858, modules$1860, numexpands$1854));
    } else if (ast$1851) {
        console.log(JSON.stringify(sweet$1844.compile(file$1858, options$1861), null, formatIndent$1857));
    } else if (noparse$1853) {
        var unparsedString$1866 = syn$1845.prettyPrint(sweet$1844.expand(file$1858, modules$1860, numexpands$1854), displayHygiene$1855);
        console.log(unparsedString$1866);
    } else {
        options$1861.numExpands = numexpands$1854;
        console.log(sweet$1844.compile(file$1858, options$1861).code);
    }
};
//# sourceMappingURL=sjs.js.map