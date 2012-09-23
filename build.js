require("shelljs/make");
var path = require("path");

target.all = function() {
  target.build();
  // target.build_browser();
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
  var test_files = ls("build/*.js").join(" ");
  exec("browserify -o browser/test_bundled.js " + test_files);
  exec("browserify -o browser/parser_bundle.js browser/load_parser.js");
}

target.test = function() {
  echo("\nrunning tests...");
  exec("mocha --growl build/");
}
