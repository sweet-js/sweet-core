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

import expect from "expect.js";
import { expr, stmt, testParse, testParseFailure } from "../../assertions";
import test from 'ava';

test("object binding", function () {

    testParse("({x} = 0)", expr,
      {
        type: "AssignmentExpression",
        binding: {
          type: "ObjectBinding",
          properties: [{
            type: "BindingPropertyIdentifier",
            binding: { type: "BindingIdentifier", name: "x" },
            init: null
          }]
        },
        expression: { type: "LiteralNumericExpression", value: 0 }
      }
    );

    testParse("({x,} = 0)", expr,
      {
        type: "AssignmentExpression",
        binding: {
          type: "ObjectBinding",
          properties: [{
            type: "BindingPropertyIdentifier",
            binding: { type: "BindingIdentifier", name: "x" },
            init: null
          }]
        },
        expression: { type: "LiteralNumericExpression", value: 0 }
      }
    );

    testParse("({x,y} = 0)", expr,
      {
        type: "AssignmentExpression",
        binding: {
          type: "ObjectBinding",
          properties: [{
            type: "BindingPropertyIdentifier",
            binding: { type: "BindingIdentifier", name: "x" },
            init: null
          }, { type: "BindingPropertyIdentifier", binding: { type: "BindingIdentifier", name: "y" }, init: null }]
        },
        expression: { type: "LiteralNumericExpression", value: 0 }
      }
    );

    testParse("({x,y,} = 0)", expr,
      {
        type: "AssignmentExpression",
        binding: {
          type: "ObjectBinding",
          properties: [{
            type: "BindingPropertyIdentifier",
            binding: { type: "BindingIdentifier", name: "x" },
            init: null
          }, { type: "BindingPropertyIdentifier", binding: { type: "BindingIdentifier", name: "y" }, init: null }]
        },
        expression: { type: "LiteralNumericExpression", value: 0 }
      }
    );

    testParse("({[a]: a} = 1)", expr,
      {
        type: "AssignmentExpression",
        binding: {
          type: "ObjectBinding",
          properties: [{
            type: "BindingPropertyProperty",
            name: { type: "ComputedPropertyName", expression: { type: "IdentifierExpression", name: "a" } },
            binding: { type: "BindingIdentifier", name: "a" }
          }]
        },
        expression: { type: "LiteralNumericExpression", value: 1 }
      }
    );

    testParse("({x = 0} = 1)", expr,
      {
        type: "AssignmentExpression",
        binding: {
          type: "ObjectBinding",
          properties: [{
            type: "BindingPropertyIdentifier",
            binding: { type: "BindingIdentifier", name: "x" },
            init: { type: "LiteralNumericExpression", value: 0 }
          }]
        },
        expression: { type: "LiteralNumericExpression", value: 1 }
      }
    );

    testParse("({x = 0,} = 1)", expr,
      {
        type: "AssignmentExpression",
        binding: {
          type: "ObjectBinding",
          properties: [{
            type: "BindingPropertyIdentifier",
            binding: { type: "BindingIdentifier", name: "x" },
            init: { type: "LiteralNumericExpression", value: 0 }
          }]
        },
        expression: { type: "LiteralNumericExpression", value: 1 }
      }
    );


    testParse("({x: y} = 0)", expr,
      {
        type: "AssignmentExpression",
        binding: {
          type: "ObjectBinding",
          properties: [{
            type: "BindingPropertyProperty",
            name: { type: "StaticPropertyName", value: "x" },
            binding: { type: "BindingIdentifier", name: "y" }
          }]
        },
        expression: { type: "LiteralNumericExpression", value: 0 }
      }
    );

    testParse("({x: y,} = 0)", expr,
      {
        type: "AssignmentExpression",
        binding: {
          type: "ObjectBinding",
          properties: [{
            type: "BindingPropertyProperty",
            name: { type: "StaticPropertyName", value: "x" },
            binding: { type: "BindingIdentifier", name: "y" }
          }]
        },
        expression: { type: "LiteralNumericExpression", value: 0 }
      }
    );

    testParse("({var: x} = 0)", expr,
      {
        type: "AssignmentExpression",
        binding: {
          type: "ObjectBinding",
          properties: [{
            type: "BindingPropertyProperty",
            name: { type: "StaticPropertyName", value: "var" },
            binding: { type: "BindingIdentifier", name: "x" }
          }]
        },
        expression: { type: "LiteralNumericExpression", value: 0 }
      }
    );

    testParse("({\"x\": y} = 0)", expr,
      {
        type: "AssignmentExpression",
        binding: {
          type: "ObjectBinding",
          properties: [{
            type: "BindingPropertyProperty",
            name: { type: "StaticPropertyName", value: "x" },
            binding: { type: "BindingIdentifier", name: "y" }
          }]
        },
        expression: { type: "LiteralNumericExpression", value: 0 }
      }
    );

    testParse("({'x': y} = 0)", expr,
      {
        type: "AssignmentExpression",
        binding: {
          type: "ObjectBinding",
          properties: [{
            type: "BindingPropertyProperty",
            name: { type: "StaticPropertyName", value: "x" },
            binding: { type: "BindingIdentifier", name: "y" }
          }]
        },
        expression: { type: "LiteralNumericExpression", value: 0 }
      }
    );

    testParse("({0: y} = 0)", expr,
      {
        type: "AssignmentExpression",
        binding: {
          type: "ObjectBinding",
          properties: [{
            type: "BindingPropertyProperty",
            name: { type: "StaticPropertyName", value: "0" },
            binding: { type: "BindingIdentifier", name: "y" }
          }]
        },
        expression: { type: "LiteralNumericExpression", value: 0 }
      }
    );

    testParse("({0: x, 1: x} = 0)", expr,
      {
        type: "AssignmentExpression",
        binding: {
          type: "ObjectBinding",
          properties: [{
            type: "BindingPropertyProperty",
            name: { type: "StaticPropertyName", value: "0" },
            binding: { type: "BindingIdentifier", name: "x" }
          }, {
            type: "BindingPropertyProperty",
            name: { type: "StaticPropertyName", value: "1" },
            binding: { type: "BindingIdentifier", name: "x" }
          }]
        },
        expression: { type: "LiteralNumericExpression", value: 0 }
      }
    );

    testParse("({x: y = 0} = 1)", expr,
      {
        type: "AssignmentExpression",
        binding: {
          type: "ObjectBinding",
          properties: [{
            type: "BindingPropertyProperty",
            name: { type: "StaticPropertyName", value: "x" },
            binding: {
              type: "BindingWithDefault",
              binding: { type: "BindingIdentifier", name: "y" },
              init: { type: "LiteralNumericExpression", value: 0 }
            }
          }]
        },
        expression: { type: "LiteralNumericExpression", value: 1 }
      }
    );

    testParse("({x: y = z = 0} = 1)", expr,
      {
        type: "AssignmentExpression",
        binding: {
          type: "ObjectBinding",
          properties: [{
            type: "BindingPropertyProperty",
            name: { type: "StaticPropertyName", value: "x" },
            binding: {
              type: "BindingWithDefault",
              binding: { type: "BindingIdentifier", name: "y" },
              init: {
                type: "AssignmentExpression",
                binding: { type: "BindingIdentifier", name: "z" },
                expression: { type: "LiteralNumericExpression", value: 0 }
              }
            }
          }]
        },
        expression: { type: "LiteralNumericExpression", value: 1 }
      }
    );

    testParse("({x: [y] = 0} = 1)", expr,
      {
        type: "AssignmentExpression",
        binding: {
          type: "ObjectBinding",
          properties: [{
            type: "BindingPropertyProperty",
            name: { type: "StaticPropertyName", value: "x" },
            binding: {
              type: "BindingWithDefault",
              binding: {
                type: "ArrayBinding",
                elements: [{ type: "BindingIdentifier", name: "y" }],
                restElement: null
              },
              init: { type: "LiteralNumericExpression", value: 0 }
            }
          }]
        },
        expression: { type: "LiteralNumericExpression", value: 1 }
      }
    );

    testParse("({a:let} = 0);", expr,
      {
        type: "AssignmentExpression",
        binding: {
          type: "ObjectBinding",
          properties: [
            {
              type: "BindingPropertyProperty",
              name: { type: "StaticPropertyName", value: "a" },
              binding: { type: "BindingIdentifier", name: "let" }
            }
          ]
        },
        expression: { type: "LiteralNumericExpression", value: 0 }
      });

    testParse("({let} = 0);", expr,
      {
        type: "AssignmentExpression",
        binding: {
          type: "ObjectBinding",
          properties: [
            {
              type: "BindingPropertyIdentifier",
              binding: { type: "BindingIdentifier", name: "let" },
              init: null
            }
          ]
        },
        expression: { type: "LiteralNumericExpression", value: 0 }
      });

    // testParse("({a:yield} = 0);", expr,
    //   {
    //     type: "AssignmentExpression",
    //     binding: {
    //       type: "ObjectBinding",
    //       properties: [
    //         {
    //           type: "BindingPropertyProperty",
    //           name: { type: "StaticPropertyName", value: "a" },
    //           binding: { type: "BindingIdentifier", name: "yield" }
    //         }
    //       ]
    //     },
    //     expression: { type: "LiteralNumericExpression", value: 0 }
    //   });

    // testParse("({yield} = 0);", expr,
    //   {
    //     type: "AssignmentExpression",
    //     binding: {
    //       type: "ObjectBinding",
    //       properties: [
    //         {
    //           type: "BindingPropertyIdentifier",
    //           binding: { type: "BindingIdentifier", name: "yield" },
    //           init: null
    //         }
    //       ]
    //     },
    //     expression: { type: "LiteralNumericExpression", value: 0 }
    //   });
    //
    // testParse("({yield = 0} = 0);", expr,
    //   {
    //     type: "AssignmentExpression",
    //     binding: {
    //       type: "ObjectBinding",
    //       properties: [
    //         {
    //           type: "BindingPropertyIdentifier",
    //           binding: { type: "BindingIdentifier", name: "yield" },
    //           init: { type: "LiteralNumericExpression", value: 0 }
    //         }
    //       ]
    //     },
    //     expression: { type: "LiteralNumericExpression", value: 0 }
    //   });
    //
    // testParse("(function*() { [...{ x = yield }] = 0; })", expr,
    //   {
    //     type: "FunctionExpression",
    //     name: null,
    //     isGenerator: true,
    //     params: { type: "FormalParameters", items: [], rest: null },
    //     body: {
    //       type: "FunctionBody",
    //       directives: [],
    //       statements: [{
    //         type: "ExpressionStatement",
    //         expression: {
    //           type: "AssignmentExpression",
    //           binding: {
    //             type: "ArrayBinding",
    //             elements: [],
    //             restElement: {
    //               type: "ObjectBinding",
    //               properties: [{
    //                 type: "BindingPropertyIdentifier",
    //                 binding: { type: "BindingIdentifier", name: "x" },
    //                 init: { type: "YieldExpression", expression: null }
    //               }]
    //             }
    //           },
    //           expression: { type: "LiteralNumericExpression", value: 0 }
    //         }
    //       }]
    //     }
    //   }
    // );
    //
    // testParseFailure("({a = 0});", "Illegal property initializer");
    // testParseFailure("({a} += 0);", "Invalid left-hand side in assignment");
    // testParseFailure("({a,,} = 0)", "Unexpected token \",\"");
    // testParseFailure("({,a,} = 0)", "Unexpected token \",\"");
    // testParseFailure("({a,,a} = 0)", "Unexpected token \",\"");
    // testParseFailure("({function} = 0)", "Unexpected token \"function\"");
    // testParseFailure("({a:function} = 0)", "Unexpected token \"}\"");
    // testParseFailure("({a:for} = 0)", "Unexpected token \"for\"");
    // testParseFailure("({'a'} = 0)", "Unexpected token \"}\"");
    // testParseFailure("({var} = 0)", "Unexpected token \"var\"");
    // testParseFailure("({a.b} = 0)", "Unexpected token \".\"");
    // testParseFailure("({0} = 0)", "Unexpected token \"}\"");
});
