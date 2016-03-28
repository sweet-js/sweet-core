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

var Just_881 = _ramdaFantasy.Maybe.Just;
var Nothing_882 = _ramdaFantasy.Maybe.Nothing;
var registerSyntax_883 = function registerSyntax_883(stx_888, context_889) {
  var newBinding_890 = (0, _symbol.gensym)(stx_888.val());
  context_889.env.set(newBinding_890.toString(), new _transforms.VarBindingTransform(stx_888));
  context_889.bindings.add(stx_888, { binding: newBinding_890, phase: 0, skipDup: true });
};
var registerBindings_884 = _.cond([[_terms.isBindingIdentifier, function (_ref, context_891) {
  var name = _ref.name;

  registerSyntax_883(name, context_891);
}], [_terms.isBindingPropertyIdentifier, function (_ref2, context_892) {
  var binding = _ref2.binding;

  registerBindings_884(binding, context_892);
}], [_terms.isBindingPropertyProperty, function (_ref3, context_893) {
  var binding = _ref3.binding;

  registerBindings_884(binding, context_893);
}], [_terms.isArrayBinding, function (_ref4, context_894) {
  var elements = _ref4.elements;
  var restElement = _ref4.restElement;

  if (restElement != null) {
    registerBindings_884(restElement, context_894);
  }
  elements.forEach(function (el_895) {
    if (el_895 != null) {
      registerBindings_884(el_895, context_894);
    }
  });
}], [_terms.isObjectBinding, function (_ref5, context_896) {
  var properties = _ref5.properties;
}], [_.T, function (binding_897) {
  return (0, _errors.assert)(false, "not implemented yet for: " + binding_897.type);
}]]);
var removeScope_885 = _.cond([[_terms.isBindingIdentifier, function (_ref6, scope_898) {
  var name = _ref6.name;
  return new _terms2.default("BindingIdentifier", { name: name.removeScope(scope_898) });
}], [_terms.isArrayBinding, function (_ref7, scope_899) {
  var elements = _ref7.elements;
  var restElement = _ref7.restElement;

  return new _terms2.default("ArrayBinding", { elements: elements.map(function (el_900) {
      return el_900 == null ? null : removeScope_885(el_900, scope_899);
    }), restElement: restElement == null ? null : removeScope_885(restElement, scope_899) });
}], [_terms.isBindingPropertyIdentifier, function (_ref8, scope_901) {
  var binding = _ref8.binding;
  var init = _ref8.init;
  return new _terms2.default("BindingPropertyIdentifier", { binding: removeScope_885(binding, scope_901), init: init });
}], [_terms.isBindingPropertyProperty, function (_ref9, scope_902) {
  var binding = _ref9.binding;
  var name = _ref9.name;
  return new _terms2.default("BindingPropertyProperty", { binding: removeScope_885(binding, scope_902), name: name });
}], [_terms.isObjectBinding, function (_ref10, scope_903) {
  var properties = _ref10.properties;
  return new _terms2.default("ObjectBinding", { properties: properties.map(function (prop_904) {
      return removeScope_885(prop_904, scope_903);
    }) });
}], [_.T, function (binding_905) {
  return (0, _errors.assert)(false, "not implemented yet for: " + binding_905.type);
}]]);
function findNameInExports_886(name_906, exp_907) {
  var foundNames_908 = exp_907.reduce(function (acc_909, e_910) {
    if (e_910.declaration) {
      return acc_909.concat(e_910.declaration.declarators.reduce(function (acc_911, decl_912) {
        if (decl_912.binding.name.val() === name_906.val()) {
          return acc_911.concat(decl_912.binding.name);
        }
        return acc_911;
      }, (0, _immutable.List)()));
    }
    return acc_909;
  }, (0, _immutable.List)());
  (0, _errors.assert)(foundNames_908.size <= 1, "expecting no more than 1 matching name in exports");
  return foundNames_908.get(0);
}
function bindImports_887(impTerm_913, exModule_914, context_915) {
  var names_916 = [];
  impTerm_913.namedImports.forEach(function (specifier_917) {
    var name_918 = specifier_917.binding.name;
    var exportName_919 = findNameInExports_886(name_918, exModule_914.exportEntries);
    if (exportName_919 != null) {
      var newBinding = (0, _symbol.gensym)(name_918.val());
      context_915.bindings.addForward(name_918, exportName_919, newBinding);
      if (context_915.store.has(exportName_919.resolve())) {
        names_916.push(name_918);
      }
    }
  });
  return (0, _immutable.List)(names_916);
}

var TokenExpander = (function () {
  function TokenExpander(context_920) {
    _classCallCheck(this, TokenExpander);

    this.context = context_920;
  }

  _createClass(TokenExpander, [{
    key: "expand",
    value: function expand(stxl_921) {
      var result_922 = (0, _immutable.List)();
      if (stxl_921.size === 0) {
        return result_922;
      }
      var prev_923 = (0, _immutable.List)();
      var enf_924 = new _enforester.Enforester(stxl_921, prev_923, this.context);
      var self_925 = this;
      while (!enf_924.done) {
        var term = _.pipe(_.bind(enf_924.enforest, enf_924), _.cond([[_terms.isVariableDeclarationStatement, function (term_926) {
          term_926.declaration.declarators = term_926.declaration.declarators.map(function (decl_927) {
            return new _terms2.default("VariableDeclarator", { binding: removeScope_885(decl_927.binding, self_925.context.useScope), init: decl_927.init });
          });
          if ((0, _terms.isSyntaxDeclaration)(term_926.declaration)) {
            (function () {
              var scope = (0, _scope.freshScope)("nonrec");
              term_926.declaration.declarators.forEach(function (decl_928) {
                var name_929 = decl_928.binding.name;
                var nameAdded_930 = name_929.addScope(scope);
                var nameRemoved_931 = name_929.removeScope(self_925.context.currentScope[self_925.context.currentScope.length - 1]);
                var newBinding_932 = (0, _symbol.gensym)(name_929.val());
                self_925.context.bindings.addForward(nameAdded_930, nameRemoved_931, newBinding_932);
                decl_928.init = decl_928.init.addScope(scope, self_925.context.bindings);
              });
            })();
          }
          if ((0, _terms.isSyntaxDeclaration)(term_926.declaration) || (0, _terms.isSyntaxrecDeclaration)(term_926.declaration)) {
            term_926.declaration.declarators.forEach(function (decl_933) {
              registerBindings_884(decl_933.binding, self_925.context);
              (0, _loadSyntax2.default)(decl_933, self_925.context, self_925.context.env);
            });
            return Nothing_882();
          } else {
            term_926.declaration.declarators.forEach(function (decl_934) {
              return registerBindings_884(decl_934.binding, self_925.context);
            });
          }
          return Just_881(term_926);
        }], [_terms.isFunctionWithName, function (term_935) {
          term_935.name = removeScope_885(term_935.name, self_925.context.useScope);
          registerBindings_884(term_935.name, self_925.context);
          return Just_881(term_935);
        }], [_terms.isImport, function (term_936) {
          var mod_937 = self_925.context.modules.load(term_936.moduleSpecifier.val(), self_925.context);
          if (term_936.forSyntax) {
            console.log("import for syntax is not implemented yet");
          } else {
            mod_937.visit(self_925.context);
          }
          var boundNames_938 = bindImports_887(term_936, mod_937, self_925.context);
          if (boundNames_938.size === 0) {
            return Just_881(term_936);
          }
          return Nothing_882();
        }], [_terms.isEOF, Nothing_882], [_.T, Just_881]]), _ramdaFantasy.Maybe.maybe((0, _immutable.List)(), _.identity))();
        result_922 = result_922.concat(term);
      }
      return result_922;
    }
  }]);

  return TokenExpander;
})();

exports.default = TokenExpander;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3Rva2VuLWV4cGFuZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQU1hLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBUWQsSUFBTSxRQUFRLEdBQUcsb0JBQU0sSUFBSSxDQUFDO0FBQzVCLElBQU0sV0FBVyxHQUFHLG9CQUFNLE9BQU8sQ0FBQztBQUNsQyxJQUFNLGtCQUFrQixHQUFHLFNBQXJCLGtCQUFrQixDQUFJLE9BQU8sRUFBRSxXQUFXLEVBQUs7QUFDbkQsTUFBSSxjQUFjLEdBQUcsb0JBQU8sT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFDM0MsYUFBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxFQUFFLG9DQUF3QixPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQ2pGLGFBQVcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFDLE9BQU8sRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztDQUN2RixDQUFDO0FBQ0YsSUFBSSxvQkFBb0IsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsNkJBQXNCLGdCQUFTLFdBQVcsRUFBSztNQUF2QixJQUFJLFFBQUosSUFBSTs7QUFDN0Qsb0JBQWtCLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0NBQ3ZDLENBQUMsRUFBRSxxQ0FBOEIsaUJBQVksV0FBVyxFQUFLO01BQTFCLE9BQU8sU0FBUCxPQUFPOztBQUN6QyxzQkFBb0IsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7Q0FDNUMsQ0FBQyxFQUFFLG1DQUE0QixpQkFBWSxXQUFXLEVBQUs7TUFBMUIsT0FBTyxTQUFQLE9BQU87O0FBQ3ZDLHNCQUFvQixDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQztDQUM1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QyxFQUFFO0FBQzdCLG1CQUFPLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztXQUMzQjtBQUNELGlCQUFPLFdBQVcsRUFBRSxDQUFDO1NBQ3RCLENBQUMsRUFBRSxlQUFRLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsb0JBQU0sS0FBSyxDQUFDLHNCQUFNLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUNoRixrQkFBVSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDdEM7QUFDRCxhQUFPLFVBQVUsQ0FBQztLQUNuQjs7O1NBMURrQixhQUFhOzs7a0JBQWIsYUFBYSIsImZpbGUiOiJ0b2tlbi1leHBhbmRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdH0gZnJvbSBcImltbXV0YWJsZVwiO1xuaW1wb3J0IHtlbmZvcmVzdEV4cHIsIEVuZm9yZXN0ZXJ9IGZyb20gXCIuL2VuZm9yZXN0ZXJcIjtcbmltcG9ydCBUZXJtRXhwYW5kZXIgZnJvbSBcIi4vdGVybS1leHBhbmRlci5qc1wiO1xuaW1wb3J0IEJpbmRpbmdNYXAgZnJvbSBcIi4vYmluZGluZy1tYXAuanNcIjtcbmltcG9ydCBFbnYgZnJvbSBcIi4vZW52XCI7XG5pbXBvcnQgUmVhZGVyIGZyb20gXCIuL3NoaWZ0LXJlYWRlclwiO1xuaW1wb3J0ICAqIGFzIF8gZnJvbSBcInJhbWRhXCI7XG5pbXBvcnQgVGVybSwge2lzRU9GLCBpc0JpbmRpbmdJZGVudGlmaWVyLCBpc0JpbmRpbmdQcm9wZXJ0eVByb3BlcnR5LCBpc0JpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXIsIGlzT2JqZWN0QmluZGluZywgaXNBcnJheUJpbmRpbmcsIGlzRnVuY3Rpb25EZWNsYXJhdGlvbiwgaXNGdW5jdGlvbkV4cHJlc3Npb24sIGlzRnVuY3Rpb25UZXJtLCBpc0Z1bmN0aW9uV2l0aE5hbWUsIGlzU3ludGF4RGVjbGFyYXRpb24sIGlzU3ludGF4cmVjRGVjbGFyYXRpb24sIGlzVmFyaWFibGVEZWNsYXJhdGlvbiwgaXNWYXJpYWJsZURlY2xhcmF0aW9uU3RhdGVtZW50LCBpc0ltcG9ydCwgaXNFeHBvcnR9IGZyb20gXCIuL3Rlcm1zXCI7XG5pbXBvcnQge01heWJlfSBmcm9tIFwicmFtZGEtZmFudGFzeVwiO1xuaW1wb3J0IHtnZW5zeW19IGZyb20gXCIuL3N5bWJvbFwiO1xuaW1wb3J0IHtWYXJCaW5kaW5nVHJhbnNmb3JtLCBDb21waWxldGltZVRyYW5zZm9ybX0gZnJvbSBcIi4vdHJhbnNmb3Jtc1wiO1xuaW1wb3J0IHtleHBlY3QsIGFzc2VydH0gZnJvbSBcIi4vZXJyb3JzXCI7XG5pbXBvcnQgbG9hZFN5bnRheCBmcm9tIFwiLi9sb2FkLXN5bnRheFwiO1xuaW1wb3J0IHtTY29wZSwgZnJlc2hTY29wZX0gZnJvbSBcIi4vc2NvcGVcIjtcbmNvbnN0IEp1c3RfODgxID0gTWF5YmUuSnVzdDtcbmNvbnN0IE5vdGhpbmdfODgyID0gTWF5YmUuTm90aGluZztcbmNvbnN0IHJlZ2lzdGVyU3ludGF4Xzg4MyA9IChzdHhfODg4LCBjb250ZXh0Xzg4OSkgPT4ge1xuICBsZXQgbmV3QmluZGluZ184OTAgPSBnZW5zeW0oc3R4Xzg4OC52YWwoKSk7XG4gIGNvbnRleHRfODg5LmVudi5zZXQobmV3QmluZGluZ184OTAudG9TdHJpbmcoKSwgbmV3IFZhckJpbmRpbmdUcmFuc2Zvcm0oc3R4Xzg4OCkpO1xuICBjb250ZXh0Xzg4OS5iaW5kaW5ncy5hZGQoc3R4Xzg4OCwge2JpbmRpbmc6IG5ld0JpbmRpbmdfODkwLCBwaGFzZTogMCwgc2tpcER1cDogdHJ1ZX0pO1xufTtcbmxldCByZWdpc3RlckJpbmRpbmdzXzg4NCA9IF8uY29uZChbW2lzQmluZGluZ0lkZW50aWZpZXIsICh7bmFtZX0sIGNvbnRleHRfODkxKSA9PiB7XG4gIHJlZ2lzdGVyU3ludGF4Xzg4MyhuYW1lLCBjb250ZXh0Xzg5MSk7XG59XSwgW2lzQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllciwgKHtiaW5kaW5nfSwgY29udGV4dF84OTIpID0+IHtcbiAgcmVnaXN0ZXJCaW5kaW5nc184ODQoYmluZGluZywgY29udGV4dF84OTIpO1xufV0sIFtpc0JpbmRpbmdQcm9wZXJ0eVByb3BlcnR5LCAoe2JpbmRpbmd9LCBjb250ZXh0Xzg5MykgPT4ge1xuICByZWdpc3RlckJpbmRpbmdzXzg4NChiaW5kaW5nLCBjb250ZXh0Xzg5Myk7XG59XSwgW2lzQXJyYXlCaW5kaW5nLCAoe2VsZW1lbnRzLCByZXN0RWxlbWVudH0sIGNvbnRleHRfODk0KSA9PiB7XG4gIGlmIChyZXN0RWxlbWVudCAhPSBudWxsKSB7XG4gICAgcmVnaXN0ZXJCaW5kaW5nc184ODQocmVzdEVsZW1lbnQsIGNvbnRleHRfODk0KTtcbiAgfVxuICBlbGVtZW50cy5mb3JFYWNoKGVsXzg5NSA9PiB7XG4gICAgaWYgKGVsXzg5NSAhPSBudWxsKSB7XG4gICAgICByZWdpc3RlckJpbmRpbmdzXzg4NChlbF84OTUsIGNvbnRleHRfODk0KTtcbiAgICB9XG4gIH0pO1xufV0sIFtpc09iamVjdEJpbmRpbmcsICh7cHJvcGVydGllc30sIGNvbnRleHRfODk2KSA9PiB7fV0sIFtfLlQsIGJpbmRpbmdfODk3ID0+IGFzc2VydChmYWxzZSwgXCJub3QgaW1wbGVtZW50ZWQgeWV0IGZvcjogXCIgKyBiaW5kaW5nXzg5Ny50eXBlKV1dKTtcbmxldCByZW1vdmVTY29wZV84ODUgPSBfLmNvbmQoW1tpc0JpbmRpbmdJZGVudGlmaWVyLCAoe25hbWV9LCBzY29wZV84OTgpID0+IG5ldyBUZXJtKFwiQmluZGluZ0lkZW50aWZpZXJcIiwge25hbWU6IG5hbWUucmVtb3ZlU2NvcGUoc2NvcGVfODk4KX0pXSwgW2lzQXJyYXlCaW5kaW5nLCAoe2VsZW1lbnRzLCByZXN0RWxlbWVudH0sIHNjb3BlXzg5OSkgPT4ge1xuICByZXR1cm4gbmV3IFRlcm0oXCJBcnJheUJpbmRpbmdcIiwge2VsZW1lbnRzOiBlbGVtZW50cy5tYXAoZWxfOTAwID0+IGVsXzkwMCA9PSBudWxsID8gbnVsbCA6IHJlbW92ZVNjb3BlXzg4NShlbF85MDAsIHNjb3BlXzg5OSkpLCByZXN0RWxlbWVudDogcmVzdEVsZW1lbnQgPT0gbnVsbCA/IG51bGwgOiByZW1vdmVTY29wZV84ODUocmVzdEVsZW1lbnQsIHNjb3BlXzg5OSl9KTtcbn1dLCBbaXNCaW5kaW5nUHJvcGVydHlJZGVudGlmaWVyLCAoe2JpbmRpbmcsIGluaXR9LCBzY29wZV85MDEpID0+IG5ldyBUZXJtKFwiQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllclwiLCB7YmluZGluZzogcmVtb3ZlU2NvcGVfODg1KGJpbmRpbmcsIHNjb3BlXzkwMSksIGluaXQ6IGluaXR9KV0sIFtpc0JpbmRpbmdQcm9wZXJ0eVByb3BlcnR5LCAoe2JpbmRpbmcsIG5hbWV9LCBzY29wZV85MDIpID0+IG5ldyBUZXJtKFwiQmluZGluZ1Byb3BlcnR5UHJvcGVydHlcIiwge2JpbmRpbmc6IHJlbW92ZVNjb3BlXzg4NShiaW5kaW5nLCBzY29wZV85MDIpLCBuYW1lOiBuYW1lfSldLCBbaXNPYmplY3RCaW5kaW5nLCAoe3Byb3BlcnRpZXN9LCBzY29wZV85MDMpID0+IG5ldyBUZXJtKFwiT2JqZWN0QmluZGluZ1wiLCB7cHJvcGVydGllczogcHJvcGVydGllcy5tYXAocHJvcF85MDQgPT4gcmVtb3ZlU2NvcGVfODg1KHByb3BfOTA0LCBzY29wZV85MDMpKX0pXSwgW18uVCwgYmluZGluZ185MDUgPT4gYXNzZXJ0KGZhbHNlLCBcIm5vdCBpbXBsZW1lbnRlZCB5ZXQgZm9yOiBcIiArIGJpbmRpbmdfOTA1LnR5cGUpXV0pO1xuZnVuY3Rpb24gZmluZE5hbWVJbkV4cG9ydHNfODg2KG5hbWVfOTA2LCBleHBfOTA3KSB7XG4gIGxldCBmb3VuZE5hbWVzXzkwOCA9IGV4cF85MDcucmVkdWNlKChhY2NfOTA5LCBlXzkxMCkgPT4ge1xuICAgIGlmIChlXzkxMC5kZWNsYXJhdGlvbikge1xuICAgICAgcmV0dXJuIGFjY185MDkuY29uY2F0KGVfOTEwLmRlY2xhcmF0aW9uLmRlY2xhcmF0b3JzLnJlZHVjZSgoYWNjXzkxMSwgZGVjbF85MTIpID0+IHtcbiAgICAgICAgaWYgKGRlY2xfOTEyLmJpbmRpbmcubmFtZS52YWwoKSA9PT0gbmFtZV85MDYudmFsKCkpIHtcbiAgICAgICAgICByZXR1cm4gYWNjXzkxMS5jb25jYXQoZGVjbF85MTIuYmluZGluZy5uYW1lKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYWNjXzkxMTtcbiAgICAgIH0sIExpc3QoKSkpO1xuICAgIH1cbiAgICByZXR1cm4gYWNjXzkwOTtcbiAgfSwgTGlzdCgpKTtcbiAgYXNzZXJ0KGZvdW5kTmFtZXNfOTA4LnNpemUgPD0gMSwgXCJleHBlY3Rpbmcgbm8gbW9yZSB0aGFuIDEgbWF0Y2hpbmcgbmFtZSBpbiBleHBvcnRzXCIpO1xuICByZXR1cm4gZm91bmROYW1lc185MDguZ2V0KDApO1xufVxuZnVuY3Rpb24gYmluZEltcG9ydHNfODg3KGltcFRlcm1fOTEzLCBleE1vZHVsZV85MTQsIGNvbnRleHRfOTE1KSB7XG4gIGxldCBuYW1lc185MTYgPSBbXTtcbiAgaW1wVGVybV85MTMubmFtZWRJbXBvcnRzLmZvckVhY2goc3BlY2lmaWVyXzkxNyA9PiB7XG4gICAgbGV0IG5hbWVfOTE4ID0gc3BlY2lmaWVyXzkxNy5iaW5kaW5nLm5hbWU7XG4gICAgbGV0IGV4cG9ydE5hbWVfOTE5ID0gZmluZE5hbWVJbkV4cG9ydHNfODg2KG5hbWVfOTE4LCBleE1vZHVsZV85MTQuZXhwb3J0RW50cmllcyk7XG4gICAgaWYgKGV4cG9ydE5hbWVfOTE5ICE9IG51bGwpIHtcbiAgICAgIGxldCBuZXdCaW5kaW5nID0gZ2Vuc3ltKG5hbWVfOTE4LnZhbCgpKTtcbiAgICAgIGNvbnRleHRfOTE1LmJpbmRpbmdzLmFkZEZvcndhcmQobmFtZV85MTgsIGV4cG9ydE5hbWVfOTE5LCBuZXdCaW5kaW5nKTtcbiAgICAgIGlmIChjb250ZXh0XzkxNS5zdG9yZS5oYXMoZXhwb3J0TmFtZV85MTkucmVzb2x2ZSgpKSkge1xuICAgICAgICBuYW1lc185MTYucHVzaChuYW1lXzkxOCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIExpc3QobmFtZXNfOTE2KTtcbn1cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRva2VuRXhwYW5kZXIge1xuICBjb25zdHJ1Y3Rvcihjb250ZXh0XzkyMCkge1xuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHRfOTIwO1xuICB9XG4gIGV4cGFuZChzdHhsXzkyMSkge1xuICAgIGxldCByZXN1bHRfOTIyID0gTGlzdCgpO1xuICAgIGlmIChzdHhsXzkyMS5zaXplID09PSAwKSB7XG4gICAgICByZXR1cm4gcmVzdWx0XzkyMjtcbiAgICB9XG4gICAgbGV0IHByZXZfOTIzID0gTGlzdCgpO1xuICAgIGxldCBlbmZfOTI0ID0gbmV3IEVuZm9yZXN0ZXIoc3R4bF85MjEsIHByZXZfOTIzLCB0aGlzLmNvbnRleHQpO1xuICAgIGxldCBzZWxmXzkyNSA9IHRoaXM7XG4gICAgd2hpbGUgKCFlbmZfOTI0LmRvbmUpIHtcbiAgICAgIGxldCB0ZXJtID0gXy5waXBlKF8uYmluZChlbmZfOTI0LmVuZm9yZXN0LCBlbmZfOTI0KSwgXy5jb25kKFtbaXNWYXJpYWJsZURlY2xhcmF0aW9uU3RhdGVtZW50LCB0ZXJtXzkyNiA9PiB7XG4gICAgICAgIHRlcm1fOTI2LmRlY2xhcmF0aW9uLmRlY2xhcmF0b3JzID0gdGVybV85MjYuZGVjbGFyYXRpb24uZGVjbGFyYXRvcnMubWFwKGRlY2xfOTI3ID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJWYXJpYWJsZURlY2xhcmF0b3JcIiwge2JpbmRpbmc6IHJlbW92ZVNjb3BlXzg4NShkZWNsXzkyNy5iaW5kaW5nLCBzZWxmXzkyNS5jb250ZXh0LnVzZVNjb3BlKSwgaW5pdDogZGVjbF85MjcuaW5pdH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGlzU3ludGF4RGVjbGFyYXRpb24odGVybV85MjYuZGVjbGFyYXRpb24pKSB7XG4gICAgICAgICAgbGV0IHNjb3BlID0gZnJlc2hTY29wZShcIm5vbnJlY1wiKTtcbiAgICAgICAgICB0ZXJtXzkyNi5kZWNsYXJhdGlvbi5kZWNsYXJhdG9ycy5mb3JFYWNoKGRlY2xfOTI4ID0+IHtcbiAgICAgICAgICAgIGxldCBuYW1lXzkyOSA9IGRlY2xfOTI4LmJpbmRpbmcubmFtZTtcbiAgICAgICAgICAgIGxldCBuYW1lQWRkZWRfOTMwID0gbmFtZV85MjkuYWRkU2NvcGUoc2NvcGUpO1xuICAgICAgICAgICAgbGV0IG5hbWVSZW1vdmVkXzkzMSA9IG5hbWVfOTI5LnJlbW92ZVNjb3BlKHNlbGZfOTI1LmNvbnRleHQuY3VycmVudFNjb3BlW3NlbGZfOTI1LmNvbnRleHQuY3VycmVudFNjb3BlLmxlbmd0aCAtIDFdKTtcbiAgICAgICAgICAgIGxldCBuZXdCaW5kaW5nXzkzMiA9IGdlbnN5bShuYW1lXzkyOS52YWwoKSk7XG4gICAgICAgICAgICBzZWxmXzkyNS5jb250ZXh0LmJpbmRpbmdzLmFkZEZvcndhcmQobmFtZUFkZGVkXzkzMCwgbmFtZVJlbW92ZWRfOTMxLCBuZXdCaW5kaW5nXzkzMik7XG4gICAgICAgICAgICBkZWNsXzkyOC5pbml0ID0gZGVjbF85MjguaW5pdC5hZGRTY29wZShzY29wZSwgc2VsZl85MjUuY29udGV4dC5iaW5kaW5ncyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzU3ludGF4RGVjbGFyYXRpb24odGVybV85MjYuZGVjbGFyYXRpb24pIHx8IGlzU3ludGF4cmVjRGVjbGFyYXRpb24odGVybV85MjYuZGVjbGFyYXRpb24pKSB7XG4gICAgICAgICAgdGVybV85MjYuZGVjbGFyYXRpb24uZGVjbGFyYXRvcnMuZm9yRWFjaChkZWNsXzkzMyA9PiB7XG4gICAgICAgICAgICByZWdpc3RlckJpbmRpbmdzXzg4NChkZWNsXzkzMy5iaW5kaW5nLCBzZWxmXzkyNS5jb250ZXh0KTtcbiAgICAgICAgICAgIGxvYWRTeW50YXgoZGVjbF85MzMsIHNlbGZfOTI1LmNvbnRleHQsIHNlbGZfOTI1LmNvbnRleHQuZW52KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gTm90aGluZ184ODIoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0ZXJtXzkyNi5kZWNsYXJhdGlvbi5kZWNsYXJhdG9ycy5mb3JFYWNoKGRlY2xfOTM0ID0+IHJlZ2lzdGVyQmluZGluZ3NfODg0KGRlY2xfOTM0LmJpbmRpbmcsIHNlbGZfOTI1LmNvbnRleHQpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gSnVzdF84ODEodGVybV85MjYpO1xuICAgICAgfV0sIFtpc0Z1bmN0aW9uV2l0aE5hbWUsIHRlcm1fOTM1ID0+IHtcbiAgICAgICAgdGVybV85MzUubmFtZSA9IHJlbW92ZVNjb3BlXzg4NSh0ZXJtXzkzNS5uYW1lLCBzZWxmXzkyNS5jb250ZXh0LnVzZVNjb3BlKTtcbiAgICAgICAgcmVnaXN0ZXJCaW5kaW5nc184ODQodGVybV85MzUubmFtZSwgc2VsZl85MjUuY29udGV4dCk7XG4gICAgICAgIHJldHVybiBKdXN0Xzg4MSh0ZXJtXzkzNSk7XG4gICAgICB9XSwgW2lzSW1wb3J0LCB0ZXJtXzkzNiA9PiB7XG4gICAgICAgIGxldCBtb2RfOTM3ID0gc2VsZl85MjUuY29udGV4dC5tb2R1bGVzLmxvYWQodGVybV85MzYubW9kdWxlU3BlY2lmaWVyLnZhbCgpLCBzZWxmXzkyNS5jb250ZXh0KTtcbiAgICAgICAgaWYgKHRlcm1fOTM2LmZvclN5bnRheCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiaW1wb3J0IGZvciBzeW50YXggaXMgbm90IGltcGxlbWVudGVkIHlldFwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtb2RfOTM3LnZpc2l0KHNlbGZfOTI1LmNvbnRleHQpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBib3VuZE5hbWVzXzkzOCA9IGJpbmRJbXBvcnRzXzg4Nyh0ZXJtXzkzNiwgbW9kXzkzNywgc2VsZl85MjUuY29udGV4dCk7XG4gICAgICAgIGlmIChib3VuZE5hbWVzXzkzOC5zaXplID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIEp1c3RfODgxKHRlcm1fOTM2KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTm90aGluZ184ODIoKTtcbiAgICAgIH1dLCBbaXNFT0YsIE5vdGhpbmdfODgyXSwgW18uVCwgSnVzdF84ODFdXSksIE1heWJlLm1heWJlKExpc3QoKSwgXy5pZGVudGl0eSkpKCk7XG4gICAgICByZXN1bHRfOTIyID0gcmVzdWx0XzkyMi5jb25jYXQodGVybSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRfOTIyO1xuICB9XG59XG4iXX0=