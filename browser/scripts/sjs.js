var fs$1478 = require('fs');
var path$1479 = require('path');
var sweet$1480 = require('./sweet.js');
var argv$1481 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').argv;
exports.run = function () {
    var infile$1482 = argv$1481._[0];
    var outfile$1483 = argv$1481.output;
    var watch$1484 = argv$1481.watch;
    var tokens$1485 = argv$1481.tokens;
    var sourcemap$1486 = argv$1481.sourcemap;
    var noparse$1487 = argv$1481['no-parse'];
    var file$1488;
    var globalMacros$1489;
    if (infile$1482) {
        file$1488 = fs$1478.readFileSync(infile$1482, 'utf8');
    } else if (argv$1481.stdin) {
        file$1488 = fs$1478.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$1481._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$1490 = argv$1481.module;
    var cwd$1491 = process.cwd();
    var Module$1492 = module.constructor;
    var modulemock$1493;
    if (mod$1490) {
        modulemock$1493 = {
            id: cwd$1491 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$1491) ? [cwd$1491] : Module$1492._nodeModulePaths(cwd$1491)
        };
        if (typeof mod$1490 === 'string') {
            mod$1490 = [mod$1490];
        }
        globalMacros$1489 = mod$1490.reduceRight(function (f$1494, m$1495) {
            var modulepath$1496 = Module$1492._resolveFilename(m$1495, modulemock$1493);
            var modulefile$1497 = fs$1478.readFileSync(modulepath$1496, 'utf8');
            return modulefile$1497 + '\n' + f$1494;
        }, '');
    }
    if (watch$1484 && outfile$1483) {
        fs$1478.watch(infile$1482, function () {
            file$1488 = fs$1478.readFileSync(infile$1482, 'utf8');
            try {
                fs$1478.writeFileSync(outfile$1483, sweet$1480.compile(file$1488, { macros: globalMacros$1489 }).code, 'utf8');
            } catch (e$1498) {
                console.log(e$1498);
            }
        });
    } else if (outfile$1483) {
        if (sourcemap$1486) {
            var result$1499 = sweet$1480.compile(file$1488, {
                    sourceMap: true,
                    filename: infile$1482,
                    macros: globalMacros$1489
                });
            var mapfile$1500 = path$1479.basename(outfile$1483) + '.map';
            fs$1478.writeFileSync(outfile$1483, result$1499.code + '\n//# sourceMappingURL=' + mapfile$1500, 'utf8');
            fs$1478.writeFileSync(outfile$1483 + '.map', result$1499.sourceMap, 'utf8');
        } else {
            fs$1478.writeFileSync(outfile$1483, sweet$1480.compile(file$1488).code, 'utf8');
        }
    } else if (tokens$1485) {
        console.log(sweet$1480.expand(file$1488, globalMacros$1489));
    } else if (noparse$1487) {
        var unparsedString$1501 = sweet$1480.expand(file$1488, globalMacros$1489).reduce(function (acc$1502, stx$1503) {
                return acc$1502 + ' ' + stx$1503.token.value;
            }, '');
        console.log(unparsedString$1501);
    } else {
        console.log(sweet$1480.compile(file$1488, { macros: globalMacros$1489 }).code);
    }
};