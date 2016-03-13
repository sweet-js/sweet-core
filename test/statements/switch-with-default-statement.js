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

test("switch with default statement", function () {

  testParse("switch(a){case 1:default:case 2:}", stmt,
    { type: "SwitchStatementWithDefault",
      discriminant: { type: "IdentifierExpression", name: "a" },
      preDefaultCases:
        [ { type: "SwitchCase",
            test: { type: "LiteralNumericExpression", value: 1 },
            consequent: [] } ],
      defaultCase: { type: "SwitchDefault", consequent: [] },
      postDefaultCases:
        [ { type: "SwitchCase",
            test: { type: "LiteralNumericExpression", value: 2 },
            consequent: [] } ] }
  );

  testParse("switch(a){case 1:default:}", stmt,
    { type: "SwitchStatementWithDefault",
      discriminant: { type: "IdentifierExpression", name: "a" },
      preDefaultCases:
        [ { type: "SwitchCase",
            test: { type: "LiteralNumericExpression", value: 1 },
            consequent: [] } ],
      defaultCase: { type: "SwitchDefault", consequent: [] },
      postDefaultCases: [] }
  );

  testParse("switch(a){default:case 2:}", stmt,
    { type: "SwitchStatementWithDefault",
      discriminant: { type: "IdentifierExpression", name: "a" },
      preDefaultCases: [],
      defaultCase: { type: "SwitchDefault", consequent: [] },
      postDefaultCases:
        [ { type: "SwitchCase",
            test: { type: "LiteralNumericExpression", value: 2 },
            consequent: [] } ] }
  );

  testParse("switch (answer) { case 0: hi(); break; default: break }", stmt,
    { type: "SwitchStatementWithDefault",
      discriminant: { type: "IdentifierExpression", name: "answer" },
      preDefaultCases:
        [ { type: "SwitchCase",
            test: { type: "LiteralNumericExpression", value: 0 },
            consequent:
              [ { type: "ExpressionStatement",
                  expression:
                    { type: "CallExpression",
                      callee: { type: "IdentifierExpression", name: "hi" },
                      arguments: [] } },
                { type: "BreakStatement", label: null } ] } ],
      defaultCase: { type: "SwitchDefault", consequent: [ { type: "BreakStatement", label: null } ] },
      postDefaultCases: [] }
  );

});
