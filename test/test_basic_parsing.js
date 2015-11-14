import { parse, expand } from "../src/sweet";
import expect from "expect.js";
import { expr, stmt, testParse } from "./assertions";

import reduce, { MonoidalReducer, CloneReducer } from "shift-reducer";

describe("parser", function() {

    it("should handle a single identifier", function() {
        testParse("x", stmt, {
                "type": "ExpressionStatement",
                "loc" : null,
                "expression": {
                    "type": "IdentifierExpression",
                    "loc": null,
                    "name": "x"
                }
        });

    });

    it("should handle a literal", function() {
        testParse("42;", stmt, {
            "type": "ExpressionStatement",
            "loc": null,
            "expression": {
                "type": "LiteralNumericExpression",
                "loc": null,
                "value": 42
            }
        });
        testParse("false;", stmt, {
            "type": "ExpressionStatement",
            "loc": null,
            "expression": {
                "type": "LiteralBooleanExpression",
                "loc": null,
                "value": false
            }
        });
        testParse("null;", stmt, {
            "type": "ExpressionStatement",
            "loc": null,
            "expression": {
                "type": "LiteralNullExpression",
                "loc": null
            }
        });
        testParse("'foo';", stmt, {
            "type": "ExpressionStatement",
            "loc": null,
            "expression": {
                "type": "LiteralStringExpression",
                "loc": null,
                "value": "foo"
            }
        });
        testParse("/foo/i;", stmt, {
            "type": "ExpressionStatement",
            "loc": null,
            "expression": {
                "type": "LiteralRegExpExpression",
                "loc": null,
                "pattern": "foo",
                "flags": "i"
            }
        });
    });

    it("should handle a call", function() {
        testParse("x()", stmt, {
            "type": "ExpressionStatement",
            "loc": null,
            "expression": {
                "type": "CallExpression",
                "loc": null,
                "callee": {
                    "type": "IdentifierExpression",
                    "loc": null,
                    "name": "x"
                },
                "arguments": []
            }
        });
    });

    it("should handle a call with a single arg", function() {
        testParse("x(42)", stmt, {
            "type": "ExpressionStatement",
            "loc": null,
            "expression": {
                "type": "CallExpression",
                "loc": null,
                "callee": {
                    "type": "IdentifierExpression",
                    "loc": null,
                    "name": "x"
                },
                "arguments": [{
                    "type": "LiteralNumericExpression",
                    "loc": null,
                    "value": 42
                }]
            }
        });
    });

    it("should handle a call with a multiple args", function() {
        testParse("x(42, 24)", stmt, {
            "type": "ExpressionStatement",
            "loc": null,
            "expression": {
                "type": "CallExpression",
                "loc": null,
                "callee": {
                    "type": "IdentifierExpression",
                    "loc": null,
                    "name": "x"
                },
                "arguments": [{
                    "type": "LiteralNumericExpression",
                    "loc": null,
                    "value": 42
                }, {
                    "type": "LiteralNumericExpression",
                    "loc": null,
                    "value": 24
                }]
            }
        });
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
        testParse("42 + 24", stmt, {
            "type": "ExpressionStatement",
            "loc": null,
            "expression": {
                "type": "BinaryExpression",
                "loc": null,
                "left": {
                    "type": "LiteralNumericExpression",
                    "loc": null,
                    "value": 42
                },
                "operator": "+",
                "right": {
                    "type": "LiteralNumericExpression",
                    "loc": null,
                    "value": 24
                }
            }
        });

        testParse("42 + 24 + 2", stmt, {
            "type": "ExpressionStatement",
            "loc": null,
            "expression": {
                "type": "BinaryExpression",
                "loc": null,
                "left": {
                    "type": "BinaryExpression",
                    "loc": null,
                    "left": {
                        "type": "LiteralNumericExpression",
                        "loc": null,
                        "value": 42
                    },
                    "operator": "+",
                    "right": {
                        "type": "LiteralNumericExpression",
                        "loc": null,
                        "value": 24
                    }
                },
                "operator": "+",
                "right": {
                    "type": "LiteralNumericExpression",
                    "loc": null,
                    "value": 2
                }
            }
        });

        testParse("42 + 24 * 2", stmt, {
            "type": "ExpressionStatement",
            "loc": null,
            "expression": {
                "type": "BinaryExpression",
                "loc": null,
                "left": {
                    "type": "LiteralNumericExpression",
                    "loc": null,
                    "value": 42
                },
                "operator": "+",
                "right": {
                    "type": "BinaryExpression",
                    "loc": null,
                    "left": {
                        "type": "LiteralNumericExpression",
                        "loc": null,
                        "value": 24
                    },
                    "operator": "*",
                    "right": {
                        "type": "LiteralNumericExpression",
                        "loc": null,
                        "value": 2
                    }
                }
            }
        });

        testParse("42 * 24 + 2", stmt, {
            "type": "ExpressionStatement",
            "loc": null,
            "expression": {
                "type": "BinaryExpression",
                "loc": null,
                "left": {
                    "type": "BinaryExpression",
                    "loc": null,
                    "left": {
                        "type": "LiteralNumericExpression",
                        "loc": null,
                        "value": 42
                    },
                    "operator": "*",
                    "right": {
                        "type": "LiteralNumericExpression",
                        "loc": null,
                        "value": 24
                    }
                },
                "operator": "+",
                "right": {
                    "type": "LiteralNumericExpression",
                    "loc": null,
                    "value": 2
                }
            }
        });

        testParse("42 * (24 + 2)", stmt, {
            "type": "ExpressionStatement",
            "loc": null,
            "expression": {
                "type": "BinaryExpression",
                "loc": null,
                "left": {
                    "type": "LiteralNumericExpression",
                    "loc": null,
                    "value": 42
                },
                "operator": "*",
                "right": {
                    "type": "BinaryExpression",
                    "loc": null,
                    "left": {
                        "type": "LiteralNumericExpression",
                        "loc": null,
                        "value": 24
                    },
                    "operator": "+",
                    "right": {
                        "type": "LiteralNumericExpression",
                        "loc": null,
                        "value": 2
                    }
                }
            }
        });
        expect(() => {
            parse("42 + (11 11)");
        }).to.throwError();
    });


    it("should handle a function expression", function() {
        testParse("(function(x) { });", stmt, {
            "type": "ExpressionStatement",
            "loc": null,
            "expression": {
                "type": "FunctionExpression",
                "loc": null,
                "name": null,
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
            }
        });
    });

    it("should handle a named function expression", function() {
        testParse("(function x(x) { });", stmt, {
            "type": "ExpressionStatement",
            "loc": null,
            "expression": {
                "type": "FunctionExpression",
                "loc": null,
                "name": {
                    "type": "BindingIdentifier",
                    "loc": null,
                    "name": "x"
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
            }
        });
    });

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



    // it("should throw an error for a bad return statement", function() {
    //     expect(() => parse("function foo() { return return }")).to.throwError();
    // });

    // it("should thrown an error for a bad var decl", function() {
    //     expect(() => parse("var 42")).to.throwError();
    // });

    // it("should handle a var declaration", function() {
    //     expect(parse("var x")).to.eql({
    //             "type": "Program",
    //             "loc": null,
    //             "body": [
    //                 {
    //                     "type": "VariableDeclaration",
    //                     "loc": null,
    //                     "declarations": [
    //                         {
    //                             "type": "VariableDeclarator",
    //                             "loc": null,
    //                             "id": {
    //                                 "type": "Identifier",
    //                                 "loc": null,
    //                                 "name": "x"
    //                             },
    //                             "init": null
    //                         }
    //                     ],
    //                     "kind": "var"
    //                 }
    //             ]
    //         }
    //     );
    //     expect(parse("var x = 42")).to.eql({
    //             "type": "Program",
    //             "loc": null,
    //             "body": [
    //                 {
    //                     "type": "VariableDeclaration",
    //                     "loc": null,
    //                     "declarations": [
    //                         {
    //                             "type": "VariableDeclarator",
    //                             "loc": null,
    //                             "id": {
    //                                 "type": "Identifier",
    //                                 "loc": null,
    //                                 "name": "x"
    //                             },
    //                             "init": {
    //                                 "type": "Literal",
    //                                 "loc": null,
    //                                 "value": 42
    //                             }
    //                         }
    //                     ],
    //                     "kind": "var"
    //                 }
    //             ]
    //         }
    //     );
    //     expect(parse("var x = 42, y = 42 + 24")).to.eql({
    //             "type": "Program",
    //             "loc": null,
    //             "body": [
    //                 {
    //                     "type": "VariableDeclaration",
    //                     "loc": null,
    //                     "declarations": [
    //                         {
    //                             "type": "VariableDeclarator",
    //                             "loc": null,
    //                             "id": {
    //                                 "type": "Identifier",
    //                                 "loc": null,
    //                                 "name": "x"
    //                             },
    //                             "init": {
    //                                 "type": "Literal",
    //                                 "loc": null,
    //                                 "value": 42
    //                             }
    //                         },
    //                         {
    //                             "type": "VariableDeclarator",
    //                             "loc": null,
    //                             "id": {
    //                                 "type": "Identifier",
    //                                 "loc": null,
    //                                 "name": "y"
    //                             },
    //                             "init": {
    //                                 "type": "BinaryExpression",
    //                                 "loc": null,
    //                                 "left": {
    //                                     "type": "Literal",
    //                                     "loc": null,
    //                                     "value": 42
    //                                 },
    //                                 "operator": "+",
    //                                 "right": {
    //                                     "type": "Literal",
    //                                     "loc": null,
    //                                     "value": 24
    //                                 }
    //                             }
    //                         }
    //                     ],
    //                     "kind": "var"
    //                 }
    //             ]
    //         }
    //     );



    //     expect(parse("let x = 42, y = 42 + 24")).to.eql({
    //             "type": "Program",
    //             "loc": null,
    //             "body": [
    //                 {
    //                     "type": "VariableDeclaration",
    //                     "loc": null,
    //                     "declarations": [
    //                         {
    //                             "type": "VariableDeclarator",
    //                             "loc": null,
    //                             "id": {
    //                                 "type": "Identifier",
    //                                 "loc": null,
    //                                 "name": "x"
    //                             },
    //                             "init": {
    //                                 "type": "Literal",
    //                                 "loc": null,
    //                                 "value": 42
    //                             }
    //                         },
    //                         {
    //                             "type": "VariableDeclarator",
    //                             "loc": null,
    //                             "id": {
    //                                 "type": "Identifier",
    //                                 "loc": null,
    //                                 "name": "y"
    //                             },
    //                             "init": {
    //                                 "type": "BinaryExpression",
    //                                 "loc": null,
    //                                 "left": {
    //                                     "type": "Literal",
    //                                     "loc": null,
    //                                     "value": 42
    //                                 },
    //                                 "operator": "+",
    //                                 "right": {
    //                                     "type": "Literal",
    //                                     "loc": null,
    //                                     "value": 24
    //                                 }
    //                             }
    //                         }
    //                     ],
    //                     "kind": "let"
    //                 }
    //             ]
    //         }
    //     );

    //     expect(parse("const x = 42, y = 42 + 24")).to.eql({
    //             "type": "Program",
    //             "loc": null,
    //             "body": [
    //                 {
    //                     "type": "VariableDeclaration",
    //                     "loc": null,
    //                     "declarations": [
    //                         {
    //                             "type": "VariableDeclarator",
    //                             "loc": null,
    //                             "id": {
    //                                 "type": "Identifier",
    //                                 "loc": null,
    //                                 "name": "x"
    //                             },
    //                             "init": {
    //                                 "type": "Literal",
    //                                 "loc": null,
    //                                 "value": 42
    //                             }
    //                         },
    //                         {
    //                             "type": "VariableDeclarator",
    //                             "loc": null,
    //                             "id": {
    //                                 "type": "Identifier",
    //                                 "loc": null,
    //                                 "name": "y"
    //                             },
    //                             "init": {
    //                                 "type": "BinaryExpression",
    //                                 "loc": null,
    //                                 "left": {
    //                                     "type": "Literal",
    //                                     "loc": null,
    //                                     "value": 42
    //                                 },
    //                                 "operator": "+",
    //                                 "right": {
    //                                     "type": "Literal",
    //                                     "loc": null,
    //                                     "value": 24
    //                                 }
    //                             }
    //                         }
    //                     ],
    //                     "kind": "const"
    //                 }
    //             ]
    //         }
    //     );

    // });

    // it("should handle a empty object literal", function() {
    //     expect(parse("var o = {}")).to.eql({
    //             "type": "Program",
    //             "loc": null,
    //             "body": [
    //                 {
    //                     "type": "VariableDeclaration",
    //                     "loc": null,
    //                     "declarations": [
    //                         {
    //                             "type": "VariableDeclarator",
    //                             "loc": null,
    //                             "id": {
    //                                 "type": "Identifier",
    //                                 "loc": null,
    //                                 "name": "o"
    //                             },
    //                             "init": {
    //                                 "type": "ObjectExpression",
    //                                 "loc": null,
    //                                 "properties": []
    //                             }
    //                         }
    //                     ],
    //                     "kind": "var"
    //                 }
    //             ]
    //         }
    //     );
    // });

    // it("should handle an object literal with a single property", function() {
    //     expect(parse("var o = { foo: 42 }")).to.eql({
    //             "type": "Program",
    //             "loc": null,
    //             "body": [
    //                 {
    //                     "type": "VariableDeclaration",
    //                     "loc": null,
    //                     "declarations": [
    //                         {
    //                             "type": "VariableDeclarator",
    //                             "loc": null,
    //                             "id": {
    //                                 "type": "Identifier",
    //                                 "loc": null,
    //                                 "name": "o"
    //                             },
    //                             "init": {
    //                                 "type": "ObjectExpression",
    //                                 "loc": null,
    //                                 "properties": [
    //                                     {
    //                                         "type": "Property",
    //                                         "loc": null,
    //                                         "key": {
    //                                             "type": "Identifier",
    //                                             "loc": null,
    //                                             "name": "foo"
    //                                         },
    //                                         "value": {
    //                                             "type": "Literal",
    //                                             "loc": null,
    //                                             "value": 42
    //                                         },
    //                                         "kind": "init"
    //                                     }
    //                                 ]
    //                             }
    //                         }
    //                     ],
    //                     "kind": "var"
    //                 }
    //             ]
    //         }
    //     );
    // });

    // it("should handle a object literal with multiple properties", function() {
    //     expect(parse("var o = { foo: 42, bar: 24};")).to.eql({
    //             "type": "Program",
    //             "loc": null,
    //             "body": [
    //                 {
    //                     "type": "VariableDeclaration",
    //                     "loc": null,
    //                     "declarations": [
    //                         {
    //                             "type": "VariableDeclarator",
    //                             "loc": null,
    //                             "id": {
    //                                 "type": "Identifier",
    //                                 "loc": null,
    //                                 "name": "o"
    //                             },
    //                             "init": {
    //                                 "type": "ObjectExpression",
    //                                 "loc": null,
    //                                 "properties": [
    //                                     {
    //                                         "type": "Property",
    //                                         "loc": null,
    //                                         "key": {
    //                                             "type": "Identifier",
    //                                             "loc": null,
    //                                             "name": "foo"
    //                                         },
    //                                         "value": {
    //                                             "type": "Literal",
    //                                             "loc": null,
    //                                             "value": 42
    //                                         },
    //                                         "kind": "init"
    //                                     },
    //                                     {
    //                                         "type": "Property",
    //                                         "loc": null,
    //                                         "key": {
    //                                             "type": "Identifier",
    //                                             "loc": null,
    //                                             "name": "bar"
    //                                         },
    //                                         "value": {
    //                                             "type": "Literal",
    //                                             "loc": null,
    //                                             "value": 24
    //                                         },
    //                                         "kind": "init"
    //                                     }
    //                                 ]
    //                             }
    //                         }
    //                     ],
    //                     "kind": "var"
    //                 }
    //             ]
    //         }
    //     );
    // });

    // it("should handle an empty array literal", function() {
    //     expect(parse("[];")).to.eql({
    //             "type": "Program",
    //             "loc": null,
    //             "body": [
    //                 {
    //                     "type": "ExpressionStatement",
    //                     "loc": null,
    //                     "expression": {
    //                         "type": "ArrayExpression",
    //                         "loc": null,
    //                         "elements": []
    //                     }
    //                 }
    //             ]
    //         }
    //     );
    // });

    // it("should handle an single null element array literal", function() {
    //     expect(parse("[,];")).to.eql({
    //             "type": "Program",
    //             "loc": null,
    //             "body": [
    //                 {
    //                     "type": "ExpressionStatement",
    //                     "loc": null,
    //                     "expression": {
    //                         "type": "ArrayExpression",
    //                         "loc": null,
    //                         "elements": [
    //                             null
    //                         ]
    //                     }
    //                 }
    //             ]
    //         }
    //     );
    // });

    // it("should handle an two element array literal", function() {
    //     expect(parse("[42,24];")).to.eql({
    //             "type": "Program",
    //             "loc": null,
    //             "body": [
    //                 {
    //                     "type": "ExpressionStatement",
    //                     "loc": null,
    //                     "expression": {
    //                         "type": "ArrayExpression",
    //                         "loc": null,
    //                         "elements": [
    //                             {
    //                                 "type": "Literal",
    //                                 "loc": null,
    //                                 "value": 42
    //                             },
    //                             {
    //                                 "type": "Literal",
    //                                 "loc": null,
    //                                 "value": 24
    //                             }
    //                         ]
    //                     }
    //                 }
    //             ]
    //         }
    //     );
    // });

    // it("should handle a static member access", function() {
    //     expect(parse("foo.bar;")).to.eql({
    //             "type": "Program",
    //             "loc": null,
    //             "body": [
    //                 {
    //                     "type": "ExpressionStatement",
    //                     "loc": null,
    //                     "expression": {
    //                         "type": "MemberExpression",
    //                         "loc": null,
    //                         "object": {
    //                             "type": "Identifier",
    //                             "loc": null,
    //                             "name": "foo"
    //                         },
    //                         "property": {
    //                             "type": "Identifier",
    //                             "loc": null,
    //                             "name": "bar"
    //                         },
    //                         "computed": false
    //                     }
    //                 }
    //             ]
    //         }
    //     );
    // });

    // it("should throw an error for a bad static member access", function() {
    //     expect(() => parse("foo.+")).to.throwError();
    // });

    // it("should throw an error for a bad variable decl expression", function() {
    //     expect(() => parse("var x = var")).to.throwError();
    // });

    // it("should handle an single element array literal with a trailing comma", function() {
    //     expect(parse("[42,];")).to.eql({
    //             "type": "Program",
    //             "loc": null,
    //             "body": [
    //                 {
    //                     "type": "ExpressionStatement",
    //                     "loc": null,
    //                     "expression": {
    //                         "type": "ArrayExpression",
    //                         "loc": null,
    //                         "elements": [
    //                             {
    //                                 "type": "Literal",
    //                                 "loc": null,
    //                                 "value": 42
    //                             }
    //                         ]
    //                     }
    //                 }
    //             ]
    //         }
    //     );
    // });

    // it("should handle a syntax quote", function() {
    //     expect(parse("syntaxQuote { foo }")).to.eql({
    //             "type": "Program",
    //             "loc": null,
    //             "body": [
    //                 {
    //                     "type": "ExpressionStatement",
    //                     "loc": null,
    //                     "expression": {
    //                         "type": "CallExpression",
    //                         "loc": null,
    //                         "callee": {
    //                             "type": "Identifier",
    //                             "loc": null,
    //                             "name": "syntaxQuote"
    //                         },
    //                         "arguments": [
    //                             {
    //                                 "type": "Literal",
    //                                 "loc": null,
    //                                 "value": "[{\"stx\":{\"token\":{\"type\":3,\"value\":\"foo\",\"lineNumber\":1,\"lineStart\":0,\"range\":[14,17]},\"scopeset\":[]}}]"
    //                             }
    //                         ]
    //                     }
    //                 }
    //             ]
    //         }
    //     )
    // });
    // // todo: test expr list
});
