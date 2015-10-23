import { parse } from "../src/sweet";
import expect from "expect.js";

describe("macro expansion", function () {
//     it("should handle basic expansion at a statement expression position", function () {
//         expect(parse(`
// syntax m = function(ctx) {
//     return syntaxQuote { 200 };
// }
// m`)).to.eql({
//                 "type": "Program",
//                 "loc": null,
//                 "body": [
//                     {
//                         "type": "ExpressionStatement",
//                         "loc": null,
//                         "expression": {
//                             "type": "Literal",
//                             "loc": null,
//                             "value": 200
//                         }
//                     }
//                 ]
//             }
//         );

//     });

//     it("should handle basic expansion at an expression position", function() {
//         expect(parse(`
// syntax m = function (ctx) {
//     return syntaxQuote { 200 }
// }
// let v = m`)).to.eql({
//                 "type": "Program",
//                 "loc": null,
//                 "body": [
//                     {
//                         "type": "VariableDeclaration",
//                         "loc": null,
//                         "declarations": [
//                             {
//                                 "type": "VariableDeclarator",
//                                 "loc": null,
//                                 "id": {
//                                     "type": "Identifier",
//                                     "loc": null,
//                                     "name": "v"
//                                 },
//                                 "init": {
//                                     "type": "Literal",
//                                     "loc": null,
//                                     "value": 200
//                                 }
//                             }
//                         ],
//                         "kind": "let"
//                     }
//                 ]
//             }
//         )
//     });

//     it("should handle expansion where an argument is eaten", function() {
//         expect(parse(`
// syntax m = function(ctx) {
//     ctx.next();
//     return syntaxQuote { 200 }
// }
// m 42`)).to.eql({
//     "type": "Program",
//     "loc": null,
//     "body": [
//         {
//             "type": "ExpressionStatement",
//             "loc": null,
//             "expression": {
//                 "type": "Literal",
//                 "loc": null,
//                 "value": 200
//             }
//         }
//     ]
// });

//     });

//     it("should handle expansion that eats an expression", function() {
//         expect(parse(`
// syntax m = function(ctx) {
//     ctx.nextExpression();
//     return syntaxQuote { 200 }
// }
// m 100 + 200`)).to.eql({
//     "type": "Program",
//     "loc": null,
//     "body": [
//         {
//             "type": "ExpressionStatement",
//             "loc": null,
//             "expression": {
//                 "type": "Literal",
//                 "loc": null,
//                 "value": 200
//             }
//         }
//     ]
// });
//     });
});
