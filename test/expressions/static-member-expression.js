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

test("static member expression", function () {
  testParse("a.b", expr,
    { type: "StaticMemberExpression", object: { type: "IdentifierExpression", name: "a" }, property: "b" }
  );
  testParse("a.b.c", expr,
    {
      type: "StaticMemberExpression",
      object: { type: "StaticMemberExpression", object: { type: "IdentifierExpression", name: "a" }, property: "b" },
      property: "c"
    }
  );
  testParse("a.$._.B0", expr,
    {
      type: "StaticMemberExpression",
      object: {
        type: "StaticMemberExpression",
        object: {
          type: "StaticMemberExpression",
          object: { type: "IdentifierExpression", name: "a" },
          property: "$"
        },
        property: "_"
      },
      property: "B0"
    }
  );
  testParse("a.if", expr,
    { type: "StaticMemberExpression", object: { type: "IdentifierExpression", name: "a" }, property: "if" }
  );
  testParse("a.true", expr,
    { type: "StaticMemberExpression", object: { type: "IdentifierExpression", name: "a" }, property: "true" }
  );
  testParse("a.false", expr,
    { type: "StaticMemberExpression", object: { type: "IdentifierExpression", name: "a" }, property: "false" }
  );
  testParse("a.null", expr,
    { type: "StaticMemberExpression", object: { type: "IdentifierExpression", name: "a" }, property: "null" }
  );
});
