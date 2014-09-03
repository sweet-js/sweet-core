#lang "js";
import { * } from "../../macros/stxcase.js";

macro id {
    rule { $x } => { $x }
}
export id;

macro di {
    rule { $x } => { $x }
}
export di;
