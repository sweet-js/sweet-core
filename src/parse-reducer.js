import Term from "./terms";
import { CloneReducer } from "shift-reducer";

export default class ParseReducer extends CloneReducer {
  constructor(context) {
    super();
    this.context = context;
  }
  reduceModule(node, state) {
    return new Term("Module", {
      directives: state.directives.toArray(),
      items: state.items.toArray()
    });
  }

  reduceImport(node, state) {
    let moduleSpecifier = state.moduleSpecifier ? state.moduleSpecifier.val() : null;
    return new Term('Import', {
      defaultBinding: state.defaultBinding,
      namedImports: state.namedImports.toArray(),
      moduleSpecifier,
      forSyntax: node.forSyntax
    });
  }

  reduceImportNamespace(node, state) {
    let moduleSpecifier = state.moduleSpecifier ? state.moduleSpecifier.val() : null;
    return new Term('ImportNamespace', {
      defaultBinding: state.defaultBinding,
      namespaceBinding: state.namespaceBinding,
      moduleSpecifier,
      forSyntax: node.forSyntax
    });
  }

  reduceExport(node, state) {
    return new Term('Export', {
      declaration: state.declaration
    });
  }

  reduceExportAllFrom(node, state) {
    let moduleSpecifier = state.moduleSpecifier ? state.moduleSpecifier.val() : null;
    return new Term('ExportAllFrom', { moduleSpecifier });
  }

  reduceExportFrom(node, state) {
    let moduleSpecifier = state.moduleSpecifier ? state.moduleSpecifier.val() : null;
    return new Term('ExportFrom', {
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
    return new Term('ExportSpecifier', {
      name, exportedName
    });
  }

  reduceImportSpecifier(node, state) {
    let name = state.name ? state.name.resolve(this.context.phase) : null;
    return new Term('ImportSpecifier', {
      name,
      binding: state.binding
    });
  }

  reduceIdentifierExpression(node, state) {
    return new Term("IdentifierExpression", {
      name: node.name.resolve(this.context.phase)
    });
  }

  reduceLiteralNumericExpression(node, state) {
    return new Term("LiteralNumericExpression", {
      value: node.value.val()
    });
  }

  reduceLiteralBooleanExpression(node, state) {
    return new Term("LiteralBooleanExpression", {
      value: node.value.val() === 'true'
    });
  }

  reduceLiteralStringExpression(node, state) {
    return new Term("LiteralStringExpression", {
      value: node.value.token.str
    });
  }

  reduceCallExpression(node, state) {
    return new Term("CallExpression", {
      callee: state.callee,
      arguments: state.arguments.toArray()
    });
  }

  reduceFunctionBody(node, state) {
    return new Term("FunctionBody", {
      directives: state.directives.toArray(),
      statements: state.statements.toArray()
    });
  }

  reduceFormalParameters(node, state) {
    return new Term("FormalParameters", {
      items: state.items.toArray(),
      rest: state.rest
    });
  }

  reduceBindingIdentifier(node, state) {
    return new Term("BindingIdentifier", {
      name: node.name.resolve(this.context.phase)
    });
  }

  reduceBinaryExpression(node, state) {
    return new Term("BinaryExpression", {
      left: state.left,
      operator: node.operator.val(),
      right: state.right
    });
  }

  reduceObjectExpression(node, state) {
    return new Term("ObjectExpression", {
      properties: state.properties.toArray()
    });
  }

  reduceVariableDeclaration(node, state) {
    return new Term("VariableDeclaration", {
      kind: state.kind,
      declarators: state.declarators.toArray()
    });
  }

  reduceStaticPropertyName(node, state) {
    return new Term("StaticPropertyName", {
      value: node.value.val().toString()
    });
  }

  reduceArrayExpression(node, state) {
    return new Term("ArrayExpression", {
      elements: state.elements.toArray()
    });
  }

  reduceStaticMemberExpression(node, state) {
    return new Term("StaticMemberExpression", {
      object: state.object,
      property: state.property.val()
    });
  }

}
