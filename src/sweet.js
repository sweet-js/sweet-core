import Reader from "./shift-reader";
import expand from "./expander";
import { List } from "immutable";
import Syntax from "./syntax";
import Env from "./env";
import { transform } from "babel-core";
import reduce from "shift-reducer";
import ParseReducer from "./parse-reducer";
import codegen from "shift-codegen";

import BindingMap from "./binding-map.js";

import Term from "./terms";
import { Symbol } from "./symbol";

export function parse(source, options = {}) {
  let reader = new Reader(source);
  let stxl = reader.read();
  let exStxl = expand(stxl, {
    env: new Env(),
    store: new Env(),
    bindings: new BindingMap(),
    cwd: options.cwd
  });
  let ast = reduce.default(new ParseReducer(), new Term("Module", {
    directives: List(),
    items: exStxl
  }));
  return ast;
}

export function compile(source, cwd) {
  let ast = parse(source, {
    cwd: cwd
  });
  let gen = codegen.default(ast);
  // TODO use AST instead of shipping string to babel
  // need to fix shift to estree converter first
  return transform(gen);
}

function expandForExport(source) {
  let reader = new Reader(source);
  let stxl = reader.read();
  let exStxl = expand(stxl, {
    env: new Env(),
    store: new Env(),
    bindings: new BindingMap()
  });
  return new Term("Module", {
    directives: List(),
    items: exStxl
  });
}
export {expandForExport as expand};
