var fs$3411 = require('fs');
var path$3412 = require('path');
var pkg$3413 = require('../package.json');
var sweet$3414 = require('./sweet.js');
var syn$3415 = require('./syntax.js');
var argv$3416 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('v', 'version').describe('v', 'Output version info').boolean('version').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('a', 'ast').describe('a', 'just emit the expanded AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').alias('n', 'num-expands').describe('n', 'the maximum number of expands to perform').alias('h', 'step-hygiene').describe('h', 'display hygienic renames when stepping with "--num-expands"').alias('r', 'readable-names').describe('r', 'remove as many hygienic renames as possible (ES5 code only!)').boolean('readable-names').describe('format-indent', 'number of spaces for indentation').alias('l', 'load-readtable').describe('load-readtable', 'readtable module to install').argv;
exports.run = function () {
    if (argv$3416.version) {
        return console.log('Sweet.js version: ' + pkg$3413.version);
    }
    var infile$3417 = argv$3416._[0];
    var outfile$3418 = argv$3416.output;
    var watch$3419 = argv$3416.watch;
    var tokens$3420 = argv$3416.tokens;
    var ast$3421 = argv$3416.ast;
    var sourcemap$3422 = argv$3416.sourcemap;
    var noparse$3423 = argv$3416['no-parse'];
    var numexpands$3424 = argv$3416['num-expands'];
    var displayHygiene$3425 = argv$3416['step-hygiene'];
    var readableNames$3426 = argv$3416['readable-names'];
    var formatIndent$3427 = parseInt(argv$3416['format-indent'], 10);
    var readtableModules$3428 = argv$3416['load-readtable'];
    if (formatIndent$3427 !== formatIndent$3427) {
        formatIndent$3427 = 4;
    }
    var file$3429;
    if (infile$3417) {
        file$3429 = fs$3411.readFileSync(infile$3417, 'utf8');
    } else if (argv$3416.stdin) {
        file$3429 = fs$3411.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$3416._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var cwd$3430 = process.cwd();
    var modules$3431 = typeof argv$3416.module === 'string' ? [argv$3416.module] : argv$3416.module;
    modules$3431 = (modules$3431 || []).map(function (path$3434) {
        return sweet$3414.loadNodeModule(cwd$3430, path$3434);
    });
    if (readtableModules$3428) {
        readtableModules$3428 = Array.isArray(readtableModules$3428) ? readtableModules$3428 : [readtableModules$3428];
        readtableModules$3428.forEach(function (mod$3435) {
            sweet$3414.setReadtable(mod$3435);
        });
    }
    var options$3432 = {
        filename: infile$3417,
        modules: modules$3431,
        ast: ast$3421,
        readableNames: readableNames$3426,
        escodegen: { format: { indent: { style: Array(formatIndent$3427 + 1).join(' ') } } }
    };
    function doCompile$3433() {
        if (sourcemap$3422) {
            options$3432.sourceMap = true;
            var result$3436 = sweet$3414.compile(file$3429, options$3432);
            var mapfile$3437 = path$3412.basename(outfile$3418) + '.map';
            fs$3411.writeFileSync(outfile$3418, result$3436.code + '\n//# sourceMappingURL=' + mapfile$3437, 'utf8');
            fs$3411.writeFileSync(outfile$3418 + '.map', result$3436.sourceMap, 'utf8');
        } else {
            fs$3411.writeFileSync(outfile$3418, sweet$3414.compile(file$3429, options$3432).code, 'utf8');
        }
    }
    if (watch$3419 && outfile$3418) {
        fs$3411.watch(infile$3417, function () {
            file$3429 = fs$3411.readFileSync(infile$3417, 'utf8');
            try {
                doCompile$3433();
            } catch (e$3438) {
                console.log(e$3438);
            }
        });
    } else if (outfile$3418) {
        doCompile$3433();
    } else if (tokens$3420) {
        console.log(sweet$3414.expand(file$3429, modules$3431, { maxExpands: numexpands$3424 }));
    } else if (ast$3421) {
        console.log(JSON.stringify(sweet$3414.compile(file$3429, options$3432), null, formatIndent$3427));
    } else if (noparse$3423) {
        var expanded$3439 = sweet$3414.expand(file$3429, modules$3431, { maxExpands: numexpands$3424 });
        var unparsedString$3440 = syn$3415.prettyPrint(expanded$3439, displayHygiene$3425);
        console.log(unparsedString$3440);
    } else {
        options$3432.maxExpands = numexpands$3424;
        console.log(sweet$3414.compile(file$3429, options$3432).code);
    }
};