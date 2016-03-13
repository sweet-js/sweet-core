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

test("while statement", function () {

  testParse("while(1);", stmt,
    { type: "WhileStatement",
      body: { type: "EmptyStatement" },
      test: { type: "LiteralNumericExpression", value: 1 } }
  );

  testParse("while (true) doSomething()", stmt,
    { type: "WhileStatement",
      body:
        { type: "ExpressionStatement",
          expression:
            { type: "CallExpression",
              callee: { type: "IdentifierExpression", name: "doSomething" },
              arguments: [] } },
      test: { type: "LiteralBooleanExpression", value: true } }
  );

  // testParse("while (x < 10) { x++; y--; }", stmt,
  //   { type: "WhileStatement",
  //     body:
  //       { type: "BlockStatement",
  //         block:
  //           { type: "Block",
  //             statements:
  //               [ { type: "ExpressionStatement",
  //                   expression:
  //                     { type: "UpdateExpression",
  //                       isPrefix: false,
  //                       operand: { type: "BindingIdentifier", name: "x" },
  //                       operator: "++" } },
  //                 { type: "ExpressionStatement",
  //                   expression:
  //                     { type: "UpdateExpression",
  //                       isPrefix: false,
  //                       operand: { type: "BindingIdentifier", name: "y" },
  //                       operator: "--" } } ] } },
  //     test:
  //       { type: "BinaryExpression",
  //         operator: "<",
  //         left: { type: "IdentifierExpression", name: "x" },
  //         right: { type: "LiteralNumericExpression", value: 10 } } }
  // );

});
