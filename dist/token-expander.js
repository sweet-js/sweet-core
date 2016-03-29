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
                decl_922.init = decl_922.init.addScope(scope, self_919.context.bindings);
              });
            })();
          }
          if ((0, _terms.isSyntaxDeclaration)(term_920.declaration) || (0, _terms.isSyntaxrecDeclaration)(term_920.declaration)) {
            term_920.declaration.declarators.forEach(function (decl_927) {
              registerBindings_878(decl_927.binding, self_919.context);
              (0, _loadSyntax2.default)(decl_927, self_919.context, self_919.context.env);
            });
            return Nothing_876();
          } else {
            term_920.declaration.declarators.forEach(function (decl_928) {
              return registerBindings_878(decl_928.binding, self_919.context);
            });
          }
          return Just_875(term_920);
        }], [_terms.isFunctionWithName, function (term_929) {
          term_929.name = removeScope_879(term_929.name, self_919.context.useScope);
          registerBindings_878(term_929.name, self_919.context);
          return Just_875(term_929);
        }], [_terms.isImport, function (term_930) {
          var mod_931 = self_919.context.modules.load(term_930.moduleSpecifier.val(), self_919.context);
          if (term_930.forSyntax) {
            console.log("import for syntax is not implemented yet");
          } else {
            mod_931.visit(self_919.context);
          }
          var boundNames_932 = bindImports_881(term_930, mod_931, self_919.context);
          if (boundNames_932.size === 0) {
            return Just_875(term_930);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3Rva2VuLWV4cGFuZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7SUFBYTs7QUFDYjs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7Ozs7O0FBQ0EsSUFBTSxXQUFXLG9CQUFNLElBQU47QUFDakIsSUFBTSxjQUFjLG9CQUFNLE9BQU47QUFDcEIsSUFBTSxxQkFBcUIsU0FBckIsa0JBQXFCLENBQUMsT0FBRCxFQUFVLFdBQVYsRUFBMEI7QUFDbkQsTUFBSSxpQkFBaUIsb0JBQU8sUUFBUSxHQUFSLEVBQVAsQ0FBakIsQ0FEK0M7QUFFbkQsY0FBWSxHQUFaLENBQWdCLEdBQWhCLENBQW9CLGVBQWUsUUFBZixFQUFwQixFQUErQyxvQ0FBd0IsT0FBeEIsQ0FBL0MsRUFGbUQ7QUFHbkQsY0FBWSxRQUFaLENBQXFCLEdBQXJCLENBQXlCLE9BQXpCLEVBQWtDLEVBQUMsU0FBUyxjQUFULEVBQXlCLE9BQU8sQ0FBUCxFQUFVLFNBQVMsSUFBVCxFQUF0RSxFQUhtRDtDQUExQjtBQUszQixJQUFJLHVCQUF1QixFQUFFLElBQUYsQ0FBTyxDQUFDLDZCQUFzQixnQkFBUyxXQUFULEVBQXlCO01BQXZCLGlCQUF1Qjs7QUFDaEYscUJBQW1CLElBQW5CLEVBQXlCLFdBQXpCLEVBRGdGO0NBQXpCLENBQXZCLEVBRTlCLHFDQUE4QixpQkFBWSxXQUFaLEVBQTRCO01BQTFCLHdCQUEwQjs7QUFDNUQsdUJBQXFCLE9BQXJCLEVBQThCLFdBQTlCLEVBRDREO0NBQTVCLENBRkEsRUFJOUIsbUNBQTRCLGlCQUFZLFdBQVosRUFBNEI7TUFBMUIsd0JBQTBCOztBQUMxRCx1QkFBcUIsT0FBckIsRUFBOEIsV0FBOUIsRUFEMEQ7Q0FBNUIsQ0FKRSxFQU05Qix3QkFBaUIsaUJBQTBCLFdBQTFCLEVBQTBDO01BQXhDLDBCQUF3QztN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QVksMENBQVosRUFEc0I7V0FBeEIsTUFFTztBQUNMLG9CQUFRLEtBQVIsQ0FBYyxTQUFTLE9BQVQsQ0FBZCxDQURLO1dBRlA7QUFLQSxjQUFJLGlCQUFpQixnQkFBZ0IsUUFBaEIsRUFBMEIsT0FBMUIsRUFBbUMsU0FBUyxPQUFULENBQXBELENBUHFCO0FBUXpCLGNBQUksZUFBZSxJQUFmLEtBQXdCLENBQXhCLEVBQTJCO0FBQzdCLG1CQUFPLFNBQVMsUUFBVCxDQUFQLENBRDZCO1dBQS9CO0FBR0EsaUJBQU8sYUFBUCxDQVh5QjtTQUFaLENBN0I2QyxFQXlDeEQsZUFBUSxXQUFSLENBekN3RCxFQXlDbEMsQ0FBQyxFQUFFLENBQUYsRUFBSyxRQUFOLENBekNrQyxDQUFQLENBQTFDLEVBeUNrQyxvQkFBTSxLQUFOLENBQVksc0JBQVosRUFBb0IsRUFBRSxRQUFGLENBekN0RCxHQUFQLENBRGdCO0FBMkNwQixxQkFBYSxXQUFXLE1BQVgsQ0FBa0IsSUFBbEIsQ0FBYixDQTNDb0I7T0FBdEI7QUE2Q0EsYUFBTyxVQUFQLENBckRlOzs7O1NBSkUiLCJmaWxlIjoidG9rZW4tZXhwYW5kZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0xpc3R9IGZyb20gXCJpbW11dGFibGVcIjtcbmltcG9ydCB7ZW5mb3Jlc3RFeHByLCBFbmZvcmVzdGVyfSBmcm9tIFwiLi9lbmZvcmVzdGVyXCI7XG5pbXBvcnQgVGVybUV4cGFuZGVyIGZyb20gXCIuL3Rlcm0tZXhwYW5kZXIuanNcIjtcbmltcG9ydCBCaW5kaW5nTWFwIGZyb20gXCIuL2JpbmRpbmctbWFwLmpzXCI7XG5pbXBvcnQgRW52IGZyb20gXCIuL2VudlwiO1xuaW1wb3J0IFJlYWRlciBmcm9tIFwiLi9zaGlmdC1yZWFkZXJcIjtcbmltcG9ydCAgKiBhcyBfIGZyb20gXCJyYW1kYVwiO1xuaW1wb3J0IFRlcm0sIHtpc0VPRiwgaXNCaW5kaW5nSWRlbnRpZmllciwgaXNCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eSwgaXNCaW5kaW5nUHJvcGVydHlJZGVudGlmaWVyLCBpc09iamVjdEJpbmRpbmcsIGlzQXJyYXlCaW5kaW5nLCBpc0Z1bmN0aW9uRGVjbGFyYXRpb24sIGlzRnVuY3Rpb25FeHByZXNzaW9uLCBpc0Z1bmN0aW9uVGVybSwgaXNGdW5jdGlvbldpdGhOYW1lLCBpc1N5bnRheERlY2xhcmF0aW9uLCBpc1N5bnRheHJlY0RlY2xhcmF0aW9uLCBpc1ZhcmlhYmxlRGVjbGFyYXRpb24sIGlzVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudCwgaXNJbXBvcnQsIGlzRXhwb3J0fSBmcm9tIFwiLi90ZXJtc1wiO1xuaW1wb3J0IHtNYXliZX0gZnJvbSBcInJhbWRhLWZhbnRhc3lcIjtcbmltcG9ydCB7Z2Vuc3ltfSBmcm9tIFwiLi9zeW1ib2xcIjtcbmltcG9ydCB7VmFyQmluZGluZ1RyYW5zZm9ybSwgQ29tcGlsZXRpbWVUcmFuc2Zvcm19IGZyb20gXCIuL3RyYW5zZm9ybXNcIjtcbmltcG9ydCB7ZXhwZWN0LCBhc3NlcnR9IGZyb20gXCIuL2Vycm9yc1wiO1xuaW1wb3J0IGxvYWRTeW50YXggZnJvbSBcIi4vbG9hZC1zeW50YXhcIjtcbmltcG9ydCB7U2NvcGUsIGZyZXNoU2NvcGV9IGZyb20gXCIuL3Njb3BlXCI7XG5jb25zdCBKdXN0Xzg3NSA9IE1heWJlLkp1c3Q7XG5jb25zdCBOb3RoaW5nXzg3NiA9IE1heWJlLk5vdGhpbmc7XG5jb25zdCByZWdpc3RlclN5bnRheF84NzcgPSAoc3R4Xzg4MiwgY29udGV4dF84ODMpID0+IHtcbiAgbGV0IG5ld0JpbmRpbmdfODg0ID0gZ2Vuc3ltKHN0eF84ODIudmFsKCkpO1xuICBjb250ZXh0Xzg4My5lbnYuc2V0KG5ld0JpbmRpbmdfODg0LnRvU3RyaW5nKCksIG5ldyBWYXJCaW5kaW5nVHJhbnNmb3JtKHN0eF84ODIpKTtcbiAgY29udGV4dF84ODMuYmluZGluZ3MuYWRkKHN0eF84ODIsIHtiaW5kaW5nOiBuZXdCaW5kaW5nXzg4NCwgcGhhc2U6IDAsIHNraXBEdXA6IHRydWV9KTtcbn07XG5sZXQgcmVnaXN0ZXJCaW5kaW5nc184NzggPSBfLmNvbmQoW1tpc0JpbmRpbmdJZGVudGlmaWVyLCAoe25hbWV9LCBjb250ZXh0Xzg4NSkgPT4ge1xuICByZWdpc3RlclN5bnRheF84NzcobmFtZSwgY29udGV4dF84ODUpO1xufV0sIFtpc0JpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXIsICh7YmluZGluZ30sIGNvbnRleHRfODg2KSA9PiB7XG4gIHJlZ2lzdGVyQmluZGluZ3NfODc4KGJpbmRpbmcsIGNvbnRleHRfODg2KTtcbn1dLCBbaXNCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eSwgKHtiaW5kaW5nfSwgY29udGV4dF84ODcpID0+IHtcbiAgcmVnaXN0ZXJCaW5kaW5nc184NzgoYmluZGluZywgY29udGV4dF84ODcpO1xufV0sIFtpc0FycmF5QmluZGluZywgKHtlbGVtZW50cywgcmVzdEVsZW1lbnR9LCBjb250ZXh0Xzg4OCkgPT4ge1xuICBpZiAocmVzdEVsZW1lbnQgIT0gbnVsbCkge1xuICAgIHJlZ2lzdGVyQmluZGluZ3NfODc4KHJlc3RFbGVtZW50LCBjb250ZXh0Xzg4OCk7XG4gIH1cbiAgZWxlbWVudHMuZm9yRWFjaChlbF84ODkgPT4ge1xuICAgIGlmIChlbF84ODkgIT0gbnVsbCkge1xuICAgICAgcmVnaXN0ZXJCaW5kaW5nc184NzgoZWxfODg5LCBjb250ZXh0Xzg4OCk7XG4gICAgfVxuICB9KTtcbn1dLCBbaXNPYmplY3RCaW5kaW5nLCAoe3Byb3BlcnRpZXN9LCBjb250ZXh0Xzg5MCkgPT4ge31dLCBbXy5ULCBiaW5kaW5nXzg5MSA9PiBhc3NlcnQoZmFsc2UsIFwibm90IGltcGxlbWVudGVkIHlldCBmb3I6IFwiICsgYmluZGluZ184OTEudHlwZSldXSk7XG5sZXQgcmVtb3ZlU2NvcGVfODc5ID0gXy5jb25kKFtbaXNCaW5kaW5nSWRlbnRpZmllciwgKHtuYW1lfSwgc2NvcGVfODkyKSA9PiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiBuYW1lLnJlbW92ZVNjb3BlKHNjb3BlXzg5Mil9KV0sIFtpc0FycmF5QmluZGluZywgKHtlbGVtZW50cywgcmVzdEVsZW1lbnR9LCBzY29wZV84OTMpID0+IHtcbiAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyYXlCaW5kaW5nXCIsIHtlbGVtZW50czogZWxlbWVudHMubWFwKGVsXzg5NCA9PiBlbF84OTQgPT0gbnVsbCA/IG51bGwgOiByZW1vdmVTY29wZV84NzkoZWxfODk0LCBzY29wZV84OTMpKSwgcmVzdEVsZW1lbnQ6IHJlc3RFbGVtZW50ID09IG51bGwgPyBudWxsIDogcmVtb3ZlU2NvcGVfODc5KHJlc3RFbGVtZW50LCBzY29wZV84OTMpfSk7XG59XSwgW2lzQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllciwgKHtiaW5kaW5nLCBpbml0fSwgc2NvcGVfODk1KSA9PiBuZXcgVGVybShcIkJpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXJcIiwge2JpbmRpbmc6IHJlbW92ZVNjb3BlXzg3OShiaW5kaW5nLCBzY29wZV84OTUpLCBpbml0OiBpbml0fSldLCBbaXNCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eSwgKHtiaW5kaW5nLCBuYW1lfSwgc2NvcGVfODk2KSA9PiBuZXcgVGVybShcIkJpbmRpbmdQcm9wZXJ0eVByb3BlcnR5XCIsIHtiaW5kaW5nOiByZW1vdmVTY29wZV84NzkoYmluZGluZywgc2NvcGVfODk2KSwgbmFtZTogbmFtZX0pXSwgW2lzT2JqZWN0QmluZGluZywgKHtwcm9wZXJ0aWVzfSwgc2NvcGVfODk3KSA9PiBuZXcgVGVybShcIk9iamVjdEJpbmRpbmdcIiwge3Byb3BlcnRpZXM6IHByb3BlcnRpZXMubWFwKHByb3BfODk4ID0+IHJlbW92ZVNjb3BlXzg3OShwcm9wXzg5OCwgc2NvcGVfODk3KSl9KV0sIFtfLlQsIGJpbmRpbmdfODk5ID0+IGFzc2VydChmYWxzZSwgXCJub3QgaW1wbGVtZW50ZWQgeWV0IGZvcjogXCIgKyBiaW5kaW5nXzg5OS50eXBlKV1dKTtcbmZ1bmN0aW9uIGZpbmROYW1lSW5FeHBvcnRzXzg4MChuYW1lXzkwMCwgZXhwXzkwMSkge1xuICBsZXQgZm91bmROYW1lc185MDIgPSBleHBfOTAxLnJlZHVjZSgoYWNjXzkwMywgZV85MDQpID0+IHtcbiAgICBpZiAoZV85MDQuZGVjbGFyYXRpb24pIHtcbiAgICAgIHJldHVybiBhY2NfOTAzLmNvbmNhdChlXzkwNC5kZWNsYXJhdGlvbi5kZWNsYXJhdG9ycy5yZWR1Y2UoKGFjY185MDUsIGRlY2xfOTA2KSA9PiB7XG4gICAgICAgIGlmIChkZWNsXzkwNi5iaW5kaW5nLm5hbWUudmFsKCkgPT09IG5hbWVfOTAwLnZhbCgpKSB7XG4gICAgICAgICAgcmV0dXJuIGFjY185MDUuY29uY2F0KGRlY2xfOTA2LmJpbmRpbmcubmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFjY185MDU7XG4gICAgICB9LCBMaXN0KCkpKTtcbiAgICB9XG4gICAgcmV0dXJuIGFjY185MDM7XG4gIH0sIExpc3QoKSk7XG4gIGFzc2VydChmb3VuZE5hbWVzXzkwMi5zaXplIDw9IDEsIFwiZXhwZWN0aW5nIG5vIG1vcmUgdGhhbiAxIG1hdGNoaW5nIG5hbWUgaW4gZXhwb3J0c1wiKTtcbiAgcmV0dXJuIGZvdW5kTmFtZXNfOTAyLmdldCgwKTtcbn1cbmZ1bmN0aW9uIGJpbmRJbXBvcnRzXzg4MShpbXBUZXJtXzkwNywgZXhNb2R1bGVfOTA4LCBjb250ZXh0XzkwOSkge1xuICBsZXQgbmFtZXNfOTEwID0gW107XG4gIGltcFRlcm1fOTA3Lm5hbWVkSW1wb3J0cy5mb3JFYWNoKHNwZWNpZmllcl85MTEgPT4ge1xuICAgIGxldCBuYW1lXzkxMiA9IHNwZWNpZmllcl85MTEuYmluZGluZy5uYW1lO1xuICAgIGxldCBleHBvcnROYW1lXzkxMyA9IGZpbmROYW1lSW5FeHBvcnRzXzg4MChuYW1lXzkxMiwgZXhNb2R1bGVfOTA4LmV4cG9ydEVudHJpZXMpO1xuICAgIGlmIChleHBvcnROYW1lXzkxMyAhPSBudWxsKSB7XG4gICAgICBsZXQgbmV3QmluZGluZyA9IGdlbnN5bShuYW1lXzkxMi52YWwoKSk7XG4gICAgICBjb250ZXh0XzkwOS5iaW5kaW5ncy5hZGRGb3J3YXJkKG5hbWVfOTEyLCBleHBvcnROYW1lXzkxMywgbmV3QmluZGluZyk7XG4gICAgICBpZiAoY29udGV4dF85MDkuc3RvcmUuaGFzKGV4cG9ydE5hbWVfOTEzLnJlc29sdmUoKSkpIHtcbiAgICAgICAgbmFtZXNfOTEwLnB1c2gobmFtZV85MTIpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIHJldHVybiBMaXN0KG5hbWVzXzkxMCk7XG59XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUb2tlbkV4cGFuZGVyIHtcbiAgY29uc3RydWN0b3IoY29udGV4dF85MTQpIHtcbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0XzkxNDtcbiAgfVxuICBleHBhbmQoc3R4bF85MTUpIHtcbiAgICBsZXQgcmVzdWx0XzkxNiA9IExpc3QoKTtcbiAgICBpZiAoc3R4bF85MTUuc2l6ZSA9PT0gMCkge1xuICAgICAgcmV0dXJuIHJlc3VsdF85MTY7XG4gICAgfVxuICAgIGxldCBwcmV2XzkxNyA9IExpc3QoKTtcbiAgICBsZXQgZW5mXzkxOCA9IG5ldyBFbmZvcmVzdGVyKHN0eGxfOTE1LCBwcmV2XzkxNywgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgc2VsZl85MTkgPSB0aGlzO1xuICAgIHdoaWxlICghZW5mXzkxOC5kb25lKSB7XG4gICAgICBsZXQgdGVybSA9IF8ucGlwZShfLmJpbmQoZW5mXzkxOC5lbmZvcmVzdCwgZW5mXzkxOCksIF8uY29uZChbW2lzVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudCwgdGVybV85MjAgPT4ge1xuICAgICAgICB0ZXJtXzkyMC5kZWNsYXJhdGlvbi5kZWNsYXJhdG9ycyA9IHRlcm1fOTIwLmRlY2xhcmF0aW9uLmRlY2xhcmF0b3JzLm1hcChkZWNsXzkyMSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiVmFyaWFibGVEZWNsYXJhdG9yXCIsIHtiaW5kaW5nOiByZW1vdmVTY29wZV84NzkoZGVjbF85MjEuYmluZGluZywgc2VsZl85MTkuY29udGV4dC51c2VTY29wZSksIGluaXQ6IGRlY2xfOTIxLmluaXR9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChpc1N5bnRheERlY2xhcmF0aW9uKHRlcm1fOTIwLmRlY2xhcmF0aW9uKSkge1xuICAgICAgICAgIGxldCBzY29wZSA9IGZyZXNoU2NvcGUoXCJub25yZWNcIik7XG4gICAgICAgICAgdGVybV85MjAuZGVjbGFyYXRpb24uZGVjbGFyYXRvcnMuZm9yRWFjaChkZWNsXzkyMiA9PiB7XG4gICAgICAgICAgICBsZXQgbmFtZV85MjMgPSBkZWNsXzkyMi5iaW5kaW5nLm5hbWU7XG4gICAgICAgICAgICBsZXQgbmFtZUFkZGVkXzkyNCA9IG5hbWVfOTIzLmFkZFNjb3BlKHNjb3BlKTtcbiAgICAgICAgICAgIGxldCBuYW1lUmVtb3ZlZF85MjUgPSBuYW1lXzkyMy5yZW1vdmVTY29wZShzZWxmXzkxOS5jb250ZXh0LmN1cnJlbnRTY29wZVtzZWxmXzkxOS5jb250ZXh0LmN1cnJlbnRTY29wZS5sZW5ndGggLSAxXSk7XG4gICAgICAgICAgICBsZXQgbmV3QmluZGluZ185MjYgPSBnZW5zeW0obmFtZV85MjMudmFsKCkpO1xuICAgICAgICAgICAgc2VsZl85MTkuY29udGV4dC5iaW5kaW5ncy5hZGRGb3J3YXJkKG5hbWVBZGRlZF85MjQsIG5hbWVSZW1vdmVkXzkyNSwgbmV3QmluZGluZ185MjYpO1xuICAgICAgICAgICAgZGVjbF85MjIuaW5pdCA9IGRlY2xfOTIyLmluaXQuYWRkU2NvcGUoc2NvcGUsIHNlbGZfOTE5LmNvbnRleHQuYmluZGluZ3MpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc1N5bnRheERlY2xhcmF0aW9uKHRlcm1fOTIwLmRlY2xhcmF0aW9uKSB8fCBpc1N5bnRheHJlY0RlY2xhcmF0aW9uKHRlcm1fOTIwLmRlY2xhcmF0aW9uKSkge1xuICAgICAgICAgIHRlcm1fOTIwLmRlY2xhcmF0aW9uLmRlY2xhcmF0b3JzLmZvckVhY2goZGVjbF85MjcgPT4ge1xuICAgICAgICAgICAgcmVnaXN0ZXJCaW5kaW5nc184NzgoZGVjbF85MjcuYmluZGluZywgc2VsZl85MTkuY29udGV4dCk7XG4gICAgICAgICAgICBsb2FkU3ludGF4KGRlY2xfOTI3LCBzZWxmXzkxOS5jb250ZXh0LCBzZWxmXzkxOS5jb250ZXh0LmVudik7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIE5vdGhpbmdfODc2KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGVybV85MjAuZGVjbGFyYXRpb24uZGVjbGFyYXRvcnMuZm9yRWFjaChkZWNsXzkyOCA9PiByZWdpc3RlckJpbmRpbmdzXzg3OChkZWNsXzkyOC5iaW5kaW5nLCBzZWxmXzkxOS5jb250ZXh0KSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIEp1c3RfODc1KHRlcm1fOTIwKTtcbiAgICAgIH1dLCBbaXNGdW5jdGlvbldpdGhOYW1lLCB0ZXJtXzkyOSA9PiB7XG4gICAgICAgIHRlcm1fOTI5Lm5hbWUgPSByZW1vdmVTY29wZV84NzkodGVybV85MjkubmFtZSwgc2VsZl85MTkuY29udGV4dC51c2VTY29wZSk7XG4gICAgICAgIHJlZ2lzdGVyQmluZGluZ3NfODc4KHRlcm1fOTI5Lm5hbWUsIHNlbGZfOTE5LmNvbnRleHQpO1xuICAgICAgICByZXR1cm4gSnVzdF84NzUodGVybV85MjkpO1xuICAgICAgfV0sIFtpc0ltcG9ydCwgdGVybV85MzAgPT4ge1xuICAgICAgICBsZXQgbW9kXzkzMSA9IHNlbGZfOTE5LmNvbnRleHQubW9kdWxlcy5sb2FkKHRlcm1fOTMwLm1vZHVsZVNwZWNpZmllci52YWwoKSwgc2VsZl85MTkuY29udGV4dCk7XG4gICAgICAgIGlmICh0ZXJtXzkzMC5mb3JTeW50YXgpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImltcG9ydCBmb3Igc3ludGF4IGlzIG5vdCBpbXBsZW1lbnRlZCB5ZXRcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbW9kXzkzMS52aXNpdChzZWxmXzkxOS5jb250ZXh0KTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgYm91bmROYW1lc185MzIgPSBiaW5kSW1wb3J0c184ODEodGVybV85MzAsIG1vZF85MzEsIHNlbGZfOTE5LmNvbnRleHQpO1xuICAgICAgICBpZiAoYm91bmROYW1lc185MzIuc2l6ZSA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiBKdXN0Xzg3NSh0ZXJtXzkzMCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE5vdGhpbmdfODc2KCk7XG4gICAgICB9XSwgW2lzRU9GLCBOb3RoaW5nXzg3Nl0sIFtfLlQsIEp1c3RfODc1XV0pLCBNYXliZS5tYXliZShMaXN0KCksIF8uaWRlbnRpdHkpKSgpO1xuICAgICAgcmVzdWx0XzkxNiA9IHJlc3VsdF85MTYuY29uY2F0KHRlcm0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0XzkxNjtcbiAgfVxufVxuIl19