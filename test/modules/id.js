#lang "../../macros/stxcase.js";

macro id {
    rule { ($x) } => { $x }
}

macro di {
    rule { ($x) } => { $x }
}

export { id, di };
