// @flow
import type SweetLoader from './sweet-loader';
import { transform as babel } from 'babel-core';

type CompileOptions = {
  refererName?: string,
  debugStore?: Map<string, string>,
  noBabel?: boolean,
  loader: SweetLoader,
};

function compileModule(
  entryPath: string,
  loader: SweetLoader,
  refererName?: string,
) {
  return loader.compile(entryPath, {
    refererName,
    enforceLangPragma: false,
    isEntrypoint: true,
  });
}

export function parse(
  entryPath: string,
  loader: SweetLoader,
  options?: CompileOptions,
) {
  let refererName;
  if (options != null) {
    refererName = options.refererName;
  }
  return compileModule(entryPath, loader, refererName).parse();
}

export function compile(
  entryPath: string,
  loader: SweetLoader,
  options?: CompileOptions,
) {
  let refererName,
    noBabel = true;
  if (options != null) {
    refererName = options.refererName;
    noBabel = options.noBabel;
  }
  let code = compileModule(entryPath, loader, refererName).codegen();
  if (noBabel) {
    return {
      code,
    };
  }
  return babel(code, {
    babelrc: true,
  });
}
