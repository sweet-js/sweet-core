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

test("call expression", function () {
  testParse("a(b,c)", expr,
    { type: "CallExpression",
      callee: { type: "IdentifierExpression", name: "a" },
      arguments:
        [ { type: "IdentifierExpression", name: "b" },
          { type: "IdentifierExpression", name: "c" } ] }
  );

  testParse("foo(bar, baz)", expr,
    { type: "CallExpression",
      callee: { type: "IdentifierExpression", name: "foo" },
      arguments:
        [ { type: "IdentifierExpression", name: "bar" },
          { type: "IdentifierExpression", name: "baz" } ] }
  );

  testParse("(    foo  )()", expr,
    { type: "CallExpression",
      callee: { type: "IdentifierExpression", name: "foo" },
      arguments: [] }
  );


  testParse("f(...a)", expr,
    {
      type: "CallExpression",
      callee: { type: "IdentifierExpression", name: "f" },
      arguments: [{ type: "SpreadElement", expression: { type: "IdentifierExpression", name: "a" } }]
    }
  );
  testParse("f(...a = b)", expr,
    {
      type: "CallExpression",
      callee: { type: "IdentifierExpression", name: "f" },
      arguments: [{
        type: "SpreadElement",
        expression: {
          type: "AssignmentExpression",
          binding: { type: "BindingIdentifier", name: "a" },
          expression: { type: "IdentifierExpression", name: "b" }
        }
      }]
    }
  );
  testParse("f(...a, ...b)", expr,
    {
      type: "CallExpression",
      callee: { type: "IdentifierExpression", name: "f" },
      arguments: [{
        type: "SpreadElement",
        expression: { type: "IdentifierExpression", name: "a" }
      }, { type: "SpreadElement", expression: { type: "IdentifierExpression", name: "b" } }]
    }
  );
  testParse("f(a, ...b, c)", expr,
    {
      type: "CallExpression",
      callee: { type: "IdentifierExpression", name: "f" },
      arguments: [{ type: "IdentifierExpression", name: "a" }, {
        type: "SpreadElement",
        expression: { type: "IdentifierExpression", name: "b" }
      }, { type: "IdentifierExpression", name: "c" }]
    }
  );
  testParse("f(...a, b, ...c)", expr,
    {
      type: "CallExpression",
      callee: { type: "IdentifierExpression", name: "f" },
      arguments: [{
        type: "SpreadElement",
        expression: { type: "IdentifierExpression", name: "a" }
      }, { type: "IdentifierExpression", name: "b" }, {
        type: "SpreadElement",
        expression: { type: "IdentifierExpression", name: "c" }
      }]
    }
  );
  testParse("f(....0)", expr,
    {
      type: "CallExpression",
      callee: { type: "IdentifierExpression", name: "f" },
      arguments: [{ type: "SpreadElement", expression: { type: "LiteralNumericExpression", value: 0 } }]
    }
  );
  testParse("f(.0)", expr,
    {
      type: "CallExpression",
      callee: { type: "IdentifierExpression", name: "f" },
      arguments: [{ type: "LiteralNumericExpression", value: 0 }]
    }
  );

  testParseFailure("f(..a)", "Unexpected token \".\"");
  testParseFailure("f(....a)", "Unexpected token \".\"");
  testParseFailure("f(... ... a)", "Unexpected token \"...\"");
});
