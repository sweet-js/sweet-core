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

test("function expression", function () {

  testParse("(function(){})", expr,
    { type: "FunctionExpression",
      isGenerator: false,
      name: null,
      params: { type: "FormalParameters", items: [], rest: null },
      body: { type: "FunctionBody", directives: [], statements: [] }
    }
  );

  testParse("(function x() { y; z() });", expr,
    { type: "FunctionExpression",
      isGenerator: false,
      name: { type: "BindingIdentifier", name: "<<hygiene>>" },
      params: { type: "FormalParameters", items: [], rest: null },
      body: {
        type: "FunctionBody",
        directives: [],
        statements: [{
          type: "ExpressionStatement",
          expression: { type: "IdentifierExpression", name: "y" }
        }, {
          type: "ExpressionStatement",
          expression: { type: "CallExpression", callee: { type: "IdentifierExpression", name: "z" }, arguments: [] }
        }]
      }
    }
  );

  testParse("(function eval() { });", expr,
    { type: "FunctionExpression",
      isGenerator: false,
      name: { type: "BindingIdentifier", name: "<<hygiene>>" },
      params: { type: "FormalParameters", items: [], rest: null },
      body: { type: "FunctionBody", directives: [], statements: [] }
    }
  );

  testParse("(function arguments() { });", expr,
    { type: "FunctionExpression",
      isGenerator: false,
      name: { type: "BindingIdentifier", name: "<<hygiene>>" },
      params: { type: "FormalParameters", items: [], rest: null },
      body: { type: "FunctionBody", directives: [], statements: [] }
    }
  );

  testParse("(function x(y, z) { })", expr,
    { type: "FunctionExpression",
      isGenerator: false,
      name: { type: "BindingIdentifier", name: "<<hygiene>>" },
      params:
        { type: "FormalParameters",
          items:
            [
              { type: "BindingIdentifier", name: "<<hygiene>>" },
              { type: "BindingIdentifier", name: "<<hygiene>>" }
            ],
          rest: null
        },
      body: { type: "FunctionBody", directives: [], statements: [] }
    }
  );

   testParse("(function(a = b){})", expr,
     { type: "FunctionExpression",
       isGenerator: false,
       name: null,
       params:
         { type: "FormalParameters",
           items:
             [
               {
                 type: "BindingWithDefault",
                 binding: { type: "BindingIdentifier", name: "<<hygiene>>" },
                 init: { type: "IdentifierExpression", name: "b" }
               }
             ],
           rest: null,
         },
       body: { type: "FunctionBody", directives: [], statements: [] }
     }
   );

  testParse("(function(...a){})", expr,
    { type: "FunctionExpression",
      isGenerator: false,
      name: null,
      params:
        { type: "FormalParameters",
          items: [],
          rest: { type: "BindingIdentifier", name: "<<hygiene>>" }
        },
      body: { type: "FunctionBody", directives: [], statements: [] }
    }
  );

  testParse("(function(a, ...b){})", expr,
    { type: "FunctionExpression",
      isGenerator: false,
      name: null,
      params:
        { type: "FormalParameters",
          items: [{ type: "BindingIdentifier", name: "<<hygiene>>" }],
          rest: { type: "BindingIdentifier", name: "<<hygiene>>" }
        },
      body: { type: "FunctionBody", directives: [], statements: [] }
    }
  );

  testParse("(function({a}){})", expr,
    { type: "FunctionExpression",
      isGenerator: false,
      name: null,
      params:
        { type: "FormalParameters",
          items:
            [
              {
                type: "ObjectBinding",
                properties: [{
                  type: "BindingPropertyIdentifier",
                  binding: { type: "BindingIdentifier", name: "<<hygiene>>" },
                  init: null
                }]
              }
            ],
          rest: null,
        },
      body: { type: "FunctionBody", directives: [], statements: [] }
    }
  );

  testParse("(function({a: x, a: y}){})", expr,
    { type: "FunctionExpression",
      isGenerator: false,
      name: null,
      params:
        { type: "FormalParameters",
          items:
            [
              {
                type: "ObjectBinding",
                properties: [{
                  type: "BindingPropertyProperty",
                  name: { type: "StaticPropertyName", value: "a" },
                  binding: { type: "BindingIdentifier", name: "<<hygiene>>" }
                }, {
                  type: "BindingPropertyProperty",
                  name: { type: "StaticPropertyName", value: "a" },
                  binding: { type: "BindingIdentifier", name: "<<hygiene>>" }
                }]
              }
            ],
          rest: null
        },
      body: { type: "FunctionBody", directives: [], statements: [] }
    }
  );

  testParse("(function([a]){})", expr,
    { type: "FunctionExpression",
      isGenerator: false,
      name: null,
      params:
        { type: "FormalParameters",
          items:
            [
              { type: "ArrayBinding", elements: [{ type: "BindingIdentifier", name: "<<hygiene>>" }], restElement: null }
            ],
          rest: null
        },
      body: { type: "FunctionBody", directives: [], statements: [] }
    }
  );

  testParse("(function({a = 0}){})", expr,
    { type: "FunctionExpression",
      isGenerator: false,
      name: null,
      params:
        { type: "FormalParameters",
          items:
            [
              {
                type: "ObjectBinding",
                properties: [{
                  type: "BindingPropertyIdentifier",
                  binding: { type: "BindingIdentifier", name: "<<hygiene>>" },
                  init: { type: "LiteralNumericExpression", value: 0 }
                }]
              }
            ],
          rest: null
        },
      body: { type: "FunctionBody", directives: [], statements: [] }
    }
  );

  testParse("label: !function(){ label:; };", stmt,
    {
      type: "LabeledStatement",
      label: "label",
      body: {
        type: "ExpressionStatement",
        expression: {
          type: "UnaryExpression",
          operator: "!",
          operand: {
            type: "FunctionExpression",
            isGenerator: false,
            name: null,
            params: { type: "FormalParameters", items: [], rest: null },
            body: {
              type: "FunctionBody",
              directives: [],
              statements: [{ type: "LabeledStatement", label: "label", body: { type: "EmptyStatement" } }]
            }
          }
        }
      }
    }
  );

  testParse("(function([]){})", expr,
    {
      type: "FunctionExpression",
      isGenerator: false,
      name: null,
      params: {
        type: "FormalParameters",
        items: [{ type: "ArrayBinding", elements: [], restElement: null }],
        rest: null
      },
      body: { type: "FunctionBody", directives: [], statements: [] }
    });

  testParse("function* g(){ (function yield(){}); }", stmt,
    {
      type: "FunctionDeclaration",
      isGenerator: true,
      name: { type: "BindingIdentifier", name: "<<hygiene>>" },
      params: { type: "FormalParameters", items: [], rest: null },
      body: {
        type: "FunctionBody",
        directives: [],
        statements: [{
          type: "ExpressionStatement",
          expression: {
            type: "FunctionExpression",
            isGenerator: false,
            name: { type: "BindingIdentifier", name: "<<hygiene>>" },
            params: { type: "FormalParameters", items: [], rest: null },
            body: { type: "FunctionBody", directives: [], statements: [] },
          }
        }]
      }
    }
  );

  testParse("(function*(){ (function yield(){}); })", expr,
    {
      type: "FunctionExpression",
      isGenerator: true,
      name: null,
      params: { type: "FormalParameters", items: [], rest: null },
      body: {
        type: "FunctionBody",
        directives: [],
        statements: [{
          type: "ExpressionStatement",
          expression: {
            type: "FunctionExpression",
            isGenerator: false,
            name: { type: "BindingIdentifier", name: "<<hygiene>>" },
            params: { type: "FormalParameters", items: [], rest: null },
            body: { type: "FunctionBody", directives: [], statements: [] },
          }
        }]
      }
    }
  );

  testParseFailure("(function(...a, b){})", "Unexpected token \",\"");
  testParseFailure("(function((a)){})", "Unexpected token \"(\"");
});
