var should = require("should")
var parser = require("../lib/sweet")
var gen = require ("escodegen");

describe("parser", function() {
  it("should parse with the identity macro", function() {
    macro id "()" {
      case ($id:ident) => {
        $id
      }
    }
    var x = id(5);
    x.should.equal(5);
    
  });
});
