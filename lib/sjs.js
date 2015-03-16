"use strict";

var fs9555 = require("fs");
var path9556 = require("path");
var pkg9557 = require("../package.json");
var sweet9558 = require("./sweet.js");
var syn9559 = require("./syntax.js");
var esTranspiler9560 = require("es6-module-transpiler");
var Container9561 = esTranspiler9560.Container;
var FileResolver9562 = esTranspiler9560.FileResolver;
var BundleFormatter9563 = esTranspiler9560.formatters.bundle;
var argv9564 = require("optimist").usage("Usage: sjs [options] path/to/file.js").alias("o", "output").describe("o", "write files to the specified directory").alias("e", "transpile").describe("e", "use es6-module-transpiler to transpile modules into a bundle").boolean("transpile").alias("m", "sourcemap").describe("m", "generate a sourcemap").boolean("sourcemap").alias("r", "readable-names").describe("r", "remove as many hygienic renames as possible (ES5 code only!)").boolean("readable-names").alias("d", "display").describe("d", "display result of compilation to stdout (but do not write to disk)").boolean("display").alias("w", "watch").describe("w", "watch a file").boolean("watch").alias("t", "tokens").describe("t", "just emit the expanded tokens without parsing an AST").alias("a", "ast").describe("a", "just emit the expanded AST").alias("p", "no-parse").describe("p", "print out the expanded result but do not run through the parser (or apply hygienic renamings)").boolean("no-parse").alias("s", "stdin").describe("s", "read from stdin").boolean("stdin").alias("n", "num-expands").describe("n", "the maximum number of expands to perform").alias("h", "step-hygiene").describe("h", "display hygienic renames when stepping with \"--num-expands\"").describe("format-indent", "number of spaces for indentation").alias("l", "load-readtable").describe("load-readtable", "readtable module to install").describe("to-es5", "run output through 6to5 compiler").alias("v", "version").describe("v", "display version info").boolean("version").argv;
exports.run = function () {
    if (argv9564.version) {
        return console.log("Sweet.js version: " + pkg9557.version);
    }
    var infile9565 = argv9564._[0];
    var writeToDisk9566 = argv9564.output;
    var watch9567 = argv9564.watch;
    var tokens9568 = argv9564.tokens;
    var ast9569 = argv9564.ast;
    var sourcemap9570 = argv9564.sourcemap;
    var display9571 = argv9564.display;
    var transpile9572 = argv9564.transpile;
    var noparse9573 = argv9564["no-parse"];
    var numexpands9574 = argv9564["num-expands"];
    var displayHygiene9575 = argv9564["step-hygiene"];
    var readableNames9576 = argv9564["readable-names"];
    var formatIndent9577 = parseInt(argv9564["format-indent"], 10);
    var readtableModules9578 = argv9564["load-readtable"];
    var to59579 = argv9564["to-es5"];
    if (formatIndent9577 !== formatIndent9577) {
        formatIndent9577 = 4;
    }
    var file9580;
    if (infile9565) {
        file9580 = fs9555.readFileSync(infile9565, "utf8");
    } else if (argv9564.stdin) {
        file9580 = fs9555.readFileSync("/dev/stdin", "utf8");
    } else if (argv9564._.length === 0) {
        console.log(require("optimist").help());
        return;
    }
    var cwd9581 = process.cwd();
    if (readtableModules9578) {
        readtableModules9578 = Array.isArray(readtableModules9578) ? readtableModules9578 : [readtableModules9578];
        readtableModules9578.forEach(function (mod9584) {
            sweet9558.setReadtable(mod9584);
        });
    }
    var options9582 = {
        filename: infile9565,
        compileSuffix: ".jsc",
        ast: ast9569,
        sourceMap: sourcemap9570,
        to5: to59579,
        readableNames: readableNames9576,
        escodegen: { format: { indent: { style: Array(formatIndent9577 + 1).join(" ") } } }
    };
    function doCompile9583(outputDirectory9585) {
        var result9586 = sweet9558.compile(file9580, options9582);
        result9586.forEach(function (res9587) {
            var outfile9588, mapfile9589;
            if (outputDirectory9585) {
                var filename9590 = path9556.basename(res9587.path);
                var dirname9591 = path9556.dirname(res9587.path);
                var relativeDir9592 = path9556.relative(dirname9591, writeToDisk9566);
                outfile9588 = path9556.resolve(dirname9591, relativeDir9592, filename9590 + options9582.compileSuffix);
                mapfile9589 = path9556.resolve(dirname9591, relativeDir9592, filename9590 + ".map");
            } else {
                outfile9588 = res9587.path + options9582.compileSuffix;
                mapfile9589 = res9587.path + ".map";
            }
            console.log("compiling: " + outfile9588);
            if (sourcemap9570) {
                fs9555.writeFileSync(outfile9588, res9587.code + "\n//# sourceMappingURL=" + mapfile9589, "utf8");
                fs9555.writeFileSync(mapfile9589, res9587.sourceMap, "utf8");
            } else {
                fs9555.writeFileSync(outfile9588, res9587.code, "utf8");
            }
        });
    }
    if (watch9567 && writeToDisk9566) {
        fs9555.watch(infile9565, function () {
            file9580 = fs9555.readFileSync(infile9565, "utf8");
            try {
                doCompile9583();
            } catch (e9593) {
                console.log(e9593);
            }
        });
    } else if (writeToDisk9566) {
        doCompile9583(writeToDisk9566);
    } else if (tokens9568) {
        console.log(sweet9558.expand(file9580, modules, { maxExpands: numexpands9574 }));
    } else if (ast9569) {
        console.log(JSON.stringify(sweet9558.compile(file9580, options9582), null, formatIndent9577));
    } else if (noparse9573) {
        var expanded9594 = sweet9558.expand(file9580, modules, { maxExpands: numexpands9574 });
        var unparsedString9595 = syn9559.prettyPrint(expanded9594, displayHygiene9575);
        console.log(unparsedString9595);
    } else if (display9571) {
        options9582.maxExpands = numexpands9574;
        var result9596 = sweet9558.compile(file9580, options9582);
        result9596.forEach(function (res9597) {
            console.log("file: " + res9597.path);
            console.log(res9597.code + "\n");
        });
    } else {
        doCompile9583();
    }
};
//# sourceMappingURL=sjs.js.map