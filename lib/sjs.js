var fs$1276 = require('fs');
var path$1277 = require('path');
var sweet$1278 = require('./sweet.js');
var argv$1279 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').argv;
exports.run = function () {
    var infile$1282 = argv$1279._[0];
    var outfile$1283 = argv$1279.output;
    var watch$1284 = argv$1279.watch;
    var tokens$1285 = argv$1279.tokens;
    var sourcemap$1286 = argv$1279.sourcemap;
    var file$1287;
    if (infile$1282) {
        file$1287 = fs$1276.readFileSync(infile$1282, 'utf8');
    } else if (argv$1279.stdin) {
        file$1287 = fs$1276.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$1279._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$1288 = argv$1279.module;
    var cwd$1289 = process.cwd();
    var Module$1290 = module.constructor;
    var modulemock$1291;
    if (mod$1288) {
        modulemock$1291 = {
            id: cwd$1289 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$1289) ? [cwd$1289] : Module$1290._nodeModulePaths(cwd$1289)
        };
        if (typeof mod$1288 === 'string') {
            mod$1288 = [mod$1288];
        }
        file$1287 = mod$1288.reduceRight(function (f$1294, m$1295) {
            var modulepath$1296 = Module$1290._resolveFilename(m$1295, modulemock$1291);
            var modulefile$1297 = fs$1276.readFileSync(modulepath$1296, 'utf8');
            return modulefile$1297 + '\n' + f$1294;
        }, file$1287);
    }
    if (watch$1284 && outfile$1283) {
        fs$1276.watch(infile$1282, function () {
            file$1287 = fs$1276.readFileSync(infile$1282, 'utf8');
            try {
                fs$1276.writeFileSync(outfile$1283, sweet$1278.compile(file$1287), 'utf8');
            } catch (e$1300) {
                console.log(e$1300);
            }
        });
    } else if (outfile$1283) {
        if (sourcemap$1286) {
            var result$1301 = sweet$1278.compileWithSourcemap(file$1287, infile$1282);
            var mapfile$1302 = path$1277.basename(outfile$1283) + '.map';
            fs$1276.writeFileSync(outfile$1283, result$1301.code + '\n//# sourceMappingURL=' + mapfile$1302, 'utf8');
            fs$1276.writeFileSync(outfile$1283 + '.map', result$1301.sourceMap, 'utf8');
        } else {
            fs$1276.writeFileSync(outfile$1283, sweet$1278.compile(file$1287), 'utf8');
        }
    } else if (tokens$1285) {
        console.log(sweet$1278.expand(file$1287));
    } else {
        console.log(sweet$1278.compile(file$1287));
    }
};