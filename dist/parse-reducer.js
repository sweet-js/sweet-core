"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _terms = require("./terms");

var _terms2 = _interopRequireDefault(_terms);

var _shiftReducer = require("shift-reducer");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ParseReducer extends _shiftReducer.CloneReducer {
  constructor(context_509) {
    super();
    this.context = context_509;
  }
  reduceModule(node_510, state_511) {
    return new _terms2.default("Module", { directives: state_511.directives.toArray(), items: state_511.items.toArray() });
  }
  reduceImport(node_512, state_513) {
    let moduleSpecifier_514 = state_513.moduleSpecifier ? state_513.moduleSpecifier.val() : null;
    return new _terms2.default("Import", { defaultBinding: state_513.defaultBinding, namedImports: state_513.namedImports.toArray(), moduleSpecifier: moduleSpecifier_514, forSyntax: node_512.forSyntax });
  }
  reduceImportNamespace(node_515, state_516) {
    let moduleSpecifier_517 = state_516.moduleSpecifier ? state_516.moduleSpecifier.val() : null;
    return new _terms2.default("ImportNamespace", { defaultBinding: state_516.defaultBinding, namespaceBinding: state_516.namespaceBinding, moduleSpecifier: moduleSpecifier_517, forSyntax: node_515.forSyntax });
  }
  reduceExport(node_518, state_519) {
    return new _terms2.default("Export", { declaration: state_519.declaration });
  }
  reduceExportAllFrom(node_520, state_521) {
    let moduleSpecifier_522 = state_521.moduleSpecifier ? state_521.moduleSpecifier.val() : null;
    return new _terms2.default("ExportAllFrom", { moduleSpecifier: moduleSpecifier_522 });
  }
  reduceExportFrom(node_523, state_524) {
    let moduleSpecifier_525 = state_524.moduleSpecifier ? state_524.moduleSpecifier.val() : null;
    return new _terms2.default("ExportFrom", { moduleSpecifier: moduleSpecifier_525, namedExports: state_524.namedExports.toArray() });
  }
  reduceExportSpecifier(node_526, state_527) {
    let name_528 = state_527.name,
        exportedName_529 = state_527.exportedName;
    if (name_528 == null) {
      name_528 = exportedName_529.resolve(this.context.phase);
      exportedName_529 = exportedName_529.val();
    } else {
      name_528 = name_528.resolve(this.context.phase);
      exportedName_529 = exportedName_529.val();
    }
    return new _terms2.default("ExportSpecifier", { name: name_528, exportedName: exportedName_529 });
  }
  reduceImportSpecifier(node_530, state_531) {
    let name_532 = state_531.name ? state_531.name.resolve(this.context.phase) : null;
    return new _terms2.default("ImportSpecifier", { name: name_532, binding: state_531.binding });
  }
  reduceIdentifierExpression(node_533, state_534) {
    return new _terms2.default("IdentifierExpression", { name: node_533.name.resolve(this.context.phase) });
  }
  reduceLiteralNumericExpression(node_535, state_536) {
    return new _terms2.default("LiteralNumericExpression", { value: node_535.value.val() });
  }
  reduceLiteralBooleanExpression(node_537, state_538) {
    return new _terms2.default("LiteralBooleanExpression", { value: node_537.value.val() === "true" });
  }
  reduceLiteralStringExpression(node_539, state_540) {
    return new _terms2.default("LiteralStringExpression", { value: node_539.value.token.str });
  }
  reduceCallExpression(node_541, state_542) {
    return new _terms2.default("CallExpression", { callee: state_542.callee, arguments: state_542.arguments.toArray() });
  }
  reduceFunctionBody(node_543, state_544) {
    return new _terms2.default("FunctionBody", { directives: state_544.directives.toArray(), statements: state_544.statements.toArray() });
  }
  reduceFormalParameters(node_545, state_546) {
    return new _terms2.default("FormalParameters", { items: state_546.items.toArray(), rest: state_546.rest });
  }
  reduceBindingIdentifier(node_547, state_548) {
    return new _terms2.default("BindingIdentifier", { name: node_547.name.resolve(this.context.phase) });
  }
  reduceBinaryExpression(node_549, state_550) {
    return new _terms2.default("BinaryExpression", { left: state_550.left, operator: node_549.operator.val(), right: state_550.right });
  }
  reduceObjectExpression(node_551, state_552) {
    return new _terms2.default("ObjectExpression", { properties: state_552.properties.toArray() });
  }
  reduceVariableDeclaration(node_553, state_554) {
    return new _terms2.default("VariableDeclaration", { kind: state_554.kind, declarators: state_554.declarators.toArray() });
  }
  reduceStaticPropertyName(node_555, state_556) {
    return new _terms2.default("StaticPropertyName", { value: node_555.value.val().toString() });
  }
  reduceArrayExpression(node_557, state_558) {
    return new _terms2.default("ArrayExpression", { elements: state_558.elements.toArray() });
  }
  reduceStaticMemberExpression(node_559, state_560) {
    return new _terms2.default("StaticMemberExpression", { object: state_560.object, property: state_560.property.val() });
  }
}
exports.default = ParseReducer;