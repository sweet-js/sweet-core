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

var expr = require("../helpers").expr;
var stmt = require("../helpers").stmt;
var testParse = require("../assertions").testParse;
var testParseFailure = require("../assertions").testParseFailure;

suite("Parser", function () {
  suite("automatic semicolon insertion", function () {

    testParse("{ x\n++y }", stmt,
      { type: "BlockStatement",
        block:
          { type: "Block",
            statements:
              [ { type: "ExpressionStatement",
                  expression: { type: "IdentifierExpression", name: "x" } },
                { type: "ExpressionStatement",
                  expression:
                    { type: "UpdateExpression",
                      isPrefix: true,
                      operand: { type: "BindingIdentifier", name: "y" },
                      operator: "++" } } ] } }
    );

    testParse("{ x\n--y }", stmt,
      { type: "BlockStatement",
        block:
          { type: "Block",
            statements:
              [ { type: "ExpressionStatement",
                  expression: { type: "IdentifierExpression", name: "x" } },
                { type: "ExpressionStatement",
                  expression:
                    { type: "UpdateExpression",
                      isPrefix: true,
                      operand: { type: "BindingIdentifier", name: "y" },
                      operator: "--" } } ] } }
    );

    testParse("{ var x = 14, y = 3\nz; }", stmt,
      {
        type: "BlockStatement",
        block: {
          type: "Block",
          statements: [{
            type: "VariableDeclarationStatement",
            declaration: {
              type: "VariableDeclaration",
              kind: "var",
              declarators: [{
                type: "VariableDeclarator",
                binding: { type: "BindingIdentifier", name: "x" },
                init: { type: "LiteralNumericExpression", value: 14 }
              }, {
                type: "VariableDeclarator",
                binding: { type: "BindingIdentifier", name: "y" },
                init: { type: "LiteralNumericExpression", value: 3 }
              }]
            }
          }, { type: "ExpressionStatement", expression: { type: "IdentifierExpression", name: "z" } }]
        }
      }
    );

    testParse("while (true) { continue\nthere; }", stmt,
      { type: "WhileStatement",
        body:
          { type: "BlockStatement",
            block:
              { type: "Block",
                statements:
                  [ { type: "ContinueStatement", label: null },
                    { type: "ExpressionStatement",
                      expression:
                        { type: "IdentifierExpression", name: "there" } } ] } },
        test: { type: "LiteralBooleanExpression", value: true } }
    );

    testParse("while (true) { continue // Comment\nthere; }", stmt,
      { type: "WhileStatement",
        body:
          { type: "BlockStatement",
            block:
              { type: "Block",
                statements:
                  [ { type: "ContinueStatement", label: null },
                    { type: "ExpressionStatement",
                      expression:
                        { type: "IdentifierExpression", name: "there" } } ] } },
        test: { type: "LiteralBooleanExpression", value: true } }
    );

    testParse("while (true) { continue /* Multiline\nComment */there; }", stmt,
      { type: "WhileStatement",
        body:
          { type: "BlockStatement",
            block:
              { type: "Block",
                statements:
                  [ { type: "ContinueStatement", label: null },
                    { type: "ExpressionStatement",
                      expression:
                        { type: "IdentifierExpression", name: "there" } } ] } },
        test: { type: "LiteralBooleanExpression", value: true } }
    );


    testParse("while (true) { break\nthere; }", stmt,
      { type: "WhileStatement",
        body:
          { type: "BlockStatement",
            block:
              { type: "Block",
                statements:
                  [ { type: "BreakStatement", label: null },
                    { type: "ExpressionStatement",
                      expression: { type: "IdentifierExpression", name: "there" } } ] } },
        test: { type: "LiteralBooleanExpression", value: true } }
    );

    testParse("while (true) { break // Comment\nthere; }", stmt,
      { type: "WhileStatement",
        body:
          { type: "BlockStatement",
            block:
              { type: "Block",
                statements:
                  [ { type: "BreakStatement", label: null },
                    { type: "ExpressionStatement",
                      expression:
                        { type: "IdentifierExpression", name: "there" } } ] } },
        test: { type: "LiteralBooleanExpression", value: true } }
    );

    testParse("while (true) { break /* Multiline\nComment */there; }", stmt,
      { type: "WhileStatement",
        body:
          { type: "BlockStatement",
            block:
              { type: "Block",
                statements:
                  [ { type: "BreakStatement", label: null },
                    { type: "ExpressionStatement",
                      expression: { type: "IdentifierExpression", name: "there" } } ] } },
        test: { type: "LiteralBooleanExpression", value: true } }
    );

    testParse("0 ;", expr, { type: "LiteralNumericExpression", value: 0 });


    testParse("(function(){ return\nx; })", expr,
      { type: "FunctionExpression",
        isGenerator: false,
        name: null,
        params: { type: "FormalParameters", items: [], rest: null },
        body: {
          type: "FunctionBody",
          directives: [],
          statements: [{ type: "ReturnStatement", expression: null }, {
            type: "ExpressionStatement",
            expression: { type: "IdentifierExpression", name: "x" }
          }]
        }
      }
    );

    testParse("(function(){ return // Comment\nx; })", expr,
      { type: "FunctionExpression",
        isGenerator: false,
        name: null,
        params: { type: "FormalParameters", items: [], rest: null },
        body: {
          type: "FunctionBody",
          directives: [],
          statements: [{ type: "ReturnStatement", expression: null }, {
            type: "ExpressionStatement",
            expression: { type: "IdentifierExpression", name: "x" }
          }]
        }
      }
    );
    testParse("(function(){ return/* Multiline\nComment */x; })", expr,
      { type: "FunctionExpression",
        isGenerator: false,
        name: null,
        params: { type: "FormalParameters", items: [], rest: null },
        body: {
          type: "FunctionBody",
          directives: [],
          statements: [{ type: "ReturnStatement", expression: null }, {
            type: "ExpressionStatement",
            expression: { type: "IdentifierExpression", name: "x" }
          }]
        }
      }
    );

    testParse("{ throw error\nerror; }", stmt,
      { type: "BlockStatement",
        block:
          { type: "Block",
            statements:
              [ { type: "ThrowStatement",
                  expression: { type: "IdentifierExpression", name: "error" } },
                { type: "ExpressionStatement",
                  expression: { type: "IdentifierExpression", name: "error" } } ] } }
    );

    testParse("{ throw error// Comment\nerror; }", stmt,
      { type: "BlockStatement",
        block:
          { type: "Block",
            statements:
              [ { type: "ThrowStatement",
                  expression: { type: "IdentifierExpression", name: "error" } },
                { type: "ExpressionStatement",
                  expression: { type: "IdentifierExpression", name: "error" } } ] } }
    );

    testParse("{ throw error/* Multiline\nComment */error; }", stmt,
      { type: "BlockStatement",
        block:
          { type: "Block",
            statements:
              [ { type: "ThrowStatement",
                  expression: { type: "IdentifierExpression", name: "error" } },
                { type: "ExpressionStatement",
                  expression: { type: "IdentifierExpression", name: "error" } } ] } }
    );

    testParseFailure("throw /* \n */ e", "Illegal newline after throw");
    testParseFailure("throw /* \u2028 */ e", "Illegal newline after throw");
    testParseFailure("throw /* \u2029 */ e", "Illegal newline after throw");

    testParse("throw /* \u202a */ e", stmt,
      { type: "ThrowStatement",
        expression: { type: "IdentifierExpression", name: "e" } }
    );

  });

  suite("whitespace characters", function () {

    testParse("new\u0020\u0009\u000B\u000C\u00A0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\uFEFFa", expr,
      { type: "NewExpression",
        callee: { type: "IdentifierExpression", name: "a" },
        arguments: [] }
    );

    testParse("{0\n1\r2\u20283\u20294}", stmt,
      { type: "BlockStatement",
        block:
          { type: "Block",
            statements:
              [ { type: "ExpressionStatement", expression: { type: "LiteralNumericExpression", value: 0 } },
                { type: "ExpressionStatement", expression: { type: "LiteralNumericExpression", value: 1 } },
                { type: "ExpressionStatement", expression: { type: "LiteralNumericExpression", value: 2 } },
                { type: "ExpressionStatement", expression: { type: "LiteralNumericExpression", value: 3 } },
                { type: "ExpressionStatement", expression: { type: "LiteralNumericExpression", value: 4 } } ] } }
    );

  });
});
