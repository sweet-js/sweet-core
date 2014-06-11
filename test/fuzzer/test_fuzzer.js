var jsfuzz = require("./jsfunfuzz/jsfunfuzz.js");
var sweet = require("../../build/lib/sweet");

exports.runFuzzer = function runFuzzer() {
    // argument is the potential depth of construction
    var code = jsfuzz.makeStatement(8);
    try {
        sweet.compile(code);
        console.log("success");
    } catch (e) {
        console.log("Attempting to compile:");
        console.log(code);
        console.log("Got error: " + e);
    }
}
