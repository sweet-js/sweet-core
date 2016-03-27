import Reader from "./shift-reader";
import Expander from "./expander";
import { List } from "immutable";
import Syntax from "./syntax";
import Env from "./env";
import reduce from "shift-reducer";
import ParseReducer from "./parse-reducer";
import codegen, { FormattedCodeGen } from "shift-codegen";
import { Scope, freshScope } from "./scope";

import BindingMap from "./binding-map.js";

import Term from "./terms";
import { Modules } from './modules';

export function expand(source, options = {}) {
  let reader = new Reader(source);
  let stxl = reader.read();
  let scope = freshScope('top');
  let bindings = new BindingMap();
  let expander = new Expander({
    env: new Env(),
    store: new Env(),
    bindings: bindings,
    cwd: options.cwd,
    filename: options.filename,
    modules: new Modules(),
    currentScope: [scope],
    transform: options.transform ? options.transform : function(x) { return {code: x}; },
    moduleResolver: options.moduleResolver,
    moduleLoader: options.moduleLoader
  });
  let exStxl = expander.expand(stxl.map(s => s.addScope(scope, bindings)));
  return new Term("Module", {
    directives: List(),
    items: exStxl
  });
}

export function parse(source, options = {}) {
  return reduce(new ParseReducer(), expand(source, options));
}

export function compile(source, options = {}) {
  let ast = parse(source, options);
  let gen = codegen(ast, new FormattedCodeGen());
  return options.transform && (!options.noBabel) ? options.transform(gen, {
    babelrc: true,
    filename: options.filename
  }) : { code: gen };
}
