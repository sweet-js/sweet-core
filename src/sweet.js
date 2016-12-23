// @flow
import { load, makeLoader } from './sweet-loader';
import { transform as babel } from 'babel-core';

type CompileOptions = {
  refererName?: string;
  debugStore?: Map<string, string>;
  noBabel?: boolean;
}

export function parse(entryPath: string, options?: CompileOptions) {
  let debugStore, refererName;
  if (options != null) {
    debugStore = options.debugStore;
    refererName = options.refererName; 
  }
  return makeLoader(debugStore).compile(entryPath, refererName).parse();
}

export function compile(entryPath: string, options?: CompileOptions) {
  let debugStore, refererName, noBabel = true;
  if (options != null) {
    debugStore = options.debugStore;
    refererName = options.refererName; 
    noBabel = options.noBabel;
  }
  let code = makeLoader(debugStore).compile(entryPath, refererName).codegen()
  if (noBabel) {
    return {
      code
    };
  }
  return babel(code, {
    babelrc: true
  });
}