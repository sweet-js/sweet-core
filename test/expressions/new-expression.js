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

test("new expression", function () {

  testParse("new a(b,c)", expr,
    { type: "NewExpression",
      callee: { type: "IdentifierExpression", name: "a" },
      arguments:
        [ { type: "IdentifierExpression", name: "b" },
          { type: "IdentifierExpression", name: "c" } ] }
  );

  testParse("new Button", expr,
    { type: "NewExpression",
      callee: { type: "IdentifierExpression", name: "Button" },
      arguments: [] }
  );

  testParse("new Button()", expr,
    { type: "NewExpression",
      callee: { type: "IdentifierExpression", name: "Button" },
      arguments: [] }
  );

  testParse("new Button(a)", expr,
    { type: "NewExpression",
      callee: { type: "IdentifierExpression", name: "Button" },
      arguments: [ { type: "IdentifierExpression", name: "a" } ] }
  );

  testParse("new new foo", expr,
    { type: "NewExpression",
      callee:
        { type: "NewExpression",
          callee: { type: "IdentifierExpression", name: "foo" },
          arguments: [] },
      arguments: [] }
  );

  testParse("new new foo()", expr,
    { type: "NewExpression",
      callee:
        { type: "NewExpression",
          callee: { type: "IdentifierExpression", name: "foo" },
          arguments: [] },
      arguments: [] }
  );


  testParse("new f(...a)", expr,
    {
      type: "NewExpression",
      callee: { type: "IdentifierExpression", name: "f" },
      arguments: [{ type: "SpreadElement", expression: { type: "IdentifierExpression", name: "a" } }]
    }
  );
  testParse("new f(...a = b)", expr,
    {
      type: "NewExpression",
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
  testParse("new f(...a, ...b)", expr,
    {
      type: "NewExpression",
      callee: { type: "IdentifierExpression", name: "f" },
      arguments: [{
        type: "SpreadElement",
        expression: { type: "IdentifierExpression", name: "a" }
      }, { type: "SpreadElement", expression: { type: "IdentifierExpression", name: "b" } }]
    }
  );
  testParse("new f(a, ...b, c)", expr,
    {
      type: "NewExpression",
      callee: { type: "IdentifierExpression", name: "f" },
      arguments: [{ type: "IdentifierExpression", name: "a" }, {
        type: "SpreadElement",
        expression: { type: "IdentifierExpression", name: "b" }
      }, { type: "IdentifierExpression", name: "c" }]
    }
  );
  testParse("new f(...a, b, ...c)", expr,
    {
      type: "NewExpression",
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
});
