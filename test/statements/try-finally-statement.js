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

test("try-finally statement", function () {
  testParse("try { } finally { cleanup(stuff) }", stmt,
    {
      type: "TryFinallyStatement",
      body: { type: "Block", statements: [] },
      catchClause: null,
      finalizer: {
        type: "Block",
        statements: [{
          type: "ExpressionStatement",
          expression: {
            type: "CallExpression",
            callee: { type: "IdentifierExpression", name: "cleanup" },
            arguments: [{ type: "IdentifierExpression", name: "stuff" }]
          }
        }]
      }
    }
  );
  testParse("try{}catch(a){}finally{}", stmt,
    {
      type: "TryFinallyStatement",
      body: { type: "Block", statements: [] },
      catchClause: {
        type: "CatchClause",
        binding: { type: "BindingIdentifier", name: "a" },
        body: { type: "Block", statements: [] }
      },
      finalizer: { type: "Block", statements: [] }
    }
  );
  testParse("try { doThat(); } catch (e) { say(e) } finally { cleanup(stuff) }", stmt,
    {
      type: "TryFinallyStatement",
      body: {
        type: "Block",
        statements: [{
          type: "ExpressionStatement",
          expression: {
            type: "CallExpression",
            callee: { type: "IdentifierExpression", name: "doThat" },
            arguments: []
          }
        }]
      },
      catchClause: {
        type: "CatchClause",
        binding: { type: "BindingIdentifier", name: "e" },
        body: {
          type: "Block",
          statements: [{
            type: "ExpressionStatement",
            expression: {
              type: "CallExpression",
              callee: { type: "IdentifierExpression", name: "say" },
              arguments: [{ type: "IdentifierExpression", name: "e" }]
            }
          }]
        }
      },
      finalizer: {
        type: "Block",
        statements: [{
          type: "ExpressionStatement",
          expression: {
            type: "CallExpression",
            callee: { type: "IdentifierExpression", name: "cleanup" },
            arguments: [{ type: "IdentifierExpression", name: "stuff" }]
          }
        }]
      }
    }
  );
});
