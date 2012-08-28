
var _ = require("underscore");
var Contracts = require("contracts.js");
var parser = require("../lib/sweet.js");
exports = Contracts.exports("Macros", exports);
Contracts.autoload();
Contracts.enabled(false);


function assert(condition, message) {
    if (!condition) {
        throw new Error('ASSERT: ' + message);
    }
}
