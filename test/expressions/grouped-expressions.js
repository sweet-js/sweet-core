/**
 * Copyright 2015 Shape Security, Inc.
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

test("grouped expressiones", function () {
  // grouped expression that can be binding element and assignment target
  testParse("(a)", expr, { type: "IdentifierExpression", name: "a" });

  // grouped expression than cannot be binding element or assignment target
  testParse("(0)", expr, { type: "LiteralNumericExpression", value: 0 });

  // mixture
  testParse("(0, a)", expr, {
    type: "BinaryExpression",
    left: { type: "LiteralNumericExpression", value: 0 },
    operator: ",",
    right: { type: "IdentifierExpression", name: "a" }
  });

  testParse("(a, 0)", expr, {
    type: "BinaryExpression",
    left: { type: "IdentifierExpression", name: "a" },
    operator: ",",
    right: { type: "LiteralNumericExpression", value: 0 }
  });

  testParse("(a,a)", expr, {
    type: "BinaryExpression",
    left: { type: "IdentifierExpression", name: "a" },
    operator: ",",
    right: { type: "IdentifierExpression", name: "a" }
  });

  testParse("((a,a),(a,a))", expr, {
    type: "BinaryExpression",
    left: {
      type: "BinaryExpression",
      left: { type: "IdentifierExpression", name: "a" },
      operator: ",",
      right: { type: "IdentifierExpression", name: "a" }
    },
    operator: ",",
    right: {
      type: "BinaryExpression",
      left: { type: "IdentifierExpression", name: "a" },
      operator: ",",
      right: { type: "IdentifierExpression", name: "a" }
    }
  });

  testParse("((((((((((((((((((((((((((((((((((((((((a))))))))))))))))))))))))))))))))))))))))", expr,
    { type: "IdentifierExpression", name: "a" });

  testParseFailure("(0, {a = 0}) = 0", "Invalid left-hand side in assignment");
  testParseFailure("({a = 0})", "Illegal property initializer");
  testParseFailure("(0, {a = 0}) => 0", "Illegal arrow function parameter list");
  testParseFailure("({a = 0}, {a = 0}, 0) => 0", "Unexpected number");
});
