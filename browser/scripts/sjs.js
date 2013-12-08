var fs$2051 = require('fs');
var path$2052 = require('path');
var sweet$2053 = require('./sweet.js');
var argv$2054 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').argv;
exports.run = function () {
    var infile$2055 = argv$2054._[0];
    var outfile$2056 = argv$2054.output;
    var watch$2057 = argv$2054.watch;
    var tokens$2058 = argv$2054.tokens;
    var sourcemap$2059 = argv$2054.sourcemap;
    var noparse$2060 = argv$2054['no-parse'];
    var file$2061;
    var globalMacros$2062;
    if (infile$2055) {
        file$2061 = fs$2051.readFileSync(infile$2055, 'utf8');
    } else if (argv$2054.stdin) {
        file$2061 = fs$2051.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$2054._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$2063 = argv$2054.module;
    var cwd$2064 = process.cwd();
    var Module$2065 = module.constructor;
    var modulemock$2066;
    if (mod$2063) {
        modulemock$2066 = {
            id: cwd$2064 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$2064) ? [cwd$2064] : Module$2065._nodeModulePaths(cwd$2064)
        };
        if (typeof mod$2063 === 'string') {
            mod$2063 = [mod$2063];
        }
        globalMacros$2062 = mod$2063.reduceRight(function (f$2067, m$2068) {
            var modulepath$2069 = Module$2065._resolveFilename(m$2068, modulemock$2066);
            var modulefile$2070 = fs$2051.readFileSync(modulepath$2069, 'utf8');
            return modulefile$2070 + '\n' + f$2067;
        }, '');
    }
    if (watch$2057 && outfile$2056) {
        fs$2051.watch(infile$2055, function () {
            file$2061 = fs$2051.readFileSync(infile$2055, 'utf8');
            try {
                fs$2051.writeFileSync(outfile$2056, sweet$2053.compile(file$2061, { macros: globalMacros$2062 }).code, 'utf8');
            } catch (e$2071) {
                console.log(e$2071);
            }
        });
    } else if (outfile$2056) {
        if (sourcemap$2059) {
            var result$2072 = sweet$2053.compile(file$2061, {
                    sourceMap: true,
                    filename: infile$2055,
                    macros: globalMacros$2062
                });
            var mapfile$2073 = path$2052.basename(outfile$2056) + '.map';
            fs$2051.writeFileSync(outfile$2056, result$2072.code + '\n//# sourceMappingURL=' + mapfile$2073, 'utf8');
            fs$2051.writeFileSync(outfile$2056 + '.map', result$2072.sourceMap, 'utf8');
        } else {
            fs$2051.writeFileSync(outfile$2056, sweet$2053.compile(file$2061).code, 'utf8');
        }
    } else if (tokens$2058) {
        console.log(sweet$2053.expand(file$2061, globalMacros$2062));
    } else if (noparse$2060) {
        var unparsedString$2074 = sweet$2053.expand(file$2061, globalMacros$2062).reduce(function (acc$2075, stx$2076) {
                return acc$2075 + ' ' + stx$2076.token.value;
            }, '');
        console.log(unparsedString$2074);
    } else {
        console.log(sweet$2053.compile(file$2061, { macros: globalMacros$2062 }).code);
    }
};
//# sourceMappingURL=sjs.js.map