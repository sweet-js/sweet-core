var fs$1194 = require('fs');
var path$1195 = require('path');
var sweet$1196 = require('./sweet.js');
var argv$1197 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').argv;
exports.run = function () {
    var infile$1199 = argv$1197._[0];
    var outfile$1200 = argv$1197.output;
    var watch$1201 = argv$1197.watch;
    var tokens$1202 = argv$1197.tokens;
    var sourcemap$1203 = argv$1197.sourcemap;
    var file$1204;
    if (infile$1199) {
        file$1204 = fs$1194.readFileSync(infile$1199, 'utf8');
    } else if (argv$1197.stdin) {
        file$1204 = fs$1194.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$1197._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$1205 = argv$1197.module;
    var cwd$1206 = process.cwd();
    var Module$1207 = module.constructor;
    var modulemock$1208;
    if (mod$1205) {
        modulemock$1208 = {
            id: cwd$1206 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$1206) ? [cwd$1206] : Module$1207._nodeModulePaths(cwd$1206)
        };
        if (typeof mod$1205 === 'string') {
            mod$1205 = [mod$1205];
        }
        file$1204 = mod$1205.reduceRight(function (f$1210, m$1211) {
            var modulepath$1212 = Module$1207._resolveFilename(m$1211, modulemock$1208);
            var modulefile$1213 = fs$1194.readFileSync(modulepath$1212, 'utf8');
            return modulefile$1213 + '\n' + f$1210;
        }, file$1204);
    }
    if (watch$1201 && outfile$1200) {
        fs$1194.watch(infile$1199, function () {
            file$1204 = fs$1194.readFileSync(infile$1199, 'utf8');
            try {
                fs$1194.writeFileSync(outfile$1200, sweet$1196.compile(file$1204).code, 'utf8');
            } catch (e$1215) {
                console.log(e$1215);
            }
        });
    } else if (outfile$1200) {
        if (sourcemap$1203) {
            var result$1216 = sweet$1196.compile(file$1204, {
                    sourceMap: true,
                    filename: infile$1199
                });
            var mapfile$1217 = path$1195.basename(outfile$1200) + '.map';
            fs$1194.writeFileSync(outfile$1200, result$1216.code + '\n//# sourceMappingURL=' + mapfile$1217, 'utf8');
            fs$1194.writeFileSync(outfile$1200 + '.map', result$1216.sourceMap, 'utf8');
        } else {
            fs$1194.writeFileSync(outfile$1200, sweet$1196.compile(file$1204).code, 'utf8');
        }
    } else if (tokens$1202) {
        console.log(sweet$1196.expand(file$1204));
    } else {
        console.log(sweet$1196.compile(file$1204).code);
    }
};