import Reader from "./shift-reader";
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
  let bindings = new BindingMap();
  let reader = new Reader(source);
  let modules = new Modules({
    cwd: options.cwd,
    filename: options.filename,
    transform: options.transform ? options.transform : function(x) { return {code: x}; },
    moduleResolver: options.moduleResolver,
    moduleLoader: options.moduleLoader,
    bindings
  });
  let compiledMod = modules.compile(reader.read(), options.filename);
  return new Term("Module", {
    directives: List(),
    items: compiledMod.body
    // items: compiledMod.body.concat(compiledMod.exportEntries)
  });
}

export function parse(source, options, includeImports = true) {
  return reduce(new ParseReducer({phase: 0}), expand(source, options).gen({includeImports}));
}

export function compile(source, options = {}) {
  let ast = parse(source, options, options.includeImports);
  let gen = codegen(ast, new FormattedCodeGen());
  return options.transform && (!options.noBabel) ? options.transform(gen, {
    babelrc: true,
    filename: options.filename
  }) : { code: gen };
}
