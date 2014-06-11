var expect = require("expect.js");
var path = require("path");

describe('Loading executables does not die on HashBang', function() {
  it('Have CLI copy of sjs.js load an executable', function() {
    // Mock out arguments for optimist to load our fixture
    process.argv = [ 'node', 'some/bin/sjs', path.join(__dirname, './fixtures/test_require/executable.sjs')];
    var sjs = require("../lib/sjs.js");

    sjs.run();
  });
});
