import { parse, expand } from "../src/sweet";
import expect from "expect.js";
import { expr, stmt, testParse } from "./assertions";

describe("parsing function declarations", function() {

    it("should handle a function declaration", function() {
        testParse("function id(x) { }", stmt, {
            "type": "FunctionDeclaration",
            "loc": null,
            "name": {
                "type": "BindingIdentifier",
                "loc": null,
                "name": "id"
            },
            "isGenerator": false,
            "params":{
                "type": "FormalParameters",
                "loc": null,
                "rest": null,
                "items": [{
                    "type": "BindingIdentifier",
                    "loc": null,
                    "name": "x"
                }]
            },
            "body": {
                "type": "FunctionBody",
                "loc": null,
                "directives": [],
                "statements": []
            }
        });
    });

    it("should handle a generator function declaration", function() {
        testParse("function * id(x) {}", stmt, {
            "type": "FunctionDeclaration",
            "loc": null,
            "name": {
                "type": "BindingIdentifier",
                "loc": null,
                "name": "id"
            },
            "isGenerator": true,
            "params":{
                "type": "FormalParameters",
                "loc": null,
                "rest": null,
                "items": [{
                    "type": "BindingIdentifier",
                    "loc": null,
                    "name": "x"
                }]
            },
            "body": {
                "type": "FunctionBody",
                "loc": null,
                "directives": [],
                "statements": []
            }
        });
    });


    it("should throw an error for a bad return statement", function() {
        expect(() => parse("function foo() { return return }")).to.throwError();
    });
});

describe("parsing variable declarations", function() {

    it("should thrown an error for a bad var decl", function() {
        expect(() => parse("var 42")).to.throwError();
    });

    it("should handle a var declaration", function() {
        testParse("var x", stmt, {
            "type": "VariableDeclaration",
            "loc": null,
            "kind": "var",
            "declarators": [{
                "type": "VariableDeclarator",
                "loc": null,
                "binding": {
                    "loc": null,
                    "type": "BindingIdentifier",
                    "name": "x"
                },
                "init": null
            }]
        });

        testParse("var x = 42", stmt, {
            "type": "VariableDeclaration",
            "loc": null,
            "kind": "var",
            "declarators": [{
                "type": "VariableDeclarator",
                "loc": null,
                "binding": {
                    "loc": null,
                    "type": "BindingIdentifier",
                    "name": "x"
                },
                "init": {
                    "loc": null,
                    "type": "LiteralNumericExpression",
                    "value": 42
                }
            }]
        });

        testParse("var x = 42, y = 42 + 24", stmt, {
            "type": "VariableDeclaration",
            "loc": null,
            "kind": "var",
            "declarators": [{
                "type": "VariableDeclarator",
                "loc": null,
                "binding": {
                    "loc": null,
                    "type": "BindingIdentifier",
                    "name": "x"
                },
                "init": {
                    "loc": null,
                    "type": "LiteralNumericExpression",
                    "value": 42
                }
            }, {
                "type": "VariableDeclarator",
                "loc": null,
                "binding": {
                    "loc": null,
                    "type": "BindingIdentifier",
                    "name": "y"
                },
                "init": {
                    "loc": null,
                    "type": "BinaryExpression",
                    "left": {
                        "loc": null,
                        "type": "LiteralNumericExpression",
                        "value": 42
                    },
                    "operator": "+",
                    "right": {
                        "loc": null,
                        "type": "LiteralNumericExpression",
                        "value": 24
                    }
                }
            }]
        }
        );

        testParse("let x = 42, y = 42 + 24", stmt, {
            "type": "VariableDeclaration",
            "loc": null,
            "kind": "let",
            "declarators": [{
                "type": "VariableDeclarator",
                "loc": null,
                "binding": {
                    "loc": null,
                    "type": "BindingIdentifier",
                    "name": "x"
                },
                "init": {
                    "loc": null,
                    "type": "LiteralNumericExpression",
                    "value": 42
                }
            }, {
                "type": "VariableDeclarator",
                "loc": null,
                "binding": {
                    "loc": null,
                    "type": "BindingIdentifier",
                    "name": "y"
                },
                "init": {
                    "loc": null,
                    "type": "BinaryExpression",
                    "left": {
                        "loc": null,
                        "type": "LiteralNumericExpression",
                        "value": 42
                    },
                    "operator": "+",
                    "right": {
                        "loc": null,
                        "type": "LiteralNumericExpression",
                        "value": 24
                    }
                }
            }]
        });

        testParse("const x = 42, y = 42 + 24", stmt, {
            "type": "VariableDeclaration",
            "loc": null,
            "kind": "const",
            "declarators": [{
                "type": "VariableDeclarator",
                "loc": null,
                "binding": {
                    "loc": null,
                    "type": "BindingIdentifier",
                    "name": "x"
                },
                "init": {
                    "loc": null,
                    "type": "LiteralNumericExpression",
                    "value": 42
                }
            }, {
                "type": "VariableDeclarator",
                "loc": null,
                "binding": {
                    "loc": null,
                    "type": "BindingIdentifier",
                    "name": "y"
                },
                "init": {
                    "loc": null,
                    "type": "BinaryExpression",
                    "left": {
                        "loc": null,
                        "type": "LiteralNumericExpression",
                        "value": 42
                    },
                    "operator": "+",
                    "right": {
                        "loc": null,
                        "type": "LiteralNumericExpression",
                        "value": 24
                    }
                }
            }]
        });

    });




    it("should throw an error for a bad variable decl expression", function() {
        expect(() => parse("var x = var")).to.throwError();
    });

});

describe("parsing syntax extensions", function() {

    it("should handle a syntax quote", function() {
        testParse("syntaxQuote { foo }", stmt, {
            "type": "ExpressionStatement",
            "loc": null,
            "expression": {
                "loc": null,
                "type": "CallExpression",
                "callee": {
                    "loc": null,
                    "type": "IdentifierExpression",
                    "name": "syntaxQuote"
                },
                "arguments": [
                    {
                        "loc": null,
                        "type": "LiteralStringExpression",
                        "value": "[{\"loc\":null,\"type\":\"SyntaxTerm\",\"stx\":{\"token\":{\"type\":3,\"value\":\"foo\",\"lineNumber\":1,\"lineStart\":0,\"range\":[14,17]},\"scopeset\":[]}}]"
                    }
                ]
            }
        });
    });
});
