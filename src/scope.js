import { expect, assert } from "./errors";
import { Symbol, gensym } from "./symbol";

let scopeIndex = 0;

export function freshScope(name = "scope") {
  scopeIndex++;
  return Symbol(name + "_" + scopeIndex);
};

export function Scope(name) {
  return Symbol(name);
}
