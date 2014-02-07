var expect = require("expect.js");
var sweet = require("../build/lib/sweet.js");

describe('loading code from inside macros in Node.js', function() {

  it('loads code from macros defined in top level module', function() {
    var code = (
      'macro m {' +
      '  case { _ } => {' +
      '    require("./fixtures/test_require/module");' +
      '    return [];' +
      '  }' +
      '}' +
      '' +
      'm'
    );
    expect(sweet.compile.bind(null, code, {filename: __filename}))
      .to.not.throwException();
  });

  it('loads code from macros defined in imported module', function() {
    var code = 'm';
    var mod = sweet.loadNodeModule(__dirname, './fixtures/test_require/macro-module.sjs');
    expect(sweet.compile.bind(null, code, {modules: [mod]}))
      .to.not.throwException();
  });
});
