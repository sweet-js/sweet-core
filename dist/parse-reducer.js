"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _terms = require("./terms");

var _terms2 = _interopRequireDefault(_terms);

var _shiftReducer = require("shift-reducer");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ParseReducer = function (_CloneReducer) {
  _inherits(ParseReducer, _CloneReducer);

  function ParseReducer() {
    _classCallCheck(this, ParseReducer);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(ParseReducer).apply(this, arguments));
  }

  _createClass(ParseReducer, [{
    key: "reduceModule",
    value: function reduceModule(node_382, state_383) {
      return new _terms2.default("Module", { directives: state_383.directives.toArray(), items: state_383.items.toArray() });
    }
  }, {
    key: "reduceImport",
    value: function reduceImport(node_384, state_385) {
      var moduleSpecifier_386 = state_385.moduleSpecifier ? state_385.moduleSpecifier.val() : null;return new _terms2.default("Import", { defaultBinding: state_385.defaultBinding, namedImports: state_385.namedImports.toArray(), moduleSpecifier: moduleSpecifier_386, forSyntax: node_384.forSyntax });
    }
  }, {
    key: "reduceImportNamespace",
    value: function reduceImportNamespace(node_387, state_388) {
      var moduleSpecifier_389 = state_388.moduleSpecifier ? state_388.moduleSpecifier.val() : null;return new _terms2.default("ImportNamespace", { defaultBinding: state_388.defaultBinding, namespaceBinding: state_388.namespaceBinding, moduleSpecifier: moduleSpecifier_389, forSyntax: node_387.forSyntax });
    }
  }, {
    key: "reduceExport",
    value: function reduceExport(node_390, state_391) {
      return new _terms2.default("Export", { declaration: state_391.declaration });
    }
  }, {
    key: "reduceExportAllFrom",
    value: function reduceExportAllFrom(node_392, state_393) {
      var moduleSpecifier_394 = state_393.moduleSpecifier ? state_393.moduleSpecifier.val() : null;return new _terms2.default("ExportAllFrom", { moduleSpecifier: moduleSpecifier_394 });
    }
  }, {
    key: "reduceExportFrom",
    value: function reduceExportFrom(node_395, state_396) {
      var moduleSpecifier_397 = state_396.moduleSpecifier ? state_396.moduleSpecifier.val() : null;return new _terms2.default("ExportFrom", { moduleSpecifier: moduleSpecifier_397, namedExports: state_396.namedExports.toArray() });
    }
  }, {
    key: "reduceExportSpecifier",
    value: function reduceExportSpecifier(node_398, state_399) {
      var name_400 = state_399.name,
          exportedName_401 = state_399.exportedName;if (name_400 == null) {
        name_400 = exportedName_401.resolve();exportedName_401 = exportedName_401.val();
      } else {
        name_400 = name_400.resolve();exportedName_401 = exportedName_401.val();
      }return new _terms2.default("ExportSpecifier", { name: name_400, exportedName: exportedName_401 });
    }
  }, {
    key: "reduceImportSpecifier",
    value: function reduceImportSpecifier(node_402, state_403) {
      var name_404 = state_403.name ? state_403.name.resolve() : null;return new _terms2.default("ImportSpecifier", { name: name_404, binding: state_403.binding });
    }
  }, {
    key: "reduceIdentifierExpression",
    value: function reduceIdentifierExpression(node_405, state_406) {
      return new _terms2.default("IdentifierExpression", { name: node_405.name.resolve() });
    }
  }, {
    key: "reduceLiteralNumericExpression",
    value: function reduceLiteralNumericExpression(node_407, state_408) {
      return new _terms2.default("LiteralNumericExpression", { value: node_407.value.val() });
    }
  }, {
    key: "reduceLiteralBooleanExpression",
    value: function reduceLiteralBooleanExpression(node_409, state_410) {
      return new _terms2.default("LiteralBooleanExpression", { value: node_409.value.val() === "true" });
    }
  }, {
    key: "reduceLiteralStringExpression",
    value: function reduceLiteralStringExpression(node_411, state_412) {
      return new _terms2.default("LiteralStringExpression", { value: node_411.value.token.str });
    }
  }, {
    key: "reduceCallExpression",
    value: function reduceCallExpression(node_413, state_414) {
      return new _terms2.default("CallExpression", { callee: state_414.callee, arguments: state_414.arguments.toArray() });
    }
  }, {
    key: "reduceFunctionBody",
    value: function reduceFunctionBody(node_415, state_416) {
      return new _terms2.default("FunctionBody", { directives: state_416.directives.toArray(), statements: state_416.statements.toArray() });
    }
  }, {
    key: "reduceFormalParameters",
    value: function reduceFormalParameters(node_417, state_418) {
      return new _terms2.default("FormalParameters", { items: state_418.items.toArray(), rest: state_418.rest });
    }
  }, {
    key: "reduceBindingIdentifier",
    value: function reduceBindingIdentifier(node_419, state_420) {
      return new _terms2.default("BindingIdentifier", { name: node_419.name.resolve() });
    }
  }, {
    key: "reduceBinaryExpression",
    value: function reduceBinaryExpression(node_421, state_422) {
      return new _terms2.default("BinaryExpression", { left: state_422.left, operator: node_421.operator.val(), right: state_422.right });
    }
  }, {
    key: "reduceObjectExpression",
    value: function reduceObjectExpression(node_423, state_424) {
      return new _terms2.default("ObjectExpression", { properties: state_424.properties.toArray() });
    }
  }, {
    key: "reduceVariableDeclaration",
    value: function reduceVariableDeclaration(node_425, state_426) {
      return new _terms2.default("VariableDeclaration", { kind: state_426.kind, declarators: state_426.declarators.toArray() });
    }
  }, {
    key: "reduceStaticPropertyName",
    value: function reduceStaticPropertyName(node_427, state_428) {
      return new _terms2.default("StaticPropertyName", { value: node_427.value.val().toString() });
    }
  }, {
    key: "reduceArrayExpression",
    value: function reduceArrayExpression(node_429, state_430) {
      return new _terms2.default("ArrayExpression", { elements: state_430.elements.toArray() });
    }
  }, {
    key: "reduceStaticMemberExpression",
    value: function reduceStaticMemberExpression(node_431, state_432) {
      return new _terms2.default("StaticMemberExpression", { object: state_432.object, property: state_432.property.val() });
    }
  }]);

  return ParseReducer;
}(_shiftReducer.CloneReducer);

exports.default = ParseReducer;
//# sourceMappingURL=parse-reducer.js.map
