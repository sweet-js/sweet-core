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

function id(x) {
  return x;
}

suite("Parser", function () {
  suite("Comments", function () {
    testParse(" /**/", id, { type: "Script", directives: [], statements: [] });
    testParse(" /****/", id, { type: "Script", directives: [], statements: [] });
    testParse(" /**\n\r\r\n**/", id, {
      type: "Script", directives: [], statements: [] }
    );
    testParse(" //\n", id, { type: "Script", directives: [], statements: [] });
    testParse("<!-- foo", id, { type: "Script", directives: [], statements: [] });
    testParse("--> comment", id, { type: "Script", directives: [], statements: [] });
    testParse("<!-- comment", id, { type: "Script", directives: [], statements: [] });
    testParse(" \t --> comment", id, {
      type: "Script",
      directives: [], statements: [] }
    );
    testParse(" \t /* block comment */  --> comment", id, {
      type: "Script",
      directives: [], statements: [] }
    );
    testParse("/* block comment */--> comment", id, {
      type: "Script",
      directives: [], statements: [] }
    );
  });
});
