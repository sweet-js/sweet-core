var fs$12 = require('fs');
var sweet$13 = require('./sweet.js');
var argv$14 = require('optimist').usage('Usage: sjs [options] path/to/file.js').demand(1).alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').argv;
exports.run = function () {
    var infile$5 = argv$14._[0];
    var outfile$6 = argv$14.output;
    var watch$7 = argv$14.watch;
    var tokens$8 = argv$14.tokens;
    var file$9 = fs$12.readFileSync(infile$5, 'utf8');
    var module$10 = argv$14.module;
    var modulefile$11;
    if (module$10) {
        modulefile$11 = fs$12.readFileSync(module$10, 'utf8');
        file$9 = modulefile$11 + '\n' + file$9;
    }
    if (watch$7 && outfile$6) {
        fs$12.watch(infile$5, function () {
            file$9 = fs$12.readFileSync(infile$5, 'utf8');
            try {
                fs$12.writeFileSync(outfile$6, sweet$13.compile(file$9), 'utf8');
            } catch (e$3) {
                console.log(e$3);
            }
        });
    } else if (outfile$6) {
        fs$12.writeFileSync(outfile$6, sweet$13.compile(file$9), 'utf8');
    } else if (tokens$8) {
        console.log(sweet$13.expand(file$9));
    } else {
        console.log(sweet$13.compile(file$9));
    }
};