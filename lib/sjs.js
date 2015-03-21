"use strict";

var fs9521 = require("fs");
var path9522 = require("path");
var pkg9523 = require("../package.json");
var sweet9524 = require("./sweet.js");
var syn9525 = require("./syntax.js");
var esTranspiler9526 = require("es6-module-transpiler");
var Container9527 = esTranspiler9526.Container;
var FileResolver9528 = esTranspiler9526.FileResolver;
var BundleFormatter9529 = esTranspiler9526.formatters.bundle;
var argv9530 = require("optimist").usage("Usage: sjs [options] path/to/file.js").alias("o", "output").describe("o", "write files to the specified directory").alias("e", "transpile").describe("e", "use es6-module-transpiler to transpile modules into a bundle").boolean("transpile").alias("m", "sourcemap").describe("m", "generate a sourcemap").boolean("sourcemap").alias("r", "readable-names").describe("r", "remove as many hygienic renames as possible (ES5 code only!)").boolean("readable-names").alias("d", "display").describe("d", "display result of compilation to stdout (but do not write to disk)").boolean("display").alias("w", "watch").describe("w", "watch a file").boolean("watch").alias("t", "tokens").describe("t", "just emit the expanded tokens without parsing an AST").alias("a", "ast").describe("a", "just emit the expanded AST").alias("p", "no-parse").describe("p", "print out the expanded result but do not run through the parser (or apply hygienic renamings)").boolean("no-parse").alias("s", "stdin").describe("s", "read from stdin").boolean("stdin").alias("n", "num-expands").describe("n", "the maximum number of expands to perform").alias("h", "step-hygiene").describe("h", "display hygienic renames when stepping with \"--num-expands\"").describe("format-indent", "number of spaces for indentation").alias("l", "load-readtable").describe("load-readtable", "readtable module to install").alias("b", "babel").describe("babel", "run output through babel compiler").boolean("babel").describe("babel-modules", "have babel output with specified module formatter").alias("v", "version").describe("v", "display version info").boolean("version").argv;
exports.run = function () {
    if (argv9530.version) {
        return console.log("Sweet.js version: " + pkg9523.version);
    }
    var infile9531 = argv9530._[0];
    var writeToDisk9532 = argv9530.output;
    var watch9533 = argv9530.watch;
    var tokens9534 = argv9530.tokens;
    var ast9535 = argv9530.ast;
    var sourcemap9536 = argv9530.sourcemap;
    var display9537 = argv9530.display;
    var transpile9538 = argv9530.transpile;
    var noparse9539 = argv9530["no-parse"];
    var numexpands9540 = argv9530["num-expands"];
    var displayHygiene9541 = argv9530["step-hygiene"];
    var readableNames9542 = argv9530["readable-names"];
    var formatIndent9543 = parseInt(argv9530["format-indent"], 10);
    var readtableModules9544 = argv9530["load-readtable"];
    var to59545 = argv9530.babel;
    var babelModules9546 = argv9530["babel-modules"];
    if (formatIndent9543 !== formatIndent9543) {
        formatIndent9543 = 4;
    }
    var file9547;
    if (infile9531) {
        file9547 = fs9521.readFileSync(infile9531, "utf8");
    } else if (argv9530.stdin) {
        file9547 = fs9521.readFileSync("/dev/stdin", "utf8");
    } else if (argv9530._.length === 0) {
        console.log(require("optimist").help());
        return;
    }
    var cwd9548 = process.cwd();
    if (readtableModules9544) {
        readtableModules9544 = Array.isArray(readtableModules9544) ? readtableModules9544 : [readtableModules9544];
        readtableModules9544.forEach(function (mod9551) {
            sweet9524.setReadtable(mod9551);
        });
    }
    var options9549 = {
        filename: infile9531,
        compileSuffix: ".jsc",
        ast: ast9535,
        sourceMap: sourcemap9536,
        to5: to59545,
        babelModules: babelModules9546,
        readableNames: readableNames9542,
        escodegen: { format: { indent: { style: Array(formatIndent9543 + 1).join(" ") } } }
    };
    function doCompile9550(outputDirectory9552) {
        var result9553 = sweet9524.compile(file9547, options9549);
        result9553.forEach(function (res9554) {
            var outfile9555, mapfile9556;
            if (outputDirectory9552) {
                var filename9557 = path9522.basename(res9554.path);
                var dirname9558 = path9522.dirname(res9554.path);
                var relativeDir9559 = path9522.relative(dirname9558, writeToDisk9532);
                outfile9555 = path9522.resolve(dirname9558, relativeDir9559, filename9557 + options9549.compileSuffix);
                mapfile9556 = path9522.resolve(dirname9558, relativeDir9559, filename9557 + ".map");
            } else {
                outfile9555 = res9554.path + options9549.compileSuffix;
                mapfile9556 = res9554.path + ".map";
            }
            console.log("compiling: " + outfile9555);
            if (sourcemap9536) {
                fs9521.writeFileSync(outfile9555, res9554.code + "\n//# sourceMappingURL=" + mapfile9556, "utf8");
                fs9521.writeFileSync(mapfile9556, res9554.sourceMap, "utf8");
            } else {
                fs9521.writeFileSync(outfile9555, res9554.code, "utf8");
            }
        });
    }
    if (watch9533 && writeToDisk9532) {
        fs9521.watch(infile9531, function () {
            file9547 = fs9521.readFileSync(infile9531, "utf8");
            try {
                doCompile9550();
            } catch (e9560) {
                console.log(e9560);
            }
        });
    } else if (writeToDisk9532) {
        doCompile9550(writeToDisk9532);
    } else if (tokens9534) {
        console.log(sweet9524.expand(file9547, modules, { maxExpands: numexpands9540 }));
    } else if (ast9535) {
        console.log(JSON.stringify(sweet9524.compile(file9547, options9549), null, formatIndent9543));
    } else if (noparse9539) {
        var expanded9561 = sweet9524.expand(file9547, modules, { maxExpands: numexpands9540 });
        var unparsedString9562 = syn9525.prettyPrint(expanded9561, displayHygiene9541);
        console.log(unparsedString9562);
    } else if (display9537) {
        options9549.maxExpands = numexpands9540;
        var result9563 = sweet9524.compile(file9547, options9549);
        result9563.forEach(function (res9564) {
            console.log("file: " + res9564.path);
            console.log(res9564.code + "\n");
        });
    } else {
        doCompile9550();
    }
};
//# sourceMappingURL=sjs.js.map