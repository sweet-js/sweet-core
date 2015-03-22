"use strict";

var fs9494 = require("fs");
var path9495 = require("path");
var pkg9496 = require("../package.json");
var sweet9497 = require("./sweet.js");
var syn9498 = require("./syntax.js");
var argv9499 = require("optimist").usage("Usage: sjs [options] path/to/file.js").alias("o", "output").describe("o", "write files to the specified directory").alias("m", "sourcemap").describe("m", "generate a sourcemap").boolean("sourcemap").alias("r", "readable-names").describe("r", "remove as many hygienic renames as possible (ES5 code only!)").boolean("readable-names").alias("d", "display").describe("d", "display result of compilation to stdout (but do not write to disk)").boolean("display").alias("w", "watch").describe("w", "watch a file").boolean("watch").alias("t", "tokens").describe("t", "just emit the expanded tokens without parsing an AST").alias("a", "ast").describe("a", "just emit the expanded AST").alias("p", "no-parse").describe("p", "print out the expanded result but do not run through the parser (or apply hygienic renamings)").boolean("no-parse").alias("s", "stdin").describe("s", "read from stdin").boolean("stdin").alias("n", "num-expands").describe("n", "the maximum number of expands to perform").alias("h", "step-hygiene").describe("h", "display hygienic renames when stepping with \"--num-expands\"").describe("format-indent", "number of spaces for indentation").alias("l", "load-readtable").describe("load-readtable", "readtable module to install").alias("b", "babel").describe("babel", "run output through babel compiler").boolean("babel").describe("babel-modules", "have babel output with specified module formatter").alias("v", "version").describe("v", "display version info").boolean("version").argv;
exports.run = function () {
    if (argv9499.version) {
        return console.log("Sweet.js version: " + pkg9496.version);
    }
    var infile9500 = argv9499._[0];
    var writeToDisk9501 = argv9499.output;
    var watch9502 = argv9499.watch;
    var tokens9503 = argv9499.tokens;
    var ast9504 = argv9499.ast;
    var sourcemap9505 = argv9499.sourcemap;
    var display9506 = argv9499.display;
    var transpile9507 = argv9499.transpile;
    var noparse9508 = argv9499["no-parse"];
    var numexpands9509 = argv9499["num-expands"];
    var displayHygiene9510 = argv9499["step-hygiene"];
    var readableNames9511 = argv9499["readable-names"];
    var formatIndent9512 = parseInt(argv9499["format-indent"], 10);
    var readtableModules9513 = argv9499["load-readtable"];
    var babel9514 = argv9499.babel;
    var babelModules9515 = argv9499["babel-modules"];
    if (formatIndent9512 !== formatIndent9512) {
        formatIndent9512 = 4;
    }
    var file9516;
    if (infile9500) {
        file9516 = fs9494.readFileSync(infile9500, "utf8");
    } else if (argv9499.stdin) {
        file9516 = fs9494.readFileSync("/dev/stdin", "utf8");
    } else if (argv9499._.length === 0) {
        console.log(require("optimist").help());
        return;
    }
    var cwd9517 = process.cwd();
    if (readtableModules9513) {
        readtableModules9513 = Array.isArray(readtableModules9513) ? readtableModules9513 : [readtableModules9513];
        readtableModules9513.forEach(function (mod9520) {
            sweet9497.setReadtable(mod9520);
        });
    }
    var options9518 = {
        filename: infile9500,
        compileSuffix: ".jsc",
        ast: ast9504,
        sourceMap: sourcemap9505,
        babel: babel9514,
        babelModules: babelModules9515,
        readableNames: readableNames9511,
        escodegen: { format: { indent: { style: Array(formatIndent9512 + 1).join(" ") } } }
    };
    function doCompile9519(outputDirectory9521) {
        var result9522 = sweet9497.compile(file9516, options9518);
        result9522.forEach(function (res9523) {
            var outfile9524, mapfile9525;
            if (outputDirectory9521) {
                var filename9526 = path9495.basename(res9523.path);
                var dirname9527 = path9495.dirname(res9523.path);
                var relativeDir9528 = path9495.relative(dirname9527, writeToDisk9501);
                outfile9524 = path9495.resolve(dirname9527, relativeDir9528, filename9526 + options9518.compileSuffix);
                mapfile9525 = path9495.resolve(dirname9527, relativeDir9528, filename9526 + ".map");
            } else {
                outfile9524 = res9523.path + options9518.compileSuffix;
                mapfile9525 = res9523.path + ".map";
            }
            console.log("compiling: " + outfile9524);
            if (sourcemap9505) {
                fs9494.writeFileSync(outfile9524, res9523.code + "\n//# sourceMappingURL=" + mapfile9525, "utf8");
                fs9494.writeFileSync(mapfile9525, res9523.sourceMap, "utf8");
            } else {
                fs9494.writeFileSync(outfile9524, res9523.code, "utf8");
            }
        });
    }
    if (watch9502 && writeToDisk9501) {
        fs9494.watch(infile9500, function () {
            file9516 = fs9494.readFileSync(infile9500, "utf8");
            try {
                doCompile9519();
            } catch (e9529) {
                console.log(e9529);
            }
        });
    } else if (writeToDisk9501) {
        doCompile9519(writeToDisk9501);
    } else if (tokens9503) {
        console.log(sweet9497.expand(file9516, modules, { maxExpands: numexpands9509 }));
    } else if (ast9504) {
        console.log(JSON.stringify(sweet9497.compile(file9516, options9518), null, formatIndent9512));
    } else if (noparse9508) {
        var expanded9530 = sweet9497.expand(file9516, modules, { maxExpands: numexpands9509 });
        var unparsedString9531 = syn9498.prettyPrint(expanded9530, displayHygiene9510);
        console.log(unparsedString9531);
    } else if (display9506) {
        options9518.maxExpands = numexpands9509;
        var result9532 = sweet9497.compile(file9516, options9518);
        result9532.forEach(function (res9533) {
            console.log("file: " + res9533.path);
            console.log(res9533.code + "\n");
        });
    } else {
        doCompile9519();
    }
};
//# sourceMappingURL=sjs.js.map