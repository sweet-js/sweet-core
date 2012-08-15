should = require("should")
parser = require("../sweet")
gen = require "escodegen"

describe "parser/expander", ->
  it "should generate the primitive id macro", ->
    mac = """
      macro id "()" {
        function id(stx) {
            return stx[0];
        }
      }
      id(2)
    """
    gen.generate(parser.parse(mac)).should.equal "2;"

  it "should generate a primitive macro with primitive version of syntax", ->
    mac = """
      macro id "()" {
        function id(stx) {
            return syntax { 2 }
        }
      }
      id(42)
    """
    gen.generate(parser.parse(mac)).should.equal "2;"

  it "should generate a primitive macro with multiple bodies", ->
    mac = """
      macro id "(){}" {
        function id(stx) {
            return [stx[0][0], syntax { + }, stx[1][0]];
        }
      }
      id(2){4}
    """
    gen.generate(parser.parse(mac)).should.equal "2 + 4;"

  it "should generate a primitive macro with macro version of syntax", ->
    mac = """
      macro id "()" {
        function id(stx) {
            return syntax (stx[0]) { 4 };
        }
      }
      id(2)
    """
    gen.generate(parser.parse(mac)).should.equal "2;"

  it "should expand a simple add macro", ->
    mac = """
        macro add {
          function add(stx) {
            return [stx[0], syntax {+}, stx[1]];
          }
        }
        add(2 2);
      """

    # gen.generate(parser.parse(mac)).should.equal "2 + 2;"

  it "should expand with a function in syntax", ->
    mac = """
      macro let {
        function let(stx) {
          return syntax {
            (function(x) {
              return body;
            })(val);
          return syntax (
            (function (##) { return ##; })(##);
          ) { stx[0], stx[1], stx[2] }
        }
      }

      let (y = 5) {
        y + 2 
      }
    """
    # gen.generate(parser.parse(mac)).should.equal "(function (y) { return y + 2 })(5);"