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

test("try-catch statement", function () {
  testParse("try{}catch(a){}", stmt,
    {
      type: "TryCatchStatement",
      body: { type: "Block", statements: [] },
      catchClause: {
        type: "CatchClause",
        binding: { type: "BindingIdentifier", name: "a" },
        body: { type: "Block", statements: [] }
      }
    }
  );
  testParse("try { } catch (e) { }", stmt,
    {
      type: "TryCatchStatement",
      body: { type: "Block", statements: [] },
      catchClause: {
        type: "CatchClause",
        binding: { type: "BindingIdentifier", name: "e" },
        body: { type: "Block", statements: [] }
      }
    }
  );

  testParse("try { } catch (e) { let a; }", stmt,
    {
      type: "TryCatchStatement",
      body: { type: "Block", statements: [] },
      catchClause: {
        type: "CatchClause",
        binding: { type: "BindingIdentifier", name: "e" },
        body: {
          type: "Block",
          statements: [{
            type: "VariableDeclarationStatement",
            declaration: {
              type: "VariableDeclaration",
              kind: "let",
              declarators: [{
                type: "VariableDeclarator",
                binding: { type: "BindingIdentifier", name: "a" },
                init: null
              }]
            }
          }]
        }
      }
    }
  );

  testParse("try { } catch (eval) { }", stmt,
    {
      type: "TryCatchStatement",
      body: { type: "Block", statements: [] },
      catchClause: {
        type: "CatchClause",
        binding: { type: "BindingIdentifier", name: "eval" },
        body: { type: "Block", statements: [] }
      }
    }
  );
  testParse("try { } catch (arguments) { }", stmt,
    {
      type: "TryCatchStatement",
      body: { type: "Block", statements: [] },
      catchClause: {
        type: "CatchClause",
        binding: { type: "BindingIdentifier", name: "arguments" },
        body: { type: "Block", statements: [] }
      }
    }
  );
  testParse("try { } catch (e) { say(e) }", stmt,
    {
      type: "TryCatchStatement",
      body: { type: "Block", statements: [] },
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
      }
    }
  );
  testParse("try { doThat(); } catch (e) { say(e) }", stmt,
    {
      type: "TryCatchStatement",
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
      }
    }
  );

  testParseFailure("try {} catch ((e)) {}", "Unexpected token \"(\"");
});
