"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _immutable = require("immutable");

var _enforester = require("./enforester");

var _termExpander = require("./term-expander.js");

var _termExpander2 = _interopRequireDefault(_termExpander);

var _bindingMap = require("./binding-map.js");

var _bindingMap2 = _interopRequireDefault(_bindingMap);

var _env = require("./env");

var _env2 = _interopRequireDefault(_env);

var _shiftReader = require("./shift-reader");

var _shiftReader2 = _interopRequireDefault(_shiftReader);

var _ramda = require("ramda");

var _ = _interopRequireWildcard(_ramda);

var _terms = require("./terms");

var _terms2 = _interopRequireDefault(_terms);

var _ramdaFantasy = require("ramda-fantasy");

var _symbol = require("./symbol");

var _transforms = require("./transforms");

var _errors = require("./errors");

var _loadSyntax = require("./load-syntax");

var _loadSyntax2 = _interopRequireDefault(_loadSyntax);

var _scope = require("./scope");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Just_875 = _ramdaFantasy.Maybe.Just;
var Nothing_876 = _ramdaFantasy.Maybe.Nothing;
var registerSyntax_877 = function registerSyntax_877(stx_882, context_883) {
  var newBinding_884 = (0, _symbol.gensym)(stx_882.val());
  context_883.env.set(newBinding_884.toString(), new _transforms.VarBindingTransform(stx_882));
  context_883.bindings.add(stx_882, { binding: newBinding_884, phase: 0, skipDup: true });
};
var registerBindings_878 = _.cond([[_terms.isBindingIdentifier, function (_ref, context_885) {
  var name = _ref.name;

  registerSyntax_877(name, context_885);
}], [_terms.isBindingPropertyIdentifier, function (_ref2, context_886) {
  var binding = _ref2.binding;

  registerBindings_878(binding, context_886);
}], [_terms.isBindingPropertyProperty, function (_ref3, context_887) {
  var binding = _ref3.binding;

  registerBindings_878(binding, context_887);
}], [_terms.isArrayBinding, function (_ref4, context_888) {
  var elements = _ref4.elements;
  var restElement = _ref4.restElement;

  if (restElement != null) {
    registerBindings_878(restElement, context_888);
  }
  elements.forEach(function (el_889) {
    if (el_889 != null) {
      registerBindings_878(el_889, context_888);
    }
  });
}], [_terms.isObjectBinding, function (_ref5, context_890) {
  var properties = _ref5.properties;
}], [_.T, function (binding_891) {
  return (0, _errors.assert)(false, "not implemented yet for: " + binding_891.type);
}]]);
var removeScope_879 = _.cond([[_terms.isBindingIdentifier, function (_ref6, scope_892) {
  var name = _ref6.name;
  return new _terms2.default("BindingIdentifier", { name: name.removeScope(scope_892) });
}], [_terms.isArrayBinding, function (_ref7, scope_893) {
  var elements = _ref7.elements;
  var restElement = _ref7.restElement;

  return new _terms2.default("ArrayBinding", { elements: elements.map(function (el_894) {
      return el_894 == null ? null : removeScope_879(el_894, scope_893);
    }), restElement: restElement == null ? null : removeScope_879(restElement, scope_893) });
}], [_terms.isBindingPropertyIdentifier, function (_ref8, scope_895) {
  var binding = _ref8.binding;
  var init = _ref8.init;
  return new _terms2.default("BindingPropertyIdentifier", { binding: removeScope_879(binding, scope_895), init: init });
}], [_terms.isBindingPropertyProperty, function (_ref9, scope_896) {
  var binding = _ref9.binding;
  var name = _ref9.name;
  return new _terms2.default("BindingPropertyProperty", { binding: removeScope_879(binding, scope_896), name: name });
}], [_terms.isObjectBinding, function (_ref10, scope_897) {
  var properties = _ref10.properties;
  return new _terms2.default("ObjectBinding", { properties: properties.map(function (prop_898) {
      return removeScope_879(prop_898, scope_897);
    }) });
}], [_.T, function (binding_899) {
  return (0, _errors.assert)(false, "not implemented yet for: " + binding_899.type);
}]]);
function findNameInExports_880(name_900, exp_901) {
  var foundNames_902 = exp_901.reduce(function (acc_903, e_904) {
    if (e_904.declaration) {
      return acc_903.concat(e_904.declaration.declarators.reduce(function (acc_905, decl_906) {
        if (decl_906.binding.name.val() === name_900.val()) {
          return acc_905.concat(decl_906.binding.name);
        }
        return acc_905;
      }, (0, _immutable.List)()));
    }
    return acc_903;
  }, (0, _immutable.List)());
  (0, _errors.assert)(foundNames_902.size <= 1, "expecting no more than 1 matching name in exports");
  return foundNames_902.get(0);
}
function bindImports_881(impTerm_907, exModule_908, context_909) {
  var names_910 = [];
  impTerm_907.namedImports.forEach(function (specifier_911) {
    var name_912 = specifier_911.binding.name;
    var exportName_913 = findNameInExports_880(name_912, exModule_908.exportEntries);
    if (exportName_913 != null) {
      var newBinding = (0, _symbol.gensym)(name_912.val());
      context_909.bindings.addForward(name_912, exportName_913, newBinding);
      if (context_909.store.has(exportName_913.resolve())) {
        names_910.push(name_912);
      }
    }
  });
  return (0, _immutable.List)(names_910);
}

var TokenExpander = function () {
  function TokenExpander(context_914) {
    _classCallCheck(this, TokenExpander);

    this.context = context_914;
  }

  _createClass(TokenExpander, [{
    key: "expand",
    value: function expand(stxl_915) {
      var result_916 = (0, _immutable.List)();
      if (stxl_915.size === 0) {
        return result_916;
      }
      var prev_917 = (0, _immutable.List)();
      var enf_918 = new _enforester.Enforester(stxl_915, prev_917, this.context);
      var self_919 = this;
      while (!enf_918.done) {
        var term = _.pipe(_.bind(enf_918.enforest, enf_918), _.cond([[_terms.isVariableDeclarationStatement, function (term_920) {
          term_920.declaration.declarators = term_920.declaration.declarators.map(function (decl_921) {
            return new _terms2.default("VariableDeclarator", { binding: removeScope_879(decl_921.binding, self_919.context.useScope), init: decl_921.init });
          });
          if ((0, _terms.isSyntaxDeclaration)(term_920.declaration)) {
            (function () {
              var scope = (0, _scope.freshScope)("nonrec");
              term_920.declaration.declarators.forEach(function (decl_922) {
                var name_923 = decl_922.binding.name;
                var nameAdded_924 = name_923.addScope(scope);
                var nameRemoved_925 = name_923.removeScope(self_919.context.currentScope[self_919.context.currentScope.length - 1]);
                var newBinding_926 = (0, _symbol.gensym)(name_923.val());
                self_919.context.bindings.addForward(nameAdded_924, nameRemoved_925, newBinding_926);
                decl_922.init.body = decl_922.init.body.map(function (s_927) {
                  return s_927.addScope(scope, self_919.context.bindings);
                });
              });
            })();
          }
          if ((0, _terms.isSyntaxDeclaration)(term_920.declaration) || (0, _terms.isSyntaxrecDeclaration)(term_920.declaration)) {
            term_920.declaration.declarators.forEach(function (decl_928) {
              registerBindings_878(decl_928.binding, self_919.context);
              (0, _loadSyntax2.default)(decl_928, self_919.context, self_919.context.env);
            });
            return Nothing_876();
          } else {
            term_920.declaration.declarators.forEach(function (decl_929) {
              return registerBindings_878(decl_929.binding, self_919.context);
            });
          }
          return Just_875(term_920);
        }], [_terms.isFunctionWithName, function (term_930) {
          term_930.name = removeScope_879(term_930.name, self_919.context.useScope);
          registerBindings_878(term_930.name, self_919.context);
          return Just_875(term_930);
        }], [_terms.isImport, function (term_931) {
          var mod_932 = self_919.context.modules.load(term_931.moduleSpecifier.val(), self_919.context);
          if (term_931.forSyntax) {
            console.log("import for syntax is not implemented yet");
          } else {
            mod_932.visit(self_919.context);
          }
          var boundNames_933 = bindImports_881(term_931, mod_932, self_919.context);
          if (boundNames_933.size === 0) {
            return Just_875(term_931);
          }
          return Nothing_876();
        }], [_terms.isEOF, Nothing_876], [_.T, Just_875]]), _ramdaFantasy.Maybe.maybe((0, _immutable.List)(), _.identity))();
        result_916 = result_916.concat(term);
      }
      return result_916;
    }
  }]);

  return TokenExpander;
}();

exports.default = TokenExpander;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3Rva2VuLWV4cGFuZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7SUFBYTs7QUFDYjs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7Ozs7O0FBQ0EsSUFBTSxXQUFXLG9CQUFNLElBQU47QUFDakIsSUFBTSxjQUFjLG9CQUFNLE9BQU47QUFDcEIsSUFBTSxxQkFBcUIsU0FBckIsa0JBQXFCLENBQUMsT0FBRCxFQUFVLFdBQVYsRUFBMEI7QUFDbkQsTUFBSSxpQkFBaUIsb0JBQU8sUUFBUSxHQUFSLEVBQVAsQ0FBakIsQ0FEK0M7QUFFbkQsY0FBWSxHQUFaLENBQWdCLEdBQWhCLENBQW9CLGVBQWUsUUFBZixFQUFwQixFQUErQyxvQ0FBd0IsT0FBeEIsQ0FBL0MsRUFGbUQ7QUFHbkQsY0FBWSxRQUFaLENBQXFCLEdBQXJCLENBQXlCLE9BQXpCLEVBQWtDLEVBQUMsU0FBUyxjQUFULEVBQXlCLE9BQU8sQ0FBUCxFQUFVLFNBQVMsSUFBVCxFQUF0RSxFQUhtRDtDQUExQjtBQUszQixJQUFJLHVCQUF1QixFQUFFLElBQUYsQ0FBTyxDQUFDLDZCQUFzQixnQkFBUyxXQUFULEVBQXlCO01BQXZCLGlCQUF1Qjs7QUFDaEYscUJBQW1CLElBQW5CLEVBQXlCLFdBQXpCLEVBRGdGO0NBQXpCLENBQXZCLEVBRTlCLHFDQUE4QixpQkFBWSxXQUFaLEVBQTRCO01BQTFCLHdCQUEwQjs7QUFDNUQsdUJBQXFCLE9BQXJCLEVBQThCLFdBQTlCLEVBRDREO0NBQTVCLENBRkEsRUFJOUIsbUNBQTRCLGlCQUFZLFdBQVosRUFBNEI7TUFBMUIsd0JBQTBCOztBQUMxRCx1QkFBcUIsT0FBckIsRUFBOEIsV0FBOUIsRUFEMEQ7Q0FBNUIsQ0FKRSxFQU05Qix3QkFBaUIsaUJBQTBCLFdBQTFCLEVBQTBDO01BQXhDLDBCQUF3QztN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cUI7QUFFekIsY0FBSSxTQUFTLFNBQVQsRUFBb0I7QUFDdEIsb0JBQVEsR0FBUixDQUFZLDBDQUFaLEVBRHNCO1dBQXhCLE1BRU87QUFDTCxvQkFBUSxLQUFSLENBQWMsU0FBUyxPQUFULENBQWQsQ0FESztXQUZQO0FBS0EsY0FBSSxpQkFBaUIsZ0JBQWdCLFFBQWhCLEVBQTBCLE9BQTFCLEVBQW1DLFNBQVMsT0FBVCxDQUFwRCxDQVBxQjtBQVF6QixjQUFJLGVBQWUsSUFBZixLQUF3QixDQUF4QixFQUEyQjtBQUM3QixtQkFBTyxTQUFTLFFBQVQsQ0FBUCxDQUQ2QjtXQUEvQjtBQUdBLGlCQUFPLGFBQVAsQ0FYeUI7U0FBWixDQTdCNkMsRUF5Q3hELGVBQVEsV0FBUixDQXpDd0QsRUF5Q2xDLENBQUMsRUFBRSxDQUFGLEVBQUssUUFBTixDQXpDa0MsQ0FBUCxDQUExQyxFQXlDa0Msb0JBQU0sS0FBTixDQUFZLHNCQUFaLEVBQW9CLEVBQUUsUUFBRixDQXpDdEQsR0FBUCxDQURnQjtBQTJDcEIscUJBQWEsV0FBVyxNQUFYLENBQWtCLElBQWxCLENBQWIsQ0EzQ29CO09BQXRCO0FBNkNBLGFBQU8sVUFBUCxDQXJEZTs7OztTQUpFIiwiZmlsZSI6InRva2VuLWV4cGFuZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtMaXN0fSBmcm9tIFwiaW1tdXRhYmxlXCI7XG5pbXBvcnQge2VuZm9yZXN0RXhwciwgRW5mb3Jlc3Rlcn0gZnJvbSBcIi4vZW5mb3Jlc3RlclwiO1xuaW1wb3J0IFRlcm1FeHBhbmRlciBmcm9tIFwiLi90ZXJtLWV4cGFuZGVyLmpzXCI7XG5pbXBvcnQgQmluZGluZ01hcCBmcm9tIFwiLi9iaW5kaW5nLW1hcC5qc1wiO1xuaW1wb3J0IEVudiBmcm9tIFwiLi9lbnZcIjtcbmltcG9ydCBSZWFkZXIgZnJvbSBcIi4vc2hpZnQtcmVhZGVyXCI7XG5pbXBvcnQgICogYXMgXyBmcm9tIFwicmFtZGFcIjtcbmltcG9ydCBUZXJtLCB7aXNFT0YsIGlzQmluZGluZ0lkZW50aWZpZXIsIGlzQmluZGluZ1Byb3BlcnR5UHJvcGVydHksIGlzQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllciwgaXNPYmplY3RCaW5kaW5nLCBpc0FycmF5QmluZGluZywgaXNGdW5jdGlvbkRlY2xhcmF0aW9uLCBpc0Z1bmN0aW9uRXhwcmVzc2lvbiwgaXNGdW5jdGlvblRlcm0sIGlzRnVuY3Rpb25XaXRoTmFtZSwgaXNTeW50YXhEZWNsYXJhdGlvbiwgaXNTeW50YXhyZWNEZWNsYXJhdGlvbiwgaXNWYXJpYWJsZURlY2xhcmF0aW9uLCBpc1ZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnQsIGlzSW1wb3J0LCBpc0V4cG9ydH0gZnJvbSBcIi4vdGVybXNcIjtcbmltcG9ydCB7TWF5YmV9IGZyb20gXCJyYW1kYS1mYW50YXN5XCI7XG5pbXBvcnQge2dlbnN5bX0gZnJvbSBcIi4vc3ltYm9sXCI7XG5pbXBvcnQge1ZhckJpbmRpbmdUcmFuc2Zvcm0sIENvbXBpbGV0aW1lVHJhbnNmb3JtfSBmcm9tIFwiLi90cmFuc2Zvcm1zXCI7XG5pbXBvcnQge2V4cGVjdCwgYXNzZXJ0fSBmcm9tIFwiLi9lcnJvcnNcIjtcbmltcG9ydCBsb2FkU3ludGF4IGZyb20gXCIuL2xvYWQtc3ludGF4XCI7XG5pbXBvcnQge1Njb3BlLCBmcmVzaFNjb3BlfSBmcm9tIFwiLi9zY29wZVwiO1xuY29uc3QgSnVzdF84NzUgPSBNYXliZS5KdXN0O1xuY29uc3QgTm90aGluZ184NzYgPSBNYXliZS5Ob3RoaW5nO1xuY29uc3QgcmVnaXN0ZXJTeW50YXhfODc3ID0gKHN0eF84ODIsIGNvbnRleHRfODgzKSA9PiB7XG4gIGxldCBuZXdCaW5kaW5nXzg4NCA9IGdlbnN5bShzdHhfODgyLnZhbCgpKTtcbiAgY29udGV4dF84ODMuZW52LnNldChuZXdCaW5kaW5nXzg4NC50b1N0cmluZygpLCBuZXcgVmFyQmluZGluZ1RyYW5zZm9ybShzdHhfODgyKSk7XG4gIGNvbnRleHRfODgzLmJpbmRpbmdzLmFkZChzdHhfODgyLCB7YmluZGluZzogbmV3QmluZGluZ184ODQsIHBoYXNlOiAwLCBza2lwRHVwOiB0cnVlfSk7XG59O1xubGV0IHJlZ2lzdGVyQmluZGluZ3NfODc4ID0gXy5jb25kKFtbaXNCaW5kaW5nSWRlbnRpZmllciwgKHtuYW1lfSwgY29udGV4dF84ODUpID0+IHtcbiAgcmVnaXN0ZXJTeW50YXhfODc3KG5hbWUsIGNvbnRleHRfODg1KTtcbn1dLCBbaXNCaW5kaW5nUHJvcGVydHlJZGVudGlmaWVyLCAoe2JpbmRpbmd9LCBjb250ZXh0Xzg4NikgPT4ge1xuICByZWdpc3RlckJpbmRpbmdzXzg3OChiaW5kaW5nLCBjb250ZXh0Xzg4Nik7XG59XSwgW2lzQmluZGluZ1Byb3BlcnR5UHJvcGVydHksICh7YmluZGluZ30sIGNvbnRleHRfODg3KSA9PiB7XG4gIHJlZ2lzdGVyQmluZGluZ3NfODc4KGJpbmRpbmcsIGNvbnRleHRfODg3KTtcbn1dLCBbaXNBcnJheUJpbmRpbmcsICh7ZWxlbWVudHMsIHJlc3RFbGVtZW50fSwgY29udGV4dF84ODgpID0+IHtcbiAgaWYgKHJlc3RFbGVtZW50ICE9IG51bGwpIHtcbiAgICByZWdpc3RlckJpbmRpbmdzXzg3OChyZXN0RWxlbWVudCwgY29udGV4dF84ODgpO1xuICB9XG4gIGVsZW1lbnRzLmZvckVhY2goZWxfODg5ID0+IHtcbiAgICBpZiAoZWxfODg5ICE9IG51bGwpIHtcbiAgICAgIHJlZ2lzdGVyQmluZGluZ3NfODc4KGVsXzg4OSwgY29udGV4dF84ODgpO1xuICAgIH1cbiAgfSk7XG59XSwgW2lzT2JqZWN0QmluZGluZywgKHtwcm9wZXJ0aWVzfSwgY29udGV4dF84OTApID0+IHt9XSwgW18uVCwgYmluZGluZ184OTEgPT4gYXNzZXJ0KGZhbHNlLCBcIm5vdCBpbXBsZW1lbnRlZCB5ZXQgZm9yOiBcIiArIGJpbmRpbmdfODkxLnR5cGUpXV0pO1xubGV0IHJlbW92ZVNjb3BlXzg3OSA9IF8uY29uZChbW2lzQmluZGluZ0lkZW50aWZpZXIsICh7bmFtZX0sIHNjb3BlXzg5MikgPT4gbmV3IFRlcm0oXCJCaW5kaW5nSWRlbnRpZmllclwiLCB7bmFtZTogbmFtZS5yZW1vdmVTY29wZShzY29wZV84OTIpfSldLCBbaXNBcnJheUJpbmRpbmcsICh7ZWxlbWVudHMsIHJlc3RFbGVtZW50fSwgc2NvcGVfODkzKSA9PiB7XG4gIHJldHVybiBuZXcgVGVybShcIkFycmF5QmluZGluZ1wiLCB7ZWxlbWVudHM6IGVsZW1lbnRzLm1hcChlbF84OTQgPT4gZWxfODk0ID09IG51bGwgPyBudWxsIDogcmVtb3ZlU2NvcGVfODc5KGVsXzg5NCwgc2NvcGVfODkzKSksIHJlc3RFbGVtZW50OiByZXN0RWxlbWVudCA9PSBudWxsID8gbnVsbCA6IHJlbW92ZVNjb3BlXzg3OShyZXN0RWxlbWVudCwgc2NvcGVfODkzKX0pO1xufV0sIFtpc0JpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXIsICh7YmluZGluZywgaW5pdH0sIHNjb3BlXzg5NSkgPT4gbmV3IFRlcm0oXCJCaW5kaW5nUHJvcGVydHlJZGVudGlmaWVyXCIsIHtiaW5kaW5nOiByZW1vdmVTY29wZV84NzkoYmluZGluZywgc2NvcGVfODk1KSwgaW5pdDogaW5pdH0pXSwgW2lzQmluZGluZ1Byb3BlcnR5UHJvcGVydHksICh7YmluZGluZywgbmFtZX0sIHNjb3BlXzg5NikgPT4gbmV3IFRlcm0oXCJCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eVwiLCB7YmluZGluZzogcmVtb3ZlU2NvcGVfODc5KGJpbmRpbmcsIHNjb3BlXzg5NiksIG5hbWU6IG5hbWV9KV0sIFtpc09iamVjdEJpbmRpbmcsICh7cHJvcGVydGllc30sIHNjb3BlXzg5NykgPT4gbmV3IFRlcm0oXCJPYmplY3RCaW5kaW5nXCIsIHtwcm9wZXJ0aWVzOiBwcm9wZXJ0aWVzLm1hcChwcm9wXzg5OCA9PiByZW1vdmVTY29wZV84NzkocHJvcF84OTgsIHNjb3BlXzg5NykpfSldLCBbXy5ULCBiaW5kaW5nXzg5OSA9PiBhc3NlcnQoZmFsc2UsIFwibm90IGltcGxlbWVudGVkIHlldCBmb3I6IFwiICsgYmluZGluZ184OTkudHlwZSldXSk7XG5mdW5jdGlvbiBmaW5kTmFtZUluRXhwb3J0c184ODAobmFtZV85MDAsIGV4cF85MDEpIHtcbiAgbGV0IGZvdW5kTmFtZXNfOTAyID0gZXhwXzkwMS5yZWR1Y2UoKGFjY185MDMsIGVfOTA0KSA9PiB7XG4gICAgaWYgKGVfOTA0LmRlY2xhcmF0aW9uKSB7XG4gICAgICByZXR1cm4gYWNjXzkwMy5jb25jYXQoZV85MDQuZGVjbGFyYXRpb24uZGVjbGFyYXRvcnMucmVkdWNlKChhY2NfOTA1LCBkZWNsXzkwNikgPT4ge1xuICAgICAgICBpZiAoZGVjbF85MDYuYmluZGluZy5uYW1lLnZhbCgpID09PSBuYW1lXzkwMC52YWwoKSkge1xuICAgICAgICAgIHJldHVybiBhY2NfOTA1LmNvbmNhdChkZWNsXzkwNi5iaW5kaW5nLm5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhY2NfOTA1O1xuICAgICAgfSwgTGlzdCgpKSk7XG4gICAgfVxuICAgIHJldHVybiBhY2NfOTAzO1xuICB9LCBMaXN0KCkpO1xuICBhc3NlcnQoZm91bmROYW1lc185MDIuc2l6ZSA8PSAxLCBcImV4cGVjdGluZyBubyBtb3JlIHRoYW4gMSBtYXRjaGluZyBuYW1lIGluIGV4cG9ydHNcIik7XG4gIHJldHVybiBmb3VuZE5hbWVzXzkwMi5nZXQoMCk7XG59XG5mdW5jdGlvbiBiaW5kSW1wb3J0c184ODEoaW1wVGVybV85MDcsIGV4TW9kdWxlXzkwOCwgY29udGV4dF85MDkpIHtcbiAgbGV0IG5hbWVzXzkxMCA9IFtdO1xuICBpbXBUZXJtXzkwNy5uYW1lZEltcG9ydHMuZm9yRWFjaChzcGVjaWZpZXJfOTExID0+IHtcbiAgICBsZXQgbmFtZV85MTIgPSBzcGVjaWZpZXJfOTExLmJpbmRpbmcubmFtZTtcbiAgICBsZXQgZXhwb3J0TmFtZV85MTMgPSBmaW5kTmFtZUluRXhwb3J0c184ODAobmFtZV85MTIsIGV4TW9kdWxlXzkwOC5leHBvcnRFbnRyaWVzKTtcbiAgICBpZiAoZXhwb3J0TmFtZV85MTMgIT0gbnVsbCkge1xuICAgICAgbGV0IG5ld0JpbmRpbmcgPSBnZW5zeW0obmFtZV85MTIudmFsKCkpO1xuICAgICAgY29udGV4dF85MDkuYmluZGluZ3MuYWRkRm9yd2FyZChuYW1lXzkxMiwgZXhwb3J0TmFtZV85MTMsIG5ld0JpbmRpbmcpO1xuICAgICAgaWYgKGNvbnRleHRfOTA5LnN0b3JlLmhhcyhleHBvcnROYW1lXzkxMy5yZXNvbHZlKCkpKSB7XG4gICAgICAgIG5hbWVzXzkxMC5wdXNoKG5hbWVfOTEyKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICByZXR1cm4gTGlzdChuYW1lc185MTApO1xufVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVG9rZW5FeHBhbmRlciB7XG4gIGNvbnN0cnVjdG9yKGNvbnRleHRfOTE0KSB7XG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dF85MTQ7XG4gIH1cbiAgZXhwYW5kKHN0eGxfOTE1KSB7XG4gICAgbGV0IHJlc3VsdF85MTYgPSBMaXN0KCk7XG4gICAgaWYgKHN0eGxfOTE1LnNpemUgPT09IDApIHtcbiAgICAgIHJldHVybiByZXN1bHRfOTE2O1xuICAgIH1cbiAgICBsZXQgcHJldl85MTcgPSBMaXN0KCk7XG4gICAgbGV0IGVuZl85MTggPSBuZXcgRW5mb3Jlc3RlcihzdHhsXzkxNSwgcHJldl85MTcsIHRoaXMuY29udGV4dCk7XG4gICAgbGV0IHNlbGZfOTE5ID0gdGhpcztcbiAgICB3aGlsZSAoIWVuZl85MTguZG9uZSkge1xuICAgICAgbGV0IHRlcm0gPSBfLnBpcGUoXy5iaW5kKGVuZl85MTguZW5mb3Jlc3QsIGVuZl85MTgpLCBfLmNvbmQoW1tpc1ZhcmlhYmxlRGVjbGFyYXRpb25TdGF0ZW1lbnQsIHRlcm1fOTIwID0+IHtcbiAgICAgICAgdGVybV85MjAuZGVjbGFyYXRpb24uZGVjbGFyYXRvcnMgPSB0ZXJtXzkyMC5kZWNsYXJhdGlvbi5kZWNsYXJhdG9ycy5tYXAoZGVjbF85MjEgPT4ge1xuICAgICAgICAgIHJldHVybiBuZXcgVGVybShcIlZhcmlhYmxlRGVjbGFyYXRvclwiLCB7YmluZGluZzogcmVtb3ZlU2NvcGVfODc5KGRlY2xfOTIxLmJpbmRpbmcsIHNlbGZfOTE5LmNvbnRleHQudXNlU2NvcGUpLCBpbml0OiBkZWNsXzkyMS5pbml0fSk7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoaXNTeW50YXhEZWNsYXJhdGlvbih0ZXJtXzkyMC5kZWNsYXJhdGlvbikpIHtcbiAgICAgICAgICBsZXQgc2NvcGUgPSBmcmVzaFNjb3BlKFwibm9ucmVjXCIpO1xuICAgICAgICAgIHRlcm1fOTIwLmRlY2xhcmF0aW9uLmRlY2xhcmF0b3JzLmZvckVhY2goZGVjbF85MjIgPT4ge1xuICAgICAgICAgICAgbGV0IG5hbWVfOTIzID0gZGVjbF85MjIuYmluZGluZy5uYW1lO1xuICAgICAgICAgICAgbGV0IG5hbWVBZGRlZF85MjQgPSBuYW1lXzkyMy5hZGRTY29wZShzY29wZSk7XG4gICAgICAgICAgICBsZXQgbmFtZVJlbW92ZWRfOTI1ID0gbmFtZV85MjMucmVtb3ZlU2NvcGUoc2VsZl85MTkuY29udGV4dC5jdXJyZW50U2NvcGVbc2VsZl85MTkuY29udGV4dC5jdXJyZW50U2NvcGUubGVuZ3RoIC0gMV0pO1xuICAgICAgICAgICAgbGV0IG5ld0JpbmRpbmdfOTI2ID0gZ2Vuc3ltKG5hbWVfOTIzLnZhbCgpKTtcbiAgICAgICAgICAgIHNlbGZfOTE5LmNvbnRleHQuYmluZGluZ3MuYWRkRm9yd2FyZChuYW1lQWRkZWRfOTI0LCBuYW1lUmVtb3ZlZF85MjUsIG5ld0JpbmRpbmdfOTI2KTtcbiAgICAgICAgICAgIGRlY2xfOTIyLmluaXQuYm9keSA9IGRlY2xfOTIyLmluaXQuYm9keS5tYXAoc185MjcgPT4gc185MjcuYWRkU2NvcGUoc2NvcGUsIHNlbGZfOTE5LmNvbnRleHQuYmluZGluZ3MpKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNTeW50YXhEZWNsYXJhdGlvbih0ZXJtXzkyMC5kZWNsYXJhdGlvbikgfHwgaXNTeW50YXhyZWNEZWNsYXJhdGlvbih0ZXJtXzkyMC5kZWNsYXJhdGlvbikpIHtcbiAgICAgICAgICB0ZXJtXzkyMC5kZWNsYXJhdGlvbi5kZWNsYXJhdG9ycy5mb3JFYWNoKGRlY2xfOTI4ID0+IHtcbiAgICAgICAgICAgIHJlZ2lzdGVyQmluZGluZ3NfODc4KGRlY2xfOTI4LmJpbmRpbmcsIHNlbGZfOTE5LmNvbnRleHQpO1xuICAgICAgICAgICAgbG9hZFN5bnRheChkZWNsXzkyOCwgc2VsZl85MTkuY29udGV4dCwgc2VsZl85MTkuY29udGV4dC5lbnYpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBOb3RoaW5nXzg3NigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRlcm1fOTIwLmRlY2xhcmF0aW9uLmRlY2xhcmF0b3JzLmZvckVhY2goZGVjbF85MjkgPT4gcmVnaXN0ZXJCaW5kaW5nc184NzgoZGVjbF85MjkuYmluZGluZywgc2VsZl85MTkuY29udGV4dCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBKdXN0Xzg3NSh0ZXJtXzkyMCk7XG4gICAgICB9XSwgW2lzRnVuY3Rpb25XaXRoTmFtZSwgdGVybV85MzAgPT4ge1xuICAgICAgICB0ZXJtXzkzMC5uYW1lID0gcmVtb3ZlU2NvcGVfODc5KHRlcm1fOTMwLm5hbWUsIHNlbGZfOTE5LmNvbnRleHQudXNlU2NvcGUpO1xuICAgICAgICByZWdpc3RlckJpbmRpbmdzXzg3OCh0ZXJtXzkzMC5uYW1lLCBzZWxmXzkxOS5jb250ZXh0KTtcbiAgICAgICAgcmV0dXJuIEp1c3RfODc1KHRlcm1fOTMwKTtcbiAgICAgIH1dLCBbaXNJbXBvcnQsIHRlcm1fOTMxID0+IHtcbiAgICAgICAgbGV0IG1vZF85MzIgPSBzZWxmXzkxOS5jb250ZXh0Lm1vZHVsZXMubG9hZCh0ZXJtXzkzMS5tb2R1bGVTcGVjaWZpZXIudmFsKCksIHNlbGZfOTE5LmNvbnRleHQpO1xuICAgICAgICBpZiAodGVybV85MzEuZm9yU3ludGF4KSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJpbXBvcnQgZm9yIHN5bnRheCBpcyBub3QgaW1wbGVtZW50ZWQgeWV0XCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1vZF85MzIudmlzaXQoc2VsZl85MTkuY29udGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGJvdW5kTmFtZXNfOTMzID0gYmluZEltcG9ydHNfODgxKHRlcm1fOTMxLCBtb2RfOTMyLCBzZWxmXzkxOS5jb250ZXh0KTtcbiAgICAgICAgaWYgKGJvdW5kTmFtZXNfOTMzLnNpemUgPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gSnVzdF84NzUodGVybV85MzEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBOb3RoaW5nXzg3NigpO1xuICAgICAgfV0sIFtpc0VPRiwgTm90aGluZ184NzZdLCBbXy5ULCBKdXN0Xzg3NV1dKSwgTWF5YmUubWF5YmUoTGlzdCgpLCBfLmlkZW50aXR5KSkoKTtcbiAgICAgIHJlc3VsdF85MTYgPSByZXN1bHRfOTE2LmNvbmNhdCh0ZXJtKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdF85MTY7XG4gIH1cbn1cbiJdfQ==