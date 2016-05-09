"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

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

var TokenExpander = (function () {
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
})();

exports.default = TokenExpander;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3Rva2VuLWV4cGFuZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQU1hLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBUWQsSUFBTSxRQUFRLEdBQUcsb0JBQU0sSUFBSSxDQUFDO0FBQzVCLElBQU0sV0FBVyxHQUFHLG9CQUFNLE9BQU8sQ0FBQztBQUNsQyxJQUFNLGtCQUFrQixHQUFHLFNBQXJCLGtCQUFrQixDQUFJLE9BQU8sRUFBRSxXQUFXLEVBQUs7QUFDbkQsTUFBSSxjQUFjLEdBQUcsb0JBQU8sT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFDM0MsYUFBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxFQUFFLG9DQUF3QixPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQ2pGLGFBQVcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFDLE9BQU8sRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztDQUN2RixDQUFDO0FBQ0YsSUFBSSxvQkFBb0IsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsNkJBQXNCLGdCQUFTLFdBQVcsRUFBSztNQUF2QixJQUFJLFFBQUosSUFBSTs7QUFDN0Qsb0JBQWtCLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0NBQ3ZDLENBQUMsRUFBRSxxQ0FBOEIsaUJBQVksV0FBVyxFQUFLO01BQTFCLE9BQU8sU0FBUCxPQUFPOztBQUN6QyxzQkFBb0IsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7Q0FDNUMsQ0FBQyxFQUFFLG1DQUE0QixpQkFBWSxXQUFXLEVBQUs7TUFBMUIsT0FBTyxTQUFQLE9BQU87O0FBQ3ZDLHNCQUFvQixDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQztDQUM1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QyxFQUFFO0FBQzdCLG1CQUFPLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztXQUMzQjtBQUNELGlCQUFPLFdBQVcsRUFBRSxDQUFDO1NBQ3RCLENBQUMsRUFBRSxlQUFRLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsb0JBQU0sS0FBSyxDQUFDLHNCQUFNLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUNoRixrQkFBVSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDdEM7QUFDRCxhQUFPLFVBQVUsQ0FBQztLQUNuQjs7O1NBMURrQixhQUFhOzs7a0JBQWIsYUFBYSIsImZpbGUiOiJ0b2tlbi1leHBhbmRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdH0gZnJvbSBcImltbXV0YWJsZVwiO1xuaW1wb3J0IHtlbmZvcmVzdEV4cHIsIEVuZm9yZXN0ZXJ9IGZyb20gXCIuL2VuZm9yZXN0ZXJcIjtcbmltcG9ydCBUZXJtRXhwYW5kZXIgZnJvbSBcIi4vdGVybS1leHBhbmRlci5qc1wiO1xuaW1wb3J0IEJpbmRpbmdNYXAgZnJvbSBcIi4vYmluZGluZy1tYXAuanNcIjtcbmltcG9ydCBFbnYgZnJvbSBcIi4vZW52XCI7XG5pbXBvcnQgUmVhZGVyIGZyb20gXCIuL3NoaWZ0LXJlYWRlclwiO1xuaW1wb3J0ICAqIGFzIF8gZnJvbSBcInJhbWRhXCI7XG5pbXBvcnQgVGVybSwge2lzRU9GLCBpc0JpbmRpbmdJZGVudGlmaWVyLCBpc0JpbmRpbmdQcm9wZXJ0eVByb3BlcnR5LCBpc0JpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXIsIGlzT2JqZWN0QmluZGluZywgaXNBcnJheUJpbmRpbmcsIGlzRnVuY3Rpb25EZWNsYXJhdGlvbiwgaXNGdW5jdGlvbkV4cHJlc3Npb24sIGlzRnVuY3Rpb25UZXJtLCBpc0Z1bmN0aW9uV2l0aE5hbWUsIGlzU3ludGF4RGVjbGFyYXRpb24sIGlzU3ludGF4cmVjRGVjbGFyYXRpb24sIGlzVmFyaWFibGVEZWNsYXJhdGlvbiwgaXNWYXJpYWJsZURlY2xhcmF0aW9uU3RhdGVtZW50LCBpc0ltcG9ydCwgaXNFeHBvcnR9IGZyb20gXCIuL3Rlcm1zXCI7XG5pbXBvcnQge01heWJlfSBmcm9tIFwicmFtZGEtZmFudGFzeVwiO1xuaW1wb3J0IHtnZW5zeW19IGZyb20gXCIuL3N5bWJvbFwiO1xuaW1wb3J0IHtWYXJCaW5kaW5nVHJhbnNmb3JtLCBDb21waWxldGltZVRyYW5zZm9ybX0gZnJvbSBcIi4vdHJhbnNmb3Jtc1wiO1xuaW1wb3J0IHtleHBlY3QsIGFzc2VydH0gZnJvbSBcIi4vZXJyb3JzXCI7XG5pbXBvcnQgbG9hZFN5bnRheCBmcm9tIFwiLi9sb2FkLXN5bnRheFwiO1xuaW1wb3J0IHtTY29wZSwgZnJlc2hTY29wZX0gZnJvbSBcIi4vc2NvcGVcIjtcbmNvbnN0IEp1c3RfODkwID0gTWF5YmUuSnVzdDtcbmNvbnN0IE5vdGhpbmdfODkxID0gTWF5YmUuTm90aGluZztcbmNvbnN0IHJlZ2lzdGVyU3ludGF4Xzg5MiA9IChzdHhfODk3LCBjb250ZXh0Xzg5OCkgPT4ge1xuICBsZXQgbmV3QmluZGluZ184OTkgPSBnZW5zeW0oc3R4Xzg5Ny52YWwoKSk7XG4gIGNvbnRleHRfODk4LmVudi5zZXQobmV3QmluZGluZ184OTkudG9TdHJpbmcoKSwgbmV3IFZhckJpbmRpbmdUcmFuc2Zvcm0oc3R4Xzg5NykpO1xuICBjb250ZXh0Xzg5OC5iaW5kaW5ncy5hZGQoc3R4Xzg5Nywge2JpbmRpbmc6IG5ld0JpbmRpbmdfODk5LCBwaGFzZTogMCwgc2tpcER1cDogdHJ1ZX0pO1xufTtcbmxldCByZWdpc3RlckJpbmRpbmdzXzg5MyA9IF8uY29uZChbW2lzQmluZGluZ0lkZW50aWZpZXIsICh7bmFtZX0sIGNvbnRleHRfOTAwKSA9PiB7XG4gIHJlZ2lzdGVyU3ludGF4Xzg5MihuYW1lLCBjb250ZXh0XzkwMCk7XG59XSwgW2lzQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllciwgKHtiaW5kaW5nfSwgY29udGV4dF85MDEpID0+IHtcbiAgcmVnaXN0ZXJCaW5kaW5nc184OTMoYmluZGluZywgY29udGV4dF85MDEpO1xufV0sIFtpc0JpbmRpbmdQcm9wZXJ0eVByb3BlcnR5LCAoe2JpbmRpbmd9LCBjb250ZXh0XzkwMikgPT4ge1xuICByZWdpc3RlckJpbmRpbmdzXzg5MyhiaW5kaW5nLCBjb250ZXh0XzkwMik7XG59XSwgW2lzQXJyYXlCaW5kaW5nLCAoe2VsZW1lbnRzLCByZXN0RWxlbWVudH0sIGNvbnRleHRfOTAzKSA9PiB7XG4gIGlmIChyZXN0RWxlbWVudCAhPSBudWxsKSB7XG4gICAgcmVnaXN0ZXJCaW5kaW5nc184OTMocmVzdEVsZW1lbnQsIGNvbnRleHRfOTAzKTtcbiAgfVxuICBlbGVtZW50cy5mb3JFYWNoKGVsXzkwNCA9PiB7XG4gICAgaWYgKGVsXzkwNCAhPSBudWxsKSB7XG4gICAgICByZWdpc3RlckJpbmRpbmdzXzg5MyhlbF85MDQsIGNvbnRleHRfOTAzKTtcbiAgICB9XG4gIH0pO1xufV0sIFtpc09iamVjdEJpbmRpbmcsICh7cHJvcGVydGllc30sIGNvbnRleHRfOTA1KSA9PiB7fV0sIFtfLlQsIGJpbmRpbmdfOTA2ID0+IGFzc2VydChmYWxzZSwgXCJub3QgaW1wbGVtZW50ZWQgeWV0IGZvcjogXCIgKyBiaW5kaW5nXzkwNi50eXBlKV1dKTtcbmxldCByZW1vdmVTY29wZV84OTQgPSBfLmNvbmQoW1tpc0JpbmRpbmdJZGVudGlmaWVyLCAoe25hbWV9LCBzY29wZV85MDcpID0+IG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge25hbWU6IG5hbWUucmVtb3ZlU2NvcGUoc2NvcGVfOTA3KX0pXSwgW2lzQXJyYXlCaW5kaW5nLCAoe2VsZW1lbnRzLCByZXN0RWxlbWVudH0sIHNjb3BlXzkwOCkgPT4ge1xuICByZXR1cm4gbmV3IFRlcm0oXCJBcnJheUJpbmRpbmdcIiwge2VsZW1lbnRzOiBlbGVtZW50cy5tYXAoZWxfOTA5ID0+IGVsXzkwOSA9PSBudWxsID8gbnVsbCA6IHJlbW92ZVNjb3BlXzg5NChlbF85MDksIHNjb3BlXzkwOCkpLCByZXN0RWxlbWVudDogcmVzdEVsZW1lbnQgPT0gbnVsbCA/IG51bGwgOiByZW1vdmVTY29wZV84OTQocmVzdEVsZW1lbnQsIHNjb3BlXzkwOCl9KTtcbn1dLCBbaXNCaW5kaW5nUHJvcGVydHlJZGVudGlmaWVyLCAoe2JpbmRpbmcsIGluaXR9LCBzY29wZV85MTApID0+IG5ldyBUZXJtKFwiQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllclwiLCB7YmluZGluZzogcmVtb3ZlU2NvcGVfODk0KGJpbmRpbmcsIHNjb3BlXzkxMCksIGluaXQ6IGluaXR9KV0sIFtpc0JpbmRpbmdQcm9wZXJ0eVByb3BlcnR5LCAoe2JpbmRpbmcsIG5hbWV9LCBzY29wZV85MTEpID0+IG5ldyBUZXJtKFwiQmluZGluZ1Byb3BlcnR5UHJvcGVydHlcIiwge2JpbmRpbmc6IHJlbW92ZVNjb3BlXzg5NChiaW5kaW5nLCBzY29wZV85MTEpLCBuYW1lOiBuYW1lfSldLCBbaXNPYmplY3RCaW5kaW5nLCAoe3Byb3BlcnRpZXN9LCBzY29wZV85MTIpID0+IG5ldyBUZXJtKFwiT2JqZWN0QmluZGluZ1wiLCB7cHJvcGVydGllczogcHJvcGVydGllcy5tYXAocHJvcF85MTMgPT4gcmVtb3ZlU2NvcGVfODk0KHByb3BfOTEzLCBzY29wZV85MTIpKX0pXSwgW18uVCwgYmluZGluZ185MTQgPT4gYXNzZXJ0KGZhbHNlLCBcIm5vdCBpbXBsZW1lbnRlZCB5ZXQgZm9yOiBcIiArIGJpbmRpbmdfOTE0LnR5cGUpXV0pO1xuZnVuY3Rpb24gZmluZE5hbWVJbkV4cG9ydHNfODk1KG5hbWVfOTE1LCBleHBfOTE2KSB7XG4gIGxldCBmb3VuZE5hbWVzXzkxNyA9IGV4cF85MTYucmVkdWNlKChhY2NfOTE4LCBlXzkxOSkgPT4ge1xuICAgIGlmIChlXzkxOS5kZWNsYXJhdGlvbikge1xuICAgICAgcmV0dXJuIGFjY185MTguY29uY2F0KGVfOTE5LmRlY2xhcmF0aW9uLmRlY2xhcmF0b3JzLnJlZHVjZSgoYWNjXzkyMCwgZGVjbF85MjEpID0+IHtcbiAgICAgICAgaWYgKGRlY2xfOTIxLmJpbmRpbmcubmFtZS52YWwoKSA9PT0gbmFtZV85MTUudmFsKCkpIHtcbiAgICAgICAgICByZXR1cm4gYWNjXzkyMC5jb25jYXQoZGVjbF85MjEuYmluZGluZy5uYW1lKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYWNjXzkyMDtcbiAgICAgIH0sIExpc3QoKSkpO1xuICAgIH1cbiAgICByZXR1cm4gYWNjXzkxODtcbiAgfSwgTGlzdCgpKTtcbiAgYXNzZXJ0KGZvdW5kTmFtZXNfOTE3LnNpemUgPD0gMSwgXCJleHBlY3Rpbmcgbm8gbW9yZSB0aGFuIDEgbWF0Y2hpbmcgbmFtZSBpbiBleHBvcnRzXCIpO1xuICByZXR1cm4gZm91bmROYW1lc185MTcuZ2V0KDApO1xufVxuZnVuY3Rpb24gYmluZEltcG9ydHNfODk2KGltcFRlcm1fOTIyLCBleE1vZHVsZV85MjMsIGNvbnRleHRfOTI0KSB7XG4gIGxldCBuYW1lc185MjUgPSBbXTtcbiAgaW1wVGVybV85MjIubmFtZWRJbXBvcnRzLmZvckVhY2goc3BlY2lmaWVyXzkyNiA9PiB7XG4gICAgbGV0IG5hbWVfOTI3ID0gc3BlY2lmaWVyXzkyNi5iaW5kaW5nLm5hbWU7XG4gICAgbGV0IGV4cG9ydE5hbWVfOTI4ID0gZmluZE5hbWVJbkV4cG9ydHNfODk1KG5hbWVfOTI3LCBleE1vZHVsZV85MjMuZXhwb3J0RW50cmllcyk7XG4gICAgaWYgKGV4cG9ydE5hbWVfOTI4ICE9IG51bGwpIHtcbiAgICAgIGxldCBuZXdCaW5kaW5nID0gZ2Vuc3ltKG5hbWVfOTI3LnZhbCgpKTtcbiAgICAgIGNvbnRleHRfOTI0LmJpbmRpbmdzLmFkZEZvcndhcmQobmFtZV85MjcsIGV4cG9ydE5hbWVfOTI4LCBuZXdCaW5kaW5nKTtcbiAgICAgIGlmIChjb250ZXh0XzkyNC5zdG9yZS5oYXMoZXhwb3J0TmFtZV85MjgucmVzb2x2ZSgpKSkge1xuICAgICAgICBuYW1lc185MjUucHVzaChuYW1lXzkyNyk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIExpc3QobmFtZXNfOTI1KTtcbn1cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRva2VuRXhwYW5kZXIge1xuICBjb25zdHJ1Y3Rvcihjb250ZXh0XzkyOSkge1xuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHRfOTI5O1xuICB9XG4gIGV4cGFuZChzdHhsXzkzMCkge1xuICAgIGxldCByZXN1bHRfOTMxID0gTGlzdCgpO1xuICAgIGlmIChzdHhsXzkzMC5zaXplID09PSAwKSB7XG4gICAgICByZXR1cm4gcmVzdWx0XzkzMTtcbiAgICB9XG4gICAgbGV0IHByZXZfOTMyID0gTGlzdCgpO1xuICAgIGxldCBlbmZfOTMzID0gbmV3IEVuZm9yZXN0ZXIoc3R4bF85MzAsIHByZXZfOTMyLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBzZWxmXzkzNCA9IHRoaXM7XG4gICAgd2hpbGUgKCFlbmZfOTMzLmRvbmUpIHtcbiAgICAgIGxldCB0ZXJtID0gXy5waXBlKF8uYmluZChlbmZfOTMzLmVuZm9yZXN0LCBlbmZfOTMzKSwgXy5jb25kKFtbaXNWYXJpYWJsZURlY2xhcmF0aW9uU3RhdGVtZW50LCB0ZXJtXzkzNSA9PiB7XG4gICAgICAgIHRlcm1fOTM1LmRlY2xhcmF0aW9uLmRlY2xhcmF0b3JzID0gdGVybV85MzUuZGVjbGFyYXRpb24uZGVjbGFyYXRvcnMubWFwKGRlY2xfOTM2ID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJWYXJpYWJsZURlY2xhcmF0b3JcIiwge2JpbmRpbmc6IHJlbW92ZVNjb3BlXzg5NChkZWNsXzkzNi5iaW5kaW5nLCBzZWxmXzkzNC5jb250ZXh0LnVzZVNjb3BlKSwgaW5pdDogZGVjbF85MzYuaW5pdH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGlzU3ludGF4RGVjbGFyYXRpb24odGVybV85MzUuZGVjbGFyYXRpb24pKSB7XG4gICAgICAgICAgbGV0IHNjb3BlID0gZnJlc2hTY29wZShcIm5vbnJlY1wiKTtcbiAgICAgICAgICB0ZXJtXzkzNS5kZWNsYXJhdGlvbi5kZWNsYXJhdG9ycy5mb3JFYWNoKGRlY2xfOTM3ID0+IHtcbiAgICAgICAgICAgIGxldCBuYW1lXzkzOCA9IGRlY2xfOTM3LmJpbmRpbmcubmFtZTtcbiAgICAgICAgICAgIGxldCBuYW1lQWRkZWRfOTM5ID0gbmFtZV85MzguYWRkU2NvcGUoc2NvcGUpO1xuICAgICAgICAgICAgbGV0IG5hbWVSZW1vdmVkXzk0MCA9IG5hbWVfOTM4LnJlbW92ZVNjb3BlKHNlbGZfOTM0LmNvbnRleHQuY3VycmVudFNjb3BlW3NlbGZfOTM0LmNvbnRleHQuY3VycmVudFNjb3BlLmxlbmd0aCAtIDFdKTtcbiAgICAgICAgICAgIGxldCBuZXdCaW5kaW5nXzk0MSA9IGdlbnN5bShuYW1lXzkzOC52YWwoKSk7XG4gICAgICAgICAgICBzZWxmXzkzNC5jb250ZXh0LmJpbmRpbmdzLmFkZEZvcndhcmQobmFtZUFkZGVkXzkzOSwgbmFtZVJlbW92ZWRfOTQwLCBuZXdCaW5kaW5nXzk0MSk7XG4gICAgICAgICAgICBkZWNsXzkzNy5pbml0ID0gZGVjbF85MzcuaW5pdC5hZGRTY29wZShzY29wZSwgc2VsZl85MzQuY29udGV4dC5iaW5kaW5ncyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzU3ludGF4RGVjbGFyYXRpb24odGVybV85MzUuZGVjbGFyYXRpb24pIHx8IGlzU3ludGF4cmVjRGVjbGFyYXRpb24odGVybV85MzUuZGVjbGFyYXRpb24pKSB7XG4gICAgICAgICAgdGVybV85MzUuZGVjbGFyYXRpb24uZGVjbGFyYXRvcnMuZm9yRWFjaChkZWNsXzk0MiA9PiB7XG4gICAgICAgICAgICByZWdpc3RlckJpbmRpbmdzXzg5MyhkZWNsXzk0Mi5iaW5kaW5nLCBzZWxmXzkzNC5jb250ZXh0KTtcbiAgICAgICAgICAgIGxvYWRTeW50YXgoZGVjbF85NDIsIHNlbGZfOTM0LmNvbnRleHQsIHNlbGZfOTM0LmNvbnRleHQuZW52KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gTm90aGluZ184OTEoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0ZXJtXzkzNS5kZWNsYXJhdGlvbi5kZWNsYXJhdG9ycy5mb3JFYWNoKGRlY2xfOTQzID0+IHJlZ2lzdGVyQmluZGluZ3NfODkzKGRlY2xfOTQzLmJpbmRpbmcsIHNlbGZfOTM0LmNvbnRleHQpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gSnVzdF84OTAodGVybV85MzUpO1xuICAgICAgfV0sIFtpc0Z1bmN0aW9uV2l0aE5hbWUsIHRlcm1fOTQ0ID0+IHtcbiAgICAgICAgdGVybV85NDQubmFtZSA9IHJlbW92ZVNjb3BlXzg5NCh0ZXJtXzk0NC5uYW1lLCBzZWxmXzkzNC5jb250ZXh0LnVzZVNjb3BlKTtcbiAgICAgICAgcmVnaXN0ZXJCaW5kaW5nc184OTModGVybV85NDQubmFtZSwgc2VsZl85MzQuY29udGV4dCk7XG4gICAgICAgIHJldHVybiBKdXN0Xzg5MCh0ZXJtXzk0NCk7XG4gICAgICB9XSwgW2lzSW1wb3J0LCB0ZXJtXzk0NSA9PiB7XG4gICAgICAgIGxldCBtb2RfOTQ2ID0gc2VsZl85MzQuY29udGV4dC5tb2R1bGVzLmxvYWQodGVybV85NDUubW9kdWxlU3BlY2lmaWVyLnZhbCgpLCBzZWxmXzkzNC5jb250ZXh0KTtcbiAgICAgICAgaWYgKHRlcm1fOTQ1LmZvclN5bnRheCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiaW1wb3J0IGZvciBzeW50YXggaXMgbm90IGltcGxlbWVudGVkIHlldFwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtb2RfOTQ2LnZpc2l0KHNlbGZfOTM0LmNvbnRleHQpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBib3VuZE5hbWVzXzk0NyA9IGJpbmRJbXBvcnRzXzg5Nih0ZXJtXzk0NSwgbW9kXzk0Niwgc2VsZl85MzQuY29udGV4dCk7XG4gICAgICAgIGlmIChib3VuZE5hbWVzXzk0Ny5zaXplID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIEp1c3RfODkwKHRlcm1fOTQ1KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTm90aGluZ184OTEoKTtcbiAgICAgIH1dLCBbaXNFT0YsIE5vdGhpbmdfODkxXSwgW18uVCwgSnVzdF84OTBdXSksIE1heWJlLm1heWJlKExpc3QoKSwgXy5pZGVudGl0eSkpKCk7XG4gICAgICByZXN1bHRfOTMxID0gcmVzdWx0XzkzMS5jb25jYXQodGVybSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRfOTMxO1xuICB9XG59XG4iXX0=