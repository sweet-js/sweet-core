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

test("continue statement", function () {

  testParse("while (true) { continue; }", stmt,
    { type: "WhileStatement",
      body:
        { type: "BlockStatement",
          block:
            { type: "Block",
              statements: [ { type: "ContinueStatement", label: null } ] } },
      test: { type: "LiteralBooleanExpression", value: true } }
  );

  testParse("while (true) { continue }", stmt,
    { type: "WhileStatement",
      body:
        { type: "BlockStatement",
          block:
            { type: "Block",
              statements: [ { type: "ContinueStatement", label: null } ] } },
      test: { type: "LiteralBooleanExpression", value: true } }
  );

  testParse("done: while (true) { continue done }", stmt,
    { type: "LabeledStatement",
      label: "done",
      body:
        { type: "WhileStatement",
          body:
            { type: "BlockStatement",
              block:
                { type: "Block",
                  statements:
                    [ { type: "ContinueStatement", label: "done" } ] } },
      test: { type: "LiteralBooleanExpression", value: true } } }
  );

  testParse("done: while (true) { continue done; }", stmt,
    { type: "LabeledStatement",
      label: "done",
      body:
        { type: "WhileStatement",
          body:
            { type: "BlockStatement",
              block:
                { type: "Block",
                  statements:
                    [ { type: "ContinueStatement", label: "done" } ] } },
      test: { type: "LiteralBooleanExpression", value: true } } }
  );

  testParse("__proto__: while (true) { continue __proto__; }", stmt,
    { type: "LabeledStatement",
      label: "__proto__",
      body:
        { type: "WhileStatement",
          body:
            { type: "BlockStatement",
              block:
                { type: "Block",
                  statements:
                    [ { type: "ContinueStatement", label: "__proto__" } ] } },
      test: { type: "LiteralBooleanExpression", value: true } } }
  );

  testParse("a: do continue a; while(1);", stmt,
    { type: "LabeledStatement",
      label: "a",
      body:
        { type: "DoWhileStatement",
          body: { type: "ContinueStatement", label: "a" },
      test: { type: "LiteralNumericExpression", value: 1 } } }
  );

  testParse("a: while (0) { continue \n b; }", stmt,
    { type: "LabeledStatement",
      label: "a",
      body:
        { type: "WhileStatement",
          body:
            { type: "BlockStatement",
              block:
                { type: "Block",
                  statements:
                    [ { type: "ContinueStatement", label: null },
                      { type: "ExpressionStatement",
                        expression: { type: "IdentifierExpression", name: "b" } } ] } },
      test: { type: "LiteralNumericExpression", value: 0 } } }
  );

  testParse("a: while (0) { continue \r b; }", stmt,
    { type: "LabeledStatement",
      label: "a",
      body:
        { type: "WhileStatement",
          body:
            { type: "BlockStatement",
              block:
                { type: "Block",
                  statements:
                    [ { type: "ContinueStatement", label: null },
                      { type: "ExpressionStatement",
                        expression: { type: "IdentifierExpression", name: "b" } } ] } },
      test: { type: "LiteralNumericExpression", value: 0 } } }
  );

  testParse("a: while (0) { continue \r\n b; }", stmt,
    { type: "LabeledStatement",
      label: "a",
      body:
        { type: "WhileStatement",
          body:
            { type: "BlockStatement",
              block:
                { type: "Block",
                  statements:
                    [ { type: "ContinueStatement", label: null },
                      { type: "ExpressionStatement",
                        expression: { type: "IdentifierExpression", name: "b" } } ] } },
      test: { type: "LiteralNumericExpression", value: 0 } } }
  );

  testParse("a: while (0) { continue /*\r*/ b; }", stmt,
    { type: "LabeledStatement",
      label: "a",
      body:
        { type: "WhileStatement",
          body:
            { type: "BlockStatement",
              block:
                { type: "Block",
                  statements:
                    [ { type: "ContinueStatement", label: null },
                      { type: "ExpressionStatement",
                        expression: { type: "IdentifierExpression", name: "b" } } ] } },
      test: { type: "LiteralNumericExpression", value: 0 } } }
  );

  testParse("a: while (0) { continue /*\n*/ b; }", stmt,
    { type: "LabeledStatement",
      label: "a",
      body:
        { type: "WhileStatement",
          body:
            { type: "BlockStatement",
              block:
                { type: "Block",
                  statements:
                    [ { type: "ContinueStatement", label: null },
                      { type: "ExpressionStatement",
                        expression: { type: "IdentifierExpression", name: "b" } } ] } },
      test: { type: "LiteralNumericExpression", value: 0 } } }
  );

  testParse("a: while (0) { continue /*\r\n*/ b; }", stmt,
    { type: "LabeledStatement",
      label: "a",
      body:
        { type: "WhileStatement",
          body:
            { type: "BlockStatement",
              block:
                { type: "Block",
                  statements:
                    [ { type: "ContinueStatement", label: null },
                      { type: "ExpressionStatement",
                        expression: { type: "IdentifierExpression", name: "b" } } ] } },
      test: { type: "LiteralNumericExpression", value: 0 } } }
  );

  testParse("a: while (0) { continue /*\u2028*/ b; }", stmt,
    { type: "LabeledStatement",
      label: "a",
      body:
        { type: "WhileStatement",
          body:
            { type: "BlockStatement",
              block:
                { type: "Block",
                  statements:
                    [ { type: "ContinueStatement", label: null },
                      { type: "ExpressionStatement",
                        expression: { type: "IdentifierExpression", name: "b" } } ] } },
      test: { type: "LiteralNumericExpression", value: 0 } } }
  );

  testParse("a: while (0) { continue /*\u2029*/ b; }", stmt,
    { type: "LabeledStatement",
      label: "a",
      body:
        { type: "WhileStatement",
          body:
            { type: "BlockStatement",
              block:
                { type: "Block",
                  statements:
                    [ { type: "ContinueStatement", label: null },
                      { type: "ExpressionStatement",
                        expression: { type: "IdentifierExpression", name: "b" } } ] } },
      test: { type: "LiteralNumericExpression", value: 0 } } }
  );

});
