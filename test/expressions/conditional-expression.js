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

test("conditional expression", function () {

  testParse("a?b:c", expr,
    { type: "ConditionalExpression",
      test: { type: "IdentifierExpression", name: "a" },
      consequent: { type: "IdentifierExpression", name: "b" },
      alternate: { type: "IdentifierExpression", name: "c" } }
  );

  testParse("y ? 1 : 2", expr,
    { type: "ConditionalExpression",
      test: { type: "IdentifierExpression", name: "y" },
      consequent: { type: "LiteralNumericExpression", value: 1 },
      alternate: { type: "LiteralNumericExpression", value: 2 } }
  );

  testParse("x && y ? 1 : 2", expr,
    { type: "ConditionalExpression",
      test:
        { type: "BinaryExpression",
          operator: "&&",
          left: { type: "IdentifierExpression", name: "x" },
          right: { type: "IdentifierExpression", name: "y" } },
      consequent: { type: "LiteralNumericExpression", value: 1 },
      alternate: { type: "LiteralNumericExpression", value: 2 } }
  );

  testParse("x = (0) ? 1 : 2", expr,
    {
      type: "AssignmentExpression",
      binding: { type: "BindingIdentifier", name: "x" },
      expression: {
        type: "ConditionalExpression",
        test: { type: "LiteralNumericExpression", value: 0 },
        consequent: { type: "LiteralNumericExpression", value: 1 },
        alternate: { type: "LiteralNumericExpression", value: 2 }
      }
    }
  );
});
