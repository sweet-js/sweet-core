"use strict";

var fs9490 = require("fs");
var path9491 = require("path");
var pkg9492 = require("../package.json");
var sweet9493 = require("./sweet.js");
var syn9494 = require("./syntax.js");
var argv9495 = require("optimist").usage("Usage: sjs [options] path/to/file.js").alias("o", "output").describe("o", "write files to the specified directory").alias("m", "sourcemap").describe("m", "generate a sourcemap").boolean("sourcemap").alias("r", "readable-names").describe("r", "remove as many hygienic renames as possible (ES5 code only!)").boolean("readable-names").alias("d", "display").describe("d", "display result of compilation to stdout (but do not write to disk)").boolean("display").alias("w", "watch").describe("w", "watch a file").boolean("watch").alias("t", "tokens").describe("t", "just emit the expanded tokens without parsing an AST").alias("a", "ast").describe("a", "just emit the expanded AST").alias("p", "no-parse").describe("p", "print out the expanded result but do not run through the parser (or apply hygienic renamings)").boolean("no-parse").alias("s", "stdin").describe("s", "read from stdin").boolean("stdin").alias("n", "num-expands").describe("n", "the maximum number of expands to perform").alias("h", "step-hygiene").describe("h", "display hygienic renames when stepping with \"--num-expands\"").describe("format-indent", "number of spaces for indentation").alias("l", "load-readtable").describe("load-readtable", "readtable module to install").alias("b", "babel").describe("babel", "run output through babel compiler").boolean("babel").describe("babel-modules", "have babel output with specified module formatter").alias("v", "version").describe("v", "display version info").boolean("version").argv;
exports.run = function () {
    if (argv9495.version) {
        return console.log("Sweet.js version: " + pkg9492.version);
    }
    var infile9496 = argv9495._[0];
    var writeToDisk9497 = argv9495.output;
    var watch9498 = argv9495.watch;
    var tokens9499 = argv9495.tokens;
    var ast9500 = argv9495.ast;
    var sourcemap9501 = argv9495.sourcemap;
    var display9502 = argv9495.display;
    var transpile9503 = argv9495.transpile;
    var noparse9504 = argv9495["no-parse"];
    var numexpands9505 = argv9495["num-expands"];
    var displayHygiene9506 = argv9495["step-hygiene"];
    var readableNames9507 = argv9495["readable-names"];
    var formatIndent9508 = parseInt(argv9495["format-indent"], 10);
    var readtableModules9509 = argv9495["load-readtable"];
    var babel9510 = argv9495.babel;
    var babelModules9511 = argv9495["babel-modules"];
    if (formatIndent9508 !== formatIndent9508) {
        formatIndent9508 = 4;
    }
    var file9512;
    if (infile9496) {
        file9512 = fs9490.readFileSync(infile9496, "utf8");
    } else if (argv9495.stdin) {
        file9512 = fs9490.readFileSync("/dev/stdin", "utf8");
    } else if (argv9495._.length === 0) {
        console.log(require("optimist").help());
        return;
    }
    var cwd9513 = process.cwd();
    if (readtableModules9509) {
        readtableModules9509 = Array.isArray(readtableModules9509) ? readtableModules9509 : [readtableModules9509];
        readtableModules9509.forEach(function (mod9516) {
            sweet9493.setReadtable(mod9516);
        });
    }
    var options9514 = {
        filename: infile9496,
        compileSuffix: ".jsc",
        ast: ast9500,
        sourceMap: sourcemap9501,
        babel: babel9510,
        babelModules: babelModules9511,
        readableNames: readableNames9507,
        escodegen: { format: { indent: { style: Array(formatIndent9508 + 1).join(" ") } } }
    };
    function doCompile9515(outputDirectory9517) {
        var result9518 = sweet9493.compile(file9512, options9514);
        result9518.forEach(function (res9519) {
            var outfile9520, mapfile9521;
            if (outputDirectory9517) {
                var filename9522 = path9491.basename(res9519.path);
                var dirname9523 = path9491.dirname(res9519.path);
                var relativeDir9524 = path9491.relative(dirname9523, writeToDisk9497);
                outfile9520 = path9491.resolve(dirname9523, relativeDir9524, filename9522 + options9514.compileSuffix);
                mapfile9521 = path9491.resolve(dirname9523, relativeDir9524, filename9522 + ".map");
            } else {
                outfile9520 = res9519.path + options9514.compileSuffix;
                mapfile9521 = res9519.path + ".map";
            }
            console.log("compiling: " + outfile9520);
            if (sourcemap9501) {
                fs9490.writeFileSync(outfile9520, res9519.code + "\n//# sourceMappingURL=" + mapfile9521, "utf8");
                fs9490.writeFileSync(mapfile9521, res9519.sourceMap, "utf8");
            } else {
                fs9490.writeFileSync(outfile9520, res9519.code, "utf8");
            }
        });
    }
    if (watch9498 && writeToDisk9497) {
        fs9490.watch(infile9496, function () {
            file9512 = fs9490.readFileSync(infile9496, "utf8");
            try {
                doCompile9515();
            } catch (e9525) {
                console.log(e9525);
            }
        });
    } else if (writeToDisk9497) {
        doCompile9515(writeToDisk9497);
    } else if (tokens9499) {
        console.log(sweet9493.expand(file9512, modules, { maxExpands: numexpands9505 }));
    } else if (ast9500) {
        console.log(JSON.stringify(sweet9493.compile(file9512, options9514), null, formatIndent9508));
    } else if (noparse9504) {
        var expanded9526 = sweet9493.expand(file9512, modules, { maxExpands: numexpands9505 });
        var unparsedString9527 = syn9494.prettyPrint(expanded9526, displayHygiene9506);
        console.log(unparsedString9527);
    } else if (display9502) {
        options9514.maxExpands = numexpands9505;
        var result9528 = sweet9493.compile(file9512, options9514);
        result9528.forEach(function (res9529) {
            console.log("file: " + res9529.path);
            console.log(res9529.code + "\n");
        });
    } else {
        doCompile9515();
    }
};
//# sourceMappingURL=sjs.js.map