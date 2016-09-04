import { Symbol } from "./symbol";

let scopeIndex = 0;

export function freshScope(name = "scope") {
  scopeIndex++;
  return Symbol(name + "_" + scopeIndex);
}

export function Scope(name) {
  return Symbol(name);
}
