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

test("break statement", function () {

  testParse("while (true) { break }", stmt,
    { type: "WhileStatement",
      body:
        { type: "BlockStatement",
          block:
            { type: "Block",
              statements: [ { type: "BreakStatement", label: null } ] } },
      test: { type: "LiteralBooleanExpression", value: true } }
  );

  testParse("done: while (true) { break done }", stmt,
    { type: "LabeledStatement",
      label: "done",
      body:
        { type: "WhileStatement",
          body:
            { type: "BlockStatement",
              block:
                { type: "Block",
                  statements:
                    [ { type: "BreakStatement",
                        label: "done" } ] } },
      test: { type: "LiteralBooleanExpression", value: true } } }
  );

  testParse("done: while (true) { break done; }", stmt,
    { type: "LabeledStatement",
      label: "done",
      body:
        { type: "WhileStatement",
          body:
            { type: "BlockStatement",
              block:
                { type: "Block",
                  statements:
                    [ { type: "BreakStatement",
                        label: "done" } ] } },
      test: { type: "LiteralBooleanExpression", value: true } } }
  );

  testParse("__proto__: while (true) { break __proto__; }", stmt,
    { type: "LabeledStatement",
      label: "__proto__",
      body:
        { type: "WhileStatement",
          body:
            { type: "BlockStatement",
              block:
                { type: "Block",
                  statements:
                    [ { type: "BreakStatement",
                        label: "__proto__" } ] } },
      test: { type: "LiteralBooleanExpression", value: true } } }
  );

});
