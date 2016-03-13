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

function id(x) {
  return x;
}

test("generator declaration", function () {

  testParse("function* a(){}", stmt,
    { type: "FunctionDeclaration",
      isGenerator: true,
      name: { type: "BindingIdentifier", name: "<<hygiene>>" },
      params: { type: "FormalParameters", items: [], rest: null },
      body: { type: "FunctionBody", directives: [], statements: [] }
    }
  );

  testParse("function* a(){yield}", stmt,
    { type: "FunctionDeclaration",
      isGenerator: true,
      name: { type: "BindingIdentifier", name: "<<hygiene>>" },
      params: { type: "FormalParameters", items: [], rest: null },
      body: {
        type: "FunctionBody",
        directives: [],
        statements: [{ type: "ExpressionStatement", expression: { type: "YieldExpression", expression: null } }]
      }
    }
  );

  testParse("function* a(){yield a}", stmt,
    { type: "FunctionDeclaration",
      isGenerator: true,
      name: { type: "BindingIdentifier", name: "<<hygiene>>" },
      params: { type: "FormalParameters", items: [], rest: null },
      body: {
        type: "FunctionBody",
        directives: [],
        statements: [{
          type: "ExpressionStatement",
          expression: { type: "YieldExpression", expression: { type: "IdentifierExpression", name: "<<hygiene>>" } }
        }]
      }
    }
  );

  testParse("function* yield(){}", stmt,
    { type: "FunctionDeclaration",
      isGenerator: true,
      name: { type: "BindingIdentifier", name: "<<hygiene>>" },
      params: { type: "FormalParameters", items: [], rest: null },
      body: { type: "FunctionBody", directives: [], statements: [] }
    }
  );

  // testParse("function* a(){({[yield]:a}=0)}", function (p) {
  //     return stmt(p).body.statements[0].expression;
  //   },
  //   {
  //     type: "AssignmentExpression",
  //     binding: {
  //       type: "ObjectBinding",
  //       properties: [{
  //         type: "BindingPropertyProperty",
  //         name: { type: "ComputedPropertyName", expression: { type: "YieldExpression", expression: null } },
  //         binding: { type: "BindingIdentifier", name: "a" }
  //       }]
  //     },
  //     expression: { type: "LiteralNumericExpression", value: 0 }
  //   });

  testParse("function* a() {} function a() {}", id,
    {
      type: "Module",
      directives: [],
      items: [{
        type: "FunctionDeclaration",
        isGenerator: true,
        name: { type: "BindingIdentifier", name: "<<hygiene>>" },
        params: { type: "FormalParameters", items: [], rest: null },
        body: { type: "FunctionBody", directives: [], statements: [] }
      }, {
        type: "FunctionDeclaration",
        isGenerator: false,
        name: { type: "BindingIdentifier", name: "<<hygiene>>" },
        params: { type: "FormalParameters", items: [], rest: null },
        body: { type: "FunctionBody", directives: [], statements: [] }
      }]
    }
  );

  testParse("function a() { function* a() {} function a() {} }", stmt,
    { type: "FunctionDeclaration",
      isGenerator: false,
      name: { type: "BindingIdentifier", name: "<<hygiene>>" },
      params: { type: "FormalParameters", items: [], rest: null },
      body: {
        type: "FunctionBody",
        directives: [],
        statements: [{
          type: "FunctionDeclaration",
          isGenerator: true,
          name: { type: "BindingIdentifier", name: "<<hygiene>>" },
          params: { type: "FormalParameters", items: [], rest: null },
          body: { type: "FunctionBody", directives: [], statements: [] }
        }, {
          type: "FunctionDeclaration",
          isGenerator: false,
          name: { type: "BindingIdentifier", name: "<<hygiene>>" },
          params: { type: "FormalParameters", items: [], rest: null },
          body: { type: "FunctionBody", directives: [], statements: [] }
        }]
      }
    }
  );

  testParseFailure("label: function* a(){}", "Unexpected token \"*\"");
  testParseFailure("function*g(yield){}", "Unexpected token \"yield\"");
  testParseFailure("function*g(){ var yield; }", "Unexpected token \"yield\"");
  testParseFailure("function*g(){ var yield = 1; }", "Unexpected token \"yield\"");
  testParseFailure("function*g(){ function yield(){}; }", "Unexpected token \"yield\"");

  testParseFailure("function*g() { var yield; }", "Unexpected token \"yield\"");
  testParseFailure("function*g() { let yield; }", "Unexpected token \"yield\"");
  testParseFailure("function*g() { try {} catch (yield) {} }", "Unexpected token \"yield\"");

});
