import { parse, expand } from "../src/sweet";
import expect from "expect.js";
import { expr, stmt, testParse } from "./assertions";
import test from 'ava';

import reduce, { MonoidalReducer, CloneReducer } from "shift-reducer";


test("should handle the `this` keyword", function () {
  testParse("this;", stmt, {
    "type": "ExpressionStatement",
    "loc": null,
    "expression": {
      "type": "ThisExpression",
      "loc": null
    }
  });
});

test("should handle a single identifier", function () {
  testParse("x", stmt, {
    "type": "ExpressionStatement",
    "loc": null,
    "expression": {
      "type": "IdentifierExpression",
      "loc": null,
      "name": "x"
    }
  });
});

test("should handle a literal", function () {
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

  testParse('`x`', stmt, {
    "type": "ExpressionStatement",
    "loc": null,
    "expression": {
      "type": "TemplateExpression",
      "loc": null,
      "tag": null,
      "elements": [
        {
          "type": "TemplateElement",
          "loc": null,
          "rawValue": "x"
        }
      ]
    }
  });

  testParse('id`x`', stmt, {
    "type": "ExpressionStatement",
    "loc": null,
    "expression": {
      "type": "TemplateExpression",
      "loc": null,
      "tag": {
        "type": "IdentifierExpression",
        "loc": null,
        "name": "id"
      },
      "elements": [
        {
          "type": "TemplateElement",
          "loc": null,
          "rawValue": "x"
        }
      ]
    }
  });

  testParse('`x${1 + 2}y`', stmt, {
    "type": "ExpressionStatement",
    "loc": null,
    "expression": {
      "type": "TemplateExpression",
      "loc": null,
      "tag": null,
      "elements": [
        {
          "type": "TemplateElement",
          "loc": null,
          "rawValue": "x"
        },
        {
          "type": "BinaryExpression",
          "loc": null,
          "left": {
            "type": "LiteralNumericExpression",
            "loc": null,
            "value": 1
          },
          "operator": "+",
          "right": {
            "type": "LiteralNumericExpression",
            "loc": null,
            "value": 2
          }
        },
        {
          "type": "TemplateElement",
          "loc": null,
          "rawValue": "y"
        }
      ]
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
  // testParse("/foo/i;", stmt, {
  //    "type": "ExpressionStatement",
  //    "loc": null,
  //    "expression": {
  //        "type": "LiteralRegExpExpression",
  //        "loc": null,
  //        "pattern": "foo",
  //        "flags": "i"
  //    }
  // });
});

// TODO: figure out how to test with hygiene
test("should handle a function expression", function () {
  testParse("(function(x) { });", stmt, {
    "type": "ExpressionStatement",
    "loc": null,
    "expression": {
      "type": "FunctionExpression",
      "loc": null,
      "name": null,
      "isGenerator": false,
      "params": {
        "type": "FormalParameters",
        "loc": null,
        "rest": null,
        "items": [{
          "type": "BindingIdentifier",
          "loc": null,
          "name": "<<hygiene>>"
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

test("should handle a named function expression", function () {
  testParse("(function x(x) { });", stmt, {
    "type": "ExpressionStatement",
    "loc": null,
    "expression": {
      "type": "FunctionExpression",
      "loc": null,
      "name": {
        "type": "BindingIdentifier",
        "loc": null,
        "name": "<<hygiene>>"
      },
      "isGenerator": false,
      "params": {
        "type": "FormalParameters",
        "loc": null,
        "rest": null,
        "items": [{
          "type": "BindingIdentifier",
          "loc": null,
          "name": "<<hygiene>>"
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

test("should handle a generator function", function () {
  testParse("(function * id(x) {})", stmt, {
    "type": "ExpressionStatement",
    "loc": null,
    "expression": {
      "type": "FunctionExpression",
      "loc": null,
      "name": {
        "type": "BindingIdentifier",
        "loc": null,
        "name": "<<hygiene>>"
      },
      "isGenerator": true,
      "params": {
        "type": "FormalParameters",
        "loc": null,
        "rest": null,
        "items": [{
          "type": "BindingIdentifier",
          "loc": null,
          "name": "<<hygiene>>"
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

test("should handle a empty object literal", function () {
  testParse("({})", expr, {
    "type": "ObjectExpression",
    "loc": null,
    "properties": []
  });
});

test("should handle an object literal with a single property", function () {
  testParse("({ foo: 42 })", expr, {
    "loc": null,
    "type": "ObjectExpression",
    "properties": [
      {
        "type": "DataProperty",
        "loc": null,
        "name": {
          "loc": null,
          "type": "StaticPropertyName",
          "value": "foo"
        },
        "expression": {
          "loc": null,
          "type": "LiteralNumericExpression",
          "value": 42
        }
      }
    ]
  });
});

test("should handle a object literal with multiple properties", function () {
  testParse("({ foo: 42, bar: 24 })", expr, {
    "loc": null,
    "type": "ObjectExpression",
    "properties": [
      {
        "type": "DataProperty",
        "loc": null,
        "name": {
          "loc": null,
          "type": "StaticPropertyName",
          "value": "foo"
        },
        "expression": {
          "loc": null,
          "type": "LiteralNumericExpression",
          "value": 42
        }
      },
      {
        "type": "DataProperty",
        "loc": null,
        "name": {
          "loc": null,
          "type": "StaticPropertyName",
          "value": "bar"
        },
        "expression": {
          "loc": null,
          "type": "LiteralNumericExpression",
          "value": 24
        }
      }
    ]
  });
});

test("should handle an empty array literal", function () {
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

test("should handle an single null element array literal", function () {
  testParse("[,];", stmt, {
    "type": "ExpressionStatement",
    "loc": null,
    "expression": {
      "loc": null,
      "type": "ArrayExpression",
      "elements": [
        null
      ]
    }
  });
});

test("should handle an two element array literal", function () {
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

test("should handle an single element array literal with a trailing comma", function () {
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

test("should handle a call", function () {
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

test("should handle a call with a single arg", function () {
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

test("should handle a call with a multiple args", function () {
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

test("should handle errors with calls", function () {
  expect(() => {
    parse("x(42 24)");
  }).to.throwError();

  expect(() => {
    parse("x(;)");
  }).to.throwError();
});

test("should handle a static member access", function () {
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

test("should throw an error for a bad static member access", function () {
  expect(() => parse("foo.+")).to.throwError();
});


test("should handle a binary expr", function () {
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
