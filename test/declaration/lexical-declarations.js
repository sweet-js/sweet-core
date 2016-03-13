/**
 * Copyright 2015 Shape Security, Inc.
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

test("declarations", function () {
  testParse("let a", stmt,
    {
      type: "VariableDeclarationStatement",
      declaration: {
        type: "VariableDeclaration",
        kind: "let",
        declarators: [{ type: "VariableDeclarator", binding: { type: "BindingIdentifier", name: "<<hygiene>>" }, init: null }]
      }
    }
  );

  testParse("{ let a; }", stmt,
    {
      type: "BlockStatement",
      block: {
        type: "Block",
        statements: [{
          type: "VariableDeclarationStatement",
          declaration: {
            type: "VariableDeclaration",
            kind: "let",
            declarators: [{
              type: "VariableDeclarator",
              binding: { type: "BindingIdentifier", name: "<<hygiene>>" },
              init: null
            }]
          }
        }]
      }
    });

  // TODO: lookahead let [ : testParseFailure("while(true) let[a] = 0", "Unexpected token \"let\"");
  // testParse("while(true) var a", stmt,
  //   {
  //     type: "WhileStatement",
  //     test: { type: "LiteralBooleanExpression", value: true },
  //     body: {
  //       type: "VariableDeclarationStatement",
  //       declaration: {
  //         type: "VariableDeclaration",
  //         kind: "var",
  //         declarators: [{ type: "VariableDeclarator", binding: { type: "BindingIdentifier", name: "a" }, init: null }]
  //       }
  //     }
  //   });

  testParseFailure("while(true) let a", "Unexpected token \"let\"");
  testParseFailure("while(true) const a", "Unexpected token \"const\"");
  testParseFailure("with(true) let a", "Unexpected token \"let\"");
  testParseFailure("with(true) class a {}", "Unexpected token \"class\"");

  testParseFailure("a: let a", "Unexpected token \"let\"");

});
