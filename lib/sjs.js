var fs$84 = require('fs');
var sweet$85 = require('./sweet.js');
var argv$86 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('i', 'import').describe('i', 'uses the module loading path').boolean('import').argv;
exports.run = function () {
    var infile$87 = argv$86._[0];
    var outfile$88 = argv$86.output;
    var watch$89 = argv$86.watch;
    var tokens$90 = argv$86.tokens;
    var file$91;
    if (infile$87) {
        file$91 = fs$84.readFileSync(infile$87, 'utf8');
    } else {
        file$91 = fs$84.readFileSync('/dev/stdin', 'utf8');
    }
    var module$92 = argv$86.module;
    var imp$93 = argv$86.import;
    var modulefile$94;
    if (imp$93) {
        sweet$85.module(infile$87);
    }
    if (module$92) {
        modulefile$94 = fs$84.readFileSync(module$92, 'utf8');
        file$91 = modulefile$94 + '\n' + file$91;
    }
    if (watch$89 && outfile$88) {
        fs$84.watch(infile$87, function () {
            file$91 = fs$84.readFileSync(infile$87, 'utf8');
            try {
                fs$84.writeFileSync(outfile$88, sweet$85.compile(file$91), 'utf8');
            } catch (e$95) {
                console.log(e$95);
            }
        });
    } else if (outfile$88) {
        fs$84.writeFileSync(outfile$88, sweet$85.compile(file$91), 'utf8');
    } else if (tokens$90) {
        console.log(sweet$85.expand(file$91));
    } else {
        console.log(sweet$85.compile(file$91));
    }
};