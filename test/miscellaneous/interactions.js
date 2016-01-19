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
var testParseFailure = require("../assertions").testParseFailure;
var testParse = require("../assertions").testParse;

function id(x) {
  return x;
}

suite("Parser", function () {
  suite("interactions", function () {
    // LiteralNumericExpression and StaticMemberExpression

    testParse("0 .toString", expr,
      { type: "StaticMemberExpression", object: { type: "LiteralNumericExpression", value: 0 }, property: "toString" }
    );

    testParse("0.0.toString", expr,
      { type: "StaticMemberExpression", object: { type: "LiteralNumericExpression", value: 0 }, property: "toString" }
    );

    testParse("0..toString", expr,
      { type: "StaticMemberExpression", object: { type: "LiteralNumericExpression", value: 0 }, property: "toString" }
    );

    testParse("01.toString", expr,
      { type: "StaticMemberExpression", object: { type: "LiteralNumericExpression", value: 1 }, property: "toString" }
    );

    testParseFailure("0.toString", "Unexpected \"t\"");

    // LeftHandSideExpressions

    testParse("a.b(b, c)", expr,
      {
        type: "CallExpression",
        callee: { type: "StaticMemberExpression", object: { type: "IdentifierExpression", name: "a" }, property: "b" },
        arguments: [{ type: "IdentifierExpression", name: "b" }, { type: "IdentifierExpression", name: "c" }]
      }
    );

    testParse("a[b](b,c)", expr,
      { type: "CallExpression",
        callee:
         { type: "ComputedMemberExpression",
           object: { type: "IdentifierExpression", name: "a" },
           expression: { type: "IdentifierExpression", name: "b" } },
        arguments:
         [ { type: "IdentifierExpression", name: "b" },
           { type: "IdentifierExpression", name: "c" } ] }
    );


    testParse("new foo().bar()", expr,
      {
        type: "CallExpression",
        callee: {
          type: "StaticMemberExpression",
          object: { type: "NewExpression", callee: { type: "IdentifierExpression", name: "foo" }, arguments: [] },
          property: "bar"
        },
        arguments: []
      }
    );

    testParse("new foo[bar]", expr,
      { type: "NewExpression",
        callee:
          { type: "ComputedMemberExpression",
            object: { type: "IdentifierExpression", name: "foo" },
            expression: { type: "IdentifierExpression", name: "bar" } },
        arguments: [] }
    );


    testParse("new foo.bar()", expr,
      {
        type: "NewExpression",
        callee: {
          type: "StaticMemberExpression",
          object: { type: "IdentifierExpression", name: "foo" },
          property: "bar"
        },
        arguments: []
      }
    );

    testParse("(new foo).bar()", expr,
      {
        type: "CallExpression",
        callee: {
          type: "StaticMemberExpression",
          object: { type: "NewExpression", callee: { type: "IdentifierExpression", name: "foo" }, arguments: [] },
          property: "bar"
        },
        arguments: []
      }
    );

    testParse("a[0].b", expr,
      {
        type: "StaticMemberExpression",
        object: {
          type: "ComputedMemberExpression",
          object: { type: "IdentifierExpression", name: "a" },
          expression: { type: "LiteralNumericExpression", value: 0 }
        },
        property: "b"
      }
    );

    testParse("a(0).b", expr,
      {
        type: "StaticMemberExpression",
        object: {
          type: "CallExpression",
          callee: { type: "IdentifierExpression", name: "a" },
          arguments: [{ type: "LiteralNumericExpression", value: 0 }]
        },
        property: "b"
      }
    );

    testParse("a(0).b(14, 3, 77).c", expr,
      {
        type: "StaticMemberExpression",
        object: {
          type: "CallExpression",
          callee: {
            type: "StaticMemberExpression",
            object: {
              type: "CallExpression",
              callee: { type: "IdentifierExpression", name: "a" },
              arguments: [{ type: "LiteralNumericExpression", value: 0 }]
            },
            property: "b"
          },
          arguments: [{ type: "LiteralNumericExpression", value: 14 }, {
            type: "LiteralNumericExpression",
            value: 3
          }, { type: "LiteralNumericExpression", value: 77 }]
        },
        property: "c"
      }
    );

    testParse("a.b.c(2014)", expr,
      {
        type: "CallExpression",
        callee: {
          type: "StaticMemberExpression",
          object: {
            type: "StaticMemberExpression",
            object: { type: "IdentifierExpression", name: "a" },
            property: "b"
          },
          property: "c"
        },
        arguments: [{ type: "LiteralNumericExpression", value: 2014 }]
      }
    );

    // BinaryExpressions
    testParse("a || b && c | d ^ e & f == g < h >>> i + j * k", expr,
      { type: "BinaryExpression",
        operator: "||",
        left: { type: "IdentifierExpression", name: "a" },
        right:
          { type: "BinaryExpression",
            operator: "&&",
            left: { type: "IdentifierExpression", name: "b" },
            right:
              { type: "BinaryExpression",
                operator: "|",
                left: { type: "IdentifierExpression", name: "c" },
                right:
                  { type: "BinaryExpression",
                    operator: "^",
                    left: { type: "IdentifierExpression", name: "d" },
                    right:
                      { type: "BinaryExpression",
                        operator: "&",
                        left: { type: "IdentifierExpression", name: "e" },
                        right:
                          { type: "BinaryExpression",
                            operator: "==",
                            left: { type: "IdentifierExpression", name: "f" },
                            right:
                              { type: "BinaryExpression",
                                operator: "<",
                                left: { type: "IdentifierExpression", name: "g" },
                                right:
                                  { type: "BinaryExpression",
                                    operator: ">>>",
                                    left: { type: "IdentifierExpression", name: "h" },
                                    right:
                                      { type: "BinaryExpression",
                                        operator: "+",
                                        left: { type: "IdentifierExpression", name: "i" },
                                        right:
                                          { type: "BinaryExpression",
                                            operator: "*",
                                            left: { type: "IdentifierExpression", name: "j" },
                                            right: { type: "IdentifierExpression", name: "k" } } } } } } } } } } }
    );


    // Comments
    testParse("//\n;a;", id,
      { type: "Script",
        directives: [],
        statements:
          [ { type: "EmptyStatement" },
            { type: "ExpressionStatement",
              expression: { type: "IdentifierExpression", name: "a" } } ] }
    );

    testParse("/* block comment */ 0", expr,
      { type: "LiteralNumericExpression", value: 0 }
    );

    testParse("0 /* block comment 1 */ /* block comment 2 */", id,
      { type: "Script",
        directives: [],
        statements:
          [ { type: "ExpressionStatement", expression: { type: "LiteralNumericExpression", value: 0 } } ] }
    );

    testParse("(a + /* assignment */b ) * c", expr,
      { type: "BinaryExpression",
        operator: "*",
        left:
          { type: "BinaryExpression",
            operator: "+",
            left: { type: "IdentifierExpression", name: "a" },
            right: { type: "IdentifierExpression", name: "b" } },
        right: { type: "IdentifierExpression", name: "c" } }
    );

    testParse("/* assignment */\n a = b", expr,
      {
        type: "AssignmentExpression",
        binding: { type: "BindingIdentifier", name: "a" },
        expression: { type: "IdentifierExpression", name: "b" }
      }
    );

    testParse("0 /*The*/ /*Answer*/", expr, { type: "LiteralNumericExpression", value: 0 });
    testParse("0 /*the*/ /*answer*/", expr, { type: "LiteralNumericExpression", value: 0 });
    testParse("0 /* the * answer */", expr, { type: "LiteralNumericExpression", value: 0 });
    testParse("0 /* The * answer */", expr, { type: "LiteralNumericExpression", value: 0 });
    testParse("/* multiline\ncomment\nshould\nbe\nignored */ 0", expr,
      { type: "LiteralNumericExpression", value: 0 }
    );
    testParse("/*a\r\nb*/ 0", expr, { type: "LiteralNumericExpression", value: 0 });
    testParse("/*a\rb*/ 0", expr, { type: "LiteralNumericExpression", value: 0 });
    testParse("/*a\nb*/ 0", expr, { type: "LiteralNumericExpression", value: 0 });
    testParse("/*a\nc*/ 0", expr, { type: "LiteralNumericExpression", value: 0 });
    testParse("// line comment\n0", expr, { type: "LiteralNumericExpression", value: 0 });
    testParse("0 // line comment", expr, { type: "LiteralNumericExpression", value: 0 });
    testParse("// Hello, world!\n0", expr, { type: "LiteralNumericExpression", value: 0 });

    testParse("// Hello, world!\n", id,
      { type: "Script", directives: [], statements: [] }
    );

    testParse("// Hallo, world!\n", id,
      { type: "Script", directives: [], statements: [] }
    );

    testParse("//\n0", expr, { type: "LiteralNumericExpression", value: 0 });

    testParse("//", id,
      { type: "Script", directives: [], statements: [] }
    );

    testParse("// ", id,
      { type: "Script", directives: [], statements: [] }
    );

    testParse("/**/0", expr, { type: "LiteralNumericExpression", value: 0 });
    testParse("0/**/", expr, { type: "LiteralNumericExpression", value: 0 });
    testParse("// Hello, world!\n\n//   Another hello\n0", expr,
      { type: "LiteralNumericExpression", value: 0 }
    );

    testParse("if (x) { doThat() // Some comment\n }", stmt,
      { type: "IfStatement",
        test: { type: "IdentifierExpression", name: "x" },
        consequent:
          { type: "BlockStatement",
            block:
              { type: "Block",
                statements:
                  [ { type: "ExpressionStatement",
                      expression:
                        { type: "CallExpression",
                          callee: { type: "IdentifierExpression", name: "doThat" },
                          arguments: [] } } ] } },
        alternate: null }
    );

    testParse("if (x) { // Some comment\ndoThat(); }", stmt,
      { type: "IfStatement",
        test: { type: "IdentifierExpression", name: "x" },
        consequent:
          { type: "BlockStatement",
            block:
              { type: "Block",
                statements:
                  [ { type: "ExpressionStatement",
                      expression:
                        { type: "CallExpression",
                          callee: { type: "IdentifierExpression", name: "doThat" },
                          arguments: [] } } ] } },
        alternate: null }
    );

    testParse("if (x) { /* Some comment */ doThat() }", stmt,
      { type: "IfStatement",
        test: { type: "IdentifierExpression", name: "x" },
        consequent:
          { type: "BlockStatement",
            block:
              { type: "Block",
                statements:
                  [ { type: "ExpressionStatement",
                      expression:
                        { type: "CallExpression",
                          callee: { type: "IdentifierExpression", name: "doThat" },
                          arguments: [] } } ] } },
        alternate: null }
    );

    testParse("if (x) { doThat() /* Some comment */ }", stmt,
      { type: "IfStatement",
        test: { type: "IdentifierExpression", name: "x" },
        consequent:
          { type: "BlockStatement",
            block:
              { type: "Block",
                statements:
                  [ { type: "ExpressionStatement",
                      expression:
                        { type: "CallExpression",
                          callee: { type: "IdentifierExpression", name: "doThat" },
                          arguments: [] } } ] } },
        alternate: null }
    );

    testParse("switch (answer) { case 0: /* perfect */ bingo() }", stmt,
      { type: "SwitchStatement",
        discriminant: { type: "IdentifierExpression", name: "answer" },
        cases:
          [ { type: "SwitchCase",
              test: { type: "LiteralNumericExpression", value: 0 },
              consequent:
                [ { type: "ExpressionStatement",
                    expression:
                      { type: "CallExpression",
                        callee: { type: "IdentifierExpression", name: "bingo" },
                        arguments: [] } } ] } ] }
    );

    testParse("switch (answer) { case 0: bingo() /* perfect */ }", stmt,
      { type: "SwitchStatement",
        discriminant: { type: "IdentifierExpression", name: "answer" },
        cases:
          [ { type: "SwitchCase",
              test: { type: "LiteralNumericExpression", value: 0 },
              consequent:
                [ { type: "ExpressionStatement",
                    expression:
                      { type: "CallExpression",
                        callee: { type: "IdentifierExpression", name: "bingo" },
                        arguments: [] } } ] } ] }
    );

    testParse("/* header */ (function(){ var version = 1; }).call(this)", expr,
      {
        type: "CallExpression",
        callee: {
          type: "StaticMemberExpression",
          object: {
            type: "FunctionExpression",
            isGenerator: false,
            name: null,
            params: { type: "FormalParameters", items: [], rest: null },
            body: {
              type: "FunctionBody",
              directives: [],
              statements: [{
                type: "VariableDeclarationStatement",
                declaration: {
                  type: "VariableDeclaration",
                  kind: "var",
                  declarators: [{
                    type: "VariableDeclarator",
                    binding: { type: "BindingIdentifier", name: "version" },
                    init: { type: "LiteralNumericExpression", value: 1 }
                  }]
                }
              }]
            }
          },
          property: "call"
        },
        arguments: [{ type: "ThisExpression" }]
      }
    );

    testParse("(function(){ var version = 1; /* sync */ }).call(this)", expr,
      {
        type: "CallExpression",
        callee: {
          type: "StaticMemberExpression",
          object: {
            type: "FunctionExpression",
            isGenerator: false,
            name: null,
            params: { type: "FormalParameters", items: [], rest: null },
            body: {
              type: "FunctionBody",
              directives: [],
              statements: [{
                type: "VariableDeclarationStatement",
                declaration: {
                  type: "VariableDeclaration",
                  kind: "var",
                  declarators: [{
                    type: "VariableDeclarator",
                    binding: { type: "BindingIdentifier", name: "version" },
                    init: { type: "LiteralNumericExpression", value: 1 }
                  }]
                }
              }]
            }
          },
          property: "call"
        },
        arguments: [{ type: "ThisExpression" }]
      }
    );
    testParse("function f() { /* infinite */ while (true) { } /* bar */ var each; }", stmt,
      { type: "FunctionDeclaration",
        isGenerator: false,
        name: { type: "BindingIdentifier", name: "f" },
        params: { type: "FormalParameters", items: [], rest: null },
        body: {
          type: "FunctionBody",
          directives: [],
          statements: [{
            type: "WhileStatement",
            test: { type: "LiteralBooleanExpression", value: true },
            body: { type: "BlockStatement", block: { type: "Block", statements: [] } }
          }, {
            type: "VariableDeclarationStatement",
            declaration: {
              type: "VariableDeclaration",
              kind: "var",
              declarators: [{
                type: "VariableDeclarator",
                binding: { type: "BindingIdentifier", name: "each" },
                init: null
              }]
            }
          }]
        }
      }
    );

    testParse("while (i-->0) {}", stmt,
      { type: "WhileStatement",
        body: { type: "BlockStatement", block: { type: "Block", statements: [] } },
        test:
         { type: "BinaryExpression",
           operator: ">",
           left:
            { type: "UpdateExpression",
              isPrefix: false,
              operand: { type: "BindingIdentifier", name: "i" },
              operator: "--" },
           right: { type: "LiteralNumericExpression", value: 0 } } }
    );

    testParse("var x = 1<!--foo", stmt,
      {
        type: "VariableDeclarationStatement",
        declaration: {
          type: "VariableDeclaration",
          kind: "var",
          declarators: [{
            type: "VariableDeclarator",
            binding: { type: "BindingIdentifier", name: "x" },
            init: { type: "LiteralNumericExpression", value: 1 }
          }]
        }
      }
    );

    testParse("/* not comment*/; i-->0", id,
      { type: "Script",
        directives: [],
        statements:
          [ { type: "EmptyStatement" },
            { type: "ExpressionStatement",
              expression:
                { type: "BinaryExpression",
                  operator: ">",
                  left:
                    { type: "UpdateExpression",
                      isPrefix: false,
                      operand: { type: "BindingIdentifier", name: "i" },
                      operator: "--" },
                  right: { type: "LiteralNumericExpression", value: 0 } } } ] }
    );

    // super-properties can be the target of destructuring assignment

    testParse("class A extends B { a() { [super.b] = c } }", stmt,
      { type: "ClassDeclaration",
        name: { type: "BindingIdentifier", name: "A" },
        super: { type: "IdentifierExpression", name: "B" },
        elements: [
          { type: "ClassElement",
            isStatic: false,
            method:
              { type: "Method",
                isGenerator: false,
                name: { type: "StaticPropertyName", value: "a" },
                params: { type: "FormalParameters", items: [], rest: null },
                body:
                  { type: "FunctionBody",
                    directives: [],
                    statements: [
                      { type: "ExpressionStatement",
                        expression:
                          { type: "AssignmentExpression",
                            binding:
                              { type: "ArrayBinding",
                                elements: [
                                  { type: "StaticMemberExpression",
                                    object: { type: "Super" },
                                    property: "b"
                                  }
                                ],
                                restElement: null
                              },
                            expression: { type: "IdentifierExpression", name: "c" }
                          }
                      }
                    ]
                  }
              }
          }
        ]
      }
    )

    testParse("class A extends B { a() { ({b: super[c]}) = d } }", stmt,
      { type: "ClassDeclaration",
        name: { type: "BindingIdentifier", name: "A" },
        super: { type: "IdentifierExpression", name: "B" },
        elements: [
          { type: "ClassElement",
            isStatic: false,
            method:
              { type: "Method",
                isGenerator: false,
                name: { type: "StaticPropertyName", value: "a" },
                params: { type: "FormalParameters", items: [], rest: null },
                body:
                  { type: "FunctionBody",
                    directives: [],
                    statements: [
                      { type: "ExpressionStatement",
                        expression:
                          { type: "AssignmentExpression",
                            binding:
                              { type: "ObjectBinding",
                                properties: [
                                  { type: "BindingPropertyProperty",
                                    name: { type: "StaticPropertyName", value: "b" },
                                    binding:
                                      { type: "ComputedMemberExpression",
                                        object: { type: "Super" },
                                        expression: { type: "IdentifierExpression", name: "c" }
                                      }
                                  }
                                ]
                              },
                            expression: { type: "IdentifierExpression", name: "d" }
                          }
                      }
                    ]
                  }
              }
          }
        ]
      }
    )

  });
});
