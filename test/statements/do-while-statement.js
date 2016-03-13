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

test("do while statement", function () {

  testParse("do keep(); while (true);", stmt,
    { type: "DoWhileStatement",
      body:
        { type: "ExpressionStatement",
          expression:
            { type: "CallExpression",
              callee: { type: "IdentifierExpression", name: "keep" },
              arguments: [] } },
      test: { type: "LiteralBooleanExpression", value: true } }
  );

  testParse("do continue; while(1);", stmt,
    { type: "DoWhileStatement",
      body: { type: "ContinueStatement", label: null },
      test: { type: "LiteralNumericExpression", value: 1 } }
  );

  testParse("do ; while (true)", stmt,
    { type: "DoWhileStatement",
      body: { type: "EmptyStatement" },
      test: { type: "LiteralBooleanExpression", value: true } }
  );

  testParse("do {} while (true)", stmt,
    { type: "DoWhileStatement",
      body:
        { type: "BlockStatement",
          block: { type: "Block", statements: [] } },
          test: { type: "LiteralBooleanExpression", value: true } }
  );

  testParse("{do ; while(false); false}", stmt,
    {
      type: "BlockStatement",
      block: {
        type: "Block",
        statements: [{
          type: "DoWhileStatement",
          body: { type: "EmptyStatement" },
          test: { type: "LiteralBooleanExpression", value: false }
        }, { type: "ExpressionStatement", expression: { type: "LiteralBooleanExpression", value: false } }]
      }
    }
  );

  testParse("{do ; while(false) false}", stmt,
    {
      type: "BlockStatement",
      block: {
        type: "Block",
        statements: [{
          type: "DoWhileStatement",
          body: { type: "EmptyStatement" },
          test: { type: "LiteralBooleanExpression", value: false }
        }, { type: "ExpressionStatement", expression: { type: "LiteralBooleanExpression", value: false } }]
      }
    }
  );
});
