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

test("identifier expression", function () {

  testParse("x", expr,
    { type: "IdentifierExpression", name: "x" }
  );

  testParse("x;", expr,
    { type: "IdentifierExpression", name: "x" }
  );

  testParse("await", expr,
    { type: "IdentifierExpression", name: "await" }
  );
  // testParseModuleFailure("await", "Unexpected token \"await\"");
  // testParseModuleFailure("function f() { var await }", "Unexpected token \"await\"");

  test("let used as identifier expression", function () {

    testParse("let", expr,
      { type: "IdentifierExpression", name: "let" }
    );

    testParse("let()", expr,
      { type: "CallExpression", callee: { type: "IdentifierExpression", name: "let" }, arguments: [] }
    );

    testParse("(let[let])", expr,
      { type: "ComputedMemberExpression", object: { type: "IdentifierExpression", name: "let" }, expression: { type: "IdentifierExpression", name: "let" } }
    );

    testParse("let.let", expr,
      { type: "StaticMemberExpression", object: { type: "IdentifierExpression", name: "let" }, property: "let" }
    );

    testParse("for(let;;);", stmt,
      { type: "ForStatement",
        init: { type: "IdentifierExpression", name: "let" },
        test: null,
        update: null,
        body: { type: "EmptyStatement"}
      }
    );

    testParse("for(let();;);", stmt,
      { type: "ForStatement",
        init: { type: "CallExpression", callee: { type: "IdentifierExpression", name: "let" }, arguments: [] },
        test: null,
        update: null,
        body: { type: "EmptyStatement"}
      }
    );

    testParse("for(let yield in 0);", stmt,
      { type: "ForInStatement",
        left: {
          type: "VariableDeclaration",
          kind: "let",
          declarators: [ {
            type: "VariableDeclarator",
            binding: { name: "yield", type: "BindingIdentifier" },
            init: null
          } ] },
        right: { type: "LiteralNumericExpression", value: 0},
        body: { type: "EmptyStatement"}
      }
    );

    testParse("for(let.let in 0);", stmt,
      { type: "ForInStatement",
        left: { type: "StaticMemberExpression", object: { type: "IdentifierExpression", name: "let" }, property: "let" },
        right: { type: "LiteralNumericExpression", value: 0},
        body: { type: "EmptyStatement"}
      }
    );

    // testParseFailure("for(let[a].b of 0);", "Unexpected token \".\"");
    // testParseFailure("for(let[a]().b of 0);", "Unexpected token \"(\"");
    // testParseFailure("for(let.a of 0);", "Invalid left-hand side in for-of");
  });

  test("unicode identifier", function () {
    // Unicode
    testParse("日本語", expr,
      { type: "IdentifierExpression", name: "日本語" }
    );

    testParse("\uD800\uDC00", expr,
      { type: "IdentifierExpression", name: "\uD800\uDC00" }
    );

    testParse("T\u203F", expr,
      { type: "IdentifierExpression", name: "T\u203F" }
    );

    testParse("T\u200C", expr,
      { type: "IdentifierExpression", name: "T\u200C" }
    );

    testParse("T\u200D", expr,
      { type: "IdentifierExpression", name: "T\u200D" }
    );

    testParse("\u2163\u2161", expr,
      { type: "IdentifierExpression", name: "\u2163\u2161" }
    );

    testParse("\u2163\u2161\u200A", expr,
      { type: "IdentifierExpression", name: "\u2163\u2161" }
    );

    // testParseFailure("\\uD800\\uDC00", "Unexpected \"\\\\\"");

  });

});
