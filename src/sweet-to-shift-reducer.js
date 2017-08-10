// @flow
import Term, * as S from 'sweet-spec';
import { complement } from 'ramda';
import { List } from 'immutable';

import { isEmptyStatement } from './terms';

import type Syntax from './syntax.js';

const notEmptyStatement = complement(isEmptyStatement);

// $FlowFixMe: flow doesn't know about CloneReducer yet
export default class extends Term.CloneReducer {
  phase: number;

  constructor(phase: number) {
    super();
    this.phase = phase;
  }

  reduceModule(t: Term, s: { directives: List<string>, items: List<any> }) {
    return new S.Module({
      directives: s.directives
        .filter(d => !d.startsWith('lang'))
        .map(d => ({ type: 'Directive', rawValue: d }))
        .toArray(),
      items: s.items.toArray().filter(notEmptyStatement),
    });
  }

  reduceIdentifierExpression(t: Term, s: { name: Syntax }) {
    return new S.IdentifierExpression({
      name: s.name.resolve(this.phase),
    });
  }

  reduceStaticPropertyName(t: Term, s: { value: Syntax }) {
    return new S.StaticPropertyName({
      value: s.value.val().toString(),
    });
  }

  reduceBindingIdentifier(t: Term, s: { name: Syntax }) {
    return new S.BindingIdentifier({
      name: s.name.resolve(this.phase),
    });
  }

  reduceAssignmentTargetIdentifier(t: Term, s: { name: Syntax }) {
    return new S.AssignmentTargetIdentifier({
      name: s.name.resolve(this.phase),
    });
  }

  reduceStaticMemberExpression(t: Term, s: { object: any, property: Syntax }) {
    return new S.StaticMemberExpression({
      object: s.object,
      property: s.property.val(),
    });
  }

  reduceStaticMemberAssignmentTarget(
    t: Term,
    s: { object: any, property: Syntax },
  ) {
    return new S.StaticMemberAssignmentTarget({
      object: s.object,
      property: s.property.val(),
    });
  }

  reduceFunctionBody(
    t: Term,
    s: { statements: List<any>, directives: List<any> },
  ) {
    return new S.FunctionBody({
      directives: s.directives.toArray(),
      statements: s.statements.toArray().filter(notEmptyStatement),
    });
  }

  reduceVariableDeclarationStatement(t: any, s: { declaration: any }) {
    if (
      t.declaration.kind === 'syntax' ||
      t.declaration.kind === 'syntaxrec' ||
      t.declaration.kind === 'operator'
    ) {
      return new S.EmptyStatement();
    }
    return new S.VariableDeclarationStatement({
      declaration: s.declaration,
    });
  }

  reduceVariableDeclaration(t: Term, s: { kind: any, declarators: List<any> }) {
    return new S.VariableDeclaration({
      kind: s.kind,
      declarators: s.declarators.toArray(),
    });
  }

  reduceCallExpression(t: Term, s: { callee: any, arguments: List<any> }) {
    return new S.CallExpression({
      callee: s.callee,
      arguments: s.arguments.toArray(),
    });
  }

  reduceArrayExpression(t: Term, s: { elements: List<any> }) {
    return new S.ArrayExpression({
      elements: s.elements.toArray(),
    });
  }

  reduceImportNamespace(
    t: Term,
    s: {
      defaultBinding: S.BindingIdentifier,
      moduleSpecifier: Syntax,
      namespaceBinding: S.BindingIdentifier,
    },
  ) {
    if (s.forSyntax) {
      return new S.EmptyStatement();
    }
    return t;
  }

  reduceImport(
    t: Term,
    s: {
      defaultBinding: S.BindingIdentifier,
      moduleSpecifier: Syntax,
      namedImports: List<any>,
    },
  ) {
    if (s.forSyntax) {
      return new S.EmptyStatement();
    }
    return new S.Import({
      forSyntax: false,
      defaultBinding: s.defaultBinding,
      moduleSpecifier: s.moduleSpecifier.val(),
      namedImports: s.namedImports.toArray(),
    });
  }

  reduceBlock(t: Term, s: { statements: List<any> }) {
    return new S.Block({
      statements: s.statements.toArray().filter(notEmptyStatement),
    });
  }

  reduceExportFromSpecifier(t: Term, s: { name: any, exportedName?: Syntax }) {
    return new S.ExportFromSpecifier({
      name: s.name.resolve(0),
      exportedName: s.exportedName == null ? null : s.exportedName.val(),
    });
  }

  reduceExportLocalSpecifier(t: Term, s: { name: any, exportedName?: Syntax }) {
    return new S.ExportLocalSpecifier({
      name: s.name,
      exportedName: s.exportedName == null ? null : s.exportedName.val(),
    });
  }

  reduceExportFrom(
    t: Term,
    s: { moduleSpecifier?: Syntax, namedExports: List<S.ExportFromSpecifier> },
  ) {
    return new S.ExportFrom({
      moduleSpecifier:
        s.moduleSpecifier != null ? s.moduleSpecifier.val() : null,
      namedExports: s.namedExports.toArray(),
    });
  }

  reduceExportLocals(
    t: Term,
    s: { moduleSpecifier?: Syntax, namedExports: List<S.ExportLocalSpecifier> },
  ) {
    return new S.ExportLocals({
      moduleSpecifier:
        s.moduleSpecifier != null ? s.moduleSpecifier.val() : null,
      namedExports: s.namedExports.toArray(),
    });
  }
}
