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

test("switch statement", function () {

  testParse("switch (x) {}", stmt,
    { type: "SwitchStatement",
      discriminant: { type: "IdentifierExpression", name: "x" },
      cases: [] }
  );

  testParse("switch(a){case 1:}", stmt,
    { type: "SwitchStatement",
      discriminant: { type: "IdentifierExpression", name: "a" },
      cases:
        [ { type: "SwitchCase",
            test: { type: "LiteralNumericExpression", value: 1 },
            consequent: [] } ] }
  );

  testParse("switch (answer) { case 0: hi(); break; }", stmt,
    { type: "SwitchStatement",
      discriminant: { type: "IdentifierExpression", name: "answer" },
      cases:
        [ { type: "SwitchCase",
            test: { type: "LiteralNumericExpression", value: 0 },
            consequent:
              [ { type: "ExpressionStatement",
                  expression:
                    { type: "CallExpression",
                      callee: { type: "IdentifierExpression", name: "hi" },
                      arguments: [] } },
                { type: "BreakStatement", label: null } ] } ] }
  );

  testParse("switch (answer) { case 0: let a; }", stmt,
    { type: "SwitchStatement",
      discriminant: { type: "IdentifierExpression", name: "answer" },
      cases:
        [ { type: "SwitchCase",
            test: { type: "LiteralNumericExpression", value: 0 },
            consequent:
              [ { type: "VariableDeclarationStatement",
                  declaration:
                  { type: "VariableDeclaration",
                    kind: "let",
                    declarators: [
                      { type: "VariableDeclarator",
                        binding:
                        { type: "BindingIdentifier", name: "a" },
                        init: null
                      } ]
                  }
              } ]
        } ]
    } );
});
