import { parse } from "../src/sweet";
import expect from "expect.js";

import { expr, stmt, testParse } from "./assertions";

describe("macro expansion", function () {
    it("should handle basic expansion at a statement expression position", function () {
        testParse(`
syntax m = function(ctx) {
    return syntaxQuote { 200 };
}
m`, stmt, {
            "type": "ExpressionStatement",
            "loc": null,
            "expression": {
                "type": "LiteralNumericExpression",
                "loc": null,
                "value": 200
            }
        });
    });

    it("should handle basic expansion at an expression position", function() {
        testParse(`
syntax m = function (ctx) {
    return syntaxQuote { 200 }
}
let v = m`, stmt, {
            "type": "VariableDeclaration",
            "loc": null,
            "kind": "let",
            "declarators": [
                {
                    "type": "VariableDeclarator",
                    "loc": null,
                    "binding": {
                        "type": "BindingIdentifier",
                        "loc": null,
                        "name": "v"
                    },
                    "init": {
                        "type": "LiteralNumericExpression",
                        "loc": null,
                        "value": 200
                    }
                }
            ],
        });
    });

    it("should handle expansion where an argument is eaten", function() {
        testParse(`
syntax m = function(ctx) {
    ctx.next();
    return syntaxQuote { 200 }
}
m 42`, stmt, {
            "type": "ExpressionStatement",
            "loc": null,
            "expression": {
                "type": "LiteralNumericExpression",
                "loc": null,
                "value": 200
            }
        });
    });

    it("should handle expansion that eats an expression", function() {
        testParse(`
syntax m = function(ctx) {
    ctx.nextExpression();
    return syntaxQuote { 200 }
}
m 100 + 200`, stmt, {
            "type": "ExpressionStatement",
            "loc": null,
            "expression": {
                "type": "LiteralNumericExpression",
                "loc": null,
                "value": 200
            }
        });
    });
});
