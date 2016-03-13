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

test("with statement", function () {

  testParse("with(1);", stmt,
    { type: "WithStatement",
      object: { type: "LiteralNumericExpression", value: 1 },
      body: { type: "EmptyStatement" } }
  );

  testParse("with (x) foo", stmt,
    { type: "WithStatement",
      object: { type: "IdentifierExpression", name: "x" },
      body:
        { type: "ExpressionStatement",
          expression: { type: "IdentifierExpression", name: "foo" } } }
  );

  testParse("with (x) foo;", stmt,
    { type: "WithStatement",
      object: { type: "IdentifierExpression", name: "x" },
      body:
        { type: "ExpressionStatement",
          expression: { type: "IdentifierExpression", name: "foo" } } }
  );

  testParse("with (x) { foo }", stmt,
    { type: "WithStatement",
      object: { type: "IdentifierExpression", name: "x" },
      body:
        { type: "BlockStatement",
          block:
            { type: "Block",
              statements:
                [ { type: "ExpressionStatement",
                    expression: { type: "IdentifierExpression", name: "foo" } } ] } } }
  );

});
