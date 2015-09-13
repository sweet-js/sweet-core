import { parse } from "../src/sweet";
import expect from "expect.js";

describe("macro expansion", function () {
//     it("should handle basic expansion at a statement expression position", function () {
//         expect(parse(`
// syntax m = {
//     match: function(stxl) {
//         return {
//             subst: [],
//             rest: stxl.rest()
//         };
//     },
//     transform: function(subst) {
//         return syntaxQuote { 200 };
//     }
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
// syntax m = {
//     match: function(stxl) {
//         return {
//             subst: [],
//             rest: stxl.rest()
//         };
//     },
//     transform: function(subst) {
//         return syntaxQuote { 200 };
//     }
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
});
