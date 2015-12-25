import { List } from "immutable";
import { expect } from "./errors";

export function matchCommaSeparatedIdentifiers(stxl) {
  // todo: better error handling
  return stxl.filter(s => s.isIdentifier());
}

