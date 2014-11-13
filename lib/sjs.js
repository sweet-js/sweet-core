var fs = require('fs');
var path = require('path');
var pkg = require('../package.json');
var sweet = require('./sweet.js');
var syn = require('./syntax.js');
var argv = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('v', 'version').describe('v', 'Output version info').boolean('version').alias('o', 'output').describe('o', 'write out compiled files').boolean('output').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('a', 'ast').describe('a', 'just emit the expanded AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').alias('n', 'num-expands').describe('n', 'the maximum number of expands to perform').alias('h', 'step-hygiene').describe('h', 'display hygienic renames when stepping with "--num-expands"').alias('r', 'readable-names').describe('r', 'remove as many hygienic renames as possible (ES5 code only!)').boolean('readable-names').describe('format-indent', 'number of spaces for indentation').alias('l', 'load-readtable').describe('load-readtable', 'readtable module to install').argv;
exports.run = function () {
    if (argv.version) {
        return console.log('Sweet.js version: ' + pkg.version);
    }
    var infile = argv._[0];
    var writeToDisk = argv.output;
    var watch = argv.watch;
    var tokens = argv.tokens;
    var ast = argv.ast;
    var sourcemap = argv.sourcemap;
    var noparse = argv['no-parse'];
    var numexpands = argv['num-expands'];
    var displayHygiene = argv['step-hygiene'];
    var readableNames = argv['readable-names'];
    var formatIndent = parseInt(argv['format-indent'], 10);
    var readtableModules = argv['load-readtable'];
    if (formatIndent !== formatIndent) {
        formatIndent = 4;
    }
    var file;
    if (infile) {
        file = fs.readFileSync(infile, 'utf8');
    } else if (argv.stdin) {
        file = fs.readFileSync('/dev/stdin', 'utf8');
    } else if (argv._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var cwd = process.cwd();
    if (readtableModules) {
        readtableModules = Array.isArray(readtableModules) ? readtableModules : [readtableModules];
        readtableModules.forEach(function (mod) {
            sweet.setReadtable(mod);
        });
    }
    var options = {
        filename: infile,
        compileSuffix: '.jsc',
        ast: ast,
        sourceMap: sourcemap,
        readableNames: readableNames,
        escodegen: { format: { indent: { style: Array(formatIndent + 1).join(' ') } } }
    };
    function doCompile() {
        var result$2 = sweet.compile(file, options);
        result$2.forEach(function (res) {
            var outfile = res.path + options.compileSuffix;
            var mapfile = res.path + '.map';
            console.log('compiling: ' + outfile);
            if (sourcemap) {
                fs.writeFileSync(outfile, res.code + '\n//# sourceMappingURL=' + mapfile, 'utf8');
                fs.writeFileSync(mapfile, res.sourceMap, 'utf8');
            } else {
                fs.writeFileSync(outfile, res.code, 'utf8');
            }
        });
    }
    if (watch && writeToDisk) {
        fs.watch(infile, function () {
            file = fs.readFileSync(infile, 'utf8');
            try {
                doCompile();
            } catch (e) {
                console.log(e);
            }
        });
    } else if (writeToDisk) {
        doCompile();
    } else if (tokens) {
        console.log(sweet.expand(file, modules, { maxExpands: numexpands }));
    } else if (ast) {
        console.log(JSON.stringify(sweet.compile(file, options), null, formatIndent));
    } else if (noparse) {
        var expanded = sweet.expand(file, modules, { maxExpands: numexpands });
        var unparsedString = syn.prettyPrint(expanded, displayHygiene);
        console.log(unparsedString);
    } else {
        options.maxExpands = numexpands;
        var result = sweet.compile(file, options);
        result.forEach(function (res) {
            console.log('file: ' + res.path);
            console.log(res.code + '\n');
        });
    }
};
//# sourceMappingURL=sjs.js.map