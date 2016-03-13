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

test("literal string expression", function () {
  testParse("('x')", expr, { type: "LiteralStringExpression", value: "x" });
  testParse("('\\\\\\'')", expr, { type: "LiteralStringExpression", value: "\\'" });
  testParse("(\"x\")", expr, { type: "LiteralStringExpression", value: "x" });
  testParse("(\"\\\\\\\"\")", expr, { type: "LiteralStringExpression", value: "\\\"" });
  testParse("('\\\r')", expr, { type: "LiteralStringExpression", value: "" });
  testParse("('\\\r\n')", expr, { type: "LiteralStringExpression", value: "" });
  testParse("('\\\n')", expr, { type: "LiteralStringExpression", value: "" });
  testParse("('\\\u2028')", expr, { type: "LiteralStringExpression", value: "" });
  testParse("('\\\u2029')", expr, { type: "LiteralStringExpression", value: "" });
  testParse("('\u202a')", expr, { type: "LiteralStringExpression", value: "\u202A" });
  testParse("('\\0')", expr, { type: "LiteralStringExpression", value: "\0" });
  // testParse("'use strict'; ('\\0')", expr, { type: "LiteralStringExpression", value: "\0" });
  // testParse("'use strict'; ('\\0x')", expr, { type: "LiteralStringExpression", value: "\0" + "x" });
  testParse("('\\01')", expr, { type: "LiteralStringExpression", value: "\x01" });
  testParse("('\\1')", expr, { type: "LiteralStringExpression", value: "\x01" });
  testParse("('\\11')", expr, { type: "LiteralStringExpression", value: "\t" });
  testParse("('\\111')", expr, { type: "LiteralStringExpression", value: "I" });
  testParse("('\\1111')", expr, { type: "LiteralStringExpression", value: "I1" });
  testParse("('\\2111')", expr, { type: "LiteralStringExpression", value: "\x891" });
  testParse("('\\5111')", expr, { type: "LiteralStringExpression", value: ")11" });
  testParse("('\\5a')", expr, { type: "LiteralStringExpression", value: "\x05a" });
  testParse("('\\7a')", expr, { type: "LiteralStringExpression", value: "\x07a" });
  testParse("('\\a')", expr, { type: "LiteralStringExpression", value: "a" });
  testParse("('\\`')", expr, { type: "LiteralStringExpression", value: "`" });
  testParse("('\\u{00F8}')", expr, { type: "LiteralStringExpression", value: "\xF8" });
  testParse("('\\u{0}')", expr, { type: "LiteralStringExpression", value: "\0" });
  testParse("('\\u{10FFFF}')", expr, { type: "LiteralStringExpression", value: "\uDBFF\uDFFF" });
  testParse("('\\u{0000000000F8}')", expr, { type: "LiteralStringExpression", value: "\xF8" });
  //
  // testParseFailure("'", "Unexpected end of input");
  // testParseFailure("\"", "Unexpected end of input");
  // testParseFailure("(')", "Unexpected end of input");
  // testParseFailure("('\n')", "Unexpected \"\\n\"");
  // testParseFailure("('\\x')", "Unexpected \"'\"");
  // testParseFailure("('\\u')", "Unexpected \"'\"");
  // testParseFailure("('\\8')", "Unexpected \"8\"");
  // testParseFailure("('\\9')", "Unexpected \"9\"");
  // testParseFailure("('\\x0')", "Unexpected \"0\"");
  // testParseFailure("('\u2028')", "Unexpected \"\u2028\"");
  // testParseFailure("('\u2029')", "Unexpected \"\u2029\"");
  // testParseFailure("('\\u{2028')", "Unexpected \"{\"");
  // testParseFailure("'use strict'; ('\\1')", "Unexpected legacy octal escape sequence: \\1");
  // testParseFailure("'use strict'; ('\\4')", "Unexpected legacy octal escape sequence: \\4");
  // testParseFailure("'use strict'; ('\\11')", "Unexpected legacy octal escape sequence: \\11");
  // testParseFailure("'use strict'; ('\\41')", "Unexpected legacy octal escape sequence: \\41");
  // testParseFailure("'use strict'; ('\\01')", "Unexpected legacy octal escape sequence: \\01");
  // testParseFailure("'use strict'; ('\\00')", "Unexpected legacy octal escape sequence: \\00");
  // testParseFailure("'use strict'; ('\\001')", "Unexpected legacy octal escape sequence: \\001");
  // testParseFailure("'use strict'; ('\\000')", "Unexpected legacy octal escape sequence: \\000");
  // testParseFailure("'use strict'; ('\\123')", "Unexpected legacy octal escape sequence: \\123");
  // testParseModuleFailure("('\\1')", "Unexpected legacy octal escape sequence: \\1");

  // early grammar error: 11.8.4.1
  // It is a Syntax Error if the MV of HexDigits > 1114111.
  // testParseFailure("(\"\\u{110000}\")", "Unexpected \"{\"");
  // testParseFailure("(\"\\u{FFFFFFF}\")", "Unexpected \"{\"");
});
