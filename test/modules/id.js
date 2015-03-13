#lang "../../macros/stxcase.js";

stxrec id {
    rule { ($x) } => { $x }
}

stxrec di {
    rule { ($x) } => { $x }
}

export { id, di };
