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

var Just_736 = _ramdaFantasy.Maybe.Just;var Nothing_737 = _ramdaFantasy.Maybe.Nothing;var registerSyntax_738 = function registerSyntax_738(stx, context) {
  var newBinding_743 = (0, _symbol.gensym)(stx.val());context.env.set(newBinding_743.toString(), new _transforms.VarBindingTransform(stx));context.bindings.add(stx, { binding: newBinding_743, phase: 0, skipDup: true });
};var registerBindings_739 = _.cond([[_terms.isBindingIdentifier, function (_ref, context) {
  var name = _ref.name;
  registerSyntax_738(name, context);
}], [_terms.isBindingPropertyIdentifier, function (_ref2, context) {
  var binding = _ref2.binding;
  registerBindings_739(binding, context);
}], [_terms.isBindingPropertyProperty, function (_ref3, context) {
  var binding = _ref3.binding;
  registerBindings_739(binding, context);
}], [_terms.isArrayBinding, function (_ref4, context) {
  var elements = _ref4.elements;
  var restElement = _ref4.restElement;
  if (restElement != null) {
    registerBindings_739(restElement, context);
  }elements.forEach(function (el) {
    if (el != null) {
      registerBindings_739(el, context);
    }
  });
}], [_terms.isObjectBinding, function (_ref5, context) {
  var properties = _ref5.properties;
}], [_.T, function (binding) {
  return (0, _errors.assert)(false, "not implemented yet for: " + binding.type);
}]]);var removeScope_740 = _.cond([[_terms.isBindingIdentifier, function (_ref6, scope) {
  var name = _ref6.name;
  return new _terms2.default("BindingIdentifier", { name: name.removeScope(scope) });
}], [_terms.isArrayBinding, function (_ref7, scope) {
  var elements = _ref7.elements;
  var restElement = _ref7.restElement;
  return new _terms2.default("ArrayBinding", { elements: elements.map(function (el) {
      return el == null ? null : removeScope_740(el, scope);
    }), restElement: restElement == null ? null : removeScope_740(restElement, scope) });
}], [_terms.isBindingPropertyIdentifier, function (_ref8, scope) {
  var binding = _ref8.binding;
  var init = _ref8.init;
  return new _terms2.default("BindingPropertyIdentifier", { binding: removeScope_740(binding, scope), init: init });
}], [_terms.isBindingPropertyProperty, function (_ref9, scope) {
  var binding = _ref9.binding;
  var name = _ref9.name;
  return new _terms2.default("BindingPropertyProperty", { binding: removeScope_740(binding, scope), name: name });
}], [_terms.isObjectBinding, function (_ref10, scope) {
  var properties = _ref10.properties;
  return new _terms2.default("ObjectBinding", { properties: properties.map(function (prop) {
      return removeScope_740(prop, scope);
    }) });
}], [_.T, function (binding) {
  return (0, _errors.assert)(false, "not implemented yet for: " + binding.type);
}]]);function findNameInExports_741(name_744, exp_745) {
  var foundNames_746 = exp_745.reduce(function (acc, e) {
    if (e.declaration) {
      return acc.concat(e.declaration.declarators.reduce(function (acc, decl) {
        if (decl.binding.name.val() === name_744.val()) {
          return acc.concat(decl.binding.name);
        }return acc;
      }, (0, _immutable.List)()));
    }return acc;
  }, (0, _immutable.List)());(0, _errors.assert)(foundNames_746.size <= 1, "expecting no more than 1 matching name in exports");return foundNames_746.get(0);
}function bindImports_742(impTerm_747, exModule_748, context_749) {
  var names_750 = [];impTerm_747.namedImports.forEach(function (specifier) {
    var name_751 = specifier.binding.name;var exportName_752 = findNameInExports_741(name_751, exModule_748.exportEntries);if (exportName_752 != null) {
      var newBinding = (0, _symbol.gensym)(name_751.val());context_749.bindings.addForward(name_751, exportName_752, newBinding);if (context_749.store.has(exportName_752.resolve())) {
        names_750.push(name_751);
      }
    }
  });return (0, _immutable.List)(names_750);
}
var TokenExpander = function () {
  function TokenExpander(context_753) {
    _classCallCheck(this, TokenExpander);

    this.context = context_753;
  }

  _createClass(TokenExpander, [{
    key: "expand",
    value: function expand(stxl_754) {
      var result_755 = (0, _immutable.List)();if (stxl_754.size === 0) {
        return result_755;
      }var prev_756 = (0, _immutable.List)();var enf_757 = new _enforester.Enforester(stxl_754, prev_756, this.context);var self_758 = this;while (!enf_757.done) {
        var term = _.pipe(_.bind(enf_757.enforest, enf_757), _.cond([[_terms.isVariableDeclarationStatement, function (term) {
          term.declaration.declarators = term.declaration.declarators.map(function (decl) {
            return new _terms2.default("VariableDeclarator", { binding: removeScope_740(decl.binding, self_758.context.useScope), init: decl.init });
          });if ((0, _terms.isSyntaxDeclaration)(term.declaration)) {
            (function () {
              var scope = (0, _scope.freshScope)("nonrec");term.declaration.declarators.forEach(function (decl) {
                var name_759 = decl.binding.name;var nameAdded_760 = name_759.addScope(scope);var nameRemoved_761 = name_759.removeScope(self_758.context.currentScope[self_758.context.currentScope.length - 1]);var newBinding_762 = (0, _symbol.gensym)(name_759.val());self_758.context.bindings.addForward(nameAdded_760, nameRemoved_761, newBinding_762);decl.init.body = decl.init.body.map(function (s) {
                  return s.addScope(scope, self_758.context.bindings);
                });
              });
            })();
          }if ((0, _terms.isSyntaxDeclaration)(term.declaration) || (0, _terms.isSyntaxrecDeclaration)(term.declaration)) {
            term.declaration.declarators.forEach(function (decl) {
              registerBindings_739(decl.binding, self_758.context);(0, _loadSyntax2.default)(decl, self_758.context, self_758.context.env);
            });return Nothing_737();
          } else {
            term.declaration.declarators.forEach(function (decl) {
              return registerBindings_739(decl.binding, self_758.context);
            });
          }return Just_736(term);
        }], [_terms.isFunctionWithName, function (term) {
          term.name = removeScope_740(term.name, self_758.context.useScope);registerBindings_739(term.name, self_758.context);return Just_736(term);
        }], [_terms.isImport, function (term) {
          var mod_763 = self_758.context.modules.load(term.moduleSpecifier.val(), self_758.context);if (term.forSyntax) {
            console.log("import for syntax is not implemented yet");
          } else {
            mod_763.visit(self_758.context);
          }var boundNames_764 = bindImports_742(term, mod_763, self_758.context);if (boundNames_764.size === 0) {
            return Just_736(term);
          }return Nothing_737();
        }], [_terms.isEOF, Nothing_737], [_.T, Just_736]]), _ramdaFantasy.Maybe.maybe((0, _immutable.List)(), _.identity))();result_755 = result_755.concat(term);
      }return result_755;
    }
  }]);

  return TokenExpander;
}();

exports.default = TokenExpander;
//# sourceMappingURL=token-expander.js.map
