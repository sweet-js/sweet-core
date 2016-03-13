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

test("if statement", function () {

  testParse("if (morning) goodMorning()", stmt,
    { type: "IfStatement",
      test: { type: "IdentifierExpression", name: "morning" },
      consequent:
        { type: "ExpressionStatement",
          expression:
            { type: "CallExpression",
              callee: { type: "IdentifierExpression", name: "goodMorning" },
              arguments: [] } },
      alternate: null }
  );

  testParse("if (morning) (function(){})", stmt,
    {
      type: "IfStatement",
      test: { type: "IdentifierExpression", name: "morning" },
      consequent: {
        type: "ExpressionStatement",
        expression: {
          type: "FunctionExpression",
          isGenerator: false,
          name: null,
          params: { type: "FormalParameters", items: [], rest: null },
          body: { type: "FunctionBody", directives: [], statements: [] }
        }
      },
      alternate: null
    }
  );

  testParse("if (morning) var x = 0;", stmt,
    {
      type: "IfStatement",
      test: { type: "IdentifierExpression", name: "morning" },
      consequent: {
        type: "VariableDeclarationStatement",
        declaration: {
          type: "VariableDeclaration",
          kind: "var",
          declarators: [{
            type: "VariableDeclarator",
            binding: { type: "BindingIdentifier", name: "x" },
            init: { type: "LiteralNumericExpression", value: 0 }
          }]
        }
      },
      alternate: null
    }
  );

  testParse("if (morning) goodMorning(); else goodDay()", stmt,
    { type: "IfStatement",
      test: { type: "IdentifierExpression", name: "morning" },
      consequent:
        { type: "ExpressionStatement",
          expression:
            { type: "CallExpression",
              callee: { type: "IdentifierExpression", name: "goodMorning" },
              arguments: [] } },
      alternate:
        { type: "ExpressionStatement",
          expression:
            { type: "CallExpression",
              callee: { type: "IdentifierExpression", name: "goodDay" },
              arguments: [] } } }
  );

  testParse("if(a)b;", stmt,
    { type: "IfStatement",
      test: { type: "IdentifierExpression", name: "a" },
      consequent:
        { type: "ExpressionStatement",
          expression: { type: "IdentifierExpression", name: "b" } },
      alternate: null }
  );

  testParse("if(a)b;else c;", stmt,
    { type: "IfStatement",
      test: { type: "IdentifierExpression", name: "a" },
      consequent:
        { type: "ExpressionStatement",
          expression: { type: "IdentifierExpression", name: "b" } },
      alternate:
        { type: "ExpressionStatement",
          expression: { type: "IdentifierExpression", name: "c" } } }
  );

});
