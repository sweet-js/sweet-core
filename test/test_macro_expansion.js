import { parse } from "../src/sweet";
import expect from "expect.js";

import { expr, stmt, testParse, testEval } from "./assertions";

describe("macro expansion", function () {
  it("should handle basic expansion at a statement expression position", function () {
    testParse(`
syntax m = function(ctx) {
    return syntaxQuote\`200\`;
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

  it("should handle basic expansion at an expression position", function () {
    testParse(`
syntax m = function (ctx) {
    return syntaxQuote\`200\`;
}
let v = m`, stmt, {
      "type": "VariableDeclarationStatement",
      "declaration": {
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
              "name": "<<hygiene>>"
            },
            "init": {
              "type": "LiteralNumericExpression",
              "loc": null,
              "value": 200
            }
          }
        ],
      }
    });
  });

  it("should handle expansion where an argument is eaten", function () {
    testParse(`
syntax m = function(ctx) {
    ctx.syntax().next();
    return syntaxQuote\`200\`
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

  it("should handle expansion that eats an expression", function () {
    testParse(`
syntax m = function(ctx) {
    let iter = ctx.syntax()
    let term = ctx.getTerm(iter, 'expr');
    return syntaxQuote\`200\`
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

  it('should handle expansion that takes an argument', () => {
    testParse(`
      syntax m = function(ctx) {
        var x = ctx.syntax().next().value;
        return syntaxQuote\`40 + \${x}\`;
      }
      m 2;
      `, stmt, {
        type: 'ExpressionStatement',
        loc: null,
        expression:
        {
          type: 'BinaryExpression',
          loc: null,
          left: {
            type: 'LiteralNumericExpression',
            loc: null,
            value: 40
          },
          operator: '+',
          right: {
            type: 'LiteralNumericExpression',
            loc: null,
            value: 2
          }
        }
      });
  });

  it('should handle expansion that matches an expression argument', () => {
    testParse(`
      syntax m = function(ctx) {
        let iter = ctx.syntax();
        var x = ctx.getTerm(iter, 'expr');
        return syntaxQuote\`40 + \${x}\`;
      }
      m 2;
      `, stmt, {
        type: 'ExpressionStatement',
        loc: null,
        expression:
        {
          type: 'BinaryExpression',
          loc: null,
          left: {
            type: 'LiteralNumericExpression',
            loc: null,
            value: 40
          },
          operator: '+',
          right: {
            type: 'LiteralNumericExpression',
            loc: null,
            value: 2
          }
        }
      });
  });

  it('should handle the full macro context api', () => {
    testEval(`
      syntax def = function(ctx) {
        let iter = ctx.syntax();
        let id = iter.next().value;
        let parens = iter.next().value;
        let body = iter.next().value;

        let parenIter = ctx.of(parens).syntax();
        let paren_id = parenIter.next().value;
        parenIter.next() // =
        let paren_init = ctx.getTerm(parenIter, 'expr')

        let bodyIter = ctx.of(body).syntax();
        let b = [];
        for (let s of bodyIter) {
          b.push(s);
        }

        return syntaxQuote\`function \${id} (\${paren_id}) {
          \${paren_id} = \${paren_id} || \${paren_init};
          \${b}
        }\`;
      }

      def foo (x = 10 + 100) { return x; }
      output = foo();
      `, 110);
  });
});
