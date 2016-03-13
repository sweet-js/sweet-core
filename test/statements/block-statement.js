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

test("block statement", function () {

  testParse("{ foo }", stmt,
    { type: "BlockStatement",
      block:
        { type: "Block",
          statements:
            [ { type: "ExpressionStatement",
                expression:
                  { type: "IdentifierExpression", name: "foo" } } ] } }
  );

  testParse("{ doThis(); doThat(); }", stmt,
    { type: "BlockStatement",
      block:
        { type: "Block",
          statements:
            [ { type: "ExpressionStatement",
                expression:
                  { type: "CallExpression",
                    callee: { type: "IdentifierExpression", name: "doThis" },
                    arguments: [] } },
              { type: "ExpressionStatement",
                expression:
                  { type: "CallExpression",
                    callee: { type: "IdentifierExpression", name: "doThat" },
                    arguments: [] } } ] } }
  );

  testParse("{}", stmt,
    { type: "BlockStatement", block: { type: "Block", statements: [] } }
  );

});
