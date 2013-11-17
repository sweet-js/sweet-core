require("shelljs/make");
var path = require("path");
var fs = require("fs");
var Mocha = require("mocha");
var Benchmark = require("benchmark");

var suite = new Benchmark.Suite;


target.all = function() {
    target.clean();
    target.build();
    target.build_browser();
    target.build_test();
    target.test();
};

target.benchmark = function() {
    target.clean();
    target.build();
    target.run_bench();
}

target.run_bench = function() {
    echo("\nrunning benchmarks...")
    cp("-f", "test_benchmark.js", "build/")
    exec("node build/test_benchmark.js");
}

target.clean = function() {
    if(test('-d', 'build/')) {
        rm("-r", "build/");
    }
};

function build() {

    if(!test('-d', "build/lib/")) {
        mkdir("-p", "build/lib/");
        mkdir("-p", "build/bin/");
    }

    echo("\nbuilding sweet.js...");

    cp("-f", "bin/sjs", "build/bin/");
    chmod("+x", "build/bin/sjs");

    // TODO: these should be in src at some point so they are part of
    // the normal build process
    cp("-f", "lib/es6-module-loader.js", "build/lib/");
    cp("-f", "lib/esprima-es6.js", "build/lib/");
    cp("-f", "lib/scopedEval.js", "build/lib/");

    ls("src/*.js").forEach(function(file) {
        echo("compiling: " + path.basename(file));

        exec("bin/sjs " +
             "--output " + "build/lib/" + path.basename(file) +
             " --module lambda-chop/macros" +
             " " + file);
             // " " + file + " --sourcemap scripts");
    });

}

target.build = function() {
    target.build_macros();
    build();
};


target.build_macros = function() {
    if(!test('-d', "build/lib/")) {
        mkdir("-p", "build/macros/");
    }
    echo("moving builtin macros to build dir...");
    cp("-f", "macros/*", "build/macros/");
};

target.build_dist = function() {
    target.build();
    cp("-f", "build/lib/*.js", "lib/");
}

target.build_test_file = function() {
    // if we have a "test.js" file sitting at the
    // root of the project go ahead and build it
    if(test('-f', "test.js")) {
        echo("compiling: test.js" )
        exec('build/bin/sjs test.js test_out.js');
    } else {
        echo("no file: test.js");
    }
}

target.build_test = function() {
    echo("building node tests...");
    ls("test/*.js").forEach(function(file) {
        echo("compiling: " + path.basename(file));
        exec("build/bin/sjs --output build/" + path.basename(file) + " " + file);
    });
};

target.build_browser = function() {
    echo("\nbuilding browser tests...");

    cp("-f", "build/lib/*.js", "browser/scripts");
    cp("-f", "build/lib/*.map", "browser/scripts");
    cp("-f", "macros/*", "browser/scripts");
    cp("-f", "src/*.js", "browser/scripts/src");


    // hacking in test.js for sourcemap
    exec("bin/sjs --output browser/test_out.js test.js --sourcemap true");
    cp("-f", "test.js", "browser/test.js");
};

target.test = function() {
    echo("\nrunning tests...");
    if(process.env.NODE_DISABLE_COLORS === "1") {
        Mocha.reporters.Base.useColors = false;
    }
    var mocha = new Mocha();
    mocha.useColors = false;

    fs.readdirSync('build/').filter(function(file) {
        return file.substr(-3) === '.js';
    }).forEach(function(file) {
        mocha.addFile(path.join("build/", file));
    });
    mocha.run();
};

