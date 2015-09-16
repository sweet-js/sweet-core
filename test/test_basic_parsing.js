import { parse } from "../src/sweet";
import expect from "expect.js";

describe("parser", function() {

    it("should handle a single identifier", function() {
        expect(parse("x")).to.eql({
            "type": "Program",
            "loc": null,
            "body": [
            {
                "type": "ExpressionStatement",
                "loc": null,
                "expression": {
                    "type": "Identifier",
                    "loc": null,
                    "name": "x"
                }
            }
        ]
        });

    });

    it("should handle a literal", function() {
        expect(parse("42;")).to.eql({
                "type": "Program",
                "loc": null,
                "body": [
                    {
                        "type": "ExpressionStatement",
                        "loc": null,
                        "expression": {
                            "type": "Literal",
                            "loc": null,
                            "value": 42
                        }
                    }
                ]
            }
        );
        expect(parse("false;")).to.eql({
                "type": "Program",
                "loc": null,
                "body": [
                    {
                        "type": "ExpressionStatement",
                        "loc": null,
                        "expression": {
                            "type": "Literal",
                            "loc": null,
                            "value": false
                        }
                    }
                ]
            }
        );
        expect(parse("null")).to.eql({
                "type": "Program",
                "loc": null,
                "body": [
                    {
                        "type": "ExpressionStatement",
                        "loc": null,
                        "expression": {
                            "type": "Literal",
                            "loc": null,
                            "value": null
                        }
                    }
                ]
            }
        );
        expect(parse("'foo'")).to.eql({
                "type": "Program",
                "loc": null,
                "body": [
                    {
                        "type": "ExpressionStatement",
                        "loc": null,
                        "expression": {
                            "type": "Literal",
                            "loc": null,
                            "value": "foo"
                        }
                    }
                ]
            }
        );
        expect(parse("/abc/i;")).to.eql({
                "type": "Program",
                "loc": null,
                "body": [
                    {
                        "type": "ExpressionStatement",
                        "loc": null,
                        "expression": {
                            "type": "Literal",
                            "loc": null,
                            "value": {}
                        }
                    }
                ]
            }
        );
    });

    it("should handle a call", function() {
        expect(parse("x()")).to.eql({
                "type": "Program",
                "loc": null,
                "body": [
                    {
                        "type": "ExpressionStatement",
                        "loc": null,
                        "expression": {
                            "type": "CallExpression",
                            "loc": null,
                            "callee": {
                                "type": "Identifier",
                                "loc": null,
                                "name": "x"
                            },
                            "arguments": []
                        }
                    }
                ]
            }
        );
    });

    it("should handle a call with a single arg", function() {
        expect(parse("x(42)")).to.eql({
                "type": "Program",
                "loc": null,
                "body": [
                    {
                        "type": "ExpressionStatement",
                        "loc": null,
                        "expression": {
                            "type": "CallExpression",
                            "loc": null,
                            "callee": {
                                "type": "Identifier",
                                "loc": null,
                                "name": "x"
                            },
                            "arguments": [
                                {
                                    "type": "Literal",
                                    "loc": null,
                                    "value": 42
                                }
                            ]
                        }
                    }
                ]
            }
        );
    });

    it("should handle a call with a multiple args", function() {
        expect(parse("x(42, 24)")).to.eql({
                "type": "Program",
                "loc": null,
                "body": [
                    {
                        "type": "ExpressionStatement",
                        "loc": null,
                        "expression": {
                            "type": "CallExpression",
                            "loc": null,
                            "callee": {
                                "type": "Identifier",
                                "loc": null,
                                "name": "x"
                            },
                            "arguments": [
                                {
                                    "type": "Literal",
                                    "loc": null,
                                    "value": 42
                                },
                                {
                                    "type": "Literal",
                                    "loc": null,
                                    "value": 24
                                }
                            ]
                        }
                    }
                ]
            }
        );
    });

    it("should handle errors with calls", function() {
        expect(() => {
            parse("x(42 24)");
        }).to.throwError();

        expect(() => {
            parse("x(;)");
        }).to.throwError();
    });

    it("should handle a binary expr", function() {
        expect(parse("42 + 24")).to.eql({
                "type": "Program",
                "loc": null,
                "body": [
                    {
                        "type": "ExpressionStatement",
                        "loc": null,
                        "expression": {
                            "type": "BinaryExpression",
                            "loc": null,
                            "left": {
                                "type": "Literal",
                                "loc": null,
                                "value": 42
                            },
                            "operator": "+",
                            "right": {
                                "type": "Literal",
                                "loc": null,
                                "value": 24
                            }
                        }
                    }
                ]
            }
        );

        expect(parse("42 + 24 + 2")).to.eql({
                "type": "Program",
                "loc": null,
                "body": [
                    {
                        "type": "ExpressionStatement",
                        "loc": null,
                        "expression": {
                            "type": "BinaryExpression",
                            "loc": null,
                            "left": {
                                "type": "BinaryExpression",
                                "loc": null,
                                "left": {
                                    "type": "Literal",
                                    "loc": null,
                                    "value": 42
                                },
                                "operator": "+",
                                "right": {
                                    "type": "Literal",
                                    "loc": null,
                                    "value": 24
                                }
                            },
                            "operator": "+",
                            "right": {
                                "type": "Literal",
                                "loc": null,
                                "value": 2
                            }
                        }
                    }
                ]
            }
        );

        expect(parse("42 + 24 * 2")).to.eql({
                "type": "Program",
                "loc": null,
                "body": [
                    {
                        "type": "ExpressionStatement",
                        "loc": null,
                        "expression": {
                            "type": "BinaryExpression",
                            "loc": null,
                            "left": {
                                "type": "Literal",
                                "loc": null,
                                "value": 42
                            },
                            "operator": "+",
                            "right": {
                                "type": "BinaryExpression",
                                "loc": null,
                                "left": {
                                    "type": "Literal",
                                    "loc": null,
                                    "value": 24
                                },
                                "operator": "*",
                                "right": {
                                    "type": "Literal",
                                    "loc": null,
                                    "value": 2
                                }
                            }
                        }
                    }
                ]
            }
        );

        expect(parse("42 * 24 + 2")).to.eql({
                "type": "Program",
                "loc": null,
                "body": [
                    {
                        "type": "ExpressionStatement",
                        "loc": null,
                        "expression": {
                            "type": "BinaryExpression",
                            "loc": null,
                            "left": {
                                "type": "BinaryExpression",
                                "loc": null,
                                "left": {
                                    "type": "Literal",
                                    "loc": null,
                                    "value": 42
                                },
                                "operator": "*",
                                "right": {
                                    "type": "Literal",
                                    "loc": null,
                                    "value": 24
                                }
                            },
                            "operator": "+",
                            "right": {
                                "type": "Literal",
                                "loc": null,
                                "value": 2
                            }
                        }
                    }
                ]
            }
        );

        expect(parse("42 * (24 + 2)")).to.eql({
                "type": "Program",
                "loc": null,
                "body": [
                    {
                        "type": "ExpressionStatement",
                        "loc": null,
                        "expression": {
                            "type": "BinaryExpression",
                            "loc": null,
                            "left": {
                                "type": "Literal",
                                "loc": null,
                                "value": 42
                            },
                            "operator": "*",
                            "right": {
                                "type": "BinaryExpression",
                                "loc": null,
                                "left": {
                                    "type": "Literal",
                                    "loc": null,
                                    "value": 24
                                },
                                "operator": "+",
                                "right": {
                                    "type": "Literal",
                                    "loc": null,
                                    "value": 2
                                }
                            }
                        }
                    }
                ]
            }
        );
    });

    it("should handle a function expression", function() {
        expect(parse("(function(x) { });")).to.eql({
                "type": "Program",
                "loc": null,
                "body": [
                    {
                        "type": "ExpressionStatement",
                        "loc": null,
                        "expression": {
                            "type": "FunctionExpression",
                            "loc": null,
                            "id": null,
                            "params": [
                                {
                                    "type": "Identifier",
                                    "loc": null,
                                    "name": "x"
                                }
                            ],
                            "body": {
                                "type": "BlockStatement",
                                "loc": null,
                                "body": []
                            }
                        }
                    }
                ]
            }
        );
    });

    it("should handle a named function expression", function() {
        expect(parse("(function x(x) { });")).to.eql({
            "type": "Program",
            "loc": null,
            "body": [
                {
                    "type": "ExpressionStatement",
                    "loc": null,
                    "expression": {
                        "type": "FunctionExpression",
                        "loc": null,
                        "id": {
                            "type": "Identifier",
                            "loc": null,
                            "name": "x"
                        },
                        "params": [
                            {
                                "type": "Identifier",
                                "loc": null,
                                "name": "x"
                            }
                        ],
                        "body": {
                            "type": "BlockStatement",
                            "loc": null,
                            "body": []
                        }
                    }
                }
            ]
        });
    });

    it("should handle a function declaration", function() {
        expect(parse("function id(x) { }")).to.eql({
                "type": "Program",
                "loc": null,
                "body": [
                    {
                        "type": "FunctionDeclaration",
                        "loc": null,
                        "id": {
                            "type": "Identifier",
                            "loc": null,
                            "name": "id"
                        },
                        "params": [
                            {
                                "type": "Identifier",
                                "loc": null,
                                "name": "x"
                            }
                        ],
                        "body": {
                            "type": "BlockStatement",
                            "loc": null,
                            "body": []
                        }
                    }
                ]
            }
        );
    });

    it("should throw an error for a bad return statement", function() {
        expect(() => parse("function foo() { return return }")).to.throwError();
    });

    it("should thrown an error for a bad var decl", function() {
        expect(() => parse("var 42")).to.throwError();
    });

    it("should handle a var declaration", function() {
        expect(parse("var x")).to.eql({
                "type": "Program",
                "loc": null,
                "body": [
                    {
                        "type": "VariableDeclaration",
                        "loc": null,
                        "declarations": [
                            {
                                "type": "VariableDeclarator",
                                "loc": null,
                                "id": {
                                    "type": "Identifier",
                                    "loc": null,
                                    "name": "x"
                                },
                                "init": null
                            }
                        ],
                        "kind": "var"
                    }
                ]
            }
        );
        expect(parse("var x = 42")).to.eql({
                "type": "Program",
                "loc": null,
                "body": [
                    {
                        "type": "VariableDeclaration",
                        "loc": null,
                        "declarations": [
                            {
                                "type": "VariableDeclarator",
                                "loc": null,
                                "id": {
                                    "type": "Identifier",
                                    "loc": null,
                                    "name": "x"
                                },
                                "init": {
                                    "type": "Literal",
                                    "loc": null,
                                    "value": 42
                                }
                            }
                        ],
                        "kind": "var"
                    }
                ]
            }
        );
        expect(parse("var x = 42, y = 42 + 24")).to.eql({
                "type": "Program",
                "loc": null,
                "body": [
                    {
                        "type": "VariableDeclaration",
                        "loc": null,
                        "declarations": [
                            {
                                "type": "VariableDeclarator",
                                "loc": null,
                                "id": {
                                    "type": "Identifier",
                                    "loc": null,
                                    "name": "x"
                                },
                                "init": {
                                    "type": "Literal",
                                    "loc": null,
                                    "value": 42
                                }
                            },
                            {
                                "type": "VariableDeclarator",
                                "loc": null,
                                "id": {
                                    "type": "Identifier",
                                    "loc": null,
                                    "name": "y"
                                },
                                "init": {
                                    "type": "BinaryExpression",
                                    "loc": null,
                                    "left": {
                                        "type": "Literal",
                                        "loc": null,
                                        "value": 42
                                    },
                                    "operator": "+",
                                    "right": {
                                        "type": "Literal",
                                        "loc": null,
                                        "value": 24
                                    }
                                }
                            }
                        ],
                        "kind": "var"
                    }
                ]
            }
        );



        expect(parse("let x = 42, y = 42 + 24")).to.eql({
                "type": "Program",
                "loc": null,
                "body": [
                    {
                        "type": "VariableDeclaration",
                        "loc": null,
                        "declarations": [
                            {
                                "type": "VariableDeclarator",
                                "loc": null,
                                "id": {
                                    "type": "Identifier",
                                    "loc": null,
                                    "name": "x"
                                },
                                "init": {
                                    "type": "Literal",
                                    "loc": null,
                                    "value": 42
                                }
                            },
                            {
                                "type": "VariableDeclarator",
                                "loc": null,
                                "id": {
                                    "type": "Identifier",
                                    "loc": null,
                                    "name": "y"
                                },
                                "init": {
                                    "type": "BinaryExpression",
                                    "loc": null,
                                    "left": {
                                        "type": "Literal",
                                        "loc": null,
                                        "value": 42
                                    },
                                    "operator": "+",
                                    "right": {
                                        "type": "Literal",
                                        "loc": null,
                                        "value": 24
                                    }
                                }
                            }
                        ],
                        "kind": "let"
                    }
                ]
            }
        );

        expect(parse("const x = 42, y = 42 + 24")).to.eql({
                "type": "Program",
                "loc": null,
                "body": [
                    {
                        "type": "VariableDeclaration",
                        "loc": null,
                        "declarations": [
                            {
                                "type": "VariableDeclarator",
                                "loc": null,
                                "id": {
                                    "type": "Identifier",
                                    "loc": null,
                                    "name": "x"
                                },
                                "init": {
                                    "type": "Literal",
                                    "loc": null,
                                    "value": 42
                                }
                            },
                            {
                                "type": "VariableDeclarator",
                                "loc": null,
                                "id": {
                                    "type": "Identifier",
                                    "loc": null,
                                    "name": "y"
                                },
                                "init": {
                                    "type": "BinaryExpression",
                                    "loc": null,
                                    "left": {
                                        "type": "Literal",
                                        "loc": null,
                                        "value": 42
                                    },
                                    "operator": "+",
                                    "right": {
                                        "type": "Literal",
                                        "loc": null,
                                        "value": 24
                                    }
                                }
                            }
                        ],
                        "kind": "const"
                    }
                ]
            }
        );

    });

    it("should handle a empty object literal", function() {
        expect(parse("var o = {}")).to.eql({
                "type": "Program",
                "loc": null,
                "body": [
                    {
                        "type": "VariableDeclaration",
                        "loc": null,
                        "declarations": [
                            {
                                "type": "VariableDeclarator",
                                "loc": null,
                                "id": {
                                    "type": "Identifier",
                                    "loc": null,
                                    "name": "o"
                                },
                                "init": {
                                    "type": "ObjectExpression",
                                    "loc": null,
                                    "properties": []
                                }
                            }
                        ],
                        "kind": "var"
                    }
                ]
            }
        );
    });

    it("should handle an object literal with a single property", function() {
        expect(parse("var o = { foo: 42 }")).to.eql({
                "type": "Program",
                "loc": null,
                "body": [
                    {
                        "type": "VariableDeclaration",
                        "loc": null,
                        "declarations": [
                            {
                                "type": "VariableDeclarator",
                                "loc": null,
                                "id": {
                                    "type": "Identifier",
                                    "loc": null,
                                    "name": "o"
                                },
                                "init": {
                                    "type": "ObjectExpression",
                                    "loc": null,
                                    "properties": [
                                        {
                                            "type": "Property",
                                            "loc": null,
                                            "key": {
                                                "type": "Identifier",
                                                "loc": null,
                                                "name": "foo"
                                            },
                                            "value": {
                                                "type": "Literal",
                                                "loc": null,
                                                "value": 42
                                            },
                                            "kind": "init"
                                        }
                                    ]
                                }
                            }
                        ],
                        "kind": "var"
                    }
                ]
            }
        );
    });

    it("should handle a object literal with multiple properties", function() {
        expect(parse("var o = { foo: 42, bar: 24};")).to.eql({
                "type": "Program",
                "loc": null,
                "body": [
                    {
                        "type": "VariableDeclaration",
                        "loc": null,
                        "declarations": [
                            {
                                "type": "VariableDeclarator",
                                "loc": null,
                                "id": {
                                    "type": "Identifier",
                                    "loc": null,
                                    "name": "o"
                                },
                                "init": {
                                    "type": "ObjectExpression",
                                    "loc": null,
                                    "properties": [
                                        {
                                            "type": "Property",
                                            "loc": null,
                                            "key": {
                                                "type": "Identifier",
                                                "loc": null,
                                                "name": "foo"
                                            },
                                            "value": {
                                                "type": "Literal",
                                                "loc": null,
                                                "value": 42
                                            },
                                            "kind": "init"
                                        },
                                        {
                                            "type": "Property",
                                            "loc": null,
                                            "key": {
                                                "type": "Identifier",
                                                "loc": null,
                                                "name": "bar"
                                            },
                                            "value": {
                                                "type": "Literal",
                                                "loc": null,
                                                "value": 24
                                            },
                                            "kind": "init"
                                        }
                                    ]
                                }
                            }
                        ],
                        "kind": "var"
                    }
                ]
            }
        );
    });

    it("should handle an empty array literal", function() {
        expect(parse("[];")).to.eql({
                "type": "Program",
                "loc": null,
                "body": [
                    {
                        "type": "ExpressionStatement",
                        "loc": null,
                        "expression": {
                            "type": "ArrayExpression",
                            "loc": null,
                            "elements": []
                        }
                    }
                ]
            }
        );
    });

    it("should handle an single null element array literal", function() {
        expect(parse("[,];")).to.eql({
                "type": "Program",
                "loc": null,
                "body": [
                    {
                        "type": "ExpressionStatement",
                        "loc": null,
                        "expression": {
                            "type": "ArrayExpression",
                            "loc": null,
                            "elements": [
                                null
                            ]
                        }
                    }
                ]
            }
        );
    });

    it("should handle an two element array literal", function() {
        expect(parse("[42,24];")).to.eql({
                "type": "Program",
                "loc": null,
                "body": [
                    {
                        "type": "ExpressionStatement",
                        "loc": null,
                        "expression": {
                            "type": "ArrayExpression",
                            "loc": null,
                            "elements": [
                                {
                                    "type": "Literal",
                                    "loc": null,
                                    "value": 42
                                },
                                {
                                    "type": "Literal",
                                    "loc": null,
                                    "value": 24
                                }
                            ]
                        }
                    }
                ]
            }
        );
    });

    it("should handle a static member access", function() {
        expect(parse("foo.bar;")).to.eql({
                "type": "Program",
                "loc": null,
                "body": [
                    {
                        "type": "ExpressionStatement",
                        "loc": null,
                        "expression": {
                            "type": "MemberExpression",
                            "loc": null,
                            "object": {
                                "type": "Identifier",
                                "loc": null,
                                "name": "foo"
                            },
                            "property": {
                                "type": "Identifier",
                                "loc": null,
                                "name": "bar"
                            },
                            "computed": false
                        }
                    }
                ]
            }
        );
    });

    it("should throw an error for a bad static member access", function() {
        expect(() => parse("foo.+")).to.throwError();
    });

    it("should throw an error for a bad variable decl expression", function() {
        expect(() => parse("var x = var")).to.throwError();
    });

    it("should handle an single element array literal with a trailing comma", function() {
        expect(parse("[42,];")).to.eql({
                "type": "Program",
                "loc": null,
                "body": [
                    {
                        "type": "ExpressionStatement",
                        "loc": null,
                        "expression": {
                            "type": "ArrayExpression",
                            "loc": null,
                            "elements": [
                                {
                                    "type": "Literal",
                                    "loc": null,
                                    "value": 42
                                }
                            ]
                        }
                    }
                ]
            }
        );
    });

    it("should handle a syntax quote", function() {
        expect(parse("syntaxQuote { foo }")).to.eql({
                "type": "Program",
                "loc": null,
                "body": [
                    {
                        "type": "ExpressionStatement",
                        "loc": null,
                        "expression": {
                            "type": "CallExpression",
                            "loc": null,
                            "callee": {
                                "type": "Identifier",
                                "loc": null,
                                "name": "syntaxQuote"
                            },
                            "arguments": [
                                {
                                    "type": "Literal",
                                    "loc": null,
                                    "value": "[{\"stx\":{\"token\":{\"type\":3,\"value\":\"foo\",\"lineNumber\":1,\"lineStart\":0,\"range\":[14,17]},\"scopeset\":[]}}]"
                                }
                            ]
                        }
                    }
                ]
            }
        )
    });
    // // todo: test expr list
});
