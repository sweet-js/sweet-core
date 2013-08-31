var fs$82 = require('fs');
var sweet$83 = require('./sweet.js');
var argv$84 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('i', 'import').describe('i', 'uses the module loading path').boolean('import').argv;
exports.run = function () {
    var infile$85 = argv$84._[0];
    var outfile$86 = argv$84.output;
    var watch$87 = argv$84.watch;
    var tokens$88 = argv$84.tokens;
    var file$89;
    if (infile$85) {
        file$89 = fs$82.readFileSync(infile$85, 'utf8');
    } else {
        file$89 = fs$82.readFileSync('/dev/stdin', 'utf8');
    }
    var module$90 = argv$84.module;
    var imp$91 = argv$84.import;
    var modulefile$92;
    if (imp$91) {
        sweet$83.module(infile$85);
    }
    if (module$90) {
        modulefile$92 = fs$82.readFileSync(module$90, 'utf8');
        file$89 = modulefile$92 + '\n' + file$89;
    }
    if (watch$87 && outfile$86) {
        fs$82.watch(infile$85, function () {
            file$89 = fs$82.readFileSync(infile$85, 'utf8');
            try {
                fs$82.writeFileSync(outfile$86, sweet$83.compile(file$89), 'utf8');
            } catch (e$93) {
                console.log(e$93);
            }
        });
    } else if (outfile$86) {
        fs$82.writeFileSync(outfile$86, sweet$83.compile(file$89), 'utf8');
    } else if (tokens$88) {
        console.log(sweet$83.expand(file$89));
    } else {
        console.log(sweet$83.compile(file$89));
    }
};