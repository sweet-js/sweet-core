import { parse } from "../src/sweet";
import expect from "expect.js";

import { expr, stmt, testParse, testEval } from "./assertions";

describe("macro expansion", function () {
  it("should handle basic expansion at a statement expression position", function () {
    testParse(`
syntaxrec m = function(ctx) {
    return #\`200\`;
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
syntaxrec m = function (ctx) {
    return #\`200\`;
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
syntaxrec m = function(ctx) {
    ctx.next();
    return #\`200\`
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
syntaxrec m = function(ctx) {
    let term = ctx.next('expr')
    return #\`200\`
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
      syntaxrec m = function(ctx) {
        var x = ctx.next().value;
        return #\`40 + \${x}\`;
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
      syntaxrec m = function(ctx) {
        let x = ctx.next('expr').value;
        return #\`40 + \${x}\`;
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
      syntaxrec def = function(ctx) {
        let id = ctx.next().value;
        let parens = ctx.next().value;
        let body = ctx.next().value;

        let parenCtx = ctx.of(parens);
        let paren_id = parenCtx.next().value;
        parenCtx.next() // =
        let paren_init = parenCtx.next('expr').value;

        let bodyCtx = ctx.of(body);
        let b = [];
        for (let s of bodyCtx) {
          b.push(s);
        }

        return #\`function \${id} (\${paren_id}) {
          \${paren_id} = \${paren_id} || \${paren_init};
          \${b}
        }\`;
      }

      def foo (x = 10 + 100) { return x; }
      output = foo();
      `, 110);
  });
});
