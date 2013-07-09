require("shelljs/make");
var path = require("path");
var fs = require("fs");
var Mocha = require("mocha");
var Benchmark = require("benchmark");

var suite = new Benchmark.Suite;

var contracts_lib = "node_modules/sweet-contracts/lib/sweet-contracts.js";
var contracts_bin = "node_modules/sweet-contracts/bin/sweet-contracts";

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
    exec("node test_benchmark.js");
}

target.clean = function() {
    if(test('-d', 'build/')) {
        rm("-r", "build/");
    }
};

target.single = function() {
    target.build();
    target.test_single();
};

target.unit = function() {
    target.build();
    target.test_unit();
};

target.build = function() {
    if(!test('-d', "build/lib/")) {
        mkdir("-p", "build/lib/");
        mkdir("-p", "build/bin/");
    }

    echo("\nbuilding sweet.js...");

    cp("-f", "bin/sjs", "build/bin/");
    chmod("+x", "build/bin/sjs");

    ls("src/*.js").forEach(function(file) {
        echo("compiling: " + path.basename(file));
        // compile the expander only with support for contract macros
        if(file === "src/expander.js") {
            exec("bin/sjs --output " + "build/lib/" + path.basename(file) + " --module " + contracts_lib + " " + file);
        } else {
            exec("bin/sjs --output " + "build/lib/" + path.basename(file) + " " + file);
        }
    });
};

target.build_sweetjs = function() {
    target.build();
    cp("-f", "build/lib/*.js", "lib/");
}

target.build_test_file = function() {
    // if we have a "test.js" file sitting at the
    // root of the project go ahead and build it
    if(test('-f', "test.js")) {
        echo("compiling: test.js" )
        exec('build/bin/sjs test.js test_out.js');
    }
}

target.build_test = function() {

    ls("test/*.js").forEach(function(file) {
        echo("compiling: " + path.basename(file));
        exec("build/bin/sjs --output build/" + path.basename(file) + " " + file);
    });
};

target.build_browser = function() {
    echo("\nbuilding browser tests...");

    cp("-f", "build/lib/*.js", "browser/scripts");
    cp("-f", "node_modules/contracts-js/lib/contracts.js", "browser/scripts/contracts-js.js");
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

// used when we don't want to run all the tests again, just
// run test_single.js
target.test_single = function() {
    var mocha = new Mocha();
    mocha.addFile(path.join('build/', 'test_single.js'));
    mocha.run();
};

target.test_unit = function() {
    cp('-f', 'test/test_expander_units.js', 'build/');
    if(process.env.NODE_DISABLE_COLORS === "1") {
        Mocha.reporters.Base.useColors = false;
    }
    var mocha = new Mocha();
    mocha.useColors = false;
    mocha.addFile(path.join('build/', 'test_expander_units.js'));
    mocha.run();
};
