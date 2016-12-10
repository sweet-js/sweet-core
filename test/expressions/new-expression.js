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

test("new expression", function () {

  testParse("new a(b,c)", expr,
    { type: "NewExpression",
      callee: { type: "IdentifierExpression", name: "a" },
      arguments:
        [ { type: "IdentifierExpression", name: "b" },
          { type: "IdentifierExpression", name: "c" } ] }
  );

  testParse("new Button", expr,
    { type: "NewExpression",
      callee: { type: "IdentifierExpression", name: "Button" },
      arguments: [] }
  );

  testParse("new Button()", expr,
    { type: "NewExpression",
      callee: { type: "IdentifierExpression", name: "Button" },
      arguments: [] }
  );

  testParse("new Button(a)", expr,
    { type: "NewExpression",
      callee: { type: "IdentifierExpression", name: "Button" },
      arguments: [ { type: "IdentifierExpression", name: "a" } ] }
  );

  testParse("new new foo", expr,
    { type: "NewExpression",
      callee:
        { type: "NewExpression",
          callee: { type: "IdentifierExpression", name: "foo" },
          arguments: [] },
      arguments: [] }
  );

  testParse("new new foo()", expr,
    { type: "NewExpression",
      callee:
        { type: "NewExpression",
          callee: { type: "IdentifierExpression", name: "foo" },
          arguments: [] },
      arguments: [] }
  );


  testParse("new f(...a)", expr,
    {
      type: "NewExpression",
      callee: { type: "IdentifierExpression", name: "f" },
      arguments: [{ type: "SpreadElement", expression: { type: "IdentifierExpression", name: "a" } }]
    }
  );
  testParse("new f(...a = b)", expr,
    {
      type: "NewExpression",
      callee: { type: "IdentifierExpression", name: "f" },
      arguments: [{
        type: "SpreadElement",
        expression: {
          type: "AssignmentExpression",
          binding: { type: "BindingIdentifier", name: "a" },
          expression: { type: "IdentifierExpression", name: "b" }
        }
      }]
    }
  );
  testParse("new f(...a, ...b)", expr,
    {
      type: "NewExpression",
      callee: { type: "IdentifierExpression", name: "f" },
      arguments: [{
        type: "SpreadElement",
        expression: { type: "IdentifierExpression", name: "a" }
      }, { type: "SpreadElement", expression: { type: "IdentifierExpression", name: "b" } }]
    }
  );
  testParse("new f(a, ...b, c)", expr,
    {
      type: "NewExpression",
      callee: { type: "IdentifierExpression", name: "f" },
      arguments: [{ type: "IdentifierExpression", name: "a" }, {
        type: "SpreadElement",
        expression: { type: "IdentifierExpression", name: "b" }
      }, { type: "IdentifierExpression", name: "c" }]
    }
  );
  testParse("new f(...a, b, ...c)", expr,
    {
      type: "NewExpression",
      callee: { type: "IdentifierExpression", name: "f" },
      arguments: [{
        type: "SpreadElement",
        expression: { type: "IdentifierExpression", name: "a" }
      }, { type: "IdentifierExpression", name: "b" }, {
        type: "SpreadElement",
        expression: { type: "IdentifierExpression", name: "c" }
      }]
    }
  );
  testParse("new(a, b)", expr,
    {
      type: "NewExpression",
      callee: {
        type: "BinaryExpression",
        left: { type: "IdentifierExpression", name: "a"},
        operator: ",",
        right: { type: "IdentifierExpression", name: "b"}
      },
      arguments: []
    }
  );
  testParse("new(a in b)", expr,
    {
      type: "NewExpression",
      callee: {
        type: "BinaryExpression",
        left: { type: "IdentifierExpression", name: "a"},
        operator: "in",
        right: { type: "IdentifierExpression", name: "b"}
      },
      arguments: []
    }
  );
  testParse("new (Date(1))", expr,
    {
      type: "NewExpression",
      callee: {
        type: "CallExpression",
        callee: {
          type: "IdentifierExpression",
          name: "Date"
        },
        arguments: [{
          type: "LiteralNumericExpression",
          value: 1
        }]
      }
    }
  );
  testParse("new [1, 2, 3]", expr,
    {
      type: "NewExpression",
      callee: {
        type: "ArrayExpression",
        elements: [{
          type: "LiteralNumericExpression",
          value: 1
        }, {
          type: "LiteralNumericExpression",
          value: 2
        }, {
          type: "LiteralNumericExpression",
          value: 3
        }]
      }
    }
  );
  testParse("new { a: 1 }", expr,
    {
      type: "NewExpression",
      callee: {
        type: "ObjectExpression",
        properties: [{
          type: "DataProperty",
          name: {
            type: "StaticPropertyName",
            value: "a"
          },
          expression: {
            type: "LiteralNumericExpression",
            value: 1
          }
        }]
      }
    }
           );
  testParse("new ``", expr, {
    type: "NewExpression",
    callee: {
      type: "TemplateExpression",
      tag: null,
      elements: [{ type: "TemplateElement", rawValue: "" }]
    },
    arguments: []
  });

  testParse("new a``", expr, {
    type: "NewExpression",
    callee: {
      type: "TemplateExpression",
      tag: { type: "IdentifierExpression", name: "a" },
      elements: [{ type: "TemplateElement", rawValue: "" }]
    },
    arguments: []
  });
  testParse("new a()``", expr, {
    type: "TemplateExpression",
    tag: { type: "NewExpression", callee: { type: "IdentifierExpression", name: "a" }, arguments: [] },
    elements: [{ type: "TemplateElement", rawValue: "" }]
  });

  testParse("new a.b()", stmt, {
    type: "ExpressionStatement",
    expression: {
      type: "NewExpression",
      callee: {
        type: "StaticMemberExpression",
        object: {
          type: "IdentifierExpression",
          name: "a"
        },
        property: "b"
      },
      arguments: []
    }
  });

  testParse("new a.b(1)", stmt, {
    type: "ExpressionStatement",
    expression: {
      type: "NewExpression",
      callee: {
        type: "StaticMemberExpression",
        object: {
          type: "IdentifierExpression",
          name: "a"
        },
        property: "b"
      },
      arguments: [{
        type: "LiteralNumericExpression",
        value: 1
      }]
    }
  });

  testParse("new a.b(1, 2)", stmt, {
    type: "ExpressionStatement",
    expression: {
      type: "NewExpression",
      callee: {
        type: "StaticMemberExpression",
        object: {
          type: "IdentifierExpression",
          name: "a"
        },
        property: "b"
      },
      arguments: [{
        type: "LiteralNumericExpression",
        value: 1
      },{
        type: "LiteralNumericExpression",
        value: 2
      }]
    }
  });

  testParse("new this.b(1, 2)", stmt, {
    type: "ExpressionStatement",
    expression: {
      type: "NewExpression",
      callee: {
        type: "StaticMemberExpression",
        object: {
          type: "ThisExpression"
        },
        property: "b"
      },
      arguments: [{
        type: "LiteralNumericExpression",
        value: 1
      },{
        type: "LiteralNumericExpression",
        value: 2
      }]
    }
  });

  testParse("new (this.b(1, 2))", stmt,{
    type: "ExpressionStatement",
    expression: {
      type: "NewExpression",
      callee: {
        type: "CallExpression",
        callee: {
          type: "StaticMemberExpression",
          object: {
            type: "ThisExpression"
          },
          property: "b"
        },
        arguments: [
          {
            type: "LiteralNumericExpression",
            value: 1
          },
          {
            type: "LiteralNumericExpression",
            value: 2
          }
        ]
      },
      arguments: []
    }
  });

  testParse("new a['b']()", stmt, {
    type: "ExpressionStatement",
    expression: {
      type: "NewExpression",
      callee: {
        type: "ComputedMemberExpression",
        object: {
          type: "IdentifierExpression",
          name: "a"
        },
        expression: {
          type: "LiteralStringExpression",
          value: "b"
        }
      },
      arguments: []
    }
  });

});
