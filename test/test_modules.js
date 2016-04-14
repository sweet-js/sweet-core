import { parse, expand } from "../src/sweet";
import expect from "expect.js";
import { expr, stmt, testParse, testModule } from "./assertions";
import test from 'ava';


test('should parse an import with a single named import', () => {
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

test('should parse an import for macros', () => {
  testParse('import { x } from "m" for syntax;', x => x, {
      "type": "Module",
      "loc": null,
      "directives": [],
      "items": [
        {
          "type": "Import",
          "loc": null,
          "defaultBinding": null,
          "forSyntax": true,
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
          "moduleSpecifier": "m"
        }
      ]
  });
});

test('should parse an export of a syntax decl', () => {
  testParse('export syntaxrec m = function () {}', x => x, {
      "type": "Module",
      "loc": null,
      "directives": [],
      "items": [
        {
          "type": "Export",
          "loc": null,
          "declaration": {
              "type": "VariableDeclaration",
              "loc": null,
              "kind": "syntaxrec",
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
      ]
    });
});

test('should parse an export of a var decl', () => {
  testParse('export var x = function () {}', x => x, {
    "type": "Module",
    "loc": null,
    "directives": [],
    "items": [
      {
        "type": "Export",
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
    ]
  });
});

test('should load a simple syntax transformer', () => {
  let loader = {
    "./m.js": `#lang "sweet.js";\nexport syntaxrec m = function (ctx) {
return syntaxQuote\`42\`;
}`
  };
  testModule('import { m } from "./m.js"; m', loader, {
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
              "name": "m"
            }
          }
        ],
        "moduleSpecifier": "./m.js",
        "forSyntax": false
      },
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

test('should load a simple syntax transformer but leave runtime imports', () => {
  let loader = {
    "./x.js": `export var x = 42;`,
    "./m.js": `#lang "sweet.js";\nexport syntaxrec m = function (ctx) {
return syntaxQuote\`42\`;
}`
  };
  testModule('import { m } from "./m.js"; import { x } from "./x.js"; m', loader, {
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
              "name": "m"
            }
          }
        ],
        "moduleSpecifier": "./m.js"
      },
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
        "moduleSpecifier": "./x.js"
      },
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
