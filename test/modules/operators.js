#lang "js";
import { * } from "../../macros/stxcase.js";

operator (**) 14 right { $l, $r } => #{ Math.pow($l, $r) }
operator (|>) 1 left { $l, $r } => #{ $r($l) }

export {
    (**),
    (|>)
}
