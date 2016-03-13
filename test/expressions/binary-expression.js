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

test("binary expression", function () {
  testParse("1+2;", expr,
    { type: "BinaryExpression",
      operator: "+",
      left: { type: "LiteralNumericExpression", value: 1 },
      right: { type: "LiteralNumericExpression", value: 2 } }
  );

  // Binary Bitwise Operators
  testParse("x & y", expr,
    { type: "BinaryExpression",
      operator: "&",
      left: { type: "IdentifierExpression", name: "x" },
      right: { type: "IdentifierExpression", name: "y" } }
  );

  testParse("x ^ y", expr,
    { type: "BinaryExpression",
      operator: "^",
      left: { type: "IdentifierExpression", name: "x" },
      right: { type: "IdentifierExpression", name: "y" } }
  );

  testParse("x | y", expr,
    { type: "BinaryExpression",
      operator: "|",
      left: { type: "IdentifierExpression", name: "x" },
      right: { type: "IdentifierExpression", name: "y" } }
  );

  // Binary Expressions
  testParse("x + y + z", expr,
    { type: "BinaryExpression",
      operator: "+",
      left:
        { type: "BinaryExpression",
          operator: "+",
          left: { type: "IdentifierExpression", name: "x" },
          right: { type: "IdentifierExpression", name: "y" } },
      right: { type: "IdentifierExpression", name: "z" } }
  );

  testParse("x - y + z", expr,
    { type: "BinaryExpression",
      operator: "+",
      left:
        { type: "BinaryExpression",
          operator: "-",
          left: { type: "IdentifierExpression", name: "x" },
          right: { type: "IdentifierExpression", name: "y" } },
      right: { type: "IdentifierExpression", name: "z" } }
  );

  testParse("x + y - z", expr,
    { type: "BinaryExpression",
      operator: "-",
      left:
        { type: "BinaryExpression",
          operator: "+",
          left: { type: "IdentifierExpression", name: "x" },
          right: { type: "IdentifierExpression", name: "y" } },
      right: { type: "IdentifierExpression", name: "z" } }
  );

  testParse("x - y - z", expr,
    { type: "BinaryExpression",
      operator: "-",
      left:
        { type: "BinaryExpression",
          operator: "-",
          left: { type: "IdentifierExpression", name: "x" },
          right: { type: "IdentifierExpression", name: "y" } },
      right: { type: "IdentifierExpression", name: "z" } }
   );

  testParse("x + y * z", expr,
    { type: "BinaryExpression",
      operator: "+",
      left: { type: "IdentifierExpression", name: "x" },
      right:
        { type: "BinaryExpression",
          operator: "*",
          left: { type: "IdentifierExpression", name: "y" },
          right: { type: "IdentifierExpression", name: "z" } } }
  );

  testParse("x + y / z", expr,
    { type: "BinaryExpression",
      operator: "+",
      left: { type: "IdentifierExpression", name: "x" },
      right:
        { type: "BinaryExpression",
          operator: "/",
          left: { type: "IdentifierExpression", name: "y" },
          right: { type: "IdentifierExpression", name: "z" } } }
  );

  testParse("x - y % z", expr,
    { type: "BinaryExpression",
      operator: "-",
      left: { type: "IdentifierExpression", name: "x" },
      right:
        { type: "BinaryExpression",
          operator: "%",
          left: { type: "IdentifierExpression", name: "y" },
          right: { type: "IdentifierExpression", name: "z" } } }
  );

  testParse("x * y * z", expr,
    { type: "BinaryExpression",
      operator: "*",
      left:
        { type: "BinaryExpression",
          operator: "*",
          left: { type: "IdentifierExpression", name: "x" },
          right: { type: "IdentifierExpression", name: "y" } },
      right: { type: "IdentifierExpression", name: "z" } }
  );

  testParse("x * y / z", expr,
    { type: "BinaryExpression",
      operator: "/",
      left:
        { type: "BinaryExpression",
          operator: "*",
          left: { type: "IdentifierExpression", name: "x" },
          right: { type: "IdentifierExpression", name: "y" } },
      right:
        { type: "IdentifierExpression", name: "z" } }
  );

  testParse("x * y % z", expr,
    { type: "BinaryExpression",
      operator: "%",
      left:
        { type: "BinaryExpression",
          operator: "*",
          left: { type: "IdentifierExpression", name: "x" },
          right: { type: "IdentifierExpression", name: "y" } },
      right: { type: "IdentifierExpression", name: "z" } }
  );

  testParse("x % y * z", expr,
    { type: "BinaryExpression",
      operator: "*",
      left:
        { type: "BinaryExpression",
          operator: "%",
          left: { type: "IdentifierExpression", name: "x" },
          right: { type: "IdentifierExpression", name: "y" } },
      right: { type: "IdentifierExpression", name: "z" } }
  );

  testParse("x << y << z", expr,
    { type: "BinaryExpression",
      operator: "<<",
      left:
        { type: "BinaryExpression",
          operator: "<<",
          left: { type: "IdentifierExpression", name: "x" },
          right: { type: "IdentifierExpression", name: "y" } },
      right: { type: "IdentifierExpression", name: "z" } }
  );

  testParse("x | y | z", expr,
    { type: "BinaryExpression",
      operator: "|",
      left:
        { type: "BinaryExpression",
          operator: "|",
          left: { type: "IdentifierExpression", name: "x" },
          right: { type: "IdentifierExpression", name: "y" } },
      right: { type: "IdentifierExpression", name: "z" } }
  );

  testParse("x & y & z", expr,
    { type: "BinaryExpression",
      operator: "&",
      left:
        { type: "BinaryExpression",
          operator: "&",
          left: { type: "IdentifierExpression", name: "x" },
          right: { type: "IdentifierExpression", name: "y" } },
      right: { type: "IdentifierExpression", name: "z" } }
  );

  testParse("x ^ y ^ z", expr,
    { type: "BinaryExpression",
      operator: "^",
      left:
        { type: "BinaryExpression",
          operator: "^",
          left: { type: "IdentifierExpression", name: "x" },
          right: { type: "IdentifierExpression", name: "y" } },
      right: { type: "IdentifierExpression", name: "z" } }
  );

  testParse("x & y | z", expr,
    { type: "BinaryExpression",
      operator: "|",
      left:
        { type: "BinaryExpression",
          operator: "&",
          left: { type: "IdentifierExpression", name: "x" },
          right: { type: "IdentifierExpression", name: "y" } },
      right: { type: "IdentifierExpression", name: "z" } }
  );

  testParse("x | y ^ z", expr,
    { type: "BinaryExpression",
      operator: "|",
      left: { type: "IdentifierExpression", name: "x" },
      right:
        { type: "BinaryExpression",
          operator: "^",
          left: { type: "IdentifierExpression", name: "y" },
          right: { type: "IdentifierExpression", name: "z" } } }
  );

  testParse("x | y & z", expr,
    { type: "BinaryExpression",
      operator: "|",
      left: { type: "IdentifierExpression", name: "x" },
      right:
        { type: "BinaryExpression",
          operator: "&",
          left: { type: "IdentifierExpression", name: "y" },
          right: { type: "IdentifierExpression", name: "z" } } }
  );


  // Binary Logical Operators
  testParse("x || y", expr,
    { type: "BinaryExpression",
      operator: "||",
      left: { type: "IdentifierExpression", name: "x" },
      right: { type: "IdentifierExpression", name: "y" } }
  );

  testParse("x && y", expr,
    { type: "BinaryExpression",
      operator: "&&",
      left: { type: "IdentifierExpression", name: "x" },
      right: { type: "IdentifierExpression", name: "y" } }
  );

  testParse("x || y || z", expr,
    { type: "BinaryExpression",
      operator: "||",
      left:
        { type: "BinaryExpression",
          operator: "||",
          left: { type: "IdentifierExpression", name: "x" },
          right: { type: "IdentifierExpression", name: "y" } },
      right: { type: "IdentifierExpression", name: "z" } }
  );

  testParse("x && y && z", expr,
    { type: "BinaryExpression",
      operator: "&&",
      left:
        { type: "BinaryExpression",
          operator: "&&",
          left: { type: "IdentifierExpression", name: "x" },
          right: { type: "IdentifierExpression", name: "y" } },
      right: { type: "IdentifierExpression", name: "z" } }
  );

  testParse("x || y && z", expr,
    { type: "BinaryExpression",
      operator: "||",
      left: { type: "IdentifierExpression", name: "x" },
      right:
        { type: "BinaryExpression",
          operator: "&&",
          left: { type: "IdentifierExpression", name: "y" },
          right: { type: "IdentifierExpression", name: "z" } } }
  );

  testParse("x || y ^ z", expr,
    { type: "BinaryExpression",
      operator: "||",
      left: { type: "IdentifierExpression", name: "x" },
      right:
        { type: "BinaryExpression",
          operator: "^",
          left: { type: "IdentifierExpression", name: "y" },
          right: { type: "IdentifierExpression", name: "z" } } }
  );


  // Multiplicative Operators
  testParse("x * y", expr,
    { type: "BinaryExpression",
      operator: "*",
      left: { type: "IdentifierExpression", name: "x" },
      right: { type: "IdentifierExpression", name: "y" } }
  );

  testParse("x / y", expr,
    { type: "BinaryExpression",
      operator: "/",
      left: { type: "IdentifierExpression", name: "x" },
      right: { type: "IdentifierExpression", name: "y" } }
  );

  testParse("x % y", expr,
    { type: "BinaryExpression",
      operator: "%",
      left: { type: "IdentifierExpression", name: "x" },
      right: { type: "IdentifierExpression", name: "y" } }
  );


  // Additive Operators
  testParse("x + y", expr,
    { type: "BinaryExpression",
      operator: "+",
      left: { type: "IdentifierExpression", name: "x" },
      right: { type: "IdentifierExpression", name: "y" } }
  );

  testParse("x - y", expr,
    { type: "BinaryExpression",
      operator: "-",
      left: { type: "IdentifierExpression", name: "x" },
      right: { type: "IdentifierExpression", name: "y" } }
  );

  // Bitwise Shift Operator
  testParse("x << y", expr,
    { type: "BinaryExpression",
      operator: "<<",
      left: { type: "IdentifierExpression", name: "x" },
      right: { type: "IdentifierExpression", name: "y" } }
  );

  testParse("x >> y", expr,
    { type: "BinaryExpression",
      operator: ">>",
      left: { type: "IdentifierExpression", name: "x" },
      right: { type: "IdentifierExpression", name: "y" } }
  );

  testParse("x >>> y", expr,
    { type: "BinaryExpression",
      operator: ">>>",
      left: { type: "IdentifierExpression", name: "x" },
      right: { type: "IdentifierExpression", name: "y" } }
  );


  // Relational Operators
  testParse("x < y", expr,
    { type: "BinaryExpression",
      operator: "<",
      left: { type: "IdentifierExpression", name: "x" },
      right: { type: "IdentifierExpression", name: "y" } }
  );

  testParse("x > y", expr,
    { type: "BinaryExpression",
      operator: ">",
      left: { type: "IdentifierExpression", name: "x" },
      right: { type: "IdentifierExpression", name: "y" } }
  );

  testParse("x <= y", expr,
    { type: "BinaryExpression",
      operator: "<=",
      left: { type: "IdentifierExpression", name: "x" },
      right: { type: "IdentifierExpression", name: "y" } }
  );

  testParse("x >= y", expr,
    { type: "BinaryExpression",
      operator: ">=",
      left: { type: "IdentifierExpression", name: "x" },
      right: { type: "IdentifierExpression", name: "y" } }
  );

  testParse("x in y", expr,
    { type: "BinaryExpression",
      operator: "in",
      left: { type: "IdentifierExpression", name: "x" },
      right: { type: "IdentifierExpression", name: "y" } }
  );

  testParse("x instanceof y", expr,
    { type: "BinaryExpression",
      operator: "instanceof",
      left: { type: "IdentifierExpression", name: "x" },
      right: { type: "IdentifierExpression", name: "y" } }
  );

  testParse("x < y < z", expr,
    { type: "BinaryExpression",
      operator: "<",
      left:
        { type: "BinaryExpression",
          operator: "<",
          left: { type: "IdentifierExpression", name: "x" },
          right: { type: "IdentifierExpression", name: "y" } },
      right: { type: "IdentifierExpression", name: "z" } }
  );


  // Equality Operators
  testParse("x == y", expr,
    { type: "BinaryExpression",
      operator: "==",
      left: { type: "IdentifierExpression", name: "x" },
      right: { type: "IdentifierExpression", name: "y" } }
  );

  testParse("x != y", expr,
    { type: "BinaryExpression",
      operator: "!=",
      left: { type: "IdentifierExpression", name: "x" },
      right: { type: "IdentifierExpression", name: "y" } }
  );

  testParse("x === y", expr,
    { type: "BinaryExpression",
      operator: "===",
      left: { type: "IdentifierExpression", name: "x" },
      right: { type: "IdentifierExpression", name: "y" } }
  );

  testParse("x !== y", expr,
    { type: "BinaryExpression",
      operator: "!==",
      left: { type: "IdentifierExpression", name: "x" },
      right: { type: "IdentifierExpression", name: "y" } }
  );

});
