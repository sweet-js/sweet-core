require("shelljs/make");
var browserify = require("browserify");
var path = require("path");
var fs = require("fs");
var Mocha = require("mocha");

target.all = function() {
  target.build();
  //target.build_browser();
  target.test();
}

target.build = function() {
  // move the compiler over to the lib dir...eventually should self-host
  cp("-f", "src/*.js", "lib/");

  if(!test('-d', 'build/')) {
    mkdir("build/");
  }

  ls("test/*.js").forEach(function(file) {
    echo("compiling: " + path.basename(file));
    exec("bin/sjs --output build/" + path.basename(file) + " " + file);
  });
}

target.build_browser = function() {
  echo("\nbuilding browser tests...");

  var b = browserify();
  var test_files = ls("build/*.js").forEach(b.addEntry);
  var bundle = b.bundle();
  fs.writeFileSync("browser/test_bundled.js", bundle, "utf8");

  b = browserify("browser/load_parser.js");
  bundle = b.bundle();
  fs.writeFileSync("browser/parser_bundle.js", bundle, "utf8");
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
