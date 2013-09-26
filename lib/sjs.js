var fs$97 = require('fs');
var path$98 = require('path');
var sweet$99 = require('./sweet.js');
var argv$100 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in npm path').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').argv;
exports.run = function () {
    var infile$101 = argv$100._[0];
    var outfile$102 = argv$100.output;
    var watch$103 = argv$100.watch;
    var tokens$104 = argv$100.tokens;
    var sourcemap$105 = argv$100.sourcemap;
    var file$106;
    if (infile$101) {
        file$106 = fs$97.readFileSync(infile$101, 'utf8');
    } else if (argv$100.stdin) {
        file$106 = fs$97.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$100._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$107 = argv$100.module;
    var cwd$108 = process.cwd();
    var Module$109 = module.constructor;
    var modulepath$110, modulefile$111, modulemock$112;
    if (mod$107) {
        modulemock$112 = {
            id: cwd$108 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$108) ? [cwd$108] : Module$109._nodeModulePaths(cwd$108)
        };
        modulepath$110 = Module$109._resolveFilename(mod$107, modulemock$112);
        modulefile$111 = fs$97.readFileSync(modulepath$110, 'utf8');
        file$106 = modulefile$111 + '\n' + file$106;
    }
    if (watch$103 && outfile$102) {
        fs$97.watch(infile$101, function () {
            file$106 = fs$97.readFileSync(infile$101, 'utf8');
            try {
                fs$97.writeFileSync(outfile$102, sweet$99.compile(file$106), 'utf8');
            } catch (e$113) {
                console.log(e$113);
            }
        });
    } else if (outfile$102) {
        if (sourcemap$105) {
            var result$114 = sweet$99.compileWithSourcemap(file$106, infile$101);
            var mapfile$115 = path$98.basename(outfile$102) + '.map';
            fs$97.writeFileSync(outfile$102, result$114[0] + '\n//# sourceMappingURL=' + mapfile$115, 'utf8');
            fs$97.writeFileSync(outfile$102 + '.map', result$114[1], 'utf8');
        } else {
            fs$97.writeFileSync(outfile$102, sweet$99.compile(file$106), 'utf8');
        }
    } else if (tokens$104) {
        console.log(sweet$99.expand(file$106));
    } else {
        console.log(sweet$99.compile(file$106));
    }
};