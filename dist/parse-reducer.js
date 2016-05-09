"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _terms = require("./terms");

var _terms2 = _interopRequireDefault(_terms);

var _shiftReducer = require("shift-reducer");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ParseReducer = (function (_CloneReducer) {
  _inherits(ParseReducer, _CloneReducer);

  function ParseReducer() {
    _classCallCheck(this, ParseReducer);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(ParseReducer).apply(this, arguments));
  }

  _createClass(ParseReducer, [{
    key: "reduceModule",
    value: function reduceModule(node_415, state_416) {
      return new _terms2.default("Module", { directives: state_416.directives.toArray(), items: state_416.items.toArray() });
    }
  }, {
    key: "reduceImport",
    value: function reduceImport(node_417, state_418) {
      var moduleSpecifier_419 = state_418.moduleSpecifier ? state_418.moduleSpecifier.val() : null;
      return new _terms2.default("Import", { defaultBinding: state_418.defaultBinding, namedImports: state_418.namedImports.toArray(), moduleSpecifier: moduleSpecifier_419, forSyntax: node_417.forSyntax });
    }
  }, {
    key: "reduceImportNamespace",
    value: function reduceImportNamespace(node_420, state_421) {
      var moduleSpecifier_422 = state_421.moduleSpecifier ? state_421.moduleSpecifier.val() : null;
      return new _terms2.default("ImportNamespace", { defaultBinding: state_421.defaultBinding, namespaceBinding: state_421.namespaceBinding, moduleSpecifier: moduleSpecifier_422, forSyntax: node_420.forSyntax });
    }
  }, {
    key: "reduceExport",
    value: function reduceExport(node_423, state_424) {
      return new _terms2.default("Export", { declaration: state_424.declaration });
    }
  }, {
    key: "reduceExportAllFrom",
    value: function reduceExportAllFrom(node_425, state_426) {
      var moduleSpecifier_427 = state_426.moduleSpecifier ? state_426.moduleSpecifier.val() : null;
      return new _terms2.default("ExportAllFrom", { moduleSpecifier: moduleSpecifier_427 });
    }
  }, {
    key: "reduceExportFrom",
    value: function reduceExportFrom(node_428, state_429) {
      var moduleSpecifier_430 = state_429.moduleSpecifier ? state_429.moduleSpecifier.val() : null;
      return new _terms2.default("ExportFrom", { moduleSpecifier: moduleSpecifier_430, namedExports: state_429.namedExports.toArray() });
    }
  }, {
    key: "reduceExportSpecifier",
    value: function reduceExportSpecifier(node_431, state_432) {
      var name_433 = state_432.name,
          exportedName_434 = state_432.exportedName;
      if (name_433 == null) {
        name_433 = exportedName_434.resolve();
        exportedName_434 = exportedName_434.val();
      } else {
        name_433 = name_433.resolve();
        exportedName_434 = exportedName_434.val();
      }
      return new _terms2.default("ExportSpecifier", { name: name_433, exportedName: exportedName_434 });
    }
  }, {
    key: "reduceImportSpecifier",
    value: function reduceImportSpecifier(node_435, state_436) {
      var name_437 = state_436.name ? state_436.name.resolve() : null;
      return new _terms2.default("ImportSpecifier", { name: name_437, binding: state_436.binding });
    }
  }, {
    key: "reduceIdentifierExpression",
    value: function reduceIdentifierExpression(node_438, state_439) {
      return new _terms2.default("IdentifierExpression", { name: node_438.name.resolve() });
    }
  }, {
    key: "reduceLiteralNumericExpression",
    value: function reduceLiteralNumericExpression(node_440, state_441) {
      return new _terms2.default("LiteralNumericExpression", { value: node_440.value.val() });
    }
  }, {
    key: "reduceLiteralBooleanExpression",
    value: function reduceLiteralBooleanExpression(node_442, state_443) {
      return new _terms2.default("LiteralBooleanExpression", { value: node_442.value.val() === "true" });
    }
  }, {
    key: "reduceLiteralStringExpression",
    value: function reduceLiteralStringExpression(node_444, state_445) {
      return new _terms2.default("LiteralStringExpression", { value: node_444.value.token.str });
    }
  }, {
    key: "reduceCallExpression",
    value: function reduceCallExpression(node_446, state_447) {
      return new _terms2.default("CallExpression", { callee: state_447.callee, arguments: state_447.arguments.toArray() });
    }
  }, {
    key: "reduceFunctionBody",
    value: function reduceFunctionBody(node_448, state_449) {
      return new _terms2.default("FunctionBody", { directives: state_449.directives.toArray(), statements: state_449.statements.toArray() });
    }
  }, {
    key: "reduceFormalParameters",
    value: function reduceFormalParameters(node_450, state_451) {
      return new _terms2.default("FormalParameters", { items: state_451.items.toArray(), rest: state_451.rest });
    }
  }, {
    key: "reduceBindingIdentifier",
    value: function reduceBindingIdentifier(node_452, state_453) {
      return new _terms2.default("BindingIdentifier", { name: node_452.name.resolve() });
    }
  }, {
    key: "reduceBinaryExpression",
    value: function reduceBinaryExpression(node_454, state_455) {
      return new _terms2.default("BinaryExpression", { left: state_455.left, operator: node_454.operator.val(), right: state_455.right });
    }
  }, {
    key: "reduceObjectExpression",
    value: function reduceObjectExpression(node_456, state_457) {
      return new _terms2.default("ObjectExpression", { properties: state_457.properties.toArray() });
    }
  }, {
    key: "reduceVariableDeclaration",
    value: function reduceVariableDeclaration(node_458, state_459) {
      return new _terms2.default("VariableDeclaration", { kind: state_459.kind, declarators: state_459.declarators.toArray() });
    }
  }, {
    key: "reduceStaticPropertyName",
    value: function reduceStaticPropertyName(node_460, state_461) {
      return new _terms2.default("StaticPropertyName", { value: node_460.value.val().toString() });
    }
  }, {
    key: "reduceArrayExpression",
    value: function reduceArrayExpression(node_462, state_463) {
      return new _terms2.default("ArrayExpression", { elements: state_463.elements.toArray() });
    }
  }, {
    key: "reduceStaticMemberExpression",
    value: function reduceStaticMemberExpression(node_464, state_465) {
      return new _terms2.default("StaticMemberExpression", { object: state_465.object, property: state_465.property.val() });
    }
  }]);

  return ParseReducer;
})(_shiftReducer.CloneReducer);

exports.default = ParseReducer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3BhcnNlLXJlZHVjZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUVxQixZQUFZO1lBQVosWUFBWTs7V0FBWixZQUFZOzBCQUFaLFlBQVk7O2tFQUFaLFlBQVk7OztlQUFaLFlBQVk7O2lDQUNsQixRQUFRLEVBQUUsU0FBUyxFQUFFO0FBQ2hDLGFBQU8sb0JBQVMsUUFBUSxFQUFFLEVBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEVBQUUsS0FBSyxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEVBQUMsQ0FBQyxDQUFDO0tBQzNHOzs7aUNBQ1ksUUFBUSxFQUFFLFNBQVMsRUFBRTtBQUNoQyxVQUFJLG1CQUFtQixHQUFHLFNBQVMsQ0FBQyxlQUFlLEdBQUcsU0FBUyxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFDN0YsYUFBTyxvQkFBUyxRQUFRLEVBQUUsRUFBQyxjQUFjLEVBQUUsU0FBUyxDQUFDLGNBQWMsRUFBRSxZQUFZLEVBQUUsU0FBUyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsRUFBRSxlQUFlLEVBQUUsbUJBQW1CLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDO0tBQzVMOzs7MENBQ3FCLFFBQVEsRUFBRSxTQUFTLEVBQUU7QUFDekMsVUFBSSxtQkFBbUIsR0FBRyxTQUFTLENBQUMsZUFBZSxHQUFHLFNBQVMsQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBQzdGLGFBQU8sb0JBQVMsaUJBQWlCLEVBQUUsRUFBQyxjQUFjLEVBQUUsU0FBUyxDQUFDLGNBQWMsRUFBRSxnQkFBZ0IsRUFBRSxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsZUFBZSxFQUFFLG1CQUFtQixFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQztL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QyxPQUFPLEVBQUUsRUFBQyxDQUFDLENBQUM7S0FDOUc7Ozs2Q0FDd0IsUUFBUSxFQUFFLFNBQVMsRUFBRTtBQUM1QyxhQUFPLG9CQUFTLG9CQUFvQixFQUFFLEVBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsUUFBUSxFQUFFLEVBQUMsQ0FBQyxDQUFDO0tBQ2pGOzs7MENBQ3FCLFFBQVEsRUFBRSxTQUFTLEVBQUU7QUFDekMsYUFBTyxvQkFBUyxpQkFBaUIsRUFBRSxFQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFDLENBQUMsQ0FBQztLQUM5RTs7O2lEQUM0QixRQUFRLEVBQUUsU0FBUyxFQUFFO0FBQ2hELGFBQU8sb0JBQVMsd0JBQXdCLEVBQUUsRUFBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsRUFBQyxDQUFDLENBQUM7S0FDM0c7OztTQS9Fa0IsWUFBWTs7O2tCQUFaLFlBQVkiLCJmaWxlIjoicGFyc2UtcmVkdWNlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBUZXJtIGZyb20gXCIuL3Rlcm1zXCI7XG5pbXBvcnQge0Nsb25lUmVkdWNlcn0gZnJvbSBcInNoaWZ0LXJlZHVjZXJcIjtcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhcnNlUmVkdWNlciBleHRlbmRzIENsb25lUmVkdWNlciB7XG4gIHJlZHVjZU1vZHVsZShub2RlXzQxNSwgc3RhdGVfNDE2KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiTW9kdWxlXCIsIHtkaXJlY3RpdmVzOiBzdGF0ZV80MTYuZGlyZWN0aXZlcy50b0FycmF5KCksIGl0ZW1zOiBzdGF0ZV80MTYuaXRlbXMudG9BcnJheSgpfSk7XG4gIH1cbiAgcmVkdWNlSW1wb3J0KG5vZGVfNDE3LCBzdGF0ZV80MTgpIHtcbiAgICBsZXQgbW9kdWxlU3BlY2lmaWVyXzQxOSA9IHN0YXRlXzQxOC5tb2R1bGVTcGVjaWZpZXIgPyBzdGF0ZV80MTgubW9kdWxlU3BlY2lmaWVyLnZhbCgpIDogbnVsbDtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJJbXBvcnRcIiwge2RlZmF1bHRCaW5kaW5nOiBzdGF0ZV80MTguZGVmYXVsdEJpbmRpbmcsIG5hbWVkSW1wb3J0czogc3RhdGVfNDE4Lm5hbWVkSW1wb3J0cy50b0FycmF5KCksIG1vZHVsZVNwZWNpZmllcjogbW9kdWxlU3BlY2lmaWVyXzQxOSwgZm9yU3ludGF4OiBub2RlXzQxNy5mb3JTeW50YXh9KTtcbiAgfVxuICByZWR1Y2VJbXBvcnROYW1lc3BhY2Uobm9kZV80MjAsIHN0YXRlXzQyMSkge1xuICAgIGxldCBtb2R1bGVTcGVjaWZpZXJfNDIyID0gc3RhdGVfNDIxLm1vZHVsZVNwZWNpZmllciA/IHN0YXRlXzQyMS5tb2R1bGVTcGVjaWZpZXIudmFsKCkgOiBudWxsO1xuICAgIHJldHVybiBuZXcgVGVybShcIkltcG9ydE5hbWVzcGFjZVwiLCB7ZGVmYXVsdEJpbmRpbmc6IHN0YXRlXzQyMS5kZWZhdWx0QmluZGluZywgbmFtZXNwYWNlQmluZGluZzogc3RhdGVfNDIxLm5hbWVzcGFjZUJpbmRpbmcsIG1vZHVsZVNwZWNpZmllcjogbW9kdWxlU3BlY2lmaWVyXzQyMiwgZm9yU3ludGF4OiBub2RlXzQyMC5mb3JTeW50YXh9KTtcbiAgfVxuICByZWR1Y2VFeHBvcnQobm9kZV80MjMsIHN0YXRlXzQyNCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydFwiLCB7ZGVjbGFyYXRpb246IHN0YXRlXzQyNC5kZWNsYXJhdGlvbn0pO1xuICB9XG4gIHJlZHVjZUV4cG9ydEFsbEZyb20obm9kZV80MjUsIHN0YXRlXzQyNikge1xuICAgIGxldCBtb2R1bGVTcGVjaWZpZXJfNDI3ID0gc3RhdGVfNDI2Lm1vZHVsZVNwZWNpZmllciA/IHN0YXRlXzQyNi5tb2R1bGVTcGVjaWZpZXIudmFsKCkgOiBudWxsO1xuICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydEFsbEZyb21cIiwge21vZHVsZVNwZWNpZmllcjogbW9kdWxlU3BlY2lmaWVyXzQyN30pO1xuICB9XG4gIHJlZHVjZUV4cG9ydEZyb20obm9kZV80MjgsIHN0YXRlXzQyOSkge1xuICAgIGxldCBtb2R1bGVTcGVjaWZpZXJfNDMwID0gc3RhdGVfNDI5Lm1vZHVsZVNwZWNpZmllciA/IHN0YXRlXzQyOS5tb2R1bGVTcGVjaWZpZXIudmFsKCkgOiBudWxsO1xuICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydEZyb21cIiwge21vZHVsZVNwZWNpZmllcjogbW9kdWxlU3BlY2lmaWVyXzQzMCwgbmFtZWRFeHBvcnRzOiBzdGF0ZV80MjkubmFtZWRFeHBvcnRzLnRvQXJyYXkoKX0pO1xuICB9XG4gIHJlZHVjZUV4cG9ydFNwZWNpZmllcihub2RlXzQzMSwgc3RhdGVfNDMyKSB7XG4gICAgbGV0IG5hbWVfNDMzID0gc3RhdGVfNDMyLm5hbWUsIGV4cG9ydGVkTmFtZV80MzQgPSBzdGF0ZV80MzIuZXhwb3J0ZWROYW1lO1xuICAgIGlmIChuYW1lXzQzMyA9PSBudWxsKSB7XG4gICAgICBuYW1lXzQzMyA9IGV4cG9ydGVkTmFtZV80MzQucmVzb2x2ZSgpO1xuICAgICAgZXhwb3J0ZWROYW1lXzQzNCA9IGV4cG9ydGVkTmFtZV80MzQudmFsKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5hbWVfNDMzID0gbmFtZV80MzMucmVzb2x2ZSgpO1xuICAgICAgZXhwb3J0ZWROYW1lXzQzNCA9IGV4cG9ydGVkTmFtZV80MzQudmFsKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydFNwZWNpZmllclwiLCB7bmFtZTogbmFtZV80MzMsIGV4cG9ydGVkTmFtZTogZXhwb3J0ZWROYW1lXzQzNH0pO1xuICB9XG4gIHJlZHVjZUltcG9ydFNwZWNpZmllcihub2RlXzQzNSwgc3RhdGVfNDM2KSB7XG4gICAgbGV0IG5hbWVfNDM3ID0gc3RhdGVfNDM2Lm5hbWUgPyBzdGF0ZV80MzYubmFtZS5yZXNvbHZlKCkgOiBudWxsO1xuICAgIHJldHVybiBuZXcgVGVybShcIkltcG9ydFNwZWNpZmllclwiLCB7bmFtZTogbmFtZV80MzcsIGJpbmRpbmc6IHN0YXRlXzQzNi5iaW5kaW5nfSk7XG4gIH1cbiAgcmVkdWNlSWRlbnRpZmllckV4cHJlc3Npb24obm9kZV80MzgsIHN0YXRlXzQzOSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIklkZW50aWZpZXJFeHByZXNzaW9uXCIsIHtuYW1lOiBub2RlXzQzOC5uYW1lLnJlc29sdmUoKX0pO1xuICB9XG4gIHJlZHVjZUxpdGVyYWxOdW1lcmljRXhwcmVzc2lvbihub2RlXzQ0MCwgc3RhdGVfNDQxKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiTGl0ZXJhbE51bWVyaWNFeHByZXNzaW9uXCIsIHt2YWx1ZTogbm9kZV80NDAudmFsdWUudmFsKCl9KTtcbiAgfVxuICByZWR1Y2VMaXRlcmFsQm9vbGVhbkV4cHJlc3Npb24obm9kZV80NDIsIHN0YXRlXzQ0Mykge1xuICAgIHJldHVybiBuZXcgVGVybShcIkxpdGVyYWxCb29sZWFuRXhwcmVzc2lvblwiLCB7dmFsdWU6IG5vZGVfNDQyLnZhbHVlLnZhbCgpID09PSBcInRydWVcIn0pO1xuICB9XG4gIHJlZHVjZUxpdGVyYWxTdHJpbmdFeHByZXNzaW9uKG5vZGVfNDQ0LCBzdGF0ZV80NDUpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJMaXRlcmFsU3RyaW5nRXhwcmVzc2lvblwiLCB7dmFsdWU6IG5vZGVfNDQ0LnZhbHVlLnRva2VuLnN0cn0pO1xuICB9XG4gIHJlZHVjZUNhbGxFeHByZXNzaW9uKG5vZGVfNDQ2LCBzdGF0ZV80NDcpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDYWxsRXhwcmVzc2lvblwiLCB7Y2FsbGVlOiBzdGF0ZV80NDcuY2FsbGVlLCBhcmd1bWVudHM6IHN0YXRlXzQ0Ny5hcmd1bWVudHMudG9BcnJheSgpfSk7XG4gIH1cbiAgcmVkdWNlRnVuY3Rpb25Cb2R5KG5vZGVfNDQ4LCBzdGF0ZV80NDkpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJGdW5jdGlvbkJvZHlcIiwge2RpcmVjdGl2ZXM6IHN0YXRlXzQ0OS5kaXJlY3RpdmVzLnRvQXJyYXkoKSwgc3RhdGVtZW50czogc3RhdGVfNDQ5LnN0YXRlbWVudHMudG9BcnJheSgpfSk7XG4gIH1cbiAgcmVkdWNlRm9ybWFsUGFyYW1ldGVycyhub2RlXzQ1MCwgc3RhdGVfNDUxKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRm9ybWFsUGFyYW1ldGVyc1wiLCB7aXRlbXM6IHN0YXRlXzQ1MS5pdGVtcy50b0FycmF5KCksIHJlc3Q6IHN0YXRlXzQ1MS5yZXN0fSk7XG4gIH1cbiAgcmVkdWNlQmluZGluZ0lkZW50aWZpZXIobm9kZV80NTIsIHN0YXRlXzQ1Mykge1xuICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiBub2RlXzQ1Mi5uYW1lLnJlc29sdmUoKX0pO1xuICB9XG4gIHJlZHVjZUJpbmFyeUV4cHJlc3Npb24obm9kZV80NTQsIHN0YXRlXzQ1NSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkJpbmFyeUV4cHJlc3Npb25cIiwge2xlZnQ6IHN0YXRlXzQ1NS5sZWZ0LCBvcGVyYXRvcjogbm9kZV80NTQub3BlcmF0b3IudmFsKCksIHJpZ2h0OiBzdGF0ZV80NTUucmlnaHR9KTtcbiAgfVxuICByZWR1Y2VPYmplY3RFeHByZXNzaW9uKG5vZGVfNDU2LCBzdGF0ZV80NTcpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJPYmplY3RFeHByZXNzaW9uXCIsIHtwcm9wZXJ0aWVzOiBzdGF0ZV80NTcucHJvcGVydGllcy50b0FycmF5KCl9KTtcbiAgfVxuICByZWR1Y2VWYXJpYWJsZURlY2xhcmF0aW9uKG5vZGVfNDU4LCBzdGF0ZV80NTkpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJWYXJpYWJsZURlY2xhcmF0aW9uXCIsIHtraW5kOiBzdGF0ZV80NTkua2luZCwgZGVjbGFyYXRvcnM6IHN0YXRlXzQ1OS5kZWNsYXJhdG9ycy50b0FycmF5KCl9KTtcbiAgfVxuICByZWR1Y2VTdGF0aWNQcm9wZXJ0eU5hbWUobm9kZV80NjAsIHN0YXRlXzQ2MSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlN0YXRpY1Byb3BlcnR5TmFtZVwiLCB7dmFsdWU6IG5vZGVfNDYwLnZhbHVlLnZhbCgpLnRvU3RyaW5nKCl9KTtcbiAgfVxuICByZWR1Y2VBcnJheUV4cHJlc3Npb24obm9kZV80NjIsIHN0YXRlXzQ2Mykge1xuICAgIHJldHVybiBuZXcgVGVybShcIkFycmF5RXhwcmVzc2lvblwiLCB7ZWxlbWVudHM6IHN0YXRlXzQ2My5lbGVtZW50cy50b0FycmF5KCl9KTtcbiAgfVxuICByZWR1Y2VTdGF0aWNNZW1iZXJFeHByZXNzaW9uKG5vZGVfNDY0LCBzdGF0ZV80NjUpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTdGF0aWNNZW1iZXJFeHByZXNzaW9uXCIsIHtvYmplY3Q6IHN0YXRlXzQ2NS5vYmplY3QsIHByb3BlcnR5OiBzdGF0ZV80NjUucHJvcGVydHkudmFsKCl9KTtcbiAgfVxufVxuIl19