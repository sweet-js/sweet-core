// export syntax
// export macro;
var fs$186 = require('fs');
var path$187 = require('path');
var sweet$188 = require('./sweet.js');
var argv$189 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').argv;
exports.run = function () {
    var infile$190 = argv$189._[0];
    var outfile$191 = argv$189.output;
    var watch$192 = argv$189.watch;
    var tokens$193 = argv$189.tokens;
    var sourcemap$194 = argv$189.sourcemap;
    var file$195;
    if (infile$190) {
        file$195 = fs$186.readFileSync(infile$190, 'utf8');
    } else if (argv$189.stdin) {
        file$195 = fs$186.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$189._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var module$196 = argv$189.module;
    var modulefile$197;
    if (module$196) {
        modulefile$197 = fs$186.readFileSync(module$196, 'utf8');
        file$195 = modulefile$197 + '\n' + file$195;
    }
    if (watch$192 && outfile$191) {
        fs$186.watch(infile$190, function () {
            file$195 = fs$186.readFileSync(infile$190, 'utf8');
            try {
                fs$186.writeFileSync(outfile$191, sweet$188.compile(file$195), 'utf8');
            } catch (e$198) {
                console.log(e$198);
            }
        });
    } else if (outfile$191) {
        if (sourcemap$194) {
            var result$199 = sweet$188.compileWithSourcemap(file$195, infile$190);
            var mapfile$200 = path$187.basename(outfile$191) + '.map';
            fs$186.writeFileSync(outfile$191, result$199[0] + '\n//# sourceMappingURL=' + mapfile$200, 'utf8');
            fs$186.writeFileSync(outfile$191 + '.map', result$199[1], 'utf8');
        } else {
            fs$186.writeFileSync(outfile$191, sweet$188.compile(file$195), 'utf8');
        }
    } else if (tokens$193) {
        console.log(sweet$188.expand(file$195));
    } else {
        console.log(sweet$188.compile(file$195));
    }
};