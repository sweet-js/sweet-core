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
import Multimap from './multimap';

export const phaseInModulePathRegexp = /(.*):(\d+)\s*$/;

export type Context = {
  bindings: any,
  templateMap: any,
  getTemplateIdentifier: any,
  loader: any,
  transform: any,
  phase: number,
  store: Store,
  invokedRegistry: Multimap<string, number>,
};

export type LoaderOptions = {
  noBabel?: boolean,
  logging?: boolean,
};

export default class SweetLoader {
  sourceCache: Map<string, string>;
  compiledCache: Map<string, SweetModule>;
  context: any;
  baseDir: string;
  logging: boolean;

  constructor(baseDir: string, options?: LoaderOptions = {}) {
    this.sourceCache = new Map();
    this.compiledCache = new Map();
    this.baseDir = baseDir;
    this.logging = options.logging || false;

    let bindings = new BindingMap();
    let templateMap = new Map();
    let tempIdent = 0;
    this.context = {
      phase: 0,
      bindings,
      templateMap,
      getTemplateIdentifier: () => ++tempIdent,
      loader: this,
      invokedRegistry: new Multimap(),
      transform: c => {
        if (options.noBabel) {
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

  fetch({
    name,
    address,
    metadata,
  }: {
    name: string,
    address: { path: string, phase: number },
    metadata: {},
  }) {
    throw new Error('No default fetch defined');
  }

  translate({
    name,
    address,
    source,
    metadata,
  }: {
    name: string,
    address: { path: string, phase: number },
    source: string,
    metadata: {},
  }) {
    let src = this.compiledCache.get(address.path);
    if (src != null) {
      return src;
    }
    let compiledModule = this.compileSource(source, address.path, metadata);
    this.compiledCache.set(address.path, compiledModule);
    return compiledModule;
  }

  instantiate({
    name,
    address,
    source,
    metadata,
  }: {
    name: string,
    address: { path: string, phase: number },
    source: SweetModule,
    metadata: {},
  }) {
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
  compile(
    entryPath: string,
    {
      refererName,
      enforceLangPragma,
      isEntrypoint,
    }: {
      refererName?: string,
      enforceLangPragma: boolean,
      isEntrypoint: boolean,
    },
  ) {
    let metadata = {
      isEntrypoint,
      enforceLangPragma,
      entryPath,
    };
    let name = this.normalize(entryPath, refererName);
    let address = this.locate({ name, metadata });
    let source = this.fetch({ name, address, metadata });
    return this.translate({ name, address, source, metadata });
  }

  get(entryPath: string, entryPhase: number, refererName?: string) {
    return this.compile(`${entryPath}:${entryPhase}`, {
      refererName,
      enforceLangPragma: true,
      isEntrypoint: false,
    });
  }

  read(source: string): List<Term> {
    return wrapInTerms(read(source));
  }

  freshStore() {
    return new Store({});
  }

  compileSource(source: string, path: string, metadata: any) {
    let directive = getLangDirective(source);
    if (directive == null && metadata.enforceLangPragma) {
      // eslint-disable-next-line no-console
      if (this.logging) console.log(`skipping module ${metadata.entryPath}`);
      return new SweetModule(path, List.of());
    }
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
        cwd: path,
        isEntrypoint: metadata.isEntrypoint,
      }),
    );
    return new SweetModule(
      path,
      compiler.compile(
        stxl.map(s =>
          // $FlowFixMe: flow doesn't know about reduce yet
          s.reduce(
            new ScopeReducer(
              [
                { scope: outScope, phase: ALL_PHASES, flip: false },
                { scope: inScope, phase: 0, flip: false },
              ],
              this.context.bindings,
            ),
          ),
        ),
      ),
    );
  }
}

const langDirectiveRegexp = /\s*('lang .*')/;
function getLangDirective(source: string) {
  let match = source.match(langDirectiveRegexp);
  if (match) {
    return match[1];
  }
  return null;
}
