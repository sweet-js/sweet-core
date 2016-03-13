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

test("super call", function () {

  testParse("(class extends B { constructor() { super() } });", expr,
    {
      type: "ClassExpression",
      name: null,
      super: { type: "IdentifierExpression", name: "B" },
      elements: [{
        type: "ClassElement",
        isStatic: false,
        method: {
          type: "Method",
          isGenerator: false,
          name: { type: "StaticPropertyName", value: "constructor" },
          params: { type: "FormalParameters", items: [], rest: null },
          body: {
            type: "FunctionBody",
            directives: [],
            statements: [{
              type: "ExpressionStatement",
              expression: { type: "CallExpression", callee: { type: "Super" }, arguments: [] }
            }]
          }
        }
      }]
    }
  );

  testParse("class A extends B { constructor() { super() } }", stmt,
    {
      type: "ClassDeclaration",
      name: { type: "BindingIdentifier", name: "<<hygiene>>" },
      super: { type: "IdentifierExpression", name: "B" },
      elements: [{
        type: "ClassElement",
        isStatic: false,
        method: {
          type: "Method",
          isGenerator: false,
          name: { type: "StaticPropertyName", value: "constructor" },
          params: { type: "FormalParameters", items: [], rest: null },
          body: {
            type: "FunctionBody",
            directives: [],
            statements: [{
              type: "ExpressionStatement",
              expression: { type: "CallExpression", callee: { type: "Super" }, arguments: [] }
            }]
          }
        }
      }]
    }
  );

  testParse("class A extends B { \"constructor\"() { super() } }", stmt,
    {
      type: "ClassDeclaration",
      name: { type: "BindingIdentifier", name: "<<hygiene>>" },
      super: { type: "IdentifierExpression", name: "B" },
      elements: [{
        type: "ClassElement",
        isStatic: false,
        method: {
          type: "Method",
          isGenerator: false,
          name: { type: "StaticPropertyName", value: "constructor" },
          params: { type: "FormalParameters", items: [], rest: null },
          body: {
            type: "FunctionBody",
            directives: [],
            statements: [{
              type: "ExpressionStatement",
              expression: { type: "CallExpression", callee: { type: "Super" }, arguments: [] }
            }]
          }
        }
      }]
    }
  );

  testParse("class A extends B { constructor(a = super()){} }", stmt,
    {
      type: "ClassDeclaration",
      name: { type: "BindingIdentifier", name: "<<hygiene>>" },
      super: { type: "IdentifierExpression", name: "B" },
      elements: [{
        type: "ClassElement",
        isStatic: false,
        method: {
          type: "Method",
          isGenerator: false,
          name: { type: "StaticPropertyName", value: "constructor" },
          params: {
            type: "FormalParameters",
            items: [{
              type: "BindingWithDefault",
              binding: { type: "BindingIdentifier", name: "<<hygiene>>"},
              init: { type: "CallExpression", callee: { type: "Super" }, arguments: [] }
            }],
            rest: null
          },
          body: {
            type: "FunctionBody",
            directives: [],
            statements: []
          }
        }
      }]
    }
  );


  testParse("class A extends B { constructor() { ({a: super()}); } }", stmt,
    {
      type: "ClassDeclaration",
      name: { type: "BindingIdentifier", name: "<<hygiene>>" },
      super: { type: "IdentifierExpression", name: "B" },
      elements: [{
        type: "ClassElement",
        isStatic: false,
        method: {
          type: "Method",
          isGenerator: false,
          name: { type: "StaticPropertyName", value: "constructor" },
          params: { type: "FormalParameters", items: [], rest: null },
          body: {
            type: "FunctionBody",
            directives: [],
            statements: [{
              type: "ExpressionStatement",
              expression: {
                type: "ObjectExpression",
                properties: [{
                  type: "DataProperty",
                  name: { type: "StaticPropertyName", value: "a" },
                  expression: { type: "CallExpression", callee: { type: "Super" }, arguments: [] }
                }]
              }
            }]
          }
        }
      }]
    }
  );

  testParse("class A extends B { constructor() { () => super(); } }", stmt,
    {
      type: "ClassDeclaration",
      name: { type: "BindingIdentifier", name: "<<hygiene>>" },
      super: { type: "IdentifierExpression", name: "B" },
      elements: [{
        type: "ClassElement",
        isStatic: false,
        method: {
          type: "Method",
          isGenerator: false,
          name: { type: "StaticPropertyName", value: "constructor" },
          params: { type: "FormalParameters", items: [], rest: null },
          body: {
            type: "FunctionBody",
            directives: [],
            statements: [{
              type: "ExpressionStatement",
              expression: {
                type: "ArrowExpression",
                params: { type: "FormalParameters", items: [], rest: null },
                body: { type: "CallExpression", callee: { type: "Super" }, arguments: [] }
              }
            }]
          }
        }
      }]
    }
  );

  testParse("class A extends B { constructor() { () => { super(); } } }", stmt,
    {
      type: "ClassDeclaration",
      name: { type: "BindingIdentifier", name: "<<hygiene>>" },
      super: { type: "IdentifierExpression", name: "B" },
      elements: [{
        type: "ClassElement",
        isStatic: false,
        method: {
          type: "Method",
          isGenerator: false,
          name: { type: "StaticPropertyName", value: "constructor" },
          params: { type: "FormalParameters", items: [], rest: null },
          body: {
            type: "FunctionBody",
            directives: [],
            statements: [{
              type: "ExpressionStatement",
              expression: {
                type: "ArrowExpression",
                params: { type: "FormalParameters", items: [], rest: null },
                body: {
                  type: "FunctionBody",
                  directives: [],
                  statements: [{
                    type: "ExpressionStatement",
                    expression: { type: "CallExpression", callee: { type: "Super" }, arguments: [] }
                  }]
                }
              }
            }]
          }
        }
      }]
    }
  );

  // testParseFailure("function f() { (super)() }", "Unexpected token \"super\"");
  // testParseFailure("class A extends B { constructor() { super; } }", "Unexpected token \"super\"");
  // testParseFailure("class A extends B { constructor() { (super)(); } }", "Unexpected token \"super\"");
  // testParseFailure("class A extends B { constructor() { new super(); } }", "Unexpected token \"super\"");

});

test("super member access", function () {

  testParse("({ a() { super.b(); } });", expr,
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
            type: "ExpressionStatement",
            expression: {
              type: "CallExpression",
              callee: { type: "StaticMemberExpression", object: { type: "Super" }, property: "b" },
              arguments: []
            }
          }]
        }
      }]
    }
  );

  testParse("({ *a() { super.b = 0; } });", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "Method",
        isGenerator: true,
        name: { type: "StaticPropertyName", value: "a" },
        params: { type: "FormalParameters", items: [], rest: null },
        body: {
          type: "FunctionBody",
          directives: [],
          statements: [{
            type: "ExpressionStatement",
            expression: {
              type: "AssignmentExpression",
              binding: { type: "StaticMemberExpression", object: { type: "Super" }, property: "b" },
              expression: { type: "LiteralNumericExpression", value: 0 }
            }
          }]
        }
      }]
    }
  );

  testParse("({ get a() { super[0] = 1; } });", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "Getter",
        name: { type: "StaticPropertyName", value: "a" },
        body: {
          type: "FunctionBody",
          directives: [],
          statements: [{
            type: "ExpressionStatement",
            expression: {
              type: "AssignmentExpression",
              binding: {
                type: "ComputedMemberExpression",
                object: { type: "Super" },
                expression: { type: "LiteralNumericExpression", value: 0 }
              },
              expression: { type: "LiteralNumericExpression", value: 1 }
            }
          }]
        }
      }]
    }
  );

  testParse("({ set a(x) { super.b[0] = 1; } });", expr,
    {
      type: "ObjectExpression",
      properties: [{
        type: "Setter",
        name: { type: "StaticPropertyName", value: "a" },
        param: { type: "BindingIdentifier", name: "<<hygiene>>" },
        body: {
          type: "FunctionBody",
          directives: [],
          statements: [{
            type: "ExpressionStatement",
            expression: {
              type: "AssignmentExpression",
              binding: {
                type: "ComputedMemberExpression",
                object: { type: "StaticMemberExpression", object: { type: "Super" }, property: "b" },
                expression: { type: "LiteralNumericExpression", value: 0 }
              },
              expression: { type: "LiteralNumericExpression", value: 1 }
            }
          }]
        }
      }]
    }
  );

  testParse("(class { constructor() { super.x } });", expr,
    {
      type: "ClassExpression",
      name: null,
      super: null,
      elements: [{
        type: "ClassElement",
        isStatic: false,
        method: {
          type: "Method",
          isGenerator: false,
          name: { type: "StaticPropertyName", value: "constructor" },
          params: { type: "FormalParameters", items: [], rest: null },
          body: {
            type: "FunctionBody",
            directives: [],
            statements: [{
              type: "ExpressionStatement",
              expression: { type: "StaticMemberExpression", object: { type: "Super" }, property: "x" }
            }]
          }
        }
      }]
    }
  );

  testParse("class A extends B { constructor() { super.x } }", stmt,
    {
      type: "ClassDeclaration",
      name: { type: "BindingIdentifier", name: "<<hygiene>>" },
      super: { type: "IdentifierExpression", name: "B" },
      elements: [{
        type: "ClassElement",
        isStatic: false,
        method: {
          type: "Method",
          isGenerator: false,
          name: { type: "StaticPropertyName", value: "constructor" },
          params: { type: "FormalParameters", items: [], rest: null },
          body: {
            type: "FunctionBody",
            directives: [],
            statements: [{
              type: "ExpressionStatement",
              expression: { type: "StaticMemberExpression", object: { type: "Super" }, property: "x" }
            }]
          }
        }
      }]
    }
  );

  testParse("class A { a() { () => super.b; } }", stmt,
    {
      type: "ClassDeclaration",
      name: { type: "BindingIdentifier", name: "<<hygiene>>" },
      super: null,
      elements: [{
        type: "ClassElement",
        isStatic: false,
        method: {
          type: "Method",
          isGenerator: false,
          name: { type: "StaticPropertyName", value: "a" },
          params: { type: "FormalParameters", items: [], rest: null },
          body: {
            type: "FunctionBody",
            directives: [],
            statements: [{
              type: "ExpressionStatement",
              expression: {
                type: "ArrowExpression",
                params: { type: "FormalParameters", items: [], rest: null },
                body: { type: "StaticMemberExpression", object: { type: "Super" }, property: "b" }
              }
            }]
          }
        }
      }]
    }
  );

  testParse("class A { a() { new super.b; } }", stmt,
    {
      type: "ClassDeclaration",
      name: { type: "BindingIdentifier", name: "<<hygiene>>" },
      super: null,
      elements: [{
        type: "ClassElement",
        isStatic: false,
        method: {
          type: "Method",
          isGenerator: false,
          name: { type: "StaticPropertyName", value: "a" },
          params: { type: "FormalParameters", items: [], rest: null },
          body: {
            type: "FunctionBody",
            directives: [],
            statements: [{
              type: "ExpressionStatement",
              expression: {
                type: "NewExpression",
                callee: { type: "StaticMemberExpression", object: { type: "Super" }, property: "b" },
                arguments: []
              }
            }]
          }
        }
      }]
    }
  );

  // testParse("class A { a() { new super.b(); } }", stmt,
  //   {
  //     type: "ClassDeclaration",
  //     name: { type: "BindingIdentifier", name: "<<hygiene>>" },
  //     super: null,
  //     elements: [{
  //       type: "ClassElement",
  //       isStatic: false,
  //       method: {
  //         type: "Method",
  //         isGenerator: false,
  //         name: { type: "StaticPropertyName", value: "a" },
  //         params: { type: "FormalParameters", items: [], rest: null },
  //         body: {
  //           type: "FunctionBody",
  //           directives: [],
  //           statements: [{
  //             type: "ExpressionStatement",
  //             expression: {
  //               type: "NewExpression",
  //               callee: { type: "StaticMemberExpression", object: { type: "Super" }, property: "b" },
  //               arguments: []
  //             }
  //           }]
  //         }
  //       }
  //     }]
  //   }
  // );

  // testParse("({ *f() { yield super.f(); } })", expr,
  //   {
  //     type: "ObjectExpression",
  //     properties: [{
  //       type: "Method",
  //       isGenerator: true,
  //       name: { type: "StaticPropertyName", value: "f" },
  //       params: { type: "FormalParameters", items: [], rest: null },
  //       body: {
  //         type: "FunctionBody",
  //         directives: [],
  //         statements: [{
  //           type: "ExpressionStatement",
  //           expression: {
  //             type: "YieldExpression",
  //             expression: {
  //               type: "CallExpression",
  //               callee: { type: "StaticMemberExpression", object: { type: "Super" }, property: "f" },
  //               arguments: [],
  //             }
  //           }
  //         }]
  //       }
  //     }],
  //   });

//   testParseFailure("({ a() { (super).b(); } });", "Unexpected token \"super\"");
//   testParseFailure("class A extends B { constructor() { (super).a(); } }", "Unexpected token \"super\"");
//
});
