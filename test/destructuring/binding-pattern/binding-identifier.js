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

var stmt = require("../../helpers").stmt;
var expr = require("../../helpers").expr;
var testParse = require("../../assertions").testParse;
var testParseFailure = require("../../assertions").testParseFailure;

suite("Parser", function () {
  suite("binding identifier", function () {
    suite("let as binding identifier", function () {
      testParse("for(let in 0);", stmt,
        { type: "ForInStatement",
          left: { type: "BindingIdentifier", name: "let" },
          right: { type: "LiteralNumericExpression", value: 0},
          body: { type: "EmptyStatement"}
        }
      );
    });
  });
});
