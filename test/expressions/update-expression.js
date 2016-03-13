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

test("destructive unary expressions", function () {

  testParse("++a", expr,
    { type: "UpdateExpression",
      isPrefix: true,
      operand: { type: "BindingIdentifier", name: "a" },
      operator: "++" }
  );

  testParse("--a", expr,
    { type: "UpdateExpression",
      isPrefix: true,
      operand: { type: "BindingIdentifier", name: "a" },
      operator: "--" }
  );

  testParse("x++", expr,
    { type: "UpdateExpression",
      isPrefix: false,
      operand: { type: "BindingIdentifier", name: "x" },
      operator: "++" }
  );

  testParse("x--", expr,
    { type: "UpdateExpression",
      isPrefix: false,
      operand: { type: "BindingIdentifier", name: "x" },
      operator: "--" }
  );

  testParse("eval++", expr,
    { type: "UpdateExpression",
      isPrefix: false,
      operand: { type: "BindingIdentifier", name: "eval" },
      operator: "++" }
  );

  testParse("eval--", expr,
    { type: "UpdateExpression",
      isPrefix: false,
      operand: { type: "BindingIdentifier", name: "eval" },
      operator: "--" }
  );

  testParse("arguments++", expr,
    { type: "UpdateExpression",
      isPrefix: false,
      operand: { type: "BindingIdentifier", name: "arguments" },
      operator: "++" }
  );

  testParse("arguments--", expr,
    { type: "UpdateExpression",
      isPrefix: false,
      operand: { type: "BindingIdentifier", name: "arguments" },
      operator: "--" }
  );

});
