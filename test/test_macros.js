/*
var should = require("should")
var parser = require("../sweet")
var gen = require ("escodegen");

describe("parser/expander", function() {
    it("should generate the primitive id macro", function() {
        mac = """
        defmacro id "()" {
            function id(stx) {
                return stx[0];
            }
        }
        id(2)
        """
        gen.generate(parser.parse(mac)).should.equal("2;")
    }

    it("should generate a primitive macro with primitive version of syntax", function() {
        mac = """
        defmacro id "()" {
            function id(stx) {
                return syntax { 2 }
            }
        }
        id(42)
        """
        gen.generate(parser.parse(mac)).should.equal("2;");
    }

    it("should generate a primitive macro with multiple bodies", function() {
        mac = """
        defmacro id "(){}" {
            function id(stx) {
              var first = [stx[0][0]];
              var second = first.concat(syntax {+});
              var third = second.concat(stx[1][0]);
              return third;
          }
      }
      id(2){4}
      """
      gen.generate(parser.parse(mac)).should.equal("2 + 4;");
  }

    it("should generate a primitive macro with macro version of syntax", function() {}
        mac = """
        defmacro id "()" {
            function id(stx) {
              var a = stx[0][0];   
              var ret = syntax_fmt (# + 4) { a };
              console.log(ret)          
              // return ret;
              return [a].concat(syntax{+ 4})
          }
      }
      id(2)
      """
      gen.generate(parser.parse(mac)).should.equal("2 + 4;");
  }

    it("should expand a simple add macro", function() {
        mac = """
        macro add {
          function add(stx) {
            return [stx[0], syntax {+}, stx[1]];
        }
    }
    add(2 2);
    """

    # gen.generate(parser.parse(mac)).should.equal("2 + 2;");
}

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
}
*/