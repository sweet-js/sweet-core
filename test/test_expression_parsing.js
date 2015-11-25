import { parse, expand } from "../src/sweet";
import expect from "expect.js";
import { expr, stmt, testParse } from "./assertions";

import reduce, { MonoidalReducer, CloneReducer } from "shift-reducer";

expect("parsing expressions", function() {

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

    it("should handle an empty array literal", function() {
        testParse("[];", stmt, {
            "type": "ExpressionStatement",
            "loc": null,
            "expression": {
                "loc": null,
                "type": "ArrayExpression",
                "elements": []
            }
        });
    });

    it("should handle an single null element array literal", function() {
        testParse("[,];", stmt, {
            "type": "ExpressionStatement",
            "loc": null,
            "expression": {
                "loc": null,
                "type": "ArrayExpression",
                "elements": [
                    null
                ]
        }});
    });

    it("should handle an two element array literal", function() {
        testParse("[42,24];", stmt, {
            "type": "ExpressionStatement",
            "loc": null,
            "expression": {
                "loc": null,
                "type": "ArrayExpression",
                "elements": [
                    {
                        "loc": null,
                        "type": "LiteralNumericExpression",
                        "value": 42
                    },
                    {
                        "loc": null,
                        "type": "LiteralNumericExpression",
                        "value": 24
                    }
                ]
            }
        });
    });

    it("should handle a static member access", function() {
        testParse("foo.bar;", stmt, {
            "type": "ExpressionStatement",
            "loc": null,
            "expression": {
                "loc": null,
                "type": "StaticMemberExpression",
                "object": {
                    "loc": null,
                    "type": "IdentifierExpression",
                    "name": "foo"
                },
                "property": "bar"
            }
        });
    });

    it("should throw an error for a bad static member access", function() {
        expect(() => parse("foo.+")).to.throwError();
    });


    it("should handle an single element array literal with a trailing comma", function() {
        testParse("[42,];", stmt, {
            "type": "ExpressionStatement",
            "loc": null,
            "expression": {
                "loc": null,
                "type": "ArrayExpression",
                "elements": [
                    {
                        "loc": null,
                        "type": "LiteralNumericExpression",
                        "value": 42
                    }
                ]
            }
        });
    });
});
