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
      var moduleSpecifier_386 = state_385.moduleSpecifier ? state_385.moduleSpecifier.val() : null;
      return new _terms2.default("Import", { defaultBinding: state_385.defaultBinding, namedImports: state_385.namedImports.toArray(), moduleSpecifier: moduleSpecifier_386, forSyntax: node_384.forSyntax });
    }
  }, {
    key: "reduceImportNamespace",
    value: function reduceImportNamespace(node_387, state_388) {
      var moduleSpecifier_389 = state_388.moduleSpecifier ? state_388.moduleSpecifier.val() : null;
      return new _terms2.default("ImportNamespace", { defaultBinding: state_388.defaultBinding, namespaceBinding: state_388.namespaceBinding, moduleSpecifier: moduleSpecifier_389, forSyntax: node_387.forSyntax });
    }
  }, {
    key: "reduceExport",
    value: function reduceExport(node_390, state_391) {
      return new _terms2.default("Export", { declaration: state_391.declaration });
    }
  }, {
    key: "reduceExportAllFrom",
    value: function reduceExportAllFrom(node_392, state_393) {
      var moduleSpecifier_394 = state_393.moduleSpecifier ? state_393.moduleSpecifier.val() : null;
      return new _terms2.default("ExportAllFrom", { moduleSpecifier: moduleSpecifier_394 });
    }
  }, {
    key: "reduceExportFrom",
    value: function reduceExportFrom(node_395, state_396) {
      var moduleSpecifier_397 = state_396.moduleSpecifier ? state_396.moduleSpecifier.val() : null;
      return new _terms2.default("ExportFrom", { moduleSpecifier: moduleSpecifier_397, namedExports: state_396.namedExports.toArray() });
    }
  }, {
    key: "reduceExportSpecifier",
    value: function reduceExportSpecifier(node_398, state_399) {
      var name_400 = state_399.name,
          exportedName_401 = state_399.exportedName;
      if (name_400 == null) {
        name_400 = exportedName_401.resolve();
        exportedName_401 = exportedName_401.val();
      } else {
        name_400 = name_400.resolve();
        exportedName_401 = exportedName_401.val();
      }
      return new _terms2.default("ExportSpecifier", { name: name_400, exportedName: exportedName_401 });
    }
  }, {
    key: "reduceImportSpecifier",
    value: function reduceImportSpecifier(node_402, state_403) {
      var name_404 = state_403.name ? state_403.name.resolve() : null;
      return new _terms2.default("ImportSpecifier", { name: name_404, binding: state_403.binding });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3BhcnNlLXJlZHVjZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7OztBQUNBOzs7Ozs7Ozs7O0lBQ3FCOzs7Ozs7Ozs7OztpQ0FDTixVQUFVLFdBQVc7QUFDaEMsYUFBTyxvQkFBUyxRQUFULEVBQW1CLEVBQUMsWUFBWSxVQUFVLFVBQVYsQ0FBcUIsT0FBckIsRUFBWixFQUE0QyxPQUFPLFVBQVUsS0FBVixDQUFnQixPQUFoQixFQUFQLEVBQWhFLENBQVAsQ0FEZ0M7Ozs7aUNBR3JCLFVBQVUsV0FBVztBQUNoQyxVQUFJLHNCQUFzQixVQUFVLGVBQVYsR0FBNEIsVUFBVSxlQUFWLENBQTBCLEdBQTFCLEVBQTVCLEdBQThELElBQTlELENBRE07QUFFaEMsYUFBTyxvQkFBUyxRQUFULEVBQW1CLEVBQUMsZ0JBQWdCLFVBQVUsY0FBVixFQUEwQixjQUFjLFVBQVUsWUFBVixDQUF1QixPQUF2QixFQUFkLEVBQWdELGlCQUFpQixtQkFBakIsRUFBc0MsV0FBVyxTQUFTLFNBQVQsRUFBL0osQ0FBUCxDQUZnQzs7OzswQ0FJWixVQUFVLFdBQVc7QUFDekMsVUFBSSxzQkFBc0IsVUFBVSxlQUFWLEdBQTRCLFVBQVUsZUFBVixDQUEwQixHQUExQixFQUE1QixHQUE4RCxJQUE5RCxDQURlO0FBRXpDLGFBQU8sb0JBQVMsaUJBQVQsRUFBNEIsRUFBQyxnQkFBZ0IsVUFBVSxjQUFWLEVBQTBCLGtCQUFrQixVQUFVLGdCQUFWLEVBQTRCLGlCQUFpQixtQkFBakIsRUFBc0MsV0FBVyxTQUFTLFNBQVQsRUFBdEssQ0FBUCxDQUZ5Qzs7OztpQ0FJOUIsVUFBVSxXQUFXO0FBQ2hDLGFBQU8sb0JBQVMsUUFBVCxFQUFtQixFQUFDLGFBQWEsVUFBVSxXQUFWLEVBQWpDLENBQVAsQ0FEZ0M7Ozs7d0NBR2QsVUFBVSxXQUFXO0FBQ3ZDLFVBQUksc0JBQXNCLFVBQVUsZUFBVixHQUE0QixVQUFVLGVBQVYsQ0FBMEIsR0FBMUIsRUFBNUIs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QWxCLEVBQVYsRUFBbUMsT0FBTyxVQUFVLEtBQVYsRUFBOUYsQ0FBUCxDQUQwQzs7OzsyQ0FHckIsVUFBVSxXQUFXO0FBQzFDLGFBQU8sb0JBQVMsa0JBQVQsRUFBNkIsRUFBQyxZQUFZLFVBQVUsVUFBVixDQUFxQixPQUFyQixFQUFaLEVBQTlCLENBQVAsQ0FEMEM7Ozs7OENBR2xCLFVBQVUsV0FBVztBQUM3QyxhQUFPLG9CQUFTLHFCQUFULEVBQWdDLEVBQUMsTUFBTSxVQUFVLElBQVYsRUFBZ0IsYUFBYSxVQUFVLFdBQVYsQ0FBc0IsT0FBdEIsRUFBYixFQUF2RCxDQUFQLENBRDZDOzs7OzZDQUd0QixVQUFVLFdBQVc7QUFDNUMsYUFBTyxvQkFBUyxvQkFBVCxFQUErQixFQUFDLE9BQU8sU0FBUyxLQUFULENBQWUsR0FBZixHQUFxQixRQUFyQixFQUFQLEVBQWhDLENBQVAsQ0FENEM7Ozs7MENBR3hCLFVBQVUsV0FBVztBQUN6QyxhQUFPLG9CQUFTLGlCQUFULEVBQTRCLEVBQUMsVUFBVSxVQUFVLFFBQVYsQ0FBbUIsT0FBbkIsRUFBVixFQUE3QixDQUFQLENBRHlDOzs7O2lEQUdkLFVBQVUsV0FBVztBQUNoRCxhQUFPLG9CQUFTLHdCQUFULEVBQW1DLEVBQUMsUUFBUSxVQUFVLE1BQVYsRUFBa0IsVUFBVSxVQUFVLFFBQVYsQ0FBbUIsR0FBbkIsRUFBVixFQUE5RCxDQUFQLENBRGdEOzs7O1NBN0UvQiIsImZpbGUiOiJwYXJzZS1yZWR1Y2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFRlcm0gZnJvbSBcIi4vdGVybXNcIjtcbmltcG9ydCB7Q2xvbmVSZWR1Y2VyfSBmcm9tIFwic2hpZnQtcmVkdWNlclwiO1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFyc2VSZWR1Y2VyIGV4dGVuZHMgQ2xvbmVSZWR1Y2VyIHtcbiAgcmVkdWNlTW9kdWxlKG5vZGVfMzgyLCBzdGF0ZV8zODMpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJNb2R1bGVcIiwge2RpcmVjdGl2ZXM6IHN0YXRlXzM4My5kaXJlY3RpdmVzLnRvQXJyYXkoKSwgaXRlbXM6IHN0YXRlXzM4My5pdGVtcy50b0FycmF5KCl9KTtcbiAgfVxuICByZWR1Y2VJbXBvcnQobm9kZV8zODQsIHN0YXRlXzM4NSkge1xuICAgIGxldCBtb2R1bGVTcGVjaWZpZXJfMzg2ID0gc3RhdGVfMzg1Lm1vZHVsZVNwZWNpZmllciA/IHN0YXRlXzM4NS5tb2R1bGVTcGVjaWZpZXIudmFsKCkgOiBudWxsO1xuICAgIHJldHVybiBuZXcgVGVybShcIkltcG9ydFwiLCB7ZGVmYXVsdEJpbmRpbmc6IHN0YXRlXzM4NS5kZWZhdWx0QmluZGluZywgbmFtZWRJbXBvcnRzOiBzdGF0ZV8zODUubmFtZWRJbXBvcnRzLnRvQXJyYXkoKSwgbW9kdWxlU3BlY2lmaWVyOiBtb2R1bGVTcGVjaWZpZXJfMzg2LCBmb3JTeW50YXg6IG5vZGVfMzg0LmZvclN5bnRheH0pO1xuICB9XG4gIHJlZHVjZUltcG9ydE5hbWVzcGFjZShub2RlXzM4Nywgc3RhdGVfMzg4KSB7XG4gICAgbGV0IG1vZHVsZVNwZWNpZmllcl8zODkgPSBzdGF0ZV8zODgubW9kdWxlU3BlY2lmaWVyID8gc3RhdGVfMzg4Lm1vZHVsZVNwZWNpZmllci52YWwoKSA6IG51bGw7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiSW1wb3J0TmFtZXNwYWNlXCIsIHtkZWZhdWx0QmluZGluZzogc3RhdGVfMzg4LmRlZmF1bHRCaW5kaW5nLCBuYW1lc3BhY2VCaW5kaW5nOiBzdGF0ZV8zODgubmFtZXNwYWNlQmluZGluZywgbW9kdWxlU3BlY2lmaWVyOiBtb2R1bGVTcGVjaWZpZXJfMzg5LCBmb3JTeW50YXg6IG5vZGVfMzg3LmZvclN5bnRheH0pO1xuICB9XG4gIHJlZHVjZUV4cG9ydChub2RlXzM5MCwgc3RhdGVfMzkxKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0XCIsIHtkZWNsYXJhdGlvbjogc3RhdGVfMzkxLmRlY2xhcmF0aW9ufSk7XG4gIH1cbiAgcmVkdWNlRXhwb3J0QWxsRnJvbShub2RlXzM5Miwgc3RhdGVfMzkzKSB7XG4gICAgbGV0IG1vZHVsZVNwZWNpZmllcl8zOTQgPSBzdGF0ZV8zOTMubW9kdWxlU3BlY2lmaWVyID8gc3RhdGVfMzkzLm1vZHVsZVNwZWNpZmllci52YWwoKSA6IG51bGw7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0QWxsRnJvbVwiLCB7bW9kdWxlU3BlY2lmaWVyOiBtb2R1bGVTcGVjaWZpZXJfMzk0fSk7XG4gIH1cbiAgcmVkdWNlRXhwb3J0RnJvbShub2RlXzM5NSwgc3RhdGVfMzk2KSB7XG4gICAgbGV0IG1vZHVsZVNwZWNpZmllcl8zOTcgPSBzdGF0ZV8zOTYubW9kdWxlU3BlY2lmaWVyID8gc3RhdGVfMzk2Lm1vZHVsZVNwZWNpZmllci52YWwoKSA6IG51bGw7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0RnJvbVwiLCB7bW9kdWxlU3BlY2lmaWVyOiBtb2R1bGVTcGVjaWZpZXJfMzk3LCBuYW1lZEV4cG9ydHM6IHN0YXRlXzM5Ni5uYW1lZEV4cG9ydHMudG9BcnJheSgpfSk7XG4gIH1cbiAgcmVkdWNlRXhwb3J0U3BlY2lmaWVyKG5vZGVfMzk4LCBzdGF0ZV8zOTkpIHtcbiAgICBsZXQgbmFtZV80MDAgPSBzdGF0ZV8zOTkubmFtZSwgZXhwb3J0ZWROYW1lXzQwMSA9IHN0YXRlXzM5OS5leHBvcnRlZE5hbWU7XG4gICAgaWYgKG5hbWVfNDAwID09IG51bGwpIHtcbiAgICAgIG5hbWVfNDAwID0gZXhwb3J0ZWROYW1lXzQwMS5yZXNvbHZlKCk7XG4gICAgICBleHBvcnRlZE5hbWVfNDAxID0gZXhwb3J0ZWROYW1lXzQwMS52YWwoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZV80MDAgPSBuYW1lXzQwMC5yZXNvbHZlKCk7XG4gICAgICBleHBvcnRlZE5hbWVfNDAxID0gZXhwb3J0ZWROYW1lXzQwMS52YWwoKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRXhwb3J0U3BlY2lmaWVyXCIsIHtuYW1lOiBuYW1lXzQwMCwgZXhwb3J0ZWROYW1lOiBleHBvcnRlZE5hbWVfNDAxfSk7XG4gIH1cbiAgcmVkdWNlSW1wb3J0U3BlY2lmaWVyKG5vZGVfNDAyLCBzdGF0ZV80MDMpIHtcbiAgICBsZXQgbmFtZV80MDQgPSBzdGF0ZV80MDMubmFtZSA/IHN0YXRlXzQwMy5uYW1lLnJlc29sdmUoKSA6IG51bGw7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiSW1wb3J0U3BlY2lmaWVyXCIsIHtuYW1lOiBuYW1lXzQwNCwgYmluZGluZzogc3RhdGVfNDAzLmJpbmRpbmd9KTtcbiAgfVxuICByZWR1Y2VJZGVudGlmaWVyRXhwcmVzc2lvbihub2RlXzQwNSwgc3RhdGVfNDA2KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiSWRlbnRpZmllckV4cHJlc3Npb25cIiwge25hbWU6IG5vZGVfNDA1Lm5hbWUucmVzb2x2ZSgpfSk7XG4gIH1cbiAgcmVkdWNlTGl0ZXJhbE51bWVyaWNFeHByZXNzaW9uKG5vZGVfNDA3LCBzdGF0ZV80MDgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJMaXRlcmFsTnVtZXJpY0V4cHJlc3Npb25cIiwge3ZhbHVlOiBub2RlXzQwNy52YWx1ZS52YWwoKX0pO1xuICB9XG4gIHJlZHVjZUxpdGVyYWxCb29sZWFuRXhwcmVzc2lvbihub2RlXzQwOSwgc3RhdGVfNDEwKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiTGl0ZXJhbEJvb2xlYW5FeHByZXNzaW9uXCIsIHt2YWx1ZTogbm9kZV80MDkudmFsdWUudmFsKCkgPT09IFwidHJ1ZVwifSk7XG4gIH1cbiAgcmVkdWNlTGl0ZXJhbFN0cmluZ0V4cHJlc3Npb24obm9kZV80MTEsIHN0YXRlXzQxMikge1xuICAgIHJldHVybiBuZXcgVGVybShcIkxpdGVyYWxTdHJpbmdFeHByZXNzaW9uXCIsIHt2YWx1ZTogbm9kZV80MTEudmFsdWUudG9rZW4uc3RyfSk7XG4gIH1cbiAgcmVkdWNlQ2FsbEV4cHJlc3Npb24obm9kZV80MTMsIHN0YXRlXzQxNCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkNhbGxFeHByZXNzaW9uXCIsIHtjYWxsZWU6IHN0YXRlXzQxNC5jYWxsZWUsIGFyZ3VtZW50czogc3RhdGVfNDE0LmFyZ3VtZW50cy50b0FycmF5KCl9KTtcbiAgfVxuICByZWR1Y2VGdW5jdGlvbkJvZHkobm9kZV80MTUsIHN0YXRlXzQxNikge1xuICAgIHJldHVybiBuZXcgVGVybShcIkZ1bmN0aW9uQm9keVwiLCB7ZGlyZWN0aXZlczogc3RhdGVfNDE2LmRpcmVjdGl2ZXMudG9BcnJheSgpLCBzdGF0ZW1lbnRzOiBzdGF0ZV80MTYuc3RhdGVtZW50cy50b0FycmF5KCl9KTtcbiAgfVxuICByZWR1Y2VGb3JtYWxQYXJhbWV0ZXJzKG5vZGVfNDE3LCBzdGF0ZV80MTgpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJGb3JtYWxQYXJhbWV0ZXJzXCIsIHtpdGVtczogc3RhdGVfNDE4Lml0ZW1zLnRvQXJyYXkoKSwgcmVzdDogc3RhdGVfNDE4LnJlc3R9KTtcbiAgfVxuICByZWR1Y2VCaW5kaW5nSWRlbnRpZmllcihub2RlXzQxOSwgc3RhdGVfNDIwKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge25hbWU6IG5vZGVfNDE5Lm5hbWUucmVzb2x2ZSgpfSk7XG4gIH1cbiAgcmVkdWNlQmluYXJ5RXhwcmVzc2lvbihub2RlXzQyMSwgc3RhdGVfNDIyKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluYXJ5RXhwcmVzc2lvblwiLCB7bGVmdDogc3RhdGVfNDIyLmxlZnQsIG9wZXJhdG9yOiBub2RlXzQyMS5vcGVyYXRvci52YWwoKSwgcmlnaHQ6IHN0YXRlXzQyMi5yaWdodH0pO1xuICB9XG4gIHJlZHVjZU9iamVjdEV4cHJlc3Npb24obm9kZV80MjMsIHN0YXRlXzQyNCkge1xuICAgIHJldHVybiBuZXcgVGVybShcIk9iamVjdEV4cHJlc3Npb25cIiwge3Byb3BlcnRpZXM6IHN0YXRlXzQyNC5wcm9wZXJ0aWVzLnRvQXJyYXkoKX0pO1xuICB9XG4gIHJlZHVjZVZhcmlhYmxlRGVjbGFyYXRpb24obm9kZV80MjUsIHN0YXRlXzQyNikge1xuICAgIHJldHVybiBuZXcgVGVybShcIlZhcmlhYmxlRGVjbGFyYXRpb25cIiwge2tpbmQ6IHN0YXRlXzQyNi5raW5kLCBkZWNsYXJhdG9yczogc3RhdGVfNDI2LmRlY2xhcmF0b3JzLnRvQXJyYXkoKX0pO1xuICB9XG4gIHJlZHVjZVN0YXRpY1Byb3BlcnR5TmFtZShub2RlXzQyNywgc3RhdGVfNDI4KSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3RhdGljUHJvcGVydHlOYW1lXCIsIHt2YWx1ZTogbm9kZV80MjcudmFsdWUudmFsKCkudG9TdHJpbmcoKX0pO1xuICB9XG4gIHJlZHVjZUFycmF5RXhwcmVzc2lvbihub2RlXzQyOSwgc3RhdGVfNDMwKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyYXlFeHByZXNzaW9uXCIsIHtlbGVtZW50czogc3RhdGVfNDMwLmVsZW1lbnRzLnRvQXJyYXkoKX0pO1xuICB9XG4gIHJlZHVjZVN0YXRpY01lbWJlckV4cHJlc3Npb24obm9kZV80MzEsIHN0YXRlXzQzMikge1xuICAgIHJldHVybiBuZXcgVGVybShcIlN0YXRpY01lbWJlckV4cHJlc3Npb25cIiwge29iamVjdDogc3RhdGVfNDMyLm9iamVjdCwgcHJvcGVydHk6IHN0YXRlXzQzMi5wcm9wZXJ0eS52YWwoKX0pO1xuICB9XG59XG4iXX0=