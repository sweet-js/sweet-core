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
    value: function reduceModule(node_418, state_419) {
      return new _terms2.default("Module", { directives: state_419.directives.toArray(), items: state_419.items.toArray() });
    }
  }, {
    key: "reduceImport",
    value: function reduceImport(node_420, state_421) {
      var moduleSpecifier_422 = state_421.moduleSpecifier ? state_421.moduleSpecifier.val() : null;
      return new _terms2.default("Import", { defaultBinding: state_421.defaultBinding, namedImports: state_421.namedImports.toArray(), moduleSpecifier: moduleSpecifier_422, forSyntax: node_420.forSyntax });
    }
  }, {
    key: "reduceImportNamespace",
    value: function reduceImportNamespace(node_423, state_424) {
      var moduleSpecifier_425 = state_424.moduleSpecifier ? state_424.moduleSpecifier.val() : null;
      return new _terms2.default("ImportNamespace", { defaultBinding: state_424.defaultBinding, namespaceBinding: state_424.namespaceBinding, moduleSpecifier: moduleSpecifier_425, forSyntax: node_423.forSyntax });
    }
  }, {
    key: "reduceExport",
    value: function reduceExport(node_426, state_427) {
      return new _terms2.default("Export", { declaration: state_427.declaration });
    }
  }, {
    key: "reduceExportAllFrom",
    value: function reduceExportAllFrom(node_428, state_429) {
      var moduleSpecifier_430 = state_429.moduleSpecifier ? state_429.moduleSpecifier.val() : null;
      return new _terms2.default("ExportAllFrom", { moduleSpecifier: moduleSpecifier_430 });
    }
  }, {
    key: "reduceExportFrom",
    value: function reduceExportFrom(node_431, state_432) {
      var moduleSpecifier_433 = state_432.moduleSpecifier ? state_432.moduleSpecifier.val() : null;
      return new _terms2.default("ExportFrom", { moduleSpecifier: moduleSpecifier_433, namedExports: state_432.namedExports.toArray() });
    }
  }, {
    key: "reduceExportSpecifier",
    value: function reduceExportSpecifier(node_434, state_435) {
      var name_436 = state_435.name,
          exportedName_437 = state_435.exportedName;
      if (name_436 == null) {
        name_436 = exportedName_437.resolve();
        exportedName_437 = exportedName_437.val();
      } else {
        name_436 = name_436.resolve();
        exportedName_437 = exportedName_437.val();
      }
      return new _terms2.default("ExportSpecifier", { name: name_436, exportedName: exportedName_437 });
    }
  }, {
    key: "reduceImportSpecifier",
    value: function reduceImportSpecifier(node_438, state_439) {
      var name_440 = state_439.name ? state_439.name.resolve() : null;
      return new _terms2.default("ImportSpecifier", { name: name_440, binding: state_439.binding });
    }
  }, {
    key: "reduceIdentifierExpression",
    value: function reduceIdentifierExpression(node_441, state_442) {
      return new _terms2.default("IdentifierExpression", { name: node_441.name.resolve() });
    }
  }, {
    key: "reduceLiteralNumericExpression",
    value: function reduceLiteralNumericExpression(node_443, state_444) {
      return new _terms2.default("LiteralNumericExpression", { value: node_443.value.val() });
    }
  }, {
    key: "reduceLiteralBooleanExpression",
    value: function reduceLiteralBooleanExpression(node_445, state_446) {
      return new _terms2.default("LiteralBooleanExpression", { value: node_445.value.val() === "true" });
    }
  }, {
    key: "reduceLiteralStringExpression",
    value: function reduceLiteralStringExpression(node_447, state_448) {
      return new _terms2.default("LiteralStringExpression", { value: node_447.value.token.str });
    }
  }, {
    key: "reduceCallExpression",
    value: function reduceCallExpression(node_449, state_450) {
      return new _terms2.default("CallExpression", { callee: state_450.callee, arguments: state_450.arguments.toArray() });
    }
  }, {
    key: "reduceFunctionBody",
    value: function reduceFunctionBody(node_451, state_452) {
      return new _terms2.default("FunctionBody", { directives: state_452.directives.toArray(), statements: state_452.statements.toArray() });
    }
  }, {
    key: "reduceFormalParameters",
    value: function reduceFormalParameters(node_453, state_454) {
      return new _terms2.default("FormalParameters", { items: state_454.items.toArray(), rest: state_454.rest });
    }
  }, {
    key: "reduceBindingIdentifier",
    value: function reduceBindingIdentifier(node_455, state_456) {
      return new _terms2.default("BindingIdentifier", { name: node_455.name.resolve() });
    }
  }, {
    key: "reduceBinaryExpression",
    value: function reduceBinaryExpression(node_457, state_458) {
      return new _terms2.default("BinaryExpression", { left: state_458.left, operator: node_457.operator.val(), right: state_458.right });
    }
  }, {
    key: "reduceObjectExpression",
    value: function reduceObjectExpression(node_459, state_460) {
      return new _terms2.default("ObjectExpression", { properties: state_460.properties.toArray() });
    }
  }, {
    key: "reduceVariableDeclaration",
    value: function reduceVariableDeclaration(node_461, state_462) {
      return new _terms2.default("VariableDeclaration", { kind: state_462.kind, declarators: state_462.declarators.toArray() });
    }
  }, {
    key: "reduceStaticPropertyName",
    value: function reduceStaticPropertyName(node_463, state_464) {
      return new _terms2.default("StaticPropertyName", { value: node_463.value.val().toString() });
    }
  }, {
    key: "reduceArrayExpression",
    value: function reduceArrayExpression(node_465, state_466) {
      return new _terms2.default("ArrayExpression", { elements: state_466.elements.toArray() });
    }
  }, {
    key: "reduceStaticMemberExpression",
    value: function reduceStaticMemberExpression(node_467, state_468) {
      return new _terms2.default("StaticMemberExpression", { object: state_468.object, property: state_468.property.val() });
    }
  }]);

  return ParseReducer;
})(_shiftReducer.CloneReducer);

exports.default = ParseReducer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3BhcnNlLXJlZHVjZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUVxQixZQUFZO1lBQVosWUFBWTs7V0FBWixZQUFZOzBCQUFaLFlBQVk7O2tFQUFaLFlBQVk7OztlQUFaLFlBQVk7O2lDQUNsQixRQUFRLEVBQUUsU0FBUyxFQUFFO0FBQ2hDLGFBQU8sb0JBQVMsUUFBUSxFQUFFLEVBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEVBQUUsS0FBSyxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEVBQUMsQ0FBQyxDQUFDO0tBQzNHOzs7aUNBQ1ksUUFBUSxFQUFFLFNBQVMsRUFBRTtBQUNoQyxVQUFJLG1CQUFtQixHQUFHLFNBQVMsQ0FBQyxlQUFlLEdBQUcsU0FBUyxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFDN0YsYUFBTyxvQkFBUyxRQUFRLEVBQUUsRUFBQyxjQUFjLEVBQUUsU0FBUyxDQUFDLGNBQWMsRUFBRSxZQUFZLEVBQUUsU0FBUyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsRUFBRSxlQUFlLEVBQUUsbUJBQW1CLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDO0tBQzVMOzs7MENBQ3FCLFFBQVEsRUFBRSxTQUFTLEVBQUU7QUFDekMsVUFBSSxtQkFBbUIsR0FBRyxTQUFTLENBQUMsZUFBZSxHQUFHLFNBQVMsQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBQzdGLGFBQU8sb0JBQVMsaUJBQWlCLEVBQUUsRUFBQyxjQUFjLEVBQUUsU0FBUyxDQUFDLGNBQWMsRUFBRSxnQkFBZ0IsRUFBRSxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsZUFBZSxFQUFFLG1CQUFtQixFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQztL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QyxPQUFPLEVBQUUsRUFBQyxDQUFDLENBQUM7S0FDOUc7Ozs2Q0FDd0IsUUFBUSxFQUFFLFNBQVMsRUFBRTtBQUM1QyxhQUFPLG9CQUFTLG9CQUFvQixFQUFFLEVBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsUUFBUSxFQUFFLEVBQUMsQ0FBQyxDQUFDO0tBQ2pGOzs7MENBQ3FCLFFBQVEsRUFBRSxTQUFTLEVBQUU7QUFDekMsYUFBTyxvQkFBUyxpQkFBaUIsRUFBRSxFQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFDLENBQUMsQ0FBQztLQUM5RTs7O2lEQUM0QixRQUFRLEVBQUUsU0FBUyxFQUFFO0FBQ2hELGFBQU8sb0JBQVMsd0JBQXdCLEVBQUUsRUFBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsRUFBQyxDQUFDLENBQUM7S0FDM0c7OztTQS9Fa0IsWUFBWTs7O2tCQUFaLFlBQVkiLCJmaWxlIjoicGFyc2UtcmVkdWNlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBUZXJtIGZyb20gXCIuL3Rlcm1zXCI7XG5pbXBvcnQge0Nsb25lUmVkdWNlcn0gZnJvbSBcInNoaWZ0LXJlZHVjZXJcIjtcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhcnNlUmVkdWNlciBleHRlbmRzIENsb25lUmVkdWNlciB7XG4gIHJlZHVjZU1vZHVsZShub2RlXzQxOCwgc3RhdGVfNDE5KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiTW9kdWxlXCIsIHtkaXJlY3RpdmVzOiBzdGF0ZV80MTkuZGlyZWN0aXZlcy50b0FycmF5KCksIGl0ZW1zOiBzdGF0ZV80MTkuaXRlbXMudG9BcnJheSgpfSk7XG4gIH1cbiAgcmVkdWNlSW1wb3J0KG5vZGVfNDIwLCBzdGF0ZV80MjEpIHtcbiAgICBsZXQgbW9kdWxlU3BlY2lmaWVyXzQyMiA9IHN0YXRlXzQyMS5tb2R1bGVTcGVjaWZpZXIgPyBzdGF0ZV80MjEubW9kdWxlU3BlY2lmaWVyLnZhbCgpIDogbnVsbDtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJJbXBvcnRcIiwge2RlZmF1bHRCaW5kaW5nOiBzdGF0ZV80MjEuZGVmYXVsdEJpbmRpbmcsIG5hbWVkSW1wb3J0czogc3RhdGVfNDIxLm5hbWVkSW1wb3J0cy50b0FycmF5KCksIG1vZHVsZVNwZWNpZmllcjogbW9kdWxlU3BlY2lmaWVyXzQyMiwgZm9yU3ludGF4OiBub2RlXzQyMC5mb3JTeW50YXh9KTtcbiAgfVxuICByZWR1Y2VJbXBvcnROYW1lc3BhY2Uobm9kZV80MjMsIHN0YXRlXzQyNCkge1xuICAgIGxldCBtb2R1bGVTcGVjaWZpZXJfNDI1ID0gc3RhdGVfNDI0Lm1vZHVsZVNwZWNpZmllciA/IHN0YXRlXzQyNC5tb2R1bGVTcGVjaWZpZXIudmFsKCkgOiBudWxsO1xuICAgIHJldHVybiBuZXcgVGVybShcIkltcG9ydE5hbWVzcGFjZVwiLCB7ZGVmYXVsdEJpbmRpbmc6IHN0YXRlXzQyNC5kZWZhdWx0QmluZGluZywgbmFtZXNwYWNlQmluZGluZzogc3RhdGVfNDI0Lm5hbWVzcGFjZUJpbmRpbmcsIG1vZHVsZVNwZWNpZmllcjogbW9kdWxlU3BlY2lmaWVyXzQyNSwgZm9yU3ludGF4OiBub2RlXzQyMy5mb3JTeW50YXh9KTtcbiAgfVxuICByZWR1Y2VFeHBvcnQobm9kZV80MjYsIHN0YXRlXzQyNykge1xuICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydFwiLCB7ZGVjbGFyYXRpb246IHN0YXRlXzQyNy5kZWNsYXJhdGlvbn0pO1xuICB9XG4gIHJlZHVjZUV4cG9ydEFsbEZyb20obm9kZV80MjgsIHN0YXRlXzQyOSkge1xuICAgIGxldCBtb2R1bGVTcGVjaWZpZXJfNDMwID0gc3RhdGVfNDI5Lm1vZHVsZVNwZWNpZmllciA/IHN0YXRlXzQyOS5tb2R1bGVTcGVjaWZpZXIudmFsKCkgOiBudWxsO1xuICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydEFsbEZyb21cIiwge21vZHVsZVNwZWNpZmllcjogbW9kdWxlU3BlY2lmaWVyXzQzMH0pO1xuICB9XG4gIHJlZHVjZUV4cG9ydEZyb20obm9kZV80MzEsIHN0YXRlXzQzMikge1xuICAgIGxldCBtb2R1bGVTcGVjaWZpZXJfNDMzID0gc3RhdGVfNDMyLm1vZHVsZVNwZWNpZmllciA/IHN0YXRlXzQzMi5tb2R1bGVTcGVjaWZpZXIudmFsKCkgOiBudWxsO1xuICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydEZyb21cIiwge21vZHVsZVNwZWNpZmllcjogbW9kdWxlU3BlY2lmaWVyXzQzMywgbmFtZWRFeHBvcnRzOiBzdGF0ZV80MzIubmFtZWRFeHBvcnRzLnRvQXJyYXkoKX0pO1xuICB9XG4gIHJlZHVjZUV4cG9ydFNwZWNpZmllcihub2RlXzQzNCwgc3RhdGVfNDM1KSB7XG4gICAgbGV0IG5hbWVfNDM2ID0gc3RhdGVfNDM1Lm5hbWUsIGV4cG9ydGVkTmFtZV80MzcgPSBzdGF0ZV80MzUuZXhwb3J0ZWROYW1lO1xuICAgIGlmIChuYW1lXzQzNiA9PSBudWxsKSB7XG4gICAgICBuYW1lXzQzNiA9IGV4cG9ydGVkTmFtZV80MzcucmVzb2x2ZSgpO1xuICAgICAgZXhwb3J0ZWROYW1lXzQzNyA9IGV4cG9ydGVkTmFtZV80MzcudmFsKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5hbWVfNDM2ID0gbmFtZV80MzYucmVzb2x2ZSgpO1xuICAgICAgZXhwb3J0ZWROYW1lXzQzNyA9IGV4cG9ydGVkTmFtZV80MzcudmFsKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVybShcIkV4cG9ydFNwZWNpZmllclwiLCB7bmFtZTogbmFtZV80MzYsIGV4cG9ydGVkTmFtZTogZXhwb3J0ZWROYW1lXzQzN30pO1xuICB9XG4gIHJlZHVjZUltcG9ydFNwZWNpZmllcihub2RlXzQzOCwgc3RhdGVfNDM5KSB7XG4gICAgbGV0IG5hbWVfNDQwID0gc3RhdGVfNDM5Lm5hbWUgPyBzdGF0ZV80MzkubmFtZS5yZXNvbHZlKCkgOiBudWxsO1xuICAgIHJldHVybiBuZXcgVGVybShcIkltcG9ydFNwZWNpZmllclwiLCB7bmFtZTogbmFtZV80NDAsIGJpbmRpbmc6IHN0YXRlXzQzOS5iaW5kaW5nfSk7XG4gIH1cbiAgcmVkdWNlSWRlbnRpZmllckV4cHJlc3Npb24obm9kZV80NDEsIHN0YXRlXzQ0Mikge1xuICAgIHJldHVybiBuZXcgVGVybShcIklkZW50aWZpZXJFeHByZXNzaW9uXCIsIHtuYW1lOiBub2RlXzQ0MS5uYW1lLnJlc29sdmUoKX0pO1xuICB9XG4gIHJlZHVjZUxpdGVyYWxOdW1lcmljRXhwcmVzc2lvbihub2RlXzQ0Mywgc3RhdGVfNDQ0KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiTGl0ZXJhbE51bWVyaWNFeHByZXNzaW9uXCIsIHt2YWx1ZTogbm9kZV80NDMudmFsdWUudmFsKCl9KTtcbiAgfVxuICByZWR1Y2VMaXRlcmFsQm9vbGVhbkV4cHJlc3Npb24obm9kZV80NDUsIHN0YXRlXzQ0Nikge1xuICAgIHJldHVybiBuZXcgVGVybShcIkxpdGVyYWxCb29sZWFuRXhwcmVzc2lvblwiLCB7dmFsdWU6IG5vZGVfNDQ1LnZhbHVlLnZhbCgpID09PSBcInRydWVcIn0pO1xuICB9XG4gIHJlZHVjZUxpdGVyYWxTdHJpbmdFeHByZXNzaW9uKG5vZGVfNDQ3LCBzdGF0ZV80NDgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJMaXRlcmFsU3RyaW5nRXhwcmVzc2lvblwiLCB7dmFsdWU6IG5vZGVfNDQ3LnZhbHVlLnRva2VuLnN0cn0pO1xuICB9XG4gIHJlZHVjZUNhbGxFeHByZXNzaW9uKG5vZGVfNDQ5LCBzdGF0ZV80NTApIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDYWxsRXhwcmVzc2lvblwiLCB7Y2FsbGVlOiBzdGF0ZV80NTAuY2FsbGVlLCBhcmd1bWVudHM6IHN0YXRlXzQ1MC5hcmd1bWVudHMudG9BcnJheSgpfSk7XG4gIH1cbiAgcmVkdWNlRnVuY3Rpb25Cb2R5KG5vZGVfNDUxLCBzdGF0ZV80NTIpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJGdW5jdGlvbkJvZHlcIiwge2RpcmVjdGl2ZXM6IHN0YXRlXzQ1Mi5kaXJlY3RpdmVzLnRvQXJyYXkoKSwgc3RhdGVtZW50czogc3RhdGVfNDUyLnN0YXRlbWVudHMudG9BcnJheSgpfSk7XG4gIH1cbiAgcmVkdWNlRm9ybWFsUGFyYW1ldGVycyhub2RlXzQ1Mywgc3RhdGVfNDU0KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRm9ybWFsUGFyYW1ldGVyc1wiLCB7aXRlbXM6IHN0YXRlXzQ1NC5pdGVtcy50b0FycmF5KCksIHJlc3Q6IHN0YXRlXzQ1NC5yZXN0fSk7XG4gIH1cbiAgcmVkdWNlQmluZGluZ0lkZW50aWZpZXIobm9kZV80NTUsIHN0YXRlXzQ1Nikge1xuICAgIHJldHVybiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiBub2RlXzQ1NS5uYW1lLnJlc29sdmUoKX0pO1xuICB9XG4gIHJlZHVjZUJpbmFyeUV4cHJlc3Npb24obm9kZV80NTcsIHN0YXRlXzQ1OCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkJpbmFyeUV4cHJlc3Npb25cIiwge2xlZnQ6IHN0YXRlXzQ1OC5sZWZ0LCBvcGVyYXRvcjogbm9kZV80NTcub3BlcmF0b3IudmFsKCksIHJpZ2h0OiBzdGF0ZV80NTgucmlnaHR9KTtcbiAgfVxuICByZWR1Y2VPYmplY3RFeHByZXNzaW9uKG5vZGVfNDU5LCBzdGF0ZV80NjApIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJPYmplY3RFeHByZXNzaW9uXCIsIHtwcm9wZXJ0aWVzOiBzdGF0ZV80NjAucHJvcGVydGllcy50b0FycmF5KCl9KTtcbiAgfVxuICByZWR1Y2VWYXJpYWJsZURlY2xhcmF0aW9uKG5vZGVfNDYxLCBzdGF0ZV80NjIpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJWYXJpYWJsZURlY2xhcmF0aW9uXCIsIHtraW5kOiBzdGF0ZV80NjIua2luZCwgZGVjbGFyYXRvcnM6IHN0YXRlXzQ2Mi5kZWNsYXJhdG9ycy50b0FycmF5KCl9KTtcbiAgfVxuICByZWR1Y2VTdGF0aWNQcm9wZXJ0eU5hbWUobm9kZV80NjMsIHN0YXRlXzQ2NCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlN0YXRpY1Byb3BlcnR5TmFtZVwiLCB7dmFsdWU6IG5vZGVfNDYzLnZhbHVlLnZhbCgpLnRvU3RyaW5nKCl9KTtcbiAgfVxuICByZWR1Y2VBcnJheUV4cHJlc3Npb24obm9kZV80NjUsIHN0YXRlXzQ2Nikge1xuICAgIHJldHVybiBuZXcgVGVybShcIkFycmF5RXhwcmVzc2lvblwiLCB7ZWxlbWVudHM6IHN0YXRlXzQ2Ni5lbGVtZW50cy50b0FycmF5KCl9KTtcbiAgfVxuICByZWR1Y2VTdGF0aWNNZW1iZXJFeHByZXNzaW9uKG5vZGVfNDY3LCBzdGF0ZV80NjgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJTdGF0aWNNZW1iZXJFeHByZXNzaW9uXCIsIHtvYmplY3Q6IHN0YXRlXzQ2OC5vYmplY3QsIHByb3BlcnR5OiBzdGF0ZV80NjgucHJvcGVydHkudmFsKCl9KTtcbiAgfVxufVxuIl19