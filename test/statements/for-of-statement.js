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
import { expr, stmt, testParse, testParseFailure } from "../assertions";
import test from 'ava';

test("for of statement", function () {
  testParse("for (var x of list) process(x);", stmt,
    {
      type: "ForOfStatement",
      left: {
        type: "VariableDeclaration",
        kind: "var",
        declarators: [{ type: "VariableDeclarator", binding: { type: "BindingIdentifier", name: "x" }, init: null }]
      },
      right: { type: "IdentifierExpression", name: "list" },
      body: {
        type: "ExpressionStatement",
        expression: {
          type: "CallExpression",
          callee: { type: "IdentifierExpression", name: "process" },
          arguments: [{ type: "IdentifierExpression", name: "x" }]
        }
      }
    }
  );

  testParse("for(var a of b);", stmt,
    {
      type: "ForOfStatement",
      left: {
        type: "VariableDeclaration",
        kind: "var",
        declarators: [{ type: "VariableDeclarator", binding: { type: "BindingIdentifier", name: "a" }, init: null }]
      },
      right: { type: "IdentifierExpression", name: "b" },
      body: { type: "EmptyStatement" }
    }
  );

  testParse("for(a of b);", stmt,
    {
      type: "ForOfStatement",
      left: { type: "BindingIdentifier", name: "a" },
      right: { type: "IdentifierExpression", name: "b" },
      body: { type: "EmptyStatement" }
    }
  );

  // testParse("for(let [a] of b);", stmt,
  //   {
  //     type: "ForOfStatement",
  //     left: {
  //       type: "VariableDeclaration",
  //       kind: "let",
  //       declarators: [{
  //         type: "VariableDeclarator",
  //         binding: {
  //           type: "ArrayBinding",
  //           elements: [{ type: "BindingIdentifier", name: "a" }],
  //           restElement: null
  //         },
  //         init: null
  //       }]
  //     },
  //     right: { type: "IdentifierExpression", name: "b" },
  //     body: { type: "EmptyStatement" }
  //   }
  // );

  testParse("for(let of of b);", stmt,
    {
      type: "ForOfStatement",
      left: {
        type: "VariableDeclaration",
        kind: "let",
        declarators: [{
          type: "VariableDeclarator",
          binding: { type: "BindingIdentifier", name: "of" },
          init: null
        }]
      },
      right: { type: "IdentifierExpression", name: "b" },
      body: { type: "EmptyStatement" }
    }
  );

  testParse("for(const a of b);", stmt,
    {
      type: "ForOfStatement",
      left: {
        type: "VariableDeclaration",
        kind: "const",
        declarators: [{
          type: "VariableDeclarator",
          binding: { type: "BindingIdentifier", name: "a" },
          init: null
        }]
      },
      right: { type: "IdentifierExpression", name: "b" },
      body: { type: "EmptyStatement" }
    }
  );

  testParseFailure("for(let of 0);", "Unexpected number");
  testParseFailure("for(this of 0);", "Invalid left-hand side in for-of");

  testParseFailure("for(var a = 0 of b);", "Invalid variable declaration in for-of statement");
  testParseFailure("for(let a = 0 of b);", "Invalid variable declaration in for-of statement");
  testParseFailure("for(const a = 0 of b);", "Invalid variable declaration in for-of statement");

});
