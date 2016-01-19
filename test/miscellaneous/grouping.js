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

var testParse = require("../assertions").testParse;
var expr = require("../helpers").expr;

suite("Parser", function () {
  suite("grouping", function () {

    testParse("((((((((((((((((((((((((((((((((((((((((((((((((((0))))))))))))))))))))))))))))))))))))))))))))))))))", expr,
      { type: "LiteralNumericExpression", value: 0 }
    );

    testParse("(1 + 2 ) * 3", expr,
      { type: "BinaryExpression",
        operator: "*",
        left:
          { type: "BinaryExpression",
            operator: "+",
            left: { type: "LiteralNumericExpression", value: 1 },
            right: { type: "LiteralNumericExpression", value: 2 } },
        right: { type: "LiteralNumericExpression", value: 3 } }
    );

    testParse("(1) + (2  ) + 3", expr,
      { type: "BinaryExpression",
        operator: "+",
        left:
          { type: "BinaryExpression",
            operator: "+",
            left: { type: "LiteralNumericExpression", value: 1 },
            right: { type: "LiteralNumericExpression", value: 2 } },
        right: { type: "LiteralNumericExpression", value: 3 } }
    );

    testParse("4 + 5 << (6)", expr,
      { type: "BinaryExpression",
        operator: "<<",
        left:
          { type: "BinaryExpression",
            operator: "+",
            left: { type: "LiteralNumericExpression", value: 4 },
            right: { type: "LiteralNumericExpression", value: 5 } },
        right: { type: "LiteralNumericExpression", value: 6 } }
    );


    testParse("(a) + (b)", expr,
      {
        type: "BinaryExpression",
        operator: "+",
        left: { type: "IdentifierExpression", name: "a" },
        right: { type: "IdentifierExpression", name: "b" }
      }
    );

    testParse("(a)", expr,
      { type: "IdentifierExpression", name: "a" }
    );

    testParse("((a))", expr,
      { type: "IdentifierExpression", name: "a" }
    );

    testParse("((a))()", expr,
      { type: "CallExpression", callee: { type: "IdentifierExpression", name: "a" }, arguments: [] }
    );

    testParse("((a))((a))", expr,
      {
        type: "CallExpression",
        callee: { type: "IdentifierExpression", name: "a" },
        arguments: [{ type: "IdentifierExpression", name: "a" }]
      }
    );

    testParse("(a) = 0", expr,
      {
        type: "AssignmentExpression",
        binding: { type: "BindingIdentifier", name: "a" },
        expression: { type: "LiteralNumericExpression", value: 0 }
      }
    );

    testParse("((a)) = 0", expr,
      {
        type: "AssignmentExpression",
        binding: { type: "BindingIdentifier", name: "a" },
        expression: { type: "LiteralNumericExpression", value: 0 }
      }
    );

    testParse("void (a)", expr,
      { type: "UnaryExpression", operator: "void", operand: { type: "IdentifierExpression", name: "a" } }
    );

    testParse("(void a)", expr,
      { type: "UnaryExpression", operator: "void", operand: { type: "IdentifierExpression", name: "a" } }
    );

    testParse("(a++)", expr,
      { type: "UpdateExpression", isPrefix: false, operand: { type: "BindingIdentifier", name: "a" }, operator: "++" }
    );

    testParse("(a)++", expr,
      { type: "UpdateExpression", isPrefix: false, operand: { type: "BindingIdentifier", name: "a" }, operator: "++" }
    );

    testParse("(a)--", expr,
      { type: "UpdateExpression", isPrefix: false, operand: { type: "BindingIdentifier", name: "a" }, operator: "--" }
    );

    testParse("(a) ? (b) : (c)", expr,
      {
        type: "ConditionalExpression",
        test: { type: "IdentifierExpression", name: "a" },
        consequent: { type: "IdentifierExpression", name: "b" },
        alternate: { type: "IdentifierExpression", name: "c" }
      }
    );
  });
});
