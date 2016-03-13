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

test("array binding", function () {
    testParse("var [,a] = 0;", stmt,
      {
        type: "VariableDeclarationStatement",
        declaration: {
          type: "VariableDeclaration",
          kind: "var",
          declarators: [{
            type: "VariableDeclarator",
            binding: {
              type: "ArrayBinding",
              elements: [null, { type: "BindingIdentifier", name: "<<hygiene>>" }],
              restElement: null
            },
            init: { type: "LiteralNumericExpression", value: 0 }
          }]
        }
      }
    );

    testParse("var [a]=[1];", stmt,
      {
        type: "VariableDeclarationStatement",
        declaration: {
          type: "VariableDeclaration",
          kind: "var",
          declarators: [{
            type: "VariableDeclarator",
            binding: {
              type: "ArrayBinding",
              elements: [{ type: "BindingIdentifier", name: "<<hygiene>>" }],
              restElement: null
            },
            init: { type: "ArrayExpression", elements: [{ type: "LiteralNumericExpression", value: 1 }] }
          }]
        }
      }
    );

    testParse("var [[a]]=0;", stmt,
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
                type: "ArrayBinding",
                elements: [{ type: "BindingIdentifier", name: "<<hygiene>>" }],
                restElement: null
              }],
              restElement: null
            },
            init: { type: "LiteralNumericExpression", value: 0 }
          }]
        }
      }
    );

    testParse("var a, [a] = 0;", stmt,
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
              type: "ArrayBinding",
              elements: [{ type: "BindingIdentifier", name: "<<hygiene>>" }],
              restElement: null
            },
            init: { type: "LiteralNumericExpression", value: 0 }
          }]
        }
      }
    );


    testParse("var [a, a] = 0;", stmt,
      {
        type: "VariableDeclarationStatement",
        declaration: {
          type: "VariableDeclaration",
          kind: "var",
          declarators: [{
            type: "VariableDeclarator",
            binding: {
              type: "ArrayBinding",
              elements: [{ type: "BindingIdentifier", name: "<<hygiene>>" }, { type: "BindingIdentifier", name: "<<hygiene>>" }],
              restElement: null
            },
            init: { type: "LiteralNumericExpression", value: 0 }
          }]
        }
      }
    );

    testParse("var [a, ...a] = 0;", stmt,
      {
        type: "VariableDeclarationStatement",
        declaration: {
          type: "VariableDeclaration",
          kind: "var",
          declarators: [{
            type: "VariableDeclarator",
            binding: {
              type: "ArrayBinding",
              elements: [{ type: "BindingIdentifier", name: "<<hygiene>>" }],
              restElement: { type: "BindingIdentifier", name: "<<hygiene>>" }
            },
            init: { type: "LiteralNumericExpression", value: 0 }
          }]
        }
      }
    );

  //   testParseFailure("var [a.b] = 0", "Unexpected token \".\"");
  //   testParseFailure("var ([x]) = 0", "Unexpected token \"(\"");
  // });
  //
  // suite("formal parameter", function () {
  //   // passing cases are tested in other function test cases.
  //   testParseFailure("([a.b]) => 0", "Illegal arrow function parameter list");
  //   testParseFailure("function a([a.b]) {}", "Unexpected token \".\"");
  //   testParseFailure("function* a([a.b]) {}", "Unexpected token \".\"");
  //   testParseFailure("(function ([a.b]) {})", "Unexpected token \".\"");
  //   testParseFailure("(function* ([a.b]) {})", "Unexpected token \".\"");
  //   testParseFailure("({a([a.b]){}})", "Unexpected token \".\"");
  //   testParseFailure("({*a([a.b]){}})", "Unexpected token \".\"");
  //   testParseFailure("({set a([a.b]){}})", "Unexpected token \".\"");
  // });
  //
  // suite("catch clause", function () {
  //   testParse("try {} catch ([e]) {}", stmt,
  //     {
  //       type: "TryCatchStatement",
  //       body: { type: "Block", statements: [] },
  //       catchClause: {
  //         type: "CatchClause",
  //         binding: { type: "ArrayBinding", elements: [{ type: "BindingIdentifier", name: "e" }], restElement: null },
  //         body: { type: "Block", statements: [] }
  //       }
  //     }
  //   );
  //
  //   testParse("try {} catch ([e, ...a]) {}", stmt,
  //     {
  //       type: "TryCatchStatement",
  //       body: { type: "Block", statements: [] },
  //       catchClause: {
  //         type: "CatchClause",
  //         binding: {
  //           type: "ArrayBinding",
  //           elements: [{ type: "BindingIdentifier", name: "e" }],
  //           restElement: { type: "BindingIdentifier", name: "a" }
  //         },
  //         body: { type: "Block", statements: [] }
  //       }
  //     }
  //   );
  //
  });
