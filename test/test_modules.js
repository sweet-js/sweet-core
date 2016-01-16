import { parse, expand } from "../src/sweet";
import expect from "expect.js";
import { expr, stmt, testParse, testModule } from "./assertions";

describe('module import/export', () => {

  it('should parse an import with a single named import', () => {
    testParse('import { map } from "ramda";', x => x, {
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
                  "name": "map"
                }
              }
            ],
            "moduleSpecifier": "ramda"
          }
        ]
    });
  });

  it('should parse an export of a syntax decl', () => {
    testParse('export syntax m = function () {}', x => x, {
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
                "kind": "syntax",
                "declarators": [
                  {
                    "type": "VariableDeclarator",
                    "loc": null,
                    "binding": {
                      "type": "BindingIdentifier",
                      "loc": null,
                      "name": "m"
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

  it('should do what i want', () => {
    let loader = {
      "./m.js": `export syntax m = function (ctx) {
  return syntaxQuote { 42 };
}`
    };
    testModule('import { m } from "./m.js"; m', loader, {
      "type": "Module",
      "loc": null,
      "directives": [],
      "items": [
        {
          "type": "ExpressionStatement",
          "loc": null,
          "expression": {
            "type": "LiteralNumericExpression",
            "loc": null,
            "value": 42
          }
        }
      ]
    });
  });

});
