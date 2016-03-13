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

test("array expression", function () {

  testParse("[]", expr, { type: "ArrayExpression", elements: [] });

  testParse("[ ]", expr, { type: "ArrayExpression", elements: [] });

  testParse("[ 0 ]", expr, { type: "ArrayExpression", elements: [{ type: "LiteralNumericExpression", value: 0 }] });

  testParse("[ 0, ]", expr, { type: "ArrayExpression", elements: [{ type: "LiteralNumericExpression", value: 0 }] });

  testParse("[ ,, 0 ]", expr, {
    type: "ArrayExpression",
    elements: [null, null, { type: "LiteralNumericExpression", value: 0 }]
  });

  testParse("[ 1, 2, 3, ]", expr, {
    type: "ArrayExpression",
    elements: [{ type: "LiteralNumericExpression", value: 1 }, {
      type: "LiteralNumericExpression",
      value: 2
    }, { type: "LiteralNumericExpression", value: 3 }]
  });

  testParse("[ 1, 2,, 3, ]", expr, {
    type: "ArrayExpression",
    elements: [{ type: "LiteralNumericExpression", value: 1 }, {
      type: "LiteralNumericExpression",
      value: 2
    }, null, { type: "LiteralNumericExpression", value: 3 }]
  });

  testParse("[,,1,,,2,3,,]", expr, {
    type: "ArrayExpression",
    elements: [null, null, {
      type: "LiteralNumericExpression",
      value: 1
    }, null, null, { type: "LiteralNumericExpression", value: 2 }, {
      type: "LiteralNumericExpression",
      value: 3
    }, null]
  });

});

// // new test added
testParse("[a, ...(b=c)]", expr, {
  type: "ArrayExpression",
  elements: [{type: "IdentifierExpression", name: "a"}, {
    type: "SpreadElement",
    expression: {
      type: "AssignmentExpression",
      binding: {type: "BindingIdentifier", name: "b"},
      expression: {type: "IdentifierExpression", name: "c"}
    }
  }]
});
