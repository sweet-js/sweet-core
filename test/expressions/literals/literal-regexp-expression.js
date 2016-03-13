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

test("literal regexp expression", function () {
  // Regular Expression Literals
  testParse("/a/", expr, { type: "LiteralRegExpExpression", pattern: "a", flags: "" });
  testParse("/\\0/", expr, { type: "LiteralRegExpExpression", pattern: "\\0", flags: "" });
  testParse("/\\1/u", expr, { type: "LiteralRegExpExpression", pattern: "\\1", flags: "u" });
  testParse("/a/;", expr, { type: "LiteralRegExpExpression", pattern: "a", flags: "" });
  testParse("/a/i", expr, { type: "LiteralRegExpExpression", pattern: "a", flags: "i" });
  testParse("/a/i;", expr, { type: "LiteralRegExpExpression", pattern: "a", flags: "i" });
  testParse("/[--]/", expr, { type: "LiteralRegExpExpression", pattern: "[--]", flags: "" });
  testParse("/[a-z]/i", expr, { type: "LiteralRegExpExpression", pattern: "[a-z]", flags: "i" });
  testParse("/[x-z]/i", expr, { type: "LiteralRegExpExpression", pattern: "[x-z]", flags: "i" });
  testParse("/[a-c]/i", expr, { type: "LiteralRegExpExpression", pattern: "[a-c]", flags: "i" });
  testParse("/[P QR]/i", expr, { type: "LiteralRegExpExpression", pattern: "[P QR]", flags: "i" });
  testParse("/[\\]/]/", expr, { type: "LiteralRegExpExpression", pattern: "[\\]/]", flags: "" });
  testParse("/foo\\/bar/", expr, { type: "LiteralRegExpExpression", pattern: "foo\\/bar", flags: "" });
  // testParse("/=([^=\\s])+/g", expr, { type: "LiteralRegExpExpression", pattern: "=([^=\\s])+", flags: "g" });
  testParse("/(()(?:\\2)((\\4)))/;", expr, { type: "LiteralRegExpExpression", pattern: "(()(?:\\2)((\\4)))", flags: "" });
  testParse("/((((((((((((.))))))))))))\\12/;", expr, { type: "LiteralRegExpExpression", pattern: "((((((((((((.))))))))))))\\12", flags: "" });
  testParse("/\\.\\/\\\\/u", expr, { type: "LiteralRegExpExpression", pattern: "\\.\\/\\\\", flags: "u" });
  testParse("/\\uD834\\uDF06\\u{1d306}/u", expr, { type: "LiteralRegExpExpression", pattern: "\\uD834\\uDF06\\u{1d306}", flags: "u" });
  testParse("/\\uD834/u", expr, { type: "LiteralRegExpExpression", pattern: "\\uD834", flags: "u" });
  testParse("/\\uDF06/u", expr, { type: "LiteralRegExpExpression", pattern: "\\uDF06", flags: "u" });
  testParse("/[-a-]/", expr, { type: "LiteralRegExpExpression", pattern: "[-a-]", flags: "" });
  testParse("/[-\\-]/u", expr, { type: "LiteralRegExpExpression", pattern: "[-\\-]", flags: "u" });
  testParse("/[-a-b-]/", expr, { type: "LiteralRegExpExpression", pattern: "[-a-b-]", flags: "" });
  testParse("/[]/", expr, { type: "LiteralRegExpExpression", pattern: "[]", flags: "" });

  // testParse("/0/g.test", expr, {
  //   type: "StaticMemberExpression",
  //   object: { type: "LiteralRegExpExpression", pattern: "0", flags: "g" },
  //   property: "test"
  // });
  //
  // // valid only if Annex B.1.4 is implemented
  // testParse("/{/;", expr, { type: "LiteralRegExpExpression", pattern: "{", flags: "" });
  // testParse("/}/;", expr, { type: "LiteralRegExpExpression", pattern: "}", flags: "" });
  // testParse("/}?/u;", expr, { type: "LiteralRegExpExpression", pattern: "}?", flags: "u" });
  // testParse("/{*/u;", expr, { type: "LiteralRegExpExpression", pattern: "{*", flags: "u" });
  // testParse("/{}/;", expr, { type: "LiteralRegExpExpression", pattern: "{}", flags: "" });
  // testParse("/.{.}/;", expr, { type: "LiteralRegExpExpression", pattern: ".{.}", flags: "" });
  // testParse("/[\\w-\\s]/;", expr, { type: "LiteralRegExpExpression", pattern: "[\\w-\\s]", flags: "" });
  // testParse("/[\\s-\\w]/;", expr, { type: "LiteralRegExpExpression", pattern: "[\\s-\\w]", flags: "" });
  // testParse("/(?=.)*/;", expr, { type: "LiteralRegExpExpression", pattern: "(?=.)*", flags: "" });
  // testParse("/(?!.){0,}?/;", expr, { type: "LiteralRegExpExpression", pattern: "(?!.){0,}?", flags: "" });
  // // NOTE: The {0,} here is not a quantifier! It is just a regular atom.
  // testParse("/(?!.){0,}?/u", expr, { type: "LiteralRegExpExpression", pattern: "(?!.){0,}?", flags: "u" });
});
