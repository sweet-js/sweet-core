"use strict";

var fs9115 = require("fs");
var path9116 = require("path");
var pkg9117 = require("../package.json");
var sweet9118 = require("./sweet.js");
var syn9119 = require("./syntax.js");
var esTranspiler9120 = require("es6-module-transpiler");
var Container9121 = esTranspiler9120.Container;
var FileResolver9122 = esTranspiler9120.FileResolver;
var BundleFormatter9123 = esTranspiler9120.formatters.bundle;
var argv9124 = require("optimist").usage("Usage: sjs [options] path/to/file.js").alias("o", "output").describe("o", "write files to the specified directory").alias("e", "transpile").describe("e", "use es6-module-transpiler to transpile modules into a bundle").boolean("transpile").alias("m", "sourcemap").describe("m", "generate a sourcemap").boolean("sourcemap").alias("r", "readable-names").describe("r", "remove as many hygienic renames as possible (ES5 code only!)").boolean("readable-names").alias("d", "display").describe("d", "display result of compilation to stdout (but do not write to disk)").boolean("display").alias("w", "watch").describe("w", "watch a file").boolean("watch").alias("t", "tokens").describe("t", "just emit the expanded tokens without parsing an AST").alias("a", "ast").describe("a", "just emit the expanded AST").alias("p", "no-parse").describe("p", "print out the expanded result but do not run through the parser (or apply hygienic renamings)").boolean("no-parse").alias("s", "stdin").describe("s", "read from stdin").boolean("stdin").alias("n", "num-expands").describe("n", "the maximum number of expands to perform").alias("h", "step-hygiene").describe("h", "display hygienic renames when stepping with \"--num-expands\"").describe("format-indent", "number of spaces for indentation").alias("l", "load-readtable").describe("load-readtable", "readtable module to install").describe("to-es5", "run output through 6to5 compiler").alias("v", "version").describe("v", "display version info").boolean("version").argv;
exports.run = function () {
    if (argv9124.version) {
        return console.log("Sweet.js version: " + pkg9117.version);
    }
    var infile9125 = argv9124._[0];
    var writeToDisk9126 = argv9124.output;
    var watch9127 = argv9124.watch;
    var tokens9128 = argv9124.tokens;
    var ast9129 = argv9124.ast;
    var sourcemap9130 = argv9124.sourcemap;
    var display9131 = argv9124.display;
    var transpile9132 = argv9124.transpile;
    var noparse9133 = argv9124["no-parse"];
    var numexpands9134 = argv9124["num-expands"];
    var displayHygiene9135 = argv9124["step-hygiene"];
    var readableNames9136 = argv9124["readable-names"];
    var formatIndent9137 = parseInt(argv9124["format-indent"], 10);
    var readtableModules9138 = argv9124["load-readtable"];
    var to59139 = argv9124["to-es5"];
    if (formatIndent9137 !== formatIndent9137) {
        formatIndent9137 = 4;
    }
    var file9140;
    if (infile9125) {
        file9140 = fs9115.readFileSync(infile9125, "utf8");
    } else if (argv9124.stdin) {
        file9140 = fs9115.readFileSync("/dev/stdin", "utf8");
    } else if (argv9124._.length === 0) {
        console.log(require("optimist").help());
        return;
    }
    var cwd9141 = process.cwd();
    if (readtableModules9138) {
        readtableModules9138 = Array.isArray(readtableModules9138) ? readtableModules9138 : [readtableModules9138];
        readtableModules9138.forEach(function (mod9144) {
            sweet9118.setReadtable(mod9144);
        });
    }
    var options9142 = {
        filename: infile9125,
        compileSuffix: ".jsc",
        ast: ast9129,
        sourceMap: sourcemap9130,
        to5: to59139,
        readableNames: readableNames9136,
        escodegen: { format: { indent: { style: Array(formatIndent9137 + 1).join(" ") } } }
    };
    function doCompile9143(outputDirectory9145) {
        var result9146 = sweet9118.compile(file9140, options9142);
        result9146.forEach(function (res9147) {
            var outfile9148, mapfile9149;
            if (outputDirectory9145) {
                var filename9150 = path9116.basename(res9147.path);
                var dirname9151 = path9116.dirname(res9147.path);
                var relativeDir9152 = path9116.relative(dirname9151, writeToDisk9126);
                outfile9148 = path9116.resolve(dirname9151, relativeDir9152, filename9150 + options9142.compileSuffix);
                mapfile9149 = path9116.resolve(dirname9151, relativeDir9152, filename9150 + ".map");
            } else {
                outfile9148 = res9147.path + options9142.compileSuffix;
                mapfile9149 = res9147.path + ".map";
            }
            console.log("compiling: " + outfile9148);
            if (sourcemap9130) {
                fs9115.writeFileSync(outfile9148, res9147.code + "\n//# sourceMappingURL=" + mapfile9149, "utf8");
                fs9115.writeFileSync(mapfile9149, res9147.sourceMap, "utf8");
            } else {
                fs9115.writeFileSync(outfile9148, res9147.code, "utf8");
            }
        });
    }
    if (watch9127 && writeToDisk9126) {
        fs9115.watch(infile9125, function () {
            file9140 = fs9115.readFileSync(infile9125, "utf8");
            try {
                doCompile9143();
            } catch (e9153) {
                console.log(e9153);
            }
        });
    } else if (writeToDisk9126) {
        doCompile9143(writeToDisk9126);
    } else if (tokens9128) {
        console.log(sweet9118.expand(file9140, modules, { maxExpands: numexpands9134 }));
    } else if (ast9129) {
        console.log(JSON.stringify(sweet9118.compile(file9140, options9142), null, formatIndent9137));
    } else if (noparse9133) {
        var expanded9154 = sweet9118.expand(file9140, modules, { maxExpands: numexpands9134 });
        var unparsedString9155 = syn9119.prettyPrint(expanded9154, displayHygiene9135);
        console.log(unparsedString9155);
    } else if (display9131) {
        options9142.maxExpands = numexpands9134;
        var result9156 = sweet9118.compile(file9140, options9142);
        result9156.forEach(function (res9157) {
            console.log("file: " + res9157.path);
            console.log(res9157.code + "\n");
        });
    } else {
        doCompile9143();
    }
};
//# sourceMappingURL=sjs.js.map