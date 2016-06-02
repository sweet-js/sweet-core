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

var Just_898 = _ramdaFantasy.Maybe.Just;
var Nothing_899 = _ramdaFantasy.Maybe.Nothing;
var registerSyntax_900 = function registerSyntax_900(stx_905, context_906) {
  var newBinding_907 = (0, _symbol.gensym)(stx_905.val());
  context_906.env.set(newBinding_907.toString(), new _transforms.VarBindingTransform(stx_905));
  context_906.bindings.add(stx_905, { binding: newBinding_907, phase: 0, skipDup: true });
};
var registerBindings_901 = _.cond([[_terms.isBindingIdentifier, function (_ref, context_908) {
  var name = _ref.name;

  registerSyntax_900(name, context_908);
}], [_terms.isBindingPropertyIdentifier, function (_ref2, context_909) {
  var binding = _ref2.binding;

  registerBindings_901(binding, context_909);
}], [_terms.isBindingPropertyProperty, function (_ref3, context_910) {
  var binding = _ref3.binding;

  registerBindings_901(binding, context_910);
}], [_terms.isArrayBinding, function (_ref4, context_911) {
  var elements = _ref4.elements;
  var restElement = _ref4.restElement;

  if (restElement != null) {
    registerBindings_901(restElement, context_911);
  }
  elements.forEach(function (el_912) {
    if (el_912 != null) {
      registerBindings_901(el_912, context_911);
    }
  });
}], [_terms.isObjectBinding, function (_ref5, context_913) {
  var properties = _ref5.properties;
}], [_.T, function (binding_914) {
  return (0, _errors.assert)(false, "not implemented yet for: " + binding_914.type);
}]]);
var removeScope_902 = _.cond([[_terms.isBindingIdentifier, function (_ref6, scope_915) {
  var name = _ref6.name;
  return new _terms2.default("BindingIdentifier", { name: name.removeScope(scope_915) });
}], [_terms.isArrayBinding, function (_ref7, scope_916) {
  var elements = _ref7.elements;
  var restElement = _ref7.restElement;

  return new _terms2.default("ArrayBinding", { elements: elements.map(function (el_917) {
      return el_917 == null ? null : removeScope_902(el_917, scope_916);
    }), restElement: restElement == null ? null : removeScope_902(restElement, scope_916) });
}], [_terms.isBindingPropertyIdentifier, function (_ref8, scope_918) {
  var binding = _ref8.binding;
  var init = _ref8.init;
  return new _terms2.default("BindingPropertyIdentifier", { binding: removeScope_902(binding, scope_918), init: init });
}], [_terms.isBindingPropertyProperty, function (_ref9, scope_919) {
  var binding = _ref9.binding;
  var name = _ref9.name;
  return new _terms2.default("BindingPropertyProperty", { binding: removeScope_902(binding, scope_919), name: name });
}], [_terms.isObjectBinding, function (_ref10, scope_920) {
  var properties = _ref10.properties;
  return new _terms2.default("ObjectBinding", { properties: properties.map(function (prop_921) {
      return removeScope_902(prop_921, scope_920);
    }) });
}], [_.T, function (binding_922) {
  return (0, _errors.assert)(false, "not implemented yet for: " + binding_922.type);
}]]);
function findNameInExports_903(name_923, exp_924) {
  var foundNames_925 = exp_924.reduce(function (acc_926, e_927) {
    if (e_927.declaration) {
      return acc_926.concat(e_927.declaration.declarators.reduce(function (acc_928, decl_929) {
        if (decl_929.binding.name.val() === name_923.val()) {
          return acc_928.concat(decl_929.binding.name);
        }
        return acc_928;
      }, (0, _immutable.List)()));
    }
    return acc_926;
  }, (0, _immutable.List)());
  (0, _errors.assert)(foundNames_925.size <= 1, "expecting no more than 1 matching name in exports");
  return foundNames_925.get(0);
}
function bindImports_904(impTerm_930, exModule_931, context_932) {
  var names_933 = [];
  impTerm_930.namedImports.forEach(function (specifier_934) {
    var name_935 = specifier_934.binding.name;
    var exportName_936 = findNameInExports_903(name_935, exModule_931.exportEntries);
    if (exportName_936 != null) {
      var newBinding = (0, _symbol.gensym)(name_935.val());
      context_932.bindings.addForward(name_935, exportName_936, newBinding);
      if (context_932.store.has(exportName_936.resolve())) {
        names_933.push(name_935);
      }
    }
  });
  return (0, _immutable.List)(names_933);
}

var TokenExpander = function () {
  function TokenExpander(context_937) {
    _classCallCheck(this, TokenExpander);

    this.context = context_937;
  }

  _createClass(TokenExpander, [{
    key: "expand",
    value: function expand(stxl_938) {
      var result_939 = (0, _immutable.List)();
      if (stxl_938.size === 0) {
        return result_939;
      }
      var prev_940 = (0, _immutable.List)();
      var enf_941 = new _enforester.Enforester(stxl_938, prev_940, this.context);
      var self_942 = this;
      while (!enf_941.done) {
        var term = _.pipe(_.bind(enf_941.enforest, enf_941), _.cond([[_terms.isVariableDeclarationStatement, function (term_943) {
          term_943.declaration.declarators = term_943.declaration.declarators.map(function (decl_944) {
            return new _terms2.default("VariableDeclarator", { binding: removeScope_902(decl_944.binding, self_942.context.useScope), init: decl_944.init });
          });
          if ((0, _terms.isSyntaxDeclaration)(term_943.declaration)) {
            (function () {
              var scope = (0, _scope.freshScope)("nonrec");
              term_943.declaration.declarators.forEach(function (decl_945) {
                var name_946 = decl_945.binding.name;
                var nameAdded_947 = name_946.addScope(scope);
                var nameRemoved_948 = name_946.removeScope(self_942.context.currentScope[self_942.context.currentScope.length - 1]);
                var newBinding_949 = (0, _symbol.gensym)(name_946.val());
                self_942.context.bindings.addForward(nameAdded_947, nameRemoved_948, newBinding_949);
                decl_945.init = decl_945.init.addScope(scope, self_942.context.bindings);
              });
            })();
          }
          if ((0, _terms.isSyntaxDeclaration)(term_943.declaration) || (0, _terms.isSyntaxrecDeclaration)(term_943.declaration)) {
            term_943.declaration.declarators.forEach(function (decl_950) {
              registerBindings_901(decl_950.binding, self_942.context);
              (0, _loadSyntax2.default)(decl_950, self_942.context, self_942.context.env);
            });
            return Nothing_899();
          } else {
            term_943.declaration.declarators.forEach(function (decl_951) {
              return registerBindings_901(decl_951.binding, self_942.context);
            });
          }
          return Just_898(term_943);
        }], [_terms.isFunctionWithName, function (term_952) {
          term_952.name = removeScope_902(term_952.name, self_942.context.useScope);
          registerBindings_901(term_952.name, self_942.context);
          return Just_898(term_952);
        }], [_terms.isImport, function (term_953) {
          var mod_954 = self_942.context.modules.load(term_953.moduleSpecifier.val(), self_942.context);
          if (term_953.forSyntax) {
            console.log("import for syntax is not implemented yet");
          } else {
            mod_954.visit(self_942.context);
          }
          var boundNames_955 = bindImports_904(term_953, mod_954, self_942.context);
          if (boundNames_955.size === 0) {
            return Just_898(term_953);
          }
          return Nothing_899();
        }], [_terms.isEOF, Nothing_899], [_.T, Just_898]]), _ramdaFantasy.Maybe.maybe((0, _immutable.List)(), _.identity))();
        result_939 = result_939.concat(term);
      }
      return result_939;
    }
  }]);

  return TokenExpander;
}();

exports.default = TokenExpander;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3Rva2VuLWV4cGFuZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7SUFBYSxDOztBQUNiOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7QUFDQSxJQUFNLFdBQVcsb0JBQU0sSUFBdkI7QUFDQSxJQUFNLGNBQWMsb0JBQU0sT0FBMUI7QUFDQSxJQUFNLHFCQUFxQixTQUFyQixrQkFBcUIsQ0FBQyxPQUFELEVBQVUsV0FBVixFQUEwQjtBQUNuRCxNQUFJLGlCQUFpQixvQkFBTyxRQUFRLEdBQVIsRUFBUCxDQUFyQjtBQUNBLGNBQVksR0FBWixDQUFnQixHQUFoQixDQUFvQixlQUFlLFFBQWYsRUFBcEIsRUFBK0Msb0NBQXdCLE9BQXhCLENBQS9DO0FBQ0EsY0FBWSxRQUFaLENBQXFCLEdBQXJCLENBQXlCLE9BQXpCLEVBQWtDLEVBQUMsU0FBUyxjQUFWLEVBQTBCLE9BQU8sQ0FBakMsRUFBb0MsU0FBUyxJQUE3QyxFQUFsQztBQUNELENBSkQ7QUFLQSxJQUFJLHVCQUF1QixFQUFFLElBQUYsQ0FBTyxDQUFDLDZCQUFzQixnQkFBUyxXQUFULEVBQXlCO0FBQUEsTUFBdkIsSUFBdUIsUUFBdkIsSUFBdUI7O0FBQ2hGLHFCQUFtQixJQUFuQixFQUF5QixXQUF6QjtBQUNELENBRmtDLENBQUQsRUFFOUIscUNBQThCLGlCQUFZLFdBQVosRUFBNEI7QUFBQSxNQUExQixPQUEwQixTQUExQixPQUEwQjs7QUFDNUQsdUJBQXFCLE9BQXJCLEVBQThCLFdBQTlCO0FBQ0QsQ0FGRyxDQUY4QixFQUk5QixtQ0FBNEIsaUJBQVksV0FBWixFQUE0QjtBQUFBLE1BQTFCLE9BQTBCLFNBQTFCLE9BQTBCOztBQUMxRCx1QkFBcUIsT0FBckIsRUFBOEIsV0FBOUI7QUFDRCxDQUZHLENBSjhCLEVBTTlCLHdCQUFpQixp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QUE4QixTQUFTLGVBQVQsQ0FBeUIsR0FBekIsRUFBOUIsRUFBOEQsU0FBUyxPQUF2RSxDQUFkO0FBQ0EsY0FBSSxTQUFTLFNBQWIsRUFBd0I7QUFDdEIsb0JBQVEsR0FBUixDQUFZLDBDQUFaO0FBQ0QsV0FGRCxNQUVPO0FBQ0wsb0JBQVEsS0FBUixDQUFjLFNBQVMsT0FBdkI7QUFDRDtBQUNELGNBQUksaUJBQWlCLGdCQUFnQixRQUFoQixFQUEwQixPQUExQixFQUFtQyxTQUFTLE9BQTVDLENBQXJCO0FBQ0EsY0FBSSxlQUFlLElBQWYsS0FBd0IsQ0FBNUIsRUFBK0I7QUFDN0IsbUJBQU8sU0FBUyxRQUFULENBQVA7QUFDRDtBQUNELGlCQUFPLGFBQVA7QUFDRCxTQVpHLENBN0J3RCxFQXlDeEQsZUFBUSxXQUFSLENBekN3RCxFQXlDbEMsQ0FBQyxFQUFFLENBQUgsRUFBTSxRQUFOLENBekNrQyxDQUFQLENBQTFDLEVBeUNrQyxvQkFBTSxLQUFOLENBQVksc0JBQVosRUFBb0IsRUFBRSxRQUF0QixDQXpDbEMsR0FBWDtBQTBDQSxxQkFBYSxXQUFXLE1BQVgsQ0FBa0IsSUFBbEIsQ0FBYjtBQUNEO0FBQ0QsYUFBTyxVQUFQO0FBQ0Q7Ozs7OztrQkExRGtCLGEiLCJmaWxlIjoidG9rZW4tZXhwYW5kZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0xpc3R9IGZyb20gXCJpbW11dGFibGVcIjtcbmltcG9ydCB7ZW5mb3Jlc3RFeHByLCBFbmZvcmVzdGVyfSBmcm9tIFwiLi9lbmZvcmVzdGVyXCI7XG5pbXBvcnQgVGVybUV4cGFuZGVyIGZyb20gXCIuL3Rlcm0tZXhwYW5kZXIuanNcIjtcbmltcG9ydCBCaW5kaW5nTWFwIGZyb20gXCIuL2JpbmRpbmctbWFwLmpzXCI7XG5pbXBvcnQgRW52IGZyb20gXCIuL2VudlwiO1xuaW1wb3J0IFJlYWRlciBmcm9tIFwiLi9zaGlmdC1yZWFkZXJcIjtcbmltcG9ydCAgKiBhcyBfIGZyb20gXCJyYW1kYVwiO1xuaW1wb3J0IFRlcm0sIHtpc0VPRiwgaXNCaW5kaW5nSWRlbnRpZmllciwgaXNCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eSwgaXNCaW5kaW5nUHJvcGVydHlJZGVudGlmaWVyLCBpc09iamVjdEJpbmRpbmcsIGlzQXJyYXlCaW5kaW5nLCBpc0Z1bmN0aW9uRGVjbGFyYXRpb24sIGlzRnVuY3Rpb25FeHByZXNzaW9uLCBpc0Z1bmN0aW9uVGVybSwgaXNGdW5jdGlvbldpdGhOYW1lLCBpc1N5bnRheERlY2xhcmF0aW9uLCBpc1N5bnRheHJlY0RlY2xhcmF0aW9uLCBpc1ZhcmlhYmxlRGVjbGFyYXRpb24sIGlzVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudCwgaXNJbXBvcnQsIGlzRXhwb3J0fSBmcm9tIFwiLi90ZXJtc1wiO1xuaW1wb3J0IHtNYXliZX0gZnJvbSBcInJhbWRhLWZhbnRhc3lcIjtcbmltcG9ydCB7Z2Vuc3ltfSBmcm9tIFwiLi9zeW1ib2xcIjtcbmltcG9ydCB7VmFyQmluZGluZ1RyYW5zZm9ybSwgQ29tcGlsZXRpbWVUcmFuc2Zvcm19IGZyb20gXCIuL3RyYW5zZm9ybXNcIjtcbmltcG9ydCB7ZXhwZWN0LCBhc3NlcnR9IGZyb20gXCIuL2Vycm9yc1wiO1xuaW1wb3J0IGxvYWRTeW50YXggZnJvbSBcIi4vbG9hZC1zeW50YXhcIjtcbmltcG9ydCB7U2NvcGUsIGZyZXNoU2NvcGV9IGZyb20gXCIuL3Njb3BlXCI7XG5jb25zdCBKdXN0Xzg5OCA9IE1heWJlLkp1c3Q7XG5jb25zdCBOb3RoaW5nXzg5OSA9IE1heWJlLk5vdGhpbmc7XG5jb25zdCByZWdpc3RlclN5bnRheF85MDAgPSAoc3R4XzkwNSwgY29udGV4dF85MDYpID0+IHtcbiAgbGV0IG5ld0JpbmRpbmdfOTA3ID0gZ2Vuc3ltKHN0eF85MDUudmFsKCkpO1xuICBjb250ZXh0XzkwNi5lbnYuc2V0KG5ld0JpbmRpbmdfOTA3LnRvU3RyaW5nKCksIG5ldyBWYXJCaW5kaW5nVHJhbnNmb3JtKHN0eF85MDUpKTtcbiAgY29udGV4dF85MDYuYmluZGluZ3MuYWRkKHN0eF85MDUsIHtiaW5kaW5nOiBuZXdCaW5kaW5nXzkwNywgcGhhc2U6IDAsIHNraXBEdXA6IHRydWV9KTtcbn07XG5sZXQgcmVnaXN0ZXJCaW5kaW5nc185MDEgPSBfLmNvbmQoW1tpc0JpbmRpbmdJZGVudGlmaWVyLCAoe25hbWV9LCBjb250ZXh0XzkwOCkgPT4ge1xuICByZWdpc3RlclN5bnRheF85MDAobmFtZSwgY29udGV4dF85MDgpO1xufV0sIFtpc0JpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXIsICh7YmluZGluZ30sIGNvbnRleHRfOTA5KSA9PiB7XG4gIHJlZ2lzdGVyQmluZGluZ3NfOTAxKGJpbmRpbmcsIGNvbnRleHRfOTA5KTtcbn1dLCBbaXNCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eSwgKHtiaW5kaW5nfSwgY29udGV4dF85MTApID0+IHtcbiAgcmVnaXN0ZXJCaW5kaW5nc185MDEoYmluZGluZywgY29udGV4dF85MTApO1xufV0sIFtpc0FycmF5QmluZGluZywgKHtlbGVtZW50cywgcmVzdEVsZW1lbnR9LCBjb250ZXh0XzkxMSkgPT4ge1xuICBpZiAocmVzdEVsZW1lbnQgIT0gbnVsbCkge1xuICAgIHJlZ2lzdGVyQmluZGluZ3NfOTAxKHJlc3RFbGVtZW50LCBjb250ZXh0XzkxMSk7XG4gIH1cbiAgZWxlbWVudHMuZm9yRWFjaChlbF85MTIgPT4ge1xuICAgIGlmIChlbF85MTIgIT0gbnVsbCkge1xuICAgICAgcmVnaXN0ZXJCaW5kaW5nc185MDEoZWxfOTEyLCBjb250ZXh0XzkxMSk7XG4gICAgfVxuICB9KTtcbn1dLCBbaXNPYmplY3RCaW5kaW5nLCAoe3Byb3BlcnRpZXN9LCBjb250ZXh0XzkxMykgPT4ge31dLCBbXy5ULCBiaW5kaW5nXzkxNCA9PiBhc3NlcnQoZmFsc2UsIFwibm90IGltcGxlbWVudGVkIHlldCBmb3I6IFwiICsgYmluZGluZ185MTQudHlwZSldXSk7XG5sZXQgcmVtb3ZlU2NvcGVfOTAyID0gXy5jb25kKFtbaXNCaW5kaW5nSWRlbnRpZmllciwgKHtuYW1lfSwgc2NvcGVfOTE1KSA9PiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiBuYW1lLnJlbW92ZVNjb3BlKHNjb3BlXzkxNSl9KV0sIFtpc0FycmF5QmluZGluZywgKHtlbGVtZW50cywgcmVzdEVsZW1lbnR9LCBzY29wZV85MTYpID0+IHtcbiAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyYXlCaW5kaW5nXCIsIHtlbGVtZW50czogZWxlbWVudHMubWFwKGVsXzkxNyA9PiBlbF85MTcgPT0gbnVsbCA/IG51bGwgOiByZW1vdmVTY29wZV85MDIoZWxfOTE3LCBzY29wZV85MTYpKSwgcmVzdEVsZW1lbnQ6IHJlc3RFbGVtZW50ID09IG51bGwgPyBudWxsIDogcmVtb3ZlU2NvcGVfOTAyKHJlc3RFbGVtZW50LCBzY29wZV85MTYpfSk7XG59XSwgW2lzQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllciwgKHtiaW5kaW5nLCBpbml0fSwgc2NvcGVfOTE4KSA9PiBuZXcgVGVybShcIkJpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXJcIiwge2JpbmRpbmc6IHJlbW92ZVNjb3BlXzkwMihiaW5kaW5nLCBzY29wZV85MTgpLCBpbml0OiBpbml0fSldLCBbaXNCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eSwgKHtiaW5kaW5nLCBuYW1lfSwgc2NvcGVfOTE5KSA9PiBuZXcgVGVybShcIkJpbmRpbmdQcm9wZXJ0eVByb3BlcnR5XCIsIHtiaW5kaW5nOiByZW1vdmVTY29wZV85MDIoYmluZGluZywgc2NvcGVfOTE5KSwgbmFtZTogbmFtZX0pXSwgW2lzT2JqZWN0QmluZGluZywgKHtwcm9wZXJ0aWVzfSwgc2NvcGVfOTIwKSA9PiBuZXcgVGVybShcIk9iamVjdEJpbmRpbmdcIiwge3Byb3BlcnRpZXM6IHByb3BlcnRpZXMubWFwKHByb3BfOTIxID0+IHJlbW92ZVNjb3BlXzkwMihwcm9wXzkyMSwgc2NvcGVfOTIwKSl9KV0sIFtfLlQsIGJpbmRpbmdfOTIyID0+IGFzc2VydChmYWxzZSwgXCJub3QgaW1wbGVtZW50ZWQgeWV0IGZvcjogXCIgKyBiaW5kaW5nXzkyMi50eXBlKV1dKTtcbmZ1bmN0aW9uIGZpbmROYW1lSW5FeHBvcnRzXzkwMyhuYW1lXzkyMywgZXhwXzkyNCkge1xuICBsZXQgZm91bmROYW1lc185MjUgPSBleHBfOTI0LnJlZHVjZSgoYWNjXzkyNiwgZV85MjcpID0+IHtcbiAgICBpZiAoZV85MjcuZGVjbGFyYXRpb24pIHtcbiAgICAgIHJldHVybiBhY2NfOTI2LmNvbmNhdChlXzkyNy5kZWNsYXJhdGlvbi5kZWNsYXJhdG9ycy5yZWR1Y2UoKGFjY185MjgsIGRlY2xfOTI5KSA9PiB7XG4gICAgICAgIGlmIChkZWNsXzkyOS5iaW5kaW5nLm5hbWUudmFsKCkgPT09IG5hbWVfOTIzLnZhbCgpKSB7XG4gICAgICAgICAgcmV0dXJuIGFjY185MjguY29uY2F0KGRlY2xfOTI5LmJpbmRpbmcubmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFjY185Mjg7XG4gICAgICB9LCBMaXN0KCkpKTtcbiAgICB9XG4gICAgcmV0dXJuIGFjY185MjY7XG4gIH0sIExpc3QoKSk7XG4gIGFzc2VydChmb3VuZE5hbWVzXzkyNS5zaXplIDw9IDEsIFwiZXhwZWN0aW5nIG5vIG1vcmUgdGhhbiAxIG1hdGNoaW5nIG5hbWUgaW4gZXhwb3J0c1wiKTtcbiAgcmV0dXJuIGZvdW5kTmFtZXNfOTI1LmdldCgwKTtcbn1cbmZ1bmN0aW9uIGJpbmRJbXBvcnRzXzkwNChpbXBUZXJtXzkzMCwgZXhNb2R1bGVfOTMxLCBjb250ZXh0XzkzMikge1xuICBsZXQgbmFtZXNfOTMzID0gW107XG4gIGltcFRlcm1fOTMwLm5hbWVkSW1wb3J0cy5mb3JFYWNoKHNwZWNpZmllcl85MzQgPT4ge1xuICAgIGxldCBuYW1lXzkzNSA9IHNwZWNpZmllcl85MzQuYmluZGluZy5uYW1lO1xuICAgIGxldCBleHBvcnROYW1lXzkzNiA9IGZpbmROYW1lSW5FeHBvcnRzXzkwMyhuYW1lXzkzNSwgZXhNb2R1bGVfOTMxLmV4cG9ydEVudHJpZXMpO1xuICAgIGlmIChleHBvcnROYW1lXzkzNiAhPSBudWxsKSB7XG4gICAgICBsZXQgbmV3QmluZGluZyA9IGdlbnN5bShuYW1lXzkzNS52YWwoKSk7XG4gICAgICBjb250ZXh0XzkzMi5iaW5kaW5ncy5hZGRGb3J3YXJkKG5hbWVfOTM1LCBleHBvcnROYW1lXzkzNiwgbmV3QmluZGluZyk7XG4gICAgICBpZiAoY29udGV4dF85MzIuc3RvcmUuaGFzKGV4cG9ydE5hbWVfOTM2LnJlc29sdmUoKSkpIHtcbiAgICAgICAgbmFtZXNfOTMzLnB1c2gobmFtZV85MzUpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIHJldHVybiBMaXN0KG5hbWVzXzkzMyk7XG59XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUb2tlbkV4cGFuZGVyIHtcbiAgY29uc3RydWN0b3IoY29udGV4dF85MzcpIHtcbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0XzkzNztcbiAgfVxuICBleHBhbmQoc3R4bF85MzgpIHtcbiAgICBsZXQgcmVzdWx0XzkzOSA9IExpc3QoKTtcbiAgICBpZiAoc3R4bF85Mzguc2l6ZSA9PT0gMCkge1xuICAgICAgcmV0dXJuIHJlc3VsdF85Mzk7XG4gICAgfVxuICAgIGxldCBwcmV2Xzk0MCA9IExpc3QoKTtcbiAgICBsZXQgZW5mXzk0MSA9IG5ldyBFbmZvcmVzdGVyKHN0eGxfOTM4LCBwcmV2Xzk0MCwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgc2VsZl85NDIgPSB0aGlzO1xuICAgIHdoaWxlICghZW5mXzk0MS5kb25lKSB7XG4gICAgICBsZXQgdGVybSA9IF8ucGlwZShfLmJpbmQoZW5mXzk0MS5lbmZvcmVzdCwgZW5mXzk0MSksIF8uY29uZChbW2lzVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudCwgdGVybV85NDMgPT4ge1xuICAgICAgICB0ZXJtXzk0My5kZWNsYXJhdGlvbi5kZWNsYXJhdG9ycyA9IHRlcm1fOTQzLmRlY2xhcmF0aW9uLmRlY2xhcmF0b3JzLm1hcChkZWNsXzk0NCA9PiB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiVmFyaWFibGVEZWNsYXJhdG9yXCIsIHtiaW5kaW5nOiByZW1vdmVTY29wZV85MDIoZGVjbF85NDQuYmluZGluZywgc2VsZl85NDIuY29udGV4dC51c2VTY29wZSksIGluaXQ6IGRlY2xfOTQ0LmluaXR9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChpc1N5bnRheERlY2xhcmF0aW9uKHRlcm1fOTQzLmRlY2xhcmF0aW9uKSkge1xuICAgICAgICAgIGxldCBzY29wZSA9IGZyZXNoU2NvcGUoXCJub25yZWNcIik7XG4gICAgICAgICAgdGVybV85NDMuZGVjbGFyYXRpb24uZGVjbGFyYXRvcnMuZm9yRWFjaChkZWNsXzk0NSA9PiB7XG4gICAgICAgICAgICBsZXQgbmFtZV85NDYgPSBkZWNsXzk0NS5iaW5kaW5nLm5hbWU7XG4gICAgICAgICAgICBsZXQgbmFtZUFkZGVkXzk0NyA9IG5hbWVfOTQ2LmFkZFNjb3BlKHNjb3BlKTtcbiAgICAgICAgICAgIGxldCBuYW1lUmVtb3ZlZF85NDggPSBuYW1lXzk0Ni5yZW1vdmVTY29wZShzZWxmXzk0Mi5jb250ZXh0LmN1cnJlbnRTY29wZVtzZWxmXzk0Mi5jb250ZXh0LmN1cnJlbnRTY29wZS5sZW5ndGggLSAxXSk7XG4gICAgICAgICAgICBsZXQgbmV3QmluZGluZ185NDkgPSBnZW5zeW0obmFtZV85NDYudmFsKCkpO1xuICAgICAgICAgICAgc2VsZl85NDIuY29udGV4dC5iaW5kaW5ncy5hZGRGb3J3YXJkKG5hbWVBZGRlZF85NDcsIG5hbWVSZW1vdmVkXzk0OCwgbmV3QmluZGluZ185NDkpO1xuICAgICAgICAgICAgZGVjbF85NDUuaW5pdCA9IGRlY2xfOTQ1LmluaXQuYWRkU2NvcGUoc2NvcGUsIHNlbGZfOTQyLmNvbnRleHQuYmluZGluZ3MpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc1N5bnRheERlY2xhcmF0aW9uKHRlcm1fOTQzLmRlY2xhcmF0aW9uKSB8fCBpc1N5bnRheHJlY0RlY2xhcmF0aW9uKHRlcm1fOTQzLmRlY2xhcmF0aW9uKSkge1xuICAgICAgICAgIHRlcm1fOTQzLmRlY2xhcmF0aW9uLmRlY2xhcmF0b3JzLmZvckVhY2goZGVjbF85NTAgPT4ge1xuICAgICAgICAgICAgcmVnaXN0ZXJCaW5kaW5nc185MDEoZGVjbF85NTAuYmluZGluZywgc2VsZl85NDIuY29udGV4dCk7XG4gICAgICAgICAgICBsb2FkU3ludGF4KGRlY2xfOTUwLCBzZWxmXzk0Mi5jb250ZXh0LCBzZWxmXzk0Mi5jb250ZXh0LmVudik7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIE5vdGhpbmdfODk5KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGVybV85NDMuZGVjbGFyYXRpb24uZGVjbGFyYXRvcnMuZm9yRWFjaChkZWNsXzk1MSA9PiByZWdpc3RlckJpbmRpbmdzXzkwMShkZWNsXzk1MS5iaW5kaW5nLCBzZWxmXzk0Mi5jb250ZXh0KSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIEp1c3RfODk4KHRlcm1fOTQzKTtcbiAgICAgIH1dLCBbaXNGdW5jdGlvbldpdGhOYW1lLCB0ZXJtXzk1MiA9PiB7XG4gICAgICAgIHRlcm1fOTUyLm5hbWUgPSByZW1vdmVTY29wZV85MDIodGVybV85NTIubmFtZSwgc2VsZl85NDIuY29udGV4dC51c2VTY29wZSk7XG4gICAgICAgIHJlZ2lzdGVyQmluZGluZ3NfOTAxKHRlcm1fOTUyLm5hbWUsIHNlbGZfOTQyLmNvbnRleHQpO1xuICAgICAgICByZXR1cm4gSnVzdF84OTgodGVybV85NTIpO1xuICAgICAgfV0sIFtpc0ltcG9ydCwgdGVybV85NTMgPT4ge1xuICAgICAgICBsZXQgbW9kXzk1NCA9IHNlbGZfOTQyLmNvbnRleHQubW9kdWxlcy5sb2FkKHRlcm1fOTUzLm1vZHVsZVNwZWNpZmllci52YWwoKSwgc2VsZl85NDIuY29udGV4dCk7XG4gICAgICAgIGlmICh0ZXJtXzk1My5mb3JTeW50YXgpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImltcG9ydCBmb3Igc3ludGF4IGlzIG5vdCBpbXBsZW1lbnRlZCB5ZXRcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbW9kXzk1NC52aXNpdChzZWxmXzk0Mi5jb250ZXh0KTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgYm91bmROYW1lc185NTUgPSBiaW5kSW1wb3J0c185MDQodGVybV85NTMsIG1vZF85NTQsIHNlbGZfOTQyLmNvbnRleHQpO1xuICAgICAgICBpZiAoYm91bmROYW1lc185NTUuc2l6ZSA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiBKdXN0Xzg5OCh0ZXJtXzk1Myk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE5vdGhpbmdfODk5KCk7XG4gICAgICB9XSwgW2lzRU9GLCBOb3RoaW5nXzg5OV0sIFtfLlQsIEp1c3RfODk4XV0pLCBNYXliZS5tYXliZShMaXN0KCksIF8uaWRlbnRpdHkpKSgpO1xuICAgICAgcmVzdWx0XzkzOSA9IHJlc3VsdF85MzkuY29uY2F0KHRlcm0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0XzkzOTtcbiAgfVxufVxuIl19