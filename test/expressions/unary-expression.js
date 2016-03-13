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

test("non-destructive unary expressions", function () {

  testParse("!a", expr,
    { type: "UnaryExpression",
      operand: { type: "IdentifierExpression", name: "a" },
      operator: "!" }
  );

  testParse("!(a=b)", expr,
    {
      type: "UnaryExpression",
      operand: {
        type: "AssignmentExpression",
        binding: { type: "BindingIdentifier", name: "a" },
        expression: { type: "IdentifierExpression", name: "b" }
      },
      operator: "!"
    }
  );

  testParse("typeof a", expr,
    { type: "UnaryExpression",
      operand: { type: "IdentifierExpression", name: "a" },
      operator: "typeof" }
  );

  testParse("void a", expr,
    { type: "UnaryExpression",
      operand: { type: "IdentifierExpression", name: "a" },
      operator: "void" }
  );

  testParse("delete a", expr,
    { type: "UnaryExpression",
      operand: { type: "IdentifierExpression", name: "a" },
      operator: "delete" }
  );

  testParse("+a", expr,
    { type: "UnaryExpression",
      operand: { type: "IdentifierExpression", name: "a" },
      operator: "+" }
  );

  testParse("~a", expr,
    { type: "UnaryExpression",
      operand: { type: "IdentifierExpression", name: "a" },
      operator: "~" }
  );

  testParse("-a", expr,
    { type: "UnaryExpression",
      operand: { type: "IdentifierExpression", name: "a" },
      operator: "-" }
  );

});
