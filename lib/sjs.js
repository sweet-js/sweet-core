var fs$0 = require('fs');
var sweet$1 = require('./sweet.js');
var argv$2 = require('optimist').usage('Usage: sjs [options] path/to/file.js').demand(1).alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').argv;
exports.run = function () {
    var infile$3 = argv$2._[0];
    var outfile$4 = argv$2.output;
    var watch$5 = argv$2.watch;
    var tokens$6 = argv$2.tokens;
    var file$7 = fs$0.readFileSync(infile$3, 'utf8');
    var module$8 = argv$2.module;
    var modulefile$9;
    if (module$8) {
        modulefile$9 = fs$0.readFileSync(module$8, 'utf8');
        file$7 = modulefile$9 + '\n' + file$7;
    }
    if (watch$5 && outfile$4) {
        fs$0.watch(infile$3, function () {
            file$7 = fs$0.readFileSync(infile$3, 'utf8');
            try {
                fs$0.writeFileSync(outfile$4, sweet$1.compile(file$7), 'utf8');
            } catch (e$10) {
                console.log(e$10);
            }
        });
    } else if (outfile$4) {
        fs$0.writeFileSync(outfile$4, sweet$1.compile(file$7), 'utf8');
    } else if (tokens$6) {
        console.log(sweet$1.expand(file$7));
    } else {
        console.log(sweet$1.compile(file$7));
    }
};