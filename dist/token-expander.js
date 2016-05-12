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

var Just_879 = _ramdaFantasy.Maybe.Just;
var Nothing_880 = _ramdaFantasy.Maybe.Nothing;
var registerSyntax_881 = function registerSyntax_881(stx_886, context_887) {
  var newBinding_888 = (0, _symbol.gensym)(stx_886.val());
  context_887.env.set(newBinding_888.toString(), new _transforms.VarBindingTransform(stx_886));
  context_887.bindings.add(stx_886, { binding: newBinding_888, phase: 0, skipDup: true });
};
var registerBindings_882 = _.cond([[_terms.isBindingIdentifier, function (_ref, context_889) {
  var name = _ref.name;

  registerSyntax_881(name, context_889);
}], [_terms.isBindingPropertyIdentifier, function (_ref2, context_890) {
  var binding = _ref2.binding;

  registerBindings_882(binding, context_890);
}], [_terms.isBindingPropertyProperty, function (_ref3, context_891) {
  var binding = _ref3.binding;

  registerBindings_882(binding, context_891);
}], [_terms.isArrayBinding, function (_ref4, context_892) {
  var elements = _ref4.elements;
  var restElement = _ref4.restElement;

  if (restElement != null) {
    registerBindings_882(restElement, context_892);
  }
  elements.forEach(function (el_893) {
    if (el_893 != null) {
      registerBindings_882(el_893, context_892);
    }
  });
}], [_terms.isObjectBinding, function (_ref5, context_894) {
  var properties = _ref5.properties;
}], [_.T, function (binding_895) {
  return (0, _errors.assert)(false, "not implemented yet for: " + binding_895.type);
}]]);
var removeScope_883 = _.cond([[_terms.isBindingIdentifier, function (_ref6, scope_896) {
  var name = _ref6.name;
  return new _terms2.default("BindingIdentifier", { name: name.removeScope(scope_896) });
}], [_terms.isArrayBinding, function (_ref7, scope_897) {
  var elements = _ref7.elements;
  var restElement = _ref7.restElement;

  return new _terms2.default("ArrayBinding", { elements: elements.map(function (el_898) {
      return el_898 == null ? null : removeScope_883(el_898, scope_897);
    }), restElement: restElement == null ? null : removeScope_883(restElement, scope_897) });
}], [_terms.isBindingPropertyIdentifier, function (_ref8, scope_899) {
  var binding = _ref8.binding;
  var init = _ref8.init;
  return new _terms2.default("BindingPropertyIdentifier", { binding: removeScope_883(binding, scope_899), init: init });
}], [_terms.isBindingPropertyProperty, function (_ref9, scope_900) {
  var binding = _ref9.binding;
  var name = _ref9.name;
  return new _terms2.default("BindingPropertyProperty", { binding: removeScope_883(binding, scope_900), name: name });
}], [_terms.isObjectBinding, function (_ref10, scope_901) {
  var properties = _ref10.properties;
  return new _terms2.default("ObjectBinding", { properties: properties.map(function (prop_902) {
      return removeScope_883(prop_902, scope_901);
    }) });
}], [_.T, function (binding_903) {
  return (0, _errors.assert)(false, "not implemented yet for: " + binding_903.type);
}]]);
function findNameInExports_884(name_904, exp_905) {
  var foundNames_906 = exp_905.reduce(function (acc_907, e_908) {
    if (e_908.declaration) {
      return acc_907.concat(e_908.declaration.declarators.reduce(function (acc_909, decl_910) {
        if (decl_910.binding.name.val() === name_904.val()) {
          return acc_909.concat(decl_910.binding.name);
        }
        return acc_909;
      }, (0, _immutable.List)()));
    }
    return acc_907;
  }, (0, _immutable.List)());
  (0, _errors.assert)(foundNames_906.size <= 1, "expecting no more than 1 matching name in exports");
  return foundNames_906.get(0);
}
function bindImports_885(impTerm_911, exModule_912, context_913) {
  var names_914 = [];
  impTerm_911.namedImports.forEach(function (specifier_915) {
    var name_916 = specifier_915.binding.name;
    var exportName_917 = findNameInExports_884(name_916, exModule_912.exportEntries);
    if (exportName_917 != null) {
      var newBinding = (0, _symbol.gensym)(name_916.val());
      context_913.bindings.addForward(name_916, exportName_917, newBinding);
      if (context_913.store.has(exportName_917.resolve())) {
        names_914.push(name_916);
      }
    }
  });
  return (0, _immutable.List)(names_914);
}

var TokenExpander = function () {
  function TokenExpander(context_918) {
    _classCallCheck(this, TokenExpander);

    this.context = context_918;
  }

  _createClass(TokenExpander, [{
    key: "expand",
    value: function expand(stxl_919) {
      var result_920 = (0, _immutable.List)();
      if (stxl_919.size === 0) {
        return result_920;
      }
      var prev_921 = (0, _immutable.List)();
      var enf_922 = new _enforester.Enforester(stxl_919, prev_921, this.context);
      var self_923 = this;
      while (!enf_922.done) {
        var term = _.pipe(_.bind(enf_922.enforest, enf_922), _.cond([[_terms.isVariableDeclarationStatement, function (term_924) {
          term_924.declaration.declarators = term_924.declaration.declarators.map(function (decl_925) {
            return new _terms2.default("VariableDeclarator", { binding: removeScope_883(decl_925.binding, self_923.context.useScope), init: decl_925.init });
          });
          if ((0, _terms.isSyntaxDeclaration)(term_924.declaration)) {
            (function () {
              var scope = (0, _scope.freshScope)("nonrec");
              term_924.declaration.declarators.forEach(function (decl_926) {
                var name_927 = decl_926.binding.name;
                var nameAdded_928 = name_927.addScope(scope);
                var nameRemoved_929 = name_927.removeScope(self_923.context.currentScope[self_923.context.currentScope.length - 1]);
                var newBinding_930 = (0, _symbol.gensym)(name_927.val());
                self_923.context.bindings.addForward(nameAdded_928, nameRemoved_929, newBinding_930);
                decl_926.init = decl_926.init.addScope(scope, self_923.context.bindings);
              });
            })();
          }
          if ((0, _terms.isSyntaxDeclaration)(term_924.declaration) || (0, _terms.isSyntaxrecDeclaration)(term_924.declaration)) {
            term_924.declaration.declarators.forEach(function (decl_931) {
              registerBindings_882(decl_931.binding, self_923.context);
              (0, _loadSyntax2.default)(decl_931, self_923.context, self_923.context.env);
            });
            return Nothing_880();
          } else {
            term_924.declaration.declarators.forEach(function (decl_932) {
              return registerBindings_882(decl_932.binding, self_923.context);
            });
          }
          return Just_879(term_924);
        }], [_terms.isFunctionWithName, function (term_933) {
          term_933.name = removeScope_883(term_933.name, self_923.context.useScope);
          registerBindings_882(term_933.name, self_923.context);
          return Just_879(term_933);
        }], [_terms.isImport, function (term_934) {
          var mod_935 = self_923.context.modules.load(term_934.moduleSpecifier.val(), self_923.context);
          if (term_934.forSyntax) {
            console.log("import for syntax is not implemented yet");
          } else {
            mod_935.visit(self_923.context);
          }
          var boundNames_936 = bindImports_885(term_934, mod_935, self_923.context);
          if (boundNames_936.size === 0) {
            return Just_879(term_934);
          }
          return Nothing_880();
        }], [_terms.isEOF, Nothing_880], [_.T, Just_879]]), _ramdaFantasy.Maybe.maybe((0, _immutable.List)(), _.identity))();
        result_920 = result_920.concat(term);
      }
      return result_920;
    }
  }]);

  return TokenExpander;
}();

exports.default = TokenExpander;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3Rva2VuLWV4cGFuZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7SUFBYSxDOztBQUNiOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7QUFDQSxJQUFNLFdBQVcsb0JBQU0sSUFBdkI7QUFDQSxJQUFNLGNBQWMsb0JBQU0sT0FBMUI7QUFDQSxJQUFNLHFCQUFxQixTQUFyQixrQkFBcUIsQ0FBQyxPQUFELEVBQVUsV0FBVixFQUEwQjtBQUNuRCxNQUFJLGlCQUFpQixvQkFBTyxRQUFRLEdBQVIsRUFBUCxDQUFyQjtBQUNBLGNBQVksR0FBWixDQUFnQixHQUFoQixDQUFvQixlQUFlLFFBQWYsRUFBcEIsRUFBK0Msb0NBQXdCLE9BQXhCLENBQS9DO0FBQ0EsY0FBWSxRQUFaLENBQXFCLEdBQXJCLENBQXlCLE9BQXpCLEVBQWtDLEVBQUMsU0FBUyxjQUFWLEVBQTBCLE9BQU8sQ0FBakMsRUFBb0MsU0FBUyxJQUE3QyxFQUFsQztBQUNELENBSkQ7QUFLQSxJQUFJLHVCQUF1QixFQUFFLElBQUYsQ0FBTyxDQUFDLDZCQUFzQixnQkFBUyxXQUFULEVBQXlCO0FBQUEsTUFBdkIsSUFBdUIsUUFBdkIsSUFBdUI7O0FBQ2hGLHFCQUFtQixJQUFuQixFQUF5QixXQUF6QjtBQUNELENBRmtDLENBQUQsRUFFOUIscUNBQThCLGlCQUFZLFdBQVosRUFBNEI7QUFBQSxNQUExQixPQUEwQixTQUExQixPQUEwQjs7QUFDNUQsdUJBQXFCLE9BQXJCLEVBQThCLFdBQTlCO0FBQ0QsQ0FGRyxDQUY4QixFQUk5QixtQ0FBNEIsaUJBQVksV0FBWixFQUE0QjtBQUFBLE1BQTFCLE9BQTBCLFNBQTFCLE9BQTBCOztBQUMxRCx1QkFBcUIsT0FBckIsRUFBOEIsV0FBOUI7QUFDRCxDQUZHLENBSjhCLEVBTTlCLHdCQUFpQixp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QUE4QixTQUFTLGVBQVQsQ0FBeUIsR0FBekIsRUFBOUIsRUFBOEQsU0FBUyxPQUF2RSxDQUFkO0FBQ0EsY0FBSSxTQUFTLFNBQWIsRUFBd0I7QUFDdEIsb0JBQVEsR0FBUixDQUFZLDBDQUFaO0FBQ0QsV0FGRCxNQUVPO0FBQ0wsb0JBQVEsS0FBUixDQUFjLFNBQVMsT0FBdkI7QUFDRDtBQUNELGNBQUksaUJBQWlCLGdCQUFnQixRQUFoQixFQUEwQixPQUExQixFQUFtQyxTQUFTLE9BQTVDLENBQXJCO0FBQ0EsY0FBSSxlQUFlLElBQWYsS0FBd0IsQ0FBNUIsRUFBK0I7QUFDN0IsbUJBQU8sU0FBUyxRQUFULENBQVA7QUFDRDtBQUNELGlCQUFPLGFBQVA7QUFDRCxTQVpHLENBN0J3RCxFQXlDeEQsZUFBUSxXQUFSLENBekN3RCxFQXlDbEMsQ0FBQyxFQUFFLENBQUgsRUFBTSxRQUFOLENBekNrQyxDQUFQLENBQTFDLEVBeUNrQyxvQkFBTSxLQUFOLENBQVksc0JBQVosRUFBb0IsRUFBRSxRQUF0QixDQXpDbEMsR0FBWDtBQTBDQSxxQkFBYSxXQUFXLE1BQVgsQ0FBa0IsSUFBbEIsQ0FBYjtBQUNEO0FBQ0QsYUFBTyxVQUFQO0FBQ0Q7Ozs7OztrQkExRGtCLGEiLCJmaWxlIjoidG9rZW4tZXhwYW5kZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0xpc3R9IGZyb20gXCJpbW11dGFibGVcIjtcbmltcG9ydCB7ZW5mb3Jlc3RFeHByLCBFbmZvcmVzdGVyfSBmcm9tIFwiLi9lbmZvcmVzdGVyXCI7XG5pbXBvcnQgVGVybUV4cGFuZGVyIGZyb20gXCIuL3Rlcm0tZXhwYW5kZXIuanNcIjtcbmltcG9ydCBCaW5kaW5nTWFwIGZyb20gXCIuL2JpbmRpbmctbWFwLmpzXCI7XG5pbXBvcnQgRW52IGZyb20gXCIuL2VudlwiO1xuaW1wb3J0IFJlYWRlciBmcm9tIFwiLi9zaGlmdC1yZWFkZXJcIjtcbmltcG9ydCAgKiBhcyBfIGZyb20gXCJyYW1kYVwiO1xuaW1wb3J0IFRlcm0sIHtpc0VPRiwgaXNCaW5kaW5nSWRlbnRpZmllciwgaXNCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eSwgaXNCaW5kaW5nUHJvcGVydHlJZGVudGlmaWVyLCBpc09iamVjdEJpbmRpbmcsIGlzQXJyYXlCaW5kaW5nLCBpc0Z1bmN0aW9uRGVjbGFyYXRpb24sIGlzRnVuY3Rpb25FeHByZXNzaW9uLCBpc0Z1bmN0aW9uVGVybSwgaXNGdW5jdGlvbldpdGhOYW1lLCBpc1N5bnRheERlY2xhcmF0aW9uLCBpc1N5bnRheHJlY0RlY2xhcmF0aW9uLCBpc1ZhcmlhYmxlRGVjbGFyYXRpb24sIGlzVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudCwgaXNJbXBvcnQsIGlzRXhwb3J0fSBmcm9tIFwiLi90ZXJtc1wiO1xuaW1wb3J0IHtNYXliZX0gZnJvbSBcInJhbWRhLWZhbnRhc3lcIjtcbmltcG9ydCB7Z2Vuc3ltfSBmcm9tIFwiLi9zeW1ib2xcIjtcbmltcG9ydCB7VmFyQmluZGluZ1RyYW5zZm9ybSwgQ29tcGlsZXRpbWVUcmFuc2Zvcm19IGZyb20gXCIuL3RyYW5zZm9ybXNcIjtcbmltcG9ydCB7ZXhwZWN0LCBhc3NlcnR9IGZyb20gXCIuL2Vycm9yc1wiO1xuaW1wb3J0IGxvYWRTeW50YXggZnJvbSBcIi4vbG9hZC1zeW50YXhcIjtcbmltcG9ydCB7U2NvcGUsIGZyZXNoU2NvcGV9IGZyb20gXCIuL3Njb3BlXCI7XG5jb25zdCBKdXN0Xzg3OSA9IE1heWJlLkp1c3Q7XG5jb25zdCBOb3RoaW5nXzg4MCA9IE1heWJlLk5vdGhpbmc7XG5jb25zdCByZWdpc3RlclN5bnRheF84ODEgPSAoc3R4Xzg4NiwgY29udGV4dF84ODcpID0+IHtcbiAgbGV0IG5ld0JpbmRpbmdfODg4ID0gZ2Vuc3ltKHN0eF84ODYudmFsKCkpO1xuICBjb250ZXh0Xzg4Ny5lbnYuc2V0KG5ld0JpbmRpbmdfODg4LnRvU3RyaW5nKCksIG5ldyBWYXJCaW5kaW5nVHJhbnNmb3JtKHN0eF84ODYpKTtcbiAgY29udGV4dF84ODcuYmluZGluZ3MuYWRkKHN0eF84ODYsIHtiaW5kaW5nOiBuZXdCaW5kaW5nXzg4OCwgcGhhc2U6IDAsIHNraXBEdXA6IHRydWV9KTtcbn07XG5sZXQgcmVnaXN0ZXJCaW5kaW5nc184ODIgPSBfLmNvbmQoW1tpc0JpbmRpbmdJZGVudGlmaWVyLCAoe25hbWV9LCBjb250ZXh0Xzg4OSkgPT4ge1xuICByZWdpc3RlclN5bnRheF84ODEobmFtZSwgY29udGV4dF84ODkpO1xufV0sIFtpc0JpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXIsICh7YmluZGluZ30sIGNvbnRleHRfODkwKSA9PiB7XG4gIHJlZ2lzdGVyQmluZGluZ3NfODgyKGJpbmRpbmcsIGNvbnRleHRfODkwKTtcbn1dLCBbaXNCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eSwgKHtiaW5kaW5nfSwgY29udGV4dF84OTEpID0+IHtcbiAgcmVnaXN0ZXJCaW5kaW5nc184ODIoYmluZGluZywgY29udGV4dF84OTEpO1xufV0sIFtpc0FycmF5QmluZGluZywgKHtlbGVtZW50cywgcmVzdEVsZW1lbnR9LCBjb250ZXh0Xzg5MikgPT4ge1xuICBpZiAocmVzdEVsZW1lbnQgIT0gbnVsbCkge1xuICAgIHJlZ2lzdGVyQmluZGluZ3NfODgyKHJlc3RFbGVtZW50LCBjb250ZXh0Xzg5Mik7XG4gIH1cbiAgZWxlbWVudHMuZm9yRWFjaChlbF84OTMgPT4ge1xuICAgIGlmIChlbF84OTMgIT0gbnVsbCkge1xuICAgICAgcmVnaXN0ZXJCaW5kaW5nc184ODIoZWxfODkzLCBjb250ZXh0Xzg5Mik7XG4gICAgfVxuICB9KTtcbn1dLCBbaXNPYmplY3RCaW5kaW5nLCAoe3Byb3BlcnRpZXN9LCBjb250ZXh0Xzg5NCkgPT4ge31dLCBbXy5ULCBiaW5kaW5nXzg5NSA9PiBhc3NlcnQoZmFsc2UsIFwibm90IGltcGxlbWVudGVkIHlldCBmb3I6IFwiICsgYmluZGluZ184OTUudHlwZSldXSk7XG5sZXQgcmVtb3ZlU2NvcGVfODgzID0gXy5jb25kKFtbaXNCaW5kaW5nSWRlbnRpZmllciwgKHtuYW1lfSwgc2NvcGVfODk2KSA9PiBuZXcgVGVybShcIkJpbmRpbmdJZGVudGlmaWVyXCIsIHtuYW1lOiBuYW1lLnJlbW92ZVNjb3BlKHNjb3BlXzg5Nil9KV0sIFtpc0FycmF5QmluZGluZywgKHtlbGVtZW50cywgcmVzdEVsZW1lbnR9LCBzY29wZV84OTcpID0+IHtcbiAgcmV0dXJuIG5ldyBUZXJtKFwiQXJyYXlCaW5kaW5nXCIsIHtlbGVtZW50czogZWxlbWVudHMubWFwKGVsXzg5OCA9PiBlbF84OTggPT0gbnVsbCA/IG51bGwgOiByZW1vdmVTY29wZV84ODMoZWxfODk4LCBzY29wZV84OTcpKSwgcmVzdEVsZW1lbnQ6IHJlc3RFbGVtZW50ID09IG51bGwgPyBudWxsIDogcmVtb3ZlU2NvcGVfODgzKHJlc3RFbGVtZW50LCBzY29wZV84OTcpfSk7XG59XSwgW2lzQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllciwgKHtiaW5kaW5nLCBpbml0fSwgc2NvcGVfODk5KSA9PiBuZXcgVGVybShcIkJpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXJcIiwge2JpbmRpbmc6IHJlbW92ZVNjb3BlXzg4MyhiaW5kaW5nLCBzY29wZV84OTkpLCBpbml0OiBpbml0fSldLCBbaXNCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eSwgKHtiaW5kaW5nLCBuYW1lfSwgc2NvcGVfOTAwKSA9PiBuZXcgVGVybShcIkJpbmRpbmdQcm9wZXJ0eVByb3BlcnR5XCIsIHtiaW5kaW5nOiByZW1vdmVTY29wZV84ODMoYmluZGluZywgc2NvcGVfOTAwKSwgbmFtZTogbmFtZX0pXSwgW2lzT2JqZWN0QmluZGluZywgKHtwcm9wZXJ0aWVzfSwgc2NvcGVfOTAxKSA9PiBuZXcgVGVybShcIk9iamVjdEJpbmRpbmdcIiwge3Byb3BlcnRpZXM6IHByb3BlcnRpZXMubWFwKHByb3BfOTAyID0+IHJlbW92ZVNjb3BlXzg4Myhwcm9wXzkwMiwgc2NvcGVfOTAxKSl9KV0sIFtfLlQsIGJpbmRpbmdfOTAzID0+IGFzc2VydChmYWxzZSwgXCJub3QgaW1wbGVtZW50ZWQgeWV0IGZvcjogXCIgKyBiaW5kaW5nXzkwMy50eXBlKV1dKTtcbmZ1bmN0aW9uIGZpbmROYW1lSW5FeHBvcnRzXzg4NChuYW1lXzkwNCwgZXhwXzkwNSkge1xuICBsZXQgZm91bmROYW1lc185MDYgPSBleHBfOTA1LnJlZHVjZSgoYWNjXzkwNywgZV85MDgpID0+IHtcbiAgICBpZiAoZV85MDguZGVjbGFyYXRpb24pIHtcbiAgICAgIHJldHVybiBhY2NfOTA3LmNvbmNhdChlXzkwOC5kZWNsYXJhdGlvbi5kZWNsYXJhdG9ycy5yZWR1Y2UoKGFjY185MDksIGRlY2xfOTEwKSA9PiB7XG4gICAgICAgIGlmIChkZWNsXzkxMC5iaW5kaW5nLm5hbWUudmFsKCkgPT09IG5hbWVfOTA0LnZhbCgpKSB7XG4gICAgICAgICAgcmV0dXJuIGFjY185MDkuY29uY2F0KGRlY2xfOTEwLmJpbmRpbmcubmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFjY185MDk7XG4gICAgICB9LCBMaXN0KCkpKTtcbiAgICB9XG4gICAgcmV0dXJuIGFjY185MDc7XG4gIH0sIExpc3QoKSk7XG4gIGFzc2VydChmb3VuZE5hbWVzXzkwNi5zaXplIDw9IDEsIFwiZXhwZWN0aW5nIG5vIG1vcmUgdGhhbiAxIG1hdGNoaW5nIG5hbWUgaW4gZXhwb3J0c1wiKTtcbiAgcmV0dXJuIGZvdW5kTmFtZXNfOTA2LmdldCgwKTtcbn1cbmZ1bmN0aW9uIGJpbmRJbXBvcnRzXzg4NShpbXBUZXJtXzkxMSwgZXhNb2R1bGVfOTEyLCBjb250ZXh0XzkxMykge1xuICBsZXQgbmFtZXNfOTE0ID0gW107XG4gIGltcFRlcm1fOTExLm5hbWVkSW1wb3J0cy5mb3JFYWNoKHNwZWNpZmllcl85MTUgPT4ge1xuICAgIGxldCBuYW1lXzkxNiA9IHNwZWNpZmllcl85MTUuYmluZGluZy5uYW1lO1xuICAgIGxldCBleHBvcnROYW1lXzkxNyA9IGZpbmROYW1lSW5FeHBvcnRzXzg4NChuYW1lXzkxNiwgZXhNb2R1bGVfOTEyLmV4cG9ydEVudHJpZXMpO1xuICAgIGlmIChleHBvcnROYW1lXzkxNyAhPSBudWxsKSB7XG4gICAgICBsZXQgbmV3QmluZGluZyA9IGdlbnN5bShuYW1lXzkxNi52YWwoKSk7XG4gICAgICBjb250ZXh0XzkxMy5iaW5kaW5ncy5hZGRGb3J3YXJkKG5hbWVfOTE2LCBleHBvcnROYW1lXzkxNywgbmV3QmluZGluZyk7XG4gICAgICBpZiAoY29udGV4dF85MTMuc3RvcmUuaGFzKGV4cG9ydE5hbWVfOTE3LnJlc29sdmUoKSkpIHtcbiAgICAgICAgbmFtZXNfOTE0LnB1c2gobmFtZV85MTYpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIHJldHVybiBMaXN0KG5hbWVzXzkxNCk7XG59XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUb2tlbkV4cGFuZGVyIHtcbiAgY29uc3RydWN0b3IoY29udGV4dF85MTgpIHtcbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0XzkxODtcbiAgfVxuICBleHBhbmQoc3R4bF85MTkpIHtcbiAgICBsZXQgcmVzdWx0XzkyMCA9IExpc3QoKTtcbiAgICBpZiAoc3R4bF85MTkuc2l6ZSA9PT0gMCkge1xuICAgICAgcmV0dXJuIHJlc3VsdF85MjA7XG4gICAgfVxuICAgIGxldCBwcmV2XzkyMSA9IExpc3QoKTtcbiAgICBsZXQgZW5mXzkyMiA9IG5ldyBFbmZvcmVzdGVyKHN0eGxfOTE5LCBwcmV2XzkyMSwgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgc2VsZl85MjMgPSB0aGlzO1xuICAgIHdoaWxlICghZW5mXzkyMi5kb25lKSB7XG4gICAgICBsZXQgdGVybSA9IF8ucGlwZShfLmJpbmQoZW5mXzkyMi5lbmZvcmVzdCwgZW5mXzkyMiksIF8uY29uZChbW2lzVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudCwgdGVybV85MjQgPT4ge1xuICAgICAgICB0ZXJtXzkyNC5kZWNsYXJhdGlvbi5kZWNsYXJhdG9ycyA9IHRlcm1fOTI0LmRlY2xhcmF0aW9uLmRlY2xhcmF0b3JzLm1hcChkZWNsXzkyNSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBUZXJtKFwiVmFyaWFibGVEZWNsYXJhdG9yXCIsIHtiaW5kaW5nOiByZW1vdmVTY29wZV84ODMoZGVjbF85MjUuYmluZGluZywgc2VsZl85MjMuY29udGV4dC51c2VTY29wZSksIGluaXQ6IGRlY2xfOTI1LmluaXR9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChpc1N5bnRheERlY2xhcmF0aW9uKHRlcm1fOTI0LmRlY2xhcmF0aW9uKSkge1xuICAgICAgICAgIGxldCBzY29wZSA9IGZyZXNoU2NvcGUoXCJub25yZWNcIik7XG4gICAgICAgICAgdGVybV85MjQuZGVjbGFyYXRpb24uZGVjbGFyYXRvcnMuZm9yRWFjaChkZWNsXzkyNiA9PiB7XG4gICAgICAgICAgICBsZXQgbmFtZV85MjcgPSBkZWNsXzkyNi5iaW5kaW5nLm5hbWU7XG4gICAgICAgICAgICBsZXQgbmFtZUFkZGVkXzkyOCA9IG5hbWVfOTI3LmFkZFNjb3BlKHNjb3BlKTtcbiAgICAgICAgICAgIGxldCBuYW1lUmVtb3ZlZF85MjkgPSBuYW1lXzkyNy5yZW1vdmVTY29wZShzZWxmXzkyMy5jb250ZXh0LmN1cnJlbnRTY29wZVtzZWxmXzkyMy5jb250ZXh0LmN1cnJlbnRTY29wZS5sZW5ndGggLSAxXSk7XG4gICAgICAgICAgICBsZXQgbmV3QmluZGluZ185MzAgPSBnZW5zeW0obmFtZV85MjcudmFsKCkpO1xuICAgICAgICAgICAgc2VsZl85MjMuY29udGV4dC5iaW5kaW5ncy5hZGRGb3J3YXJkKG5hbWVBZGRlZF85MjgsIG5hbWVSZW1vdmVkXzkyOSwgbmV3QmluZGluZ185MzApO1xuICAgICAgICAgICAgZGVjbF85MjYuaW5pdCA9IGRlY2xfOTI2LmluaXQuYWRkU2NvcGUoc2NvcGUsIHNlbGZfOTIzLmNvbnRleHQuYmluZGluZ3MpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc1N5bnRheERlY2xhcmF0aW9uKHRlcm1fOTI0LmRlY2xhcmF0aW9uKSB8fCBpc1N5bnRheHJlY0RlY2xhcmF0aW9uKHRlcm1fOTI0LmRlY2xhcmF0aW9uKSkge1xuICAgICAgICAgIHRlcm1fOTI0LmRlY2xhcmF0aW9uLmRlY2xhcmF0b3JzLmZvckVhY2goZGVjbF85MzEgPT4ge1xuICAgICAgICAgICAgcmVnaXN0ZXJCaW5kaW5nc184ODIoZGVjbF85MzEuYmluZGluZywgc2VsZl85MjMuY29udGV4dCk7XG4gICAgICAgICAgICBsb2FkU3ludGF4KGRlY2xfOTMxLCBzZWxmXzkyMy5jb250ZXh0LCBzZWxmXzkyMy5jb250ZXh0LmVudik7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIE5vdGhpbmdfODgwKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGVybV85MjQuZGVjbGFyYXRpb24uZGVjbGFyYXRvcnMuZm9yRWFjaChkZWNsXzkzMiA9PiByZWdpc3RlckJpbmRpbmdzXzg4MihkZWNsXzkzMi5iaW5kaW5nLCBzZWxmXzkyMy5jb250ZXh0KSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIEp1c3RfODc5KHRlcm1fOTI0KTtcbiAgICAgIH1dLCBbaXNGdW5jdGlvbldpdGhOYW1lLCB0ZXJtXzkzMyA9PiB7XG4gICAgICAgIHRlcm1fOTMzLm5hbWUgPSByZW1vdmVTY29wZV84ODModGVybV85MzMubmFtZSwgc2VsZl85MjMuY29udGV4dC51c2VTY29wZSk7XG4gICAgICAgIHJlZ2lzdGVyQmluZGluZ3NfODgyKHRlcm1fOTMzLm5hbWUsIHNlbGZfOTIzLmNvbnRleHQpO1xuICAgICAgICByZXR1cm4gSnVzdF84NzkodGVybV85MzMpO1xuICAgICAgfV0sIFtpc0ltcG9ydCwgdGVybV85MzQgPT4ge1xuICAgICAgICBsZXQgbW9kXzkzNSA9IHNlbGZfOTIzLmNvbnRleHQubW9kdWxlcy5sb2FkKHRlcm1fOTM0Lm1vZHVsZVNwZWNpZmllci52YWwoKSwgc2VsZl85MjMuY29udGV4dCk7XG4gICAgICAgIGlmICh0ZXJtXzkzNC5mb3JTeW50YXgpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImltcG9ydCBmb3Igc3ludGF4IGlzIG5vdCBpbXBsZW1lbnRlZCB5ZXRcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbW9kXzkzNS52aXNpdChzZWxmXzkyMy5jb250ZXh0KTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgYm91bmROYW1lc185MzYgPSBiaW5kSW1wb3J0c184ODUodGVybV85MzQsIG1vZF85MzUsIHNlbGZfOTIzLmNvbnRleHQpO1xuICAgICAgICBpZiAoYm91bmROYW1lc185MzYuc2l6ZSA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiBKdXN0Xzg3OSh0ZXJtXzkzNCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE5vdGhpbmdfODgwKCk7XG4gICAgICB9XSwgW2lzRU9GLCBOb3RoaW5nXzg4MF0sIFtfLlQsIEp1c3RfODc5XV0pLCBNYXliZS5tYXliZShMaXN0KCksIF8uaWRlbnRpdHkpKSgpO1xuICAgICAgcmVzdWx0XzkyMCA9IHJlc3VsdF85MjAuY29uY2F0KHRlcm0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0XzkyMDtcbiAgfVxufVxuIl19