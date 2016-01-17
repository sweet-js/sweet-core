import Reader from "./shift-reader";
import Expander from "./expander";
import { List } from "immutable";
import Syntax from "./syntax";
import Env from "./env";
import { transform } from "babel-core";
import reduce from "shift-reducer";
import ParseReducer from "./parse-reducer";
import codegen from "shift-codegen";
import moduleResolver from './node-module-resolver';
import moduleLoader from './node-module-loader';

import BindingMap from "./binding-map.js";

import Term from "./terms";
import { Symbol } from "./symbol";
import { Modules } from './modules';

export function expand(source, options = {}) {
  let reader = new Reader(source);
  let stxl = reader.read();
  let expander = new Expander({
    env: new Env(),
    store: new Env(),
    bindings: new BindingMap(),
    cwd: options.cwd,
    modules: new Modules(),
    moduleResolver: options.moduleResolver ? options.moduleResolver : moduleResolver,
    moduleLoader: options.moduleLoader ? options.moduleLoader : moduleLoader
  });
  let exStxl = expander.expand(stxl);
  return new Term("Module", {
    directives: List(),
    items: exStxl
  });
}

export function parse(source, options = {}) {
  return reduce(new ParseReducer(), expand(source, options));
}

export function compile(source, cwd) {
  let ast = parse(source, {
    cwd: cwd
  });
  let gen = codegen(ast);
  // TODO use AST instead of shipping string to babel
  // need to fix shift to estree converter first
  return transform(gen);
}
