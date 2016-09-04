// @flow
import { List } from "immutable";
import reduce from "shift-reducer";
import ParseReducer from "./parse-reducer";
import codegen, { FormattedCodeGen } from "shift-codegen";

import BindingMap from "./binding-map.js";

import Term from "./terms";
import { Modules } from './modules';

// not available in browser

import { transform as babelTransform } from "babel-core";
import nodeResolver from "./node-module-resolver";
import nodeLoader from "./node-module-loader";

type CodeOutput = {
  code: string
}

type SweetOptions = {
  includeImports?: boolean;
  cwd?: string;
  enforcePragma?: boolean;
  filename?: string;
  transform?: (s: string) => { code: string };
}

export function expand(source: string, options: SweetOptions = {}): any {
  let bindings = new BindingMap();
  let modules = new Modules({
    bindings,
    cwd: options.cwd || process.cwd(),
    filename: options.filename,
    transform: options.transform || babelTransform || function(c) {
      return {code: c};
    },
    moduleResolver: options.moduleResolver || nodeResolver,
    moduleLoader: options.moduleLoader || nodeLoader
  });
  let compiledMod = modules.compileEntrypoint(source, options.filename, options.enforcePragma);
  let nativeImports = compiledMod.importEntries.filter(imp => !modules.has(imp.moduleSpecifier.val()));
  return new Term("Module", {
    directives: List(),
    items: nativeImports.concat(compiledMod.body).concat(compiledMod.exportEntries.interpose(new Term('EmptyStatement', {})))
  });
}

export function parse(source: string, options: SweetOptions, includeImports: boolean = true): any {
  return reduce(new ParseReducer({phase: 0}), expand(source, options).gen(includeImports));
}

export function compile(source: string, options: SweetOptions = {}): CodeOutput {
  let ast = parse(source, options, options.includeImports);
  let gen = codegen(ast, new FormattedCodeGen());
  return options.transform && (!options.noBabel) ? options.transform(gen, {
    babelrc: true,
    filename: options.filename
  }) : { code: gen };
}
