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

test("new.target expression", function () {

  testParse("function f() { new.target; }", stmt,
    { type: "FunctionDeclaration",
      isGenerator: false,
      name: { type: "BindingIdentifier", name: "<<hygiene>>" },
      params: { type: "FormalParameters", items: [], rest: null },
      body: {
        type: "FunctionBody",
        directives: [],
        statements: [{ type: "ExpressionStatement", expression: { type: "NewTargetExpression" } }]
      }
    }
  );

  testParse("function f(a = new.target){}", stmt,
    { type: "FunctionDeclaration",
      isGenerator: false,
      name: { type: "BindingIdentifier", name: "<<hygiene>>" },
      params: {
        type: "FormalParameters",
        items: [{
          type: "BindingWithDefault",
          binding: { type: "BindingIdentifier", name: "<<hygiene>>" },
          init: { type: "NewTargetExpression" }
        }],
        rest: null
      },
      body: { type: "FunctionBody", directives: [], statements: [] }
    }
  );

  testParse("(function f(a = new.target){})", expr,
    { type: "FunctionExpression",
      isGenerator: false,
      name: { type: "BindingIdentifier", name: "<<hygiene>>" },
      params: {
        type: "FormalParameters",
        items: [{
          type: "BindingWithDefault",
          binding: { type: "BindingIdentifier", name: "<<hygiene>>" },
          init: { type: "NewTargetExpression" }
        }],
        rest: null
      },
      body: { type: "FunctionBody", directives: [], statements: [] }
    }
  );

  testParse("({ set m(a = new.target){} })", expr,
    { type: "ObjectExpression",
      properties: [{
        type: "Setter",
        name: { type: "StaticPropertyName", value: "m" },
        param: {
          type: "BindingWithDefault",
          binding: { type: "BindingIdentifier", name: "<<hygiene>>" },
          init: { type: "NewTargetExpression" }
        },
        body: { type: "FunctionBody", directives: [], statements: [] }
      }]
    }
  );

  testParse("({ m(a = new.target){} })", expr,
    { type: "ObjectExpression",
      properties: [{
        type: "Method",
        isGenerator: false,
        name: { type: "StaticPropertyName", value: "m" },
        params: {
          type: "FormalParameters",
          items: [{
            type: "BindingWithDefault",
            binding: { type: "BindingIdentifier", name: "<<hygiene>>" },
            init: { type: "NewTargetExpression" }
          }],
          rest: null
        },
        body: { type: "FunctionBody", directives: [], statements: [] }
      }]
    }
  );

  testParse("({ get m(){ new.target } })", expr,
    { type: "ObjectExpression",
      properties: [{
        type: "Getter",
        name: { type: "StaticPropertyName", value: "m" },
        body: { type: "FunctionBody", directives: [], statements: [{
          type: "ExpressionStatement", expression: { type: "NewTargetExpression" }
        }] }
      }]
    }
  );

  // testParse("function f() { new.\\u0074arget; }", stmt,
  //   { type: "FunctionDeclaration",
  //     isGenerator: false,
  //     name: { type: "BindingIdentifier", name: "<<hygiene>>" },
  //     params: { type: "FormalParameters", items: [], rest: null },
  //     body: {
  //       type: "FunctionBody",
  //       directives: [],
  //       statements: [{ type: "ExpressionStatement", expression: { type: "NewTargetExpression" } }]
  //     }
  //   }
  // );

  testParse("function f() { new new.target; }", stmt,
    { type: "FunctionDeclaration",
      isGenerator: false,
      name: { type: "BindingIdentifier", name: "<<hygiene>>" },
      params: { type: "FormalParameters", items: [], rest: null },
      body: {
        type: "FunctionBody",
        directives: [],
        statements: [{
          type: "ExpressionStatement",
          expression: { type: "NewExpression", callee: { type: "NewTargetExpression" }, arguments: [] }
        }]
      }
    }
  );

  testParse("function f() { new.target(); }", stmt,
    { type: "FunctionDeclaration",
      isGenerator: false,
      name: { type: "BindingIdentifier", name: "<<hygiene>>" },
      params: { type: "FormalParameters", items: [], rest: null },
      body: {
        type: "FunctionBody",
        directives: [],
        statements: [{
          type: "ExpressionStatement",
          expression: { type: "CallExpression", callee: { type: "NewTargetExpression" }, arguments: [] }
        }]
      }
    }
  );

  // testParse("function f() { new[\"target\"]; }", stmt,
  //   { type: "FunctionDeclaration",
  //     isGenerator: false,
  //     name: { type: "BindingIdentifier", name: "<<hygiene>>" },
  //     params: { type: "FormalParameters", items: [], rest: null },
  //     body: {
  //       type: "FunctionBody",
  //       directives: [],
  //       statements: [{
  //         type: "ExpressionStatement",
  //         expression: {
  //           type: "NewExpression",
  //           callee: { type: "ArrayExpression", elements: [{ type: "LiteralStringExpression", value: "target" }] },
  //           arguments: []
  //         }
  //       }]
  //     }
  //   }
  // );

  // testParseFailure("function f() { new.anythingElse; }", "Unexpected identifier");
  // testParseFailure("function f() { new..target; }", "Unexpected token \".\"");

});
