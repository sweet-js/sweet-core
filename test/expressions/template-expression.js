/**
 * Copyright 2015 Shape Security, Inc.
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

test("untagged template expressions", function () {
  testParse("``", expr, {
    type: "TemplateExpression",
    tag: null,
    elements: [{ type: "TemplateElement", rawValue: "" }]
  });
  testParse("`abc`", expr, {
    type: "TemplateExpression",
    tag: null,
    elements: [{ type: "TemplateElement", rawValue: "abc" }]
  });
  testParse("`\n`", expr, {
    type: "TemplateExpression",
    tag: null,
    elements: [{ type: "TemplateElement", rawValue: "\n" }]
  });
  testParse("`\r\n\t\n`", expr, {
    type: "TemplateExpression",
    tag: null,
    elements: [{ type: "TemplateElement", rawValue: "\r\n\t\n" }]
  });
  testParse("`\\``", expr, {
    type: "TemplateExpression",
    tag: null,
    elements: [{ type: "TemplateElement", rawValue: "\\`" }]
  });
  testParse("`$$$`", expr, {
    type: "TemplateExpression",
    tag: null,
    elements: [{ type: "TemplateElement", rawValue: "$$$" }]
  });
  testParse("`$$$${a}`", expr, {
    type: "TemplateExpression",
    tag: null,
    elements: [{ type: "TemplateElement", rawValue: "$$$" }, {
      type: "IdentifierExpression",
      name: "a"
    }, { type: "TemplateElement", rawValue: "" }]
  });
  testParse("`${a}`", expr, {
    type: "TemplateExpression",
    tag: null,
    elements: [{ type: "TemplateElement", rawValue: "" }, {
      type: "IdentifierExpression",
      name: "a"
    }, { type: "TemplateElement", rawValue: "" }]
  });
  testParse("`${a}$`", expr, {
    type: "TemplateExpression",
    tag: null,
    elements: [{ type: "TemplateElement", rawValue: "" }, {
      type: "IdentifierExpression",
      name: "a"
    }, { type: "TemplateElement", rawValue: "$" }]
  });
  testParse("`${a}${b}`", expr, {
    type: "TemplateExpression",
    tag: null,
    elements: [{ type: "TemplateElement", rawValue: "" }, {
      type: "IdentifierExpression",
      name: "a"
    }, { type: "TemplateElement", rawValue: "" }, {
      type: "IdentifierExpression",
      name: "b"
    }, { type: "TemplateElement", rawValue: "" }]
  });
  testParse("````", expr, {
    type: "TemplateExpression",
    tag: { type: "TemplateExpression", tag: null, elements: [{ type: "TemplateElement", rawValue: "" }] },
    elements: [{ type: "TemplateElement", rawValue: "" }]
  });
  testParse("``````", expr, {
    type: "TemplateExpression",
    tag: {
      type: "TemplateExpression",
      tag: { type: "TemplateExpression", tag: null, elements: [{ type: "TemplateElement", rawValue: "" }] },
      elements: [{ type: "TemplateElement", rawValue: "" }]
    },
    elements: [{ type: "TemplateElement", rawValue: "" }]
  });

  // testParseFailure("`", "Unexpected end of input");
  // testParseFailure("a++``", "Unexpected template");
  // testParseFailure("`${a", "Unexpected end of input");
  // testParseFailure("`${a}a${b}", "Unexpected end of input");
  // testParseFailure("`\\37`", "Unexpected \"`\"");
});

test("tagged template expressions", function () {
  testParse("a``", expr, {
    type: "TemplateExpression",
    tag: { type: "IdentifierExpression", name: "a" },
    elements: [{ type: "TemplateElement", rawValue: "" }]
  });
  testParse("a()``", expr, {
    type: "TemplateExpression",
    tag: { type: "CallExpression", callee: { type: "IdentifierExpression", name: "a" }, arguments: [] },
    elements: [{ type: "TemplateElement", rawValue: "" }]
  });
  // testParse("new a``", expr, {
  //   type: "NewExpression",
  //   callee: {
  //     type: "TemplateExpression",
  //     tag: { type: "IdentifierExpression", name: "a" },
  //     elements: [{ type: "TemplateElement", rawValue: "" }]
  //   },
  //   arguments: []
  // });
  // testParse("new a()``", expr, {
  //   type: "TemplateExpression",
  //   tag: { type: "NewExpression", callee: { type: "IdentifierExpression", name: "a" }, arguments: [] },
  //   elements: [{ type: "TemplateElement", rawValue: "" }]
  // });
});
