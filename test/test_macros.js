var expect = require("expect.js")
var parser = require("../lib/sweet")
var gen = require ("escodegen");

describe("parser", function() {
  // it("should expand a macro with pattern `$x:lit`", function() {
  //   macro id "()" {
  //     case ($x:lit) => {
  //       $x
  //     }
  //   }
  //   var z = id(4);
  //   z.should.equal(4);
  // });

  // it("should expand a macro with pattern `=> $x:lit`", function() {
  //   macro litid "()" {
  //     case (=> $x:lit) {
  //       $x
  //     }
  //   }    
  //   var z = litid(=> 42);
  //   z.should.equal(42);
  // });

  // it("should expand a macro with a pattern `$x:lit <+> $y:lit`", function() {
  //   macro oddadd "()" {
  //     case (($x:lit) <+> $y:lit) => {
  //       $x + $y
  //     }
  //   }
  //   var z = oddadd((2) <+> 4);
  //   expect(z).to.be(6);

  // });


});
