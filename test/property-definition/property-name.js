/**
 * Copyright 2014 Shape Security, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var expr = require("../helpers").expr;
var testParse = require("../assertions").testParse;
var testParseFailure = require("../assertions").testParseFailure;

suite("Parser", function () {
  suite("property name", function () {
    testParse("({0x0:0})", expr,
      {
        type: "ObjectExpression",
        properties: [{
          type: "DataProperty",
          name: { type: "StaticPropertyName", value: "0" },
          expression: { type: "LiteralNumericExpression", value: 0 }
        }]
      }
    );

    testParse("({2e308:0})", expr,
      {
        type: "ObjectExpression",
        properties: [{
          type: "DataProperty",
          name: { type: "StaticPropertyName", value: "" + 1 / 0 },
          expression: { type: "LiteralNumericExpression", value: 0 }
        }]
      }
    );

    testParse("({get b() {}})", expr,
      {
        type: "ObjectExpression",
        properties: [{
          type: "Getter",
          name: { type: "StaticPropertyName", value: "b" },
          body: { type: "FunctionBody", directives: [], statements: [] }
        }]
      }
    );
    testParse("({set c(x) {}})", expr,
      {
        type: "ObjectExpression",
        properties: [{
          type: "Setter",
          name: { type: "StaticPropertyName", value: "c" },
          param: { type: "BindingIdentifier", name: "x" },
          body: { type: "FunctionBody", directives: [], statements: [] }
        }]
      }
    );

    testParse("({__proto__:0})", expr,
      {
        type: "ObjectExpression",
        properties: [{
          type: "DataProperty",
          name: { type: "StaticPropertyName", value: "__proto__" },
          expression: { type: "LiteralNumericExpression", value: 0 }
        }]
      }
    );

    testParse("({get __proto__() {}})", expr,
      {
        type: "ObjectExpression",
        properties: [{
          type: "Getter",
          name: { type: "StaticPropertyName", value: "__proto__" },
          body: { type: "FunctionBody", directives: [], statements: [] }
        }]
      }
    );

    testParse("({set __proto__(x) {}})", expr,
      {
        type: "ObjectExpression",
        properties: [{
          type: "Setter",
          name: { type: "StaticPropertyName", value: "__proto__" },
          param: { type: "BindingIdentifier", name: "x" },
          body: { type: "FunctionBody", directives: [], statements: [] }
        }]
      }
    );

    testParse("({get __proto__() {}, set __proto__(x) {}})", expr,
      {
        type: "ObjectExpression",
        properties: [{
          type: "Getter",
          name: { type: "StaticPropertyName", value: "__proto__" },
          body: { type: "FunctionBody", directives: [], statements: [] }
        }, {
          type: "Setter",
          name: { type: "StaticPropertyName", value: "__proto__" },
          param: { type: "BindingIdentifier", name: "x" },
          body: { type: "FunctionBody", directives: [], statements: [] }
        }]
      }
    );

    testParse("({[\"nUmBeR\"+9]:\"nein\"})", expr,
      {
        type: "ObjectExpression",
        properties: [{
          type: "DataProperty",
          name: {
            type: "ComputedPropertyName",
            expression: {
              type: "BinaryExpression",
              operator: "+",
              left: { type: "LiteralStringExpression", value: "nUmBeR" },
              right: { type: "LiteralNumericExpression", value: 9 }
            }
          },
          expression: { type: "LiteralStringExpression", value: "nein" }
        }]
      }
    );

    testParse("({[2*308]:0})", expr,
      {
        type: "ObjectExpression",
        properties: [{
          type: "DataProperty",
          name: {
            type: "ComputedPropertyName",
            expression: {
              type: "BinaryExpression",
              operator: "*",
              left: { type: "LiteralNumericExpression", value: 2 },
              right: { type: "LiteralNumericExpression", value: 308 }
            }
          },
          expression: { type: "LiteralNumericExpression", value: 0 }
        }]
      }
    );

    testParse("({get [6+3]() {}, set [5/4](x) {}})", expr,
      {
        type: "ObjectExpression",
        properties: [{
          type: "Getter",
          name: {
            type: "ComputedPropertyName",
            expression: {
              type: "BinaryExpression",
              operator: "+",
              left: { type: "LiteralNumericExpression", value: 6 },
              right: { type: "LiteralNumericExpression", value: 3 }
            }
          },
          body: { type: "FunctionBody", directives: [], statements: [] }
        }, {
          type: "Setter",
          name: {
            type: "ComputedPropertyName",
            expression: {
              type: "BinaryExpression",
              operator: "/",
              left: { type: "LiteralNumericExpression", value: 5 },
              right: { type: "LiteralNumericExpression", value: 4 }
            }
          },
          param: { type: "BindingIdentifier", name: "x" },
          body: { type: "FunctionBody", directives: [], statements: [] }
        }]
      }
    );

    testParse("({[6+3]() {}})", expr,
      {
        type: "ObjectExpression",
        properties: [{
          type: "Method",
          isGenerator: false,
          name: {
            type: "ComputedPropertyName",
            expression: {
              type: "BinaryExpression",
              operator: "+",
              left: { type: "LiteralNumericExpression", value: 6 },
              right: { type: "LiteralNumericExpression", value: 3 }
            }
          },
          params: { type: "FormalParameters", items: [], rest: null },
          body: { type: "FunctionBody", directives: [], statements: [] }
        }]
      }
    );

    testParse("({3() {}})", expr,
      {
        type: "ObjectExpression",
        properties: [{
          type: "Method",
          isGenerator: false,
          name: { type: "StaticPropertyName", value: "3" },
          params: { type: "FormalParameters", items: [], rest: null },
          body: { type: "FunctionBody", directives: [], statements: [] }
        }]
      }
    );

    testParse("({\"moo\"() {}})", expr,
      {
        type: "ObjectExpression",
        properties: [{
          type: "Method",
          isGenerator: false,
          name: { type: "StaticPropertyName", value: "moo" },
          params: { type: "FormalParameters", items: [], rest: null },
          body: { type: "FunctionBody", directives: [], statements: [] }
        }]
      }
    );

    testParse("({\"oink\"(that, little, piggy) {}})", expr,
      {
        type: "ObjectExpression",
        properties: [{
          type: "Method",
          isGenerator: false,
          name: { type: "StaticPropertyName", value: "oink" },
          params: {
            type: "FormalParameters",
            items: [{ type: "BindingIdentifier", name: "that" }, {
              type: "BindingIdentifier",
              name: "little"
            }, { type: "BindingIdentifier", name: "piggy" }],
            rest: null
          },
          body: { type: "FunctionBody", directives: [], statements: [] }
        }]
      }
    );

    testParseFailure("({[1,2]:3})", "Unexpected token \",\"");
    testParseFailure("({ *a })", "Unexpected token \"}\"");
    testParseFailure("({ *a: 0 })", "Unexpected token \":\"");
    testParseFailure("({ *[0]: 0 })", "Unexpected token \":\"");
  });
});
