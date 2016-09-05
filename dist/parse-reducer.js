"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _terms = require("./terms");

var _terms2 = _interopRequireDefault(_terms);

var _shiftReducer = require("shift-reducer");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ParseReducer extends _shiftReducer.CloneReducer {
  constructor(context) {
    super();
    this.context = context;
  }
  reduceModule(node, state) {
    return new _terms2.default("Module", {
      directives: state.directives.toArray(),
      items: state.items.toArray()
    });
  }

  reduceImport(node, state) {
    let moduleSpecifier = state.moduleSpecifier ? state.moduleSpecifier.val() : null;
    return new _terms2.default('Import', {
      defaultBinding: state.defaultBinding,
      namedImports: state.namedImports.toArray(),
      moduleSpecifier: moduleSpecifier,
      forSyntax: node.forSyntax
    });
  }

  reduceImportNamespace(node, state) {
    let moduleSpecifier = state.moduleSpecifier ? state.moduleSpecifier.val() : null;
    return new _terms2.default('ImportNamespace', {
      defaultBinding: state.defaultBinding,
      namespaceBinding: state.namespaceBinding,
      moduleSpecifier: moduleSpecifier,
      forSyntax: node.forSyntax
    });
  }

  reduceExport(node, state) {
    return new _terms2.default('Export', {
      declaration: state.declaration
    });
  }

  reduceExportAllFrom(node, state) {
    let moduleSpecifier = state.moduleSpecifier ? state.moduleSpecifier.val() : null;
    return new _terms2.default('ExportAllFrom', { moduleSpecifier: moduleSpecifier });
  }

  reduceExportFrom(node, state) {
    let moduleSpecifier = state.moduleSpecifier ? state.moduleSpecifier.val() : null;
    return new _terms2.default('ExportFrom', {
      moduleSpecifier: moduleSpecifier,
      namedExports: state.namedExports.toArray()
    });
  }

  reduceExportSpecifier(node, state) {
    let name = state.name,
        exportedName = state.exportedName;
    if (name == null) {
      name = exportedName.resolve(this.context.phase);
      exportedName = exportedName.val();
    } else {
      name = name.resolve(this.context.phase);
      exportedName = exportedName.val();
    }
    return new _terms2.default('ExportSpecifier', {
      name: name, exportedName: exportedName
    });
  }

  reduceImportSpecifier(node, state) {
    let name = state.name ? state.name.resolve(this.context.phase) : null;
    return new _terms2.default('ImportSpecifier', {
      name: name,
      binding: state.binding
    });
  }

  reduceIdentifierExpression(node) {
    return new _terms2.default("IdentifierExpression", {
      name: node.name.resolve(this.context.phase)
    });
  }

  reduceLiteralNumericExpression(node) {
    return new _terms2.default("LiteralNumericExpression", {
      value: node.value.val()
    });
  }

  reduceLiteralBooleanExpression(node) {
    return new _terms2.default("LiteralBooleanExpression", {
      value: node.value.val() === 'true'
    });
  }

  reduceLiteralStringExpression(node) {
    return new _terms2.default("LiteralStringExpression", {
      value: node.value.token.str
    });
  }

  reduceCallExpression(node, state) {
    return new _terms2.default("CallExpression", {
      callee: state.callee,
      arguments: state.arguments.toArray()
    });
  }

  reduceFunctionBody(node, state) {
    return new _terms2.default("FunctionBody", {
      directives: state.directives.toArray(),
      statements: state.statements.toArray()
    });
  }

  reduceFormalParameters(node, state) {
    return new _terms2.default("FormalParameters", {
      items: state.items.toArray(),
      rest: state.rest
    });
  }

  reduceBindingIdentifier(node) {
    return new _terms2.default("BindingIdentifier", {
      name: node.name.resolve(this.context.phase)
    });
  }

  reduceBinaryExpression(node, state) {
    return new _terms2.default("BinaryExpression", {
      left: state.left,
      operator: node.operator.val(),
      right: state.right
    });
  }

  reduceObjectExpression(node, state) {
    return new _terms2.default("ObjectExpression", {
      properties: state.properties.toArray()
    });
  }

  reduceVariableDeclaration(node, state) {
    return new _terms2.default("VariableDeclaration", {
      kind: state.kind,
      declarators: state.declarators.toArray()
    });
  }

  reduceStaticPropertyName(node) {
    return new _terms2.default("StaticPropertyName", {
      value: node.value.val().toString()
    });
  }

  reduceArrayExpression(node, state) {
    return new _terms2.default("ArrayExpression", {
      elements: state.elements.toArray()
    });
  }

  reduceStaticMemberExpression(node, state) {
    return new _terms2.default("StaticMemberExpression", {
      object: state.object,
      property: state.property.val()
    });
  }

}
exports.default = ParseReducer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wYXJzZS1yZWR1Y2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFFZSxNQUFNLFlBQU4sb0NBQXdDO0FBQ3JELGNBQVksT0FBWixFQUFxQjtBQUNuQjtBQUNBLFNBQUssT0FBTCxHQUFlLE9BQWY7QUFDRDtBQUNELGVBQWEsSUFBYixFQUFtQixLQUFuQixFQUEwQjtBQUN4QixXQUFPLG9CQUFTLFFBQVQsRUFBbUI7QUFDeEIsa0JBQVksTUFBTSxVQUFOLENBQWlCLE9BQWpCLEVBRFk7QUFFeEIsYUFBTyxNQUFNLEtBQU4sQ0FBWSxPQUFaO0FBRmlCLEtBQW5CLENBQVA7QUFJRDs7QUFFRCxlQUFhLElBQWIsRUFBbUIsS0FBbkIsRUFBMEI7QUFDeEIsUUFBSSxrQkFBa0IsTUFBTSxlQUFOLEdBQXdCLE1BQU0sZUFBTixDQUFzQixHQUF0QixFQUF4QixHQUFzRCxJQUE1RTtBQUNBLFdBQU8sb0JBQVMsUUFBVCxFQUFtQjtBQUN4QixzQkFBZ0IsTUFBTSxjQURFO0FBRXhCLG9CQUFjLE1BQU0sWUFBTixDQUFtQixPQUFuQixFQUZVO0FBR3hCLHNDQUh3QjtBQUl4QixpQkFBVyxLQUFLO0FBSlEsS0FBbkIsQ0FBUDtBQU1EOztBQUVELHdCQUFzQixJQUF0QixFQUE0QixLQUE1QixFQUFtQztBQUNqQyxRQUFJLGtCQUFrQixNQUFNLGVBQU4sR0FBd0IsTUFBTSxlQUFOLENBQXNCLEdBQXRCLEVBQXhCLEdBQXNELElBQTVFO0FBQ0EsV0FBTyxvQkFBUyxpQkFBVCxFQUE0QjtBQUNqQyxzQkFBZ0IsTUFBTSxjQURXO0FBRWpDLHdCQUFrQixNQUFNLGdCQUZTO0FBR2pDLHNDQUhpQztBQUlqQyxpQkFBVyxLQUFLO0FBSmlCLEtBQTVCLENBQVA7QUFNRDs7QUFFRCxlQUFhLElBQWIsRUFBbUIsS0FBbkIsRUFBMEI7QUFDeEIsV0FBTyxvQkFBUyxRQUFULEVBQW1CO0FBQ3hCLG1CQUFhLE1BQU07QUFE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QyxLQUFuQyxFQUEwQztBQUN4QyxXQUFPLG9CQUFTLHdCQUFULEVBQW1DO0FBQ3hDLGNBQVEsTUFBTSxNQUQwQjtBQUV4QyxnQkFBVSxNQUFNLFFBQU4sQ0FBZSxHQUFmO0FBRjhCLEtBQW5DLENBQVA7QUFJRDs7QUFsS29EO2tCQUFsQyxZIiwiZmlsZSI6InBhcnNlLXJlZHVjZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgVGVybSBmcm9tIFwiLi90ZXJtc1wiO1xuaW1wb3J0IHsgQ2xvbmVSZWR1Y2VyIH0gZnJvbSBcInNoaWZ0LXJlZHVjZXJcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFyc2VSZWR1Y2VyIGV4dGVuZHMgQ2xvbmVSZWR1Y2VyIHtcbiAgY29uc3RydWN0b3IoY29udGV4dCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgfVxuICByZWR1Y2VNb2R1bGUobm9kZSwgc3RhdGUpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJNb2R1bGVcIiwge1xuICAgICAgZGlyZWN0aXZlczogc3RhdGUuZGlyZWN0aXZlcy50b0FycmF5KCksXG4gICAgICBpdGVtczogc3RhdGUuaXRlbXMudG9BcnJheSgpXG4gICAgfSk7XG4gIH1cblxuICByZWR1Y2VJbXBvcnQobm9kZSwgc3RhdGUpIHtcbiAgICBsZXQgbW9kdWxlU3BlY2lmaWVyID0gc3RhdGUubW9kdWxlU3BlY2lmaWVyID8gc3RhdGUubW9kdWxlU3BlY2lmaWVyLnZhbCgpIDogbnVsbDtcbiAgICByZXR1cm4gbmV3IFRlcm0oJ0ltcG9ydCcsIHtcbiAgICAgIGRlZmF1bHRCaW5kaW5nOiBzdGF0ZS5kZWZhdWx0QmluZGluZyxcbiAgICAgIG5hbWVkSW1wb3J0czogc3RhdGUubmFtZWRJbXBvcnRzLnRvQXJyYXkoKSxcbiAgICAgIG1vZHVsZVNwZWNpZmllcixcbiAgICAgIGZvclN5bnRheDogbm9kZS5mb3JTeW50YXhcbiAgICB9KTtcbiAgfVxuXG4gIHJlZHVjZUltcG9ydE5hbWVzcGFjZShub2RlLCBzdGF0ZSkge1xuICAgIGxldCBtb2R1bGVTcGVjaWZpZXIgPSBzdGF0ZS5tb2R1bGVTcGVjaWZpZXIgPyBzdGF0ZS5tb2R1bGVTcGVjaWZpZXIudmFsKCkgOiBudWxsO1xuICAgIHJldHVybiBuZXcgVGVybSgnSW1wb3J0TmFtZXNwYWNlJywge1xuICAgICAgZGVmYXVsdEJpbmRpbmc6IHN0YXRlLmRlZmF1bHRCaW5kaW5nLFxuICAgICAgbmFtZXNwYWNlQmluZGluZzogc3RhdGUubmFtZXNwYWNlQmluZGluZyxcbiAgICAgIG1vZHVsZVNwZWNpZmllcixcbiAgICAgIGZvclN5bnRheDogbm9kZS5mb3JTeW50YXhcbiAgICB9KTtcbiAgfVxuXG4gIHJlZHVjZUV4cG9ydChub2RlLCBzdGF0ZSkge1xuICAgIHJldHVybiBuZXcgVGVybSgnRXhwb3J0Jywge1xuICAgICAgZGVjbGFyYXRpb246IHN0YXRlLmRlY2xhcmF0aW9uXG4gICAgfSk7XG4gIH1cblxuICByZWR1Y2VFeHBvcnRBbGxGcm9tKG5vZGUsIHN0YXRlKSB7XG4gICAgbGV0IG1vZHVsZVNwZWNpZmllciA9IHN0YXRlLm1vZHVsZVNwZWNpZmllciA/IHN0YXRlLm1vZHVsZVNwZWNpZmllci52YWwoKSA6IG51bGw7XG4gICAgcmV0dXJuIG5ldyBUZXJtKCdFeHBvcnRBbGxGcm9tJywgeyBtb2R1bGVTcGVjaWZpZXIgfSk7XG4gIH1cblxuICByZWR1Y2VFeHBvcnRGcm9tKG5vZGUsIHN0YXRlKSB7XG4gICAgbGV0IG1vZHVsZVNwZWNpZmllciA9IHN0YXRlLm1vZHVsZVNwZWNpZmllciA/IHN0YXRlLm1vZHVsZVNwZWNpZmllci52YWwoKSA6IG51bGw7XG4gICAgcmV0dXJuIG5ldyBUZXJtKCdFeHBvcnRGcm9tJywge1xuICAgICAgbW9kdWxlU3BlY2lmaWVyLFxuICAgICAgbmFtZWRFeHBvcnRzOiBzdGF0ZS5uYW1lZEV4cG9ydHMudG9BcnJheSgpXG4gICAgfSk7XG4gIH1cblxuICByZWR1Y2VFeHBvcnRTcGVjaWZpZXIobm9kZSwgc3RhdGUpIHtcbiAgICBsZXQgbmFtZSA9IHN0YXRlLm5hbWUsIGV4cG9ydGVkTmFtZSA9IHN0YXRlLmV4cG9ydGVkTmFtZTtcbiAgICBpZiAobmFtZSA9PSBudWxsKSB7XG4gICAgICBuYW1lID0gZXhwb3J0ZWROYW1lLnJlc29sdmUodGhpcy5jb250ZXh0LnBoYXNlKTtcbiAgICAgIGV4cG9ydGVkTmFtZSA9IGV4cG9ydGVkTmFtZS52YWwoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZSA9IG5hbWUucmVzb2x2ZSh0aGlzLmNvbnRleHQucGhhc2UpO1xuICAgICAgZXhwb3J0ZWROYW1lID0gZXhwb3J0ZWROYW1lLnZhbCgpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlcm0oJ0V4cG9ydFNwZWNpZmllcicsIHtcbiAgICAgIG5hbWUsIGV4cG9ydGVkTmFtZVxuICAgIH0pO1xuICB9XG5cbiAgcmVkdWNlSW1wb3J0U3BlY2lmaWVyKG5vZGUsIHN0YXRlKSB7XG4gICAgbGV0IG5hbWUgPSBzdGF0ZS5uYW1lID8gc3RhdGUubmFtZS5yZXNvbHZlKHRoaXMuY29udGV4dC5waGFzZSkgOiBudWxsO1xuICAgIHJldHVybiBuZXcgVGVybSgnSW1wb3J0U3BlY2lmaWVyJywge1xuICAgICAgbmFtZSxcbiAgICAgIGJpbmRpbmc6IHN0YXRlLmJpbmRpbmdcbiAgICB9KTtcbiAgfVxuXG4gIHJlZHVjZUlkZW50aWZpZXJFeHByZXNzaW9uKG5vZGUpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJJZGVudGlmaWVyRXhwcmVzc2lvblwiLCB7XG4gICAgICBuYW1lOiBub2RlLm5hbWUucmVzb2x2ZSh0aGlzLmNvbnRleHQucGhhc2UpXG4gICAgfSk7XG4gIH1cblxuICByZWR1Y2VMaXRlcmFsTnVtZXJpY0V4cHJlc3Npb24obm9kZSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkxpdGVyYWxOdW1lcmljRXhwcmVzc2lvblwiLCB7XG4gICAgICB2YWx1ZTogbm9kZS52YWx1ZS52YWwoKVxuICAgIH0pO1xuICB9XG5cbiAgcmVkdWNlTGl0ZXJhbEJvb2xlYW5FeHByZXNzaW9uKG5vZGUpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJMaXRlcmFsQm9vbGVhbkV4cHJlc3Npb25cIiwge1xuICAgICAgdmFsdWU6IG5vZGUudmFsdWUudmFsKCkgPT09ICd0cnVlJ1xuICAgIH0pO1xuICB9XG5cbiAgcmVkdWNlTGl0ZXJhbFN0cmluZ0V4cHJlc3Npb24obm9kZSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkxpdGVyYWxTdHJpbmdFeHByZXNzaW9uXCIsIHtcbiAgICAgIHZhbHVlOiBub2RlLnZhbHVlLnRva2VuLnN0clxuICAgIH0pO1xuICB9XG5cbiAgcmVkdWNlQ2FsbEV4cHJlc3Npb24obm9kZSwgc3RhdGUpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJDYWxsRXhwcmVzc2lvblwiLCB7XG4gICAgICBjYWxsZWU6IHN0YXRlLmNhbGxlZSxcbiAgICAgIGFyZ3VtZW50czogc3RhdGUuYXJndW1lbnRzLnRvQXJyYXkoKVxuICAgIH0pO1xuICB9XG5cbiAgcmVkdWNlRnVuY3Rpb25Cb2R5KG5vZGUsIHN0YXRlKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiRnVuY3Rpb25Cb2R5XCIsIHtcbiAgICAgIGRpcmVjdGl2ZXM6IHN0YXRlLmRpcmVjdGl2ZXMudG9BcnJheSgpLFxuICAgICAgc3RhdGVtZW50czogc3RhdGUuc3RhdGVtZW50cy50b0FycmF5KClcbiAgICB9KTtcbiAgfVxuXG4gIHJlZHVjZUZvcm1hbFBhcmFtZXRlcnMobm9kZSwgc3RhdGUpIHtcbiAgICByZXR1cm4gbmV3IFRlcm0oXCJGb3JtYWxQYXJhbWV0ZXJzXCIsIHtcbiAgICAgIGl0ZW1zOiBzdGF0ZS5pdGVtcy50b0FycmF5KCksXG4gICAgICByZXN0OiBzdGF0ZS5yZXN0XG4gICAgfSk7XG4gIH1cblxuICByZWR1Y2VCaW5kaW5nSWRlbnRpZmllcihub2RlKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge1xuICAgICAgbmFtZTogbm9kZS5uYW1lLnJlc29sdmUodGhpcy5jb250ZXh0LnBoYXNlKVxuICAgIH0pO1xuICB9XG5cbiAgcmVkdWNlQmluYXJ5RXhwcmVzc2lvbihub2RlLCBzdGF0ZSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkJpbmFyeUV4cHJlc3Npb25cIiwge1xuICAgICAgbGVmdDogc3RhdGUubGVmdCxcbiAgICAgIG9wZXJhdG9yOiBub2RlLm9wZXJhdG9yLnZhbCgpLFxuICAgICAgcmlnaHQ6IHN0YXRlLnJpZ2h0XG4gICAgfSk7XG4gIH1cblxuICByZWR1Y2VPYmplY3RFeHByZXNzaW9uKG5vZGUsIHN0YXRlKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiT2JqZWN0RXhwcmVzc2lvblwiLCB7XG4gICAgICBwcm9wZXJ0aWVzOiBzdGF0ZS5wcm9wZXJ0aWVzLnRvQXJyYXkoKVxuICAgIH0pO1xuICB9XG5cbiAgcmVkdWNlVmFyaWFibGVEZWNsYXJhdGlvbihub2RlLCBzdGF0ZSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIlZhcmlhYmxlRGVjbGFyYXRpb25cIiwge1xuICAgICAga2luZDogc3RhdGUua2luZCxcbiAgICAgIGRlY2xhcmF0b3JzOiBzdGF0ZS5kZWNsYXJhdG9ycy50b0FycmF5KClcbiAgICB9KTtcbiAgfVxuXG4gIHJlZHVjZVN0YXRpY1Byb3BlcnR5TmFtZShub2RlKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3RhdGljUHJvcGVydHlOYW1lXCIsIHtcbiAgICAgIHZhbHVlOiBub2RlLnZhbHVlLnZhbCgpLnRvU3RyaW5nKClcbiAgICB9KTtcbiAgfVxuXG4gIHJlZHVjZUFycmF5RXhwcmVzc2lvbihub2RlLCBzdGF0ZSkge1xuICAgIHJldHVybiBuZXcgVGVybShcIkFycmF5RXhwcmVzc2lvblwiLCB7XG4gICAgICBlbGVtZW50czogc3RhdGUuZWxlbWVudHMudG9BcnJheSgpXG4gICAgfSk7XG4gIH1cblxuICByZWR1Y2VTdGF0aWNNZW1iZXJFeHByZXNzaW9uKG5vZGUsIHN0YXRlKSB7XG4gICAgcmV0dXJuIG5ldyBUZXJtKFwiU3RhdGljTWVtYmVyRXhwcmVzc2lvblwiLCB7XG4gICAgICBvYmplY3Q6IHN0YXRlLm9iamVjdCxcbiAgICAgIHByb3BlcnR5OiBzdGF0ZS5wcm9wZXJ0eS52YWwoKVxuICAgIH0pO1xuICB9XG5cbn1cbiJdfQ==