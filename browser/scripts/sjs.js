var fs$1474 = require('fs');
var path$1475 = require('path');
var sweet$1476 = require('./sweet.js');
var argv$1477 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').argv;
exports.run = function () {
    var infile$1478 = argv$1477._[0];
    var outfile$1479 = argv$1477.output;
    var watch$1480 = argv$1477.watch;
    var tokens$1481 = argv$1477.tokens;
    var sourcemap$1482 = argv$1477.sourcemap;
    var noparse$1483 = argv$1477['no-parse'];
    var file$1484;
    var globalMacros$1485;
    if (infile$1478) {
        file$1484 = fs$1474.readFileSync(infile$1478, 'utf8');
    } else if (argv$1477.stdin) {
        file$1484 = fs$1474.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$1477._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$1486 = argv$1477.module;
    var cwd$1487 = process.cwd();
    var Module$1488 = module.constructor;
    var modulemock$1489;
    if (mod$1486) {
        modulemock$1489 = {
            id: cwd$1487 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$1487) ? [cwd$1487] : Module$1488._nodeModulePaths(cwd$1487)
        };
        if (typeof mod$1486 === 'string') {
            mod$1486 = [mod$1486];
        }
        globalMacros$1485 = mod$1486.reduceRight(function (f$1490, m$1491) {
            var modulepath$1492 = Module$1488._resolveFilename(m$1491, modulemock$1489);
            var modulefile$1493 = fs$1474.readFileSync(modulepath$1492, 'utf8');
            return modulefile$1493 + '\n' + f$1490;
        }, '');
    }
    if (watch$1480 && outfile$1479) {
        fs$1474.watch(infile$1478, function () {
            file$1484 = fs$1474.readFileSync(infile$1478, 'utf8');
            try {
                fs$1474.writeFileSync(outfile$1479, sweet$1476.compile(file$1484, { macros: globalMacros$1485 }).code, 'utf8');
            } catch (e$1494) {
                console.log(e$1494);
            }
        });
    } else if (outfile$1479) {
        if (sourcemap$1482) {
            var result$1495 = sweet$1476.compile(file$1484, {
                    sourceMap: true,
                    filename: infile$1478,
                    macros: globalMacros$1485
                });
            var mapfile$1496 = path$1475.basename(outfile$1479) + '.map';
            fs$1474.writeFileSync(outfile$1479, result$1495.code + '\n//# sourceMappingURL=' + mapfile$1496, 'utf8');
            fs$1474.writeFileSync(outfile$1479 + '.map', result$1495.sourceMap, 'utf8');
        } else {
            fs$1474.writeFileSync(outfile$1479, sweet$1476.compile(file$1484).code, 'utf8');
        }
    } else if (tokens$1481) {
        console.log(sweet$1476.expand(file$1484, globalMacros$1485));
    } else if (noparse$1483) {
        var unparsedString$1497 = sweet$1476.expand(file$1484, globalMacros$1485).reduce(function (acc$1498, stx$1499) {
                return acc$1498 + ' ' + stx$1499.token.value;
            }, '');
        console.log(unparsedString$1497);
    } else {
        console.log(sweet$1476.compile(file$1484, { macros: globalMacros$1485 }).code);
    }
};
