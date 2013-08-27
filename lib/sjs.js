var fs$49 = require('fs');
var sweet$50 = require('./sweet.js');
var argv$51 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('i', 'import').describe('i', 'uses the module loading path').boolean('import').argv;
exports.run = function () {
    var infile$52 = argv$51._[0];
    var outfile$53 = argv$51.output;
    var watch$54 = argv$51.watch;
    var tokens$55 = argv$51.tokens;
    var file$56;
    if (infile$52) {
        file$56 = fs$49.readFileSync(infile$52, 'utf8');
    } else {
        file$56 = fs$49.readFileSync('/dev/stdin', 'utf8');
    }
    var module$57 = argv$51.module;
    var imp$58 = argv$51.import;
    var modulefile$59;
    if (imp$58) {
        sweet$50.module(infile$52);
    }
    if (module$57) {
        modulefile$59 = fs$49.readFileSync(module$57, 'utf8');
        file$56 = modulefile$59 + '\n' + file$56;
    }
    if (watch$54 && outfile$53) {
        fs$49.watch(infile$52, function () {
            file$56 = fs$49.readFileSync(infile$52, 'utf8');
            try {
                fs$49.writeFileSync(outfile$53, sweet$50.compile(file$56), 'utf8');
            } catch (e$60) {
                console.log(e$60);
            }
        });
    } else if (outfile$53) {
        fs$49.writeFileSync(outfile$53, sweet$50.compile(file$56), 'utf8');
    } else if (tokens$55) {
        console.log(sweet$50.expand(file$56));
    } else {
        console.log(sweet$50.compile(file$56));
    }
};