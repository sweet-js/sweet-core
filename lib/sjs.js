"use strict";

var fs9310 = require("fs");
var path9311 = require("path");
var pkg9312 = require("../package.json");
var sweet9313 = require("./sweet.js");
var syn9314 = require("./syntax.js");
var argv9315 = require("optimist").usage("Usage: sjs [options] path/to/file.js").alias("o", "output").describe("o", "write files to the specified directory").alias("m", "sourcemap").describe("m", "generate a sourcemap").boolean("sourcemap").alias("r", "readable-names").describe("r", "remove as many hygienic renames as possible (ES5 code only!)").boolean("readable-names").alias("d", "display").describe("d", "display result of compilation to stdout (but do not write to disk)").boolean("display").alias("w", "watch").describe("w", "watch a file").boolean("watch").alias("t", "tokens").describe("t", "just emit the expanded tokens without parsing an AST").alias("a", "ast").describe("a", "just emit the expanded AST").alias("p", "no-parse").describe("p", "print out the expanded result but do not run through the parser (or apply hygienic renamings)").boolean("no-parse").alias("s", "stdin").describe("s", "read from stdin").boolean("stdin").alias("n", "num-expands").describe("n", "the maximum number of expands to perform").alias("h", "step-hygiene").describe("h", "display hygienic renames when stepping with \"--num-expands\"").describe("format-indent", "number of spaces for indentation").alias("l", "load-readtable").describe("load-readtable", "readtable module to install").alias("b", "babel").describe("babel", "run output through babel compiler").boolean("babel").describe("babel-modules", "have babel output with specified module formatter").alias("v", "version").describe("v", "display version info").boolean("version").argv;
exports.run = function () {
    if (argv9315.version) {
        return console.log("Sweet.js version: " + pkg9312.version);
    }
    var infile9316 = argv9315._[0];
    var writeToDisk9317 = argv9315.output;
    var watch9318 = argv9315.watch;
    var tokens9319 = argv9315.tokens;
    var ast9320 = argv9315.ast;
    var sourcemap9321 = argv9315.sourcemap;
    var display9322 = argv9315.display;
    var transpile9323 = argv9315.transpile;
    var noparse9324 = argv9315["no-parse"];
    var numexpands9325 = argv9315["num-expands"];
    var displayHygiene9326 = argv9315["step-hygiene"];
    var readableNames9327 = argv9315["readable-names"];
    var formatIndent9328 = parseInt(argv9315["format-indent"], 10);
    var readtableModules9329 = argv9315["load-readtable"];
    var babel9330 = argv9315.babel;
    var babelModules9331 = argv9315["babel-modules"];
    if (formatIndent9328 !== formatIndent9328) {
        formatIndent9328 = 4;
    }
    var file9332;
    if (infile9316) {
        file9332 = fs9310.readFileSync(infile9316, "utf8");
    } else if (argv9315.stdin) {
        file9332 = fs9310.readFileSync("/dev/stdin", "utf8");
    } else if (argv9315._.length === 0) {
        console.log(require("optimist").help());
        return;
    }
    var cwd9333 = process.cwd();
    if (readtableModules9329) {
        readtableModules9329 = Array.isArray(readtableModules9329) ? readtableModules9329 : [readtableModules9329];
        readtableModules9329.forEach(function (mod9336) {
            sweet9313.setReadtable(mod9336);
        });
    }
    var options9334 = {
        filename: infile9316,
        compileSuffix: ".jsc",
        ast: ast9320,
        sourceMap: sourcemap9321,
        babel: babel9330,
        babelModules: babelModules9331,
        readableNames: readableNames9327,
        escodegen: { format: { indent: { style: Array(formatIndent9328 + 1).join(" ") } } }
    };
    function doCompile9335(outputDirectory9337) {
        var result9338 = sweet9313.compile(file9332, options9334);
        result9338.forEach(function (res9339) {
            var outfile9340, mapfile9341;
            if (outputDirectory9337) {
                var filename9342 = path9311.basename(res9339.path);
                var dirname9343 = path9311.dirname(res9339.path);
                var relativeDir9344 = path9311.relative(dirname9343, writeToDisk9317);
                outfile9340 = path9311.resolve(dirname9343, relativeDir9344, filename9342 + options9334.compileSuffix);
                mapfile9341 = path9311.resolve(dirname9343, relativeDir9344, filename9342 + ".map");
            } else {
                outfile9340 = res9339.path + options9334.compileSuffix;
                mapfile9341 = res9339.path + ".map";
            }
            console.log("compiling: " + outfile9340);
            if (sourcemap9321) {
                fs9310.writeFileSync(outfile9340, res9339.code + "\n//# sourceMappingURL=" + mapfile9341, "utf8");
                fs9310.writeFileSync(mapfile9341, res9339.sourceMap, "utf8");
            } else {
                fs9310.writeFileSync(outfile9340, res9339.code, "utf8");
            }
        });
    }
    if (watch9318 && writeToDisk9317) {
        fs9310.watch(infile9316, function () {
            file9332 = fs9310.readFileSync(infile9316, "utf8");
            try {
                doCompile9335();
            } catch (e9345) {
                console.log(e9345);
            }
        });
    } else if (writeToDisk9317) {
        doCompile9335(writeToDisk9317);
    } else if (tokens9319) {
        console.log(sweet9313.expand(file9332, modules, { maxExpands: numexpands9325 }));
    } else if (ast9320) {
        console.log(JSON.stringify(sweet9313.compile(file9332, options9334), null, formatIndent9328));
    } else if (noparse9324) {
        var expanded9346 = sweet9313.expand(file9332, modules, { maxExpands: numexpands9325 });
        var unparsedString9347 = syn9314.prettyPrint(expanded9346, displayHygiene9326);
        console.log(unparsedString9347);
    } else if (display9322) {
        options9334.maxExpands = numexpands9325;
        var result9348 = sweet9313.compile(file9332, options9334);
        result9348.forEach(function (res9349) {
            console.log("file: " + res9349.path);
            console.log(res9349.code + "\n");
        });
    } else {
        doCompile9335();
    }
};
//# sourceMappingURL=sjs.js.map