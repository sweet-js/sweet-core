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

import expect from "expect.js";
import { expr, stmt, testParse, testParseFailure } from "../assertions";
import test from 'ava';

test("arrow expression", function () {

  testParse("(()=>0)", expr,
    { type: "ArrowExpression",
      params: { type: "FormalParameters", items: [], rest: null },
      body: { type: "LiteralNumericExpression", value: 0 }
    }
  );

  testParse("() => 0", expr,
    { type: "ArrowExpression",
      params: { type: "FormalParameters", items: [], rest: null },
      body: { type: "LiteralNumericExpression", value: 0 }
    }
  );

  testParse("(...a) => 0", expr,
    { type: "ArrowExpression",
      params:
        { type: "FormalParameters",
          items: [],
          rest: { type: "BindingIdentifier", name: "<<hygiene>>" }
        },
      body: { type: "LiteralNumericExpression", value: 0 }
    }
  );

  testParse("() => {}", expr,
    { type: "ArrowExpression",
      params: { type: "FormalParameters", items: [], rest: null },
      body: { type: "FunctionBody", directives: [], statements: [] }
    }
  );

  testParse("(a) => 0", expr,
    { type: "ArrowExpression",
      params:
        { type: "FormalParameters",
          items: [{ type: "BindingIdentifier", name: "<<hygiene>>" }],
          rest: null
        },
      body: { type: "LiteralNumericExpression", value: 0 }
    }
  );

  // testParse("([a]) => 0", expr,
  //   { type: "ArrowExpression",
  //     params:
  //       { type: "FormalParameters",
  //         items:
  //           [
  //             { type: "ArrayBinding", elements: [{ type: "BindingIdentifier", name: "a" }], restElement: null }
  //           ],
  //         rest: null
  //       },
  //     body: { type: "LiteralNumericExpression", value: 0 }
  //   }
  // );

  testParse("a => 0", expr,
    { type: "ArrowExpression",
      params:
        { type: "FormalParameters",
          items: [{ type: "BindingIdentifier", name: "<<hygiene>>" }],
          rest: null
        },
      body: { type: "LiteralNumericExpression", value: 0 }
    }
  );

  // testParse("({a}) => 0", expr,
  //   { type: "ArrowExpression",
  //     params:
  //       { type: "FormalParameters",
  //         items:
  //           [
  //             {
  //               type: "ObjectBinding",
  //               properties: [{
  //                 type: "BindingPropertyIdentifier",
  //                 binding: { type: "BindingIdentifier", name: "a" },
  //                 init: null
  //               }]
  //             }
  //           ],
  //         rest: null
  //       },
  //     body: { type: "LiteralNumericExpression", value: 0 }
  //   }
  // );

  testParse("() => () => 0", expr,
    { type: "ArrowExpression",
      params:
        { type: "FormalParameters",
          items: [],
          rest: null
        },
      body:
        { type: "ArrowExpression",
          params:
            { type: "FormalParameters",
              items: [],
              rest: null
            },
          body: { type: "LiteralNumericExpression", value: 0 }
        }
    }
  );

  testParse("() => 0, 1", expr,
    {
      type: "BinaryExpression",
      operator: ",",
      left: {
        type: "ArrowExpression",
        params: { type: "FormalParameters", items: [], rest: null },
        body: { type: "LiteralNumericExpression", value: 0 }
      },
      right: { type: "LiteralNumericExpression", value: 1 }
    });

  testParse("() => 0 + 1", expr,
    { type: "ArrowExpression",
      params:
        { type: "FormalParameters",
          items: [],
          rest: null
        },
      body: {
        type: "BinaryExpression",
        operator: "+",
        left: { type: "LiteralNumericExpression", value: 0 },
        right: { type: "LiteralNumericExpression", value: 1 }
      }
    }
  );

  testParse("(a,b) => 0 + 1", expr,
    { type: "ArrowExpression",
      params:
        { type: "FormalParameters",
          items:
            [
              { type: "BindingIdentifier", name: "<<hygiene>>" },
              { type: "BindingIdentifier", name: "<<hygiene>>" }
            ],
          rest: null
        },
      body: {
        type: "BinaryExpression",
        operator: "+",
        left: { type: "LiteralNumericExpression", value: 0 },
        right: { type: "LiteralNumericExpression", value: 1 }
      }
    }
  );

  testParse("(a,b,...c) => 0 + 1", expr,
    { type: "ArrowExpression",
      params:
        { type: "FormalParameters",
          items:
            [
              { type: "BindingIdentifier", name: "<<hygiene>>" },
              { type: "BindingIdentifier", name: "<<hygiene>>" }
            ],
          rest: { type: "BindingIdentifier", name: "<<hygiene>>" }
        },
      body: {
        type: "BinaryExpression",
        operator: "+",
        left: { type: "LiteralNumericExpression", value: 0 },
        right: { type: "LiteralNumericExpression", value: 1 }
      }
    }
  );

  testParse("() => (a) = 0", expr,
    { type: "ArrowExpression",
      params: { type: "FormalParameters", items: [], rest: null },
      body: {
        type: "AssignmentExpression",
        binding: { type: "BindingIdentifier", name: "a" },
        expression: { type: "LiteralNumericExpression", value: 0 }
      }
    }
  );

  testParse("a => b => c => 0", expr,
    { type: "ArrowExpression",
      params: { type: "FormalParameters", items: [{ type: "BindingIdentifier", name: "<<hygiene>>" }], rest: null },
      body:
        { type: "ArrowExpression",
          params: { type: "FormalParameters", items: [{ type: "BindingIdentifier", name: "<<hygiene>>" }], rest: null },
          body:
            { type: "ArrowExpression",
              params: { type: "FormalParameters", items: [{ type: "BindingIdentifier", name: "<<hygiene>>" }], rest: null },
              body: { type: "LiteralNumericExpression", value: 0 }
            }
        }
    }
  );

  // testParse("(x)=>{'use strict';}", expr,
  //   { type: "ArrowExpression",
  //     params: { type: "FormalParameters", items: [{ type: "BindingIdentifier", name: "x" }], rest: null },
  //     body: { type: "FunctionBody", directives: [{ type: "Directive", rawValue: "use strict" }], statements: [] }
  //   }
  // );

  testParse("eval => 'use strict'", expr,
    { type: "ArrowExpression",
      params: { type: "FormalParameters", items: [{ type: "BindingIdentifier", name: "<<hygiene>>" }], rest: null },
      body: { type: "LiteralStringExpression", value: "use strict" }
    }
  );

  // testParse("'use strict';(x)=>0", expr,
  //   { type: "ArrowExpression",
  //     params: { type: "FormalParameters", items: [{ type: "BindingIdentifier", name: "x" }], rest: null },
  //     body: { type: "LiteralNumericExpression", value: 0 }
  //   }
  // );

  // testParse("({x=0}, {})=>0", expr,
  //   {
  //     type: "ArrowExpression",
  //     params: {
  //       type: "FormalParameters", items: [{
  //         type: "ObjectBinding",
  //         properties: [{
  //             type: "BindingPropertyIdentifier",
  //             binding: { type: "BindingIdentifier", name: "x" },
  //             init: { type: "LiteralNumericExpression", value: 0 }
  //         }]
  //       }, {
  //         type: "ObjectBinding",
  //         properties: []
  //       }],
  //       rest: null
  //     },
  //     body: { type: "LiteralNumericExpression", value: 0 }
  //   });

  // testParse("([x=0], [])=>0", expr,
  //   {
  //     type: "ArrowExpression",
  //     params: {
  //       type: "FormalParameters",
  //       items: [{
  //         type: "ArrayBinding",
  //         elements: [{
  //             type: "BindingWithDefault",
  //             binding: { type: "BindingIdentifier", name: "x" },
  //             init: { type: "LiteralNumericExpression", value: 0 }
  //         }],
  //         restElement: null
  //       }, {
  //         type: "ArrayBinding",
  //         elements: [],
  //         restElement: null
  //       }],
  //       rest: null
  //     },
  //     body: { type: "LiteralNumericExpression", value: 0 }
  //   });

  // testParse("(a, {x = 0})=>0", expr,
  //   {
  //     type: "ArrowExpression",
  //     params: {
  //       type: "FormalParameters",
  //       items: [
  //         { type: "BindingIdentifier", name: "a" },
  //         {
  //           type: "ObjectBinding",
  //           properties: [
  //             {
  //               type: "BindingPropertyIdentifier",
  //               binding: { type: "BindingIdentifier", name: "x" },
  //               init: { type: "LiteralNumericExpression", value: 0 }
  //             }
  //           ]
  //         },
  //       ],
  //       rest: null
  //     },
  //     body: { type: "LiteralNumericExpression", value: 0 }
  //   });
  //
  // testParse("({x = 0}, {y = 0}, {z = 0})=>0", expr, {
  //   type: "ArrowExpression",
  //   params: {
  //     type: "FormalParameters",
  //     items: [{
  //       type: "ObjectBinding",
  //       properties: [
  //         {
  //           type: "BindingPropertyIdentifier",
  //           binding: { type: "BindingIdentifier", name: "x" },
  //           init: { type: "LiteralNumericExpression", value: 0 }
  //         }
  //       ]
  //     }, {
  //       type: "ObjectBinding",
  //       properties: [
  //         {
  //           type: "BindingPropertyIdentifier",
  //           binding: { type: "BindingIdentifier", name: "y" },
  //           init: { type: "LiteralNumericExpression", value: 0 }
  //         }
  //       ]
  //     }, {
  //       type: "ObjectBinding",
  //       properties: [
  //         {
  //           type: "BindingPropertyIdentifier",
  //           binding: { type: "BindingIdentifier", name: "z" },
  //           init: { type: "LiteralNumericExpression", value: 0 }
  //         }
  //       ]
  //     }],
  //     "rest": null
  //   },
  //   body: { type: "LiteralNumericExpression", value: 0 }
  // });
  //
  // testParse("yield => 0", expr,
  //   { type: "ArrowExpression",
  //     params: { type: "FormalParameters", items: [{ type: "BindingIdentifier", name: "yield" }], rest: null },
  //     body: { type: "LiteralNumericExpression", value: 0 }
  //   }
  // );

  testParseFailure("[]=>0", "Unexpected token \"=>\"");
  testParseFailure("() + 1", "Unexpected token \"+\"");
  testParseFailure("1 + ()", "Unexpected end of input");
  testParseFailure("1 + ()", "Unexpected end of input");
  testParseFailure("(a)\n=> 0", "Unexpected token \"=>\"");
  testParseFailure("a\n=> 0", "Unexpected token \"=>\"");
  testParseFailure("((a)) => 1", "Illegal arrow function parameter list");
  testParseFailure("((a),...a) => 1", "Unexpected token \"...\"");
  testParseFailure("(a,...a)", "Unexpected end of input");
  testParseFailure("(a,...a)\n", "Unexpected line terminator");
  testParseFailure("(a,...a)/*\r\n*/ => 0", "Unexpected line terminator");
  testParseFailure("(a,...a)/*\u2028*/ => 0", "Unexpected line terminator");
  testParseFailure("(a,...a)/*\u2029*/ => 0", "Unexpected line terminator");
  testParseFailure("(a,...a)/*\n*/ => 0", "Unexpected line terminator");
  testParseFailure("(a,...a)/*\r*/ => 0", "Unexpected line terminator");
  testParseFailure("(a,...a)/*\u202a*/", "Unexpected end of input");
  testParseFailure("() <= 0", "Unexpected token \"<=\"");
  testParseFailure("() ? 0", "Unexpected token \"?\"");
  testParseFailure("() + 0", "Unexpected token \"+\"");
  testParseFailure("(10) => 0", "Illegal arrow function parameter list");
  testParseFailure("(10, 20) => 0", "Illegal arrow function parameter list");
});
