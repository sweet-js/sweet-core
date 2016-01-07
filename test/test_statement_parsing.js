import { parse, expand } from "../src/sweet";
import expect from "expect.js";
import { expr, stmt, testParse } from "./assertions";

describe("parsing function declarations", function () {

  it("should handle a function declaration", function () {
    testParse("function id(x) { }", stmt, {
      "type": "FunctionDeclaration",
      "loc": null,
      "name": {
        "type": "BindingIdentifier",
        "loc": null,
        "name": "<<hygiene>>"
      },
      "isGenerator": false,
      "params": {
        "type": "FormalParameters",
        "loc": null,
        "rest": null,
        "items": [{
          "type": "BindingIdentifier",
          "loc": null,
          "name": "<<hygiene>>"
        }]
      },
      "body": {
        "type": "FunctionBody",
        "loc": null,
        "directives": [],
        "statements": []
      }
    });
  });

  it("should handle a generator function declaration", function () {
    testParse("function * id(x) {}", stmt, {
      "type": "FunctionDeclaration",
      "loc": null,
      "name": {
        "type": "BindingIdentifier",
        "loc": null,
        "name": "<<hygiene>>"
      },
      "isGenerator": true,
      "params": {
        "type": "FormalParameters",
        "loc": null,
        "rest": null,
        "items": [{
          "type": "BindingIdentifier",
          "loc": null,
          "name": "<<hygiene>>"
        }]
      },
      "body": {
        "type": "FunctionBody",
        "loc": null,
        "directives": [],
        "statements": []
      }
    });
  });

  it("should throw an error for a bad return statement", function () {
    expect(() => parse("function foo() { return return }")).to.throwError();
  });
});

describe("parsing variable declarations", function () {

  it("should thrown an error for a bad var decl", function () {
    expect(() => parse("var 42")).to.throwError();
  });

  it("should handle a var declaration", function () {
    testParse("var x", stmt, {
      "type": "VariableDeclarationStatement",
      "declaration": {
        "type": "VariableDeclaration",
        "loc": null,
        "kind": "var",
        "declarators": [{
          "type": "VariableDeclarator",
          "loc": null,
          "binding": {
            "loc": null,
            "type": "BindingIdentifier",
            "name": "<<hygiene>>"
          },
          "init": null
        }]
      }
    });

    testParse("var x = 42", stmt, {
      "type": "VariableDeclarationStatement",
      "declaration": {
        "type": "VariableDeclaration",
        "loc": null,
        "kind": "var",
        "declarators": [{
          "type": "VariableDeclarator",
          "loc": null,
          "binding": {
            "loc": null,
            "type": "BindingIdentifier",
            "name": "<<hygiene>>"
          },
          "init": {
            "loc": null,
            "type": "LiteralNumericExpression",
            "value": 42
          }
        }]
      }
    });

    testParse("var x = 42, y = 42 + 24", stmt, {
      "type": "VariableDeclarationStatement",
      "declaration": {
        "type": "VariableDeclaration",
        "loc": null,
        "kind": "var",
        "declarators": [{
          "type": "VariableDeclarator",
          "loc": null,
          "binding": {
            "loc": null,
            "type": "BindingIdentifier",
            "name": "<<hygiene>>"
          },
          "init": {
            "loc": null,
            "type": "LiteralNumericExpression",
            "value": 42
          }
        }, {
          "type": "VariableDeclarator",
          "loc": null,
          "binding": {
            "loc": null,
            "type": "BindingIdentifier",
            "name": "<<hygiene>>"
          },
          "init": {
            "loc": null,
            "type": "BinaryExpression",
            "left": {
              "loc": null,
              "type": "LiteralNumericExpression",
              "value": 42
            },
            "operator": "+",
            "right": {
              "loc": null,
              "type": "LiteralNumericExpression",
              "value": 24
            }
          }
        }]
      }
    });

    testParse("let x = 42, y = 42 + 24", stmt, {
      "type": "VariableDeclarationStatement",
      "declaration": {
        "type": "VariableDeclaration",
        "loc": null,
        "kind": "let",
        "declarators": [{
          "type": "VariableDeclarator",
          "loc": null,
          "binding": {
            "loc": null,
            "type": "BindingIdentifier",
            "name": "<<hygiene>>"
          },
          "init": {
            "loc": null,
            "type": "LiteralNumericExpression",
            "value": 42
          }
        }, {
          "type": "VariableDeclarator",
          "loc": null,
          "binding": {
            "loc": null,
            "type": "BindingIdentifier",
            "name": "<<hygiene>>"
          },
          "init": {
            "loc": null,
            "type": "BinaryExpression",
            "left": {
              "loc": null,
              "type": "LiteralNumericExpression",
              "value": 42
            },
            "operator": "+",
            "right": {
              "loc": null,
              "type": "LiteralNumericExpression",
              "value": 24
            }
          }
        }]
      }
    });

    testParse("const x = 42, y = 42 + 24", stmt, {
      "type": "VariableDeclarationStatement",
      "declaration": {
        "type": "VariableDeclaration",
        "loc": null,
        "kind": "const",
        "declarators": [{
          "type": "VariableDeclarator",
          "loc": null,
          "binding": {
            "loc": null,
            "type": "BindingIdentifier",
            "name": "<<hygiene>>"
          },
          "init": {
            "loc": null,
            "type": "LiteralNumericExpression",
            "value": 42
          }
        }, {
          "type": "VariableDeclarator",
          "loc": null,
          "binding": {
            "loc": null,
            "type": "BindingIdentifier",
            "name": "<<hygiene>>"
          },
          "init": {
            "loc": null,
            "type": "BinaryExpression",
            "left": {
              "loc": null,
              "type": "LiteralNumericExpression",
              "value": 42
            },
            "operator": "+",
            "right": {
              "loc": null,
              "type": "LiteralNumericExpression",
              "value": 24
            }
          }
        }]
      }
    });

  });

  it("should throw an error for a bad variable decl expression", function () {
    expect(() => parse("var x = var")).to.throwError();
  });

});

describe("parsing classes", () => {
  it("should parse an empty class", () => {
    testParse("class F {}", stmt, {
      "type": "ClassDeclaration",
      "loc": null,
      "name": {
        "loc": null,
        "type": "BindingIdentifier",
        "name": "<<hygiene>>"
      },
      "super": null,
      "elements": []
    });
  });
});

describe('assignment expresssions', () => {
  it('should parse a simple assignment', () => {
    testParse("x = 42", stmt, {
      type: 'ExpressionStatement',
      loc: null,
      expression: {
        type: 'AssignmentExpression',
        loc: null,
        binding: {
          type: 'BindingIdentifier',
          loc: null,
          name: 'x'
        },
        expression: {
          type: 'LiteralNumericExpression',
          loc: null,
          value: 42
        }
      }
    });
  });
});

describe('module import/export', () => {

  it('should parse an import with a single named import', () => {
    testParse('import { x } from "foo";', x => x, {
        "type": "Module",
        "loc": null,
        "directives": [],
        "items": [
          {
            "type": "Import",
            "loc": null,
            "defaultBinding": null,
            "namedImports": [
              {
                "type": "ImportSpecifier",
                "loc": null,
                "name": null,
                "binding": {
                  "type": "BindingIdentifier",
                  "loc": null,
                  "name": "x"
                }
              }
            ],
            "moduleSpecifier": "foo"
          }
        ]
    });
  });

  // it('should parse an export of a syntax decl', () => {
  //   testParse('export syntax m = function () {}', x => x, {
  //     test: 'foo'
  //   });
  // });

  it('should parse an export of a var decl', () => {
    testParse('export var x = function () {}', x => x, {
      "type": "Module",
      "loc": null,
      "directives": [],
      "items": [
        {
          "type": "Export",
          "loc": null,
          "declaration": {
            "type": "VariableDeclarationStatement",
            "loc": null,
            "declaration": {
              "type": "VariableDeclaration",
              "loc": null,
              "kind": "var",
              "declarators": [
                {
                  "type": "VariableDeclarator",
                  "loc": null,
                  "binding": {
                    "type": "BindingIdentifier",
                    "loc": null,
                    "name": "x"
                  },
                  "init": {
                    "type": "FunctionExpression",
                    "loc": null,
                    "isGenerator": false,
                    "name": null,
                    "params": {
                      "type": "FormalParameters",
                      "loc": null,
                      "items": [],
                      "rest": null
                    },
                    "body": {
                      "type": "FunctionBody",
                      "loc": null,
                      "directives": [],
                      "statements": []
                    }
                  }
                }
              ]
            }
          }
        }
      ]
    });
  });

});
