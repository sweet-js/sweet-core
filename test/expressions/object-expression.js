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

test("object expression", function () {

  testParse("({})", expr, { type: "ObjectExpression", properties: [] });

  testParse("+{}", expr,
    { type: "UnaryExpression",
      operand: { type: "ObjectExpression", properties: [] },
      operator: "+" }
  );

  testParse("+{ }", expr,
    { type: "UnaryExpression",
      operand: { type: "ObjectExpression", properties: [] },
      operator: "+" }
  );

  testParse("({ answer: 0 })", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "DataProperty",
        name: { type: "StaticPropertyName", value: "answer" },
        expression: { type: "LiteralNumericExpression", value: 0 }
      }]
    }
  );

  testParse("({ if: 0 })", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "DataProperty",
        name: { type: "StaticPropertyName", value: "if" },
        expression: { type: "LiteralNumericExpression", value: 0 }
      }]
    }
  );
  testParse("({ true: 0 })", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "DataProperty",
        name: { type: "StaticPropertyName", value: "true" },
        expression: { type: "LiteralNumericExpression", value: 0 }
      }]
    }
  );
  testParse("({ false: 0 })", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "DataProperty",
        name: { type: "StaticPropertyName", value: "false" },
        expression: { type: "LiteralNumericExpression", value: 0 }
      }]
    }
  );
  testParse("({ null: 0 })", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "DataProperty",
        name: { type: "StaticPropertyName", value: "null" },
        expression: { type: "LiteralNumericExpression", value: 0 }
      }]
    }
  );
  testParse("({ \"answer\": 0 })", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "DataProperty",
        name: { type: "StaticPropertyName", value: "answer" },
        expression: { type: "LiteralNumericExpression", value: 0 }
      }]
    }
  );
  testParse("({ x: 1, x: 2 })", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "DataProperty",
        name: { type: "StaticPropertyName", value: "x" },
        expression: { type: "LiteralNumericExpression", value: 1 }
      }, {
        type: "DataProperty",
        name: { type: "StaticPropertyName", value: "x" },
        expression: { type: "LiteralNumericExpression", value: 2 }
      }]
    }
  );

  testParse("({ get width() { return m_width } })", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "Getter",
        name: { type: "StaticPropertyName", value: "width" },
        body: {
          type: "FunctionBody",
          directives: [],
          statements: [{ type: "ReturnStatement", expression: { type: "IdentifierExpression", name: "m_width" } }]
        }
      }]
    }
  );
  testParse("({ get undef() {} })", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "Getter",
        name: { type: "StaticPropertyName", value: "undef" },
        body: { type: "FunctionBody", directives: [], statements: [] }
      }]
    }
  );
  testParse("({ get if() {} })", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "Getter",
        name: { type: "StaticPropertyName", value: "if" },
        body: { type: "FunctionBody", directives: [], statements: [] }
      }]
    }
  );

  testParse("({ get true() {} })", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "Getter",
        name: { type: "StaticPropertyName", value: "true" },
        body: { type: "FunctionBody", directives: [], statements: [] }
      }]
    }
  );

  testParse("({ get false() {} })", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "Getter",
        name: { type: "StaticPropertyName", value: "false" },
        body: { type: "FunctionBody", directives: [], statements: [] }
      }]
    }
  );

  testParse("({ get null() {} })", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "Getter",
        name: { type: "StaticPropertyName", value: "null" },
        body: { type: "FunctionBody", directives: [], statements: [] }
      }]
    }
  );

  testParse("({ get \"undef\"() {} })", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "Getter",
        name: { type: "StaticPropertyName", value: "undef" },
        body: { type: "FunctionBody", directives: [], statements: [] }
      }]
    }
  );

  testParse("({ get 10() {} })", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "Getter",
        name: { type: "StaticPropertyName", value: "10" },
        body: { type: "FunctionBody", directives: [], statements: [] }
      }]
    }
  );

  testParse("({ set width(w) { w } })", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "Setter",
        name: { type: "StaticPropertyName", value: "width" },
        param: { type: "BindingIdentifier", name: "w" },
        body: {
          type: "FunctionBody",
          directives: [],
          statements: [{ type: "ExpressionStatement", expression: { type: "IdentifierExpression", name: "w" } }]
        }
      }]
    }
  );

  testParse("({ set if(w) { w } })", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "Setter",
        name: { type: "StaticPropertyName", value: "if" },
        param: { type: "BindingIdentifier", name: "w" },
        body: {
          type: "FunctionBody",
          directives: [],
          statements: [{ type: "ExpressionStatement", expression: { type: "IdentifierExpression", name: "w" } }]
        }
      }]
    }
  );

  testParse("({ set true(w) { w } })", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "Setter",
        name: { type: "StaticPropertyName", value: "true" },
        param: { type: "BindingIdentifier", name: "w" },
        body: {
          type: "FunctionBody",
          directives: [],
          statements: [{ type: "ExpressionStatement", expression: { type: "IdentifierExpression", name: "w" } }]
        }
      }]
    }
  );

  testParse("({ set false(w) { w } })", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "Setter",
        name: { type: "StaticPropertyName", value: "false" },
        param: { type: "BindingIdentifier", name: "w" },
        body: {
          type: "FunctionBody",
          directives: [],
          statements: [{ type: "ExpressionStatement", expression: { type: "IdentifierExpression", name: "w" } }]
        }
      }]
    }
  );

  testParse("({ set null(w) { w } })", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "Setter",
        name: { type: "StaticPropertyName", value: "null" },
        param: { type: "BindingIdentifier", name: "w" },
        body: {
          type: "FunctionBody",
          directives: [],
          statements: [{ type: "ExpressionStatement", expression: { type: "IdentifierExpression", name: "w" } }]
        }
      }]
    }
  );

  testParse("({ set \"null\"(w) { w } })", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "Setter",
        name: { type: "StaticPropertyName", value: "null" },
        param: { type: "BindingIdentifier", name: "w" },
        body: {
          type: "FunctionBody",
          directives: [],
          statements: [{ type: "ExpressionStatement", expression: { type: "IdentifierExpression", name: "w" } }]
        }
      }]
    }
  );

  testParse("({ set 10(w) { w } })", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "Setter",
        name: { type: "StaticPropertyName", value: "10" },
        param: { type: "BindingIdentifier", name: "w" },
        body: {
          type: "FunctionBody",
          directives: [],
          statements: [{ type: "ExpressionStatement", expression: { type: "IdentifierExpression", name: "w" } }]
        }
      }]
    }
  );

  testParse("({ get: 2 })", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "DataProperty",
        name: { type: "StaticPropertyName", value: "get" },
        expression: { type: "LiteralNumericExpression", value: 2 }
      }]
    }
  );
  testParse("({ set: 2 })", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "DataProperty",
        name: { type: "StaticPropertyName", value: "set" },
        expression: { type: "LiteralNumericExpression", value: 2 }
      }]
    }
  );
  testParse("({ __proto__: 2 })", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "DataProperty",
        name: { type: "StaticPropertyName", value: "__proto__" },
        expression: { type: "LiteralNumericExpression", value: 2 }
      }]
    }
  );
  testParse("({\"__proto__\": 2 })", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "DataProperty",
        name: { type: "StaticPropertyName", value: "__proto__" },
        expression: { type: "LiteralNumericExpression", value: 2 }
      }]
    }
  );

  testParse("({ get width() { return width }, set width(width) { return width; } })", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "Getter",
        name: { type: "StaticPropertyName", value: "width" },
        body: {
          type: "FunctionBody",
          directives: [],
          statements: [{ type: "ReturnStatement", expression: { type: "IdentifierExpression", name: "width" } }]
        }
      }, {
        type: "Setter",
        name: { type: "StaticPropertyName", value: "width" },
        param: { type: "BindingIdentifier", name: "width" },
        body: {
          type: "FunctionBody",
          directives: [],
          statements: [{ type: "ReturnStatement", expression: { type: "IdentifierExpression", name: "width" } }]
        }
      }]
    }
  );

  testParse("({a:0, get 'b'(){}, set 3(d){}})", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "DataProperty",
        name: { type: "StaticPropertyName", value: "a" },
        expression: { type: "LiteralNumericExpression", value: 0 }
      }, {
        type: "Getter",
        name: { type: "StaticPropertyName", value: "b" },
        body: { type: "FunctionBody", directives: [], statements: [] }
      }, {
        type: "Setter",
        name: { type: "StaticPropertyName", value: "3" },
        param: { type: "BindingIdentifier", name: "d" },
        body: { type: "FunctionBody", directives: [], statements: [] }
      }]
    }
  );

  testParse("({a})", expr,
    { type: "ObjectExpression", properties: [{
      type: "DataProperty",
      name: {
        type: "StaticPropertyName",
        value: "a"
      },
      expression: {
        type: "IdentifierExpression",
        name: "a"
      }
    }] }

  );

  testParse("({let})", expr,
    { type: "ObjectExpression", properties: [{
      type: "DataProperty",
      name: {
        type: "StaticPropertyName",
        value: "let"
      },
      expression: {
        type: "IdentifierExpression",
        name: "let"
      }
   }] }
  );

  testParse("({yield})", expr,
    { type: "ObjectExpression", properties: [{
      type: "DataProperty",
      name: {
        type: "StaticPropertyName",
        value: "yield"
      },
      expression: {
        type: "IdentifierExpression",
        name: "yield"
      }
    }] }
  );

  testParse("({a, b: 0, c})", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "DataProperty",
        name: {
          type: "StaticPropertyName",
          value: "a"
        },
        expression: {
          type: "IdentifierExpression",
          name: "a"
        }
      }, {
        type: "DataProperty",
        name: { type: "StaticPropertyName", value: "b" },
        expression: { type: "LiteralNumericExpression", value: 0 }
      }, {
        type: "DataProperty",
        name: {
          type: "StaticPropertyName",
          value: "c"
        },
        expression: {
          type: "IdentifierExpression",
          name: "c"
        }
      }]
    }
  );

  testParse("({a, b})", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "DataProperty",
        name: {
          type: "StaticPropertyName",
          value: "a"
        },
        expression: {
          type: "IdentifierExpression",
          name: "a"
        }
      }, {
        type: "DataProperty",
        name: {
          type: "StaticPropertyName",
          value: "b"
        },
        expression: {
          type: "IdentifierExpression",
          name: "b"
        }
      }]
    }
  );

  testParse("({a(){}})", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "Method",
        isGenerator: false,
        name: { type: "StaticPropertyName", value: "a" },
        params: { type: "FormalParameters", items: [], rest: null },
        body: { type: "FunctionBody", directives: [], statements: [] }
      }]
    }
  );

  testParse("({a(){let a;}})", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "Method",
        isGenerator: false,
        name: { type: "StaticPropertyName", value: "a" },
        params: { type: "FormalParameters", items: [], rest: null },
        body: {
          type: "FunctionBody",
          directives: [],
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
      }]
    }
  );

  testParse("({a(b){}})", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "Method",
        isGenerator: false,
        name: { type: "StaticPropertyName", value: "a" },
        params: { type: "FormalParameters", items: [{ type: "BindingIdentifier", name: "<<hygiene>>" }], rest: null },
        body: { type: "FunctionBody", directives: [], statements: [] }
      }]
    }
  );

  testParse("({a(b,...c){}})", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "Method",
        isGenerator: false,
        name: { type: "StaticPropertyName", value: "a" },
        params: {
          type: "FormalParameters",
          items: [{ type: "BindingIdentifier", name: "<<hygiene>>" }],
          rest: { type: "BindingIdentifier", name: "<<hygiene>>" }
        },
        body: { type: "FunctionBody", directives: [], statements: [] }
      }]
    }
  );

  testParse("({a(b,c){}})", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "Method",
        isGenerator: false,
        name: { type: "StaticPropertyName", value: "a" },
        params: {
          type: "FormalParameters",
          items: [{ type: "BindingIdentifier", name: "<<hygiene>>" }, { type: "BindingIdentifier", name: "<<hygiene>>" }],
          rest: null
        },
        body: { type: "FunctionBody", directives: [], statements: [] }
      }]
    }
  );

  testParse("({a(b,c){let d;}})", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "Method",
        isGenerator: false,
        name: { type: "StaticPropertyName", value: "a" },
        params: {
          type: "FormalParameters",
          items: [{ type: "BindingIdentifier", name: "<<hygiene>>" }, { type: "BindingIdentifier", name: "<<hygiene>>" }],
          rest: null
        },
        body: {
          type: "FunctionBody",
          directives: [],
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
      }]
    }
  );

  testParse("({set a(eval){}})", expr, {
    type: "ObjectExpression",
    properties: [{
      type: "Setter",
      name: { type: "StaticPropertyName", value: "a" },
      param: { type: "BindingIdentifier", name: "<<hygiene>>" },
      body: { type: "FunctionBody", directives: [], statements: [] }
    }]
  });

  // testParse("({ set a([{b = 0}]){}, })", expr, {
  //   type: "ObjectExpression",
  //   properties: [{
  //     type: "Setter",
  //     name: { type: "StaticPropertyName", value: "a" },
  //     param: {
  //       type: "ArrayBinding",
  //       elements: [{
  //         type: "ObjectBinding",
  //         properties: [{
  //           type: "BindingPropertyIdentifier",
  //           binding: { type: "BindingIdentifier", name: "b" },
  //           init: { type: "LiteralNumericExpression", value: 0 }
  //         }]
  //       }],
  //       restElement: null
  //     },
  //     body: { type: "FunctionBody", directives: [], statements: [] }
  //   }]
  // });
  //
});
