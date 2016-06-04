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

var Just_890 = _ramdaFantasy.Maybe.Just;
var Nothing_891 = _ramdaFantasy.Maybe.Nothing;
var registerSyntax_892 = function registerSyntax_892(stx_897, context_898) {
  var newBinding_899 = (0, _symbol.gensym)(stx_897.val());
  context_898.env.set(newBinding_899.toString(), new _transforms.VarBindingTransform(stx_897));
  context_898.bindings.add(stx_897, { binding: newBinding_899, phase: 0, skipDup: true });
};
var registerBindings_893 = _.cond([[_terms.isBindingIdentifier, function (_ref, context_900) {
  var name = _ref.name;

  registerSyntax_892(name, context_900);
}], [_terms.isBindingPropertyIdentifier, function (_ref2, context_901) {
  var binding = _ref2.binding;

  registerBindings_893(binding, context_901);
}], [_terms.isBindingPropertyProperty, function (_ref3, context_902) {
  var binding = _ref3.binding;

  registerBindings_893(binding, context_902);
}], [_terms.isArrayBinding, function (_ref4, context_903) {
  var elements = _ref4.elements;
  var restElement = _ref4.restElement;

  if (restElement != null) {
    registerBindings_893(restElement, context_903);
  }
  elements.forEach(function (el_904) {
    if (el_904 != null) {
      registerBindings_893(el_904, context_903);
    }
  });
}], [_terms.isObjectBinding, function (_ref5, context_905) {
  var properties = _ref5.properties;
}], [_.T, function (binding_906) {
  return (0, _errors.assert)(false, "not implemented yet for: " + binding_906.type);
}]]);
var removeScope_894 = _.cond([[_terms.isBindingIdentifier, function (_ref6, scope_907) {
  var name = _ref6.name;
  return new _terms2.default("BindingIdentifier", { name: name.removeScope(scope_907) });
}], [_terms.isArrayBinding, function (_ref7, scope_908) {
  var elements = _ref7.elements;
  var restElement = _ref7.restElement;

  return new _terms2.default("ArrayBinding", { elements: elements.map(function (el_909) {
      return el_909 == null ? null : removeScope_894(el_909, scope_908);
    }), restElement: restElement == null ? null : removeScope_894(restElement, scope_908) });
}], [_terms.isBindingPropertyIdentifier, function (_ref8, scope_910) {
  var binding = _ref8.binding;
  var init = _ref8.init;
  return new _terms2.default("BindingPropertyIdentifier", { binding: removeScope_894(binding, scope_910), init: init });
}], [_terms.isBindingPropertyProperty, function (_ref9, scope_911) {
  var binding = _ref9.binding;
  var name = _ref9.name;
  return new _terms2.default("BindingPropertyProperty", { binding: removeScope_894(binding, scope_911), name: name });
}], [_terms.isObjectBinding, function (_ref10, scope_912) {
  var properties = _ref10.properties;
  return new _terms2.default("ObjectBinding", { properties: properties.map(function (prop_913) {
      return removeScope_894(prop_913, scope_912);
    }) });
}], [_.T, function (binding_914) {
  return (0, _errors.assert)(false, "not implemented yet for: " + binding_914.type);
}]]);
function findNameInExports_895(name_915, exp_916) {
  var foundNames_917 = exp_916.reduce(function (acc_918, e_919) {
    if (e_919.declaration) {
      return acc_918.concat(e_919.declaration.declarators.reduce(function (acc_920, decl_921) {
        if (decl_921.binding.name.val() === name_915.val()) {
          return acc_920.concat(decl_921.binding.name);
        }
        return acc_920;
      }, (0, _immutable.List)()));
    }
    return acc_918;
  }, (0, _immutable.List)());
  (0, _errors.assert)(foundNames_917.size <= 1, "expecting no more than 1 matching name in exports");
  return foundNames_917.get(0);
}
function bindImports_896(impTerm_922, exModule_923, context_924) {
  var names_925 = [];
  impTerm_922.namedImports.forEach(function (specifier_926) {
    var name_927 = specifier_926.binding.name;
    var exportName_928 = findNameInExports_895(name_927, exModule_923.exportEntries);
    if (exportName_928 != null) {
      var newBinding = (0, _symbol.gensym)(name_927.val());
      context_924.bindings.addForward(name_927, exportName_928, newBinding);
      if (context_924.store.has(exportName_928.resolve())) {
        names_925.push(name_927);
      }
    }
  });
  return (0, _immutable.List)(names_925);
}

var TokenExpander = function () {
  function TokenExpander(context_929) {
    _classCallCheck(this, TokenExpander);

    this.context = context_929;
  }

  _createClass(TokenExpander, [{
    key: "expand",
    value: function expand(stxl_930) {
      var result_931 = (0, _immutable.List)();
      if (stxl_930.size === 0) {
        return result_931;
      }
      var prev_932 = (0, _immutable.List)();
      var enf_933 = new _enforester.Enforester(stxl_930, prev_932, this.context);
      var self_934 = this;
      while (!enf_933.done) {
        var term = _.pipe(_.bind(enf_933.enforest, enf_933), _.cond([[_terms.isVariableDeclarationStatement, function (term_935) {
          term_935.declaration.declarators = term_935.declaration.declarators.map(function (decl_936) {
            return new _terms2.default("VariableDeclarator", { binding: removeScope_894(decl_936.binding, self_934.context.useScope), init: decl_936.init });
          });
          if ((0, _terms.isSyntaxDeclaration)(term_935.declaration)) {
            (function () {
              var scope = (0, _scope.freshScope)("nonrec");
              term_935.declaration.declarators.forEach(function (decl_937) {
                var name_938 = decl_937.binding.name;
                var nameAdded_939 = name_938.addScope(scope);
                var nameRemoved_940 = name_938.removeScope(self_934.context.currentScope[self_934.context.currentScope.length - 1]);
                var newBinding_941 = (0, _symbol.gensym)(name_938.val());
                self_934.context.bindings.addForward(nameAdded_939, nameRemoved_940, newBinding_941);
                decl_937.init = decl_937.init.addScope(scope, self_934.context.bindings);
              });
            })();
          }
          if ((0, _terms.isSyntaxDeclaration)(term_935.declaration) || (0, _terms.isSyntaxrecDeclaration)(term_935.declaration)) {
            term_935.declaration.declarators.forEach(function (decl_942) {
              registerBindings_893(decl_942.binding, self_934.context);
              (0, _loadSyntax2.default)(decl_942, self_934.context, self_934.context.env);
            });
            return Nothing_891();
          } else {
            term_935.declaration.declarators.forEach(function (decl_943) {
              return registerBindings_893(decl_943.binding, self_934.context);
            });
          }
          return Just_890(term_935);
        }], [_terms.isFunctionWithName, function (term_944) {
          term_944.name = removeScope_894(term_944.name, self_934.context.useScope);
          registerBindings_893(term_944.name, self_934.context);
          return Just_890(term_944);
        }], [_terms.isImport, function (term_945) {
          var mod_946 = self_934.context.modules.load(term_945.moduleSpecifier.val(), self_934.context);
          if (term_945.forSyntax) {
            console.log("import for syntax is not implemented yet");
          } else {
            mod_946.visit(self_934.context);
          }
          var boundNames_947 = bindImports_896(term_945, mod_946, self_934.context);
          if (boundNames_947.size === 0) {
            return Just_890(term_945);
          }
          return Nothing_891();
        }], [_terms.isEOF, Nothing_891], [_.T, Just_890]]), _ramdaFantasy.Maybe.maybe((0, _immutable.List)(), _.identity))();
        result_931 = result_931.concat(term);
      }
      return result_931;
    }
  }]);

  return TokenExpander;
}();

exports.default = TokenExpander;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3Rva2VuLWV4cGFuZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7SUFBYSxDOztBQUNiOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7QUFDQSxJQUFNLFdBQVcsb0JBQU0sSUFBdkI7QUFDQSxJQUFNLGNBQWMsb0JBQU0sT0FBMUI7QUFDQSxJQUFNLHFCQUFxQixTQUFyQixrQkFBcUIsQ0FBQyxPQUFELEVBQVUsV0FBVixFQUEwQjtBQUNuRCxNQUFJLGlCQUFpQixvQkFBTyxRQUFRLEdBQVIsRUFBUCxDQUFyQjtBQUNBLGNBQVksR0FBWixDQUFnQixHQUFoQixDQUFvQixlQUFlLFFBQWYsRUFBcEIsRUFBK0Msb0NBQXdCLE9BQXhCLENBQS9DO0FBQ0EsY0FBWSxRQUFaLENBQXFCLEdBQXJCLENBQXlCLE9BQXpCLEVBQWtDLEVBQUMsU0FBUyxjQUFWLEVBQTBCLE9BQU8sQ0FBakMsRUFBb0MsU0FBUyxJQUE3QyxFQUFsQztBQUNELENBSkQ7QUFLQSxJQUFJLHVCQUF1QixFQUFFLElBQUYsQ0FBTyxDQUFDLDZCQUFzQixnQkFBUyxXQUFULEVBQXlCO0FBQUEsTUFBdkIsSUFBdUIsUUFBdkIsSUFBdUI7O0FBQ2hGLHFCQUFtQixJQUFuQixFQUF5QixXQUF6QjtBQUNELENBRmtDLENBQUQsRUFFOUIscUNBQThCLGlCQUFZLFdBQVosRUFBNEI7QUFBQSxNQUExQixPQUEwQixTQUExQixPQUEwQjs7QUFDNUQsdUJBQXFCLE9BQXJCLEVBQThCLFdBQTlCO0FBQ0QsQ0FGRyxDQUY4QixFQUk5QixtQ0FBNEIsaUJBQVksV0FBWixFQUE0QjtBQUFBLE1BQTFCLE9BQTBCLFNBQTFCLE9BQTBCOztBQUMxRCx1QkFBcUIsT0FBckIsRUFBOEIsV0FBOUI7QUFDRCxDQUZHLENBSjhCLEVBTTlCLHdCQUFpQixp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QUE4QixTQUFTLGVBQVQsQ0FBeUIsR0FBekIsRUFBOUIsRUFBOEQsU0FBUyxPQUF2RSxDQUFkO0FBQ0EsY0FBSSxTQUFTLFNBQWIsRUFBd0I7QUFDdEIsb0JBQVEsR0FBUixDQUFZLDBDQUFaO0FBQ0QsV0FGRCxNQUVPO0FBQ0wsb0JBQVEsS0FBUixDQUFjLFNBQVMsT0FBdkI7QUFDRDtBQUNELGNBQUksaUJBQWlCLGdCQUFnQixRQUFoQixFQUEwQixPQUExQixFQUFtQyxTQUFTLE9BQTVDLENBQXJCO0FBQ0EsY0FBSSxlQUFlLElBQWYsS0FBd0IsQ0FBNUIsRUFBK0I7QUFDN0IsbUJBQU8sU0FBUyxRQUFULENBQVA7QUFDRDtBQUNELGlCQUFPLGFBQVA7QUFDRCxTQVpHLENBN0J3RCxFQXlDeEQsZUFBUSxXQUFSLENBekN3RCxFQXlDbEMsQ0FBQyxFQUFFLENBQUgsRUFBTSxRQUFOLENBekNrQyxDQUFQLENBQTFDLEVBeUNrQyxvQkFBTSxLQUFOLENBQVksc0JBQVosRUFBb0IsRUFBRSxRQUF0QixDQXpDbEMsR0FBWDtBQTBDQSxxQkFBYSxXQUFXLE1BQVgsQ0FBa0IsSUFBbEIsQ0FBYjtBQUNEO0FBQ0QsYUFBTyxVQUFQO0FBQ0Q7Ozs7OztrQkExRGtCLGEiLCJmaWxlIjoidG9rZW4tZXhwYW5kZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0xpc3R9IGZyb20gXCJpbW11dGFibGVcIjtcbmltcG9ydCB7ZW5mb3Jlc3RFeHByLCBFbmZvcmVzdGVyfSBmcm9tIFwiLi9lbmZvcmVzdGVyXCI7XG5pbXBvcnQgVGVybUV4cGFuZGVyIGZyb20gXCIuL3Rlcm0tZXhwYW5kZXIuanNcIjtcbmltcG9ydCBCaW5kaW5nTWFwIGZyb20gXCIuL2JpbmRpbmctbWFwLmpzXCI7XG5pbXBvcnQgRW52IGZyb20gXCIuL2VudlwiO1xuaW1wb3J0IFJlYWRlciBmcm9tIFwiLi9zaGlmdC1yZWFkZXJcIjtcbmltcG9ydCAgKiBhcyBfIGZyb20gXCJyYW1kYVwiO1xuaW1wb3J0IFRlcm0sIHtpc0VPRiwgaXNCaW5kaW5nSWRlbnRpZmllciwgaXNCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eSwgaXNCaW5kaW5nUHJvcGVydHlJZGVudGlmaWVyLCBpc09iamVjdEJpbmRpbmcsIGlzQXJyYXlCaW5kaW5nLCBpc0Z1bmN0aW9uRGVjbGFyYXRpb24sIGlzRnVuY3Rpb25FeHByZXNzaW9uLCBpc0Z1bmN0aW9uVGVybSwgaXNGdW5jdGlvbldpdGhOYW1lLCBpc1N5bnRheERlY2xhcmF0aW9uLCBpc1N5bnRheHJlY0RlY2xhcmF0aW9uLCBpc1ZhcmlhYmxlRGVjbGFyYXRpb24sIGlzVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudCwgaXNJbXBvcnQsIGlzRXhwb3J0fSBmcm9tIFwiLi90ZXJtc1wiO1xuaW1wb3J0IHtNYXliZX0gZnJvbSBcInJhbWRhLWZhbnRhc3lcIjtcbmltcG9ydCB7Z2Vuc3ltfSBmcm9tIFwiLi9zeW1ib2xcIjtcbmltcG9ydCB7VmFyQmluZGluZ1RyYW5zZm9ybSwgQ29tcGlsZXRpbWVUcmFuc2Zvcm19IGZyb20gXCIuL3RyYW5zZm9ybXNcIjtcbmltcG9ydCB7ZXhwZWN0LCBhc3NlcnR9IGZyb20gXCIuL2Vycm9yc1wiO1xuaW1wb3J0IGxvYWRTeW50YXggZnJvbSBcIi4vbG9hZC1zeW50YXhcIjtcbmltcG9ydCB7U2NvcGUsIGZyZXNoU2NvcGV9IGZyb20gXCIuL3Njb3BlXCI7XG5jb25zdCBKdXN0Xzg5MCA9IE1heWJlLkp1c3Q7XG5jb25zdCBOb3RoaW5nXzg5MSA9IE1heWJlLk5vdGhpbmc7XG5jb25zdCByZWdpc3RlclN5bnRheF84OTIgPSAoc3R4Xzg5NywgY29udGV4dF84OTgpID0+IHtcbiAgbGV0IG5ld0JpbmRpbmdfODk5ID0gZ2Vuc3ltKHN0eF84OTcudmFsKCkpO1xuICBjb250ZXh0Xzg5OC5lbnYuc2V0KG5ld0JpbmRpbmdfODk5LnRvU3RyaW5nKCksIG5ldyBWYXJCaW5kaW5nVHJhbnNmb3JtKHN0eF84OTcpKTtcbiAgY29udGV4dF84OTguYmluZGluZ3MuYWRkKHN0eF84OTcsIHtiaW5kaW5nOiBuZXdCaW5kaW5nXzg5OSwgcGhhc2U6IDAsIHNraXBEdXA6IHRydWV9KTtcbn07XG5sZXQgcmVnaXN0ZXJCaW5kaW5nc184OTMgPSBfLmNvbmQoW1tpc0JpbmRpbmdJZGVudGlmaWVyLCAoe25hbWV9LCBjb250ZXh0XzkwMCkgPT4ge1xuICByZWdpc3RlclN5bnRheF84OTIobmFtZSwgY29udGV4dF85MDApO1xufV0sIFtpc0JpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXIsICh7YmluZGluZ30sIGNvbnRleHRfOTAxKSA9PiB7XG4gIHJlZ2lzdGVyQmluZGluZ3NfODkzKGJpbmRpbmcsIGNvbnRleHRfOTAxKTtcbn1dLCBbaXNCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eSwgKHtiaW5kaW5nfSwgY29udGV4dF85MDIpID0+IHtcbiAgcmVnaXN0ZXJCaW5kaW5nc184OTMoYmluZGluZywgY29udGV4dF85MDIpO1xufV0sIFtpc0FycmF5QmluZGluZywgKHtlbGVtZW50cywgcmVzdEVsZW1lbnR9LCBjb250ZXh0XzkwMykgPT4ge1xuICBpZiAocmVzdEVsZW1lbnQgIT0gbnVsbCkge1xuICAgIHJlZ2lzdGVyQmluZGluZ3NfODkzKHJlc3RFbGVtZW50LCBjb250ZXh0XzkwMyk7XG4gIH1cbiAgZWxlbWVudHMuZm9yRWFjaChlbF85MDQgPT4ge1xuICAgIGlmIChlbF85MDQgIT0gbnVsbCkge1xuICAgICAgcmVnaXN0ZXJCaW5kaW5nc184OTMoZWxfOTA0LCBjb250ZXh0XzkwMyk7XG4gICAgfVxuICB9KTtcbn1dLCBbaXNPYmplY3RCaW5kaW5nLCAoe3Byb3BlcnRpZXN9LCBjb250ZXh0XzkwNSkgPT4ge31dLCBbXy5ULCBiaW5kaW5nXzkwNiA9PiBhc3NlcnQoZmFsc2UsIFwibm90IGltcGxlbWVudGVkIHlldCBmb3I6IFwiICsgYmluZGluZ185MDYudHlwZSldXSk7XG5sZXQgcmVtb3ZlU2NvcGVfODk0ID0gXy5jb25kKFtbaXNCaW5kaW5nSWRlbnRpZmllciwgKHtuYW1lfSwgc2NvcGVfOTA3KSA9PiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiBuYW1lLnJlbW92ZVNjb3BlKHNjb3BlXzkwNyl9KV0sIFtpc0FycmF5QmluZGluZywgKHtlbGVtZW50cywgcmVzdEVsZW1lbnR9LCBzY29wZV85MDgpID0+IHtcbiAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyYXlCaW5kaW5nXCIsIHtlbGVtZW50czogZWxlbWVudHMubWFwKGVsXzkwOSA9PiBlbF85MDkgPT0gbnVsbCA/IG51bGwgOiByZW1vdmVTY29wZV84OTQoZWxfOTA5LCBzY29wZV85MDgpKSwgcmVzdEVsZW1lbnQ6IHJlc3RFbGVtZW50ID09IG51bGwgPyBudWxsIDogcmVtb3ZlU2NvcGVfODk0KHJlc3RFbGVtZW50LCBzY29wZV85MDgpfSk7XG59XSwgW2lzQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllciwgKHtiaW5kaW5nLCBpbml0fSwgc2NvcGVfOTEwKSA9PiBuZXcgVGVybShcIkJpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXJcIiwge2JpbmRpbmc6IHJlbW92ZVNjb3BlXzg5NChiaW5kaW5nLCBzY29wZV85MTApLCBpbml0OiBpbml0fSldLCBbaXNCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eSwgKHtiaW5kaW5nLCBuYW1lfSwgc2NvcGVfOTExKSA9PiBuZXcgVGVybShcIkJpbmRpbmdQcm9wZXJ0eVByb3BlcnR5XCIsIHtiaW5kaW5nOiByZW1vdmVTY29wZV84OTQoYmluZGluZywgc2NvcGVfOTExKSwgbmFtZTogbmFtZX0pXSwgW2lzT2JqZWN0QmluZGluZywgKHtwcm9wZXJ0aWVzfSwgc2NvcGVfOTEyKSA9PiBuZXcgVGVybShcIk9iamVjdEJpbmRpbmdcIiwge3Byb3BlcnRpZXM6IHByb3BlcnRpZXMubWFwKHByb3BfOTEzID0+IHJlbW92ZVNjb3BlXzg5NChwcm9wXzkxMywgc2NvcGVfOTEyKSl9KV0sIFtfLlQsIGJpbmRpbmdfOTE0ID0+IGFzc2VydChmYWxzZSwgXCJub3QgaW1wbGVtZW50ZWQgeWV0IGZvcjogXCIgKyBiaW5kaW5nXzkxNC50eXBlKV1dKTtcbmZ1bmN0aW9uIGZpbmROYW1lSW5FeHBvcnRzXzg5NShuYW1lXzkxNSwgZXhwXzkxNikge1xuICBsZXQgZm91bmROYW1lc185MTcgPSBleHBfOTE2LnJlZHVjZSgoYWNjXzkxOCwgZV85MTkpID0+IHtcbiAgICBpZiAoZV85MTkuZGVjbGFyYXRpb24pIHtcbiAgICAgIHJldHVybiBhY2NfOTE4LmNvbmNhdChlXzkxOS5kZWNsYXJhdGlvbi5kZWNsYXJhdG9ycy5yZWR1Y2UoKGFjY185MjAsIGRlY2xfOTIxKSA9PiB7XG4gICAgICAgIGlmIChkZWNsXzkyMS5iaW5kaW5nLm5hbWUudmFsKCkgPT09IG5hbWVfOTE1LnZhbCgpKSB7XG4gICAgICAgICAgcmV0dXJuIGFjY185MjAuY29uY2F0KGRlY2xfOTIxLmJpbmRpbmcubmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFjY185MjA7XG4gICAgICB9LCBMaXN0KCkpKTtcbiAgICB9XG4gICAgcmV0dXJuIGFjY185MTg7XG4gIH0sIExpc3QoKSk7XG4gIGFzc2VydChmb3VuZE5hbWVzXzkxNy5zaXplIDw9IDEsIFwiZXhwZWN0aW5nIG5vIG1vcmUgdGhhbiAxIG1hdGNoaW5nIG5hbWUgaW4gZXhwb3J0c1wiKTtcbiAgcmV0dXJuIGZvdW5kTmFtZXNfOTE3LmdldCgwKTtcbn1cbmZ1bmN0aW9uIGJpbmRJbXBvcnRzXzg5NihpbXBUZXJtXzkyMiwgZXhNb2R1bGVfOTIzLCBjb250ZXh0XzkyNCkge1xuICBsZXQgbmFtZXNfOTI1ID0gW107XG4gIGltcFRlcm1fOTIyLm5hbWVkSW1wb3J0cy5mb3JFYWNoKHNwZWNpZmllcl85MjYgPT4ge1xuICAgIGxldCBuYW1lXzkyNyA9IHNwZWNpZmllcl85MjYuYmluZGluZy5uYW1lO1xuICAgIGxldCBleHBvcnROYW1lXzkyOCA9IGZpbmROYW1lSW5FeHBvcnRzXzg5NShuYW1lXzkyNywgZXhNb2R1bGVfOTIzLmV4cG9ydEVudHJpZXMpO1xuICAgIGlmIChleHBvcnROYW1lXzkyOCAhPSBudWxsKSB7XG4gICAgICBsZXQgbmV3QmluZGluZyA9IGdlbnN5bShuYW1lXzkyNy52YWwoKSk7XG4gICAgICBjb250ZXh0XzkyNC5iaW5kaW5ncy5hZGRGb3J3YXJkKG5hbWVfOTI3LCBleHBvcnROYW1lXzkyOCwgbmV3QmluZGluZyk7XG4gICAgICBpZiAoY29udGV4dF85MjQuc3RvcmUuaGFzKGV4cG9ydE5hbWVfOTI4LnJlc29sdmUoKSkpIHtcbiAgICAgICAgbmFtZXNfOTI1LnB1c2gobmFtZV85MjcpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIHJldHVybiBMaXN0KG5hbWVzXzkyNSk7XG59XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUb2tlbkV4cGFuZGVyIHtcbiAgY29uc3RydWN0b3IoY29udGV4dF85MjkpIHtcbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0XzkyOTtcbiAgfVxuICBleHBhbmQoc3R4bF85MzApIHtcbiAgICBsZXQgcmVzdWx0XzkzMSA9IExpc3QoKTtcbiAgICBpZiAoc3R4bF85MzAuc2l6ZSA9PT0gMCkge1xuICAgICAgcmV0dXJuIHJlc3VsdF85MzE7XG4gICAgfVxuICAgIGxldCBwcmV2XzkzMiA9IExpc3QoKTtcbiAgICBsZXQgZW5mXzkzMyA9IG5ldyBFbmZvcmVzdGVyKHN0eGxfOTMwLCBwcmV2XzkzMiwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgc2VsZl85MzQgPSB0aGlzO1xuICAgIHdoaWxlICghZW5mXzkzMy5kb25lKSB7XG4gICAgICBsZXQgdGVybSA9IF8ucGlwZShfLmJpbmQoZW5mXzkzMy5lbmZvcmVzdCwgZW5mXzkzMyksIF8uY29uZChbW2lzVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudCwgdGVybV85MzUgPT4ge1xuICAgICAgICB0ZXJtXzkzNS5kZWNsYXJhdGlvbi5kZWNsYXJhdG9ycyA9IHRlcm1fOTM1LmRlY2xhcmF0aW9uLmRlY2xhcmF0b3JzLm1hcChkZWNsXzkzNiA9PiB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiVmFyaWFibGVEZWNsYXJhdG9yXCIsIHtiaW5kaW5nOiByZW1vdmVTY29wZV84OTQoZGVjbF85MzYuYmluZGluZywgc2VsZl85MzQuY29udGV4dC51c2VTY29wZSksIGluaXQ6IGRlY2xfOTM2LmluaXR9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChpc1N5bnRheERlY2xhcmF0aW9uKHRlcm1fOTM1LmRlY2xhcmF0aW9uKSkge1xuICAgICAgICAgIGxldCBzY29wZSA9IGZyZXNoU2NvcGUoXCJub25yZWNcIik7XG4gICAgICAgICAgdGVybV85MzUuZGVjbGFyYXRpb24uZGVjbGFyYXRvcnMuZm9yRWFjaChkZWNsXzkzNyA9PiB7XG4gICAgICAgICAgICBsZXQgbmFtZV85MzggPSBkZWNsXzkzNy5iaW5kaW5nLm5hbWU7XG4gICAgICAgICAgICBsZXQgbmFtZUFkZGVkXzkzOSA9IG5hbWVfOTM4LmFkZFNjb3BlKHNjb3BlKTtcbiAgICAgICAgICAgIGxldCBuYW1lUmVtb3ZlZF85NDAgPSBuYW1lXzkzOC5yZW1vdmVTY29wZShzZWxmXzkzNC5jb250ZXh0LmN1cnJlbnRTY29wZVtzZWxmXzkzNC5jb250ZXh0LmN1cnJlbnRTY29wZS5sZW5ndGggLSAxXSk7XG4gICAgICAgICAgICBsZXQgbmV3QmluZGluZ185NDEgPSBnZW5zeW0obmFtZV85MzgudmFsKCkpO1xuICAgICAgICAgICAgc2VsZl85MzQuY29udGV4dC5iaW5kaW5ncy5hZGRGb3J3YXJkKG5hbWVBZGRlZF85MzksIG5hbWVSZW1vdmVkXzk0MCwgbmV3QmluZGluZ185NDEpO1xuICAgICAgICAgICAgZGVjbF85MzcuaW5pdCA9IGRlY2xfOTM3LmluaXQuYWRkU2NvcGUoc2NvcGUsIHNlbGZfOTM0LmNvbnRleHQuYmluZGluZ3MpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc1N5bnRheERlY2xhcmF0aW9uKHRlcm1fOTM1LmRlY2xhcmF0aW9uKSB8fCBpc1N5bnRheHJlY0RlY2xhcmF0aW9uKHRlcm1fOTM1LmRlY2xhcmF0aW9uKSkge1xuICAgICAgICAgIHRlcm1fOTM1LmRlY2xhcmF0aW9uLmRlY2xhcmF0b3JzLmZvckVhY2goZGVjbF85NDIgPT4ge1xuICAgICAgICAgICAgcmVnaXN0ZXJCaW5kaW5nc184OTMoZGVjbF85NDIuYmluZGluZywgc2VsZl85MzQuY29udGV4dCk7XG4gICAgICAgICAgICBsb2FkU3ludGF4KGRlY2xfOTQyLCBzZWxmXzkzNC5jb250ZXh0LCBzZWxmXzkzNC5jb250ZXh0LmVudik7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIE5vdGhpbmdfODkxKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGVybV85MzUuZGVjbGFyYXRpb24uZGVjbGFyYXRvcnMuZm9yRWFjaChkZWNsXzk0MyA9PiByZWdpc3RlckJpbmRpbmdzXzg5MyhkZWNsXzk0My5iaW5kaW5nLCBzZWxmXzkzNC5jb250ZXh0KSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIEp1c3RfODkwKHRlcm1fOTM1KTtcbiAgICAgIH1dLCBbaXNGdW5jdGlvbldpdGhOYW1lLCB0ZXJtXzk0NCA9PiB7XG4gICAgICAgIHRlcm1fOTQ0Lm5hbWUgPSByZW1vdmVTY29wZV84OTQodGVybV85NDQubmFtZSwgc2VsZl85MzQuY29udGV4dC51c2VTY29wZSk7XG4gICAgICAgIHJlZ2lzdGVyQmluZGluZ3NfODkzKHRlcm1fOTQ0Lm5hbWUsIHNlbGZfOTM0LmNvbnRleHQpO1xuICAgICAgICByZXR1cm4gSnVzdF84OTAodGVybV85NDQpO1xuICAgICAgfV0sIFtpc0ltcG9ydCwgdGVybV85NDUgPT4ge1xuICAgICAgICBsZXQgbW9kXzk0NiA9IHNlbGZfOTM0LmNvbnRleHQubW9kdWxlcy5sb2FkKHRlcm1fOTQ1Lm1vZHVsZVNwZWNpZmllci52YWwoKSwgc2VsZl85MzQuY29udGV4dCk7XG4gICAgICAgIGlmICh0ZXJtXzk0NS5mb3JTeW50YXgpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImltcG9ydCBmb3Igc3ludGF4IGlzIG5vdCBpbXBsZW1lbnRlZCB5ZXRcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbW9kXzk0Ni52aXNpdChzZWxmXzkzNC5jb250ZXh0KTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgYm91bmROYW1lc185NDcgPSBiaW5kSW1wb3J0c184OTYodGVybV85NDUsIG1vZF85NDYsIHNlbGZfOTM0LmNvbnRleHQpO1xuICAgICAgICBpZiAoYm91bmROYW1lc185NDcuc2l6ZSA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiBKdXN0Xzg5MCh0ZXJtXzk0NSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE5vdGhpbmdfODkxKCk7XG4gICAgICB9XSwgW2lzRU9GLCBOb3RoaW5nXzg5MV0sIFtfLlQsIEp1c3RfODkwXV0pLCBNYXliZS5tYXliZShMaXN0KCksIF8uaWRlbnRpdHkpKSgpO1xuICAgICAgcmVzdWx0XzkzMSA9IHJlc3VsdF85MzEuY29uY2F0KHRlcm0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0XzkzMTtcbiAgfVxufVxuIl19