#lang "./macros/stxcase.js";
import { eql } from "expect.js";

// macro m {
//     rule {} => { eql }
// }

let m = macro {
    function(stx) {
        return {
            result: quoteSyntax{eql},
            rest: stx.slice(1)
        };
    }
}

export { m }
