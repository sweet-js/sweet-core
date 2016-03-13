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
import { expr, stmt, testParse, testParseFailure } from "../../assertions";
import test from 'ava';

test("array binding", function () {

  testParse("[x] = 0", expr,
    {
      type: "AssignmentExpression",
      binding: { type: "ArrayBinding", elements: [{ type: "BindingIdentifier", name: "x" }], restElement: null },
      expression: { type: "LiteralNumericExpression", value: 0 }
    }
  );

  testParse("[x,] = 0", expr,
    {
      type: "AssignmentExpression",
      binding: { type: "ArrayBinding", elements: [{ type: "BindingIdentifier", name: "x" }], restElement: null },
      expression: { type: "LiteralNumericExpression", value: 0 }
    }
  );

  testParse("[x,,] = 0", expr,
    {
      type: "AssignmentExpression",
      binding: {
        type: "ArrayBinding",
        elements: [{ type: "BindingIdentifier", name: "x" }, null],
        restElement: null
      },
      expression: { type: "LiteralNumericExpression", value: 0 }
    }
  );

  testParse("[[x]] = 0", expr,
    {
      type: "AssignmentExpression",
      binding: {
        type: "ArrayBinding",
        elements: [{
          type: "ArrayBinding",
          elements: [{ type: "BindingIdentifier", name: "x" }],
          restElement: null
        }],
        restElement: null
      },
      expression: { type: "LiteralNumericExpression", value: 0 }
    }
  );

  testParse("[x, y, ...z] = 0", expr,
    {
      type: "AssignmentExpression",
      binding: {
        type: "ArrayBinding",
        elements: [{ type: "BindingIdentifier", name: "x" }, { type: "BindingIdentifier", name: "y" }],
        restElement: { type: "BindingIdentifier", name: "z" }
      },
      expression: { type: "LiteralNumericExpression", value: 0 }
    }
  );

  testParse("[, x,,] = 0", expr,
    {
      type: "AssignmentExpression",
      binding: {
        type: "ArrayBinding",
        elements: [null, { type: "BindingIdentifier", name: "x" }, null],
        restElement: null
      },
      expression: { type: "LiteralNumericExpression", value: 0 }
    }
  );

  testParse("[...[x]] = 0", expr,
    {
      type: "AssignmentExpression",
      binding: {
        type: "ArrayBinding",
        elements: [],
        restElement: {
          type: "ArrayBinding",
          elements: [{ type: "BindingIdentifier", name: "x" }],
          restElement: null
        }
      },
      expression: { type: "LiteralNumericExpression", value: 0 }
    }
  );

  // testParse("[x, ...{0: y}] = 0", expr,
  //   {
  //     type: "AssignmentExpression",
  //     binding: {
  //       type: "ArrayBinding",
  //       elements: [{ type: "BindingIdentifier", name: "x" }],
  //       restElement: {
  //         type: "ObjectBinding",
  //         properties: [{
  //           type: "BindingPropertyProperty",
  //           name: { type: "StaticPropertyName", value: "0" },
  //           binding: { type: "BindingIdentifier", name: "y" }
  //         }]
  //       }
  //     },
  //     expression: { type: "LiteralNumericExpression", value: 0 }
  //   }
  // );

  testParse("[x, x] = 0", expr,
    {
      type: "AssignmentExpression",
      binding: {
        type: "ArrayBinding",
        elements: [{ type: "BindingIdentifier", name: "x" }, { type: "BindingIdentifier", name: "x" }],
        restElement: null
      },
      expression: { type: "LiteralNumericExpression", value: 0 }
    }
  );

  testParse("[x, ...x] = 0", expr,
    {
      type: "AssignmentExpression",
      binding: {
        type: "ArrayBinding",
        elements: [{ type: "BindingIdentifier", name: "x" }],
        restElement: { type: "BindingIdentifier", name: "x" }
      },
      expression: { type: "LiteralNumericExpression", value: 0 }
    }
  );

  testParse("[x.a=a] = b", expr, {
    "type": "AssignmentExpression",
    "binding": {
      "elements": [
        {
          "type": "BindingWithDefault",
          "binding": {
            "type": "StaticMemberExpression",
            "object": {
              "type": "IdentifierExpression",
              "name": "x",
            },
            "property": "a",
          },
          "init": {
            "type": "IdentifierExpression",
            "name": "a",
          }
        }
      ],
      "restElement": null,
      "type": "ArrayBinding",
    },
    "expression": {
      "type": "IdentifierExpression",
      "name": "b",
    }
  });

  testParse("[x[a]=a] = b", expr, {
    type: "AssignmentExpression",
    binding: {
      elements: [
        {
          type: "BindingWithDefault",
          binding: {
            type: "ComputedMemberExpression",
            object: {
              type: "IdentifierExpression",
              name: "x",
            },
            expression: {
              type: "IdentifierExpression",
              name: "a",
            },
          },
          init: {
            type: "IdentifierExpression",
            name: "a",
          }
        }
      ],
      restElement: null,
      type: "ArrayBinding",
    },
    expression: {
      type: "IdentifierExpression",
      name: "b",
    }
  });

  testParse("[...[...a[x]]] = b", expr, {
    type: "AssignmentExpression",
    binding: {
      type: "ArrayBinding",
      elements: [],
      restElement: {
        type: "ArrayBinding",
        elements: [],
        restElement: {
          type: "ComputedMemberExpression",
          object: {
            type: "IdentifierExpression",
            name: "a"
          },
          expression: {
            type: "IdentifierExpression",
            name: "x"
          }
        },
      },
    },
    expression: {
      type: "IdentifierExpression",
      name: "b",
    },
  });

  testParse("[] = 0", expr, {
    type: "AssignmentExpression",
    binding: {
      type: "ArrayBinding",
      elements: [],
      restElement: null
    },
    expression: {
      type: "LiteralNumericExpression",
      value: 0
    }
  });

  // testParse("[{a=0},{a=0}] = 0", expr, {
  //   type: "AssignmentExpression",
  //   binding: {
  //     type: "ArrayBinding",
  //     elements: [
  //       {
  //         type: "ObjectBinding",
  //         properties: [{
  //           type: "BindingPropertyIdentifier",
  //           binding: { type: "BindingIdentifier", name: "a" },
  //           init: { type: "LiteralNumericExpression", value: 0 }
  //         }]
  //       },
  //       {
  //         type: "ObjectBinding",
  //         properties: [{
  //           type: "BindingPropertyIdentifier",
  //           binding: { type: "BindingIdentifier", name: "a" },
  //           init: { type: "LiteralNumericExpression", value: 0 }
  //         }]
  //       },
  //     ],
  //     restElement: null,
  //   },
  //   expression: { type: "LiteralNumericExpression", value: 0 }
  // });
  //
  // testParseFailure("[x] += 0", "Invalid left-hand side in assignment");
  // testParseFailure("[, x, ...y,] = 0", "Invalid left-hand side in assignment");
  // testParseFailure("[...x, ...y] = 0", "Invalid left-hand side in assignment");
  // testParseFailure("[...x, y] = 0", "Invalid left-hand side in assignment");
  // testParseFailure("[...x,,] = 0", "Invalid left-hand side in assignment");
  // testParseFailure("[0,{a=0}] = 0", "Illegal property initializer");
  // testParseFailure("[{a=0},{b=0},0] = 0", "Illegal property initializer");
  // testParseFailure("[{a=0},...0]", "Illegal property initializer");
  // testParseFailure("[...0,a]=0", "Invalid left-hand side in assignment");
  // testParseFailure("[...0,{a=0}]=0", "Illegal property initializer");
  // testParseFailure("[...0,...{a=0}]=0", "Illegal property initializer");
  // testParseFailure("[...{a=0},]", "Illegal property initializer");
  // testParseFailure("[...{a=0},]=0", "Invalid left-hand side in assignment");
  // testParseFailure("[0] = 0", "Invalid left-hand side in assignment");
  // testParseFailure("[a, ...b, {c=0}]", "Illegal property initializer");
  // testParseFailure("{a = [...b, c]} = 0", "Unexpected token \"=\"");
  // testParseFailure("[a, ...(b = c)] = 0", "Invalid left-hand side in assignment");
});
