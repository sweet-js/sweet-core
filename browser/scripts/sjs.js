var fs$2117 = require('fs');
var path$2118 = require('path');
var sweet$2119 = require('./sweet.js');
var argv$2120 = require('optimist').usage('Usage: sjs [options] path/to/file.js').alias('o', 'output').describe('o', 'Output file path').alias('m', 'module').describe('m', 'use a module file for loading macro definitions. Use ./ or ../ for relative path otherwise looks up in installed npm packages').alias('w', 'watch').describe('w', 'watch a file').boolean('watch').alias('t', 'tokens').describe('t', 'just emit the expanded tokens without parsing an AST').alias('p', 'no-parse').describe('p', 'print out the expanded result but do not run through the parser (or apply hygienic renamings)').boolean('no-parse').alias('s', 'stdin').describe('s', 'read from stdin').boolean('stdin').alias('c', 'sourcemap').describe('c', 'generate a sourcemap').boolean('sourcemap').argv;
exports.run = function () {
    var infile$2121 = argv$2120._[0];
    var outfile$2122 = argv$2120.output;
    var watch$2123 = argv$2120.watch;
    var tokens$2124 = argv$2120.tokens;
    var sourcemap$2125 = argv$2120.sourcemap;
    var noparse$2126 = argv$2120['no-parse'];
    var file$2127;
    var globalMacros$2128;
    if (infile$2121) {
        file$2127 = fs$2117.readFileSync(infile$2121, 'utf8');
    } else if (argv$2120.stdin) {
        file$2127 = fs$2117.readFileSync('/dev/stdin', 'utf8');
    } else if (argv$2120._.length === 0) {
        console.log(require('optimist').help());
        return;
    }
    var mod$2129 = argv$2120.module;
    var cwd$2130 = process.cwd();
    var Module$2131 = module.constructor;
    var modulemock$2132;
    if (mod$2129) {
        modulemock$2132 = {
            id: cwd$2130 + '/$sweet-loader.js',
            filename: '$sweet-loader.js',
            paths: /^\.\/|\.\./.test(cwd$2130) ? [cwd$2130] : Module$2131._nodeModulePaths(cwd$2130)
        };
        if (typeof mod$2129 === 'string') {
            mod$2129 = [mod$2129];
        }
        globalMacros$2128 = mod$2129.reduceRight(function (f$2133, m$2134) {
            var modulepath$2135 = Module$2131._resolveFilename(m$2134, modulemock$2132);
            var modulefile$2136 = fs$2117.readFileSync(modulepath$2135, 'utf8');
            return modulefile$2136 + '\n' + f$2133;
        }, '');
    }
    if (watch$2123 && outfile$2122) {
        fs$2117.watch(infile$2121, function () {
            file$2127 = fs$2117.readFileSync(infile$2121, 'utf8');
            try {
                fs$2117.writeFileSync(outfile$2122, sweet$2119.compile(file$2127, { macros: globalMacros$2128 }).code, 'utf8');
            } catch (e$2137) {
                console.log(e$2137);
            }
        });
    } else if (outfile$2122) {
        if (sourcemap$2125) {
            var result$2138 = sweet$2119.compile(file$2127, {
                    sourceMap: true,
                    filename: infile$2121,
                    macros: globalMacros$2128
                });
            var mapfile$2139 = path$2118.basename(outfile$2122) + '.map';
            fs$2117.writeFileSync(outfile$2122, result$2138.code + '\n//# sourceMappingURL=' + mapfile$2139, 'utf8');
            fs$2117.writeFileSync(outfile$2122 + '.map', result$2138.sourceMap, 'utf8');
        } else {
            fs$2117.writeFileSync(outfile$2122, sweet$2119.compile(file$2127).code, 'utf8');
        }
    } else if (tokens$2124) {
        console.log(sweet$2119.expand(file$2127, globalMacros$2128));
    } else if (noparse$2126) {
        var unparsedString$2140 = sweet$2119.expand(file$2127, globalMacros$2128).reduce(function (acc$2141, stx$2142) {
                return acc$2141 + ' ' + stx$2142.token.value;
            }, '');
        console.log(unparsedString$2140);
    } else {
        console.log(sweet$2119.compile(file$2127, { macros: globalMacros$2128 }).code);
    }
};
//# sourceMappingURL=sjs.js.map