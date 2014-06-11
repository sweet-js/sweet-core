var expect = require("expect.js");
var path = require("path");

describe('Loading executables does not die on HashBang', function() {

  it('loads code from macros defined in imported module', function() {
    process.argv = [ 'node', 'jsj', path.join(__dirname, './fixtures/test_require/executable.sjs')];
    var sjs = require("../lib/sjs.js");
    console.log(sjs);

    sjs.run();
  });
});
