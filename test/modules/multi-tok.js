#lang "../../macros/stxcase.js";

stxrec (number?) {
    rule { ($cond ...) } => {
        typeof ($cond ...) === 'number'
    }
}

stxrec (string?) {
    rule { ($cond ...) } => {
        typeof ($cond ...) === 'string'
    }
}

export {
    (string?),
    (number?)
}
