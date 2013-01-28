require("shelljs/make");
var path = require("path");
var fs = require("fs");
var Mocha = require("mocha");

target.all = function() {
    target.clean();
    target.build();
    target.build_test();
    target.build_browser();
    target.test();
}

target.clean = function() {
    rm("build/*");
}

target.single = function() {
    target.build();
    target.test_single();
}

target.build = function() {
    // move the compiler over to the lib dir...eventually should self-host
    if(!test('-d', 'build/')) {
        mkdir("build/");
    }

    cp("-f", "src/*.js", "lib/");
    cp("-f", "test/test_single.js", "build/");
}

target.build_test = function() {

    ls("test/*.js").forEach(function(file) {
        echo("compiling: " + path.basename(file));
        exec("bin/sjs --output build/" + path.basename(file) + " " + file);
    });
}

target.build_browser = function() {
    echo("\nbuilding browser tests...");

    cp("-f", "lib/*.js", "browser/scripts");
}

target.test = function() {
    echo("\nrunning tests...");
    var mocha = new Mocha();

    fs.readdirSync('build/').filter(function(file) {
        return file.substr(-3) === '.js';
    }).forEach(function(file) {
        mocha.addFile(path.join("build/", file));
    });
    mocha.run();
}

// used when we don't want to run all the tests again, just
// run test_single.js
target.test_single = function() {
    var mocha = new Mocha();
    mocha.addFile(path.join('build/', 'test_single.js'));
    mocha.run();
}
