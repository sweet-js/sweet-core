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

test("for statement", function () {

  testParse("for(x, y;;);", stmt,
    { type: "ForStatement",
      body: { type: "EmptyStatement" },
      init:
        { type: "BinaryExpression",
          operator: ",",
          left: { type: "IdentifierExpression", name: "x" },
          right: { type: "IdentifierExpression", name: "y" } },
      test: null,
      update: null }
  );

  testParse("for(x = 0;;);", stmt,
    {
      type: "ForStatement",
      init: {
        type: "AssignmentExpression",
        binding: { type: "BindingIdentifier", name: "x" },
        expression: { type: "LiteralNumericExpression", value: 0 }
      },
      test: null,
      update: null,
      body: { type: "EmptyStatement" }
    }
  );

  testParse("for(var x = 0;;);", stmt,
    {
      type: "ForStatement",
      init: {
        type: "VariableDeclaration",
        kind: "var",
        declarators: [{
          type: "VariableDeclarator",
          binding: { type: "BindingIdentifier", name: "x" },
          init: { type: "LiteralNumericExpression", value: 0 }
        }]
      },
      test: null,
      update: null,
      body: { type: "EmptyStatement" }
    }
  );

  testParse("for(let x = 0;;);", stmt,
    {
      type: "ForStatement",
      init: {
        type: "VariableDeclaration",
        kind: "let",
        declarators: [{
          type: "VariableDeclarator",
          binding: { type: "BindingIdentifier", name: "x" },
          init: { type: "LiteralNumericExpression", value: 0 }
        }]
      },
      test: null,
      update: null,
      body: { type: "EmptyStatement" }
    }
  );

  testParse("for(var x = 0, y = 1;;);", stmt,
    {
      type: "ForStatement",
      init: {
        type: "VariableDeclaration",
        kind: "var",
        declarators: [{
          type: "VariableDeclarator",
          binding: { type: "BindingIdentifier", name: "x" },
          init: { type: "LiteralNumericExpression", value: 0 }
        }, {
          type: "VariableDeclarator",
          binding: { type: "BindingIdentifier", name: "y" },
          init: { type: "LiteralNumericExpression", value: 1 }
        }]
      },
      test: null,
      update: null,
      body: { type: "EmptyStatement" }
    }
  );

  testParse("for(x; x < 0;);", stmt,
    { type: "ForStatement",
      body: { type: "EmptyStatement" },
      init: { type: "IdentifierExpression", name: "x" },
      test:
        { type: "BinaryExpression",
          operator: "<",
          left: { type: "IdentifierExpression", name: "x" },
          right: { type: "LiteralNumericExpression", value: 0 } },
      update: null }
  );

  // testParse("for(x; x < 0; x++);", stmt,
  //   { type: "ForStatement",
  //     body: { type: "EmptyStatement" },
  //     init: { type: "IdentifierExpression", name: "x" },
  //     test:
  //       { type: "BinaryExpression",
  //         operator: "<",
  //         left: { type: "IdentifierExpression", name: "x" },
  //         right: { type: "LiteralNumericExpression", value: 0 } },
  //     update:
  //       { type: "UpdateExpression",
  //         isPrefix: false,
  //         operand: { type: "BindingIdentifier", name: "x" },
  //         operator: "++" } }
  // );
  //
//   testParse("for(x; x < 0; x++) process(x);", stmt,
//     { type: "ForStatement",
//       body:
//         { type: "ExpressionStatement",
//           expression:
//             { type: "CallExpression",
//               callee: { type: "IdentifierExpression", name: "process" },
//               arguments: [ { type: "IdentifierExpression", name: "x" } ] } },
//       init: { type: "IdentifierExpression", name: "x" },
//       test:
//         { type: "BinaryExpression",
//           operator: "<",
//           left: { type: "IdentifierExpression", name: "x" },
//           right: { type: "LiteralNumericExpression", value: 0 } },
//       update:
//         { type: "UpdateExpression",
//           isPrefix: false,
//           operand: { type: "BindingIdentifier", name: "x" },
//           operator: "++" } }
//   );
//
  testParse("for(a;b;c);", stmt,
    { type: "ForStatement",
      body: { type: "EmptyStatement" },
      init: { type: "IdentifierExpression", name: "a" },
      test: { type: "IdentifierExpression", name: "b" },
      update: { type: "IdentifierExpression", name: "c" } }
  );

  testParse("for(var a;b;c);", stmt,
    {
      type: "ForStatement",
      init: {
        type: "VariableDeclaration",
        kind: "var",
        declarators: [{ type: "VariableDeclarator", binding: { type: "BindingIdentifier", name: "a" }, init: null }]
      },
      test: { type: "IdentifierExpression", name: "b" },
      update: { type: "IdentifierExpression", name: "c" },
      body: { type: "EmptyStatement" }
    }
  );

  testParse("for(var a = 0;b;c);", stmt,
    {
      type: "ForStatement",
      init: {
        type: "VariableDeclaration",
        kind: "var",
        declarators: [{
          type: "VariableDeclarator",
          binding: { type: "BindingIdentifier", name: "a" },
          init: { type: "LiteralNumericExpression", value: 0 }
        }]
      },
      test: { type: "IdentifierExpression", name: "b" },
      update: { type: "IdentifierExpression", name: "c" },
      body: { type: "EmptyStatement" }
    }
  );

  testParse("for(var a = 0;;) { let a; }", stmt,
    {
      type: "ForStatement",
      init: {
        type: "VariableDeclaration",
        kind: "var",
        declarators: [{
          type: "VariableDeclarator",
          binding: { type: "BindingIdentifier", name: "a" },
          init: { type: "LiteralNumericExpression", value: 0 }
        }]
      },
      test: null,
      update: null,
      body: {
        type: "BlockStatement",
        block: {
          type: "Block",
          statements: [{
            type: "VariableDeclarationStatement",
            declaration: {
              type: "VariableDeclaration",
              kind: "let",
              declarators: [{
                type: "VariableDeclarator",
                binding: { type: "BindingIdentifier", name: "a" },
                init: null
              }]
            }
          }]
        }
      }
    }
  );

  testParse("for(;b;c);", stmt,
    { type: "ForStatement",
      body: { type: "EmptyStatement" },
      init: null,
      test: { type: "IdentifierExpression", name: "b" },
      update: { type: "IdentifierExpression", name: "c" } }
  );

  testParse("for(let of;;);", stmt,
    { type: "ForStatement",
      body: { type: "EmptyStatement" },
      init: {
        type: "VariableDeclaration",
        kind: "let",
        declarators: [{ type: "VariableDeclarator", binding: { type: "BindingIdentifier", name: "of" }, init: null }]
      },
      test: null,
      update: null }
  );

  testParse("for(let a;;); let a;", stmt,
    { type: "ForStatement",
      body: { type: "EmptyStatement" },
      init: {
        type: "VariableDeclaration",
        kind: "let",
        declarators: [{ type: "VariableDeclarator", binding: { type: "BindingIdentifier", name: "<<hygiene>>" }, init: null }]
      },
      test: null,
      update: null }
  );

//   testParseFailure("for({a=0};;);", "Illegal property initializer");
});
