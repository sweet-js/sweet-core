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

test("variable declaration statement", function () {
  // Variable Statement
  testParse("var x", stmt,
    {
      type: "VariableDeclarationStatement",
      declaration: {
        type: "VariableDeclaration",
        kind: "var",
        declarators: [{ type: "VariableDeclarator", binding: { type: "BindingIdentifier", name: "<<hygiene>>" }, init: null }]
      }
    }
  );
  testParse("var a;", stmt,
    {
      type: "VariableDeclarationStatement",
      declaration: {
        type: "VariableDeclaration",
        kind: "var",
        declarators: [{ type: "VariableDeclarator", binding: { type: "BindingIdentifier", name: "<<hygiene>>" }, init: null }]
      }
    }
  );
  testParse("var x, y;", stmt,
    {
      type: "VariableDeclarationStatement",
      declaration: {
        type: "VariableDeclaration",
        kind: "var",
        declarators: [{
          type: "VariableDeclarator",
          binding: { type: "BindingIdentifier", name: "<<hygiene>>" },
          init: null
        }, { type: "VariableDeclarator", binding: { type: "BindingIdentifier", name: "<<hygiene>>" }, init: null }]
      }
    }
  );
  testParse("var x = 0", stmt,
    {
      type: "VariableDeclarationStatement",
      declaration: {
        type: "VariableDeclaration",
        kind: "var",
        declarators: [{
          type: "VariableDeclarator",
          binding: { type: "BindingIdentifier", name: "<<hygiene>>" },
          init: { type: "LiteralNumericExpression", value: 0 }
        }]
      }
    }
  );
  testParse("var eval = 0, arguments = 1", stmt,
    {
      type: "VariableDeclarationStatement",
      declaration: {
        type: "VariableDeclaration",
        kind: "var",
        declarators: [{
          type: "VariableDeclarator",
          binding: { type: "BindingIdentifier", name: "<<hygiene>>" },
          init: { type: "LiteralNumericExpression", value: 0 }
        }, {
          type: "VariableDeclarator",
          binding: { type: "BindingIdentifier", name: "<<hygiene>>" },
          init: { type: "LiteralNumericExpression", value: 1 }
        }]
      }
    }
  );
  testParse("var x = 0, y = 1, z = 2", stmt,
    {
      type: "VariableDeclarationStatement",
      declaration: {
        type: "VariableDeclaration",
        kind: "var",
        declarators: [{
          type: "VariableDeclarator",
          binding: { type: "BindingIdentifier", name: "<<hygiene>>" },
          init: { type: "LiteralNumericExpression", value: 0 }
        }, {
          type: "VariableDeclarator",
          binding: { type: "BindingIdentifier", name: "<<hygiene>>" },
          init: { type: "LiteralNumericExpression", value: 1 }
        }, {
          type: "VariableDeclarator",
          binding: { type: "BindingIdentifier", name: "<<hygiene>>" },
          init: { type: "LiteralNumericExpression", value: 2 }
        }]
      }
    }
  );
  testParse("var implements, interface, package", stmt,
    {
      type: "VariableDeclarationStatement",
      declaration: {
        type: "VariableDeclaration",
        kind: "var",
        declarators: [{
          type: "VariableDeclarator",
          binding: { type: "BindingIdentifier", name: "<<hygiene>>" },
          init: null
        }, {
          type: "VariableDeclarator",
          binding: { type: "BindingIdentifier", name: "<<hygiene>>" },
          init: null
        }, { type: "VariableDeclarator", binding: { type: "BindingIdentifier", name: "<<hygiene>>" }, init: null }]
      }
    }
  );
  testParse("var private, protected, public", stmt,
    {
      type: "VariableDeclarationStatement",
      declaration: {
        type: "VariableDeclaration",
        kind: "var",
        declarators: [{
          type: "VariableDeclarator",
          binding: { type: "BindingIdentifier", name: "<<hygiene>>" },
          init: null
        }, {
          type: "VariableDeclarator",
          binding: { type: "BindingIdentifier", name: "<<hygiene>>" },
          init: null
        }, { type: "VariableDeclarator", binding: { type: "BindingIdentifier", name: "<<hygiene>>" }, init: null }]
      }
    }
  );
  testParse("var yield;", stmt,
    {
      type: "VariableDeclarationStatement",
      declaration: {
        type: "VariableDeclaration",
        kind: "var",
        declarators: [{
          type: "VariableDeclarator",
          binding: { type: "BindingIdentifier", name: "<<hygiene>>" },
          init: null
        }]
      }
    }
  );

  testParse("var let", stmt,
    {
      type: "VariableDeclarationStatement",
      declaration: {
        type: "VariableDeclaration",
        kind: "var",
        declarators: [{ type: "VariableDeclarator", binding: { type: "BindingIdentifier", name: "<<hygiene>>" }, init: null }]
      }
    }
  );

  // Let Statement
  testParse("let x", stmt,
    {
      type: "VariableDeclarationStatement",
      declaration: {
        type: "VariableDeclaration",
        kind: "let",
        declarators: [{ type: "VariableDeclarator", binding: { type: "BindingIdentifier", name: "<<hygiene>>" }, init: null }]
      }
    }
  );
  testParse("{ let x }", stmt,
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
    }
  );
  testParse("{ let x = 0 }", stmt,
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
              init: { type: "LiteralNumericExpression", value: 0 }
            }]
          }
        }]
      }
    }
  );
  testParse("{ let x = 0, y = 1, z = 2 }", stmt,
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
              init: { type: "LiteralNumericExpression", value: 0 }
            }, {
              type: "VariableDeclarator",
              binding: { type: "BindingIdentifier", name: "<<hygiene>>" },
              init: { type: "LiteralNumericExpression", value: 1 }
            }, {
              type: "VariableDeclarator",
              binding: { type: "BindingIdentifier", name: "<<hygiene>>" },
              init: { type: "LiteralNumericExpression", value: 2 }
            }]
          }
        }]
      }
    }
  );

  // exotic unicode characters
  testParse("let x, x\\u{E01D5}", stmt,
    {
      type: "VariableDeclarationStatement",
      declaration: {
        type: "VariableDeclaration",
        kind: "let",
        declarators: [{
          type: "VariableDeclarator",
          binding: { type: "BindingIdentifier", name: "<<hygiene>>" },
          init: null
        }, { type: "VariableDeclarator", binding: { type: "BindingIdentifier", name: "<<hygiene>>" }, init: null }]
      }
    }
  );
  testParse("let x, x\uDB40\uDDD5;", stmt,
    {
      type: "VariableDeclarationStatement",
      declaration: {
        type: "VariableDeclaration",
        kind: "let",
        declarators: [{
          type: "VariableDeclarator",
          binding: { type: "BindingIdentifier", name: "<<hygiene>>" },
          init: null
        }, { type: "VariableDeclarator", binding: { type: "BindingIdentifier", name: "<<hygiene>>" }, init: null }]
      }
    }
  );
  testParse("let xǕ, x\\u{E01D5}", stmt,
    {
      type: "VariableDeclarationStatement",
      declaration: {
        type: "VariableDeclaration",
        kind: "let",
        declarators: [{
          type: "VariableDeclarator",
          binding: { type: "BindingIdentifier", name: "<<hygiene>>" },
          init: null
        }, { type: "VariableDeclarator", binding: { type: "BindingIdentifier", name: "<<hygiene>>" }, init: null }]
      }
    }
  );
  testParse("let x\u01D5, x\\u{E01D5}", stmt,
    {
      type: "VariableDeclarationStatement",
      declaration: {
        type: "VariableDeclaration",
        kind: "let",
        declarators: [{
          type: "VariableDeclarator",
          binding: { type: "BindingIdentifier", name: "<<hygiene>>" },
          init: null
        }, { type: "VariableDeclarator", binding: { type: "BindingIdentifier", name: "<<hygiene>>" }, init: null }]
      }
    }
  );

  // Const Statement
  testParse("{ const x = 0 }", stmt,
    {
      type: "BlockStatement",
      block: {
        type: "Block",
        statements: [{
          type: "VariableDeclarationStatement",
          declaration: {
            type: "VariableDeclaration",
            kind: "const",
            declarators: [{
              type: "VariableDeclarator",
              binding: { type: "BindingIdentifier", name: "<<hygiene>>" },
              init: { type: "LiteralNumericExpression", value: 0 }
            }]
          }
        }]
      }
    }
  );
  testParse("{ const x = 0, y = 1, z = 2 }", stmt,
    {
      type: "BlockStatement",
      block: {
        type: "Block",
        statements: [{
          type: "VariableDeclarationStatement",
          declaration: {
            type: "VariableDeclaration",
            kind: "const",
            declarators: [{
              type: "VariableDeclarator",
              binding: { type: "BindingIdentifier", name: "<<hygiene>>" },
              init: { type: "LiteralNumericExpression", value: 0 }
            }, {
              type: "VariableDeclarator",
              binding: { type: "BindingIdentifier", name: "<<hygiene>>" },
              init: { type: "LiteralNumericExpression", value: 1 }
            }, {
              type: "VariableDeclarator",
              binding: { type: "BindingIdentifier", name: "<<hygiene>>" },
              init: { type: "LiteralNumericExpression", value: 2 }
            }]
          }
        }]
      }
    }
  );
  testParse("var static;", stmt,
    {
      type: "VariableDeclarationStatement",
      declaration: {
        type: "VariableDeclaration",
        kind: "var",
        declarators: [{
          type: "VariableDeclarator",
          binding: { type: "BindingIdentifier", name: "<<hygiene>>" },
          init: null
        }]
      }
    }
  );

  // testParse("(let[a])", expr,
  //   {
  //     type: "ComputedMemberExpression",
  //     object: { type: "IdentifierExpression", name: "let" },
  //     expression: { type: "IdentifierExpression", name: "a" }
  //   }
  // );

  testParseFailure("var const", "Unexpected token \"const\"");
  testParseFailure("var a[0]=0;", "Unexpected token \"[\"");
  testParseFailure("var (a)=0;", "Unexpected token \"(\"");
  testParseFailure("var new A = 0;", "Unexpected token \"new\"");
  testParseFailure("var (x)", "Unexpected token \"(\"");
  testParseFailure("var this", "Unexpected token \"this\"");
  testParseFailure("var a.b;", "Unexpected token \".\"");
  testParseFailure("var [a];", "Unexpected token \";\"");
  testParseFailure("var {a};", "Unexpected token \";\"");
  testParseFailure("var {a:a};", "Unexpected token \";\"");
});
