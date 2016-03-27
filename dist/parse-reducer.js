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
    value: function reduceModule(node_412, state_413) {
      return new _terms2.default("Module", { directives: state_413.directives.toArray(), items: state_413.items.toArray() });
    }
  }, {
    key: "reduceImport",
    value: function reduceImport(node_414, state_415) {
      var moduleSpecifier_416 = state_415.moduleSpecifier ? state_415.moduleSpecifier.val() : null;
      return new _terms2.default("Import", { defaultBinding: state_415.defaultBinding, namedImports: state_415.namedImports.toArray(), moduleSpecifier: moduleSpecifier_416, forSyntax: node_414.forSyntax });
    }
  }, {
    key: "reduceImportNamespace",
    value: function reduceImportNamespace(node_417, state_418) {
      var moduleSpecifier_419 = state_418.moduleSpecifier ? state_418.moduleSpecifier.val() : null;
      return new _terms2.default("ImportNamespace", { defaultBinding: state_418.defaultBinding, namespaceBinding: state_418.namespaceBinding, moduleSpecifier: moduleSpecifier_419, forSyntax: node_417.forSyntax });
    }
  }, {
    key: "reduceExport",
    value: function reduceExport(node_420, state_421) {
      return new _terms2.default("Export", { declaration: state_421.declaration });
    }
  }, {
    key: "reduceExportAllFrom",
    value: function reduceExportAllFrom(node_422, state_423) {
      var moduleSpecifier_424 = state_423.moduleSpecifier ? state_423.moduleSpecifier.val() : null;
      return new _terms2.default("ExportAllFrom", { moduleSpecifier: moduleSpecifier_424 });
    }
  }, {
    key: "reduceExportFrom",
    value: function reduceExportFrom(node_425, state_426) {
      var moduleSpecifier_427 = state_426.moduleSpecifier ? state_426.moduleSpecifier.val() : null;
      return new _terms2.default("ExportFrom", { moduleSpecifier: moduleSpecifier_427, namedExports: state_426.namedExports.toArray() });
    }
  }, {
    key: "reduceExportSpecifier",
    value: function reduceExportSpecifier(node_428, state_429) {
      var name_430 = state_429.name,
          exportedName_431 = state_429.exportedName;
      if (name_430 == null) {
        name_430 = exportedName_431.resolve();
        exportedName_431 = exportedName_431.val();
      } else {
        name_430 = name_430.resolve();
        exportedName_431 = exportedName_431.val();
      }
      return new _terms2.default("ExportSpecifier", { name: name_430, exportedName: exportedName_431 });
    }
  }, {
    key: "reduceImportSpecifier",
    value: function reduceImportSpecifier(node_432, state_433) {
      var name_434 = state_433.name ? state_433.name.resolve() : null;
      return new _terms2.default("ImportSpecifier", { name: name_434, binding: state_433.binding });
    }
  }, {
    key: "reduceIdentifierExpression",
    value: function reduceIdentifierExpression(node_435, state_436) {
      return new _terms2.default("IdentifierExpression", { name: node_435.name.resolve() });
    }
  }, {
    key: "reduceLiteralNumericExpression",
    value: function reduceLiteralNumericExpression(node_437, state_438) {
      return new _terms2.default("LiteralNumericExpression", { value: node_437.value.val() });
    }
  }, {
    key: "reduceLiteralBooleanExpression",
    value: function reduceLiteralBooleanExpression(node_439, state_440) {
      return new _terms2.default("LiteralBooleanExpression", { value: node_439.value.val() === "true" });
    }
  }, {
    key: "reduceLiteralStringExpression",
    value: function reduceLiteralStringExpression(node_441, state_442) {
      return new _terms2.default("LiteralStringExpression", { value: node_441.value.token.str });
    }
  }, {
    key: "reduceCallExpression",
    value: function reduceCallExpression(node_443, state_444) {
      return new _terms2.default("CallExpression", { callee: state_444.callee, arguments: state_444.arguments.toArray() });
    }
  }, {
    key: "reduceFunctionBody",
    value: function reduceFunctionBody(node_445, state_446) {
      return new _terms2.default("FunctionBody", { directives: state_446.directives.toArray(), statements: state_446.statements.toArray() });
    }
  }, {
    key: "reduceFormalParameters",
    value: function reduceFormalParameters(node_447, state_448) {
      return new _terms2.default("FormalParameters", { items: state_448.items.toArray(), rest: state_448.rest });
    }
  }, {
    key: "reduceBindingIdentifier",
    value: function reduceBindingIdentifier(node_449, state_450) {
      return new _terms2.default("BindingIdentifier", { name: node_449.name.resolve() });
    }
  }, {
    key: "reduceBinaryExpression",
    value: function reduceBinaryExpression(node_451, state_452) {
      return new _terms2.default("BinaryExpression", { left: state_452.left, operator: node_451.operator.val(), right: state_452.right });
    }
  }, {
    key: "reduceObjectExpression",
    value: function reduceObjectExpression(node_453, state_454) {
      return new _terms2.default("ObjectExpression", { properties: state_454.properties.toArray() });
    }
  }, {
    key: "reduceVariableDeclaration",
    value: function reduceVariableDeclaration(node_455, state_456) {
      return new _terms2.default("VariableDeclaration", { kind: state_456.kind, declarators: state_456.declarators.toArray() });
    }
  }, {
    key: "reduceStaticPropertyName",
    value: function reduceStaticPropertyName(node_457, state_458) {
      return new _terms2.default("StaticPropertyName", { value: node_457.value.val().toString() });
    }
  }, {
    key: "reduceArrayExpression",
    value: function reduceArrayExpression(node_459, state_460) {
      return new _terms2.default("ArrayExpression", { elements: state_460.elements.toArray() });
    }
  }, {
    key: "reduceStaticMemberExpression",
    value: function reduceStaticMemberExpression(node_461, state_462) {
      return new _terms2.default("StaticMemberExpression", { object: state_462.object, property: state_462.property.val() });
    }
  }]);

  return ParseReducer;
}(_shiftReducer.CloneReducer);

exports.default = ParseReducer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3BhcnNlLXJlZHVjZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7OztBQUNBOzs7Ozs7Ozs7O0lBQ3FCOzs7Ozs7Ozs7OztpQ0FDTixVQUFVLFdBQVc7QUFDaEMsYUFBTyxvQkFBUyxRQUFULEVBQW1CLEVBQUMsWUFBWSxVQUFVLFVBQVYsQ0FBcUIsT0FBckIsRUFBWixFQUE0QyxPQUFPLFVBQVUsS0FBVixDQUFnQixPQUFoQixFQUFQLEVBQWhFLENBQVAsQ0FEZ0M7Ozs7aUNBR3JCLFVBQVUsV0FBVztBQUNoQyxVQUFJLHNCQUFzQixVQUFVLGVBQVYsR0FBNEIsVUFBVSxlQUFWLENBQTBCLEdBQTFCLEVBQTVCLEdBQThELElBQTlELENBRE07QUFFaEMsYUFBTyxvQkFBUyxRQUFULEVBQW1CLEVBQUMsZ0JBQWdCLFVBQVUsY0FBVixFQUEwQixjQUFjLFVBQVUsWUFBVixDQUF1QixPQUF2QixFQUFkLEVBQWdELGlCQUFpQixtQkFBakIsRUFBc0MsV0FBVyxTQUFTLFNBQVQsRUFBL0osQ0FBUCxDQUZnQzs7OzswQ0FJWixVQUFVLFdBQVc7QUFDekMsVUFBSSxzQkFBc0IsVUFBVSxlQUFWLEdBQTRCLFVBQVUsZUFBVixDQUEwQixHQUExQixFQUE1QixHQUE4RCxJQUE5RCxDQURlO0FBRXpDLGFBQU8sb0JBQVMsaUJBQVQsRUFBNEIsRUFBQyxnQkFBZ0IsVUFBVSxjQUFWLEVBQTBCLGtCQUFrQixVQUFVLGdCQUFWLEVBQTRCLGlCQUFpQixtQkFBakIsRUFBc0MsV0FBVyxTQUFTLFNBQVQsRUFBdEssQ0FBUCxDQUZ5Qzs7OztpQ0FJOUIsVUFBVSxXQUFXO0FBQ2hDLGFBQU8sb0JBQVMsUUFBVCxFQUFtQixFQUFDLGFBQWEsVUFBVSxXQUFWLEVBQWpDLENBQVAsQ0FEZ0M7Ozs7d0NBR2QsVUFBVSxXQUFXO0FBQ3ZDLFVBQUksc0JBQXNCLFVBQVUsZUFBVixHQUE0QixVQUFVLGVBQVYsQ0FBMEIsR0FBMUIsRUFBNUIs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QWxCLEVBQVYsRUFBbUMsT0FBTyxVQUFVLEtBQVYsRUFBOUYsQ0FBUCxDQUQwQzs7OzsyQ0FHckIsVUFBVSxXQUFXO0FBQzFDLGFBQU8sb0JBQVMsa0JBQVQsRUFBNkIsRUFBQyxZQUFZLFVBQVUsVUFBVixDQUFxQixPQUFyQixFQUFaLEVBQTlCLENBQVAsQ0FEMEM7Ozs7OENBR2xCLFVBQVUsV0FBVztBQUM3QyxhQUFPLG9CQUFTLHFCQUFULEVBQWdDLEVBQUMsTUFBTSxVQUFVLElBQVYsRUFBZ0IsYUFBYSxVQUFVLFdBQVYsQ0FBc0IsT0FBdEIsRUFBYixFQUF2RCxDQUFQLENBRDZDOzs7OzZDQUd0QixVQUFVLFdBQVc7QUFDNUMsYUFBTyxvQkFBUyxvQkFBVCxFQUErQixFQUFDLE9BQU8sU0FBUyxLQUFULENBQWUsR0FBZixHQUFxQixRQUFyQixFQUFQLEVBQWhDLENBQVAsQ0FENEM7Ozs7MENBR3hCLFVBQVUsV0FBVztBQUN6QyxhQUFPLG9CQUFTLGlCQUFULEVBQTRCLEVBQUMsVUFBVSxVQUFVLFFBQVYsQ0FBbUIsT0FBbkIsRUFBVixFQUE3QixDQUFQLENBRHlDOzs7O2lEQUdkLFVBQVUsV0FBVztBQUNoRCxhQUFPLG9CQUFTLHdCQUFULEVBQW1DLEVBQUMsUUFBUSxVQUFVLE1BQVYsRUFBa0IsVUFBVSxVQUFVLFFBQVYsQ0FBbUIsR0FBbkIsRUFBVixFQUE5RCxDQUFQLENBRGdEOzs7O1NBN0UvQiIsImZpbGUiOiJwYXJzZS1yZWR1Y2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFRlcm0gZnJvbSBcIi4vdGVybXNcIjtcbmltcG9ydCB7Q2xvbmVSZWR1Y2VyfSBmcm9tIFwic2hpZnQtcmVkdWNlclwiO1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFyc2VSZWR1Y2VyIGV4dGVuZHMgQ2xvbmVSZWR1Y2VyIHtcbiAgcmVkdWNlTW9kdWxlKG5vZGVfNDEyLCBzdGF0ZV80MTMpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJNb2R1bGVcIiwge2RpcmVjdGl2ZXM6IHN0YXRlXzQxMy5kaXJlY3RpdmVzLnRvQXJyYXkoKSwgaXRlbXM6IHN0YXRlXzQxMy5pdGVtcy50b0FycmF5KCl9KTtcbiAgfVxuICByZWR1Y2VJbXBvcnQobm9kZV80MTQsIHN0YXRlXzQxNSkge1xuICAgIGxldCBtb2R1bGVTcGVjaWZpZXJfNDE2ID0gc3RhdGVfNDE1Lm1vZHVsZVNwZWNpZmllciA/IHN0YXRlXzQxNS5tb2R1bGVTcGVjaWZpZXIudmFsKCkgOiBudWxsO1xuICAgIHJldHVybiBuZXcgVGVybShcIkltcG9ydFwiLCB7ZGVmYXVsdEJpbmRpbmc6IHN0YXRlXzQxNS5kZWZhdWx0QmluZGluZywgbmFtZWRJbXBvcnRzOiBzdGF0ZV80MTUubmFtZWRJbXBvcnRzLnRvQXJyYXkoKSwgbW9kdWxlU3BlY2lmaWVyOiBtb2R1bGVTcGVjaWZpZXJfNDE2LCBmb3JTeW50YXg6IG5vZGVfNDE0LmZvclN5bnRheH0pO1xuICB9XG4gIHJlZHVjZUltcG9ydE5hbWVzcGFjZShub2RlXzQxNywgc3RhdGVfNDE4KSB7XG4gICAgbGV0IG1vZHVsZVNwZWNpZmllcl80MTkgPSBzdGF0ZV80MTgubW9kdWxlU3BlY2lmaWVyID8gc3RhdGVfNDE4Lm1vZHVsZVNwZWNpZmllci52YWwoKSA6IG51bGw7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiSW1wb3J0TmFtZXNwYWNlXCIsIHtkZWZhdWx0QmluZGluZzogc3RhdGVfNDE4LmRlZmF1bHRCaW5kaW5nLCBuYW1lc3BhY2VCaW5kaW5nOiBzdGF0ZV80MTgubmFtZXNwYWNlQmluZGluZywgbW9kdWxlU3BlY2lmaWVyOiBtb2R1bGVTcGVjaWZpZXJfNDE5LCBmb3JTeW50YXg6IG5vZGVfNDE3LmZvclN5bnRheH0pO1xuICB9XG4gIHJlZHVjZUV4cG9ydChub2RlXzQyMCwgc3RhdGVfNDIxKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0XCIsIHtkZWNsYXJhdGlvbjogc3RhdGVfNDIxLmRlY2xhcmF0aW9ufSk7XG4gIH1cbiAgcmVkdWNlRXhwb3J0QWxsRnJvbShub2RlXzQyMiwgc3RhdGVfNDIzKSB7XG4gICAgbGV0IG1vZHVsZVNwZWNpZmllcl80MjQgPSBzdGF0ZV80MjMubW9kdWxlU3BlY2lmaWVyID8gc3RhdGVfNDIzLm1vZHVsZVNwZWNpZmllci52YWwoKSA6IG51bGw7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0QWxsRnJvbVwiLCB7bW9kdWxlU3BlY2lmaWVyOiBtb2R1bGVTcGVjaWZpZXJfNDI0fSk7XG4gIH1cbiAgcmVkdWNlRXhwb3J0RnJvbShub2RlXzQyNSwgc3RhdGVfNDI2KSB7XG4gICAgbGV0IG1vZHVsZVNwZWNpZmllcl80MjcgPSBzdGF0ZV80MjYubW9kdWxlU3BlY2lmaWVyID8gc3RhdGVfNDI2Lm1vZHVsZVNwZWNpZmllci52YWwoKSA6IG51bGw7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0RnJvbVwiLCB7bW9kdWxlU3BlY2lmaWVyOiBtb2R1bGVTcGVjaWZpZXJfNDI3LCBuYW1lZEV4cG9ydHM6IHN0YXRlXzQyNi5uYW1lZEV4cG9ydHMudG9BcnJheSgpfSk7XG4gIH1cbiAgcmVkdWNlRXhwb3J0U3BlY2lmaWVyKG5vZGVfNDI4LCBzdGF0ZV80MjkpIHtcbiAgICBsZXQgbmFtZV80MzAgPSBzdGF0ZV80MjkubmFtZSwgZXhwb3J0ZWROYW1lXzQzMSA9IHN0YXRlXzQyOS5leHBvcnRlZE5hbWU7XG4gICAgaWYgKG5hbWVfNDMwID09IG51bGwpIHtcbiAgICAgIG5hbWVfNDMwID0gZXhwb3J0ZWROYW1lXzQzMS5yZXNvbHZlKCk7XG4gICAgICBleHBvcnRlZE5hbWVfNDMxID0gZXhwb3J0ZWROYW1lXzQzMS52YWwoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZV80MzAgPSBuYW1lXzQzMC5yZXNvbHZlKCk7XG4gICAgICBleHBvcnRlZE5hbWVfNDMxID0gZXhwb3J0ZWROYW1lXzQzMS52YWwoKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0U3BlY2lmaWVyXCIsIHtuYW1lOiBuYW1lXzQzMCwgZXhwb3J0ZWROYW1lOiBleHBvcnRlZE5hbWVfNDMxfSk7XG4gIH1cbiAgcmVkdWNlSW1wb3J0U3BlY2lmaWVyKG5vZGVfNDMyLCBzdGF0ZV80MzMpIHtcbiAgICBsZXQgbmFtZV80MzQgPSBzdGF0ZV80MzMubmFtZSA/IHN0YXRlXzQzMy5uYW1lLnJlc29sdmUoKSA6IG51bGw7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiSW1wb3J0U3BlY2lmaWVyXCIsIHtuYW1lOiBuYW1lXzQzNCwgYmluZGluZzogc3RhdGVfNDMzLmJpbmRpbmd9KTtcbiAgfVxuICByZWR1Y2VJZGVudGlmaWVyRXhwcmVzc2lvbihub2RlXzQzNSwgc3RhdGVfNDM2KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiSWRlbnRpZmllckV4cHJlc3Npb25cIiwge25hbWU6IG5vZGVfNDM1Lm5hbWUucmVzb2x2ZSgpfSk7XG4gIH1cbiAgcmVkdWNlTGl0ZXJhbE51bWVyaWNFeHByZXNzaW9uKG5vZGVfNDM3LCBzdGF0ZV80MzgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJMaXRlcmFsTnVtZXJpY0V4cHJlc3Npb25cIiwge3ZhbHVlOiBub2RlXzQzNy52YWx1ZS52YWwoKX0pO1xuICB9XG4gIHJlZHVjZUxpdGVyYWxCb29sZWFuRXhwcmVzc2lvbihub2RlXzQzOSwgc3RhdGVfNDQwKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiTGl0ZXJhbEJvb2xlYW5FeHByZXNzaW9uXCIsIHt2YWx1ZTogbm9kZV80MzkudmFsdWUudmFsKCkgPT09IFwidHJ1ZVwifSk7XG4gIH1cbiAgcmVkdWNlTGl0ZXJhbFN0cmluZ0V4cHJlc3Npb24obm9kZV80NDEsIHN0YXRlXzQ0Mikge1xuICAgIHJldHVybiBuZXcgVGVybShcIkxpdGVyYWxTdHJpbmdFeHByZXNzaW9uXCIsIHt2YWx1ZTogbm9kZV80NDEudmFsdWUudG9rZW4uc3RyfSk7XG4gIH1cbiAgcmVkdWNlQ2FsbEV4cHJlc3Npb24obm9kZV80NDMsIHN0YXRlXzQ0NCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkNhbGxFeHByZXNzaW9uXCIsIHtjYWxsZWU6IHN0YXRlXzQ0NC5jYWxsZWUsIGFyZ3VtZW50czogc3RhdGVfNDQ0LmFyZ3VtZW50cy50b0FycmF5KCl9KTtcbiAgfVxuICByZWR1Y2VGdW5jdGlvbkJvZHkobm9kZV80NDUsIHN0YXRlXzQ0Nikge1xuICAgIHJldHVybiBuZXcgVGVybShcIkZ1bmN0aW9uQm9keVwiLCB7ZGlyZWN0aXZlczogc3RhdGVfNDQ2LmRpcmVjdGl2ZXMudG9BcnJheSgpLCBzdGF0ZW1lbnRzOiBzdGF0ZV80NDYuc3RhdGVtZW50cy50b0FycmF5KCl9KTtcbiAgfVxuICByZWR1Y2VGb3JtYWxQYXJhbWV0ZXJzKG5vZGVfNDQ3LCBzdGF0ZV80NDgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJGb3JtYWxQYXJhbWV0ZXJzXCIsIHtpdGVtczogc3RhdGVfNDQ4Lml0ZW1zLnRvQXJyYXkoKSwgcmVzdDogc3RhdGVfNDQ4LnJlc3R9KTtcbiAgfVxuICByZWR1Y2VCaW5kaW5nSWRlbnRpZmllcihub2RlXzQ0OSwgc3RhdGVfNDUwKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge25hbWU6IG5vZGVfNDQ5Lm5hbWUucmVzb2x2ZSgpfSk7XG4gIH1cbiAgcmVkdWNlQmluYXJ5RXhwcmVzc2lvbihub2RlXzQ1MSwgc3RhdGVfNDUyKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluYXJ5RXhwcmVzc2lvblwiLCB7bGVmdDogc3RhdGVfNDUyLmxlZnQsIG9wZXJhdG9yOiBub2RlXzQ1MS5vcGVyYXRvci52YWwoKSwgcmlnaHQ6IHN0YXRlXzQ1Mi5yaWdodH0pO1xuICB9XG4gIHJlZHVjZU9iamVjdEV4cHJlc3Npb24obm9kZV80NTMsIHN0YXRlXzQ1NCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIk9iamVjdEV4cHJlc3Npb25cIiwge3Byb3BlcnRpZXM6IHN0YXRlXzQ1NC5wcm9wZXJ0aWVzLnRvQXJyYXkoKX0pO1xuICB9XG4gIHJlZHVjZVZhcmlhYmxlRGVjbGFyYXRpb24obm9kZV80NTUsIHN0YXRlXzQ1Nikge1xuICAgIHJldHVybiBuZXcgVGVybShcIlZhcmlhYmxlRGVjbGFyYXRpb25cIiwge2tpbmQ6IHN0YXRlXzQ1Ni5raW5kLCBkZWNsYXJhdG9yczogc3RhdGVfNDU2LmRlY2xhcmF0b3JzLnRvQXJyYXkoKX0pO1xuICB9XG4gIHJlZHVjZVN0YXRpY1Byb3BlcnR5TmFtZShub2RlXzQ1Nywgc3RhdGVfNDU4KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3RhdGljUHJvcGVydHlOYW1lXCIsIHt2YWx1ZTogbm9kZV80NTcudmFsdWUudmFsKCkudG9TdHJpbmcoKX0pO1xuICB9XG4gIHJlZHVjZUFycmF5RXhwcmVzc2lvbihub2RlXzQ1OSwgc3RhdGVfNDYwKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyYXlFeHByZXNzaW9uXCIsIHtlbGVtZW50czogc3RhdGVfNDYwLmVsZW1lbnRzLnRvQXJyYXkoKX0pO1xuICB9XG4gIHJlZHVjZVN0YXRpY01lbWJlckV4cHJlc3Npb24obm9kZV80NjEsIHN0YXRlXzQ2Mikge1xuICAgIHJldHVybiBuZXcgVGVybShcIlN0YXRpY01lbWJlckV4cHJlc3Npb25cIiwge29iamVjdDogc3RhdGVfNDYyLm9iamVjdCwgcHJvcGVydHk6IHN0YXRlXzQ2Mi5wcm9wZXJ0eS52YWwoKX0pO1xuICB9XG59XG4iXX0=