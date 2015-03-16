"use strict";

var fs9537 = require("fs");
var path9538 = require("path");
var pkg9539 = require("../package.json");
var sweet9540 = require("./sweet.js");
var syn9541 = require("./syntax.js");
var esTranspiler9542 = require("es6-module-transpiler");
var Container9543 = esTranspiler9542.Container;
var FileResolver9544 = esTranspiler9542.FileResolver;
var BundleFormatter9545 = esTranspiler9542.formatters.bundle;
var argv9546 = require("optimist").usage("Usage: sjs [options] path/to/file.js").alias("o", "output").describe("o", "write files to the specified directory").alias("e", "transpile").describe("e", "use es6-module-transpiler to transpile modules into a bundle").boolean("transpile").alias("m", "sourcemap").describe("m", "generate a sourcemap").boolean("sourcemap").alias("r", "readable-names").describe("r", "remove as many hygienic renames as possible (ES5 code only!)").boolean("readable-names").alias("d", "display").describe("d", "display result of compilation to stdout (but do not write to disk)").boolean("display").alias("w", "watch").describe("w", "watch a file").boolean("watch").alias("t", "tokens").describe("t", "just emit the expanded tokens without parsing an AST").alias("a", "ast").describe("a", "just emit the expanded AST").alias("p", "no-parse").describe("p", "print out the expanded result but do not run through the parser (or apply hygienic renamings)").boolean("no-parse").alias("s", "stdin").describe("s", "read from stdin").boolean("stdin").alias("n", "num-expands").describe("n", "the maximum number of expands to perform").alias("h", "step-hygiene").describe("h", "display hygienic renames when stepping with \"--num-expands\"").describe("format-indent", "number of spaces for indentation").alias("l", "load-readtable").describe("load-readtable", "readtable module to install").describe("to-es5", "run output through 6to5 compiler").alias("v", "version").describe("v", "display version info").boolean("version").argv;
exports.run = function () {
    if (argv9546.version) {
        return console.log("Sweet.js version: " + pkg9539.version);
    }
    var infile9547 = argv9546._[0];
    var writeToDisk9548 = argv9546.output;
    var watch9549 = argv9546.watch;
    var tokens9550 = argv9546.tokens;
    var ast9551 = argv9546.ast;
    var sourcemap9552 = argv9546.sourcemap;
    var display9553 = argv9546.display;
    var transpile9554 = argv9546.transpile;
    var noparse9555 = argv9546["no-parse"];
    var numexpands9556 = argv9546["num-expands"];
    var displayHygiene9557 = argv9546["step-hygiene"];
    var readableNames9558 = argv9546["readable-names"];
    var formatIndent9559 = parseInt(argv9546["format-indent"], 10);
    var readtableModules9560 = argv9546["load-readtable"];
    var to59561 = argv9546["to-es5"];
    if (formatIndent9559 !== formatIndent9559) {
        formatIndent9559 = 4;
    }
    var file9562;
    if (infile9547) {
        file9562 = fs9537.readFileSync(infile9547, "utf8");
    } else if (argv9546.stdin) {
        file9562 = fs9537.readFileSync("/dev/stdin", "utf8");
    } else if (argv9546._.length === 0) {
        console.log(require("optimist").help());
        return;
    }
    var cwd9563 = process.cwd();
    if (readtableModules9560) {
        readtableModules9560 = Array.isArray(readtableModules9560) ? readtableModules9560 : [readtableModules9560];
        readtableModules9560.forEach(function (mod9566) {
            sweet9540.setReadtable(mod9566);
        });
    }
    var options9564 = {
        filename: infile9547,
        compileSuffix: ".jsc",
        ast: ast9551,
        sourceMap: sourcemap9552,
        to5: to59561,
        readableNames: readableNames9558,
        escodegen: { format: { indent: { style: Array(formatIndent9559 + 1).join(" ") } } }
    };
    function doCompile9565(outputDirectory9567) {
        var result9568 = sweet9540.compile(file9562, options9564);
        result9568.forEach(function (res9569) {
            var outfile9570, mapfile9571;
            if (outputDirectory9567) {
                var filename9572 = path9538.basename(res9569.path);
                var dirname9573 = path9538.dirname(res9569.path);
                var relativeDir9574 = path9538.relative(dirname9573, writeToDisk9548);
                outfile9570 = path9538.resolve(dirname9573, relativeDir9574, filename9572 + options9564.compileSuffix);
                mapfile9571 = path9538.resolve(dirname9573, relativeDir9574, filename9572 + ".map");
            } else {
                outfile9570 = res9569.path + options9564.compileSuffix;
                mapfile9571 = res9569.path + ".map";
            }
            console.log("compiling: " + outfile9570);
            if (sourcemap9552) {
                fs9537.writeFileSync(outfile9570, res9569.code + "\n//# sourceMappingURL=" + mapfile9571, "utf8");
                fs9537.writeFileSync(mapfile9571, res9569.sourceMap, "utf8");
            } else {
                fs9537.writeFileSync(outfile9570, res9569.code, "utf8");
            }
        });
    }
    if (watch9549 && writeToDisk9548) {
        fs9537.watch(infile9547, function () {
            file9562 = fs9537.readFileSync(infile9547, "utf8");
            try {
                doCompile9565();
            } catch (e9575) {
                console.log(e9575);
            }
        });
    } else if (writeToDisk9548) {
        doCompile9565(writeToDisk9548);
    } else if (tokens9550) {
        console.log(sweet9540.expand(file9562, modules, { maxExpands: numexpands9556 }));
    } else if (ast9551) {
        console.log(JSON.stringify(sweet9540.compile(file9562, options9564), null, formatIndent9559));
    } else if (noparse9555) {
        var expanded9576 = sweet9540.expand(file9562, modules, { maxExpands: numexpands9556 });
        var unparsedString9577 = syn9541.prettyPrint(expanded9576, displayHygiene9557);
        console.log(unparsedString9577);
    } else if (display9553) {
        options9564.maxExpands = numexpands9556;
        var result9578 = sweet9540.compile(file9562, options9564);
        result9578.forEach(function (res9579) {
            console.log("file: " + res9579.path);
            console.log(res9579.code + "\n");
        });
    } else {
        doCompile9565();
    }
};
//# sourceMappingURL=sjs.js.map