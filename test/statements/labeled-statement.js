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

test("labeled statement", function () {

  testParse("start: for (;;) break start", stmt,
    { type: "LabeledStatement",
      label: "start",
      body:
        { type: "ForStatement",
          body: { type: "BreakStatement", label: "start" },
          init: null,
          test: null,
          update: null } }
  );

  testParse("start: while (true) break start", stmt,
    { type: "LabeledStatement",
      label: "start",
      body:
        { type: "WhileStatement",
          body: { type: "BreakStatement", label: "start" },
          test: { type: "LiteralBooleanExpression", value: true } } }
  );

  testParse("__proto__: test", stmt,
    { type: "LabeledStatement",
      label: "__proto__",
      body:
        { type: "ExpressionStatement",
          expression: { type: "IdentifierExpression", name: "test" } } }
  );

  testParse("a:{break a;}", stmt,
    { type: "LabeledStatement",
      label: "a",
      body:
        { type: "BlockStatement",
          block:
            { type: "Block",
              statements:
                [ { type: "BreakStatement", label: "a" } ] } } }
  );

});
