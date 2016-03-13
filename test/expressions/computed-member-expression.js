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

test("computed member expression", function () {

  testParse("a[b, c]", expr,
    { type: "ComputedMemberExpression",
      object: { type: "IdentifierExpression", name: "a" },
      expression:
        { type: "BinaryExpression",
          operator: ",",
          left: { type: "IdentifierExpression", name: "b" },
          right: { type: "IdentifierExpression", name: "c" } } }
  );

  testParse("a[b]", expr,
    { type: "ComputedMemberExpression",
      object: { type: "IdentifierExpression", name: "a" },
      expression: { type: "IdentifierExpression", name: "b" } }
  );

  testParse("a[b] = b", expr,
    {
      type: "AssignmentExpression",
      binding: {
        type: "ComputedMemberExpression",
        object: { type: "IdentifierExpression", name: "a" },
        expression: { type: "IdentifierExpression", name: "b" }
      },
      expression: { type: "IdentifierExpression", name: "b" }
    });

  testParse("(a[b]||(c[d]=e))", expr,
    {
      type: "BinaryExpression",
      left: {
        type: "ComputedMemberExpression",
        object: { type: "IdentifierExpression", name: "a" },
        expression: { type: "IdentifierExpression", name: "b" }
      },
      operator: "||",
      right: {
        type: "AssignmentExpression",
        binding: {
          type: "ComputedMemberExpression",
          object: { type: "IdentifierExpression", name: "c" },
          expression: { type: "IdentifierExpression", name: "d" }
        },
        expression: { type: "IdentifierExpression", name: "e" }
      }
    });

  testParse("a&&(b=c)&&(d=e)", expr, {
    type: "BinaryExpression",
    left: {
      type: "BinaryExpression",
      left: { type: "IdentifierExpression", name: "a" },
      operator: "&&",
      right: {
        type: "AssignmentExpression",
        binding: { type: "BindingIdentifier", name: "b" },
        expression: { type: "IdentifierExpression", name: "c" }
      }
    },
    operator: "&&",
    right: {
      type: "AssignmentExpression",
      binding: { type: "BindingIdentifier", name: "d" },
      expression: { type: "IdentifierExpression", name: "e" }
    }

  });
});
