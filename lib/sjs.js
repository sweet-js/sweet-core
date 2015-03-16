"use strict";

var fs9525 = require("fs");
var path9526 = require("path");
var pkg9527 = require("../package.json");
var sweet9528 = require("./sweet.js");
var syn9529 = require("./syntax.js");
var esTranspiler9530 = require("es6-module-transpiler");
var Container9531 = esTranspiler9530.Container;
var FileResolver9532 = esTranspiler9530.FileResolver;
var BundleFormatter9533 = esTranspiler9530.formatters.bundle;
var argv9534 = require("optimist").usage("Usage: sjs [options] path/to/file.js").alias("o", "output").describe("o", "write files to the specified directory").alias("e", "transpile").describe("e", "use es6-module-transpiler to transpile modules into a bundle").boolean("transpile").alias("m", "sourcemap").describe("m", "generate a sourcemap").boolean("sourcemap").alias("r", "readable-names").describe("r", "remove as many hygienic renames as possible (ES5 code only!)").boolean("readable-names").alias("d", "display").describe("d", "display result of compilation to stdout (but do not write to disk)").boolean("display").alias("w", "watch").describe("w", "watch a file").boolean("watch").alias("t", "tokens").describe("t", "just emit the expanded tokens without parsing an AST").alias("a", "ast").describe("a", "just emit the expanded AST").alias("p", "no-parse").describe("p", "print out the expanded result but do not run through the parser (or apply hygienic renamings)").boolean("no-parse").alias("s", "stdin").describe("s", "read from stdin").boolean("stdin").alias("n", "num-expands").describe("n", "the maximum number of expands to perform").alias("h", "step-hygiene").describe("h", "display hygienic renames when stepping with \"--num-expands\"").describe("format-indent", "number of spaces for indentation").alias("l", "load-readtable").describe("load-readtable", "readtable module to install").describe("to-es5", "run output through 6to5 compiler").alias("v", "version").describe("v", "display version info").boolean("version").argv;
exports.run = function () {
    if (argv9534.version) {
        return console.log("Sweet.js version: " + pkg9527.version);
    }
    var infile9535 = argv9534._[0];
    var writeToDisk9536 = argv9534.output;
    var watch9537 = argv9534.watch;
    var tokens9538 = argv9534.tokens;
    var ast9539 = argv9534.ast;
    var sourcemap9540 = argv9534.sourcemap;
    var display9541 = argv9534.display;
    var transpile9542 = argv9534.transpile;
    var noparse9543 = argv9534["no-parse"];
    var numexpands9544 = argv9534["num-expands"];
    var displayHygiene9545 = argv9534["step-hygiene"];
    var readableNames9546 = argv9534["readable-names"];
    var formatIndent9547 = parseInt(argv9534["format-indent"], 10);
    var readtableModules9548 = argv9534["load-readtable"];
    var to59549 = argv9534["to-es5"];
    if (formatIndent9547 !== formatIndent9547) {
        formatIndent9547 = 4;
    }
    var file9550;
    if (infile9535) {
        file9550 = fs9525.readFileSync(infile9535, "utf8");
    } else if (argv9534.stdin) {
        file9550 = fs9525.readFileSync("/dev/stdin", "utf8");
    } else if (argv9534._.length === 0) {
        console.log(require("optimist").help());
        return;
    }
    var cwd9551 = process.cwd();
    if (readtableModules9548) {
        readtableModules9548 = Array.isArray(readtableModules9548) ? readtableModules9548 : [readtableModules9548];
        readtableModules9548.forEach(function (mod9554) {
            sweet9528.setReadtable(mod9554);
        });
    }
    var options9552 = {
        filename: infile9535,
        compileSuffix: ".jsc",
        ast: ast9539,
        sourceMap: sourcemap9540,
        to5: to59549,
        readableNames: readableNames9546,
        escodegen: { format: { indent: { style: Array(formatIndent9547 + 1).join(" ") } } }
    };
    function doCompile9553(outputDirectory9555) {
        var result9556 = sweet9528.compile(file9550, options9552);
        result9556.forEach(function (res9557) {
            var outfile9558, mapfile9559;
            if (outputDirectory9555) {
                var filename9560 = path9526.basename(res9557.path);
                var dirname9561 = path9526.dirname(res9557.path);
                var relativeDir9562 = path9526.relative(dirname9561, writeToDisk9536);
                outfile9558 = path9526.resolve(dirname9561, relativeDir9562, filename9560 + options9552.compileSuffix);
                mapfile9559 = path9526.resolve(dirname9561, relativeDir9562, filename9560 + ".map");
            } else {
                outfile9558 = res9557.path + options9552.compileSuffix;
                mapfile9559 = res9557.path + ".map";
            }
            console.log("compiling: " + outfile9558);
            if (sourcemap9540) {
                fs9525.writeFileSync(outfile9558, res9557.code + "\n//# sourceMappingURL=" + mapfile9559, "utf8");
                fs9525.writeFileSync(mapfile9559, res9557.sourceMap, "utf8");
            } else {
                fs9525.writeFileSync(outfile9558, res9557.code, "utf8");
            }
        });
    }
    if (watch9537 && writeToDisk9536) {
        fs9525.watch(infile9535, function () {
            file9550 = fs9525.readFileSync(infile9535, "utf8");
            try {
                doCompile9553();
            } catch (e9563) {
                console.log(e9563);
            }
        });
    } else if (writeToDisk9536) {
        doCompile9553(writeToDisk9536);
    } else if (tokens9538) {
        console.log(sweet9528.expand(file9550, modules, { maxExpands: numexpands9544 }));
    } else if (ast9539) {
        console.log(JSON.stringify(sweet9528.compile(file9550, options9552), null, formatIndent9547));
    } else if (noparse9543) {
        var expanded9564 = sweet9528.expand(file9550, modules, { maxExpands: numexpands9544 });
        var unparsedString9565 = syn9529.prettyPrint(expanded9564, displayHygiene9545);
        console.log(unparsedString9565);
    } else if (display9541) {
        options9552.maxExpands = numexpands9544;
        var result9566 = sweet9528.compile(file9550, options9552);
        result9566.forEach(function (res9567) {
            console.log("file: " + res9567.path);
            console.log(res9567.code + "\n");
        });
    } else {
        doCompile9553();
    }
};
//# sourceMappingURL=sjs.js.map