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

var Just_737 = _ramdaFantasy.Maybe.Just;
var Nothing_738 = _ramdaFantasy.Maybe.Nothing;
var registerSyntax_739 = function registerSyntax_739(stx, context) {
  var newBinding_744 = (0, _symbol.gensym)(stx.val());
  context.env.set(newBinding_744.toString(), new _transforms.VarBindingTransform(stx));
  context.bindings.add(stx, { binding: newBinding_744, phase: 0, skipDup: true });
};
var registerBindings_740 = _.cond([[_terms.isBindingIdentifier, function (_ref, context) {
  var name = _ref.name;

  registerSyntax_739(name, context);
}], [_terms.isBindingPropertyIdentifier, function (_ref2, context) {
  var binding = _ref2.binding;

  registerBindings_740(binding, context);
}], [_terms.isBindingPropertyProperty, function (_ref3, context) {
  var binding = _ref3.binding;

  registerBindings_740(binding, context);
}], [_terms.isArrayBinding, function (_ref4, context) {
  var elements = _ref4.elements;
  var restElement = _ref4.restElement;

  if (restElement != null) {
    registerBindings_740(restElement, context);
  }
  elements.forEach(function (el) {
    if (el != null) {
      registerBindings_740(el, context);
    }
  });
}], [_terms.isObjectBinding, function (_ref5, context) {
  var properties = _ref5.properties;
}], [_.T, function (binding) {
  return (0, _errors.assert)(false, "not implemented yet for: " + binding.type);
}]]);
var removeScope_741 = _.cond([[_terms.isBindingIdentifier, function (_ref6, scope) {
  var name = _ref6.name;
  return new _terms2.default("BindingIdentifier", { name: name.removeScope(scope) });
}], [_terms.isArrayBinding, function (_ref7, scope) {
  var elements = _ref7.elements;
  var restElement = _ref7.restElement;

  return new _terms2.default("ArrayBinding", { elements: elements.map(function (el) {
      return el == null ? null : removeScope_741(el, scope);
    }), restElement: restElement == null ? null : removeScope_741(restElement, scope) });
}], [_terms.isBindingPropertyIdentifier, function (_ref8, scope) {
  var binding = _ref8.binding;
  var init = _ref8.init;
  return new _terms2.default("BindingPropertyIdentifier", { binding: removeScope_741(binding, scope), init: init });
}], [_terms.isBindingPropertyProperty, function (_ref9, scope) {
  var binding = _ref9.binding;
  var name = _ref9.name;
  return new _terms2.default("BindingPropertyProperty", { binding: removeScope_741(binding, scope), name: name });
}], [_terms.isObjectBinding, function (_ref10, scope) {
  var properties = _ref10.properties;
  return new _terms2.default("ObjectBinding", { properties: properties.map(function (prop) {
      return removeScope_741(prop, scope);
    }) });
}], [_.T, function (binding) {
  return (0, _errors.assert)(false, "not implemented yet for: " + binding.type);
}]]);
function findNameInExports_742(name_745, exp_746) {
  var foundNames_747 = exp_746.reduce(function (acc, e) {
    if (e.declaration) {
      return acc.concat(e.declaration.declarators.reduce(function (acc, decl) {
        if (decl.binding.name.val() === name_745.val()) {
          return acc.concat(decl.binding.name);
        }
        return acc;
      }, (0, _immutable.List)()));
    }
    return acc;
  }, (0, _immutable.List)());
  (0, _errors.assert)(foundNames_747.size <= 1, "expecting no more than 1 matching name in exports");
  return foundNames_747.get(0);
}
function bindImports_743(impTerm_748, exModule_749, context_750) {
  var names_751 = [];
  impTerm_748.namedImports.forEach(function (specifier) {
    var name_752 = specifier.binding.name;
    var exportName_753 = findNameInExports_742(name_752, exModule_749.exportEntries);
    if (exportName_753 != null) {
      var newBinding = (0, _symbol.gensym)(name_752.val());
      context_750.bindings.addForward(name_752, exportName_753, newBinding);
      if (context_750.store.has(exportName_753.resolve())) {
        names_751.push(name_752);
      }
    }
  });
  return (0, _immutable.List)(names_751);
}

var TokenExpander = function () {
  function TokenExpander(context_754) {
    _classCallCheck(this, TokenExpander);

    this.context = context_754;
  }

  _createClass(TokenExpander, [{
    key: "expand",
    value: function expand(stxl_755) {
      var result_756 = (0, _immutable.List)();
      if (stxl_755.size === 0) {
        return result_756;
      }
      var prev_757 = (0, _immutable.List)();
      var enf_758 = new _enforester.Enforester(stxl_755, prev_757, this.context);
      var self_759 = this;
      while (!enf_758.done) {
        var term = _.pipe(_.bind(enf_758.enforest, enf_758), _.cond([[_terms.isVariableDeclarationStatement, function (term) {
          term.declaration.declarators = term.declaration.declarators.map(function (decl) {
            return new _terms2.default("VariableDeclarator", { binding: removeScope_741(decl.binding, self_759.context.useScope), init: decl.init });
          });
          if ((0, _terms.isSyntaxDeclaration)(term.declaration)) {
            (function () {
              var scope = (0, _scope.freshScope)("nonrec");
              term.declaration.declarators.forEach(function (decl) {
                var name_760 = decl.binding.name;
                var nameAdded_761 = name_760.addScope(scope);
                var nameRemoved_762 = name_760.removeScope(self_759.context.currentScope[self_759.context.currentScope.length - 1]);
                var newBinding_763 = (0, _symbol.gensym)(name_760.val());
                self_759.context.bindings.addForward(nameAdded_761, nameRemoved_762, newBinding_763);
                decl.init.body = decl.init.body.map(function (s) {
                  return s.addScope(scope, self_759.context.bindings);
                });
              });
            })();
          }
          if ((0, _terms.isSyntaxDeclaration)(term.declaration) || (0, _terms.isSyntaxrecDeclaration)(term.declaration)) {
            term.declaration.declarators.forEach(function (decl) {
              registerBindings_740(decl.binding, self_759.context);
              (0, _loadSyntax2.default)(decl, self_759.context, self_759.context.env);
            });
            return Nothing_738();
          } else {
            term.declaration.declarators.forEach(function (decl) {
              return registerBindings_740(decl.binding, self_759.context);
            });
          }
          return Just_737(term);
        }], [_terms.isFunctionWithName, function (term) {
          term.name = removeScope_741(term.name, self_759.context.useScope);
          registerBindings_740(term.name, self_759.context);
          return Just_737(term);
        }], [_terms.isImport, function (term) {
          var mod_764 = self_759.context.modules.load(term.moduleSpecifier.val(), self_759.context);
          if (term.forSyntax) {
            console.log("import for syntax is not implemented yet");
          } else {
            mod_764.visit(self_759.context);
          }
          var boundNames_765 = bindImports_743(term, mod_764, self_759.context);
          if (boundNames_765.size === 0) {
            return Just_737(term);
          }
          return Nothing_738();
        }], [_terms.isEOF, Nothing_738], [_.T, Just_737]]), _ramdaFantasy.Maybe.maybe((0, _immutable.List)(), _.identity))();
        result_756 = result_756.concat(term);
      }
      return result_756;
    }
  }]);

  return TokenExpander;
}();

exports.default = TokenExpander;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3N3ZWV0L3Rva2VuLWV4cGFuZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7SUFBYTs7QUFDYjs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7Ozs7O0FBQ0EsSUFBTSxXQUFXLG9CQUFNLElBQU47QUFDakIsSUFBTSxjQUFjLG9CQUFNLE9BQU47QUFDcEIsSUFBTSxxQkFBcUIsU0FBckIsa0JBQXFCLENBQUMsR0FBRCxFQUFNLE9BQU4sRUFBa0I7QUFDM0MsTUFBSSxpQkFBaUIsb0JBQU8sSUFBSSxHQUFKLEVBQVAsQ0FBakIsQ0FEdUM7QUFFM0MsVUFBUSxHQUFSLENBQVksR0FBWixDQUFnQixlQUFlLFFBQWYsRUFBaEIsRUFBMkMsb0NBQXdCLEdBQXhCLENBQTNDLEVBRjJDO0FBRzNDLFVBQVEsUUFBUixDQUFpQixHQUFqQixDQUFxQixHQUFyQixFQUEwQixFQUFDLFNBQVMsY0FBVCxFQUF5QixPQUFPLENBQVAsRUFBVSxTQUFTLElBQVQsRUFBOUQsRUFIMkM7Q0FBbEI7QUFLM0IsSUFBSSx1QkFBdUIsRUFBRSxJQUFGLENBQU8sQ0FBQyw2QkFBc0IsZ0JBQVMsT0FBVCxFQUFxQjtNQUFuQixpQkFBbUI7O0FBQzVFLHFCQUFtQixJQUFuQixFQUF5QixPQUF6QixFQUQ0RTtDQUFyQixDQUF2QixFQUU5QixxQ0FBOEIsaUJBQVksT0FBWixFQUF3QjtNQUF0Qix3QkFBc0I7O0FBQ3hELHVCQUFxQixPQUFyQixFQUE4QixPQUE5QixFQUR3RDtDQUF4QixDQUZBLEVBSTlCLG1DQUE0QixpQkFBWSxPQUFaLEVBQXdCO01BQXRCLHdCQUFzQjs7QUFDdEQsdUJBQXFCLE9BQXJCLEVBQThCLE9BQTlCLEVBRHNEO0NBQXhCLENBSkUsRUFNOUIsd0JBQWlCLGlCQUEwQixPQUExQixFQUFzQztNQUFwQywwQkFBb0M7TUFB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QUNsQixvQkFBUSxHQUFSLENBQVksMENBQVosRUFEa0I7V0FBcEIsTUFFTztBQUNMLG9CQUFRLEtBQVIsQ0FBYyxTQUFTLE9BQVQsQ0FBZCxDQURLO1dBRlA7QUFLQSxjQUFJLGlCQUFpQixnQkFBZ0IsSUFBaEIsRUFBc0IsT0FBdEIsRUFBK0IsU0FBUyxPQUFULENBQWhELENBUGlCO0FBUXJCLGNBQUksZUFBZSxJQUFmLEtBQXdCLENBQXhCLEVBQTJCO0FBQzdCLG1CQUFPLFNBQVMsSUFBVCxDQUFQLENBRDZCO1dBQS9CO0FBR0EsaUJBQU8sYUFBUCxDQVhxQjtTQUFSLENBN0I2QyxFQXlDeEQsZUFBUSxXQUFSLENBekN3RCxFQXlDbEMsQ0FBQyxFQUFFLENBQUYsRUFBSyxRQUFOLENBekNrQyxDQUFQLENBQTFDLEVBeUNrQyxvQkFBTSxLQUFOLENBQVksc0JBQVosRUFBb0IsRUFBRSxRQUFGLENBekN0RCxHQUFQLENBRGdCO0FBMkNwQixxQkFBYSxXQUFXLE1BQVgsQ0FBa0IsSUFBbEIsQ0FBYixDQTNDb0I7T0FBdEI7QUE2Q0EsYUFBTyxVQUFQLENBckRlOzs7O1NBSkUiLCJmaWxlIjoidG9rZW4tZXhwYW5kZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0xpc3R9IGZyb20gXCJpbW11dGFibGVcIjtcbmltcG9ydCB7ZW5mb3Jlc3RFeHByLCBFbmZvcmVzdGVyfSBmcm9tIFwiLi9lbmZvcmVzdGVyXCI7XG5pbXBvcnQgVGVybUV4cGFuZGVyIGZyb20gXCIuL3Rlcm0tZXhwYW5kZXIuanNcIjtcbmltcG9ydCBCaW5kaW5nTWFwIGZyb20gXCIuL2JpbmRpbmctbWFwLmpzXCI7XG5pbXBvcnQgRW52IGZyb20gXCIuL2VudlwiO1xuaW1wb3J0IFJlYWRlciBmcm9tIFwiLi9zaGlmdC1yZWFkZXJcIjtcbmltcG9ydCAgKiBhcyBfIGZyb20gXCJyYW1kYVwiO1xuaW1wb3J0IFRlcm0sIHtpc0VPRiwgaXNCaW5kaW5nSWRlbnRpZmllciwgaXNCaW5kaW5nUHJvcGVydHlQcm9wZXJ0eSwgaXNCaW5kaW5nUHJvcGVydHlJZGVudGlmaWVyLCBpc09iamVjdEJpbmRpbmcsIGlzQXJyYXlCaW5kaW5nLCBpc0Z1bmN0aW9uRGVjbGFyYXRpb24sIGlzRnVuY3Rpb25FeHByZXNzaW9uLCBpc0Z1bmN0aW9uVGVybSwgaXNGdW5jdGlvbldpdGhOYW1lLCBpc1N5bnRheERlY2xhcmF0aW9uLCBpc1N5bnRheHJlY0RlY2xhcmF0aW9uLCBpc1ZhcmlhYmxlRGVjbGFyYXRpb24sIGlzVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudCwgaXNJbXBvcnQsIGlzRXhwb3J0fSBmcm9tIFwiLi90ZXJtc1wiO1xuaW1wb3J0IHtNYXliZX0gZnJvbSBcInJhbWRhLWZhbnRhc3lcIjtcbmltcG9ydCB7Z2Vuc3ltfSBmcm9tIFwiLi9zeW1ib2xcIjtcbmltcG9ydCB7VmFyQmluZGluZ1RyYW5zZm9ybSwgQ29tcGlsZXRpbWVUcmFuc2Zvcm19IGZyb20gXCIuL3RyYW5zZm9ybXNcIjtcbmltcG9ydCB7ZXhwZWN0LCBhc3NlcnR9IGZyb20gXCIuL2Vycm9yc1wiO1xuaW1wb3J0IGxvYWRTeW50YXggZnJvbSBcIi4vbG9hZC1zeW50YXhcIjtcbmltcG9ydCB7U2NvcGUsIGZyZXNoU2NvcGV9IGZyb20gXCIuL3Njb3BlXCI7XG5jb25zdCBKdXN0XzczNyA9IE1heWJlLkp1c3Q7XG5jb25zdCBOb3RoaW5nXzczOCA9IE1heWJlLk5vdGhpbmc7XG5jb25zdCByZWdpc3RlclN5bnRheF83MzkgPSAoc3R4LCBjb250ZXh0KSA9PiB7XG4gIGxldCBuZXdCaW5kaW5nXzc0NCA9IGdlbnN5bShzdHgudmFsKCkpO1xuICBjb250ZXh0LmVudi5zZXQobmV3QmluZGluZ183NDQudG9TdHJpbmcoKSwgbmV3IFZhckJpbmRpbmdUcmFuc2Zvcm0oc3R4KSk7XG4gIGNvbnRleHQuYmluZGluZ3MuYWRkKHN0eCwge2JpbmRpbmc6IG5ld0JpbmRpbmdfNzQ0LCBwaGFzZTogMCwgc2tpcER1cDogdHJ1ZX0pO1xufTtcbmxldCByZWdpc3RlckJpbmRpbmdzXzc0MCA9IF8uY29uZChbW2lzQmluZGluZ0lkZW50aWZpZXIsICh7bmFtZX0sIGNvbnRleHQpID0+IHtcbiAgcmVnaXN0ZXJTeW50YXhfNzM5KG5hbWUsIGNvbnRleHQpO1xufV0sIFtpc0JpbmRpbmdQcm9wZXJ0eUlkZW50aWZpZXIsICh7YmluZGluZ30sIGNvbnRleHQpID0+IHtcbiAgcmVnaXN0ZXJCaW5kaW5nc183NDAoYmluZGluZywgY29udGV4dCk7XG59XSwgW2lzQmluZGluZ1Byb3BlcnR5UHJvcGVydHksICh7YmluZGluZ30sIGNvbnRleHQpID0+IHtcbiAgcmVnaXN0ZXJCaW5kaW5nc183NDAoYmluZGluZywgY29udGV4dCk7XG59XSwgW2lzQXJyYXlCaW5kaW5nLCAoe2VsZW1lbnRzLCByZXN0RWxlbWVudH0sIGNvbnRleHQpID0+IHtcbiAgaWYgKHJlc3RFbGVtZW50ICE9IG51bGwpIHtcbiAgICByZWdpc3RlckJpbmRpbmdzXzc0MChyZXN0RWxlbWVudCwgY29udGV4dCk7XG4gIH1cbiAgZWxlbWVudHMuZm9yRWFjaChlbCA9PiB7XG4gICAgaWYgKGVsICE9IG51bGwpIHtcbiAgICAgIHJlZ2lzdGVyQmluZGluZ3NfNzQwKGVsLCBjb250ZXh0KTtcbiAgICB9XG4gIH0pO1xufV0sIFtpc09iamVjdEJpbmRpbmcsICh7cHJvcGVydGllc30sIGNvbnRleHQpID0+IHt9XSwgW18uVCwgYmluZGluZyA9PiBhc3NlcnQoZmFsc2UsIFwibm90IGltcGxlbWVudGVkIHlldCBmb3I6IFwiICsgYmluZGluZy50eXBlKV1dKTtcbmxldCByZW1vdmVTY29wZV83NDEgPSBfLmNvbmQoW1tpc0JpbmRpbmdJZGVudGlmaWVyLCAoe25hbWV9LCBzY29wZSkgPT4gbmV3IFRlcm0oXCJCaW5kaW5nSWRlbnRpZmllclwiLCB7bmFtZTogbmFtZS5yZW1vdmVTY29wZShzY29wZSl9KV0sIFtpc0FycmF5QmluZGluZywgKHtlbGVtZW50cywgcmVzdEVsZW1lbnR9LCBzY29wZSkgPT4ge1xuICByZXR1cm4gbmV3IFRlcm0oXCJBcnJheUJpbmRpbmdcIiwge2VsZW1lbnRzOiBlbGVtZW50cy5tYXAoZWwgPT4gZWwgPT0gbnVsbCA/IG51bGwgOiByZW1vdmVTY29wZV83NDEoZWwsIHNjb3BlKSksIHJlc3RFbGVtZW50OiByZXN0RWxlbWVudCA9PSBudWxsID8gbnVsbCA6IHJlbW92ZVNjb3BlXzc0MShyZXN0RWxlbWVudCwgc2NvcGUpfSk7XG59XSwgW2lzQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllciwgKHtiaW5kaW5nLCBpbml0fSwgc2NvcGUpID0+IG5ldyBUZXJtKFwiQmluZGluZ1Byb3BlcnR5SWRlbnRpZmllclwiLCB7YmluZGluZzogcmVtb3ZlU2NvcGVfNzQxKGJpbmRpbmcsIHNjb3BlKSwgaW5pdDogaW5pdH0pXSwgW2lzQmluZGluZ1Byb3BlcnR5UHJvcGVydHksICh7YmluZGluZywgbmFtZX0sIHNjb3BlKSA9PiBuZXcgVGVybShcIkJpbmRpbmdQcm9wZXJ0eVByb3BlcnR5XCIsIHtiaW5kaW5nOiByZW1vdmVTY29wZV83NDEoYmluZGluZywgc2NvcGUpLCBuYW1lOiBuYW1lfSldLCBbaXNPYmplY3RCaW5kaW5nLCAoe3Byb3BlcnRpZXN9LCBzY29wZSkgPT4gbmV3IFRlcm0oXCJPYmplY3RCaW5kaW5nXCIsIHtwcm9wZXJ0aWVzOiBwcm9wZXJ0aWVzLm1hcChwcm9wID0+IHJlbW92ZVNjb3BlXzc0MShwcm9wLCBzY29wZSkpfSldLCBbXy5ULCBiaW5kaW5nID0+IGFzc2VydChmYWxzZSwgXCJub3QgaW1wbGVtZW50ZWQgeWV0IGZvcjogXCIgKyBiaW5kaW5nLnR5cGUpXV0pO1xuZnVuY3Rpb24gZmluZE5hbWVJbkV4cG9ydHNfNzQyKG5hbWVfNzQ1LCBleHBfNzQ2KSB7XG4gIGxldCBmb3VuZE5hbWVzXzc0NyA9IGV4cF83NDYucmVkdWNlKChhY2MsIGUpID0+IHtcbiAgICBpZiAoZS5kZWNsYXJhdGlvbikge1xuICAgICAgcmV0dXJuIGFjYy5jb25jYXQoZS5kZWNsYXJhdGlvbi5kZWNsYXJhdG9ycy5yZWR1Y2UoKGFjYywgZGVjbCkgPT4ge1xuICAgICAgICBpZiAoZGVjbC5iaW5kaW5nLm5hbWUudmFsKCkgPT09IG5hbWVfNzQ1LnZhbCgpKSB7XG4gICAgICAgICAgcmV0dXJuIGFjYy5jb25jYXQoZGVjbC5iaW5kaW5nLm5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhY2M7XG4gICAgICB9LCBMaXN0KCkpKTtcbiAgICB9XG4gICAgcmV0dXJuIGFjYztcbiAgfSwgTGlzdCgpKTtcbiAgYXNzZXJ0KGZvdW5kTmFtZXNfNzQ3LnNpemUgPD0gMSwgXCJleHBlY3Rpbmcgbm8gbW9yZSB0aGFuIDEgbWF0Y2hpbmcgbmFtZSBpbiBleHBvcnRzXCIpO1xuICByZXR1cm4gZm91bmROYW1lc183NDcuZ2V0KDApO1xufVxuZnVuY3Rpb24gYmluZEltcG9ydHNfNzQzKGltcFRlcm1fNzQ4LCBleE1vZHVsZV83NDksIGNvbnRleHRfNzUwKSB7XG4gIGxldCBuYW1lc183NTEgPSBbXTtcbiAgaW1wVGVybV83NDgubmFtZWRJbXBvcnRzLmZvckVhY2goc3BlY2lmaWVyID0+IHtcbiAgICBsZXQgbmFtZV83NTIgPSBzcGVjaWZpZXIuYmluZGluZy5uYW1lO1xuICAgIGxldCBleHBvcnROYW1lXzc1MyA9IGZpbmROYW1lSW5FeHBvcnRzXzc0MihuYW1lXzc1MiwgZXhNb2R1bGVfNzQ5LmV4cG9ydEVudHJpZXMpO1xuICAgIGlmIChleHBvcnROYW1lXzc1MyAhPSBudWxsKSB7XG4gICAgICBsZXQgbmV3QmluZGluZyA9IGdlbnN5bShuYW1lXzc1Mi52YWwoKSk7XG4gICAgICBjb250ZXh0Xzc1MC5iaW5kaW5ncy5hZGRGb3J3YXJkKG5hbWVfNzUyLCBleHBvcnROYW1lXzc1MywgbmV3QmluZGluZyk7XG4gICAgICBpZiAoY29udGV4dF83NTAuc3RvcmUuaGFzKGV4cG9ydE5hbWVfNzUzLnJlc29sdmUoKSkpIHtcbiAgICAgICAgbmFtZXNfNzUxLnB1c2gobmFtZV83NTIpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIHJldHVybiBMaXN0KG5hbWVzXzc1MSk7XG59XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUb2tlbkV4cGFuZGVyIHtcbiAgY29uc3RydWN0b3IoY29udGV4dF83NTQpIHtcbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0Xzc1NDtcbiAgfVxuICBleHBhbmQoc3R4bF83NTUpIHtcbiAgICBsZXQgcmVzdWx0Xzc1NiA9IExpc3QoKTtcbiAgICBpZiAoc3R4bF83NTUuc2l6ZSA9PT0gMCkge1xuICAgICAgcmV0dXJuIHJlc3VsdF83NTY7XG4gICAgfVxuICAgIGxldCBwcmV2Xzc1NyA9IExpc3QoKTtcbiAgICBsZXQgZW5mXzc1OCA9IG5ldyBFbmZvcmVzdGVyKHN0eGxfNzU1LCBwcmV2Xzc1NywgdGhpcy5jb250ZXh0KTtcbiAgICBsZXQgc2VsZl83NTkgPSB0aGlzO1xuICAgIHdoaWxlICghZW5mXzc1OC5kb25lKSB7XG4gICAgICBsZXQgdGVybSA9IF8ucGlwZShfLmJpbmQoZW5mXzc1OC5lbmZvcmVzdCwgZW5mXzc1OCksIF8uY29uZChbW2lzVmFyaWFibGVEZWNsYXJhdGlvblN0YXRlbWVudCwgdGVybSA9PiB7XG4gICAgICAgIHRlcm0uZGVjbGFyYXRpb24uZGVjbGFyYXRvcnMgPSB0ZXJtLmRlY2xhcmF0aW9uLmRlY2xhcmF0b3JzLm1hcChkZWNsID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV3IFRlcm0oXCJWYXJpYWJsZURlY2xhcmF0b3JcIiwge2JpbmRpbmc6IHJlbW92ZVNjb3BlXzc0MShkZWNsLmJpbmRpbmcsIHNlbGZfNzU5LmNvbnRleHQudXNlU2NvcGUpLCBpbml0OiBkZWNsLmluaXR9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChpc1N5bnRheERlY2xhcmF0aW9uKHRlcm0uZGVjbGFyYXRpb24pKSB7XG4gICAgICAgICAgbGV0IHNjb3BlID0gZnJlc2hTY29wZShcIm5vbnJlY1wiKTtcbiAgICAgICAgICB0ZXJtLmRlY2xhcmF0aW9uLmRlY2xhcmF0b3JzLmZvckVhY2goZGVjbCA9PiB7XG4gICAgICAgICAgICBsZXQgbmFtZV83NjAgPSBkZWNsLmJpbmRpbmcubmFtZTtcbiAgICAgICAgICAgIGxldCBuYW1lQWRkZWRfNzYxID0gbmFtZV83NjAuYWRkU2NvcGUoc2NvcGUpO1xuICAgICAgICAgICAgbGV0IG5hbWVSZW1vdmVkXzc2MiA9IG5hbWVfNzYwLnJlbW92ZVNjb3BlKHNlbGZfNzU5LmNvbnRleHQuY3VycmVudFNjb3BlW3NlbGZfNzU5LmNvbnRleHQuY3VycmVudFNjb3BlLmxlbmd0aCAtIDFdKTtcbiAgICAgICAgICAgIGxldCBuZXdCaW5kaW5nXzc2MyA9IGdlbnN5bShuYW1lXzc2MC52YWwoKSk7XG4gICAgICAgICAgICBzZWxmXzc1OS5jb250ZXh0LmJpbmRpbmdzLmFkZEZvcndhcmQobmFtZUFkZGVkXzc2MSwgbmFtZVJlbW92ZWRfNzYyLCBuZXdCaW5kaW5nXzc2Myk7XG4gICAgICAgICAgICBkZWNsLmluaXQuYm9keSA9IGRlY2wuaW5pdC5ib2R5Lm1hcChzID0+IHMuYWRkU2NvcGUoc2NvcGUsIHNlbGZfNzU5LmNvbnRleHQuYmluZGluZ3MpKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNTeW50YXhEZWNsYXJhdGlvbih0ZXJtLmRlY2xhcmF0aW9uKSB8fCBpc1N5bnRheHJlY0RlY2xhcmF0aW9uKHRlcm0uZGVjbGFyYXRpb24pKSB7XG4gICAgICAgICAgdGVybS5kZWNsYXJhdGlvbi5kZWNsYXJhdG9ycy5mb3JFYWNoKGRlY2wgPT4ge1xuICAgICAgICAgICAgcmVnaXN0ZXJCaW5kaW5nc183NDAoZGVjbC5iaW5kaW5nLCBzZWxmXzc1OS5jb250ZXh0KTtcbiAgICAgICAgICAgIGxvYWRTeW50YXgoZGVjbCwgc2VsZl83NTkuY29udGV4dCwgc2VsZl83NTkuY29udGV4dC5lbnYpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBOb3RoaW5nXzczOCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRlcm0uZGVjbGFyYXRpb24uZGVjbGFyYXRvcnMuZm9yRWFjaChkZWNsID0+IHJlZ2lzdGVyQmluZGluZ3NfNzQwKGRlY2wuYmluZGluZywgc2VsZl83NTkuY29udGV4dCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBKdXN0XzczNyh0ZXJtKTtcbiAgICAgIH1dLCBbaXNGdW5jdGlvbldpdGhOYW1lLCB0ZXJtID0+IHtcbiAgICAgICAgdGVybS5uYW1lID0gcmVtb3ZlU2NvcGVfNzQxKHRlcm0ubmFtZSwgc2VsZl83NTkuY29udGV4dC51c2VTY29wZSk7XG4gICAgICAgIHJlZ2lzdGVyQmluZGluZ3NfNzQwKHRlcm0ubmFtZSwgc2VsZl83NTkuY29udGV4dCk7XG4gICAgICAgIHJldHVybiBKdXN0XzczNyh0ZXJtKTtcbiAgICAgIH1dLCBbaXNJbXBvcnQsIHRlcm0gPT4ge1xuICAgICAgICBsZXQgbW9kXzc2NCA9IHNlbGZfNzU5LmNvbnRleHQubW9kdWxlcy5sb2FkKHRlcm0ubW9kdWxlU3BlY2lmaWVyLnZhbCgpLCBzZWxmXzc1OS5jb250ZXh0KTtcbiAgICAgICAgaWYgKHRlcm0uZm9yU3ludGF4KSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJpbXBvcnQgZm9yIHN5bnRheCBpcyBub3QgaW1wbGVtZW50ZWQgeWV0XCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1vZF83NjQudmlzaXQoc2VsZl83NTkuY29udGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGJvdW5kTmFtZXNfNzY1ID0gYmluZEltcG9ydHNfNzQzKHRlcm0sIG1vZF83NjQsIHNlbGZfNzU5LmNvbnRleHQpO1xuICAgICAgICBpZiAoYm91bmROYW1lc183NjUuc2l6ZSA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiBKdXN0XzczNyh0ZXJtKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTm90aGluZ183MzgoKTtcbiAgICAgIH1dLCBbaXNFT0YsIE5vdGhpbmdfNzM4XSwgW18uVCwgSnVzdF83MzddXSksIE1heWJlLm1heWJlKExpc3QoKSwgXy5pZGVudGl0eSkpKCk7XG4gICAgICByZXN1bHRfNzU2ID0gcmVzdWx0Xzc1Ni5jb25jYXQodGVybSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRfNzU2O1xuICB9XG59XG4iXX0=