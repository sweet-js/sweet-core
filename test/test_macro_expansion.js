import { parse } from "../src/sweet";
import expect from "expect.js";
import test from 'ava';

import { expr, stmt, testParse, testEval } from "./assertions";

test("should handle basic expansion at a statement expression position", function () {
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

test("should handle basic expansion with an arrow transformer", function () {
  testParse(`
syntaxrec m = ctx => #\`200\`
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

test("should handle basic expansion at an expression position", function () {
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

test("should handle expansion where an argument is eaten", function () {
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

test("should handle expansion that eats an expression", function () {
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

test('should handle expansion that takes an argument', () => {
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

test('should handle expansion that matches an expression argument', () => {
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

test('should handle the macro returning an array', () => {
  testEval(`
    syntax m = function (ctx) {
      let x = ctx.next().value;
      return [x];
    }
    output = m 42;
    `, 42);
});

test('should handle the full macro context api', () => {
  testEval(`
    syntaxrec def = function(ctx) {
      let id = ctx.next().value;
      let parens = ctx.next().value;
      let body = ctx.next().value;

      let parenCtx = parens.inner();
      let paren_id = parenCtx.next().value;
      parenCtx.next() // =
      let paren_init = parenCtx.next('expr').value;

      let bodyCtx = body.inner();
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

test('should handle iterators inside a syntax template', t => {
  testEval(`
    syntax let = function (ctx) {
      let ident = ctx.next().value;
      ctx.next();
      let init = ctx.next('expr').value;
      return #\`
        (function (\${ident}) {
          \${ctx}
        }(\${init}))
      \`
    }
    let x = 42;
    output = x;
  `, 42);
});
