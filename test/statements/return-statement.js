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

test("return statement", function () {
  testParse("(function(){ return })", expr,
    { type: "FunctionExpression",
      isGenerator: false,
      name: null,
      params: { type: "FormalParameters", items: [], rest: null },
      body: { type: "FunctionBody", directives: [], statements: [
        { type: "ReturnStatement", expression: null },
      ] }
    }
  );
  testParse("(function(){ return; })", expr,
    { type: "FunctionExpression",
      isGenerator: false,
      name: null,
      params: { type: "FormalParameters", items: [], rest: null },
      body: { type: "FunctionBody", directives: [], statements: [
        { type: "ReturnStatement", expression: null },
      ] }
    }
  );
  testParse("(function(){ return x; })", expr,
    { type: "FunctionExpression",
      isGenerator: false,
      name: null,
      params: { type: "FormalParameters", items: [], rest: null },
      body: { type: "FunctionBody", directives: [], statements: [
        { type: "ReturnStatement", expression: { type: "IdentifierExpression", name: "x" } },
      ] }
    }
  );
  testParse("(function(){ return x * y })", expr,
    { type: "FunctionExpression",
      isGenerator: false,
      name: null,
      params: { type: "FormalParameters", items: [], rest: null },
      body: { type: "FunctionBody", directives: [], statements: [
        { type: "ReturnStatement",
          expression: {
            type: "BinaryExpression",
            operator: "*",
            left: { type: "IdentifierExpression", name: "x" },
            right: { type: "IdentifierExpression", name: "y" }
          }
        },
      ] }
    }
  );

  // testParse("_ => { return 0; }", expr,
  //   { type: "ArrowExpression",
  //     params:
  //       { type: "FormalParameters",
  //         items: [{ type: "BindingIdentifier", name: "_"}],
  //         rest: null
  //       },
  //     body:
  //       { type: "FunctionBody",
  //         directives: [],
  //         statements: [
  //           { type: "ReturnStatement", expression: { type: "LiteralNumericExpression", value: 0 } },
  //         ]
  //       }
  //   }
  // );
  //
  testParseFailure("return;", "Illegal return statement");
  testParseFailure("{ return; }", "Illegal return statement");
  testParseFailure("if (false) { return; }", "Illegal return statement");

});
