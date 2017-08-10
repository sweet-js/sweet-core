// @flow

import * as T from 'sweet-spec';
import * as _ from 'ramda';

export const isImportDeclaration = _.is(T.ImportDeclaration);

export const isExportDeclaration = _.is(T.ExportDeclaration);
export const isExport = _.is(T.Export);
export const isExportDefault = _.is(T.ExportDefault);
export const isExportFrom = _.is(T.ExportFrom);
export const isExportLocals = _.is(T.ExportLocals);

export const isVariableDeclaration = _.is(T.VariableDeclaration);
export const isVariableDeclarator = _.is(T.VariableDeclarator);
export const isSyntaxVariableDeclartion = _.both(
  isVariableDeclaration,
  _.either(_.propEq('kind', 'syntax'), _.propEq('kind', 'syntaxrec')),
);

export const isVariableDeclarationStatement = _.is(
  T.VariableDeclarationStatement,
);
export const isSyntaxDeclarationStatement = (term: any) => {
  // syntax m = ...
  // syntaxrec m = ...
  return (
    isVariableDeclarationStatement(term) &&
    term.declaration.type === 'VariableDeclaration' &&
    (term.declaration.kind === 'syntax' ||
      term.declaration.kind === 'syntaxrec' ||
      term.declaration.kind === 'operator')
  );
};

export const isCompiletimeStatement = isSyntaxDeclarationStatement;

export const isFunctionDeclaration = _.is(T.FunctionDeclaration);
export const isClassDeclaration = _.is(T.ClassDeclaration);
