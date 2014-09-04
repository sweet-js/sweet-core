#lang "js";
import { * } from "../../macros/stxcase.js";

operator (**) 14 right { $l, $r } => #{ Math.pow($l, $r) }

export (**);
