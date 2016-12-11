import * as T from 'sweet-spec';
import { CloneReducer } from "shift-reducer";

export default class ParseReducer extends CloneReducer {
  constructor(context) {
    super();
    this.context = context;
  }
  reduceModule(node, state) {
    return new T.Module({
      directives: state.directives.toArray(),
      items: state.items.toArray()
    });
  }

  reduceImport(node, state) {
    let moduleSpecifier = state.moduleSpecifier ? state.moduleSpecifier.val() : null;
    return new T.Import({
      defaultBinding: state.defaultBinding,
      namedImports: state.namedImports.toArray(),
      moduleSpecifier,
      forSyntax: node.forSyntax
    });
  }

  reduceImportNamespace(node, state) {
    let moduleSpecifier = state.moduleSpecifier ? state.moduleSpecifier.val() : null;
    return new T.ImportNamespace({
      defaultBinding: state.defaultBinding,
      namespaceBinding: state.namespaceBinding,
      moduleSpecifier,
      forSyntax: node.forSyntax
    });
  }

  reduceExport(node, state) {
    return new T.Export({
      declaration: state.declaration
    });
  }

  reduceExportAllFrom(node, state) {
    let moduleSpecifier = state.moduleSpecifier ? state.moduleSpecifier.val() : null;
    return new T.ExportAllFrom({ moduleSpecifier });
  }

  reduceExportFrom(node, state) {
    let moduleSpecifier = state.moduleSpecifier ? state.moduleSpecifier.val() : null;
    return new T.ExportFrom({
      moduleSpecifier,
      namedExports: state.namedExports.toArray()
    });
  }

  reduceExportSpecifier(node, state) {
    let name = state.name, exportedName = state.exportedName;
    if (name == null) {
      name = exportedName.resolve(this.context.phase);
      exportedName = exportedName.val();
    } else {
      name = name.resolve(this.context.phase);
      exportedName = exportedName.val();
    }
    return new T.ExportSpecifier({
      name, exportedName
    });
  }

  reduceImportSpecifier(node, state) {
    let name = state.name ? state.name.resolve(this.context.phase) : null;
    return new T.ImportSpecifier({
      name,
      binding: state.binding
    });
  }

  reduceIdentifierExpression(node) {
    return new T.IdentifierExpression({
      name: node.name.resolve(this.context.phase)
    });
  }

  reduceLiteralNumericExpression(node) {
    return new T.LiteralNumericExpression({
      value: node.value.val()
    });
  }

  reduceLiteralBooleanExpression(node) {
    return new T.LiteralBooleanExpression({
      value: node.value.val() === 'true'
    });
  }

  reduceLiteralStringExpression(node) {
    return new T.LiteralStringExpression({
      value: node.value.token.str
    });
  }

  reduceCallExpression(node, state) {
    return new T.CallExpression({
      callee: state.callee,
      arguments: state.arguments.toArray()
    });
  }

  reduceFunctionBody(node, state) {
    return new T.FunctionBody({
      directives: state.directives.toArray(),
      statements: state.statements.toArray()
    });
  }

  reduceBlock(node, state) {
    return new Term("Block", {
      statements: state.statements.toArray()
    });
  }

  reduceFormalParameters(node, state) {
    return new T.FormalParameters({
      items: state.items.toArray(),
      rest: state.rest
    });
  }

  reduceBindingIdentifier(node) {
    return new T.BindingIdentifier({
      name: node.name.resolve(this.context.phase)
    });
  }

  reduceBinaryExpression(node, state) {
    return new T.BinaryExpression({
      left: state.left,
      operator: node.operator.val(),
      right: state.right
    });
  }

  reduceObjectExpression(node, state) {
    return new T.ObjectExpression({
      properties: state.properties.toArray()
    });
  }

  reduceVariableDeclaration(node, state) {
    return new T.VariableDeclaration({
      kind: state.kind,
      declarators: state.declarators.toArray()
    });
  }

  reduceStaticPropertyName(node) {
    return new T.StaticPropertyName({
      value: node.value.val().toString()
    });
  }

  reduceArrayExpression(node, state) {
    return new T.ArrayExpression({
      elements: state.elements.toArray()
    });
  }

  reduceStaticMemberExpression(node, state) {
    return new T.StaticMemberExpression({
      object: state.object,
      property: state.property.val()
    });
  }

}
