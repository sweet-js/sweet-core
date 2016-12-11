// @flow
import { Modules } from './modules';
import Reader from './shift-reader';
import { Scope, freshScope } from './scope';
import Env from './env';
import Store from './store';
import { List } from 'immutable';
import Compiler from './compiler';
import { ALL_PHASES } from './syntax';
import BindingMap from './binding-map.js';
import Term, * as S from 'sweet-spec';
import SweetModule from './sweet-module';
import * as _ from 'ramda';
import Syntax from './syntax';
import ScopeReducer from './scope-reducer';
import { wrapInTerms } from './macro-context';

const phaseInModulePathRegexp = /(.*):(\d+)\s*$/;

export class SweetLoader {
  sourceCache: Map<string, string>;
  compiledCache: Map<string, SweetModule>;
  context: any;

  constructor() {
    this.sourceCache = new Map();
    this.compiledCache = new Map();

    let bindings = new BindingMap();
    let templateMap = new Map();
    let tempIdent = 0;
    this.context = {
      bindings,
      templateMap,
      getTemplateIdentifier: () => ++tempIdent,
      loader: this,
      transform: c => {
        return { code: c };
      }
    };
  }

  normalize(name: string, refererName?: string, refererAddress?: string) {
    // takes `..path/to/source.js:<phase>`
    // gives `/abs/path/to/source.js:<phase>`
    // missing phases are turned into 0
    if (!phaseInModulePathRegexp.test(name)) {
      return `${name}:0`;
    }
    return name;
  }

  locate({name, metadata}: {name: string, metadata: {}}) {
    // takes `/abs/path/to/source.js:<phase>`
    // gives { path: '/abs/path/to/source.js', phase: <phase> }
    let match = name.match(phaseInModulePathRegexp);
    // console.log(match);
    if (match && match.length >= 3) {
      return {
        path: match[1],
        phase: parseInt(match[2], 10)
      };
    }
    throw new Error(`Module ${name} is missing phase information`);
  }

  fetch({name, address, metadata}: {name: string, address: {path: string, phase: number}, metadata: {}}) {
    let src = this.sourceCache.get(address.path);
    if (src != null) {
      return src;
    } else {
      let data = require('fs').readFileSync(address.path, 'utf8');
      this.sourceCache.set(address.path, data);
      return data;
    }
  }

  translate({name, address, source, metadata}: {name: string, address: {path: string, phase: number}, source: string, metadata: {}}) {
    let src = this.compiledCache.get(address.path)
    if (src != null) {
      return src;
    }
    let compiledModule = this.compileSource(source);
    this.compiledCache.set(address.path, compiledModule);
    return compiledModule;
  }

  instantiate({name, address, source, metadata}: {name: string, address: {path: string, phase: number}, source: SweetModule, metadata: {}}) {
    throw new Error('Not implemented yet');
  }

  load(entryPath: string) {
    let metadata = {};
    let name = this.normalize(entryPath);
    let address = this.locate({ name, metadata });
    let source = this.fetch({ name, address, metadata });
    source = this.translate({ name, address, source, metadata });
    return this.instantiate({ name, address, source, metadata });
  }

  // skip instantiate
  compile(entryPath: string, refererName?: string) {
    let metadata = {};
    let name = this.normalize(entryPath, refererName);
    let address = this.locate({ name, metadata });
    let source = this.fetch({ name, address, metadata });
    return this.translate({ name, address, source, metadata });
  }

  get(entryPath: string, entryPhase: number) {
    return this.compile(`${entryPath}:${entryPhase}`);
  }

  read(source: string): List<Term> {
    return wrapInTerms(new Reader(source).read());
  }

  compileSource(source: string) {
    let stxl = this.read(source);
    let outScope = freshScope('outsideEdge');
    let inScope = freshScope('insideEdge0');
    // the compiler starts at phase 0, with an empty environment and store
    let compiler = new Compiler(0, new Env(), new Store(),  _.merge(this.context, {
      currentScope: [outScope, inScope],
    }));
    return new SweetModule(compiler.compile(stxl.map(s => s.reduce(new ScopeReducer([
      { scope: outScope, phase: ALL_PHASES, flip: false },
      { scope: inScope, phase: 0, flip: false }],
      this.context.bindings)
    ))));
  }
}

function makeLoader(debugStore) {
  let l = new SweetLoader();
  if (debugStore) {
    // $FlowFixMe: it's fine
    l.normalize = function normalize(name) {
      if (!phaseInModulePathRegexp.test(name)) {
        return `${name}:0`;
      }
      return name;
    };
    // $FlowFixMe: it's fine
    l.fetch = function fetch({ name, address, metadata }) {
      if (debugStore.has(address.path)) {
        return debugStore.get(address.path);
      }
      throw new Error(`The module ${name} is not in the debug store: addr.path is ${address.path}`);
    };
  }
  return l;
}

export function load(entryPath: string, debugStore: any) {
  return makeLoader(debugStore).load(entryPath);
}

export default function compile(entryPath: string, debugStore: any) {
  return makeLoader(debugStore).compile(entryPath);
}
