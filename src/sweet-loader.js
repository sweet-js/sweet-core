// @flow
import read from './reader/token-reader';
import { freshScope } from './scope';
import Env from './env';
import { List } from 'immutable';
import Compiler from './compiler';
import { ALL_PHASES } from './syntax';
import BindingMap from './binding-map.js';
import Term from 'sweet-spec';
import SweetModule from './sweet-module';
import * as _ from 'ramda';
import ScopeReducer from './scope-reducer';
import { wrapInTerms } from './macro-context';
import { transform as babel } from 'babel-core';
import Store from './store';

export const phaseInModulePathRegexp = /(.*):(\d+)\s*$/;

export type Context = {
  bindings: any,
  templateMap: any,
  getTemplateIdentifier: any,
  loader: any,
  transform: any,
  phase: number,
  store: Store,
};

export default class SweetLoader {
  sourceCache: Map<string, string>;
  compiledCache: Map<string, SweetModule>;
  context: any;
  baseDir: string;

  constructor(baseDir: string, noBabel: boolean = false) {
    this.sourceCache = new Map();
    this.compiledCache = new Map();
    this.baseDir = baseDir;

    let bindings = new BindingMap();
    let templateMap = new Map();
    let tempIdent = 0;
    this.context = {
      phase: 0,
      bindings,
      templateMap,
      getTemplateIdentifier: () => ++tempIdent,
      loader: this,
      transform: c => {
        if (noBabel) {
          return {
            code: c,
          };
        }
        return babel(c, {
          babelrc: true,
        });
      },
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

  locate({ name, metadata }: { name: string, metadata: {} }) {
    // takes `/abs/path/to/source.js:<phase>`
    // gives { path: '/abs/path/to/source.js', phase: <phase> }
    let match = name.match(phaseInModulePathRegexp);
    if (match && match.length >= 3) {
      return {
        path: match[1],
        phase: parseInt(match[2], 10),
      };
    }
    throw new Error(`Module ${name} is missing phase information`);
  }

  fetch(
    {
      name,
      address,
      metadata,
    }: { name: string, address: { path: string, phase: number }, metadata: {} },
  ) {
    throw new Error('No default fetch defined');
  }

  translate(
    {
      name,
      address,
      source,
      metadata,
    }: {
      name: string,
      address: { path: string, phase: number },
      source: string,
      metadata: {},
    },
  ) {
    let src = this.compiledCache.get(address.path);
    if (src != null) {
      return src;
    }
    let compiledModule = this.compileSource(source);
    this.compiledCache.set(address.path, compiledModule);
    return compiledModule;
  }

  instantiate(
    {
      name,
      address,
      source,
      metadata,
    }: {
      name: string,
      address: { path: string, phase: number },
      source: SweetModule,
      metadata: {},
    },
  ) {
    throw new Error('Not implemented yet');
  }

  eval(source: string) {
    return (0, eval)(source);
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
    return wrapInTerms(read(source));
  }

  freshStore() {
    return new Store({});
  }

  compileSource(source: string) {
    let stxl = this.read(source);
    let outScope = freshScope('outsideEdge');
    let inScope = freshScope('insideEdge0');
    // the compiler starts at phase 0, with an empty environment and store
    let compiler = new Compiler(
      0,
      new Env(),
      this.freshStore(),
      _.merge(this.context, {
        currentScope: [outScope, inScope],
      }),
    );
    return new SweetModule(
      compiler.compile(
        stxl.map(s =>
          s.reduce(
            new ScopeReducer(
              [
                { scope: outScope, phase: ALL_PHASES, flip: false },
                { scope: inScope, phase: 0, flip: false },
              ],
              this.context.bindings,
            ),
          )),
      ),
    );
  }
}
