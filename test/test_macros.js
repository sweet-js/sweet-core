var should = require("should")
var parser = require("../lib/sweet")
var gen = require ("escodegen");

describe("parser", function() {
  it("should parse with the identity macro", function() {
    macro id "()" {
      case ($x:lit) => {
        $x
      }
    }
    var z = id(4);
    z.should.equal(4);
  });
});
