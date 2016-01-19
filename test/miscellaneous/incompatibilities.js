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
var testParseModule = require("../assertions").testParseModule;
var testParseModuleFailure = require("../assertions").testParseModuleFailure;

function moduleExpr(m) {
  return m.items[0].expression;
}

suite("Parser", function() {

  // programs that parse according to ES3 but either fail or parse differently according to ES5
  suite("ES5 backward incompatibilities", function() {
    // ES3: zero-width non-breaking space is allowed in an identifier
    // ES5: zero-width non-breaking space is a whitespace character
    testParseFailure("_\uFEFF_", "Unexpected identifier");

    // ES3: a slash in a regexp character class will terminate the regexp
    // ES5: a slash is allowed within a regexp character class
    testParseFailure("[/[/]", "Invalid regular expression: missing /");
  });


  // programs where we choose to diverge from the ES5 specification
  suite("ES5 divergences", function() {
    // ES5: assignment to computed member expression
    // ES6: variable declaration statement
    testParse("let[a] = b;", stmt,
      {
        type: "VariableDeclarationStatement",
        declaration: {
          type: "VariableDeclaration",
          kind: "let",
          declarators: [{
            type: "VariableDeclarator",
            binding: { type: "ArrayBinding", elements: [{ type: "BindingIdentifier", name: "a" }], restElement: null },
            init: { type: "IdentifierExpression", name: "b" }
          }]
        }
      }
    );

    testParse("const[a] = b;", stmt,
      {
        type: "VariableDeclarationStatement",
        declaration: {
          type: "VariableDeclaration",
          kind: "const",
          declarators: [{
            type: "VariableDeclarator",
            binding: { type: "ArrayBinding", elements: [{ type: "BindingIdentifier", name: "a" }], restElement: null },
            init: { type: "IdentifierExpression", name: "b" }
          }]
        }
      }
    );

    // ES5: invalid program
    // ES6: function declaration within a block
    testParse("{ function f(){} }", stmt,
      {
        type: "BlockStatement",
        block: {
          type: "Block",
          statements: [{
            type: "FunctionDeclaration",
            isGenerator: false,
            name: { type: "BindingIdentifier", name: "f" },
            params: { type: "FormalParameters", items: [], rest: null },
            body: { type: "FunctionBody", directives: [], statements: [] }
          }]
        }
      }
    );
  });


  // programs that parse according to ES5 but either fail or parse differently according to ES6
  suite("ES6 backward incompatibilities", function() {
    // ES5: in sloppy mode, future reserved words (including yield) are regular identifiers
    // ES6: yield has been moved from the future reserved words list to the keywords list
    testParse("var yield = function yield(){};", stmt,
      {
        type: "VariableDeclarationStatement",
        declaration: {
          type: "VariableDeclaration",
          kind: "var",
          declarators: [{
            type: "VariableDeclarator",
            binding: { type: "BindingIdentifier", name: "yield" },
            init: {
              type: "FunctionExpression",
              isGenerator: false,
              name: { type: "BindingIdentifier", name: "yield" },
              params: { type: "FormalParameters", items: [], rest: null },
              body: { type: "FunctionBody", directives: [], statements: [] }
            }
          }]
        }
      }
    );

    // ES5: this declares a function-scoped variable while at the same time assigning to the block-scoped variable
    // ES6: this particular construction is explicitly disallowed
    testParse("try {} catch(e) { var e = 0; }", stmt,
      {
        type: "TryCatchStatement",
        body: { type: "Block", statements: [] },
        catchClause: {
          type: "CatchClause",
          binding: { type: "BindingIdentifier", name: "e" },
          body: {
            type: "Block",
            statements: [{
              type: "VariableDeclarationStatement",
              declaration: {
                type: "VariableDeclaration",
                kind: "var",
                declarators: [{
                  type: "VariableDeclarator",
                  binding: { type: "BindingIdentifier", name: "e" },
                  init: { type: "LiteralNumericExpression", value: 0 }
                }]
              }
            }]
          }
        }
      }
    );

    // ES5: allows any LeftHandSideExpression on the left of an assignment
    // ES6: allows only valid bindings on the left of an assignment
    // NOTE: this is disabled due to separation of early errors in two-phase parsing
    //testParseFailure("a+b=c", "Invalid left-hand side in assignment");
    //testParseFailure("+i = 0", "Invalid left-hand side in assignment");
    //testParseFailure("new a=b", "Invalid left-hand side in assignment");
    //testParseFailure("(a+b)=c", "Invalid left-hand side in assignment");
    //testParseFailure("f()++", "Invalid left-hand side in assignment");
    //testParseFailure("--f()", "Invalid left-hand side in assignment");

    // ES5: allows initializers in for-in head
    // ES6: disallows initializers in for-in and for-of head
    testParseFailure("for(var x=1 in [1,2,3]) 0", "Invalid variable declaration in for-in statement");
    testParseFailure("for(let x=1 in [1,2,3]) 0", "Invalid variable declaration in for-in statement");
    testParseFailure("for(var x=1 of [1,2,3]) 0", "Invalid variable declaration in for-of statement");
    testParseFailure("for(let x=1 of [1,2,3]) 0", "Invalid variable declaration in for-of statement");

    testParse("for(var x in [1,2]) 0", stmt, {
      type: "ForInStatement",
      left: {
        type: "VariableDeclaration",
        kind: "var",
        declarators: [{ type: "VariableDeclarator", binding: { type: "BindingIdentifier", name: "x" }, init: null }]
      },
      right: {
        type: "ArrayExpression",
        elements: [{ type: "LiteralNumericExpression", value: 1 }, { type: "LiteralNumericExpression", value: 2 }]
      },
      body: { type: "ExpressionStatement", expression: { type: "LiteralNumericExpression", value: 0 } }
    });
    testParse("for(let x in [1,2]) 0", stmt, {
      type: "ForInStatement",
      left: {
        type: "VariableDeclaration",
        kind: "let",
        declarators: [{ type: "VariableDeclarator", binding: { type: "BindingIdentifier", name: "x" }, init: null }]
      },
      right: {
        type: "ArrayExpression",
        elements: [{ type: "LiteralNumericExpression", value: 1 }, { type: "LiteralNumericExpression", value: 2 }]
      },
      body: { type: "ExpressionStatement", expression: { type: "LiteralNumericExpression", value: 0 } }
    });
    testParse("for(var x of [1,2]) 0", stmt, {
      type: "ForOfStatement",
      left: {
        type: "VariableDeclaration",
        kind: "var",
        declarators: [{ type: "VariableDeclarator", binding: { type: "BindingIdentifier", name: "x" }, init: null }]
      },
      right: {
        type: "ArrayExpression",
        elements: [{ type: "LiteralNumericExpression", value: 1 }, { type: "LiteralNumericExpression", value: 2 }]
      },
      body: { type: "ExpressionStatement", expression: { type: "LiteralNumericExpression", value: 0 } }
    });
    testParse("for(let x of [1,2]) 0", stmt, {
      type: "ForOfStatement",
      left: {
        type: "VariableDeclaration",
        kind: "let",
        declarators: [{ type: "VariableDeclarator", binding: { type: "BindingIdentifier", name: "x" }, init: null }]
      },
      right: {
        type: "ArrayExpression",
        elements: [{ type: "LiteralNumericExpression", value: 1 }, { type: "LiteralNumericExpression", value: 2 }]
      },
      body: { type: "ExpressionStatement", expression: { type: "LiteralNumericExpression", value: 0 } }
    });

    // ES5: allows unicode escape sequences in regular expression flags
    // ES6: disallowes unicode escape sequences in regular expression flags
    // NOTE: this is disabled due to separation of early errors in two-phase parsing
    //testParseFailure("/a/\\u0000", "Invalid regular expression");

    // ES5: disallow HTML-like comment
    // ES6: allowed in Script.
    testParse("<!--", stmt, undefined);
    testParse("-->", stmt, undefined);
    testParseFailure("a -->", "Unexpected end of input");
    testParseFailure(";/**/-->", "Unexpected token \">\"");
    testParse("\n  -->", stmt, undefined);
    testParse("/*\n*/-->", stmt, undefined);
    testParse("a<!--b", expr, { type: "IdentifierExpression", name: "a" });

    testParseModuleFailure("<!--", "Unexpected token \"<\"");
    testParseModuleFailure("function a(){\n<!--\n}", "Unexpected token \"<\"");
    testParseModuleFailure("-->", "Unexpected token \">\"");
    testParseModuleFailure("function a(){\n-->\n}", "Unexpected token \">\"");

    testParseModule("a<!--b", moduleExpr,
      {
        type: "BinaryExpression",
        operator: "<",
        left: { type: "IdentifierExpression", name: "a" },
        right: {
          type: "UnaryExpression",
          operator: "!",
          operand: { type: "UpdateExpression", isPrefix: true, operator: "--", operand: { type: "BindingIdentifier", name: "b" } }
        }
      }
    );

  });

});
