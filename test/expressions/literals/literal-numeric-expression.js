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

test("literal numeric expression", function () {

  testParse("0", expr, { type: "LiteralNumericExpression", value: 0 });
  testParse("0;", expr, { type: "LiteralNumericExpression", value: 0 });
  testParse("3", expr, { type: "LiteralNumericExpression", value: 3 });
  testParse("5", expr, { type: "LiteralNumericExpression", value: 5 });
  testParse("0", expr, { type: "LiteralNumericExpression", value: 0 });
  testParse("\n    0\n\n", expr, { type: "LiteralNumericExpression", value: 0 });

  testParse(".14", expr, { type: "LiteralNumericExpression", value: 0.14 });
  testParse("6.", expr, { type: "LiteralNumericExpression", value: 6 });
  testParse("0.", expr, { type: "LiteralNumericExpression", value: 0 });
  testParse("3.14159", expr, { type: "LiteralNumericExpression", value: 3.14159 });

  testParse("6.02214179e+23", expr, { type: "LiteralNumericExpression", value: 6.02214179e+23 });
  testParse("1.492417830e-10", expr, { type: "LiteralNumericExpression", value: 1.49241783e-10 });
  testParse("0e+100 ", expr, { type: "LiteralNumericExpression", value: 0 });
  testParse("0e+100", expr, { type: "LiteralNumericExpression", value: 0 });

  testParse("0x0", expr, { type: "LiteralNumericExpression", value: 0 });
  testParse("0x0;", expr, { type: "LiteralNumericExpression", value: 0 });
  testParse("0xabc", expr, { type: "LiteralNumericExpression", value: 0xABC });
  testParse("0xdef", expr, { type: "LiteralNumericExpression", value: 0xDEF });
  testParse("0X1A", expr, { type: "LiteralNumericExpression", value: 0x1A });
  testParse("0x10", expr, { type: "LiteralNumericExpression", value: 0x10 });
  testParse("0x100", expr, { type: "LiteralNumericExpression", value: 0x100 });
  testParse("0X04", expr, { type: "LiteralNumericExpression", value: 0x4 });

  // Legacy Octal Integer Literal
  testParse("02", expr, { type: "LiteralNumericExpression", value: 2 });
  testParse("012", expr, { type: "LiteralNumericExpression", value: 10 });
  testParse("0012", expr, { type: "LiteralNumericExpression", value: 10 });
  testParse("\n    0\n\n", expr, { type: "LiteralNumericExpression", value: 0 });
  testParse("0.", expr, { type: "LiteralNumericExpression", value: 0 });

  // testParseFailure("'use strict'; 01", "Unexpected legacy octal integer literal");
  // testParseFailure("'use strict'; 0123", "Unexpected legacy octal integer literal");
  // testParseFailure("'use strict'; 00", "Unexpected legacy octal integer literal");
  // testParseFailure("'use strict'; 07", "Unexpected legacy octal integer literal");
  // testParseFailure("'use strict'; 08", "Unexpected noctal integer literal");
  // testParseFailure("'use strict'; 019", "Unexpected noctal integer literal");
  // testParseModuleFailure("01", "Unexpected legacy octal integer literal");

  // Binary Integer Literal
  testParse("0b0", expr, { type: "LiteralNumericExpression", value: 0 });
  testParse("0b1", expr, { type: "LiteralNumericExpression", value: 1 });
  testParse("0b10", expr, { type: "LiteralNumericExpression", value: 2 });
  testParse("0B0", expr, { type: "LiteralNumericExpression", value: 0 });
  // testParse("'use strict'; 0b0", expr, { type: "LiteralNumericExpression", value: 0 });

  // testParseFailure("0b", "Unexpected end of input");
  // testParseFailure("0b1a", "Unexpected \"a\"");
  // testParseFailure("0b9", "Unexpected \"9\"");
  // testParseFailure("0b18", "Unexpected \"8\"");
  // testParseFailure("0b12", "Unexpected \"2\"");
  // testParseFailure("0B", "Unexpected end of input");
  // testParseFailure("0B1a", "Unexpected \"a\"");
  // testParseFailure("0B9", "Unexpected \"9\"");
  // testParseFailure("0B18", "Unexpected \"8\"");
  // testParseFailure("0B12", "Unexpected \"2\"");

  // Octal Integer Literal
  testParse("0o0", expr, { type: "LiteralNumericExpression", value: 0 });
  testParse("(0o0)", expr, { type: "LiteralNumericExpression", value: 0 });
  testParse("0o1", expr, { type: "LiteralNumericExpression", value: 1 });
  testParse("0o10", expr, { type: "LiteralNumericExpression", value: 8 });
  testParse("0O0", expr, { type: "LiteralNumericExpression", value: 0 });
  testParse("09", expr, { type: "LiteralNumericExpression", value: 9 });
  testParse("018", expr, { type: "LiteralNumericExpression", value: 18 });
  // testParse("'use strict'; 0o0", expr, { type: "LiteralNumericExpression", value: 0 });

  // testParseFailure("0o", "Unexpected end of input");
  // testParseFailure("0o1a", "Unexpected \"a\"");
  // testParseFailure("0o9", "Unexpected \"9\"");
  // testParseFailure("0o18", "Unexpected \"8\"");
  // testParseFailure("0O", "Unexpected end of input");
  // testParseFailure("0O1a", "Unexpected \"a\"");
  // testParseFailure("0O9", "Unexpected \"9\"");
  // testParseFailure("0O18", "Unexpected \"8\"");

});
