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
    testParse("var {a} = 0;", stmt,
      {
        type: "VariableDeclarationStatement",
        declaration: {
          type: "VariableDeclaration",
          kind: "var",
          declarators: [{
            type: "VariableDeclarator",
            binding: {
              type: "ObjectBinding",
              properties: [{
                type: "BindingPropertyIdentifier",
                binding: { type: "BindingIdentifier", name: "<<hygiene>>" },
                init: null
              }]
            },
            init: { type: "LiteralNumericExpression", value: 0 }
          }]
        }
      }
    );

    testParse("var [{a = 0}] = 0;", stmt,
      {
        type: "VariableDeclarationStatement",
        declaration: {
          type: "VariableDeclaration",
          kind: "var",
          declarators: [{
            type: "VariableDeclarator",
            binding: {
              type: "ArrayBinding",
              elements: [{
                type: "ObjectBinding",
                properties: [{
                  type: "BindingPropertyIdentifier",
                  binding: { type: "BindingIdentifier", name: "<<hygiene>>" },
                  init: { type: "LiteralNumericExpression", value: 0 }
                }]
              }],
              restElement: null
            },
            init: { type: "LiteralNumericExpression", value: 0 }
          }]
        }
      }
    );

    testParse("var [{__proto__:a, __proto__:b}] = 0;", stmt,
      {
        type: "VariableDeclarationStatement",
        declaration: {
          type: "VariableDeclaration",
          kind: "var",
          declarators: [{
            type: "VariableDeclarator",
            binding: {
              type: "ArrayBinding",
              elements: [{
                type: "ObjectBinding",
                properties: [{
                  type: "BindingPropertyProperty",
                  name: { type: "StaticPropertyName", value: "__proto__" },
                  binding: { type: "BindingIdentifier", name: "<<hygiene>>" }
                }, {
                  type: "BindingPropertyProperty",
                  name: { type: "StaticPropertyName", value: "__proto__" },
                  binding: { type: "BindingIdentifier", name: "<<hygiene>>" }
                }]
              }],
              restElement: null
            },
            init: { type: "LiteralNumericExpression", value: 0 }
          }]
        }
      }
    );

    testParse("var {a, x: {y: a}} = 0;", stmt,
      {
        type: "VariableDeclarationStatement",
        declaration: {
          type: "VariableDeclaration",
          kind: "var",
          declarators: [{
            type: "VariableDeclarator",
            binding: {
              type: "ObjectBinding",
              properties: [{
                type: "BindingPropertyIdentifier",
                binding: { type: "BindingIdentifier", name: "<<hygiene>>" },
                init: null
              }, {
                type: "BindingPropertyProperty",
                name: { type: "StaticPropertyName", value: "x" },
                binding: {
                  type: "ObjectBinding",
                  properties: [{
                    type: "BindingPropertyProperty",
                    name: { type: "StaticPropertyName", value: "y" },
                    binding: { type: "BindingIdentifier", name: "<<hygiene>>" }
                  }]
                }
              }]
            },
            init: { type: "LiteralNumericExpression", value: 0 }
          }]
        }
      }
    );

    testParse("var a, {x: {y: a}} = 0;", stmt,
      {
        type: "VariableDeclarationStatement",
        declaration: {
          type: "VariableDeclaration",
          kind: "var",
          declarators: [{
            type: "VariableDeclarator",
            binding: { type: "BindingIdentifier", name: "<<hygiene>>" },
            init: null
          }, {
            type: "VariableDeclarator",
            binding: {
              type: "ObjectBinding",
              properties: [{
                type: "BindingPropertyProperty",
                name: { type: "StaticPropertyName", value: "x" },
                binding: {
                  type: "ObjectBinding",
                  properties: [{
                    type: "BindingPropertyProperty",
                    name: { type: "StaticPropertyName", value: "y" },
                    binding: { type: "BindingIdentifier", name: "<<hygiene>>" }
                  }]
                }
              }]
            },
            init: { type: "LiteralNumericExpression", value: 0 }
          }]
        }
      }
    );

    testParse("var {let, yield} = 0;", stmt,
      {
        type: "VariableDeclarationStatement",
        declaration: {
          type: "VariableDeclaration",
          kind: "var",
          declarators: [{
            type: "VariableDeclarator",
            binding: {
              type: "ObjectBinding",
              properties: [
                {
                  type: "BindingPropertyIdentifier",
                  binding: { type: "BindingIdentifier", name: "<<hygiene>>" },
                  init: null
                },
                {
                  type: "BindingPropertyIdentifier",
                  binding: { type: "BindingIdentifier", name: "<<hygiene>>" },
                  init: null
                }
              ]
            },
            init: { type: "LiteralNumericExpression", value: 0 }
          }]
        }
      }
    );

    // testParseFailure("var {a: b.c} = 0;", "Unexpected token \".\"");
  // });

  // suite("formal parameter", function () {
  //   testParse("(a, b, [c]) => 0", expr, {
  //     type: "ArrowExpression",
  //     params: {
  //       type: "FormalParameters",
  //       items: [
  //         { type: "BindingIdentifier", name: "a" },
  //         { type: "BindingIdentifier", name: "b" },
  //         { type: "ArrayBinding", elements: [{ type: "BindingIdentifier", name: "c" }], restElement: null }],
  //       rest: null
  //     },
  //     body: {
  //       type: "LiteralNumericExpression", value: 0
  //     }
  //   });
  //
  //   // other passing cases are tested in other function test cases.
  //   testParseFailure("({e: a.b}) => 0", "Illegal arrow function parameter list");
  //   testParseFailure("function a({e: a.b}) {}", "Unexpected token \".\"");
  //   testParseFailure("function* a({e: a.b}) {}", "Unexpected token \".\"");
  //   testParseFailure("(function ({e: a.b}) {})", "Unexpected token \".\"");
  //   testParseFailure("(function* ({e: a.b}) {})", "Unexpected token \".\"");
  //   testParseFailure("({a({e: a.b}){}})", "Unexpected token \".\"");
  //   testParseFailure("({*a({e: a.b}){}})", "Unexpected token \".\"");
  //   testParseFailure("({set a({e: a.b}){}})", "Unexpected token \".\"");
  //
  // });
  //
  // suite("catch clause", function () {
  //   testParse("try {} catch ({e}) {}", stmt,
  //     {
  //       type: "TryCatchStatement",
  //       body: { type: "Block", statements: [] },
  //       catchClause: {
  //         type: "CatchClause",
  //         binding: {
  //           type: "ObjectBinding",
  //           properties: [{
  //             type: "BindingPropertyIdentifier",
  //             binding: { type: "BindingIdentifier", name: "e" },
  //             init: null
  //           }]
  //         },
  //         body: { type: "Block", statements: [] }
  //       }
  //     }
  //   );
  //
  //   testParse("try {} catch ({e = 0}) {}", stmt,
  //     {
  //       type: "TryCatchStatement",
  //       body: { type: "Block", statements: [] },
  //       catchClause: {
  //         type: "CatchClause",
  //         binding: {
  //           type: "ObjectBinding",
  //           properties: [{
  //             type: "BindingPropertyIdentifier",
  //             binding: { type: "BindingIdentifier", name: "e" },
  //             init: { type: "LiteralNumericExpression", value: 0 }
  //           }]
  //         },
  //         body: { type: "Block", statements: [] }
  //       }
  //     }
  //   );
  //
  //   testParseFailure("try {} catch ({e: x.a}) {}", "Unexpected token \".\"");
});
